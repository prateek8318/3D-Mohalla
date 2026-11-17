import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { buildWorld } from './world.js';
import { CIRCLES, driveable, footable, heightAt, inFoot, solidAt } from './collide.js';
import { makeRickshaw } from './rickshaw.js';
import { Music, initMusicUI } from './music.js';
import { buildPlaces } from './places.js';
import { buildPlaces2 } from './places2.js';
import { buildAnimals } from './animals.js';
import { buildCouple } from './couple.js';
import { buildCouples } from './couples.js';
import { createEyeLock } from './eyelock.js';
import { buildNPCs } from './npcs.js';
import { makeHuman, updateHuman, setAction, setOverlay, hold, itemMesh } from './humans.js';
import { buildTraffic } from './traffic.js';
import { buildHotel } from './hotel.js';
import { buildMinimap } from './minimap.js';
import { buildStation } from './station.js';
import { createUI3D } from './ui3d.js';
import { createMissions } from './missions.js';
import { buildHighway } from './highway.js';
import { createWeapons, GUNS } from './weapons.js';
import { createStory } from './story.js';
import { cloud } from './cloud.js';
import { ROOF, LIFT } from './hotel.js';
import { makeEnv, computeEnv, clockLabel, phase, RetroShader, HOUR_SECONDS } from './daytime.js';
import { GHAT, SHAYARI, UI, WISHES, CALLS, GENERIC, KISS_LINES, PHASES, pick } from './data.js';
import { FORTUNES, GIRL, PICKUP, POLICE, PED, BAK2, UI18, UIX, FIGHT, FIGHT18, SCENES, BAR, KALLU, HDHABA, MISC3 } from './data2.js';

const $ = (id) => document.getElementById(id);
const isTouch = matchMedia('(pointer:coarse)').matches;
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const headingTo = (dx, dz) => Math.atan2(-dx, -dz);
const pv = (v) => (Array.isArray(v) ? pick(v) : v);

const state = {
  lang: 'hi', level: 0, age18: false, money: 300, t: 0, open: null, romance: false,
  sugarUntil: 0, turboUntil: 0, fireUntil: 0, champiUntil: 0,
  tod: 16 / 24, realTime: true, rtPref: true, retro: false, cineFx: true, weapon: null, runToggle: false, hurtUntil: 0, attackCd: 0, dogFriend: null, dogFriendUntil: 0, catUntil: 0, cine: null,
  hp: 100, onRoof: false, lives: 3, lifeRegen: 0, pose: null,
  mode: 'drive', wanted: 0, wantedQuiet: 0, escapeUntil: 0, caughtCd: 0,
  bag: [], seq: null, ittarUntil: 0, haircutAt: -999, facialAt: -999, polishAt: -999, styleAt: -999,
  activeShop: null, talkGirl: null, stunUntil: 0, balloonUntil: 0,
};
const env = makeEnv();
const L = () => state.lang;
// gaali level: 0 sanskaari, 1 bakchodi, 2 = 18+
function gaali(key) {
  if (state.level === 2 && UI18[L()][key]) return pv(UI18[L()][key]);
  if (state.level >= 1) {
    if (BAK2[L()][key]) return pv(BAK2[L()][key]);
    if (UI.bak[L()][key]) return pv(UI.bak[L()][key]);
  }
  return null;
}
const ui = (k) => gaali(k) || UI[L()][k];
const fight = (k) => pv((state.level === 2 ? FIGHT18 : FIGHT)[L()][k] || FIGHT[L()][k]);
const X = () => UIX[L()];

// ---------- RENDERER ----------
const renderer = new THREE.WebGLRenderer({ canvas: $('c'), antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.3 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1500);
const rt = new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: THREE.HalfFloatType, samples: isTouch ? 2 : 4 });
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.85, 0.55, 0.82);
composer.addPass(bloom);
const retroPass = new ShaderPass(RetroShader);
composer.addPass(retroPass);
composer.addPass(new OutputPass());

function resize() {
  const w = innerWidth, h = innerHeight;
  camera.aspect = w / h;
  camera.fov = w < h ? 72 : 60;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  bloom.resolution.set(w / 2, h / 2);
  retroPass.uniforms.res.value.set(w, h);
}
addEventListener('resize', resize);
resize();

// ---------- UI helpers ----------
let toastTimer;
function toast(msg, ms = 2600) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}
function setMoney(v) {
  const before = state.money;
  state.money = Math.max(0, Math.round(v));
  // BUG FIX: pehle yahan loadGame() tha jo purana save padh ke paisa wapas reset kar deta tha
  try { localStorage.setItem('mohalla.money', String(state.money)); } catch { /* private mode */ }
  if (started) saveGame();
  $('money').textContent = state.money;
  const w = document.querySelector('.wallet');
  w.classList.remove('bump');
  void w.offsetWidth;
  w.classList.add('bump');
  const diff = state.money - before;
  if (diff) {
    const f = document.createElement('div');
    f.className = 'moneyPop ' + (diff > 0 ? 'up' : 'down');
    f.textContent = (diff > 0 ? '+₹' : '-₹') + Math.abs(diff);
    w.appendChild(f);
    setTimeout(() => f.remove(), 1400);
  }
}
function flash(cls) {
  const f = $('flash');
  f.className = '';
  void f.offsetWidth;
  f.className = cls;
}

const music = new Music();
const musicUI = initMusicUI(music, { toast });

// ---------- SOUND FX ----------
function beep(freqs, dur = 0.12, type = 'square', vol = 0.08) {
  const ctx = music.ctxReady();
  let t = ctx.currentTime;
  for (const f of freqs) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur);
    t += dur * 1.1;
  }
}
function glide(f0, f1, dur, type = 'sine', vol = 0.06, delay = 0) {
  const ctx = music.ctxReady();
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function noise(dur = 0.15, vol = 0.3, hp = 800) {
  const ctx = music.ctxReady();
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = buf; f.type = 'highpass'; f.frequency.value = hp; g.gain.value = vol;
  s.connect(f).connect(g).connect(ctx.destination);
  s.start();
}
const horn = () => { if (state.mode !== 'drive') return; beep([392, 392], 0.18, 'square', 0.06); toast(ui('horn'), 1400); };
const coinSfx = () => beep([988, 1319], 0.07, 'triangle', 0.08);
const bellSfx = (delay = 0) => { glide(880, 870, 2.2, 'sine', 0.07, delay); glide(2210, 2200, 1.4, 'sine', 0.03, delay); };
const barkSfx = () => { glide(520, 260, 0.12, 'sawtooth', 0.05); glide(500, 250, 0.12, 'sawtooth', 0.05, 0.18); };
const meowSfx = () => { glide(600, 900, 0.18, 'triangle', 0.04); glide(900, 500, 0.35, 'triangle', 0.04, 0.18); };
const ringSfx = () => { for (let i = 0; i < 2; i++) glide(1350, 1350, 0.35, 'square', 0.025, i * 0.5); };
const slapSfx = () => { noise(0.18, 0.6, 1200); glide(300, 120, 0.15, 'triangle', 0.08); };
const snipSfx = () => noise(0.05, 0.15, 3000);
const sirenSfx = () => { glide(650, 1050, 0.5, 'sawtooth', 0.025); glide(1050, 650, 0.5, 'sawtooth', 0.025, 0.5); };

// ---------- WORLD ----------
let world, rick, places, places2, animals, couple, couples, npcs, me, traffic, ownCar, hotel, drawMap, station, ui3d, missions, weapons, story;
const shootTargets = [];
let aimYaw = 0, aimPitch = 0, lastShotWanted = 0, lastHurt = -99;
let car = { pos: new THREE.Vector3(0, 0, 80), heading: 0, speed: 0 };
const walker = { pos: new THREE.Vector3(), heading: 0, speed: 0, y: 0, vy: 0 };
const ctxPlayer = { pos: car.pos, heading: 0, speed: 0, mode: 'drive' };
const GF_SEAT_AUTO = new THREE.Vector3(-0.45, 0.42, 0.95); // sawari daayein, girlfriend baayein

// ---------- INPUT ----------
const keys = {};
const joy = { x: 0, y: 0 };
let camYaw = 0, footYaw = 0, camDist = isTouch ? 12 : 11, footDist = isTouch ? 5.2 : 4.6;

addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  keys[e.code] = true;
  if (e.code === 'Escape') { if (state.scene) endScene(); else if (state.cine) endCine(); else closeSheets(); }
  if (!started) return;
  if (e.repeat) return;
  if (e.code === 'KeyE' && !state.open) interact();
  if (e.code === 'KeyF' && !state.open) toggleRide();
  if (e.code === 'KeyB') { if (state.open === 'bag') closeSheets(); else if (!state.open) openBag(); }
  if (e.code === 'KeyH') horn();
  if (e.code === 'KeyJ') { if (weapons?.cur && state.mode === 'foot') shoot(); else attack(); }
  if (e.code === 'KeyR') { if (weapons?.aiming) { aimToggle = false; stopAim(); } else { aimToggle = true; startAim(); } }
  if (['Digit1', 'Digit2', 'Digit3', 'Digit0'].includes(e.code)) equipSlot(e.code);
  if (e.code === 'KeyK' && !state.open) openJobs();
  if (e.code === 'Space') { e.preventDefault(); jump(); }
  if (e.code === 'KeyM') { if (!$('music').classList.contains('hidden')) closeSheets(); else if (!state.open) openMusic(); }
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
// focus jaane pe (naya tab, alt-tab) saari chaabiyan chhod do — warna character khud chalta rehta hai
const releaseAll = () => { for (const k in keys) keys[k] = false; endJoy(); drag = null; };
addEventListener('blur', releaseAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });

const canvas = $('c');
let drag = null;
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('pointerdown', (e) => {
  drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
  if (!started || !weapons) return;
  if (e.button === 2) startAim();
  else if (e.button === 0 && weapons.aiming && e.pointerType === 'mouse') shoot();
});
canvas.addEventListener('pointerup', (e) => { if (e.button === 2 && weapons?.aiming && !aimToggle) stopAim(); });
addEventListener('pointermove', (e) => {
  if (!drag || drag.id !== e.pointerId) return;
  const dx = (e.clientX - drag.x) * 0.006, dy = (e.clientY - drag.y) * 0.006;
  if (weapons?.aiming) {
    const k = weapons.cur === 'sniper' ? 0.25 : 0.7;
    aimYaw -= dx * k; aimPitch = THREE.MathUtils.clamp(aimPitch - dy * k, -0.9, 0.7);
  } else if (state.mode === 'drive') camYaw -= dx; else footYaw -= dx;
  drag.x = e.clientX; drag.y = e.clientY;
});
addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (e) => {
  if (state.mode === 'drive') camDist = THREE.MathUtils.clamp(camDist + e.deltaY * 0.01, 6, 24);
  else footDist = THREE.MathUtils.clamp(footDist + e.deltaY * 0.005, 2.2, 10);
}, { passive: true });

const joyEl = $('joy'), knob = $('joyKnob');
let joyId = null;
joyEl.addEventListener('pointerdown', (e) => { joyId = e.pointerId; joyEl.setPointerCapture(e.pointerId); moveJoy(e); });
joyEl.addEventListener('pointermove', (e) => { if (e.pointerId === joyId) moveJoy(e); });
function endJoy() { joyId = null; joy.x = joy.y = 0; knob.style.transform = ''; }
joyEl.addEventListener('pointerup', endJoy);
joyEl.addEventListener('pointercancel', endJoy);
joyEl.addEventListener('lostpointercapture', endJoy);
function moveJoy(e) {
  const r = joyEl.getBoundingClientRect();
  let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  const max = r.width / 2 - 10, len = Math.hypot(dx, dy);
  if (len > max) { dx *= max / len; dy *= max / len; }
  joy.x = dx / max;
  joy.y = dy / max;
  knob.style.transform = `translate(${dx}px, ${dy}px)`;
}
$('mHorn').onclick = () => (state.mode === 'drive' ? horn() : null);
$('mAct').onclick = () => interact();
$('mF').onclick = () => toggleRide();
$('mBag').onclick = () => openBag();
$('btnJobs').onclick = () => openJobs();
$('mHit').onclick = () => (weapons?.cur ? shoot() : attack());
$('mAim').onclick = () => { if (weapons?.aiming) { aimToggle = false; stopAim(); } else { aimToggle = true; startAim(); } };
$('mGun').onclick = () => cycleGun();
$('mJump').onclick = () => jump();
$('mRun').onclick = () => { state.runToggle = !state.runToggle; $('mRun').classList.toggle('on', state.runToggle); };
$('prompt').onclick = () => interact();

// ---------- HUD ----------
function setLang(l) {
  state.lang = l;
  $('btnLang').textContent = l === 'hi' ? 'हिं' : 'भो';
  document.querySelectorAll('.lang-pick button').forEach((b) => b.classList.toggle('on', b.dataset.lang === l));
}
function setLevel(lv) {
  state.level = lv;
  const b = $('btnBak');
  b.classList.toggle('on', lv >= 1);
  b.classList.toggle('lv2', lv === 2);
  b.textContent = lv === 2 ? '🔞' : '🤬';
  $('bakIntro').checked = lv >= 1;
}
document.querySelectorAll('.lang-pick button').forEach((b) => (b.onclick = () => setLang(b.dataset.lang)));
$('bakIntro').onchange = (e) => setLevel(e.target.checked ? 1 : 0);
$('btnLang').onclick = () => { setLang(state.lang === 'hi' ? 'bho' : 'hi'); toast(state.lang === 'hi' ? 'Bhasha: Hindi 🇮🇳' : 'Bhasha: Bhojpuri 🙏'); };
$('btnBak').onclick = () => {
  if (state.level === 0) { setLevel(1); toast('🤬 Bakchodi mode ON 😂'); }
  else if (state.level === 1) {
    if (state.age18) { setLevel(2); toast('🔞 18+ Gaali mode ON'); }
    else openAgeGate();
  } else { setLevel(0); toast('😇 Sanskaari mode ON'); }
};
$('btnMusic').onclick = () => openMusic();
$('btnPlaces').onclick = () => openPlaces();
$('btnBag').onclick = () => openBag();
document.querySelectorAll('[data-close]').forEach((b) => (b.onclick = () => closeSheets()));
document.querySelectorAll('.sheet').forEach((s) => s.addEventListener('pointerdown', (e) => { if (e.target === s) closeSheets(); }));

function closeSheets() {
  ['shop', 'music', 'places'].forEach((id) => $(id).classList.add('hidden'));
  if (state.talkGirl) { state.talkGirl.talking = false; state.talkGirl.pause = 1.5; state.talkGirl = null; }
  state.activeShop = null;
  if (state.open !== 'cine' && state.open !== 'dead') state.open = null;
}
function openMusic(opts) {
  closeSheets();
  musicUI.open(opts); // game chalta rahega, gaana background mein
}

// ---------- GENERIC DIALOG (shop sheet reuse) ----------
function say(text, sub) {
  const el = $('shopSay');
  el.innerHTML = '';
  el.append(document.createTextNode(text));
  if (sub) { const s = document.createElement('small'); s.textContent = sub; el.append(s); }
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}
function dialog({ kind, avatar, title, sub, line, options }) {
  closeSheets();
  state.open = kind;
  $('shopAvatar').textContent = avatar;
  $('shopName').textContent = title;
  $('shopOwner').textContent = sub || '';
  say(line || '');
  renderOptions(options);
  $('shop').classList.remove('hidden');
}
function renderOptions(options) {
  const box = $('shopItems');
  box.innerHTML = '';
  for (const o of options) {
    const b = document.createElement('button');
    b.className = 'item' + (o.cls ? ' ' + o.cls : '');
    b.innerHTML = `<span class="n"></span>${o.p !== undefined ? `<span class="p">${o.p ? '₹' + o.p : UI[L()].free}</span>` : ''}${o.d ? '<span class="d"></span>' : ''}`;
    b.querySelector('.n').textContent = o.n;
    if (o.d) b.querySelector('.d').textContent = o.d;
    b.onclick = o.on;
    box.appendChild(b);
  }
}

function openAgeGate() {
  dialog({
    kind: 'age', avatar: '🔞', title: '18+ Gaali Mode', sub: 'Sirf baalig logon ke liye',
    line: 'Is mode mein dukaandaar, police aur ladkiyan bahut gandi gaaliyan denge (madarchod, bhenchod waghera). Kya aap 18 saal ya usse bade ho?',
    options: [
      { n: '✅ Haan, main 18+ hoon', cls: 'danger', on: () => { state.age18 = true; setLevel(2); closeSheets(); toast('🔞 18+ Gaali mode ON'); } },
      { n: '❌ Nahi', on: () => { closeSheets(); } },
    ],
  });
}

