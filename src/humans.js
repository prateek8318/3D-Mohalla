import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { wantModel, driveModel } from './people.js';

// Ek hi material, rang vertex colors mein — hazaar log bhi halke chalein
export const HUMAN_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0.02 });

const SKIN = [0x8d5524, 0xa0673a, 0xb9774a, 0xc68642, 0xd09b6a, 0x7a4a2a, 0xe0ac7e];
const HAIR = [0x0a0a0a, 0x16100b, 0x24170e];
const M_TOPS = [0xffffff, 0x2f5fa8, 0xd94848, 0x3d8f5a, 0xe8c547, 0x7a4ab0, 0xf09a40, 0x4ab0c8, 0xc8b28a, 0xf2e6d0];
const F_TOPS = [0xd81b60, 0xff7a00, 0x8e24aa, 0x00897b, 0xfdd835, 0xe53935, 0x3949ab, 0xff4081, 0x26a69a, 0xffb300];
const M_BOTTOMS = [0x2a2a40, 0x3a3a3a, 0x5a4a3a, 0x1f3a6a, 0xe8e0d0, 0x4a5a3a];
const DENIM = [0x2b4a7a, 0x1f3358, 0x3d6aa0, 0x16213a, 0x5a7fb0];
const isModernF = (o) => o === 'jeans' || o === 'crop';
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
  // baal ki topi peeche jhuki hui — taaki maatha aur aankhein dikhein (pehle aankhon tak aa jaati thi)
  const capG = (k = 0.5, sc = [0.97, 1.05, 1.04], y = 0.13) => P(sph(0.128, 14, 9, 0, Math.PI * 2, 0, Math.PI * k), hc, [0, y, 0.012], [0.62, 0, 0], sc);
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
  } else if (st === 'long' || st === 'bun' || st === 'choti' || st === 'pony' || st === 'open') {
    parts.push(capG(0.56, [1.0, 1.06, 1.06]));
    parts.push(P(box(0.05, 0.03, 0.04), hc, [0.0, 0.215, -0.095], [0.3, 0, 0]));
    if (st === 'pony') {
      parts.push(P(sph(0.04, 8, 6), hc, [0, 0.22, 0.1]));
      parts.push(P(new THREE.TorusGeometry(0.03, 0.01, 5, 10), s.tie ?? 0xff3d7f, [0, 0.215, 0.115], [0.6, 0, 0]));
      parts.push(P(new THREE.ConeGeometry(0.05, 0.34, 8), hc, [0, 0.04, 0.15], [Math.PI - 0.25, 0, 0]));
    } else if (st === 'open') { // khule lehrate baal + side maang
      parts.push(P(box(0.25, 0.42, 0.08), hc, [0, -0.03, 0.09]));
      for (const x of [-1, 1]) parts.push(P(box(0.05, 0.34, 0.08), hc, [x * 0.11, 0.0, -0.01], [0, 0, x * 0.06]));
    } else if (st === 'long') {
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
    // asli safa: lapet wali patti + upar gumbad + aage kalgi (pehle naak tak chehra dhak leta tha)
    const pc = s.pagdiColor ?? 0xff8c1a, pd = darker(pc, 0.8);
    parts.push(P(cyl(0.142, 0.13, 0.1, 16), pc, [0, 0.235, 0.008], [0.12, 0, 0]));
    parts.push(P(sph(0.138, 14, 9, 0, Math.PI * 2, 0, Math.PI * 0.5), pc, [0, 0.275, 0.016], [0.12, 0, 0], [1, 0.62, 1]));
    for (let i = 0; i < 3; i++) parts.push(P(new THREE.TorusGeometry(0.136 - i * 0.004, 0.012, 5, 18), pd, [0, 0.2 + i * 0.035, 0.004 + i * 0.004], [Math.PI / 2 + 0.12 + (i - 1) * 0.18, 0, 0]));
    parts.push(P(sph(0.022, 8, 6), 0xffd23f, [0, 0.255, -0.142])); // aage ka nag
    if (s.kalgi) parts.push(P(new THREE.ConeGeometry(0.012, 0.12, 5), 0xfff6e0, [0.02, 0.32, -0.12], [-0.3, 0, -0.2]));
    parts.push(P(box(0.07, 0.2, 0.02), pc, [0.03, 0.12, 0.13], [0.15, 0, 0.1])); // peeche latakta chhor
  } else if (s.hat === 'gandhi') {
    // neta ji ki safed nav-topi (aage se peeche lambi)
    parts.push(P(box(0.15, 0.06, 0.25), 0xfbfbf6, [0, 0.235, 0.0], [0.1, 0, 0]));
    parts.push(P(box(0.025, 0.035, 0.24), 0xe6e6dd, [0, 0.275, 0.0], [0.1, 0, 0]));
  }
  if (s.shikha) parts.push(P(new THREE.ConeGeometry(0.018, 0.09, 6), hc === 0xd4d4d4 ? 0x9a9a9a : hc, [0, 0.27, 0.06], [0.7, 0, 0])); // pandit ki choti
  // maathe pe tilak
  if (s.tilak === 'tripund') {
    for (let i = 0; i < 3; i++) parts.push(P(box(0.07 - i * 0.008, 0.006, 0.006), 0xfff2c8, [0, 0.181 + i * 0.01, -0.104 + i * 0.004], [-0.55, 0, 0]));
    parts.push(P(sph(0.008, 6, 4), 0xd0001a, [0, 0.19, -0.107]));
  } else if (s.tilak === 'lal') {
    parts.push(P(box(0.012, 0.04, 0.006), 0xd0001a, [0, 0.19, -0.104], [-0.5, 0, 0]));
  }
  if (s.shades) {
    for (const x of [-1, 1]) parts.push(P(box(0.05, 0.03, 0.012), 0x0a0a0a, [x * 0.043, 0.135, -0.122]));
    parts.push(P(box(0.035, 0.008, 0.01), 0x0a0a0a, [0, 0.145, -0.124]));
  } else if (s.specs) { // gol chashma
    for (const x of [-1, 1]) {
      parts.push(P(new THREE.TorusGeometry(0.024, 0.0045, 5, 14), 0x3a2a1a, [x * 0.043, 0.135, -0.124]));
      parts.push(P(box(0.005, 0.005, 0.11), 0x3a2a1a, [x * 0.105, 0.14, -0.07]));
    }
    parts.push(P(box(0.02, 0.005, 0.005), 0x3a2a1a, [0, 0.14, -0.126]));
  }
  if (s.female && !s.kid) {
    if (s.nath) { // naak ki nath
      parts.push(P(new THREE.TorusGeometry(0.017, 0.0028, 5, 14), 0xffc83d, [0.018, 0.085, -0.128], [0, 0.5, 0]));
      parts.push(P(sph(0.005, 5, 4), 0xff2d55, [0.03, 0.073, -0.13]));
    }
    if (s.tikka) { // maang tikka
      parts.push(P(box(0.004, 0.06, 0.004), 0xffc83d, [0, 0.23, -0.1], [-0.6, 0, 0]));
      parts.push(P(sph(0.013, 7, 5), 0xffc83d, [0, 0.198, -0.108]));
      parts.push(P(sph(0.007, 5, 4), 0xff2d55, [0, 0.198, -0.12]));
    }
    if (s.hoops) for (const x of [-1, 1]) parts.push(P(new THREE.TorusGeometry(0.024, 0.004, 5, 14), 0xffc83d, [x * 0.117, 0.055, -0.004], [0, Math.PI / 2, 0]));
    if (s.gajra) { // baalon mein mogra
      const at = st === 'bun' ? [0, 0.16, 0.12, 0.075] : st === 'pony' ? [0, 0.215, 0.105, 0.05] : [0, 0.14, 0.08, 0.11];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        parts.push(P(sph(0.013, 6, 4), i % 4 ? 0xfffdf0 : 0xff8fb0, [at[0] + Math.cos(a) * at[3], at[1] + Math.sin(a) * at[3], at[2] + 0.02]));
      }
    }
    if (s.ghoonghat) { // pallu sar pe
      parts.push(P(sph(0.148, 14, 9, 0, Math.PI * 2, 0, Math.PI * 0.55), s.pallu ?? s.bottom, [0, 0.13, 0.02], [0.75, 0, 0], [1.02, 1.08, 1.06]));
      parts.push(P(box(0.26, 0.3, 0.03), s.pallu ?? s.bottom, [0, -0.02, 0.13], [-0.15, 0, 0]));
    }
  }
  return merge(parts);
}

