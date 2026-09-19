const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const root = process.cwd();
const pdfPath = process.argv[2] || path.join(process.env.USERPROFILE, 'Downloads',
  'EA FC 27 Popular Players _ FUTBIN7.pdf');
let browser;
let timer;
const injected = String.raw`
<script>
window.addEventListener('error', event => {
  fetch('/report', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result: 'FAIL', message: event.error?.stack || event.message }) });
});
document.addEventListener('DOMContentLoaded', async () => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  try {
    const response = await fetch('/real.pdf');
    if (!response.ok) throw new Error('PDF HTTP ' + response.status);
    const transfer = new DataTransfer();
    transfer.items.add(new File([await response.blob()], 'EA FC 27 Popular Players _ FUTBIN7.pdf',
      { type: 'application/pdf' }));
    const input = document.getElementById('pdf-file');
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    for (let attempt = 0; attempt < 2400; attempt++) {
      if (window.__XOLUGG_FUTBIN_IMPORTER_RESULT__?.generationResult?.report &&
          !document.getElementById('generation-report').disabled) break;
      if (!document.getElementById('error').hidden) throw new Error(document.getElementById('error').textContent);
      await delay(100);
    }
    const observed = window.__XOLUGG_FUTBIN_IMPORTER_RESULT__;
    if (!observed?.generationResult?.report) throw new Error('Generation timeout');
    const { generationResult, diagnostic, parsedCards, linkedSnapshotCards, linksDiagnostic } = observed;
    const wanted = new Set(['Bouaddi', 'Safonov', 'Pato', 'Lamine Yamal', 'Barcola']);
    const cards = (linkedSnapshotCards || parsedCards.cards).filter(card => wanted.has(card.nombre))
      .map(card => ({ nombre: card.nombre, ovr: card.ovr, tipoCarta: card.tipoCarta,
        precioReferencia: card.precioReferencia, precioReferenciaRaw: card.precioReferenciaRaw,
        sourcePage: card.sourcePage, sourceColumn: card.sourceColumn,
        anchorY: card.evidence?.anchorY, futbin: card.futbin || null,
        stats: card.stats, parseStatus: card.parseStatus, warnings: card.warnings }));
    const candidateCases = generationResult.candidateCatalog.filter(card => wanted.has(card.nombre))
      .map(card => ({ id: card.id, nombre: card.nombre, ovr: card.ovr,
        tipoCarta: card.tipoCarta, precioReferencia: card.precioReferencia, futbin: card.futbin || null }));
    const payload = {
      result: 'PASS', parser: parsedCards.metrics,
      visualCounts: parsedCards.cards.reduce((counts, card) => {
        counts[card.tipoCarta] = (counts[card.tipoCarta] || 0) + 1; return counts;
      }, {}),
      links: linksDiagnostic.summary,
      generation: generationResult.report.summary,
      removed: generationResult.report.removedFromPreviousCatalog.count,
      excludedUnavailableTwins: generationResult.report.excludedUnavailableTwins,
      needsReview: generationResult.report.needsReview,
      idCollisions: generationResult.report.idCollisions,
      validationErrors: generationResult.validation.errors,
      safetyWarnings: generationResult.report.safetyWarnings,
      cases: cards, candidateCases,
      unknownCases: generationResult.candidateCatalog.filter(card => card.tipoCarta === 'unknown')
        .map(card => ({ id: card.id, nombre: card.nombre, ovr: card.ovr, futbin: card.futbin || null })),
      candidateSource: generationResult.candidateSource,
      visualSignals: diagnostic.cardVisuals.filter(signal => cards.some(card =>
        card.sourcePage === signal.page && card.sourceColumn === signal.column &&
        Math.abs(card.anchorY - signal.anchorY) < 4))
    };
    await fetch('/report', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) });
  } catch (error) {
    await fetch('/report', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: 'FAIL', message: error.stack || error.message }) });
  }
});
</script>`;

function finish() {
  clearTimeout(timer);
  browser?.kill();
  server.close();
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/report' && req.method === 'POST') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8');
      try {
        const payload = JSON.parse(body);
        if (payload.candidateSource) {
          const candidatePath = path.join(os.tmpdir(), 'xolugg-phase10-authoritative-candidate.js');
          fs.writeFileSync(candidatePath, payload.candidateSource, 'utf8');
          payload.candidatePath = candidatePath;
          delete payload.candidateSource;
        }
        console.log(JSON.stringify(payload));
        process.exitCode = payload.result === 'PASS' ? 0 : 1;
      } catch { console.log(body); process.exitCode = 1; }
      res.end('ok');
      setTimeout(finish, 200);
    });
    return;
  }
  if (url.pathname === '/real.pdf') {
    if (!fs.existsSync(pdfPath)) { res.statusCode = 404; res.end(); return; }
    res.setHeader('Content-Type', 'application/pdf');
    fs.createReadStream(pdfPath).pipe(res);
    return;
  }
  const requested = url.pathname.slice(1);
  const file = url.pathname === '/' ? 'tools/futbin-importer.html' :
    requested.startsWith('futbin-') ? 'tools/' + requested : requested;
  const sourcePath = path.join(root, file);
  if (!sourcePath.startsWith(root) || !fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
    res.statusCode = 404; res.end(); return;
  }
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8' };
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  let contents = fs.readFileSync(sourcePath);
  if (file === 'tools/futbin-importer.html') {
    contents = Buffer.from(contents.toString('utf8').replace('</body>', injected + '</body>'));
  }
  res.end(contents);
});

server.listen(0, '127.0.0.1', () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'xolugg-phase10-edge-'));
  browser = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0',
    '--window-size=1440,1200', '--user-data-dir=' + profile,
    'http://127.0.0.1:' + server.address().port + '/'
  ], { windowsHide: true, stdio: 'ignore' });
  timer = setTimeout(() => {
    console.error('Timeout processing real PDF');
    process.exitCode = 1; finish();
  }, 300000);
  browser.on('error', error => { console.error(error); process.exitCode = 1; finish(); });
});
