// Pure comparison module: never mutates the catalog or snapshot.
const FIELD_STATS = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];
const GK_STATS = ['div', 'han', 'kic', 'ref', 'spd', 'pos'];
const MARKET_FIELDS = ['precioReferencia', 'valorSecundarioFuente', 'popularidadFuente', 'ratingFuente'];
const text = value => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
const number = value => value === null || value === undefined || (text(value) === '' && typeof value !== 'number')
  ? null : Number.isFinite(Number(value)) ? Number(value) : null;
const boundedInteger = (value, min, max) => {
  const n = number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};
const canonical = value => JSON.stringify(value, (_, item) =>
  item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);

export function normalizeIdentity(card) {
  const position = text(card?.posicionPrincipal).toUpperCase() || null;
  const foot = text(card?.pie).toUpperCase();
  const keys = position === 'GK' ? GK_STATS : FIELD_STATS;
  return {
    nombre: text(card?.nombre).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() || null,
    ovr: boundedInteger(card?.ovr, 1, 99),
    posicionPrincipal: position,
    stats: Object.fromEntries(keys.map(key => [key, boundedInteger(card?.stats?.[key], 0, 99)])),
    pie: ['L', 'R'].includes(foot) ? foot : null,
    skills: boundedInteger(card?.skills, 1, 5),
    weakFoot: boundedInteger(card?.weakFoot, 1, 5)
  };
}

export function structuralFingerprint(card) {
  return canonical(normalizeIdentity(card));
}

function identityComplete(identity) {
  return !!identity.nombre && identity.ovr !== null && !!identity.posicionPrincipal &&
    !!identity.pie && identity.skills !== null && identity.weakFoot !== null &&
    Object.values(identity.stats).every(value => value !== null);
}

function compareIdentity(a, b) {
  const flat = value => ({ nombre: value.nombre, ovr: value.ovr,
    posicionPrincipal: value.posicionPrincipal, pie: value.pie, skills: value.skills,
    weakFoot: value.weakFoot, ...Object.fromEntries(Object.entries(value.stats).map(([key, val]) => ['stats.' + key, val])) });
  const left = flat(a), right = flat(b), fieldsUsed = [], conflicts = [];
  for (const key of Object.keys(left)) {
    if (left[key] === null || right[key] === null || right[key] === undefined) continue;
    fieldsUsed.push(key);
    if (left[key] !== right[key]) conflicts.push({ field: key, catalog: right[key], snapshot: left[key] });
  }
  return { fieldsUsed, conflicts };
}

