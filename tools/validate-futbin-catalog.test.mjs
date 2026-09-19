import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseCatalogDocument, parseCatalogSource, validateFutbinCatalogs } from './validate-futbin-catalog.mjs';

const card = (id = 'alpha', playerId = null, patch = {}) => ({
  id, nombre: id, version: null, tipoCarta: 'gold', ovr: 85,
  posicionPrincipal: 'ST', posiciones: ['ST'],
  stats: { pac: 80, sho: 81, pas: 79, dri: 82, def: 40, phy: 75 },
  pie: 'R', skills: 4, weakFoot: 3, ratingFuente: 86.2, popularidadFuente: 100,
  precioReferencia: 5000, valorSecundarioFuente: 300,
  fuente: { nombre: 'FUTBIN', paginaPdf: 1, importedAt: '2026-09-19T00:00:00.000Z' },
  activo: true, ...(playerId ? { futbin: { game: 27, playerId, slug: 'p-' + playerId,
    url: 'https://www.futbin.com/27/player/' + playerId + '/p-' + playerId } } : {}), ...patch
});
const meta = (acceptedCards = 1, patch = {}) => ({
  mode: 'authoritative-snapshot', source: 'FUTBIN', snapshotFile: 'snapshot.pdf',
  generatedAt: '2026-09-19T00:00:00.000Z', parsedCards: acceptedCards,
  acceptedCards, parserCards: acceptedCards, parserSlots: acceptedCards,
  goldCards: acceptedCards, specialCards: 0, unknownCards: 0,
  excludedUnavailableTwins: 0, needsReview: 0, ...patch
});
const has = (result, code) => result.errors.some(error => error.code === code);

test('R. authoritative mode allows removals and reordering while reporting both', () => {
  const current = [card('a', 1), card('b', 2), card('c', 3)];
  const candidate = [card('c', 3), card('a', 1), card('d', 4)];
  const result = validateFutbinCatalogs(current, candidate, meta(3, { goldCards: 3 }));
  assert.equal(result.valid, true);
  assert.deepEqual(result.missingIds, ['b']);
  assert.deepEqual(result.newIds, ['d']);
  assert.equal(result.summary.newCards, 1);
  assert.equal(result.summary.removedIds, 1);
  assert.equal(result.summary.mode, 'authoritative-snapshot');
  assert.equal(result.summary.excludedUnavailableTwins, 0);
});

test('legacy mode continues to reject removals and existing-order changes', () => {
  const current = [card('a'), card('b')];
  const result = validateFutbinCatalogs(current, [card('b')]);
  assert.equal(result.valid, false);
  assert(has(result, 'missing_current_id'));
  assert(has(result, 'existing_order_changed'));
});

test('S. authoritative metadata must be present and coherent', () => {
  const candidate = [card('a')];
  for (const metadata of [
    { ...meta(), acceptedCards: 2 },
    { ...meta(), snapshotFile: '' },
    { ...meta(), generatedAt: 'bad' },
    { ...meta(), parsedCards: 0 },
    { ...meta(), goldCards: 0 },
    { ...meta(), parsedCards: 4, parserCards: 4, parserSlots: 4 }
  ]) {
    const result = validateFutbinCatalogs([], candidate, metadata);
    assert.equal(result.valid, false);
  }
});

test('candidate integrity includes canonical FUTBIN identities and valid market data', () => {
  assert(has(validateFutbinCatalogs([], [], meta(0)), 'empty_candidate'));
  const duplicateIds = validateFutbinCatalogs([], [card('a', 1), card('a', 2)],
    meta(2, { goldCards: 2 }));
  assert(has(duplicateIds, 'duplicate_id'));
  const duplicatePlayers = validateFutbinCatalogs([], [card('a', 1), card('b', 1)],
    meta(2, { goldCards: 2 }));
  assert(has(duplicatePlayers, 'duplicate_futbin_player_id'));
  const zero = validateFutbinCatalogs([], [card('a', 1, { precioReferencia: 0 })], meta());
  assert(has(zero, 'invalid_price'));

  const valid = card('a', 843);
  for (const linkPatch of [
    { game: 26 }, { playerId: '843' }, { playerId: 0 }, { playerId: 1.5 },
    { slug: '' }, { url: valid.futbin.url + '?x=1' }
  ]) {
    const result = validateFutbinCatalogs([], [{ ...valid, futbin: { ...valid.futbin, ...linkPatch } }], meta());
    assert(has(result, 'invalid_futbin'));
  }
  const canonical = validateFutbinCatalogs([], [valid], meta());
  assert.equal(canonical.valid, true);
  assert.equal(canonical.summary.withFutbin, 1);
});

