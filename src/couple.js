import * as THREE from 'three';
import { makeHuman, updateHuman, setAction } from './humans.js';

// 💞 Prem Ghat: hero-heroine ka couple (kiss scene wala) + aas-paas aur jode, sab asli 3D log
// Seedhi ka upar wala kinara y≈0.03, z≈-119.95; neeche Ganga. Sab -Z (nadi) ki taraf mooh karke baithe.
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, ...o });
function part(parent, geo, mat, x, y, z) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}
const SEAT_Y = -0.43; // 'sit' mein kamar root se 0.5 upar → seedhi ke kinare pe
const EDGE_Z = -119.95;
const R = Math.random;

function pair(x, femRight, look) {
  const he = makeHuman({ female: false, old: R() < 0.15 });
  const she = makeHuman({ female: true, outfit: R() < 0.6 ? 'saree' : 'salwar' });
  const sx = femRight ? 1 : -1;
  return { he, she, x, sx, mood: look, phase: R() * 6, t: R() * 5 };
}

export function buildCouple(scene) {
  const C = new THREE.Vector3(4, 0.03, EDGE_Z);
  const g = new THREE.Group();
  scene.add(g);

  // ---- hero-heroine ----
  const man = makeHuman({ female: false, top: 0xf5f0e6, bottom: 0x2a2a40, modelIdx: 0 });
  const woman = makeHuman({ female: true, outfit: 'saree', top: 0xb0123f, bottom: 0xd81b60 });
  for (const h of [man, woman]) { g.add(h.root); setAction(h, 'sit'); h.root.rotation.order = 'YXZ'; }

  // saamne jalta diya — chehre pe garam roshni
  part(g, new THREE.CylinderGeometry(0.1, 0.06, 0.06, 10), M(0x9a4a22), C.x, -0.37, C.z - 0.75);
  part(g, new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.5, 0.4), toneMapped: false }), C.x, -0.3, C.z - 0.75);
  const diyaLight = new THREE.PointLight(0xffa060, 5, 6, 2);
  diyaLight.position.set(C.x, 0.25, C.z - 1.2);
  g.add(diyaLight);

  // ---- aur jode (seedhiyon pe, pandit ji (-6) aur hero (4) se door) ----
  const others = [[-27, true, 'lean'], [-20, false, 'talk'], [-13.5, true, 'river'], [12, false, 'lean'], [18.5, true, 'talk'], [26, false, 'river']]
    .map(([x, fr, mood]) => pair(x, fr, mood));
  for (const c of others) {
    for (const h of [c.he, c.she]) { g.add(h.root); setAction(h, 'sit'); h.root.rotation.order = 'YXZ'; }
    c.he.root.position.set(c.x - c.sx * 0.38, SEAT_Y, EDGE_Z);
    c.she.root.position.set(c.x + c.sx * 0.38, SEAT_Y, EDGE_Z);
  }

  // ---- 90s censor wale phool 🌸 ----
  const F = new THREE.Vector3(-8, 0.03, -113);
  const fl = new THREE.Group();
  fl.position.copy(F);
  scene.add(fl);
  part(fl, new THREE.CylinderGeometry(0.35, 0.25, 0.5, 14), M(0xb5562a), 0, 0.25, 0);
  const stems = [-1, 1].map((s) => {
    const piv = new THREE.Group();
    piv.position.set(s * 0.16, 0.5, 0);
    part(piv, new THREE.CylinderGeometry(0.02, 0.025, 0.82, 6), M(0x2f8a2f), 0, 0.41, 0);
    const leaf = part(piv, new THREE.SphereGeometry(0.08, 8, 6), M(0x2f8a2f), s * 0.07, 0.3, 0);
    leaf.scale.set(1, 0.3, 0.5);
    const head = new THREE.Group();
    head.position.y = 0.84;
    head.rotation.z = s * 0.9;
    head.rotation.x = -0.5;
    part(head, new THREE.SphereGeometry(0.06, 10, 8), M(0xffd23f, { emissive: 0x553300 }), 0, 0, 0);
    const petal = M(s < 0 ? 0xff4f8b : 0xff2d55, { emissive: s < 0 ? 0x401020 : 0x400010 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const pm = part(head, new THREE.SphereGeometry(0.07, 8, 6), petal, Math.cos(a) * 0.1, 0.01, Math.sin(a) * 0.1);
      pm.scale.set(1.3, 0.35, 0.8);
      pm.rotation.y = -a;
    }
    piv.add(head);
    fl.add(piv);
    return piv;
  });

  // ---- 🌹 gulaab ki pankhudiyan (sirf romantic scene mein) ----
  const PN = 140;
  const petalGeo = new THREE.PlaneGeometry(0.07, 0.05);
  const petals = new THREE.InstancedMesh(petalGeo, new THREE.MeshStandardMaterial({ color: 0xd8143a, emissive: 0x3a0010, side: THREE.DoubleSide, roughness: 0.6 }), PN);
  const pd = Array.from({ length: PN }, () => ({ x: (R() - 0.5) * 7, y: R() * 5, z: (R() - 0.5) * 4, v: 0.35 + R() * 0.4, s: R() * 6, r: R() * 6 }));
  petals.visible = false;
  petals.frustumCulled = false;
  scene.add(petals);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);

  let K = 0, LEAN = 0;
  function setK(k, lean = 0) { K = k; LEAN = lean; }
  function setFlowers(f) {
    stems[0].rotation.z = -0.11 * f;
    stems[1].rotation.z = 0.11 * f;
  }
  function placeHero() {
    // kareeb aao, ek-doosre ki taraf mudo, sar jhukao
    man.root.position.set(C.x - 0.4 + 0.15 * K, SEAT_Y, C.z);
    woman.root.position.set(C.x + 0.4 - 0.15 * K, SEAT_Y, C.z);
    man.root.rotation.y = -0.55 * K;
    woman.root.rotation.y = 0.55 * K;
    man.root.rotation.z = -0.1 * LEAN;
    woman.root.rotation.z = 0.12 * K + 0.16 * LEAN;
    man.look = -0.6 * K;
    woman.look = 0.6 * K;
  }
  placeHero();

  let petalsOn = false;
  return {
    C, F, setK, setFlowers,
    setPetals(on) { petalsOn = on; petals.visible = on; },
    idle(t) { setFlowers(0.35 + 0.15 * Math.sin(t * 1.5)); },
    /** har frame: paas ho tabhi chalao (romance = scene chal raha hai → sab jode aur kareeb) */
    update(dt, t, cam, romance) {
      const near = Math.hypot(cam.x - C.x, cam.z - C.z) < 70;
      g.visible = near;
      if (!near) return;
      placeHero();
      if (!romance) { man.look = Math.sin(t * 0.5) * 0.25 - 0.1; woman.look = -0.35 + Math.sin(t * 0.7 + 1) * 0.2; }
      updateHuman(man, dt, t); updateHuman(woman, dt, t);
      for (const c of others) {
        c.t -= dt;
        const towards = c.sx; // she ki taraf +sx
        if (c.mood === 'lean') { // 💞 kandhe pe sar
          c.she.root.rotation.z = towards * 0.17; c.she.look = -towards * 0.5; c.he.look = towards * 0.25 * Math.sin(t * 0.3 + c.phase);
        } else if (c.mood === 'talk') { // baatein — baari-baari ek-doosre ko dekhte
          const k = Math.sin(t * 0.6 + c.phase);
          c.he.look = -towards * (0.55 + 0.3 * k); c.she.look = towards * (0.5 - 0.3 * k);
          c.he.root.rotation.y = -towards * 0.25; c.she.root.rotation.y = towards * 0.25;
        } else { // nadi ko niharte, kabhi ek nazar ek-doosre pe
          const glance = Math.sin(t * 0.25 + c.phase) > 0.85 ? 1 : 0;
          c.he.look = -towards * 0.6 * glance; c.she.look = towards * 0.6 * glance;
        }
        if (romance) { c.she.root.rotation.z = towards * 0.2; c.she.look = -towards * 0.6; }
        updateHuman(c.he, dt, t); updateHuman(c.she, dt, t);
      }
      if (petalsOn) {
        for (let i = 0; i < PN; i++) {
          const q = pd[i];
          q.y -= q.v * dt;
          if (q.y < -0.5) { q.y = 4 + R(); q.x = (R() - 0.5) * 7; q.z = (R() - 0.5) * 4; }
          _p.set(C.x + q.x + Math.sin(t * 1.2 + q.s) * 0.3, C.y + q.y, C.z + q.z);
          _q.setFromEuler(_e.set(t * 2 + q.r, t * 1.3 + q.s, q.r));
          _m.compose(_p, _q, _s);
          petals.setMatrixAt(i, _m);
        }
        petals.instanceMatrix.needsUpdate = true;
      }
    },
  };
}
