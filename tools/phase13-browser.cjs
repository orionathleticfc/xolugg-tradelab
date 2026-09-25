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
  try {
    await delay(100);
    state.watchlist = Array.from({ length: 20 }, (_, index) => ({
      id: 'watch-' + index,
      jugador: index === 7 ? 'Karchaoui' : 'Jugador ' + String(20 - index).padStart(2, '0'),
      mercado: (index + 1) * 5000,
      miPuja: index % 4 === 0 ? null : (index + 1) * 4000,
      fecha: new Date(Date.now() - index * 1000).toISOString()
    }));
    renderWatchlist();

    const wrapper = document.querySelector('.watchlist-table-wrapper');
    const header = wrapper?.querySelector('th');
    if (!wrapper || wrapper.scrollHeight <= wrapper.clientHeight) fail('internal scroll');
    const expectedMax = innerWidth <= 550 ? 340 : 430;
    if (wrapper.clientHeight > expectedMax + 1) fail('bounded height');
    const initialHeight = wrapper.clientHeight;
    const initialScrollHeight = wrapper.scrollHeight;
    wrapper.scrollTop = 150;
    await delay(30);
    const wrapperTop = wrapper.getBoundingClientRect().top;
    const headerTop = header.getBoundingClientRect().top;
    if (Math.abs(wrapperTop - headerTop) > 2) fail('sticky header');

    const marketButton = document.querySelector('[data-watch-sort="mercado"]');
    marketButton.click();
    if (marketButton.closest('th').getAttribute('aria-sort') !== 'ascending') {
      fail('aria ascending');
    }
    marketButton.click();
    if (marketButton.closest('th').getAttribute('aria-sort') !== 'descending') {
      fail('aria descending');
    }

    const search = document.getElementById('watchlistSearch');
    search.value = 'KAR';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    if (document.querySelectorAll('#watchlistBody tr').length !== 1 ||
        !document.getElementById('watchlistBody').innerText.includes('Karchaoui')) {
      fail('search and sort');
    }
    const deleteButton = document.querySelector('#watchlistBody [data-watch-delete]');
    const deletedId = deleteButton.dataset.watchDelete;
    deleteButton.click();
    if (state.watchlist.some(item => String(item.id) === deletedId)) fail('stable delete');

    document.getElementById('btnWatchlistRecentes').click();
    if (document.querySelector('[aria-sort]:not([aria-sort="none"])')) fail('recent reset');
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
      fail('global horizontal overflow');
    }
    if (new URLSearchParams(location.search).has('mobile') && innerWidth > 550) {
      fail('mobile viewport');
    }

    await fetch('/report?' + new URLSearchParams({
      result: 'PASS',
      mode: innerWidth <= 550 ? 'mobile' : 'desktop',
      height: initialHeight,
      scrollHeight: initialScrollHeight
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
    : file.endsWith('.css')
    ? 'text/css; charset=utf-8'
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
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'xolugg-phase13-edge-'));
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
    console.error('Timeout de Fase 13');
    process.exitCode = 1;
    finish();
  }, 30000);
  browser.on('error', error => {
    console.error(error);
    process.exitCode = 1;
    finish();
  });
});
