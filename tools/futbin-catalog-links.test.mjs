import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateCandidateCatalog, validateCandidateCatalog } from './futbin-generator.mjs';
import { compareFutbinSnapshot } from './futbin-matcher.mjs';
import { buildLinksDiagnostic } from './futbin-links.mjs';
import { generateReal } from './futbin-phase6b-local.mjs';
const card = (name = 'Example', column = 1) => ({ id: name, nombre: name, ovr: 82,
  posicionPrincipal: 'LW', posiciones: ['LW'], stats: { pac: 91, sho: 78, pas: 77, dri: 82, def: 50, phy: 71 },
  pie: 'R', skills: 4, weakFoot: 3, version: null, tipoCarta: null, activo: true,
  ratingFuente: 80, popularidadFuente: 100, precioReferencia: 5000, valorSecundarioFuente: 300,
  fuente: { nombre: 'FUTBIN', importedAt: 'original' }, sourcePage: 1, sourceColumn: column,
  evidence: { anchorY: 498 }, parseStatus: 'complete' });
const metadata = { fileName: 'synthetic.pdf' };
const url = 'https://www.futbin.com/27/player/843/anthony-gordon';
const annotation = (value = url, column = 1) => ({ page: 1, rect: [24 + (column-1)*132,451.5,150+(column-1)*132,621], url: value });
const link = { game: 27, playerId: 843, slug: 'anthony-gordon', url };
function run(current = [card()], snapshot = [card()], annotations = [annotation()]) {
  const linksDiagnostic = buildLinksDiagnostic({ ...metadata, pages: 1, annotations }, snapshot);
  return generateCandidateCatalog(current, compareFutbinSnapshot(snapshot, current, metadata), { linksDiagnostic });
}

