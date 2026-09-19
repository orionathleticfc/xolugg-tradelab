/**
 * Geometry-only FUTBIN preview parser. No DOM, catalog, storage or network.
 * Coordinates remain in the unrotated PDF coordinate system (Y increases up).
 */
export const GEOMETRY = Object.freeze({
  columnAnchors: [41.6, 173.6, 305.6, 437.6],
  columnWidth: 132, leftPadding: 12, yTolerance: 2.25,
  rowTolerance: 3, priceOffset: 113.25, rowSpacing: 194.25
});
const FIELD_STATS = ["pac", "sho", "pas", "dri", "def", "phy"];
const GK_STATS = ["div", "han", "kic", "ref", "spd", "pos"];
const POSITIONS = new Set(["GK", "CB", "LB", "RB", "LWB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "CF", "ST"]);
const clean = text => String(text ?? "").trim();
const words = token => clean(token.text).split(/\s+/).filter(Boolean);
const near = (a, b, tolerance = GEOMETRY.yTolerance) => Math.abs(a - b) <= tolerance;
const integer = text => /^\d{1,2}$/.test(clean(text)) ? Number(text) : null;
const unique = list => [...new Set(list)];
const byX = (a, b) => a.x - b.x || b.y - a.y;
const CARD_TYPES = new Set(['gold', 'special', 'unknown']);

/** Conservative visual classifier. Ambiguous evidence deliberately stays unknown. */
export function classifyCardVisual(signal = {}) {
  if (CARD_TYPES.has(signal.tipoCarta)) return signal.tipoCarta;
  const samples = Number(signal.sampleCount);
  const coverage = Number(signal.cardCoverage);
  const gold = Number(signal.goldRatio);
  const variance = Number(signal.colorVariance);
  const dark = Number(signal.darkRatio);
  const pale = Number(signal.paleRatio);
  if (!Number.isFinite(samples) || samples < 64 || !Number.isFinite(coverage) || coverage < 0.35) return 'unknown';
  if (Number.isFinite(gold) && gold >= 0.42) return 'gold';
  if (Number.isFinite(gold) && (
      (gold <= 0.22 && ((Number.isFinite(variance) && variance >= 0.035) ||
       (Number.isFinite(dark) && dark >= 0.2) || (Number.isFinite(pale) && pale >= 0.35))) ||
      (gold <= 0.32 && Number.isFinite(dark) && dark >= 0.35))) return 'special';
  return 'unknown';
}

/** Strict market notation. Unknown values stay null; zero remains zero. */
export function parseMarketValue(text) {
  const match = clean(text).match(/^(\d+(?:\.\d+)?)([KM])?$/i);
  if (!match) return null;
  const value = Number(match[1]) * ({ K: 1000, M: 1000000 }[match[2]?.toUpperCase()] || 1);
  const rounded = Math.round(value);
  return Number.isSafeInteger(rounded) && Math.abs(value - rounded) < 0.00001 ? rounded : null;
}

function columnOf(token) {
  return GEOMETRY.columnAnchors.findIndex(x =>
    token.x >= x - GEOMETRY.leftPadding && token.x < x - GEOMETRY.leftPadding + GEOMETRY.columnWidth);
}

function clusterLines(tokens, tolerance = GEOMETRY.yTolerance) {
  const lines = [];
  for (const token of [...tokens].sort((a, b) => b.y - a.y || a.x - b.x)) {
    let line = lines.find(candidate => near(candidate.y, token.y, tolerance));
    if (!line) { line = { y: token.y, tokens: [] }; lines.push(line); }
    line.tokens.push(token);
  }
  for (const line of lines) line.tokens.sort(byX);
  return lines;
}

function marketPair(tokens) {
  const entries = [...tokens].sort(byX).flatMap(token => words(token).map(raw => ({ raw, value: parseMarketValue(raw), token })));
  return entries.length === 2 && entries.every(entry => entry.value !== null) ? entries : null;
}

export function detectPriceRows(tokens) {
  return clusterLines(tokens).flatMap(line => {
    const cells = GEOMETRY.columnAnchors.map((_, col) => {
      const local = line.tokens.filter(token => columnOf(token) === col);
      return local.length ? marketPair(local) : null;
    });
    // At least one economic pair, and no other content on this baseline.
    // Final association also requires the observed vertical card geometry.
    const occupied = line.tokens.filter(token => columnOf(token) >= 0);
    const pairedTokens = new Set(cells.filter(Boolean).flat().map(entry => entry.token));
    return cells.some(Boolean) && occupied.every(token => pairedTokens.has(token))
      ? [{ y: line.y, page: tokens[0]?.page, cells, usedColumns: new Set() }] : [];
  });
}

function detectBodyRows(tokens) {
  const anchors = [];
  for (const token of tokens) {
    const col = columnOf(token);
    if (col < 0) continue;
    const parts = words(token).map(word => word.toLowerCase());
    if ((parts[0] === "pac" || parts[0] === "div") &&
        Math.abs(token.x - GEOMETRY.columnAnchors[col]) <= 10) {
      anchors.push({ y: token.y, col, token });
    }
    // A principal position + OVR is an independent anchor when stats are absent.
    if (POSITIONS.has(clean(token.text)) && token.x < GEOMETRY.columnAnchors[col] + 44) {
      const ovr = tokens.find(other => columnOf(other) === col &&
        near(other.y, token.y + 9) && Math.abs(other.x - token.x) < 24 &&
        integer(other.text) !== null);
      if (ovr) anchors.push({ y: token.y - 72.75, col, token });
    }
  }
  const rows = [];
  for (const anchor of anchors.sort((a, b) => b.y - a.y)) {
    let row = rows.find(candidate => near(candidate.y, anchor.y, GEOMETRY.rowTolerance));
    if (!row) { row = { y: anchor.y, columns: new Set() }; rows.push(row); }
    row.columns.add(anchor.col);
  }
  return rows;
}

/** Build cells from independent body anchors and match economics exactly once. */
export function buildCardCells(diagnostic) {
  const cells = [], errors = [];
  let pendingPriceRow = null;
  const pages = unique(diagnostic.items.map(item => item.page)).sort((a, b) => a - b);
  function orphan(row, reason) {
    row.cells.forEach((pair, col) => {
      if (pair && !row.usedColumns.has(col)) cells.push({
        page: row.page, column: col + 1, anchorY: null, tokens: [],
        priceTokens: unique(pair.map(entry => entry.token)), pair,
        warnings: [reason], ambiguous: true
      });
    });
  }
  for (const page of pages) {
    const tokens = diagnostic.items.filter(item => item.page === page);
    const info = diagnostic.pageInfo?.find(item => item.page === page);
    const supported = !info || ((info.rotation || 0) === 0 &&
      (info.userUnit ?? 1) === 1 && near(info.view[2] - info.view[0], 612, 3) &&
      near(info.view[3] - info.view[1], 792, 3) &&
      near(info.view[0], 0, 1) && near(info.view[1], 0, 1));
    if (!supported) {
      errors.push({ page, code: "unsupported_page_geometry" });
      if (pendingPriceRow) orphan(pendingPriceRow, "unmatched_price_row");
      pendingPriceRow = null;
      continue;
    }
    const rows = detectBodyRows(tokens);
    const priceRows = detectPriceRows(tokens);
    const height = info?.view[3] ?? 792;
    for (const [rowIndex, row] of rows.entries()) {
      const matches = priceRows.filter(price => near(price.y, row.y + GEOMETRY.priceOffset, 4));
      let priceRow = matches.length === 1 ? matches[0] : null;
      let crossed = false;
      // Carry only from the immediately previous page, into a clipped first row.
      if (!priceRow && matches.length === 0 && rowIndex === 0 && pendingPriceRow &&
          pendingPriceRow.page === page - 1 && row.y + GEOMETRY.priceOffset > height - 40) {
        priceRow = pendingPriceRow;
        crossed = true;
      }
      for (let col = 0; col < 4; col++) {
        const local = tokens.filter(token => columnOf(token) === col &&
          token.y <= row.y + 86 && token.y >= row.y - 66);
        // Do not manufacture empty slots; a body anchor or name+position is evidence.
        const hasIdentity = local.some(token => near(token.y, row.y + 9.75) && /\p{L}/u.test(token.text)) &&
          local.some(token => POSITIONS.has(clean(token.text)));
        if (!row.columns.has(col) && !hasIdentity) continue;
        const pair = priceRow?.cells[col] ?? null;
        if (pair) priceRow.usedColumns.add(col);
        cells.push({
          page, column: col + 1, anchorY: row.y, tokens: local, pair,
          priceTokens: pair ? unique(pair.map(entry => entry.token)) : [],
          ambiguous: matches.length > 1,
          warnings: [...(matches.length > 1 ? ["multiple_price_rows"] : []),
            ...(crossed && pair ? ["price_from_previous_page"] : [])]
        });
      }
    }
    if (pendingPriceRow) orphan(pendingPriceRow, "unmatched_price_row");
    pendingPriceRow = null;
    for (const row of priceRows) {
      if (row.cells.every((pair, col) => !pair || row.usedColumns.has(col))) continue;
      const belowBodies = rows.length === 0 || row.y < Math.min(...rows.map(body => body.y)) - 66;
      // Numeric lines inside card bodies are never carried as prices.
      const insideBody = rows.some(body => row.y <= body.y + 86 && row.y >= body.y - 66);
      if (insideBody) continue;
      if (belowBodies && row.y < GEOMETRY.rowSpacing) {
        if (pendingPriceRow) orphan(pendingPriceRow, "multiple_pending_price_rows");
        pendingPriceRow = row;
      } else {
        orphan(row, "unmatched_price_row");
      }
    }
  }
  if (pendingPriceRow) orphan(pendingPriceRow, "unmatched_price_row");
  return { cells, errors };
}

export function validateParsedCard(card, ambiguous = false) {
  const missing = [];
  if (!card.nombre) missing.push("missing_name");
  if (card.ovr === null) missing.push("missing_ovr");
  if (!card.posicionPrincipal) missing.push("missing_position");
  if (Object.values(card.stats).some(value => value === null)) missing.push("missing_stats");
  for (const [field, code] of [["pie", "foot"], ["skills", "skills"], ["weakFoot", "weak_foot"],
    ["ratingFuente", "rating"], ["popularidadFuente", "popularity"],
    ["precioReferencia", "price"], ["valorSecundarioFuente", "secondary_value"]]) {
    if (card[field] === null) missing.push("missing_" + code);
  }
  card.warnings = unique([...card.warnings, ...missing]);
  card.parseStatus = ambiguous || !card.nombre || card.ovr === null || !card.posicionPrincipal
    ? "ambiguous" : missing.length ? "partial" : "complete";
  return card;
}

export function parseCard(cell, visual = null) {
  const tokens = [...cell.tokens].sort(byX), y = cell.anchorY;
  const used = new Set(cell.priceTokens);
  const warnings = [...cell.warnings];
  let ambiguous = cell.ambiguous;
  const band = (offset, tolerance = GEOMETRY.yTolerance) =>
    y === null ? [] : tokens.filter(token => near(token.y, y + offset, tolerance));
  function one(candidates, field, convert = token => clean(token.text)) {
    if (candidates.length > 1) { warnings.push("conflicting_" + field); ambiguous = true; return null; }
    if (!candidates.length) return null;
    used.add(candidates[0]);
    return convert(candidates[0]);
  }
  const left = GEOMETRY.columnAnchors[cell.column - 1];
  const ovr = one(band(81.75).filter(token => token.x < left + 44 && integer(token.text) !== null), "ovr", token => integer(token.text));
  const principal = one(band(72.75).filter(token => token.x < left + 44 && POSITIONS.has(clean(token.text))), "position");
  const nameTokens = band(8.25, 3).filter(token =>
    /\p{L}/u.test(token.text) && !POSITIONS.has(clean(token.text)) &&
    !words(token).every(word => [...FIELD_STATS, ...GK_STATS].includes(word.toLowerCase())));
  nameTokens.forEach(token => used.add(token));
  const name = nameTokens.map(token => clean(token.text)).join(" ") || null;
  const alternatives = tokens.filter(token => POSITIONS.has(clean(token.text)) &&
    token.x >= left + 44 && token.y > y + 14 && token.y < y + 90);
  alternatives.forEach(token => used.add(token));
  const keys = principal === "GK" || band(0).some(token => words(token)[0]?.toLowerCase() === "div") ? GK_STATS : FIELD_STATS;
  const stats = Object.fromEntries(keys.map(key => [key, null]));
  const labels = band(0).filter(token => words(token).some(word => keys.includes(word.toLowerCase())));
  const values = band(-8.25).filter(token => words(token).every(word => integer(word) !== null));
  const labelWords = labels.flatMap(words).map(word => word.toLowerCase());
  const valueWords = values.flatMap(words);
  if (labelWords.join(" ") === keys.join(" ") && valueWords.length === 6) {
    keys.forEach((key, index) => { stats[key] = Number(valueWords[index]); });
    [...labels, ...values].forEach(token => used.add(token));
  } else {
    // With missing values, match individual label/value X coordinates, never shift values.
    keys.forEach(key => {
      const label = labels.filter(token => clean(token.text).toLowerCase() === key);
      if (label.length !== 1) return;
      const matches = values.filter(token => words(token).length === 1 && Math.abs(token.x - label[0].x) <= 7);
      if (matches.length === 1) {
        stats[key] = integer(matches[0].text); used.add(label[0]); used.add(matches[0]);
      } else if (matches.length > 1) { warnings.push("conflicting_stat_" + key); ambiguous = true; }
    });
  }
  const detailTokens = band(-34.125, 2);
  const footTokens = detailTokens.filter(token => /^[LR]$/.test(clean(token.text)));
  const foot = one(footTokens, "foot");
  const rating = one(detailTokens.filter(token => /^\d{1,2}\.\d+$/.test(clean(token.text))),
    "rating", token => Number(token.text));
  const skillTokens = detailTokens.filter(token => /^(?:[1-5]\s*[★☆*]?\s*){1,2}$/.test(clean(token.text)));
  const skillValues = skillTokens.flatMap(token => clean(token.text).match(/[1-5]/g) || []);
  let skills = null, weakFoot = null;
  if (skillValues.length === 2) {
    [skills, weakFoot] = skillValues.map(Number); skillTokens.forEach(token => used.add(token));
  } else if (skillValues.length > 2) { warnings.push("conflicting_skills"); ambiguous = true; }
  const popularity = one(band(-61.5).filter(token => /^\d+$/.test(clean(token.text))), "popularity", token => {
    const value = Number(token.text); return Number.isSafeInteger(value) ? value : null;
  });
  const card = {
    nombre: name, ovr, posicionPrincipal: principal,
    version: null, tipoCarta: classifyCardVisual(visual || {}),
    posiciones: unique([principal, ...alternatives.map(token => clean(token.text))].filter(Boolean)),
    stats, pie: foot, skills, weakFoot, ratingFuente: rating, popularidadFuente: popularity,
    precioReferencia: cell.pair?.[0].value ?? null,
    valorSecundarioFuente: cell.pair?.[1].value ?? null,
    precioReferenciaRaw: cell.pair?.[0].raw ?? null,
    valorSecundarioFuenteRaw: cell.pair?.[1].raw ?? null,
    sourcePage: cell.page, priceSourcePage: cell.priceTokens[0]?.page ?? null,
    sourceColumn: cell.column, parseStatus: null, warnings,
    evidence: { anchorY: y, tokensUsed: [...used], cellTokens: tokens }
  };
  return validateParsedCard(card, ambiguous);
}

export function parseFutbinDiagnostic(diagnostic) {
  if (!Array.isArray(diagnostic?.items)) throw new TypeError("El diagnóstico no contiene items.");
  const invalid = diagnostic.items.filter(item => !Number.isInteger(item.page) || item.page < 1 ||
    typeof item.text !== "string" || ![item.x, item.y, item.width, item.height].every(Number.isFinite));
  if (invalid.length) throw new TypeError("Hay tokens con página o coordenadas inválidas.");
  const { cells, errors } = buildCardCells(diagnostic);
  const visuals = Array.isArray(diagnostic.cardVisuals) ? diagnostic.cardVisuals : [];
  const cards = cells.map(cell => parseCard(cell, visuals.find(visual =>
    visual?.page === cell.page && visual?.column === cell.column &&
    (cell.anchorY === null || !Number.isFinite(visual.anchorY) || near(visual.anchorY, cell.anchorY, 4)))));
  return {
    parserVersion: "0.3.0", fileName: diagnostic.fileName ?? null,
    metrics: { slots: cells.length, cards: cards.length,
      complete: cards.filter(card => card.parseStatus === "complete").length,
      partial: cards.filter(card => card.parseStatus === "partial").length,
      ambiguous: cards.filter(card => card.parseStatus === "ambiguous").length,
      gold: cards.filter(card => card.tipoCarta === "gold").length,
      special: cards.filter(card => card.tipoCarta === "special").length,
      unknown: cards.filter(card => card.tipoCarta === "unknown").length,
      errors: errors.length },
    errors, cards
  };
}


