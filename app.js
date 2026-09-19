/* =========================================================
   XOLUGG TRADELAB
   EA SPORTS FC 27
========================================================= */

const TAX_RATE = 0.05;
const OPPORTUNITY_ROI_THRESHOLD = 8;

const STORAGE_STATE = "xoluggTradeLab";
const STORAGE_META_PRICES = "xoluggMetaPrices";

const APP_VERSION = "0.9.0";


/* =========================================================
   ESTADO GENERAL
========================================================= */

let state = {
  capital: 0,
  watchlist: [],
  historial: []
};

let metaPriceOverrides = {};
let selectedCalculatorPlayerId = null;


/* =========================================================
   UTILIDADES
========================================================= */

function formatCoins(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  return Number(value).toLocaleString("es-CO");
}


function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}


function normalizeText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


/* =========================================================
   SALTOS DEL MERCADO

   <= 1000   = 50
   <= 10000  = 100
   <= 50000  = 250
   <= 100000 = 500
   > 100000  = 1000
========================================================= */

function getMarketStep(value) {
  const number = Number(value) || 0;

  if (number <= 1000) {
    return 50;
  }

  if (number <= 10000) {
    return 100;
  }

  if (number <= 50000) {
    return 250;
  }

  if (number <= 100000) {
    return 500;
  }

  return 1000;
}


function roundDownMarketPrice(value) {
  const number = Math.max(
    0,
    Number(value) || 0
  );

  const step =
    getMarketStep(number);

  return (
    Math.floor(
      number / step
    ) * step
  );
}


function normalizePositiveCoin(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }

  return Math.floor(number);
}


function getWatchlistBid(item) {
  return normalizePositiveCoin(
    item?.miPuja ??
    item?.compraActual
  );
}


function normalizeWatchlistItem(item, index = 0) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const jugador = String(item.jugador || "").trim();

  if (!jugador) {
    return null;
  }

  const id = item.id ??
    ("legacy-" + index + "-" + normalizeText(jugador));
  const playerId = item.playerId === undefined ||
    item.playerId === null || item.playerId === ""
    ? null
    : item.playerId;

  return {
    id,
    playerId,
    jugador,
    mercado: normalizePositiveCoin(
      item.mercado ??
      item.venta
    ),
    miPuja: getWatchlistBid(item),
    fecha: typeof item.fecha === "string"
      ? item.fecha
      : null
  };
}


function normalizeWatchlist(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeWatchlistItem)
    .filter(Boolean);
}


function aplicarStepDinamico(input) {
  if (!input) {
    return;
  }

  const esPrecio = input.matches(
    "#precioVenta, #precioCompra, #tradeCompra, #tradeVenta, #metaMaxPrice, .meta-price-input"
  );
  let valorAnterior = Number(input.value) || 0;

  const actualizarStep = () => {
    const valor =
      Number(input.value) || 0;

    input.step =
      getMarketStep(valor);
    valorAnterior = valor;
  };

  input.addEventListener(
    "input",
    (event) => {
      // Native arrows have no inputType; text editing does.
      if (esPrecio && !event.inputType && !event.isComposing) {
        const valor = Number(input.value) || 0;
        const redondeado = roundDownMarketPrice(valor);

        if (valor > valorAnterior && valor !== redondeado) {
          input.value = redondeado + getMarketStep(valor);
        } else if (valor < valorAnterior) {
          input.value = redondeado;
        }
      }

      actualizarStep();
    }
  );

  input.addEventListener(
    "focus",
    actualizarStep
  );

  actualizarStep();
}


function activarStepsDinamicos() {
  const ids = [
    "precioVenta",
    "precioCompra",
    "nuevoCapital",
    "tradeCompra",
    "tradeVenta",
    "metaMaxPrice"
  ];

  ids.forEach((id) => {
    const input =
      document.getElementById(id);

    if (input) {
      aplicarStepDinamico(input);
    }
  });
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function saveState() {
  localStorage.setItem(
    STORAGE_STATE,
    JSON.stringify(state)
  );
}


function loadState() {
  const saved =
    localStorage.getItem(
      STORAGE_STATE
    );

  if (!saved) {
    return;
  }

  try {
    const parsed =
      JSON.parse(saved);

    state = {
      capital:
        Number(parsed.capital) || 0,

      watchlist:
        normalizeWatchlist(
          parsed.watchlist
        ),

      historial:
        Array.isArray(
          parsed.historial
        )
          ? parsed.historial
          : []
    };
  } catch (error) {
    console.error(
      "Error cargando datos de XoluGG:",
      error
    );
  }
}


function saveMetaPrices() {
  localStorage.setItem(
    STORAGE_META_PRICES,
    JSON.stringify(
      metaPriceOverrides
    )
  );
}


function loadMetaPrices() {
  const saved =
    localStorage.getItem(
      STORAGE_META_PRICES
    );

  if (!saved) {
    return;
  }

  try {
    metaPriceOverrides =
      JSON.parse(saved) || {};
  } catch (error) {
    console.error(
      "Error cargando precios Meta:",
      error
    );

    metaPriceOverrides = {};
  }
}


/* =========================================================
   CÁLCULOS DE TRADE
========================================================= */

function calculateEaNet(salePrice) {
  const sale = normalizePositiveCoin(salePrice);

  return sale === null
    ? null
    : Math.floor(sale * (1 - TAX_RATE));
}


function calculateMarketScenario(marketPrice, dropRate) {
  const market = normalizePositiveCoin(marketPrice);
  const rate = Number(dropRate);

  if (
    market === null ||
    !Number.isFinite(rate) ||
    rate < 0 ||
    rate >= 1
  ) {
    return null;
  }

  const sale = roundDownMarketPrice(
    market * (1 - rate)
  );
  const net = calculateEaNet(sale);

  return {
    dropRate: rate,
    sale,
    net
  };
}


function calculateMarketStress(marketPrice, purchasePrice, dropRate) {
  const scenario = calculateMarketScenario(marketPrice, dropRate);
  const purchase = normalizePositiveCoin(purchasePrice);

  if (!scenario || purchase === null) {
    return null;
  }

  const profit = scenario.net - purchase;

  return {
    ...scenario,
    profit,
    profitable: profit >= 0
  };
}


function calculateMarketAnalysis(marketPrice) {
  const market = normalizePositiveCoin(marketPrice);

  if (market === null) {
    return null;
  }

  const net = calculateEaNet(market);

  return {
    market,
    tax: market - net,
    net,
    breakEven: net,
    drop25: calculateMarketScenario(market, 0.025),
    drop5: calculateMarketScenario(market, 0.05)
  };
}


function calculateTradeOutcome(marketPrice, purchasePrice) {
  const marketAnalysis = calculateMarketAnalysis(marketPrice);
  const purchase = normalizePositiveCoin(purchasePrice);

  if (!marketAnalysis || purchase === null) {
    return null;
  }

  const profit = marketAnalysis.net - purchase;
  const roi = (profit / purchase) * 100;

  return {
    ...marketAnalysis,
    purchase,
    profit,
    roi: Number.isFinite(roi) ? roi : 0,
    drop25: calculateMarketStress(marketAnalysis.market, purchase, 0.025),
    drop5: calculateMarketStress(marketAnalysis.market, purchase, 0.05)
  };
}


function classifyTradeOpportunity(outcome) {
  if (!outcome) {
    return {
      key: "neutral",
      className: "neutral",
      label: "SIN PUJA"
    };
  }

  if (outcome.profit < 0) {
    return {
      key: "avoid",
      className: "bad",
      label: "❌ NO COMPRAR"
    };
  }

  if (outcome.profit <= getMarketStep(outcome.purchase)) {
    return {
      key: "limit",
      className: "limit",
      label: "⚠️ LÍMITE"
    };
  }

  if (!outcome.drop25.profitable) {
    return {
      key: "low",
      className: "fair",
      label: "🟡 MARGEN BAJO"
    };
  }

  if (!outcome.drop5.profitable) {
    return {
      key: "good",
      className: "good",
      label: "✅ BUENA COMPRA"
    };
  }

  // OPORTUNIDAD requiere protección real ante -5% y ROI actual de al menos 8%.
  if (outcome.roi >= OPPORTUNITY_ROI_THRESHOLD) {
    return {
      key: "opportunity",
      className: "excellent",
      label: "🔥 OPORTUNIDAD"
    };
  }

  return {
    key: "protected",
    className: "protected",
    label: "🛡️ COMPRA PROTEGIDA"
  };
}


function calculateBuyThresholds(marketPrice) {
  const market = normalizePositiveCoin(marketPrice);

  if (market === null) {
    return null;
  }

  const current = calculateMarketScenario(market, 0);
  const drop25 = calculateMarketScenario(market, 0.025);
  const drop5 = calculateMarketScenario(market, 0.05);

  return {
    breakEven: roundDownMarketPrice(current.net),
    good: roundDownMarketPrice(drop25.net),
    protected: roundDownMarketPrice(drop5.net),
    opportunity: roundDownMarketPrice(
      Math.min(
        drop5.net,
        current.net /
          (1 + OPPORTUNITY_ROI_THRESHOLD / 100)
      )
    )
  };
}


function buildOpportunityTable(marketPrice) {
  const market = normalizePositiveCoin(marketPrice);

  if (market === null) {
    return [];
  }

  const discounts = [0.05, 0.075, 0.10, 0.125, 0.15];
  const rows = [];
  const purchases = new Set();

  discounts.forEach((discount) => {
    const purchase = roundDownMarketPrice(
      market * (1 - discount)
    );

    if (purchase <= 0 || purchases.has(purchase)) {
      return;
    }

    purchases.add(purchase);
    const outcome = calculateTradeOutcome(market, purchase);

    rows.push({
      purchase,
      discount: ((market - purchase) / market) * 100,
      reference: formatPercent(discount * 100) + " desc.",
      outcome,
      status: classifyTradeOpportunity(outcome)
    });
  });

  const thresholds = calculateBuyThresholds(market);

  if (
    thresholds.breakEven > 0 &&
    !purchases.has(thresholds.breakEven)
  ) {
    const purchase = thresholds.breakEven;
    const outcome = calculateTradeOutcome(market, purchase);

    rows.push({
      purchase,
      discount: ((market - purchase) / market) * 100,
      reference: "Equilibrio",
      outcome,
      status: classifyTradeOpportunity(outcome)
    });
  }

  return rows.sort(
    (left, right) =>
      right.purchase - left.purchase
  );
}


/* =========================================================
   CAPITAL
========================================================= */

function renderCapital() {
  const invertido =
    state.watchlist.reduce(
      (total, item) => {
        return (
          total +
          Number(
            getWatchlistBid(item) || 0
          )
        );
      },
      0
    );


  const beneficioDia =
    state.historial.reduce(
      (total, trade) => {
        if (!trade.fecha) {
          return total;
        }

        const fechaTrade =
          new Date(trade.fecha);

        const hoy =
          new Date();


        const mismoDia =
          fechaTrade.getFullYear() ===
            hoy.getFullYear() &&

          fechaTrade.getMonth() ===
            hoy.getMonth() &&

          fechaTrade.getDate() ===
            hoy.getDate();


        if (!mismoDia) {
          return total;
        }


        return (
          total +
          Number(
            trade.beneficio || 0
          )
        );
      },
      0
    );


  const capitalLibre = getPopularAvailableCapital();


  const capitalActualEl =
    document.getElementById(
      "capitalActual"
    );

  const invertidoEl =
    document.getElementById(
      "capitalInvertido"
    );

  const libreEl =
    document.getElementById(
      "capitalLibre"
    );

  const beneficioEl =
    document.getElementById(
      "beneficioDia"
    );


  if (capitalActualEl) {
    capitalActualEl.textContent =
      formatCoins(
        state.capital
      );
  }


  if (invertidoEl) {
    invertidoEl.textContent =
      formatCoins(
        invertido
      );
  }


  if (libreEl) {
    libreEl.textContent =
      formatCoins(
        capitalLibre
      );
  }


  if (beneficioEl) {
    beneficioEl.textContent =
      beneficioDia >= 0
        ? `+${formatCoins(
            beneficioDia
          )}`
        : formatCoins(
            beneficioDia
          );

    beneficioEl.className =
      beneficioDia >= 0
        ? "positive"
        : "negative";
  }
  if (document.getElementById("popularOnlyAffordable")?.checked) {
    renderPopularPlayers();
  }
}


/* =========================================================
   ACTUALIZAR CAPITAL
========================================================= */

function actualizarCapital() {
  const input =
    document.getElementById(
      "nuevoCapital"
    );


  if (!input) {
    return;
  }


  if (
    input.value.trim() === ""
  ) {
    alert(
      "Ingresa tu capital actual."
    );

    return;
  }


  const nuevoCapital =
    Number(input.value);


  if (
    Number.isNaN(
      nuevoCapital
    ) ||
    nuevoCapital < 0
  ) {
    alert(
      "Ingresa un capital válido."
    );

    return;
  }


  state.capital =
    nuevoCapital;


  saveState();
  renderCapital();


  input.value = "";
}


/* =========================================================
   CALCULADORA
========================================================= */

function formatSignedCoins(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number > 0
    ? "+" + formatCoins(number)
    : formatCoins(number);
}


function updateResultText(id, value, className = "") {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
    element.className = className;
  }
}


