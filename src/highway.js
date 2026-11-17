import * as THREE from 'three';
import { signTexture, roadTexture } from './textures.js';
import { addBox, addCircle, STN_RD_Z, HWY_X } from './collide.js';

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, ...o });

function cropTexture(base, line) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 128; i += 8) { g.fillStyle = line; g.fillRect(i, 0, 4, 128); }
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.15})`; g.fillRect(Math.random() * 128, Math.random() * 128, 2, 2); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Station Road → lamba highway, khet, dhaba, petrol pump */
export function buildHighway(scene, { tree, triggers, keepers, defs }) {
  const Z = STN_RD_Z;
  const rt = roadTexture();
  for (const s of [-1, 1]) {
    const len = HWY_X - 70;
    const t = rt.clone();
    t.repeat.set(1, len / 18);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(18, len), new THREE.MeshStandardMaterial({ map: t, roughness: 0.55, metalness: 0.2 }));
    road.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
    road.position.set(s * (70 + len / 2), 0.022, Z);
    road.receiveShadow = true;
    scene.add(road);
    // khet
    const crops = [cropTexture('#5f8a2c', '#7aa83a'), cropTexture('#b9a13a', '#d4bd52'), cropTexture('#4f7a32', '#3f6a28')];
    for (let k = 0; k < 6; k++) {
      for (const zs of [-1, 1]) {
        const w = len / 6 - 4;
        const tx = crops[(k + (zs > 0 ? 1 : 0)) % 3];
        const f = new THREE.Mesh(new THREE.PlaneGeometry(w, 40), new THREE.MeshStandardMaterial({ map: tx, roughness: 1 }));
        f.material.map = tx.clone(); f.material.map.repeat.set(w / 12, 4);
        f.rotation.x = -Math.PI / 2;
        f.position.set(s * (72 + (k + 0.5) * (len / 6)), 0.012, Z + zs * 32);
        f.receiveShadow = true;
        scene.add(f);
      }
    }
    // ped aur khambe
    for (let x = 80; x < HWY_X - 5; x += 18) {
      for (const zs of [-1, 1]) {
        if (Math.abs(x - 175) < 18) continue; // jod-sadak ke beech ped nahi
        if (Math.random() < 0.55) tree(s * (x + Math.random() * 6), Z + zs * (12.5 + Math.random() * 3), 0.7 + Math.random() * 0.5);
      }
    }
    const poleM = M(0x5a4a3a);
    let prev = null;
    for (let x = 76; x < HWY_X; x += 30) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 8, 6), poleM);
      p.position.set(s * x, 4, Z - 11.5);
      scene.add(p);
      addCircle(s * x, Z - 11.5, 0.3);
      if (prev) {
        const pts = [];
        for (let i = 0; i <= 12; i++) { const f = i / 12; pts.push(new THREE.Vector3(prev + (s * x - prev) * f, 7.6 - Math.sin(f * Math.PI) * 1.2, Z - 11.5)); }
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x111111 })));
      }
      prev = s * x;
    }
    // highway board
    const bm = new THREE.MeshBasicMaterial({ map: signTexture(s < 0 ? '← पटना 120 किमी' : 'बनारस 85 किमी →', 'NH-19 • धीरे चलें, घर पर कोई इंतज़ार कर रहा है', '#3dff7a'), toneMapped: false });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.25), bm);
    board.position.set(s * 95, 5, Z + 12);
    board.rotation.y = Math.PI;
    scene.add(board);
    for (const dx of [-4, 4]) { const pp = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 5, 6), poleM); pp.position.set(s * 95 + dx, 2.5, Z + 12.1); scene.add(pp); }
  }

  // ---- Highway Dhaba (pashchim) ----
  const dx = -220;
  const dhaba = new THREE.Group();
  dhaba.position.set(dx, 0, Z + 18);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 8), M(0x8a5a2a));
  roof.position.y = 3.6;
  dhaba.add(roof);
  for (const [x, z] of [[-6.5, -3.5], [6.5, -3.5], [-6.5, 3.5], [6.5, 3.5]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 3.6, 8), M(0x6b4423)); p.position.set(x, 1.8, z); dhaba.add(p); }
  const back = new THREE.Mesh(new THREE.BoxGeometry(14, 3.6, 0.3), M(0xd9a441));
  back.position.set(0, 1.8, 3.8);
  dhaba.add(back);
  for (let i = 0; i < 3; i++) {
    const cp = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 1.1), M(0xc2a36b));
    cp.position.set(-4 + i * 4, 0.45, -1);
    dhaba.add(cp);
    addBox(dx - 4 + i * 4, Z + 17, 2.2, 1.1);
  }
  const tand = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 1.2, 14), M(0x9a5b33));
  tand.position.set(5, 0.6, 2);
  dhaba.add(tand);
  const ds = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.25), new THREE.MeshBasicMaterial({ map: signTexture(defs.hdhaba.sign, defs.hdhaba.sub, defs.hdhaba.color), toneMapped: false }));
  ds.position.set(0, 4.9, -4);
  ds.rotation.y = Math.PI;
  dhaba.add(ds);
  scene.add(dhaba);
  addBox(dx, Z + 21.8, 14, 0.4);
  const hk = { id: 'hdhaba', def: defs.hdhaba, x: dx + 2, z: Z + 20.6, heading: Math.PI };
  keepers.push(hk);
  triggers.push({ def: defs.hdhaba, x: dx + 2, z: Z + 17.8, heading: 0, r: 4.2, foot: true, keeper: hk, front: { x: dx, z: Z + 10 } });

  // ---- Petrol pump (purab) ----
  const px = 220;
  const pump = new THREE.Group();
  pump.position.set(px, 0, Z + 20);
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(16, 0.6, 10), M(0xffffff, { roughness: 0.4 }));
  canopy.position.y = 5;
  pump.add(canopy);
  const band = new THREE.Mesh(new THREE.BoxGeometry(16.1, 0.5, 10.1), M(0xff6a00));
  band.position.y = 5.2;
  pump.add(band);
  for (const x of [-5, 5]) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5, 0.5), M(0xdddddd));
    col.position.set(x, 2.5, 0);
    pump.add(col);
    const dsp = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.6), M(0xff6a00));
    dsp.position.set(x, 0.8, 1.5);
    pump.add(dsp);
    addBox(px + x, Z + 21.5, 0.8, 0.6);
  }
  const ps = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({ map: signTexture('मोहल्ला फ्यूल स्टेशन', '24 घंटे • हवा मुफ़्त', '#ff9a1f'), toneMapped: false }));
  ps.position.set(0, 6.6, -5.05);
  ps.rotation.y = Math.PI;
  pump.add(ps);
  scene.add(pump);
}
