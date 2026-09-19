import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { generateCandidateCatalog, generateCardId, serializeCandidateCatalog,
  validateCandidateCatalog } from './futbin-generator.mjs';
import { compareFutbinSnapshot } from './futbin-matcher.mjs';

const observed = '2026-09-19T20:00:00.000Z';
const generated = '2026-09-19T20:01:00.000Z';
const link = (playerId, slug = 'p-' + playerId) => ({
  game: 27, playerId, slug, url: 'https://www.futbin.com/27/player/' + playerId + '/' + slug
});
const card = (name, playerId, patch = {}) => ({
  id: 'legacy-' + playerId, nombre: name, version: null, tipoCarta: 'gold', ovr: 85,
  posicionPrincipal: 'ST', posiciones: ['ST', 'CAM'],
  stats: { pac: 80, sho: 81, pas: 72, dri: 83, def: 35, phy: 70 },
  pie: 'R', skills: 4, weakFoot: 3, ratingFuente: 85,
  popularidadFuente: 100, precioReferencia: 5000, precioReferenciaRaw: '5K',
  valorSecundarioFuente: 340, valorSecundarioFuenteRaw: '340',
  fuente: { nombre: 'FUTBIN', importedAt: '2026-09-18T00:00:00.000Z' },
  activo: true, parseStatus: 'complete', sourcePage: 1,
  ...(playerId ? { futbin: link(playerId) } : {}), ...patch
});
function run(current, snapshot) {
  const comparison = compareFutbinSnapshot(snapshot, current, {
    fileName: 'snapshot.pdf', extractedAt: observed,
    parserMetrics: { cards: snapshot.length, slots: snapshot.length }
  });
  return generateCandidateCatalog(current, comparison, { generatedAt: generated });
}

test('A/B/L. authoritative candidate contains only snapshot cards and follows snapshot order', () => {
  const current = [1, 2, 3, 4, 5].map(id => card('Old ' + id, id));
  const snapshot = [card('Old 3', 3), card('Old 1', 1), card('New 6', 6)];
  const result = run(current, snapshot);
  assert.deepEqual(result.candidateCatalog.map(item => item.nombre), ['Old 3', 'Old 1', 'New 6']);
  assert.equal(result.candidateCatalog.length, 3);
  assert.equal(result.report.removedFromPreviousCatalog.count, 3);
  assert.equal(result.report.summary.newCards, 1);
});

test('C/D/F. new gold, special and unknown cards all enter the authoritative catalog', () => {
  const result = run([], [
    card('Gold', 1, { tipoCarta: 'gold' }),
    card('Special', 2, { tipoCarta: 'special' }),
    card('Unknown', 3, { tipoCarta: 'unknown' })
  ]);
  assert.equal(result.canExport, true);
  assert.deepEqual(result.candidateCatalog.map(item => item.tipoCarta), ['gold', 'special', 'unknown']);
  assert.deepEqual([result.metadata.goldCards, result.metadata.specialCards, result.metadata.unknownCards], [1, 1, 1]);
});

test('G. repeated same playerId is consolidated and prefers its available occurrence', () => {
  const zero = card('Same', 10, { precioReferencia: 0, precioReferenciaRaw: '0' });
  const market = card('Same', 10, { precioReferencia: 7000, precioReferenciaRaw: '7K' });
  const result = run([], [zero, market]);
  assert.equal(result.candidateCatalog.length, 1);
  assert.equal(result.candidateCatalog[0].precioReferencia, 7000);
  assert.equal(result.report.snapshotDuplicateGroups.length, 1);
});

test('H/J. distinct playerIds with real market coexist as separate versions', () => {
  const result = run([], [
    card('Variant', 10, { tipoCarta: 'gold' }),
    card('Variant', 20, { tipoCarta: 'special', ovr: 90, precioReferencia: 90000 })
  ]);
  assert.equal(result.candidateCatalog.length, 2);
  assert.deepEqual(result.candidateCatalog.map(item => item.id), ['futbin-27-10', 'futbin-27-20']);
});

