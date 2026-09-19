import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { pathToFileURL } from 'node:url';

const POSITIONS = new Set(['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST']);
const CARD_TYPES = new Set(['gold', 'special', 'unknown']);
const REPORTABLE_FIELDS = ['precioReferencia', 'popularidadFuente', 'ratingFuente', 'valorSecundarioFuente', 'fuente', 'futbin'];
const issue = (scope, code, message, details = {}) => ({ scope, code, message, ...details });

export function parseCatalogDocument(source, label = 'catalog') {
  if (typeof source !== 'string') throw new TypeError(label + ': el contenido no es texto');
  let clean = source.replace(/^\uFEFF/, '').trim();
  clean = clean.replace(/^(?:(?:\/\/[^\r\n]*(?:\r?\n|$))|(?:\/\*[\s\S]*?\*\/)|\s)*/, '');
  let metadata = null;
  const meta = clean.match(/^window\.PLAYERS_DATA_META\s*=\s*([\s\S]*?)\s*;\s*window\.PLAYERS_DATA\s*=\s*([\s\S]*?)\s*;\s*$/);
  const legacy = clean.match(/^window\.PLAYERS_DATA\s*=\s*([\s\S]*?)\s*;\s*$/);
  if (!meta && !legacy) throw new Error(label + ': falta una asignacion valida PLAYERS_DATA');
  try {
    if (meta) metadata = JSON.parse(meta[1]);
    const catalog = JSON.parse(meta ? meta[2] : legacy[1]);
    if (!Array.isArray(catalog)) throw new Error('window.PLAYERS_DATA debe ser un array');
    return { catalog, metadata };
  } catch (error) {
    throw new Error(label + ': contenido JSON invalido (' + error.message + ')');
  }
}

export function parseCatalogSource(source, label = 'catalog') {
  return parseCatalogDocument(source, label).catalog;
}

export function loadCatalogFile(filePath) {
  const resolved = path.resolve(filePath);
  return { path: resolved, ...parseCatalogDocument(fs.readFileSync(resolved, 'utf8'), resolved) };
}

