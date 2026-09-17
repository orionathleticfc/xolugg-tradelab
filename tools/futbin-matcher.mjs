// Pure comparison module: never mutates the catalog or snapshot.
const FIELD_STATS = ["pac", "sho", "pas", "dri", "def", "phy"];
const GK_STATS = ["div", "han", "kic", "ref", "spd", "pos"];
const MARKET_FIELDS = ["precioReferencia", "valorSecundarioFuente", "popularidadFuente", "ratingFuente"];
const BASE_FIELDS = ["nombre", "ovr", "posicionPrincipal", "pie", "skills", "weakFoot"];
const text = value => typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
const number = value => value === null || value === undefined || text(value) === "" && typeof value !== "number"
  ? null : Number.isFinite(Number(value)) ? Number(value) : null;
const boundedInteger = (value, min, max) => {
  const n = number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};

export function normalizeIdentity(card) {
  const position = text(card.posicionPrincipal).toUpperCase() || null;
  const foot = text(card.pie).toUpperCase();
  const keys = position === "GK" ? GK_STATS : FIELD_STATS;
  return {
    nombre: text(card.nombre).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || null,
    ovr: boundedInteger(card.ovr, 1, 99),
    posicionPrincipal: position,
    stats: Object.fromEntries(keys.map(key => [key, boundedInteger(card.stats?.[key], 0, 99)])),
    pie: ["L", "R"].includes(foot) ? foot : null,
    skills: boundedInteger(card.skills, 1, 5),
    weakFoot: boundedInteger(card.weakFoot, 1, 5)
  };
}
function flat(identity) {
  return { ...Object.fromEntries(BASE_FIELDS.map(key => [key, identity[key]])),
    ...Object.fromEntries(Object.entries(identity.stats).map(([key, value]) => ["stats." + key, value])) };
}
function full(identity) { return Object.values(flat(identity)).every(value => value !== null); }
function compareIdentity(a, b) {
  const left = flat(a), right = flat(b);
  const fieldsUsed = [], conflicts = [];
  for (const key of Object.keys(left)) {
    if (left[key] === null || right[key] === null || right[key] === undefined) continue;
    fieldsUsed.push(key);
    if (left[key] !== right[key]) conflicts.push({ field: key, catalog: right[key], snapshot: left[key] });
  }
  return { fieldsUsed, conflicts };
}


/** Commercial view only; original parser cards/tokens remain untouched. */
export function normalizeSnapshotPrice(card) {
  const raw = card.precioFuenteRaw ?? card.precioReferenciaRaw ??
    (card.precioReferencia == null ? null : String(card.precioReferencia));
  const value = number(card.precioReferencia);
  const available = card.precioDisponible !== false && text(raw) !== "0" && value !== null && value > 0;
  return { ...card, precioFuenteRaw: raw, precioDisponible: available,
    precioReferencia: available ? value : null };
}

/** Groups are unresolved evidence, never a merged or selected canonical card. */
export function detectSnapshotDuplicates(snapshot) {
  const identities = snapshot.map(normalizeIdentity);
  const parents = snapshot.map((_, index) => index);
  const root = index => { while (parents[index] !== index) index = parents[index]; return index; };
  for (let i = 0; i < snapshot.length; i++) for (let j = i + 1; j < snapshot.length; j++) {
    const a = identities[i], b = identities[j];
    if (!BASE_FIELDS.every(key => a[key] !== null && a[key] === b[key])) continue;
    if (full(a) && full(b) && compareIdentity(a, b).conflicts.length) continue;
    parents[root(j)] = root(i);
  }
  const groups = new Map();
  snapshot.forEach((_, index) => { const key = root(index); const list = groups.get(key) || []; list.push(index); groups.set(key, list); });
  return [...groups.values()].filter(indices => indices.length > 1).map((indices, index) => {
    const structuralConflicts = [], marketConflicts = [];
    for (let a = 0; a < indices.length; a++) for (let b = a + 1; b < indices.length; b++) {
      const first = indices[a], second = indices[b];
      const conflicts = compareIdentity(identities[first], identities[second]).conflicts;
      if (conflicts.length) structuralConflicts.push({ indices: [first, second], conflicts });
      // Compare original source values, including zero, without price-preservation policy.
      const fields = MARKET_FIELDS.filter(field => number(snapshot[first][field]) !== number(snapshot[second][field]));
      if (fields.length) marketConflicts.push({ indices: [first, second], fields });
    }
    return { groupId: "snapshot-duplicate-" + index, status: "SNAPSHOT_DUPLICATE",
      identity: identities[indices[0]], snapshotIndices: indices,
      reason: structuralConflicts.length ? "partial_bridge_structural_conflict" :
        marketConflicts.length ? "duplicate_identity_market_conflict" :
        indices.some(i => !full(identities[i])) ? "complete_partial_candidate" : "repeated_strong_identity",
      structuralConflicts, marketConflicts, resolution: "manual_review_required" };
  });
}