function torsoGeo(s) {
  const parts = [], o = s.outfit, top = s.top;
  const bw = s.buff || 0, fem = s.female && !s.kid;
  const topD = darker(top, 0.88);
  // kamar (patli) → seena (chauda) → kandhe: putle jaisa ek capsule nahi
  const crop = o === 'crop' || o === 'lehenga'; // lehenga ki choli bhi chhoti
  parts.push(P(cyl(fem ? 0.135 : 0.15, fem ? 0.145 : 0.155, 0.27, 12), crop ? s.skin : top, [0, 0.13, 0], [0, 0, 0], [1.08 + bw * 0.06, 1, 0.74]));
  if (crop) {
    parts.push(P(sph(0.008, 5, 4), darker(s.skin, 0.7), [0, 0.1, -0.106])); // naabhi
    parts.push(P(cyl(0.155, 0.15, 0.06, 12), darker(top, 0.85), [0, 0.27, 0], [0, 0, 0], [1.08, 1, 0.76])); // crop top ka kinara
  }
  parts.push(P(sph(0.19, 14, 10), top, [0, 0.35, 0], [0, 0, 0], [fem ? 1.0 : 1.13 + bw * 0.16, 0.95, 0.74 + bw * 0.07]));
  parts.push(P(cap(0.06 + bw * 0.008, 0.28 + bw * 0.03, 8), top, [0, 0.45, 0.01], [0, 0, Math.PI / 2], [1, 0.9, 0.85]));
  // trapezius — gardan se kandhe tak dhalaan
  for (const x of [-1, 1]) parts.push(P(sph(0.07 + bw * 0.01, 8, 6), top, [x * 0.085, 0.5, 0.02], [0, 0, x * 0.5], [1.4, 0.7, 0.9]));
  if (fem) parts.push(P(sph(0.075, 10, 8), top, [0, 0.36, -0.07], [0, 0, 0], [2.1, 0.85, 0.75]));
  else if (bw > 0.4 && o !== 'kurta' && o !== 'police') for (const x of [-1, 1]) parts.push(P(sph(0.085, 8, 6), top, [x * 0.075, 0.385, -0.075], [0, 0, 0], [1.1, 0.75, 0.55])); // seena 💪
  parts.push(P(cyl(0.052, 0.06, 0.12, 8), s.skin, [0, 0.555, 0]));
  // kapdon ki detail
  if (o === 'shirt' || o === 'police') {
    for (const x of [-1, 1]) parts.push(P(box(0.07, 0.012, 0.05), topD, [x * 0.04, 0.535, -0.06], [0.5, x * 0.6, x * 0.5])); // collar
    parts.push(P(box(0.012, 0.42, 0.006), topD, [0, 0.28, -0.141])); // button patti
    for (let i = 0; i < 4; i++) parts.push(P(sph(0.008, 4, 3), 0xeeeeee, [0, 0.44 - i * 0.1, -0.145]));
    parts.push(P(box(0.05, 0.05, 0.006), topD, [0.075, 0.38, -0.138])); // jeb
  } else if (o === 'tshirt' || o === 'jeans') {
    parts.push(P(new THREE.TorusGeometry(0.058, 0.012, 5, 14), topD, [0, 0.53, -0.005], [Math.PI / 2, 0, 0], [1, 1.1, 1]));
  } else if (o === 'crop') {
    for (const x of [-1, 1]) parts.push(P(box(0.025, 0.12, 0.012), top, [x * 0.09, 0.5, -0.04], [0.2, 0, x * -0.15])); // patli strap
  } else if (o === 'kurta' || o === 'salwar') {
    parts.push(P(cyl(0.2, 0.25, o === 'salwar' ? 0.55 : 0.5, 12), top, [0, o === 'salwar' ? -0.16 : -0.14, 0], [0, 0, 0], [1, 1, 0.82]));
    if (o === 'kurta') {
      parts.push(P(cyl(0.062, 0.066, 0.04, 10), topD, [0, 0.535, 0])); // band collar
      parts.push(P(box(0.02, 0.2, 0.006), topD, [0, 0.42, -0.142]));
      for (let i = 0; i < 3; i++) parts.push(P(sph(0.008, 4, 3), 0xd4af37, [0, 0.5 - i * 0.06, -0.146]));
    }
  } else if (o === 'jacket') {
    for (const x of [-1, 1]) parts.push(P(box(0.11, 0.42, 0.02), darker(top, 0.7), [x * 0.075, 0.3, -0.135], [0, x * -0.25, 0])); // khula jacket
    parts.push(P(box(0.1, 0.38, 0.01), s.inner ?? 0xf2f2f2, [0, 0.3, -0.13]));
  }
  if (o === 'saree') {
    parts.push(P(box(0.05, 0.62, 0.3), s.bottom, [0.02, 0.3, -0.005], [0, 0, 0.62]));
    parts.push(P(cyl(0.12, 0.15, 0.12, 10), s.skin, [0, 0.07, 0]));
  }
  if (o === 'salwar') parts.push(P(new THREE.TorusGeometry(0.17, 0.03, 6, 16), s.dupatta ?? 0xffffff, [0, 0.47, -0.02], [Math.PI / 2 + 0.3, 0, 0], [1, 0.8, 1]));
  if (o === 'police') {
    parts.push(P(cyl(0.17, 0.17, 0.05, 12), 0x2a1a10, [0, 0.03, 0], [0, 0, 0], [1.15, 1, 0.8]));
    parts.push(P(box(0.05, 0.03, 0.02), 0xffc83d, [0.08, 0.38, -0.14]));
    for (const x of [-1, 1]) parts.push(P(box(0.08, 0.015, 0.06), 0x6a5a30, [x * 0.17, 0.5, 0], [0, 0, x * -0.2])); // epaulette
  }
  if (o === 'tshirt' && s.print) parts.push(P(box(0.14, 0.12, 0.01), s.print, [0, 0.33, -0.14]));
  if (o === 'lehenga') { // choli ka sunehra kinara + kandhe pe dupatta
    parts.push(P(new THREE.TorusGeometry(0.15, 0.01, 5, 18), 0xffc83d, [0, 0.27, 0], [Math.PI / 2, 0, 0], [1.08, 0.76, 1]));
    parts.push(P(box(0.05, 0.62, 0.3), s.dupatta ?? 0xffd23f, [-0.02, 0.3, -0.005], [0, 0, -0.62]));
  }
  // 🫃 tond (thulla / neta)
  if (s.belly) parts.push(P(sph(0.16, 12, 9), s.vest ?? top, [0, 0.17, -0.05], [0, 0, 0], [1.05, 0.95, 0.9 + s.belly * 0.15]));
  // neta ki sadri (Nehru jacket)
  if (s.vest != null) {
    const vd = darker(s.vest, 0.85);
    parts.push(P(cyl(0.16, 0.17, 0.32, 12), s.vest, [0, 0.21, 0], [0, 0, 0], [1.12, 1, 0.8 + (s.belly ? 0.08 : 0)]));
    parts.push(P(sph(0.196, 14, 10, 0, Math.PI * 2, Math.PI * 0.18, Math.PI * 0.5), s.vest, [0, 0.35, 0], [0, 0, 0], [1.16, 0.95, 0.77]));
    for (let i = 0; i < 4; i++) parts.push(P(sph(0.01, 5, 4), 0xd4af37, [0, 0.44 - i * 0.07, -0.152 - (s.belly && i > 1 ? 0.045 * (i - 1) : 0)]));
    parts.push(P(cyl(0.066, 0.07, 0.04, 10), vd, [0, 0.535, 0]));
  }
  // pandit ki rudraksh mala
  if (s.mala) for (let i = 0; i <= 16; i++) { // gale se seene tak latakti
    const a = (i / 16) * Math.PI, sn = Math.sin(a);
    parts.push(P(sph(0.013, 6, 4), 0x5a2e14, [Math.cos(a) * 0.085, 0.51 - sn * 0.2, -0.07 - sn * 0.085]));
  }
  // genda ki mala (neta / dulha)
  if (s.garland) for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
    parts.push(P(sph(0.028, 7, 5), i % 2 ? 0xff8c00 : 0xffcf1a, [c * 0.12, sn < 0 ? 0.47 + sn * 0.24 : 0.5 + sn * 0.02, sn < 0 ? -0.1 + sn * 0.05 : -0.05 + sn * 0.12]));
  }
  // angvastra (kandhe pe dupatta)
  if (s.angvastra != null) {
    parts.push(P(box(0.06, 0.6, 0.025), s.angvastra, [0.07, 0.28, -0.13], [0.1, 0, 0.5]));
    parts.push(P(box(0.07, 0.45, 0.02), s.angvastra, [0.15, 0.3, 0.12], [-0.1, 0, -0.3]));
  }
  // dukaandaar ka gamchha (kandhe pe laal-safed)
  if (s.gamchha) {
    for (const z of [-1, 1]) {
      parts.push(P(box(0.09, 0.3, 0.015), 0xc62828, [0.13, 0.37, z * 0.13], [z * 0.15, 0, 0]));
      parts.push(P(box(0.092, 0.025, 0.017), 0xffffff, [0.13, 0.3, z * 0.13 + z * 0.008], [z * 0.15, 0, 0]));
    }
    parts.push(P(box(0.1, 0.03, 0.27), 0xc62828, [0.13, 0.51, 0]));
  }
  if (s.apron != null) { // halwai/chai wale ka apron
    parts.push(P(box(0.26, 0.34, 0.012), s.apron, [0, 0.2, -0.13 - (s.belly ? 0.06 : 0)]));
    parts.push(P(box(0.008, 0.16, 0.006), s.apron, [0.06, 0.44, -0.12], [0, 0, -0.25]));
    parts.push(P(box(0.008, 0.16, 0.006), s.apron, [-0.06, 0.44, -0.12], [0, 0, 0.25]));
  }
  // 🦸 hero: sone ki chain
  if (s.hero) {
    parts.push(P(new THREE.TorusGeometry(0.078, 0.009, 5, 22), 0xffc83d, [0, 0.5, -0.03], [Math.PI / 2 - 0.55, 0, 0]));
    parts.push(P(box(0.025, 0.035, 0.008), 0xffc83d, [0, 0.43, -0.105], [0.3, 0, Math.PI / 4]));
  }
  return merge(parts);
}

