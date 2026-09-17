// Isolated diagnostic tool: no application data or persistence.
const PDFJS_VERSION = "5.4.624";
const PDFJS_BASE = "https://cdn.jsdelivr.net/npm/pdfjs-dist@" + PDFJS_VERSION + "/";
const ROWS_PER_VIEW = 200;
const ui = Object.fromEntries([
  "pdf-file", "status", "progress", "error", "warnings", "file-name",
  "page-count", "item-count", "export", "page-filter", "search", "results",
  "tokens", "previous", "next", "range"
].map(id => [id, document.getElementById(id)]));
let diagnostic = null;
let filtered = [];
let offset = 0;
let libraryPromise;

function loadPdfJs() {
  if (!libraryPromise) {
    libraryPromise = import(PDFJS_BASE + "build/pdf.min.mjs").then(pdfjs => {
      pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_BASE + "build/pdf.worker.min.mjs";
      return pdfjs;
    }).catch(error => {
      libraryPromise = null;
      throw new Error("No se pudo cargar PDF.js desde el CDN. Comprueba la conexión y usa un navegador actualizado.", { cause: error });
    });
  }
  return libraryPromise;
}

function normalizeText(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function normalizeItem(item, page) {
  if (typeof item.str !== "string" || !item.str.trim()) return null;
  const x = item.transform?.[4];
  const y = item.transform?.[5];
  if (![x, y, item.width, item.height].every(Number.isFinite)) {
    throw new Error("Coordenadas de texto inválidas en la página " + page + ".");
  }
  return { page, text: item.str, x, y, width: item.width, height: item.height };
}

function setStatus(text, state) {
  ui.status.textContent = text;
  ui.status.dataset.state = state;
}

function addWarning(text) {
  const li = document.createElement("li");
  li.textContent = text;
  ui.warnings.append(li);
}

function renderRows() {
  const fragment = document.createDocumentFragment();
  for (const item of filtered.slice(offset, offset + ROWS_PER_VIEW)) {
    const row = document.createElement("tr");
    for (const key of ["page", "text", "x", "y", "width", "height"]) {
      const cell = document.createElement("td");
      cell.textContent = typeof item[key] === "number" && key !== "page"
        ? item[key].toFixed(2) : String(item[key]);
      row.append(cell);
    }
    fragment.append(row);
  }
  ui.tokens.replaceChildren(fragment);
  ui.results.textContent = filtered.length + " elementos encontrados" +
    (ui["page-filter"].value ? " en la página " + ui["page-filter"].value : " en todo el documento") + ".";
  ui.range.textContent = filtered.length
    ? (offset + 1) + "–" + Math.min(offset + ROWS_PER_VIEW, filtered.length) + " de " + filtered.length
    : "Sin resultados";
  ui.previous.disabled = offset === 0;
  ui.next.disabled = offset + ROWS_PER_VIEW >= filtered.length;
}

function filterItems() {
  const page = Number(ui["page-filter"].value);
  const query = normalizeText(ui.search.value.trim());
  filtered = (diagnostic?.items || []).filter(item =>
    (!page || item.page === page) && normalizeText(item.text).includes(query));
  offset = 0;
  renderRows();
}

async function processFile(file) {
  diagnostic = null;
  resetCards();
  filtered = [];
  offset = 0;
  ui.tokens.replaceChildren();
  ui.warnings.replaceChildren();
  ui.error.hidden = true;
  ui.error.textContent = "";
  ui["file-name"].textContent = file.name;
  ui["page-count"].textContent = "—";
  ui["item-count"].textContent = "—";
  ui["page-filter"].replaceChildren(new Option("Todas las páginas", ""));
  ui.search.value = "";
  for (const id of ["export", "page-filter", "search", "previous", "next"]) ui[id].disabled = true;
  ui["pdf-file"].disabled = true;
  ui.results.textContent = "Preparando extracción…";
  ui.range.textContent = "";
  ui.progress.hidden = false;
  ui.progress.removeAttribute("value");
  setStatus("Leyendo…", "loading");
  let task;
  try {
    if (file.type !== "application/pdf" && !(file.type === "" && /\.pdf$/i.test(file.name))) {
      throw new Error("Selecciona un archivo PDF.");
    }
    const data = new Uint8Array(await file.arrayBuffer());
    // Check the PDF signature, including headers preceded by a short prefix.
    const header = new TextDecoder("latin1").decode(data.subarray(0, 1024));
    if (!header.includes("%PDF-")) throw new Error("El archivo no contiene una cabecera PDF válida.");
    const pdfjs = await loadPdfJs();
    // Only local bytes are passed, never a URL or uploaded form.
    task = pdfjs.getDocument({
      data,
      isEvalSupported: false,
      stopAtErrors: true,
      cMapUrl: PDFJS_BASE + "cmaps/",
      cMapPacked: true,
      standardFontDataUrl: PDFJS_BASE + "standard_fonts/"
    });
    const pdf = await task.promise;
    if (!Number.isInteger(pdf.numPages) || pdf.numPages < 1) throw new Error("El PDF no tiene páginas.");
    ui["page-count"].textContent = String(pdf.numPages);
    ui.progress.max = pdf.numPages;
    ui.progress.value = 0;
    const items = [];
    const pageInfo = [];
    const warnings = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      setStatus("Leyendo… página " + pageNumber + " de " + pdf.numPages, "loading");
      const page = await pdf.getPage(pageNumber);
      try {
        const content = await page.getTextContent();
        const start = items.length;
        for (const item of content.items) {
          const normalized = normalizeItem(item, pageNumber);
          if (normalized) items.push(normalized);
        }
        const count = items.length - start;
        pageInfo.push({ page: pageNumber, view: Array.from(page.view), rotation: page.rotate, userUnit: page.userUnit, textItems: count });
        if (!count) {
          const warning = "Página " + pageNumber + ": no contiene texto extraíble. No se realiza OCR.";
          warnings.push(warning);
          addWarning(warning);
        }
      } finally {
        page.cleanup();
      }
      ui.progress.value = pageNumber;
      ui["item-count"].textContent = String(items.length);
      // Yield between pages; PDF parsing runs in PDF.js's worker.
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    if (!items.length) throw new Error("Este PDF no contiene texto estructurado compatible con el importador.");
    diagnostic = {
      fileName: file.name, pages: pdf.numPages, extractedAt: new Date().toISOString(),
      pdfjsVersion: PDFJS_VERSION,
      coordinates: "Original PDF.js TextItem values: x=transform[4], y=transform[5]; width/height unchanged. No viewport transform. Text origin, not bounding-box corner.",
      pageInfo, warnings, items
    };
    for (let number = 1; number <= pdf.numPages; number++) {
      ui["page-filter"].append(new Option("Página " + number, String(number)));
    }
    for (const id of ["export", "page-filter", "search"]) ui[id].disabled = false;
    filterItems();
    setStatus("PDF procesado", "success");
    try {
      await analyzeCards(diagnostic);
      try {
        await compareCardsWithCatalog();
      } catch (error) {
        comparisonUi["comparison-status"].textContent = "Error en la comparación: " + error.message;
      }
    } catch (error) {
      cardUi["cards-status"].textContent = "Error en el análisis: " + error.message;
      cardUi["metric-errors"].textContent = "1";
    }
  } catch (error) {
    setStatus("Error", "error");
    ui.error.textContent = error?.name === "PasswordException"
      ? "El PDF está protegido con contraseña. Usa una copia sin contraseña."
      : "No se pudo procesar el PDF: " + (error?.message || String(error));
    ui.error.hidden = false;
    ui.results.textContent = "No hay un diagnóstico completo disponible.";
  } finally {
    try { await task?.destroy(); } catch (error) { addWarning("No se pudo liberar el lector PDF: " + error.message); }
    ui["pdf-file"].disabled = false;
    ui["pdf-file"].value = "";
    ui.progress.hidden = true;
  }
}

function exportDiagnostic() {
  if (!diagnostic) return;
  downloadJson(diagnostic, diagnostic.fileName.replace(/\.pdf$/i, "") + "-diagnostico.json");
}

function downloadJson(value, fileName) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

ui["pdf-file"].addEventListener("change", event => {
  const file = event.target.files?.[0];
  if (file) void processFile(file);
});
ui["page-filter"].addEventListener("change", filterItems);
let searchTimer;
ui.search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(filterItems, 120);
});
ui.previous.addEventListener("click", () => { offset = Math.max(0, offset - ROWS_PER_VIEW); renderRows(); });
ui.next.addEventListener("click", () => { offset += ROWS_PER_VIEW; renderRows(); });
ui.export.addEventListener("click", exportDiagnostic);



