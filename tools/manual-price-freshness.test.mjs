import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function loadApp(stored = {}) {
  const values = new Map(Object.entries(stored));
  const localStorage = {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
  const context = vm.createContext({
    window: {}, document: { addEventListener() {} }, localStorage,
    console: { log() {}, warn() {}, error() {} }, structuredClone
  });
  vm.runInContext(fs.readFileSync(new URL("../app.js", import.meta.url), "utf8"), context);
  return { context, values };
}

const plain = value => JSON.parse(JSON.stringify(value));
const importedAt = "2026-09-18T13:00:00.000Z";
const player = (price = 10000, imported = importedAt) => ({
  id: "player-id", precioReferencia: price,
  fuente: imported === undefined ? {} : { importedAt: imported }
});

test("FUTBIN wins when a modern manual price predates or equals importedAt", () => {
  const { context } = loadApp();
  for (const updatedAt of ["2026-09-17T12:00:00.000Z", importedAt]) {
    const result = plain(context.resolvePopularPrice(player(), { price: 8500, updatedAt }));
    assert.equal(result.effectivePrice, 10000);
    assert.equal(result.manualPrice, null);
    assert.equal(result.manualExpired, true);
    assert.equal(result.source, "Referencia");
  }
});

test("a modern manual price newer than importedAt wins", () => {
  const { context } = loadApp();
  const result = plain(context.resolvePopularPrice(player(), {
    price: 8500, updatedAt: "2026-09-18T14:00:00.000Z"
  }));
  assert.equal(result.effectivePrice, 8500);
  assert.equal(result.manualPrice, 8500);
  assert.equal(result.source, "Manual");
});

test("without a manual override FUTBIN reference wins", () => {
  const { context } = loadApp();
  const result = plain(context.resolvePopularPrice(player(), null));
  assert.equal(result.effectivePrice, 10000);
  assert.equal(result.source, "Referencia");
});

test("numeric legacy expires with importedAt and remains active without importedAt", () => {
  const { context } = loadApp();
  assert.equal(context.resolvePopularPrice(player(), 8500).effectivePrice, 10000);
  const compatible = plain(context.resolvePopularPrice(player(10000, null), 8500));
  assert.equal(compatible.effectivePrice, 8500);
  assert.equal(compatible.source, "Manual");
});

test("null reference uses only a newer manual price", () => {
  const { context } = loadApp();
  const newer = context.resolvePopularPrice(player(null), {
    price: 8500, updatedAt: "2026-09-18T14:00:00.000Z"
  });
  const expired = plain(context.resolvePopularPrice(player(null), {
    price: 8500, updatedAt: "2026-09-17T12:00:00.000Z"
  }));
  assert.equal(newer.effectivePrice, 8500);
  assert.equal(expired.effectivePrice, null);
  assert.equal(expired.source, "Sin precio");
});

test("normalization accepts legacy, intermediate and new formats and emits only the new schema", () => {
  const { context } = loadApp();
  const result = plain(context.normalizePopularPrices({
    numeric: 8500,
    intermediate: { precioUsuario: 8600, ultimaActualizacion: "2026-09-18T14:00:00Z" },
    modern: { price: 8700, updatedAt: "2026-09-18T15:00:00.000Z" },
    invalid: { price: 0, updatedAt: "bad" }
  }));
  assert.deepEqual(result, {
    numeric: { price: 8500, updatedAt: null },
    intermediate: { price: 8600, updatedAt: "2026-09-18T14:00:00.000Z" },
    modern: { price: 8700, updatedAt: "2026-09-18T15:00:00.000Z" }
  });
});

test("loading migrates only xoluggPopularPrices and preserves every other localStorage value", () => {
  const protectedValues = {
    xoluggTradeLab: "state", watchlist: "watchlist", historial: "historial",
    capital: "capital", backups: "backups"
  };
  const { context, values } = loadApp({
    ...protectedValues, xoluggPopularPrices: JSON.stringify({ "player-id": 8500 })
  });
  context.loadPopularPrices();
  assert.deepEqual(JSON.parse(values.get("xoluggPopularPrices")), {
    "player-id": { price: 8500, updatedAt: null }
  });
  for (const [key, value] of Object.entries(protectedValues)) assert.equal(values.get(key), value);
});

test("old and modern backups validate and normalize without losing supported overrides", () => {
  const { context } = loadApp();
  const base = { state: { capital: 0, watchlist: [], historial: [] } };
  const oldBackup = { ...base, popularPriceOverrides: { "player-id": 8500 } };
  const newBackup = { ...base, popularPriceOverrides: {
    "player-id": { price: 9000, updatedAt: "2026-09-18T14:30:00.000Z" }
  } };
  assert.equal(context.validarBackup(oldBackup), true);
  assert.equal(context.validarBackup(newBackup), true);
  assert.deepEqual(plain(context.normalizePopularPrices(oldBackup.popularPriceOverrides)), {
    "player-id": { price: 8500, updatedAt: null }
  });
  assert.deepEqual(plain(context.normalizePopularPrices(newBackup.popularPriceOverrides)),
    newBackup.popularPriceOverrides);
  assert.equal(context.validarBackup({ ...base, popularPriceOverrides: [] }), false);
});

test("P/Q. a new observed snapshot expires an older manual while a later manual still wins", () => {
  const { context } = loadApp();
  const observedPlayer = player(10000, "2026-09-19T20:00:00.000Z");
  assert.equal(context.resolvePopularPrice(observedPlayer, {
    price: 9000, updatedAt: "2026-09-19T19:59:59.000Z"
  }).effectivePrice, 10000);
  assert.equal(context.resolvePopularPrice(observedPlayer, {
    price: 9000, updatedAt: "2026-09-19T20:00:01.000Z"
  }).effectivePrice, 9000);
});

test("X. autocomplete reads only the current catalog and labels legitimate versions", () => {
  const { context } = loadApp();
  context.window.PLAYERS_DATA = [
    { id: "gold", nombre: "Variant", ovr: 85, tipoCarta: "gold" },
    { id: "special", nombre: "Variant", ovr: 91, tipoCarta: "special" }
  ];
  const entries = plain(context.getUniquePopularPlayerNames());
  assert.deepEqual(entries.map(entry => entry.id), ["gold", "special"]);
  assert.deepEqual(entries.map(entry => entry.label), [
    "Variant · 85 · Oro", "Variant · 91 · Especial"
  ]);
});