// ---------- PLACES / TIME ----------
const PLACES = () => [
  { label: '🛺 Mohalla Gate', x: 0, z: 240, h: 0, drive: true },
  { label: '🎧 Mohalla FM Chowk', x: 0, z: 16, h: 0, drive: true },
  { label: '🏏 Gandhi Park', x: -112, z: 140, h: Math.PI / 2, drive: true },
  { label: '🚓 Police Thana', x: 110, z: 140, h: -Math.PI / 2, drive: true },
  { label: '🛍️ Chowk Bazaar Gali', x: -14, z: 200, h: Math.PI / 2 },
  { label: '🏨 Hotel Raj Palace (Disco)', x: 75, z: 126, h: 0 },
  { label: '🚂 Mohalla Junction (Station)', x: 0, z: 438, h: 0, drive: true },
  { label: '🛣️ Highway Dhaba', x: -220, z: 330, h: -Math.PI / 2, drive: true },
  { label: '🔫 Kallu Kattewala (Park)', x: -121, z: 151, h: Math.PI / 2 },
  ...world.triggers.filter((t) => t.def.items && !t.keeper?.stall).map((t) => ({ label: `${t.def.avatar} ${t.def.name[L()]}`, x: t.x, z: t.z + (t.def === GHAT ? 5 : 0), h: t.heading })),
];
function openPlaces() {
  closeSheets();
  state.open = 'places';
  const list = $('placeList');
  list.innerHTML = '';
  const sv = document.createElement('button');
  sv.className = 'item good';
  sv.style.marginBottom = '10px';
  sv.textContent = '💾 Save / Load (progress)';
  sv.onclick = () => openSaveMenu();
  list.appendChild(sv);
  const cb = document.createElement('div');
  cb.className = 'items';
  cb.style.marginBottom = '10px';
  for (const [txt, fn] of [['🏆 Leaderboard', () => openLeaderboard()], [cloud.user && !cloud.user.isAnonymous ? `☁️ ${cloud.name()}` : '🔐 Login / Account', () => openAccount()]]) {
    const b = document.createElement('button');
    b.className = 'item good';
    b.textContent = txt;
    b.onclick = fn;
    cb.appendChild(b);
  }
  list.appendChild(cb);
  const tb = document.createElement('div');
  tb.className = 'items';
  tb.style.marginBottom = '12px';
  const P = PHASES[L()];
  for (const [lbl, hr] of [[`🌅 ${P.morning}`, 7], [`☀️ ${P.noon}`, 12.5], [`🌇 ${P.evening}`, 17.7], [`🌙 ${P.night}`, 21]]) {
    const b = document.createElement('button');
    b.className = 'item';
    b.textContent = lbl;
    b.onclick = () => { state.realTime = false; state.rtPref = false; state.tod = hr / 24; closeSheets(); };
    tb.appendChild(b);
  }
  const rb = document.createElement('button');
  rb.className = 'item good';
  rb.textContent = state.realTime ? '🕐 Asli time: ON' : '🕐 Asli time (phone ka)';
  rb.onclick = () => { state.realTime = !state.realTime; state.rtPref = state.realTime; toast(state.realTime ? '🕐 Ab mohalla asli time pe chalega' : '⏩ Game time'); closeSheets(); };
  tb.appendChild(rb);
  list.appendChild(tb);
  for (const p of PLACES()) {
    const b = document.createElement('button');
    b.className = 'item';
    b.innerHTML = '<span class="n"></span>';
    b.querySelector('.n').textContent = p.label;
    b.onclick = () => { teleport(p); closeSheets(); };
    list.appendChild(b);
  }
  $('places').classList.remove('hidden');
}
$('clock').onclick = () => openPlaces();
function cancelSeq() {
  const s = state.seq;
  if (!s) return;
  if (s.type === 'salon') npcs.salon(false);
  if (s.type === 'kite') stopKite();
  hold(me, state.weapon ? itemMesh(state.weapon) : null);
  setOverlay(me, state.weapon ? 'hold' : null);
  me.lookX = 0;
  state.seq = null;
}
function teleport(p) {
  cancelSeq();
  state.onRoof = false;
  if (weapons?.aiming) stopAim();
  if (p.drive) {
    if (state.mode === 'foot') enterRick(true);
    car.pos.set(p.x, 0, p.z); car.heading = p.h; car.speed = 0; camYaw = 0;
  } else {
    if (state.mode === 'drive') exitRick(true);
    walker.pos.set(p.x, 0, p.z); walker.heading = p.h; footYaw = p.h;
    // rickshaw bhi paas mein khada kar do
    const near = findParking(p.x, p.z);
    if (near) { car.pos.copy(near); car.speed = 0; }
  }
  snapCam = true;
}
function findParking(x, z) {
  for (let r = 4; r < 60; r += 3) for (let a = 0; a < 16; a++) {
    const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
    if (driveable(px, pz)) return new THREE.Vector3(px, 0, pz);
  }
  return null;
}

// ---------- RICKSHAW UTRO / BAITHO ----------
function exitRick(force = false) {
  const h = car.heading;
  const tries = [[-Math.cos(h) * 1.9, Math.sin(h) * 1.9], [Math.cos(h) * 1.9, -Math.sin(h) * 1.9], [Math.sin(h) * 3, Math.cos(h) * 3]];
  let spot = null;
  for (const [dx, dz] of tries) if (footable(car.pos.x + dx, car.pos.z + dz)) { spot = [car.pos.x + dx, car.pos.z + dz]; break; }
  if (!spot && !force) return toast('Yahan utar nahi sakte 😅');
  if (!spot) spot = [car.pos.x, car.pos.z];
  state.mode = 'foot';
  car.speed = 0;
  walker.pos.set(spot[0], 0, spot[1]);
  walker.heading = h;
  footYaw = h;
  scene.add(me.root);
  me.root.position.copy(walker.pos);
  me.root.rotation.set(0, h, 0);
  setAction(me, 'idle');
  if (state.weapon) { hold(me, itemMesh(state.weapon)); setOverlay(me, 'hold'); }
}
// gaadi ke dabbe ke kinare se doori — lambi gaadi ke aage/peeche khade ho ke bhi baith sakte ho
function edgeDist(v, x, z) {
  const dx = x - v.pos.x, dz = z - v.pos.z, h = v.heading || 0, c = Math.cos(h), s = Math.sin(h);
  const lx = Math.abs(dx * c - dz * s) - (v.radius || 1) * 1.05, lz = Math.abs(dx * s + dz * c) - (v.len || 3.4) / 2;
  return Math.hypot(Math.max(0, lx), Math.max(0, lz));
}
function nearestVehicle(pos, r = 1.8) {
  if (state.onRoof) return null;
  let best = null, bd = r;
  for (const v of [ownCar, ...traffic.vehicles]) {
    if (v.dead) continue;
    const d = edgeDist(v, pos.x, pos.z);
    if (d < bd) { bd = d; best = v; }
  }
  return best;
}
function enterRick(force = false) {
  const v = force ? car : nearestVehicle(walker.pos);
  if (!v) return toast(X().footOnly);
  if (state.seq && state.seq.type === 'salon') return;
  cancelSeq();
  if (v.driver) {
    // gaadi chheen li! 😈
    const d = v.driver;
    v.driver = null;
    v.ai = false;
    const sx = v.pos.x + Math.cos(v.heading) * 1.8, sz = v.pos.z - Math.sin(v.heading) * 1.8;
    const n = npcs.adoptWalker(d, sx, sz, walker.pos);
    setAction(d, 'idle');
    if (Math.random() < 0.5) n.angryPending = false;
    toast(fight('hijack'), 2600);
    noise(0.1, 0.2, 600);
    if (npcs.cops.some((c) => Math.hypot(c.x - v.pos.x, c.z - v.pos.z) < 35)) addWanted(1);
  }
  if (v.parked && !v.driver && v !== ownCar) toast('🔑 Khadi gaadi utha li! 😎', 1600);
  v.ai = false; v.parked = false;
  car = v;
  rick = v.g;
  state.mode = 'drive';
  rick.add(me.root);
  me.root.position.copy(v.seat);
  setOverlay(me, null);
  me.root.rotation.set(0, 0, 0);
  setAction(me, 'drive');
  hold(me, null);
  camYaw = 0;
}
function toggleRide() {
  if (state.cine || state.seq?.type === 'salon') return;
  if (state.mode === 'drive') {
    if (Math.abs(car.speed) > 3) return toast('Pehle rickshaw roko! 🛑');
    exitRick();
  } else enterRick();
}

// ---------- JHOLA (BAG) ----------
const DRINK = /chai|lassi|doodh|cola|shake|ras|shikanji|kulhad/i;
function guessMesh(it) {
  if (it.mesh) return it.mesh;
  const n = it.n;
  if (/jalebi|imarti/i.test(n)) return 'jalebi';
  if (/laddoo|prasad|golgappa/i.test(n)) return 'laddoo';
  if (/rasgulla/i.test(n)) return 'white';
  if (/jamun/i.test(n)) return 'brown';
  if (/kaju|biscuit|toffee/i.test(n)) return 'biscuit';
  if (/samosa|tikki|bhatura|litti|bun/i.test(n)) return 'samosa';
  if (/cola/i.test(n)) return 'bottle';
  if (DRINK.test(n)) return /shake|ras|shikanji/i.test(n) ? 'glass' : 'cup';
  if (/paan/i.test(n)) return 'paan';
  if (/kulfi/i.test(n)) return 'kulfi';
  if (/lolly/i.test(n)) return 'lolly';
  if (/sewai|bhalla|paneer|chole|chaat/i.test(n)) return 'plate';
  return 'laddoo';
}
function addToBag(it) {
  const ex = state.bag.find((b) => b.n === it.n);
  if (ex) ex.count++;
  else state.bag.push({ ...it, mesh: guessMesh(it), count: 1 });
}
function takeFromBag(entry) {
  entry.count--;
  if (entry.count <= 0) state.bag.splice(state.bag.indexOf(entry), 1);
}
function openBag() {
  if (state.cine || state.seq) return;
  const opts = state.bag.map((b) => ({ n: `${b.n} ×${b.count}`, d: b.kind === 'gift' ? 'Gift — propose mein kaam aayega' : b.kind ? 'Use karo' : 'Khao / piyo', on: () => { closeSheets(); useItem(b); } }));
  dialog({ kind: 'bag', avatar: '🎒', title: 'Jhola', sub: `₹${state.money} jeb mein`, line: state.bag.length ? 'Kya nikaalein?' : X().bagEmpty, options: opts });
}
function useItem(b) {
  if (state.mode !== 'foot') return toast(X().footOnly);
  if (state.seq) return;
  const t = state.t;
  if (b.kind === 'weapon') {
    state.weapon = state.weapon === b.mesh ? null : b.mesh;
    hold(me, state.weapon ? itemMesh(state.weapon) : null);
    setOverlay(me, state.weapon ? 'hold' : null);
    toast(state.weapon ? `${b.n} haath mein — J se maaro 💥` : 'Haath khaali', 1800);
    return;
  }
  if (b.kind === 'gift') { hold(me, itemMesh(b.mesh)); toast(`${b.n} haath mein 🎁`); return; }
  if (b.kind === 'ittar') { takeFromBag(b); state.ittarUntil = t + 300; flash('sugar'); toast(X().ittar); return; }
  if (b.kind === 'balloon') { takeFromBag(b); hold(me, itemMesh('balloon')); state.balloonUntil = t + 90; return; }
  if (b.kind === 'kite') {
    takeFromBag(b);
    state.seq = { type: 'kite', t: 0, dur: 18 };
    startKite();
    toast(X().kite);
    return;
  }
  takeFromBag(b);
  startEat(b);
}
function startEat(b) {
  const drink = DRINK.test(b.n);
  hold(me, itemMesh(b.mesh || guessMesh(b)));
  state.seq = { type: 'eat', t: 0, dur: 3.4, item: b, act: drink ? 'drink' : 'eat' };
  setOverlay(me, drink ? 'drink' : 'eat');
}
let kiteObj = null;
function startKite() {
  const kite = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ color: pick([0xff3d7f, 0xffd23f, 0x2ef2ff]), side: THREE.DoubleSide }));
  kite.rotation.z = Math.PI / 4;
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xffffff }));
  scene.add(kite, line);
  kiteObj = { kite, line };
}
function stopKite() { if (kiteObj) { scene.remove(kiteObj.kite, kiteObj.line); kiteObj = null; } }
function applyFx(fx, line) {
  const t = state.t;
  switch (fx) {
    case 'sugar': state.sugarUntil = t + 14; flash('sugar'); break;
    case 'turbo': state.turboUntil = t + 20; break;
    case 'fire': state.fireUntil = t + 4; flash('fire'); beep([180, 140, 110], 0.15, 'sawtooth', 0.05); break;
    default: break;
  }
  if (line) toast(line, 2200);
}

