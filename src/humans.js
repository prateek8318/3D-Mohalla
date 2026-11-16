import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Ek hi material, rang vertex colors mein — hazaar log bhi halke chalein
export const HUMAN_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0.02 });

const SKIN = [0x8d5524, 0xa0673a, 0xb9774a, 0xc68642, 0xd09b6a, 0x7a4a2a, 0xe0ac7e];
const HAIR = [0x0a0a0a, 0x16100b, 0x24170e];
const M_TOPS = [0xffffff, 0x2f5fa8, 0xd94848, 0x3d8f5a, 0xe8c547, 0x7a4ab0, 0xf09a40, 0x4ab0c8, 0xc8b28a, 0xf2e6d0];
const F_TOPS = [0xd81b60, 0xff7a00, 0x8e24aa, 0x00897b, 0xfdd835, 0xe53935, 0x3949ab, 0xff4081, 0x26a69a, 0xffb300];
const M_BOTTOMS = [0x2a2a40, 0x3a3a3a, 0x5a4a3a, 0x1f3a6a, 0xe8e0d0, 0x4a5a3a];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _c = new THREE.Color();
function P(geo, color, pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) {
  _q.setFromEuler(_e.set(rot[0], rot[1], rot[2]));
  _m.compose(_p.set(pos[0], pos[1], pos[2]), _q, _s.set(scl[0], scl[1], scl[2]));
  geo.applyMatrix4(_m);
  _c.set(color);
  const n = geo.attributes.position.count, col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { col[i * 3] = _c.r; col[i * 3 + 1] = _c.g; col[i * 3 + 2] = _c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}
const merge = (parts) => { const g = mergeGeometries(parts, false); parts.forEach((p) => p.dispose()); return g; };
const cap = (r, len, rs = 8) => new THREE.CapsuleGeometry(r, len, 3, rs);
const sph = (r, w = 12, h = 9, ...rest) => new THREE.SphereGeometry(r, w, h, ...rest);
const box = (x, y, z) => new THREE.BoxGeometry(x, y, z);
const cyl = (a, b, h, s = 10) => new THREE.CylinderGeometry(a, b, h, s);

function darker(hex, k = 0.85) { return new THREE.Color(hex).multiplyScalar(k).getHex(); }

// ---------------- geometry builders ----------------
function headGeo(s) {
  const skin = s.skin, hc = s.hair, parts = [];
  parts.push(P(sph(0.12, 14, 11), skin, [0, 0.12, 0], [0, 0, 0], [0.92, 1.08, 1]));
  parts.push(P(box(0.03, 0.05, 0.04), darker(skin, 0.92), [0, 0.1, -0.115]));
  for (const x of [-1, 1]) {
    parts.push(P(sph(0.021, 8, 6), 0xf4f0ea, [x * 0.042, 0.135, -0.097]));
    parts.push(P(sph(0.012, 6, 5), 0x1a120c, [x * 0.042, 0.135, -0.114]));
    parts.push(P(box(0.048, 0.011, 0.012), hc, [x * 0.042, 0.168, -0.108], [0, 0, x * -0.12]));
    parts.push(P(sph(0.028, 6, 5), skin, [x * 0.112, 0.12, 0]));
  }
  for (const x of [-1, 1]) parts.push(P(sph(0.0045, 5, 4), 0xffffff, [x * 0.042 + 0.004, 0.139, -0.125])); // aankh ki chamak ✨
  if (s.female && !s.kid) {
    const blush = new THREE.Color(skin).lerp(new THREE.Color(0xff6f8a), 0.3).getHex();
    for (const x of [-1, 1]) {
      parts.push(P(box(0.05, 0.008, 0.016), 0x0a0606, [x * 0.043, 0.151, -0.112], [0.25, 0, x * -0.14])); // palkein
      parts.push(P(box(0.018, 0.005, 0.01), 0x0a0606, [x * 0.069, 0.143, -0.103], [0, x * 0.5, x * 0.45])); // kajal wing
      parts.push(P(sph(0.024, 7, 5), blush, [x * 0.062, 0.1, -0.098], [0, 0, 0], [1, 0.6, 0.35])); // gaal pe laali
      parts.push(P(sph(0.013, 6, 5), 0xffc23a, [x * 0.116, 0.078, -0.004])); // jhumka
      parts.push(P(new THREE.ConeGeometry(0.014, 0.022, 6), 0xffc23a, [x * 0.116, 0.06, -0.004]));
    }
    parts.push(P(box(0.046, 0.011, 0.012), 0xb81f3c, [0, 0.067, -0.112])); // upar ka hoth
    parts.push(P(box(0.04, 0.013, 0.012), 0xc42a48, [0, 0.055, -0.11], [0.15, 0, 0])); // neeche ka hoth
    parts.push(P(sph(0.008, 6, 4), 0xc0001a, [0, 0.172, -0.113])); // bindi
  } else parts.push(P(box(0.05, 0.012, 0.01), s.female ? 0xa0303a : 0x6a2a2a, [0, 0.062, -0.112]));
  const st = s.hairStyle;
  const capG = (k = 0.5, sc = [0.97, 1.05, 1.04], y = 0.13) => P(sph(0.128, 14, 9, 0, Math.PI * 2, 0, Math.PI * k), hc, [0, y, 0.005], [0, 0, 0], sc);
  if (st === 'short' || st === 'side') {
    parts.push(capG(0.52));
    parts.push(P(box(0.17, 0.035, 0.05), hc, [st === 'side' ? 0.02 : 0, 0.212, -0.085], [0.3, 0, st === 'side' ? -0.15 : 0]));
  } else if (st === 'curly') {
    parts.push(capG(0.5));
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; parts.push(P(sph(0.05, 7, 5), hc, [Math.cos(a) * 0.09, 0.21, Math.sin(a) * 0.09])); }
  } else if (st === 'salman') {
    parts.push(capG(0.6, [1.04, 1.14, 1.1]));
    parts.push(P(sph(0.07, 8, 6), hc, [0.03, 0.235, -0.07], [0, 0, 0], [1.4, 0.8, 1]));
  } else if (st === 'spiky') {
    parts.push(capG(0.45));
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, r = i % 2 ? 0.07 : 0.04;
      const dir = new THREE.Vector3(Math.cos(a) * r, 0.12, Math.sin(a) * r).normalize();
      const g = new THREE.ConeGeometry(0.03, 0.11, 5);
      _q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      _m.compose(_p.set(dir.x * 0.13, 0.13 + dir.y * 0.13, dir.z * 0.13), _q, _s.set(1, 1, 1));
      g.applyMatrix4(_m);
      parts.push(P(g, hc));
    }
  } else if (st === 'mohawk') {
    for (let i = 0; i < 7; i++) {
      const a = -1.2 + i * 0.4;
      parts.push(P(box(0.035, 0.11, 0.06), hc, [0, 0.12 + Math.cos(a) * 0.13, Math.sin(a) * 0.13], [a, 0, 0]));
    }
  } else if (st === 'bald') {
    parts.push(P(new THREE.TorusGeometry(0.11, 0.02, 5, 14, Math.PI), hc, [0, 0.11, 0.01], [Math.PI / 2, 0, Math.PI]));
  } else if (st === 'long' || st === 'bun' || st === 'choti') {
    parts.push(capG(0.56, [1.0, 1.06, 1.06]));
    parts.push(P(box(0.05, 0.03, 0.04), hc, [0.0, 0.215, -0.095], [0.3, 0, 0]));
    if (st === 'long') {
      parts.push(P(box(0.23, 0.36, 0.07), hc, [0, 0.0, 0.09]));
      for (const x of [-1, 1]) parts.push(P(box(0.04, 0.24, 0.07), hc, [x * 0.105, 0.05, -0.02]));
    } else if (st === 'bun') {
      parts.push(P(sph(0.065, 9, 7), hc, [0, 0.16, 0.12]));
      parts.push(P(new THREE.TorusGeometry(0.06, 0.018, 5, 12), 0xfff6e0, [0, 0.16, 0.13]));
    } else {
      for (let i = 0; i < 6; i++) parts.push(P(sph(0.035, 7, 5), hc, [0, 0.06 - i * 0.07, 0.12 + i * 0.004]));
      parts.push(P(sph(0.02, 6, 4), 0xff2d55, [0, -0.36, 0.125]));
    }
  }
  if (s.stache) parts.push(P(box(0.085, 0.022, 0.025), hc, [0, 0.077, -0.114]));
  if (s.beard) parts.push(P(sph(0.1, 10, 8, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), hc, [0, 0.11, -0.012], [0, 0, 0], [0.96, 1.05, 1.0]));
  if (s.female && !s.kid) {
    parts.push(P(sph(0.011, 6, 4), 0xd0001a, [0, 0.168, -0.118]));
    for (const x of [-1, 1]) parts.push(P(sph(0.016, 6, 4), 0xffc83d, [x * 0.115, 0.075, -0.005]));
  }
  if (s.hat === 'police') {
    parts.push(P(cyl(0.135, 0.13, 0.08, 14), 0x9a7f4a, [0, 0.245, 0]));
    parts.push(P(cyl(0.137, 0.137, 0.025, 14), 0x1a1a1a, [0, 0.215, 0]));
    parts.push(P(box(0.15, 0.015, 0.08), 0x111111, [0, 0.207, -0.12], [0.15, 0, 0]));
    parts.push(P(sph(0.02, 6, 4), 0xffc83d, [0, 0.245, -0.135]));
  } else if (s.hat === 'topi') {
    parts.push(P(box(0.2, 0.07, 0.13), 0xfaf8f0, [0, 0.245, 0], [0, 0, 0.05]));
  } else if (s.hat === 'cap') {
    parts.push(P(sph(0.13, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), s.capColor ?? 0xd94848, [0, 0.14, 0]));
    parts.push(P(box(0.14, 0.012, 0.1), s.capColor ?? 0xd94848, [0, 0.2, -0.14]));
  } else if (s.hat === 'pagdi') {
    parts.push(P(sph(0.145, 12, 9, 0, Math.PI * 2, 0, Math.PI * 0.55), 0xff8c1a, [0, 0.14, 0.01], [0, 0, 0], [1.05, 1.15, 1.08]));
  }
  if (s.shades) {
    for (const x of [-1, 1]) parts.push(P(box(0.05, 0.03, 0.012), 0x0a0a0a, [x * 0.043, 0.135, -0.122]));
    parts.push(P(box(0.035, 0.008, 0.01), 0x0a0a0a, [0, 0.145, -0.124]));
  }
  return merge(parts);
}

