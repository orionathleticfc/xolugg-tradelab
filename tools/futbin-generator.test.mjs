import { createHash } from "node:crypto";
﻿
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { generateCardId, generateCandidateCatalog, validateCandidateCatalog, serializeCandidateCatalog } from "./futbin-generator.mjs";
import { compareFutbinSnapshot } from "./futbin-matcher.mjs";
import { parseFutbinDiagnostic } from "./futbin-parser.mjs";
const stamp = { generatedAt: "2026-09-17T00:00:00.000Z" };
const card = (name = "Example") => ({
  id: "historical-" + name, nombre: name, version: null, tipoCarta: null, ovr: 85,
  posicionPrincipal: "ST", posiciones: ["ST", "CAM"], stats: { pac: 80, sho: 81, pas: 72, dri: 83, def: 35, phy: 70 },
  pie: "R", skills: 4, weakFoot: 3, ratingFuente: 85, popularidadFuente: 100,
  precioReferencia: 5000, valorSecundarioFuente: 340, fuente: { nombre: "FUTBIN", paginaPdf: 1, custom: "keep" },
  activo: true, parseStatus: "complete", sourcePage: 2, precioReferenciaRaw: "5K", valorSecundarioFuenteRaw: "340"
});
const compare = (snapshot, catalog) => compareFutbinSnapshot(snapshot, catalog, { fileName: "test.pdf" });
function freeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) { Object.freeze(value); Object.values(value).forEach(freeze); }
  return value;
}

