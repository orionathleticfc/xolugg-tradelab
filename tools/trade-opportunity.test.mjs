import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function loadApp({ stored = {}, players = [], inputs = {} } = {}) {
  const values = new Map(Object.entries(stored));
  const localStorage = {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
  const document = {
    addEventListener() {},
    getElementById: id => inputs[id] ?? null
  };
  const context = vm.createContext({
    window: { PLAYERS_DATA: players },
    document,
    localStorage,
    console: { log() {}, warn() {}, error() {} },
    structuredClone
  });
  vm.runInContext(
    fs.readFileSync(new URL("../app.js", import.meta.url), "utf8"),
    context
  );
  return { context, values, inputs };
}

const plain = value => JSON.parse(JSON.stringify(value));
const statusFor = (context, market, purchase) =>
  plain(context.classifyTradeOpportunity(
    context.calculateTradeOutcome(market, purchase)
  ));

test("A. 30,000 / 28,500 is the break-even limit", () => {
  const { context } = loadApp();
  const outcome = plain(context.calculateTradeOutcome(30000, 28500));
  assert.equal(outcome.net, 28500);
  assert.equal(outcome.breakEven, 28500);
  assert.equal(outcome.profit, 0);
  assert.equal(statusFor(context, 30000, 28500).key, "limit");
});

test("B. 30,000 / 28,000 has a positive current profit", () => {
  const { context } = loadApp();
  const outcome = plain(context.calculateTradeOutcome(30000, 28000));
  assert.equal(outcome.profit, 500);
  assert.equal(outcome.roi, 500 / 28000 * 100);
});

test("C. a current loss is NO COMPRAR", () => {
  const { context } = loadApp();
  assert.equal(statusFor(context, 30000, 28750).key, "avoid");
});

test("D. profit today that turns negative at -2.5% is MARGEN BAJO", () => {
  const { context } = loadApp();
  const outcome = plain(context.calculateTradeOutcome(30000, 28000));
  assert.ok(outcome.profit > 0);
  assert.ok(outcome.drop25.profit < 0);
  assert.equal(statusFor(context, 30000, 28000).key, "low");
});

test("E. profit at -2.5% but loss at -5% is BUENA COMPRA", () => {
  const { context } = loadApp();
  const outcome = plain(context.calculateTradeOutcome(30000, 27750));
  assert.ok(outcome.drop25.profit >= 0);
  assert.ok(outcome.drop5.profit < 0);
  assert.equal(statusFor(context, 30000, 27750).key, "good");
});

test("F. a non-negative -5% scenario is COMPRA PROTEGIDA", () => {
  const { context } = loadApp();
  const outcome = plain(context.calculateTradeOutcome(30000, 27000));
  assert.ok(outcome.drop5.profit >= 0);
  assert.ok(outcome.roi < 8);
  assert.equal(statusFor(context, 30000, 27000).key, "protected");
});

test("G. -5% protection plus at least 8% ROI is OPORTUNIDAD", () => {
  const { context } = loadApp();
  const outcome = plain(context.calculateTradeOutcome(30000, 26000));
  assert.ok(outcome.drop5.profit >= 0);
  assert.ok(outcome.roi >= 8);
  assert.equal(statusFor(context, 30000, 26000).key, "opportunity");
});

test("H. invalid prices return an explicit empty result without NaN or Infinity", () => {
  const { context } = loadApp();
  for (const value of [null, undefined, 0, -1, "no"]) {
    assert.equal(context.calculateTradeOutcome(value, 1000), null);
    assert.equal(context.calculateTradeOutcome(1000, value), null);
  }
  assert.equal(context.calculateMarketStress(30000, 0, 0.025), null);
  assert.deepEqual(plain(context.buildOpportunityTable(null)), []);
});

test("I. discount tables are stable, integer-only and deduplicated", () => {
  const { context } = loadApp();
  const rows = plain(context.buildOpportunityTable(30000));
  assert.deepEqual(rows.map(row => row.purchase), [
    28500, 27750, 27000, 26250, 25500
  ]);
  for (const market of [5000, 30000, 150000, 800000]) {
    const table = plain(context.buildOpportunityTable(market));
    const purchases = table.map(row => row.purchase);
    assert.equal(new Set(purchases).size, purchases.length);
    assert.ok(purchases.every(Number.isInteger));
    assert.ok(table.every(row =>
      Number.isFinite(row.outcome.profit) &&
      Number.isFinite(row.outcome.roi)
    ));
  }
});

test("J. legacy watchlist entries migrate without losing market or bid", () => {
  const { context } = loadApp();
  const migrated = plain(context.normalizeWatchlist([{
    id: 7,
    jugador: "Lacroix",
    venta: 30000,
    compraActual: 27300,
    compraIdealMin: 26000,
    compraMaxima: 28500,
    estado: "legacy",
    fecha: "2026-09-01T00:00:00.000Z"
  }]));
  assert.deepEqual(migrated, [{
    id: 7,
    playerId: null,
    jugador: "Lacroix",
    mercado: 30000,
    miPuja: 27300,
    fecha: "2026-09-01T00:00:00.000Z"
  }]);
});

test("K. old backups remain valid and their watchlist can be normalized", () => {
  const { context } = loadApp();
  const oldBackup = {
    state: {
      capital: 100000,
      watchlist: [{
        id: 8,
        jugador: "Gordon",
        venta: 12000,
        compraActual: 10500
      }],
      historial: []
    }
  };
  assert.equal(context.validarBackup(oldBackup), true);
  assert.deepEqual(
    plain(context.normalizeWatchlist(oldBackup.state.watchlist)),
    [{
      id: 8,
      playerId: null,
      jugador: "Gordon",
      mercado: 12000,
      miPuja: 10500,
      fecha: null
    }]
  );
});

test("L. player selection preloads the Phase 7 effective price", () => {
  const marketInput = { value: "", step: 0 };
  const card = {
    id: "gordon",
    nombre: "Gordon",
    precioReferencia: 12000,
    fuente: { importedAt: "2026-09-18T13:00:00.000Z" }
  };
  const { context } = loadApp({
    players: [card],
    inputs: { precioVenta: marketInput }
  });
  vm.runInContext(
    "popularPriceOverrides = {" +
      "gordon: { price: 11500, updatedAt: '2026-09-18T14:00:00.000Z' }" +
    "}",
    context
  );
  context.selectCalculatorPlayer({
    id: "gordon",
    name: "Gordon",
    normalized: "gordon"
  });
  assert.equal(marketInput.value, 11500);
  assert.equal(marketInput.step, context.getMarketStep(11500));
});

test("M. a valid market can be analyzed with an empty optional bid", () => {
  const { context } = loadApp({
    inputs: {
      jugador: { value: "Lacroix" },
      precioVenta: { value: "30000" },
      precioCompra: { value: "" }
    }
  });
  const result = plain(context.calcularTrade());
  assert.equal(result.market, 30000);
  assert.equal(result.purchase, null);
  assert.equal(result.net, 28500);
  assert.equal(result.status.key, "neutral");
  assert.equal(context.buildOpportunityTable(30000).length, 5);
});

test("N. 30,000 maximum without loss is 28,500", () => {
  const { context } = loadApp();
  const thresholds = plain(context.calculateBuyThresholds(30000));
  assert.equal(thresholds.breakEven, 28500);
});

test("O. good-buy threshold matches the non-loss -2.5% scenario", () => {
  const { context } = loadApp();
  const thresholds = plain(context.calculateBuyThresholds(30000));
  const atThreshold = plain(
    context.calculateMarketStress(30000, thresholds.good, 0.025)
  );
  assert.equal(thresholds.good, 27750);
  assert.ok(atThreshold.profit >= 0);
  assert.ok(
    context.calculateMarketStress(
      30000,
      thresholds.good + context.getMarketStep(thresholds.good),
      0.025
    ).profit < 0
  );
});

test("P. protected threshold matches the non-loss -5% scenario", () => {
  const { context } = loadApp();
  const thresholds = plain(context.calculateBuyThresholds(30000));
  const atThreshold = plain(
    context.calculateMarketStress(30000, thresholds.protected, 0.05)
  );
  assert.equal(thresholds.protected, 27000);
  assert.ok(atThreshold.profit >= 0);
  assert.ok(
    context.calculateMarketStress(
      30000,
      thresholds.protected + context.getMarketStep(thresholds.protected),
      0.05
    ).profit < 0
  );
});

test("Q. opportunity target satisfies -5% protection and at least 8% ROI", () => {
  const { context } = loadApp();
  const thresholds = plain(context.calculateBuyThresholds(30000));
  const outcome = plain(
    context.calculateTradeOutcome(30000, thresholds.opportunity)
  );
  assert.equal(thresholds.opportunity, 26250);
  assert.ok(outcome.drop5.profit >= 0);
  assert.ok(outcome.roi >= 8);
  assert.equal(
    plain(context.classifyTradeOpportunity(outcome)).key,
    "opportunity"
  );
});

test("R. watchlist data without a bid remains neutral and keeps targets", () => {
  const { context } = loadApp();
  const item = plain(context.normalizeWatchlist([{
    id: 12,
    jugador: "Lacroix",
    mercado: 30000,
    miPuja: null
  }]))[0];
  const display = plain(context.getWatchlistDisplayData(item));
  assert.equal(display.bid, null);
  assert.equal(display.thresholds.good, 27750);
  assert.equal(display.thresholds.protected, 27000);
  assert.equal(display.outcome, null);
  assert.equal(display.status.key, "neutral");
  assert.equal(display.status.label, "SIN PUJA");
});

test("S. footer renders v0.9.0 from the central application version", () => {
  const versionElement = { textContent: "" };
  const { context } = loadApp({
    inputs: { appVersion: versionElement }
  });
  context.renderAppVersion();
  assert.equal(versionElement.textContent, "v0.9.0");
});

test("T. new backups include appVersion 0.9.0 from the same source", () => {
  const { context } = loadApp();
  const backup = plain(context.buildBackupData());
  assert.equal(backup.appVersion, "0.9.0");
  assert.equal(backup.version, backup.appVersion);
});

test("U. legacy backups without appVersion remain valid", () => {
  const { context } = loadApp();
  assert.equal(context.validarBackup({
    state: {
      capital: 0,
      watchlist: [],
      historial: []
    }
  }), true);
});

test("V. the calculator has no active beneficioMinimo references", () => {
  const appSource = fs.readFileSync(
    new URL("../app.js", import.meta.url),
    "utf8"
  );
  const htmlSource = fs.readFileSync(
    new URL("../index.html", import.meta.url),
    "utf8"
  );
  assert.equal(appSource.includes("beneficioMinimo"), false);
  assert.equal(htmlSource.includes("beneficioMinimo"), false);
});

test("W. rapid watchlist additions receive distinct stable IDs", () => {
  const { context } = loadApp();
  const items = [{ id: 1000 }, { id: 1001 }];
  assert.equal(context.createUniqueWatchlistId(items, 1000), 1002);
  assert.equal(context.createUniqueWatchlistId(items, 2000), 2000);
});
