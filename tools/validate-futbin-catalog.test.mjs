import test from "node:test";
import assert from "node:assert/strict";
import { parseCatalogSource, validateFutbinCatalogs } from "./validate-futbin-catalog.mjs";

const card = (id = "alpha") => ({
  id,
  nombre: id === "alpha" ? "Alpha" : "Beta",
  version: null,
  tipoCarta: null,
  ovr: 85,
  posicionPrincipal: "ST",
  posiciones: ["ST", "CAM"],
  stats: { pac: 80, sho: 81, pas: 79, dri: 82, def: 40, phy: 75 },
  pie: "R",
  skills: 4,
  weakFoot: 3,
  ratingFuente: 86.2,
  popularidadFuente: 100,
  precioReferencia: 5000,
  valorSecundarioFuente: 300,
  fuente: { nombre: "FUTBIN", paginaPdf: 1 },
  activo: true
});

const validFutbin = {
  game: 27,
  playerId: 843,
  slug: "anthony-gordon",
  url: "https://www.futbin.com/27/player/843/anthony-gordon"
};

const hasError = (result, code) => result.errors.some(item => item.code === code);

test("accepts a valid candidate and calculates its metrics", () => {
  const current = [card()];
  const result = validateFutbinCatalogs(current, structuredClone(current));
  assert.equal(result.valid, true);
  assert.equal(result.hasChanges, false);
  assert.deepEqual(result.summary, {
    currentCatalog: 1,
    candidateCatalog: 1,
    newCards: 0,
    uniqueIds: 1,
    withFutbin: 0,
    withoutFutbin: 1,
    nullPrices: 0,
    zeroPrices: 0,
    removedIds: 0,
    changedExisting: 0,
    marketChanges: {
      precioReferencia: 0,
      popularidadFuente: 0,
      ratingFuente: 0,
      valorSecundarioFuente: 0,
      fuente: 0,
      futbin: 0
    },
    validationErrors: 0
  });
});

test("rejects a duplicate ID", () => {
  const current = [card()];
  const result = validateFutbinCatalogs(current, [card(), { ...card("beta"), id: "alpha" }]);
  assert.equal(result.valid, false);
  assert.equal(hasError(result, "duplicate_id"), true);
});

test("rejects precioReferencia zero", () => {
  const current = [card()];
  const result = validateFutbinCatalogs(current, [{ ...card(), precioReferencia: 0 }]);
  assert.equal(result.valid, false);
  assert.equal(hasError(result, "invalid_price"), true);
  assert.equal(result.summary.zeroPrices, 1);
});

test("rejects removal of a current ID and reports it", () => {
  const current = [card(), card("beta")];
  const result = validateFutbinCatalogs(current, [card()]);
  assert.equal(result.valid, false);
  assert.equal(hasError(result, "missing_current_id"), true);
  assert.deepEqual(result.missingIds, ["beta"]);
  assert.equal(result.summary.removedIds, 1);
});

test("rejects a structural identity change on an existing ID", () => {
  const current = [card()];
  const result = validateFutbinCatalogs(current, [{ ...card(), stats: { ...card().stats, pac: 99 } }]);
  assert.equal(result.valid, false);
  assert(result.errors.some(item => item.code === "structural_change" && item.field === "stats"));
});

test("accepts a valid new card appended after the current catalog", () => {
  const current = [card()];
  const result = validateFutbinCatalogs(current, [card(), card("beta")]);
  assert.equal(result.valid, true);
  assert.equal(result.hasChanges, true);
  assert.equal(result.summary.newCards, 1);
  assert.deepEqual(result.newIds, ["beta"]);
});

test("rejects non-canonical FUTBIN metadata", () => {
  const current = [card()];
  const result = validateFutbinCatalogs(current, [{ ...card(), futbin: { ...validFutbin, url: "http://www.futbin.com/27/player/843/anthony-gordon" } }]);
  assert.equal(result.valid, false);
  assert.equal(hasError(result, "invalid_futbin"), true);
});

test("accepts canonical FUTBIN metadata and reports the change", () => {
  const current = [card()];
  const result = validateFutbinCatalogs(current, [{ ...card(), futbin: validFutbin }]);
  assert.equal(result.valid, true);
  assert.equal(result.hasChanges, true);
  assert.equal(result.summary.withFutbin, 1);
  assert.equal(result.summary.marketChanges.futbin, 1);
});

test("detects a publishable market-only change", () => {
  const current = [card()];
  const result = validateFutbinCatalogs(current, [{ ...card(), precioReferencia: 6000 }]);
  assert.equal(result.valid, true);
  assert.equal(result.hasChanges, true);
  assert.deepEqual(result.changes, [{ id: "alpha", fields: ["precioReferencia"] }]);
});

test("rejects a change in the relative order of current IDs", () => {
  const current = [card(), card("beta")];
  const result = validateFutbinCatalogs(current, [card("beta"), card()]);
  assert.equal(result.valid, false);
  assert.equal(hasError(result, "existing_order_changed"), true);
});

test("loads only a JSON window.PLAYERS_DATA assignment", () => {
  assert.deepEqual(parseCatalogSource(`// generated\nwindow.PLAYERS_DATA = ${JSON.stringify([card()])};\n`), [card()]);
  assert.throws(() => parseCatalogSource("window.PLAYERS_DATA = makeCatalog();"), /JSON valido/);
  assert.throws(() => parseCatalogSource("globalThis.PLAYERS_DATA = [];"), /window\.PLAYERS_DATA/);
});
