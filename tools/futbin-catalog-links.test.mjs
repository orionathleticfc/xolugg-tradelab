import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { attachExactFutbinLinks, buildLinksDiagnostic } from './futbin-links.mjs';
import { generateCandidateCatalog } from './futbin-generator.mjs';
import { compareFutbinSnapshot } from './futbin-matcher.mjs';

const url = id => 'https://www.futbin.com/27/player/' + id + '/player-' + id;
const card = (name = 'Example', column = 1, patch = {}) => ({
  id: 'legacy-' + name, nombre: name, version: null, tipoCarta: 'unknown', ovr: 82,
  posicionPrincipal: 'LW', posiciones: ['LW'],
  stats: { pac: 91, sho: 78, pas: 77, dri: 82, def: 50, phy: 71 },
  pie: 'R', skills: 4, weakFoot: 3, ratingFuente: 80, popularidadFuente: 100,
  precioReferencia: 5000, precioReferenciaRaw: '5K', valorSecundarioFuente: 300,
  valorSecundarioFuenteRaw: '300', fuente: { nombre: 'FUTBIN' }, activo: true,
  sourcePage: 1, sourceColumn: column, evidence: { anchorY: 498 }, parseStatus: 'complete',
  ...patch
});
const annotation = (id, column = 1) => ({
  page: 1, rect: [24 + (column - 1) * 132, 451.5, 150 + (column - 1) * 132, 621], url: url(id)
});
const metadata = { fileName: 'synthetic.pdf', pages: 1, extractedAt: '2026-09-19T00:00:00.000Z' };

function linked(snapshot, annotations) {
  const diagnostic = buildLinksDiagnostic({ ...metadata, annotations }, snapshot);
  return { diagnostic, cards: attachExactFutbinLinks(snapshot, diagnostic) };
}

test('exact geometric annotations attach numeric FUTBIN identities without visiting URLs', () => {
  const input = [card()];
  const { diagnostic, cards } = linked(input, [annotation(843)]);
  assert.deepEqual(cards[0].futbin, {
    game: 27, playerId: 843, slug: 'player-843', url: url(843)
  });
  assert.equal(diagnostic.cards[0].status, 'MATCHED');
  assert.equal(input[0].futbin, undefined);
});

test('ambiguous, forged, non-canonical and off-card annotations never attach an identity', () => {
  for (const annotations of [
    [annotation(1), annotation(2)],
    [{ ...annotation(1), url: 'https://example.com/player' }],
    [{ ...annotation(1), rect: [500, 1, 510, 10] }]
  ]) assert.equal(linked([card()], annotations).cards[0].futbin, undefined);

  for (const value of [
    'http://www.futbin.com/27/player/843/a',
    'https://futbin.com/27/player/843/a',
    'https://www.futbin.com/26/player/843/a',
    'https://www.futbin.com/27/player/0/a',
    'https://www.futbin.com/27/player/843/a?x=1',
    'https://www.futbin.com/27/player/843/a/',
    'https://www.futbin.com/27/player/9007199254740993/a'
  ]) {
    assert.equal(linked([card()], [{ ...annotation(843), url: value }]).cards[0].futbin, undefined);
  }

  const forged = buildLinksDiagnostic({ ...metadata, annotations: [] }, [card()]);
  forged.cards[0].status = 'MATCHED';
  forged.cards[0].urls = [url(843)];
  assert.equal(attachExactFutbinLinks([card()], forged)[0].futbin, undefined);
});

test('Z. a special card keeps the exact playerId in the authoritative candidate', () => {
  const snapshot = [card('Special', 1, { tipoCarta: 'special' })];
  const { diagnostic, cards } = linked(snapshot, [annotation(999)]);
  const comparison = compareFutbinSnapshot(cards, [], metadata);
  const result = generateCandidateCatalog([], comparison, {
    linksDiagnostic: diagnostic, generatedAt: metadata.extractedAt
  });
  assert.equal(result.canExport, true);
  assert.equal(result.candidateCatalog[0].tipoCarta, 'special');
  assert.equal(result.candidateCatalog[0].futbin.playerId, 999);
  assert.equal(result.candidateCatalog[0].id, 'futbin-27-999');
});

test('a newly observed different playerId never inherits the old variant ID', () => {
  const current = [{ ...card(), futbin: { game: 27, playerId: 843, slug: 'old', url:
    'https://www.futbin.com/27/player/843/old' } }];
  const { diagnostic, cards } = linked([card()], [annotation(22)]);
  const result = generateCandidateCatalog(current,
    compareFutbinSnapshot(cards, current, metadata), { linksDiagnostic: diagnostic,
      generatedAt: metadata.extractedAt });
  assert.equal(result.candidateCatalog[0].id, 'futbin-27-22');
  assert.equal(result.report.removedFromPreviousCatalog.count, 1);
});

test('two linked variants with different playerIds remain two records in PDF order', () => {
  const snapshot = [card('Variant', 1), card('Variant', 2, { sourceColumn: 2,
    tipoCarta: 'special', ovr: 90 })];
  const { diagnostic, cards } = linked(snapshot, [annotation(10, 1), annotation(20, 2)]);
  const result = generateCandidateCatalog([], compareFutbinSnapshot(cards, [], metadata),
    { linksDiagnostic: diagnostic, generatedAt: metadata.extractedAt });
  assert.deepEqual(result.candidateCatalog.map(item => item.futbin.playerId), [10, 20]);
});

test('worker serializes authoritative metadata and importer exposes its metrics', async () => {
  const previousSelf = globalThis.self;
  let message;
  globalThis.self = { postMessage: value => { message = value; } };
  try {
    await import('./futbin-generator-worker.mjs?authoritative-test');
    const { diagnostic, cards } = linked([card()], [annotation(843)]);
    self.onmessage({ data: { catalog: [], comparison: compareFutbinSnapshot(cards, [], metadata),
      linksDiagnostic: diagnostic } });
    assert.equal(message.result.metadata.mode, 'authoritative-snapshot');
    assert.match(message.result.candidateSource, /PLAYERS_DATA_META/);
    const html = fs.readFileSync(new URL('./futbin-importer.html', import.meta.url), 'utf8');
    const js = fs.readFileSync(new URL('./futbin-importer.js', import.meta.url), 'utf8');
    for (const key of ['removedFromPreviousCatalog', 'specialCards', 'unknownCards',
      'excludedUnavailableTwins', 'validationErrors']) {
      assert(html.includes('id="generation-' + key + '"'));
      assert(js.includes('"' + key + '"'));
    }
  } finally {
    if (previousSelf === undefined) delete globalThis.self;
    else globalThis.self = previousSelf;
  }
});
