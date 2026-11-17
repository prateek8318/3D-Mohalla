import * as THREE from 'three';
import { makeHuman, updateHuman, setAction } from './humans.js';
import { makeRickshaw } from './rickshaw.js';
import { BAZAAR_Z } from './collide.js';

const R = Math.random;
const pick = (a) => a[Math.floor(R() * a.length)];
const headingTo = (dx, dz) => Math.atan2(-dx, -dz);
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: 0.35, ...o });
const HDR = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });
const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.25, 14);
wheelGeo.rotateZ(Math.PI / 2);
const tyre = M(0x111111, { metalness: 0, roughness: 0.9 });
const chrome = M(0xdddddd, { metalness: 1, roughness: 0.2 });
const glass = M(0x1d2a38, { metalness: 0.9, roughness: 0.1 });

function makeCar(taxi) {
  const g = new THREE.Group();
  const body = taxi ? M(0x111111) : M(pick([0xf2efe6, 0xf2efe6, 0x1a1a1a, 0xc8b89a, 0x8a1a1a, 0x2a4a7a, 0x3a6a4a]));
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  add(new THREE.BoxGeometry(1.75, 0.65, 4.3), body, 0, 0.72, 0);
  add(new THREE.BoxGeometry(1.7, 0.15, 1.2), body, 0, 1.1, -1.4).rotation.x = 0.06;
  add(new THREE.BoxGeometry(1.62, 0.62, 2.1), glass, 0, 1.36, 0.25);
  add(new THREE.BoxGeometry(1.66, 0.1, 2.15), taxi ? M(0xffc800) : body, 0, 1.7, 0.25);
  if (taxi) add(new THREE.BoxGeometry(0.5, 0.18, 0.25), M(0xffc800), 0, 1.84, 0.1);
  add(new THREE.BoxGeometry(1.8, 0.16, 0.16), chrome, 0, 0.48, -2.18);
  add(new THREE.BoxGeometry(1.8, 0.16, 0.16), chrome, 0, 0.48, 2.18);
  for (const sx of [-0.6, 0.6]) {
    add(new THREE.CircleGeometry(0.15, 12), HDR(1.8, 1.7, 1.3), sx, 0.82, -2.16).rotation.y = Math.PI;
    add(new THREE.BoxGeometry(0.3, 0.14, 0.04), HDR(2.5, 0.15, 0.1), sx, 0.82, 2.17);
  }
  const wheels = [[-0.86, -1.35], [0.86, -1.35], [-0.86, 1.35], [0.86, 1.35]].map(([x, z]) => add(wheelGeo, tyre, x, 0.38, z));
  return { g, wheels, seat: new THREE.Vector3(0.38, 0.32, 0.1), passenger: new THREE.Vector3(-0.38, 0.32, 0.1), len: 4.4, radius: 1.25, max: 17, kind: taxi ? 'taxi' : 'car' };
}

function makeScooter() {
  const g = new THREE.Group();
  const body = M(pick([0x7fc8d8, 0xe86a5a, 0x9fd88a, 0xf2e6c8, 0x4a6ab0]));
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  add(new THREE.BoxGeometry(0.55, 0.5, 0.9), body, 0, 0.62, 0.35);
  add(new THREE.BoxGeometry(0.5, 0.85, 0.12), body, 0, 0.78, -0.5);
  add(new THREE.BoxGeometry(0.4, 0.12, 0.75), M(0x222222), 0, 0.95, 0.35);
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), chrome, 0, 1.2, -0.55);
  add(new THREE.BoxGeometry(0.7, 0.05, 0.05), chrome, 0, 1.5, -0.55);
  add(new THREE.SphereGeometry(0.1, 10, 8), HDR(1.8, 1.7, 1.3), 0, 1.4, -0.66);
  const w1 = add(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 12), tyre, 0, 0.24, -0.62); w1.rotation.z = Math.PI / 2;
  const w2 = add(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 12), tyre, 0, 0.24, 0.6); w2.rotation.z = Math.PI / 2;
  return { g, wheels: [], seat: new THREE.Vector3(0, 0.5, 0.25), passenger: new THREE.Vector3(0, 0.55, 0.75), len: 1.8, radius: 0.6, max: 13, kind: 'scooter' };
}