function torsoGeo(s) {
  const parts = [], o = s.outfit, top = s.top;
  const bw = s.buff || 0;
  parts.push(P(cap(0.155, 0.28, 10), top, [0, 0.29, 0], [0, 0, 0], [1.2 + bw * 0.18, 1 + bw * 0.04, 0.72 + bw * 0.08]));
  if (bw > 0.5 && (o === 'tshirt' || o === 'shirt' || o === 'jacket')) parts.push(P(sph(0.09, 8, 6), top, [0, 0.4, -0.06], [0, 0, 0], [2.4, 0.8, 0.9]));
  parts.push(P(cyl(0.05, 0.055, 0.1, 8), s.skin, [0, 0.56, 0]));
  if (o === 'kurta' || o === 'salwar') parts.push(P(cyl(0.2, 0.25, o === 'salwar' ? 0.55 : 0.45, 12), top, [0, o === 'salwar' ? -0.16 : -0.11, 0]));
  if (o === 'saree') {
    parts.push(P(box(0.05, 0.62, 0.3), s.bottom, [0.02, 0.3, -0.005], [0, 0, 0.62]));
    parts.push(P(cyl(0.12, 0.15, 0.12, 10), s.skin, [0, 0.07, 0]));
  }
  if (o === 'salwar') parts.push(P(new THREE.TorusGeometry(0.17, 0.03, 6, 16), s.dupatta ?? 0xffffff, [0, 0.47, -0.02], [Math.PI / 2 + 0.3, 0, 0], [1, 0.8, 1]));
  if (o === 'police') {
    parts.push(P(cyl(0.17, 0.17, 0.05, 12), 0x2a1a10, [0, 0.03, 0], [0, 0, 0], [1.15, 1, 0.8]));
    parts.push(P(box(0.05, 0.03, 0.02), 0xffc83d, [0.08, 0.38, -0.12]));
  }
  if (o === 'tshirt' && s.print) parts.push(P(box(0.14, 0.12, 0.01), s.print, [0, 0.33, -0.115]));
  if (o === 'shirt') for (let i = 0; i < 3; i++) parts.push(P(sph(0.008, 4, 3), 0xeeeeee, [0, 0.42 - i * 0.09, -0.113]));
  return merge(parts);
}

