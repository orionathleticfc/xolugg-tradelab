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
  const blob = new Blob([JSON.stringify(diagnostic, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = diagnostic.fileName.replace(/\.pdf$/i, "") + "-diagnostico.json";
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