test('same internal ID cannot be reassigned to another exact playerId', () => {
  const result = validateFutbinCatalogs([card('a', 1)], [card('a', 2)], meta());
  assert(has(result, 'id_reassigned_player_id'));

  const marketOnly = validateFutbinCatalogs([card('a', 1)],
    [card('a', 1, { precioReferencia: 6000 })], meta());
  assert.equal(marketOnly.valid, true);
  assert.deepEqual(marketOnly.changes, [{ id: 'a', fields: ['precioReferencia'] }]);
});

test('large authoritative drops warn critically but do not automatically block a coherent snapshot', () => {
  const current = Array.from({ length: 10 }, (_, index) => card('p' + index, index + 1));
  const candidate = [card('p0', 1), card('p1', 2), card('p2', 3)];
  const result = validateFutbinCatalogs(current, candidate, meta(3, { goldCards: 3 }));
  assert.equal(result.valid, true);
  assert(result.warnings.some(warning => warning.code === 'critical_catalog_replacement'));
});

test('authoritative source round-trips both metadata and PLAYERS_DATA', () => {
  const source = '// generated\nwindow.PLAYERS_DATA_META = ' + JSON.stringify(meta()) +
    ';\nwindow.PLAYERS_DATA = ' + JSON.stringify([card()]) + ';\n';
  const document = parseCatalogDocument(source);
  assert.equal(document.metadata.mode, 'authoritative-snapshot');
  assert.deepEqual(document.catalog, [card()]);
  assert.deepEqual(parseCatalogSource(source), [card()]);
  assert.throws(() => parseCatalogSource('window.PLAYERS_DATA = makeCatalog();'), /JSON invalido/);
  assert.throws(() => parseCatalogSource('globalThis.PLAYERS_DATA = [];'), /PLAYERS_DATA/);

  const production = parseCatalogDocument(
    fs.readFileSync(new URL('../players-data.js', import.meta.url), 'utf8'), 'players-data.js');
  const productionValidation = validateFutbinCatalogs(
    production.catalog, structuredClone(production.catalog), production.metadata);
  assert.equal(productionValidation.valid, true);
assert(production.catalog.length > 0);
  assert.equal(new Set(production.catalog.map(record => record.id)).size, production.catalog.length);
  assert.equal(production.catalog.some(record => record.precioReferencia === 0), false);
});

test('T/U/V. publisher advertises DryRun details, REEMPLAZAR guard and no DryRun push path', () => {
  const source = fs.readFileSync(new URL('./update-futbin.ps1', import.meta.url), 'utf8');
  for (const text of ['ACTUALIZACION SNAPSHOT', 'Removals:', 'Special:', 'Unknown:',
    'Excluded unavailable twins:',
    'Escribe $requiredConfirmation', '"REEMPLAZAR"', 'players-data.js no fue modificado',
    'No se creo commit ni se hizo push']) assert(source.includes(text), text);
  assert.match(source, /if \(\$DryRun\)[\s\S]*?exit 0[\s\S]*?git push/);
});

test('publisher and application never clear localStorage', () => {
  const sources = [
    fs.readFileSync(new URL('./update-futbin.ps1', import.meta.url), 'utf8'),
    fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8')
  ].join('\n');
  assert(!sources.includes('localStorage.clear'));
});
