import * as THREE from 'three';
import { makeHuman, updateHuman, setAction } from './humans.js';
import { addBox, BOXES } from './collide.js';
import { signTexture } from './textures.js';

// 🌿 MOHALLA SPA — Cyber City, Club Mirchi ke paas. Andar ja sakte ho: sheeshe ke darwaze khulte hain,
// andar garam roshni, lakdi ka farsh, maalish ki table, steam room, facial chair, aur Meena didi.
export const SPA_DEF = {
  id: 'spa', color: '#7dffb0', sign: 'MOHALLA SPA', sub: 'Champi • Maalish • Steam • Facial 🌿',
  name: { hi: 'Mohalla Spa 🌿', bho: 'Mohalla Spa 🌿' }, owner: 'Meena didi', avatar: '💆',
  greet: {
    hi: ['Aaiye aaiye, thake hue lag rahe ho! Baithiye 🌿', 'Aaj kya karwana hai — champi ya poori maalish?', 'Sar bhaari hai? Ek champi mein sab theek 😊', 'Steam le lo, saari thakaan pighal jaayegi ♨️'],
    bho: ['Aaiye aaiye, thakal lagat baani! Baithi 🌿', 'Aaj ka karwaib — champi ki poora maalish?', 'Kapaar bhaari ba? Ek champi mein sab theek 😊', 'Steam le li, saara thakaan pighal jaai ♨️'],
  },
  gaali: {
    hi: ['Paise nahi hain to baad mein aana bhaiya 😅', 'Bina paise ke champi? Sapne mein! 😄'],
    bho: ['Paisa naikhe ta baad mein aaiha 😅', 'Bina paisa ke champi? Sapna mein! 😄'],
  },
  keeper: { female: true, outfit: 'salwar', top: 0x2e9a6a, bottom: 0xf2f2e6, dupatta: 0xffffff },
  items: [
    { n: '💆 Sar ki champi', p: 60, fx: 'spa_champi', d: 'Tel wali champi — dimaag thanda, +30 health' },
    { n: '💪 Kandhe ki maalish', p: 120, fx: 'spa_shoulder', d: 'Kandhe-peeth ki akdan gayab — +50 health, 45s tez' },
    { n: '🦶 Pair ki maalish', p: 90, fx: 'spa_feet', d: 'Pair halke — 90 sec tak tez daudo/chalao' },
    { n: '♨️ Steam bath', p: 150, fx: 'spa_steam', d: 'Poori health + chot jaldi bhare' },
    { n: '✨ Facial', p: 140, fx: 'spa_facial', d: 'Chehra chamke — 10 min ladkiyon ki pasand ⬆️' },
    { n: '🌿 Full Spa Package', p: 420, fx: 'spa_full', d: 'Sab kuch ek saath — health full, tez, chamakta chehra' },
  ],
};

export const SPA = { x: 218, z: 118, w: 16, d: 13, h: 4.6 }; // darwaza pashchim (-X) wali deewar pe
const X0 = SPA.x - SPA.w / 2, X1 = SPA.x + SPA.w / 2, Z0 = SPA.z - SPA.d / 2, Z1 = SPA.z + SPA.d / 2;
const DOOR_W = 2.6, WALL = 0.5;
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, ...o });
const HDR = (r, g, b, o = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false, ...o });

