import fs from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { pathToFileURL } from "node:url";

const POSITIONS = new Set(["GK", "CB", "LB", "RB", "LWB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "CF", "ST"]);
const STRUCTURAL_FIELDS = ["id", "nombre", "version", "tipoCarta", "ovr", "posicionPrincipal", "posiciones", "stats", "pie", "skills", "weakFoot", "activo"];
const REPORTABLE_FIELDS = ["precioReferencia", "popularidadFuente", "ratingFuente", "valorSecundarioFuente", "fuente", "futbin"];

function error(scope, code, message, details = {}) {
  return { scope, code, message, ...details };
}

export function parseCatalogSource(source, label = "catalog") {
  if (typeof source !== "string") throw new TypeError(`${label}: el contenido no es texto`);
  const clean = source.replace(/^\uFEFF/, "");
  const assignment = clean.match(/^\s*(?:(?:\/\/[^\r\n]*(?:\r?\n|$))|(?:\/\*[\s\S]*?\*\/))*\s*window\.PLAYERS_DATA\s*=\s*([\s\S]*?)\s*;\s*$/);
  if (!assignment) throw new Error(`${label}: falta una asignacion unica window.PLAYERS_DATA = [...]`);
  let catalog;
  try {
    catalog = JSON.parse(assignment[1]);
  } catch (parseError) {
    throw new Error(`${label}: PLAYERS_DATA no contiene JSON valido (${parseError.message})`);
  }
  if (!Array.isArray(catalog)) throw new Error(`${label}: window.PLAYERS_DATA debe ser un array`);
  return catalog;
}

export function loadCatalogFile(filePath) {
  const resolved = path.resolve(filePath);
  return { path: resolved, catalog: parseCatalogSource(fs.readFileSync(resolved, "utf8"), resolved) };
}

function validateRecord(record, index, scope, errors, ids) {
  const add = (code, field, message) => errors.push(error(scope, code, message, {
    index, id: typeof record?.id === "string" ? record.id : null, ...(field ? { field } : {})
  }));
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    add("invalid_record", null, "El registro debe ser un objeto");
    return;
  }
  if (typeof record.id !== "string" || !record.id.trim()) add("missing_id", "id", "El ID esta vacio");
  else if (ids.has(record.id)) add("duplicate_id", "id", `ID duplicado: ${record.id}`);
  else ids.add(record.id);
  if (typeof record.nombre !== "string" || !record.nombre.trim()) add("invalid_name", "nombre", "El nombre esta vacio");
  if (!Number.isInteger(record.ovr) || record.ovr < 1 || record.ovr > 99) add("invalid_ovr", "ovr", "OVR debe ser un entero entre 1 y 99");
  if (!POSITIONS.has(record.posicionPrincipal)) add("invalid_position", "posicionPrincipal", "La posicion principal no es valida");
  if (!Array.isArray(record.posiciones) || record.posiciones.length === 0 ||
      record.posiciones.some(position => !POSITIONS.has(position)) ||
      new Set(record.posiciones).size !== record.posiciones.length ||
      !record.posiciones.includes(record.posicionPrincipal)) {
    add("invalid_positions", "posiciones", "Las posiciones deben ser validas, unicas e incluir la principal");
  }
  if (record.precioReferencia !== null &&
      (typeof record.precioReferencia !== "number" || !Number.isFinite(record.precioReferencia) || record.precioReferencia <= 0)) {
    add("invalid_price", "precioReferencia", "precioReferencia debe ser null o un numero mayor que cero");
  }
  const statKeys = record.posicionPrincipal === "GK"
    ? ["div", "han", "kic", "ref", "spd", "pos"]
    : ["pac", "sho", "pas", "dri", "def", "phy"];
  if (!record.stats || typeof record.stats !== "object" || Array.isArray(record.stats) ||
      statKeys.some(key => !(key in record.stats)) ||
      Object.values(record.stats).some(value => value !== null &&
        (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 99))) {
    add("invalid_stats", "stats", "Las stats no cumplen el modelo de la posicion");
  }
  if (!["L", "R", null].includes(record.pie)) add("invalid_foot", "pie", "pie debe ser L, R o null");
  for (const field of ["skills", "weakFoot"]) {
    if (record[field] !== null && (!Number.isInteger(record[field]) || record[field] < 1 || record[field] > 5)) {
      add("invalid_skill", field, `${field} debe ser null o un entero entre 1 y 5`);
    }
  }
  for (const field of ["ratingFuente", "popularidadFuente", "valorSecundarioFuente"]) {
    if (record[field] !== null &&
        (typeof record[field] !== "number" || !Number.isFinite(record[field]) || record[field] < 0)) {
      add("invalid_market_value", field, `${field} debe ser null o un numero no negativo`);
    }
  }
  for (const field of ["version", "tipoCarta"]) {
    if (record[field] !== null && typeof record[field] !== "string") {
      add("invalid_schema_field", field, `${field} debe ser null o texto`);
    }
  }
  if (typeof record.activo !== "boolean") add("invalid_active_flag", "activo", "activo debe ser boolean");
  if (!record.fuente || typeof record.fuente !== "object" || Array.isArray(record.fuente)) {
    add("invalid_source", "fuente", "fuente debe ser un objeto");
  }
  if ("futbin" in record) {
    const futbin = record.futbin;
    const valid = futbin && typeof futbin === "object" && !Array.isArray(futbin) &&
      futbin.game === 27 && Number.isSafeInteger(futbin.playerId) && futbin.playerId > 0 &&
      typeof futbin.slug === "string" && /^[^\s/?#]+$/.test(futbin.slug) &&
      futbin.url === `https://www.futbin.com/27/player/${futbin.playerId}/${futbin.slug}`;
    if (!valid) add("invalid_futbin", "futbin", "La metadata FUTBIN no es canonica para game 27");
  }
}

function validateSchema(catalog, scope, errors) {
  const ids = new Set();
  catalog.forEach((record, index) => validateRecord(record, index, scope, errors, ids));
  return ids;
}

export function validateFutbinCatalogs(current, candidate) {
  const errors = [];
  if (!Array.isArray(current)) errors.push(error("current", "catalog_not_array", "El catalogo actual no es un array"));
  if (!Array.isArray(candidate)) errors.push(error("candidate", "catalog_not_array", "El candidato no es un array"));
  if (!Array.isArray(current) || !Array.isArray(candidate)) {
    return { valid: false, hasChanges: null, summary: null, errors, missingIds: [], newIds: [], changes: [] };
  }
  const hasChanges = !isDeepStrictEqual(current, candidate);
  if (candidate.length === 0) errors.push(error("candidate", "empty_candidate", "El catalogo candidato esta vacio"));
  const currentIds = validateSchema(current, "current", errors);
  const candidateIds = validateSchema(candidate, "candidate", errors);
  const candidateById = new Map(candidate.map(record => [record?.id, record]));
  const currentById = new Map(current.map(record => [record?.id, record]));
  const missingIds = [...currentIds].filter(id => !candidateIds.has(id));
  for (const id of missingIds) errors.push(error("candidate", "missing_current_id", `Falta el ID actual ${id}`, { id }));

  const retainedOrder = candidate.map(record => record?.id).filter(id => currentIds.has(id));
  const expectedOrder = current.map(record => record?.id);
  if (!isDeepStrictEqual(retainedOrder, expectedOrder)) {
    errors.push(error("candidate", "existing_order_changed", "Los IDs actuales no conservan su orden relativo"));
  }
  let newSeen = false;
  for (const record of candidate) {
    if (!currentIds.has(record?.id)) newSeen = true;
    else if (newSeen) {
      errors.push(error("candidate", "new_cards_not_appended", "Las cartas nuevas deben aparecer despues de todos los registros actuales", { id: record.id }));
      break;
    }
  }

  const changes = [];
  for (const [id, previous] of currentById) {
    const next = candidateById.get(id);
    if (!next) continue;
    for (const field of STRUCTURAL_FIELDS) {
      if (!isDeepStrictEqual(previous[field], next[field])) {
        errors.push(error("candidate", "structural_change", `El campo estructural ${field} cambio para ${id}`, { id, field }));
      }
    }
    const fields = REPORTABLE_FIELDS.filter(field => !isDeepStrictEqual(previous[field], next[field]));
    if (fields.length) changes.push({ id, fields });
  }

  const newIds = candidate.map(record => record?.id).filter(id => typeof id === "string" && !currentIds.has(id));
  const marketChanges = Object.fromEntries(REPORTABLE_FIELDS.map(field => [field,
    changes.filter(change => change.fields.includes(field)).length]));
  const summary = {
    currentCatalog: current.length,
    candidateCatalog: candidate.length,
    newCards: newIds.length,
    uniqueIds: candidateIds.size,
    withFutbin: candidate.filter(record => record && "futbin" in record).length,
    withoutFutbin: candidate.filter(record => record && !("futbin" in record)).length,
    nullPrices: candidate.filter(record => record?.precioReferencia === null).length,
    zeroPrices: candidate.filter(record => record?.precioReferencia === 0).length,
    removedIds: missingIds.length,
    changedExisting: changes.length,
    marketChanges,
    validationErrors: errors.length
  };
  return { valid: errors.length === 0, hasChanges, summary, errors, missingIds, newIds, changes };
}

export function validateCatalogFiles(currentPath, candidatePath) {
  const current = loadCatalogFile(currentPath);
  const candidate = loadCatalogFile(candidatePath);
  return { currentPath: current.path, candidatePath: candidate.path,
    ...validateFutbinCatalogs(current.catalog, candidate.catalog) };
}

function cliArguments(argv) {
  const options = { json: false };
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === "--json") options.json = true;
    else if (argument === "--current" || argument === "--candidate") {
      const value = argv[++index];
      if (!value) throw new Error(`Falta el valor de ${argument}`);
      options[argument.slice(2)] = value;
    } else throw new Error(`Argumento desconocido: ${argument}`);
  }
  if (!options.current || !options.candidate) throw new Error("Uso: --current <archivo> --candidate <archivo> [--json]");
  return options;
}

function printHuman(result) {
  if (result.summary) {
    console.log(`Catalogo actual: ${result.summary.currentCatalog}`);
    console.log(`Catalogo candidato: ${result.summary.candidateCatalog}`);
    console.log(`Cartas nuevas: ${result.summary.newCards}`);
    console.log(`Errores de validacion: ${result.summary.validationErrors}`);
  }
  for (const item of result.errors) console.error(`[${item.code}] ${item.message}`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  let result;
  let json = process.argv.includes("--json");
  try {
    const options = cliArguments(process.argv.slice(2));
    json = options.json;
    result = validateCatalogFiles(options.current, options.candidate);
  } catch (caught) {
    result = { valid: false, hasChanges: null, summary: null,
      errors: [error("input", "catalog_load_failed", caught.message)], missingIds: [], newIds: [], changes: [] };
  }
  if (json) console.log(JSON.stringify(result, null, 2));
  else printHuman(result);
  process.exitCode = result.valid ? 0 : 2;
}
