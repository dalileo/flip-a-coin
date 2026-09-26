'use strict';

const $ = (id) => document.getElementById(id);

const els = {
  coin: $('coin'),
  inner: $('coin-inner'),
  shadow: $('coin-shadow'),
  result: $('result'),
  resultLine: document.querySelector('.result'),
  hint: $('hint'),
  announce: $('announce'),
  statsLine: $('stats-line'),
  historyLine: $('history-line'),
  heatmap: $('heatmap'),
  heatmapMonths: $('heatmap-months'),
  heatmapCaption: $('heatmap-caption'),
  reset: $('reset'),
  themeToggle: $('theme-toggle'),
  themeColor: document.querySelector('meta[name="theme-color"]'),
};

const LABEL = { heads: 'cara', tails: 'cruz' };
const STORAGE_KEY = 'flip-a-coin:stats';
const HISTORY_LIMIT = 32;
const FLIP_MS = 1500;
const HEATMAP_WEEKS = 26;
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* --------------------------------------------------------------------------
   Almacenamiento (tolerante a modo privado o storage bloqueado)
   -------------------------------------------------------------------------- */

const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* sin persistencia */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* sin persistencia */ }
  },
};

const emptyStats = () => ({ heads: 0, tails: 0, best: 0, history: [], days: {} });

function loadStats() {
  try {
    const data = JSON.parse(storage.get(STORAGE_KEY));
    if (data && Array.isArray(data.history)) {
      const days = {};
      for (const [k, v] of Object.entries(data.days || {})) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(k) && Number(v) > 0) days[k] = Number(v);
      }
      return {
        heads: Number(data.heads) || 0,
        tails: Number(data.tails) || 0,
        best: Number(data.best) || 0,
        history: data.history.filter((s) => s in LABEL).slice(0, HISTORY_LIMIT),
        days,
      };
    }
  } catch { /* datos corruptos: se empieza de cero */ }
  return emptyStats();
}

let stats = loadStats();

/* --------------------------------------------------------------------------
   Fechas (siempre en hora local)
   -------------------------------------------------------------------------- */

const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const formatDay = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/* --------------------------------------------------------------------------
   Moneda
   -------------------------------------------------------------------------- */

// Aleatoriedad criptográfica: 50/50 sin sesgo
function randomSide() {
  const buf = new Uint8Array(1);
  crypto.getRandomValues(buf);
  return buf[0] & 1 ? 'tails' : 'heads';
}

// Rotación acumulada en grados; múltiplo de 360 = cara, +180 = cruz
let rotation = stats.history[0] === 'tails' ? 180 : 0;
let busy = false;

function setBusy(value) {
  busy = value;
  els.coin.setAttribute('aria-busy', String(value));
}

function nextRotation(side) {
  const turns = 4 + Math.floor(Math.random() * 3); // 4–6 vueltas completas
  const current = ((rotation % 360) + 360) % 360;   // 0 o 180
  const target = side === 'heads' ? 0 : 180;
  const correction = (target - current + 360) % 360;
  return rotation + turns * 360 + correction;
}

