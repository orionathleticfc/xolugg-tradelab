import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const appSource = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const cssSource = fs.readFileSync(new URL("../style.css", import.meta.url), "utf8");
const htmlSource = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

function card(id, nombre, precioReferencia, futbinUrl) {
  return {
    id, nombre, precioReferencia,
    tipoCarta: id.includes("special") ? "special" : "gold",
    fuente: {
      importedAt: "2026-09-01T00:00:00.000Z",
      snapshotObservedAt: "2026-09-01T00:00:00.000Z",
      lastMarketChangedAt: "2026-08-31T12:00:00.000Z",
      precioPrincipalRaw: precioReferencia === null ? "0" : String(precioReferencia)
    },
    ...(futbinUrl ? { futbin: { url: futbinUrl } } : {})
  };
}

const barcolaUrl = "https://www.futbin.com/27/player/12345/barcola";
const players = [
  card("barcola-gold", "Barcola", 99500, barcolaUrl),
  card("lacroix-gold", "Lacroix", 60000,
    "https://www.futbin.com/27/player/22222/lacroix"),
  card("lacroix-special", "Lacroix", 120000,
    "https://www.futbin.com/27/player/33333/lacroix-special"),
  card("no-price-special", "Sin Precio", null,
    "https://www.futbin.com/27/player/44444/sin-precio")
];

function loadApp({ catalog = players, inputs = {}, querySelectorAll } = {}) {
  const values = new Map();
  const document = {
    addEventListener() {},
    getElementById: id => inputs[id] ?? null,
    querySelectorAll: querySelectorAll ?? (() => [])
  };
  const context = vm.createContext({
    window: { PLAYERS_DATA: catalog }, document,
    localStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
      removeItem: key => values.delete(key)
    },
    confirm: () => true, alert() {},
    console: { log() {}, warn() {}, error() {} }, structuredClone
  });
  vm.runInContext(appSource, context);
  return { context, values };
}

const plain = value => JSON.parse(JSON.stringify(value));
const setItems = (context, items) => {
  context.__items = items;
  vm.runInContext("state.watchlist = __items", context);
  delete context.__items;
};
const overrideState = context =>
  JSON.parse(vm.runInContext("JSON.stringify(popularPriceOverrides)", context));
const viewState = context =>
  JSON.parse(vm.runInContext("JSON.stringify(watchlistView)", context));

function dynamicPriceInput(value) {
  const listeners = new Map();
  return {
    value: String(value),
    step: "",
    matches: selector => selector.includes(".watchlist-price-input"),
    addEventListener(type, listener) {
      const group = listeners.get(type) || [];
      group.push(listener);
      listeners.set(type, group);
    },
    emit(type, event = {}) {
      for (const listener of listeners.get(type) || []) {
        listener({ inputType: "", isComposing: false, ...event });
      }
    }
  };
}

function nativeStep(input, direction) {
  input.value = String(Number(input.value) +
    Number(input.step) * (direction === "up" ? 1 : -1));
  input.emit("input");
}

test("A. Watchlist FUTBIN usa player.futbin.url exacta", () => {
  const { context } = loadApp();
  assert.equal(context.getValidWatchlistFutbinUrl({
    playerId: "barcola-gold", jugador: "Barcola"
  }), barcolaUrl);
  assert.match(appSource, /target="_blank" rel="noopener noreferrer"/);
});

test("B. FUTBIN no se reconstruye usando el nombre", () => {
  const exact = "https://www.futbin.com/27/player/55555/url-totalmente-distinta";
  const { context } = loadApp({
    catalog: [card("weird", "Nombre No Presente En URL", 10000, exact)]
  });
  assert.equal(context.getValidWatchlistFutbinUrl({
    playerId: "weird", jugador: "Otro nombre"
  }), exact);
});

test("C. FUTBIN inválido no crea un enlace falso", () => {
  const { context } = loadApp({ catalog: [
    card("missing", "Missing", 10000),
    card("unsafe", "Unsafe", 10000, "javascript:alert(1)"),
    card("search", "Search", 10000, "https://www.futbin.com/search?q=Search")
  ] });
  for (const playerId of ["missing", "unsafe", "search"]) {
    assert.equal(context.getValidWatchlistFutbinUrl({ playerId }), null);
  }
});

test("D. el editor parte del precio efectivo sin formato", () => {
  const { context } = loadApp();
  context.saveManualPlayerPrice(
    "barcola-gold", 97000, "2026-09-20T00:00:00.000Z"
  );
  const item = { id: "watch-1", playerId: "barcola-gold", jugador: "Barcola" };
  assert.equal(context.getWatchlistDisplayData(item).market, 97000);
  assert.match(appSource, /value="' \+ e\(display\.market \?\? ""\) \+ '"/);
});

