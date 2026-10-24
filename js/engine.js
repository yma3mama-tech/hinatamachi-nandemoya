/* 魔法の町のなんでも屋 ― エンジン
 * 会話・選択肢・場面・町マップ・持ち物・手帳・設定・保存
 * シナリオは data-world.js / scenario-*.js に「データ」として書く。
 */
'use strict';

const SAVE_KEY = 'nandemoya-save-v1';
const SET_KEY = 'nandemoya-settings-v1';
const ALBUM_KEY = 'nandemoya-album-v1';
const TIMES = [
  { k: '朝', i: '🌅' }, { k: '昼', i: '☀️' }, { k: '夕方', i: '🌇' }, { k: '夜', i: '🌙' },
];
const MAP_W = 1175, MAP_H = 1024;

// シナリオ側が登録するもの
const SCENES = {};   // id -> 命令の配列 or (S)=>配列
const HOOKS = [];    // { npcs(loc,S,list), spots(loc,S,list), enter(loc,S), bench(S) }
const QUESTS = [];   // 依頼の定義
let CH = {}, LOCS = {}, ITEMS = {}, STANDEES = {};

let S = null;        // 進行データ（保存対象）
let CFG = { speed: 1, big: false, sound: true, vol: 0.5 };

const $ = s => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 保存できない環境でも止めない */ } }
function fetchStore(k) { try { const t = localStorage.getItem(k); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
function dropStore(k) { try { localStorage.removeItem(k); } catch (e) { } }

/* ============ 状態の小道具 ============ */
const DONE = 99;
function newState(name) {
  return {
    v: 1, name: name || 'アキ', day: 1, time: 0, loc: 'shop',
    q: {}, active: null, items: {}, aff: {}, f: {}, obj: '', objAt: null,
    memo: {}, notes: {}, stamps: 0, read: {}, tips: {},
  };
}
const stage = id => S.q[id] || 0;
const done = id => S.q[id] === DONE;
const has = (id, n) => (S.items[id] || 0) >= (n || 1);
const flag = k => !!S.f[k];
function addItem(id, n) {
  S.items[id] = (S.items[id] || 0) + n;
  if (S.items[id] <= 0) delete S.items[id];
}
function fmt(t) { return String(t).replace(/\{name\}/g, S ? S.name : 'アキ'); }
function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function save() { if (S && !busy) store(SAVE_KEY, S); }

/* ============ 音（Web Audio で合成） ============ */
let AC = null;
function audio() {
  if (!CFG.sound) return null;
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(f, dur, type, vol, delay, slide) {
  const ac = audio(); if (!ac) return;
  const t = ac.currentTime + (delay || 0);
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  const v = (vol || .15) * CFG.vol;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + .05);
}
const SE = {
  select: () => tone(880, .09, 'triangle', .12),
  get: () => [659, 880, 1319].forEach((f, i) => tone(f, .22, 'triangle', .16, i * .09)),
  magic: () => [1047, 1319, 1568, 2093, 1568].forEach((f, i) => tone(f, .25, 'sine', .1, i * .07)),
  door: () => { tone(220, .12, 'square', .05); tone(180, .2, 'triangle', .08, .08); },
  meow: () => tone(820, .45, 'sawtooth', .05, 0, 520),
  step: () => tone(300, .06, 'triangle', .06),
  bell: () => [1568, 2093].forEach((f, i) => tone(f, .9, 'sine', .08, i * .15)),
  night: () => [523, 659, 784].forEach((f, i) => tone(f, .7, 'sine', .07, i * .2)),
  paper: () => tone(1200, .05, 'triangle', .05),
};
function se(name) { try { SE[name] && SE[name](); } catch (e) { } }

/* ============ トースト・フェード・ポップアップ ============ */
let toastTimer = null;
function toast(msg, ms) {
  const t = $('#toast'); t.innerHTML = esc(msg).replace(/\n/g, '<br>'); t.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), ms || 2600);
}
async function fadeOut(text) { const f = $('#fade'); f.textContent = text || ''; f.classList.add('on'); await sleep(text ? 1300 : 460); }
async function fadeIn() { $('#fade').classList.remove('on'); await sleep(300); }
function popup(html, cls) {
  return new Promise(res => {
    const p = $('#popup'), b = $('#popupBox');
    b.className = cls || ''; b.innerHTML = html + '<div class="tap">タップで閉じる</div>';
    p.classList.remove('hidden');
    const close = () => { p.classList.add('hidden'); p.onclick = null; res(); };
    setTimeout(() => { p.onclick = close; }, 250);
  });
}
function itemPopup(id, n) {
  const it = ITEMS[id] || { name: id, icon: '✨', desc: '' };
  se('get');
  return popup(`<div class="big">${it.icon}</div><div class="nm">${esc(it.name)}${n > 1 ? ' ×' + n : ''}</div><div class="ds">を手に入れた</div>`);
}
function cardPopup(img, text) {
  return popup(`<img class="card" src="img/${img}.jpg" alt=""><div class="ds">${esc(fmt(text || ''))}</div>`);
}