function playerId(card) {
  const value = card?.futbin?.playerId;
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

/** Commercial normalization. Source zero always becomes unavailable/null. */
export function normalizeSnapshotPrice(card) {
  const raw = card?.precioFuenteRaw ?? card?.precioReferenciaRaw ??
    (card?.precioReferencia == null ? null : String(card.precioReferencia));
  const value = number(card?.precioReferencia);
  const available = card?.precioDisponible !== false && text(raw) !== '0' && value !== null && value > 0;
  return { ...card, precioFuenteRaw: raw, precioDisponible: available,
    precioReferencia: available ? value : null };
}

/**
 * Only an equal exact playerId (or an identical no-link fingerprint) is a true
 * repeated snapshot occurrence. Different playerIds are always separate variants.
 */
export function detectSnapshotDuplicates(snapshot) {
  const buckets = new Map();
  snapshot.forEach((card, snapshotIndex) => {
    const id = playerId(card);
    const identity = normalizeIdentity(card);
    const key = id ? 'player:' + id : identityComplete(identity) ? 'fingerprint:' + canonical(identity) : null;
    if (!key) return;
    const values = buckets.get(key) || [];
    values.push(snapshotIndex);
    buckets.set(key, values);
  });
  return [...buckets.entries()].filter(([, indices]) => indices.length > 1)
    .map(([key, snapshotIndices], index) => ({
      groupId: 'snapshot-duplicate-' + index,
      status: 'SNAPSHOT_DUPLICATE',
      duplicateKind: key.startsWith('player:') ? 'same_player_id' : 'same_fingerprint_without_player_id',
      playerId: key.startsWith('player:') ? Number(key.slice(7)) : null,
      snapshotIndices,
      reason: key.startsWith('player:') ? 'repeated_player_id' : 'repeated_fingerprint_without_player_id',
      resolution: 'generator_consolidates_when_evidence_is_consistent'
    }));
}

export function marketDiff(current, snapshot) {
  const normalized = normalizeSnapshotPrice(snapshot);
  const diff = {};
  for (const field of MARKET_FIELDS) {
    const oldValue = number(current?.[field]);
    const newValue = field === 'precioReferencia' ? normalized.precioReferencia : number(normalized[field]);
    if (oldValue === newValue) continue;
    const delta = oldValue !== null && newValue !== null ? newValue - oldValue : null;
    diff[field] = { old: oldValue, new: newValue, delta,
      deltaPercent: delta !== null && oldValue !== 0 ? delta / oldValue * 100 : null };
  }
  return diff;
}

export function compareFutbinSnapshot(snapshot, catalog, metadata = {}) {
  if (!Array.isArray(snapshot) || !Array.isArray(catalog)) throw new TypeError('Snapshot y catálogo deben ser arrays.');
  if ([...snapshot, ...catalog].some(card => !card || typeof card !== 'object')) throw new TypeError('Registro de carta inválido.');

  const entries = catalog.map((record, index) => ({
    index, record, identity: normalizeIdentity(record), playerId: playerId(record)
  }));
  const duplicateGroups = detectSnapshotDuplicates(snapshot);
  const duplicateIndices = new Set(duplicateGroups.flatMap(group => group.snapshotIndices));

  const rows = snapshot.map((parserCard, snapshotIndex) => {
    const pdfCard = normalizeSnapshotPrice(parserCard);
    const identity = normalizeIdentity(pdfCard);
    const exactPlayerId = playerId(pdfCard);
    let possible;
    let priority;
    if (exactPlayerId) {
      possible = entries.filter(entry => entry.playerId === exactPlayerId);
      priority = 'futbin_player_id';
    } else if (pdfCard.futbin?.url) {
      possible = entries.filter(entry => entry.record.futbin?.url === pdfCard.futbin.url);
      priority = 'exact_futbin_url';
    } else {
      possible = entries.filter(entry => structuralFingerprint(entry.record) === canonical(identity));
      priority = 'structural_fingerprint';
    }
    const candidates = possible.map(entry => ({ catalogIndex: entry.index, record: entry.record,
      identity: entry.identity, ...compareIdentity(identity, entry.identity) }));
    const row = {
      snapshotIndex, status: null, identity, pdfCard, parserCard, currentRecord: null,
      catalogIndex: null, marketDiff: {}, matchReason: null, confidence: 'none',
      fieldsUsed: [], warnings: [...(pdfCard.warnings || [])], candidates
    };

    if (duplicateIndices.has(snapshotIndex)) {
      row.status = 'SNAPSHOT_DUPLICATE';
      row.matchReason = 'snapshot_duplicate';
    } else if (!identityComplete(identity) || pdfCard.parseStatus === 'ambiguous') {
      row.status = 'NEEDS_REVIEW';
      row.matchReason = Object.values(identity.stats).some(value => value === null)
        ? 'missing_stats_requires_reconciliation' : 'insufficient_identity';
    } else if (candidates.length > 1) {
      row.status = 'NEEDS_REVIEW';
      row.matchReason = 'multiple_candidates_at_' + priority;
    } else if (candidates.length === 1) {
      const candidate = candidates[0];
      row.catalogIndex = candidate.catalogIndex;
      row.currentRecord = candidate.record;
      row.fieldsUsed = candidate.fieldsUsed;
      row.matchReason = priority;
      row.confidence = 'high';
      row.marketDiff = marketDiff(candidate.record, pdfCard);
      row.status = Object.keys(row.marketDiff).length || candidate.conflicts.length ? 'UPDATED' : 'UNCHANGED';
      if (candidate.conflicts.length) row.warnings.push('structure_changed_for_exact_player_id');
      row.priceDecision = { old: number(candidate.record.precioReferencia),
        snapshot: pdfCard.precioReferencia, effective: pdfCard.precioReferencia,
        reason: pdfCard.precioDisponible ? 'available_snapshot_price' : 'snapshot_price_unavailable' };
    } else {
      row.status = 'NEW';
      row.matchReason = priority === 'structural_fingerprint' ? 'new_structural_identity' : 'new_futbin_identity';
    }
    return row;
  });

  const claimed = new Set(rows.flatMap(row => Number.isInteger(row.catalogIndex) ? [row.catalogIndex] : []));
  const notInCurrentSnapshot = entries.filter(entry => !claimed.has(entry.index)).map(entry => ({
    status: 'NOT_IN_CURRENT_SNAPSHOT', catalogIndex: entry.index, identity: entry.identity,
    currentRecord: entry.record, pdfCard: null, candidates: [], marketDiff: {},
    matchReason: 'not_observed_in_authoritative_snapshot', confidence: 'none', fieldsUsed: [],
    warnings: ['eligible_for_authoritative_removal']
  }));
  const groups = duplicateGroups.map(group => ({ ...group,
    occurrences: group.snapshotIndices.map(index => rows[index]) }));
  const unchanged = rows.filter(row => row.status === 'UNCHANGED');
  const updated = rows.filter(row => row.status === 'UPDATED');
  const added = rows.filter(row => row.status === 'NEW');
  const needsReview = rows.filter(row => row.status === 'NEEDS_REVIEW');
  return {
    metadata: {
      matcherVersion: '0.4.0', mode: 'authoritative-snapshot', ...metadata,
      comparedAt: new Date().toISOString(),
      identityPriority: ['futbin.playerId', 'exact FUTBIN URL', 'structural fingerprint', 'conservative fallback'],
      policy: 'The validated snapshot determines catalog membership. Raw zero is unavailable and never preserves an old market price.'
    },
    summary: {
      catalog: catalog.length, snapshot: snapshot.length,
      exactMatches: unchanged.length + updated.length,
      partialMatches: 0, unchanged: unchanged.length, updated: updated.length,
      new: added.length, notInCurrentSnapshot: notInCurrentSnapshot.length,
      needsReview: needsReview.length, snapshotDuplicates: duplicateIndices.size,
      snapshotDuplicateGroups: groups.length,
      unavailableZeroPrices: snapshot.filter(card => text(card.precioFuenteRaw ?? card.precioReferenciaRaw) === '0').length
    },
    snapshotRows: rows, unchanged, updated, new: added, notInCurrentSnapshot,
    needsReview, snapshotDuplicates: groups
  };
}