function pelvisGeo(s) {
  const parts = [], o = s.outfit;
  parts.push(P(sph(0.155, 12, 8), s.bottom, [0, 0, 0], [0, 0, 0], [1.15, 0.7, 0.8]));
  if (o === 'saree') parts.push(P(cyl(0.17, 0.27, 0.9, 14), s.bottom, [0, -0.45, 0]));
  else if (o === 'lungi') parts.push(P(cyl(0.165, 0.2, 0.62, 12), s.bottom, [0, -0.33, 0]));
  else if (o === 'frock') parts.push(P(cyl(0.15, 0.3, 0.42, 12), s.top, [0, -0.2, 0]));
  return merge(parts);
}

const sleeveFull = (o) => ['kurta', 'police', 'salwar', 'jacket'].includes(o);
function upperArmGeo(s) { const b = s.buff || 0; return merge([P(cap(0.05 + b * 0.012, 0.22, 8), s.top, [0, -0.16, 0])]); }
function foreArmGeo(s) {
  const c = sleeveFull(s.outfit) ? s.top : s.skin;
  const b = s.buff || 0;
  return merge([P(cap(0.044 + b * 0.009, 0.2, 8), c, [0, -0.13, 0]), P(sph(0.047, 8, 6), s.skin, [0, -0.28, -0.005], [0, 0, 0], [0.8, 1.1, 0.7])]);
}
function thighGeo(s) {
  const c = s.outfit === 'saree' || s.outfit === 'lungi' ? s.bottom : s.bottom;
  return merge([P(cap(0.072, 0.32, 8), c, [0, -0.22, 0])]);
}
function shinGeo(s) {
  const lower = s.outfit === 'lungi' || s.outfit === 'frock' || (s.kid && s.outfit === 'shirt') ? s.skin : s.bottom;
  const shoe = s.outfit === 'police' ? 0x111111 : s.female ? 0x7a3a20 : 0x2a1a10;
  return merge([P(cap(0.06, 0.32, 8), lower, [0, -0.21, 0]), P(box(0.1, 0.07, 0.24), shoe, [0, -0.44, -0.05])]);
}