/* ============ モーダル ============ */
function openModal(html, onOpen) {
  $('#modalBox').innerHTML = '<button class="x" aria-label="とじる">✕</button>' + html;
  $('#modal').classList.remove('hidden');
  $('#modalBox .x').onclick = closeModal;
  if (onOpen) onOpen($('#modalBox'));
}
function closeModal() { $('#modal').classList.add('hidden'); $('#modalBox').innerHTML = ''; if (modalDone) { const f = modalDone; modalDone = null; f(); } }
let modalDone = null;

/* ============ 会話 ============ */
let busy = false, typing = false, typeTimer = null, advanceFn = null, fullText = '';
let autoMode = false, skipMode = false;
let tempChars = {}, tempHidden = {}, sceneBg = null, pendingLoc = null, speaking = null;
const LOG = [];

function faceSrc(who, f) {
  const c = CH[who]; if (!c || !c.face) return null;
  const k = c.face[f] || c.face.n; return k ? `img/${k}.jpg` : null;
}
function showDialog(on) { $('#dialog').classList.toggle('hidden', !on); }

function typeText(text, instant) {
  const box = $('#dlgText'); fullText = text;
  clearInterval(typeTimer);
  $('#dialog').classList.remove('done');
  if (instant) { box.textContent = text; typing = false; $('#dialog').classList.add('done'); return Promise.resolve(); }
  typing = true; let i = 0; box.textContent = '';
  const per = [1, 2, 4][CFG.speed] || 2;
  return new Promise(res => {
    typeTimer = setInterval(() => {
      i += per; box.textContent = text.slice(0, i);
      if (i >= text.length) { clearInterval(typeTimer); typing = false; $('#dialog').classList.add('done'); res(); }
    }, 32);
    finishTyping = () => { clearInterval(typeTimer); box.textContent = text; typing = false; $('#dialog').classList.add('done'); res(); };
  });
}
let finishTyping = () => { };

function onDialogTap() {
  if ($('#dialog').classList.contains('hidden')) return;
  if (!$('#choices').classList.contains('hidden')) return;
  if (skipMode) { setSkip(false); }
  if (typing) { finishTyping(); return; }
  if (advanceFn) { const f = advanceFn; advanceFn = null; se('paper'); f(); }
}

async function line(c) {
  const isSay = c.say !== undefined;
  const who = isSay ? c.say : null;
  const ch = who ? CH[who] : null;
  const text = fmt(isSay ? c.t : c.n);
  const nm = ch ? (typeof ch.name === 'function' ? ch.name() : ch.name) : '';
  const key = hash((who || '') + '|' + text);
  const wasRead = !!S.read[key];
  S.read[key] = 1;
  LOG.push({ name: nm, text }); if (LOG.length > 150) LOG.shift();

  speaking = who ? (ch && ch.st) || who : null;
  renderChars();
  const face = $('#dlgFace');
  face.className = ''; face.innerHTML = '';
  if (!who) face.classList.add('none');
  else if (ch && ch.orb) face.classList.add('orb');
  else { const src = faceSrc(who, c.f); if (src) face.innerHTML = `<img src="${src}" alt="">`; else face.classList.add('none'); }
  const nameEl = $('#dlgName');
  nameEl.textContent = nm; nameEl.style.background = (ch && ch.color) || '';
  $('#dlgText').classList.toggle('narr', !who);
  showDialog(true);

  if (skipMode && !wasRead) setSkip(false);
  const instant = skipMode;
  await typeText(text, instant);
  await new Promise(res => {
    advanceFn = res;
    if (skipMode) setTimeout(() => { if (advanceFn === res) { advanceFn = null; res(); } }, 60);
    else if (autoMode) setTimeout(() => { if (advanceFn === res && autoMode) { advanceFn = null; res(); } }, 1100 + text.length * 55);
  });
}

function choose(opts) {
  if (skipMode) setSkip(false);
  return new Promise(res => {
    const box = $('#choices'); box.innerHTML = '';
    opts.forEach((o, i) => {
      const b = el('button', '', esc(fmt(o.t)));
      b.style.animationDelay = (i * 0.05) + 's';
      b.onclick = ev => {
        ev.stopPropagation(); se('select');
        box.classList.add('hidden'); box.innerHTML = '';
        LOG.push({ name: '▶', text: fmt(o.t), choice: true });
        res(o);
      };
      box.appendChild(b);
    });
    box.classList.remove('hidden');
    $('#dialog').classList.add('done');
  });
}