// ---------- SHOP ----------
let nearest = null, nearGirl = null;
function interact() {
  if (state.open || state.cine || state.seq) return;
  if (state.mode === 'foot' && nearGirl) return openGirl(nearGirl);
  if (!nearest) return;
  if (nearest.def.music) return openMusic({ tab: 'mp3' });
  if (nearest.lift) return toggleLift();
  if (nearest.story) return story.open();
  if (state.mode === 'drive') return toast(X().walkIn(nearest.def.name[L()]));
  openShop(nearest.def, nearest);
}
function shopGreeting(def) {
  const respectful = ['mandir', 'masjid', 'ghat'].includes(def.id);
  if (!respectful && state.level === 2 && Math.random() < 0.6) return pick(UI18[L()].shopGreet);
  return pick(state.level >= 1 && !respectful ? [...def.greet[L()], ...def.gaali[L()], ...def.gaali[L()]] : def.greet[L()]);
}
function openShop(def, trig) {
  dialog({ kind: 'shop', avatar: def.avatar, title: def.name[L()], sub: def.owner, line: shopGreeting(def), options: shopOptions(def, trig) });
  state.activeShop = def.id;
  beep([660, 880], 0.08, 'sine', 0.05);
}
function shopOptions(def, trig) {
  return def.items.map((it) => {
    const extra = it.fx === 'romance' ? (state.romance ? 'ON ✅' : 'OFF') : it.d || '';
    return { n: it.n, p: it.p, d: extra, on: () => buy(def, it, trig) };
  });
}
// Khareedte hi popup band; dukaandaar saaman pakdaata hai, tumhare haath mein dikhta hai
function shopReact(def, trig, line, { mesh, sub, cls = '' } = {}) {
  closeSheets();
  const kid = trig?.keeper?.id || def.id;
  const kp = npcs.giveItem(kid, mesh);
  const target = kp ? kp.h.root : { x: trig?.x ?? walker.pos.x, y: 0.4, z: trig?.z ?? walker.pos.z };
  if (line) ui3d.bubble(target, line, cls, bubDur(line));
  if (mesh && state.mode === 'foot') {
    setTimeout(() => {
      if (state.seq) return;
      hold(me, itemMesh(mesh));
      setOverlay(me, 'hold');
      setTimeout(() => { if (!state.seq) { hold(me, state.weapon ? itemMesh(state.weapon) : null); setOverlay(me, state.weapon ? 'hold' : null); } }, 2400);
    }, 650);
  }
  if (sub) toast(sub, 2400);
}
const BAGGABLE = (it) => it.kind === 'gift' || it.kind === 'kite' || it.kind === 'balloon' || it.kind === 'ittar' || (!it.kind && ['sugar', 'turbo', 'fire', 'full'].includes(it.fx));
function buy(def, it, trig) {
  if (it.p > state.money) {
    say(state.level === 2 ? UI18[L()].noMoney : ui('noMoney'));
    return;
  }
  if (it.p) { setMoney(state.money - it.p); coinSfx(); }
  const t = state.t, Lg = L();
  let line = it.say ? it.say[Lg] : '';
  if (it.kind === 'gun') {
    const g = GUNS[it.gun];
    if (g.lv && missions.level() < g.lv) { setMoney(state.money + it.p); say(`🎯 Sniper ke liye Respect Lv ${g.lv} chahiye (abhi Lv ${missions.level()})`); return; }
    weapons.give(it.gun, g.ammo);
    weapons.equip(it.gun);
    state.weapon = null;
    shopReact(def, trig, line || 'Le bhai, sambhal ke chalana 😎', { sub: `${g.n} mil gaya! Right-click / 🎯 = nishana, Click / J / 🔫 = goli. 1-2-3 se badlo` });
    return;
  }
  if (it.kind === 'ammo') {
    if (!weapons.cur) { setMoney(state.money + it.p); say('Pehle bandook to haath mein lo! (1/2/3)'); return; }
    weapons.give(weapons.cur, Math.ceil(GUNS[weapons.cur].ammo / 2));
    shopReact(def, trig, 'Ye lo goli 📦', { sub: `📦 Goli bhar di — ${weapons.ammo()} goli` });
    return;
  }
  if (it.kind === 'weapon') {
    addToBag(it);
    state.weapon = it.mesh;
    hold(me, itemMesh(it.mesh));
    setOverlay(me, 'hold');
    shopReact(def, trig, line || 'Le lo 💥', { sub: `${it.n} haath mein! J (ya 👊) se maaro 💥` });
    return;
  }
  if (!it.kind && ['sugar', 'turbo', 'fire', 'full'].includes(it.fx) && state.mode === 'foot') {
    // khareeda → dukaandaar haath mein deta hai → turant khaana shuru 😋
    const mesh = guessMesh(it);
    shopReact(def, trig, line || pick(GENERIC[Lg]), { mesh: null });
    npcs.giveItem(trig?.keeper?.id || def.id, mesh);
    if (state.seq?.type === 'eat') { addToBag(it); toast(X().added(it.n)); return; }
    cancelSeq();
    setTimeout(() => { if (!state.seq && state.mode === 'foot') startEat({ ...it, mesh }); else addToBag(it); }, 600);
    toast(`${it.n} mila — chalte chalte khao 😋  (-₹${it.p})`, 1800);
    return;
  }
  if (BAGGABLE(it)) {
    addToBag(it);
    shopReact(def, trig, line || pick(GENERIC[Lg]), { mesh: it.mesh || guessMesh(it), sub: X().added(it.n) + ' — 🎒 (B) se nikaalo' });
    return;
  }
  if (it.kind === 'shirt') { me.spec.top = it.color; me.spec.outfit = it.outfit || 'shirt'; me.rebuild(); state.styleAt = t; shopReact(def, trig, X().shirt, { sub: `👕 ${it.n} pehen liya` }); flash('sugar'); return; }
  if (it.kind === 'shades') { me.spec.shades = true; me.rebuild(); state.styleAt = t; shopReact(def, trig, X().shades, { sub: '😎 Chashma laga liya' }); return; }
  switch (it.fx) {
    case 'hair': case 'beard': case 'champi': case 'facial':
      if (trig?.keeper?.chair) return startSalon(it, trig.keeper);
      break;
    case 'call': ringSfx(); line = pick(CALLS[Lg][it.calls]); break;
    case 'retro': setRetro(!state.retro); line = state.retro ? '📼 VHS mode ON — 1994 mein swagat hai!' : '📺 VHS mode OFF'; break;
    case 'dogfood': { const d = animals.nearestDog(walker.pos); state.dogFriend = d; state.dogFriendUntil = t + 120; line = UI[Lg].dogFriend; barkSfx(); break; }
    case 'catfood': state.catUntil = t + 120; line = UI[Lg].catFriend; meowSfx(); break;
    case 'bell': bellSfx(); places.ringBells(); break;
    case 'aarti': places.aarti(t); bellSfx(); bellSfx(0.9); bellSfx(1.8); flash('aarti'); break;
    case 'wish': line = pick(WISHES[Lg]); break;
    case 'eid': flash('love'); break;
    case 'kiss': startKiss(); return;
    case 'show': {
      hotel.startShow(t, 45);
      if (!music.playing) musicUI.autoPlay(pick(['bollywood item song', 'bollywood remix', 'bhojpuri dj']));
      runScene(showScene());
      return;
    }
    case 'dinner': case 'coupledance': {
      const gf = npcs.girls().find((g) => g.girl.gf);
      if (!gf) { setMoney(state.money + it.p); say(SCENES[Lg].needGf); return; }
      runScene(it.fx === 'dinner' ? dinnerScene(gf) : danceScene(gf));
      return;
    }
    case 'notes':
      if (!hotel.isShowing(t)) { setMoney(state.money + it.p); say(BAR[Lg].noShow); return; }
      closeSheets();
      setOverlay(me, 'swing');
      setTimeout(() => setOverlay(me, state.weapon ? 'hold' : null), 450);
      hotel.spawnNotes(walker.pos, 36);
      noise(0.3, 0.15, 2500);
      toast(pick(BAR[Lg].notes), 2200);
      return;
    case 'drunk':
      closeSheets();
      state.drunkUntil = Math.max(state.drunkUntil || 0, t) + (/tharra/i.test(it.n) ? 45 : 30);
      startEat({ ...it, fx: null, mesh: it.mesh });
      toast(pick(BAR[Lg].drunk), 2500);
      return;
    case 'room':
      closeSheets();
      flash('love');
      state.realTime = false;
      state.tod = 7 / 24;
      state.turboUntil = t + 60;
      toast(SCENES[Lg].room, 3500);
      return;
    case 'diya': world.releaseDiyas(10); break;
    case 'shayari': shopReact(def, trig, pick(SHAYARI[Lg]), { cls: 'love' }); flash('love'); return;
    case 'fortune': line = pick(FORTUNES[Lg]); break;
    case 'loveyog': {
      const gs = npcs.girls().filter((g) => !g.girl.gf);
      const g = pick(gs);
      g.girl.affinity += 0.45;
      line = X().loveyog(g.girl.name);
      break;
    }
    case 'polish': state.polishAt = t; line = X().polish; break;
    case 'romance':
      state.romance = !state.romance;
      if (state.romance) flash('love');
      shopReact(def, trig, line, { sub: state.romance ? UI[Lg].romanceOn : UI[Lg].romanceOff });
      return;
    case 'music':
      if (line) toast(line);
      openMusic({ tab: it.tab, q: it.q, bpm: it.bpm });
      return;
    default: break;
  }
  const foodish = !it.kind && !['call', 'retro', 'bell', 'aarti', 'wish', 'diya', 'fortune', 'loveyog', 'polish', 'dogfood', 'catfood', 'eid'].includes(it.fx);
  shopReact(def, trig, line || pick(GENERIC[Lg]), { mesh: foodish ? guessMesh(it) : it.fx === 'dogfood' || it.fx === 'catfood' ? 'biscuit' : null, sub: it.p ? UI[Lg].bought(it.n, it.p) : '' });
}

// ---------- SALON ✂️ ----------
function startSalon(it, keeper) {
  closeSheets();
  state.seq = { type: 'salon', t: 0, dur: it.fx === 'champi' ? 5 : 4.5, it, keeper, snip: 0 };
  walker.pos.set(keeper.chair.x, 0, keeper.chair.z);
  walker.heading = keeper.chairHeading;
  footYaw = keeper.chairHeading + 0.6;
  hold(me, null);
  npcs.salon(true, keeper);
  toast(X().salonSit, 2000);
}
function finishSalon(s) {
  const it = s.it, t = state.t;
  if (it.fx === 'hair') { me.spec.hairStyle = it.hair === 'normal' ? 'short' : it.hair; if (it.color) me.spec.hair = it.color; else me.spec.hair = 0x111111; me.rebuild(); state.haircutAt = t; }
  if (it.fx === 'beard') { me.spec.beard = it.beard; me.rebuild(); state.haircutAt = t; }
  if (it.fx === 'facial') { state.facialAt = t; flash('sugar'); }
  if (it.fx === 'champi') state.champiUntil = t + 4;
  npcs.salon(false);
  const k = s.keeper;
  walker.pos.set(k.chair.x, 0, k.chair.z);
  // kursi se utar ke saamne
  const fx = -Math.sin(k.chairHeading + Math.PI), fz = -Math.cos(k.chairHeading + Math.PI);
  if (footable(k.chair.x + fx * 1.5, k.chair.z + fz * 1.5)) walker.pos.set(k.chair.x + fx * 1.5, 0, k.chair.z + fz * 1.5);
  toast(it.say ? it.say[L()] : X().facial, 3000);
}

// ---------- LADKI SE BAAT 💬 ----------
function bestGift() { return state.bag.filter((b) => b.kind === 'gift').sort((a, b) => b.gift - a.gift)[0]; }
function girlLine(key) {
  if (key === 'no') return gaali('girlNo') || pick(GIRL[L()].no);
  if (key === 'slap') return gaali('girlSlap') || pick(GIRL[L()].slap);
  return pick(GIRL[L()][key]);
}
// Popup turant band — jawab duniya mein bubble ban ke dikhe, action aankhon ke saamne ho
const bubDur = (txt) => Math.min(7, Math.max(2.8, (txt || '').length / 13));
function meSay(text, cls = '') { ui3d.bubble(me.root, text, cls, bubDur(text)); }
function girlReact(n, text, { cls = '', act = 'talk', sub } = {}) {
  const dur = bubDur(text);
  ui3d.bubble(n.h.root, text, cls, dur);
  if (!n.girl.gf) { n.pause = dur + 0.5; n.pauseAct = act; n.faceTo = { x: walker.pos.x, z: walker.pos.z }; }
  if (sub) toast(sub, 2600);
}
function handOver(n, mesh, after = 900) {
  hold(me, itemMesh(mesh));
  setOverlay(me, 'hold');
  setTimeout(() => {
    hold(me, state.weapon ? itemMesh(state.weapon) : null);
    setOverlay(me, state.weapon ? 'hold' : null);
    hold(n.h, itemMesh(mesh));
    setTimeout(() => hold(n.h, null), 2600);
  }, after);
}
function openGirl(n) {
  const g = n.girl;
  const opts = g.gf ? [
    { n: '💞 Saath chalo', d: 'Tumhare peeche peeche', on: () => { closeSheets(); meSay('Chalo mere saath 😊'); setTimeout(() => girlReact(n, GIRL[L()].already, { cls: 'love' }), 700); } },
    { n: '🤗 Jhappi (hug)', on: () => runScene(hugScene(n)) },
    { n: '🌙 Ghat pe chalo', d: 'Filmy shaam', on: () => { closeSheets(); goGhatWith(n); } },
    { n: '🏨 Hotel date', d: 'Dinner / Dance', on: () => { closeSheets(); teleport({ x: hotel.center.x - 4, z: hotel.center.z + 4, h: 0 }); n.x = walker.pos.x + 1; n.z = walker.pos.z; toast('🏨 Hotel Raj Palace — Manager se dinner book karo 🕯️', 3000); } },
    { n: '🎁 Gift do', on: () => giveGift(n) },
    { n: '💔 Breakup', cls: 'danger', on: () => { closeSheets(); g.gf = false; g.affinity = 0; g.rejected = 2; girlReact(n, 'Theek hai, jao! 😭💔', { cls: 'loud', act: 'point' }); } },
    { n: '👋 Bye', on: () => closeSheets() },
  ] : [
    { n: '🌹 Propose karo', cls: 'good', d: bestGift() ? `${bestGift().n} ke saath` : 'Bina gift ke…', on: () => propose(n) },
    { n: '🎁 Gift do', on: () => giveGift(n) },
    { n: '😏 Line maaro', on: () => pickup(n) },
    { n: '😘 Seeti maaro / chhedo', cls: 'danger', d: 'Galat baat — anjaam bhugtoge', on: () => tease(n) },
    { n: '👋 Bye', on: () => closeSheets() },
  ];
  dialog({ kind: 'girl', avatar: g.gf ? '💞' : '👩', title: g.name, sub: g.gf ? 'Tumhari girlfriend' : `Mohalle ki ${g.name}`, line: g.slapped > 0 ? '…phir aa gaye? 😒' : pick(GIRL[L()].hello), options: opts });
  n.talking = true;
  state.talkGirl = n;
}
function giveGift(n) {
  const gft = bestGift();
  if (!gft) return say(GIRL[L()].noGift, '🌹 Bazaar gali mein Phool wala / Chudi bhandar');
  closeSheets();
  takeFromBag(gft);
  n.girl.affinity += gft.gift * 0.1;
  meSay(`Ye tumhare liye… ${gft.n} 🎁`);
  handOver(n, gft.mesh);
  setTimeout(() => girlReact(n, pick(GIRL[L()].gift), { cls: 'love', sub: `💗 ${n.girl.name} ko ${gft.n} pasand aaya (+pasand)` }), 1200);
}
function propose(n) {
  const g = n.girl, t = state.t;
  closeSheets();
  meSay('🌹 Kya tum meri girlfriend banogi?', 'love');
  if (g.rejected >= 2 || g.slapped > 0) { setTimeout(() => slap(n), 900); return; }
  let score = 0.12 + g.affinity;
  const gft = bestGift();
  let usedGift = '';
  if (gft) { takeFromBag(gft); score += gft.gift * 0.13; usedGift = gft.n; handOver(n, gft.mesh, 700); }
  if (t - state.haircutAt < 300) score += 0.12;
  if (t < state.ittarUntil) score += 0.12;
  if (me.spec.shades) score += 0.05;
  if (t - state.styleAt < 600) score += 0.08;
  if (t - state.polishAt < 600) score += 0.04;
  if (t - state.facialAt < 600) score += 0.06;
  score -= g.rejected * 0.12;
  const tips = [];
  if (!gft) tips.push('gulab/chudi');
  if (t - state.haircutAt >= 300) tips.push('haircut');
  if (t >= state.ittarUntil) tips.push('ittar');
  const yes = Math.random() < score;
  setTimeout(() => {
    if (yes) {
      for (const o of npcs.girls()) if (o.girl.gf && o !== n) o.girl.gf = false;
      g.gf = true;
      girlReact(n, girlLine('yes'), { cls: 'love' });
      flash('love');
      glide(800, 1600, 0.4, 'sine', 0.05);
      toast(X().gfFollow(g.name) + (usedGift ? ` • 🎁 ${usedGift}` : ''), 3200);
      state.romance = true;
    } else {
      g.rejected++;
      girlReact(n, girlLine('no'), { cls: 'loud', act: 'point', sub: tips.length ? `💡 Tip: ${tips.join(', ')} se chance badhega 😉` : '' });
    }
  }, 1300);
}
function pickup(n) {
  const g = n.girl, r = Math.random();
  closeSheets();
  meSay(`"${pick(PICKUP[L()])}"`);
  setTimeout(() => {
    if (r < 0.25 + g.affinity * 0.3) { g.affinity += 0.08; girlReact(n, pick(GIRL[L()].laugh), { cls: 'love' }); }
    else if (r < 0.88) { g.rejected += 0.5; girlReact(n, girlLine('no'), { cls: 'loud', act: 'point' }); }
    else slap(n);
  }, 1100);
}
function whistleSfx() { glide(1800, 2600, 0.18, 'sine', 0.06); glide(2600, 1500, 0.35, 'sine', 0.06, 0.22); }
function tease(n) {
  closeSheets();
  whistleSfx();
  meSay('😗🎶 Wheeew-wheew!');
  setTimeout(() => slap(n), 700);
  addWanted(1);
  setTimeout(() => toast(POLICE[L()].tease, 2600), 2000);
}
function slap(n) {
  const g = n.girl;
  closeSheets();
  g.slapped++;
  g.gf = false;
  // wo chal ke paas aati hai aur chaata maarti hai
  n.heading = headingTo(walker.pos.x - n.x, walker.pos.z - n.z);
  setAction(n.h, 'slap');
  n.slapT = 1.4;
  n.pause = 0;
  setTimeout(() => {
    slapSfx();
    flash('slap');
    state.stunUntil = state.t + 1.0;
    state.hurtUntil = state.t + 0.5;
    me.look = 1.1;
    // jhatka — thoda peeche khisko
    const kx = walker.pos.x - n.x, kz = walker.pos.z - n.z, kd = Math.hypot(kx, kz) || 1;
    const nx = walker.pos.x + (kx / kd) * 0.7, nz = walker.pos.z + (kz / kd) * 0.7;
    if (!footBlocked(nx, nz)) walker.pos.set(nx, 0, nz);
    ui3d.bubble(n.h.root, '👋💥 ' + girlLine('slap'), 'loud', 3.2);
    toast('👋 CHATAAAK!', 1500);
  }, 450);
  setTimeout(() => { n.pause = 2.5; n.pauseAct = 'point'; n.faceTo = { x: walker.pos.x, z: walker.pos.z }; }, 1500);
}
function goGhatWith(n) {
  walker.pos.set(2, 0, -108);
  walker.heading = 0;
  footYaw = 0;
  n.x = 3.2; n.z = -107.5;
  state.realTime = false;
  state.tod = 20.3 / 24;
  state.romance = true;
  snapCam = true;
  flash('love');
  toast(`🌙 ${n.girl.name} ke saath Prem Ghat pe…`, 3000);
}