// ---------------- the human ----------------
export function makeHuman(o = {}) {
  const female = o.female ?? false, kid = o.kid ?? false;
  const s = {
    female, kid,
    skin: o.skin ?? pick(SKIN),
    top: o.top ?? pick(female ? F_TOPS : M_TOPS),
    bottom: o.bottom ?? (female ? pick(F_TOPS) : pick(M_BOTTOMS)),
    hair: o.hair ?? pick(HAIR),
    hairStyle: o.hairStyle ?? (female ? pick(['long', 'bun', 'choti']) : pick(['short', 'side', 'short', 'curly'])),
    outfit: o.outfit ?? (female ? (kid ? 'frock' : pick(['saree', 'salwar', 'saree'])) : kid ? pick(['shirt', 'tshirt']) : pick(['shirt', 'shirt', 'kurta', 'tshirt', 'lungi'])),
    stache: o.stache ?? (!female && !kid && Math.random() < 0.55),
    buff: o.buff ?? (!female && !kid && !o.old ? 0.5 + Math.random() * 0.5 : 0),
    beard: o.beard ?? false, hat: o.hat ?? null, shades: o.shades ?? false, print: o.print ?? null, dupatta: o.dupatta, capColor: o.capColor,
  };
  if (o.old) { s.hair = 0xd4d4d4; if (!female && Math.random() < 0.5) s.hairStyle = 'bald'; }
  if (s.outfit === 'tshirt' && !s.print && Math.random() < 0.5) s.print = pick([0xffd23f, 0xff3d7f, 0x2ef2ff, 0xffffff]);

  const root = new THREE.Group();
  root.rotation.order = 'YXZ';
  const hips = new THREE.Group(); hips.position.y = 0.95; root.add(hips);
  const spine = new THREE.Group(); spine.position.y = 0.06; hips.add(spine);
  const headPivot = new THREE.Group(); headPivot.position.y = 0.6; spine.add(headPivot);
  const mk = (geo, parent) => { const m = new THREE.Mesh(geo, HUMAN_MAT); m.castShadow = true; parent.add(m); return m; };
  const meshes = {};
  meshes.head = mk(headGeo(s), headPivot);
  meshes.torso = mk(torsoGeo(s), spine);
  meshes.pelvis = mk(pelvisGeo(s), hips);
  const ua = upperArmGeo(s), fa = foreArmGeo(s), th = thighGeo(s), sh = shinGeo(s);
  const limbs = {};
  for (const side of [-1, 1]) {
    const k = side < 0 ? 'L' : 'R';
    const arm = new THREE.Group(); arm.position.set(side * (0.215 + (s.buff || 0) * 0.03), 0.46, 0); spine.add(arm);
    const el = new THREE.Group(); el.position.y = -0.31; arm.add(el);
    const leg = new THREE.Group(); leg.position.set(side * 0.095, 0, 0); hips.add(leg);
    const kn = new THREE.Group(); kn.position.y = -0.45; leg.add(kn);
    meshes['ua' + k] = mk(ua, arm); meshes['fa' + k] = mk(fa, el);
    meshes['th' + k] = mk(th, leg); meshes['sh' + k] = mk(sh, kn);
    limbs['arm' + k] = arm; limbs['el' + k] = el; limbs['leg' + k] = leg; limbs['kn' + k] = kn;
  }
  const hand = new THREE.Object3D(); hand.position.set(0, -0.3, -0.02); limbs.elR.add(hand);
  const handL = new THREE.Object3D(); handL.position.set(0, -0.3, -0.02); limbs.elL.add(handL);
  if (kid) { root.scale.setScalar(0.62); headPivot.scale.setScalar(1.28); }
  if (o.scale) root.scale.multiplyScalar(o.scale);

  const h = {
    spec: s, root, hips, spine, headPivot, hand, handL, meshes, ...limbs,
    aimPitch: 0, action: 'idle', at: 0, phase: Math.random() * 10, speed: 1.3, look: 0, lookX: 0, held: null, rate: 10,
    cur: { ...NEUTRAL }, tgt: { ...NEUTRAL },
  };
  h.rebuild = () => {
    const old = new Set(Object.values(meshes).map((m) => m.geometry));
    meshes.head.geometry = headGeo(s); meshes.torso.geometry = torsoGeo(s); meshes.pelvis.geometry = pelvisGeo(s);
    const a = upperArmGeo(s), f = foreArmGeo(s), t = thighGeo(s), sh2 = shinGeo(s);
    meshes.uaL.geometry = meshes.uaR.geometry = a; meshes.faL.geometry = meshes.faR.geometry = f;
    meshes.thL.geometry = meshes.thR.geometry = t; meshes.shL.geometry = meshes.shR.geometry = sh2;
    old.forEach((g) => g.dispose());
  };
  return h;
}

export function hold(h, obj, left = false) {
  const anchor = left ? h.handL : h.hand;
  if (!left && h.held) { anchor.remove(h.held); }
  if (!left) h.held = obj || null;
  if (obj) anchor.add(obj);
}

export function setAction(h, a) {
  if (h.action !== a) { h.action = a; h.at = 0; }
}