function setAuto(on) { autoMode = on; $('#btnAuto').classList.toggle('on', on); if (on && !typing && advanceFn) { const f = advanceFn; advanceFn = null; setTimeout(f, 400); } }
function setSkip(on) { skipMode = on; $('#btnSkip').classList.toggle('on', on); if (on) { if (typing) finishTyping(); if (advanceFn) { const f = advanceFn; advanceFn = null; f(); } } }

/* ============ シナリオ実行 ============ */
function getScene(id) {
  const s = SCENES[id];
  if (!s) { console.warn('scene not found:', id); return [{ n: '（この先はまだ準備中です）' }]; }
  return typeof s === 'function' ? s(S) : s;
}

async function play(id) {
  if (busy) return;
  busy = true; document.body.classList.add('busy'); renderIdle(false);
  try {
    let next = id;
    while (next) next = await seq(getScene(next));
  } catch (e) { console.error(e); }
  busy = false; document.body.classList.remove('busy');
  tempChars = {}; tempHidden = {}; sceneBg = null; speaking = null;
  showDialog(false); $('#choices').classList.add('hidden');
  if (autoMode) setAuto(false); if (skipMode) setSkip(false);
  if (pendingLoc) { const l = pendingLoc; pendingLoc = null; await moveTo(l); return; }
  save(); render();
}

async function seq(list) {
  for (const c of list) {
    if (!c) continue;
    if (typeof c === 'function') { const r = c(S); if (typeof r === 'string') return r; continue; }
    if (c.say !== undefined || c.n !== undefined) { await line(c); continue; }
    if (c.choice) {
      const opts = c.choice.filter(o => !o.if || o.if(S));
      const o = await choose(opts);
      if (o.go) return o.go;
      if (o.do) { const r = await seq(o.do); if (r) return r; }
      continue;
    }
    if (c.go) return c.go;
    if (c.if) {
      const b = c.if(S) ? c.then : c.else;
      if (b) { const r = await seq(b); if (r) return r; }
      continue;
    }
    if (c.set) Object.assign(S.f, c.set);
    if (c.aff) for (const k in c.aff) S.aff[k] = (S.aff[k] || 0) + c.aff[k];
    if (c.stage) { S.q[c.stage[0]] = c.stage[1]; if (c.stage[1] === DONE && S.active === c.stage[0]) S.active = null; }
    if (c.accept) { S.active = c.accept; if (!S.q[c.accept]) S.q[c.accept] = 1; }
    if (c.obj !== undefined) { S.obj = c.obj; S.objAt = c.at || null; renderTop(); }
    if (c.give) addItem(c.give, c.num || 1);
    if (c.take) addItem(c.take, -(c.num || 1));
    if (c.get) { addItem(c.get, c.num || 1); await itemPopup(c.get, c.num || 1); }
    if (c.stamps) { S.stamps += c.stamps; se('get'); await popup(`<div class="big">✉️</div><div class="nm">郵便切手 ×${c.stamps}</div><div class="ds">手帳の切手アルバムに貼っておこう</div>`); }
    if (c.time !== undefined) { S.time = Math.min(3, c.time === '+1' ? S.time + 1 : c.time); renderTop(); renderBg(); }
    if (c.bg !== undefined) { sceneBg = c.bg; renderBg(); }
    if (c.show) { tempChars[c.show] = { at: c.at || 'c', cls: c.cls || '' }; delete tempHidden[c.show]; renderChars(); }
    if (c.hide) { delete tempChars[c.hide]; tempHidden[c.hide] = true; renderChars(); }
    if (c.card) await cardPopup(c.card, c.t);
    if (c.se) se(c.se);
    if (c.wait) await sleep(c.wait);
    if (c.fade) { showDialog(false); await fadeOut(c.fade === true ? '' : c.fade); if (c.then) c.then(S); renderBg(); renderTop(); renderChars(); await fadeIn(); }
    if (c.loc) pendingLoc = c.loc;
    if (c.memo) { const m = S.memo[c.memo[0]] = S.memo[c.memo[0]] || []; m.push(c.memo[1]); }
    if (c.note) { const m = S.notes[c.note[0]] = S.notes[c.note[0]] || []; if (!m.includes(c.note[1])) m.push(c.note[1]); }
    if (c.meet) S.f['met_' + c.meet] = true;
    if (c.toast) toast(fmt(c.toast));
    if (c.bench) { showDialog(false); const ok = await workbench(c.bench); if (!ok) return c.bench.fail || null; }
    if (c.sleep) { await doSleep(); }
    if (c.end) return null;
  }
  return null;
}

/* ============ 場所 ============ */
function npcsAt(loc) {
  const L = LOCS[loc]; let list = (L && L.npcs) ? L.npcs(S) : [];
  for (const h of HOOKS) if (h.npcs) list = h.npcs(loc, S, list) || list;
  return list;
}
function spotsAt(loc) {
  const L = LOCS[loc]; let list = (L && L.spots) ? L.spots(S) : [];
  for (const h of HOOKS) if (h.spots) list = h.spots(loc, S, list) || list;
  return list;
}
function enterScene(loc) {
  for (const h of HOOKS) if (h.enter) { const s = h.enter(loc, S); if (s) return s; }
  return null;
}