test("updates change only supported fields, preserving structure, IDs and ordering", () => {
  const current = [card(), card("Absent")];
  const pdf = { ...card(), precioReferencia: 3500, precioReferenciaRaw: "3.5K", popularidadFuente: 200, posiciones: ["CAM", "ST"] };
  const result = generateCandidateCatalog(current, compare([pdf], current), stamp);
  assert.equal(result.report.summary.updatedApplied, 1);
  assert.equal(result.candidateCatalog[0].id, current[0].id);
  assert.deepEqual(result.candidateCatalog[0].stats, current[0].stats);
  assert.deepEqual(result.candidateCatalog[0].posiciones, current[0].posiciones);
  assert.equal(result.candidateCatalog[0].fuente.custom, "keep");
  assert.deepEqual(result.candidateCatalog[1], current[1]);
  assert.deepEqual(result.report.updatedApplied[0].changes.precioReferencia, { old: 5000, new: 3500 });
  assert.equal(result.canExport, true);
});
test("raw zero retains current price or null and records original raw source", () => {
  for (const price of [5000, null]) {
    const current = [{ ...card(), precioReferencia: price }];
    const pdf = { ...card(), precioReferencia: 0, precioReferenciaRaw: "0", popularidadFuente: 200 };
    const result = generateCandidateCatalog(current, compare([pdf], current), stamp);
    assert.equal(result.candidateCatalog[0].precioReferencia, price);
    assert.equal(result.candidateCatalog[0].fuente.precioPrincipalRaw, "0");
    assert.equal(result.report.updatedApplied[0].pricePreserved, true);
  }
});
test("absent rating never erases an existing rating during an exact update", () => {
  const current = [card()], pdf = { ...card(), ratingFuente: null, popularidadFuente: 201, parseStatus: "partial" };
  const result = generateCandidateCatalog(current, compare([pdf], current), stamp);
  assert.equal(result.candidateCatalog[0].ratingFuente, 85);
  assert.equal(result.candidateCatalog[0].popularidadFuente, 201);
});
test("new records have complete compatible schema, real or unavailable prices, and deterministic IDs", () => {
  const available = card("João Pedro"), unavailable = { ...card("New Zero"), precioReferencia: 0, precioReferenciaRaw: "0" };
  const result = generateCandidateCatalog([], compare([available, unavailable], []), stamp);
  assert.equal(result.report.summary.newApplied, 2);
  for (const record of result.candidateCatalog) {
    assert.equal(record.version, null); assert.equal(record.tipoCarta, null); assert.equal(record.activo, true);
    assert.equal(record.fuente.snapshotFile, "test.pdf");
    assert(!("evidence" in record)); assert(!("parseStatus" in record)); assert(!("presentInCurrentSnapshot" in record));
  }
  assert.equal(result.candidateCatalog[0].precioReferencia, 5000);
  assert.equal(result.candidateCatalog[1].precioReferencia, null);
  assert.equal(result.candidateCatalog[1].fuente.precioPrincipalRaw, "0");
  assert.equal(generateCardId(available), generateCardId({ ...available, nombre: " JOAO  PEDRO ", precioReferencia: 9000, popularidadFuente: 500, sourcePage: 99 }));
  assert.match(generateCardId(available), /^[a-z0-9-]+$/);
});
test("ID collision with current catalog does not add the new record", () => {
  const pdf = card("New");
  const current = [{ ...card("Other"), id: generateCardId(pdf) }];
  const result = generateCandidateCatalog(current, compare([pdf], current), stamp);
  assert.equal(result.report.summary.idCollisions, 1);
  assert.equal(result.report.summary.newApplied, 0);
  assert.equal(result.report.generationNeedsReview[0].reason, "id_collision");
  assert.deepEqual(result.candidateCatalog, current);
});
test("colliding generated IDs reject all competing new entries, regardless of order", () => {
  const comparison = compare([card("New")], []);
  comparison.new.push({ ...structuredClone(comparison.new[0]), snapshotIndex: 1 });
  const result = generateCandidateCatalog([], comparison, stamp);
  assert.equal(result.report.summary.idCollisions, 2); assert.equal(result.candidateCatalog.length, 0);
  assert.equal(result.report.generationNeedsReview.length, 2);
});
test("unsafe updates and stale matcher records are not applied", () => {
  const current = [card()], pdf = { ...card(), popularidadFuente: 200 };
  let comparison = compare([pdf], current);
  comparison.updated[0].confidence = "medium";
  let result = generateCandidateCatalog(current, comparison, stamp);
  assert.equal(result.report.summary.updatedApplied, 0);
  assert.equal(result.report.generationNeedsReview[0].reason, "unsafe_update_identity");
  comparison = compare([pdf], current);
  result = generateCandidateCatalog([{ ...card(), precioReferencia: 6000 }], comparison, stamp);
  assert.equal(result.report.generationNeedsReview[0].reason, "stale_catalog_record");
  assert.equal(result.candidateCatalog[0].precioReferencia, 6000);
});
test("duplicates, review records, unchanged and absent entries remain untouched", () => {
  const current = [card(), card("Review"), card("Unchanged"), card("Absent")];
  const snapshot = [card(), { ...card(), stats: {}, parseStatus: "partial" },
    { ...card("Review"), stats: { ...card().stats, pac: 99 } }, card("Unchanged")];
  const result = generateCandidateCatalog(current, compare(snapshot, current), stamp);
  assert.deepEqual(result.candidateCatalog, current);
  assert.equal(result.report.summary.skippedSnapshotDuplicateOccurrences, 2);
  assert.equal(result.report.skippedSnapshotDuplicates[0].status, "SKIPPED_SNAPSHOT_DUPLICATE");
  assert.equal(result.report.summary.skippedNeedsReview, 1);
  assert.equal(result.report.skippedNeedsReview[0].status, "SKIPPED_NEEDS_REVIEW");
});
test("validation gates source export for invalid schema, duplicate IDs or loss of existing records", () => {
  for (const patch of [
    { id: "" }, { nombre: "" }, { ovr: NaN }, { ovr: "85" }, { posicionPrincipal: "" },
    { precioReferencia: 0 }, { precioReferencia: -1 }, { precioReferencia: Infinity },
    { posiciones: ["ST", "ST"] }, { stats: { ...card().stats, pac: "80" } },
    { skills: "4" }, { weakFoot: 10 }, { activo: null }
  ]) {
    const invalid = [{ ...card(), ...patch }];
    assert.equal(validateCandidateCatalog(invalid).valid, false);
    assert.throws(() => serializeCandidateCatalog(invalid), /validación/);
  }
  assert.equal(validateCandidateCatalog([card(), card()]).valid, false);
  assert.equal(validateCandidateCatalog([], [card()]).valid, false);
  assert.equal(validateCandidateCatalog([{ ...card(), id: "changed" }], [card()]).valid, false);
  assert.equal(validateCandidateCatalog([{ ...card(), stats: { ...card().stats, pac: 90 } }], [card()]).valid, false);
  const result = generateCandidateCatalog([{ ...card(), precioReferencia: 0 }], compare([], [{ ...card(), precioReferencia: 0 }]), stamp);
  assert.equal(result.canExport, false);
  assert(result.report.summary.validationErrors > 0);
});
test("no original references mutate, and serialized JS round-trips in an isolated window", () => {
  const current = [card()], snapshot = [{ ...card(), popularidadFuente: 200 }, card("New")];
  const comparison = compare(snapshot, current);
  const before = JSON.stringify({ current, comparison });
  freeze(current); freeze(comparison);
  const result = generateCandidateCatalog(current, comparison, stamp);
  const context = vm.createContext({ window: {} });
  vm.runInContext(serializeCandidateCatalog(result.candidateCatalog, current), context);
  assert.equal(JSON.stringify(context.window.PLAYERS_DATA), JSON.stringify(result.candidateCatalog));
  result.candidateCatalog[0].stats.pac = 1;
  result.report.updatedApplied[0].nombre = "Changed output only";
  assert.equal(JSON.stringify({ current, comparison }), before);
});