const NEUTRAL = { hy: 0.95, sx: 0, sy: 0, sz: 0, hdx: 0, hdy: 0, aLx: 0, aLz: -0.08, aRx: 0, aRz: 0.08, eL: 0.15, eR: 0.15, lL: 0, lR: 0, kL: 0, kR: 0 };
const KEYS = Object.keys(NEUTRAL);
const clamp01 = (x) => Math.max(0, Math.min(1, x));

function pose(h, t, dt) {
  const T = h.tgt;
  Object.assign(T, NEUTRAL);
  T.hdy = h.look; T.hdx = h.lookX;
  const ph = h.phase;
  let rate = 10;
  switch (h.action) {
    case 'idle':
      T.sx = Math.sin(t * 1.5 + ph) * 0.02;
      T.aLx = Math.sin(t * 1.1 + ph) * 0.05; T.aRx = -T.aLx;
      break;
    case 'walk': case 'run': {
      const run = h.action === 'run';
      h.phase += dt * (run ? 10.5 : 6.2 * Math.max(0.6, h.speed / 1.4));
      const p = h.phase, s = Math.sin(p), amp = run ? 0.8 : 0.48;
      T.lL = s * amp; T.lR = -s * amp;
      T.kL = -(0.1 + (run ? 1.1 : 0.65) * Math.max(0, Math.sin(p + 1.4)));
      T.kR = -(0.1 + (run ? 1.1 : 0.65) * Math.max(0, Math.sin(p + 1.4 + Math.PI)));
      T.aLx = -s * amp * 0.85; T.aRx = s * amp * 0.85;
      T.eL = T.eR = run ? 1.3 : 0.28;
      T.sx = run ? -0.22 : -0.03;
      T.sy = s * 0.08;
      T.hy = 0.95 - Math.abs(Math.cos(p)) * (run ? 0.06 : 0.025);
      rate = 22;
      break;
    }
    case 'sit': case 'cards':
      T.hy = 0.5; T.lL = T.lR = 1.5; T.kL = T.kR = -1.5; T.aLx = T.aRx = 0.45; T.eL = T.eR = 0.7;
      if (h.action === 'cards') { T.aRx = 0.9 + Math.sin(t * 2 + ph) * 0.15; T.eR = 1.2; T.aLx = 0.8; T.eL = 1.1; T.hdx = -0.25; }
      break;
    case 'drive':
      T.hy = 0.5; T.lL = T.lR = 1.45; T.kL = T.kR = -1.3; T.aLx = T.aRx = 1.05; T.eL = T.eR = 0.35; T.aLz = -0.18; T.aRz = 0.18;
      break;
    case 'eat': case 'drink': {
      const c = ((h.at * 0.75 + 0.2) % 1);
      const k = c < 0.3 ? c / 0.3 : c < 0.6 ? 1 : 1 - (c - 0.6) / 0.4;
      const kk = k * k * (3 - 2 * k);
      T.aRx = 0.25 + 1.15 * kk; T.eR = 0.3 + 1.95 * kk; T.aRz = 0.08 - 0.28 * kk;
      if (h.action === 'eat') T.hdx = -0.05 + (c > 0.35 && c < 0.85 ? Math.sin(t * 16) * 0.05 : 0);
      else T.hdx = 0.3 * kk;
      T.aLx = 0.35; T.eL = 0.9;
      rate = 14;
      break;
    }
    case 'talk':
      T.aRx = 0.4 + 0.3 * Math.sin(t * 3 + ph); T.eR = 0.8 + 0.4 * Math.sin(t * 4.3); T.aRz = 0.1;
      T.aLx = 0.25 + 0.2 * Math.sin(t * 2.3 + 1); T.eL = 0.6;
      T.hdy += 0.12 * Math.sin(t * 1.3); T.hdx += 0.05 * Math.sin(t * 5);
      break;
    case 'wave':
      T.aRz = 2.6; T.aRx = 0.2; T.eR = 0.4 + 0.45 * Math.sin(t * 11);
      break;
    case 'slap': {
      const k = clamp01(h.at / 0.32);
      T.aRz = 1.5 - 1.9 * k; T.aRx = 0.5 + 0.9 * k; T.eR = 0.35; T.sy = 0.4 - 0.9 * k;
      rate = 40;
      break;
    }
    case 'aarti':
      T.aLx = T.aRx = 1.0 + 0.25 * Math.sin(t * 2.6); T.aRz = -0.3 + 0.25 * Math.cos(t * 2.6); T.aLz = 0.3 + 0.25 * Math.cos(t * 2.6);
      T.eL = T.eR = 0.9; T.hdx = 0.08;
      break;
    case 'pray':
      T.aLx = T.aRx = 0.85; T.eL = T.eR = 1.45; T.aLz = 0.42; T.aRz = -0.42; T.hdx = -0.15;
      break;
    case 'cut':
      T.aRx = 1.35 + 0.08 * Math.sin(t * 16); T.eR = 1.25; T.aLx = 1.2; T.eL = 1.0; T.aLz = 0.25; T.hdx = -0.3; T.sx = -0.15;
      break;
    case 'bat': {
      const k = clamp01(h.swing ?? 0);
      T.aLx = T.aRx = 0.85; T.aLz = 0.35; T.aRz = -0.35; T.eL = T.eR = 0.55;
      T.sy = 1.0 - 2.2 * k; T.sx = -0.15; T.lL = 0.15; T.lR = -0.15; T.kL = T.kR = -0.2;
      rate = 25;
      break;
    }
    case 'bowl': {
      const k = clamp01(h.at / 0.5);
      T.aRx = -0.4 + 3.6 * k; T.eR = 0.1; T.aLx = 1.2 - 1.0 * k; T.sx = -0.2 * k; T.lL = 0.4; T.lR = -0.3;
      rate = 30;
      break;
    }
    case 'kite':
      T.aLx = 1.9 + 0.1 * Math.sin(t * 5); T.aRx = 1.7 + 0.25 * Math.sin(t * 6 + 1); T.eL = T.eR = 0.3; T.hdx = 0.55;
      break;
    case 'phone':
      T.aRx = 0.35; T.eR = 2.5; T.aRz = -0.25; T.hdy += 0.15 * Math.sin(t * 0.9); T.hdx = -0.05;
      break;
    case 'clothes':
      T.aLx = T.aRx = 1.85 + 0.15 * Math.sin(t * 2 + ph); T.eL = T.eR = 0.2;
      break;
    case 'dance': {
      const b = t * 6.5 + ph, sb = Math.sin(b);
      T.sz = 0.18 * sb; T.sy = 0.15 * Math.sin(b * 0.5);
      T.aLz = -2.2 + 0.5 * sb; T.aRz = 2.2 + 0.5 * sb; T.eL = 0.5 + 0.4 * sb; T.eR = 0.5 - 0.4 * sb;
      T.lL = 0.25 * Math.max(0, sb); T.lR = 0.25 * Math.max(0, -sb); T.kL = -0.5 * Math.max(0, sb); T.kR = -0.5 * Math.max(0, -sb);
      T.hy = 0.93 + 0.025 * Math.sin(b * 2); T.hdx = 0.1 * Math.sin(b);
      rate = 18;
      break;
    }
    case 'yoga': {
      const k = (Math.sin(t * 0.9 + ph) + 1) / 2;
      T.aLz = -3.0 * k - 0.1; T.aRz = 3.0 * k + 0.1; T.hdx = 0.35 * k; T.eL = T.eR = 0;
      break;
    }
    case 'bathe': {
      T.aLx = 1.3 + 0.5 * Math.sin(t * 3 + ph); T.aRx = 1.3 + 0.5 * Math.sin(t * 3 + ph + Math.PI);
      T.eL = T.eR = 0.6; T.aLz = -0.4; T.aRz = 0.4;
      break;
    }
    case 'row':
      T.aLx = T.aRx = 0.9 + 0.5 * Math.sin(t * 1.6); T.eL = T.eR = 0.6 + 0.4 * Math.sin(t * 1.6 + 1); T.sx = -0.15 + 0.15 * Math.sin(t * 1.6);
      T.lL = 0.3; T.kL = -0.4;
      break;
    case 'fall':
      T.aLz = -1.3; T.aRz = 1.3; T.lL = 0.3; T.lR = -0.2; T.kL = -0.6;
      break;
    case 'hands':
      T.aLz = -0.35; T.aRz = 0.35; T.aLx = T.aRx = 0.2; T.eL = T.eR = 1.6;
      break;
    case 'point':
      T.aRx = 1.5; T.eR = 0.05; T.hdx = 0;
      break;
    case 'hug':
      T.aLx = T.aRx = 1.35; T.eL = T.eR = 1.25; T.aLz = 0.55; T.aRz = -0.55; T.hdy += 0.4; T.sx = -0.08;
      break;
    case 'jump':
      T.lL = 0.7; T.lR = 0.3; T.kL = -1.2; T.kR = -0.8; T.aLz = -0.9; T.aRz = 0.9; T.aLx = T.aRx = 0.4; T.sx = -0.1;
      rate = 18;
      break;
    case 'hurt':
      T.sx = 0.35; T.aLx = T.aRx = 0.9; T.eL = T.eR = 1.6; T.aLz = 0.3; T.aRz = -0.3; T.hdx = 0.3; T.kL = T.kR = -0.3;
      rate = 25;
      break;
    default: break;
  }
  // upar ka hissa alag: chalte-daudte khana, maarna, patang
  const ov = h.overlay;
  if (ov) {
    h.ot += dt;
    const ot = h.ot;
    if (ov === 'eat' || ov === 'drink') {
      const c = ((ot * 0.75 + 0.2) % 1);
      const k = c < 0.3 ? c / 0.3 : c < 0.6 ? 1 : 1 - (c - 0.6) / 0.4;
      const kk = k * k * (3 - 2 * k);
      T.aRx = 0.25 + 1.15 * kk; T.eR = 0.3 + 1.95 * kk; T.aRz = 0.08 - 0.28 * kk;
      if (ov === 'eat') T.hdx = -0.05 + (c > 0.35 && c < 0.85 ? Math.sin(t * 16) * 0.05 : 0);
      else T.hdx = 0.3 * kk;
      rate = Math.max(rate, 14);
    } else if (ov === 'punch') {
      const k = clamp01(ot / 0.14), back = clamp01((ot - 0.2) / 0.2);
      const p = k * (1 - back);
      T.aRx = 0.4 + 1.2 * p; T.eR = 1.8 - 1.75 * p; T.aRz = 0.05; T.sy = -0.5 * p; T.aLx = 0.9; T.eL = 1.8; T.aLz = 0.2;
      rate = 40;
    } else if (ov === 'swing') {
      const k = clamp01(ot / 0.3);
      T.aRx = 2.6 - 1.9 * k; T.eR = 0.3; T.aRz = -0.3 + 0.6 * k; T.sy = 0.5 - 1.1 * k; T.aLx = 2.2 - 1.6 * k; T.eL = 0.5; T.aLz = 0.5;
      rate = 35;
    } else if (ov === 'smoke') {
      const k = Math.sin(Math.min(1, ot / 1.6) * Math.PI);
      T.aRx = 0.3 + 1.2 * k; T.eR = 0.4 + 1.9 * k; T.aRz = 0.05 - 0.3 * k; T.hdx = 0.08 * k;
      rate = Math.max(rate, 12);
    } else if (ov === 'aim' || ov === 'aim2') {
      T.aRx = 1.5 + h.aimPitch; T.eR = 0.05; T.aRz = -0.05; T.sy = 0;
      if (ov === 'aim2') { T.aLx = 1.45 + h.aimPitch; T.eL = 0.5; T.aLz = 0.45; } else { T.aLx = 0.3; T.eL = 0.4; }
      T.hdx = -h.aimPitch * 0.6;
      rate = 30;
    } else if (ov === 'kite') {
      T.aLx = 1.9 + 0.1 * Math.sin(t * 5); T.aRx = 1.7 + 0.25 * Math.sin(t * 6 + 1); T.eL = T.eR = 0.3; T.hdx = 0.5;
    } else if (ov === 'hold') {
      T.aRx = Math.max(T.aRx, 0.5); T.eR = Math.max(T.eR, 0.9);
    }
  }
  return rate;
}