// ---------- POLICE 🚨 ----------
function addWanted(k) {
  state.wanted = Math.min(3, state.wanted + k);
  state.wantedQuiet = 0;
  if (k > 0 && state.wanted >= 1) toast(POLICE[L()].siren, 2000);
}
function openCaught() {
  const P = POLICE[L()];
  state.caughtCd = state.t + 6;
  player.speedKill();
  dialog({
    kind: 'police', avatar: '👮', title: 'Police!', sub: `Wanted: ${'⭐'.repeat(state.wanted)}`,
    line: gaali('police') || pick(P.caught),
    options: [
      { n: '💸 Challan bharo', p: 100, on: () => { setMoney(state.money - 100); state.wanted = 0; say(P.paid); setTimeout(closeSheets, 1400); } },
      { n: '🤫 Rishwat do', p: 50, d: '50-50 chance', cls: 'danger', on: () => {
        if (Math.random() < 0.5) { setMoney(state.money - 50); state.wanted = 0; say(P.bribeOk); }
        else { setMoney(state.money - 200); state.wanted = 0; say(P.bribeNo); }
        setTimeout(closeSheets, 1600);
      } },
      { n: '🏃 Haath chhuda ke bhaago!', cls: 'danger', on: () => { state.escapeUntil = state.t + 3.5; closeSheets(); toast(P.run); } },
    ],
  });
}
const eyeLock = createEyeLock({
  camera,
  onStart: () => { bellSfx(); glide(520, 780, 1.6, 'sine', 0.05, 0.2); flash('love'); },
});
const player = { speedKill() { car.speed = 0; walker.speed = 0; } };

// ---------- RETRO ----------
function setRetro(on) {
  state.retro = on;
  $('btnRetro').classList.toggle('on', on);
  $('vhs').classList.toggle('hidden', !on);
}
$('btnRetro').onclick = () => { state.cineFx = !state.cineFx; $('btnRetro').classList.toggle('on', state.cineFx); toast(state.cineFx ? '🎬 Cinematic look ON' : '🎬 Cinematic look OFF'); };

// ---------- ROMANTIC / SHOW SCENES 🎬 ----------
function runScene(sc) {
  closeSheets();
  cancelSeq();
  state.open = 'cine';
  state.scene = { ...sc, start: performance.now(), sub: -1, shot: null };
  $('cine').classList.remove('hidden');
  $('prompt').classList.add('hidden');
  $('mAct').classList.add('hidden');
  sc.setup();
}
function endScene() {
  const s = state.scene;
  if (!s) return;
  s.end();
  state.scene = null;
  state.open = null;
  state.realTime = state.rtPref;
  $('cine').classList.add('hidden');
  $('cineSub').textContent = '';
  snapCam = true;
}
const camPos = new THREE.Vector3(), camAim = new THREE.Vector3();
function updateScene(dt) {
  const s = state.scene;
  const T = (performance.now() - s.start) / 1000;
  s.update(T, dt);
  s.cam(T, camPos, camAim);
  if (!s.shot) { camera.position.copy(camPos); camLook.copy(camAim); s.shot = 1; }
  camera.position.lerp(camPos, 1 - Math.exp(-dt * 2.5));
  camLook.lerp(camAim, 1 - Math.exp(-dt * 3));
  camera.lookAt(camLook);
  const lines = s.lines;
  const idx = Math.min(lines.length - 1, Math.floor((T / s.dur) * lines.length));
  if (idx !== s.sub) { s.sub = idx; $('cineSub').textContent = lines[idx]; }
  if (T >= s.dur) endScene();
}
function nightify() { const h = state.tod * 24; if (h > 6 && h < 18.5) { state.realTime = false; state.tod = 20.4 / 24; } state.romance = true; }
function placeHuman(h, x, z, heading, act, y = 0) { h.root.position.set(x, y, z); h.root.rotation.set(0, heading, 0); setAction(h, act); }
function dinnerScene(gf) {
  const tb = hotel.tables[0];
  const pX = tb.x + 1.05, gX = tb.x - 1.05, z = tb.z;
  return {
    dur: 15, lines: SCENES[L()].dinner, kissed: false,
    setup() {
      nightify();
      gf.scene = true;
      walker.pos.set(pX, 0, z); walker.heading = Math.PI / 2;
      placeHuman(me, pX, z, Math.PI / 2, 'sit');
      placeHuman(gf.h, gX, z, -Math.PI / 2, 'sit');
      hold(me, null);
    },
    update(T) {
      const s = state.scene;
      setOverlay(me, T > 7 && T < 11 ? 'hold' : null);
      setOverlay(gf.h, T > 7 && T < 11 ? 'hold' : null);
      if (T > 3 && T < 6) gf.h.look = Math.sin(T * 3) * 0.2;
      if (T >= 11.5) {
        placeHuman(me, tb.x + 0.28, z + 1.0, Math.PI / 2, 'hug');
        placeHuman(gf.h, tb.x - 0.28, z + 1.0, -Math.PI / 2, 'hug');
        if (!s.kissed) { s.kissed = true; flash('love'); glide(1200, 1800, 0.5, 'sine', 0.04); }
      }
    },
    cam(T, p, a) {
      if (T < 11.5) {
        const ang = 0.6 + T * 0.09;
        p.set(tb.x + Math.cos(ang) * 3.4, 1.7, z + Math.sin(ang) * 3.4);
        a.set(tb.x, 1.05, z);
      } else { p.set(tb.x + 0.2, 1.65, z + 3.1); a.set(tb.x, 1.4, z + 1.0); }
    },
    end() {
      setOverlay(me, null); setOverlay(gf.h, null);
      gf.scene = false;
      walker.pos.set(tb.x + 0.6, 0, z + 1.9); walker.heading = 0;
      gf.x = tb.x - 0.6; gf.z = z + 1.9;
      setAction(me, 'idle');
    },
  };
}
function danceScene(gf) {
  const F = hotel.floor;
  return {
    dur: 17, lines: SCENES[L()].dance, flashed: false,
    setup() {
      nightify();
      gf.scene = true;
      if (!music.playing) musicUI.autoPlay(pick(['hindi romantic', 'bollywood love song', 'romantic hindi']));
      walker.pos.set(F.x + 0.6, 0, F.z); walker.heading = Math.PI / 2;
      placeHuman(me, F.x + 0.6, F.z, Math.PI / 2, 'dance', 0.08);
      placeHuman(gf.h, F.x - 0.6, F.z, -Math.PI / 2, 'dance', 0.08);
      gf.h.phase = me.phase;
    },
    update(T) {
      const s = state.scene;
      const slow = T > 11;
      setAction(me, slow ? 'hug' : 'dance');
      setAction(gf.h, slow ? 'hug' : 'dance');
      const d = slow ? 0.27 : 0.6;
      const sway = Math.sin(T * 1.2) * 0.25;
      const ca = Math.cos(sway), sa = Math.sin(sway);
      me.root.position.set(F.x + d * ca, 0.08, F.z + d * sa);
      gf.h.root.position.set(F.x - d * ca, 0.08, F.z - d * sa);
      me.root.rotation.y = Math.PI / 2 - sway;
      gf.h.root.rotation.y = -Math.PI / 2 - sway;
      if (slow && !s.flashed) { s.flashed = true; flash('love'); }
    },
    cam(T, p, a) {
      const ang = T * 0.35;
      const r = T > 11 ? 3 : 5;
      p.set(F.x + Math.cos(ang) * r, T > 11 ? 1.7 : 2.6, F.z + Math.sin(ang) * r);
      a.set(F.x, 1.2, F.z);
    },
    end() { gf.scene = false; walker.pos.set(F.x + 0.8, 0, F.z); gf.x = F.x - 0.8; gf.z = F.z; setAction(me, 'idle'); },
  };
}
function hugScene(gf) {
  const x = walker.pos.x, z = walker.pos.z, h = walker.heading;
  const fx = -Math.sin(h), fz = -Math.cos(h);
  return {
    dur: 5, lines: SCENES[L()].hug,
    setup() {
      gf.scene = true;
      placeHuman(me, x, z, h, 'hug', heightAt(x, z));
      placeHuman(gf.h, x + fx * 0.52, z + fz * 0.52, h + Math.PI, 'hug', heightAt(x, z));
      flash('love');
      glide(900, 1500, 0.4, 'sine', 0.04);
      gf.girl.affinity += 0.1;
    },
    update() {},
    cam(T, p, a) {
      const rx = Math.cos(h), rz = -Math.sin(h);
      p.set(x + rx * 2.6 + fx * 0.3, 1.7, z + rz * 2.6 + fz * 0.3);
      a.set(x + fx * 0.26, 1.45, z + fz * 0.26);
    },
    end() { gf.scene = false; gf.x = x + Math.cos(h) * 0.9; gf.z = z - Math.sin(h) * 0.9; setAction(me, 'idle'); },
  };
}
function showScene() {
  const F = hotel.floor;
  return {
    dur: 8, lines: SCENES[L()].show,
    setup() { nightify(); state.romance = false; },
    update() {},
    cam(T, p, a) { p.set(F.x + Math.sin(T * 0.3) * 5, 2.6, F.z + 6.5 - T * 0.4); a.set(F.x, 1.7, 110.4); },
    end() {},
  };
}

// ---------- FILMY KISS SCENE 🎬 ----------
const sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const CINE_LEN = 14;
const shotPos = new THREE.Vector3(), shotLook = new THREE.Vector3();
function startKiss() {
  closeSheets();
  state.open = 'cine';
  state.cine = { t: 0, start: performance.now(), sub: -1, shot: '', chimed: false };
  car.speed = 0;
  state.romance = true;
  const h = state.tod * 24;
  if (h > 5 && h < 18.5) { state.realTime = false; state.tod = 20.5 / 24; }
  $('cine').classList.remove('hidden');
  $('prompt').classList.add('hidden');
  $('mAct').classList.add('hidden');
}
function endCine() {
  state.cine = null;
  state.open = null;
  state.realTime = state.rtPref;
  couple.setK(0);
  $('cine').classList.add('hidden');
  $('cineSub').textContent = '';
  snapCam = true;
}
$('cineSkip').onclick = () => (state.scene ? endScene() : endCine());
function updateCine(dt) {
  const c = state.cine;
  c.t = (performance.now() - c.start) / 1000;
  const T = c.t, C = couple.C, F = couple.F;
  const shot = T < 7 ? 'a' : T < 10 ? 'f' : 'b';
  if (shot === 'f') {
    shotPos.set(F.x + 0.9, F.y + 1.6, F.z - 1.5);
    shotLook.set(F.x, F.y + 1.2, F.z);
    couple.setFlowers(0.55 + 0.45 * Math.sin((T - 7) * 5));
  } else {
    const push = shot === 'a' ? sm(0, 7, T) : 1;
    shotPos.set(C.x + 2.2 - 0.9 * push, C.y + 1.4 - 0.35 * push, C.z - 3.4 + 1.5 * push);
    shotLook.set(C.x, C.y + 0.88, C.z);
    if (shot === 'a') couple.setK(sm(2.2, 4.8, T));
    else couple.setK(1 - sm(10, 11.5, T), sm(10.5, 12, T));
  }
  if (shot !== c.shot) { camera.position.copy(shotPos); camLook.copy(shotLook); c.shot = shot; }
  camera.position.lerp(shotPos, 1 - Math.exp(-dt * 3));
  camLook.lerp(shotLook, 1 - Math.exp(-dt * 3));
  camera.lookAt(camLook);
  if (T > 4.8 && !c.chimed) { c.chimed = true; flash('love'); glide(1200, 1800, 0.5, 'sine', 0.04); glide(1500, 2200, 0.6, 'sine', 0.03, 0.3); }
  const sub = T < 2.5 ? 0 : T < 7 ? 1 : T < 10 ? 2 : 3;
  if (sub !== c.sub) { c.sub = sub; $('cineSub').textContent = KISS_LINES[L()][sub]; }
  if (T >= CINE_LEN) endCine();
}

// ---------- KAAM-DHANDA 💼 ----------
const WITNESS = {
  n: ['Arre! Accident ho gaya!', 'Koi ambulance bulao!', 'Dekh ke chalao bhai!', 'Rickshaw wale, ruk!'],
  x: ['Abe bhosdike, maar diya bechare ko!', 'Pakdo is chutiye ko!', 'Madarchod, andha hai kya?!'],
};
function openJobs() {
  if (state.cine || state.scene) return;
  const a = missions.active;
  dialog({
    kind: 'jobs', avatar: '💼', title: 'Kaam-Dhanda', sub: `🏅 Respect Lv ${missions.level()} • ${missions.respect()} pts`,
    line: a ? 'Ek kaam chal raha hai — naya shuru karoge to purana cancel hoga.' : 'Paisa kamao, respect badhao! Kya karna hai?',
    options: missions.jobs().map((j) => ({ n: j.n, d: j.d, on: () => { closeSheets(); missions.start(j.id); } })),
  });
}
function roadPoint(x, z) {
  for (let r = 0; r < 40; r += 2) for (let a = 0; a < 12; a++) {
    const px = x + Math.cos(a * 0.52) * r, pz = z + Math.sin(a * 0.52) * r;
    if (driveable(px, pz)) return { x: px, z: pz };
  }
  return { x, z };
}

// ---------- OBJECTIVE ARROW 🧭 (GTA jaisa) ----------
const objV = new THREE.Vector3();
function updateObjective(pos) {
  let m = null, isStory = false;
  if (story.active) { m = story.marker(); isStory = true; }
  else if (missions.active) m = missions.marker();
  else if (story.marker()) { m = story.marker(); isStory = true; } // mission dene wala 🅼
  const arrow = $('objArrow'), pill = $('objPill');
  if (!m || state.open || state.scene || state.cine) { arrow.classList.add('hidden'); pill.classList.add('hidden'); return; }
  const dist = Math.round(Math.hypot(m.x - pos.x, m.z - pos.z));
  objV.set(m.x, 1.6, m.z).project(camera);
  const behind = objV.z > 1;
  let nx = objV.x, ny = objV.y;
  if (behind) { nx = -nx; ny = -ny; }
  const onScreen = !behind && Math.abs(objV.x) < 0.92 && Math.abs(objV.y) < 0.92;
  const cx = (nx * 0.5 + 0.5) * innerWidth, cy = (1 - (ny * 0.5 + 0.5)) * innerHeight;
  if (onScreen) {
    arrow.classList.add('hidden');
    pill.classList.remove('hidden');
    pill.classList.toggle('story', isStory);
    pill.textContent = `${isStory ? '🅼' : '🎯'} ${dist}m`;
    pill.style.transform = `translate(${Math.max(40, Math.min(innerWidth - 40, cx))}px, ${Math.max(70, Math.min(innerHeight - 20, cy))}px) translate(-50%, -140%)`;
  } else {
    pill.classList.add('hidden');
    arrow.classList.remove('hidden');
    arrow.classList.toggle('story', isStory);
    // screen ke kinare clamp
    const mx = innerWidth / 2, my = innerHeight / 2, mgn = 54;
    let dx = cx - mx, dy = cy - my;
    const sc = Math.min((mx - mgn) / (Math.abs(dx) || 1), (my - mgn) / (Math.abs(dy) || 1));
    const ex = mx + dx * sc, ey = my + dy * sc;
    arrow.style.transform = `translate(${ex}px, ${ey}px) translate(-50%, -50%) rotate(${Math.atan2(dy, dx)}rad)`;
  }
}