test("E. guardar precio válido crea el override manual compartido", () => {
  const { context, values } = loadApp();
  const result = context.saveManualPlayerPrice(
    "barcola-gold", "97000", "2026-09-20T00:00:00.000Z"
  );
  assert.equal(result.ok, true);
  assert.deepEqual(JSON.parse(values.get("xoluggPopularPrices")), {
    "barcola-gold": { price: 97000, updatedAt: "2026-09-20T00:00:00.000Z" }
  });
});

test("F. updatedAt cambia al guardar otra vez", () => {
  const { context } = loadApp();
  context.saveManualPlayerPrice("barcola-gold", 97000, "2026-09-20T00:00:00.000Z");
  context.saveManualPlayerPrice("barcola-gold", 98000, "2026-09-21T00:00:00.000Z");
  assert.equal(overrideState(context)["barcola-gold"].updatedAt,
    "2026-09-21T00:00:00.000Z");
});

test("G. guardar actualiza el precio resuelto por Watchlist", () => {
  const { context } = loadApp();
  const item = { playerId: "barcola-gold", mercado: 99500 };
  context.saveManualPlayerPrice("barcola-gold", 97000);
  assert.equal(context.getWatchlistMarket(item), 97000);
});

test("H. guardar actualiza el precio resuelto por Mercado Popular", () => {
  const { context } = loadApp();
  context.saveManualPlayerPrice("barcola-gold", 97000);
  assert.equal(context.getPopularPlayerData(players[0]).precioEfectivo, 97000);
});

test("I. Calculator actualiza mercado pero conserva Mi puja para el mismo ID", () => {
  const market = { value: "99500", step: 0 };
  const purchase = { value: "90000" };
  const { context } = loadApp({
    inputs: { jugador: { value: "Barcola" }, precioVenta: market, precioCompra: purchase }
  });
  vm.runInContext('selectedCalculatorPlayerId = "barcola-gold"', context);
  context.saveManualPlayerPrice("barcola-gold", 97000);
  assert.equal(context.updateCalculatorPriceForPlayer("barcola-gold"), true);
  assert.equal(market.value, 97000);
  assert.equal(purchase.value, "90000");
});

test("J. otro jugador activo en Calculator no cambia", () => {
  const market = { value: "60000", step: 0 };
  const { context } = loadApp({ inputs: { precioVenta: market } });
  vm.runInContext('selectedCalculatorPlayerId = "lacroix-gold"', context);
  context.saveManualPlayerPrice("barcola-gold", 97000);
  assert.equal(context.updateCalculatorPriceForPlayer("barcola-gold"), false);
  assert.equal(market.value, "60000");
});

test("K. cancelar no modifica el precio", () => {
  const { context } = loadApp();
  context.saveManualPlayerPrice("barcola-gold", 97000);
  setItems(context, [{ id: "watch-1", playerId: "barcola-gold", jugador: "Barcola" }]);
  vm.runInContext('editingWatchlistItemId = "watch-1"', context);
  context.cancelWatchlistPriceEdit("watch-1");
  assert.equal(overrideState(context)["barcola-gold"].price, 97000);
  assert.equal(vm.runInContext("editingWatchlistItemId", context), null);
});

for (const [letter, value] of [["L", "texto"], ["M", 0], ["N", -10]]) {
  test(`${letter}. el precio inválido ${String(value)} no se guarda`, () => {
    const { context, values } = loadApp();
    assert.equal(context.saveManualPlayerPrice("barcola-gold", value).ok, false);
    assert.equal(values.has("xoluggPopularPrices"), false);
  });
}

test("O. una carta sin precio FUTBIN acepta precio manual", () => {
  const { context } = loadApp();
  const noPrice = players[3];
  assert.equal(context.getPopularPlayerData(noPrice).precioEfectivo, null);
  context.saveManualPlayerPrice("no-price-special", 45000);
  assert.equal(context.getPopularPlayerData(noPrice).precioEfectivo, 45000);
});

test("P. dos versiones del mismo nombre conservan overrides separados por ID", () => {
  const { context } = loadApp();
  context.saveManualPlayerPrice("lacroix-gold", 55000);
  context.saveManualPlayerPrice("lacroix-special", 110000);
  assert.equal(context.getPopularPlayerData(players[1]).precioEfectivo, 55000);
  assert.equal(context.getPopularPlayerData(players[2]).precioEfectivo, 110000);
});