// Card parsing runs in a separate worker; PDF diagnostics remain independently usable.
const cardUi = Object.fromEntries([
  "cards-status", "card-status-filter", "export-cards", "cards-body",
  "cards-previous", "cards-next", "cards-range", "parser-errors",
  ...["slots", "cards", "complete", "partial", "ambiguous", "errors"].map(key => "metric-" + key)
].map(id => [id, document.getElementById(id)]));
let parsedCards = null;
let cardOffset = 0;
const CARDS_PER_VIEW = 50;

function resetCards() {
  resetComparison();
  parsedCards = null;
  cardOffset = 0;
  cardUi["cards-body"].replaceChildren();
  cardUi["parser-errors"].replaceChildren();
  cardUi["cards-status"].textContent = "Esperando análisis.";
  cardUi["cards-range"].textContent = "";
  cardUi["card-status-filter"].value = "";
  for (const key of ["slots", "cards", "complete", "partial", "ambiguous", "errors"]) {
    cardUi["metric-" + key].textContent = "—";
  }
  for (const id of ["card-status-filter", "export-cards", "cards-previous", "cards-next"]) cardUi[id].disabled = true;
}

function analyzeCards(data) {
  cardUi["cards-status"].textContent = "Analizando geometría de cartas…";
  return new Promise((resolve, reject) => {
    const worker = new Worker("futbin-parser-worker.mjs", { type: "module" });
    const fail = error => { worker.terminate(); reject(error); };
    worker.onerror = event => fail(new Error(event.message || "No se pudo iniciar el parser."));
    worker.onmessageerror = () => fail(new Error("No se pudo recibir el resultado del parser."));
    worker.onmessage = event => {
      worker.terminate();
      if (event.data.error) { reject(new Error(event.data.error)); return; }
      parsedCards = event.data.result;
      for (const [key, value] of Object.entries(parsedCards.metrics)) {
        cardUi["metric-" + key].textContent = String(value);
      }
      for (const error of parsedCards.errors) {
        const li = document.createElement("li");
        li.textContent = "Página " + error.page + ": " + error.code;
        cardUi["parser-errors"].append(li);
      }
      cardUi["card-status-filter"].disabled = false;
      cardUi["export-cards"].disabled = false;
      cardUi["cards-status"].textContent = parsedCards.cards.length
        ? "Análisis terminado. Expande una carta para revisar valores, advertencias y tokens."
        : "No se detectaron cartas compatibles con esta geometría.";
      renderCards();
      resolve();
    };
    try { worker.postMessage(data); } catch (error) { fail(error); }
  });
}

