/* =========================================================
   XOLUGG TRADELAB
   EA SPORTS FC 27
========================================================= */

const TAX_RATE = 0.05;
const DEFAULT_META_PROFIT = 300;

const STORAGE_STATE = "xoluggTradeLab";
const STORAGE_META_PRICES = "xoluggMetaPrices";


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
   PASOS DEL MERCADO
========================================================= */

function getMarketStep(value) {
  const number = Number(value) || 0;

  return number >= 1000 ? 100 : 50;
}


function roundDownMarketPrice(value) {
  const number = Math.max(0, Number(value) || 0);

  const step = getMarketStep(number);

  return Math.floor(number / step) * step;
}


function aplicarStepDinamico(input) {
  if (!input) return;

  const actualizarStep = () => {
    const valor = Number(input.value) || 0;

    input.step = getMarketStep(valor);
  };

  input.addEventListener(
    "input",
    actualizarStep
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

    aplicarStepDinamico(input);
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
    localStorage.getItem(STORAGE_STATE);

  if (!saved) return;

  try {
    const parsed =
      JSON.parse(saved);

    state = {
      capital:
        Number(parsed.capital) || 0,

      watchlist:
        Array.isArray(parsed.watchlist)
          ? parsed.watchlist
          : [],

      historial:
        Array.isArray(parsed.historial)
          ? parsed.historial
          : []
    };
  } catch (error) {
    console.error(
      "No se pudo cargar el estado:",
      error
    );
  }
}


function saveMetaPrices() {
  localStorage.setItem(
    STORAGE_META_PRICES,
    JSON.stringify(metaPriceOverrides)
  );
}


function loadMetaPrices() {
  const saved =
    localStorage.getItem(
      STORAGE_META_PRICES
    );

  if (!saved) return;

  try {
    metaPriceOverrides =
      JSON.parse(saved) || {};
  } catch (error) {
    console.error(
      "No se pudieron cargar los precios meta:",
      error
    );

    metaPriceOverrides = {};
  }
}


/* =========================================================
   CALCULADORA
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


  /*
     PRECIO MÁXIMO

     Ejemplo:
     Venta 2200
     Neto 2090
     Objetivo 300

     2090 - 300 = 1790

     Pero el mercado va de 100 en 100,
     así que el máximo real seguro es 1700.
  */

  const compraMaxima =
    roundDownMarketPrice(
      Math.max(
        0,
        neto - objetivo
      )
    );


  /*
     RANGO IDEAL

     Dejamos margen adicional por debajo
     del máximo para conseguir trades
     más rentables.

     Con objetivo de 300:

     Máximo 1700
     Ideal aprox. 1400 - 1600
  */

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


  document
    .getElementById(
      "capitalActual"
    )
    .textContent =
    formatCoins(state.capital);


  document
    .getElementById(
      "capitalInvertido"
    )
    .textContent =
    formatCoins(invertido);


  document
    .getElementById(
      "capitalLibre"
    )
    .textContent =
    formatCoins(capitalLibre);


  const beneficioEl =
    document.getElementById(
      "beneficioDia"
    );


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


function actualizarCapital() {

  const input =
    document.getElementById(
      "nuevoCapital"
    );


  if (
    !input ||
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
   CALCULAR TRADE
========================================================= */

function calcularTrade() {

  const jugador =
    document
      .getElementById("jugador")
      .value
      .trim();


  const precioVenta =
    document
      .getElementById(
        "precioVenta"
      )
      .value;


  const precioCompra =
    document
      .getElementById(
        "precioCompra"
      )
      .value;


  const beneficioMinimo =
    document
      .getElementById(
        "beneficioMinimo"
      )
      .value;


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


  document
    .getElementById(
      "resultadoNeto"
    )
    .textContent =
    formatCoins(
      metrics.neto
    );


  const beneficioEl =
    document.getElementById(
      "resultadoBeneficio"
    );


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


  document
    .getElementById(
      "resultadoROI"
    )
    .textContent =
    formatPercent(
      metrics.roi
    );


  document
    .getElementById(
      "resultadoIdeal"
    )
    .textContent =
    `${formatCoins(
      metrics.compraIdealMin
    )} - ${formatCoins(
      metrics.compraIdealMax
    )}`;


  document
    .getElementById(
      "resultadoMaximo"
    )
    .textContent =
    formatCoins(
      metrics.compraMaxima
    );


  const statusEl =
    document.getElementById(
      "estadoTrade"
    );


  statusEl.className =
    `trade-status ${status.className}`;


  statusEl.textContent =
    status.label;


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


  if (!result) return;


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
      result.status.className

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


  tbody.innerHTML = "";


  if (
    state.watchlist.length ===
    0
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
            title="Eliminar"
          >
            ×
          </button>

        </td>

      `;


      tbody.appendChild(tr);

    }
  );
}


function removeWatchlistItem(
  id
) {

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
    !confirm(
      "¿Limpiar toda la watchlist?"
    )
  ) {
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

  const jugador =
    document
      .getElementById(
        "tradeJugador"
      )
      .value
      .trim();


  const compra =
    Number(
      document
        .getElementById(
          "tradeCompra"
        )
        .value
    );


  const venta =
    Number(
      document
        .getElementById(
          "tradeVenta"
        )
        .value
    );


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
      new Date()
        .toISOString()

  };


  state.historial.unshift(
    trade
  );


  state.capital +=
    beneficio;


  saveState();

  renderHistorial();

  renderCapital();


  document
    .getElementById(
      "tradeJugador"
    )
    .value = "";


  document
    .getElementById(
      "tradeCompra"
    )
    .value = "";


  document
    .getElementById(
      "tradeVenta"
    )
    .value = "";
}


function renderHistorial() {

  const tbody =
    document.getElementById(
      "historialBody"
    );


  tbody.innerHTML = "";


  if (
    state.historial.length ===
    0
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
            title="Eliminar"
          >
            ×
          </button>

        </td>

      `;


      tbody.appendChild(tr);

    }
  );
}


function removeHistorialItem(
  id
) {

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
    !confirm(
      "¿Limpiar todo el historial?"
    )
  ) {
    return;
  }


  state.historial = [];


  saveState();

  renderHistorial();

  renderCapital();
}


/* =========================================================
   JUGADORES META
========================================================= */

function getMetaPlayers() {

  if (
    !Array.isArray(
      window.META_PLAYERS
    )
  ) {

    console.warn(
      "META_PLAYERS no está cargado."
    );

    return [];
  }


  return window.META_PLAYERS;
}


/* =========================================================
   PRECIO EFECTIVO META
========================================================= */

function getMetaPlayerData(
  player
) {

  const override =
    metaPriceOverrides[
      player.id
    ];


  /*
     Si existe override en localStorage
     utilizamos ese precio.

     Si no existe,
     utilizamos el precio inicial
     definido en meta-players.js.
  */

  let precioMercado =
    player.precioMercado;


  let ultimaActualizacion =
    player.ultimaActualizacion;


  if (
    override &&
    Object.prototype.hasOwnProperty.call(
      override,
      "precioMercado"
    )
  ) {

    precioMercado =
      override.precioMercado;

  }


  if (
    override &&
    Object.prototype.hasOwnProperty.call(
      override,
      "ultimaActualizacion"
    )
  ) {

    ultimaActualizacion =
      override.ultimaActualizacion;

  }


  /*
     Calculamos automáticamente
     ideal y máximo cuando hay precio.
  */

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

  const count =
    Number(prioridad) || 0;


  if (count <= 0) {
    return "—";
  }


  return "🔥".repeat(count);
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
    new Date(dateString);


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
    Math.floor(
      diffMs / 60000
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
   FILTRAR META
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
      ?.value || "ALL";


  const priority =
    document
      .getElementById(
        "metaPriority"
      )
      ?.value || "ALL";


  const maxPriceValue =
    document
      .getElementById(
        "metaMaxPrice"
      )
      ?.value;


  const maxPrice =
    maxPriceValue
      ? Number(maxPriceValue)
      : null;


  const onlyWithPrice =
    document
      .getElementById(
        "metaOnlyWithPrice"
      )
      ?.checked || false;


  /* BUSCADOR */

  if (search) {

    players =
      players.filter(
        (player) => {

          const searchable =
            normalizeText(
              [
                player.nombre,
                player.posicionPrincipal,
                ...(player.posiciones || []),
                ...(player.tags || []),
                player.perfil
              ].join(" ")
            );


          return searchable.includes(
            search
          );

        }
      );

  }


  /* CATEGORÍA */

  if (category !== "ALL") {

    players =
      players.filter(
        (player) =>
          player.categoria ===
          category
      );

  }


  /* PRIORIDAD */

  if (priority !== "ALL") {

    players =
      players.filter(
        (player) =>
          Number(
            player.prioridadMeta
          ) ===
          Number(priority)
      );

  }


  /* SOLO CON PRECIO */

  if (onlyWithPrice) {

    players =
      players.filter(
        (player) =>
          Number(
            player.precioMercado
          ) > 0
      );

  }


  /* PRECIO MÁXIMO */

  if (
    maxPrice !== null &&
    !Number.isNaN(maxPrice)
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


  /*
     Ordenamos primero por prioridad meta,
     después por nombre.
  */

  players.sort(
    (a, b) => {

      const priorityDifference =
        Number(
          b.prioridadMeta
        ) -
        Number(
          a.prioridadMeta
        );


      if (
        priorityDifference !== 0
      ) {

        return priorityDifference;

      }


      return a.nombre.localeCompare(
        b.nombre,
        "es"
      );

    }
  );


  return players;
}


/* =========================================================
   RENDER META
========================================================= */

function renderMetaPlayers() {

  const tbody =
    document.getElementById(
      "metaPlayersBody"
    );


  if (!tbody) return;


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
          No hay jugadores que coincidan
          con los filtros.
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


      const price =
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

            <strong>
              ${player.nombre}
            </strong>

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

          <span class="meta-priority">

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
              value="${price}"
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

            ${
              freshness.className ===
              "fresh"
                ? "●"
                : freshness.className ===
                    "warning"
                ? "●"
                : freshness.className ===
                    "old"
                ? "●"
                : ""
            }

            ${freshness.text}

          </span>

        </td>


        <!-- ACCIÓN -->

        <td>

          <button
            class="meta-action-btn"
            data-meta-action="calculator"
            data-player-id="${player.id}"
          >
            🧮 Calcular
          </button>

        </td>

      `;


      tbody.appendChild(tr);

    }
  );


  activarStepsMetaInputs();
}


/* =========================================================
   STEP INPUTS META
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


  if (!input) return;


  /*
     Si queda vacío eliminamos el precio.
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
    Number(
      input.value
    );


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
      new Date()
        .toISOString()

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
        player.id === playerId
    );


  if (!basePlayer) return;


  const player =
    getMetaPlayerData(
      basePlayer
    );


  /*
     Cambiamos al Dashboard
  */

  const dashboardTab =
    document.querySelector(
      '.nav-tab[data-section="dashboardSection"]'
    );


  if (dashboardTab) {
    dashboardTab.click();
  }


  /*
     Cargamos jugador
  */

  document
    .getElementById(
      "jugador"
    )
    .value =
    player.nombre;


  /*
     Si conocemos el precio,
     lo usamos como precio de venta.
  */

  document
    .getElementById(
      "precioVenta"
    )
    .value =
    player.precioMercado || "";


  /*
     Dejamos vacía la compra.

     Tú escribes la puja o BIN
     que estás viendo en EA.
  */

  document
    .getElementById(
      "precioCompra"
    )
    .value = "";


  /*
     Beneficio objetivo
  */

  const beneficioInput =
    document.getElementById(
      "beneficioMinimo"
    );


  if (
    !beneficioInput.value
  ) {

    beneficioInput.value =
      DEFAULT_META_PROFIT;

  }


  document
    .getElementById(
      "precioCompra"
    )
    .focus();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   LIMPIAR FILTROS META
========================================================= */

function limpiarFiltrosMeta() {

  document
    .getElementById(
      "metaSearch"
    )
    .value = "";


  document
    .getElementById(
      "metaCategory"
    )
    .value = "ALL";


  document
    .getElementById(
      "metaPriority"
    )
    .value = "ALL";


  document
    .getElementById(
      "metaMaxPrice"
    )
    .value = "";


  document
    .getElementById(
      "metaOnlyWithPrice"
    )
    .checked = false;


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


  /*
     Eventos delegados de la tabla.
  */

  const tbody =
    document.getElementById(
      "metaPlayersBody"
    );


  tbody?.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "[data-meta-action]"
        );


      if (!button) return;


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
        "calculator"
      ) {

        usarMetaEnCalculadora(
          playerId
        );

      }

    }
  );


  /*
     Enter dentro de precio
     = guardar.
  */

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


      if (!input) return;


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

  document
    .getElementById(
      "watchlistBody"
    )
    ?.addEventListener(
      "click",
      (event) => {

        const button =
          event.target.closest(
            "[data-watch-delete]"
          );


        if (!button) return;


        removeWatchlistItem(
          button.dataset
            .watchDelete
        );

      }
    );


  document
    .getElementById(
      "historialBody"
    )
    ?.addEventListener(
      "click",
      (event) => {

        const button =
          event.target.closest(
            "[data-history-delete]"
          );


        if (!button) return;


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

      document
        .getElementById(id)
        ?.addEventListener(
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
   INIT
========================================================= */

function init() {

  loadState();

  loadMetaPrices();


  renderCapital();

  renderWatchlist();

  renderHistorial();

  renderMetaPlayers();


  activarStepsDinamicos();

  configurarEventosMeta();

  configurarEventosTablas();

  configurarEnterCalculadora();


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


  document
    .getElementById(
      "btnLimpiarWatchlist"
    )
    ?.addEventListener(
      "click",
      limpiarWatchlist
    );


  document
    .getElementById(
      "btnLimpiarHistorial"
    )
    ?.addEventListener(
      "click",
      limpiarHistorial
    );

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  init
);
