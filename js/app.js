// MatchMyFit - UI entry module
import { t, initI18n, setLang, getLang, LANGS, applyTranslations } from './i18n.js';
import {
  COLORS, STYLES, CATEGORIES, ITEMS, getColor, getItem, nearestColor,
  colorMatches, colorPairScore, itemMatches, scoreOutfit, suggestOutfit,
} from './matching.js';
import * as cam from './camera.js';
import { startTour, tourDone } from './tour.js';

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const cname = id => t('color.' + id);
const iname = id => t('item.' + id);
const hexOf = id => getColor(id)?.hex || '#888888';
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.500L19 7.5"/></svg>';

function isLight(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 170;
}
function stagger(root, sel, base = 0) {
  $$(sel, root).forEach((el, i) => { el.classList.add('stg'); el.style.setProperty('--i', Math.min(i + base, 24)); });
}
function countTo(el, from, to, dur = 800) {
  cancelAnimationFrame(el._raf);
  if (reduced.matches || from === to) { el.textContent = to; return; }
  const t0 = performance.now();
  const step = now => {
    const p = Math.min(1, (now - t0) / dur);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}
function ringHTML() {
  return `<div class="ring" data-v="0"><svg viewBox="0 0 120 120"><circle class="ring-bg" cx="60" cy="60" r="52"/><circle class="ring-fg" cx="60" cy="60" r="52"/></svg><div class="ring-num"><b>0</b><small>/100</small></div></div>`;
}
const CIRC = 2 * Math.PI * 52;
function setRing(ring, score) {
  score = Math.max(0, Math.min(100, Math.round(score)));
  const from = +ring.dataset.v || 0;
  ring.dataset.v = score;
  const fg = $('.ring-fg', ring);
  requestAnimationFrame(() => requestAnimationFrame(() => { fg.style.strokeDashoffset = CIRC * (1 - score / 100); }));
  countTo($('b', ring), from, score);
}
function swatch(id, selected = false) {
  const hex = hexOf(id);
  return `<button type="button" class="sw${selected ? ' is-sel' : ''}${isLight(hex) ? ' light' : ''}" data-color="${id}" style="--c:${hex}" aria-pressed="${selected}" aria-label="${esc(cname(id))}"><span class="sw-dot">${CHECK}</span><span class="sw-name">${esc(cname(id))}</span></button>`;
}
function itemChip(id) {
  const it = getItem(id);
  return `<button type="button" class="ichip" data-item="${id}"><span>${it?.icon || ''}</span>${esc(iname(id))}</button>`;
}
function pop(el) {
  if (reduced.matches || !el.animate) return;
  el.animate([{ transform: 'scale(.86)' }, { transform: 'scale(1.06)', offset: .6 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
}

/* ---------- toast ---------- */
let toastTimer;
function toast(msg, action) {
  const el = $('#toast');
  el.innerHTML = `<span>${esc(msg)}</span>`;
  if (action) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = action.label;
    b.onclick = () => { el.classList.remove('show'); action.fn(); };
    el.append(b);
  }
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

/* ---------- bottom sheet ---------- */
const sheet = $('#sheet');
let lastFocus = null;
function openSheet(title, build) {
  $('#sheet-title').textContent = title;
  const body = $('#sheet-body');
  body.innerHTML = '';
  build(body);
  applyTranslations(body);
  if (sheet.hidden) {
    lastFocus = document.activeElement;
    sheet.hidden = false;
    sheet.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => requestAnimationFrame(() => { sheet.classList.add('open'); $('.sheet-panel').focus({ preventScroll: true }); }));
  }
  body.scrollTop = 0;
}
function closeSheet() {
  if (sheet.hidden) return;
  sheet.classList.remove('open');
  sheet.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  setTimeout(() => { if (!sheet.classList.contains('open')) sheet.hidden = true; }, 340);
  lastFocus?.focus?.({ preventScroll: true });
}
sheet.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeSheet(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

/* ---------- theme ---------- */
const THEMES = ['system', 'light', 'dark'];
const root = document.documentElement;
const themePref = () => { try { return localStorage.getItem('mmf-theme') || 'system'; } catch { return 'system'; } };
function applyTheme(p) {
  const dark = p === 'dark' || (p === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  root.dataset.theme = dark ? 'dark' : 'light';
  root.dataset.themePref = p;
  $('meta[name="theme-color"]').content = dark ? '#0e0d14' : '#f6f5fa';
  $('#theme-btn').title = t('theme.' + p);
}
function initTheme() {
  applyTheme(themePref());
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (themePref() === 'system') applyTheme('system'); });
  $('#theme-btn').addEventListener('click', e => {
    const next = THEMES[(THEMES.indexOf(themePref()) + 1) % 3];
    try { localStorage.setItem('mmf-theme', next); } catch {}
    const btn = e.currentTarget.getBoundingClientRect();
    const x = btn.left + btn.width / 2, y = btn.top + btn.height / 2;
    if (document.startViewTransition && !reduced.matches) {
      root.dataset.vt = 'theme';
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const vt = document.startViewTransition(() => applyTheme(next));
      vt.ready.then(() => root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 600, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' })).catch(() => {});
      vt.finished.finally(() => { delete root.dataset.vt; });
    } else {
      root.classList.add('theme-anim');
      applyTheme(next);
      setTimeout(() => root.classList.remove('theme-anim'), 450);
    }
    toast(t('theme.' + next));
  });
}

/* ---------- language ---------- */
function updateLangButton() {
  const l = LANGS.find(x => x.code === getLang()) || LANGS[0];
  $('#lang-flag').textContent = l.flag;
  $('#lang-code').textContent = l.code.toUpperCase();
}
function openLangSheet() {
  openSheet(t('common.language'), body => {
    body.innerHTML = `<div class="lang-list">${LANGS.map(l => `<button type="button" class="lang-opt${l.code === getLang() ? ' is-on' : ''}" data-lang="${l.code}"><span class="lang-flag">${l.flag}</span><span>${esc(l.label)}</span><i>${CHECK}</i></button>`).join('')}</div>`;
    body.onclick = async e => {
      const b = e.target.closest('[data-lang]');
      if (!b) return;
      await setLang(b.dataset.lang);
      closeSheet();
    };
  });
}

/* ---------- outfit state (shared) ---------- */
const SLOTS = ['top', 'bottom', 'onepiece', 'outerwear', 'shoes', 'accessory'];
const outfit = store.get('mmf-current', { slots: {}, style: null });
if (!outfit.slots) outfit.slots = {};
function saveCurrent() { store.set('mmf-current', outfit); }
function setSlot(slot, itemId, colorId) {
  if (!itemId) { delete outfit.slots[slot]; }
  else {
    const prev = outfit.slots[slot];
    outfit.slots[slot] = { itemId, colorId: colorId || prev?.colorId || (getColor('navy') ? 'navy' : COLORS[0].id) };
    if (slot === 'onepiece') { delete outfit.slots.top; delete outfit.slots.bottom; }
    if (slot === 'top' || slot === 'bottom') delete outfit.slots.onepiece;
  }
  saveCurrent();
  if (outfitReady) updateOutfit();
}
const pieces = (slots = outfit.slots) => Object.values(slots).filter(p => p && p.itemId && p.colorId);

/* ---------- routing ---------- */
const VIEWS = ['colors', 'clothing', 'camera', 'outfit'];
let currentView = null;
function setView(name, { instant = false } = {}) {
  if (!VIEWS.includes(name) || name === currentView) return;
  const prev = currentView;
  currentView = name;
  if (prev === 'camera') stopCam();
  // Tabs update right away so the indicator glides with its CSS transition
  $$('.tab').forEach((b, i) => {
    const on = b.dataset.view === name;
    b.classList.toggle('is-on', on);
    if (on) { b.setAttribute('aria-current', 'page'); $('.tab-ind').style.transform = `translateX(${i * 100}%)`; } else b.removeAttribute('aria-current');
  });
  try { history.replaceState(null, '', '#' + name); } catch {}

  const views = $$('.view');
  const next = $('#view-' + name);
  const old = views.find(v => !v.hidden && v !== next);
  views.forEach(v => v.getAnimations().forEach(a => a.cancel()));
  const show = () => { views.forEach(v => { v.hidden = v !== next; }); window.scrollTo(0, 0); };
  if (instant || !prev || !old || reduced.matches || !next.animate) { show(); return; }

  // Slide out the old view, then slide in the new one (direction follows tab order)
  const token = ++viewToken;
  const dir = VIEWS.indexOf(name) > VIEWS.indexOf(prev) ? 1 : -1;
  old.animate(
    [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dir * 28}px)` }],
    { duration: 130, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }
  ).finished.then(() => {
    if (token !== viewToken) return;
    show();
    old.getAnimations().forEach(a => a.cancel());
    next.animate(
      [{ opacity: 0, transform: `translateX(${dir * 28}px)` }, { opacity: 1, transform: 'none' }],
      { duration: 340, easing: 'cubic-bezier(.16,1,.3,1)' }
    );
  }).catch(() => {});
}
let viewToken = 0;

/* ================= COLORS ================= */
const cs = { mode: 'single', sel: null, cmp: [] };
const GROUPS = ['monochrome', 'complementary', 'analogous', 'triadic', 'neutral', 'avoid'];

function renderColorGrid(animate) {
  const sel = cs.mode === 'single' ? [cs.sel] : cs.cmp;
  const g = $('#color-grid');
  g.innerHTML = COLORS.map(c => swatch(c.id, sel.includes(c.id))).join('');
  if (animate) stagger(g, '.sw');
}
function pickColor(id, fromResult = false) {
  if (cs.mode === 'single') cs.sel = id;
  else if (fromResult) { cs.mode = 'single'; cs.sel = id; syncSeg(); }
  else if (cs.cmp.includes(id)) cs.cmp = cs.cmp.filter(x => x !== id);
  else if (cs.cmp.length >= 2) cs.cmp = [id];
  else cs.cmp.push(id);
  const sel = cs.mode === 'single' ? [cs.sel] : cs.cmp;
  if (fromResult) renderColorGrid(false);
  $$('#color-grid .sw').forEach(b => {
    const on = sel.includes(b.dataset.color);
    b.classList.toggle('is-sel', on);
    b.setAttribute('aria-pressed', on);
    if (on && b.dataset.color === id) pop(b.firstElementChild);
  });
  renderColorResult(true);
}
function syncSeg() { $$('.seg-btn').forEach(b => b.classList.toggle('is-on', b.dataset.mode === cs.mode)); }
function groupCard(type, ids, avoid) {
  return `<div class="card group${avoid ? ' avoid' : ''}"><div class="group-head"><span class="group-title">${esc(avoid ? t('colors.avoid') : t('harmony.' + type))}</span></div><div class="sw-row">${ids.map(i => swatch(i)).join('')}</div></div>`;
}
function renderColorResult(animate) {
  const out = $('#color-result');
  if (cs.mode === 'single') {
    if (!cs.sel) { out.innerHTML = `<div class="empty"><div class="empty-ico">🎨</div><p>${esc(t('colors.empty'))}</p></div>`; return; }
    const c = getColor(cs.sel), m = colorMatches(cs.sel) || {};
    out.innerHTML = `<div class="card sel-card"><div class="big-dot${isLight(c.hex) ? ' light' : ''}" style="--c:${c.hex}"></div><div><h2>${esc(cname(c.id))}</h2><p class="muted">${c.hex.toUpperCase()}</p></div></div>` +
      GROUPS.filter(g => m[g]?.length).map(g => groupCard(g, m[g].slice(0, 8), g === 'avoid')).join('');
    if (animate) stagger(out, '.card, .group .sw', 0);
  } else {
    const [a, b] = cs.cmp;
    const dot = (id, l) => id ? `<div class="pair-dot${isLight(hexOf(id)) ? ' light' : ''}" style="--c:${hexOf(id)}"><span>${l}</span></div>` : `<div class="pair-dot empty"><span>${l}</span></div>`;
    let body = '';
    if (a && b) {
      const r = colorPairScore(a, b);
      body = `<div class="cmp-info">${ringHTML()}<div><div class="eyebrow">${esc(t('colors.score'))}</div><div class="verdict">${esc(t('harmony.' + r.type))}</div><p class="muted">${esc(t('colors.pairOf', { a: cname(a), b: cname(b) }))}</p></div></div>`;
      out.innerHTML = `<div class="card cmp-card"><div class="pair">${dot(a, 'A')}${dot(b, 'B')}</div>${body}</div>`;
      setRing($('.ring', out), r.score);
    } else {
      out.innerHTML = `<div class="card cmp-card"><div class="pair">${dot(a, 'A')}${dot(b, 'B')}</div><p class="muted center">${esc(t('colors.pickTwo'))}</p></div>`;
    }
    if (animate) stagger(out, '.card');
  }
  applyTranslations(out);
}
function initColors() {
  $('#color-grid').addEventListener('click', e => { const b = e.target.closest('[data-color]'); if (b) pickColor(b.dataset.color); });
  $('#color-result').addEventListener('click', e => { const b = e.target.closest('[data-color]'); if (b) { pickColor(b.dataset.color, true); $('#color-grid').scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' }); } });
  $$('.seg-btn').forEach(b => b.addEventListener('click', () => {
    cs.mode = b.dataset.mode; syncSeg(); renderColorGrid(false); renderColorResult(true);
  }));
}

/* ================= CLOTHING ================= */
const ks = { cat: 'all', style: 'all' };
function chipsHTML(list, active, label) {
  return ['all', ...list].map(v => `<button type="button" class="chip${v === active ? ' is-on' : ''}" data-v="${v}">${esc(v === 'all' ? t('common.all') : label(v))}</button>`).join('');
}
function renderClothingFilters() {
  $('#cat-chips').innerHTML = chipsHTML(CATEGORIES, ks.cat, c => t('cat.' + c));
  $('#style-filter').innerHTML = chipsHTML(STYLES, ks.style, s => t('style.' + s));
}
function renderItemGrid(animate) {
  const list = ITEMS.filter(i => (ks.cat === 'all' || i.category === ks.cat) && (ks.style === 'all' || i.styles.includes(ks.style)));
  const g = $('#item-grid');
  g.innerHTML = list.length ? list.map(i => `<button type="button" class="tile" data-item="${i.id}"><span class="tile-ico">${i.icon}</span><span class="tile-name">${esc(iname(i.id))}</span><span class="tile-sub">${esc(t('cat.' + i.category))}</span></button>`).join('')
    : `<div class="empty wide"><p>${esc(t('clothing.empty'))}</p></div>`;
  if (animate) stagger(g, '.tile');
}
function openItemSheet(id) {
  const it = getItem(id);
  if (!it) return;
  const m = itemMatches(id) || {};
  openSheet(iname(id), body => {
    const sec = (key, cls) => m[key]?.length ? `<div class="sec ${cls}"><h3>${esc(t('clothing.' + key))}</h3><div class="ichips">${m[key].slice(0, 14).map(itemChip).join('')}</div></div>` : '';
    body.innerHTML = `<div class="item-head"><div class="item-ico">${it.icon}</div><div><div class="muted">${esc(t('cat.' + it.category))}</div><div class="ichips mini">${it.styles.map(s => `<span class="tag">${esc(t('style.' + s))}</span>`).join('')}</div><div class="formality" title="${esc(t('clothing.formality'))}">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= it.formality ? 'on' : ''}"></i>`).join('')}<small>${esc(t('clothing.formality'))}</small></div></div></div>` +
      sec('great', 'great') + sec('good', 'good') + sec('avoid', 'bad') +
      `<button type="button" class="btn primary block" id="item-add">${esc(t('clothing.addToOutfit'))}</button>`;
    stagger(body, '.sec', 0);
    body.onclick = e => {
      const c = e.target.closest('[data-item]');
      if (c) { openItemSheet(c.dataset.item); return; }
      if (e.target.closest('#item-add')) {
        setSlot(it.category, id);
        closeSheet();
        toast(t('clothing.added', { item: iname(id) }), { label: t('camera.viewOutfit'), fn: () => setView('outfit') });
      }
    };
  });
}
function initClothing() {
  $('#cat-chips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) { ks.cat = b.dataset.v; renderClothingFilters(); renderItemGrid(true); } });
  $('#style-filter').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) { ks.style = b.dataset.v; renderClothingFilters(); renderItemGrid(true); } });
  $('#item-grid').addEventListener('click', e => { const b = e.target.closest('[data-item]'); if (b) openItemSheet(b.dataset.item); });
}

