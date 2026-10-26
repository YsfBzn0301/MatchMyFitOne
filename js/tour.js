// Guided tour: spotlights each bottom tab (and the header) with a short explanation.
import { t } from './i18n.js';

const DONE_KEY = 'mmf-tour-done';
const STEPS = [
  { id: 'welcome', target: null, icon: '👋' },
  { id: 'colors', target: '.tab[data-view="colors"]', view: 'colors', icon: '🎨', how: 3 },
  { id: 'clothing', target: '.tab[data-view="clothing"]', view: 'clothing', icon: '👕', how: 3 },
  { id: 'camera', target: '.tab[data-view="camera"]', view: 'camera', icon: '📷', how: 3 },
  { id: 'outfit', target: '.tab[data-view="outfit"]', view: 'outfit', icon: '🧥', how: 3 },
  { id: 'header', target: '.header-actions', icon: '⚙️' },
];

let el, spot, card, idx = 0, opts = {}, lastFocus = null;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

export function tourDone() {
  try { return localStorage.getItem(DONE_KEY) === '1'; } catch { return false; }
}

export function startTour(options = {}) {
  opts = options;
  if (el) return;
  lastFocus = document.activeElement;
  el = document.createElement('div');
  el.className = 'tour';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.innerHTML = '<div class="tour-spot"></div><div class="tour-card" aria-live="polite"></div>';
  document.body.appendChild(el);
  spot = el.querySelector('.tour-spot');
  card = el.querySelector('.tour-card');
  el.addEventListener('click', onClick);
  addEventListener('keydown', onKey);
  addEventListener('resize', place);
  addEventListener('langchange', render);
  idx = 0;
  render();
  requestAnimationFrame(() => el.classList.add('on'));
}

function endTour() {
  if (!el) return;
  try { localStorage.setItem(DONE_KEY, '1'); } catch {}
  removeEventListener('keydown', onKey);
  removeEventListener('resize', place);
  removeEventListener('langchange', render);
  const old = el;
  el = null;
  old.classList.remove('on');
  setTimeout(() => old.remove(), reduced.matches ? 0 : 350);
  if (opts.onEnd) opts.onEnd();
  lastFocus?.focus?.();
}

function go(delta) {
  const n = idx + delta;
  if (n < 0) return;
  if (n >= STEPS.length) return endTour();
  idx = n;
  render();
}

function onClick(e) {
  const a = e.target.closest('[data-tour]');
  if (!a) return;
  const act = a.dataset.tour;
  if (act === 'next') go(1);
  else if (act === 'back') go(-1);
  else if (act === 'skip') endTour();
  else if (act === 'dot') { idx = +a.dataset.i; render(); }
}

function onKey(e) {
  if (e.key === 'Escape') endTour();
  else if (e.key === 'ArrowRight') go(1);
  else if (e.key === 'ArrowLeft') go(-1);
}

function render() {
  if (!el) return;
  const s = STEPS[idx];
  if (s.view && opts.setView) opts.setView(s.view);
  const last = idx === STEPS.length - 1;
  const how = s.how
    ? `<ol class="tour-how">${Array.from({ length: s.how }, (_, i) => `<li>${t(`tour.${s.id}.how${i + 1}`)}</li>`).join('')}</ol>`
    : '';
  card.innerHTML = `
    <div class="tour-top">
      <span class="tour-icon" aria-hidden="true">${s.icon}</span>
      <span class="tour-count">${t('tour.step', { n: idx + 1, total: STEPS.length })}</span>
      ${last ? '' : `<button type="button" class="tour-skip" data-tour="skip">${t('tour.skip')}</button>`}
    </div>
    <h2 class="tour-title">${t(`tour.${s.id}.title`)}</h2>
    <p class="tour-text">${t(`tour.${s.id}.text`)}</p>
    ${how}
    ${s.id === 'welcome' && opts.genderHTML ? `<div class="tour-choice"><div class="tour-choice-label">${t('tour.welcome.choose')}</div><div class="gender-slot">${opts.genderHTML()}</div><div class="tour-choice-hint">${t('tour.welcome.chooseHint')}</div></div>` : ''}
    <div class="tour-foot">
      <div class="tour-dots">${STEPS.map((_, i) => `<button type="button" class="tour-dot${i === idx ? ' on' : ''}" data-tour="dot" data-i="${i}" aria-label="${i + 1}"></button>`).join('')}</div>
      <div class="tour-btns">
        ${idx > 0 ? `<button type="button" class="btn soft" data-tour="back">${t('tour.back')}</button>` : ''}
        <button type="button" class="btn primary" data-tour="next">${t(idx === 0 ? 'tour.go' : last ? 'tour.start' : 'tour.next')}</button>
      </div>
    </div>`;
  if (!reduced.matches) card.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.16,1,.3,1)' });
  place();
  card.querySelector('[data-tour="next"]').focus({ preventScroll: true });
}

// Move the spotlight to the current target and put the card above or below it
function place() {
  if (!el) return;
  const s = STEPS[idx];
  const target = s.target && document.querySelector(s.target);
  const vw = innerWidth, vh = innerHeight;
  if (!target) {
    el.classList.add('no-spot');
    spot.style.transform = `translate(${vw / 2}px, ${vh / 2}px)`;
    spot.style.width = spot.style.height = '0px';
    card.style.top = '50%';
    card.style.bottom = 'auto';
    card.style.translate = '-50% -50%';
    return;
  }
  el.classList.remove('no-spot');
  const r = target.getBoundingClientRect();
  const pad = 6;
  spot.style.width = `${r.width + pad * 2}px`;
  spot.style.height = `${r.height + pad * 2}px`;
  spot.style.transform = `translate(${r.left - pad}px, ${r.top - pad}px)`;
  card.style.translate = '-50% 0';
  if (r.top > vh / 2) {
    card.style.top = 'auto';
    card.style.bottom = `${vh - r.top + pad + 14}px`;
  } else {
    card.style.bottom = 'auto';
    card.style.top = `${r.bottom + pad + 14}px`;
  }
}
