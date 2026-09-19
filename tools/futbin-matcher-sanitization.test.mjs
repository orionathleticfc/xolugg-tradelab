import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compareFutbinSnapshot, detectSnapshotDuplicates, normalizeSnapshotPrice } from './futbin-matcher.mjs';
import { parseFutbinDiagnostic } from './futbin-parser.mjs';

const card = (patch = {}) => ({ nombre: 'Example', ovr: 85, posicionPrincipal: 'ST',
  stats: { pac: 80, sho: 80, pas: 80, dri: 80, def: 40, phy: 70 },
  pie: 'R', skills: 4, weakFoot: 4, precioReferencia: 5000, precioReferenciaRaw: '5K',
  popularidadFuente: 100, ratingFuente: 85, valorSecundarioFuente: 300,
  parseStatus: 'complete', warnings: [], ...patch });
const linked = (id, patch = {}) => card({ futbin: { game: 27, playerId: id, slug: 'p-' + id,
  url: 'https://www.futbin.com/27/player/' + id + '/p-' + id }, ...patch });

test('source zero is normalized idempotently to unavailable null', () => {
  const zero = card({ precioReferencia: 0, precioReferenciaRaw: '0' });
  const once = normalizeSnapshotPrice(zero);
  assert.equal(once.precioReferencia, null);
  assert.equal(once.precioDisponible, false);
  assert.deepEqual(normalizeSnapshotPrice(once), once);
});

test('source zero creates a destructive market diff as required by authoritative snapshots', () => {
  const current = linked(1);
  const result = compareFutbinSnapshot([linked(1, {
    precioReferencia: 0, precioReferenciaRaw: '0'
  })], [current]);
  assert.equal(result.updated.length, 1);
  assert.equal(result.updated[0].marketDiff.precioReferencia.new, null);
  assert.equal(result.updated[0].priceDecision.effective, null);
});

test('same playerId repeats are duplicates; different playerIds never are', () => {
  assert.equal(detectSnapshotDuplicates([linked(1), linked(1, { precioReferencia: 6000 })]).length, 1);
  assert.equal(detectSnapshotDuplicates([linked(1), linked(2)]).length, 0);
});

test('partial no-link evidence stays NEEDS_REVIEW and does not bridge conflicting identities', () => {
  const partial = card({ stats: {}, parseStatus: 'partial' });
  const result = compareFutbinSnapshot([card(), card({ stats: { ...card().stats, pac: 99 } }), partial], []);
  assert(result.needsReview.some(row => row.parserCard === partial));
});

const fixture = new URL('./fixtures-local/EA FC 27 Popular Players _ FUTBIN2-diagnostico.json', import.meta.url);
test('real diagnostic preserves every raw-zero occurrence and six partial GK ratings',
  { skip: !fs.existsSync(fixture) }, () => {
    const parsed = parseFutbinDiagnostic(JSON.parse(fs.readFileSync(fixture, 'utf8').replace(/^\uFEFF/, '')));
    const zeros = parsed.cards.filter(card => card.precioReferenciaRaw === '0');
    assert.equal(zeros.length, 49);
    assert(zeros.every(card => normalizeSnapshotPrice(card).precioReferencia === null));
    assert.equal(parsed.cards.filter(card => card.posicionPrincipal === 'GK' &&
      card.warnings.includes('missing_rating')).length, 6);
  });
