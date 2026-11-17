import * as THREE from 'three';
import { makeHuman, updateHuman, setAction } from './humans.js';
import { addBox, BOXES } from './collide.js';
import { signTexture } from './textures.js';

// 🪩 CLUB MIRCHI — Cyber City mein andar ja sakte ho (GTA jaisa):
// darwaza paas aane pe khulta dikhta hai, andar DJ, bar, disco floor, aur naachti bheed (har koi alag style).
export const CLUB = { x: 218, z: 70, w: 26, d: 20, h: 6.5 }; // darwaza pashchim (-X) wali deewar pe, link road ki taraf
const X0 = CLUB.x - CLUB.w / 2, X1 = CLUB.x + CLUB.w / 2, Z0 = CLUB.z - CLUB.d / 2, Z1 = CLUB.z + CLUB.d / 2;
const DOOR_W = 3.2, WALL = 0.6;
const R = Math.random;
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, ...o });
const HDR = (r, g, b, o = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false, ...o });

export function buildClub(scene) {
  const g = new THREE.Group();
  scene.add(g);
  const add = (geo, mat, x, y, z, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };

  // ---------- 🧱 imaarat (alag-alag deewarein — andar khaali, ghus sakte ho) ----------
  const outer = M(0x1a1024, { roughness: 0.4, metalness: 0.3 });
  const inner = M(0x24123a, { roughness: 0.9 });
  const wallMats = [outer, outer, outer, outer, inner, outer];
  const wall = (cx, cz, w, d) => {
    const m = add(new THREE.BoxGeometry(w, CLUB.h, d), wallMats, cx, CLUB.h / 2, cz);
    m.castShadow = true; m.receiveShadow = true;
    addBox(cx, cz, w, d);
  };
  wall(CLUB.x, Z0, CLUB.w, WALL); wall(CLUB.x, Z1, CLUB.w, WALL); wall(X1, CLUB.z, WALL, CLUB.d);
  const seg = (CLUB.d - DOOR_W) / 2;
  wall(X0, Z0 + seg / 2, WALL, seg); wall(X0, Z1 - seg / 2, WALL, seg);
  add(new THREE.BoxGeometry(WALL, CLUB.h - 3.2, DOOR_W), outer, X0, 3.2 + (CLUB.h - 3.2) / 2, CLUB.z); // darwaze ke upar
  const roof = add(new THREE.BoxGeometry(CLUB.w + 0.6, 0.4, CLUB.d + 0.6), M(0x0e0814), CLUB.x, CLUB.h + 0.2, CLUB.z);
  roof.castShadow = true;
  add(new THREE.BoxGeometry(CLUB.w - 0.4, 0.05, CLUB.d - 0.4), M(0x0a0610), CLUB.x, CLUB.h - 0.05, CLUB.z); // andar ki chhat (kaali)

  // bahar ka neon + sign
  const sign = add(new THREE.PlaneGeometry(10, 2.5), new THREE.MeshBasicMaterial({ map: signTexture('CLUB MIRCHI', 'DJ NIGHT • Har raat party 🔥', '#ff2d6f'), toneMapped: false }), X0 - 0.35, CLUB.h - 1.4, CLUB.z);
  sign.rotation.y = -Math.PI / 2;
  const neonA = HDR(3, 0.3, 1.6), neonB = HDR(0.3, 2.2, 3);
  for (const [z, m] of [[Z0 + 0.2, neonA], [Z1 - 0.2, neonB]]) add(new THREE.BoxGeometry(0.12, CLUB.h - 0.4, 0.12), m, X0 - 0.36, CLUB.h / 2, z);
  add(new THREE.BoxGeometry(0.12, 0.12, CLUB.d), neonA, X0 - 0.36, CLUB.h - 0.15, CLUB.z);
  // laal carpet + rassi
  add(new THREE.BoxGeometry(5, 0.03, DOOR_W), M(0x8a0a1a), X0 - 2.8, 0.03, CLUB.z);
  for (const s of [-1, 1]) for (const dx of [-4.6, -1.8]) add(new THREE.CylinderGeometry(0.06, 0.08, 1, 8), M(0xd4af37, { metalness: 0.8, roughness: 0.3 }), X0 + dx, 0.5, CLUB.z + s * 1.9);

  // ---------- 🚪 darwaza: do palle, bahar ki taraf khulte ----------
  const doorMat = M(0x2a0a1a, { metalness: 0.4, roughness: 0.35 });
  const doors = [-1, 1].map((s) => {
    const hinge = new THREE.Group();
    hinge.position.set(X0 - 0.1, 0, CLUB.z + s * DOOR_W / 2);
    const leaf = add(new THREE.BoxGeometry(0.12, 3.1, DOOR_W / 2 - 0.05), doorMat, 0, 1.55, -s * (DOOR_W / 4), hinge);
    leaf.castShadow = true;
    add(new THREE.BoxGeometry(0.16, 0.5, 0.06), HDR(2.5, 1.8, 0.5), 0, 1.4, -s * (DOOR_W / 2 - 0.25), hinge); // handle
    g.add(hinge);
    return { hinge, s };
  });
  // band darwaza = thos (collision box jo khulne pe hata dete hain)
  addBox(X0, CLUB.z, WALL, DOOR_W);
  const doorBox = BOXES[BOXES.length - 1];
  const doorBoxClosed = { ...doorBox };
  let doorOpen = 0;

  // ---------- 🪩 andar ----------
  const inG = new THREE.Group();
  g.add(inG);
  // LED dance floor
  const TX = 9, TZ = 7, TS = 1.5;
  const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(TS - 0.06, 0.05, TS - 0.06), new THREE.MeshBasicMaterial({ toneMapped: false }), TX * TZ);
  const FX = CLUB.x - 1, FZ = CLUB.z;
  const _m = new THREE.Matrix4(), _c = new THREE.Color();
  for (let i = 0; i < TX; i++) for (let j = 0; j < TZ; j++) {
    _m.makeTranslation(FX + (i - (TX - 1) / 2) * TS, 0.04, FZ + (j - (TZ - 1) / 2) * TS);
    tiles.setMatrixAt(i * TZ + j, _m);
    tiles.setColorAt(i * TZ + j, _c.setRGB(0.5, 0.1, 0.6));
  }
  inG.add(tiles);
  add(new THREE.BoxGeometry(CLUB.w - 1, 0.02, CLUB.d - 1), M(0x120a18, { roughness: 0.3, metalness: 0.4 }), CLUB.x, 0.015, CLUB.z, inG);
  // deewaron pe neon patti
  for (const [z, m] of [[Z0 + 0.35, neonA], [Z1 - 0.35, neonB]]) add(new THREE.BoxGeometry(CLUB.w - 1.5, 0.08, 0.06), m, CLUB.x, 2.6, z, inG);
  // DJ booth (poorab wali deewar)
  add(new THREE.BoxGeometry(1.4, 1.1, 4), M(0x0c0c10, { metalness: 0.6, roughness: 0.3 }), X1 - 2.4, 0.55, CLUB.z, inG);
  add(new THREE.BoxGeometry(1.42, 0.08, 4.02), HDR(0.3, 2.5, 3), X1 - 2.4, 1.12, CLUB.z, inG);
  const screen = add(new THREE.PlaneGeometry(7, 3), HDR(1, 0.2, 1.4), X1 - 0.36, 3.4, CLUB.z, inG);
  screen.rotation.y = -Math.PI / 2;
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.9, 2.2, 0.9), M(0x111111), X1 - 1.3, 1.1, CLUB.z + s * 3.2, inG); // speaker
  // bar counter (uttar wali deewar)
  add(new THREE.BoxGeometry(9, 1.1, 0.9), M(0x3a1a10, { roughness: 0.4 }), CLUB.x - 3, 0.55, Z1 - 1.6, inG);
  add(new THREE.BoxGeometry(9.1, 0.06, 1.0), HDR(2.6, 1.5, 0.4), CLUB.x - 3, 1.12, Z1 - 1.6, inG);
  addBox(CLUB.x - 3, Z1 - 1.6, 9, 0.9);
  addBox(X1 - 2.4, CLUB.z, 1.4, 4);
  for (let i = 0; i < 18; i++) { // botlein
    const c = [HDR(0.2, 1.6, 0.4), HDR(1.8, 1.2, 0.2), HDR(0.4, 0.8, 2)][i % 3];
    add(new THREE.CylinderGeometry(0.06, 0.07, 0.34, 8), c, CLUB.x - 7 + i * 0.47, 1.9, Z1 - 0.5, inG);
  }
  // stage (dakshin-poorab kona) — do dancer
  add(new THREE.BoxGeometry(4, 0.5, 3), M(0x2a0a2a, { metalness: 0.5, roughness: 0.3 }), X1 - 4.5, 0.25, Z0 + 2, inG);
  add(new THREE.BoxGeometry(4.02, 0.04, 3.02), HDR(3, 0.4, 1.8), X1 - 4.5, 0.52, Z0 + 2, inG);
  addBox(X1 - 4.5, Z0 + 2, 4, 3);
  // disco ball + roshni ki kirnein
  const ball = add(new THREE.IcosahedronGeometry(0.55, 1), M(0xffffff, { metalness: 1, roughness: 0.05, flatShading: true, emissive: 0x444466 }), FX, CLUB.h - 1.1, FZ, inG);
  const beams = [];
  const beamGeo = new THREE.ConeGeometry(1.2, CLUB.h - 0.3, 16, 1, true); beamGeo.translate(0, -(CLUB.h - 0.3) / 2, 0);
  for (let i = 0; i < 5; i++) {
    const col = [[2, 0.2, 1.4], [0.2, 1.6, 2.4], [2.2, 1.6, 0.2], [0.4, 2.2, 0.6], [1.6, 0.3, 2.4]][i];
    const bm = add(beamGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(...col).multiplyScalar(0.18), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }), FX + (i - 2) * 2.6, CLUB.h - 0.2, FZ + (i % 2 ? 2 : -2), inG);
    beams.push({ m: bm, p: R() * 6 });
  }
  const lights = [0xff2d9b, 0x2ed8ff, 0xffd23f].map((c, i) => { const l = new THREE.PointLight(c, 0, 14, 1.6); l.position.set(FX, 3.5, FZ); inG.add(l); return { l, p: i * 2.1 }; });
  const fill = new THREE.PointLight(0xb070ff, 0, 22, 1.5); fill.position.set(CLUB.x, 5, CLUB.z); inG.add(fill);

  // ---------- 💃 log ----------
  const people = [];
  const put = (h, x, z, heading, act, style) => { h.root.position.set(x, 0, z); h.root.rotation.y = heading; setAction(h, act); h.danceStyle = style; h.phase = R() * 10; inG.add(h.root); people.push(h); return h; };
  // dance floor pe bheed — har koi alag style; kuch jode aamne-saamne
  for (let i = 0; i < 16; i++) {
    const female = R() < 0.5;
    const h = makeHuman({ female, outfit: female ? (R() < 0.5 ? 'jeans' : 'crop') : (R() < 0.5 ? 'tshirt' : 'jacket') });
    const x = FX + (R() - 0.5) * (TX * TS - 2), z = FZ + (R() - 0.5) * (TZ * TS - 2);
    put(h, x, z, R() * Math.PI * 2, 'dance', female ? [1, 5, 1, 4, 0][i % 5] : [3, 2, 4, 0, 3][i % 5]);
  }
  for (let i = 0; i < 3; i++) { // jode
    const x = FX - 4 + i * 4, z = FZ + 3.2;
    put(makeHuman({ female: false, outfit: 'shirt' }), x - 0.45, z, Math.PI / 2, 'dance', 0);
    put(makeHuman({ female: true, outfit: 'jeans' }), x + 0.45, z, -Math.PI / 2, 'dance', 1);
  }
  // stage pe dancer
  for (const dz of [-0.8, 0.8]) put(makeHuman({ female: true, outfit: 'crop' }), X1 - 4.5, Z0 + 2 + dz, Math.PI / 2, 'dance', dz < 0 ? 5 : 1).root.position.y = 0.52;
  // DJ, bartender, bouncer
  const dj = put(makeHuman({ female: false, outfit: 'tshirt', hat: 'cap', shades: true }), X1 - 1.4, CLUB.z, Math.PI / 2, 'dance', 3);
  const bar = put(makeHuman({ female: false, outfit: 'shirt', top: 0x111111 }), CLUB.x - 3, Z1 - 0.9, Math.PI, 'talk', 0);
  const bouncer = makeHuman({ female: false, outfit: 'tshirt', top: 0x050505, buff: 1, shades: true });
  bouncer.root.position.set(X0 - 1.6, 0, CLUB.z - 2.3); bouncer.root.rotation.y = Math.PI / 2; setAction(bouncer, 'idle'); g.add(bouncer.root); people.push(bouncer);
  void dj; void bar;

  let inside = false, wasNear = false;
  return {
    door: { x: X0, z: CLUB.z },
    center: { x: CLUB.x, z: CLUB.z },
    get inside() { return inside; },
    /** p = player position (pair), cam = camera */
    update(dt, t, p, cam) {
      const dCam = Math.hypot(cam.x - CLUB.x, cam.z - CLUB.z);
      const near = dCam < 70;
      g.visible = near;
      inside = p.x > X0 + 0.2 && p.x < X1 && p.z > Z0 && p.z < Z1;
      // darwaza: paas aao to khule (andar-bahar dono taraf), door jao to band
      const dDoor = Math.hypot(p.x - X0, p.z - CLUB.z);
      const want = dDoor < 4.2 ? 1 : 0;
      doorOpen += (want - doorOpen) * Math.min(1, dt * 3.2);
      for (const d of doors) d.hinge.rotation.y = d.s * doorOpen * 1.75;
      const solid = doorOpen < 0.55;
      Object.assign(doorBox, solid ? doorBoxClosed : { x0: -9999, x1: -9998, z0: -9999, z1: -9998 });
      if (!near) { wasNear = false; return; }
      const camIn = cam.x > X0 && cam.x < X1 && cam.z > Z0 && cam.z < Z1;
      const lit = inside || camIn || dDoor < 12;
      inG.visible = lit;
      for (const L of lights) L.l.intensity = lit ? 26 : 0;
      fill.intensity = lit ? 10 : 0;
      if (!lit) { wasNear = false; updateHuman(bouncer, dt, t); return; }
      // 🎆 roshni ka khel (beat pe)
      const beat = Math.pow(Math.abs(Math.sin(t * Math.PI * 2)), 6);
      for (let i = 0; i < TX; i++) for (let j = 0; j < TZ; j++) {
        const w = Math.sin(t * 2.2 + i * 0.7 + j * 0.9), hue = (t * 0.08 + (i + j) * 0.05 + (w > 0.6 ? 0.5 : 0)) % 1;
        _c.setHSL(hue, 0.9, 0.18 + 0.32 * Math.max(0, w) + 0.15 * beat);
        tiles.setColorAt(i * TZ + j, _c);
      }
      tiles.instanceColor.needsUpdate = true;
      ball.rotation.y += dt * 0.8;
      for (const b of beams) { b.m.rotation.z = Math.sin(t * 0.9 + b.p) * 0.55; b.m.rotation.x = Math.cos(t * 0.7 + b.p) * 0.45; }
      for (const L of lights) L.l.position.set(FX + Math.sin(t * 0.8 + L.p) * 6, 3.6, FZ + Math.cos(t * 1.1 + L.p) * 4);
      screen.material.color.setHSL((t * 0.1) % 1, 0.9, 0.35 + 0.25 * beat);
      for (const h of people) updateHuman(h, dt, t);
      wasNear = true;
    },
  };
}
