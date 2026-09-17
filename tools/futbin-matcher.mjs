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

export function marketDiff(current, snapshot) {
  const diff = {};
  for (const field of MARKET_FIELDS) {
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
  const rows = snapshot.map((pdfCard, snapshotIndex) => {
    const identity = normalizeIdentity(pdfCard);
    const sameName = entries.filter(entry => identity.nombre && entry.identity.nombre === identity.nombre);
    // OVR changes separate versions. Same name/OVR structural conflicts need review.
    const possible = sameName.filter(entry => identity.ovr === null || entry.identity.ovr === null || entry.identity.ovr === identity.ovr);
    const candidates = possible.map(entry => ({ catalogIndex: entry.index, record: entry.record,
      identity: entry.identity, ...compareIdentity(identity, entry.identity) }));
    const compatible = candidates.filter(candidate => !candidate.conflicts.length);
    const row = { snapshotIndex, status: null, identity, pdfCard, currentRecord: null, catalogIndex: null,
      marketDiff: {}, matchReason: null, confidence: "none", fieldsUsed: [], warnings: [...(pdfCard.warnings || [])], candidates };
    const sufficient = identity.nombre && identity.ovr !== null && identity.posicionPrincipal;
    if (!sufficient || pdfCard.parseStatus === "ambiguous") {
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
    if (row.status === "NEEDS_REVIEW") for (const candidate of row.candidates) accounted.add(candidate.catalogIndex);
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
  return {
    metadata: { matcherVersion: "0.3.0", ...metadata, comparedAt: new Date().toISOString(),
      policy: "Preview only. Null is missing, zero is a value. Review candidates are not declared absent." },
    summary: { catalog: catalog.length, snapshot: snapshot.length,
      exactMatches: matched.filter(row => row.matchReason === "exact_identity").length,
      partialMatches: matched.filter(row => row.matchReason === "partial_identity").length,
      unchanged: unchanged.length, updated: updated.length, new: added.length,
      notInCurrentSnapshot: notInCurrentSnapshot.length, needsReview: needsReview.length },
    unchanged, updated, new: added, notInCurrentSnapshot, needsReview
  };
}