// ---------- BANDOOK 🔫 ----------
let aimToggle = false, autoSaveT = 15, saveData = null;
function startAim() {
  if (!weapons.cur || state.mode !== 'foot' || state.open || state.seq?.type === 'salon') { if (!weapons.cur) toast('Pehle bandook lo — 🔫 Kallu Kattewala (Park) ya 1/2/3', 1800); return; }
  aimYaw = walker.heading; aimPitch = state.onRoof ? -0.12 : 0;
  weapons.setAim(true);
}
function stopAim() { weapons.setAim(false); footYaw = aimYaw; snapCam = true; }
function shoot() {
  if (!weapons.cur || state.mode !== 'foot' || state.open) return;
  const dir = new THREE.Vector3();
  if (weapons.aiming) camera.getWorldDirection(dir);
  else dir.set(-Math.sin(walker.heading), 0, -Math.cos(walker.heading));
  weapons.fire(dir);
  if (weapons.aiming && weapons.cur !== 'sniper') { aimPitch += 0.03; }
}
function equipSlot(code) {
  if (state.mode !== 'foot' || state.seq) return;
  const id = { Digit1: 'katta', Digit2: 'dunali', Digit3: 'sniper', Digit0: null }[code];
  if (id && weapons.owned[id] === undefined) return toast(`${GUNS[id].n} nahi hai — Kallu se khareedo`, 1600);
  if (weapons.aiming) stopAim();
  weapons.equip(id);
  if (id) { state.weapon = null; toast(`${GUNS[id].n} • ${weapons.ammo()} goli`, 1200); }
}
function cycleGun() {
  const list = ['katta', 'dunali', 'sniper'].filter((g) => weapons.owned[g] !== undefined);
  if (!list.length) return toast('Bandook nahi hai — Kallu Kattewala (Park) 🔫', 1800);
  const i = list.indexOf(weapons.cur);
  const nxt = i + 1 >= list.length ? null : list[i + 1];
  equipSlot(nxt ? { katta: 'Digit1', dunali: 'Digit2', sniper: 'Digit3' }[nxt] : 'Digit0');
}
function gunSfx(k, vol = 1) {
  if (k === 'empty') return beep([300], 0.05, 'square', 0.03);
  const big = k === 'dunali' ? 1.4 : k === 'sniper' ? 1.6 : 1;
  noise(0.18 * big, 0.55 * vol * big, k === 'sniper' ? 300 : 600);
  glide(160 / big, 50, 0.2, 'triangle', 0.09 * vol);
}
function onShot(o) {
  const t = state.t;
  const screamers = npcs.panic(walker.pos, 40);
  for (const n of screamers) ui3d.bubble(n.h.root, pick(MISC3[L()].scream), 'loud', 2);
  if (t - lastShotWanted > 3 && npcs.cops.some((c) => Math.hypot(c.x - walker.pos.x, c.z - walker.pos.z) < 70)) { lastShotWanted = t; addWanted(1); }
}
function onHitNpc(n) {
  npcs.shootNpc(n, walker.pos);
  noise(0.08, 0.3, 200);
  if (n.cop) addWanted(2);
  else if (npcs.cops.some((c) => Math.hypot(c.x - n.x, c.z - n.z) < 70)) addWanted(1);
}
function hurt(n) {
  if (state.open === 'dead') return;
  state.hp -= n;
  lastHurt = state.t;
  flash('slap');
  state.hurtUntil = state.t + 0.3;
  if (state.hp <= 0) behosh();
}
function behosh() { wasted(); }

// ---------- 💀 WASTED / 🚔 BUSTED / ❤️ LIFELINE (GTA style) ----------
const MAX_LIVES = 3;
function updateLivesHud() {
  const el = $('lives');
  if (!el) return;
  el.textContent = '❤️'.repeat(state.lives) + '🖤'.repeat(Math.max(0, MAX_LIVES - state.lives));
}
function deathScreen(kind, title, sub, after) {
  if (state.open === 'dead') return;
  cancelSeq();
  closeSheets();
  if (weapons.aiming) stopAim();
  if (state.scene) endScene();
  state.open = 'dead';
  if (state.mode === 'drive') exitRick(true);
  state.pose = kind === 'wasted' ? 'fall' : 'hands';
  if (kind === 'wasted') me.root.rotation.x = -Math.PI / 2;
  const el = $('deathScreen');
  el.className = 'death ' + kind;
  $('deathTitle').textContent = title;
  $('deathSub').textContent = sub;
  document.body.classList.add('dead');
  if (kind === 'wasted') { glide(300, 60, 1.2, 'sawtooth', 0.08); noise(0.4, 0.3, 150); }
  else { sirenSfx(); setTimeout(sirenSfx, 1000); }
  setTimeout(() => {
    document.body.classList.remove('dead');
    el.className = 'death hidden';
    me.root.rotation.x = 0;
    state.pose = null;
    state.open = null;
    after();
  }, 3800);
}
function loseLife() {
  state.lives = Math.max(0, state.lives - 1);
  state.lifeRegen = 0;
  updateLivesHud();
  return state.lives;
}
function respawnAt(x, z, h) {
  state.onRoof = false;
  state.hp = 100;
  state.wanted = 0;
  state.wantedQuiet = 0;
  state.caughtCd = state.t + 8;
  walker.pos.set(x, 0, z); walker.heading = h; footYaw = h;
  walker.vy = 0; walker.y = 0;
  const near = findParking(x, z);
  if (near && ownCar.dead !== true) { ownCar.pos.copy(near); ownCar.speed = 0; }
  snapCam = true;
  saveGame();
}
function wasted() {
  if (state.open === 'dead') return;
  const left = loseLife();
  const fee = Math.min(state.money, Math.max(50, Math.round(state.money * 0.15)));
  deathScreen('wasted', 'WASTED 💀', left > 0 ? `Aspatal ka bill ₹${fee} • ❤️ ${left} lifeline baaki` : 'Saari lifeline khatam!', () => {
    if (left <= 0) return gameOver();
    setMoney(state.money - fee);
    respawnAt(-58, 4, Math.PI / 2); // Mandir ke saamne hosh aaya
    toast(`🏥 Hosh aa gaya… ₹${fee} ilaaj mein gaye. ❤️ ${left} baaki`, 3500);
  });
}
function busted() {
  if (state.open === 'dead') return;
  const left = loseLife();
  const fine = Math.min(state.money, Math.max(100, Math.round(state.money * 0.2)));
  const hadGuns = Object.keys(weapons.owned).length > 0;
  deathScreen('busted', 'BUSTED 🚔', left > 0 ? `Jurmana ₹${fine}${hadGuns ? ' • Hathiyar zabt' : ''} • ❤️ ${left} lifeline baaki` : 'Saari lifeline khatam!', () => {
    if (left <= 0) return gameOver();
    setMoney(state.money - fine);
    // GTA jaisa: police hathiyar zabt kar leti hai
    for (const k of Object.keys(weapons.owned)) delete weapons.owned[k];
    weapons.equip(null);
    if (state.weapon) { state.weapon = null; hold(me, null); setOverlay(me, null); }
    respawnAt(THANA_OUT.x, THANA_OUT.z, THANA_OUT.h);
    toast(`🚓 Thane se chhoot gaye… ₹${fine} jurmana${hadGuns ? ', bandook zabt' : ''}. ❤️ ${left} baaki`, 3800);
  });
}
const THANA_OUT = { x: 112, z: 136, h: Math.PI / 2 };
function gameOver() {
  dialog({
    kind: 'gameover', avatar: '☠️', title: 'GAME OVER', sub: 'Saari lifeline khatam',
    line: 'Mohalla phir se shuru hoga — paisa, jhola aur hathiyar reset. Respect, story aur look bache rahenge.',
    options: [{ n: '🔄 Phir se shuru karo', cls: 'good', on: () => {
      closeSheets();
      state.lives = MAX_LIVES; updateLivesHud();
      state.bag = [];
      for (const k of Object.keys(weapons.owned)) delete weapons.owned[k];
      weapons.equip(null);
      state.weapon = null; hold(me, null); setOverlay(me, null);
      setMoney(300);
      respawnAt(0, 80, 0);
      ownCar.dead = false; ownCar.hp = 100;
      ownCar.pos.set(0, 0, 80); ownCar.heading = 0; ownCar.speed = 0;
      car = ownCar; rick = ownCar.g;
      enterRick(true);
      toast('🛺 Naya din, nayi shuruaat! ❤️❤️❤️', 3000);
    } }],
  });
}

// ---------- 💨 DHUAAN / GAADI KA NUKSAAN ----------
const smokeTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 31);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();
const puffs = [];
function puff(x, y, z, { color = 0x8a8a8a, size = 1, life = 1.6, up = 1.2, spread = 0.6, fire = false } = {}) {
  let p = puffs.find((q) => q.t <= 0);
  if (!p) {
    if (puffs.length > 140) return;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false }));
    scene.add(sp);
    p = { sp, t: 0 };
    puffs.push(p);
  }
  p.sp.material.color.setHex(color);
  p.sp.material.blending = fire ? THREE.AdditiveBlending : THREE.NormalBlending;
  p.sp.material.toneMapped = !fire;
  p.sp.position.set(x + (Math.random() - 0.5) * spread, y, z + (Math.random() - 0.5) * spread);
  p.vx = (Math.random() - 0.5) * spread; p.vz = (Math.random() - 0.5) * spread; p.vy = up * (0.6 + Math.random() * 0.6);
  p.t = p.life = life * (0.7 + Math.random() * 0.6); p.size = size; p.fire = fire;
  p.sp.visible = true;
}
function updatePuffs(dt) {
  for (const p of puffs) {
    if (p.t <= 0) continue;
    p.t -= dt;
    const k = 1 - p.t / p.life;
    p.sp.position.x += p.vx * dt; p.sp.position.y += p.vy * dt; p.sp.position.z += p.vz * dt;
    p.sp.scale.setScalar(p.size * (0.5 + k * (p.fire ? 0.8 : 2.2)));
    p.sp.material.opacity = Math.max(0, (1 - k) * (p.fire ? 0.9 : 0.55));
    if (p.t <= 0) p.sp.visible = false;
  }
}
function crashFx(v, speed, x = v.pos.x, z = v.pos.z) {
  if (!v || v.dead) return;
  v.hp = (v.hp ?? 100) - Math.min(45, speed * 2.2);
  const n = Math.min(14, 4 + Math.round(speed));
  for (let i = 0; i < n; i++) puff(x, 0.6 + Math.random() * 0.6, z, { color: i % 3 ? 0x9a9a9a : 0xd8d0c0, size: 1.1, life: 1.2, up: 1.6, spread: 2.2 });
  for (let i = 0; i < 4; i++) puff(x, 0.8, z, { color: 0xffb040, size: 0.35, life: 0.25, up: 2, spread: 3, fire: true });
  if (v.hp <= 0) explode(v);
  else if (v === car && state.mode === 'drive' && v.hp < 35) toast(`🔥 Gaadi ki haalat kharab — ${Math.max(0, Math.round(v.hp))}% • Utar jao! (F)`, 2000);
}
function explode(v) {
  v.dead = true; v.hp = 0; v.speed = 0; v.burnT = 9;
  const { x, z } = v.pos;
  for (let i = 0; i < 26; i++) puff(x, 0.8 + Math.random(), z, { color: i % 2 ? 0xff7a1a : 0xffd040, size: 2.2, life: 0.7, up: 3, spread: 4, fire: true });
  for (let i = 0; i < 20; i++) puff(x, 1, z, { color: 0x1a1a1a, size: 2.4, life: 2.6, up: 2.5, spread: 3.5 });
  noise(0.9, 0.9, 80); glide(120, 30, 1, 'sawtooth', 0.12);
  flash('fire');
  if (v.driver) { const d = v.driver; v.driver = null; const n = npcs.adoptWalker(d, x + 2.5, z, v.pos); n.flee = 6; }
  v.ai = false;
  const p = state.mode === 'drive' ? car.pos : walker.pos;
  const d = Math.hypot(p.x - x, p.z - z);
  if (v === car && state.mode === 'drive') { exitRick(true); hurt(55); toast('💥 GAADI PHAT GAYI!', 2200); }
  else if (d < 6) hurt(Math.round(40 * (1 - d / 6)) + 10);
  npcs.panic(v.pos, 30);
}
let smokeT = 0;
function updateVehicleDamage(dt) {
  updatePuffs(dt);
  smokeT -= dt;
  const emit = smokeT <= 0;
  if (emit) smokeT = 0.12;
  const cam = camera.position;
  for (const v of [ownCar, ...traffic.vehicles]) {
    if (v.burnT > 0) {
      v.burnT -= dt;
      if (v.burnT <= 0) {
        // jal ke thanda — mistri ne theek kar diya
        v.dead = false; v.hp = 100;
        if (v === ownCar) { const pk = findParking(walker.pos.x, walker.pos.z); if (pk && state.mode === 'foot') ownCar.pos.copy(pk); setMoney(state.money - Math.min(state.money, 80)); toast('🔧 Mistri ne tumhara auto theek karke paas khada kar diya (-₹80)', 3200); }
      }
    }
    const hp = v.hp ?? 100;
    if (!emit || hp >= 60 || Math.hypot(v.pos.x - cam.x, v.pos.z - cam.z) > 90) continue;
    const ex = v.pos.x + Math.sin(v.heading) * (v.len || 3.4) * 0.35, ez = v.pos.z + Math.cos(v.heading) * (v.len || 3.4) * 0.35;
    if (v.dead) {
      puff(v.pos.x, 1, v.pos.z, { color: 0x111111, size: 1.8, life: 2.2, up: 2.2, spread: 1.5 });
      puff(v.pos.x, 0.9, v.pos.z, { color: 0xff6a10, size: 1.1, life: 0.5, up: 1.6, spread: 1.4, fire: true });
    } else if (hp < 25) {
      puff(ex, 1, ez, { color: 0x2a2a2a, size: 1.2, life: 1.8, up: 1.6, spread: 0.6 });
      if (Math.random() < 0.5) puff(ex, 0.9, ez, { color: 0xff7a20, size: 0.5, life: 0.35, up: 1.2, spread: 0.4, fire: true });
    } else if (Math.random() < 0.6) puff(ex, 1, ez, { color: 0x9a9a9a, size: 0.9, life: 1.6, up: 1.3, spread: 0.5 });
  }
}
let lastHp = -1;
function updateHpHud() {
  const v = Math.round(state.hp);
  if (v === lastHp) return;
  lastHp = v;
  $('hpFill').style.width = v + '%';
  $('hp').classList.toggle('low', v < 35);
}
function toggleLift() {
  if (weapons.aiming) stopAim();
  state.onRoof = !state.onRoof;
  if (state.onRoof) { walker.pos.set(LIFT.x, 0, 104.4); walker.heading = 0; footYaw = Math.PI; }
  else { walker.pos.set(LIFT.x, 0, 108.2); walker.heading = Math.PI; footYaw = 0; }
  snapCam = true;
  beep([660, 990], 0.1, 'sine', 0.05);
  toast(state.onRoof ? MISC3[L()].liftUp : MISC3[L()].liftDown, 2400);
}
// ---------- 💾 SAVE ----------
function saveGame(manual = false) {
  if (!weapons || !me) return;
  const s = me.spec;
  const data = {
    v: 1, money: state.money, respect: missions.respect(), story: story.done, guns: { ...weapons.owned },
    bag: state.bag.map((b) => ({ ...b })), lang: state.lang, level: state.age18 ? state.level : Math.min(1, state.level), age18: state.age18,
    look: { hairStyle: s.hairStyle, hair: s.hair, beard: s.beard, top: s.top, outfit: s.outfit, shades: s.shades },
    cineFx: state.cineFx, lives: state.lives, at: Date.now(),
  };
  try { localStorage.setItem('mohalla.save', JSON.stringify(data)); localStorage.setItem('mohalla.respect', String(data.respect)); } catch { /* ok */ }
  if (manual) toast(MISC3[L()].saved + (cloud.user ? ' ☁️' : ''), 1500);
  cloudPush(data, manual);
  return data;
}
// ---------- ☁️ CLOUD (Firebase) ----------
let lastCloudPush = 0, cloudSynced = false;
function cloudPush(data, now = false) {
  if (!cloud.user || !cloudSynced) return;
  const t = performance.now();
  if (!now && t - lastCloudPush < 20000) return;
  lastCloudPush = t;
  cloud.save(data).catch((e) => console.warn('cloud save fail', e));
}
function readLocalSave() { try { return JSON.parse(localStorage.getItem('mohalla.save') || 'null'); } catch { return null; } }
// login hote hi: cloud wala naya ho to wo lo, warna local wala upload karo
async function cloudSync() {
  cloudSynced = false;
  let remote = null;
  try { remote = await cloud.loadSave(); } catch (e) { console.warn('cloud load fail', e); setCloudStatus('⚠️ Cloud se judne mein dikkat — offline khel rahe ho'); return; }
  const local = readLocalSave();
  if (remote && (!local || (remote.at || 0) > (local.at || 0) + 2000)) {
    try {
      localStorage.setItem('mohalla.save', JSON.stringify(remote));
      localStorage.setItem('mohalla.respect', String(remote.respect || 0));
      localStorage.setItem('mohalla.money', String(remote.money || 0));
    } catch { /* ok */ }
    if (!started || confirm('☁️ Cloud pe naya progress mila (₹' + remote.money + '). Load karein? Game reload hoga.')) { location.reload(); return; }
  }
  cloudSynced = true;
  const d = started ? saveGame() : local;
  if (d) cloudPush(d, true);
  setCloudStatus();
}
function setCloudStatus(msg) {
  const el = $('cloudStatus');
  if (!el) return;
  const u = cloud.user;
  el.textContent = msg || (u ? (u.isAnonymous ? `👤 ${cloud.name()} (guest) • ☁️ save chalu` : `✅ ${cloud.name()} • ☁️ cloud save chalu`) : '☁️ Login karo — progress kabhi nahi khoyega');
  const g = $('btnGoogle');
  if (g) g.classList.toggle('hidden', !!(u && !u.isAnonymous));
}
async function googleLogin() {
  try {
    setCloudStatus('⏳ Google login…');
    await cloud.loginGoogle();
  } catch (e) {
    console.warn(e);
    setCloudStatus(e.code === 'auth/unauthorized-domain' ? '⚠️ Ye domain Firebase mein authorized nahi hai' : e.code === 'auth/popup-closed-by-user' ? undefined : '⚠️ Login nahi hua: ' + (e.code || e.message));
    if (started) toast('⚠️ Login nahi hua', 2000);
  }
}
async function openLeaderboard(by = 'money') {
  dialog({ kind: 'lb', avatar: '🏆', title: 'Mohalla Leaderboard', sub: by === 'money' ? 'Sabse amir 💰' : 'Sabse izzatdaar 🏅', line: '⏳ Load ho raha hai…', options: [] });
  let rows;
  try { rows = await cloud.top(by, 10); } catch (e) { if (state.open === 'lb') say('⚠️ Leaderboard load nahi hua — net check karo'); return; }
  if (state.open !== 'lb') return;
  const me_ = cloud.user?.uid, medal = ['🥇', '🥈', '🥉'];
  const opts = [
    { n: by === 'money' ? '🏅 Respect wali list dekho' : '💰 Paise wali list dekho', cls: 'good', on: () => openLeaderboard(by === 'money' ? 'respect' : 'money') },
    ...rows.map((r, i) => ({
      n: `${medal[i] || '#' + (i + 1)} ${r.name}${r.uid === me_ ? ' (tum)' : ''}`,
      d: by === 'money' ? `₹${r.money} • 🏅 ${r.respect}` : `🏅 ${r.respect} • ₹${r.money}`,
      cls: r.uid === me_ ? 'good' : '',
      on: () => {},
    })),
  ];
  say(rows.length ? (cloud.user ? 'Top 10 — tumhara naam bhi chamkega! 😎' : 'Login karo to tumhara naam bhi aayega!') : 'Abhi koi nahi — pehle tum aa jao! 🚀');
  renderOptions(opts);
}
function openAccount() {
  const u = cloud.user;
  dialog({
    kind: 'acct', avatar: '☁️', title: 'Account', sub: u ? (u.isAnonymous ? `Guest: ${cloud.name()}` : `${u.displayName || ''} • ${u.email || ''}`) : 'Login nahi hai',
    line: u && !u.isAnonymous ? 'Progress cloud pe save ho raha hai. Kisi bhi phone pe isi Google se login karo.' : 'Google se login karo — phone badlo ya browser saaf karo, progress wahi milega.',
    options: [
      ...(!u || u.isAnonymous ? [{ n: '🔐 Google se login', cls: 'good', on: () => { closeSheets(); googleLogin(); } }] : []),
      { n: '☁️ Abhi cloud pe save karo', on: () => { saveGame(true); } },
      ...(u && !u.isAnonymous ? [{ n: '🚪 Logout', cls: 'danger', on: async () => { saveGame(true); await cloud.logout(); closeSheets(); toast('Logout ho gaya — ab guest ho', 2000); cloud.loginGuest().catch(() => {}); } }] : []),
    ],
  });
}
function loadGame(raw) {
  try {
    const d = raw || JSON.parse(localStorage.getItem('mohalla.save') || 'null');
    if (!d) return false;
    saveData = d;
    if (d.money >= 0) state.money = d.money;
    if (d.guns) weapons.load(d.guns);
    if (Array.isArray(d.bag)) state.bag = d.bag;
    if (d.lang) setLang(d.lang);
    state.age18 = !!d.age18;
    setLevel(d.level || 0);
    if (d.look) { Object.assign(me.spec, d.look); me.rebuild(); }
    if (typeof d.cineFx === 'boolean') state.cineFx = d.cineFx;
    if (d.lives > 0) state.lives = Math.min(MAX_LIVES, d.lives);
    return true;
  } catch { return false; }
}
function openSaveMenu() {
  const code = () => btoa(unescape(encodeURIComponent(JSON.stringify(saveGame()))));
  dialog({
    kind: 'save', avatar: '💾', title: 'Save / Load', sub: 'Game apne aap har 15 sec mein save hota hai',
    line: 'Doosre phone/browser pe le jaana hai? "Save code" copy karo aur wahan "Code daalo" mein paste karo.',
    options: [
      { n: '💾 Abhi save karo', on: () => { saveGame(true); } },
      { n: '📋 Save code copy karo', on: async () => { const c = code(); try { await navigator.clipboard.writeText(c); say('✅ Code copy ho gaya! WhatsApp pe khud ko bhej do.'); } catch { say(c.slice(0, 60) + '…'); prompt('Ye code copy karo:', c); } } },
      { n: '📥 Save code daalo', on: () => { const c = prompt('Apna save code yahan paste karo:'); if (!c) return; try { const d = JSON.parse(decodeURIComponent(escape(atob(c.trim())))); localStorage.setItem('mohalla.save', JSON.stringify(d)); localStorage.setItem('mohalla.respect', String(d.respect || 0)); location.reload(); } catch { say('❌ Code galat hai'); } } },
      { n: '🗑️ Naya game', cls: 'danger', on: () => { if (confirm('Sab progress mit jaayega. Pakka?')) { try { localStorage.removeItem('mohalla.save'); localStorage.removeItem('mohalla.respect'); localStorage.removeItem('mohalla.money'); } catch { /* ok */ } location.reload(); } } },
    ],
  });
}
document.addEventListener('visibilitychange', () => { if (document.hidden && started) { const d = saveGame(); cloudPush(d, true); } });