function renderStressScenario(prefix, scenario) {
  if (!scenario) {
    ["Venta", "Neto", "Beneficio"].forEach(
      (suffix) => updateResultText(prefix + suffix, "—")
    );
    updateResultText(prefix + "Estado", "Sin datos");
    return;
  }

  const hasPurchase = Number.isFinite(scenario.profit);

  updateResultText(prefix + "Venta", formatCoins(scenario.sale));
  updateResultText(prefix + "Neto", formatCoins(scenario.net));
  updateResultText(
    prefix + "Beneficio",
    hasPurchase ? formatSignedCoins(scenario.profit) : "Sin puja",
    hasPurchase
      ? scenario.profitable ? "positive" : "negative"
      : ""
  );
  updateResultText(
    prefix + "Estado",
    hasPurchase
      ? scenario.profitable ? "Sigue rentable" : "Produce pérdida"
      : "Escenario calculado",
    hasPurchase
      ? scenario.profitable ? "positive" : "negative"
      : ""
  );
}


function renderTargetPrices(thresholds) {
  updateResultText("targetBreakEven", formatCoins(thresholds?.breakEven));
  updateResultText(
    "targetGood",
    thresholds ? "≤ " + formatCoins(thresholds.good) : "—"
  );
  updateResultText(
    "targetProtected",
    thresholds ? "≤ " + formatCoins(thresholds.protected) : "—"
  );
  updateResultText(
    "targetOpportunity",
    thresholds ? "≤ " + formatCoins(thresholds.opportunity) : "—"
  );

  const hint = document.getElementById("purchaseTargetsHint");

  if (hint) {
    hint.textContent = thresholds
      ? "Buena compra: ≤ " + formatCoins(thresholds.good) +
        " · Protegida: ≤ " + formatCoins(thresholds.protected)
      : "La puja es opcional; primero puedes analizar el mercado.";
  }
}


function setCalculatorMessage(message = "", isError = false) {
  const element = document.getElementById("calculatorMessage");

  if (!element) {
    return;
  }

  element.textContent = message;
  element.className = isError
    ? "calculator-message error"
    : "calculator-message";
}


function renderOpportunityTable(marketPrice) {
  const tbody = document.getElementById("opportunityTableBody");

  if (!tbody) {
    return;
  }

  const rows = buildOpportunityTable(marketPrice);
  tbody.innerHTML = "";

  if (!rows.length) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="empty-table-cell">Ingresa un mercado válido para generar oportunidades.</td></tr>';
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    const drop25Class = row.outcome.drop25.profitable ? "positive" : "negative";
    const drop5Class = row.outcome.drop5.profitable ? "positive" : "negative";

    tr.innerHTML =
      "<td><strong>" + formatCoins(row.purchase) + "</strong></td>" +
      "<td title='" + row.reference + "'>" + formatPercent(row.discount) + "</td>" +
      "<td class='" + (row.outcome.profit >= 0 ? "positive" : "negative") + "'>" +
        formatSignedCoins(row.outcome.profit) + "</td>" +
      "<td>" + formatPercent(row.outcome.roi) + "</td>" +
      "<td class='" + drop25Class + "'>" +
        formatSignedCoins(row.outcome.drop25.profit) + "</td>" +
      "<td class='" + drop5Class + "'>" +
        formatSignedCoins(row.outcome.drop5.profit) + "</td>" +
      "<td><span class='opportunity-badge " + row.status.className + "'>" +
        row.status.label + "</span></td>";

    tbody.appendChild(tr);
  });
}


function calcularTrade() {
  const jugador = document.getElementById("jugador")?.value.trim() || "";
  const marketValue = document.getElementById("precioVenta")?.value ?? "";
  const purchaseValue = document.getElementById("precioCompra")?.value ?? "";
  const marketAnalysis = calculateMarketAnalysis(marketValue);

  if (!marketAnalysis) {
    setCalculatorMessage(
      "Ingresa un precio de mercado válido para analizar oportunidades.",
      true
    );
    updateResultText("resultadoJugador", jugador || "Esperando jugador");
    [
      "resultadoMercado",
      "resultadoNeto",
      "resultadoEquilibrio",
      "resultadoCompra",
      "resultadoBeneficio",
      "resultadoROI"
    ].forEach((id) => updateResultText(id, "—"));
    renderTargetPrices(null);
    renderStressScenario("scenario25", null);
    renderStressScenario("scenario5", null);
    renderOpportunityTable(null);

    const statusElement = document.getElementById("estadoTrade");

    if (statusElement) {
      statusElement.className = "trade-status neutral";
      statusElement.textContent = "MERCADO PENDIENTE";
    }

    return null;
  }

  const thresholds = calculateBuyThresholds(marketAnalysis.market);
  const purchase = normalizePositiveCoin(purchaseValue);
  const hasPurchase = purchase !== null;
  const outcome = hasPurchase
    ? calculateTradeOutcome(marketAnalysis.market, purchase)
    : null;
  const status = classifyTradeOpportunity(outcome);

  setCalculatorMessage(
    purchaseValue !== "" && !hasPurchase
      ? "La puja debe ser mayor que 0. El análisis de mercado sigue disponible."
      : ""
  );
  updateResultText("resultadoJugador", jugador || "Jugador sin nombre");
  updateResultText("resultadoMercado", formatCoins(marketAnalysis.market));
  updateResultText("resultadoNeto", formatCoins(marketAnalysis.net));
  updateResultText("resultadoEquilibrio", formatCoins(thresholds.breakEven));
  updateResultText(
    "resultadoCompra",
    hasPurchase ? formatCoins(outcome.purchase) : "Sin precio todavía"
  );
  updateResultText(
    "resultadoBeneficio",
    hasPurchase ? formatSignedCoins(outcome.profit) : "—",
    hasPurchase
      ? outcome.profit >= 0 ? "positive" : "negative"
      : ""
  );
  updateResultText(
    "resultadoROI",
    hasPurchase ? formatPercent(outcome.roi) : "—"
  );
  renderTargetPrices(thresholds);
  renderStressScenario(
    "scenario25",
    hasPurchase ? outcome.drop25 : marketAnalysis.drop25
  );
  renderStressScenario(
    "scenario5",
    hasPurchase ? outcome.drop5 : marketAnalysis.drop5
  );
  renderOpportunityTable(marketAnalysis.market);

  const statusElement = document.getElementById("estadoTrade");

  if (statusElement) {
    statusElement.className = "trade-status " + status.className;
    statusElement.textContent = hasPurchase
      ? status.label
      : "ANÁLISIS DE MERCADO · SIN PUJA";
  }

  return {
    jugador,
    playerId: selectedCalculatorPlayerId,
    ...marketAnalysis,
    purchase: hasPurchase ? outcome.purchase : null,
    profit: hasPurchase ? outcome.profit : null,
    roi: hasPurchase ? outcome.roi : null,
    drop25: hasPurchase ? outcome.drop25 : marketAnalysis.drop25,
    drop5: hasPurchase ? outcome.drop5 : marketAnalysis.drop5,
    status,
    thresholds
  };
}


/* =========================================================
   WATCHLIST
========================================================= */

function createUniqueWatchlistId(
  items = state.watchlist,
  timestamp = Date.now()
) {
  const usedIds = new Set(
    items.map((item) => String(item.id))
  );
  let id = Math.floor(timestamp);

  while (usedIds.has(String(id))) {
    id += 1;
  }

  return id;
}


function addToWatchlist() {
  const result = calcularTrade();

  if (!result) {
    return;
  }

  if (!result.jugador) {
    setCalculatorMessage(
      "Escribe o selecciona un jugador antes de añadirlo a Watchlist.",
      true
    );
    return;
  }

  state.watchlist.unshift({
    id: createUniqueWatchlistId(),
    playerId: result.playerId,
    jugador: result.jugador,
    mercado: result.market,
    miPuja: result.purchase,
    fecha: new Date().toISOString()
  });

  saveState();
  renderWatchlist();
  renderCapital();
  setCalculatorMessage("Jugador añadido a Watchlist.");
}


function getWatchlistMarket(item) {
  const basePlayer = item.playerId === null || item.playerId === undefined
    ? null
    : getPopularPlayers().find(
        (player) => String(player.id) === String(item.playerId)
      );
  const effectivePrice = basePlayer
    ? getPopularPlayerData(basePlayer).precioEfectivo
    : null;

  return normalizePositiveCoin(effectivePrice) ??
    normalizePositiveCoin(item.mercado);
}