function pelvisGeo(s) {
  const parts = [], o = s.outfit;
  parts.push(P(sph(0.155, 12, 8), s.bottom, [0, -0.01, 0], [0, 0, 0], [1.12, 0.72, 0.82]));
  if (o === 'saree') parts.push(P(cyl(0.17, 0.27, 0.9, 14), s.bottom, [0, -0.45, 0]));
  else if (o === 'lungi') parts.push(P(cyl(0.165, 0.2, 0.62, 12), s.bottom, [0, -0.33, 0]));
  else if (o === 'frock') parts.push(P(cyl(0.15, 0.3, 0.42, 12), s.top, [0, -0.2, 0]));
  else if (o === 'lehenga') { // ghera lehenga + sunehri kinari
    parts.push(P(cyl(0.165, 0.36, 0.93, 18), s.bottom, [0, -0.45, 0]));
    parts.push(P(cyl(0.362, 0.368, 0.06, 18), 0xffc83d, [0, -0.89, 0]));
    parts.push(P(cyl(0.255, 0.26, 0.025, 18), 0xffc83d, [0, -0.45, 0]));
    parts.push(P(cyl(0.168, 0.168, 0.04, 14), 0xffc83d, [0, 0.03, 0], [0, 0, 0], [1.1, 1, 0.85]));
  }
  if (s.dhoti) { // pandit ki dhoti (pinddi tak)
    parts.push(P(cyl(0.17, 0.22, 0.72, 12), s.bottom, [0, -0.36, 0]));
    parts.push(P(box(0.05, 0.7, 0.02), darker(s.bottom, 0.9), [0, -0.36, -0.19], [-0.07, 0, 0]));
    parts.push(P(cyl(0.222, 0.224, 0.03, 12), 0xd4af37, [0, -0.71, 0]));
  }
  if (s.apron != null) parts.push(P(box(0.27, 0.32, 0.012), s.apron, [0, -0.13, -0.15]));
  // patloon pe belt
  if (['shirt', 'tshirt', 'jacket', 'police', 'jeans', 'crop'].includes(o) && !s.kid) {
    parts.push(P(cyl(0.165, 0.165, 0.045, 14), o === 'police' ? 0x3a2410 : 0x231509, [0, 0.075, 0], [0, 0, 0], [1.1, 1, 0.84]));
    parts.push(P(box(0.05, 0.035, 0.01), 0xd4af37, [0, 0.075, -0.142]));
  }
  return merge(parts);
}