async function moveTo(loc, opts) {
  opts = opts || {};
  if (!opts.instant) { se('step'); await fadeOut(); }
  S.loc = loc;
  closeMap();
  render();
  if (!opts.instant) await fadeIn();
  save();
  const sc = enterScene(loc);
  if (sc) await play(sc);
  else tipFor(loc);
}

function tipFor(loc) {
  const L = LOCS[loc];
  if (!S.tips.spot && L && !L.indoor && spotsAt(loc).length) { S.tips.spot = 1; toast('✦ が光っている所をタップすると調べられます'); }
}

/* ============ 描画 ============ */
function render() { renderBg(); renderTop(); renderChars(); renderIdle(!busy); }

function renderBg() {
  const bg = $('#bg'), L = LOCS[S.loc] || {};
  const key = sceneBg || L.bg || 'map';
  bg.className = ''; bg.style.backgroundImage = ''; bg.style.backgroundSize = ''; bg.style.backgroundPosition = '';
  if (key === 'basement' || key === 'black') bg.classList.add(key);
  else if (key.startsWith('img:')) { bg.style.backgroundImage = `url(img/${key.slice(4)})`; }
  else {
    // 町マップの一部を拡大して背景にする
    const focal = key.startsWith('map:') ? LOCS[key.slice(4)].focal : (L.focal || [600, 520]);
    bg.classList.add('mapzoom'); bg.style.backgroundImage = 'url(img/map.jpg)';
    const W = bg.clientWidth || window.innerWidth, H = bg.clientHeight || window.innerHeight;
    const s = Math.max(H / 400, W / 560);
    const bw = MAP_W * s, bh = MAP_H * s;
    let x = W / 2 - focal[0] * s, y = H * 0.48 - focal[1] * s;
    x = Math.min(0, Math.max(W - bw, x)); y = Math.min(0, Math.max(H - bh, y));
    bg.style.backgroundSize = `${bw}px ${bh}px`; bg.style.backgroundPosition = `${x}px ${y}px`;
  }
  const t = $('#tint'); const indoor = L.indoor && !(sceneBg && !sceneBg.startsWith('img:'));
  t.className = indoor ? (S.time === 3 ? 'in3' : S.time === 2 ? 'in2' : '') : 't' + S.time;
  if (key === 'basement' || key === 'black') t.className = '';
  // 夜の明かり
  const deco = $('#deco'); deco.innerHTML = '';
  if (S.time === 3 && !indoor && key !== 'basement' && key !== 'black') {
    [[22, 38], [70, 30], [48, 62], [85, 55], [12, 70]].forEach(([x, y], i) => {
      const g = el('div', 'glow'); const r = 90 + (i % 3) * 30;
      Object.assign(g.style, { left: `calc(${x}% - ${r / 2}px)`, top: `calc(${y}% - ${r / 2}px)`, width: r + 'px', height: r + 'px', animationDelay: (i * .6) + 's' });
      deco.appendChild(g);
    });
  }
  if (L.deco) L.deco(S, deco);
}

function renderTop() {
  if (!S) return;
  const t = TIMES[S.time];
  $('#clock').textContent = `${S.day}日目 ${t.i} ${t.k}`;
  $('#locname').textContent = (LOCS[S.loc] || {}).name || '';
  const o = $('#objective');
  o.textContent = S.obj || ''; o.classList.toggle('hidden', !S.obj);
}

function renderChars() {
  const box = $('#chars'); box.innerHTML = '';
  if (!S) return;
  const list = busy || Object.keys(tempChars).length ? npcsAt(S.loc).filter(n => !tempHidden[n.id]) : npcsAt(S.loc);
  const pos = list.length === 1 ? ['c'] : list.length === 2 ? ['l', 'r'] : ['l', 'c', 'r'];
  const shown = [];
  list.forEach((n, i) => shown.push({ id: n.id, st: n.st || n.id, at: n.at || pos[i] || 'c', cls: n.cls || '', npc: n }));
  for (const k in tempChars) {
    const ex = shown.find(s => s.id === k);
    if (ex) { ex.at = tempChars[k].at; ex.cls = tempChars[k].cls; ex.npc = null; }
    else shown.push({ id: k, st: (CH[k] && CH[k].st) || k, at: tempChars[k].at, cls: tempChars[k].cls });
  }
  for (const s of shown) {
    const src = STANDEES[s.st];
    if (!src) continue;
    let d;
    if (src === 'orb') { d = el('div', `st orb ${s.at} ${s.cls}`); }
    else { d = el('div', `st ${s.at} ${s.cls}`); d.innerHTML = `<img src="${src}" alt="">`; }
    if (busy && speaking && speaking !== s.st) d.classList.add('dim');
    if (!busy && s.npc) {
      if (s.npc.label !== false) d.appendChild(el('div', 'talk', esc(s.npc.label || '話す')));
      d.onclick = () => talkTo(s.npc);
    }
    box.appendChild(d);
  }
}