/* ================= CAMERA ================= */
const stage = $('#cam-stage'), video = $('#cam-video');
const cm = { raf: 0, last: 0, result: null, torch: false };

function setCamState(s, code) {
  stage.dataset.state = s;
  if (s === 'error') { const m = $('#cam-error-msg'); m.dataset.code = code || 'unknown'; m.textContent = t('camera.err.' + m.dataset.code); }
}
async function startCam() {
  if (!cam.isCameraSupported()) { setCamState('error', 'unsupported'); return; }
  setCamState('starting');
  try {
    await cam.startCamera(video, { facingMode: 'environment' });
    setCamState('live');
    cm.torch = false;
    $('#cam-torch').hidden = !cam.hasTorch();
    $('#cam-torch').classList.remove('on');
    cm.last = 0;
    cm.raf = requestAnimationFrame(camLoop);
  } catch (e) {
    setCamState('error', e?.code || 'unknown');
  }
}
function stopCam() {
  cancelAnimationFrame(cm.raf);
  try { cam.stopCamera(); } catch {}
  setCamState('idle');
}
function camLoop(ts) {
  cm.raf = requestAnimationFrame(camLoop);
  if (ts - cm.last < 120 || video.readyState < 2) return;
  cm.last = ts;
  try {
    const s = cam.sampleCenter(video);
    if (!s) return;
    const n = nearestColor(s.hex);
    stage.style.setProperty('--live', s.hex);
    $('#cam-chip-name').textContent = n?.color ? cname(n.color.id) : '';
    $('#cam-chip-hex').textContent = s.hex.toUpperCase();
  } catch {}
}
function showCamResult(img) {
  if (!img) { toast(t('camera.unreadable')); return; }
  const center = cam.extractCenterColor(img);
  const doms = cam.extractDominantColors(img, 4) || [];
  const thumb = document.createElement('canvas');
  thumb.width = img.width; thumb.height = img.height;
  thumb.getContext('2d').putImageData(img, 0, 0);
  thumb.className = 'res-thumb';
  cm.result = { thumb, center, doms, active: center?.hex || doms[0]?.hex };
  renderCamResult(true);
  $('#cam-result').scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
}
function renderCamResult(animate) {
  const out = $('#cam-result');
  const r = cm.result;
  if (!r || !r.active) { out.innerHTML = ''; return; }
  const n = nearestColor(r.active)?.color;
  const m = n ? colorMatches(n.id) || {} : {};
  const doms = r.doms.map(d => { const nn = nearestColor(d.hex)?.color; return `<button type="button" class="dom${d.hex === r.active ? ' is-on' : ''}" data-hex="${d.hex}" style="--c:${d.hex}"><i></i><span>${esc(nn ? cname(nn.id) : d.hex)}</span><small>${Math.round(d.ratio * 100)}%</small></button>`; }).join('');
  out.innerHTML = `<div class="card res-card"><div class="res-top"><div class="thumb-slot"></div><div><div class="eyebrow">${esc(t('camera.detected'))}</div><div class="res-name"><span class="mini-dot${isLight(r.active) ? ' light' : ''}" style="--c:${r.active}"></span><h2>${esc(n ? cname(n.id) : '')}</h2></div><p class="muted">${r.active.toUpperCase()}</p></div></div>` +
    (r.doms.length ? `<div class="eyebrow mt">${esc(t('camera.dominant'))}</div><div class="doms">${doms}</div>` : '') +
    `<div class="btn-row"><button type="button" class="btn primary" id="cam-add">${esc(t('camera.addToOutfit'))}</button><button type="button" class="btn ghost" id="cam-retake">${esc(t('camera.retake'))}</button></div></div>` +
    (n ? `<div class="eyebrow mt pad">${esc(t('camera.matches'))}</div>` + GROUPS.filter(g => g !== 'avoid' && m[g]?.length).map(g => groupCard(g, m[g].slice(0, 8))).join('') : '');
  $('.thumb-slot', out).replaceWith(r.thumb);
  if (animate) stagger(out, '.card');
}
function openAddSheet(colorId) {
  let cat = 'top';
  const draw = body => {
    body.innerHTML = `<div class="sheet-color"><span class="mini-dot${isLight(hexOf(colorId)) ? ' light' : ''}" style="--c:${hexOf(colorId)}"></span>${esc(cname(colorId))}</div><div class="eyebrow">${esc(t('camera.chooseItem'))}</div><div class="chips">${CATEGORIES.map(c => `<button type="button" class="chip${c === cat ? ' is-on' : ''}" data-cat="${c}">${esc(t('cat.' + c))}</button>`).join('')}</div><div class="tile-grid compact">${ITEMS.filter(i => i.category === cat).map(i => `<button type="button" class="tile" data-item="${i.id}"><span class="tile-ico">${i.icon}</span><span class="tile-name">${esc(iname(i.id))}</span></button>`).join('')}</div>`;
    stagger(body, '.tile');
  };
  openSheet(t('camera.addToOutfit'), body => {
    draw(body);
    body.onclick = e => {
      const c = e.target.closest('[data-cat]');
      if (c) { cat = c.dataset.cat; draw(body); return; }
      const it = e.target.closest('[data-item]');
      if (it) {
        setSlot(cat, it.dataset.item, colorId);
        closeSheet();
        toast(t('camera.added', { item: iname(it.dataset.item), color: cname(colorId) }), { label: t('camera.viewOutfit'), fn: () => setView('outfit') });
      }
    };
  });
}
function initCamera() {
  $('#cam-start').onclick = startCam;
  $('#cam-retry').onclick = startCam;
  $('#cam-stop').onclick = stopCam;
  $$('.cam-upload-btn').forEach(b => b.onclick = () => $('#cam-file').click());
  $('#cam-switch').onclick = async () => { try { await cam.switchCamera(video); $('#cam-torch').hidden = !cam.hasTorch(); } catch {} };
  $('#cam-torch').onclick = async () => { try { cm.torch = await cam.setTorch(!cm.torch); $('#cam-torch').classList.toggle('on', !!cm.torch); } catch {} };
  $('#cam-shutter').onclick = () => {
    let img = null;
    try { img = cam.captureFrame(video); } catch {}
    if (!img) { toast(t('camera.unreadable')); return; }
    stage.classList.add('flash'); setTimeout(() => stage.classList.remove('flash'), 220);
    showCamResult(img);
  };
  $('#cam-file').onchange = async e => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try { showCamResult(await cam.imageFileToImageData(f)); } catch { toast(t('camera.unreadable')); }
  };
  $('#cam-result').addEventListener('click', e => {
    const d = e.target.closest('.dom');
    if (d && cm.result) { cm.result.active = d.dataset.hex; renderCamResult(false); return; }
    if (e.target.closest('#cam-retake')) { cm.result = null; renderCamResult(false); window.scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' }); return; }
    if (e.target.closest('#cam-add')) { const n = nearestColor(cm.result.active)?.color; if (n) openAddSheet(n.id); return; }
    const sw = e.target.closest('[data-color]');
    if (sw) { cs.mode = 'single'; cs.sel = sw.dataset.color; syncSeg(); renderColorGrid(false); renderColorResult(true); setView('colors'); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && stage.dataset.state !== 'idle') stopCam(); });
  addEventListener('pagehide', () => { try { cam.stopCamera(); } catch {} });
}