function validateRecord(record, index, scope, errors, ids, playerIds, authoritative) {
  const add = (code, field, message, details = {}) => errors.push(issue(scope, code, message, {
    index, id: typeof record?.id === 'string' ? record.id : null, ...(field ? { field } : {}), ...details
  }));
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    add('invalid_record', null, 'El registro debe ser un objeto'); return;
  }
  if (typeof record.id !== 'string' || !record.id.trim()) add('missing_id', 'id', 'El ID esta vacio');
  else if (ids.has(record.id)) add('duplicate_id', 'id', 'ID duplicado: ' + record.id);
  else ids.add(record.id);
  if (typeof record.nombre !== 'string' || !record.nombre.trim()) add('invalid_name', 'nombre', 'El nombre esta vacio');
  if (!Number.isInteger(record.ovr) || record.ovr < 1 || record.ovr > 99) add('invalid_ovr', 'ovr', 'OVR invalido');
  if (!POSITIONS.has(record.posicionPrincipal)) add('invalid_position', 'posicionPrincipal', 'Posicion principal invalida');
  if (!Array.isArray(record.posiciones) || !record.posiciones.includes(record.posicionPrincipal) ||
      record.posiciones.some(position => !POSITIONS.has(position)) ||
      new Set(record.posiciones).size !== record.posiciones.length) add('invalid_positions', 'posiciones', 'Posiciones invalidas');
  const statKeys = record.posicionPrincipal === 'GK'
    ? ['div', 'han', 'kic', 'ref', 'spd', 'pos'] : ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];
  if (!record.stats || typeof record.stats !== 'object' || Array.isArray(record.stats) ||
      statKeys.some(key => authoritative
        ? !Number.isInteger(record.stats[key]) || record.stats[key] < 0 || record.stats[key] > 99
        : record.stats[key] !== null && (!Number.isInteger(record.stats[key]) || record.stats[key] < 0 || record.stats[key] > 99))) {
    add('invalid_stats', 'stats', 'Stats invalidas o incompletas');
  }
  if (!(authoritative ? ['L', 'R'] : ['L', 'R', null]).includes(record.pie)) add('invalid_foot', 'pie', 'Pie invalido');
  for (const field of ['skills', 'weakFoot']) if (authoritative
    ? !Number.isInteger(record[field]) || record[field] < 1 || record[field] > 5
    : record[field] !== null && (!Number.isInteger(record[field]) || record[field] < 1 || record[field] > 5)) {
    add('invalid_skill', field, field + ' invalido');
  }
  if (record.precioReferencia !== null &&
      (typeof record.precioReferencia !== 'number' || !Number.isFinite(record.precioReferencia) || record.precioReferencia <= 0)) {
    add('invalid_price', 'precioReferencia', 'precioReferencia debe ser null o mayor que cero');
  }
  for (const field of ['ratingFuente', 'popularidadFuente', 'valorSecundarioFuente']) {
    if (record[field] !== null && (typeof record[field] !== 'number' || !Number.isFinite(record[field]) || record[field] < 0)) {
      add('invalid_market_value', field, field + ' invalido');
    }
  }
  if (record.version !== null && typeof record.version !== 'string') add('invalid_version', 'version', 'version invalida');
  if (authoritative ? !CARD_TYPES.has(record.tipoCarta) :
      record.tipoCarta !== null && !CARD_TYPES.has(record.tipoCarta)) add('invalid_card_type', 'tipoCarta', 'tipoCarta invalido');
  if (record.activo !== true) add('invalid_active_flag', 'activo', 'activo debe ser true');
  if (!record.fuente || typeof record.fuente !== 'object' || Array.isArray(record.fuente)) add('invalid_source', 'fuente', 'fuente invalida');
  if (record.futbin) {
    const value = record.futbin;
    const valid = value.game === 27 && Number.isSafeInteger(value.playerId) && value.playerId > 0 &&
      typeof value.slug === 'string' && /^[^\s/?#]+$/.test(value.slug) &&
      value.url === 'https://www.futbin.com/27/player/' + value.playerId + '/' + value.slug;
    if (!valid) add('invalid_futbin', 'futbin', 'Metadata FUTBIN no canonica');
    else if (playerIds.has(value.playerId)) add('duplicate_futbin_player_id', 'futbin',
      'FUTBIN playerId repetido: ' + value.playerId, { otherIndex: playerIds.get(value.playerId) });
    else playerIds.set(value.playerId, index);
  }
}