function getWatchlistDisplayData(item) {
  const market = getWatchlistMarket(item);
  const bid = getWatchlistBid(item);
  const thresholds = calculateBuyThresholds(market);
  const outcome = calculateTradeOutcome(market, bid);

  return {
    market,
    bid,
    thresholds,
    outcome,
    status: classifyTradeOpportunity(outcome)
  };
}


function renderWatchlist() {
  const tbody = document.getElementById("watchlistBody");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";

  if (state.watchlist.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="empty-table-cell">No hay jugadores en seguimiento</td></tr>';
    return;
  }

  state.watchlist.forEach((item) => {
    const display = getWatchlistDisplayData(item);
    const tr = document.createElement("tr");
    const playerCell = document.createElement("td");
    const playerName = document.createElement("strong");
    playerName.textContent = item.jugador;
    playerCell.appendChild(playerName);
    tr.appendChild(playerCell);

    [
      formatCoins(display.market),
      display.thresholds
        ? "≤ " + formatCoins(display.thresholds.good)
        : "—",
      display.thresholds
        ? "≤ " + formatCoins(display.thresholds.protected)
        : "—",
      formatCoins(display.bid)
    ].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      tr.appendChild(cell);
    });

    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "opportunity-badge " + display.status.className;
    badge.textContent = display.status.label;
    statusCell.appendChild(badge);
    tr.appendChild(statusCell);

    const actionCell = document.createElement("td");
    actionCell.innerHTML =
      '<button class="remove-button" data-watch-delete="' +
      String(item.id) +
      '" type="button" title="Eliminar">×</button>';
    tr.appendChild(actionCell);
    tbody.appendChild(tr);
  });
}


function removeWatchlistItem(id) {
  state.watchlist = state.watchlist.filter(
    (item) => String(item.id) !== String(id)
  );

  saveState();
  renderWatchlist();
  renderCapital();
}


function limpiarWatchlist() {
  if (state.watchlist.length === 0) {
    return;
  }

  if (!confirm("¿Quieres limpiar toda la watchlist?")) {
    return;
  }

  state.watchlist = [];
  saveState();
  renderWatchlist();
  renderCapital();
}


/* =========================================================
   HISTORIAL
========================================================= */

function registrarTrade() {
  const jugadorInput =
    document.getElementById(
      "tradeJugador"
    );

  const compraInput =
    document.getElementById(
      "tradeCompra"
    );

  const ventaInput =
    document.getElementById(
      "tradeVenta"
    );


  const jugador =
    jugadorInput
      ? jugadorInput.value.trim()
      : "";


  const compra =
    compraInput
      ? Number(
          compraInput.value
        )
      : 0;


  const venta =
    ventaInput
      ? Number(
          ventaInput.value
        )
      : 0;


  if (
    !jugador ||
    !compra ||
    !venta
  ) {
    alert(
      "Completa jugador, compra y venta."
    );

    return;
  }


  const neto =
    calculateEaNet(venta);


  const beneficio =
    neto - compra;


  const roi =
    compra > 0
      ? (
          beneficio /
          compra
        ) * 100
      : 0;


  const trade = {
    id:
      Date.now(),

    jugador,

    compra,

    venta,

    neto,

    beneficio,

    roi,

    fecha:
      new Date().toISOString()
  };


  state.historial.unshift(
    trade
  );


  state.capital +=
    beneficio;


  saveState();
  renderHistorial();
  renderCapital();


  if (jugadorInput) {
    jugadorInput.value = "";
  }


  if (compraInput) {
    compraInput.value = "";
  }


  if (ventaInput) {
    ventaInput.value = "";
  }
}


