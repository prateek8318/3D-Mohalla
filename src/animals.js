import * as THREE from 'three';

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, ...o });
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

function part(parent, geo, mat, x, y, z) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

function makeDog(col) {
  const g = new THREE.Group();
  const m = M(col), dark = M(0x1a1008);
  part(g, new THREE.BoxGeometry(0.42, 0.4, 0.95), m, 0, 0.62, 0);
  const head = new THREE.Group();
  head.position.set(0, 0.88, -0.55);
  g.add(head);
  part(head, new THREE.BoxGeometry(0.32, 0.3, 0.34), m, 0, 0, 0);
  part(head, new THREE.BoxGeometry(0.18, 0.14, 0.22), m, 0, -0.05, -0.24);
  part(head, new THREE.BoxGeometry(0.08, 0.06, 0.04), dark, 0, -0.01, -0.36);
  for (const s of [-1, 1]) {
    const ear = part(head, new THREE.ConeGeometry(0.07, 0.18, 4), m, s * 0.11, 0.2, 0.04);
    ear.rotation.z = -s * 0.2;
    part(head, new THREE.SphereGeometry(0.03, 6, 4), dark, s * 0.08, 0.05, -0.17);
  }
  const legs = [];
  for (const [x, z] of [[-0.14, -0.33], [0.14, -0.33], [-0.14, 0.33], [0.14, 0.33]]) {
    const p = new THREE.Group();
    p.position.set(x, 0.45, z);
    part(p, new THREE.BoxGeometry(0.1, 0.45, 0.1), m, 0, -0.22, 0);
    g.add(p);
    legs.push(p);
  }
  const tail = new THREE.Group();
  tail.position.set(0, 0.75, 0.47);
  tail.rotation.x = 0.8;
  part(tail, new THREE.BoxGeometry(0.06, 0.06, 0.38), m, 0, 0, 0.17);
  g.add(tail);
  return { g, legs, tail, head };
}

export function makeCat(col) {
  const g = new THREE.Group();
  const m = M(col);
  part(g, new THREE.BoxGeometry(0.22, 0.2, 0.46), m, 0, 0.12, 0);
  const head = new THREE.Group();
  head.position.set(0, 0.28, -0.22);
  g.add(head);
  part(head, new THREE.SphereGeometry(0.12, 12, 10), m, 0, 0, 0);
  const eye = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.8, 2.2, 0.5), toneMapped: false });
  for (const s of [-1, 1]) {
    part(head, new THREE.ConeGeometry(0.045, 0.1, 4), m, s * 0.06, 0.11, 0);
    part(head, new THREE.SphereGeometry(0.022, 6, 4), eye, s * 0.045, 0.02, -0.105);
  }
  const tail = new THREE.Group();
  tail.position.set(0, 0.12, 0.23);
  const tm = part(tail, new THREE.CylinderGeometry(0.025, 0.02, 0.42, 6), m, 0, 0.18, 0.06);
  tm.rotation.x = 0.35;
  g.add(tail);
  return { g, head, tail, eye };
}