/* ================= OUTFIT ================= */
let outfitReady = false;
let lastRingScore = 0;
// Figure geometry: [left, top, width, height, radius] in a 220x300 box
const FIG = {
  outerwear: [8, 14, 204, 146, 34], top: [52, 26, 116, 98, 26], bottom: [62, 112, 96, 124, 20],
  onepiece: [52, 26, 116, 212, 30], shoesL: [58, 244, 48, 42, 18], shoesR: [114, 244, 48, 42, 18], accessory: [164, 156, 52, 52, 26],
};
function buildFigure() {
  const f = $('#outfit-fig');
  const mk = (key, slot, g) => `<button type="button" class="fp" data-slot="${slot}" data-key="${key}" style="left:${g[0] / 2.2}%;top:${g[1] / 3}%;width:${g[2] / 2.2}%;height:${g[3] / 3}%;border-radius:${g[4]}px" aria-label="${esc(t('cat.' + slot))}"><span></span></button>`;
  f.innerHTML = mk('outerwear', 'outerwear', FIG.outerwear) + mk('bottom', 'bottom', FIG.bottom) + mk('top', 'top', FIG.top) + mk('onepiece', 'onepiece', FIG.onepiece) +
    mk('shoesL', 'shoes', FIG.shoesL) + mk('shoesR', 'shoes', FIG.shoesR) + mk('accessory', 'accessory', FIG.accessory);
}
function updateFigure() {
  const s = outfit.slots;
  const one = !!s.onepiece;
  $$('#outfit-fig .fp').forEach(el => {
    const slot = el.dataset.slot, p = s[slot];
    const hide = (one && (slot === 'top' || slot === 'bottom')) || (!one && slot === 'onepiece' && !p);
    el.classList.toggle('gone', hide);
    el.classList.toggle('empty', !p);
    const span = el.firstElementChild, icon = p ? getItem(p.itemId)?.icon || '' : '+';
    if (span.textContent !== icon) { span.textContent = icon; if (p) pop(el); }
    if (p) { el.style.setProperty('--c', hexOf(p.colorId)); el.classList.toggle('light', isLight(hexOf(p.colorId))); }
    else el.style.removeProperty('--c');
  });
}
function resolveParams(params = {}) {
  const out = {};
  for (const [k, v] of Object.entries(params)) {
    if (v && typeof v === 'object') out[k] = v.item ? iname(v.item) : v.color ? cname(v.color) : String(v);
    else if (k === 'color' && typeof v === 'string' && getColor(v)) out[k] = cname(v);
    else if (typeof v === 'string' && getItem(v)) out[k] = iname(v);
    else if (typeof v === 'string' && getColor(v)) out[k] = cname(v);
    else out[k] = v;
  }
  return out;
}
function updateScore() {
  const ps = pieces();
  let res = { score: 0, tips: [] };
  if (ps.length) { try { res = scoreOutfit(ps) || res; } catch (e) { console.error(e); } }
  setRing($('#outfit-ring .ring'), ps.length ? res.score : 0);
  const v = !ps.length ? '' : res.score >= 80 ? 'great' : res.score >= 60 ? 'good' : res.score >= 40 ? 'ok' : 'weak';
  $('#outfit-verdict').textContent = v ? t('outfit.verdict.' + v) : t('outfit.empty');
  const tips = $('#outfit-tips');
  tips.innerHTML = (ps.length ? res.tips : []).map(tp => `<li>${esc(t(tp.key, resolveParams(tp.params)))}</li>`).join('');
  return res;
}
function updateSlotList(animate) {
  const l = $('#slot-list');
  l.innerHTML = SLOTS.map(slot => {
    const p = outfit.slots[slot], it = p && getItem(p.itemId);
    const dis = (slot === 'onepiece' ? false : false);
    return `<div class="slot-row${p ? ' filled' : ''}"><button type="button" class="slot-main" data-slot="${slot}"${dis ? ' disabled' : ''}><span class="slot-tile${p && isLight(hexOf(p.colorId)) ? ' light' : ''}" style="--c:${p ? hexOf(p.colorId) : 'transparent'}">${it ? it.icon : '+'}</span><span class="slot-txt"><b>${esc(t('cat.' + slot))}</b><small>${p ? esc(iname(p.itemId) + ' · ' + cname(p.colorId)) : esc(t('outfit.pickItem'))}</small></span></button>${p ? `<button type="button" class="icon-btn sm" data-clear="${slot}" aria-label="${esc(t('common.remove'))}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>` : ''}</div>`;
  }).join('');
  if (animate) stagger(l, '.slot-row');
}
function updateStyleChips() {
  $('#outfit-style').innerHTML = ['any', ...STYLES].map(s => { const on = (outfit.style || 'any') === s; return `<button type="button" class="chip${on ? ' is-on' : ''}" data-v="${s}">${esc(s === 'any' ? t('outfit.styleAny') : t('style.' + s))}</button>`; }).join('');
}
function updateOutfit() { updateFigure(); updateScore(); updateSlotList(false); }