test('safe unchanged and updated matches receive numeric nested metadata without structural edits', () => {
  for (const price of [5000, 6000]) {
    const current = [card(), card('Absent', 2)];
    const result = run(current, [{ ...card(), precioReferencia: price }]);
    assert(result.canExport); assert.deepEqual(result.candidateCatalog[0].futbin, link);
    assert.equal(result.report.summary.futbinLinksApplied, 1);
    assert.deepEqual(result.candidateCatalog.map(c=>c.id), current.map(c=>c.id));
    assert.deepEqual(result.candidateCatalog[0].stats, current[0].stats);
    assert.equal(current[0].futbin, undefined);
    if (price === 5000) assert.deepEqual(result.candidateCatalog[0].fuente, current[0].fuente);
  }
});
test('snapshot duplicates and NEEDS_REVIEW never receive links', () => {
  const duplicates = run([card()], [card(), card('Example', 2)], [annotation(), annotation(url, 2)]);
  assert.equal(duplicates.report.summary.futbinLinksSkippedDuplicates, 2);
  assert.equal(duplicates.candidateCatalog[0].futbin, undefined);
  const review = run([card()], [{ ...card(), stats: { ...card().stats, pac: 99 } }]);
  assert.equal(review.report.summary.futbinLinksSkippedNeedsReview, 1);
  assert.equal(review.candidateCatalog[0].futbin, undefined);
});
test('existing links survive missing, ambiguous, absent, duplicate and review evidence', () => {
  const current = [{ ...card(), futbin: link }];
  for (const [snapshot, annotations] of [ [[card()], []], [[], []],
    [[card()], [annotation(), annotation('https://www.futbin.com/27/player/22/lionel-messi')]],
    [[card(), card('Example', 2)], [annotation(), annotation(url, 2)]],
    [[{ ...card(), stats: {} }], [annotation()]] ]) {
    const result = run(current, snapshot, annotations);
    assert.deepEqual(result.candidateCatalog[0].futbin, link);
    assert.equal(result.report.summary.futbinLinksPreserved, 1);
  }
});
test('invalid URL variants and unsafe numeric IDs never apply', () => {
  for (const value of ['http://www.futbin.com/27/player/843/a', 'https://futbin.com/27/player/843/a',
    'https://www.futbin.com/26/player/843/a', 'https://www.futbin.com/27/player/0/a',
    'https://www.futbin.com/27/player/843/a?x=1', 'https://www.futbin.com/27/player/843/a/',
    'https://www.futbin.com/27/player/9007199254740993/a']) {
    assert.equal(run([card()], [card()], [annotation(value)]).candidateCatalog[0].futbin, undefined);
  }
});
test('existing playerId conflicts are reported and never overwritten', () => {
  const current = [{ ...card(), futbin: link }];
  const result = run(current, [card()], [annotation('https://www.futbin.com/27/player/22/lionel-messi')]);
  assert.deepEqual(result.candidateCatalog, current);
  assert.equal(result.report.summary.futbinLinksConflicts, 1);
});
test('two URLs and shared geometry cannot be applied', () => {
  const result = run([card()], [card()], [annotation(), annotation('https://www.futbin.com/27/player/22/lionel-messi')]);
  assert.equal(result.report.summary.futbinLinksApplied, 0);
  assert.equal(result.report.futbinLinks[0].linkStatus, 'AMBIGUOUS_LINK');
  const shared = run([card(), card('Other', 2)], [card(), card('Other', 2)], [{ ...annotation(), rect: [24,432,282,584] }]);
  assert.equal(shared.report.summary.futbinLinksApplied, 0);
});
test('stale, partial and competing matcher claims cannot apply metadata', () => {
  for (const mutate of [c=>c.unchanged[0].confidence='medium', c=>c.unchanged[0].currentRecord={ ...card(), precioReferencia: 3 },
    c=>c.unchanged.push({ ...structuredClone(c.unchanged[0]), snapshotIndex: 1 })]) {
    const current=[card()], comparison=compareFutbinSnapshot([card()], current, metadata);
    mutate(comparison);
    const linksDiagnostic=buildLinksDiagnostic({ ...metadata, annotations:[annotation()] },[card()]);
    assert.equal(generateCandidateCatalog(current,comparison,{linksDiagnostic}).candidateCatalog[0].futbin,undefined);
  }
});
test('recomputed geometry rejects forged diagnostic MATCHED labels', () => {
  const current=[card()], comparison=compareFutbinSnapshot(current,current,metadata);
  const linksDiagnostic=buildLinksDiagnostic({ ...metadata, annotations:[] }, current);
  linksDiagnostic.cards[0].status='MATCHED'; linksDiagnostic.cards[0].urls=[url];
  assert.equal(generateCandidateCatalog(current,comparison,{linksDiagnostic}).candidateCatalog[0].futbin,undefined);
});
test('catalog validation checks every nested futbin field', () => {
  for(const patch of [{game:26},{playerId:'843'},{playerId:0},{playerId:1.5},{slug:''},{url:url+'?x=1'}]) {
    assert.equal(validateCandidateCatalog([{ ...card(), futbin:{ ...link,...patch } }]).valid,false);
  }
});
test('same playerId allows a validated slug update and repeated generation is identical', () => {
  const current=[{ ...card(), futbin:link }];
  const first=run(current,[card()],[annotation('https://www.futbin.com/27/player/843/new-slug')]);
  assert.equal(first.candidateCatalog[0].futbin.slug,'new-slug');
  const second=run(first.candidateCatalog,[card()],[annotation('https://www.futbin.com/27/player/843/new-slug')]);
  assert.deepEqual(second.candidateCatalog,first.candidateCatalog);
  assert.equal(second.report.summary.futbinLinksApplied,0);
});
test('real PDF preserves 306 IDs and 240 URLs, verifies named cases and complete idempotence',
  {skip:!fs.existsSync(new URL('./fixtures-local/EA FC 27 Popular Players _ FUTBIN2.pdf',import.meta.url))},()=>{
  const {first,second,current,linksDiagnostic}=generateReal();
  assert.equal(linksDiagnostic.metadata.totalAnnotations,279);
  assert.equal(linksDiagnostic.summary.matched,250);
  assert.equal(first.candidateCatalog.length,306);
  assert.equal(new Set(first.candidateCatalog.map(c=>c.id)).size,306);
  assert.deepEqual(first.candidateCatalog.map(c=>c.id),current.map(c=>c.id));
  assert.equal(first.candidateCatalog.filter(c=>c.precioReferencia===0).length,0);
  assert.equal(first.candidateCatalog.filter(c=>c.futbin).length,240);
  assert.equal(first.report.summary.futbinLinksApplied,0);
  assert.equal(first.report.summary.futbinLinksPreserved,240);
  assert.equal(first.report.summary.updatedApplied,173);
  assert.equal(first.report.summary.newApplied,0);
  assert.equal(second.report.summary.futbinLinksPreserved,240);
  assert.equal(second.report.summary.updatedApplied,0);
  for(const [name,id,slug] of [['Gordon',843,'anthony-gordon'],['Frimpong',266,'jeremie-frimpong'],['Messi',22,'lionel-messi'],['van de Ven',929,'micky-van-de-ven']]) {
    const record=first.candidateCatalog.find(c=>c.nombre.toLowerCase()===name.toLowerCase());
    assert.deepEqual(record.futbin,{game:27,playerId:id,slug,url:`https://www.futbin.com/27/player/${id}/${slug}`});
  }
  const structuralFields=['id','nombre','ovr','posicionPrincipal','posiciones','stats','pie','skills','weakFoot'];
  for(const [index,record] of first.candidateCatalog.entries()) {
    for(const field of structuralFields) assert.deepEqual(record[field],current[index][field]);
  }
});