test('I. an equivalent raw-zero transfer twin is excluded in favor of the one market variant', () => {
  const zero = card('Barcola', 10, { precioReferencia: 0, precioReferenciaRaw: '0' });
  const market = card('Barcola', 20, { precioReferencia: 7500, precioReferenciaRaw: '7.5K' });
  const result = run([], [zero, market]);
  assert.equal(result.candidateCatalog.length, 1);
  assert.equal(result.candidateCatalog[0].futbin.playerId, 20);
  assert.equal(result.report.excludedUnavailableTwins.length, 1);
  assert.equal(result.report.excludedUnavailableTwins[0].excludedPlayerId, 10);
});

test('all equivalent different-playerId variants with null prices go to NEEDS_REVIEW', () => {
  const snapshot = [10, 20].map(id => card('Unavailable', id, {
    precioReferencia: 0, precioReferenciaRaw: '0'
  }));
  const result = run([], snapshot);
  assert.equal(result.candidateCatalog.length, 0);
  assert(result.report.needsReview.some(item => item.reason === 'equivalent_variants_all_unavailable'));
  assert.equal(result.canExport, false);
});

test('K/N. raw zero becomes null and never preserves an old price', () => {
  const current = [card('Example', 10, { precioReferencia: 9999 })];
  const result = run(current, [card('Example', 10, { precioReferencia: 0, precioReferenciaRaw: '0' })]);
  assert.equal(result.candidateCatalog[0].precioReferencia, null);
  assert.equal(result.candidateCatalog[0].fuente.precioPrincipalRaw, '0');
});

test('M. popularity always comes from the current snapshot', () => {
  const result = run([card('Example', 10, { popularidadFuente: 999 })],
    [card('Example', 10, { popularidadFuente: 3 })]);
  assert.equal(result.candidateCatalog[0].popularidadFuente, 3);
});

test('O. every observed card receives the new snapshot timestamp even when market values did not change', () => {
  const result = run([card('Example', 10)], [card('Example', 10)]);
  assert.equal(result.candidateCatalog[0].fuente.importedAt, observed);
  assert.equal(result.candidateCatalog[0].fuente.snapshotObservedAt, observed);
  assert.equal(result.candidateCatalog[0].fuente.lastMarketChangedAt, '2026-09-18T00:00:00.000Z');
});

test('playerId controls stable-ID reuse and new variants derive IDs from playerId', () => {
  const current = [card('Historical Name', 10, { futbin: link(10, 'old-slug') })];
  const result = run(current, [
    card('Renamed', 10, { ovr: 86, futbin: link(10, 'new-slug') }),
    card('Historical Name', 20)
  ]);
  assert.equal(result.candidateCatalog[0].id, current[0].id);
  assert.equal(result.candidateCatalog[0].futbin.slug, 'new-slug');
  assert.equal(result.candidateCatalog[1].id, 'futbin-27-20');
  assert.equal(generateCardId(card('Any', 99)), 'futbin-27-99');

  const collisionCurrent = [card('Existing', 10, { id: 'futbin-27-20' })];
  const collision = run(collisionCurrent, [card('Existing', 10), card('New', 20)]);
  assert.equal(collision.report.idCollisions.length, 1);
  assert.equal(collision.canExport, false);
  assert.deepEqual(collision.candidateCatalog.map(item => item.id), ['futbin-27-20']);
});

test('metadata and report are authoritative, coherent and serialize without breaking PLAYERS_DATA', () => {
  const result = run([], [card('Example', 10)]);
  assert.equal(result.metadata.mode, 'authoritative-snapshot');
  assert.equal(result.metadata.acceptedCards, 1);
  assert.equal(result.report.mode, 'authoritative-snapshot');
  const source = serializeCandidateCatalog(result.candidateCatalog, [], result.metadata);
  const context = vm.createContext({ window: {} });
  vm.runInContext(source, context);
  assert.equal(context.window.PLAYERS_DATA.length, 1);
  assert.equal(context.window.PLAYERS_DATA_META.mode, 'authoritative-snapshot');
});