function openSlotSheet(slot) {
  openSheet(t('cat.' + slot), body => {
    const draw = () => {
      const cur = outfit.slots[slot];
      body.innerHTML = `<div class="eyebrow">${esc(t('outfit.pickItem'))}</div><div class="tile-grid compact">${ITEMS.filter(i => i.category === slot).map(i => `<button type="button" class="tile${cur?.itemId === i.id ? ' is-sel' : ''}" data-item="${i.id}"><span class="tile-ico">${i.icon}</span><span class="tile-name">${esc(iname(i.id))}</span></button>`).join('')}</div>` +
        `<div class="eyebrow mt">${esc(t('outfit.pickColor'))}</div><div class="sw-grid sheet-sw">${COLORS.map(c => swatch(c.id, cur?.colorId === c.id)).join('')}</div>` +
        `<div class="btn-row sticky">${cur ? `<button type="button" class="btn ghost" data-remove>${esc(t('common.remove'))}</button>` : ''}<button type="button" class="btn primary" data-close>${esc(t('common.done'))}</button></div>`;
    };
    draw();
    stagger(body, '.tile');
    body.onclick = e => {
      const cur = outfit.slots[slot];
      const it = e.target.closest('[data-item]'), c = e.target.closest('[data-color]');
      const sc = body.scrollTop;
      if (it) { setSlot(slot, it.dataset.item, cur?.colorId); }
      else if (c) { if (cur) setSlot(slot, cur.itemId, c.dataset.color); else { toast(t('outfit.pickItemFirst')); return; } }
      else if (e.target.closest('[data-remove]')) { setSlot(slot, null); closeSheet(); return; }
      else return;
      draw(); body.scrollTop = sc;
    };
  });
}
function applyPieces(ps) {
  outfit.slots = {};
  for (const p of ps) {
    const cat = getItem(p.itemId)?.category;
    if (cat) outfit.slots[cat] = { itemId: p.itemId, colorId: p.colorId };
  }
  if (outfit.slots.onepiece) { delete outfit.slots.top; delete outfit.slots.bottom; }
  saveCurrent();
  updateOutfit();
}
function suggest(shuffle) {
  const opts = { style: outfit.style || undefined };
  if (shuffle) opts.seed = Math.floor(Math.random() * 1e9);
  else {
    const base = outfit.slots.top || outfit.slots.onepiece || outfit.slots.bottom;
    if (base) { opts.baseItemId = base.itemId; opts.baseColorId = base.colorId; }
  }
  try { const ps = suggestOutfit(opts); if (ps?.length) applyPieces(ps); } catch (e) { console.error(e); }
}
function renderSaved(animate) {
  const list = store.get('mmf-outfits', []);
  const el = $('#saved-list');
  if (!list.length) { el.innerHTML = `<div class="empty"><p>${esc(t('outfit.savedEmpty'))}</p></div>`; return; }
  el.innerHTML = list.map(o => `<div class="saved-card" data-id="${o.id}"><button type="button" class="saved-main" data-load="${o.id}" aria-label="${esc(t('outfit.load'))}"><div class="saved-pieces">${o.pieces.map(p => `<span class="sp${isLight(hexOf(p.colorId)) ? ' light' : ''}" style="--c:${hexOf(p.colorId)}">${getItem(p.itemId)?.icon || ''}</span>`).join('')}</div><div class="saved-meta"><b>${o.score}</b><small>${new Date(o.ts).toLocaleDateString(getLang())}</small></div></button><button type="button" class="icon-btn sm" data-del="${o.id}" aria-label="${esc(t('common.delete'))}"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button></div>`).join('');
  if (animate) stagger(el, '.saved-card');
}
function initOutfit() {
  $('#outfit-ring').innerHTML = ringHTML();
  $('#outfit-fig').addEventListener('click', e => { const b = e.target.closest('[data-slot]'); if (b) openSlotSheet(b.dataset.slot); });
  $('#slot-list').addEventListener('click', e => {
    const c = e.target.closest('[data-clear]');
    if (c) { setSlot(c.dataset.clear, null); return; }
    const b = e.target.closest('[data-slot]'); if (b) openSlotSheet(b.dataset.slot);
  });
  $('#outfit-style').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) { outfit.style = b.dataset.v === 'any' ? null : b.dataset.v; saveCurrent(); updateStyleChips(); } });
  $('#o-suggest').onclick = () => suggest(false);
  $('#o-shuffle').onclick = () => suggest(true);
  $('#o-clear').onclick = () => { outfit.slots = {}; saveCurrent(); updateOutfit(); toast(t('outfit.cleared')); };
  $('#o-save').onclick = () => {
    const ps = pieces();
    if (!ps.length) { toast(t('outfit.empty')); return; }
    let score = 0; try { score = Math.round(scoreOutfit(ps).score); } catch {}
    const list = store.get('mmf-outfits', []);
    list.unshift({ id: Date.now().toString(36), ts: Date.now(), pieces: ps.map(p => ({ ...p })), score });
    store.set('mmf-outfits', list.slice(0, 50));
    renderSaved(false);
    const first = $('#saved-list .saved-card');
    if (first) pop(first);
    toast(t('outfit.saveDone'));
  };
  $('#saved-list').addEventListener('click', e => {
    const d = e.target.closest('[data-del]');
    if (d) { store.set('mmf-outfits', store.get('mmf-outfits', []).filter(o => o.id !== d.dataset.del)); renderSaved(false); toast(t('outfit.deleted')); return; }
    const l = e.target.closest('[data-load]');
    if (l) { const o = store.get('mmf-outfits', []).find(x => x.id === l.dataset.load); if (o) { applyPieces(o.pieces); toast(t('outfit.loaded')); window.scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' }); } }
  });
}

/* ---------- render all ---------- */
function renderAll(animate) {
  updateLangButton();
  applyTheme(themePref());
  renderColorGrid(animate); renderColorResult(false);
  renderClothingFilters(); renderItemGrid(animate);
  buildFigure(); updateStyleChips(); outfitReady = true; updateOutfit(); renderSaved(false);
  if (animate) stagger($('#slot-list'), '.slot-row');
  renderCamResult(false);
  if (stage.dataset.state === 'error') $('#cam-error-msg').textContent = t('camera.err.' + ($('#cam-error-msg').dataset.code || 'unknown'));
}

/* ---------- init ---------- */
async function init() {
  initTheme();
  try {
    await initI18n();
    initColors(); initClothing(); initCamera(); initOutfit();
    $('#lang-btn').addEventListener('click', openLangSheet);
    $('#help-btn').addEventListener('click', openTour);
    $$('.tab').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
    addEventListener('langchange', () => {
      renderAll(false);
      if (!sheet.hidden) closeSheet();
    });
    renderAll(true);
    const h = location.hash.slice(1);
    setView(VIEWS.includes(h) ? h : 'colors', { instant: true });
    addEventListener('hashchange', () => {
      const v = location.hash.slice(1);
      if (VIEWS.includes(v)) setView(v);
    });
    // lastRingScore is tracked in the ring itself
  } catch (e) { console.error(e); }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  const wait = Math.max(0, (reduced.matches ? 500 : 1600) - performance.now());
  setTimeout(() => {
    document.body.classList.add('ready');
    const sp = $('#splash');
    sp.classList.add('out');
    setTimeout(() => sp.remove(), 700);
    // First launch: show the guided tour once the splash is gone
    if (!tourDone()) setTimeout(openTour, reduced.matches ? 100 : 750);
  }, wait);
}

function openTour() {
  if (!sheet.hidden) closeSheet();
  const back = currentView;
  startTour({ setView, onEnd: () => setView(back) });
}
init();