function animateFlip(from, to) {
  if (reducedMotion.matches || !els.inner.animate) {
    els.inner.style.transform = `rotateX(${to}deg)`;
    return Promise.resolve();
  }

  const lift = `calc(var(--coin-size) * -0.45)`;
  const opts = { duration: FLIP_MS, fill: 'forwards' };

  const spin = els.inner.animate(
    [
      { transform: `rotateX(${from}deg)` },
      { transform: `rotateX(${to}deg)` },
    ],
    { ...opts, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
  );

  els.coin.animate(
    [
      { transform: 'translateY(0) scale(1)', easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)' },
      { transform: `translateY(${lift}) scale(1.08)`, offset: 0.45, easing: 'cubic-bezier(0.6, 0, 0.8, 0.4)' },
      { transform: 'translateY(0) scale(1)', offset: 0.86, easing: 'ease-out' },
      { transform: 'translateY(-4%) scale(1)', offset: 0.93, easing: 'ease-in' },
      { transform: 'translateY(0) scale(1)' },
    ],
    opts,
  );

  els.shadow.animate(
    [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(0.55)', opacity: 0.35, offset: 0.45 },
      { transform: 'scale(1)', opacity: 1, offset: 0.86 },
      { transform: 'scale(0.95)', opacity: 0.9, offset: 0.93 },
      { transform: 'scale(1)', opacity: 1 },
    ],
    opts,
  );

  return spin.finished.then(() => {
    // Fijar el estado final y liberar la animación
    els.inner.style.transform = `rotateX(${to}deg)`;
    els.inner.getAnimations().forEach((a) => a.cancel());
  });
}

/* --------------------------------------------------------------------------
   Efecto "hypertext": caracteres aleatorios que se resuelven letra a letra
   -------------------------------------------------------------------------- */

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=/<>?';
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

function renderScramble(final, resolved) {
  const done = final.slice(0, resolved);
  let noise = '';
  for (let i = resolved; i < final.length; i += 1) noise += randomGlyph();

  const span = document.createElement('span');
  span.className = 'scramble';
  span.textContent = noise;
  els.result.replaceChildren(done, span);
}

function scramble(final, duration) {
  if (reducedMotion.matches) {
    els.result.textContent = final;
    return Promise.resolve();
  }

  // Ruido durante el vuelo; las letras se fijan en el último 40 %
  const revealFrom = duration * 0.6;
  const step = (duration - revealFrom) / final.length;
  const start = performance.now();
  let lastTick = 0;

  // El cursor deja de parpadear mientras "escribe"
  els.resultLine.classList.add('is-typing');

  return new Promise((resolve) => {
    const frame = (now) => {
      const t = now - start;
      if (t >= duration) {
        els.result.textContent = final;
        els.resultLine.classList.remove('is-typing');
        resolve();
        return;
      }
      if (now - lastTick > 45) {
        lastTick = now;
        const resolved = t < revealFrom ? 0 : Math.floor((t - revealFrom) / step) + 1;
        renderScramble(final, Math.min(resolved, final.length));
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

async function flip() {
  if (busy) return;
  setBusy(true);

  const side = randomSide();
  const from = rotation;
  rotation = nextRotation(side);

  els.announce.textContent = '';
  await Promise.all([
    animateFlip(from, rotation),
    scramble(LABEL[side].toUpperCase(), FLIP_MS * 0.88),
  ]);

  els.announce.textContent = `Salió ${LABEL[side]}`;
  record(side);
  navigator.vibrate?.(15);
  setBusy(false);
}

/* --------------------------------------------------------------------------
   Estadísticas
   -------------------------------------------------------------------------- */

function currentStreak() {
  const [first] = stats.history;
  if (!first) return null;
  let n = 0;
  while (stats.history[n] === first) n += 1;
  return { side: first, n };
}

function record(side) {
  stats[side] += 1;
  stats.history.unshift(side);
  stats.history.length = Math.min(stats.history.length, HISTORY_LIMIT);
  stats.best = Math.max(stats.best, currentStreak().n);

  const today = dayKey(new Date());
  stats.days[today] = (stats.days[today] || 0) + 1;

  storage.set(STORAGE_KEY, JSON.stringify(stats));
  render();
}

// Construye una línea tipo "etiqueta valor · etiqueta valor"
function fillLine(el, items) {
  const nodes = [];
  items.forEach(([label, value, extraClass], i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'sep';
      sep.textContent = '·';
      nodes.push(sep);
    }
    const item = document.createElement('span');
    item.className = 'item';
    const b = document.createElement('b');
    if (extraClass) b.className = extraClass;
    b.textContent = value;
    item.append(`${label} `, b);
    nodes.push(item);
  });
  el.replaceChildren(...nodes);
}

function renderStats() {
  const total = stats.heads + stats.tails;
  const pct = (n) => (total ? `${Math.round((n / total) * 100)}%` : '–');
  const streak = currentStreak();

  fillLine(els.statsLine, [
    ['total', String(total)],
    ['cara', pct(stats.heads)],
    ['cruz', pct(stats.tails)],
    ['racha', streak ? `${streak.n}×${LABEL[streak.side]}` : '–'],
    ['récord', stats.best ? String(stats.best) : '–'],
    ['hoy', String(stats.days[dayKey(new Date())] || 0)],
  ]);

  // ● cara, ○ cruz; el más reciente a la izquierda
  const trail = stats.history.map((s) => (s === 'heads' ? '●' : '○')).join('');
  fillLine(els.historyLine, [['últimos', trail || '–', 'history']]);
  els.historyLine.setAttribute(
    'aria-label',
    trail ? `Últimos: ${stats.history.map((s) => LABEL[s]).join(', ')}` : 'Sin lanzamientos',
  );
}

function renderHeatmap() {
  const today = new Date();
  const todayKey = dayKey(today);
  const mondayIndex = (today.getDay() + 6) % 7;
  const start = addDays(today, -mondayIndex - (HEATMAP_WEEKS - 1) * 7);

  const counts = [];
  for (let i = 0; i < HEATMAP_WEEKS * 7; i += 1) {
    const d = addDays(start, i);
    counts.push({ d, key: dayKey(d), n: stats.days[dayKey(d)] || 0 });
  }

  const max = Math.max(1, ...counts.map((c) => c.n));
  let flips = 0;
  let activeDays = 0;

  const cells = counts.map(({ d, key, n }) => {
    const cell = document.createElement('i');
    if (key > todayKey) {
      cell.className = 'is-future';
      return cell;
    }
    if (key === todayKey) cell.className = 'is-today';
    if (n) {
      flips += n;
      activeDays += 1;
      cell.dataset.l = String(Math.min(4, Math.ceil((n / max) * 4)));
    }
    cell.title = `${formatDay(d)} · ${n} ${n === 1 ? 'lanzamiento' : 'lanzamientos'}`;
    return cell;
  });

  // Etiqueta de mes en la columna de la semana donde empieza cada mes
  const months = [];
  let lastLabelCol = -3;
  for (let w = 0; w < HEATMAP_WEEKS; w += 1) {
    const weekStart = addDays(start, w * 7);
    const firstOfMonth = [0, 1, 2, 3, 4, 5, 6]
      .map((i) => addDays(weekStart, i))
      .find((d) => d.getDate() === 1);
    const span = document.createElement('span');
    if (firstOfMonth && w - lastLabelCol >= 3) {
      span.textContent = MONTHS[firstOfMonth.getMonth()];
      lastLabelCol = w;
    }
    months.push(span);
  }

  els.heatmap.style.setProperty('--cols', HEATMAP_WEEKS);
  els.heatmapMonths.style.setProperty('--cols', HEATMAP_WEEKS);
  els.heatmap.replaceChildren(...cells);
  els.heatmapMonths.replaceChildren(...months);

  const caption = `${flips} en ${activeDays} ${activeDays === 1 ? 'día' : 'días'} · ${HEATMAP_WEEKS} semanas`;
  els.heatmapCaption.textContent = caption;
  els.heatmap.setAttribute('aria-label', `Mapa de actividad: ${caption}`);
}

function render() {
  renderStats();
  renderHeatmap();
  els.reset.hidden = stats.heads + stats.tails === 0;
}

function resetStats() {
  if (busy) return;
  if (!window.confirm('¿Borrar estadísticas, historial y mapa de actividad?')) return;
  stats = emptyStats();
  storage.remove(STORAGE_KEY);
  showIdle();
  render();
}

// Antes del primer lanzamiento solo se ve el cursor
function showIdle() {
  els.result.textContent = '';
}

/* --------------------------------------------------------------------------
   Tema: sigue al sistema salvo que el usuario elija uno
   -------------------------------------------------------------------------- */

const systemLight = window.matchMedia('(prefers-color-scheme: light)');

function effectiveTheme() {
  return document.documentElement.dataset.theme || (systemLight.matches ? 'light' : 'dark');
}

function syncThemeUI() {
  const theme = effectiveTheme();
  const next = theme === 'light' ? 'oscuro' : 'claro';
  els.themeToggle.textContent = `[${next}]`;
  els.themeToggle.setAttribute('aria-label', `Cambiar a modo ${next}`);
  els.themeColor.content = theme === 'light' ? '#ffffff' : '#0d0d0d';
}

function toggleTheme() {
  const next = effectiveTheme() === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  storage.set('theme', next);
  syncThemeUI();
}

/* --------------------------------------------------------------------------
   Eventos
   -------------------------------------------------------------------------- */

els.coin.addEventListener('click', flip);
els.hint.addEventListener('click', flip);
els.reset.addEventListener('click', resetStats);
els.themeToggle.addEventListener('click', toggleTheme);
systemLight.addEventListener('change', syncThemeUI);

// Espacio / Enter lanzan desde cualquier parte, salvo sobre otros controles
document.addEventListener('keydown', (e) => {
  if (e.key !== ' ' && e.key !== 'Enter') return;
  if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
  const target = e.target.closest?.('button, a, input, textarea, select, [contenteditable]');
  if (target && target !== els.coin && target !== els.hint) return;
  e.preventDefault();
  flip();
});

// Si la pestaña queda abierta de un día para otro, el heatmap se pone al día
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') render();
});

/* --------------------------------------------------------------------------
   Inicio
   -------------------------------------------------------------------------- */

els.inner.style.transform = `rotateX(${rotation}deg)`;
showIdle();
render();
syncThemeUI();