export function setOverlay(h, ov) {
  if (h.overlay !== ov) { h.overlay = ov; h.ot = 0; }
}

export function updateHuman(h, dt, t) {
  h.at += dt;
  const rate = pose(h, t, dt);
  const a = 1 - Math.exp(-dt * rate);
  const C = h.cur, T = h.tgt;
  for (const k of KEYS) C[k] += (T[k] - C[k]) * a;
  h.hips.position.y = C.hy;
  h.spine.rotation.set(C.sx, C.sy, C.sz);
  h.headPivot.rotation.set(C.hdx, C.hdy, 0);
  h.armL.rotation.set(C.aLx, 0, C.aLz); h.armR.rotation.set(C.aRx, 0, C.aRz);
  h.elL.rotation.x = C.eL; h.elR.rotation.x = C.eR;
  h.legL.rotation.x = C.lL; h.legR.rotation.x = C.lR;
  h.knL.rotation.x = C.kL; h.knR.rotation.x = C.kR;
}

// ---------------- haath mein saaman ----------------
const IM = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, ...o });
export function itemMesh(kind) {
  const g = new THREE.Group();
  const add = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; };
  switch (kind) {
    case 'laddoo': add(sph(0.045), IM(0xffa31a)); break;
    case 'white': add(sph(0.045), IM(0xfff4e0)); break;
    case 'brown': add(sph(0.045), IM(0x6b2e12)); break;
    case 'jalebi': add(new THREE.TorusGeometry(0.04, 0.014, 6, 14), IM(0xff9a00, { emissive: 0x331a00 })).rotation.x = Math.PI / 2; break;
    case 'samosa': add(new THREE.TetrahedronGeometry(0.06), IM(0xd9a441)); break;
    case 'cup': add(cyl(0.035, 0.028, 0.07, 10), IM(0xa0522d)); add(cyl(0.03, 0.03, 0.005, 10), IM(0xc8a070), 0, 0.034, 0); break;
    case 'glass': add(cyl(0.035, 0.03, 0.1, 10), IM(0xfff4c8, { transparent: true, opacity: 0.8 })); break;
    case 'bottle': add(cyl(0.025, 0.03, 0.14, 10), IM(0x2a0f08, { metalness: 0.3, roughness: 0.15 })); add(cyl(0.012, 0.02, 0.04, 8), IM(0x2a0f08), 0, 0.09, 0); break;
    case 'paan': add(new THREE.ConeGeometry(0.04, 0.08, 4), IM(0x2f9e3a)).rotation.x = Math.PI; break;
    case 'plate': add(cyl(0.09, 0.08, 0.015, 14), IM(0xcccccc, { metalness: 0.8, roughness: 0.3 })); for (let i = 0; i < 4; i++) add(sph(0.025, 6, 5), IM(0xd9a441), Math.cos(i) * 0.04, 0.02, Math.sin(i) * 0.04); break;
    case 'kulfi': add(cyl(0.004, 0.004, 0.08, 4), IM(0xc8a070), 0, -0.05, 0); add(cyl(0.022, 0.028, 0.08, 8), IM(0xffe7b0), 0, 0.02, 0); break;
    case 'lolly': add(cyl(0.004, 0.004, 0.08, 4), IM(0xc8a070), 0, -0.05, 0); add(box(0.04, 0.07, 0.02), IM(0xff2d55, { emissive: 0x330010 }), 0, 0.02, 0); break;
    case 'biscuit': add(box(0.08, 0.05, 0.02), IM(0xffc800)); break;
    case 'gulab': add(cyl(0.005, 0.005, 0.25, 4), IM(0x2f8a2f), 0, 0.08, 0); add(sph(0.035, 8, 6), IM(0xd0001a, { emissive: 0x300000 }), 0, 0.22, 0); break;
    case 'bouquet': add(new THREE.ConeGeometry(0.06, 0.22, 8), IM(0xfff0f5), 0, 0.05, 0).rotation.x = Math.PI; for (let i = 0; i < 5; i++) add(sph(0.03, 7, 5), IM([0xd0001a, 0xff4f8b, 0xffd23f][i % 3]), Math.cos(i * 1.3) * 0.04, 0.18, Math.sin(i * 1.3) * 0.04); break;
    case 'gift': add(box(0.08, 0.06, 0.08), IM(0xff3d7f)); add(box(0.085, 0.01, 0.02), IM(0xffd23f), 0, 0.031, 0); break;
    case 'lathi': add(cyl(0.015, 0.015, 1.1, 6), IM(0x6b4423), 0, -0.2, 0); break;
    case 'thali': {
      add(cyl(0.13, 0.12, 0.02, 16), IM(0xffc83d, { metalness: 0.9, roughness: 0.25 }));
      const fl = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.5, 0.3), toneMapped: false });
      for (let i = 0; i < 5; i++) add(sph(0.018, 6, 4), fl, Math.cos(i * 1.256) * 0.08, 0.03, Math.sin(i * 1.256) * 0.08);
      break;
    }
    case 'scissors': add(box(0.015, 0.1, 0.005), IM(0xdddddd, { metalness: 1, roughness: 0.2 })); break;
    case 'bat': add(box(0.07, 0.5, 0.025), IM(0xe0c08a), 0, -0.32, 0); add(cyl(0.015, 0.015, 0.18, 6), IM(0x222222), 0, -0.02, 0); break;
    case 'phone': add(box(0.03, 0.1, 0.02), IM(0x111111)); break;
    case 'cig': {
      add(cyl(0.006, 0.006, 0.07, 6), IM(0xf4f0e6), 0, 0, 0);
      add(sph(0.008, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 0.8, 0.1), toneMapped: false }), 0, 0.037, 0);
      break;
    }
    case 'katta': {
      const gm = IM(0x2a2a2a, { metalness: 0.7, roughness: 0.35 });
      add(box(0.035, 0.04, 0.22), gm, 0, 0.0, -0.08).rotation.x = 0;
      add(box(0.03, 0.1, 0.045), IM(0x5a3a22), 0, -0.06, 0.02);
      g.userData.muzzle = new THREE.Vector3(0, 0, -0.2);
      break;
    }
    case 'dunali': {
      const gm = IM(0x1a1a1a, { metalness: 0.7, roughness: 0.35 });
      for (const x of [-0.013, 0.013]) add(cyl(0.012, 0.012, 0.6, 8), gm, x, 0.01, -0.32).rotation.x = Math.PI / 2;
      add(box(0.05, 0.07, 0.35), IM(0x6b4423), 0, -0.02, 0.12);
      g.userData.muzzle = new THREE.Vector3(0, 0.01, -0.62);
      break;
    }
    case 'sniper': {
      const gm = IM(0x2a3a2a, { metalness: 0.5, roughness: 0.5 });
      add(cyl(0.011, 0.011, 0.8, 8), IM(0x111111, { metalness: 0.8 }), 0, 0.02, -0.45).rotation.x = Math.PI / 2;
      add(box(0.05, 0.08, 0.5), gm, 0, -0.01, 0.05);
      add(cyl(0.025, 0.025, 0.22, 10), IM(0x111111), 0, 0.075, -0.05).rotation.x = Math.PI / 2;
      g.userData.muzzle = new THREE.Vector3(0, 0.02, -0.85);
      break;
    }
    case 'balloon': add(cyl(0.002, 0.002, 0.8, 3), IM(0xffffff), 0, 0.4, 0); add(sph(0.12, 12, 10), IM(0xff2d55, { emissive: 0x220008 }), 0, 0.85, 0).scale.y = 1.2; break;
    default: add(sph(0.04), IM(0xffa31a));
  }
  g.rotation.x = -Math.PI / 2;
  return g;
}
