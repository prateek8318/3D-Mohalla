import * as THREE from 'three';
import { itemMesh, hold, setOverlay } from './humans.js';
import { solidAt } from './collide.js';

export const GUNS = {
  katta: { id: 'katta', n: '🔫 Desi Katta', price: 300, rate: 0.38, range: 70, pellets: 1, spread: 0.01, ammo: 12, ammoPrice: 40, two: false },
  dunali: { id: 'dunali', n: '💥 Dunali (Shotgun)', price: 700, rate: 0.95, range: 26, pellets: 7, spread: 0.065, ammo: 8, ammoPrice: 60, two: true },
  sniper: { id: 'sniper', n: '🎯 Sniper Rifle', price: 1500, rate: 1.25, range: 450, pellets: 1, spread: 0, ammo: 6, ammoPrice: 120, two: true, zoom: true, lv: 3 },
};

/** Bandook: nishana, goli, tracer, hit */
export function createWeapons(ctx) {
  const { scene, camera, me } = ctx;
  const owned = {};
  let cur = null, aiming = false, cd = 0;
  const tracers = [];
  const tracerMat = new THREE.LineBasicMaterial({ color: new THREE.Color(3, 2.6, 1.4), transparent: true, toneMapped: false });
  const flash = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 3, 1), toneMapped: false }));
  flash.visible = false;
  scene.add(flash);
  const puffMat = new THREE.MeshBasicMaterial({ color: 0xcfc6b8, transparent: true, opacity: 0.7 });
  const puffs = [];
  const o = new THREE.Vector3(), d = new THREE.Vector3(), pt = new THREE.Vector3(), mz = new THREE.Vector3(), tmp = new THREE.Vector3();

  function give(id, n) { owned[id] = (owned[id] || 0) + n; }
  function equip(id) {
    cur = id && owned[id] !== undefined ? id : null;
    hold(me, cur ? itemMesh(cur) : null);
    aiming = false;
    setOverlay(me, cur ? 'hold' : null);
  }
  function setAim(on) {
    aiming = !!(on && cur);
    setOverlay(me, aiming ? (GUNS[cur].two ? 'aim2' : 'aim') : cur ? 'hold' : null);
  }
  function muzzle(out) {
    const g = me.held;
    if (g && g.userData.muzzle) return g.localToWorld(out.copy(g.userData.muzzle));
    return me.hand.getWorldPosition(out);
  }
  function blocked(ox, oy, oz, dx, dy, dz, dist) {
    for (let t = 1.2; t < dist; t += 1.2) {
      const x = ox + dx * t, y = oy + dy * t, z = oz + dz * t;
      if (y < 0.05) return t;
      if (y < 9 && solidAt(x, z, 0)) return t;
    }
    return Infinity;
  }
  function castOne(dir, range) {
    let best = null, bt = range;
    // log
    for (const n of ctx.npcs.npcs) {
      if (n.hidden > 0 || n.riding || n.scene || n.fall > 0 || !n.h.root.visible) continue;
      const hgt = 1.85 * n.h.root.scale.y;
      const by = n.y || 0;
      tmp.set(n.x - o.x, by + hgt * 0.55 - o.y, n.z - o.z);
      const t = tmp.dot(dir);
      if (t < 0.3 || t > bt) continue;
      pt.copy(o).addScaledVector(dir, t);
      if (pt.y < by || pt.y > by + hgt) continue;
      if (Math.hypot(pt.x - n.x, pt.z - n.z) < 0.36) { bt = t; best = { n }; }
    }
    // nishane (botal waghera)
    for (const tg of ctx.targets) {
      if (tg.dead) continue;
      tmp.copy(tg.pos).sub(o);
      const t = tmp.dot(dir);
      if (t < 0.3 || t > bt) continue;
      pt.copy(o).addScaledVector(dir, t);
      if (pt.distanceTo(tg.pos) < tg.r) { bt = t; best = { tg }; }
    }
    const wall = blocked(o.x, o.y, o.z, dir.x, dir.y, dir.z, bt);
    if (wall < bt) return { t: wall };
    return { t: bt, ...best };
  }
  function fire(aimDir) {
    if (!cur || cd > 0) return false;
    const g = GUNS[cur];
    if (!owned[cur]) { ctx.sfx('empty'); ctx.toast('Goli khatam! 🔫 Kallu Kattewala se aur lo', 1800); cd = 0.4; return false; }
    owned[cur]--;
    cd = g.rate;
    if (aiming) o.copy(camera.position); else { me.hand.getWorldPosition(o); }
    const base = aimDir.clone().normalize();
    muzzle(mz);
    let hitAny = false;
    for (let i = 0; i < g.pellets; i++) {
      d.copy(base);
      if (g.spread) { d.x += (Math.random() - 0.5) * g.spread * 2; d.y += (Math.random() - 0.5) * g.spread * 2; d.z += (Math.random() - 0.5) * g.spread * 2; d.normalize(); }
      const r = castOne(d, g.range);
      const end = o.clone().addScaledVector(d, Math.min(r.t, g.range));
      addTracer(mz, end);
      if (r.n) { hitAny = true; ctx.onHitNpc(r.n, end); }
      else if (r.tg) { r.tg.dead = true; r.tg.onHit?.(); hitAny = true; }
      else if (r.t < g.range) addPuff(end);
    }
    flash.position.copy(mz);
    flash.visible = true;
    flash.userData.t = 0.05;
    ctx.sfx(cur);
    ctx.onShot(o, g);
    return hitAny;
  }
  function addTracer(a, b) {
    const geo = new THREE.BufferGeometry().setFromPoints([a.clone(), b]);
    const line = new THREE.Line(geo, tracerMat.clone());
    scene.add(line);
    tracers.push({ line, t: 0.09 });
  }
  function addPuff(p) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 4), puffMat.clone());
    m.position.copy(p);
    scene.add(m);
    puffs.push({ m, t: 0.5 });
  }
  function update(dt) {
    cd -= dt;
    if (flash.visible && (flash.userData.t -= dt) <= 0) flash.visible = false;
    for (let i = tracers.length - 1; i >= 0; i--) {
      const tr = tracers[i];
      tr.t -= dt;
      tr.line.material.opacity = Math.max(0, tr.t / 0.09);
      if (tr.t <= 0) { scene.remove(tr.line); tr.line.geometry.dispose(); tracers.splice(i, 1); }
    }
    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i];
      p.t -= dt;
      p.m.scale.setScalar(1 + (0.5 - p.t) * 4);
      p.m.material.opacity = Math.max(0, p.t);
      if (p.t <= 0) { scene.remove(p.m); puffs.splice(i, 1); }
    }
  }
  return {
    GUNS, owned, give, equip, setAim, fire, update,
    get cur() { return cur; }, get aiming() { return aiming; },
    ammo: () => (cur ? owned[cur] : 0),
    load(data) { Object.assign(owned, data || {}); },
  };
}