test("Q. sorting activo se reaplica al cambiar el precio", () => {
  const { context } = loadApp();
  const watch = [
    { id: "barcola", playerId: "barcola-gold", jugador: "Barcola" },
    { id: "lacroix", playerId: "lacroix-gold", jugador: "Lacroix" }
  ];
  const sorted = () => context.getWatchlistViewItems(watch, {
    query: "", sortKey: "mercado", sortDirection: "asc"
  }).map(row => row.item.id);
  assert.deepEqual(sorted(), ["lacroix", "barcola"]);
  context.saveManualPlayerPrice("barcola-gold", 50000);
  assert.deepEqual(sorted(), ["barcola", "lacroix"]);
});

test("R. búsqueda activa permanece después de editar", () => {
  const { context } = loadApp();
  vm.runInContext('watchlistView.query = "bar"; watchlistView.sortKey = "mercado"', context);
  context.saveManualPlayerPrice("barcola-gold", 97000);
  assert.deepEqual(viewState(context), {
    query: "bar", sortKey: "mercado", sortDirection: "asc"
  });
});

test("S. Recientes mantiene el orden de adición", () => {
  const { context } = loadApp();
  const watch = [
    { id: "new", playerId: "barcola-gold", jugador: "Barcola" },
    { id: "old", playerId: "lacroix-gold", jugador: "Lacroix" }
  ];
  context.saveManualPlayerPrice("lacroix-gold", 1000);
  assert.deepEqual(context.getWatchlistViewItems(watch).map(row => row.item.id),
    ["new", "old"]);
});

test("T. Compra buena se recalcula con el precio editado", () => {
  const { context } = loadApp();
  const item = { playerId: "barcola-gold", miPuja: 80000 };
  const before = context.getWatchlistDisplayData(item).thresholds.good;
  context.saveManualPlayerPrice("barcola-gold", 50000);
  assert.notEqual(context.getWatchlistDisplayData(item).thresholds.good, before);
});

test("U. Compra protegida se recalcula con el precio editado", () => {
  const { context } = loadApp();
  const item = { playerId: "barcola-gold", miPuja: 80000 };
  const before = context.getWatchlistDisplayData(item).thresholds.protected;
  context.saveManualPlayerPrice("barcola-gold", 50000);
  assert.notEqual(context.getWatchlistDisplayData(item).thresholds.protected, before);
});

test("V. Estado se recalcula con el precio editado", () => {
  const { context } = loadApp();
  const item = { playerId: "barcola-gold", miPuja: 90000 };
  const before = context.getWatchlistDisplayData(item).status.key;
  context.saveManualPlayerPrice("barcola-gold", 50000);
  assert.notEqual(context.getWatchlistDisplayData(item).status.key, before);
});

test("W. eliminar Watchlist sigue usando ID estable", () => {
  const { context } = loadApp();
  setItems(context, [
    { id: "new", playerId: "barcola-gold", jugador: "Barcola" },
    { id: "old", playerId: "lacroix-gold", jugador: "Lacroix" }
  ]);
  context.removeWatchlistItem("old");
  assert.deepEqual(plain(vm.runInContext("state.watchlist", context)).map(item => item.id),
    ["new"]);
});

test("X. backup incluye el mismo mapa de precios manuales", () => {
  const { context } = loadApp();
  context.saveManualPlayerPrice(
    "barcola-gold", 97000, "2026-09-20T00:00:00.000Z"
  );
  assert.deepEqual(plain(context.buildBackupData().popularPriceOverrides), {
    "barcola-gold": { price: 97000, updatedAt: "2026-09-20T00:00:00.000Z" }
  });
});

test("Y. snapshotObservedAt no cambia al editar manualmente", () => {
  const source = structuredClone(players[0]);
  const before = source.fuente.snapshotObservedAt;
  const { context } = loadApp({ catalog: [source] });
  context.saveManualPlayerPrice(source.id, 97000);
  assert.equal(source.fuente.snapshotObservedAt, before);
});

test("Z. lastMarketChangedAt no cambia al editar manualmente", () => {
  const source = structuredClone(players[0]);
  const before = source.fuente.lastMarketChangedAt;
  const { context } = loadApp({ catalog: [source] });
  context.saveManualPlayerPrice(source.id, 97000);
  assert.equal(source.fuente.lastMarketChangedAt, before);
});

test("AA. el override numérico legacy continúa funcionando", () => {
  const legacyCard = card("legacy", "Legacy", 10000);
  delete legacyCard.fuente.importedAt;
  const { context } = loadApp({ catalog: [legacyCard] });
  assert.equal(context.resolvePopularPrice(legacyCard, 8500).effectivePrice, 8500);
});

