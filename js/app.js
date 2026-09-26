'use strict';

const $ = (id) => document.getElementById(id);

const els = {
  coin: $('coin'),
  inner: $('coin-inner'),
  shadow: $('coin-shadow'),
  flip: $('flip'),
  result: $('result'),
  eyebrow: $('result-eyebrow'),
  value: $('result-value'),
  headsCount: $('heads-count'),
  tailsCount: $('tails-count'),
  headsPct: $('heads-pct'),
  tailsPct: $('tails-pct'),
  streak: $('streak'),
  ratio: $('ratio-heads'),
  history: $('history'),
  reset: $('reset'),
  themeToggle: $('theme-toggle'),
  themeColor: document.querySelector('meta[name="theme-color"]'),
};

const LABEL = { heads: 'Cara', tails: 'Cruz' };
const STORAGE_KEY = 'flip-a-coin:stats';
const HISTORY_LIMIT = 24;
const FLIP_MS = 1500;
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

function loadStats() {
  try {
    const data = JSON.parse(storage.get(STORAGE_KEY));
    if (data && Array.isArray(data.history)) {
      return {
        heads: Number(data.heads) || 0,
        tails: Number(data.tails) || 0,
        history: data.history.filter((s) => s in LABEL).slice(0, HISTORY_LIMIT),
      };
    }
  } catch { /* datos corruptos: se empieza de cero */ }
  return { heads: 0, tails: 0, history: [] };
}

let stats = loadStats();

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
  els.flip.setAttribute('aria-disabled', String(value));
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

  const lift = `calc(var(--coin-size) * -0.55)`;
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

async function flip() {
  if (busy) return;
  setBusy(true);

  const side = randomSide();
  const from = rotation;
  rotation = nextRotation(side);

  els.result.classList.remove('is-landed');
  els.eyebrow.textContent = 'Lanzando…';
  els.value.textContent = ' ';

  await animateFlip(from, rotation);

  record(side);
  showResult(side);
  navigator.vibrate?.(15);
  setBusy(false);
}

function showResult(side) {
  els.eyebrow.textContent = 'Salió';
  els.value.textContent = LABEL[side];
  void els.result.offsetWidth; // reinicia la animación de entrada
  els.result.classList.add('is-landed');
}

/* --------------------------------------------------------------------------
   Estadísticas
   -------------------------------------------------------------------------- */

function record(side) {
  stats[side] += 1;
  stats.history.unshift(side);
  stats.history.length = Math.min(stats.history.length, HISTORY_LIMIT);
  storage.set(STORAGE_KEY, JSON.stringify(stats));
  renderStats();
}

function currentStreak() {
  const [first] = stats.history;
  if (!first) return null;
  let n = 0;
  while (stats.history[n] === first) n += 1;
  return { side: first, n };
}

function renderStats() {
  const total = stats.heads + stats.tails;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  els.headsCount.textContent = stats.heads;
  els.tailsCount.textContent = stats.tails;
  els.headsPct.textContent = `${pct(stats.heads)}%`;
  els.tailsPct.textContent = `${pct(stats.tails)}%`;
  els.ratio.style.width = total ? `${(stats.heads / total) * 100}%` : '50%';

  const streak = currentStreak();
  els.streak.textContent = streak ? `${streak.n}× ${LABEL[streak.side]}` : '—';

  els.history.replaceChildren(
    ...stats.history.map((side) => {
      const li = document.createElement('li');
      li.className = side;
      li.title = LABEL[side];
      li.setAttribute('aria-label', LABEL[side]);
      return li;
    }),
  );

  els.reset.hidden = total === 0;
}

function resetStats() {
  if (busy) return;
  stats = { heads: 0, tails: 0, history: [] };
  storage.remove(STORAGE_KEY);
  renderStats();
  els.result.classList.remove('is-landed');
  els.eyebrow.textContent = '¿Qué saldrá?';
  els.value.textContent = 'Lanza la moneda';
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
  els.themeToggle.setAttribute('aria-label', `Cambiar a modo ${next}`);
  els.themeColor.content = theme === 'light' ? '#f6f3ec' : '#0f1115';
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
els.flip.addEventListener('click', flip);
els.reset.addEventListener('click', resetStats);
els.themeToggle.addEventListener('click', toggleTheme);
systemLight.addEventListener('change', syncThemeUI);

// Espacio / Enter lanzan desde cualquier parte, salvo sobre otros controles
document.addEventListener('keydown', (e) => {
  if (e.key !== ' ' && e.key !== 'Enter') return;
  if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
  const target = e.target.closest?.('button, a, input, textarea, select, [contenteditable]');
  if (target && target !== els.coin && target !== els.flip) return;
  e.preventDefault();
  flip();
});

/* --------------------------------------------------------------------------
   Inicio
   -------------------------------------------------------------------------- */

els.inner.style.transform = `rotateX(${rotation}deg)`;
renderStats();
syncThemeUI();
