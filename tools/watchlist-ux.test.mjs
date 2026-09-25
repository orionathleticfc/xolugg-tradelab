import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const appSource = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const htmlSource = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const cssSource = fs.readFileSync(new URL("../style.css", import.meta.url), "utf8");

function loadApp({ inputs = {}, headers = [] } = {}) {
  const values = new Map();
  const document = {
    addEventListener() {},
    getElementById: id => inputs[id] ?? null,
    querySelectorAll: selector =>
      selector === "[data-watch-sort-header]" ? headers : []
  };
  const context = vm.createContext({
    window: { PLAYERS_DATA: [] },
    document,
    localStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
      removeItem: key => values.delete(key)
    },
    confirm: () => true,
    alert() {},
    console: { log() {}, warn() {}, error() {} },
    structuredClone
  });
  vm.runInContext(appSource, context);
  return { context, values };
}

const items = [
  { id: "new", jugador: "Zidane", mercado: 100000, miPuja: null },
  { id: "mid", jugador: "Álex", mercado: 9500, miPuja: 9000 },
  { id: "old", jugador: "Karchaoui", mercado: 25000, miPuja: 22000 }
];

const names = rows => rows.map(row => row.item.jugador);
const view = (context, options = {}, source = items) =>
  context.getWatchlistViewItems(source, {
    query: "",
    sortKey: null,
    sortDirection: "asc",
    ...options
  });
const setItems = (context, source) => {
  context.__items = source;
  vm.runInContext("state.watchlist = __items", context);
  delete context.__items;
};
const getState = context =>
  JSON.parse(vm.runInContext("JSON.stringify(state)", context));
const getViewState = context =>
  JSON.parse(vm.runInContext("JSON.stringify(watchlistView)", context));

test("A. el orden default conserva más recientes primero", () => {
  const { context } = loadApp();
  assert.deepEqual(names(view(context)), ["Zidane", "Álex", "Karchaoui"]);
});

test("B. Jugador ordena ascendente con comparación locale-aware", () => {
  const { context } = loadApp();
  assert.deepEqual(names(view(context, { sortKey: "jugador" })),
    ["Álex", "Karchaoui", "Zidane"]);
});

test("C. Jugador ordena descendente", () => {
  const { context } = loadApp();
  assert.deepEqual(names(view(context, {
    sortKey: "jugador", sortDirection: "desc"
  })), ["Zidane", "Karchaoui", "Álex"]);
});

test("D. Mercado ordena ascendente por número real", () => {
  const { context } = loadApp();
  assert.deepEqual(names(view(context, { sortKey: "mercado" })),
    ["Álex", "Karchaoui", "Zidane"]);
});

test("E. Mercado ordena descendente por número real", () => {
  const { context } = loadApp();
  assert.deepEqual(names(view(context, {
    sortKey: "mercado", sortDirection: "desc"
  })), ["Zidane", "Karchaoui", "Álex"]);
});

for (const [letter, sortKey] of [["F", "good"], ["G", "protected"]]) {
  test(`${letter}. ${sortKey} admite orden ascendente y descendente`, () => {
    const { context } = loadApp();
    const asc = names(view(context, { sortKey }));
    const desc = names(view(context, { sortKey, sortDirection: "desc" }));
    assert.deepEqual(asc, ["Álex", "Karchaoui", "Zidane"]);
    assert.deepEqual(desc, [...asc].reverse());
  });
}

test("H. Mi puja ordena numéricamente", () => {
  const { context } = loadApp();
  const source = [
    { id: 1, jugador: "A", mercado: 120000, miPuja: 100000 },
    { id: 2, jugador: "B", mercado: 30000, miPuja: 25000 },
    { id: 3, jugador: "C", mercado: 12000, miPuja: 9500 }
  ];
  assert.deepEqual(names(view(context, { sortKey: "bid" }, source)),
    ["C", "B", "A"]);
});

test("I. Mi puja vacía queda al final en ambas direcciones", () => {
  const { context } = loadApp();
  for (const sortDirection of ["asc", "desc"]) {
    const rows = view(context, { sortKey: "bid", sortDirection });
    assert.equal(rows.at(-1).item.id, "new");
  }
});

test("J. Estado se puede ordenar de forma estable", () => {
  const { context } = loadApp();
  const rows = view(context, { sortKey: "status" });
  const labels = rows.map(row => row.display.status.label);
  const expected = [...labels].sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base", numeric: true }));
  assert.deepEqual(labels, expected);
});

test("K. el segundo click invierte la dirección", () => {
  const { context } = loadApp();
  context.setWatchlistSort("mercado");
  assert.equal(getViewState(context).sortDirection, "asc");
  context.setWatchlistSort("mercado");
  assert.equal(getViewState(context).sortDirection, "desc");
});

