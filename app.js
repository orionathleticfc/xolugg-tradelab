/* =========================================================
   XOLUGG TRADELAB
   EA SPORTS FC 27
========================================================= */

const TAX_RATE = 0.05;
const DEFAULT_META_PROFIT = 300;

const STORAGE_STATE = "xoluggTradeLab";
const STORAGE_META_PRICES = "xoluggMetaPrices";

const APP_VERSION = "1.2.0";


/* =========================================================
   ESTADO GENERAL
========================================================= */

let state = {
  capital: 22000,
  watchlist: [],
  historial: []
};

let metaPriceOverrides = {};


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
    "beneficioMinimo",
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
        Array.isArray(
          parsed.watchlist
        )
          ? parsed.watchlist
          : [],

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

function getTradeMetrics(
  precioVenta,
  precioCompra,
  beneficioMinimo
) {
  const venta =
    Number(precioVenta) || 0;

  const compra =
    Number(precioCompra) || 0;

  const objetivo =
    Number(beneficioMinimo) || 0;


  /* 5 % DE IMPUESTO */

  const neto =
    Math.floor(
      venta * (1 - TAX_RATE)
    );


  const beneficio =
    neto - compra;


  const roi =
    compra > 0
      ? (beneficio / compra) * 100
      : 0;


  /* COMPRA MÁXIMA */

  const compraMaxima =
    roundDownMarketPrice(
      Math.max(
        0,
        neto - objetivo
      )
    );


  /* RANGO IDEAL */

  const compraIdealMin =
    roundDownMarketPrice(
      Math.max(
        0,
        compraMaxima - objetivo
      )
    );


  const bufferSuperior =
    Math.max(
      50,
      objetivo / 3
    );


  const compraIdealMax =
    roundDownMarketPrice(
      Math.max(
        compraIdealMin,
        compraMaxima -
          bufferSuperior
      )
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


/* =========================================================
   ESTADO DEL TRADE
========================================================= */

function getTradeStatus(
  metrics,
  beneficioMinimo
) {
  const objetivo =
    Number(beneficioMinimo) || 0;


  if (metrics.beneficio <= 0) {
    return {
      className: "bad",
      label: "❌ NO COMPRAR"
    };
  }


  if (
    metrics.beneficio >=
      objetivo * 1.75 ||
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
    metrics.beneficio >=
      objetivo * 0.5 ||
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
            item.compraActual || 0
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


  const capitalLibre =
    Math.max(
      0,
      state.capital - invertido
    );


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

function calcularTrade() {
  const jugadorInput =
    document.getElementById(
      "jugador"
    );

  const ventaInput =
    document.getElementById(
      "precioVenta"
    );

  const compraInput =
    document.getElementById(
      "precioCompra"
    );

  const beneficioInput =
    document.getElementById(
      "beneficioMinimo"
    );


  const jugador =
    jugadorInput
      ? jugadorInput.value.trim()
      : "";


  const precioVenta =
    ventaInput
      ? ventaInput.value
      : "";


  const precioCompra =
    compraInput
      ? compraInput.value
      : "";


  const beneficioMinimo =
    beneficioInput
      ? beneficioInput.value
      : DEFAULT_META_PROFIT;


  if (
    !precioVenta ||
    !precioCompra
  ) {
    alert(
      "Ingresa precio de venta y precio de compra."
    );

    return null;
  }


  const metrics =
    getTradeMetrics(
      precioVenta,
      precioCompra,
      beneficioMinimo
    );


  const status =
    getTradeStatus(
      metrics,
      beneficioMinimo
    );


  const netoEl =
    document.getElementById(
      "resultadoNeto"
    );

  const beneficioEl =
    document.getElementById(
      "resultadoBeneficio"
    );

  const roiEl =
    document.getElementById(
      "resultadoROI"
    );

  const idealEl =
    document.getElementById(
      "resultadoIdeal"
    );

  const maximoEl =
    document.getElementById(
      "resultadoMaximo"
    );

  const statusEl =
    document.getElementById(
      "estadoTrade"
    );


  if (netoEl) {
    netoEl.textContent =
      formatCoins(metrics.neto);
  }


  if (beneficioEl) {
    beneficioEl.textContent =
      metrics.beneficio >= 0
        ? `+${formatCoins(
            metrics.beneficio
          )}`
        : formatCoins(
            metrics.beneficio
          );

    beneficioEl.className =
      metrics.beneficio >= 0
        ? "positive"
        : "negative";
  }


  if (roiEl) {
    roiEl.textContent =
      formatPercent(
        metrics.roi
      );
  }


  if (idealEl) {
    idealEl.textContent =
      `${formatCoins(
        metrics.compraIdealMin
      )} - ${formatCoins(
        metrics.compraIdealMax
      )}`;
  }


  if (maximoEl) {
    maximoEl.textContent =
      formatCoins(
        metrics.compraMaxima
      );
  }


  if (statusEl) {
    statusEl.className =
      `trade-status ${status.className}`;

    statusEl.textContent =
      status.label;
  }


  return {
    jugador,

    beneficioMinimo:
      Number(
        beneficioMinimo
      ),

    ...metrics,

    status
  };
}


/* =========================================================
   WATCHLIST
========================================================= */

function addToWatchlist() {
  const result =
    calcularTrade();


  if (!result) {
    return;
  }


  if (!result.jugador) {
    alert(
      "Ingresa el nombre del jugador."
    );

    return;
  }


  const item = {
    id:
      Date.now(),

    jugador:
      result.jugador,

    venta:
      result.venta,

    compraIdealMin:
      result.compraIdealMin,

    compraIdealMax:
      result.compraIdealMax,

    compraMaxima:
      result.compraMaxima,

    compraActual:
      result.compra,

    estado:
      result.status.label,

    estadoClass:
      result.status.className,

    fecha:
      new Date().toISOString()
  };


  state.watchlist.unshift(
    item
  );


  saveState();
  renderWatchlist();
  renderCapital();
}


function renderWatchlist() {
  const tbody =
    document.getElementById(
      "watchlistBody"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = "";


  if (
    state.watchlist.length === 0
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
          No hay jugadores en seguimiento
        </td>
      </tr>
    `;

    return;
  }


  state.watchlist.forEach(
    (item) => {
      const tr =
        document.createElement(
          "tr"
        );


      tr.innerHTML = `
        <td>
          <strong>
            ${item.jugador}
          </strong>
        </td>

        <td>
          ${formatCoins(
            item.venta
          )}
        </td>

        <td>
          ${formatCoins(
            item.compraIdealMin
          )}
          -
          ${formatCoins(
            item.compraIdealMax
          )}
        </td>

        <td>
          ${formatCoins(
            item.compraMaxima
          )}
        </td>

        <td>
          ${item.estado}
        </td>

        <td>
          <button
            class="remove-button"
            data-watch-delete="${item.id}"
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


function removeWatchlistItem(id) {
  state.watchlist =
    state.watchlist.filter(
      (item) =>
        Number(item.id) !==
        Number(id)
    );


  saveState();
  renderWatchlist();
  renderCapital();
}


function limpiarWatchlist() {
  if (
    state.watchlist.length === 0
  ) {
    return;
  }


  const confirmar =
    confirm(
      "¿Quieres limpiar toda la watchlist?"
    );


  if (!confirmar) {
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
    Math.floor(
      venta *
        (1 - TAX_RATE)
    );


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
    const metrics =
      getTradeMetrics(
        precioMercado,
        0,
        DEFAULT_META_PROFIT
      );


    compraIdealMin =
      metrics.compraIdealMin;

    compraIdealMax =
      metrics.compraIdealMax;

    compraMaxima =
      metrics.compraMaxima;
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

function usarMetaEnCalculadora(
  playerId
) {
  const basePlayer =
    getMetaPlayers().find(
      (player) =>
        player.id ===
        playerId
    );


  if (!basePlayer) {
    return;
  }


  const player =
    getMetaPlayerData(
      basePlayer
    );


  const dashboardTab =
    document.querySelector(
      '.nav-tab[data-section="dashboardSection"]'
    );


  if (dashboardTab) {
    dashboardTab.click();
  }


  const jugadorInput =
    document.getElementById(
      "jugador"
    );

  const ventaInput =
    document.getElementById(
      "precioVenta"
    );

  const compraInput =
    document.getElementById(
      "precioCompra"
    );

  const beneficioInput =
    document.getElementById(
      "beneficioMinimo"
    );


  if (jugadorInput) {
    jugadorInput.value =
      player.nombre;
  }


  if (ventaInput) {
    ventaInput.value =
      player.precioMercado ||
      "";
  }


  if (compraInput) {
    compraInput.value = "";

    compraInput.focus();
  }


  if (
    beneficioInput &&
    !beneficioInput.value
  ) {
    beneficioInput.value =
      DEFAULT_META_PROFIT;
  }


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
    "precioCompra",
    "beneficioMinimo"
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
            "Enter"
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

function exportarBackup() {
  saveState();
  saveMetaPrices();


  const backup = {
    app:
      "XoluGG TradeLab",

    version:
      APP_VERSION,

    exportedAt:
      new Date().toISOString(),

    state: {
      capital:
        state.capital,

      watchlist:
        state.watchlist,

      historial:
        state.historial
    },

    metaPriceOverrides:
      metaPriceOverrides
  };


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
            Array.isArray(
              data.state.watchlist
            )
              ? data.state.watchlist
              : [],

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


        saveState();
        saveMetaPrices();


        renderCapital();
        renderWatchlist();
        renderHistorial();
        renderMetaPlayers();


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
   INIT
========================================================= */

function init() {
  validatePopularPlayersCatalog();

  /* CARGAR DATOS */

  loadState();
  loadMetaPrices();


  /* RENDER */

  renderCapital();
  renderWatchlist();
  renderHistorial();
  renderMetaPlayers();


  /* STEPS */

  activarStepsDinamicos();


  /* EVENTOS */

  configurarEventosMeta();
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