function talkTo(n) {
  if (busy) return;
  const sc = typeof n.talk === 'function' ? n.talk(S) : (n.talk || 'talk_' + n.id);
  if (sc) play(sc);
}

function renderIdle(on) {
  const show = on && S && !busy;
  $('#topbar').classList.toggle('hidden', !S);
  // 調べる所
  const sp = $('#spots'); sp.innerHTML = '';
  if (show) {
    for (const s of spotsAt(S.loc)) {
      const b = el('button', 'spot' + (s.key ? ' key' : ''), `<span class="sp">✦</span><span class="lb">${esc(s.label)}</span>`);
      b.style.left = s.x + '%'; b.style.top = s.y + '%';
      b.onclick = () => { if (!busy) play(s.scene); };
      sp.appendChild(b);
    }
  }
  // 行動ボタン
  const a = $('#actions'); a.innerHTML = '';
  a.classList.toggle('hidden', !show);
  if (show) {
    const L = LOCS[S.loc] || {};
    const acts = L.actions ? L.actions(S) : defaultActions();
    for (const ac of acts) {
      const b = el('button', ac.hl ? 'hl' : '', esc(ac.t));
      b.onclick = () => { if (!busy) { se('select'); ac.fn(); } };
      a.appendChild(b);
    }
  }
  renderChars();
}

function defaultActions() {
  return [
    { t: '🗺 町マップ', fn: openMap, hl: !S.tips.mapUsed },
    { t: '🏠 ほしやへ帰る', fn: () => moveTo('shop') },
  ];
}

/* ============ 町マップ ============ */
function openMap() {
  S.tips.mapUsed = 1;
  const m = $('#map'); m.classList.remove('hidden');
  const pins = $('#mapPins'); pins.innerHTML = '';
  const tint = $('#mapTint');
  tint.style.background = S.time === 3 ? 'rgba(40,50,120,.7)' : S.time === 2 ? 'rgba(255,160,90,.4)' : S.time === 0 ? 'rgba(255,235,200,.2)' : 'transparent';
  for (const id in LOCS) {
    const L = LOCS[id]; if (!L.map) continue;
    const b = el('button', 'pin');
    b.style.left = (L.map[0] / MAP_W * 100) + '%'; b.style.top = (L.map[1] / MAP_H * 100) + '%';
    b.title = L.name; b.setAttribute('aria-label', L.name);
    const here = S.loc === id || (LOCS[S.loc] && LOCS[S.loc].parent === id);
    if (S.objAt === id && !here) { b.appendChild(el('span', 'goal')); b.classList.add('isgoal'); }
    if (here) { const h = el('span', 'here'); h.style.backgroundImage = 'url(img/f_hero_n.jpg)'; b.appendChild(h); }
    b.onclick = () => { se('select'); if (here) closeMap(); else moveTo(id); };
    pins.appendChild(b);
  }
  m.querySelectorAll('.maphint').forEach(e => e.remove());
  const hint = el('div', 'maphint', S.obj ? '📌 ' + esc(S.obj) : '行きたい場所をタップ');
  m.appendChild(hint);
  // 現在地か目的地が見えるようにスクロール
  requestAnimationFrame(() => {
    const sc = $('#mapScroll'), inner = $('#mapInner');
    const target = LOCS[S.objAt] || LOCS[S.loc] || LOCS.plaza;
    const p = (target.map || LOCS.plaza.map)[0] / MAP_W;
    sc.scrollLeft = Math.max(0, inner.clientWidth * p - sc.clientWidth / 2);
  });
  if (!S.tips.map) { S.tips.map = 1; toast('場所の名前や建物をタップすると移動できます'); }
}
function closeMap() { $('#map').classList.add('hidden'); }