export function buildSpa(scene, { triggers, keepers }) {
  const g = new THREE.Group();
  scene.add(g);
  const add = (geo, mat, x, y, z, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };

  // ---------- 🧱 imaarat ----------
  const outer = M(0xe8dcc6, { roughness: 0.85 }), inner = M(0xf4e6cc, { roughness: 0.95 });
  const mats = [outer, outer, outer, outer, inner, outer];
  const wall = (cx, cz, w, d) => { const m = add(new THREE.BoxGeometry(w, SPA.h, d), mats, cx, SPA.h / 2, cz); m.castShadow = m.receiveShadow = true; addBox(cx, cz, w, d); };
  wall(SPA.x, Z0, SPA.w, WALL); wall(SPA.x, Z1, SPA.w, WALL); wall(X1, SPA.z, WALL, SPA.d);
  const seg = (SPA.d - DOOR_W) / 2;
  wall(X0, Z0 + seg / 2, WALL, seg); wall(X0, Z1 - seg / 2, WALL, seg);
  add(new THREE.BoxGeometry(WALL, SPA.h - 2.8, DOOR_W), outer, X0, 2.8 + (SPA.h - 2.8) / 2, SPA.z);
  add(new THREE.BoxGeometry(SPA.w + 0.5, 0.35, SPA.d + 0.5), M(0x5a3a22), SPA.x, SPA.h + 0.17, SPA.z).castShadow = true;
  add(new THREE.BoxGeometry(SPA.w - 0.3, 0.04, SPA.d - 0.3), M(0xf8eedc), SPA.x, SPA.h - 0.04, SPA.z); // andar ki chhat
  // sign + hara neon + gamle
  const sign = add(new THREE.PlaneGeometry(7, 1.75), new THREE.MeshBasicMaterial({ map: signTexture(SPA_DEF.sign, SPA_DEF.sub, SPA_DEF.color), toneMapped: false }), X0 - 0.3, SPA.h - 0.9, SPA.z);
  sign.rotation.y = -Math.PI / 2;
  add(new THREE.BoxGeometry(0.1, 0.1, SPA.d), HDR(0.4, 2.4, 1.2), X0 - 0.3, SPA.h - 0.1, SPA.z);
  const plant = (x, z, parent = g) => { add(new THREE.CylinderGeometry(0.3, 0.22, 0.5, 10), M(0xb5562a), x, 0.25, z, parent); const l = add(new THREE.SphereGeometry(0.45, 10, 8), M(0x2f8a3f), x, 0.85, z, parent); l.scale.y = 1.3; };
  plant(X0 - 1, SPA.z - 2.2); plant(X0 - 1, SPA.z + 2.2);

  // ---------- 🚪 sheeshe ke khisakne wale darwaze ----------
  const glass = new THREE.MeshStandardMaterial({ color: 0x9fe8d0, metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.35 });
  const doors = [-1, 1].map((s) => {
    const d = add(new THREE.BoxGeometry(0.08, 2.7, DOOR_W / 2), glass, X0 - 0.05, 1.35, SPA.z + s * DOOR_W / 4);
    add(new THREE.BoxGeometry(0.1, 2.72, 0.05), M(0xc8a060, { metalness: 0.7, roughness: 0.3 }), 0, 0, -s * (DOOR_W / 4 - 0.03), d);
    return { d, s };
  });
  addBox(X0, SPA.z, WALL, DOOR_W);
  const doorBox = BOXES[BOXES.length - 1], doorClosed = { ...doorBox };
  let open = 0;

  // ---------- 🌿 andar ----------
  const inG = new THREE.Group();
  g.add(inG);
  add(new THREE.BoxGeometry(SPA.w - 0.6, 0.03, SPA.d - 0.6), M(0x8a5a32, { roughness: 0.5 }), SPA.x, 0.02, SPA.z, inG); // lakdi ka farsh
  // reception (darwaze ke paas, uttar ki taraf)
  add(new THREE.BoxGeometry(2.6, 1.05, 0.8), M(0x5a3a22, { roughness: 0.4 }), X0 + 2.6, 0.52, Z1 - 1.3, inG);
  add(new THREE.BoxGeometry(2.62, 0.05, 0.82), M(0xd8c8a8), X0 + 2.6, 1.07, Z1 - 1.3, inG);
  addBox(X0 + 2.6, Z1 - 1.3, 2.6, 0.8);
  // maalish ki do table (poorab ki taraf)
  const tables = [SPA.z - 3, SPA.z + 0.2].map((z) => {
    add(new THREE.BoxGeometry(2.1, 0.12, 0.8), M(0xfaf6ee), X1 - 3.2, 0.78, z, inG); // gadda (safed taulia)
    add(new THREE.BoxGeometry(2.0, 0.7, 0.7), M(0x6b4423), X1 - 3.2, 0.36, z, inG);
    addBox(X1 - 3.2, z, 2.1, 0.8);
    return { x: X1 - 3.2, z, y: 0.84 };
  });
  // facial / champi chair (dakshin-pashchim)
  const chair = { x: X0 + 3.2, z: Z0 + 2, y: 0 };
  add(new THREE.BoxGeometry(0.8, 0.5, 0.8), M(0x2e6a4a), chair.x, 0.45, chair.z, inG);
  add(new THREE.BoxGeometry(0.8, 1.0, 0.15), M(0x2e6a4a), chair.x + 0.35, 0.95, chair.z, inG).rotation.y = Math.PI / 2;
  // ♨️ steam room (dakshin-poorab kona): sheesha + bhaap
  const steamC = { x: X1 - 2.3, z: Z0 + 2.2 };
  add(new THREE.BoxGeometry(3.4, 2.8, 0.06), glass, steamC.x, 1.4, steamC.z + 1.7, inG);
  add(new THREE.BoxGeometry(2.6, 0.4, 0.8), M(0x9a7a5a), steamC.x + 0.2, 0.2, steamC.z - 0.6, inG); // bench
  const steam = new THREE.InstancedMesh(new THREE.SphereGeometry(0.35, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, depthWrite: false }), 24);
  const sd = Array.from({ length: 24 }, () => ({ x: (Math.random() - 0.5) * 3, y: Math.random() * 2.6, z: (Math.random() - 0.5) * 2.6, v: 0.2 + Math.random() * 0.3, s: 0.6 + Math.random() }));
  inG.add(steam);
  // diye/mombatti + garam roshni + paudhe
  for (const [x, z] of [[X1 - 0.5, Z1 - 0.5], [X1 - 0.5, SPA.z - 1.4], [X0 + 0.6, Z0 + 0.6], [SPA.x, Z1 - 0.5]]) {
    add(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 8), M(0xfff0d0), x, 0.1, z, inG);
    add(new THREE.SphereGeometry(0.05, 6, 4), HDR(3, 1.6, 0.4), x, 0.25, z, inG);
  }
  plant(X1 - 0.8, Z1 - 0.9, inG); plant(SPA.x, Z0 + 0.8, inG);
  const warm = new THREE.PointLight(0xffc890, 0, 16, 1.6); warm.position.set(SPA.x, SPA.h - 0.6, SPA.z); inG.add(warm);
  const warm2 = new THREE.PointLight(0xffb070, 0, 9, 1.8); warm2.position.set(X1 - 3, 2.2, SPA.z - 1.4); inG.add(warm2);

  // ---------- 💆 log: reception pe Meena didi (dukaan wali), table ke paas maalish wali Sunita ----------
  const k = { id: 'spa', def: SPA_DEF, x: X0 + 2.6, z: Z1 - 0.6, heading: Math.PI, stall: true };
  keepers.push(k);
  triggers.push({ def: SPA_DEF, x: X0 + 2.6, z: Z1 - 2.4, heading: Math.PI, r: 2.4, foot: true, keeper: k, front: { x: X0 - 3, z: SPA.z } });
  const masseuse = makeHuman({ female: true, outfit: 'salwar', top: 0xffffff, bottom: 0x2e9a6a, dupatta: 0x2e9a6a });
  masseuse.root.position.set(X1 - 3.2, 0, SPA.z - 1.4); masseuse.root.rotation.y = -Math.PI / 2;
  setAction(masseuse, 'idle');
  inG.add(masseuse.root);

  let inside = false, busyT = 0;
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
  return {
    def: SPA_DEF, tables, chair, steamC, masseuse,
    get inside() { return inside; },
    /** maalish wali ko kaam pe lagao (scene ke dauraan) */
    work(on, x, z, heading) {
      if (on) { masseuse.root.position.set(x, 0, z); masseuse.root.rotation.y = heading; setAction(masseuse, 'bathe'); busyT = 1; }
      else { masseuse.root.position.set(X1 - 3.2, 0, SPA.z - 1.4); masseuse.root.rotation.y = -Math.PI / 2; setAction(masseuse, 'idle'); busyT = 0; }
    },
    update(dt, t, p, cam) {
      const near = Math.hypot(cam.x - SPA.x, cam.z - SPA.z) < 60;
      g.visible = near;
      inside = p.x > X0 + 0.2 && p.x < X1 && p.z > Z0 && p.z < Z1;
      const want = Math.hypot(p.x - X0, p.z - SPA.z) < 3.6 ? 1 : 0;
      open += (want - open) * Math.min(1, dt * 4);
      for (const d of doors) d.d.position.z = SPA.z + d.s * (DOOR_W / 4 + open * DOOR_W / 2.2); // khisak ke deewar ke peeche
      Object.assign(doorBox, open < 0.5 ? doorClosed : { x0: -9999, x1: -9998, z0: -9999, z1: -9998 });
      if (!near) return;
      const lit = inside || (cam.x > X0 && cam.x < X1 && cam.z > Z0 && cam.z < Z1) || Math.hypot(p.x - X0, p.z - SPA.z) < 10;
      inG.visible = lit;
      warm.intensity = lit ? 14 : 0; warm2.intensity = lit ? 6 : 0;
      if (!lit) return;
      for (let i = 0; i < sd.length; i++) {
        const q = sd[i]; q.y += q.v * dt; if (q.y > 2.7) q.y = 0;
        _p.set(steamC.x + q.x + Math.sin(t + i) * 0.2, q.y, steamC.z + q.z * 0.6); _s.setScalar(q.s * (0.6 + q.y * 0.3));
        steam.setMatrixAt(i, _m.compose(_p, _q, _s));
      }
      steam.instanceMatrix.needsUpdate = true;
      updateHuman(masseuse, dt, t);
      void busyT;
    },
  };
}