export function buildAnimals(scene, walkable) {
  const dogs = [
    [0x9a6a3a, -4, 70], [0xd8c8a8, 5, 30], [0x3a2a20, -30, -3], [0xb07840, 3, -70], [0x8a5a30, 40, 4], [0xc8a070, 0, -108],
  ].map(([c, x, z]) => {
    const d = makeDog(c);
    d.g.position.set(x, 0, z);
    scene.add(d.g);
    return { ...d, home: { x, z }, x, z, h: Math.random() * 6, tx: x, tz: z, mode: 'wander', timer: 0, cool: 0, spd: 0 };
  });

  const catSpots = [
    [0xff9a3d, -9.9, 0.25, 58, Math.PI / 2], [0x222222, 9.9, 0.25, 33, -Math.PI / 2], [0xdddddd, -9.9, 0.25, -40, Math.PI / 2],
    [0x8a8a8a, 6, 0.03, -116, 0], [0xff9a3d, -40, 0.25, 9.9, Math.PI], [0x222222, 9.9, 0.25, 88, -Math.PI / 2],
  ];
  const cats = catSpots.map(([c, x, y, z, rot]) => {
    const cat = makeCat(c);
    cat.g.position.set(x, y, z);
    cat.g.rotation.y = rot;
    scene.add(cat.g);
    return { ...cat, x, z, rot, cool: 0 };
  });

  const rickCat = makeCat(0xff9a3d);
  rickCat.g.visible = false;

  function update(t, dt, player, st, night) {
    let ev = null;
    for (const d of dogs) {
      const dist = Math.hypot(player.pos.x - d.x, player.pos.z - d.z);
      d.cool -= dt;
      const friend = st.dogFriend === d && t < st.dogFriendUntil;
      if (friend) d.mode = 'friend';
      else if (d.mode === 'friend') { d.mode = 'wander'; d.timer = 0; }
      if (d.mode === 'wander' && dist < 14 && Math.abs(player.speed) > 7 && d.cool <= 0 && !st.cine) {
        d.mode = 'chase';
        d.timer = 4 + Math.random() * 2;
      }
      let speed = 0;
      if (d.mode === 'chase') {
        d.timer -= dt;
        d.tx = player.pos.x;
        d.tz = player.pos.z;
        speed = dist > 3.2 ? 11.5 : 4;
        if (Math.random() < dt * 1.6) ev = ev || 'bark';
        if (d.timer <= 0) { d.mode = 'wander'; d.cool = 12; d.tx = d.home.x; d.tz = d.home.z; d.timer = 6; }
      } else if (d.mode === 'friend') {
        d.tx = player.pos.x + Math.sin(player.heading) * 3.5 + 1.2;
        d.tz = player.pos.z + Math.cos(player.heading) * 3.5;
        const dd = Math.hypot(d.tx - d.x, d.tz - d.z);
        speed = dd > 1 ? Math.min(17, dd * 3) : 0;
      } else {
        d.timer -= dt;
        if (d.timer <= 0) {
          for (let k = 0; k < 8; k++) {
            const tx = d.home.x + (Math.random() - 0.5) * 16, tz = d.home.z + (Math.random() - 0.5) * 16;
            if (walkable(tx, tz)) { d.tx = tx; d.tz = tz; break; }
          }
          d.timer = 3 + Math.random() * 6;
        }
        speed = Math.hypot(d.tx - d.x, d.tz - d.z) > 0.6 ? 1.8 : 0;
      }
      if (speed > 0) {
        const want = Math.atan2(-(d.tx - d.x), -(d.tz - d.z));
        d.h += wrap(want - d.h) * Math.min(1, dt * 6);
        const nx = d.x - Math.sin(d.h) * speed * dt, nz = d.z - Math.cos(d.h) * speed * dt;
        if (d.mode === 'friend' || walkable(nx, nz)) { d.x = nx; d.z = nz; } else if (d.mode === 'wander') d.timer = 0;
      }
      d.spd += (speed - d.spd) * Math.min(1, dt * 8);
      const run = d.spd > 5;
      d.g.position.set(d.x, run ? Math.abs(Math.sin(t * 16)) * 0.12 : 0, d.z);
      d.g.rotation.y = d.h;
      const sw = Math.sin(t * (run ? 16 : 7)) * Math.min(1, d.spd / 2) * 0.6;
      d.legs.forEach((l, i) => { l.rotation.x = sw * (i === 0 || i === 3 ? 1 : -1); });
      d.tail.rotation.y = Math.sin(t * (d.mode === 'wander' ? 4 : 20)) * 0.6;
      d.head.rotation.x = d.mode === 'chase' ? Math.sin(t * 22) * 0.1 - 0.1 : Math.sin(t * 0.7 + d.home.x) * 0.1;
    }

    for (let i = 0; i < cats.length; i++) {
      const c = cats[i];
      const dx = player.pos.x - c.x, dz = player.pos.z - c.z, dist = Math.hypot(dx, dz);
      const rel = dist < 14 ? Math.max(-1.3, Math.min(1.3, wrap(Math.atan2(-dx, -dz) - c.rot))) : Math.sin(t * 0.4 + i) * 0.5;
      c.head.rotation.y += (rel - c.head.rotation.y) * Math.min(1, dt * 4);
      c.tail.rotation.z = Math.sin(t * 2 + i) * 0.45;
      c.eye.color.setRGB(0.8, 2.2, 0.5).multiplyScalar(0.25 + night * 0.9);
      c.cool -= dt;
      if (dist < 4 && c.cool <= 0) { ev = ev || 'meow'; c.cool = 20; }
    }
    rickCat.tail.rotation.z = Math.sin(t * 3) * 0.5;
    rickCat.head.rotation.y = Math.sin(t * 0.8) * 0.8;
    return ev;
  }

  function nearestDog(pos) {
    let best = dogs[0], bd = Infinity;
    for (const d of dogs) {
      const dd = Math.hypot(d.x - pos.x, d.z - pos.z);
      if (dd < bd) { bd = dd; best = d; }
    }
    return best;
  }

  return { update, dogs, cats, rickCat, nearestDog };
}
