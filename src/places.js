import * as THREE from 'three';
import { signTexture } from './textures.js';
import { MANDIR, MASJID } from './data.js';
import { addBox } from './collide.js';

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, ...o });
const HDR = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });

function archGeo(w, h) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(-w / 2, h);
  s.absarc(0, h, w / 2, Math.PI, 0, true);
  s.lineTo(w / 2, 0);
  s.lineTo(-w / 2, 0);
  return new THREE.ShapeGeometry(s, 16);
}

function signPlane(text, sub, color, w, h) {
  const m = new THREE.MeshBasicMaterial({ map: signTexture(text, sub, color), toneMapped: false });
  m.color.setScalar(1.1);
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
}

export function buildPlaces(scene, { CIRCLES, triggers }) {
  const treeAt = [];
  const updaters = [];
  let aartiUntil = 0;

  // ================= MANDIR (west end) =================
  {
    const g = new THREE.Group();
    g.position.set(-160, 0, 0);
    addBox(-163, 0, 16, 16);
    g.rotation.y = Math.PI / 2;
    scene.add(g);
    const add = (geo, mat, x, y, z, par = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); par.add(m); return m; };
    const stone = M(0xe8d5b0), ochre = M(0xe0782a), ochre2 = M(0xf09a40);
    [16, 14, 12].forEach((w, i) => add(new THREE.BoxGeometry(w, 0.5, w), stone, 0, 0.25 + i * 0.5, 0));
    add(new THREE.BoxGeometry(6, 5, 6), stone, 0, 4, -2);
    for (let i = 0; i < 8; i++) {
      const r = 3.2 * (1 - i / 9) + 0.3;
      add(new THREE.CylinderGeometry(r * 0.86, r, 1.3, 8), i % 2 ? ochre : ochre2, 0, 7.15 + i * 1.3, -2);
    }
    const top = 6.5 + 8 * 1.3;
    add(new THREE.TorusGeometry(0.6, 0.25, 8, 16), ochre2, 0, top + 0.1, -2).rotation.x = Math.PI / 2;
    add(new THREE.SphereGeometry(0.55, 14, 10), M(0xffc83d, { metalness: 0.9, roughness: 0.25, emissive: 0x553300 }), 0, top + 0.6, -2);
    add(new THREE.CylinderGeometry(0.05, 0.05, 3, 6), M(0x553311), 0, top + 2.2, -2);
    const flagGeo = new THREE.PlaneGeometry(1.6, 1.0, 10, 1);
    flagGeo.translate(0.8, 0, 0);
    const flag = add(flagGeo, new THREE.MeshStandardMaterial({ color: 0xff7a00, side: THREE.DoubleSide, emissive: 0x662200 }), 0, top + 3.2, -2);
    const fpos = flagGeo.attributes.position, fbase = fpos.array.slice();
    // mandap
    for (const [x, z] of [[-2.8, 1.6], [2.8, 1.6], [-2.8, 4.4], [2.8, 4.4]]) add(new THREE.CylinderGeometry(0.25, 0.3, 3.2, 10), stone, x, 3.1, z);
    add(new THREE.BoxGeometry(7, 0.4, 4.2), stone, 0, 4.9, 3);
    add(new THREE.SphereGeometry(1.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), ochre2, 0, 5.1, 3);
    add(new THREE.PlaneGeometry(2, 3), HDR(2.4, 1.2, 0.4), 0, 3, 1.01);
    const s = signPlane(MANDIR.sign, MANDIR.sub, MANDIR.color, 5.5, 1.375);
    s.position.set(0, 4.9, 5.15);
    g.add(s);
    const gold = M(0xffc83d, { metalness: 0.9, roughness: 0.25 });
    const bells = [-1.2, 1.2].map((x) => {
      const piv = new THREE.Group();
      piv.position.set(x, 4.7, 3.5);
      add(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 4), gold, 0, -0.25, 0, piv);
      add(new THREE.CylinderGeometry(0.08, 0.28, 0.4, 12), gold, 0, -0.65, 0, piv);
      g.add(piv);
      return piv;
    });
    const diyaMat = HDR(3, 1.3, 0.3);
    const diyas = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 6, 4), diyaMat, 44);
    const d = new THREE.Object3D();
    for (let i = 0; i < 44; i++) {
      const f = i / 44;
      if (i < 22) d.position.set(-5.6 + (i / 21) * 11.2, 1.58, 5.7);
      else d.position.set(i < 33 ? -5.7 : 5.7, 1.58, 5.4 - ((i - 22) % 11) * 1.0);
      void f;
      d.updateMatrix();
      diyas.setMatrixAt(i, d.matrix);
    }
    g.add(diyas);
    const light = new THREE.PointLight(0xff9a3d, 50, 28, 2);
    light.position.set(0, 4, 7);
    g.add(light);
    triggers.push({ def: MANDIR, x: -148.5, z: 0, heading: Math.PI / 2, r: 6 });
    let bellSwing = 0;
    updaters.push((t, dt, env) => {
      for (let i = 0; i < fpos.count; i++) {
        const x = fbase[i * 3];
        fpos.array[i * 3 + 2] = Math.sin(x * 4 - t * 6) * 0.12 * (x / 1.6);
      }
      fpos.needsUpdate = true;
      const aarti = t < aartiUntil;
      diyaMat.color.setRGB(3, 1.3, 0.3).multiplyScalar((0.35 + 0.65 * env.night) * (aarti ? 1.8 + Math.sin(t * 20) * 0.4 : 1));
      light.intensity = (25 + 40 * env.night) * (aarti ? 2.5 : 1);
      bellSwing *= 1 - Math.min(1, dt * 1.2);
      bells.forEach((b, i) => { b.rotation.x = Math.sin(t * 9 + i) * bellSwing; });
    });
    var ringBells = () => { bellSwing = 0.6; };
  }

  // ================= MASJID (east end) =================
  {
    const g = new THREE.Group();
    g.position.set(160, 0, 0);
    g.rotation.y = -Math.PI / 2;
    scene.add(g);
    const add = (geo, mat, x, y, z, par = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); par.add(m); return m; };
    const white = M(0xe2dacb), green = M(0x1e8a4a, { roughness: 0.4 }), domeMat = M(0xeaf5ec, { roughness: 0.35 });
    const gold = M(0xffc83d, { metalness: 0.9, roughness: 0.25, emissive: 0x443300 });
    add(new THREE.BoxGeometry(18, 1, 16), white, 0, 0.5, 0);
    add(new THREE.BoxGeometry(14, 6, 9), white, 0, 4, -1);
    add(new THREE.BoxGeometry(14.3, 0.4, 9.3), green, 0, 7.2, -1);
    const archMat = HDR(2.2, 1.6, 0.8);
    for (const x of [-4, 0, 4]) {
      const a = new THREE.Mesh(archGeo(x === 0 ? 2.6 : 2.0, x === 0 ? 2.6 : 2.2), archMat);
      a.position.set(x, 1, 3.52);
      g.add(a);
    }
    const crescent = (y, x = 0, z = -1, sc = 1) => {
      add(new THREE.CylinderGeometry(0.04, 0.04, 0.9 * sc, 6), gold, x, y + 0.45 * sc, z);
      add(new THREE.SphereGeometry(0.14 * sc, 10, 8), gold, x, y + 0.6 * sc, z);
      const c = add(new THREE.TorusGeometry(0.3 * sc, 0.06 * sc, 8, 20, Math.PI * 1.4), gold, x, y + 1.15 * sc, z);
      c.rotation.z = Math.PI * 0.8;
    };
    add(new THREE.CylinderGeometry(3, 3, 1, 24), white, 0, 7.9, -1);
    const dome = add(new THREE.SphereGeometry(3.1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), domeMat, 0, 8.4, -1);
    dome.scale.y = 1.25;
    crescent(8.4 + 3.1 * 1.25);
    for (const x of [-4.8, 4.8]) {
      add(new THREE.SphereGeometry(1.4, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), domeMat, x, 7.4, -1).scale.y = 1.2;
      crescent(7.4 + 1.68, x, -1, 0.6);
    }
    const rings = [];
    const ringMat = HDR(0.3, 2.4, 0.8);
    for (const x of [-7.5, 7.5]) {
      add(new THREE.CylinderGeometry(0.55, 0.7, 15, 14), white, x, 8.5, 3.5);
      for (const y of [6, 11]) {
        add(new THREE.CylinderGeometry(0.95, 0.95, 0.3, 16), green, x, y, 3.5);
        const r = add(new THREE.TorusGeometry(0.97, 0.06, 6, 28), ringMat, x, y + 0.18, 3.5);
        r.rotation.x = Math.PI / 2;
        rings.push(r);
      }
      add(new THREE.CylinderGeometry(0.75, 0.75, 1.2, 10), white, x, 16.4, 3.5);
      add(new THREE.SphereGeometry(0.75, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), domeMat, x, 17, 3.5).scale.y = 1.3;
      crescent(17.95, x, 3.5, 0.5);
    }
    const s = signPlane(MASJID.sign, MASJID.sub, MASJID.color, 5.5, 1.375);
    s.position.set(0, 5.9, 3.54);
    g.add(s);
    const light = new THREE.PointLight(0xbfffd0, 45, 28, 2);
    light.position.set(0, 4, 7);
    g.add(light);
    triggers.push({ def: MASJID, x: 148.5, z: 0, heading: -Math.PI / 2, r: 6 });
    addBox(165, 0, 18, 32);
    updaters.push((t, dt, env) => {
      ringMat.color.setRGB(0.3, 2.4, 0.8).multiplyScalar(0.3 + 0.7 * env.night);
      archMat.color.setRGB(2.2, 1.6, 0.8).multiplyScalar(0.5 + 0.5 * env.night);
      light.intensity = 20 + 35 * env.night;
    });
  }

  // ================= BIJLI KE TAAR =================
  const wireMat = new THREE.LineBasicMaterial({ color: 0x0a0a0a });
  const wire = (a, b, sag) => {
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const f = i / 16;
      pts.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f - Math.sin(f * Math.PI) * sag, a[2] + (b[2] - a[2]) * f));
    }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat));
  };
  const poles = [];
  for (let z = -86; z <= 418; z += 22) if (Math.abs(z) >= 12 && Math.abs(z + 5 - 140) > 11 && Math.abs(z + 5 - 330) > 11) poles.push(z + 5);
  for (const s of [-1, 1]) {
    for (let i = 0; i < poles.length - 1; i++) {
      if ((poles[i] < 0 && poles[i + 1] > 0) || (poles[i] < 140 && poles[i + 1] > 140) || (poles[i] < 330 && poles[i + 1] > 330)) continue;
      wire([s * 9.6, 6.9, poles[i]], [s * 9.6, 6.9, poles[i + 1]], 0.9);
      wire([s * 9.6, 6.5, poles[i]], [s * 9.6, 6.5, poles[i + 1]], 1.2);
    }
    poles.forEach((z, i) => {
      wire([s * 9.6, 6.7, z], [s * 10.7, 5 + (i % 3), z + ((i * 7) % 5) - 2], 0.3);
      if (s < 0 && i % 2 === 0) wire([-9.6, 6.8, z], [9.6, 6.8, z + 6], 1.6);
    });
  }

  // ================= KAALI-PEELI TAXI + SCOOTER =================
  const black = M(0x111111, { metalness: 0.5, roughness: 0.35 }), yellow = M(0xffc800, { metalness: 0.3, roughness: 0.4 });
  const glass = M(0x223344, { metalness: 0.9, roughness: 0.1 }), chrome = M(0xdddddd, { metalness: 1, roughness: 0.2 }), tyre = M(0x0d0d0d);
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.25, 14);
  wheelGeo.rotateZ(Math.PI / 2);
  function taxi(x, z, ry) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    const add = (geo, mat, px, py, pz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); g.add(m); return m; };
    add(new THREE.BoxGeometry(1.75, 0.7, 4.2), black, 0, 0.7, 0);
    add(new THREE.BoxGeometry(1.6, 0.6, 2.1), glass, 0, 1.35, 0.2);
    add(new THREE.BoxGeometry(1.64, 0.1, 2.15), yellow, 0, 1.68, 0.2);
    add(new THREE.BoxGeometry(1.4, 0.04, 1.6), chrome, 0, 1.85, 0.2);
    for (const sx of [-0.65, 0.65]) add(new THREE.BoxGeometry(0.05, 0.15, 1.6), chrome, sx, 1.78, 0.2);
    add(new THREE.BoxGeometry(1.8, 0.15, 0.15), chrome, 0, 0.45, -2.15);
    add(new THREE.BoxGeometry(1.8, 0.15, 0.15), chrome, 0, 0.45, 2.15);
    for (const sx of [-0.6, 0.6]) add(new THREE.CircleGeometry(0.16, 12), HDR(1.6, 1.5, 1.2), sx, 0.8, -2.11).rotation.y = Math.PI;
    for (const [wx, wz] of [[-0.85, -1.3], [0.85, -1.3], [-0.85, 1.3], [0.85, 1.3]]) add(wheelGeo, tyre, wx, 0.38, wz);
    scene.add(g);
    const fx = Math.sin(ry), fz = Math.cos(ry);
    CIRCLES.push({ x: x + fx * 1.2, z: z + fz * 1.2, r: 1.0 }, { x: x - fx * 1.2, z: z - fz * 1.2, r: 1.0 });
  }
  function scooter(x, z, ry, col) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    const body = M(col, { metalness: 0.3, roughness: 0.4 });
    const add = (geo, mat, px, py, pz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); g.add(m); return m; };
    add(new THREE.BoxGeometry(0.55, 0.55, 0.9), body, 0, 0.65, 0.35);
    add(new THREE.BoxGeometry(0.5, 0.9, 0.12), body, 0, 0.8, -0.5);
    add(new THREE.BoxGeometry(0.4, 0.12, 0.7), M(0x222222), 0, 1.0, 0.35);
    add(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), chrome, 0, 1.25, -0.55);
    add(new THREE.BoxGeometry(0.7, 0.05, 0.05), chrome, 0, 1.55, -0.55);
    add(new THREE.SphereGeometry(0.1, 10, 8), HDR(1.6, 1.5, 1.2), 0, 1.45, -0.65);
    add(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 12), tyre, 0, 0.22, -0.6).rotation.z = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 12), tyre, 0, 0.22, 0.55).rotation.z = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 12), tyre, 0, 0.75, 0.9).rotation.x = Math.PI / 2;
    scene.add(g);
    CIRCLES.push({ x, z, r: 0.6 });
  }
  // ================= PEEPAL KE PED =================
  const bark = M(0x5a3a22, { roughness: 1 });
  const leaves = [M(0x2f7a2f, { flatShading: true }), M(0x3d8f35, { flatShading: true }), M(0x266a2a, { flatShading: true })];
  function tree(x, z, s = 1) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.scale.setScalar(s);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 4, 8), bark);
    tr.position.y = 2;
    g.add(tr);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const l = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6 + (i % 3) * 0.3, 0), leaves[i % 3]);
      l.position.set(Math.cos(a) * 1.5, 4.8 + (i % 2) * 0.9, Math.sin(a) * 1.5);
      g.add(l);
    }
    const top = new THREE.Mesh(new THREE.IcosahedronGeometry(2, 0), leaves[1]);
    top.position.y = 6;
    g.add(top);
    // chabootra
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.5, 12), M(0xd8c8a8));
    base.position.y = 0.25;
    g.add(base);
    scene.add(g);
    CIRCLES.push({ x, z, r: 1.3 * s });
  }
  tree(-66, 15); tree(-66, -15); tree(66, 15, 0.9); tree(66, -15, 1.1); tree(-40, 433, 0.9); tree(40, 433);

  // khadi taxi/scooter ab asli gaadiyan hain (traffic.js → PARKED) — inme baith ke chala sakte ho
  void taxi; void scooter;

  return {
    update(t, dt, env) { for (const u of updaters) u(t, dt, env); },
    aarti(t) { aartiUntil = t + 10; ringBells(); },
    tree,
    ringBells() { ringBells(); },
  };
}