function renderCards() {
  const status = cardUi["card-status-filter"].value;
  const cards = (parsedCards?.cards || []).filter(card => !status || card.parseStatus === status);
  const fragment = document.createDocumentFragment();
  const display = value => value === null || value === undefined ? "—" : String(value);
  cards.slice(cardOffset, cardOffset + CARDS_PER_VIEW).forEach((card, index) => {
    const row = document.createElement("tr");
    const values = [card.nombre, card.ovr, card.posicionPrincipal,
      Object.entries(card.stats).map(([key, value]) => key.toUpperCase() + " " + display(value)).join(" · "),
      card.ratingFuente, card.popularidadFuente, card.precioReferencia, card.valorSecundarioFuente,
      card.sourcePage, card.parseStatus];
    values.forEach((value, index) => {
      const td = document.createElement("td");
      td.textContent = display(value);
      if (index === 9) td.dataset.status = card.parseStatus;
      row.append(td);
    });
    const detailRow = document.createElement("tr");
    detailRow.hidden = true;
    detailRow.className = "card-detail-row";
    detailRow.id = "card-detail-" + (cardOffset + index);
    const detailCell = document.createElement("td");
    detailCell.colSpan = 11;
    detailRow.append(detailCell);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Detalles";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", detailRow.id);
    button.setAttribute("aria-label", "Detalles de " + (card.nombre || "carta sin identificar"));
    button.addEventListener("click", () => {
      detailRow.hidden = !detailRow.hidden;
      button.setAttribute("aria-expanded", String(!detailRow.hidden));
      if (!detailRow.hidden && !detailCell.children.length) {
        const pre = document.createElement("pre");
        pre.textContent = JSON.stringify(card, null, 2);
        detailCell.append(pre);
      }
    });
    const action = document.createElement("td");
    action.append(button);
    row.append(action);
    fragment.append(row, detailRow);
  });
  cardUi["cards-body"].replaceChildren(fragment);
  cardUi["cards-range"].textContent = cards.length
    ? (cardOffset + 1) + "–" + Math.min(cardOffset + CARDS_PER_VIEW, cards.length) + " de " + cards.length
    : "Sin cartas para este filtro";
  cardUi["cards-previous"].disabled = cardOffset === 0;
  cardUi["cards-next"].disabled = cardOffset + CARDS_PER_VIEW >= cards.length;
}