function makeAuto() {
  const g = makeRickshaw();
  g.userData.driver.visible = false;
  g.remove(g.userData.glow);
  g.children.filter((c) => c.isPointLight).forEach((l) => g.remove(l));
  return { g, wheels: g.userData.wheels, seat: new THREE.Vector3(0, 0.72, -0.5), passenger: new THREE.Vector3(0.45, 0.42, 0.95), len: 3.4, radius: 1.0, max: 14, kind: 'auto' };
}

// Raaste: kis axis pe, kahan se kahan (India — baayein chalo)
const ROUTES = [
  { axis: 'z', at: 0, from: -95, to: 420, w: 8 },
  { axis: 'x', at: 330, from: -290, to: 290, w: 5 },
  { axis: 'x', at: 0, from: -145, to: 145, w: 4 },
  { axis: 'x', at: BAZAAR_Z, from: -110, to: 112, w: 4 },
];
const LANE = 4.4;
const laneOff = (r, s) => (r.at === 0 ? LANE + 2.9 * Math.max(0, 1 - Math.abs(s) / 13) : LANE);

export function buildTraffic(scene, { isTouch }) {
  const vehicles = [];
  const count = isTouch ? 8 : 15;
  const totW = ROUTES.reduce((a, r) => a + r.w, 0);
  for (let i = 0; i < count; i++) {
    let k = R() * totW, route = ROUTES[0];
    for (const r of ROUTES) { if ((k -= r.w) <= 0) { route = r; break; } }
    const roll = R();
    const v = roll < 0.38 ? makeCar(false) : roll < 0.55 ? makeCar(true) : roll < 0.85 ? makeAuto() : makeScooter();
    const driver = makeHuman({ outfit: v.kind === 'taxi' || v.kind === 'auto' ? pick(['shirt', 'kurta']) : undefined, female: v.kind === 'scooter' && R() < 0.3 });
    driver.root.position.copy(v.seat);
    setAction(driver, v.kind === 'scooter' ? 'drive' : 'drive');
    v.g.add(driver.root);
    Object.assign(v, {
      driver, ai: true, route, dir: R() < 0.5 ? 1 : -1, s: route.from + R() * (route.to - route.from), speed: 0, cruise: v.max * (0.4 + R() * 0.2),
      pos: new THREE.Vector3(), heading: 0, uturn: null, stuck: 0, honkCd: 0,
    });
    placeOnRoute(v);
    scene.add(v.g);
    vehicles.push(v);
  }

  // sadak kinare khadi gaadiyan — khaali, koi bhi utha le 😈
  const PARKED = [
    ['taxi', -7.3, 62, 0], ['taxi', 7.3, -40, Math.PI], ['taxi', -7.3, -86, 0],
    ['scooter', 7.7, 31, 0.3], ['scooter', -7.7, 90, -0.2], ['scooter', 7.7, -70, 0.1],
    ['car', -7.3, 270, 0], ['auto', 7.3, 300, Math.PI], ['car', 100, -7.3, Math.PI / 2], ['scooter', -95, 7.7, -Math.PI / 2],
  ];
  for (const [kind, x, z, h] of PARKED) {
    const v = kind === 'taxi' ? makeCar(true) : kind === 'car' ? makeCar(false) : kind === 'auto' ? makeAuto() : makeScooter();
    Object.assign(v, { driver: null, ai: false, parked: true, route: ROUTES[0], dir: 1, s: 0, speed: 0, cruise: 0, pos: new THREE.Vector3(x, 0, z), heading: h, uturn: null, stuck: 0, honkCd: 0 });
    v.g.position.copy(v.pos);
    v.g.rotation.y = h;
    scene.add(v.g);
    vehicles.push(v);
  }

  function frame(v) {
    const r = v.route;
    const f = r.axis === 'z' ? new THREE.Vector3(0, 0, v.dir) : new THREE.Vector3(v.dir, 0, 0);
    const l = new THREE.Vector3(f.z, 0, -f.x);
    const c = r.axis === 'z' ? new THREE.Vector3(r.at, 0, v.s) : new THREE.Vector3(v.s, 0, r.at);
    return { f, l, c };
  }
  function placeOnRoute(v) {
    const { f, l, c } = frame(v);
    v.pos.copy(c).addScaledVector(l, laneOff(v.route, v.s));
    v.heading = headingTo(f.x, f.z);
  }

  const tmp = new THREE.Vector3();
  function update(dt, t, ctx) {
    const ev = [];
    for (const v of vehicles) {
      if (v === ctx.playerVeh) continue;
      if (!v.ai) {
        v.speed *= 0.9;
        v.g.position.copy(v.pos);
        v.g.rotation.y = v.heading;
        continue;
      }
      const { f, l, c } = frame(v);
      // aage koi hai?
      let block = Infinity;
      const look = v.len / 2 + 7;
      const check = (x, z, w = 1.7) => {
        tmp.set(x - v.pos.x, 0, z - v.pos.z);
        const along = tmp.x * -Math.sin(v.heading) + tmp.z * -Math.cos(v.heading);
        const lat = tmp.x * Math.cos(v.heading) - tmp.z * Math.sin(v.heading);
        if (along > 0 && along < look && Math.abs(lat) < w) block = Math.min(block, along);
      };
      if (v.ignoreT > 0) v.ignoreT -= dt;
      else {
        check(ctx.player.pos.x, ctx.player.pos.z, ctx.player.mode === 'drive' ? 2.2 : 1.5);
        for (const o of vehicles) if (o !== v) check(o.pos.x, o.pos.z, 1.9);
        for (const cow of ctx.cows) check(cow.x, cow.z, 1.6);
        for (const n of ctx.peds) check(n.x, n.z, 1.2);
      }
      const gap = block - v.len / 2;
      const target = gap < 2.2 ? 0 : gap < 7 ? v.cruise * (gap - 2.2) / 5 : v.cruise;
      v.speed += (target - v.speed) * Math.min(1, dt * (target < v.speed ? 5 : 1.5));
      if (v.speed < 0.3 && block < Infinity) {
        v.stuck += dt;
        v.honkCd -= dt;
        if (v.honkCd <= 0 && Math.hypot(v.pos.x - ctx.player.pos.x, v.pos.z - ctx.player.pos.z) < v.len / 2 + 8) { ev.push({ type: 'honk', v }); v.honkCd = 3; }
        if (v.stuck > 5) { v.ignoreT = 2.5; v.stuck = 0; }
      } else v.stuck = 0;

      if (v.uturn) {
        const u = v.uturn;
        u.p += (Math.max(v.speed, 3) * dt) / (Math.PI * u.r);
        const ph = Math.min(1, u.p) * Math.PI;
        v.pos.copy(u.c).addScaledVector(u.l, u.r * Math.cos(ph)).addScaledVector(u.f, u.r * Math.sin(ph));
        const dx = -u.l.x * Math.sin(ph) + u.f.x * Math.cos(ph), dz = -u.l.z * Math.sin(ph) + u.f.z * Math.cos(ph);
        v.heading = headingTo(dx, dz);
        if (u.p >= 1) { v.uturn = null; v.dir *= -1; placeOnRoute(v); }
      } else {
        v.s += v.dir * v.speed * dt;
        const end = v.dir > 0 ? v.route.to : v.route.from;
        if ((v.dir > 0 && v.s >= end) || (v.dir < 0 && v.s <= end)) {
          v.s = end;
          v.uturn = { c: c.clone(), l: l.clone(), f: f.clone(), r: laneOff(v.route, v.s), p: 0 };
        }
        if (!v.uturn) placeOnRoute(v);
      }
      v.g.position.copy(v.pos);
      v.g.rotation.y = v.heading;
      for (const w of v.wheels) w.rotation.x -= v.speed * dt * 2.4;
      if (v.driver && Math.hypot(v.pos.x - ctx.camera.position.x, v.pos.z - ctx.camera.position.z) < 80) updateHuman(v.driver, dt, t);
    }
    return ev;
  }

  function nearest(pos, r = 3.4) {
    let best = null, bd = r;
    for (const v of vehicles) {
      const d = Math.hypot(v.pos.x - pos.x, v.pos.z - pos.z);
      if (d < bd) { bd = d; best = v; }
    }
    return best;
  }
  return { vehicles, update, nearest };
}