/* ============ 依頼箱 ============ */
function questState(q) {
  if (done(q.id)) return 'done';
  if (S.active === q.id) return 'active';
  if (q.unlock && !q.unlock(S)) return 'locked';
  return 'open';
}
function openRequests() {
  const list = QUESTS.filter(q => ['active', 'open'].includes(questState(q)));
  let html = '<h2>📮 依頼箱</h2>';
  if (!list.length) html += `<div class="empty">${S.f.v1end ? 'いまは新しい依頼の紙は入っていない。<br>（中盤の依頼は次の更新で追加予定です）' : 'いまは依頼の紙が入っていない。'}</div>`;
  list.sort((a, b) => (questState(b) === 'active') - (questState(a) === 'active') || a.no - b.no);
  for (const q of list) {
    const st = questState(q), w = q.when ? q.when(S) : { ok: true };
    const off = st === 'open' && (S.active || !w.ok);
    const c = CH[q.client] || {};
    html += `<button class="qcard ${st === 'active' ? 'active' : ''} ${off ? 'off' : ''}" data-q="${q.id}">
      <img src="${faceSrc(q.client, 'n') || ''}" alt="">
      <div><div class="qt">依頼${q.no}：${esc(q.title)}${st === 'active' ? '<span class="tag">受けている</span>' : ''}${q.tag ? `<span class="tag">${q.tag}</span>` : ''}</div>
      <div class="qs">${st === 'active' ? '📌 ' + esc(S.obj || '') : esc((typeof c.name === 'string' ? c.name : '') + '：' + q.summary)}${off && !w.ok ? '<br>（' + esc(w.note) + '）' : ''}</div></div></button>`;
  }
  openModal(html, box => {
    box.querySelectorAll('.qcard').forEach(b => b.onclick = () => {
      const q = QUESTS.find(x => x.id === b.dataset.q), st = questState(q);
      if (st === 'active') { closeModal(); toast('📌 ' + S.obj); return; }
      if (S.active) { toast('いまの依頼が終わってから受けよう'); return; }
      const w = q.when ? q.when(S) : { ok: true };
      if (!w.ok) { toast(w.note); return; }
      se('paper');
      openModal(`<h2>依頼${q.no}：${esc(q.title)}</h2>
        <div class="paper">${esc(q.paper || q.summary)}</div>
        <div class="row"><button class="btn" id="qBack">もどる</button><button class="btn pri" id="qOk">この依頼を受ける</button></div>`, bx => {
        bx.querySelector('#qBack').onclick = openRequests;
        bx.querySelector('#qOk').onclick = () => { closeModal(); play(q.start); };
      });
    });
  });
}

/* ============ 持ち物 ============ */
function openBag() {
  const ids = Object.keys(S.items);
  let html = '<h2>🎒 持ち物</h2>';
  if (!ids.length) html += '<div class="empty">かばんの中は、まだからっぽ。</div>';
  else html += '<div class="items">' + ids.map(id => { const it = ITEMS[id] || { name: id, icon: '✨' }; return `<button class="item" data-i="${id}"><span class="ic">${it.icon}</span>${esc(it.name)}${S.items[id] > 1 ? `<span class="ct">×${S.items[id]}</span>` : ''}</button>`; }).join('') + '</div><div class="idesc">タップすると説明が見られます</div>';
  openModal(html, box => box.querySelectorAll('.item').forEach(b => b.onclick = () => {
    box.querySelectorAll('.item').forEach(x => x.classList.remove('sel')); b.classList.add('sel');
    const it = ITEMS[b.dataset.i]; box.querySelector('.idesc').textContent = it ? fmt(it.desc) : '';
  }));
}

/* ============ 手帳 ============ */
function openNote(tab) {
  tab = tab || 'q';
  let body = '';
  if (tab === 'q') {
    const qs = QUESTS.filter(q => S.q[q.id]);
    body = qs.length ? qs.map(q => `<div class="qlog"><span class="qt">依頼${q.no}：${esc(q.title)}</span><span class="st2 ${done(q.id) ? 'done' : ''}">${done(q.id) ? 'おわり' : '受けている'}</span>
      ${(S.memo[q.id] || []).length ? '<ul>' + S.memo[q.id].map(m => `<li>${esc(fmt(m))}</li>`).join('') + '</ul>' : ''}</div>`).join('') : '<div class="empty">まだ依頼の記録はない。</div>';
  } else if (tab === 'r') {
    const met = Object.keys(CH).filter(k => CH[k].note && S.f['met_' + k]);
    body = met.length ? met.map(k => { const c = CH[k]; return `<div class="res">${c.face ? `<img src="${faceSrc(k, 'n')}" alt="">` : '<div class="orbmini"></div>'}<div><div class="rn">${esc(typeof c.name === 'function' ? c.name() : c.name)}</div>
      <div class="rd">${esc(c.note)}${(S.notes[k] || []).map(n => `<br><b>・${esc(fmt(n))}</b>`).join('')}</div></div></div>`; }).join('') : '<div class="empty">まだ誰にも会っていない。</div>';
  } else {
    const motifs = ['🌸', '🐈', '⭐', '🍞', '🏮', '🎐', '🎵', '🌙', '🍃', '⛲', '🔔', '🌼'];
    let s = ''; for (let i = 0; i < 12; i++) s += i < S.stamps ? `<div class="stamp">${motifs[i]}</div>` : '<div class="stamp none">？</div>';
    body = `<div class="stamps">${s}</div><p class="empty">集めた切手：${S.stamps}枚</p>`;
  }
  openModal(`<h2>📖 手帳</h2><div class="tabs"><button data-t="q" class="${tab === 'q' ? 'on' : ''}">依頼</button><button data-t="r" class="${tab === 'r' ? 'on' : ''}">住人ノート</button><button data-t="s" class="${tab === 's' ? 'on' : ''}">切手</button></div>${body}`,
    box => box.querySelectorAll('.tabs button').forEach(b => b.onclick = () => openNote(b.dataset.t)));
}