test('worker passes diagnostic through generation and UI exposes all metrics and audit details', async () => {
  const previousSelf = globalThis.self;
  let message;
  globalThis.self = { postMessage: value => { message = value; } };
  try {
    await import('./futbin-generator-worker.mjs');
    const current = [card()];
    self.onmessage({ data: { catalog: current, comparison: compareFutbinSnapshot(current,current,metadata),
      linksDiagnostic: buildLinksDiagnostic({ ...metadata, annotations:[annotation()] },current) } });
    assert.equal(message.result.report.summary.futbinLinksApplied,1);
    assert.match(message.result.candidateSource,/"playerId": 843/);
    const html=fs.readFileSync(new URL('./futbin-importer.html',import.meta.url),'utf8');
    const js=fs.readFileSync(new URL('./futbin-importer.js',import.meta.url),'utf8');
    for(const key of ['futbinLinksApplied','futbinLinksPreserved','futbinLinksSkippedDuplicates','futbinLinksSkippedNeedsReview','futbinLinksMissing']) {
      assert(html.includes(`id="generation-${key}"`)); assert(js.includes(`"${key}"`));
    }
    assert(js.includes('["futbinLinks",')); assert(js.includes('["futbinPreserved",'));
  } finally { if(previousSelf === undefined) delete globalThis.self; else globalThis.self=previousSelf; }
});

test('validation prevents deletion or reassignment of existing FUTBIN identity', () => {
  const current = [{ ...card(), futbin: link }];
  assert.equal(validateCandidateCatalog([card()],current).valid,false);
  assert.equal(validateCandidateCatalog([{ ...card(), futbin:{game:27,playerId:22,slug:'lionel-messi',url:'https://www.futbin.com/27/player/22/lionel-messi'} }],current).valid,false);
});

test('missing market values cannot churn importedAt on repeated snapshots', () => {
  const current=[card()], snapshot=[{ ...card(), ratingFuente:null }];
  const first=run(current,snapshot);
  const second=run(first.candidateCatalog,snapshot);
  assert.deepEqual(second.candidateCatalog,first.candidateCatalog);
});