const fixture = new URL("./fixtures-local/EA FC 27 Popular Players _ FUTBIN2-diagnostico.json", import.meta.url);
test("real snapshot reapplied to production is idempotent and preserves all 277 records", { skip: !fs.existsSync(fixture) }, () => {
  const context = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(new URL("../players-data.js", import.meta.url), "utf8"), context);
  const current = structuredClone(context.window.PLAYERS_DATA);
  const diagnostic = JSON.parse(fs.readFileSync(fixture, "utf8").replace(/^\uFEFF/, ""));
  const parsed = parseFutbinDiagnostic(diagnostic);
  const comparison = compareFutbinSnapshot(parsed.cards, current, { fileName: diagnostic.fileName });
  const before = JSON.stringify({ current, parsed, comparison });
  freeze(current); freeze(comparison);
  const result = generateCandidateCatalog(current, comparison, stamp);
  assert.deepEqual(result.report.summary, {
    currentCatalog: 277, updatedApplied: 0, newApplied: 0, unchanged: 216,
    preservedNotInSnapshot: 37, skippedSnapshotDuplicateGroups: 15, skippedSnapshotDuplicateOccurrences: 30,
    skippedNeedsReview: 4, generationNeedsReview: 0, idCollisions: 0, candidateCatalogSize: 277, validationErrors: 0
  });
  for (const name of ["Gordon", "Frimpong", "Pedro Neto"]) {
    const row = comparison.unchanged.find(row => row.pdfCard.nombre === name);
    const candidate = result.candidateCatalog[row.catalogIndex];
    assert.equal(candidate.id, current[row.catalogIndex].id);
    assert.deepEqual(candidate.stats, current[row.catalogIndex].stats);
    assert.equal(candidate.precioReferencia, row.pdfCard.precioReferencia);
    assert.equal(candidate.popularidadFuente, row.pdfCard.popularidadFuente);
  }
  const van = comparison.unchanged.find(row => row.pdfCard.nombre.toLowerCase() === "van de ven");
  assert.equal(result.candidateCatalog[van.catalogIndex].precioReferencia, current[van.catalogIndex].precioReferencia);
  assert.equal(result.candidateCatalog[van.catalogIndex].fuente.precioPrincipalRaw, "0");
  const safeIndices = new Set(result.report.updatedApplied.map(row => row.catalogIndex));
  current.forEach((record, index) => {
    assert.equal(result.candidateCatalog[index].id, record.id);
    if (!safeIndices.has(index)) assert.deepEqual(result.candidateCatalog[index], record);
  });
  for (const name of ["Diomande", "Endrick", "Álvaro Carreras", "Nmecha"]) assert(result.report.skippedNeedsReview.some(row => row.nombre === name));
  const incorporated = comparison.unchanged.filter(row => row.catalogIndex >= 250);
  assert.equal(incorporated.length, 27);
  for (const row of incorporated) {
    const candidate = result.candidateCatalog.find(record => record.id === generateCardId(row.pdfCard));
    assert(candidate);
    assert.equal(candidate.precioReferencia, row.pdfCard.precioDisponible ? row.pdfCard.precioReferencia : null);
  }
  assert(incorporated.some(row => !row.pdfCard.precioDisponible));
  assert(incorporated.some(row => row.pdfCard.precioDisponible));
  assert.equal(JSON.stringify({ current, parsed, comparison }), before);
  const sandbox = vm.createContext({ window: {} });
  vm.runInContext(serializeCandidateCatalog(result.candidateCatalog, current), sandbox);
  assert.equal(sandbox.window.PLAYERS_DATA.length, 277);
  assert.equal(JSON.stringify(sandbox.window.PLAYERS_DATA), JSON.stringify(result.candidateCatalog));
  // Full equality deliberately includes fuente.importedAt: an unchanged replay
  // must not rewrite even temporal metadata or existing ordering.
  assert.deepEqual(result.candidateCatalog,current);
  assert.equal(new Set(result.candidateCatalog.map(c=>c.id)).size,277);
  assert.equal(result.candidateCatalog.filter(c=>c.precioReferencia===0).length,0);
  const rerunComparison=compareFutbinSnapshot(parsed.cards,result.candidateCatalog,{fileName:diagnostic.fileName});
  const rerun=generateCandidateCatalog(result.candidateCatalog,rerunComparison,{generatedAt:"2099-01-01T00:00:00.000Z"});
  assert.deepEqual(rerun.candidateCatalog,current);
  assert.equal(rerun.report.summary.newApplied,0);
  assert.equal(rerun.report.summary.updatedApplied,0);
  assert.equal(rerun.report.summary.candidateCatalogSize,277);
  assert.deepEqual(result.report.skippedSnapshotDuplicates.map(g=>g.snapshotIndices),comparison.snapshotDuplicates.map(g=>g.snapshotIndices));
  assert.equal(result.report.preservedNotInSnapshot.length,37);
  console.log("Real generation:", result.report.summary);
});