/* ============ 作業台 ============ */
function workbench(cfg) {
  return new Promise(res => {
    const filled = {};
    const missing = cfg.needs.filter(id => !has(id));
    if (missing.length) {
      toast((cfg.hint || '材料が足りないみたい。') + '\n足りない物：' + missing.map(id => ITEMS[id].name).join('、'), 3600);
      res(false); return;
    }
    const draw = () => {
      const all = cfg.needs.every(id => filled[id]);
      openModal(`<h2>🛠 作業台</h2><div class="bench">
        ${cfg.img ? `<img class="target" src="img/${cfg.img}.jpg" alt="">` : `<div class="big" style="font-size:56px">${cfg.icon || '🛠'}</div>`}
        <div>${esc(cfg.title)}</div>
        <div class="slots">${cfg.needs.map(id => `<div class="slot ${filled[id] ? 'ok' : ''}">${filled[id] ? `<span><span class="ic">${ITEMS[id].icon}</span>${esc(ITEMS[id].name)}</span>` : esc(ITEMS[id].name) + '<br>をはめる'}</div>`).join('')}</div>
        <div style="font-size:13px;color:var(--ink-soft)">${all ? '材料がそろった！' : '下の持ち物から、材料をタップしてはめよう'}</div>
        <div class="items" style="width:100%">${Object.keys(S.items).map(id => `<button class="item" data-i="${id}"><span class="ic">${ITEMS[id] ? ITEMS[id].icon : '✨'}</span>${esc(ITEMS[id] ? ITEMS[id].name : id)}</button>`).join('')}</div>
        <div class="row"><button class="btn pri" id="bOk" ${all ? '' : 'disabled'}>直す</button></div></div>`, box => {
        box.querySelectorAll('.item').forEach(b => b.onclick = () => {
          const id = b.dataset.i;
          if (cfg.needs.includes(id)) { filled[id] = true; se('select'); draw(); }
          else toast('これは使わないみたい');
        });
        box.querySelector('#bOk').onclick = () => { modalDone = null; closeModal(); se('magic'); res(true); };
      });
      modalDone = () => res(false);
    };
    draw();
  });
}

/* ============ 1日の区切り ============ */
async function doSleep() {
  showDialog(false);
  se('night');
  await fadeOut('おやすみなさい');
  S.day += 1; S.time = 0; S.loc = 'shop';
  tempChars = {}; tempHidden = {}; sceneBg = null;
  renderBg(); renderTop(); renderChars();
  $('#fade').textContent = `${S.day}日目の朝`;
  await sleep(1100);
  await fadeIn();
  store(SAVE_KEY, S);
}

/* ============ 設定・ログ ============ */
function openSettings(fromTitle) {
  const seg = (name, vals, cur) => `<div class="seg" data-k="${name}">${vals.map(([v, t]) => `<button data-v="${v}" class="${String(cur) === String(v) ? 'on' : ''}">${t}</button>`).join('')}</div>`;
  openModal(`<h2>⚙ 設定</h2>
    ${S && !fromTitle ? `<div class="set">主人公の名前<input type="text" id="sName" maxlength="8" value="${esc(S.name)}"></div>` : ''}
    <div class="set">文字の速さ${seg('speed', [[0, 'ゆっくり'], [1, 'ふつう'], [2, 'はやい']], CFG.speed)}</div>
    <div class="set">文字の大きさ${seg('big', [[false, 'ふつう'], [true, '大きめ']], CFG.big)}</div>
    <div class="set">音${seg('sound', [[true, 'オン'], [false, 'オフ']], CFG.sound)}</div>
    <div class="set">音量<input type="range" id="sVol" min="0" max="1" step="0.1" value="${CFG.vol}"></div>
    <div class="row">
      ${S && !fromTitle ? '<button class="btn" id="sTitle">タイトルへ</button>' : ''}
      <button class="btn danger" id="sDel">データを消す</button>
      <button class="btn pri" id="sOk">とじる</button>
    </div>`, box => {
    box.querySelectorAll('.seg').forEach(g => g.querySelectorAll('button').forEach(b => b.onclick = () => {
      const k = g.dataset.k, v = b.dataset.v;
      CFG[k] = k === 'speed' ? +v : v === 'true';
      g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      applyCfg(); se('select');
    }));
    box.querySelector('#sVol').oninput = e => { CFG.vol = +e.target.value; applyCfg(); };
    box.querySelector('#sVol').onchange = () => se('select');
    const nm = box.querySelector('#sName');
    box.querySelector('#sOk').onclick = () => {
      if (nm) { S.name = nm.value.trim() || 'アキ'; save(); }
      closeModal();
    };
    const tb = box.querySelector('#sTitle');
    if (tb) tb.onclick = () => { if (nm) S.name = nm.value.trim() || 'アキ'; save(); closeModal(); showTitle(); };
    box.querySelector('#sDel').onclick = () => {
      if (!confirm('セーブデータを消します。よろしいですか？')) return;
      if (!confirm('本当に消しますか？（元に戻せません）')) return;
      dropStore(SAVE_KEY); S = null; closeModal(); showTitle(); toast('データを消しました');
    };
  });
}
function applyCfg() { document.body.classList.toggle('big', !!CFG.big); store(SET_KEY, CFG); }
function openLog() {
  const html = LOG.length ? LOG.slice(-80).map(l => l.choice ? `<p class="ch">▶ ${esc(l.text)}</p>` : `<p>${l.name ? `<b>${esc(l.name)}</b><br>` : ''}${esc(l.text)}</p>`).join('') : '<div class="empty">まだ会話はない。</div>';
  openModal(`<h2>ログ</h2><div class="log">${html}</div>`, box => { box.scrollTop = box.scrollHeight; });
}

