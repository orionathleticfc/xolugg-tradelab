import { normalizeIdentity, normalizeSnapshotPrice } from "./futbin-matcher.mjs";

const MARKET_FIELDS = ["ratingFuente", "popularidadFuente", "precioReferencia", "valorSecundarioFuente"];
const SOURCE_FIELDS = ["paginaPdf", "precioPrincipalRaw", "valorSecundarioRaw", "importedAt", "snapshotFile"];
const POSITIONS = new Set(["GK", "CB", "LB", "RB", "LWB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "CF", "ST"]);
const clone = value => structuredClone(value);
const numeric = value => typeof value === "number" && Number.isFinite(value);
const canonical = value => JSON.stringify(value, (_, v) =>
  v && typeof v === "object" && !Array.isArray(v)
    ? Object.fromEntries(Object.keys(v).sort().map(key => [key, v[key]])) : v);
const same = (a, b) => canonical(a) === canonical(b);
const identityComplete = identity => identity.nombre && identity.ovr !== null &&
  POSITIONS.has(identity.posicionPrincipal) && identity.pie &&
  identity.skills !== null && identity.weakFoot !== null &&
  Object.values(identity.stats).every(value => value !== null);
const slug = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Stable structural ID. No prices, rank, file, timestamps or counters. */
export function generateCardId(card) {
  const identity = normalizeIdentity(card);
  const name = slug(identity.nombre);
  if (!name || !identityComplete(identity)) return null;
  return [name, identity.ovr, slug(identity.posicionPrincipal), ...Object.values(identity.stats),
    identity.pie.toLowerCase(), identity.skills, identity.weakFoot].join("-");
}

function structural(record) {
  const value = clone(record);
  for (const field of MARKET_FIELDS) delete value[field];
  if (value.fuente) for (const field of SOURCE_FIELDS) delete value.fuente[field];
  return value;
}

/** Validate the entire file, including pre-existing records, before export. */
export function validateCandidateCatalog(candidate, current = []) {
  const errors = [];
  if (!Array.isArray(candidate)) return { valid: false, errors: [{ code: "candidate_not_array" }] };
  const ids = new Set();
  const error = (index, code, field) => errors.push({ index, id: candidate[index]?.id ?? null, code, field });
  candidate.forEach((record, index) => {
    if (!record || typeof record !== "object") { error(index, "invalid_record"); return; }
    if (typeof record.id !== "string" || !record.id.trim()) error(index, "missing_id", "id");
    else if (ids.has(record.id)) error(index, "duplicate_id", "id");
    ids.add(record.id);
    if (typeof record.nombre !== "string" || !record.nombre.trim()) error(index, "missing_name", "nombre");
    if (!Number.isInteger(record.ovr) || record.ovr < 1 || record.ovr > 99) error(index, "invalid_ovr", "ovr");
    if (!POSITIONS.has(record.posicionPrincipal)) error(index, "invalid_position", "posicionPrincipal");
    if (!Array.isArray(record.posiciones) || record.posiciones.some(p => !POSITIONS.has(p)) ||
        new Set(record.posiciones).size !== record.posiciones.length ||
        !record.posiciones.includes(record.posicionPrincipal)) error(index, "invalid_positions", "posiciones");
    if (record.precioReferencia !== null && (!numeric(record.precioReferencia) || record.precioReferencia <= 0)) error(index, "invalid_price", "precioReferencia");
    const statKeys = record.posicionPrincipal === "GK" ? ["div", "han", "kic", "ref", "spd", "pos"] : ["pac", "sho", "pas", "dri", "def", "phy"];
    if (!record.stats || typeof record.stats !== "object" || Array.isArray(record.stats) ||
        statKeys.some(key => !(key in record.stats)) ||
        Object.values(record.stats).some(value => value !== null && (!numeric(value) || value < 0 || value > 99))) error(index, "invalid_stats", "stats");
    for (const field of ["skills", "weakFoot"]) if (record[field] !== null &&
      (!Number.isInteger(record[field]) || record[field] < 1 || record[field] > 5)) error(index, "invalid_skill", field);
    for (const field of ["ratingFuente", "popularidadFuente", "valorSecundarioFuente"]) if (record[field] !== null &&
      (!numeric(record[field]) || record[field] < 0)) error(index, "invalid_market_value", field);
    if (!["L", "R", null].includes(record.pie)) error(index, "invalid_foot", "pie");
    for (const field of ["version", "tipoCarta"]) if (record[field] !== null && typeof record[field] !== "string") error(index, "missing_schema_field", field);
    if (typeof record.activo !== "boolean") error(index, "invalid_active_flag", "activo");
    if (!record.fuente || typeof record.fuente !== "object" || Array.isArray(record.fuente)) error(index, "invalid_source", "fuente");
  });
  current.forEach((record, index) => {
    if (!candidate[index] || candidate[index].id !== record.id) error(index, "existing_id_or_order_changed", "id");
    else if (!same(structural(record), structural(candidate[index]))) error(index, "existing_structure_changed");
  });
  return { valid: errors.length === 0, errors };
}

function sourceValues(pdf, previous, metadata) {
  const source = clone(previous || {});
  if (Number.isInteger(pdf.sourcePage) && pdf.sourcePage > 0) source.paginaPdf = pdf.sourcePage;
  if (pdf.precioFuenteRaw !== null && pdf.precioFuenteRaw !== undefined) source.precioPrincipalRaw = String(pdf.precioFuenteRaw);
  if (pdf.valorSecundarioFuenteRaw !== null && pdf.valorSecundarioFuenteRaw !== undefined) source.valorSecundarioRaw = String(pdf.valorSecundarioFuenteRaw);
  source.importedAt = metadata.generatedAt;
  source.snapshotFile = metadata.snapshotFile;
  return source;
}

function changesBetween(previous, next) {
  const changes = {};
  for (const field of MARKET_FIELDS) if (!same(previous[field], next[field])) changes[field] = { old: previous[field], new: next[field] };
  for (const field of SOURCE_FIELDS) if (!same(previous.fuente?.[field], next.fuente?.[field])) {
    changes["fuente." + field] = { old: previous.fuente?.[field] ?? null, new: next.fuente?.[field] ?? null };
  }
  return changes;
}

/** Pure generation: candidate and report have no mutable links to either input. */
export function generateCandidateCatalog(current, comparison, options = {}) {
  if (!Array.isArray(current)) throw new TypeError("El catálogo debe ser un array.");
  for (const key of ["updated", "new", "unchanged", "notInCurrentSnapshot", "needsReview", "snapshotDuplicates"]) {
    if (!Array.isArray(comparison?.[key])) throw new TypeError("Comparación incompleta: " + key);
  }
  const metadata = {
    generatorVersion: "0.4.0", generatedAt: options.generatedAt ?? new Date().toISOString(),
    snapshotFile: comparison.metadata?.fileName ?? null,
    matcherVersion: comparison.metadata?.matcherVersion ?? null,
    policy: "Candidate only. Existing records retain order, IDs and structure; missing prices never replace current prices."
  };
  const candidateCatalog = clone(current);
  const report = {
    metadata, summary: {}, updatedApplied: [], newApplied: [],
    unchanged: clone(comparison.unchanged.map(row => ({ id: row.currentRecord?.id, catalogIndex: row.catalogIndex, snapshotIndex: row.snapshotIndex, status: "UNCHANGED" }))),
    preservedNotInSnapshot: clone(comparison.notInCurrentSnapshot.map(row => ({ id: row.currentRecord?.id, catalogIndex: row.catalogIndex, status: "PRESERVED_NOT_IN_SNAPSHOT" }))),
    skippedSnapshotDuplicates: comparison.snapshotDuplicates.map(group => ({
      status: "SKIPPED_SNAPSHOT_DUPLICATE", groupId: group.groupId,
      snapshotIndices: clone(group.snapshotIndices), reason: group.reason, evidence: clone(group)
    })),
    skippedNeedsReview: comparison.needsReview.map(row => ({
      status: "SKIPPED_NEEDS_REVIEW", snapshotIndex: row.snapshotIndex,
      nombre: row.pdfCard?.nombre ?? null, reason: row.matchReason, evidence: clone(row)
    })),
    generationNeedsReview: []
  };
  const review = (row, reason, extra = {}) => report.generationNeedsReview.push({
    status: "GENERATION_NEEDS_REVIEW", snapshotIndex: row.snapshotIndex,
    nombre: row.pdfCard?.nombre ?? null, reason, ...extra, evidence: clone(row)
  });
  const blockedSnapshots = new Set([
    ...comparison.snapshotDuplicates.flatMap(group => group.snapshotIndices),
    ...comparison.needsReview.map(row => row.snapshotIndex)
  ]);
  const blockedCatalog = new Set([
    ...comparison.unchanged.map(row => row.catalogIndex),
    ...comparison.notInCurrentSnapshot.map(row => row.catalogIndex),
    ...comparison.needsReview.flatMap(row => (row.candidates || []).map(c => c.catalogIndex)),
    ...comparison.snapshotDuplicates.flatMap(group => group.occurrences.flatMap(row => (row.candidates || []).map(c => c.catalogIndex)))
  ]);
  const updateClaims = new Map();
  for (const row of comparison.updated) updateClaims.set(row.catalogIndex, (updateClaims.get(row.catalogIndex) || 0) + 1);
  const snapshotClaims = new Map();
  for (const row of [...comparison.updated, ...comparison.new, ...comparison.unchanged]) {
    snapshotClaims.set(row.snapshotIndex, (snapshotClaims.get(row.snapshotIndex) || 0) + 1);
  }
  for (const row of comparison.updated) {
    const existing = current[row.catalogIndex];
    const pdf = normalizeSnapshotPrice(row.pdfCard || {});
    if (row.status !== "UPDATED" || row.matchReason !== "exact_identity" || row.confidence !== "high" ||
        !identityComplete(normalizeIdentity(pdf)) || !existing ||
        !same(normalizeIdentity(existing), normalizeIdentity(pdf))) {
      review(row, "unsafe_update_identity"); continue;
    }
    if (!same(existing, row.currentRecord)) { review(row, "stale_catalog_record"); continue; }
    if (blockedSnapshots.has(row.snapshotIndex) || blockedCatalog.has(row.catalogIndex) ||
        updateClaims.get(row.catalogIndex) !== 1 || snapshotClaims.get(row.snapshotIndex) !== 1) {
      review(row, "conflicting_update_claim"); continue;
    }
    const next = clone(existing);
    // Missing values provide no evidence for erasing existing market data.
    for (const field of ["ratingFuente", "popularidadFuente", "valorSecundarioFuente"]) {
      if (numeric(pdf[field]) && pdf[field] >= 0) next[field] = pdf[field];
    }
    if (pdf.precioDisponible) next.precioReferencia = pdf.precioReferencia;
    next.fuente = sourceValues(pdf, next.fuente, metadata);
    candidateCatalog[row.catalogIndex] = next;
    report.updatedApplied.push({ id: existing.id, nombre: existing.nombre,
      catalogIndex: row.catalogIndex, snapshotIndex: row.snapshotIndex,
      changedFields: Object.keys(changesBetween(existing, next)), changes: changesBetween(existing, next),
      pricePreserved: !pdf.precioDisponible });
  }
  const proposed = comparison.new.map(row => ({ row, id: generateCardId(row.pdfCard || {}) }));
  const proposedCounts = new Map();
  for (const entry of proposed) proposedCounts.set(entry.id, (proposedCounts.get(entry.id) || 0) + 1);
  const existingIds = new Set(current.map(record => record.id));
  const existingIdentities = new Set(current.map(record => canonical(normalizeIdentity(record))));
  for (const { row, id } of proposed) {
    if (row.status !== "NEW" || !id || row.pdfCard?.parseStatus === "ambiguous" ||
        blockedSnapshots.has(row.snapshotIndex) || snapshotClaims.get(row.snapshotIndex) !== 1) {
      review(row, "unsafe_new_identity"); continue;
    }
    if (existingIds.has(id) || proposedCounts.get(id) > 1) {
      review(row, "id_collision", { generatedId: id }); continue;
    }
    if (existingIdentities.has(canonical(normalizeIdentity(row.pdfCard)))) {
      review(row, "existing_structural_identity", { generatedId: id }); continue;
    }
    const pdf = normalizeSnapshotPrice(row.pdfCard);
    const identity = normalizeIdentity(pdf);
    const record = {
      id, nombre: pdf.nombre.trim(), version: pdf.version ?? null, tipoCarta: pdf.tipoCarta ?? null,
      ovr: identity.ovr, posicionPrincipal: identity.posicionPrincipal,
      posiciones: [...new Set([identity.posicionPrincipal, ...(pdf.posiciones || []).map(p => String(p).trim().toUpperCase())])],
      stats: clone(identity.stats), pie: identity.pie, skills: identity.skills, weakFoot: identity.weakFoot,
      ratingFuente: numeric(pdf.ratingFuente) ? pdf.ratingFuente : null,
      popularidadFuente: numeric(pdf.popularidadFuente) ? pdf.popularidadFuente : null,
      precioReferencia: pdf.precioDisponible ? pdf.precioReferencia : null,
      valorSecundarioFuente: numeric(pdf.valorSecundarioFuente) ? pdf.valorSecundarioFuente : null,
      fuente: sourceValues(pdf, { nombre: "FUTBIN" }, metadata), activo: true
    };
    const validation = validateCandidateCatalog([record]);
    if (!validation.valid) { review(row, "invalid_new_record", { generatedId: id, validationErrors: validation.errors }); continue; }
    candidateCatalog.push(record);
    report.newApplied.push({ generatedId: id, nombre: record.nombre, ovr: record.ovr,
      posicionPrincipal: record.posicionPrincipal, precioReferencia: record.precioReferencia,
      popularidadFuente: record.popularidadFuente, sourcePage: pdf.sourcePage ?? null, snapshotIndex: row.snapshotIndex });
  }
  const validation = validateCandidateCatalog(candidateCatalog, current);
  report.validation = clone(validation);
  report.summary = {
    currentCatalog: current.length, updatedApplied: report.updatedApplied.length,
    newApplied: report.newApplied.length, unchanged: report.unchanged.length,
    preservedNotInSnapshot: report.preservedNotInSnapshot.length,
    skippedSnapshotDuplicateGroups: report.skippedSnapshotDuplicates.length,
    skippedSnapshotDuplicateOccurrences: report.skippedSnapshotDuplicates.reduce((sum, group) => sum + group.snapshotIndices.length, 0),
    skippedNeedsReview: report.skippedNeedsReview.length,
    generationNeedsReview: report.generationNeedsReview.length,
    idCollisions: report.generationNeedsReview.filter(row => row.reason === "id_collision").length,
    candidateCatalogSize: candidateCatalog.length, validationErrors: validation.errors.length
  };
  return { candidateCatalog, report, validation, canExport: validation.valid };
}

export function serializeCandidateCatalog(candidate, current = []) {
  const validation = validateCandidateCatalog(candidate, current);
  if (!validation.valid) throw new Error("El catálogo candidato no supera la validación: " + validation.errors.map(e => e.code).join(", "));
  // Escapes make the generated source safe even if later embedded in an HTML script.
  const json = JSON.stringify(candidate, null, 2).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  return "// XoluGG — catálogo candidato para revisión.\nwindow.PLAYERS_DATA = " + json + ";\n";
}

