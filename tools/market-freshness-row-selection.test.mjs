import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function makeRow(id) {
  const classes = new Set();
  const attributes = new Map();
  return {
    dataset: { popularPlayerId: id },
    classList: {
      toggle(name, active) {
        if (active) classes.add(name);
        else classes.delete(name);
      },
      contains: name => classes.has(name)
    },
    setAttribute: (name, value) => attributes.set(name, String(value)),
    getAttribute: name => attributes.get(name)
  };
}

function loadApp(players = []) {
  const rows = [];
  const reviewing = { hidden: true, textContent: '' };
  const panel = { contains: target => !!target?.insidePopularPanel };
  const elements = new Map([['popularReviewing', reviewing]]);
  const document = {
    addEventListener() {},
    getElementById: id => elements.get(id) ?? null,
    querySelectorAll: selector => selector === '[data-popular-player-id]' ? rows : [],
    querySelector: selector => selector === '.meta-players-panel' ? panel : null
  };
  const context = vm.createContext({
    window: { PLAYERS_DATA: players, PLAYERS_DATA_META: {} },
    document,
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    console: { log() {}, warn() {}, error() {} },
    structuredClone
  });
  vm.runInContext(fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8'), context);
  return {
    context,
    rows,
    reviewing,
    setRows(ids) {
      rows.splice(0, rows.length, ...ids.map(makeRow));
      return rows;
    }
  };
}

const now = Date.parse('2026-09-19T20:00:00.000Z');
const ago = minutes => new Date(now - minutes * 60000).toISOString();
const player = (id, name, price = 10000) => ({
  id,
  nombre: name,
  precioReferencia: price,
  fuente: { importedAt: '2026-09-19T19:00:00.000Z' }
});

test('A/F. valid snapshots format a local exact time and invalid values fail safely', () => {
  const { context } = loadApp();
  const exact = context.formatLocalSnapshotDate('2026-09-19T16:19:00.000Z');
  assert.notEqual(exact, 'No disponible');
  assert(exact.includes('·'));
  assert(!/Invalid|NaN|undefined/.test(exact));
  assert.equal(context.formatLocalSnapshotDate('invalid'), 'No disponible');
  assert.equal(context.getSnapshotFreshness('invalid', now).key, 'unknown');
});

test('B-E. freshness thresholds are exact at 2, 6 and 12 hours', () => {
  const { context } = loadApp();
  for (const [minutes, expected] of [
    [0, 'fresh'], [119, 'fresh'], [120, 'recent'], [359, 'recent'],
    [360, 'aging'], [719, 'aging'], [720, 'stale'], [2880, 'stale']
  ]) assert.equal(context.getSnapshotFreshness(ago(minutes), now).key, expected);
  assert.equal(context.formatSnapshotRelativeTime(ago(0), now), 'hace unos segundos');
  assert.equal(context.formatSnapshotRelativeTime(ago(5), now), 'hace 5 min');
  assert.equal(context.formatSnapshotRelativeTime(ago(60), now), 'hace 1 h');
  assert.equal(context.formatSnapshotRelativeTime(ago(87), now), 'hace 1 h 27 min');
  assert.equal(context.formatSnapshotRelativeTime(ago(1440), now), 'hace 1 día');
  assert.equal(context.formatSnapshotRelativeTime(ago(2880), now), 'hace 2 días');
});

test('G. raw zero with a null reference is explicit and never rendered as zero', () => {
  const { context } = loadApp();
  const presentation = context.getPopularPricePresentation({
    precioEfectivo: null,
    precioReferencia: null,
    fuente: { precioPrincipalRaw: '0' }
  });
  assert.equal(presentation.available, false);
  assert.equal(presentation.text, 'Sin precio FUTBIN');
  assert(!presentation.text.includes('0'));
});

test('H-K. row changes selection, outside clears it and internal actions keep it', () => {
  const app = loadApp([player('a', 'Barcola', 99500), player('b', 'Lacroix', null)]);
  const rows = app.setRows(['a', 'b']);
  assert.equal(app.context.selectPopularPlayer('a'), 'a');
  assert.equal(app.context.getSelectedPopularPlayerId(), 'a');
  assert.equal(rows[0].classList.contains('is-selected'), true);
  assert.equal(rows[0].getAttribute('aria-selected'), 'true');

  app.context.selectPopularPlayer('b');
  assert.equal(app.context.getSelectedPopularPlayerId(), 'b');
  assert.equal(rows[0].classList.contains('is-selected'), false);
  assert.equal(rows[1].classList.contains('is-selected'), true);

  assert.equal(app.context.handlePopularOutsideClick({
    target: { insidePopularPanel: true, action: 'details' }
  }), false);
  assert.equal(app.context.getSelectedPopularPlayerId(), 'b');
  assert.equal(app.context.handlePopularOutsideClick({ target: {} }), true);
  assert.equal(app.context.getSelectedPopularPlayerId(), null);
});

test('L-N. selection survives sort/filter rerenders and returns when visible again', () => {
  const app = loadApp([player('a', 'Barcola', 99500), player('b', 'Lacroix', null)]);
  app.setRows(['a', 'b']);
  app.context.selectPopularPlayer('a');

  let rows = app.setRows(['b', 'a']);
  app.context.applyPopularPlayerSelection();
  assert.equal(rows[1].classList.contains('is-selected'), true);

  rows = app.setRows(['b']);
  app.context.applyPopularPlayerSelection();
  assert.equal(app.context.getSelectedPopularPlayerId(), 'a');
  assert.equal(rows.some(row => row.classList.contains('is-selected')), false);

  rows = app.setRows(['a']);
  app.context.applyPopularPlayerSelection();
  assert.equal(rows[0].classList.contains('is-selected'), true);
  assert.equal(rows[0].getAttribute('aria-selected'), 'true');
});

test('O-Q. removed IDs clear safely and Reviewing/ARIA follow the state', () => {
  const app = loadApp([player('a', 'Barcola', 99500), player('b', 'Lacroix', null)]);
  const rows = app.setRows(['a', 'b']);
  app.context.selectPopularPlayer('a');
  assert.equal(app.reviewing.hidden, false);
  assert.equal(app.reviewing.textContent, 'Revisando: Barcola · 99.500');
  assert.equal(rows[0].getAttribute('aria-selected'), 'true');

  app.context.window.PLAYERS_DATA = [player('b', 'Lacroix', null)];
  app.context.applyPopularPlayerSelection();
  assert.equal(app.context.getSelectedPopularPlayerId(), null);
  assert.equal(app.reviewing.hidden, true);
  assert.equal(rows[0].getAttribute('aria-selected'), 'false');
});

test('R. touch selection is click-driven and essential state is not hover-only', () => {
  const appSource = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  const cssSource = fs.readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  assert.match(appSource, /row\.className = 'popular-player-row'/);
  assert.match(appSource, /row\.tabIndex = 0/);
  assert.match(appSource, /event\.key !== 'Enter' && event\.key !== ' '/);
  assert.match(appSource, /document\.addEventListener\('click', handlePopularOutsideClick\)/);
  assert(cssSource.includes('.popular-player-row.is-selected > td'));
  assert(cssSource.includes('@media (hover: hover)'));
});