test("production baseline keeps historical ID order and appends 27 unique compatible cards", () => {
  const context=vm.createContext({window:{}});
  vm.runInContext(fs.readFileSync(new URL("../players-data.js",import.meta.url),"utf8"),context);
  const catalog=structuredClone(context.window.PLAYERS_DATA);
  assert.equal(catalog.length,277);
  assert.equal(new Set(catalog.map(c=>c.id)).size,277);
  assert.equal(catalog.filter(c=>c.precioReferencia===0).length,0);
  assert.equal(catalog.filter(c=>c.precioReferencia===null).length,36);
  assert.equal(validateCandidateCatalog(catalog).valid,true);
  // Fixed fingerprint of the ordered IDs of the audited pre-4B 250-card catalog.
  // Unlike reading Git HEAD at test time, this remains stable after future commits.
  assert.equal(createHash("sha256").update(JSON.stringify(catalog.slice(0,250).map(c=>c.id))).digest("hex"),"096f10f3fd1de0deee75b5580f242074af9572a47a8029b91097320e4b61634a");
  const added=catalog.slice(250);
  assert.equal(added.length,27);
  for(const card of added) assert.equal(card.id,generateCardId(card));
  const varane=added.find(c=>c.nombre==="Varane"&&c.ovr===86&&c.posicionPrincipal==="CB");
  assert(varane);
  assert.equal(varane.precioReferencia,null);
  assert.equal(varane.fuente.precioPrincipalRaw,"0");
});