function renderHistorial() {
  const tbody =
    document.getElementById(
      "historialBody"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = "";


  if (
    state.historial.length === 0
  ) {
    tbody.innerHTML = `
      <tr>
        <td
          colspan="6"
          style="
            text-align:center;
            color:#8fa8b3;
          "
        >
          Todavía no hay trades registrados
        </td>
      </tr>
    `;

    return;
  }


  state.historial.forEach(
    (trade) => {
      const tr =
        document.createElement(
          "tr"
        );


      const beneficioClass =
        trade.beneficio >= 0
          ? "positive"
          : "negative";


      tr.innerHTML = `
        <td>
          <strong>
            ${trade.jugador}
          </strong>
        </td>

        <td>
          ${formatCoins(
            trade.compra
          )}
        </td>

        <td>
          ${formatCoins(
            trade.venta
          )}
        </td>

        <td
          class="${beneficioClass}"
        >
          ${
            trade.beneficio >= 0
              ? "+"
              : ""
          }

          ${formatCoins(
            trade.beneficio
          )}
        </td>

        <td>
          ${formatPercent(
            trade.roi
          )}
        </td>

        <td>
          <button
            class="remove-button"
            data-history-delete="${trade.id}"
            type="button"
            title="Eliminar"
          >
            ×
          </button>
        </td>
      `;


      tbody.appendChild(
        tr
      );
    }
  );
}


function removeHistorialItem(id) {
  const trade =
    state.historial.find(
      (item) =>
        Number(item.id) ===
        Number(id)
    );


  if (trade) {
    state.capital -=
      Number(
        trade.beneficio || 0
      );
  }


  state.historial =
    state.historial.filter(
      (item) =>
        Number(item.id) !==
        Number(id)
    );


  saveState();
  renderHistorial();
  renderCapital();
}


function limpiarHistorial() {
  if (
    state.historial.length === 0
  ) {
    return;
  }


  const confirmar =
    confirm(
      "¿Quieres limpiar todo el historial?"
    );


  if (!confirmar) {
    return;
  }


  /*
     Limpiar historial NO modifica
     el capital actual.
  */

  state.historial = [];


  saveState();
  renderHistorial();
  renderCapital();
}


/* =========================================================
   CATÁLOGO POPULAR (DIAGNÓSTICO)
========================================================= */

function getPopularPlayers() {
  return Array.isArray(window.PLAYERS_DATA)
    ? window.PLAYERS_DATA
    : [];
}


function validatePopularPlayersCatalog() {
  const players = getPopularPlayers();
  const ids = players
    .map((player) => player?.id)
    .filter((id) => typeof id === "string" && id.trim() !== "");
  const conPrecioReferencia = players.filter(
    (player) => Number.isFinite(player?.precioReferencia) &&
      player.precioReferencia > 0
  ).length;
  const porteros = players.filter(
    (player) => player?.posicionPrincipal === "GK"
  ).length;

  const resumen = {
    total: players.length,
    idsUnicos: new Set(ids).size,
    conPrecioReferencia,
    sinPrecioReferencia: players.length - conPrecioReferencia,
    porteros,
    jugadoresCampo: players.length - porteros
  };

  console.log("Popular Players cargados: " + resumen.total);
  console.log("IDs únicos: " + resumen.idsUnicos);
  console.log("Con precio referencia: " + resumen.conPrecioReferencia);
  console.log("Sin precio referencia: " + resumen.sinPrecioReferencia);
  console.log("Porteros: " + resumen.porteros);
  console.log("Jugadores de campo: " + resumen.jugadoresCampo);

  return resumen;
}


/* =========================================================
   BASE DE JUGADORES META
========================================================= */

function getMetaPlayers() {
  if (
    !Array.isArray(
      window.META_PLAYERS
    )
  ) {
    console.warn(
      "META_PLAYERS no está disponible."
    );

    return [];
  }


  return window.META_PLAYERS;
}


/* =========================================================
   DATOS META + PRECIOS LOCALES
========================================================= */

function getMetaPlayerData(player) {
  const override =
    metaPriceOverrides[
      player.id
    ];


  let precioMercado =
    player.precioMercado;


  let ultimaActualizacion =
    player.ultimaActualizacion;


  if (
    override &&
    Object.prototype
      .hasOwnProperty.call(
        override,
        "precioMercado"
      )
  ) {
    precioMercado =
      override.precioMercado;
  }


  if (
    override &&
    Object.prototype
      .hasOwnProperty.call(
        override,
        "ultimaActualizacion"
      )
  ) {
    ultimaActualizacion =
      override.ultimaActualizacion;
  }


  let compraIdealMin = null;
  let compraIdealMax = null;
  let compraMaxima = null;


  if (
    precioMercado !== null &&
    precioMercado !== undefined &&
    Number(precioMercado) > 0
  ) {
    const thresholds =
      calculateBuyThresholds(
        precioMercado
      );


    compraIdealMin =
      thresholds.protected;

    compraIdealMax =
      thresholds.good;

    compraMaxima =
      thresholds.breakEven;
  }


  return {
    ...player,

    precioMercado,

    ultimaActualizacion,

    compraIdealMin,

    compraIdealMax,

    compraMaxima
  };
}


/* =========================================================
   PRIORIDAD META
========================================================= */

function renderMetaPriority(
  prioridad
) {
  const cantidad =
    Number(prioridad) || 0;


  if (cantidad <= 0) {
    return "—";
  }


  return "🔥".repeat(
    cantidad
  );
}


/* =========================================================
   ANTIGÜEDAD DEL PRECIO
========================================================= */

function getPriceFreshness(
  dateString
) {
  if (!dateString) {
    return {
      className: "unknown",
      text: "Sin fecha"
    };
  }


  const date =
    new Date(
      dateString
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return {
      className: "unknown",
      text: "Sin fecha"
    };
  }


  const now =
    new Date();


  const diffMs =
    now - date;


  const diffMinutes =
    Math.max(
      0,
      Math.floor(
        diffMs / 60000
      )
    );


  if (diffMinutes < 1) {
    return {
      className: "fresh",
      text: "Ahora"
    };
  }


  if (diffMinutes < 30) {
    return {
      className: "fresh",
      text:
        `${diffMinutes} min`
    };
  }


  if (diffMinutes <= 90) {
    return {
      className: "warning",
      text:
        `${diffMinutes} min`
    };
  }


  const diffHours =
    Math.floor(
      diffMinutes / 60
    );


  if (diffHours < 24) {
    return {
      className: "old",
      text:
        `${diffHours} h`
    };
  }


  const diffDays =
    Math.floor(
      diffHours / 24
    );


  return {
    className: "old",
    text:
      `${diffDays} d`
  };
}


/* =========================================================
   COPIAR NOMBRE DEL JUGADOR
========================================================= */

async function copiarNombreJugador(
  playerId,
  button
) {
  const player =
    getMetaPlayers().find(
      (item) =>
        item.id === playerId
    );


  if (!player) {
    return;
  }


  const nombre =
    player.nombre;


  let copiado = false;


  /* CLIPBOARD API */

  try {
    if (
      navigator.clipboard &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(
        nombre
      );

      copiado = true;
    }
  } catch (error) {
    console.warn(
      "Clipboard API no disponible:",
      error
    );
  }


  /* FALLBACK */

  if (!copiado) {
    try {
      const textarea =
        document.createElement(
          "textarea"
        );


      textarea.value =
        nombre;


      textarea.setAttribute(
        "readonly",
        ""
      );


      textarea.style.position =
        "absolute";


      textarea.style.left =
        "-9999px";


      document.body.appendChild(
        textarea
      );


      textarea.select();


      textarea.setSelectionRange(
        0,
        textarea.value.length
      );


      copiado =
        document.execCommand(
          "copy"
        );


      document.body.removeChild(
        textarea
      );
    } catch (error) {
      console.error(
        "No se pudo copiar:",
        error
      );
    }
  }


  /* CONFIRMACIÓN */

  if (
    copiado &&
    button
  ) {
    const contenidoOriginal =
      button.innerHTML;


    button.innerHTML =
      "✓ Copiado";


    button.classList.add(
      "copied"
    );


    button.disabled = true;


    setTimeout(
      () => {
        button.innerHTML =
          contenidoOriginal;

        button.classList.remove(
          "copied"
        );

        button.disabled = false;
      },
      1200
    );
  }


  if (!copiado) {
    alert(
      `No se pudo copiar automáticamente.\n\nNombre: ${nombre}`
    );
  }
}


/* =========================================================
   FILTROS + ORDENAMIENTO META
========================================================= */

function getFilteredMetaPlayers() {
  let players =
    getMetaPlayers()

      .filter(
        (player) =>
          player.activo !== false
      )

      .map(
        getMetaPlayerData
      );


  const search =
    normalizeText(
      document
        .getElementById(
          "metaSearch"
        )
        ?.value
    );


  const category =
    document
      .getElementById(
        "metaCategory"
      )
      ?.value ||
    "ALL";


  const priority =
    document
      .getElementById(
        "metaPriority"
      )
      ?.value ||
    "ALL";


  const sort =
    document
      .getElementById(
        "metaSort"
      )
      ?.value ||
    "meta-desc";


  const maxPriceValue =
    document
      .getElementById(
        "metaMaxPrice"
      )
      ?.value;


  const maxPrice =
    maxPriceValue
      ? Number(
          maxPriceValue
        )
      : null;


  const onlyWithPrice =
    document
      .getElementById(
        "metaOnlyWithPrice"
      )
      ?.checked ||
    false;


  /* =====================================================
     BUSCADOR
  ===================================================== */

  if (search) {
    players =
      players.filter(
        (player) => {
          const searchable =
            normalizeText(
              [
                player.nombre,

                player.posicionPrincipal,

                ...(
                  player.posiciones ||
                  []
                ),

                ...(
                  player.tags ||
                  []
                ),

                player.perfil
              ].join(" ")
            );


          return searchable.includes(
            search
          );
        }
      );
  }


  /* =====================================================
     CATEGORÍA
  ===================================================== */

  if (
    category !== "ALL"
  ) {
    players =
      players.filter(
        (player) =>
          player.categoria ===
          category
      );
  }


  /* =====================================================
     PRIORIDAD
  ===================================================== */

  if (
    priority !== "ALL"
  ) {
    players =
      players.filter(
        (player) =>
          Number(
            player.prioridadMeta
          ) ===
          Number(priority)
      );
  }


  /* =====================================================
     SOLO CON PRECIO
  ===================================================== */

  if (
    onlyWithPrice
  ) {
    players =
      players.filter(
        (player) =>
          Number(
            player.precioMercado
          ) > 0
      );
  }


  /* =====================================================
     PRECIO MÁXIMO
  ===================================================== */

  if (
    maxPrice !== null &&
    !Number.isNaN(
      maxPrice
    )
  ) {
    players =
      players.filter(
        (player) => {
          const price =
            Number(
              player.precioMercado
            );


          return (
            price > 0 &&
            price <= maxPrice
          );
        }
      );
  }


  /* =====================================================
     ORDENAMIENTO
  ===================================================== */

  players.sort(
    (a, b) => {

      let result = 0;


      switch (sort) {

        /* -----------------------------------------
           NOMBRE A-Z
        ----------------------------------------- */

        case "name-asc":

          result =
            a.nombre.localeCompare(
              b.nombre,
              "es"
            );

          break;


        /* -----------------------------------------
           NOMBRE Z-A
        ----------------------------------------- */

        case "name-desc":

          result =
            b.nombre.localeCompare(
              a.nombre,
              "es"
            );

          break;


        /* -----------------------------------------
           PRECIO MENOR -> MAYOR
           Sin precio se van al final
        ----------------------------------------- */

        case "price-asc": {

          const priceA =
            Number(
              a.precioMercado
            ) > 0
              ? Number(
                  a.precioMercado
                )
              : Infinity;


          const priceB =
            Number(
              b.precioMercado
            ) > 0
              ? Number(
                  b.precioMercado
                )
              : Infinity;


          result =
            priceA - priceB;

          break;
        }


        /* -----------------------------------------
           PRECIO MAYOR -> MENOR
           Sin precio se van al final
        ----------------------------------------- */

        case "price-desc": {

          const priceA =
            Number(
              a.precioMercado
            ) > 0
              ? Number(
                  a.precioMercado
                )
              : -Infinity;


          const priceB =
            Number(
              b.precioMercado
            ) > 0
              ? Number(
                  b.precioMercado
                )
              : -Infinity;


          result =
            priceB - priceA;

          break;
        }


        /* -----------------------------------------
           OVR MAYOR -> MENOR
        ----------------------------------------- */

        case "ovr-desc": {

          const ovrA =
            a.ovr !== null &&
            a.ovr !== undefined
              ? Number(a.ovr)
              : -Infinity;


          const ovrB =
            b.ovr !== null &&
            b.ovr !== undefined
              ? Number(b.ovr)
              : -Infinity;


          result =
            ovrB - ovrA;

          break;
        }


        /* -----------------------------------------
           OVR MENOR -> MAYOR
        ----------------------------------------- */

        case "ovr-asc": {

          const ovrA =
            a.ovr !== null &&
            a.ovr !== undefined
              ? Number(a.ovr)
              : Infinity;


          const ovrB =
            b.ovr !== null &&
            b.ovr !== undefined
              ? Number(b.ovr)
              : Infinity;


          result =
            ovrA - ovrB;

          break;
        }


        /* -----------------------------------------
           META MENOR -> MAYOR
        ----------------------------------------- */

        case "meta-asc":

          result =
            Number(
              a.prioridadMeta
            ) -
            Number(
              b.prioridadMeta
            );

          break;


        /* -----------------------------------------
           META MAYOR -> MENOR
        ----------------------------------------- */

        case "meta-desc":

          result =
            Number(
              b.prioridadMeta
            ) -
            Number(
              a.prioridadMeta
            );

          break;


        /* -----------------------------------------
           COMPRA MÁXIMA MENOR -> MAYOR
        ----------------------------------------- */

        case "maxbuy-asc": {

          const maxA =
            a.compraMaxima !== null &&
            a.compraMaxima !== undefined
              ? Number(
                  a.compraMaxima
                )
              : Infinity;


          const maxB =
            b.compraMaxima !== null &&
            b.compraMaxima !== undefined
              ? Number(
                  b.compraMaxima
                )
              : Infinity;


          result =
            maxA - maxB;

          break;
        }


        /* -----------------------------------------
           COMPRA MÁXIMA MAYOR -> MENOR
        ----------------------------------------- */

        case "maxbuy-desc": {

          const maxA =
            a.compraMaxima !== null &&
            a.compraMaxima !== undefined
              ? Number(
                  a.compraMaxima
                )
              : -Infinity;


          const maxB =
            b.compraMaxima !== null &&
            b.compraMaxima !== undefined
              ? Number(
                  b.compraMaxima
                )
              : -Infinity;


          result =
            maxB - maxA;

          break;
        }


        /* -----------------------------------------
           MÁS RECIENTEMENTE ACTUALIZADO
        ----------------------------------------- */

        case "updated-desc": {

          const dateA =
            a.ultimaActualizacion
              ? new Date(
                  a.ultimaActualizacion
                ).getTime()
              : 0;


          const dateB =
            b.ultimaActualizacion
              ? new Date(
                  b.ultimaActualizacion
                ).getTime()
              : 0;


          result =
            dateB - dateA;

          break;
        }


        /* -----------------------------------------
           DEFAULT
        ----------------------------------------- */

        default:

          result =
            Number(
              b.prioridadMeta
            ) -
            Number(
              a.prioridadMeta
            );

          break;
      }


      /*
         Si dos jugadores tienen el mismo valor
         los ordenamos por nombre para que la tabla
         sea estable y predecible.
      */

      if (result === 0) {
        return a.nombre.localeCompare(
          b.nombre,
          "es"
        );
      }


      return result;
    }
  );


  return players;
}


/* =========================================================
   RENDER JUGADORES META
========================================================= */

function renderMetaPlayers() {
  const tbody =
    document.getElementById(
      "metaPlayersBody"
    );


  if (!tbody) {
    return;
  }


  const players =
    getFilteredMetaPlayers();


  const counter =
    document.getElementById(
      "metaPlayersCount"
    );


  if (counter) {
    counter.textContent =
      players.length;
  }


  tbody.innerHTML = "";


  if (
    players.length === 0
  ) {
    tbody.innerHTML = `
      <tr>
        <td
          colspan="9"
          style="
            text-align:center;
            color:#8fa8b3;
          "
        >
          No hay jugadores que coincidan con los filtros.
        </td>
      </tr>
    `;

    return;
  }


  players.forEach(
    (player) => {
      const freshness =
        getPriceFreshness(
          player.ultimaActualizacion
        );


      const precioInput =
        Number(
          player.precioMercado
        ) > 0
          ? player.precioMercado
          : "";


      const posiciones =
        Array.isArray(
          player.posiciones
        )
          ? player.posiciones.join(
              ", "
            )
          : player.posicionPrincipal;


      const tags =
        Array.isArray(
          player.tags
        )
          ? player.tags
              .slice(0, 3)
              .join(" · ")
          : "";


      const freshnessDot =
        freshness.className ===
          "unknown"
          ? ""
          : "●";


      const tr =
        document.createElement(
          "tr"
        );


      tr.innerHTML = `

        <!-- JUGADOR -->

        <td>

          <div
            class="meta-player-name"
            title="${player.perfil || ""}"
          >

            <div
              class="meta-player-name-row"
            >

              <strong>
                ${player.nombre}
              </strong>


              <button
                class="copy-player-button"
                data-meta-action="copy-name"
                data-player-id="${player.id}"
                type="button"
                title="Copiar nombre de ${player.nombre}"
              >
                📋
              </button>

            </div>


            <span>
              ${tags}
            </span>

          </div>

        </td>


        <!-- POSICIÓN -->

        <td>

          <span
            class="meta-position"
            title="${posiciones}"
          >

            ${player.posicionPrincipal}

          </span>

        </td>


        <!-- OVR -->

        <td>

          ${
            player.ovr !== null &&
            player.ovr !== undefined
              ? player.ovr
              : "—"
          }

        </td>


        <!-- META -->

        <td>

          <span
            class="meta-priority"
          >

            ${renderMetaPriority(
              player.prioridadMeta
            )}

          </span>

        </td>


        <!-- PRECIO -->

        <td>

          <div
            style="
              display:flex;
              align-items:center;
              gap:5px;
            "
          >

            <input
              type="number"
              class="meta-price-input"
              data-player-id="${player.id}"
              value="${precioInput}"
              placeholder="Precio"
              min="0"
              style="
                width:90px;
                height:30px;
                padding:4px 6px;
                font-size:11px;
              "
            />


            <button
              class="meta-action-btn"
              data-meta-action="save-price"
              data-player-id="${player.id}"
              type="button"
              title="Guardar precio"
            >
              💾
            </button>

          </div>

        </td>


        <!-- COMPRA IDEAL -->

        <td>

          ${
            player.compraIdealMin !== null
              ? `
                ${formatCoins(
                  player.compraIdealMin
                )}
                -
                ${formatCoins(
                  player.compraIdealMax
                )}
              `
              : "—"
          }

        </td>


        <!-- MÁXIMO -->

        <td>

          ${
            player.compraMaxima !== null
              ? formatCoins(
                  player.compraMaxima
                )
              : "—"
          }

        </td>


        <!-- ACTUALIZACIÓN -->

        <td>

          <span
            class="
              price-freshness
              ${freshness.className}
            "
          >

            ${freshnessDot}

            ${freshness.text}

          </span>

        </td>


        <!-- ACCIÓN -->

        <td>

          <button
            class="meta-action-btn"
            data-meta-action="calculator"
            data-player-id="${player.id}"
            type="button"
            title="Enviar a calculadora"
          >
            🧮 Calcular
          </button>

        </td>

      `;


      tbody.appendChild(
        tr
      );
    }
  );


  activarStepsMetaInputs();
}


/* =========================================================
   STEPS EN PRECIOS META
========================================================= */

function activarStepsMetaInputs() {
  const inputs =
    document.querySelectorAll(
      ".meta-price-input"
    );


  inputs.forEach(
    (input) => {
      aplicarStepDinamico(
        input
      );
    }
  );
}


/* =========================================================
   ACTUALIZAR PRECIO META
========================================================= */

function actualizarPrecioMeta(
  playerId
) {
  const input =
    document.querySelector(
      `.meta-price-input[data-player-id="${playerId}"]`
    );


  if (!input) {
    return;
  }


  /*
     CAMPO VACÍO =
     BORRAR PRECIO MANUAL
  */

  if (
    input.value.trim() === ""
  ) {
    metaPriceOverrides[
      playerId
    ] = {
      precioMercado:
        null,

      ultimaActualizacion:
        null
    };


    saveMetaPrices();
    renderMetaPlayers();

    return;
  }


  const price =
    Number(input.value);


  if (
    Number.isNaN(price) ||
    price <= 0
  ) {
    alert(
      "Ingresa un precio válido."
    );

    return;
  }


  metaPriceOverrides[
    playerId
  ] = {
    precioMercado:
      price,

    ultimaActualizacion:
      new Date().toISOString()
  };


  saveMetaPrices();
  renderMetaPlayers();
}


/* =========================================================
   USAR META EN CALCULADORA
========================================================= */

function usarMetaEnCalculadora(playerId) {
  const basePlayer = getMetaPlayers().find(
    (player) => player.id === playerId
  );

  if (!basePlayer) {
    return;
  }

  const player = getMetaPlayerData(basePlayer);
  document.querySelector(
    '.nav-tab[data-section="dashboardSection"]'
  )?.click();

  const jugadorInput = document.getElementById("jugador");
  const marketInput = document.getElementById("precioVenta");
  const purchaseInput = document.getElementById("precioCompra");

  if (jugadorInput) {
    jugadorInput.value = player.nombre;
  }

  selectedCalculatorPlayerId = null;

  if (marketInput) {
    marketInput.value = player.precioMercado ?? "";
  }

  if (purchaseInput) {
    purchaseInput.value = "";
    purchaseInput.focus();
  }

  calcularTrade();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   LIMPIAR FILTROS META
========================================================= */

function limpiarFiltrosMeta() {
  const search =
    document.getElementById(
      "metaSearch"
    );

  const category =
    document.getElementById(
      "metaCategory"
    );

  const priority =
    document.getElementById(
      "metaPriority"
    );

  const sort =
    document.getElementById(
      "metaSort"
    );

  const maxPrice =
    document.getElementById(
      "metaMaxPrice"
    );

  const onlyWithPrice =
    document.getElementById(
      "metaOnlyWithPrice"
    );


  if (search) {
    search.value = "";
  }


  if (category) {
    category.value =
      "ALL";
  }


  if (priority) {
    priority.value =
      "ALL";
  }


  if (sort) {
    sort.value =
      "meta-desc";
  }


  if (maxPrice) {
    maxPrice.value = "";
  }


  if (onlyWithPrice) {
    onlyWithPrice.checked =
      false;
  }


  renderMetaPlayers();
}


/* =========================================================
   EVENTOS META
========================================================= */

function configurarEventosMeta() {
  const search =
    document.getElementById(
      "metaSearch"
    );

  const category =
    document.getElementById(
      "metaCategory"
    );

  const priority =
    document.getElementById(
      "metaPriority"
    );

  const sort =
    document.getElementById(
      "metaSort"
    );

  const maxPrice =
    document.getElementById(
      "metaMaxPrice"
    );

  const onlyWithPrice =
    document.getElementById(
      "metaOnlyWithPrice"
    );

  const clear =
    document.getElementById(
      "btnClearMetaFilters"
    );


  search?.addEventListener(
    "input",
    renderMetaPlayers
  );


  category?.addEventListener(
    "change",
    renderMetaPlayers
  );


  priority?.addEventListener(
    "change",
    renderMetaPlayers
  );


  sort?.addEventListener(
    "change",
    renderMetaPlayers
  );


  maxPrice?.addEventListener(
    "input",
    renderMetaPlayers
  );


  onlyWithPrice?.addEventListener(
    "change",
    renderMetaPlayers
  );


  clear?.addEventListener(
    "click",
    limpiarFiltrosMeta
  );


  const tbody =
    document.getElementById(
      "metaPlayersBody"
    );


  /* ACCIONES TABLA */

  tbody?.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          "[data-meta-action]"
        );


      if (!button) {
        return;
      }


      const action =
        button.dataset.metaAction;


      const playerId =
        button.dataset.playerId;


      if (
        action ===
        "save-price"
      ) {
        actualizarPrecioMeta(
          playerId
        );
      }


      if (
        action ===
        "copy-name"
      ) {
        copiarNombreJugador(
          playerId,
          button
        );
      }


      if (
        action ===
        "calculator"
      ) {
        usarMetaEnCalculadora(
          playerId
        );
      }
    }
  );


  /* ENTER EN PRECIO = GUARDAR */

  tbody?.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key !== "Enter"
      ) {
        return;
      }


      const input =
        event.target.closest(
          ".meta-price-input"
        );


      if (!input) {
        return;
      }


      actualizarPrecioMeta(
        input.dataset.playerId
      );
    }
  );
}


