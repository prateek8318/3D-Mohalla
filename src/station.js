import * as THREE from 'three';
import { signTexture } from './textures.js';
import { addBox, STATION } from './collide.js';

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, ...o });
const HDR = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });

/** Mohalla Junction — railway station + aati-jaati train 🚂 */
export function buildStation(scene) {
  const S = STATION;
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(S.x1 - S.x0, 34), M(0x9a8f86, { roughness: 0.95 }));
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, 0.02, (S.z0 + 466) / 2);
  plaza.receiveShadow = true;
  scene.add(plaza);
  // station building (laal int)
  const brick = M(0xa8432e), cream = M(0xf2e2c4);
  const b = new THREE.Mesh(new THREE.BoxGeometry(50, 10, 12), [brick, brick, M(0x3a2a20), M(0x3a2a20), brick, brick]);
  b.position.set(0, 5, 456);
  b.castShadow = b.receiveShadow = true;
  scene.add(b);
  addBox(0, 456, 50, 12);
  const band = new THREE.Mesh(new THREE.BoxGeometry(50.4, 1, 12.4), cream);
  band.position.set(0, 9.6, 456);
  scene.add(band);
  const tower = new THREE.Mesh(new THREE.BoxGeometry(6, 8, 6), brick);
  tower.position.set(0, 14, 455);
  scene.add(tower);
  const clock = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), HDR(1.6, 1.5, 1.2));
  clock.position.set(0, 15, 451.95);
  clock.rotation.y = Math.PI;
  scene.add(clock);
  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.05), M(0x111111));
  hand.position.set(0, 15, 451.9);
  scene.add(hand);
  for (let i = -3; i <= 3; i++) {
    const arch = new THREE.Mesh(new THREE.PlaneGeometry(3, 4.2), HDR(1.3, 1.0, 0.6));
    arch.position.set(i * 6.5, 2.1, 449.95);
    arch.rotation.y = Math.PI;
    scene.add(arch);
  }
  const sm = new THREE.MeshBasicMaterial({ map: signTexture('मोहल्ला जंक्शन', 'MOHALLA JN. • मो.ज.', '#ffd23f'), toneMapped: false });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(16, 4), sm);
  sign.position.set(0, 7.2, 449.9);
  sign.rotation.y = Math.PI;
  scene.add(sign);
  // platform + patri
  const plat = new THREE.Mesh(new THREE.BoxGeometry(120, 0.6, 6.5), M(0xc8b8a0));
  plat.position.set(0, 0.3 - 0.3, 465.2);
  scene.add(plat);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(120, 0.05, 0.4), M(0xffd23f));
  edge.position.set(0, 0.03, 468.3);
  scene.add(edge);
  const shed = new THREE.Mesh(new THREE.BoxGeometry(80, 0.3, 5), M(0x5a6a7a, { metalness: 0.5 }));
  shed.position.set(0, 4.6, 465);
  scene.add(shed);
  for (let x = -38; x <= 38; x += 8) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.6, 8), M(0x2a3a4a, { metalness: 0.6 }));
    p.position.set(x, 2.3, 465);
    scene.add(p);
  }
  const ballast = new THREE.Mesh(new THREE.PlaneGeometry(900, 7), M(0x5a5048, { roughness: 1 }));
  ballast.rotation.x = -Math.PI / 2;
  ballast.position.set(0, 0.01, 472);
  scene.add(ballast);
  const railM = M(0x9a9a9a, { metalness: 0.9, roughness: 0.3 });
  for (const z of [471.2, 472.8]) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(900, 0.15, 0.12), railM);
    r.position.set(0, 0.12, z);
    scene.add(r);
  }
  const sleepers = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.1, 2.6), M(0x4a3a2a), 600);
  const d = new THREE.Object3D();
  for (let i = 0; i < 600; i++) { d.position.set(-450 + i * 1.5, 0.05, 472); d.updateMatrix(); sleepers.setMatrixAt(i, d.matrix); }
  scene.add(sleepers);
  // patri ke paas boundary (koi patri pe na jaaye)
  addBox(0, 469.5, 300, 0.4);

  // ---- train ----
  const train = new THREE.Group();
  const coachM = [M(0x7a1a1a), M(0x1f3a8a)];
  const winM = HDR(1.4, 1.2, 0.8);
  const engine = new THREE.Group();
  const eb = new THREE.Mesh(new THREE.BoxGeometry(16, 3.6, 3), M(0xd94a1a, { metalness: 0.3 }));
  eb.position.y = 2.3;
  engine.add(eb);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(16.05, 0.5, 3.05), M(0xffd23f));
  stripe.position.y = 1.8;
  engine.add(stripe);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 2.2), HDR(0.5, 0.8, 1.2));
  cab.position.set(8.05, 3.2, 0);
  engine.add(cab);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), HDR(3, 2.8, 2));
  head.position.set(8.1, 3.9, 0);
  engine.add(head);
  train.add(engine);
  for (let i = 1; i <= 6; i++) {
    const c = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(17, 3.4, 3), coachM[i % 2]);
    body.position.y = 2.2;
    c.add(body);
    for (let w = -7; w <= 7; w += 2) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.8), winM);
      win.position.set(w, 2.6, 1.51);
      c.add(win);
      const win2 = win.clone();
      win2.position.z = -1.51;
      win2.rotation.y = Math.PI;
      c.add(win2);
    }
    c.position.x = -i * 17.6;
    train.add(c);
  }
  train.position.set(-600, 0, 472);
  scene.add(train);
  const T = { x: -600, v: 0, state: 'gap', timer: 25, dir: 1 };
  const LEN = 6 * 17.6 + 8;

  return {
    update(t, dt, playerPos) {
      hand.rotation.z = -t * 0.2;
      let ev = null;
      const stopX = LEN / 2 - 8;
      if (T.state === 'gap') {
        T.timer -= dt;
        if (T.timer <= 0) { T.state = 'arrive'; T.x = -500; T.v = 22; ev = 'horn'; }
      } else if (T.state === 'arrive') {
        const dist = stopX - T.x;
        T.v = Math.max(1.5, Math.min(22, Math.sqrt(Math.max(0, dist) * 2 * 1.6)));
        T.x += T.v * dt;
        if (dist < 0.3) { T.state = 'stop'; T.timer = 14; T.v = 0; }
      } else if (T.state === 'stop') {
        T.timer -= dt;
        if (T.timer <= 0) { T.state = 'leave'; ev = 'horn'; }
      } else if (T.state === 'leave') {
        T.v = Math.min(24, T.v + dt * 2.5);
        T.x += T.v * dt;
        if (T.x > 600) { T.state = 'gap'; T.timer = 70 + Math.random() * 40; T.x = -600; }
      }
      train.position.x = T.x;
      const near = Math.abs(playerPos.z - 472) < 160 && Math.abs(playerPos.x - T.x) < 220;
      return near ? ev : null;
    },
  };
}
