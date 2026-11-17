import * as THREE from 'three';
import { signTexture, buildingTextures } from './textures.js';
import { makeHuman, updateHuman, setAction } from './humans.js';
import { FOOT, rect, addBox, addCircle, BAZAAR_Z } from './collide.js';
import { HOTEL } from './data2.js';

export const HOTEL_AREA = { x0: 56, x1: 94, z0: 106, z1: BAZAAR_Z - 10.4 };
export const ROOF = { x0: 55.6, x1: 94.4, z0: 90.6, z1: 105.4, y: 20 };
export const LIFT = { x: 83, z: 106.4 };
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, ...o });
const HDR = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });

/** Hotel Raj Palace — disco floor, stage, candlelight tables */
export function buildHotel(scene, { triggers, keepers }) {
  const A = HOTEL_AREA, cx = (A.x0 + A.x1) / 2;
  FOOT.push(rect(A.x0, A.x1, A.z0, A.z1 + 1));
  const marble = new THREE.Mesh(new THREE.PlaneGeometry(A.x1 - A.x0, A.z1 - A.z0), M(0xb8aa98, { roughness: 0.55, metalness: 0.05 }));
  marble.rotation.x = -Math.PI / 2;
  marble.position.set(cx, 0.025, (A.z0 + A.z1) / 2);
  marble.receiveShadow = true;
  scene.add(marble);

  // imaarat
  const tx = buildingTextures(777);
  const map = tx.map.clone(), em = tx.em.clone();
  map.repeat.set(3.5, 1.6); em.repeat.set(3.5, 1.6);
  const facade = new THREE.MeshStandardMaterial({ color: 0xf2e2c4, map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 0.8, roughness: 0.6 });
  const roof = M(0x3a2a20);
  const b = new THREE.Mesh(new THREE.BoxGeometry(40, 20, 16), [facade, facade, roof, roof, facade, facade]);
  b.position.set(cx, 10, A.z0 - 8);
  b.castShadow = b.receiveShadow = true;
  scene.add(b);
  addBox(cx, A.z0 - 8, 40, 16);
  for (const x of [-18, 18]) {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0xffc83d, { metalness: 0.7, roughness: 0.3 }));
    dome.position.set(cx + x, 20, A.z0 - 2);
    scene.add(dome);
  }
  const signM = new THREE.MeshBasicMaterial({ map: signTexture(HOTEL.sign, HOTEL.sub, HOTEL.color), toneMapped: false });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(18, 4.5), signM);
  sign.position.set(cx, 15.5, A.z0 + 0.06);
  scene.add(sign);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), HDR(1.3, 1.0, 0.65));
  door.position.set(cx, 2, A.z0 + 0.05);
  scene.add(door);
  // gate ke khambe + red carpet
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3, 6), M(0x9a0f1f, { roughness: 0.9 }));
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(cx, 0.03, A.z0 + 3);
  scene.add(carpet);
  for (const x of [-2.5, 2.5]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 5, 12), M(0xffffff, { roughness: 0.3 }));
    p.position.set(cx + x, 2.5, A.z0 + 1);
    scene.add(p);
    addCircle(cx + x, A.z0 + 1, 0.4);
  }

  // ---- chhat: parapet, lift room, tanki ----
  const para = M(0xe8d8bc);
  for (const [x, z, w, d] of [[cx, 90.3, 40, 0.3], [cx, 105.7, 40, 0.3], [55.3, 98, 0.3, 16], [94.7, 98, 0.3, 16]]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, d), para);
    m.position.set(x, 20.55, z);
    scene.add(m);
  }
  const liftRoom = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3, 3.4), M(0xcfc0a4));
  liftRoom.position.set(LIFT.x, 21.5, 101.2);
  scene.add(liftRoom);
  const liftDoor = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.2), HDR(1.4, 1.2, 0.8));
  liftDoor.position.set(LIFT.x, 21.1, 102.92);
  scene.add(liftDoor);
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2, 14), M(0x111111));
  tank.position.set(62, 21, 95);
  scene.add(tank);
  const gLift = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.4), HDR(1.6, 1.3, 0.7));
  gLift.position.set(LIFT.x, 1.2, A.z0 + 0.06);
  scene.add(gLift);
  const ls = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.6), new THREE.MeshBasicMaterial({ map: signTexture('🛗 लिफ्ट', 'छत', '#2ef2ff', 512, 128), toneMapped: false }));
  ls.position.set(LIFT.x, 2.75, A.z0 + 0.07);
  scene.add(ls);
  triggers.push({ def: { id: 'lift', name: { hi: 'Lift — Chhat', bho: 'Lift — Chhat' }, avatar: '🛗', color: '#2ef2ff' }, x: LIFT.x, z: LIFT.z, heading: 0, r: 2.6, foot: true, lift: true });

  // ---- disco floor ----
  const FX = cx + 6, FZ = 118, NX = 8, NZ = 6, S = 1.4;
  const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(S * 0.95, 0.06, S * 0.95), new THREE.MeshBasicMaterial({ toneMapped: false }), NX * NZ);
  const d = new THREE.Object3D(), col = new THREE.Color();
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
    d.position.set(FX + (i - (NX - 1) / 2) * S, 0.05, FZ + (j - (NZ - 1) / 2) * S);
    d.updateMatrix();
    tiles.setMatrixAt(i * NZ + j, d.matrix);
    tiles.setColorAt(i * NZ + j, col.set(0x222222));
  }
  scene.add(tiles);
  // stage + truss
  const stage = new THREE.Mesh(new THREE.BoxGeometry(12, 0.6, 3.6), M(0x1a1a22, { roughness: 0.4 }));
  stage.position.set(FX, 0.3, A.z0 + 4.2);
  scene.add(stage);
  addBox(FX, A.z0 + 4.2, 12, 3.6, true);
  const trussM = M(0xaaaaaa, { metalness: 0.9, roughness: 0.3 });
  for (const x of [-6, 6]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6, 0.3), trussM);
    p.position.set(FX + x, 3, A.z0 + 5.8);
    scene.add(p);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(12.3, 0.3, 0.3), trussM);
  beam.position.set(FX, 6, A.z0 + 5.8);
  scene.add(beam);
  const beams = [];
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.8, 5, 16, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(i / 6, 1, 0.5), transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    c.position.set(FX - 5 + i * 2, 3.5, A.z0 + 5.6);
    scene.add(c);
    beams.push(c);
  }
  const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.1, flatShading: true, emissive: 0x332244 }));
  ball.position.set(FX, 7.5, FZ);
  scene.add(ball);
  const speakers = [];
  for (const x of [-7.5, 7.5]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.6, 1.1), M(0x111111));
    s.position.set(FX + x, 1.3, A.z0 + 4.2);
    scene.add(s);
    addBox(FX + x, A.z0 + 4.2, 1.4, 1.1);
    const cone = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), HDR(1.5, 0.4, 2.5));
    cone.position.set(FX + x, 1.6, A.z0 + 4.76);
    scene.add(cone);
    speakers.push(cone);
  }
  const discoLight = new THREE.PointLight(0xff3d7f, 0, 26, 2);
  discoLight.position.set(FX, 6, FZ);
  scene.add(discoLight);

  // ---- dancers (item song costume) ----
  const dancers = [0xff1493, 0xffd700, 0x00e5ff].map((c, i) => {
    const h = makeHuman({ female: true, outfit: 'saree', top: c, bottom: new THREE.Color(c).lerp(new THREE.Color(0xffffff), 0.25).getHex(), hairStyle: 'long' });
    h.root.position.set(FX - 3 + i * 3, 0.6, A.z0 + 4.4);
    h.root.rotation.y = Math.PI;
    h.phase = i * 1.3;
    scene.add(h.root);
    return h;
  });

  // ---- candlelight tables ----
  const tables = [];
  for (let k = 0; k < 3; k++) {
    const tx0 = A.x0 + 5, tz = A.z0 + 7 + k * 6;
    const g = new THREE.Group();
    g.position.set(tx0, 0, tz);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 20), M(0xfff6ea, { roughness: 0.8 }));
    top.position.y = 0.78;
    g.add(top);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.25, 0.76, 10), M(0x5a3a22));
    leg.position.y = 0.38;
    g.add(leg);
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 8), M(0xffffff));
    candle.position.y = 0.9;
    g.add(candle);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), HDR(3, 1.6, 0.4));
    flame.position.y = 1.02;
    g.add(flame);
    const rose = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), M(0xd0001a));
    rose.position.set(0.25, 0.85, 0.1);
    g.add(rose);
    for (const s of [-1, 1]) {
      const chair = new THREE.Group();
      chair.position.set(s * 1.05, 0, 0);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), M(0x7a1a2a));
      seat.position.y = 0.46;
      chair.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.5), M(0x7a1a2a));
      back.position.set(s * 0.25, 0.78, 0);
      chair.add(back);
      g.add(chair);
    }
    scene.add(g);
    addBox(tx0, tz, 3.0, 1.6);
    tables.push({ x: tx0, z: tz, flame });
  }

  // manager
  const keeper = { id: 'hotel', def: HOTEL, x: cx - 4, z: A.z0 + 2.2, heading: Math.PI };
  keepers.push(keeper);
  triggers.push({ def: HOTEL, x: cx - 4, z: A.z0 + 4.2, heading: 0, r: 2.8, foot: true, keeper, front: { x: cx, z: A.z1 } });

  let showUntil = 0;
  // 💸 noton ki baarish
  const NOTES = 90;
  const noteMat = new THREE.MeshStandardMaterial({ color: 0x9fd88a, side: THREE.DoubleSide, roughness: 0.8, emissive: 0x112a08 });
  const notes = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.32, 0.15), noteMat, NOTES);
  notes.frustumCulled = false;
  const nd = Array.from({ length: NOTES }, () => ({ life: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), r: Math.random() * 6 }));
  const zero = new THREE.Object3D(); zero.scale.setScalar(0); zero.updateMatrix();
  for (let i = 0; i < NOTES; i++) { notes.setMatrixAt(i, zero.matrix); notes.setColorAt(i, col.set(i % 3 ? 0x9fd88a : 0xff9fc0)); }
  scene.add(notes);
  let nCursor = 0;
  function spawnNotes(from, n = 30) {
    for (let k = 0; k < n; k++) {
      const q = nd[nCursor++ % NOTES];
      q.life = 3.5 + Math.random() * 1.5;
      q.p.set(from.x, 2.2, from.z);
      const tx = FX + (Math.random() - 0.5) * 9, tz = A.z0 + 4.4 + (Math.random() - 0.5) * 2;
      q.v.set((tx - from.x) / 1.4, 6 + Math.random() * 3, (tz - from.z) / 1.4);
    }
  }
  function update(t, dt, lv, { night, party }) {
    const on = t < showUntil;
    for (const h of dancers) {
      setAction(h, on || party ? 'dance' : 'idle');
      updateHuman(h, dt, t);
    }
    const bright = 0.4 + 0.6 * night;
    for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
      const k = i * NZ + j;
      const wave = Math.sin(t * 4 + i * 0.8 + j * 1.3 + lv.bass * 6);
      col.setHSL((t * 0.15 + (i + j) * 0.07) % 1, 1, 0.5).multiplyScalar((0.6 + 0.6 * Math.max(0, wave) + lv.bass * 0.5) * bright);
      tiles.setColorAt(k, col);
    }
    tiles.instanceColor.needsUpdate = true;
    ball.rotation.y += dt * (0.6 + lv.energy * 3);
    beams.forEach((b, i) => {
      b.rotation.z = Math.sin(t * 1.2 + i * 1.3) * 0.6;
      b.rotation.x = Math.cos(t * 0.9 + i) * 0.5 - 0.4;
      b.material.opacity = (on ? 0.12 : 0.06) + lv.mid * 0.12;
    });
    speakers.forEach((s) => s.scale.setScalar(1 + lv.bass * 0.4));
    discoLight.intensity = (on ? 45 : 15) * night + lv.bass * 14;
    discoLight.color.setHSL((t * 0.2) % 1, 1, 0.55);
    for (const tb of tables) tb.flame.scale.setScalar(1 + Math.sin(t * 20 + tb.x) * 0.15);
    for (let i = 0; i < NOTES; i++) {
      const q = nd[i];
      if (q.life <= 0) continue;
      q.life -= dt;
      q.v.y -= 6 * dt;
      q.v.multiplyScalar(1 - dt * 0.9);
      if (q.v.y < -1.2) q.v.y = -1.2;
      q.p.addScaledVector(q.v, dt);
      if (q.p.y < 0.05) { q.p.y = 0.05; q.v.set(0, 0, 0); }
      d.position.copy(q.p);
      d.rotation.set(Math.sin(t * 7 + q.r) * 1.2, t * 3 + q.r, Math.cos(t * 5 + q.r));
      d.scale.setScalar(q.life > 0 ? 1 : 0);
      d.updateMatrix();
      notes.setMatrixAt(i, q.life > 0 ? d.matrix : zero.matrix);
    }
    notes.instanceMatrix.needsUpdate = true;
  }
  return {
    update, dancers, tables, floor: { x: FX, z: FZ }, center: { x: cx, z: (A.z0 + A.z1) / 2 },
    startShow(t, dur = 40) { showUntil = t + dur; },
    spawnNotes,
    isShowing: (t) => t < showUntil,
    get showing() { return performance.now() > 0 && showUntil; },
  };
}
