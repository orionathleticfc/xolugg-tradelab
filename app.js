const TAX_RATE = 0.05;

let state = {
  capital: 22000,
  watchlist: [],
  historial: []
};

function formatCoins(value) {
  return Number(value || 0).toLocaleString("es-CO");
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function saveState() {
  localStorage.setItem("xoluggTradeLab", JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem("xoluggTradeLab");

  if (saved) {
    try {
      state = JSON.parse(saved);
    } catch (error) {
      console.error("No se pudo cargar el estado guardado", error);
    }
  }
}

function getTradeMetrics(precioVenta, precioCompra, beneficioMinimo) {
  const venta = Number(precioVenta);
  const compra = Number(precioCompra);
  const objetivo = Number(beneficioMinimo);

  const neto = Math.floor(venta * (1 - TAX_RATE));
  const beneficio = neto - compra;

  const roi =
    compra > 0
      ? (beneficio / compra) * 100
      : 0;

  const compraMaxima = Math.max(0, neto - objetivo);

  const compraIdealMin = Math.max(
    0,
    Math.floor(compraMaxima * 0.78)
  );

  const compraIdealMax = Math.max(
    0,
    Math.floor(compraMaxima * 0.90)
  );

  return {
    venta,
    compra,
    neto,
    beneficio,
    roi,
    compraMaxima,
    compraIdealMin,
    compraIdealMax
  };
}

function getTradeStatus(metrics, beneficioMinimo) {
  const objetivo = Number(beneficioMinimo);

  if (metrics.beneficio <= 0) {
    return {
      className: "bad",
      label: "❌ NO COMPRAR"
    };
  }

  if (
    metrics.beneficio >= objetivo * 1.75 ||
    metrics.roi >= 25
  ) {
    return {
      className: "excellent",
      label: "🔥 EXCELENTE COMPRA"
    };
  }

  if (
    metrics.beneficio >= objetivo ||
    metrics.roi >= 15
  ) {
    return {
      className: "good",
      label: "✅ BUENA COMPRA"
    };
  }

  if (
    metrics.beneficio >= objetivo * 0.5 ||
    metrics.roi >= 8
  ) {
    return {
      className: "fair",
      label: "🟡 COMPRA JUSTA"
    };
  }

  return {
    className: "bad",
    label: "❌ NO COMPRAR"
  };
}

function renderCapital() {
  const invertido = state.watchlist.reduce((total, item) => {
    return total + Number(item.compraActual || 0);
  }, 0);

  const beneficioDia = state.historial.reduce((total, trade) => {
    return total + Number(trade.beneficio || 0);
  }, 0);

  const capitalLibre = Math.max(0, state.capital - invertido);

  document.getElementById("capitalActual").textContent =
    formatCoins(state.capital);

  document.getElementById("capitalInvertido").textContent =
    formatCoins(invertido);

  document.getElementById("capitalLibre").textContent =
    formatCoins(capitalLibre);

  const beneficioEl = document.getElementById("beneficioDia");

  beneficioEl.textContent =
    beneficioDia >= 0
      ? `+${formatCoins(beneficioDia)}`
      : formatCoins(beneficioDia);
}

function calcularTrade() {
  const jugador =
    document.getElementById("jugador").value.trim();

  const precioVenta =
    document.getElementById("precioVenta").value;

  const precioCompra =
    document.getElementById("precioCompra").value;

  const beneficioMinimo =
    document.getElementById("beneficioMinimo").value;

  if (!precioVenta || !precioCompra) {
    alert("Ingresa precio de venta y precio de compra.");
    return null;
  }

  const metrics = getTradeMetrics(
    precioVenta,
    precioCompra,
    beneficioMinimo
  );

  const status = getTradeStatus(
    metrics,
    beneficioMinimo
  );

  document.getElementById("resultadoNeto").textContent =
    formatCoins(metrics.neto);

  const beneficioEl =
    document.getElementById("resultadoBeneficio");

  beneficioEl.textContent =
    metrics.beneficio >= 0
      ? `+${formatCoins(metrics.beneficio)}`
      : formatCoins(metrics.beneficio);

  beneficioEl.className =
    metrics.beneficio >= 0 ? "positive" : "negative";

  document.getElementById("resultadoROI").textContent =
    formatPercent(metrics.roi);

  document.getElementById("resultadoIdeal").textContent =
    `${formatCoins(metrics.compraIdealMin)} - ${formatCoins(metrics.compraIdealMax)}`;

  document.getElementById("resultadoMaximo").textContent =
    formatCoins(metrics.compraMaxima);

  const statusEl =
    document.getElementById("estadoTrade");

  statusEl.className =
    `trade-status ${status.className}`;

  statusEl.textContent =
    status.label;

  return {
    jugador,
    beneficioMinimo: Number(beneficioMinimo),
    ...metrics,
    status
  };
}

function addToWatchlist() {
  const result = calcularTrade();

  if (!result) return;

  if (!result.jugador) {
    alert("Ingresa el nombre del jugador.");
    return;
  }

  const item = {
    id: Date.now(),
    jugador: result.jugador,
    venta: result.venta,
    compraIdealMin: result.compraIdealMin,
    compraIdealMax: result.compraIdealMax,
    compraMaxima: result.compraMaxima,
    compraActual: result.compra,
    estado: result.status.label,
    estadoClass: result.status.className
  };

  state.watchlist.unshift(item);

  saveState();
  renderWatchlist();
  renderCapital();
}

function renderWatchlist() {
  const tbody =
    document.getElementById("watchlistBody");

  tbody.innerHTML = "";

  if (state.watchlist.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;color:#8fa8b3;">
          No hay jugadores en seguimiento
        </td>
      </tr>
    `;
    return;
  }

  state.watchlist.forEach((item) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><strong>${item.jugador}</strong></td>

      <td>${formatCoins(item.venta)}</td>

      <td>
        ${formatCoins(item.compraIdealMin)}
        -
        ${formatCoins(item.compraIdealMax)}
      </td>

      <td>${formatCoins(item.compraMaxima)}</td>

      <td>${item.estado}</td>

      <td>
        <button
          class="remove-button"
          onclick="removeWatchlistItem(${item.id})"
        >
          ×
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function removeWatchlistItem(id) {
  state.watchlist =
    state.watchlist.filter((item) => item.id !== id);

  saveState();
  renderWatchlist();
  renderCapital();
}

function limpiarWatchlist() {
  if (!confirm("¿Limpiar toda la watchlist?")) {
    return;
  }

  state.watchlist = [];

  saveState();
  renderWatchlist();
  renderCapital();
}

function actualizarCapital() {
  const nuevoCapital =
    Number(document.getElementById("nuevoCapital").value);

  if (!nuevoCapital || nuevoCapital < 0) {
    alert("Ingresa un capital válido.");
    return;
  }

  state.capital = nuevoCapital;

  saveState();
  renderCapital();

  document.getElementById("nuevoCapital").value = "";
}

function registrarTrade() {
  const jugador =
    document.getElementById("tradeJugador").value.trim();

  const compra =
    Number(document.getElementById("tradeCompra").value);

  const venta =
    Number(document.getElementById("tradeVenta").value);

  if (!jugador || !compra || !venta) {
    alert("Completa jugador, compra y venta.");
    return;
  }

  const neto =
    Math.floor(venta * (1 - TAX_RATE));

  const beneficio =
    neto - compra;

  const roi =
    compra > 0
      ? (beneficio / compra) * 100
      : 0;

  const trade = {
    id: Date.now(),
    jugador,
    compra,
    venta,
    neto,
    beneficio,
    roi,
    fecha: new Date().toISOString()
  };

  state.historial.unshift(trade);

  state.capital += beneficio;

  saveState();
  renderHistorial();
  renderCapital();

  document.getElementById("tradeJugador").value = "";
  document.getElementById("tradeCompra").value = "";
  document.getElementById("tradeVenta").value = "";
}

function renderHistorial() {
  const tbody =
    document.getElementById("historialBody");

  tbody.innerHTML = "";

  if (state.historial.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;color:#8fa8b3;">
          Todavía no hay trades registrados
        </td>
      </tr>
    `;
    return;
  }

  state.historial.forEach((trade) => {
    const tr =
      document.createElement("tr");

    const beneficioClass =
      trade.beneficio >= 0
        ? "positive"
        : "negative";

    tr.innerHTML = `
      <td><strong>${trade.jugador}</strong></td>

      <td>${formatCoins(trade.compra)}</td>

      <td>${formatCoins(trade.venta)}</td>

      <td class="${beneficioClass}">
        ${
          trade.beneficio >= 0
            ? "+"
            : ""
        }${formatCoins(trade.beneficio)}
      </td>

      <td>${formatPercent(trade.roi)}</td>

      <td>
        <button
          class="remove-button"
          onclick="removeHistorialItem(${trade.id})"
        >
          ×
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function removeHistorialItem(id) {
  const trade =
    state.historial.find((item) => item.id === id);

  if (trade) {
    state.capital -= trade.beneficio;
  }

  state.historial =
    state.historial.filter((item) => item.id !== id);

  saveState();
  renderHistorial();
  renderCapital();
}

function limpiarHistorial() {
  if (!confirm("¿Limpiar todo el historial?")) {
    return;
  }

  state.historial = [];

  saveState();
  renderHistorial();
  renderCapital();
}

function init() {
  loadState();

  renderCapital();
  renderWatchlist();
  renderHistorial();

  document
    .getElementById("btnCalcular")
    .addEventListener(
      "click",
      calcularTrade
    );

  document
    .getElementById("btnAgregarWatchlist")
    .addEventListener(
      "click",
      addToWatchlist
    );

  document
    .getElementById("btnActualizarCapital")
    .addEventListener(
      "click",
      actualizarCapital
    );

  document
    .getElementById("btnRegistrarTrade")
    .addEventListener(
      "click",
      registrarTrade
    );

  document
    .getElementById("btnLimpiarWatchlist")
    .addEventListener(
      "click",
      limpiarWatchlist
    );

  document
    .getElementById("btnLimpiarHistorial")
    .addEventListener(
      "click",
      limpiarHistorial
    );
}

document.addEventListener(
  "DOMContentLoaded",
  init
);