// ---------- MAAR-PEET 👊 / KOOD ----------
function attack() {
  if (!started || state.mode !== 'foot' || state.open || state.cine || state.seq?.type === 'salon') return;
  const t = state.t;
  if (t < state.attackCd) return;
  state.attackCd = t + 0.5;
  const w = state.weapon;
  if (state.seq?.type === 'eat') return;
  setOverlay(me, w ? 'swing' : 'punch');
  glide(400, 150, 0.12, 'sawtooth', 0.02);
  setTimeout(() => {
    const n = npcs.hitTest(walker.pos, walker.heading, w ? 2.2 : 1.6);
    if (n) {
      npcs.knock(n, walker.pos, w ? 1.6 : 0.8);
      noise(0.12, w ? 0.7 : 0.45, w ? 500 : 900);
      glide(160, 60, 0.15, 'triangle', 0.1);
      flash('slap');
      if (n.cop) { addWanted(2); toast(FIGHT[L()].copHit, 2400); }
      else {
        toast(fight('victim'), 2200);
        if (npcs.cops.some((c) => Math.hypot(c.x - walker.pos.x, c.z - walker.pos.z) < 35)) addWanted(1);
      }
    }
  }, 140);
  setTimeout(() => { if (!state.seq) setOverlay(me, state.weapon ? 'hold' : null); }, 480);
}
function jump() {
  if (!started || state.mode !== 'foot' || state.open || state.seq?.type === 'salon') return;
  if (walker.y > 0.02 || walker.vy > 0) return;
  walker.vy = 5.4;
  glide(300, 500, 0.12, 'triangle', 0.03);
}

// ---------- LOOP ----------
const clock = new THREE.Clock();
const camTarget = new THREE.Vector3(), camLook = new THREE.Vector3(), tmp = new THREE.Vector3();
let lastCrash = 0, lastHonk = 0, frameN = 0;
let started = false, lastCowToast = 0, snapCam = false, lastAnimalToast = 0, lastClock = '', retroAmt = 0, sirenT = 0, lastHitToast = 0;

function updateCar(dt) {
  const k = (c) => (keys[c] ? 1 : 0);
  let throttle = 0, steer = 0;
  if (!state.open && state.mode === 'drive' && !car.dead) {
    throttle = k('KeyW') + k('ArrowUp') - k('KeyS') - k('ArrowDown') - joy.y;
    steer = k('KeyA') + k('ArrowLeft') - k('KeyD') - k('ArrowRight') - joy.x;
    if (state.t < (state.drunkUntil || 0) && Math.abs(car.speed) > 2) steer += Math.sin(state.t * 1.4) * 0.45;
  }
  throttle = THREE.MathUtils.clamp(throttle, -1, 1);
  steer = THREE.MathUtils.clamp(steer, -1, 1);
  const t = state.t;
  const max = (car.max || 15) * (t < state.turboUntil ? 1.8 : 1) * (t < state.sugarUntil ? 1.25 : 1);
  if (throttle) car.speed += throttle * 22 * dt;
  else car.speed -= Math.sign(car.speed) * Math.min(Math.abs(car.speed), 14 * dt);
  car.speed = THREE.MathUtils.clamp(car.speed, -6, max);
  car.heading += steer * 2.2 * dt * THREE.MathUtils.clamp(car.speed / 5, -1, 1);
  const nx = car.pos.x - Math.sin(car.heading) * car.speed * dt;
  const nz = car.pos.z - Math.cos(car.heading) * car.speed * dt;
  const stuckOff = !driveable(car.pos.x, car.pos.z); // footpath pe khadi thi to bahar nikalne do
  if (driveable(nx, nz) || (stuckOff && footable(nx, nz))) car.pos.set(nx, 0, nz);
  else if (driveable(nx, car.pos.z)) { car.pos.x = nx; car.speed *= 0.97; }
  else if (driveable(car.pos.x, nz)) { car.pos.z = nz; car.speed *= 0.97; }
  else { if (Math.abs(car.speed) > 7 && t - lastCrash > 1) { lastCrash = t; noise(0.2, 0.4, 200); missions.notify('crash'); crashFx(car, Math.abs(car.speed), car.pos.x - Math.sin(car.heading) * (car.len || 3.4) / 2, car.pos.z - Math.cos(car.heading) * (car.len || 3.4) / 2); } car.speed *= -0.3; }

  for (const cow of world.cows) {
    const dx = car.pos.x - cow.x, dz = car.pos.z - cow.z, d = Math.hypot(dx, dz);
    if (d < 2.6) {
      const push = (2.6 - d) / (d || 1);
      const px = car.pos.x + dx * push, pz = car.pos.z + dz * push;
      if (driveable(px, pz)) car.pos.set(px, 0, pz);
      car.speed *= 0.3;
      cow.pause = 1.5;
      if (t - lastCowToast > 4) { toast(state.level === 2 ? UI18[L()].cow : ui('cow')); beep([200, 150], 0.2, 'sine', 0.06); lastCowToast = t; }
    }
  }
  rick.position.copy(car.pos);
  rick.rotation.y = car.heading;
  rick.rotation.z = -steer * Math.min(1, Math.abs(car.speed) / 15) * 0.06;
  rick.position.y = Math.abs(Math.sin(t * 18)) * 0.03 * Math.min(1, Math.abs(car.speed) / 4);
  for (const w of car.wheels || []) w.rotation.x -= car.speed * dt * 2.2;
  // doosri gaadiyon se takkar
  for (const v of [ownCar, ...traffic.vehicles]) {
    if (v === car) continue;
    const dx = car.pos.x - v.pos.x, dz = car.pos.z - v.pos.z, d = Math.hypot(dx, dz), min = (car.radius || 1) + (v.radius || 1) + 0.5;
    if (d < min && d > 0.01) {
      car.pos.x += (dx / d) * (min - d); car.pos.z += (dz / d) * (min - d);
      if (Math.abs(car.speed) > 6 && t - lastCrash > 1) { lastCrash = t; noise(0.25, 0.5, 200); toast(fight('honk'), 1800); missions.notify('crash'); const sp = Math.abs(car.speed); crashFx(car, sp, (car.pos.x + v.pos.x) / 2, (car.pos.z + v.pos.z) / 2); crashFx(v, sp * 0.8); }
      car.speed *= -0.25;
    }
  }
  if (rick.userData.lemon) rick.userData.lemon.rotation.z = Math.sin(t * 8) * 0.3 * Math.min(1, Math.abs(car.speed) / 5 + 0.2);
}