cardUi["card-status-filter"].addEventListener("change", () => { cardOffset = 0; renderCards(); });
cardUi["cards-previous"].addEventListener("click", () => { cardOffset = Math.max(0, cardOffset - CARDS_PER_VIEW); renderCards(); });
cardUi["cards-next"].addEventListener("click", () => { cardOffset += CARDS_PER_VIEW; renderCards(); });
cardUi["export-cards"].addEventListener("click", () => {
  if (parsedCards) downloadJson(parsedCards, diagnostic.fileName.replace(/\.pdf$/i, "") + "-cartas.json");
});

const comparisonKeys = ["updated", "new", "notInCurrentSnapshot", "needsReview", "unchanged"];
const comparisonMetricKeys = ["catalog", "snapshot", "exactMatches", "partialMatches", ...comparisonKeys];
const comparisonUi = Object.fromEntries([
  "comparison-status", "comparison-filter", "comparison-export", "comparison-body",
  "comparison-previous", "comparison-next", "comparison-range",
  ...comparisonMetricKeys.map(key => "comparison-" + key)
].map(id => [id, document.getElementById(id)]));
let comparisonResult = null;
let comparisonOffset = 0;

function resetComparison() {
  comparisonResult = null;
  comparisonOffset = 0;
  comparisonUi["comparison-body"].replaceChildren();
  comparisonUi["comparison-filter"].value = "";
  comparisonUi["comparison-range"].textContent = "";
  comparisonUi["comparison-status"].textContent = "Esperando cartas detectadas.";
  for (const key of comparisonMetricKeys) comparisonUi["comparison-" + key].textContent =
    key === "catalog" && Array.isArray(window.PLAYERS_DATA) ? String(window.PLAYERS_DATA.length) : "—";
  for (const key of ["filter", "export", "previous", "next"]) comparisonUi["comparison-" + key].disabled = true;
}

function compareCardsWithCatalog() {
  comparisonUi["comparison-status"].textContent = "Comparando identidades con el catálogo…";
  return new Promise((resolve, reject) => {
    if (!Array.isArray(window.PLAYERS_DATA)) {
      reject(new Error("No se pudo cargar players-data.js. El diagnóstico y las cartas siguen disponibles."));
      return;
    }
    const worker = new Worker("futbin-matcher-worker.mjs", { type: "module" });
    const fail = error => { worker.terminate(); reject(error); };
    worker.onerror = event => fail(new Error(event.message || "No se pudo iniciar el comparador."));
    worker.onmessageerror = () => fail(new Error("No se pudo recibir la comparación."));
    worker.onmessage = event => {
      worker.terminate();
      if (event.data.error) { reject(new Error(event.data.error)); return; }
      comparisonResult = event.data.result;
      for (const key of comparisonMetricKeys) comparisonUi["comparison-" + key].textContent = String(comparisonResult.summary[key]);
      comparisonUi["comparison-filter"].disabled = false;
      comparisonUi["comparison-export"].disabled = false;
      comparisonUi["comparison-status"].textContent = "Comparación terminada. Los cambios son solo una vista previa.";
      renderComparison();
      resolve();
    };
    try {
      worker.postMessage({ snapshot: parsedCards.cards, catalog: window.PLAYERS_DATA,
        metadata: { fileName: diagnostic.fileName, extractedAt: diagnostic.extractedAt,
          parserVersion: parsedCards.parserVersion, parserMetrics: parsedCards.metrics, parserErrors: parsedCards.errors } });
    } catch (error) { fail(error); }
  });
}