export function marketDiff(current, snapshot) {
  snapshot = normalizeSnapshotPrice(snapshot);
  const diff = {};
  for (const field of MARKET_FIELDS) {
    if (field === 'precioReferencia' && !snapshot.precioDisponible) continue;
    const oldValue = number(current[field]), newValue = number(snapshot[field]);
    if (oldValue === newValue) continue;
    const delta = oldValue !== null && newValue !== null ? newValue - oldValue : null;
    diff[field] = { old: oldValue, new: newValue, delta,
      deltaPercent: delta !== null && oldValue !== 0 ? delta / oldValue * 100 : null };
  }
  return diff;
}

export function compareFutbinSnapshot(snapshot, catalog, metadata = {}) {
  if (!Array.isArray(snapshot) || !Array.isArray(catalog)) throw new TypeError("Snapshot y catálogo deben ser arrays.");
  if ([...snapshot, ...catalog].some(card => !card || typeof card !== "object")) throw new TypeError("Registro de carta inválido.");
  const entries = catalog.map((record, index) => ({ index, record, identity: normalizeIdentity(record) }));
  const duplicateGroups = detectSnapshotDuplicates(snapshot);
  const duplicateIndices = new Set(duplicateGroups.flatMap(group => group.snapshotIndices));
  const rows = snapshot.map((parserCard, snapshotIndex) => {
    const pdfCard = normalizeSnapshotPrice(parserCard);
    const identity = normalizeIdentity(pdfCard);
    const sameName = entries.filter(entry => identity.nombre && entry.identity.nombre === identity.nombre);
    // OVR changes separate versions. Same name/OVR structural conflicts need review.
    const possible = sameName.filter(entry => identity.ovr === null || entry.identity.ovr === null || entry.identity.ovr === identity.ovr);
    const candidates = possible.map(entry => ({ catalogIndex: entry.index, record: entry.record,
      identity: entry.identity, ...compareIdentity(identity, entry.identity) }));
    const compatible = candidates.filter(candidate => !candidate.conflicts.length);
    const row = { snapshotIndex, status: null, identity, pdfCard, parserCard, currentRecord: null, catalogIndex: null,
      marketDiff: {}, matchReason: null, confidence: "none", fieldsUsed: [], warnings: [...(pdfCard.warnings || [])], candidates };
    const sufficient = identity.nombre && identity.ovr !== null && identity.posicionPrincipal;
    if (duplicateIndices.has(snapshotIndex)) {
      row.status = "SNAPSHOT_DUPLICATE"; row.matchReason = "snapshot_duplicate";
    } else if (Object.values(identity.stats).some(value => value === null)) {
      row.status = "NEEDS_REVIEW"; row.matchReason = "missing_stats_requires_reconciliation";
    } else if (!sufficient || pdfCard.parseStatus === "ambiguous") {
      row.status = "NEEDS_REVIEW"; row.matchReason = "insufficient_identity";
    } else if (compatible.length > 1) {
      row.status = "NEEDS_REVIEW"; row.matchReason = "multiple_candidates";
    } else if (compatible.length === 1) {
      const candidate = compatible[0];
      row.catalogIndex = candidate.catalogIndex;
      row.currentRecord = candidate.record;
      row.fieldsUsed = candidate.fieldsUsed;
      row.matchReason = full(identity) && full(candidate.identity) ? "exact_identity" : "partial_identity";
      row.confidence = row.matchReason === "exact_identity" ? "high" : "medium";
      row.marketDiff = marketDiff(candidate.record, pdfCard);
      row.priceDecision = { old: number(candidate.record.precioReferencia), snapshot: pdfCard.precioReferencia,
        effective: pdfCard.precioDisponible ? pdfCard.precioReferencia : number(candidate.record.precioReferencia),
        reason: pdfCard.precioDisponible ? "available_snapshot_price" : "preserve_current_price_unavailable_source" };
      if (!pdfCard.precioDisponible) row.warnings.push("source_price_unavailable_current_preserved");
      row.status = Object.keys(row.marketDiff).length ? "UPDATED" : "UNCHANGED";
      const positions = card => [...new Set((card.posiciones || []).map(p => text(p).toUpperCase()))].sort();
      if (JSON.stringify(positions(candidate.record)) !== JSON.stringify(positions(pdfCard))) row.warnings.push("alternative_positions_differ");
      if (MARKET_FIELDS.some(field => number(pdfCard[field]) === null && number(candidate.record[field]) !== null)) row.warnings.push("missing_snapshot_market_value");
    } else if (candidates.length) {
      row.status = "NEEDS_REVIEW"; row.matchReason = "structural_conflict";
    } else {
      row.status = "NEW"; row.matchReason = sameName.length ? "different_ovr_version" : "no_reasonable_candidate";
    }
    return row;
  });
  // Do not silently attach two PDF records to the same catalog entry.
  const claims = new Map();
  for (const row of rows) if (row.catalogIndex !== null) {
    const owners = claims.get(row.catalogIndex) || []; owners.push(row); claims.set(row.catalogIndex, owners);
  }
  for (const owners of claims.values()) if (owners.length > 1) for (const row of owners) {
    row.status = "NEEDS_REVIEW"; row.matchReason = "duplicate_snapshot_candidate";
    row.confidence = "none"; row.marketDiff = {}; row.currentRecord = null; row.catalogIndex = null;
    row.warnings.push("catalog_candidate_claimed_more_than_once");
  }
  // A candidate under review cannot be declared absent from this snapshot.
  const accounted = new Set();
  for (const row of rows) {
    if (row.catalogIndex !== null) accounted.add(row.catalogIndex);
    if (["NEEDS_REVIEW", "SNAPSHOT_DUPLICATE"].includes(row.status)) for (const candidate of row.candidates) accounted.add(candidate.catalogIndex);
  }
  const notInCurrentSnapshot = entries.filter(entry => !accounted.has(entry.index)).map(entry => ({
    status: "NOT_IN_CURRENT_SNAPSHOT", catalogIndex: entry.index, identity: entry.identity,
    currentRecord: entry.record, pdfCard: null, candidates: [], marketDiff: {},
    matchReason: "not_observed_in_snapshot", confidence: "none", fieldsUsed: [],
    warnings: ["not_a_deletion"]
  }));
  const unchanged = rows.filter(row => row.status === "UNCHANGED");
  const updated = rows.filter(row => row.status === "UPDATED");
  const added = rows.filter(row => row.status === "NEW");
  const needsReview = rows.filter(row => row.status === "NEEDS_REVIEW");
  const matched = [...unchanged, ...updated];
  const snapshotDuplicates = duplicateGroups.map(group => ({ ...group, occurrences: group.snapshotIndices.map(index => rows[index]) }));
  return {
    metadata: { matcherVersion: "0.3.1", ...metadata, comparedAt: new Date().toISOString(),
      policy: "Preview only. Raw zero means unavailable price; retain current price. Duplicate occurrences are exclusively grouped for manual review. Indices are zero-based." },
    summary: { catalog: catalog.length, snapshot: snapshot.length,
      exactMatches: matched.filter(row => row.matchReason === "exact_identity").length,
      partialMatches: matched.filter(row => row.matchReason === "partial_identity").length,
      unchanged: unchanged.length, updated: updated.length, new: added.length,
      notInCurrentSnapshot: notInCurrentSnapshot.length, needsReview: needsReview.length,
      snapshotDuplicates: duplicateIndices.size, snapshotDuplicateGroups: snapshotDuplicates.length,
      unavailableZeroPrices: snapshot.filter(card => number(card.precioReferencia) === 0 || text(card.precioFuenteRaw ?? card.precioReferenciaRaw) === "0").length },
    unchanged, updated, new: added, notInCurrentSnapshot, needsReview, snapshotDuplicates
  };
}