function groundY() { return state.onRoof ? ROOF.y : heightAt(walker.pos.x, walker.pos.z); }
function footBlocked(x, z) {
  if (state.onRoof) return !(x > ROOF.x0 + 0.5 && x < ROOF.x1 - 0.5 && z > ROOF.z0 + 0.5 && z < ROOF.z1 - 0.5) || (x > LIFT.x - 1.9 && x < LIFT.x + 1.9 && z > 99.3 && z < 103.1);
  if (!footable(x, z)) return true;
  if (state.mode === 'foot') for (const v of [ownCar, ...traffic.vehicles]) if (Math.hypot(x - v.pos.x, z - v.pos.z) < (v.radius || 1) + 0.55) return true;
  for (const cow of world.cows) if (Math.hypot(x - cow.x, z - cow.z) < 1.3) return true;
  return false;
}
function updateWalker(dt) {
  const t = state.t;
  const s = state.seq;
  if (s && s.type !== 'salon') {
    s.t += dt;
    if (s.type === 'eat') {
      setOverlay(me, s.act);
      if (s.t >= s.dur) {
        state.seq = null;
        setOverlay(me, state.weapon ? 'hold' : null);
        hold(me, state.weapon ? itemMesh(state.weapon) : null);
        const it = s.item;
        if (/paan/i.test(it.n)) spit();
        applyFx(it.fx, it.fx === 'full' ? X().eatDone : it.say ? it.say[L()] : X().eatDone);
      }
    } else if (s.type === 'kite') {
      setOverlay(me, 'kite');
      if (kiteObj) {
        const fwdx = -Math.sin(walker.heading), fwdz = -Math.cos(walker.heading);
        kiteObj.kite.position.set(walker.pos.x + fwdx * 16 + Math.sin(t * 0.8) * 2.5, 15 + Math.sin(t * 1.2) * 2, walker.pos.z + fwdz * 16 + Math.cos(t * 0.6) * 2);
        kiteObj.kite.rotation.y = Math.sin(t) * 0.4;
        const pa = kiteObj.line.geometry.attributes.position;
        pa.setXYZ(0, walker.pos.x, 2.1 + walker.y, walker.pos.z);
        pa.setXYZ(1, kiteObj.kite.position.x, kiteObj.kite.position.y, kiteObj.kite.position.z);
        pa.needsUpdate = true;
      }
      if (s.t >= s.dur) { state.seq = null; stopKite(); setOverlay(me, null); }
    }
  }
  if (s && s.type === 'salon') {
    s.t += dt;
    if (s.type === 'salon') {
      setAction(me, 'sit');
      walker.heading = s.keeper.chairHeading;
      s.snip -= dt;
      if (s.snip <= 0 && s.it.fx !== 'champi') { snipSfx(); s.snip = 0.35; }
      if (s.it.fx === 'champi') me.lookX = Math.sin(t * 12) * 0.15;
      if (s.t >= s.dur) { state.seq = null; me.lookX = 0; finishSalon(s); }
    }
    me.root.position.set(walker.pos.x, state.seq?.type === 'salon' ? 0.62 : groundY(), walker.pos.z);
    me.root.rotation.y = walker.heading;
    return;
  }
  let ix = 0, iy = 0;
  if (!state.open && t > state.stunUntil) {
    ix = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x;
    iy = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - joy.y;
  }
  if (t < (state.drunkUntil || 0) && Math.hypot(ix, iy) > 0.1) { ix += Math.sin(t * 1.7) * 0.6; iy += Math.cos(t * 1.1) * 0.15; }
  const mag = Math.min(1, Math.hypot(ix, iy));
  const run = keys.ShiftLeft || keys.ShiftRight || state.runToggle || Math.hypot(joy.x, joy.y) > 0.92;
  if (mag > 0.12) {
    const fx = -Math.sin(footYaw), fz = -Math.cos(footYaw), rx = Math.cos(footYaw), rz = -Math.sin(footYaw);
    let dx = fx * iy + rx * ix, dz = fz * iy + rz * ix;
    const dl = Math.hypot(dx, dz) || 1;
    dx /= dl; dz /= dl;
    walker.heading += wrap(headingTo(dx, dz) - walker.heading) * Math.min(1, dt * 12);
    const sp = (run ? 6.2 : 2.6) * (t < state.turboUntil ? 1.3 : 1) * mag;
    walker.speed += (sp - walker.speed) * Math.min(1, dt * 8);
    const nx = walker.pos.x + dx * walker.speed * dt, nz = walker.pos.z + dz * walker.speed * dt;
    if (!footBlocked(nx, nz)) walker.pos.set(nx, 0, nz);
    else if (!footBlocked(nx, walker.pos.z)) walker.pos.x = nx;
    else if (!footBlocked(walker.pos.x, nz)) walker.pos.z = nz;
    me.speed = walker.speed;
    setAction(me, walker.speed > 4 ? 'run' : 'walk');
    if (!drag && iy > 0.3) footYaw += wrap(walker.heading - footYaw) * Math.min(1, dt * 0.8);
  } else {
    walker.speed *= 0.8;
    setAction(me, music.playing && keys.KeyQ ? 'dance' : 'idle');
  }
  if (keys.KeyQ && mag < 0.12) setAction(me, 'dance');
  // kood 🦘
  if (walker.y > 0 || walker.vy > 0) {
    walker.vy -= 15 * dt;
    walker.y = Math.max(0, walker.y + walker.vy * dt);
    if (walker.y <= 0 && walker.vy < 0) { walker.vy = 0; walker.y = 0; noise(0.05, 0.08, 300); }
    else setAction(me, 'jump');
  }
  if (t < state.hurtUntil) setAction(me, 'hurt');
  if (state.pose) setAction(me, state.pose);
  if (weapons.aiming) { walker.heading = aimYaw; footYaw = aimYaw; me.aimPitch = aimPitch; }
  me.look *= 0.92;
  me.root.position.set(walker.pos.x, groundY() + walker.y, walker.pos.z);
  me.root.rotation.y = walker.heading;
  if (t > state.balloonUntil && me.held && state.balloonUntil > 0) { hold(me, null); state.balloonUntil = 0; }
}
function spit() {
  const fx = -Math.sin(walker.heading), fz = -Math.cos(walker.heading);
  const m = new THREE.Mesh(new THREE.CircleGeometry(0.35, 12), new THREE.MeshBasicMaterial({ color: 0x9a0a10, transparent: true, opacity: 0.85 }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(walker.pos.x + fx * 1.2, 0.03, walker.pos.z + fz * 1.2);
  scene.add(m);
  setTimeout(() => scene.remove(m), 60000);
  noise(0.12, 0.25, 400);
  toast(X().spit, 2200);
}

function collectCoins() {
  const p = state.mode === 'drive' ? car.pos : walker.pos;
  const r = state.mode === 'drive' ? 2.2 : 1.3;
  for (const c of world.coins) {
    if (c.active && Math.hypot(c.mesh.position.x - p.x, c.mesh.position.z - p.z) < r) {
      c.active = false;
      c.mesh.visible = false;
      c.respawn = state.t + 40;
      setMoney(state.money + 20);
      coinSfx();
      toast(UI[L()].coin, 1200);
    }
  }
}

function updateCamera(dt, lv) {
  const t = state.t;
  if (state.mode === 'drive') {
    if (Math.abs(car.speed) > 2 && !drag) camYaw *= 1 - Math.min(1, dt * 1.2);
    const h = car.heading + camYaw;
    const dist = camDist + Math.abs(car.speed) * 0.12;
    camTarget.set(car.pos.x + Math.sin(h) * dist, 4.2 + dist * 0.28, car.pos.z + Math.cos(h) * dist);
    tmp.set(car.pos.x - Math.sin(car.heading) * 4, 1.8, car.pos.z - Math.cos(car.heading) * 4);
  } else {
    let d = state.seq?.type === 'salon' ? 3.2 : footDist;
    const by = groundY();
    // deewar ke andar camera na jaaye
    for (let k = 0; k < 8 && !state.onRoof; k++) {
      const cx = walker.pos.x + Math.sin(footYaw) * d, cz = walker.pos.z + Math.cos(footYaw) * d;
      if (!solidAt(cx, cz, 0.3) && (inFoot(cx, cz) || d < 1.6)) break;
      if (d <= 1.2) break;
      d = Math.max(1.2, d - 0.6);
    }
    camTarget.set(walker.pos.x + Math.sin(footYaw) * d, by + 1.75 + d * 0.22, walker.pos.z + Math.cos(footYaw) * d);
    tmp.set(walker.pos.x, by + 1.45, walker.pos.z);
    if (state.seq?.type === 'salon') {
      // kursi ke peeche se — saamne aaina 🪞
      const c = state.seq.keeper.chair, ch = state.seq.keeper.chairHeading;
      const fx = -Math.sin(ch), fz = -Math.cos(ch), rx = Math.cos(ch), rz = -Math.sin(ch);
      camTarget.set(c.x - fx * 2.4 + rx * 0.45, 1.9, c.z - fz * 2.4 + rz * 0.45);
      tmp.set(c.x + fx * 2.6, 1.55, c.z + fz * 2.6);
    }
    if (weapons.aiming) {
      const cp = Math.cos(aimPitch), fx = -Math.sin(aimYaw) * cp, fy = Math.sin(aimPitch), fz = -Math.cos(aimYaw) * cp;
      const rx = Math.cos(aimYaw), rz = -Math.sin(aimYaw);
      if (weapons.cur === 'sniper') {
        camTarget.set(walker.pos.x + fx * 0.4, by + 1.62 + fy * 0.4, walker.pos.z + fz * 0.4);
      } else camTarget.set(walker.pos.x - fx * 2.1 + rx * 0.6, by + 1.75 - fy * 1.2, walker.pos.z - fz * 2.1 + rz * 0.6);
      tmp.set(camTarget.x + fx * 40, camTarget.y + fy * 40, camTarget.z + fz * 40);
      camera.position.copy(camTarget); camLook.copy(tmp);
    }
  }
  if (snapCam) { camera.position.copy(camTarget); camLook.copy(tmp); snapCam = false; }
  camera.position.lerp(camTarget, 1 - Math.exp(-dt * (state.mode === 'drive' ? 4 : 7)));
  camLook.lerp(tmp, 1 - Math.exp(-dt * 8));
  camera.position.y += lv.bass * (state.mode === 'drive' ? 0.12 : 0.03);
  if (t < state.fireUntil || t < state.stunUntil) {
    camera.position.x += (Math.random() - 0.5) * 0.3;
    camera.position.y += (Math.random() - 0.5) * 0.3;
  }
  camera.lookAt(camLook);
  if (t < state.champiUntil) camera.rotation.z += Math.sin(t * 6) * 0.15;
  // gaana baje to camera beat pe saans le (cinematic)
  const baseFov = innerWidth < innerHeight ? 72 : 60;
  const want = baseFov + (music.playing ? lv.bass * 2.2 : 0) + (state.mode === 'drive' ? Math.min(6, Math.abs(car.speed) * 0.3) : 0);
  camera.fov += (want - camera.fov) * Math.min(1, dt * 6);
  if (weapons.aiming && weapons.cur === 'sniper') camera.fov = 11; else if (weapons.aiming) camera.fov = Math.min(camera.fov, 50);
  camera.updateProjectionMatrix();
  if (music.playing) camera.rotation.z += Math.sin(t * 0.45) * 0.012;
  if (t < (state.drunkUntil || 0)) {
    const k = Math.min(1, (state.drunkUntil - t) / 8);
    camera.rotation.z += Math.sin(t * 0.9) * 0.09 * k;
    camera.rotation.x += Math.sin(t * 0.7) * 0.03 * k;
    camera.fov += Math.sin(t * 1.3) * 3 * k;
    camera.updateProjectionMatrix();
    if (!state.wasDrunk) state.wasDrunk = true;
  } else if (state.wasDrunk) { state.wasDrunk = false; toast(BAR[L()].sober, 1800); }
}

function updateProximity() {
  const p = state.mode === 'drive' ? car.pos : walker.pos;
  nearest = null; nearGirl = null;
  // jidhar dekh rahe ho, wahi cheez chuno
  const hd = state.mode === 'drive' ? car.heading : walker.heading;
  const fx = -Math.sin(hd), fz = -Math.cos(hd);
  let best = Infinity;
  const score = (x, z, d) => d - 1.6 * Math.max(0, ((x - p.x) * fx + (z - p.z) * fz) / (d || 1));
  for (const tr of world.triggers) {
    const r = (tr.r || 6) + (state.mode === 'drive' ? 4 : 0);
    const d = Math.hypot(tr.x - p.x, tr.z - p.z);
    if (d < r) { const sc = score(tr.x, tr.z, d); if (sc < best) { best = sc; nearest = tr; } }
  }
  if (state.mode === 'foot') {
    for (const g of npcs.girls()) {
      if (g.riding || g.scene || g.fall > 0) continue;
      const d = Math.hypot(g.x - p.x, g.z - p.z);
      if (d < 3) { const sc = score(g.x, g.z, d) - 0.5; if (sc < best) { best = sc; nearGirl = g; nearest = null; } }
    }
  }
  // tairte naam
  const labels = [];
  if (!state.open && !state.scene) {
    for (const tr of world.triggers) {
      const d = Math.hypot(tr.x - p.x, tr.z - p.z);
      if (d > 22 || !tr.def.name) continue;
      const hot = tr === nearest;
      labels.push({ key: 'tr' + tr.x.toFixed(1) + tr.z.toFixed(1), x: tr.x, y: tr.keeper ? 3.1 : 2.6, z: tr.z, hot, text: (hot ? (state.mode === 'drive' && !tr.def.music ? '[F] utro → ' : '[E] ') : '') + (tr.def.avatar || '🎧') + ' ' + tr.def.name[L()] });
    }
    if (state.mode === 'foot') {
      for (const g of npcs.girls()) {
        const d = Math.hypot(g.x - p.x, g.z - p.z);
        if (d > 9 || g.riding || g.scene || g.hidden > 0) continue;
        labels.push({ key: 'g' + g.girl.name, x: g.x, y: 2.05, z: g.z, hot: g === nearGirl, text: (g === nearGirl ? '[E] ' : '') + (g.girl.gf ? '💞 ' : '👩 ') + g.girl.name });
      }
      const v = nearestVehicle(walker.pos);
      if (v) labels.push({ key: 'veh', x: v.pos.x, y: 2.6, z: v.pos.z, hot: true, text: v.driver ? '[F] 😈 Gaadi chheeno' : '[F] 🛺 Baitho' });
    }
    labels.push(...missions.labels());
  }
  ui3d.setLabels(labels);
  let txt = '';
  if (!state.open && !state.seq) {
    if (nearGirl) txt = X().talk(nearGirl.girl.name + (nearGirl.girl.gf ? ' 💞' : ''));
    else if (nearest) {
      const name = nearest.def.name[L()];
      txt = state.mode === 'drive' && !nearest.def.music ? X().walkIn(name) : UI[L()].prompt(name);
    } else if (state.mode === 'foot' && nearestVehicle(walker.pos)) { const v = nearestVehicle(walker.pos); txt = v.driver ? 'F — Gaadi chheeno 😈' : X().enter; }
  }
  const el = $('prompt');
  if (txt) { if (el.textContent !== txt) el.textContent = txt; el.classList.remove('hidden'); $('mAct').classList.toggle('hidden', !(nearGirl || nearest)); }
  else { el.classList.add('hidden'); $('mAct').classList.add('hidden'); }
  $('mF').textContent = state.mode === 'drive' ? '🚶' : '🛺';
  $('mHorn').classList.toggle('hidden', state.mode !== 'drive');
}

let lastStatus = '', lastWanted = -1;
function updateStatus() {
  const t = state.t, U = UI[L()], chips = [];
  if (t < state.turboUntil) chips.push(`${U.turbo} ${Math.ceil(state.turboUntil - t)}s`);
  if (t < state.sugarUntil) chips.push(`${U.sugar} ${Math.ceil(state.sugarUntil - t)}s`);
  if (t < state.fireUntil) chips.push(U.fire);
  if (t < state.champiUntil) chips.push(U.champi);
  if (t < state.ittarUntil) chips.push('✨ Ittar');
  if (state.romance) chips.push('💞 Ishq mode');
  const gf = npcs.girls().find((g) => g.girl.gf);
  if (gf) chips.push(`💑 ${gf.girl.name}`);
  if (music.playing) chips.push(music.micOn ? '🎤 Live' : music.mode === 'file' ? '🔊 MP3' : `🎶 ${music.bpm} BPM`);
  if (weapons?.cur) chips.push(`${GUNS[weapons.cur].n.split(' ')[0]} ${GUNS[weapons.cur].n.split(' ').slice(1).join(' ')} • ${weapons.ammo()} goli`);
  if (story?.active) chips.push('🅼 Mission chal raha hai');
  if (t < state.dogFriendUntil) chips.push('🐕 Kalu saath hai');
  if (t < state.catUntil) chips.push('🐈 Billi saath hai');
  if (state.mode === 'drive' && (car.hp ?? 100) < 100) chips.push(`${car.hp < 25 ? '🔥' : car.hp < 60 ? '💨' : '🔧'} Gaadi ${Math.max(0, Math.round(car.hp))}%`);
  chips.push(`🏅 Respect Lv ${missions.level()}`);
  if (state.level === 2) chips.push('🔞 18+');
  const html = chips.map((c) => `<span class="chip">${c}</span>`).join('');
  if (html !== lastStatus) { $('status').innerHTML = html; lastStatus = html; }
  if (state.wanted !== lastWanted) {
    lastWanted = state.wanted;
    $('wanted').textContent = state.wanted ? '⭐'.repeat(state.wanted) : '';
    $('wanted').classList.toggle('flash', state.wanted > 0);
  }
}

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  state.t += dt;
  const t = state.t;
  const lv = music.levels(dt);
  if (state.realTime) { const d = new Date(); state.tod = (d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600) / 24; }
  else if (!state.cine) state.tod = (state.tod + dt / (HOUR_SECONDS * 24)) % 1;
  computeEnv(state.tod, env);

  if (started && !state.scene) {
    if (state.mode === 'drive') updateCar(dt);
    else { car.speed *= 0.9; if (!eyeLock.active) updateWalker(dt); }
    collectCoins();
  }
  const active = state.mode === 'drive' ? car : walker;
  ctxPlayer.pos = active.pos; ctxPlayer.heading = active.heading; ctxPlayer.speed = active.speed; ctxPlayer.mode = state.mode;
  updateHuman(me, dt, t);

  const fx = { sugar: t < state.sugarUntil, romance: state.romance };
  world.update(t, dt, lv, fx, active.pos, env);
  places.update(t, dt, env);
  places2.update(t);
  couples.update(dt, t, camera.position);
  if (!state.cine) couple.idle(t);
  const ev = animals.update(t, dt, ctxPlayer, state, env.night, traffic ? [ownCar, ...traffic.vehicles] : [ownCar]);
  if (ev && started && t - lastAnimalToast > 6) {
    lastAnimalToast = t;
    if (ev === 'bark') { barkSfx(); toast(state.level === 2 ? UI18[L()].bark : ui('bark'), 1600); } else { meowSfx(); toast(UI[L()].meow, 1200); }
  }
  animals.rickCat.g.visible = t < state.catUntil;

  if (started) {
    const tev = traffic.update(dt, t, { player: ctxPlayer, playerVeh: state.mode === 'drive' ? car : null, cows: world.cows, peds: npcs.npcs.concat(missions.peds()), camera });
    for (const e of tev) if (e.type === 'honk' && t - lastHonk > 4) { lastHonk = t; beep([440, 440], 0.15, 'square', 0.04); toast(fight('honk'), 1600); }
  }
  const party = music.playing && lv.energy > 0.22;
  const events = npcs.update(dt, t, {
    player: ctxPlayer, camera, tod: state.tod, party, vehG: rick, passenger: car.passenger || new THREE.Vector3(0.45, 0.42, 0.95),
    gfSeat: car.kind === 'auto' ? GF_SEAT_AUTO : null,
    wanted: t < state.escapeUntil || state.open === 'police' || state.open === 'dead' ? 0 : state.wanted, activeShop: state.activeShop,
    copsShoot: state.wanted >= 2 && state.open !== 'dead' && t > state.escapeUntil,
  });
  if (started) {
    for (const e of events) {
      if (e.type === 'hit') {
        addWanted(1);
        missions.notify('hit');
        glide(200, 80, 0.2, 'triangle', 0.1);
        const line = gaali('hitPed') || pick(PED[L()].hit);
        ui3d.bubble(e.n.h.root, '😵 ' + line, 'loud', 3.2);
        noise(0.2, 0.5, 250);
        // aas-paas wale bhi chillayenge
        for (const w of npcs.npcs) {
          if (w === e.n || w.type !== 'walker' || w.fall > 0 || Math.random() > 0.5) continue;
          if (Math.hypot(w.x - e.n.x, w.z - e.n.z) < 14) { ui3d.bubble(w.h.root, pick(WITNESS[state.level === 2 ? 'x' : 'n'])); w.pause = 3; w.pauseAct = 'point'; w.faceTo = { x: e.n.x, z: e.n.z }; break; }
        }
        if (t - lastHitToast > 2) { lastHitToast = t; toast('🚑 Accident! ' + line, 2200); }
      } else if (e.type === 'copShot') {
        gunSfx('katta', 0.5);
        if (e.hit) { hurt(9); toast('💥 Police ki goli lagi!', 1200); }
      } else if (e.type === 'getup') {
        ui3d.bubble(e.n.h.root, e.n.angryPending ? fight('victim') : gaali('hitPed') || pick(PED[L()].hit), 'loud', 3);
      } else if (e.type === 'caught' && !state.open && t > state.caughtCd && state.wanted > 0) {
        // 1 star = challan ka mauka; 2+ star = seedha BUSTED 🚔
        if (state.wanted >= 2) busted(); else openCaught();
      } else if (e.type === 'ride') toast(X().gfRide(e.n.girl.name), 2200);
      else if (e.type === 'punched') {
        state.hurtUntil = t + 0.45; state.stunUntil = t + 0.4;
        noise(0.1, 0.4, 900); flash('slap');
        toast(fight('punched'), 1600);
      }
    }
    // wanted dheere dheere kam
    if (state.wanted > 0) {
      const copNear = npcs.cops.some((c) => Math.hypot(c.x - active.pos.x, c.z - active.pos.z) < 30) || (npcs.jeep.active && Math.hypot(npcs.jeep.x - active.pos.x, npcs.jeep.z - active.pos.z) < 40);
      state.wantedQuiet = copNear ? 0 : state.wantedQuiet + dt;
      if (state.wantedQuiet > 18) { state.wanted--; state.wantedQuiet = 0; if (!state.wanted) toast(POLICE[L()].lost, 2200); }
      if (npcs.jeep.active && t > sirenT) { sirenT = t + 1.1; sirenSfx(); }
    }
  }

  const ug = ownCar.g.userData.glow.material;
  ug.color.setHSL(fx.sugar ? (t * 2) % 1 : state.romance ? 0.93 : (0.5 + t * 0.05) % 1, 1, 0.5);
  ug.opacity = 0.35 + 0.65 * env.night;
  ownCar.g.userData.glow.scale.setScalar(1 + lv.bass * 0.35);

  const clk = `${phase(state.tod, L()).icon} ${clockLabel(state.tod)}${state.realTime ? ' •' : ''}`;
  if (clk !== lastClock) { $('clock').textContent = clk; lastClock = clk; }
  retroAmt += ((state.retro ? 1 : 0) - retroAmt) * Math.min(1, dt * 3);
  retroPass.uniforms.amount.value = retroAmt < 0.02 ? 0 : retroAmt;
  retroPass.uniforms.cine.value = state.cineFx ? 1 : 0;
  retroPass.uniforms.time.value = t;
  retroPass.enabled = retroAmt > 0.01 || state.cineFx;
  renderer.toneMappingExposure = 1.15 - env.day * 0.15;

  hotel.update(t, dt, lv, { night: env.night, party });
  if (station.update(t, dt, active.pos) === 'horn') { glide(220, 210, 1.4, 'sawtooth', 0.05); glide(330, 320, 1.4, 'sawtooth', 0.03); toast('🚂 Chhuk chhuk! Train aa rahi hai', 2000); }
  if (started) { missions.update(dt, t); story.update(dt, t); weapons.update(dt); }
  if (started && t - lastHurt > 6 && state.hp < 100) { state.hp = Math.min(100, state.hp + dt * 5); }
  if (started) {
    updateVehicleDamage(dt);
    if (state.lives <= 0 && !state.open) gameOver(); // popup band kar diya to bhi wapas aaye
    // har 5 minute mein ek lifeline wapas
    if (state.lives < MAX_LIVES) { state.lifeRegen += dt; if (state.lifeRegen > 300) { state.lifeRegen = 0; state.lives++; updateLivesHud(); toast('❤️ Ek lifeline wapas mili!', 2200); } }
  }
  updateHpHud();
  if (world.barberMirror) { const k = npcs.keepers.barber; world.barberMirror.visible = !!k && Math.hypot(active.pos.x - k.x, active.pos.z - k.z) < 14 && state.mode === 'foot'; }
  $('cross').classList.toggle('hidden', !weapons.aiming || weapons.cur === 'sniper');
  $('scope').classList.toggle('hidden', !(weapons.aiming && weapons.cur === 'sniper'));
  autoSaveT -= dt;
  if (autoSaveT <= 0 && started) { autoSaveT = 15; saveGame(); }
  ui3d.update();
  if (started && drawMap) {
    const ex = [];
    for (const c of npcs.cops) ex.push({ x: c.x, z: c.z, c: c.mode === 'chase' ? '#ff3b3b' : '#3b8bff' });
    if (npcs.jeep.active) ex.push({ x: npcs.jeep.x, z: npcs.jeep.z, c: Math.floor(t * 6) % 2 ? '#ff3b3b' : '#3b8bff', r: 5 });
    for (const v of traffic.vehicles) if (v !== car) ex.push({ x: v.pos.x, z: v.pos.z, c: '#cfcfcf', r: 2 });
    if (state.mode === 'foot') ex.push({ x: car.pos.x, z: car.pos.z, c: '#ffd23f', r: 4 });
    const gfN = npcs.girls().find((g) => g.girl.gf);
    if (gfN) ex.push({ x: gfN.x, z: gfN.z, c: '#ff4f9b', r: 4 });
    for (const b of missions.peds().slice(0, 1)) ex.push({ x: b.x, z: b.z, c: '#ff9a1f', r: 6, edge: true });
    const sm = story.marker();
    if (sm) ex.push({ x: sm.x, z: sm.z, c: sm.m ? '#ff3df0' : '#ff4d4d', r: 7, edge: true });
    const mk = missions.marker();
    if (mk) ex.push({ x: mk.x, z: mk.z, c: '#ffd23f', r: 7, edge: true });
    drawMap(active.pos, active.heading, ex);
  }
  if (started) updateObjective(active.pos);
  if (state.scene) updateScene(dt);
  else if (state.cine) updateCine(dt);
  else if (started) {
    const eyeOn = eyeLock.update(dt, t, { mode: state.mode, walker, me, girls: npcs.girls(), blocked: !!(state.open || state.seq || weapons?.aiming || state.wanted > 0 || story?.active) });
    if (!eyeOn) updateCamera(dt, lv);
    updateProximity(); updateStatus();
  }
  else {
    const a = t * 0.12;
    camera.position.set(Math.sin(a) * 34, 20 + Math.sin(t * 0.3) * 3, Math.cos(a) * 34 + 10);
    camera.lookAt(0, 4, 0);
  }
  bloom.strength = (0.75 + lv.bass * 0.6) * (0.45 + 0.55 * env.night) + (state.romance ? 0.25 : 0);
  composer.render();
  requestAnimationFrame(tick);
}

let passedT = 0;
function showPassed(text) {
  const el = $('passed');
  el.textContent = text;
  el.classList.remove('hidden'); el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(passedT);
  passedT = setTimeout(() => el.classList.add('hidden'), 4200);
  beep([523, 659, 784, 1047], 0.14, 'triangle', 0.07);
}
// ---------- BOOT ----------
async function boot() {
  try {
    await Promise.race([
      Promise.all([document.fonts.load('800 64px "Baloo 2"', 'मोहल्ला'), document.fonts.load('700 32px "Baloo 2"', 'abc')]),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  } catch { /* fallback fonts */ }
  world = buildWorld(scene, { isTouch, renderer });
  places = buildPlaces(scene, { CIRCLES, triggers: world.triggers });
  places2 = buildPlaces2(scene, { tree: places.tree });
  animals = buildAnimals(scene, footable);
  couple = buildCouple(scene);
  couples = buildCouples(scene);
  CIRCLES.push({ x: couple.F.x, z: couple.F.z, r: 0.5 });
  rick = makeRickshaw();
  rick.userData.driver.visible = false;
  animals.rickCat.g.position.set(0, 2.92, 0.7);
  animals.rickCat.g.scale.setScalar(1.3);
  rick.add(animals.rickCat.g);
  scene.add(rick);
  rick.position.copy(car.pos);
  ownCar = Object.assign(car, { g: rick, wheels: rick.userData.wheels, seat: new THREE.Vector3(0, 0.72, -0.5), passenger: new THREE.Vector3(0.45, 0.42, 0.95), kind: 'auto', max: 15, radius: 1.0, len: 3.4, own: true });
  traffic = buildTraffic(scene, { isTouch });
  me = makeHuman({ outfit: 'shirt', top: 0x2f5fa8, bottom: 0x1f3a6a, hairStyle: 'short', stache: true, skin: 0xb9774a, hair: 0x111111 });
  rick.add(me.root);
  me.root.position.set(0, 0.72, -0.5);
  setAction(me, 'drive');
  hotel = buildHotel(scene, { triggers: world.triggers, keepers: world.keepers });
  buildHighway(scene, { tree: places.tree, triggers: world.triggers, keepers: world.keepers, defs: { hdhaba: HDHABA } });
  KALLU.keeper = { outfit: 'jacket', top: 0x111111, bottom: 0x222222, shades: true, stache: true, buff: 1, hat: 'cap', capColor: 0x111111 };
  { const k = { id: 'kallu', def: KALLU, x: -123.4, z: 151, heading: -Math.PI / 2, stall: true }; world.keepers.push(k); world.triggers.push({ def: KALLU, x: -121.2, z: 151, heading: Math.PI / 2, r: 3.2, foot: true, keeper: k, front: { x: -116, z: 141 } }); }
  npcs = buildNPCs(scene, { world, places2, isTouch });
  station = buildStation(scene);
  weapons = createWeapons({ scene, camera, me, npcs, targets: shootTargets, toast, sfx: (k) => gunSfx(k), onShot, onHitNpc });
  story = createStory({
    scene, npcs, triggers: world.triggers, lang: () => L(), level: () => missions.level(), toast,
    getP: () => ctxPlayer, dialog, close: () => closeSheets(), bubble: (tg, tx, c) => ui3d.bubble(tg, tx, c),
    giveGun: (g, n) => { weapons.give(g, n); weapons.equip(g); state.weapon = null; toast(`${GUNS[g].n} mila! Right-click/🎯 nishana, click/J goli`, 3000); },
    targets: shootTargets, onRoof: () => state.onRoof, liftPos: LIFT, wanted: () => state.wanted,
    addMoney: (n) => setMoney(state.money + n), addRespect: (n) => missions.addRespect(n),
    missionPassed: (m, r) => { showPassed(MISC3[L()].passed(m.title, r)); saveGame(); },
    sfx: (k) => { if (k === 'glass') noise(0.12, 0.35, 3000); else beep([880, 1320], 0.08, 'sine', 0.05); },
    load: () => { try { return JSON.parse(localStorage.getItem('mohalla.save') || 'null')?.story || 0; } catch { return 0; } }, save: () => saveGame(),
  });
  drawMap = buildMinimap($('minimap'), { triggers: world.triggers });
  ui3d = createUI3D(camera);
  const shopNames = Object.fromEntries(world.triggers.filter((tr) => tr.keeper).map((tr) => [tr.def.id, tr]));
  const DESTS = [
    ['🚂 Station', 0, 440], ['🌙 Prem Ghat', 0, -104], ['🏨 Hotel Raj Palace', 75, 128], ['🏏 Gandhi Park', -112, 140], ['🚓 Thana', 112, 140],
    ['🛕 Mandir', -58, 0], ['🕌 Masjid', 58, 0], ['🎧 Chowk', 0, 14], ['🛍️ Bazaar Gali', -6, 200], ['🍬 Gupta Mishthan', -6, 45], ['☕ Pappu Chai', -6, 20],
  ].map(([name, x, z]) => ({ name, ...roadPoint(x, z) }));
  const drops = world.balconies.map((b) => {
    const gx = b.x - Math.sin(b.heading) * 1.6, gz = b.z - Math.cos(b.heading) * 1.6;
    return { x: gx, z: gz, bx: b.x, by: b.y, bz: b.z };
  }).filter((q) => footable(q.x, q.z));
  missions = createMissions({
    scene, npcs, lang: () => L(), level: () => state.level, toast, camera,
    getP: () => ctxPlayer, getVeh: () => car,
    passed: (title, sub) => showPassed(`${title}  ${sub}`),
    addMoney: (n) => setMoney(state.money + n),
    bubble: (tg, text, cls) => ui3d.bubble(tg, text, cls),
    shopPoint: (id) => { const tr = shopNames[id]; return { x: tr.x, z: tr.z, name: tr.def.name[L()] }; },
    destinations: () => DESTS, dropPoints: () => drops,
    holdItem: (k) => { hold(me, k ? itemMesh(k) : state.weapon ? itemMesh(state.weapon) : null); setOverlay(me, k || state.weapon ? 'hold' : null); },
    isDancing: () => state.mode === 'foot' && !!keys.KeyQ,
    busy: () => !!(state.open || state.scene || state.cine || story?.active),
    jobDone: (k) => story?.jobDone(k),
    sfx: (k, i) => {
      if (k === 'coin') coinSfx();
      else if (k === 'alarm') { glide(900, 1400, 0.25, 'square', 0.03); glide(900, 1400, 0.25, 'square', 0.03, 0.3); }
      else if (k === 'dhol') { glide(i % 2 ? 140 : 90, 50, 0.18, 'sine', 0.22); if (i === 3) noise(0.06, 0.12, 1500); }
    },
    loadRespect: () => { try { return +localStorage.getItem('mohalla.respect') || 0; } catch { return 0; } },
    saveRespect: (v) => { try { localStorage.setItem('mohalla.respect', String(v)); } catch { /* ok */ } },
  });
  loadGame(); // save sirf ek baar boot pe padho
  try { const sv = localStorage.getItem('mohalla.money'); if (sv !== null && +sv >= 0) state.money = +sv; } catch { /* ok */ }
  setRetro(false);
  $('btnRetro').classList.add('on');
  $('btnRetro').textContent = '🎬';
  if (location.search.includes('debug')) window.__m = { state, npcs, walker, get car() { return car; }, openGirl, toggleRide, teleport, openShop, world, interact, get traffic() { return traffic; }, attack, jump, openMusic, music, musicUI, get missions() { return missions; }, get ui3d() { return ui3d; }, get weapons() { return weapons; }, get story() { return story; }, toggleLift, startAim, stopAim, shoot, setAim: (y, p) => { aimYaw = y; aimPitch = p; }, buy: (id, n) => { const tr = world.triggers.find((t) => t.def.id === id); openShop(tr.def, tr); [...document.querySelectorAll('#shopItems .item')].find((b) => b.textContent.includes(n)).click(); } };
  $('money').textContent = state.money;
  updateLivesHud();
  // ☁️ Firebase — background mein; fail ho to game offline chalta hai
  $('btnGoogle').onclick = () => googleLogin();
  setCloudStatus('⏳ Cloud se jud rahe hain…');
  cloud.start().then((ok) => {
    if (!ok) { setCloudStatus('📴 Offline — progress sirf is browser mein'); return; }
    cloud.onUser((u) => {
      setCloudStatus();
      if (u) cloudSync();
      else cloud.loginGuest().catch(() => setCloudStatus('☁️ Google se login karo — progress kabhi nahi khoyega'));
    });
  });
  const btn = $('startBtn');
  btn.disabled = false;
  btn.textContent = 'Mohalla mein ghuso 🛺';
  btn.onclick = () => {
    music.ctxReady();
    started = true;
    $('intro').classList.add('out');
    setTimeout(() => $('intro').remove(), 700);
    camera.position.set(0, 8, 95);
    camLook.set(0, 2, 70);
    beep([523, 659, 784], 0.1, 'triangle', 0.06);
    setTimeout(() => toast(UI[L()].welcome + ' • F = utro/baitho', 4000), 600);
  };
  requestAnimationFrame(tick);
}
boot();