test("AB. edición desktop expone mouse, teclado, labels y foco visible", () => {
  assert.match(appSource, /data-watch-action="edit"/);
  assert.match(appSource, /event\.key === "Enter"/);
  assert.match(appSource, /event\.key === "Escape"/);
  assert.match(appSource, /Precio de mercado de/);
  assert.match(cssSource, /\.watchlist-action-button:focus-visible/);
  assert.match(cssSource, /\.watchlist-price-input:focus-visible/);
});

test("AC. mobile conserva scroll interno y acciones accesibles", () => {
  assert.match(cssSource,
    /\.watchlist-table\s*\{[^}]*min-width:\s*0;[^}]*table-layout:\s*fixed;/s);
  assert.match(cssSource,
    /\.watchlist-table-wrapper\s*\{[^}]*overflow-x:\s*hidden;[^}]*overflow-y:\s*auto;/s);
  assert.match(cssSource,
    /@media \(max-width:\s*550px\)[\s\S]*?\.watchlist-table-wrapper\s*\{[^}]*max-height:\s*340px;[^}]*overflow-x:\s*auto;/);
});

test("AD. Restaurar FUTBIN elimina solo el override de la carta exacta", () => {
  const { context } = loadApp();
  context.saveManualPlayerPrice("barcola-gold", 97000);
  context.saveManualPlayerPrice("lacroix-gold", 55000);
  assert.equal(context.removeManualPlayerPrice("barcola-gold").ok, true);
  assert.equal(context.getPopularPlayerData(players[0]).precioEfectivo, 99500);
  assert.equal(context.getPopularPlayerData(players[1]).precioEfectivo, 55000);
});

test("AE. Watchlist expone exactamente las seis columnas finales", () => {
  const header = htmlSource.match(
    /<table class="watchlist-table">[\s\S]*?<thead>([\s\S]*?)<\/thead>/
  )?.[1] || "";
  for (const label of [
    "Jugador", "Mercado", "Compra buena", "Compra protegida", "Mi puja", "Acciones"
  ]) {
    assert.match(header, new RegExp(label));
  }
  assert.doesNotMatch(header, /Estado|data-watch-sort="status"/);
  assert.equal((header.match(/<th\b/g) || []).length, 6);
});

test("AF. desktop cabe sin scroll horizontal y conserva scroll vertical", () => {
  assert.match(cssSource,
    /\.watchlist-table-wrapper\s*\{[^}]*overflow-x:\s*hidden;[^}]*overflow-y:\s*auto;/s);
  assert.match(cssSource,
    /\.watchlist-table\s*\{[^}]*min-width:\s*0;[^}]*table-layout:\s*fixed;/s);
  assert.match(cssSource, /th\s*\{[^}]*position:\s*sticky;[^}]*top:\s*0;/s);
  assert.match(appSource, /marketCell\.colSpan\s*=\s*4/);
});

test("AG. editor Watchlist reutiliza el helper dinámico y nunca step 1", () => {
  assert.match(appSource,
    /function focusWatchlistPriceInput\(\)[\s\S]*?aplicarStepDinamico\(input\)/);
  assert.match(appSource,
    /\.meta-price-input, \.watchlist-price-input/);
  assert.doesNotMatch(appSource,
    /id="watchlistPriceInput"[^>]*step="1"/);
});

test("AH. ArrowUp y ArrowDown usan el salto vigente del mercado", () => {
  const { context } = loadApp();
  const input = dynamicPriceInput(15750);
  context.aplicarStepDinamico(input);
  assert.equal(Number(input.step), 250);
  nativeStep(input, "up");
  assert.equal(Number(input.value), 16000);
  nativeStep(input, "down");
  assert.equal(Number(input.value), 15750);
});

test("AI. los controles cruzan rangos con el patrón común", () => {
  const { context } = loadApp();
  const input = dynamicPriceInput(10000);
  context.aplicarStepDinamico(input);
  nativeStep(input, "up");
  assert.equal(Number(input.value), 10250);
  assert.equal(Number(input.step), 250);
  nativeStep(input, "down");
  assert.equal(Number(input.value), 10000);
  assert.equal(Number(input.step), 100);
});

test("AJ. no existe una tabla de escalones propia de Watchlist", () => {
  const helperDefinitions = appSource.match(/function getMarketStep\s*\(/g) || [];
  assert.equal(helperDefinitions.length, 1);
  const renderSource = appSource.match(
    /function renderWatchlist\(\)[\s\S]*?\n}\r?\n\r?\n/
  )?.[0] || "";
  assert.doesNotMatch(renderSource, /1000|10000|50000|100000/);
});