/* =========================================================
   EVENTOS WATCHLIST / HISTORIAL
========================================================= */

function configurarEventosTablas() {
  const watchlistBody =
    document.getElementById(
      "watchlistBody"
    );


  watchlistBody?.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          "[data-watch-delete]"
        );


      if (!button) {
        return;
      }


      removeWatchlistItem(
        button.dataset
          .watchDelete
      );
    }
  );


  const historialBody =
    document.getElementById(
      "historialBody"
    );


  historialBody?.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          "[data-history-delete]"
        );


      if (!button) {
        return;
      }


      removeHistorialItem(
        button.dataset
          .historyDelete
      );
    }
  );
}


/* =========================================================
   ENTER EN CALCULADORA
========================================================= */

function configurarEnterCalculadora() {
  const ids = [
    "jugador",
    "precioVenta",
    "precioCompra"
  ];


  ids.forEach(
    (id) => {
      const input =
        document.getElementById(
          id
        );


      input?.addEventListener(
        "keydown",
        (event) => {
          if (
            event.key ===
            "Enter" && !event.defaultPrevented && !event.isComposing
          ) {
            calcularTrade();
          }
        }
      );
    }
  );
}


/* =========================================================
   BACKUP
========================================================= */

function getLocalDateString() {
  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  return (
    `${year}-${month}-${day}`
  );
}


/* =========================================================
   EXPORTAR BACKUP
========================================================= */

function buildBackupData() {
  return {
    app: "XoluGG TradeLab",
    appVersion: APP_VERSION,
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    state: {
      capital: state.capital,
      watchlist: state.watchlist,
      historial: state.historial
    },
    metaPriceOverrides,
    popularPriceOverrides
  };
}


