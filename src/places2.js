import * as THREE from 'three';
import { signTexture, stripeTexture } from './textures.js';
import { addBox, addCircle, PARK, THANA, BAZAAR_Z } from './collide.js';

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, ...o });

/** Park (cricket, patang) + Police Thana */
export function buildPlaces2(scene, { tree }) {
  const out = {};
  // ===== PARK =====
  const wallMat = M(0xd8cbb0);
  const wall = (x0, z0, x1, z1) => {
    const w = Math.abs(x1 - x0) || 0.4, d = Math.abs(z1 - z0) || 0.4;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, d), wallMat);
    m.position.set((x0 + x1) / 2, 0.55, (z0 + z1) / 2);
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
    addBox(m.position.x, m.position.z, w, d);
  };
  wall(PARK.x0, PARK.z0, PARK.x1, PARK.z0);
  wall(PARK.x0, PARK.z1, PARK.x1, PARK.z1);
  wall(PARK.x0, PARK.z0, PARK.x0, PARK.z1);
  wall(PARK.x1, PARK.z0, PARK.x1, BAZAAR_Z - 7);
  wall(PARK.x1, BAZAAR_Z + 7, PARK.x1, PARK.z1);
  const ps = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), new THREE.MeshBasicMaterial({ map: signTexture('गांधी पार्क', 'क्रिकेट • पतंग • सुबह की सैर', '#3dff7a'), toneMapped: false }));
  ps.position.set(PARK.x1 + 0.3, 3.2, BAZAAR_Z);
  ps.rotation.y = Math.PI / 2;
  scene.add(ps);
  for (const z of [BAZAAR_Z - 7, BAZAAR_Z + 7]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.6, 0.6), wallMat);
    p.position.set(PARK.x1, 1.8, z);
    scene.add(p);
  }
  // pitch
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(3, 20), M(0xc8b080, { roughness: 1 }));
  pitch.rotation.x = -Math.PI / 2;
  pitch.position.set(-135, 0.03, 141);
  pitch.receiveShadow = true;
  scene.add(pitch);
  const stumpMat = M(0xf2e6c8);
  for (const z of [131.5, 150.5]) for (let i = -1; i <= 1; i++) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 5), stumpMat);
    s.position.set(-135 + i * 0.1, 0.35, z);
    scene.add(s);
  }
  out.pitch = { x: -135, bat: 132.4, bowl: 150 };
  for (const [x, z, s] of [[-148, 120, 1.1], [-148, 160, 1], [-122, 120, 0.9], [-122, 161, 1.05], [-149, 140, 0.95]]) tree(x, z, s);
  // charpai + taash
  const cp = new THREE.Group();
  cp.position.set(-126, 0, 128);
  const rope = M(0xc2a36b);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 1.1), rope);
  top.position.y = 0.48;
  cp.add(top);
  for (const [x, z] of [[-0.85, -0.5], [0.85, -0.5], [-0.85, 0.5], [0.85, 0.5]]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 0.08), M(0x6b4423));
    l.position.set(x, 0.24, z);
    cp.add(l);
  }
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.13), M(0xffffff, { side: THREE.DoubleSide }));
    c.rotation.x = -Math.PI / 2;
    c.rotation.z = i;
    c.position.set((Math.random() - 0.5) * 0.6, 0.54, (Math.random() - 0.5) * 0.4);
    cp.add(c);
  }
  scene.add(cp);
  addBox(-126, 128, 1.8, 1.1);
  out.cards = { x: -126, z: 128 };
  // jhoola
  const sw = new THREE.Group();
  sw.position.set(-140, 0, 158);
  for (const x of [-1.2, 1.2]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3, 6), M(0x3a5a8a, { metalness: 0.6 }));
    p.position.set(x, 1.5, 0);
    sw.add(p);
  }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), M(0x3a5a8a, { metalness: 0.6 }));
  bar.rotation.z = Math.PI / 2;
  bar.position.y = 3;
  sw.add(bar);
  const seat = new THREE.Group();
  seat.position.y = 3;
  const sb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.35), M(0xd94848));
  sb.position.y = -2.2;
  seat.add(sb);
  for (const x of [-0.33, 0.33]) {
    const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 2.2, 3), M(0x888888));
    ch.position.set(x, -1.1, 0);
    seat.add(ch);
  }
  sw.add(seat);
  scene.add(sw);
  addCircle(-140, 158, 1.4);
  out.swing = { seat, x: -140, z: 158 };

  // ===== POLICE THANA =====
  const tb = new THREE.Group();
  tb.position.set(THANA.x1 + 7, 0, (THANA.z0 + THANA.z1) / 2);
  const wh = M(0xe8dcc0), red = M(0x9a2a1a);
  const body = new THREE.Mesh(new THREE.BoxGeometry(14, 7, 30), wh);
  body.position.y = 3.5;
  body.castShadow = body.receiveShadow = true;
  tb.add(body);
  const band = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.8, 30.2), red);
  band.position.y = 6.6;
  tb.add(band);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(3, 3.4), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.4, 1.0), toneMapped: false }));
  door.position.set(-7.01, 1.7, 0);
  door.rotation.y = -Math.PI / 2;
  tb.add(door);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.2), new THREE.MeshBasicMaterial({ map: signTexture('पुलिस थाना', 'मोहल्ला कोतवाली • 100 डायल करें', '#2ef2ff'), toneMapped: false }));
  sg.position.set(-7.05, 5, 0);
  sg.rotation.y = -Math.PI / 2;
  tb.add(sg);
  scene.add(tb);
  addBox(tb.position.x, tb.position.z, 14, 30);
  // jhanda
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 9, 8), M(0xdddddd, { metalness: 0.6 }));
  pole.position.set(THANA.x0 + 4, 4.5, THANA.z0 + 3);
  scene.add(pole);
  addCircle(pole.position.x, pole.position.z, 0.3);
  const flagGeo = new THREE.PlaneGeometry(2.4, 1.6, 8, 3);
  flagGeo.translate(1.2, 0, 0);
  const fc = document.createElement('canvas');
  fc.width = 96; fc.height = 64;
  const fg = fc.getContext('2d');
  fg.fillStyle = '#ff9933'; fg.fillRect(0, 0, 96, 22);
  fg.fillStyle = '#ffffff'; fg.fillRect(0, 21, 96, 22);
  fg.fillStyle = '#138808'; fg.fillRect(0, 42, 96, 22);
  fg.strokeStyle = '#000080'; fg.lineWidth = 2; fg.beginPath(); fg.arc(48, 32, 8, 0, Math.PI * 2); fg.stroke();
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; fg.beginPath(); fg.moveTo(48, 32); fg.lineTo(48 + Math.cos(a) * 8, 32 + Math.sin(a) * 8); fg.lineWidth = 0.6; fg.stroke(); }
  const ft = new THREE.CanvasTexture(fc);
  ft.colorSpace = THREE.SRGBColorSpace;
  const flag = new THREE.Mesh(flagGeo, new THREE.MeshStandardMaterial({ map: ft, side: THREE.DoubleSide, roughness: 0.9 }));
  flag.position.set(pole.position.x, 8.2, pole.position.z);
  scene.add(flag);
  const fpos = flagGeo.attributes.position, fbase = fpos.array.slice();
  // barricade
  const stripe = new THREE.MeshStandardMaterial({ map: stripeTexture('#ffd23f', '#111111', 8, true), roughness: 0.7 });
  for (const z of [THANA.z0 + 1, THANA.z1 - 1]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(4, 0.9, 0.4), stripe);
    b.position.set(THANA.x0 + 10, 0.45, z);
    scene.add(b);
    addBox(b.position.x, z, 4, 0.4);
  }
  out.thana = { x: THANA.x0 + 12, z: BAZAAR_Z, door: { x: tb.position.x - 8, z: tb.position.z } };
  out.update = (t) => {
    for (let i = 0; i < fpos.count; i++) {
      const x = fbase[i * 3];
      fpos.array[i * 3 + 2] = Math.sin(x * 2.5 - t * 5) * 0.15 * (x / 2.4);
    }
    fpos.needsUpdate = true;
    seat.rotation.x = Math.sin(t * 1.6) * 0.5;
  };
  return out;
}
