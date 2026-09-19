import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { compareFutbinSnapshot, detectSnapshotDuplicates, marketDiff,
  normalizeIdentity, normalizeSnapshotPrice, structuralFingerprint } from './futbin-matcher.mjs';
import { parseFutbinDiagnostic } from './futbin-parser.mjs';

const link = (playerId, slug = 'example') => ({
  game: 27, playerId, slug, url: 'https://www.futbin.com/27/player/' + playerId + '/' + slug
});
const card = (name = 'Example', playerId = null) => ({
  id: 'old-' + name + '-' + (playerId ?? 'none'), nombre: name, version: null, tipoCarta: 'gold',
  ovr: 85, posicionPrincipal: 'ST', posiciones: ['ST'],
  stats: { pac: 80, sho: 81, pas: 72, dri: 83, def: 35, phy: 70 },
  pie: 'R', skills: 4, weakFoot: 3, ratingFuente: 85, popularidadFuente: 100,
  precioReferencia: 5000, valorSecundarioFuente: 340, parseStatus: 'complete',
  ...(playerId ? { futbin: link(playerId) } : {})
});

test('identity normalization and structural fingerprints ignore accents/case but include the full card', () => {
  const a = card('João Pedro'), b = { ...card(' JOAO   PEDRO '), ovr: '85', pie: 'r', skills: '4' };
  assert.deepEqual(normalizeIdentity(a), normalizeIdentity(b));
  assert.equal(structuralFingerprint(a), structuralFingerprint(b));
  assert.notEqual(structuralFingerprint(a), structuralFingerprint({ ...a, ovr: 86 }));
});

test('K/N. raw zero is unavailable/null and produces a real market change from an old price', () => {
  const normalized = normalizeSnapshotPrice({ ...card(), precioReferencia: 0, precioReferenciaRaw: '0' });
  assert.equal(normalized.precioReferencia, null);
  assert.equal(normalized.precioDisponible, false);
  assert.deepEqual(marketDiff(card(), normalized).precioReferencia,
    { old: 5000, new: null, delta: null, deltaPercent: null });
  assert.equal(marketDiff({ ...card(), precioReferencia: 0 }, card()).precioReferencia.deltaPercent, null);
  assert.equal(marketDiff({ ...card(), precioReferencia: null }, card()).precioReferencia.deltaPercent, null);
});

test('playerId is the highest-priority identity and can preserve a match through structural changes', () => {
  const current = [card('Example', 100)];
  const snapshot = [{ ...card('Renamed', 100), ovr: 86 }];
  const result = compareFutbinSnapshot(snapshot, current);
  assert.equal(result.updated.length, 1);
  assert.equal(result.updated[0].matchReason, 'futbin_player_id');
  assert.equal(result.updated[0].currentRecord.id, current[0].id);

  const goalkeeper = { ...card('Keeper'), posicionPrincipal: 'GK', posiciones: ['GK'],
    stats: { div: 80, han: 81, kic: 72, ref: 83, spd: 35, pos: 70 } };
  const goalkeeperResult = compareFutbinSnapshot([{ ...goalkeeper, ratingFuente: null }], [goalkeeper]);
  assert.equal(goalkeeperResult.updated.length, 1);
  assert.equal(goalkeeperResult.updated[0].matchReason, 'structural_fingerprint');
});

test('different playerIds never merge only by name or fingerprint', () => {
  const current = [card('Example', 100)];
  const result = compareFutbinSnapshot([card('Example', 200)], current);
  assert.equal(result.new.length, 1);
  assert.equal(result.notInCurrentSnapshot.length, 1);
});

test('G. repeated same playerId is a real snapshot duplicate', () => {
  const snapshot = [card('Example', 100), { ...card('Example', 100), precioReferencia: 6000 }];
  const groups = detectSnapshotDuplicates(snapshot);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].duplicateKind, 'same_player_id');
  assert.deepEqual(groups[0].snapshotIndices, [0, 1]);
});

test('H/J. different playerIds remain separate even with equal or different structures', () => {
  const equal = [card('Example', 100), card('Example', 200)];
  assert.equal(detectSnapshotDuplicates(equal).length, 0);
  const different = [card('Example', 100), { ...card('Example', 200), ovr: 90 }];
  const result = compareFutbinSnapshot(different, []);
  assert.equal(result.new.length, 2);
});

test('missing structural identity is NEEDS_REVIEW and is never guessed from a name', () => {
  const result = compareFutbinSnapshot([{ ...card(), stats: {}, parseStatus: 'partial' }], [card()]);
  assert.equal(result.needsReview.length, 1);
  assert.equal(result.needsReview[0].matchReason, 'missing_stats_requires_reconciliation');

  const ambiguous = compareFutbinSnapshot([card()], [card(), { ...card(), id: 'another-history' }]);
  assert.equal(ambiguous.needsReview.length, 1);
  assert.equal(ambiguous.needsReview[0].candidates.length, 2);
  assert.equal(ambiguous.needsReview[0].matchReason, 'multiple_candidates_at_structural_fingerprint');
});

test('B. absence is explicitly eligible for authoritative removal', () => {
  const result = compareFutbinSnapshot([], [card()]);
  assert.equal(result.notInCurrentSnapshot.length, 1);
  assert(result.notInCurrentSnapshot[0].warnings.includes('eligible_for_authoritative_removal'));
  assert.equal(result.metadata.mode, 'authoritative-snapshot');
});

test('market changes never create NEW for the same playerId', () => {
  const result = compareFutbinSnapshot([{ ...card('Example', 100), precioReferencia: 3500,
    popularidadFuente: 1 }], [card('Example', 100)]);
  assert.equal(result.updated.length, 1);
  assert.equal(result.new.length, 0);
});

const fixture = new URL('./fixtures-local/EA FC 27 Popular Players _ FUTBIN2-diagnostico.json', import.meta.url);
test('real legacy fixture remains fully partitioned without mutation', { skip: !fs.existsSync(fixture) }, () => {
  const context = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(new URL('../players-data.js', import.meta.url), 'utf8'), context);
  const catalog = structuredClone(context.window.PLAYERS_DATA);
  const parsed = parseFutbinDiagnostic(JSON.parse(fs.readFileSync(fixture, 'utf8').replace(/^\uFEFF/, '')));
  const before = JSON.stringify({ catalog, parsed });
  const result = compareFutbinSnapshot(parsed.cards, catalog, { fileName: parsed.fileName });
  const partitioned = result.unchanged.length + result.updated.length + result.new.length +
    result.needsReview.length + result.snapshotDuplicates.reduce((sum, group) => sum + group.occurrences.length, 0);
  assert.equal(partitioned, parsed.cards.length);
  assert.equal(JSON.stringify({ catalog, parsed }), before);
  assert.equal(result.metadata.mode, 'authoritative-snapshot');
});