test('validation blocks schema, identity and metadata corruption before export', () => {
  const base = run([], [card('Example', 10)]);
  assert.equal(validateCandidateCatalog(base.candidateCatalog, [], base.metadata).valid, true);
  assert.equal(validateCandidateCatalog([...base.candidateCatalog, { ...base.candidateCatalog[0], id: 'x' }],
    [], { ...base.metadata, acceptedCards: 2 }).valid, false);
  assert.equal(validateCandidateCatalog([{ ...base.candidateCatalog[0], precioReferencia: 0 }],
    [], base.metadata).valid, false);
  assert.equal(validateCandidateCatalog(base.candidateCatalog, [], { ...base.metadata, acceptedCards: 2 }).valid, false);

  const record = base.candidateCatalog[0];
  const invalidCases = [
    [{ id: '' }, 'missing_id'],
    [{ nombre: '' }, 'invalid_name'],
    [{ ovr: NaN }, 'invalid_ovr'],
    [{ posicionPrincipal: '' }, 'invalid_position'],
    [{ posiciones: ['ST', 'ST'] }, 'invalid_positions'],
    [{ stats: { ...record.stats, pac: '80' } }, 'invalid_stats'],
    [{ pie: '?' }, 'invalid_foot'],
    [{ skills: '4' }, 'invalid_skill'],
    [{ weakFoot: 10 }, 'invalid_skill'],
    [{ ratingFuente: -1 }, 'invalid_market_value'],
    [{ popularidadFuente: Infinity }, 'invalid_market_value'],
    [{ valorSecundarioFuente: -1 }, 'invalid_market_value'],
    [{ version: 1 }, 'invalid_version'],
    [{ tipoCarta: null }, 'invalid_card_type'],
    [{ activo: false }, 'invalid_active_flag'],
    [{ fuente: null }, 'invalid_source'],
    [{ futbin: { ...record.futbin, game: 26 } }, 'invalid_futbin'],
    [{ futbin: { ...record.futbin, playerId: '10' } }, 'invalid_futbin'],
    [{ futbin: { ...record.futbin, playerId: 0 } }, 'invalid_futbin'],
    [{ futbin: { ...record.futbin, playerId: 1.5 } }, 'invalid_futbin'],
    [{ futbin: { ...record.futbin, slug: '' } }, 'invalid_futbin'],
    [{ futbin: { ...record.futbin, url: record.futbin.url + '?x=1' } }, 'invalid_futbin']
  ];
  for (const [recordPatch, code] of invalidCases) {
    const validation = validateCandidateCatalog([{ ...record, ...recordPatch }], [], base.metadata);
    assert(validation.errors.some(error => error.code === code), code);
  }
  assert.throws(() => serializeCandidateCatalog([{ ...record, nombre: '' }], [], base.metadata),
    /no supera la validaci/);
});

test('inputs are never mutated', () => {
  const current = [card('Old', 1)], snapshot = [card('New', 2)];
  const before = JSON.stringify({ current, snapshot });
  run(current, snapshot);
  assert.equal(JSON.stringify({ current, snapshot }), before);
});

test('replaying the same observed snapshot is catalog-idempotent', () => {
  const snapshot = [card('Example', 10)];
  const first = run([], snapshot);
  const comparison = compareFutbinSnapshot(snapshot, first.candidateCatalog, {
    fileName: 'snapshot.pdf', extractedAt: observed,
    parserMetrics: { cards: 1, slots: 1 }
  });
  const second = generateCandidateCatalog(first.candidateCatalog, comparison, {
    generatedAt: '2099-01-01T00:00:00.000Z'
  });
  assert.deepEqual(second.candidateCatalog, first.candidateCatalog);
  assert.equal(second.report.summary.unchangedCards, 1);
});