/* ============ タイトル ============ */
function showTitle() {
  busy = false; document.body.classList.remove('busy');
  $('#title').classList.remove('hidden');
  ['#topbar', '#objective', '#actions', '#dialog', '#choices', '#map'].forEach(s => $(s).classList.add('hidden'));
  $('#tCont').disabled = !fetchStore(SAVE_KEY);
  $('#tAlbum').disabled = !(fetchStore(ALBUM_KEY) || []).length;
}
function startNew() {
  if (fetchStore(SAVE_KEY) && !confirm('前のデータは消えて、はじめからになります。よろしいですか？')) return;
  openModal(`<h2>主人公の名前</h2>
    <p style="text-align:center;font-size:14px;color:var(--ink-soft)">なんでも屋「ほしや」の新米店員。<br>名前をつけてください（あとで設定から変えられます）</p>
    <div style="text-align:center"><input type="text" id="nmIn" maxlength="8" value="アキ" style="font:inherit;font-size:20px;text-align:center;padding:8px;border-radius:12px;border:2px solid var(--line);width:10em"></div>
    <div class="row"><button class="btn pri" id="nmOk">はじめる</button></div>`, box => {
    const inp = box.querySelector('#nmIn'); inp.focus(); inp.select();
    box.querySelector('#nmOk').onclick = async () => {
      const name = inp.value.trim() || 'アキ';
      closeModal(); audio(); se('bell');
      S = newState(name);
      $('#title').classList.add('hidden');
      LOG.length = 0;
      render();
      play('prologue');
    };
  });
}
function continueGame() {
  const d = fetchStore(SAVE_KEY); if (!d) return;
  S = Object.assign(newState(), d);
  audio();
  $('#title').classList.add('hidden');
  LOG.length = 0;
  render();
  const sc = enterScene(S.loc);
  if (sc) play(sc);
}

/* ============ 起動 ============ */
function boot() {
  CFG = Object.assign(CFG, fetchStore(SET_KEY) || {});
  applyCfg();
  $('#dialog').addEventListener('click', onDialogTap);
  $('#stage').addEventListener('click', () => { if (busy) onDialogTap(); });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && busy && $('#modal').classList.contains('hidden') && $('#popup').classList.contains('hidden')) { e.preventDefault(); onDialogTap(); }
  });
  $('#btnLog').onclick = e => { e.stopPropagation(); openLog(); };
  $('#btnAuto').onclick = e => { e.stopPropagation(); setAuto(!autoMode); };
  $('#btnSkip').onclick = e => { e.stopPropagation(); setSkip(!skipMode); };
  $('#btnBag').onclick = () => { se('select'); openBag(); };
  $('#btnNote').onclick = () => { se('select'); openNote(); };
  $('#btnSet').onclick = () => { se('select'); openSettings(); };
  $('#mapClose').onclick = () => { se('select'); closeMap(); };
  $('#objective').onclick = () => { if (S && S.obj) toast('📌 ' + S.obj + (S.objAt && LOCS[S.objAt] ? '\n（行き先：' + LOCS[S.objAt].name + '）' : '')); };
  $('#tNew').onclick = startNew;
  $('#tCont').onclick = continueGame;
  $('#tSet').onclick = () => openSettings(true);
  $('#tAlbum').onclick = () => toast('結末アルバムは、エンディングを見ると増えていきます');
  window.addEventListener('resize', () => { if (S) renderBg(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  showTitle();
}

window.Game = {
  boot, play, moveTo, openMap, openRequests, closeModal, toast, save,
  get S() { return S; },
};
