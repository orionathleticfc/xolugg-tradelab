const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const root = process.cwd();
const mobile = process.argv.includes("--mobile");
const screenshotFlag = process.argv.indexOf("--screenshot");
const screenshotPath = screenshotFlag >= 0
  ? process.argv[screenshotFlag + 1]
  : null;
let browser;
let timer;
const requests = [];
const injected = String.raw`
<script>
localStorage.setItem("xoluggTradeLab", JSON.stringify({
  capital: 100000,
  watchlist: [{
    id: 1,
    jugador: "Legacy",
    venta: 30000,
    compraActual: 27300,
    compraIdealMin: 26000,
    compraMaxima: 28500,
    estado: "legacy"
  }],
  historial: []
}));
localStorage.setItem("xoluggPopularPrices", JSON.stringify({
  "gordon-82-lw-91-78-77-82-50-71": {
    price: 8999,
    updatedAt: "2099-09-18T14:00:00.000Z"
  }
}));
const observedAlerts = [];
window.alert = message => observedAlerts.push(String(message));
window.confirm = () => true;
window.addEventListener("error", event => {
  fetch("/report?" + new URLSearchParams({
    result: "FAIL",
    message: event.error?.stack || event.message
  }));
});
document.addEventListener("DOMContentLoaded", async () => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const fail = message => { throw new Error(message); };
  const text = id => document.getElementById(id)?.textContent.trim() || "";
  const setTrade = (market, purchase) => {
    document.getElementById("precioVenta").value = market;
    document.getElementById("precioCompra").value = purchase ?? "";
    document.getElementById("btnCalcular").click();
  };
  try {
    await delay(100);
    const catalog = window.PLAYERS_DATA;
    if (text("metaPlayersCount") !== String(catalog.length)) fail("catalog count");
    if (document.getElementById("beneficioMinimo")) fail("legacy profit input");
    if (!document.querySelector(".opportunity-table")) fail("opportunity table missing");

    const playerInput = document.getElementById("jugador");
    playerInput.value = "gordon";
    playerInput.dispatchEvent(new Event("input", { bubbles: true }));
    const option = [...document.querySelectorAll("#jugador-suggestions [role=option]")]
      .find(item => item.textContent.trim() === "Gordon");
    if (!option) fail("autocomplete option");
    option.click();
    if (document.getElementById("precioVenta").value !== "8999") {
      fail("effective Phase 7 price");
    }

    playerInput.value = "Lacroix";
    setTrade(30000, "");
    if (observedAlerts.length) fail("alert shown for empty optional bid");
    if (text("resultadoCompra") !== "Sin precio todavía") fail("empty bid summary");
    if (!text("estadoTrade").includes("SIN PUJA")) fail("empty bid status");
    if (text("targetBreakEven") !== "28.500") fail("break-even target");
    if (text("targetGood") !== "≤ 27.750") fail("good target");
    if (text("targetProtected") !== "≤ 27.000") fail("protected target");
    if (text("targetOpportunity") !== "≤ 26.250") fail("opportunity target");
    if (text("scenario25Venta") !== "29.250" ||
        text("scenario25Neto") !== "27.787" ||
        text("scenario25Beneficio") !== "Sin puja") {
      fail("market-only -2.5 scenario");
    }

    setTrade(30000, 28000);
    if (text("resultadoNeto") !== "28.500") fail("EA net");
    if (text("resultadoBeneficio") !== "+500") fail("current profit");
    if (!text("estadoTrade").includes("MARGEN BAJO")) fail("low margin status");
    if (text("scenario25Beneficio") !== "-213") fail("-2.5 scenario");
    if (text("scenario5Beneficio") !== "-925") fail("-5 scenario");
    const purchases = [...document.querySelectorAll("#opportunityTableBody tr")]
      .map(row => row.cells[0].textContent.trim());
    if (purchases.join("|") !== "28.500|27.750|27.000|26.250|25.500") {
      fail("opportunity ladder " + purchases.join("|"));
    }

    for (const [purchase, expected] of [
      [28500, "LÍMITE"],
      [28750, "NO COMPRAR"],
      [27750, "BUENA COMPRA"],
      [27000, "COMPRA PROTEGIDA"],
      [26250, "OPORTUNIDAD"]
    ]) {
      setTrade(30000, purchase);
      if (!text("estadoTrade").includes(expected)) {
        fail("classification " + purchase + " => " + text("estadoTrade"));
      }
    }

    setTrade(1500000, "");
    if (text("targetBreakEven") !== "1.425.000" ||
        text("targetGood") !== "≤ 1.388.000" ||
        text("targetProtected") !== "≤ 1.353.000" ||
        text("targetOpportunity") !== "≤ 1.319.000") {
      fail("high-value targets");
    }

    playerInput.value = "Lacroix";
    setTrade(30000, 27300);
    document.getElementById("btnAgregarWatchlist").click();
    const stored = JSON.parse(localStorage.getItem("xoluggTradeLab"));
    if (stored.watchlist.length !== 2) fail("watchlist add");
    if (stored.watchlist[0].mercado !== 30000 || stored.watchlist[0].miPuja !== 27300) {
      fail("new watchlist schema");
    }
    if ("venta" in stored.watchlist[1] || "compraActual" in stored.watchlist[1]) {
      fail("legacy watchlist not migrated");
    }
    if (!text("watchlistBody").includes("27.750") ||
        !text("watchlistBody").includes("27.000")) {
      fail("watchlist thresholds");
    }

    playerInput.value = "Sin puja";
    setTrade(30000, "");
    document.getElementById("btnAgregarWatchlist").click();
    const storedWithoutBid = JSON.parse(
      localStorage.getItem("xoluggTradeLab")
    );
    if (storedWithoutBid.watchlist.length !== 3 ||
        storedWithoutBid.watchlist[0].miPuja !== null) {
      fail("watchlist without bid");
    }
    if (!text("watchlistBody").includes("SIN PUJA")) {
      fail("neutral watchlist status");
    }

    document.querySelector("#watchlistBody [data-watch-delete]").click();
    if (JSON.parse(localStorage.getItem("xoluggTradeLab")).watchlist.length !== 2) {
      fail("watchlist delete");
    }

    document.getElementById("tradeJugador").value = "Gordon";
    document.getElementById("tradeCompra").value = 5000;
    document.getElementById("tradeVenta").value = 6100;
    document.getElementById("btnRegistrarTrade").click();
    if (!text("historialBody").includes("Gordon")) fail("trades regression");

    document.querySelector('.nav-tab[data-section="metaPlayersSection"]').click();
    const gordonId = "gordon-82-lw-91-78-77-82-50-71";
    const gordonRow = [...document.querySelectorAll("#metaPlayersBody [data-player-id]")]
      .find(item => item.dataset.playerId === gordonId)?.closest("tr");
    if (!gordonRow) fail("popular row");
    if (gordonRow.querySelector(".meta-price-input").value !== "8999") {
      fail("manual price regression");
    }
    if (!gordonRow.querySelector(".popular-futbin-link")) fail("FUTBIN regression");
    const search = document.getElementById("metaSearch");
    search.value = "Gordon";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    if (text("metaPlayersCount") !== "1") fail("search regression");
    document.getElementById("btnClearMetaFilters").click();

    const oldBackup = {
      app: "XoluGG TradeLab",
      version: "legacy",
      state: {
        capital: 42000,
        watchlist: [{
          id: 9,
          jugador: "Old Backup",
          venta: 12000,
          compraActual: 10500
        }],
        historial: []
      },
      metaPriceOverrides: {},
      popularPriceOverrides: {}
    };
    const transfer = new DataTransfer();
    transfer.items.add(new File(
      [JSON.stringify(oldBackup)],
      "old-backup.json",
      { type: "application/json" }
    ));
    const backupInput = document.getElementById("backupFileInput");
    backupInput.files = transfer.files;
    backupInput.dispatchEvent(new Event("change", { bubbles: true }));
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const current = JSON.parse(localStorage.getItem("xoluggTradeLab"));
      if (current.capital === 42000) break;
      await delay(50);
    }
    const imported = JSON.parse(localStorage.getItem("xoluggTradeLab"));
    if (imported.watchlist[0].mercado !== 12000 ||
        imported.watchlist[0].miPuja !== 10500) {
      fail(
        "old backup migration: " +
        JSON.stringify(imported) +
        " alerts=" +
        JSON.stringify(observedAlerts)
      );
    }

    let exportedBlob;
    const originalCreate = URL.createObjectURL.bind(URL);
    const originalClick = HTMLAnchorElement.prototype.click;
    URL.createObjectURL = blob => {
      exportedBlob = blob;
      return originalCreate(blob);
    };
    HTMLAnchorElement.prototype.click = function() {};
    document.getElementById("btnExportBackup").click();
    HTMLAnchorElement.prototype.click = originalClick;
    URL.createObjectURL = originalCreate;
    const backup = JSON.parse(await exportedBlob.text());
    if (backup.appVersion !== "0.9.0") fail("backup appVersion");
    if (backup.state.watchlist[0].mercado !== 12000 ||
        backup.state.watchlist[0].miPuja !== 10500) {
      fail("new backup schema");
    }

    document.querySelector('.nav-tab[data-section="dashboardSection"]').click();
    if (text("appVersion") !== "v0.9.0") fail("footer version");
    document.getElementById("btnLimpiarWatchlist").click();
    if (JSON.parse(localStorage.getItem("xoluggTradeLab")).watchlist.length) {
      fail("watchlist clear");
    }
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
      const viewportWidth = document.documentElement.clientWidth;
      const offenders = [...document.querySelectorAll("body *")]
        .map(element => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName,
            id: element.id,
            className: String(element.className || ""),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth
          };
        })
        .filter(item => item.right > viewportWidth + 1 || item.left < -1)
        .slice(0, 12);
      fail(
        "page horizontal overflow " +
        document.documentElement.scrollWidth +
        "/" +
        viewportWidth +
        " " +
        JSON.stringify(offenders)
      );
    }
    if (/\b(?:NaN|Infinity)\b/.test(document.body.innerText)) {
      fail("invalid numeric value visible");
    }
    if (new URLSearchParams(location.search).has("mobile")) {
      if (innerWidth > 550) fail("mobile viewport not applied");
      const columns = getComputedStyle(
        document.querySelector(".target-prices-grid")
      ).gridTemplateColumns.split(" ").length;
      if (columns !== 1) fail("mobile target layout");
      if (getComputedStyle(
        document.querySelector(".calc-actions")
      ).gridTemplateColumns.split(" ").length !== 1) {
        fail("mobile button layout");
      }
    }
    const futbinRequests = performance.getEntriesByType("resource").filter(entry => {
      try {
        return new URL(entry.name).hostname.endsWith("futbin.com");
      } catch {
        return false;
      }
    });
    if (futbinRequests.length) fail("unexpected FUTBIN request");

    await fetch("/report?" + new URLSearchParams({
      result: "PASS",
      total: catalog.length,
      cases: "A-W",
      mode: new URLSearchParams(location.search).has("mobile") ? "mobile" : "desktop",
      regression: "autocomplete,effective-price,market-only,targets,high-value,scenarios,classifications,table,watchlist,trades,popular,futbin,filters,manual-price,backup,capital,version",
      viewport: innerWidth + "x" + innerHeight,
      futbinRequests: futbinRequests.length
    }));
  } catch (error) {
    await fetch("/report?" + new URLSearchParams({
      result: "FAIL",
      message: error.stack || error.message
    }));
  }
});
</script>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  requests.push(url.pathname);
  if (url.pathname === "/report") {
    console.log(JSON.stringify(Object.fromEntries(url.searchParams), null, 2));
    process.exitCode = url.searchParams.get("result") === "PASS" ? 0 : 1;
    res.end("ok");
    if (!screenshotPath) {
      setTimeout(finish, 200);
    }
    return;
  }
  const file = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  const sourcePath = path.join(root, file);
  if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
    res.statusCode = 404;
    res.end();
    return;
  }
  res.setHeader(
    "Content-Type",
    file.endsWith(".html")
      ? "text/html; charset=utf-8"
      : file.endsWith(".css")
        ? "text/css; charset=utf-8"
        : "text/javascript; charset=utf-8"
  );
  let contents = fs.readFileSync(sourcePath);
  if (file === "index.html") {
    contents = Buffer.from(
      contents.toString("utf8").replace("</body>", injected + "</body>")
    );
  }
  res.end(contents);
});

function finish() {
  clearTimeout(timer);
  browser?.kill();
  server.close();
}

server.listen(0, "127.0.0.1", () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "xolugg-phase9-edge-"));
  const browserArgs = [
    "--headless",
    "--disable-gpu",
    "--no-first-run",
    "--remote-debugging-port=0",
    "--window-size=" + (mobile ? "390,1200" : "1440,1200"),
    "--user-data-dir=" + profile
  ];

  if (screenshotPath) {
    browserArgs.push("--screenshot=" + screenshotPath);
    browserArgs.push("--virtual-time-budget=5000");
  }

  browserArgs.push(
    "http://127.0.0.1:" + server.address().port +
      (mobile ? "/?mobile=1" : "/")
  );

  browser = spawn(
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    browserArgs,
    { windowsHide: true, stdio: "ignore" }
  );
  timer = setTimeout(() => {
    console.error("Timeout; requests:", requests);
    process.exitCode = 1;
    finish();
  }, 30000);
  browser.on("error", error => {
    console.error(error);
    process.exitCode = 1;
    finish();
  });
  browser.on("exit", () => {
    if (screenshotPath) {
      finish();
    }
  });
});