function validateMetadata(metadata, candidate, errors) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    errors.push(issue('metadata', 'missing_authoritative_metadata', 'Falta PLAYERS_DATA_META')); return;
  }
  if (metadata.mode !== 'authoritative-snapshot') errors.push(issue('metadata', 'invalid_mode', 'Modo no autoritativo'));
  if (metadata.source !== 'FUTBIN') errors.push(issue('metadata', 'invalid_source', 'Fuente de snapshot invalida'));
  if (typeof metadata.snapshotFile !== 'string' || !metadata.snapshotFile.trim()) {
    errors.push(issue('metadata', 'missing_snapshot_file', 'Falta snapshotFile'));
  }
  if (!Number.isFinite(Date.parse(metadata.generatedAt))) errors.push(issue('metadata', 'invalid_generated_at', 'generatedAt invalido'));
  if (!Number.isInteger(metadata.parsedCards) || metadata.parsedCards <= 0) {
    errors.push(issue('metadata', 'invalid_parsed_cards', 'parsedCards debe ser mayor que cero'));
  }
  if (!Number.isInteger(metadata.acceptedCards) || metadata.acceptedCards <= 0) {
    errors.push(issue('metadata', 'invalid_accepted_cards', 'acceptedCards debe ser mayor que cero'));
  }
  if (metadata.acceptedCards !== candidate.length) {
    errors.push(issue('metadata', 'accepted_count_mismatch', 'acceptedCards no coincide con el candidato'));
  }
  if (Number.isInteger(metadata.parsedCards) && metadata.acceptedCards > metadata.parsedCards) {
    errors.push(issue('metadata', 'accepted_exceeds_parsed', 'acceptedCards supera parsedCards'));
  }
  if (Number.isInteger(metadata.parserCards) && metadata.parserCards !== metadata.parsedCards) {
    errors.push(issue('metadata', 'parser_count_mismatch', 'parserCards no coincide con parsedCards'));
  }
  if (Number.isInteger(metadata.parserSlots) && metadata.parserSlots < metadata.parsedCards) {
    errors.push(issue('metadata', 'slot_count_incoherent', 'parserSlots es menor que parsedCards'));
  }
  if (metadata.parsedCards > 0 && metadata.acceptedCards / metadata.parsedCards < 0.5) {
    errors.push(issue('metadata', 'unreasonable_parse_coverage', 'Menos de la mitad del snapshot fue aceptada'));
  }
  const counts = {
    goldCards: candidate.filter(record => record.tipoCarta === 'gold').length,
    specialCards: candidate.filter(record => record.tipoCarta === 'special').length,
    unknownCards: candidate.filter(record => record.tipoCarta === 'unknown').length
  };
  for (const [field, expected] of Object.entries(counts)) if (metadata[field] !== expected) {
    errors.push(issue('metadata', 'card_type_count_mismatch', field + ' no coincide', { field, expected, actual: metadata[field] }));
  }
}

export function validateFutbinCatalogs(current, candidate, metadata = null) {
  const errors = [], warnings = [];
  if (!Array.isArray(current)) errors.push(issue('current', 'catalog_not_array', 'El catalogo actual no es un array'));
  if (!Array.isArray(candidate)) errors.push(issue('candidate', 'catalog_not_array', 'El candidato no es un array'));
  if (!Array.isArray(current) || !Array.isArray(candidate)) {
    return { valid: false, hasChanges: null, mode: metadata?.mode ?? null, summary: null,
      errors, warnings, missingIds: [], newIds: [], changes: [] };
  }
  const authoritative = metadata?.mode === 'authoritative-snapshot';
  const currentIds = new Set(), candidateIds = new Set();
  validateRecordList(current, 'current', errors, currentIds, false);
  validateRecordList(candidate, 'candidate', errors, candidateIds, authoritative);
  if (!candidate.length) errors.push(issue('candidate', 'empty_candidate', 'El catalogo candidato esta vacio'));
  if (authoritative) validateMetadata(metadata, candidate, errors);

  const currentById = new Map(current.map(record => [record.id, record]));
  const candidateById = new Map(candidate.map(record => [record.id, record]));
  const missingIds = [...currentIds].filter(id => !candidateIds.has(id));
  const newIds = [...candidateIds].filter(id => !currentIds.has(id));
  const changes = [];
  for (const [id, previous] of currentById) {
    const next = candidateById.get(id);
    if (!next) continue;
    if (previous.futbin?.playerId && next.futbin?.playerId &&
        previous.futbin.playerId !== next.futbin.playerId) {
      errors.push(issue('candidate', 'id_reassigned_player_id',
        'Un ID interno no puede cambiar de FUTBIN playerId', { id }));
    }
    const fields = REPORTABLE_FIELDS.filter(field => !isDeepStrictEqual(previous[field], next[field]));
    if (fields.length) changes.push({ id, fields });
  }

  if (!authoritative) {
    for (const id of missingIds) errors.push(issue('candidate', 'missing_current_id', 'Falta el ID actual ' + id, { id }));
    const retained = candidate.map(record => record.id).filter(id => currentIds.has(id));
    if (!isDeepStrictEqual(retained, current.map(record => record.id))) {
      errors.push(issue('candidate', 'existing_order_changed', 'Los IDs actuales no conservan su orden relativo'));
    }
  } else if (current.length && missingIds.length / current.length >= 0.4) {
    warnings.push(issue('candidate', 'critical_catalog_replacement',
      'El snapshot elimina al menos 40% del catalogo anterior', {
        removed: missingIds.length, previous: current.length,
        percentRemoved: Math.round(missingIds.length / current.length * 1000) / 10
      }));
  }

  const summary = {
    mode: authoritative ? 'authoritative-snapshot' : 'legacy',
    currentCatalog: current.length, candidateCatalog: candidate.length,
    newCards: newIds.length, uniqueIds: candidateIds.size,
    withFutbin: candidate.filter(record => record?.futbin).length,
    withoutFutbin: candidate.filter(record => !record?.futbin).length,
    nullPrices: candidate.filter(record => record?.precioReferencia === null).length,
    zeroPrices: candidate.filter(record => record?.precioReferencia === 0).length,
    removedIds: missingIds.length, changedExisting: changes.length,
    goldCards: candidate.filter(record => record?.tipoCarta === 'gold').length,
    specialCards: candidate.filter(record => record?.tipoCarta === 'special').length,
    unknownCards: candidate.filter(record => record?.tipoCarta === 'unknown').length,
    excludedUnavailableTwins: authoritative ? metadata.excludedUnavailableTwins : 0,
    needsReview: authoritative ? metadata.needsReview : 0,
    validationErrors: errors.length, warnings: warnings.length
  };
  return { valid: errors.length === 0, hasChanges: !isDeepStrictEqual(current, candidate),
    mode: summary.mode, metadata, summary, errors, warnings, missingIds, newIds, changes };
}