function renderComparison() {
  const filter = comparisonUi["comparison-filter"].value;
  const rows = comparisonResult ? (filter ? comparisonResult[filter] : comparisonKeys.flatMap(key => comparisonResult[key])) : [];
  const fragment = document.createDocumentFragment();
  const display = value => value === null || value === undefined ? "—" : String(value);
  rows.slice(comparisonOffset, comparisonOffset + 50).forEach((entry, index) => {
    const card = entry.pdfCard || entry.currentRecord;
    const row = document.createElement("tr");
    const values = [card?.nombre, card?.ovr, card?.posicionPrincipal, entry.status,
      entry.currentRecord?.precioReferencia, entry.pdfCard?.precioReferencia,
      entry.currentRecord?.popularidadFuente, entry.pdfCard?.popularidadFuente, entry.confidence];
    values.forEach((value, index) => {
      const td = document.createElement("td");
      td.textContent = display(value);
      if (index === 3) td.dataset.comparisonStatus = entry.status;
      row.append(td);
    });
    const detailRow = document.createElement("tr");
    detailRow.hidden = true;
    detailRow.className = "card-detail-row";
    detailRow.id = "comparison-detail-" + (comparisonOffset + index);
    const detailCell = document.createElement("td");
    detailCell.colSpan = 10;
    detailRow.append(detailCell);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Detalles";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", detailRow.id);
    button.setAttribute("aria-label", "Comparación de " + (card?.nombre || "carta sin identificar"));
    button.addEventListener("click", () => {
      detailRow.hidden = !detailRow.hidden;
      button.setAttribute("aria-expanded", String(!detailRow.hidden));
      if (!detailRow.hidden && !detailCell.children.length) {
        const sections = {
          "Identidad detectada": entry.identity, "Registro actual relacionado": entry.currentRecord,
          "Datos del PDF": entry.pdfCard, "Diff de mercado": entry.marketDiff,
          "Razón del match": entry.matchReason, "Confidence": entry.confidence,
          "Fields used": entry.fieldsUsed, "Warnings": entry.warnings,
          "Candidatos y conflictos estructurales": entry.candidates
        };
        for (const [title, value] of Object.entries(sections)) {
          const heading = document.createElement("h3");
          heading.textContent = title;
          const pre = document.createElement("pre");
          pre.textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
          detailCell.append(heading, pre);
        }
      }
    });
    const action = document.createElement("td");
    action.append(button); row.append(action); fragment.append(row, detailRow);
  });
  comparisonUi["comparison-body"].replaceChildren(fragment);
  comparisonUi["comparison-range"].textContent = rows.length
    ? (comparisonOffset + 1) + "–" + Math.min(comparisonOffset + 50, rows.length) + " de " + rows.length
    : "Sin registros para este filtro";
  comparisonUi["comparison-previous"].disabled = comparisonOffset === 0;
  comparisonUi["comparison-next"].disabled = comparisonOffset + 50 >= rows.length;
}
comparisonUi["comparison-filter"].addEventListener("change", () => { comparisonOffset = 0; renderComparison(); });
comparisonUi["comparison-previous"].addEventListener("click", () => { comparisonOffset = Math.max(0, comparisonOffset - 50); renderComparison(); });
comparisonUi["comparison-next"].addEventListener("click", () => { comparisonOffset += 50; renderComparison(); });
comparisonUi["comparison-export"].addEventListener("click", () => {
  if (comparisonResult) downloadJson(comparisonResult, diagnostic.fileName.replace(/\.pdf$/i, "") + "-comparacion.json");
});
resetComparison();

