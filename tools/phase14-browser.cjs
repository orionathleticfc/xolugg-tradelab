const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const root = process.cwd();
const mobile = process.argv.includes('--mobile');
let browser;
let timer;

const injected = String.raw`
<script>
window.alert = () => {};
window.confirm = () => true;
window.addEventListener('error', event => {
  fetch('/report?' + new URLSearchParams({
    result: 'FAIL', message: event.error?.stack || event.message
  }));
});
document.addEventListener('DOMContentLoaded', async () => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const fail = message => { throw new Error(message); };
  const rowFor = id => document.querySelector('[data-watch-item-id="' + id + '"]');
  try {
    await delay(120);
    const barcola = window.PLAYERS_DATA.find(card =>
      card.nombre === 'Barcola' && card.futbin?.url && card.precioReferencia);
    const other = window.PLAYERS_DATA.find(card =>
      card.id !== barcola?.id && card.precioReferencia);
    if (!barcola || !other) fail('fixtures');
    const longCards = [
      barcola,
      other,
      ...window.PLAYERS_DATA.filter(card =>
        card.id !== barcola.id && card.id !== other.id && card.precioReferencia)
    ].slice(0, 22);
    state.watchlist = longCards.map((card, index) => ({
      id: index === 0 ? 'watch-barcola' :
        index === 1 ? 'watch-other' : 'watch-long-' + index,
      playerId: card.id,
      jugador: card.nombre,
      mercado: card.precioReferencia,
      miPuja: index % 3 ? null : Math.max(1, card.precioReferencia - 1000),
      fecha: new Date(Date.UTC(2026, 8, 24, 12, 0, index)).toISOString()
    }));
    renderWatchlist();
    const wrapper = document.querySelector('.watchlist-table-wrapper');
    const headers = [...document.querySelectorAll('.watchlist-table thead th')]
      .map(cell => cell.innerText.trim().replace(/[↑↓]/g, '').trim());
    const expectedHeaders = [
      'Jugador', 'Mercado', 'Compra buena', 'Compra protegida', 'Mi puja', 'Acciones'
    ];
    if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) {
      fail('watchlist headers: ' + JSON.stringify(headers));
    }
    if (wrapper.scrollHeight <= wrapper.clientHeight) fail('missing vertical scroll');
    if (getComputedStyle(document.querySelector('.watchlist-table th')).position !== 'sticky') {
      fail('header not sticky');
    }
    wrapper.scrollTop = 120;
    await delay(40);
    const stickyDelta = Math.abs(
      document.querySelector('.watchlist-table th').getBoundingClientRect().top -
      wrapper.getBoundingClientRect().top
    );
    if (stickyDelta > 3) fail('sticky header moved: ' + stickyDelta);
    wrapper.scrollTop = 0;
    const barcolaRow = rowFor('watch-barcola');
    const futbin = barcolaRow.querySelector('.watchlist-action-button.futbin');
    if (futbin?.href !== barcola.futbin.url) fail('exact FUTBIN URL');
    if (futbin.target !== '_blank' || !futbin.rel.includes('noopener') ||
        !futbin.rel.includes('noreferrer')) fail('FUTBIN protection');
    const edit = barcolaRow.querySelector('[data-watch-action="edit"]');
    if (!edit?.getAttribute('aria-label')?.includes('Barcola')) fail('edit aria');

    if (new URLSearchParams(location.search).has('mobile')) {
      edit.click();
      if (!document.getElementById('watchlistPriceInput')) fail('mobile editor');
      if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
        fail('mobile global overflow');
      }
      await fetch('/report?' + new URLSearchParams({
        result: 'PASS', mode: 'mobile', cases: 'smoke-actions-editor'
      }));
      return;
    }

    if (wrapper.scrollWidth > wrapper.clientWidth + 1) {
      fail('desktop watchlist horizontal overflow');
    }
    const actionBox = barcolaRow.querySelector('.watchlist-actions');
    if (actionBox.scrollWidth > actionBox.clientWidth + 1) {
      fail('desktop actions clipped ' + actionBox.clientWidth + '/' +
        actionBox.scrollWidth);
    }

    selectCalculatorPlayer({ id: barcola.id, name: barcola.nombre });
    const purchase = document.getElementById('precioCompra');
    purchase.value = '90000';
    calcularTrade();
    const search = document.getElementById('watchlistSearch');
    search.value = 'BAR';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('[data-watch-sort="mercado"]').click();
    rowFor('watch-barcola').querySelector('[data-watch-action="edit"]').click();
    let priceInput = document.getElementById('watchlistPriceInput');
    const effectiveBefore = getPopularPlayerData(barcola).precioEfectivo;
    if (Number(priceInput.value) !== effectiveBefore) fail('effective editor value');
    if (document.activeElement !== priceInput) fail('editor focus');
    if (Number(priceInput.step) !== getMarketStep(effectiveBefore)) {
      fail('dynamic editor step');
    }

    priceInput.value = '15750';
    priceInput.dispatchEvent(new InputEvent('input', {
      bubbles: true, inputType: 'insertText'
    }));
    priceInput.stepUp();
    priceInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
    if (Number(priceInput.value) !== 16000) fail('ArrowUp market step');
    priceInput.stepDown();
    priceInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
    if (Number(priceInput.value) !== 15750) fail('ArrowDown market step');

    priceInput.value = '10000';
    priceInput.dispatchEvent(new InputEvent('input', {
      bubbles: true, inputType: 'insertText'
    }));
    priceInput.stepUp();
    priceInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
    if (Number(priceInput.value) !== 10250) fail('range crossing up');
    priceInput.stepDown();
    priceInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
    if (Number(priceInput.value) !== 10000) fail('range crossing down');

    priceInput.value = '0';
    priceInput.closest('td').querySelector('[data-watch-action="save"]').click();
    if (!document.getElementById('watchlistPriceFeedback').textContent) {
      fail('invalid feedback');
    }
    if (getPopularPlayerData(barcola).precioEfectivo !== effectiveBefore) {
      fail('invalid changed price');
    }

    const metaSearch = document.getElementById('metaSearch');
    const metaSort = document.getElementById('metaSort');
    metaSearch.value = 'Barcola';
    metaSearch.dispatchEvent(new Event('input', { bubbles: true }));
    metaSort.value = 'name-desc';
    metaSort.dispatchEvent(new Event('change', { bubbles: true }));
    selectPopularPlayer(barcola.id);
    priceInput = document.getElementById('watchlistPriceInput');
    priceInput.value = '97000';
    priceInput.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter', bubbles: true
    }));
    if (watchlistView.query !== 'BAR' || watchlistView.sortKey !== 'mercado') {
      fail('search/sort lost');
    }
    if (getPopularPlayerData(barcola).precioEfectivo !== 97000) fail('watch save');
    if (Number(document.getElementById('precioVenta').value) !== 97000) fail('calculator sync');
    if (document.getElementById('precioCompra').value !== '90000') fail('bid changed');
    const popularInput = [...document.querySelectorAll('.meta-price-input')]
      .find(input => input.dataset.playerId === barcola.id);
    if (Number(popularInput?.value) !== 97000) fail('popular sync');
    if (selectedPopularPlayerId !== barcola.id ||
        metaSearch.value !== 'Barcola' || metaSort.value !== 'name-desc') {
      fail('popular state lost');
    }

    popularInput.value = '101000';
    [...document.querySelectorAll('[data-meta-action="save-price"]')]
      .find(button => button.dataset.playerId === barcola.id).click();
    if (getWatchlistDisplayData(state.watchlist[0]).market !== 101000) {
      fail('popular to watchlist sync');
    }
    if (Number(document.getElementById('precioVenta').value) !== 101000) {
      fail('popular to calculator sync');
    }

    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    rowFor('watch-barcola').querySelector('[data-watch-action="edit"]').click();
    priceInput = document.getElementById('watchlistPriceInput');
    priceInput.value = '1000';
    priceInput.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter', bubbles: true
    }));
    if (document.querySelector('#watchlistBody tr')?.dataset.watchItemId !== 'watch-barcola') {
      fail('sort not reapplied');
    }

    rowFor('watch-barcola').querySelector('[data-watch-action="edit"]').click();
    priceInput = document.getElementById('watchlistPriceInput');
    priceInput.value = '2000';
    priceInput.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape', bubbles: true
    }));
    if (getPopularPlayerData(barcola).precioEfectivo !== 1000) fail('escape changed price');

    const noPrice = window.PLAYERS_DATA.find(card =>
      card.precioReferencia === null && String(card.fuente?.precioPrincipalRaw) === '0' &&
      card.futbin?.url);
    if (!noPrice) fail('no-price fixture');
    state.watchlist.unshift({
      id: 'watch-no-price', playerId: noPrice.id, jugador: noPrice.nombre,
      mercado: null, miPuja: null, fecha: '2026-09-25T12:00:00Z'
    });
    resetWatchlistSort();
    if (!rowFor('watch-no-price').innerText.includes('Sin precio FUTBIN')) {
      fail('no-price label');
    }
    rowFor('watch-no-price').querySelector('[data-watch-action="edit"]').click();
    priceInput = document.getElementById('watchlistPriceInput');
    priceInput.value = '45000';
    priceInput.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter', bubbles: true
    }));
    if (getPopularPlayerData(noPrice).precioEfectivo !== 45000) fail('no-price manual');
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
      fail('desktop global overflow');
    }
    await fetch('/report?' + new URLSearchParams({
      result: 'PASS', mode: 'desktop',
      watchPrice: getPopularPlayerData(barcola).precioEfectivo,
      noPriceManual: getPopularPlayerData(noPrice).precioEfectivo
    }));
  } catch (error) {
    await fetch('/report?' + new URLSearchParams({
      result: 'FAIL', message: error.stack || error.message
    }));
  }
});
</script>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/report') {
    console.log(JSON.stringify(Object.fromEntries(url.searchParams), null, 2));
    process.exitCode = url.searchParams.get('result') === 'PASS' ? 0 : 1;
    res.end('ok');
    setTimeout(finish, 150);
    return;
  }
  const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const sourcePath = path.join(root, file);
  if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
    res.statusCode = 404;
    res.end();
    return;
  }
  res.setHeader('Content-Type', file.endsWith('.html')
    ? 'text/html; charset=utf-8'
    : file.endsWith('.css') ? 'text/css; charset=utf-8'
    : 'text/javascript; charset=utf-8');
  let contents = fs.readFileSync(sourcePath);
  if (file === 'index.html') {
    contents = Buffer.from(contents.toString('utf8').replace('</body>', injected + '</body>'));
  }
  res.end(contents);
});

function finish() {
  clearTimeout(timer);
  browser?.kill();
  server.close();
}

server.listen(0, '127.0.0.1', () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'xolugg-phase14-edge-'));
  browser = spawn(
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    [
      '--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0',
      '--window-size=' + (mobile ? '390,1200' : '1440,1200'),
      '--user-data-dir=' + profile,
      'http://127.0.0.1:' + server.address().port + (mobile ? '/?mobile=1' : '/')
    ],
    { windowsHide: true, stdio: 'ignore' }
  );
  timer = setTimeout(() => {
    console.error('Timeout de Fase 14');
    process.exitCode = 1;
    finish();
  }, 30000);
  browser.on('error', error => {
    console.error(error);
    process.exitCode = 1;
    finish();
  });
});
