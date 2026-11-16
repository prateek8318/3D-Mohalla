import * as THREE from 'three';
import { makeHuman, updateHuman, setAction } from './humans.js';
import { DRIVE, addBox } from './collide.js';

// Mohalle mein aur bhi jode — benches/ghat/park pe baithe (saaf-suthra romance)
const SPOTS = [
  { x: -128, z: 134, h: 0 },        // Gandhi Park
  { x: -140, z: 150, h: Math.PI / 2 },
  // footpath pe — sadak (|x| < 8.4, cross road |z| < 8.4) se bahar
  { x: 14, z: 9.7, h: Math.PI },        // Chowk kinaare (cross road ka footpath)
  { x: -9.7, z: 60, h: Math.PI / 2 },   // main road ka footpath
  { x: 9.7, z: 95, h: -Math.PI / 2 },
  { x: -14, z: -108, h: 0 },        // Prem Ghat seedhi
  { x: 14, z: -108, h: 0 },
  { x: -40, z: 198, h: Math.PI / 2 }, // Bazaar gali
  { x: 20, z: 456, h: Math.PI },    // Station platform
];
const M = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75 });

export function buildCouples(scene) {
  const couples = [];
  for (const s of SPOTS) {
    // safety: bench ka koi bhi kona gaadi wali sadak pe pade to skip — dobara beech sadak bench nahi
    const onRoad = [[-1, -0.3], [1, -0.3], [-1, 0.6], [1, 0.6]].some(([a, b]) => {
      const x = s.x + Math.cos(s.h) * a + Math.sin(s.h) * b, z = s.z - Math.sin(s.h) * a + Math.cos(s.h) * b;
      return DRIVE.some((r) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1);
    });
    if (onRoad) { console.warn('bench sadak pe tha, skip:', s); continue; }
    addBox(s.x, s.z, Math.abs(Math.cos(s.h)) * 1.9 + Math.abs(Math.sin(s.h)) * 0.6, Math.abs(Math.sin(s.h)) * 1.9 + Math.abs(Math.cos(s.h)) * 0.6, true);
    const bench = new THREE.Group();
    bench.position.set(s.x, 0, s.z);
    bench.rotation.y = s.h;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 0.55), M(0x7a4a2a));
    seat.position.y = 0.45; bench.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 0.1), M(0x7a4a2a));
    back.position.set(0, 0.72, -0.24); bench.add(back);
    for (const x of [-0.85, 0.85]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.5), M(0x5a3a22)); l.position.set(x, 0.22, 0); bench.add(l); }
    scene.add(bench);

    const he = makeHuman({ female: false, old: Math.random() < 0.2 });
    const she = makeHuman({ female: true, outfit: Math.random() < 0.5 ? 'saree' : 'salwar' });
    const fx = -Math.sin(s.h), fz = -Math.cos(s.h), rx = Math.cos(s.h), rz = -Math.sin(s.h);
    he.root.position.set(s.x - rx * 0.45, 0.02, s.z - rz * 0.45);
    she.root.position.set(s.x + rx * 0.45, 0.02, s.z + rz * 0.45);
    he.root.rotation.y = s.h; she.root.rotation.y = s.h;
    scene.add(he.root, she.root);
    setAction(he, 'sit'); setAction(she, 'sit');
    couples.push({ he, she, s, phase: Math.random() * 6, leanT: 2 + Math.random() * 8 });
  }
  const camP = new THREE.Vector3();
  return {
    update(dt, t, cam) {
      camP.copy(cam);
      for (const c of couples) {
        const vis = Math.hypot(c.s.x - camP.x, c.s.z - camP.z) < 85;
        c.he.root.visible = c.she.root.visible = vis;
        if (!vis) continue;
        c.leanT -= dt;
        const lean = c.leanT < 1.4 && c.leanT > 0;
        setAction(c.he, lean ? 'hug' : 'sit');
        setAction(c.she, lean ? 'hug' : 'sit');
        c.he.look = Math.sin(t * 0.6 + c.phase) * 0.25 + 0.3;
        c.she.look = -0.3 - Math.sin(t * 0.6 + c.phase) * 0.2;
        if (c.leanT <= 0) c.leanT = 6 + Math.random() * 10;
        updateHuman(c.he, dt, t);
        updateHuman(c.she, dt, t);
      }
    },
  };
}