function validateRecordList(catalog, scope, errors, ids, authoritative) {
  const playerIds = new Map();
  catalog.forEach((record, index) => validateRecord(record, index, scope, errors, ids, playerIds, authoritative));
}

export function validateCatalogFiles(currentPath, candidatePath) {
  const current = loadCatalogFile(currentPath);
  const candidate = loadCatalogFile(candidatePath);
  return { currentPath: current.path, candidatePath: candidate.path,
    ...validateFutbinCatalogs(current.catalog, candidate.catalog, candidate.metadata) };
}

function cliArguments(argv) {
  const options = { json: false };
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === '--json') options.json = true;
    else if (argument === '--current' || argument === '--candidate') {
      const value = argv[++index];
      if (!value) throw new Error('Falta el valor de ' + argument);
      options[argument.slice(2)] = value;
    } else throw new Error('Argumento desconocido: ' + argument);
  }
  if (!options.current || !options.candidate) throw new Error('Uso: --current <archivo> --candidate <archivo> [--json]');
  return options;
}

function printHuman(result) {
  if (result.summary) {
    console.log('Modo: ' + result.summary.mode);
    console.log('Catalogo actual: ' + result.summary.currentCatalog);
    console.log('Catalogo candidato: ' + result.summary.candidateCatalog);
    console.log('Eliminadas: ' + result.summary.removedIds);
    console.log('Nuevas: ' + result.summary.newCards);
    console.log('Errores: ' + result.summary.validationErrors);
  }
  for (const item of result.warnings || []) console.warn('[ADVERTENCIA ' + item.code + '] ' + item.message);
  for (const item of result.errors) console.error('[' + item.code + '] ' + item.message);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  let result;
  let json = process.argv.includes('--json');
  try {
    const options = cliArguments(process.argv.slice(2));
    json = options.json;
    result = validateCatalogFiles(options.current, options.candidate);
  } catch (caught) {
    result = { valid: false, hasChanges: null, summary: null, warnings: [],
      errors: [issue('input', 'catalog_load_failed', caught.message)], missingIds: [], newIds: [], changes: [] };
  }
  if (json) console.log(JSON.stringify(result, null, 2));
  else printHuman(result);
  process.exitCode = result.valid ? 0 : 2;
}
