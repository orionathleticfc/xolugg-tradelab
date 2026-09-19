import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { attachExactFutbinLinks, buildLinksDiagnostic } from './futbin-links.mjs';
import { parseFutbinDiagnostic } from './futbin-parser.mjs';
import { compareFutbinSnapshot } from './futbin-matcher.mjs';
import { generateCandidateCatalog, serializeCandidateCatalog } from './futbin-generator.mjs';

// Fixture-only reader for the uncompressed annotation dictionaries in this Skia PDF.
// This is deliberately not a general PDF parser; unsupported syntax fails closed.
export function realInputs() {
  const base = new URL('./fixtures-local/', import.meta.url);
  const fileName = 'EA FC 27 Popular Players _ FUTBIN2.pdf';
  const diagnostic = JSON.parse(fs.readFileSync(new URL(fileName.replace('.pdf', '-diagnostico.json'), base), 'utf8').replace(/^\uFEFF/, ''));
  const pdf = fs.readFileSync(new URL(fileName, base), 'latin1');
  const objects = new Map([...pdf.matchAll(/(?:^|\n)(\d+) 0 obj\s*([\s\S]*?)\nendobj/g)].map(m => [Number(m[1]), m[2]]));
  const root = [...objects.values()].find(s => /^<<\/Type \/Catalog\b/.test(s));
  assert(root, 'Uncompressed catalog required');
  const pageIds = [];
  function walk(id) {
    const obj = objects.get(id); assert(obj, 'Missing page object');
    if (/^<<\/Type \/Page\b/.test(obj)) { pageIds.push(id); return; }
    assert(/^<<\/Type \/Pages\b/.test(obj), 'Unsupported page tree');
    const kids = obj.match(/\/Kids\s*\[([^\]]+)\]/); assert(kids);
    for (const ref of kids[1].matchAll(/(\d+) 0 R/g)) walk(Number(ref[1]));
  }
  walk(Number(root.match(/\/Pages (\d+) 0 R/)[1]));
  assert.equal(pageIds.length, diagnostic.pages);
  const annotations = [];
  pageIds.forEach((id, index) => {
    const refs = objects.get(id).match(/\/Annots\s*\[([^\]]*)\]/); assert(refs);
    for (const ref of refs[1].matchAll(/(\d+) 0 R/g)) {
      const obj = objects.get(Number(ref[1])); assert(obj && /\/Subtype \/Link\b/.test(obj));
      const rect = obj.match(/\/Rect\s*\[([^\]]+)\]/); assert(rect);
      const uri = obj.match(/\/URI\s*\(((?:\\.|[^\\)])*)\)/);
      if (/\/URI\b/.test(obj)) assert(uri, 'Unsupported URI encoding');
      const url = uri?.[1].replace(/\\([\\()])/g, '$1') || null;
      assert(!url || !url.includes('\\'), 'Unsupported URI escape');
      annotations.push({ page: index + 1, rect: rect[1].trim().split(/\s+/).map(Number), url });
    }
  });
  const parsed = parseFutbinDiagnostic(diagnostic);
  const linksDiagnostic = buildLinksDiagnostic({ ...diagnostic, annotations }, parsed.cards);
  linksDiagnostic.pageInfo = diagnostic.pageInfo;
  const context = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(new URL('../players-data.js', import.meta.url), 'utf8'), context);
  return { current: structuredClone(context.window.PLAYERS_DATA),
    cards: attachExactFutbinLinks(parsed.cards, linksDiagnostic), linksDiagnostic,
    fileName, extractedAt: diagnostic.extractedAt };
}

export function generateReal() {
  const { current, cards, linksDiagnostic, fileName, extractedAt } = realInputs();
  const run = (catalog, generatedAt) => generateCandidateCatalog(catalog,
    compareFutbinSnapshot(cards, catalog, { fileName, extractedAt }), { linksDiagnostic, generatedAt });
  const first = run(current, '2026-09-18T00:00:00.000Z');
  assert(first.canExport);
  const second = run(first.candidateCatalog, '2099-01-01T00:00:00.000Z');
  assert.deepEqual(second.candidateCatalog, first.candidateCatalog);
  assert.equal(second.report.summary.futbinLinksApplied, 0);
  assert.equal(second.report.summary.newCards, 0);
  const changed = field => first.candidateCatalog.filter((record, i) =>
    JSON.stringify(field(record)) !== JSON.stringify(field(second.candidateCatalog[i]))).length;
  const structure = record => Object.fromEntries(['id','nombre','ovr','posicionPrincipal','posiciones','stats','pie','skills','weakFoot'].map(k => [k,record[k]]));
  first.report.idempotence = { equivalent: true, secondRun: second.report.summary,
    playerIdChanges: changed(c => c.futbin?.playerId), slugChanges: changed(c => c.futbin?.slug),
    urlChanges: changed(c => c.futbin?.url), structuralChanges: changed(structure),
    importedAtChanges: changed(c => c.fuente?.importedAt), duplicateIds: second.candidateCatalog.length - new Set(second.candidateCatalog.map(c => c.id)).size };
  first.report.linkDiagnosticSummary = linksDiagnostic.summary;
  first.report.requiredCases = ['Gordon', 'Frimpong', 'Messi', 'van de Ven'].map(nombre => ({ nombre,
    records: first.candidateCatalog.filter(c => c.nombre.toLowerCase() === nombre.toLowerCase()).map(c => ({ id: c.id, futbin: c.futbin })) }));
  return { first, second, current, linksDiagnostic };
}

if (process.argv.includes('--export')) {
  const { first, current } = generateReal();
  fs.writeFileSync(new URL('./players-data.candidate.js', import.meta.url),
    serializeCandidateCatalog(first.candidateCatalog, current, first.metadata));
  fs.writeFileSync(new URL('./catalog-generation-report.json', import.meta.url), JSON.stringify(first.report, null, 2) + '\n');
  console.log(JSON.stringify({ summary: first.report.summary, cases: first.report.requiredCases, idempotence: first.report.idempotence }, null, 2));
}
