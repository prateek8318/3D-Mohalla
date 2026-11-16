import * as THREE from 'three';
import { glowTexture } from './textures.js';

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0.25, ...o });

/** Desi auto-rickshaw — front is -Z. */
export function makeRickshaw() {
  const g = new THREE.Group();
  const green = M(0x14843b), yellow = M(0xffc800), black = M(0x151515, { roughness: 0.8 });
  const add = (geo, mat, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };

  add(new THREE.BoxGeometry(2.2, 0.7, 3.0), green, 0, 0.85, 0.25);
  add(new THREE.BoxGeometry(2.2, 0.8, 1.3), yellow, 0, 1.6, 0.95);
  add(new THREE.BoxGeometry(1.1, 1.5, 0.5), green, 0, 1.2, -1.45);
  add(new THREE.BoxGeometry(2.0, 0.25, 0.4), yellow, 0, 2.1, 1.5);
  add(
    new THREE.BoxGeometry(1.9, 1.0, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.3, metalness: 0.9, roughness: 0.05 }),
    0, 2.15, -1.1,
  );
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.08, 1.4, 0.08), black, sx * 1.0, 2.0, -1.1);
    add(new THREE.BoxGeometry(0.08, 1.4, 0.08), black, sx * 1.05, 2.0, 1.55);
  }
  add(new THREE.BoxGeometry(2.4, 0.18, 3.0), black, 0, 2.72, 0.2);
  const roofTop = add(new THREE.BoxGeometry(2.3, 0.12, 2.9), yellow, 0, 2.85, 0.2);

  const wgeo = new THREE.CylinderGeometry(0.45, 0.45, 0.32, 18);
  wgeo.rotateZ(Math.PI / 2);
  const wheels = [[0, 0.45, -1.6], [-1.05, 0.45, 1.05], [1.05, 0.45, 1.05]].map((p) => add(wgeo, black, ...p));

  add(new THREE.SphereGeometry(0.17, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 2.4), toneMapped: false }), 0, 1.55, -1.72);
  for (const sx of [-1, 1])
    add(new THREE.BoxGeometry(0.25, 0.15, 0.05), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 0.2, 0.2), toneMapped: false }), sx * 0.85, 1.0, 1.76);

  // genda phool ki maala
  add(new THREE.TorusGeometry(0.35, 0.07, 8, 20), M(0xff8c00, { emissive: 0x662200, metalness: 0 }), 0, 1.95, -1.72);
  // lemon-mirchi 🍋🌶️
  const lm = new THREE.Group();
  const lemon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), M(0xd8ff3a, { metalness: 0 }));
  lm.add(lemon);
  for (let i = 0; i < 3; i++) {
    const ch = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.22, 6), M(0x1e8a1e, { metalness: 0 }));
    ch.position.y = -0.15 - i * 0.05;
    ch.rotation.x = Math.PI;
    lm.add(ch);
  }
  lm.position.set(0.7, 2.45, -1.15);
  g.add(lm);

  // driver: white kurta + head
  const skin = M(0xb9774a, { metalness: 0, roughness: 0.7 });
  const head = add(new THREE.SphereGeometry(0.3, 20, 16), skin, 0, 2.05, -0.55);
  const kurta = add(new THREE.CylinderGeometry(0.3, 0.38, 0.7, 12), M(0xffffff, { metalness: 0 }), 0, 1.55, -0.55);
  const stache = add(new THREE.BoxGeometry(0.28, 0.05, 0.05), M(0x111111), 0, 1.98, -0.84);
  const hair = new THREE.Group();
  hair.position.copy(head.position);
  const driver = new THREE.Group();
  [head, kurta, stache, hair].forEach((o) => driver.add(o));
  g.add(driver);
  g.traverse((o) => { if (o.isMesh && o.material.isMeshStandardMaterial) o.castShadow = true; });

  // neon underglow
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 4.6),
    new THREE.MeshBasicMaterial({ map: glowTexture(), color: 0x00ffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.set(0, 0.04, 0.1);
  g.add(glow);

  const lamp = new THREE.PointLight(0xfff0c0, 30, 20, 2);
  lamp.position.set(0, 1.6, -3.2);
  g.add(lamp);

  g.userData = { wheels, hair, glow, roofTop, lemon: lm, driver };
  setHair(g, 'normal', 0x111111);
  return g;
}

export function setHair(g, style, color = 0x111111) {
  const hair = g.userData.hair;
  hair.children.slice().forEach((c) => {
    c.geometry.dispose();
    hair.remove(c);
  });
  const mat = M(color, { roughness: 0.9, metalness: 0 });
  const up = new THREE.Vector3(0, 1, 0);
  if (style === 'normal') {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2.1), mat);
    m.position.y = 0.02;
    hair.add(m);
  } else if (style === 'salman') {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 12, 0, Math.PI * 2, 0, Math.PI / 1.7), mat);
    m.scale.set(1.05, 1.1, 1.12);
    m.position.set(0, 0.03, 0.03);
    hair.add(m);
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), mat);
    puff.position.set(0.05, 0.3, -0.18);
    hair.add(puff);
  } else if (style === 'spiky') {
    for (let i = 0; i < 16; i++) {
      const th = Math.random() * Math.PI * 2, ph = Math.random() * 1.0;
      const dir = new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th));
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.34, 6), mat);
      c.position.copy(dir).multiplyScalar(0.3);
      c.quaternion.setFromUnitVectors(up, dir);
      hair.add(c);
    }
  } else if (style === 'mohawk') {
    const em = M(color, { emissive: color, emissiveIntensity: 0.6, metalness: 0 });
    for (let i = 0; i < 7; i++) {
      const a = -1.1 + i * 0.37;
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.12), em);
      b.position.set(0, Math.cos(a) * 0.32, Math.sin(a) * 0.32);
      b.rotation.x = a;
      hair.add(b);
    }
  } else if (style === 'bald') {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.305, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2.4),
      M(0xc98a5c, { metalness: 0.6, roughness: 0.1 }),
    );
    hair.add(m);
  }
}