function exportarBackup() {
  saveState();
  saveMetaPrices();
  savePopularPrices();


  const backup =
    buildBackupData();


  const json =
    JSON.stringify(
      backup,
      null,
      2
    );


  const blob =
    new Blob(
      [json],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    `xolugg-backup-${getLocalDateString()}.json`;


  document.body.appendChild(
    link
  );


  link.click();


  document.body.removeChild(
    link
  );


  URL.revokeObjectURL(
    url
  );
}


/* =========================================================
   ABRIR IMPORTADOR
========================================================= */

function abrirImportadorBackup() {
  const input =
    document.getElementById(
      "backupFileInput"
    );


  if (!input) {
    return;
  }


  input.value = "";


  input.click();
}


/* =========================================================
   VALIDAR BACKUP
========================================================= */

function validarBackup(data) {
  if (
    !data ||
    typeof data !==
      "object"
  ) {
    return false;
  }


  if (
    !data.state ||
    typeof data.state !==
      "object"
  ) {
    return false;
  }


  if (
    typeof data.state.capital !==
      "number"
  ) {
    return false;
  }


  if (
    !Array.isArray(
      data.state.watchlist
    )
  ) {
    return false;
  }


  if (
    !Array.isArray(
      data.state.historial
    )
  ) {
    return false;
  }


  if (
    "popularPriceOverrides" in data &&
    (
      !data.popularPriceOverrides ||
      typeof data.popularPriceOverrides !== "object" ||
      Array.isArray(data.popularPriceOverrides)
    )
  ) {
    return false;
  }


  return true;
}


/* =========================================================
   IMPORTAR BACKUP
========================================================= */

function importarBackupArchivo(
  event
) {
  const file =
    event.target.files?.[0];


  if (!file) {
    return;
  }


  const reader =
    new FileReader();


  reader.onload =
    function (
      readerEvent
    ) {
      try {
        const contenido =
          readerEvent
            .target
            .result;


        const data =
          JSON.parse(
            contenido
          );


        if (
          !validarBackup(
            data
          )
        ) {
          alert(
            "El archivo seleccionado no parece ser un backup válido de XoluGG TradeLab."
          );

          return;
        }


        const confirmar =
          confirm(
            "Esto reemplazará los datos actuales de XoluGG TradeLab por los datos del backup.\n\n¿Deseas continuar?"
          );


        if (!confirmar) {
          return;
        }


        state = {
          capital:
            Number(
              data.state.capital
            ) || 0,

          watchlist:
            normalizeWatchlist(
              data.state.watchlist
            ),

          historial:
            Array.isArray(
              data.state.historial
            )
              ? data.state.historial
              : []
        };


        metaPriceOverrides =
          data.metaPriceOverrides &&
          typeof (
            data.metaPriceOverrides
          ) === "object"
            ? data.metaPriceOverrides
            : {};


        popularPriceOverrides = normalizePopularPrices(data.popularPriceOverrides);

        saveState();
        saveMetaPrices();
        savePopularPrices();


        renderCapital();
        renderWatchlist();
        renderHistorial();
        renderPopularPlayers();


        alert(
          "✅ Backup importado correctamente."
        );
      } catch (error) {
        console.error(
          "Error importando backup:",
          error
        );


        alert(
          "No se pudo leer el archivo. Verifica que sea un JSON exportado desde XoluGG TradeLab."
        );
      }
    };


  reader.onerror =
    function () {
      alert(
        "No se pudo leer el archivo seleccionado."
      );
    };


  reader.readAsText(
    file
  );
}


/* =========================================================
   EVENTOS BACKUP
========================================================= */

function configurarEventosBackup() {
  const exportButton =
    document.getElementById(
      "btnExportBackup"
    );

  const importButton =
    document.getElementById(
      "btnImportBackup"
    );

  const input =
    document.getElementById(
      "backupFileInput"
    );


  exportButton?.addEventListener(
    "click",
    exportarBackup
  );


  importButton?.addEventListener(
    "click",
    abrirImportadorBackup
  );


  input?.addEventListener(
    "change",
    importarBackupArchivo
  );
}



/* =========================================================
   MERCADO POPULAR
========================================================= */

const STORAGE_POPULAR_PRICES = "xoluggPopularPrices";
let popularPriceOverrides = {};

function normalizePopularPriceEntry(entry) {
  let price;
  let rawUpdatedAt = null;

  if (typeof entry === "number") {
    price = entry;
  } else if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    price = Object.prototype.hasOwnProperty.call(entry, "price")
      ? entry.price : entry.precioUsuario;
    rawUpdatedAt = typeof entry.updatedAt === "string"
      ? entry.updatedAt
      : typeof entry.ultimaActualizacion === "string"
      ? entry.ultimaActualizacion
      : null;
  }

  if (!Number.isFinite(price) || price <= 0) return null;
  if (rawUpdatedAt === null) return { price, updatedAt: null };

  const timestamp = Date.parse(rawUpdatedAt);
  if (!Number.isFinite(timestamp)) return null;
  return { price, updatedAt: new Date(timestamp).toISOString() };
}

function normalizePopularPrices(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([id, entry]) => {
    const normalized = normalizePopularPriceEntry(entry);
    return id.trim() && normalized ? [[id, normalized]] : [];
  }));
}

function loadPopularPrices() {
  try {
    const stored = localStorage.getItem(STORAGE_POPULAR_PRICES) || "{}";
    popularPriceOverrides = normalizePopularPrices(JSON.parse(stored));
    const migrated = JSON.stringify(popularPriceOverrides);
    if (stored !== migrated) localStorage.setItem(STORAGE_POPULAR_PRICES, migrated);
  } catch (error) {
    console.warn("No se pudieron cargar los precios populares:", error);
    popularPriceOverrides = {};
  }
}

function savePopularPrices() {
  popularPriceOverrides = normalizePopularPrices(popularPriceOverrides);
  localStorage.setItem(STORAGE_POPULAR_PRICES, JSON.stringify(popularPriceOverrides));
}

function resolvePopularPrice(card, manualEntry) {
  const referencePrice = Number.isFinite(card?.precioReferencia) &&
    card.precioReferencia > 0 ? card.precioReferencia : null;
  const manual = normalizePopularPriceEntry(manualEntry);
  const importedAt = typeof card?.fuente?.importedAt === "string"
    ? Date.parse(card.fuente.importedAt) : NaN;
  const manualUpdatedAt = manual?.updatedAt ? Date.parse(manual.updatedAt) : NaN;
  const manualWins = !!manual && (
    !Number.isFinite(importedAt) ||
    (Number.isFinite(manualUpdatedAt) && manualUpdatedAt > importedAt)
  );
  const manualPrice = manualWins ? manual.price : null;
  const effectivePrice = manualPrice ?? referencePrice;

  return {
    referencePrice,
    manualPrice,
    effectivePrice,
    manualUpdatedAt: manualWins ? manual.updatedAt : null,
    manualExpired: !!manual && !manualWins,
    source: manualWins ? "Manual" : referencePrice !== null ? "Referencia" : "Sin precio"
  };
}

function getPopularPlayerData(card) {
  const manual = Object.prototype.hasOwnProperty.call(popularPriceOverrides, card.id)
    ? popularPriceOverrides[card.id] : null;
  const price = resolvePopularPrice(card, manual);
  const precioUsuario = price.manualPrice;
  const precioEfectivo = price.effectivePrice;
  const thresholds = calculateBuyThresholds(precioEfectivo);
  return {
    ...card,
    precioUsuario,
    precioEfectivo,
    ultimaActualizacion: price.manualUpdatedAt,
    fuentePrecio: price.source,
    precioManualCaducado: price.manualExpired,
    compraIdealMin: thresholds?.protected ?? null,
    compraIdealMax: thresholds?.good ?? null,
    compraMaxima: thresholds?.breakEven ?? null
  };
}


let popularQuickPriceLimit = null;

function getPopularAvailableCapital() {
  const invested = state.watchlist.reduce(
    (total, item) => total + Number(getWatchlistBid(item) || 0), 0
  );
  return Math.max(0, state.capital - invested);
}

function readPopularFilters() {
  const number = (id, zeroIsEmpty = false) => {
    const value = document.getElementById(id)?.value ?? "";
    const parsed = Number(value);
    return value.trim() === "" || (zeroIsEmpty && parsed === 0) ? null : parsed;
  };
  const checked = id => document.getElementById(id)?.checked || false;
  return {
    search: normalizeText(document.getElementById("metaSearch")?.value),
    position: document.getElementById("metaCategory")?.value || "ALL",
    maxPrice: number("metaMaxPrice"),
    onlyPrice: checked("metaOnlyWithPrice"),
    minOvr: number("popularMinOvr", true),
    maxOvr: number("popularMaxOvr", true),
    minPac: number("popularMinPac", true),
    minSkills: number("popularMinSkills"),
    minWeakFoot: number("popularMinWeakFoot"),
    minRating: number("popularMinRating", true),
    minPopularity: number("popularMinPopularity", true),
    affordable: checked("popularOnlyAffordable"),
    manual: checked("popularOnlyManual"),
    reference: checked("popularOnlyReference"),
    availableCapital: getPopularAvailableCapital()
  };
}

function matchesPopularFilters(card, filters) {
  const minimum = (value, limit) => limit === null ||
    (Number.isFinite(value) && Number.isFinite(limit) && value >= limit);
  const maximum = (value, limit) => limit === null ||
    (Number.isFinite(value) && Number.isFinite(limit) && value <= limit);
  return (!filters.search || normalizeText(card.nombre).includes(filters.search)) &&
    (filters.position === "ALL" || card.posicionPrincipal === filters.position ||
      (card.posiciones || []).includes(filters.position)) &&
    (!filters.onlyPrice || card.precioEfectivo > 0) &&
    maximum(card.precioEfectivo, filters.maxPrice) &&
    (popularQuickPriceLimit === null || card.precioEfectivo < popularQuickPriceLimit) &&
    minimum(card.ovr, filters.minOvr) &&
    maximum(card.ovr, filters.maxOvr) &&
    (filters.minPac === null || (card.posicionPrincipal !== "GK" &&
      minimum(card.stats?.pac, filters.minPac))) &&
    minimum(card.skills, filters.minSkills) &&
    minimum(card.weakFoot, filters.minWeakFoot) &&
    minimum(card.ratingFuente, filters.minRating) &&
    minimum(card.popularidadFuente, filters.minPopularity) &&
    (!filters.affordable || (card.precioEfectivo > 0 &&
      card.precioEfectivo <= filters.availableCapital)) &&
    (!filters.manual || card.precioUsuario !== null) &&
    (!filters.reference || card.precioReferencia > 0);
}