const sleeveFull = (o) => ['kurta', 'police', 'salwar', 'jacket'].includes(o);
function upperArmGeo(s) {
  const b = s.buff || 0, parts = [];
  const r = (s.female ? 0.044 : 0.05) + b * 0.014;
  if (s.outfit === 'crop') { // bina baanh — poora haath khula
    parts.push(P(sph(r + 0.004, 10, 8), s.skin, [0, -0.04, 0], [0, 0, 0], [1, 1.1, 1]));
    parts.push(P(cap(r, 0.22, 8), s.skin, [0, -0.16, 0]));
    return merge(parts);
  }
  parts.push(P(sph(r + 0.008, 10, 8), s.top, [0, -0.04, 0], [0, 0, 0], [1, 1.15, 1])); // kandha (deltoid)
  if (sleeveFull(s.outfit)) parts.push(P(cap(r + 0.004, 0.22, 8), s.top, [0, -0.16, 0]));
  else {
    parts.push(P(cyl(r + 0.016, r + 0.013, 0.15, 10), s.top, [0, -0.085, 0])); // aadhi baanh
    parts.push(P(cap(r, 0.2, 8), s.skin, [0, -0.17, 0]));
    if (b > 0.4) parts.push(P(sph(r * 0.95, 8, 6), s.skin, [0, -0.19, -0.018], [0, 0, 0], [1, 1.3, 1])); // bicep
  }
  return merge(parts);
}
function foreArmGeo(s) {
  const full = sleeveFull(s.outfit), c = full ? s.top : s.skin;
  const b = s.buff || 0, r = (s.female ? 0.038 : 0.044) + b * 0.009;
  const parts = [
    P(cyl(r * 1.05, r * 0.78, 0.24, 8), c, [0, -0.12, 0]),
    P(sph(r * 1.02, 8, 6), c, [0, 0, 0]), // kohni
  ];
  if (full) parts.push(P(cyl(r * 0.92, r * 0.92, 0.03, 8), darker(s.top, 0.85), [0, -0.235, 0])); // cuff
  if (s.bangles) { // kalaai pe rang-birangi chudiyan
    const bc = Array.isArray(s.bangles) ? s.bangles : [0xd81b60, 0xffc83d, 0x00897b, 0xffc83d];
    bc.forEach((c, i) => parts.push(P(new THREE.TorusGeometry(r * 0.95, 0.0055, 4, 12), c, [0, -0.2 - i * 0.011, 0], [Math.PI / 2, 0, 0])));
  }
  // haath: hatheli + ungliyan + angootha (gola nahi)
  parts.push(P(box(0.07, 0.075, 0.032), s.skin, [0, -0.29, -0.006]));
  parts.push(P(box(0.066, 0.055, 0.028), s.skin, [0, -0.345, -0.016], [-0.35, 0, 0]));
  parts.push(P(cap(0.013, 0.035, 5), s.skin, [0.035, -0.29, -0.028], [-0.4, 0, -0.5]));
  return merge(parts);
}
function thighGeo(s) {
  const b = s.buff || 0;
  return merge([
    P(sph(0.085 + b * 0.01, 10, 8), s.bottom, [0, -0.02, 0]),
    P(cyl(0.083 + b * 0.01, 0.062, 0.42, 10), s.bottom, [0, -0.22, 0]),
    P(sph(0.064, 8, 6), s.bottom, [0, -0.43, 0]), // ghutna
  ]);
}
function shinGeo(s) {
  const lower = s.outfit === 'lungi' || s.outfit === 'frock' || s.dhoti || (s.kid && s.outfit === 'shirt') ? s.skin : s.bottom;
  return merge([
    P(cyl(0.06, 0.045, 0.4, 10), lower, [0, -0.2, 0]),
    P(sph(0.055, 8, 6), lower, [0, -0.13, 0.018], [0, 0, 0], [1, 1.6, 1]), // pindli
  ]);
}
// takhne se neeche: joota / chappal — alag hissa taaki pair mude
function footGeo(s) {
  const parts = [];
  if (isModernF(s.outfit)) {
    // 👟 sneakers
    parts.push(P(box(0.1, 0.035, 0.25), 0xf4f4f4, [0, -0.055, -0.05]));
    parts.push(P(box(0.09, 0.06, 0.19), s.outfit === 'crop' ? 0xff4f9b : 0xffffff, [0, -0.02, -0.02]));
    parts.push(P(sph(0.047, 8, 6), 0xffffff, [0, -0.03, -0.13], [0, 0, 0], [0.95, 0.65, 1.1]));
  } else if (s.outfit === 'kurta' || s.outfit === 'lungi' || (s.female && !s.kid)) {
    // chappal + nanga pair
    parts.push(P(box(0.095, 0.02, 0.25), s.female ? 0x8a3a20 : 0x3a2a1a, [0, -0.06, -0.05]));
    parts.push(P(box(0.08, 0.045, 0.2), s.skin, [0, -0.03, -0.05]));
    parts.push(P(box(0.088, 0.012, 0.02), s.female ? 0xffc83d : 0x5a3a20, [0, -0.01, -0.09]));
  } else {
    const shoe = s.outfit === 'police' ? 0x111111 : s.hero ? 0x5a2e14 : 0x2a1a10;
    parts.push(P(box(0.105, 0.03, 0.26), 0x151010, [0, -0.058, -0.05])); // sole
    parts.push(P(box(0.095, 0.06, 0.2), shoe, [0, -0.02, -0.02]));
    parts.push(P(sph(0.05, 8, 6), shoe, [0, -0.03, -0.13], [0, 0, 0], [0.95, 0.65, 1.1])); // panja
  }
  return merge(parts);
}

// ---------------- the human ----------------
// 🎭 har kirdaar ki pehchaan — door se hi samajh aaye kaun hai
const MAIYA_SAREE = [0xfff6e0, 0xe8d8b0, 0x8d6e63, 0x5d4037, 0xc5e1a5, 0xb39ddb];
export const ROLES = {
  pandit: () => ({ outfit: 'kurta', top: 0xff8c1a, bottom: 0xfff5e0, old: true, stache: true, beard: true, hairStyle: 'bald', shikha: true, tilak: 'tripund', mala: true, angvastra: 0xffd23f, dhoti: true }),
  police: () => ({ outfit: 'police', top: 0xb59a63, bottom: 0xa88c55, hat: 'police', stache: true, hairStyle: 'short', belly: Math.random() < 0.6 ? 1 : 0, shades: Math.random() < 0.3 }),
  neta: () => ({ outfit: 'kurta', top: 0xffffff, bottom: 0xffffff, hat: 'gandhi', vest: pick([0xff8c1a, 0x1a1a1a, 0x2e7d32]), garland: true, stache: true, belly: 1, shades: true, buff: 0.2, tilak: 'lal' }),
  maiya: () => { const c = pick(MAIYA_SAREE); return { female: true, old: true, outfit: 'saree', top: darker(c, 0.8), bottom: c, hairStyle: 'bun', ghoonghat: Math.random() < 0.7, specs: Math.random() < 0.6, bangles: [0xffc83d, 0xd81b60] }; },
  dulha: () => ({ outfit: 'kurta', top: 0xfff0c8, bottom: 0xfff0c8, hat: 'pagdi', pagdiColor: 0xd81b60, kalgi: true, garland: true, stache: true }),
};

