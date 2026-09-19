import { attachExactFutbinLinks, inspectUrl } from './futbin-links.mjs';
import { normalizeIdentity, normalizeSnapshotPrice, structuralFingerprint } from './futbin-matcher.mjs';

const CARD_TYPES = new Set(['gold', 'special', 'unknown']);
const POSITIONS = new Set(['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST']);
const MARKET_FIELDS = ['ratingFuente', 'popularidadFuente', 'precioReferencia', 'valorSecundarioFuente'];
const clone = value => structuredClone(value);
const numeric = value => typeof value === 'number' && Number.isFinite(value);
const canonical = value => JSON.stringify(value, (_, item) =>
  item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
const same = (a, b) => canonical(a) === canonical(b);
const slug = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const playerId = card => Number.isSafeInteger(card?.futbin?.playerId) && card.futbin.playerId > 0
  ? card.futbin.playerId : null;
const identityComplete = card => {
  const identity = normalizeIdentity(card);
  return !!identity.nombre && identity.ovr !== null && POSITIONS.has(identity.posicionPrincipal) &&
    !!identity.pie && identity.skills !== null && identity.weakFoot !== null &&
    Object.values(identity.stats).every(value => value !== null);
};

export function generateCardId(card) {
  const exact = playerId(card);
  if (exact) return 'futbin-27-' + exact;
  const identity = normalizeIdentity(card);
  const name = slug(identity.nombre);
  if (!name || !identityComplete(card)) return null;
  return [name, identity.ovr, slug(identity.posicionPrincipal), ...Object.values(identity.stats),
    identity.pie.toLowerCase(), identity.skills, identity.weakFoot].join('-');
}

function validFutbin(value) {
  if (!value || value.game !== 27 || !Number.isSafeInteger(value.playerId) || value.playerId <= 0 ||
      typeof value.slug !== 'string' || !/^[^\s/?#]+$/.test(value.slug)) return false;
  return value.url === 'https://www.futbin.com/27/player/' + value.playerId + '/' + value.slug &&
    inspectUrl(value.url).playerId === String(value.playerId);
}

function schemaErrors(candidate, metadata = null) {
  const errors = [];
  if (!Array.isArray(candidate)) return [{ code: 'candidate_not_array' }];
  if (!candidate.length) errors.push({ code: 'empty_candidate' });
  const ids = new Set(), playerIds = new Map();
  const add = (index, code, field, details = {}) =>
    errors.push({ index, id: candidate[index]?.id ?? null, code, field, ...details });
  candidate.forEach((record, index) => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      add(index, 'invalid_record'); return;
    }
    if (typeof record.id !== 'string' || !record.id.trim()) add(index, 'missing_id', 'id');
    else if (ids.has(record.id)) add(index, 'duplicate_id', 'id');
    else ids.add(record.id);
    if (typeof record.nombre !== 'string' || !record.nombre.trim()) add(index, 'invalid_name', 'nombre');
    if (!Number.isInteger(record.ovr) || record.ovr < 1 || record.ovr > 99) add(index, 'invalid_ovr', 'ovr');
    if (!POSITIONS.has(record.posicionPrincipal)) add(index, 'invalid_position', 'posicionPrincipal');
    if (!Array.isArray(record.posiciones) || !record.posiciones.includes(record.posicionPrincipal) ||
        record.posiciones.some(position => !POSITIONS.has(position)) ||
        new Set(record.posiciones).size !== record.posiciones.length) add(index, 'invalid_positions', 'posiciones');
    if (!record.stats || typeof record.stats !== 'object' || Array.isArray(record.stats) ||
        Object.values(record.stats).some(value => !Number.isInteger(value) || value < 0 || value > 99)) add(index, 'invalid_stats', 'stats');
    if (!['L', 'R'].includes(record.pie)) add(index, 'invalid_foot', 'pie');
    for (const field of ['skills', 'weakFoot']) if (!Number.isInteger(record[field]) || record[field] < 1 || record[field] > 5) {
      add(index, 'invalid_skill', field);
    }
    for (const field of MARKET_FIELDS) {
      const value = record[field];
      const allowNull = true;
      if (value !== null && (!numeric(value) || value < 0 || (field === 'precioReferencia' && value === 0))) {
        add(index, field === 'precioReferencia' ? 'invalid_price' : 'invalid_market_value', field);
      } else if (!allowNull && value === null) add(index, 'missing_market_value', field);
    }
    if (record.version !== null && typeof record.version !== 'string') add(index, 'invalid_version', 'version');
    if (metadata?.mode === 'authoritative-snapshot' && !CARD_TYPES.has(record.tipoCarta)) {
      add(index, 'invalid_card_type', 'tipoCarta');
    } else if (record.tipoCarta !== null && !CARD_TYPES.has(record.tipoCarta)) add(index, 'invalid_card_type', 'tipoCarta');
    if (record.activo !== true) add(index, 'invalid_active_flag', 'activo');
    if (!record.fuente || typeof record.fuente !== 'object' || Array.isArray(record.fuente)) add(index, 'invalid_source', 'fuente');
    if (record.futbin) {
      if (!validFutbin(record.futbin)) add(index, 'invalid_futbin', 'futbin');
      else if (playerIds.has(record.futbin.playerId)) add(index, 'duplicate_futbin_player_id', 'futbin', {
        otherIndex: playerIds.get(record.futbin.playerId)
      });
      else playerIds.set(record.futbin.playerId, index);
    }
  });
  if (metadata?.mode === 'authoritative-snapshot') {
    if (metadata.acceptedCards !== candidate.length) errors.push({ code: 'accepted_count_mismatch' });
    if (!metadata.snapshotFile || typeof metadata.snapshotFile !== 'string') errors.push({ code: 'missing_snapshot_file' });
    if (!Number.isFinite(Date.parse(metadata.generatedAt))) errors.push({ code: 'invalid_generated_at' });
    if (!Number.isInteger(metadata.parsedCards) || metadata.parsedCards <= 0) errors.push({ code: 'invalid_parsed_cards' });
  }
  return errors;
}

export function validateCandidateCatalog(candidate, current = [], metadata = null) {
  const errors = schemaErrors(candidate, metadata);
  return { valid: errors.length === 0, errors };
}

function rowsInSnapshotOrder(comparison) {
  if (Array.isArray(comparison.snapshotRows)) return [...comparison.snapshotRows].sort((a, b) => a.snapshotIndex - b.snapshotIndex);
  return [...comparison.updated, ...comparison.new, ...comparison.unchanged, ...comparison.needsReview,
    ...comparison.snapshotDuplicates.flatMap(group => group.occurrences)]
    .sort((a, b) => a.snapshotIndex - b.snapshotIndex);
}

function sourceValues(pdf, previous, metadata, marketChanged) {
  const source = clone(previous || {});
  source.nombre = 'FUTBIN';
  source.paginaPdf = Number.isInteger(pdf.sourcePage) ? pdf.sourcePage : null;
  source.precioPrincipalRaw = pdf.precioFuenteRaw == null ? null : String(pdf.precioFuenteRaw);
  source.valorSecundarioRaw = pdf.valorSecundarioFuenteRaw == null ? null : String(pdf.valorSecundarioFuenteRaw);
  source.snapshotFile = metadata.snapshotFile;
  source.snapshotObservedAt = metadata.snapshotObservedAt;
  source.importedAt = metadata.snapshotObservedAt;
  source.lastMarketChangedAt = marketChanged
    ? metadata.snapshotObservedAt
    : previous?.lastMarketChangedAt ?? previous?.importedAt ?? metadata.snapshotObservedAt;
  return source;
}

function currentMatch(current, card) {
  const exactId = playerId(card);
  let matches = exactId ? current.filter(record => playerId(record) === exactId) : [];
  if (exactId) return matches.length === 1 ? matches[0] : null;
  if (!matches.length && card.futbin?.url) matches = current.filter(record => record.futbin?.url === card.futbin.url);
  if (!matches.length) matches = current.filter(record => structuralFingerprint(record) === structuralFingerprint(card));
  return matches.length === 1 ? matches[0] : null;
}

function makeRecord(pdf, previous, id, metadata) {
  const normalized = normalizeSnapshotPrice(pdf);
  const identity = normalizeIdentity(normalized);
  const market = {
    ratingFuente: numeric(normalized.ratingFuente) ? normalized.ratingFuente : null,
    popularidadFuente: numeric(normalized.popularidadFuente) ? normalized.popularidadFuente : null,
    precioReferencia: normalized.precioReferencia,
    valorSecundarioFuente: numeric(normalized.valorSecundarioFuente) ? normalized.valorSecundarioFuente : null
  };
  const marketChanged = !previous || MARKET_FIELDS.some(field => !same(previous[field], market[field]));
  const record = {
    id, nombre: String(normalized.nombre).trim(), version: normalized.version ?? null,
    tipoCarta: CARD_TYPES.has(normalized.tipoCarta) ? normalized.tipoCarta : 'unknown',
    ovr: identity.ovr, posicionPrincipal: identity.posicionPrincipal,
    posiciones: [...new Set([identity.posicionPrincipal, ...(normalized.posiciones || [])
      .map(position => String(position).trim().toUpperCase())])],
    stats: clone(identity.stats), pie: identity.pie, skills: identity.skills, weakFoot: identity.weakFoot,
    ...market, fuente: sourceValues(normalized, previous?.fuente, metadata, marketChanged), activo: true
  };
  if (normalized.futbin && validFutbin(normalized.futbin)) record.futbin = clone(normalized.futbin);
  else if (previous?.futbin && validFutbin(previous.futbin)) record.futbin = clone(previous.futbin);
  return record;
}

function comparable(record) {
  if (!record) return null;
  const copy = clone(record);
  if (copy.fuente) {
    delete copy.fuente.importedAt;
    delete copy.fuente.snapshotObservedAt;
    delete copy.fuente.lastMarketChangedAt;
    delete copy.fuente.snapshotFile;
    delete copy.fuente.paginaPdf;
    delete copy.fuente.precioPrincipalRaw;
    delete copy.fuente.valorSecundarioRaw;
  }
  return copy;
}

export function generateCandidateCatalog(current, comparison, options = {}) {
  if (!Array.isArray(current)) throw new TypeError('El catálogo debe ser un array.');
  const rows = rowsInSnapshotOrder(comparison);
  const baseCards = rows.map(row => row.pdfCard || row.parserCard);
  const linkedCards = attachExactFutbinLinks(baseCards, options.linksDiagnostic);
  linkedCards.forEach((card, index) => { linkedCards[index] = normalizeSnapshotPrice(card); });

  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const snapshotObservedAt = options.snapshotObservedAt ?? comparison.metadata?.extractedAt ?? generatedAt;
  const metadata = {
    mode: 'authoritative-snapshot', source: 'FUTBIN', generatorVersion: '1.0.0',
    matcherVersion: comparison.metadata?.matcherVersion ?? null,
    snapshotFile: comparison.metadata?.fileName ?? null, generatedAt, snapshotObservedAt,
    parsedCards: rows.length, acceptedCards: 0, excludedUnavailableTwins: 0,
    needsReview: 0, goldCards: 0, specialCards: 0, unknownCards: 0,
    parserCards: comparison.metadata?.parserMetrics?.cards ?? rows.length,
    parserSlots: comparison.metadata?.parserMetrics?.slots ?? rows.length
  };
  const report = {
    mode: metadata.mode, previousCatalogSize: current.length, snapshotParsed: rows.length,
    candidateCatalogSize: 0, removedFromPreviousCatalog: { count: 0, ids: [] },
    newCards: [], updatedCards: [], unchangedCards: [], goldCards: 0, specialCards: 0,
    unknownCards: 0, nullPriceCards: 0, excludedUnavailableTwins: [],
    snapshotDuplicateGroups: [], needsReview: [], idCollisions: [],
    validationErrors: [], futbinLinksApplied: 0, futbinLinksPreserved: 0,
    safetyWarnings: [], metadata
  };

  const excluded = new Set();
  const acceptedIndices = new Set(rows.map((_, index) => index));

  // Consolidate exact repeated playerIds. Conflicting structures fail closed.
  const byPlayer = new Map();
  linkedCards.forEach((card, index) => {
    const id = playerId(card);
    if (!id) return;
    const values = byPlayer.get(id) || [];
    values.push(index); byPlayer.set(id, values);
  });
  for (const [id, indices] of byPlayer) {
    if (indices.length < 2) continue;
    const fingerprints = new Set(indices.map(index => structuralFingerprint(linkedCards[index])));
    const group = { playerId: id, snapshotIndices: indices, resolution: null };
    if (fingerprints.size > 1) {
      group.resolution = 'NEEDS_REVIEW_CONFLICTING_PLAYER_ID';
      for (const index of indices) acceptedIndices.delete(index);
      report.needsReview.push({ reason: 'same_player_id_structural_conflict', snapshotIndices: indices, playerId: id });
    } else {
      const priced = indices.filter(index => linkedCards[index].precioDisponible);
      const keep = priced[0] ?? indices[0];
      for (const index of indices) if (index !== keep) {
        acceptedIndices.delete(index); excluded.add(index);
      }
      group.resolution = 'CONSOLIDATED';
      group.keptSnapshotIndex = rows[keep].snapshotIndex;
    }
    report.snapshotDuplicateGroups.push(group);
  }

  const noLinkFingerprints = new Map();
  linkedCards.forEach((card, index) => {
    if (playerId(card)) return;
    const key = structuralFingerprint(card);
    const values = noLinkFingerprints.get(key) || [];
    values.push(index); noLinkFingerprints.set(key, values);
  });
  for (const indices of noLinkFingerprints.values()) if (indices.length > 1) {
    for (const index of indices) acceptedIndices.delete(index);
    report.needsReview.push({ reason: 'repeated_fingerprint_without_exact_player_id',
      snapshotIndices: indices.map(index => rows[index].snapshotIndex) });
    report.snapshotDuplicateGroups.push({ playerId: null, snapshotIndices: indices,
      resolution: 'NEEDS_REVIEW_NO_EXACT_PLAYER_ID' });
  }

  // Parser ambiguity or incomplete structural identity never becomes a guessed record.
  for (const index of [...acceptedIndices]) {
    const card = linkedCards[index];
    if (!identityComplete(card) || card.parseStatus === 'ambiguous') {
      acceptedIndices.delete(index);
      report.needsReview.push({ reason: 'incomplete_or_ambiguous_identity',
        snapshotIndex: rows[index].snapshotIndex, nombre: card.nombre ?? null });
    }
  }

  // Equivalent transfer twins: one market variant wins; unavailable twins are excluded.
  const twinBuckets = new Map();
  for (const index of acceptedIndices) {
    const card = linkedCards[index];
    const id = playerId(card);
    if (!id) continue;
    const key = structuralFingerprint(card) + '|' + card.tipoCarta;
    const values = twinBuckets.get(key) || [];
    values.push(index); twinBuckets.set(key, values);
  }
  for (const indices of twinBuckets.values()) {
    if (indices.length < 2 || new Set(indices.map(index => playerId(linkedCards[index]))).size < 2) continue;
    const priced = indices.filter(index => linkedCards[index].precioDisponible);
    const unavailable = indices.filter(index => !linkedCards[index].precioDisponible &&
      String(linkedCards[index].precioFuenteRaw) === '0');
    if (priced.length === 1 && unavailable.length === indices.length - 1) {
      for (const index of unavailable) {
        acceptedIndices.delete(index);
        report.excludedUnavailableTwins.push({
          snapshotIndex: rows[index].snapshotIndex, keptSnapshotIndex: rows[priced[0]].snapshotIndex,
          excludedPlayerId: playerId(linkedCards[index]), keptPlayerId: playerId(linkedCards[priced[0]]),
          nombre: linkedCards[index].nombre, fingerprint: structuralFingerprint(linkedCards[index]),
          reason: 'equivalent_raw_zero_variant_has_one_available_market_twin'
        });
      }
    } else if (priced.length === 0) {
      for (const index of indices) acceptedIndices.delete(index);
      report.needsReview.push({ reason: 'equivalent_variants_all_unavailable',
        snapshotIndices: indices.map(index => rows[index].snapshotIndex),
        playerIds: indices.map(index => playerId(linkedCards[index])) });
    }
  }

  const candidateCatalog = [];
  const usedIds = new Set();
  for (const index of [...acceptedIndices].sort((a, b) => rows[a].snapshotIndex - rows[b].snapshotIndex)) {
    const pdf = linkedCards[index];
    const previous = currentMatch(current, pdf);
    const id = previous?.id ?? generateCardId(pdf);
    if (!id || usedIds.has(id)) {
      report.idCollisions.push({ snapshotIndex: rows[index].snapshotIndex, generatedId: id,
        playerId: playerId(pdf), nombre: pdf.nombre });
      continue;
    }
    const record = makeRecord(pdf, previous, id, metadata);
    const errors = schemaErrors([record]);
    if (errors.length) {
      report.needsReview.push({ reason: 'invalid_generated_record', snapshotIndex: rows[index].snapshotIndex,
        nombre: pdf.nombre, errors });
      continue;
    }
    usedIds.add(id);
    candidateCatalog.push(record);
    if (!previous) report.newCards.push({ id, snapshotIndex: rows[index].snapshotIndex,
      nombre: record.nombre, playerId: playerId(record) });
    else if (same(comparable(previous), comparable(record))) report.unchangedCards.push({
      id, snapshotIndex: rows[index].snapshotIndex, nombre: record.nombre
    });
    else report.updatedCards.push({ id, snapshotIndex: rows[index].snapshotIndex,
      nombre: record.nombre, playerId: playerId(record) });
    if (pdf.futbin) {
      if (previous?.futbin && same(previous.futbin, pdf.futbin)) report.futbinLinksPreserved++;
      else report.futbinLinksApplied++;
    }
  }

  const candidateIds = new Set(candidateCatalog.map(record => record.id));
  report.removedFromPreviousCatalog.ids = current.filter(record => !candidateIds.has(record.id)).map(record => record.id);
  report.removedFromPreviousCatalog.count = report.removedFromPreviousCatalog.ids.length;
  report.candidateCatalogSize = candidateCatalog.length;
  report.goldCards = candidateCatalog.filter(record => record.tipoCarta === 'gold').length;
  report.specialCards = candidateCatalog.filter(record => record.tipoCarta === 'special').length;
  report.unknownCards = candidateCatalog.filter(record => record.tipoCarta === 'unknown').length;
  report.nullPriceCards = candidateCatalog.filter(record => record.precioReferencia === null).length;

  Object.assign(metadata, {
    acceptedCards: candidateCatalog.length,
    excludedUnavailableTwins: report.excludedUnavailableTwins.length,
    needsReview: report.needsReview.length,
    goldCards: report.goldCards, specialCards: report.specialCards, unknownCards: report.unknownCards
  });

  if (rows.length && candidateCatalog.length / rows.length < 0.5) {
    report.safetyWarnings.push({ level: 'critical', code: 'low_snapshot_acceptance',
      accepted: candidateCatalog.length, parsed: rows.length });
  }
  if (current.length && candidateCatalog.length < current.length * 0.6) {
    report.safetyWarnings.push({ level: 'critical', code: 'large_catalog_drop',
      previous: current.length, candidate: candidateCatalog.length,
      percentRemoved: Math.round(report.removedFromPreviousCatalog.count / current.length * 1000) / 10 });
  }

  const validation = validateCandidateCatalog(candidateCatalog, current, metadata);
  if (report.idCollisions.length) validation.errors.push({ code: 'generation_id_collisions',
    count: report.idCollisions.length });
  if (!rows.length) validation.errors.push({ code: 'empty_parsed_snapshot' });
  validation.valid = validation.errors.length === 0;
  report.validationErrors = clone(validation.errors);
  report.summary = {
    mode: metadata.mode, previousCatalogSize: current.length, snapshotParsed: rows.length,
    candidateCatalogSize: candidateCatalog.length, removedFromPreviousCatalog: report.removedFromPreviousCatalog.count,
    newCards: report.newCards.length, updatedCards: report.updatedCards.length,
    unchangedCards: report.unchangedCards.length, goldCards: report.goldCards,
    specialCards: report.specialCards, unknownCards: report.unknownCards,
    nullPriceCards: report.nullPriceCards, excludedUnavailableTwins: report.excludedUnavailableTwins.length,
    snapshotDuplicateGroups: report.snapshotDuplicateGroups.length, needsReview: report.needsReview.length,
    idCollisions: report.idCollisions.length, validationErrors: validation.errors.length,
    futbinLinksApplied: report.futbinLinksApplied, futbinLinksPreserved: report.futbinLinksPreserved
  };
  return { candidateCatalog, metadata, report, validation, canExport: validation.valid };
}

export function serializeCandidateCatalog(candidate, current = [], metadata = null) {
  const meta = metadata ?? {
    mode: 'authoritative-snapshot', source: 'FUTBIN', snapshotFile: 'unspecified',
    generatedAt: new Date().toISOString(), parsedCards: candidate.length,
    acceptedCards: candidate.length, excludedUnavailableTwins: 0, needsReview: 0,
    goldCards: candidate.filter(card => card.tipoCarta === 'gold').length,
    specialCards: candidate.filter(card => card.tipoCarta === 'special').length,
    unknownCards: candidate.filter(card => card.tipoCarta === 'unknown').length
  };
  const validation = validateCandidateCatalog(candidate, current, meta);
  if (!validation.valid) throw new Error('El catálogo candidato no supera la validación: ' +
    validation.errors.map(error => error.code).join(', '));
  const safe = value => JSON.stringify(value, null, 2).replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return '// XoluGG — authoritative Popular snapshot.\nwindow.PLAYERS_DATA_META = ' +
    safe(meta) + ';\nwindow.PLAYERS_DATA = ' + safe(candidate) + ';\n';
}