test("L. Recientes restaura el orden default", () => {
  const { context } = loadApp();
  context.setWatchlistSort("jugador");
  context.resetWatchlistSort();
  assert.equal(getViewState(context).sortKey, null);
  assert.deepEqual(names(view(context)), names(view(context, getViewState(context))));
});

test("M. la búsqueda filtra por nombre", () => {
  const { context } = loadApp();
  assert.deepEqual(names(view(context, { query: "kar" })), ["Karchaoui"]);
});

test("N. la búsqueda ignora mayúsculas y acentos", () => {
  const { context } = loadApp();
  assert.deepEqual(names(view(context, { query: "ALEX" })), ["Álex"]);
});

test("O. búsqueda y sorting funcionan juntos", () => {
  const { context } = loadApp();
  const source = [
    { id: 1, jugador: "Karla", mercado: 30000, miPuja: 26000 },
    { id: 2, jugador: "Karchaoui", mercado: 10000, miPuja: 8000 },
    { id: 3, jugador: "Alexia", mercado: 5000, miPuja: 4000 }
  ];
  assert.deepEqual(names(view(context, {
    query: "kar", sortKey: "mercado", sortDirection: "desc"
  }, source)), ["Karla", "Karchaoui"]);
});

test("P. eliminar usa el ID estable y no el índice visual", () => {
  const { context } = loadApp();
  setItems(context, items);
  const firstVisual = view(context, { sortKey: "mercado" })[0].item;
  assert.equal(firstVisual.id, "mid");
  context.removeWatchlistItem(firstVisual.id);
  assert.deepEqual(getState(context).watchlist.map(item => item.id), ["new", "old"]);
});

test("Q. agregar con sort activo conserva el orden visual", () => {
  const inputs = {
    jugador: { value: "Zeta" },
    precioVenta: { value: "30000" },
    precioCompra: { value: "26000" }
  };
  const { context } = loadApp({ inputs });
  setItems(context, [{ id: "a", jugador: "Alpha", mercado: 10000, miPuja: 8000 }]);
  vm.runInContext('watchlistView.sortKey = "jugador"', context);
  context.addToWatchlist();
  assert.deepEqual(names(context.getWatchlistViewItems()), ["Alpha", "Zeta"]);
  assert.equal(getViewState(context).sortKey, "jugador");
});

test("R. agregar en modo default pone el nuevo jugador arriba", () => {
  const inputs = {
    jugador: { value: "Nuevo" },
    precioVenta: { value: "30000" },
    precioCompra: { value: "" }
  };
  const { context } = loadApp({ inputs });
  setItems(context, [{ id: "old", jugador: "Anterior", mercado: 10000, miPuja: null }]);
  context.addToWatchlist();
  assert.deepEqual(getState(context).watchlist.map(item => item.jugador),
    ["Nuevo", "Anterior"]);
});

test("S. limpiar vacía Watchlist y reinicia búsqueda y sorting", () => {
  const search = { value: "kar" };
  const { context } = loadApp({ inputs: { watchlistSearch: search } });
  setItems(context, items);
  vm.runInContext('watchlistView.query = "kar"; watchlistView.sortKey = "mercado"', context);
  context.limpiarWatchlist();
  assert.deepEqual(getState(context).watchlist, []);
  assert.deepEqual(getViewState(context), {
    query: "", sortKey: null, sortDirection: "asc"
  });
  assert.equal(search.value, "");
});

test("T. aria-sort se actualiza para la columna activa", () => {
  const indicator = { textContent: "" };
  const attributes = {};
  const header = {
    dataset: { watchSortHeader: "mercado" },
    classList: { toggle() {} },
    setAttribute: (name, value) => { attributes[name] = value; },
    querySelector: () => indicator
  };
  const { context } = loadApp({ headers: [header] });
  vm.runInContext(
    'watchlistView.sortKey = "mercado"; watchlistView.sortDirection = "desc"',
    context
  );
  context.updateWatchlistControls();
  assert.equal(attributes["aria-sort"], "descending");
  assert.equal(indicator.textContent, "↓");
});

test("U. mobile usa botones táctiles y no depende de hover", () => {
  assert.match(htmlSource, /<button class="watchlist-sort-button"[^>]+type="button">/);
  assert.match(cssSource, /\.watchlist-sort-button:focus-visible/);
  assert.doesNotMatch(cssSource, /@media \(hover: hover\)[\s\S]*?watchlist-sort-button/);
});

test("V. lista grande conserva scroll interno y header sticky", () => {
  assert.match(cssSource,
    /\.watchlist-table-wrapper\s*\{[^}]*max-height:\s*430px;[^}]*overflow:\s*auto;/s);
  assert.match(cssSource, /th\s*\{[^}]*position:\s*sticky;[^}]*top:\s*0;/s);
  assert.match(cssSource,
    /@media \(max-width:\s*550px\)[\s\S]*?\.watchlist-table-wrapper\s*\{[^}]*max-height:\s*340px;/);
  assert.match(htmlSource, /<label class="visually-hidden" for="watchlistSearch">/);
});