export function makeHuman(o = {}) {
  if (o.role && ROLES[o.role]) o = { ...ROLES[o.role](), ...o };
  else if (o.female && o.old && !o.kid && o.outfit === undefined) o = { ...ROLES.maiya(), ...o }; // har budhi amma = maiya
  const female = o.female ?? false, kid = o.kid ?? false;
  const s = {
    female, kid,
    skin: o.skin ?? pick(SKIN),
    top: o.top ?? pick(female ? F_TOPS : M_TOPS),
    bottom: o.bottom,
    hair: o.hair ?? pick(HAIR),
    hairStyle: o.hairStyle ?? (female ? pick(['long', 'bun', 'choti']) : pick(['short', 'side', 'short', 'curly'])),
    outfit: o.outfit ?? (female ? (kid ? 'frock' : pick(['saree', 'salwar', 'saree', 'jeans', 'crop', 'salwar', 'jeans'])) : kid ? pick(['shirt', 'tshirt']) : pick(['shirt', 'shirt', 'kurta', 'tshirt', 'lungi'])),
    stache: o.stache ?? (!female && !kid && Math.random() < 0.55),
    buff: o.buff ?? (!female && !kid && !o.old ? 0.5 + Math.random() * 0.5 : 0),
    beard: o.beard ?? false, hat: o.hat ?? null, shades: o.shades ?? false, print: o.print ?? null, dupatta: o.dupatta, capColor: o.capColor,
    old: !!o.old, hero: !!o.hero, inner: o.inner, noModel: !!o.noModel, modelIdx: o.modelIdx,
    role: o.role ?? null, tie: o.tie, pagdiColor: o.pagdiColor, kalgi: !!o.kalgi, shikha: !!o.shikha, tilak: o.tilak ?? null, specs: !!o.specs,
    nath: !!o.nath, tikka: !!o.tikka, hoops: !!o.hoops, gajra: !!o.gajra, ghoonghat: !!o.ghoonghat, pallu: o.pallu,
    belly: o.belly ?? 0, vest: o.vest ?? null, mala: !!o.mala, garland: !!o.garland, angvastra: o.angvastra ?? null, gamchha: !!o.gamchha, apron: o.apron ?? null,
    dhoti: !!o.dhoti, bangles: o.bangles ?? (female && !kid && ['saree', 'salwar', 'lehenga'].includes(o.outfit) && Math.random() < 0.7),
  };
  if (s.bottom === undefined) s.bottom = isModernF(s.outfit) ? pick(DENIM) : female ? pick(F_TOPS) : pick(M_BOTTOMS);
  if (isModernF(s.outfit) && o.hairStyle === undefined) s.hairStyle = pick(['long', 'long', 'bun']);
  if (o.old) { s.hair = 0xd4d4d4; if (!female && Math.random() < 0.5) s.hairStyle = 'bald'; }
  if (s.outfit === 'tshirt' && !s.print && Math.random() < 0.5) s.print = pick([0xffd23f, 0xff3d7f, 0x2ef2ff, 0xffffff]);

  const root = new THREE.Group();
  root.rotation.order = 'YXZ';
  root.userData.female = !!female; // 🗣️ aawaz ke liye
  const hips = new THREE.Group(); hips.position.y = 0.95; root.add(hips);
  const spine = new THREE.Group(); spine.position.y = 0.06; hips.add(spine);
  const headPivot = new THREE.Group(); headPivot.position.y = 0.6; spine.add(headPivot);
  const mk = (geo, parent) => { const m = new THREE.Mesh(geo, HUMAN_MAT); m.castShadow = true; parent.add(m); return m; };
  const meshes = {};
  meshes.head = mk(headGeo(s), headPivot);
  meshes.torso = mk(torsoGeo(s), spine);
  meshes.pelvis = mk(pelvisGeo(s), hips);
  const ua = upperArmGeo(s), fa = foreArmGeo(s), th = thighGeo(s), sh = shinGeo(s), ft = footGeo(s);
  const limbs = {};
  for (const side of [-1, 1]) {
    const k = side < 0 ? 'L' : 'R';
    const arm = new THREE.Group(); arm.position.set(side * (0.215 + (s.buff || 0) * 0.03), 0.46, 0); spine.add(arm);
    const el = new THREE.Group(); el.position.y = -0.31; arm.add(el);
    const leg = new THREE.Group(); leg.position.set(side * 0.095, 0, 0); hips.add(leg);
    const kn = new THREE.Group(); kn.position.y = -0.45; leg.add(kn);
    const an = new THREE.Group(); an.position.y = -0.43; kn.add(an); // takhna
    meshes['ua' + k] = mk(ua, arm); meshes['fa' + k] = mk(fa, el);
    meshes['th' + k] = mk(th, leg); meshes['sh' + k] = mk(sh, kn); meshes['ft' + k] = mk(ft, an);
    limbs['arm' + k] = arm; limbs['el' + k] = el; limbs['leg' + k] = leg; limbs['kn' + k] = kn; limbs['an' + k] = an;
  }
  // ⌚ hero ki ghadi (baayein haath)
  const watch = new THREE.Mesh(merge([P(cyl(0.05, 0.05, 0.03, 10), 0x1a1a1a, [0, -0.225, 0]), P(cyl(0.022, 0.022, 0.012, 10), 0xffc83d, [0, -0.225, -0.048], [Math.PI / 2, 0, 0])]), HUMAN_MAT);
  limbs.elL.add(watch);
  watch.visible = !!s.hero && !sleeveFull(s.outfit);
  const hand = new THREE.Object3D(); hand.position.set(0, -0.3, -0.02); limbs.elR.add(hand);
  const handL = new THREE.Object3D(); handL.position.set(0, -0.3, -0.02); limbs.elL.add(handL);
  if (kid) { root.scale.setScalar(0.62); headPivot.scale.setScalar(1.28); }
  if (o.scale) root.scale.multiplyScalar(o.scale);

  const h = {
    spec: s, root, hips, spine, headPivot, hand, handL, meshes, watch, ...limbs,
    aimPitch: 0, action: 'idle', at: 0, phase: Math.random() * 10, speed: 1.3, mspeed: 0, turn: 0, lean: 0, look: 0, lookX: 0, held: null, rate: 10,
    cur: { ...NEUTRAL }, tgt: { ...NEUTRAL },
  };
  h.rebuild = () => {
    const old = new Set(Object.values(meshes).map((m) => m.geometry));
    meshes.head.geometry = headGeo(s); meshes.torso.geometry = torsoGeo(s); meshes.pelvis.geometry = pelvisGeo(s);
    const a = upperArmGeo(s), f = foreArmGeo(s), t = thighGeo(s), sh2 = shinGeo(s), f2 = footGeo(s);
    meshes.uaL.geometry = meshes.uaR.geometry = a; meshes.faL.geometry = meshes.faR.geometry = f;
    meshes.thL.geometry = meshes.thR.geometry = t; meshes.shL.geometry = meshes.shR.geometry = sh2;
    meshes.ftL.geometry = meshes.ftR.geometry = f2;
    watch.visible = !h.model && !!s.hero && !sleeveFull(s.outfit);
    old.forEach((g) => g.dispose());
    if (h.model) for (const m of Object.values(meshes)) m.visible = !h.model.near;
  };
  wantModel(h); // 🧍 asli 3D model (load ho jaaye to chadh jaata hai)
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

const NEUTRAL = { hy: 0.95, sx: 0, sy: 0, sz: 0, hdx: 0, hdy: 0, aLx: 0, aLz: -0.08, aRx: 0, aRz: 0.08, eL: 0.15, eR: 0.15, lL: 0, lR: 0, kL: 0, kR: 0, hry: 0, hrz: 0, hpx: 0, fL: 0, fR: 0, lzL: 0, lzR: 0 };
const KEYS = Object.keys(NEUTRAL);
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const clampN = (x, a, b) => Math.max(a, Math.min(b, x));
const smooth = (x) => x * x * (3 - 2 * x);

// pair zameen pe sapaat rahe (takhna ghutne/kamar ki ulti taraf mude)
function flatFeet(T, toeL = 0, toeR = 0) { T.fL = -(T.lL + T.kL) + toeL; T.fR = -(T.lR + T.kR) + toeR; }

function pose(h, t, dt) {
  const T = h.tgt, s0 = h.spec;
  Object.assign(T, NEUTRAL);
  T.hdy = h.look; T.hdx = h.lookX;
  const ph = h.phase;
  const fem = s0.female && !s0.kid, old = s0.old, buff = s0.buff || 0;
  let rate = 10;
  switch (h.action) {
    case 'idle': {
      // saans + vazan ek pair se doosre pe + idhar udhar dekhna — putla nahi, zinda insaan
      const br = Math.sin(t * 1.7 + ph);
      T.sx = br * 0.012 + (old ? -0.16 : 0);
      const w = smooth(clamp01(Math.sin(t * 0.33 + ph) * 1.6 * 0.5 + 0.5)) * 2 - 1; // -1..1
      T.hpx = w * 0.03; T.hrz = -w * 0.035; T.sz = w * 0.03;
      T.kL = w > 0 ? -0.18 * w : 0; T.kR = w < 0 ? 0.18 * w : 0;
      T.lL = -T.kL * 0.45; T.lR = -T.kR * 0.45;
      T.lzL = -0.05; T.lzR = 0.05;
      T.aLz = -0.1 - buff * 0.1 - br * 0.01; T.aRz = 0.1 + buff * 0.1 + br * 0.01;
      T.aLx = 0.04 + Math.sin(t * 1.1 + ph) * 0.03; T.aRx = 0.04 - Math.sin(t * 1.1 + ph) * 0.03;
      T.eL = T.eR = 0.22 + br * 0.02;
      // har kuch second mein nayi taraf nazar
      h.idleT = (h.idleT ?? Math.random() * 3) - dt;
      if (h.idleT <= 0) { h.idleT = 2.5 + Math.random() * 4; h.idleLook = Math.random() < 0.35 ? 0 : (Math.random() - 0.5) * 1.1; h.idleTilt = (Math.random() - 0.4) * 0.15; }
      T.hdy += h.idleLook || 0; T.hdx += h.idleTilt || 0;
      flatFeet(T);
      rate = 6;
      break;
    }
    case 'walk': case 'run': {
      const run = h.action === 'run';
      // asli raftaar ke hisaab se kadam — pair zameen pe fisle nahi
      const sp = run ? clampN(h.mspeed, 3.2, 9.5) : clampN(h.mspeed, 0.7, 3.4);
      h.phase += dt * sp * (run ? 2.45 : 3.75) * (old ? 1.15 : 1);
      const p = h.phase, s = Math.sin(p), c = Math.cos(p);
      const saree = s0.outfit === 'saree' || s0.outfit === 'lungi';
      const amp = run ? (saree ? 0.5 : 0.82) : old ? 0.32 : saree ? 0.26 : 0.46;
      T.lL = s * amp; T.lR = -s * amp;
      // jo pair aage ja raha (swing) uska ghutna mude
      T.kL = -(0.06 + (run ? 1.35 : 0.7) * Math.max(0, c) + (run ? 0.25 : 0.05) * Math.max(0, -s));
      T.kR = -(0.06 + (run ? 1.35 : 0.7) * Math.max(0, -c) + (run ? 0.25 : 0.05) * Math.max(0, s));
      // takhna: aage wale pair ki edi pehle, peeche wale ka panja dhakka de
      flatFeet(T, s > 0 ? 0.22 * s : 0.75 * s * (run ? 1.1 : 0.8), -s > 0 ? -0.22 * s : -0.75 * s * (run ? 1.1 : 0.8));
      // kamar ghoome, kandhe ulti taraf
      T.hry = -s * (run ? 0.13 : fem ? 0.1 : 0.15);
      T.sy = s * (run ? 0.3 : 0.22) - T.hry * 0.2;
      // kamar ka jhoola (aurat mein zyada)
      T.hrz = c * (run ? 0.04 : fem ? 0.085 : 0.045);
      T.hpx = c * (fem ? 0.04 : 0.02);
      T.sz = -T.hrz * 0.6;
      // oonch-neech: kadam faile tab neeche, beech mein upar (pehle ulta tha!)
      T.hy = run ? 0.9 + 0.06 * Math.abs(c) - 0.05 * s * s : 0.95 - 0.045 * s * s;
      const armAmp = run ? 0.95 : fem ? 0.3 : old ? 0.18 : 0.42;
      T.aLx = -s * armAmp; T.aRx = s * armAmp;
      T.aLz = -0.1 - buff * 0.12 - (run ? 0.1 : 0); T.aRz = 0.1 + buff * 0.12 + (run ? 0.1 : 0);
      T.eL = run ? 1.45 + 0.25 * Math.max(0, -s) : 0.22 + 0.4 * Math.max(0, -s);
      T.eR = run ? 1.45 + 0.25 * Math.max(0, s) : 0.22 + 0.4 * Math.max(0, s);
      T.sx = (run ? -0.24 - clampN((h.mspeed - 6) * 0.04, 0, 0.1) : -0.05) + (old ? -0.18 : 0);
      // sar seedha rahe (kandhon ke saath na ghoome)
      T.hdy -= T.hry + T.sy;
      T.hdx += run ? 0.12 : 0.03;
      rate = run ? 26 : 20;
      // kadam ka event (aawaz / dhool)
      const side = s >= 0 ? 1 : -1;
      if (h.lastSide && side !== h.lastSide) h.step = (h.step || 0) + 1;
      h.lastSide = side;
      break;
    }
    case 'sit': case 'cards':
      // haath apni-apni jaangh pe (beech mein milke 'haath jode' jaisa na lage)
      T.hy = 0.5; T.lL = T.lR = 1.5; T.kL = T.kR = -1.5; T.aLx = T.aRx = 0.35; T.eL = T.eR = 0.55; T.aLz = -0.14; T.aRz = 0.14;
      T.sx = 0.02 * Math.sin(t * 1.6 + ph); T.fL = T.fR = 0;
      if (h.action === 'cards') { T.aRx = 0.9 + Math.sin(t * 2 + ph) * 0.15; T.eR = 1.2; T.aLx = 0.8; T.eL = 1.1; T.hdx = -0.25; }
      break;
    case 'drive':
      T.hy = 0.5; T.lL = T.lR = 1.45; T.kL = T.kR = -1.3; T.aLx = T.aRx = 1.05; T.eL = T.eR = 0.35; T.aLz = -0.18; T.aRz = 0.18;
      T.sz = -(h.steer || 0) * 0.12; T.hdy -= (h.steer || 0) * 0.25;
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
      T.hpx = 0.02 * Math.sin(t * 0.5 + ph); T.hrz = -T.hpx;
      break;
    case 'wave':
      T.aRz = 2.6; T.aRx = 0.2; T.eR = 0.4 + 0.45 * Math.sin(t * 11); T.sz = -0.06; T.hpx = 0.02;
      break;
    case 'slap': {
      const k = clamp01(h.at / 0.32);
      // haath peeche se ghoom ke saamne wale ke GAAL tak (kandhe ki oonchai), kamar ka zor saath mein
      T.aRz = 1.7 - 2.1 * k; T.aRx = 0.7 + 0.85 * k; T.eR = 0.25 - 0.1 * k; T.sy = 0.5 - 1.0 * k; T.hry = 0.2 - 0.4 * k; T.sx = -0.06;
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
      T.sy = 1.0 - 2.2 * k; T.sx = -0.15; T.lL = 0.15; T.lR = -0.15; T.kL = T.kR = -0.2; T.hry = 0.3 - 0.6 * k;
      flatFeet(T);
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
      T.hpx = 0.025; T.hrz = -0.03; T.kL = -0.15; T.lL = 0.07; flatFeet(T);
      break;
    case 'clothes':
      T.aLx = T.aRx = 1.85 + 0.15 * Math.sin(t * 2 + ph); T.eL = T.eR = 0.2;
      break;
    case 'dance': {
      const b = t * 6.5 + ph, sb = Math.sin(b);
      // 💃 alag-alag style (h.danceStyle) — club mein sab ek jaisa na naachein
      const st = h.danceStyle || 0;
      if (st === 1) { // kamar matkana (hip sway), haath upar dheere lehraate
        const w = t * 3.2 + ph, s1 = Math.sin(w), c1 = Math.cos(w);
        T.hpx = 0.09 * s1; T.hrz = 0.14 * s1; T.hry = 0.12 * c1; T.sz = -0.1 * s1; T.sy = -0.1 * c1;
        T.aLz = -2.5 + 0.25 * c1; T.aRz = 2.5 + 0.25 * c1; T.aLx = T.aRx = 0.2; T.eL = 0.9 + 0.3 * s1; T.eR = 0.9 - 0.3 * s1;
        T.lL = 0.12 * Math.max(0, s1); T.lR = 0.12 * Math.max(0, -s1); T.kL = -0.25 - 0.2 * Math.max(0, s1); T.kR = -0.25 - 0.2 * Math.max(0, -s1);
        T.hy = 0.9 + 0.02 * Math.sin(w * 2); T.hdx = 0.08; T.hdy += 0.15 * c1;
        flatFeet(T); rate = 12; break;
      }
      if (st === 2) { // bhangra: kandhe uchhaal, ghutna upar
        const w = t * 7 + ph, s1 = Math.sin(w), up = Math.max(0, Math.sin(w * 0.5));
        T.aLz = -2.6; T.aRz = 2.6; T.eL = T.eR = 0.3 + 0.25 * Math.abs(s1); T.sx = -0.05; T.sy = 0.12 * s1;
        T.lL = 1.1 * up; T.kL = -1.3 * up; T.lR = 0.1; T.kR = -0.2;
        T.hy = 0.92 + 0.05 * Math.abs(s1); T.hdx = -0.1 + 0.08 * s1;
        T.fL = -0.3 * up; rate = 22; break;
      }
      if (st === 3) { // club bounce: mutthi upar-neeche, sar hilaana
        const w = t * 8 + ph, s1 = Math.sin(w), beat = Math.abs(Math.sin(w * 0.5));
        T.aRz = 1.6 + 0.9 * beat; T.aRx = 0.6; T.eR = 1.6 - 0.8 * beat; T.aLz = -0.5; T.aLx = 0.7; T.eL = 1.6;
        T.kL = T.kR = -0.35 - 0.3 * beat; T.lL = T.lR = 0.25 + 0.2 * beat; T.hy = 0.88 - 0.05 * beat;
        T.hdx = 0.25 * beat; T.sy = 0.1 * s1; T.hry = -0.08 * s1;
        flatFeet(T); rate = 24; break;
      }
      if (st === 4) { // twist: kamar ghumaao, haath bagal mein
        const w = t * 6 + ph, s1 = Math.sin(w);
        T.hry = 0.45 * s1; T.sy = -0.5 * s1; T.aLz = -1.3; T.aRz = 1.3; T.aLx = T.aRx = 0.4; T.eL = T.eR = 1.2;
        T.kL = T.kR = -0.6; T.lL = T.lR = 0.45; T.hy = 0.82 + 0.03 * Math.cos(w * 2); T.fL = T.fR = 0.2;
        rate = 18; break;
      }
      if (st === 5) { // body roll — dheema, lehrata (slow sexy)
        const w = t * 2.6 + ph, s1 = Math.sin(w), c1 = Math.cos(w);
        T.sx = 0.18 * s1; T.hdx = -0.2 * s1; T.hpx = 0.07 * c1; T.hrz = 0.1 * c1; T.hry = 0.08 * s1;
        T.aLz = -2.8 + 0.2 * s1; T.aRz = 2.2 + 0.4 * c1; T.aLx = 0.3; T.aRx = 0.5 + 0.3 * s1; T.eL = 1.4; T.eR = 0.8 + 0.5 * s1;
        T.kL = -0.3 - 0.15 * s1; T.kR = -0.3 + 0.15 * s1; T.lL = 0.15 + 0.08 * s1; T.lR = 0.15 - 0.08 * s1; T.hy = 0.89 + 0.02 * c1;
        flatFeet(T); rate = 10; break;
      }
      T.sz = 0.18 * sb; T.sy = 0.15 * Math.sin(b * 0.5); T.hry = -0.2 * Math.sin(b * 0.5); T.hpx = 0.06 * sb; T.hrz = -0.08 * sb;
      T.aLz = -2.2 + 0.5 * sb; T.aRz = 2.2 + 0.5 * sb; T.eL = 0.5 + 0.4 * sb; T.eR = 0.5 - 0.4 * sb;
      T.lL = 0.25 * Math.max(0, sb); T.lR = 0.25 * Math.max(0, -sb); T.kL = -0.5 * Math.max(0, sb); T.kR = -0.5 * Math.max(0, -sb);
      T.hy = 0.93 + 0.025 * Math.sin(b * 2); T.hdx = 0.1 * Math.sin(b);
      flatFeet(T);
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
    case 'sleep': {
      // palang pe chit leta — saans + dheele haath
      const br = Math.sin(t * 1.6 + ph);
      T.aLz = -0.18; T.aRz = 0.18; T.aLx = T.aRx = 0.05 + br * 0.02; T.eL = T.eR = 0.35; T.sx = br * 0.015;
      T.lL = T.lR = 0.02; T.kL = T.kR = -0.06; T.fL = T.fR = -0.5;
      rate = 4;
      break;
    }
    case 'fall':
      T.aLz = -1.3; T.aRz = 1.3; T.lL = 0.3; T.lR = -0.2; T.kL = -0.6; T.fL = T.fR = -0.4;
      break;
    case 'hands':
      T.aLz = -0.35; T.aRz = 0.35; T.aLx = T.aRx = 0.2; T.eL = T.eR = 1.6;
      break;
    case 'point':
      T.aRx = 1.5; T.eR = 0.05; T.hdx = 0; T.sy = -0.12; T.hry = 0.06;
      break;
    case 'hug':
      T.aLx = T.aRx = 1.35; T.eL = T.eR = 1.25; T.aLz = 0.55; T.aRz = -0.55; T.hdy += 0.4; T.sx = -0.08;
      break;
    case 'jump': {
      // hawa mein: ek ghutna upar, haath santulan ke liye
      const up = (h.vy ?? 0) > 0;
      T.lL = up ? 0.9 : 0.5; T.lR = up ? 0.1 : 0.25; T.kL = up ? -1.4 : -0.7; T.kR = up ? -0.3 : -0.5;
      T.aLz = -0.9; T.aRz = 0.9; T.aLx = T.aRx = up ? -0.3 : 0.5; T.eL = T.eR = 0.5; T.sx = up ? 0.05 : -0.12;
      T.fL = 0.3; T.fR = -0.4;
      rate = 16;
      break;
    }
    case 'land':
      // zameen pe girte hi jhatka — ghutne mude
      T.hy = 0.74; T.lL = T.lR = 0.75; T.kL = T.kR = -1.35; T.sx = -0.32; T.aLx = T.aRx = 0.55; T.aLz = -0.35; T.aRz = 0.35; T.eL = T.eR = 0.6;
      flatFeet(T);
      rate = 40;
      break;
    case 'hurt':
      T.sx = 0.35; T.aLx = T.aRx = 0.9; T.eL = T.eR = 1.6; T.aLz = 0.3; T.aRz = -0.3; T.hdx = 0.3; T.kL = T.kR = -0.3;
      flatFeet(T);
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
      // poora sharir ghuma ke ghoonsa 👊
      const k = clamp01(ot / 0.13), back = clamp01((ot - 0.2) / 0.22);
      const p = k * (1 - back);
      T.aRx = 0.4 + 1.25 * p; T.eR = 1.8 - 1.75 * p; T.aRz = 0.05; T.sy = 0.25 - 0.85 * p; T.hry = 0.1 - 0.3 * p; T.sx = -0.12 * p;
      T.aLx = 0.9; T.eL = 1.9; T.aLz = 0.25; T.hdy = -T.sy * 0.6;
      rate = 42;
    } else if (ov === 'swing') {
      const k = clamp01(ot / 0.3);
      T.aRx = 2.6 - 1.9 * k; T.eR = 0.3; T.aRz = -0.3 + 0.6 * k; T.sy = 0.5 - 1.1 * k; T.hry = 0.2 - 0.4 * k; T.aLx = 2.2 - 1.6 * k; T.eL = 0.5; T.aLz = 0.5;
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

const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));
export function updateHuman(h, dt, t) {
  h.at += dt;
  // asli raftaar + mudne ki raftaar naapo (kadam aur jhukaav isi se)
  const r = h.root.position, ry = h.root.rotation.y;
  if (h._px !== undefined && dt > 0) {
    const v = Math.min(10, Math.hypot(r.x - h._px, r.z - h._pz) / dt);
    h.mspeed += (v - h.mspeed) * Math.min(1, dt * 8);
    const yr = wrapA(ry - h._ry) / dt;
    h.turn += (clampN(yr, -6, 6) - h.turn) * Math.min(1, dt * 6);
  }
  h._px = r.x; h._pz = r.z; h._ry = ry;
  const rate = pose(h, t, dt);
  const a = 1 - Math.exp(-dt * rate);
  const C = h.cur, T = h.tgt;
  for (const k of KEYS) C[k] += (T[k] - C[k]) * a;
  // mod pe andar ki taraf jhuko (cycle/bike jaisa)
  const moving = h.action === 'walk' || h.action === 'run';
  const leanT = moving ? clampN(h.turn * h.mspeed * 0.022, -0.28, 0.28) : 0;
  h.lean += (leanT - h.lean) * Math.min(1, dt * 8);
  h.hips.position.set(C.hpx, C.hy, 0);
  h.hips.rotation.set(0, C.hry, C.hrz + h.lean);
  h.spine.rotation.set(C.sx, C.sy, C.sz);
  h.headPivot.rotation.set(C.hdx, C.hdy, -h.lean * 0.5);
  h.armL.rotation.set(C.aLx, 0, C.aLz); h.armR.rotation.set(C.aRx, 0, C.aRz);
  h.elL.rotation.x = C.eL; h.elR.rotation.x = C.eR;
  h.legL.rotation.set(C.lL, 0, C.lzL); h.legR.rotation.set(C.lR, 0, C.lzR);
  h.knL.rotation.x = C.kL; h.knR.rotation.x = C.kR;
  h.anL.rotation.x = C.fL; h.anR.rotation.x = C.fR;
  // saans: seena halka phoole
  const br = 1 + Math.sin(t * (moving ? 3.2 : 1.7) + h.phase * 0.1) * (h.action === 'run' ? 0.02 : 0.01);
  h.meshes.torso.scale.set(1, br, 1 + (br - 1) * 1.5);
  driveModel(h);
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