function updatePopularQuickPriceButtons() {
  document.querySelectorAll("[data-popular-price-limit]").forEach(button => {
    const active = Number(button.dataset.popularPriceLimit) === popularQuickPriceLimit;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function configurarFiltrosPopularesAvanzados() {
  for (const id of ["popularMinOvr", "popularMaxOvr", "popularMinPac",
    "popularMinRating", "popularMinPopularity"]) {
    document.getElementById(id)?.addEventListener("input", renderPopularPlayers);
  }
  for (const id of ["popularMinSkills", "popularMinWeakFoot",
    "popularOnlyAffordable", "popularOnlyManual", "popularOnlyReference"]) {
    document.getElementById(id)?.addEventListener("change", renderPopularPlayers);
  }
  document.querySelectorAll("[data-popular-price-limit]").forEach(button => {
    button.addEventListener("click", () => {
      popularQuickPriceLimit = Number(button.dataset.popularPriceLimit);
      document.getElementById("metaMaxPrice").value = String(popularQuickPriceLimit);
      renderPopularPlayers();
    });
  });
}


function getFilteredPopularPlayers() {
  const filters = readPopularFilters();
  const sort = document.getElementById("metaSort")?.value || "popularity-desc";
  const cards = getPopularPlayers().filter(card => card.activo !== false)
    .map(getPopularPlayerData).filter(card => matchesPopularFilters(card, filters));
  const sorts = {
    "popularity-desc": ["popularidadFuente", -1],
    "popularity-asc": ["popularidadFuente", 1],
    "price-asc": ["precioEfectivo", 1],
    "price-desc": ["precioEfectivo", -1],
    "rating-desc": ["ratingFuente", -1],
    "ovr-desc": ["ovr", -1],
    "ovr-asc": ["ovr", 1],
    "pac-desc": ["pac", -1],
    "skills-desc": ["skills", -1],
    "weakfoot-desc": ["weakFoot", -1],
    "updated-desc": ["ultimaActualizacion", -1]
  };
  return cards.sort((a, b) => {
    let result = 0;
    if (sort === "name-asc" || sort === "name-desc") {
      result = a.nombre.localeCompare(b.nombre, "es") * (sort === "name-desc" ? -1 : 1);
    } else {
      const [key, direction] = sorts[sort] || sorts["popularity-desc"];
      const value = card => key === "pac"
        ? (card.posicionPrincipal === "GK" ? null : card.stats?.pac)
        : key === "ultimaActualizacion"
        ? (card[key] ? Date.parse(card[key]) : null) : card[key];
      const av = value(a), bv = value(b);
      const missingA = !Number.isFinite(av), missingB = !Number.isFinite(bv);
      if (missingA !== missingB) return missingA ? 1 : -1;
      if (!missingA) result = (av - bv) * direction;
    }
    return result || a.nombre.localeCompare(b.nombre, "es") || a.id.localeCompare(b.id);
  });
}

function escapePopularHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}


const expandedPopularCards = new Set();

function renderPopularPlayerDetails(player) {
  const e = escapePopularHtml;
  const value = input => e(input ?? "—");
  const field = (label, content) =>
    `<div class="popular-detail-field"><dt>${e(label)}</dt><dd>${content}</dd></div>`;
  const alternatives = (player.posiciones || []).filter(p => p !== player.posicionPrincipal);
  const statKeys = player.posicionPrincipal === "GK"
    ? ["div", "han", "kic", "ref", "spd", "pos"]
    : ["pac", "sho", "pas", "dri", "def", "phy"];
  const priceSource = player.fuentePrecio;
  const row = document.createElement("tr");
  row.id = "popular-details-" + player.id;
  row.className = "popular-detail-row";
  row.innerHTML = `<td colspan="10">
    <div class="popular-detail-panel" role="region" aria-label="Detalles de ${e(player.nombre)}">
      <dl class="popular-detail-grid">
        ${field("Nombre", value(player.nombre))}
        ${field("OVR", value(player.ovr))}
        ${field("Posición principal", value(player.posicionPrincipal))}
        ${field("Posiciones alternativas", value(alternatives.length ? alternatives.join(", ") : null))}
        ${field("Versión", e(player.version ?? "Sin identificar"))}
        ${field("Tipo de carta", e(player.tipoCarta ?? "Sin identificar"))}
        ${field("Fuente", value(player.fuente?.nombre ?? (typeof player.fuente === "string" ? player.fuente : null)))}
        ${field("Página PDF", value(player.paginaFuente ?? player.fuente?.paginaPdf))}
      </dl>
      <div class="popular-detail-stats" aria-label="Estadísticas">
        ${statKeys.map(key => `<div class="popular-stat"><span>${key.toUpperCase()}</span>
          <strong>${value(player.stats?.[key])}</strong></div>`).join("")}
      </div>
      <dl class="popular-detail-grid">
        ${field("Pie", value(player.pie))}
        ${field("Skills", value(player.skills))}
        ${field("Weak foot", value(player.weakFoot))}
        ${field("Rating", value(player.ratingFuente))}
        ${field("Popularidad", value(player.popularidadFuente))}
      </dl>
      <dl class="popular-detail-grid popular-detail-prices">
        ${field("Precio de referencia", formatCoins(player.precioReferencia))}
        ${field("Precio actualizado por usuario", formatCoins(player.precioUsuario))}
        ${field("Precio efectivo", formatCoins(player.precioEfectivo) +
          `<small class="popular-price-source">${priceSource}</small>`)}
        ${field("Valor secundario fuente", formatCoins(player.valorSecundarioFuente))}
      </dl>
    </div>
  </td>`;
  return row;
}

function togglePopularPlayerDetails(cardId) {
  const card = getPopularPlayers().find(card => card.id === cardId);
  const button = Array.from(document.querySelectorAll('[data-meta-action="details"]'))
    .find(button => button.dataset.playerId === cardId);
  if (!card || !button) return;
  const opening = !expandedPopularCards.has(cardId);
  if (opening) {
    expandedPopularCards.add(cardId);
    button.closest("tr").after(renderPopularPlayerDetails(getPopularPlayerData(card)));
  } else {
    expandedPopularCards.delete(cardId);
    document.getElementById("popular-details-" + cardId)?.remove();
  }
  button.setAttribute("aria-expanded", String(opening));
  button.textContent = opening ? "▴ Detalles" : "▾ Detalles";
}


function renderPopularPlayers() {
  updatePopularQuickPriceButtons();
  const tbody = document.getElementById("metaPlayersBody");
  if (!tbody) return;
  const cards = getFilteredPopularPlayers();
  const counter = document.getElementById("metaPlayersCount");
  if (counter) counter.textContent = cards.length;
  tbody.innerHTML = "";
  if (!cards.length) {
    tbody.innerHTML = '<tr><td colspan="10">No hay cartas que coincidan con los filtros.</td></tr>';
    return;
  }
  cards.forEach(card => {
    const e = escapePopularHtml;
    const source = card.fuentePrecio;
    const freshness = getPriceFreshness(card.ultimaActualizacion);
    const alternatives = (card.posiciones || []).filter(p => p !== card.posicionPrincipal);
    const cardType = card.tipoCarta === "gold" ? "Oro" :
      card.tipoCarta === "special" ? "Especial" : "Unknown";
    const futbinAction = card.futbin?.url ? `
        <a class="meta-action-btn popular-futbin-link" data-meta-action="futbin"
          href="${e(card.futbin.url)}" target="_blank" rel="noopener noreferrer"
          aria-label="Abrir carta de ${e(card.nombre)} en FUTBIN">FUTBIN ↗</a>` : "";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><div class="meta-player-name"><strong>${e(card.nombre)}</strong>
        <span>${e(alternatives.join(" · "))}</span>
        <small class="popular-card-type ${e(card.tipoCarta || "unknown")}">${e(cardType)}</small></div></td>
      <td>${e(card.ovr ?? "—")}</td>
      <td><span class="meta-position">${e(card.posicionPrincipal ?? "—")}</span></td>
      <td>${e(card.popularidadFuente ?? "—")}</td>
      <td>${e(card.ratingFuente ?? "—")}</td>
      <td><div class="popular-price-editor">
        <input type="number" class="meta-price-input" data-player-id="${e(card.id)}"
          value="${e(card.precioEfectivo ?? "")}" min="0" placeholder="Precio"
          aria-label="Precio de ${e(card.nombre)}" title="${source}">
        <button class="meta-action-btn" data-meta-action="save-price"
          data-player-id="${e(card.id)}" type="button" title="Guardar precio">💾</button>
        </div><small class="popular-price-source">${source}</small></td>
      <td>${card.compraIdealMin === null ? "—" :
        formatCoins(card.compraIdealMin) + " - " + formatCoins(card.compraIdealMax)}</td>
      <td>${formatCoins(card.compraMaxima)}</td>
      <td><span class="price-freshness ${card.precioUsuario !== null ? freshness.className : "unknown"}">
        ${card.precioUsuario !== null ? freshness.text : e(source)}</span></td>
      <td><div class="popular-actions">
        <button class="copy-player-button" data-meta-action="copy-name"
          data-player-id="${e(card.id)}" type="button" title="Copiar nombre" aria-label="Copiar nombre de ${e(card.nombre)}">📋</button>
        <button class="meta-action-btn" data-meta-action="calculator"
          data-player-id="${e(card.id)}" type="button">🧮 Calcular</button>
        <button class="meta-action-btn" data-meta-action="details"
          data-player-id="${e(card.id)}" type="button"
          aria-expanded="${expandedPopularCards.has(card.id)}"
          aria-controls="popular-details-${e(card.id)}">
          ${expandedPopularCards.has(card.id) ? "▴" : "▾"} Detalles</button>
        ${futbinAction}
      </div></td>`;
    row.querySelector('[data-meta-action="futbin"]')?.addEventListener("click", event => {
      event.stopPropagation();
    });
    tbody.appendChild(row);
    if (expandedPopularCards.has(card.id)) {
      tbody.appendChild(renderPopularPlayerDetails(card));
    }
  });
  activarStepsMetaInputs();
}

function actualizarPrecioPopular(cardId) {
  if (!getPopularPlayers().some(card => card.id === cardId)) return;
  const input = Array.from(document.querySelectorAll(".meta-price-input"))
    .find(input => input.dataset.playerId === cardId);
  if (!input) return;
  const next = { ...popularPriceOverrides };
  if (input.value.trim() === "") {
    delete next[cardId];
  } else {
    const price = Number(input.value);
    if (!Number.isFinite(price) || price <= 0) {
      alert("Ingresa un precio v\u00e1lido.");
      return;
    }
    next[cardId] = { price, updatedAt: new Date().toISOString() };
  }
  try {
    localStorage.setItem(STORAGE_POPULAR_PRICES, JSON.stringify(next));
    popularPriceOverrides = next;
  } catch (error) {
    console.error("No se pudo guardar el precio:", error);
    alert("No se pudo guardar el precio. Intenta de nuevo.");
    return;
  }
  renderPopularPlayers();
  renderWatchlist();
}

function limpiarFiltrosPopular() {
  popularQuickPriceLimit = null;
  for (const id of ["metaSearch", "metaMaxPrice", "popularMinOvr",
    "popularMaxOvr", "popularMinPac", "popularMinSkills", "popularMinWeakFoot",
    "popularMinRating", "popularMinPopularity"]) {
    const input = document.getElementById(id);
    if (input) input.value = "";
  }
  const position = document.getElementById("metaCategory");
  const sort = document.getElementById("metaSort");
  const only = document.getElementById("metaOnlyWithPrice");
  if (position) position.value = "ALL";
  if (sort) sort.value = "popularity-desc";
  if (only) only.checked = false;
  for (const id of ["popularOnlyAffordable", "popularOnlyManual", "popularOnlyReference"]) {
    const checkbox = document.getElementById(id);
    if (checkbox) checkbox.checked = false;
  }
  renderPopularPlayers();
}


async function copiarNombrePopular(
  playerId,
  button
) {
  const player =
    getPopularPlayers().find(
      (item) =>
        item.id === playerId
    );


  if (!player) {
    return;
  }


  const nombre =
    player.nombre;


  let copiado = false;


  /* CLIPBOARD API */

  try {
    if (
      navigator.clipboard &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(
        nombre
      );

      copiado = true;
    }
  } catch (error) {
    console.warn(
      "Clipboard API no disponible:",
      error
    );
  }


  /* FALLBACK */

  if (!copiado) {
    try {
      const textarea =
        document.createElement(
          "textarea"
        );


      textarea.value =
        nombre;


      textarea.setAttribute(
        "readonly",
        ""
      );


      textarea.style.position =
        "absolute";


      textarea.style.left =
        "-9999px";


      document.body.appendChild(
        textarea
      );


      textarea.select();


      textarea.setSelectionRange(
        0,
        textarea.value.length
      );


      copiado =
        document.execCommand(
          "copy"
        );


      document.body.removeChild(
        textarea
      );
    } catch (error) {
      console.error(
        "No se pudo copiar:",
        error
      );
    }
  }


  /* CONFIRMACIÓN */

  if (
    copiado &&
    button
  ) {
    const contenidoOriginal =
      button.innerHTML;


    button.innerHTML =
      "✓ Copiado";


    button.classList.add(
      "copied"
    );


    button.disabled = true;


    setTimeout(
      () => {
        button.innerHTML =
          contenidoOriginal;

        button.classList.remove(
          "copied"
        );

        button.disabled = false;
      },
      1200
    );
  }


  if (!copiado) {
    alert(
      `No se pudo copiar automáticamente.\n\nNombre: ${nombre}`
    );
  }
}

function usarPopularEnCalculadora(playerId) {
  const basePlayer = getPopularPlayers().find(
    (player) => String(player.id) === String(playerId)
  );

  if (!basePlayer) {
    return;
  }

  const player = getPopularPlayerData(basePlayer);
  document.querySelector(
    '.nav-tab[data-section="dashboardSection"]'
  )?.click();

  const jugadorInput = document.getElementById("jugador");
  const marketInput = document.getElementById("precioVenta");
  const purchaseInput = document.getElementById("precioCompra");

  if (jugadorInput) {
    jugadorInput.value = player.nombre;
  }

  selectedCalculatorPlayerId = player.id;

  if (marketInput) {
    marketInput.value = player.precioEfectivo ?? "";

    if (player.precioEfectivo) {
      marketInput.step = getMarketStep(player.precioEfectivo);
    }
  }

  if (purchaseInput) {
    purchaseInput.value = "";
    purchaseInput.focus();
  }

  calcularTrade();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function configurarEventosPopular() {
  const search =
    document.getElementById(
      "metaSearch"
    );

  const category =
    document.getElementById(
      "metaCategory"
    );

  const priority =
    document.getElementById(
      "metaPriority"
    );

  const sort =
    document.getElementById(
      "metaSort"
    );

  const maxPrice =
    document.getElementById(
      "metaMaxPrice"
    );

  const onlyWithPrice =
    document.getElementById(
      "metaOnlyWithPrice"
    );

  const clear =
    document.getElementById(
      "btnClearMetaFilters"
    );


  search?.addEventListener(
    "input",
    renderPopularPlayers
  );


  category?.addEventListener(
    "change",
    renderPopularPlayers
  );


  priority?.addEventListener(
    "change",
    renderPopularPlayers
  );


  sort?.addEventListener(
    "change",
    renderPopularPlayers
  );


  maxPrice?.addEventListener("input", () => {
    popularQuickPriceLimit = null;
    renderPopularPlayers();
  });


  onlyWithPrice?.addEventListener(
    "change",
    renderPopularPlayers
  );


  clear?.addEventListener(
    "click",
    limpiarFiltrosPopular
  );


  const tbody =
    document.getElementById(
      "metaPlayersBody"
    );


  /* ACCIONES TABLA */

  tbody?.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          "[data-meta-action]"
        );


      if (!button) {
        return;
      }


      const action =
        button.dataset.metaAction;


      const playerId =
        button.dataset.playerId;


      if (action === "details") {
        togglePopularPlayerDetails(playerId);
      }

      if (
        action ===
        "save-price"
      ) {
        actualizarPrecioPopular(
          playerId
        );
      }


      if (
        action ===
        "copy-name"
      ) {
        copiarNombrePopular(
          playerId,
          button
        );
      }


      if (
        action ===
        "calculator"
      ) {
        usarPopularEnCalculadora(
          playerId
        );
      }
    }
  );


  /* ENTER EN PRECIO = GUARDAR */

  tbody?.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key !== "Enter"
      ) {
        return;
      }


      const input =
        event.target.closest(
          ".meta-price-input"
        );


      if (!input) {
        return;
      }


      actualizarPrecioPopular(
        input.dataset.playerId
      );
    }
  );
}

/* =========================================================
   INIT
========================================================= */

let uniquePopularPlayerNames;

function getUniquePopularPlayerNames() {
  if (!uniquePopularPlayerNames) {
    uniquePopularPlayerNames = (window.PLAYERS_DATA || []).map(card => {
      const name = String(card.nombre || "").trim();
      const normalized = normalizeText(name);
      const type = card.tipoCarta === "gold" ? "Oro" :
        card.tipoCarta === "special" ? "Especial" : "Tipo desconocido";
      return { id: card.id, name, normalized, label: `${name} · ${card.ovr ?? "—"} · ${type}` };
    }).filter(player => player.normalized);
  }
  return uniquePopularPlayerNames;
}

function setupPlayerAutocomplete(inputId, onSelect) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const wrapper = input.closest(".player-input-wrapper");
  const list = document.createElement("div");
  list.id = inputId + "-suggestions";
  list.className = "player-suggestions";
  list.setAttribute("role", "listbox");
  list.setAttribute("aria-label", "Sugerencias de jugadores");
  list.hidden = true;
  wrapper.append(list);
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-controls", list.id);
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("autocomplete", "off");
  const names = getUniquePopularPlayerNames();
  let matches = [];
  let activeIndex = -1;

  function close() {
    list.hidden = true;
    activeIndex = -1;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  }

  function activate(index) {
    activeIndex = index;
    Array.from(list.children).forEach((option, i) => {
      option.setAttribute("aria-selected", String(i === index));
    });
    const option = list.children[index];
    input.setAttribute("aria-activedescendant", option.id);
    option.scrollIntoView({ block: "nearest" });
  }

  function select(index) {
    const player = matches[index];
    input.value = player.name;
    close();
    onSelect?.(player);
  }

  function renderPlayerSuggestions() {
    const query = normalizeText(input.value);
    matches = query ? names.filter((player) => player.normalized.includes(query)) : [];
    close();
    list.replaceChildren();
    matches.forEach((player, index) => {
      const option = document.createElement("div");
      option.id = list.id + "-" + index;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      option.textContent = player.label;
      option.addEventListener("mouseenter", () => activate(index));
      option.addEventListener("mousedown", (event) => event.preventDefault());
      option.addEventListener("click", () => select(index));
      list.append(option);
    });
    list.hidden = matches.length === 0;
    input.setAttribute("aria-expanded", String(matches.length > 0));
    list.scrollTop = 0;
  }

  input.addEventListener("input", () => {
    if (inputId === "jugador") {
      selectedCalculatorPlayerId = null;
    }
    renderPlayerSuggestions();
  });
  input.addEventListener("focus", renderPlayerSuggestions);
  input.addEventListener("keydown", (event) => {
    if (event.isComposing) return;
    if (event.key === "Escape") {
      if (!list.hidden) event.preventDefault();
      close();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (list.hidden) renderPlayerSuggestions();
      if (!matches.length) return;
      event.preventDefault();
      const next = activeIndex < 0
        ? (event.key === "ArrowDown" ? 0 : matches.length - 1)
        : (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length;
      activate(next);
    } else if (event.key === "Enter" && !list.hidden) {
      event.preventDefault();
      select(activeIndex < 0 ? 0 : activeIndex);
    } else if (event.key === "Tab") {
      close();
    }
  });
  input.addEventListener("blur", close);
  document.addEventListener("pointerdown", (event) => {
    if (!wrapper.contains(event.target)) close();
  });
}

function configurarBotonesLimpiarJugador() {
  document.querySelectorAll("[data-clear-player]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.clearPlayer);
      if (input) {
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
      }
    });
  });
}


function selectCalculatorPlayer(player) {
  const basePlayer = getPopularPlayers().find(
    (card) => String(card.id) === String(player.id)
  );

  selectedCalculatorPlayerId = player.id;

  if (!basePlayer) {
    return;
  }

  const effectivePrice = getPopularPlayerData(basePlayer).precioEfectivo;
  const marketInput = document.getElementById("precioVenta");
  const purchaseInput = document.getElementById("precioCompra");

  if (marketInput) {
    marketInput.value = effectivePrice ?? "";

    if (effectivePrice) {
      marketInput.step = getMarketStep(effectivePrice);
    }
  }

  if (purchaseInput) {
    purchaseInput.value = "";
  }

  calcularTrade();
}


function renderAppVersion() {
  const versionElement =
    document.getElementById("appVersion");

  if (versionElement) {
    versionElement.textContent =
      "v" + APP_VERSION;
  }
}


function init() {
  validatePopularPlayersCatalog();
  renderAppVersion();

  /* CARGAR DATOS */

  loadState();
  loadMetaPrices();
  loadPopularPrices();


  /* RENDER */

  renderCapital();
  renderWatchlist();
  renderHistorial();
  renderPopularPlayers();


  /* STEPS */

  activarStepsDinamicos();


  /* EVENTOS */

  configurarEventosPopular();
  configurarFiltrosPopularesAvanzados();
  configurarBotonesLimpiarJugador();
  setupPlayerAutocomplete("jugador", selectCalculatorPlayer);
  setupPlayerAutocomplete("tradeJugador");
  configurarEventosTablas();
  configurarEnterCalculadora();
  configurarEventosBackup();


  /* CALCULADORA */

  document
    .getElementById(
      "btnCalcular"
    )
    ?.addEventListener(
      "click",
      calcularTrade
    );


  document
    .getElementById(
      "btnAgregarWatchlist"
    )
    ?.addEventListener(
      "click",
      addToWatchlist
    );


  /* CAPITAL */

  document
    .getElementById(
      "btnActualizarCapital"
    )
    ?.addEventListener(
      "click",
      actualizarCapital
    );


  /* HISTORIAL */

  document
    .getElementById(
      "btnRegistrarTrade"
    )
    ?.addEventListener(
      "click",
      registrarTrade
    );


  /* LIMPIAR WATCHLIST */

  document
    .getElementById(
      "btnLimpiarWatchlist"
    )
    ?.addEventListener(
      "click",
      limpiarWatchlist
    );


  /* LIMPIAR HISTORIAL */

  document
    .getElementById(
      "btnLimpiarHistorial"
    )
    ?.addEventListener(
      "click",
      limpiarHistorial
    );


  console.log(
    `XoluGG TradeLab v${APP_VERSION} cargado ✅`
  );


  console.log(
    `Jugadores Meta cargados: ${getMetaPlayers().length}`
  );
}


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  init
);
