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
window.addEventListener('error', event => {
  fetch('/report?' + new URLSearchParams({
    result: 'FAIL', message: event.error?.stack || event.message
  }));
});
document.addEventListener('DOMContentLoaded', async () => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const fail = message => { throw new Error(message); };
  const mobileMode = new URLSearchParams(location.search).has('mobile');
  const rowByName = name => [...document.querySelectorAll('.popular-player-row')]
    .find(row => row.cells[0].textContent.includes(name));
  const searchFor = async name => {
    const search = document.getElementById('metaSearch');
    search.value = name;
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await delay(20);
    return rowByName(name);
  };
  const assertSelected = (row, label) => {
    if (!row?.classList.contains('is-selected')) fail(label + ' selected class; id=' +
      row?.dataset.popularPlayerId + ' state=' + getSelectedPopularPlayerId() +
      ' class=' + row?.className + ' aria=' + row?.getAttribute('aria-selected'));
    if (row.getAttribute('aria-selected') !== 'true') fail(label + ' aria-selected');
  };
  try {
    await delay(120);
    [...document.querySelectorAll('.nav-tab')]
      .find(tab => tab.dataset.section === 'metaPlayersSection').click();

    const summary = document.getElementById('popularSnapshotSummary');
    if (!summary?.innerText.includes('Snapshot XoluGG')) fail('snapshot summary');
    if (/No disponible|Invalid Date|NaN|undefined/.test(summary.innerText)) {
      fail('snapshot summary fallback');
    }
    if (!document.querySelector('.snapshot-freshness')) fail('row freshness');

    let row = await searchFor('Barcola');
    if (!row) fail('Barcola row');
    row.click();
    assertSelected(row, 'Barcola');
    row.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
    assertSelected(row, 'Barcola after mouseout');
    if (!document.getElementById('popularReviewing').innerText.includes('Barcola')) {
      fail('reviewing Barcola');
    }

    const sort = document.getElementById('metaSort');
    sort.value = 'name-desc';
    sort.dispatchEvent(new Event('change', { bubbles: true }));
    row = rowByName('Barcola');
    assertSelected(row, 'Barcola after sort');

    row = await searchFor('Lacroix');
    if (!row) fail('Lacroix row');
    row.click();
    assertSelected(row, 'Lacroix');
    if (document.getElementById('popularReviewing').innerText.includes('Barcola')) {
      fail('old reviewing selection');
    }

    row.querySelector('[data-meta-action=details]').click();
    assertSelected(row, 'Details action');
    const details = document.querySelector('.popular-detail-panel');
    for (const label of ['Precio actual', 'Observado en snapshot',
      'Último cambio detectado', 'Snapshot', 'Fuente']) {
      if (!details?.innerText.includes(label)) fail('details field ' + label);
    }

    row.querySelector('[data-meta-action=copy-name]').click();
    assertSelected(row, 'Copy action');

    row.querySelector('[data-meta-action=calculator]').click();
    if (getSelectedPopularPlayerId() !== row.dataset.popularPlayerId) {
      fail('Calculate cleared selection');
    }
    if (document.getElementById('jugador').value !== 'Lacroix') fail('Calculate action');
    [...document.querySelectorAll('.nav-tab')]
      .find(tab => tab.dataset.section === 'metaPlayersSection').click();
    row = rowByName('Lacroix');
    row.click();
    assertSelected(row, 'Lacroix reselected after returning');

    const futbin = row.querySelector('[data-meta-action=futbin]');
    if (futbin) {
      futbin.addEventListener('click', event => event.preventDefault(), { once: true, capture: true });
      futbin.click();
      assertSelected(row, 'FUTBIN action');
    }

    await searchFor('no-result-for-selection');
    if (document.querySelector('.popular-player-row.is-selected')) fail('hidden row still selected');
    if (getSelectedPopularPlayerId() !== row.dataset.popularPlayerId) fail('filtered ID lost');
    row = await searchFor('Lacroix');
    assertSelected(row, 'Lacroix reappears');

    document.querySelector('footer').click();
    if (getSelectedPopularPlayerId() !== null) fail('outside click did not clear');
    if (!document.getElementById('popularReviewing').hidden) fail('reviewing did not hide');

    document.getElementById('btnClearMetaFilters').click();
    const noPrice = window.PLAYERS_DATA.find(card => card.precioReferencia === null &&
      String(card.fuente?.precioPrincipalRaw) === '0');
    if (!noPrice) fail('no-price fixture missing');
    const noPriceRow = [...document.querySelectorAll('.popular-player-row')]
      .find(candidate => candidate.dataset.popularPlayerId === noPrice.id);
    if (!noPriceRow?.innerText.includes('Sin precio FUTBIN')) fail('no-price label');
    if (!noPriceRow.querySelector('.snapshot-freshness')) fail('no-price freshness');

    if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
      fail('global horizontal overflow');
    }
    if (mobileMode && innerWidth > 550) fail('mobile viewport');

    await fetch('/report?' + new URLSearchParams({
      result: 'PASS', mode: mobileMode ? 'mobile' : 'desktop',
      cases: 'A-R', total: window.PLAYERS_DATA.length
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
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'xolugg-phase11-edge-'));
  const browserArgs = [
    '--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0',
    '--window-size=' + (mobile ? '390,1200' : '1440,1200'),
    '--user-data-dir=' + profile,
    'http://127.0.0.1:' + server.address().port + (mobile ? '/?mobile=1' : '/')
  ];
  browser = spawn(
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    browserArgs,
    { windowsHide: true, stdio: 'ignore' }
  );
  timer = setTimeout(() => {
    console.error('Timeout de Fase 11');
    process.exitCode = 1;
    finish();
  }, 30000);
  browser.on('error', error => {
    console.error(error);
    process.exitCode = 1;
    finish();
  });
});
