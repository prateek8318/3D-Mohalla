import * as THREE from 'three';
import { makeHuman, updateHuman, setAction, setOverlay, hold, itemMesh } from './humans.js';
import { footable, driveable, BAZAAR_Z, THANA, RING, LINK_X } from './collide.js';
import { GIRL_NAMES } from './data2.js';

const R = Math.random;
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const rnd = (a, b) => a + R() * (b - a);
const pick = (a) => a[Math.floor(R() * a.length)];
const headingTo = (dx, dz) => Math.atan2(-dx, -dz);
const passable = (x, z) => footable(x, z) || driveable(x, z);

const LANES = [
  { a: [-10.1, -95], b: [-10.1, 420], w: 7, road: 'x0' }, { a: [10.1, -95], b: [10.1, 420], w: 7, road: 'x0' },
  { a: [-66, 319.9], b: [-12, 319.9], w: 1, road: 'z330' }, { a: [12, 340.1], b: [66, 340.1], w: 1, road: 'z330' },
  { a: [-40, 438], b: [40, 438], w: 2 }, { a: [-55, 465], b: [55, 465], w: 2 },
  { a: [-56, 10], b: [-12, 10], w: 1, road: 'z0' }, { a: [12, 10], b: [56, 10], w: 1, road: 'z0' }, { a: [-56, -10], b: [-12, -10], w: 1, road: 'z0' }, { a: [12, -10], b: [56, -10], w: 1, road: 'z0' },
  { a: [-112, BAZAAR_Z - 10.1], b: [112, BAZAAR_Z - 10.1], w: 3, road: 'zb' }, { a: [-112, BAZAAR_Z + 10.1], b: [112, BAZAAR_Z + 10.1], w: 3, road: 'zb' },
  { a: [-86, 198.8], b: [-12, 198.8], w: 4 }, { a: [-86, 201.2], b: [-12, 201.2], w: 4 },
  { a: [-26, -118.3], b: [26, -118.3], w: 2 },
  // 🛣️ naye footpath — ring road, jod-sadkein, gaon, cyber city, purana shehar
  { a: [-RING.x + 12, RING.zS + 10.1], b: [-40, RING.zS + 10.1], w: 2 }, { a: [40, RING.zS + 10.1], b: [RING.x - 12, RING.zS + 10.1], w: 2 },
  { a: [-RING.x + 12, RING.zN - 10.1], b: [RING.x - 12, RING.zN - 10.1], w: 3 }, { a: [-RING.x + 12, RING.zN + 10.1], b: [RING.x - 12, RING.zN + 10.1], w: 2 },
  { a: [-RING.x + 10.1, RING.zS + 12], b: [-RING.x + 10.1, RING.zN - 12], w: 2 }, { a: [RING.x - 10.1, RING.zS + 12], b: [RING.x - 10.1, RING.zN - 12], w: 2 },
  { a: [-LINK_X + 10.1, RING.zS + 12], b: [-LINK_X + 10.1, RING.zN - 12], w: 2 }, { a: [-LINK_X - 10.1, RING.zS + 12], b: [-LINK_X - 10.1, RING.zN - 12], w: 2 },
  { a: [LINK_X - 10.1, RING.zS + 12], b: [LINK_X - 10.1, RING.zN - 12], w: 2 }, { a: [LINK_X + 10.1, RING.zS + 12], b: [LINK_X + 10.1, RING.zN - 12], w: 2 },
  { a: [-RING.x + 12, 10.1], b: [-160, 10.1], w: 2 }, { a: [-RING.x + 12, -10.1], b: [-160, -10.1], w: 2 },
  { a: [160, 10.1], b: [RING.x - 12, 10.1], w: 2 }, { a: [160, -10.1], b: [RING.x - 12, -10.1], w: 2 },
  { a: [-400, 160], b: [-190, 160], w: 2 }, { a: [-300, 40], b: [-300, 315], w: 1 },   // gaon ki pagdandi
  { a: [-150, 610], b: [-30, 610], w: 1 }, { a: [30, 610], b: [150, 610], w: 1 },     // purana shehar
 { a: [-146, 121], b: [-146, 161], w: 1 }, { a: [-121, 162], b: [-146, 162], w: 1 },
];
const LANE_W = LANES.reduce((s, l) => s + l.w, 0);
const pickLane = () => { let k = R() * LANE_W; for (const l of LANES) { if ((k -= l.w) <= 0) return l; } return LANES[0]; };

function laneProject(x, z) {
  let best = LANES[0], bf = 0, bd = Infinity;
  for (const l of LANES) {
    const ax = l.b[0] - l.a[0], az = l.b[1] - l.a[1], L2 = ax * ax + az * az;
    const f = Math.max(0, Math.min(1, ((x - l.a[0]) * ax + (z - l.a[1]) * az) / L2));
    const d = Math.hypot(l.a[0] + ax * f - x, l.a[1] + az * f - z);
    if (d < bd) { bd = d; best = l; bf = f; }
  }
  return { lane: best, f: bf, d: bd };
}
const SHOP_KEEPERS = {
  mithai: { old: true, outfit: 'kurta', top: 0xfff6e0, stache: true, hat: 'topi', apron: 0xfff3d6, belly: 1 }, // halwai 🍬
  barber: { outfit: 'shirt', top: 0xffffff, hairStyle: 'salman', stache: true, gamchha: true },
  chai: { outfit: 'lungi', top: 0xf2e6d0, bottom: 0x3a6a8a, gamchha: true, stache: true },
  paan: { outfit: 'kurta', top: 0xffffff, old: true, stache: true, tilak: 'lal', gamchha: true },
  dj: { outfit: 'tshirt', top: 0x111111, print: 0xff3d7f, shades: true, hairStyle: 'spiky' },
  dhaba: { outfit: 'tshirt', top: 0xff9a1f, stache: true, apron: 0xf4f0e6, belly: 1, hat: 'pagdi', pagdiColor: 0x1565c0 }, // sardar ji ka dhaba
  std: { outfit: 'shirt', top: 0xc8b28a, old: true, specs: true },
  video: { outfit: 'shirt', top: 0x7a4ab0, hairStyle: 'salman', stache: true, shades: true },
  kirana: { outfit: 'kurta', top: 0xffffff, old: true, hat: 'topi', belly: 1, specs: true, gamchha: true }, // lala ji
  golgappa: { outfit: 'shirt', top: 0x2f6fd0, hat: 'cap', gamchha: true, apron: 0xf4f0e6 },
  hotel: { outfit: 'jacket', top: 0x1a1a2a, bottom: 0x1a1a2a, stache: true, hairStyle: 'side' },
};
const COP = { role: 'police' };
// 💃 har ladki ka apna andaaz — ek se badh kar ek
const GIRL_LOOKS = {
  Pinky: { outfit: 'crop', top: 0xff4f9b, bottom: 0x1f3358, hairStyle: 'pony', tie: 0xff4f9b, hoops: true, shades: true, skin: 0xd09b6a },
  Sweety: { outfit: 'lehenga', top: 0xd81b60, bottom: 0xffd23f, dupatta: 0xff4081, hairStyle: 'bun', gajra: true, tikka: true, bangles: true, skin: 0xc68642 },
  Rani: { outfit: 'saree', top: 0xffc23a, bottom: 0xc2185b, hairStyle: 'open', nath: true, tikka: true, bangles: true, skin: 0xb9774a },
  Neha: { outfit: 'jeans', top: 0xffffff, bottom: 0x3d6aa0, hairStyle: 'open', specs: true, skin: 0xd09b6a },
  Pooja: { outfit: 'salwar', top: 0xfdd835, bottom: 0x2e7d32, dupatta: 0x2e7d32, hairStyle: 'choti', gajra: true, bangles: true, skin: 0xe0ac7e },
  Kajal: { outfit: 'saree', top: 0x111111, bottom: 0x6a1b9a, hairStyle: 'bun', gajra: true, hoops: true, skin: 0xc68642 },
  Priya: { outfit: 'lehenga', top: 0x00897b, bottom: 0xff7a00, dupatta: 0xffd23f, hairStyle: 'pony', tie: 0xffd23f, nath: true, bangles: true, skin: 0xa0673a },
  Sonam: { outfit: 'crop', top: 0xe53935, bottom: 0x16213a, hairStyle: 'open', hoops: true, skin: 0xb9774a },
  Anjali: { outfit: 'salwar', top: 0x4fc3f7, bottom: 0xffffff, dupatta: 0xffffff, hairStyle: 'pony', tie: 0x4fc3f7, bangles: [0x4fc3f7, 0xffffff, 0x4fc3f7], skin: 0xd09b6a },
  Dimple: { outfit: 'crop', top: 0xffd23f, bottom: 0xf2f2f2, hairStyle: 'bun', hoops: true, shades: true, skin: 0xe0ac7e },
  Guddi: { outfit: 'salwar', top: 0xff7a00, bottom: 0xff4081, dupatta: 0xff4081, hairStyle: 'choti', gajra: true, nath: true, skin: 0xa0673a },
  Babli: { outfit: 'lehenga', top: 0xff80ab, bottom: 0x7b1fa2, dupatta: 0xff80ab, hairStyle: 'open', tikka: true, nath: true, bangles: true, skin: 0xc68642 },
  Komal: { outfit: 'saree', top: 0xffd23f, bottom: 0x2e7d32, hairStyle: 'bun', gajra: true, bangles: true, skin: 0xb9774a },
  Reshma: { outfit: 'salwar', top: 0x880e4f, bottom: 0xffc83d, dupatta: 0xffc83d, hairStyle: 'open', nath: true, hoops: true, skin: 0xd09b6a },
  Simran: { outfit: 'jeans', top: 0x8e24aa, bottom: 0x1f3358, hairStyle: 'pony', tie: 0xffffff, shades: true, skin: 0xe0ac7e },
};

export function buildNPCs(scene, { world, places2, isTouch }) {
  const npcs = [];
  const add = (h, props) => {
    h.root.position.set(props.x, props.y || 0, props.z);
    h.root.rotation.y = props.heading || 0;
    scene.add(h.root);
    const n = { h, type: 'misc', x: props.x, z: props.z, y: props.y || 0, heading: props.heading || 0, ...props };
    npcs.push(n);
    return n;
  };

  // ---------- RAAHGIR ----------
  let girlI = 0;
  const walkerCount = isTouch ? 22 : 40;
  for (let i = 0; i < walkerCount; i++) {
    const lane = pickLane();
    const female = R() < 0.5;
    const kid = R() < 0.14;
    const old = !kid && R() < 0.15;
    const gname = female && !kid && !old ? GIRL_NAMES[girlI++ % GIRL_NAMES.length] : null;
    const h = makeHuman(kid ? { kid, female, outfit: female ? 'frock' : 'shirt', top: 0xffffff, bottom: 0x1f2f5a }
      : gname ? { female: true, ...(GIRL_LOOKS[gname] || {}) }
        : { female, old });
    const f = R();
    const n = add(h, { type: 'walker', lane, f, kidW: kid, dir: R() < 0.5 ? 1 : -1, speed: kid ? 1.6 : old ? 0.9 : rnd(1.15, 1.5), off: rnd(-0.45, 0.45), x: 0, z: 0 });
    h.speed = n.speed;
    if (gname) n.girl = { name: gname, rejected: 0, affinity: rnd(0, 0.15), gf: false, slapped: 0 };
    n.canDance = !old && R() < 0.75;
    if (!kid && !old && R() < 0.24) { hold(h, itemMesh('cig')); n.smoker = true; n.smokeT = rnd(1, 8); }
    else if (!kid && R() < 0.12) hold(h, itemMesh(pick(['phone', 'cup', 'balloon'])));
  }
  // ---------- POLICE (patrol) ----------
  const cops = [];
  for (let i = 0; i < 3; i++) {
    const h = makeHuman(COP);
    hold(h, itemMesh('lathi'));
    const lane = [LANES[0], LANES[1], LANES[6]][i];
    const n = add(h, { type: 'walker', cop: true, lane, f: R(), dir: 1, speed: 1.1, off: 0, x: 0, z: 0 });
    cops.push(n);
  }
  for (const [dx, dz] of [[-6, -2], [-6, 2]]) {
    const h = makeHuman(COP);
    hold(h, itemMesh('lathi'));
    const d = places2.thana.door;
    const n = add(h, { type: 'guard', cop: true, x: d.x + dx + 6, z: d.z + dz, heading: -Math.PI / 2 });
    n.home = { x: n.x, z: n.z, heading: n.heading };
    cops.push(n);
  }

  // ---------- DUKAANDAAR ----------
  const keepers = {};
  for (const k of world.keepers) {
    const spec = k.stall ? k.def.keeper : SHOP_KEEPERS[k.id] || {};
    // desi dukaandaar ko kandhe pe gamchha (agar khud kuch alag nahi pehna)
    const desi = !spec.female && !spec.kid && !spec.role && (spec.outfit === 'kurta' || spec.outfit === 'lungi') && spec.apron == null;
    const h = makeHuman(desi ? { gamchha: true, ...spec } : spec);
    if (k.id === 'barber') hold(h, itemMesh('scissors'));
    if (k.id === 'chai') hold(h, itemMesh('cup'));
    const n = add(h, { type: 'keeper', id: k.id, x: k.x, z: k.z, heading: k.heading, home: { x: k.x, z: k.z, heading: k.heading }, info: k, waveT: 0, near: false });
    keepers[k.id] = n;
  }

  // ---------- BALCONY WALE ----------
  for (const b of world.balconies) {
    const h = makeHuman(b.kid ? { kid: true, female: R() < 0.5 } : { female: R() < 0.55, old: R() < 0.2 });
    const n = add(h, { type: 'balcony', x: b.x, y: b.y, z: b.z, heading: b.heading, waveCd: rnd(0, 10) });
    n.base = b.kid ? pick(['dance', 'idle', 'wave']) : pick(['idle', 'phone', 'clothes', 'idle', 'talk']);
    setAction(h, n.base);
  }

  // ---------- GHAT ----------
  const priest = add(makeHuman({ role: 'pandit' }), { type: 'priest', x: -6, y: 0.03, z: -118.5, heading: 0 });
  hold(priest.h, itemMesh('thali'));
  for (let i = 0; i < 5; i++) {
    const n = add(makeHuman({ female: i % 2 === 0 }), { type: 'static', x: -10 + i * 2, y: 0.03, z: -110.5, heading: 0 });
    setAction(n.h, 'sit');
  }
  const bathers = [];
  for (let i = 0; i < 5; i++) {
    const kid = i === 4;
    const n = add(makeHuman({ kid, outfit: kid ? 'shirt' : 'lungi', top: 0xffffff }), { type: 'bather', x: rnd(-16, 16), y: kid ? -3.7 : -4.05, z: rnd(-127.3, -128.5), heading: R() < 0.5 ? 0 : Math.PI, dunk: rnd(0, 8) });
    setAction(n.h, 'bathe');
    bathers.push(n);
  }
  const yoga = add(makeHuman({ old: true, outfit: 'kurta', top: 0xffffff, bottom: 0xffffff }), { type: 'static', x: 14, y: 0.03, z: -114, heading: 0 });
  setAction(yoga.h, 'yoga');
  // naav
  const boat = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.8 });
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 4.4), wood);
  boat.add(hull);
  for (const s of [-1, 1]) {
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 4), wood);
    tip.rotation.x = s * Math.PI / 2;
    tip.rotation.y = Math.PI / 4;
    tip.position.z = s * 2.8;
    tip.scale.set(1, 1, 0.35);
    boat.add(tip);
  }
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.8, 0.6), toneMapped: false }));
  lamp.position.set(0, 0.6, -1.8);
  boat.add(lamp);
  boat.position.set(0, -3.25, -150);
  boat.rotation.y = Math.PI / 2;
  scene.add(boat);
  const boatman = makeHuman({ outfit: 'lungi', top: 0xffffff, stache: true });
  boatman.root.position.set(0, 0.25, 1.4);
  boatman.root.rotation.y = Math.PI;
  boat.add(boatman.root);
  setAction(boatman, 'row');
  const passenger = makeHuman({ female: true });
  passenger.root.position.set(0, 0.25 - 0.2, -0.6);
  passenger.root.rotation.y = Math.PI;
  boat.add(passenger.root);
  setAction(passenger, 'sit');

  // ---------- PARK ----------
  const P = places2.pitch;
  const mkKid = (o = {}) => makeHuman({ kid: true, female: false, outfit: 'tshirt', ...o });
  const batsman = add(mkKid({ hat: 'cap', capColor: 0x2f5fa8 }), { type: 'static', x: P.x + 0.4, z: P.bat, heading: Math.PI });
  hold(batsman.h, itemMesh('bat'));
  setAction(batsman.h, 'bat');
  const bowler = add(mkKid(), { type: 'static', x: P.x, z: 156, heading: 0 });
  const keeperKid = add(mkKid({ top: 0xffffff }), { type: 'static', x: P.x, z: 130, heading: Math.PI });
  setAction(keeperKid.h, 'hands');
  const fielders = [[-143, 145], [-127, 138], [-130, 154]].map(([x, z]) => add(mkKid({ top: pick([0xd94848, 0x3d8f5a, 0xe8c547]) }), { type: 'static', x, z, heading: headingTo(P.x - x, 141 - z), home: { x, z } }));
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshStandardMaterial({ color: 0xc0161e }));
  scene.add(ball);
  const cricket = { ph: 'walk', t: 0, from: new THREE.Vector3(), to: new THREE.Vector3(), fielder: null };
  // patang
  const kites = [];
  for (const [x, z] of [[-147, 124], [-145, 156]]) {
    const kidN = add(mkKid({ female: R() < 0.4 }), { type: 'static', x, z, heading: -Math.PI / 2 });
    setAction(kidN.h, 'kite');
    const kite = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshStandardMaterial({ color: pick([0xff3d7f, 0xffd23f, 0x2ef2ff, 0x3dff7a]), side: THREE.DoubleSide }));
    kite.rotation.z = Math.PI / 4;
    scene.add(kite);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
    scene.add(line);
    kites.push({ kidN, kite, line, p: R() * 6 });
  }
  // taash
  const C = places2.cards;
  for (const [dx, dz] of [[-1.25, 0], [1.25, 0], [0, 0.95]]) {
    const n = add(makeHuman({ old: true, outfit: pick(['kurta', 'lungi']), stache: true }), { type: 'static', x: C.x + dx, z: C.z + dz, heading: headingTo(-dx, -dz) });
    setAction(n.h, 'cards');
  }
  // jhoola
  const swingKid = mkKid({ female: true, outfit: 'frock', top: 0xff4081 });
  swingKid.root.position.set(0, -2.48, 0);
  places2.swing.seat.add(swingKid.root);
  setAction(swingKid, 'sit');
  // gali mein taash
  for (const [x, z, hd] of [[-87, 198.6, -Math.PI / 2], [-87, 201.4, -Math.PI / 2]]) {
    const n = add(makeHuman({ old: true, outfit: 'kurta', hat: R() < 0.5 ? 'topi' : null }), { type: 'static', x, z, heading: hd });
    setAction(n.h, 'cards');
  }

  // ---------- POLICE JEEP ----------
  const jeep = new THREE.Group();
  const jw = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.4, metalness: 0.3 });
  const jb = new THREE.MeshStandardMaterial({ color: 0x1f3a8a, roughness: 0.5 });
  const jbody = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.9, 4), jw); jbody.position.y = 0.85; jbody.castShadow = true; jeep.add(jbody);
  const jstripe = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.18, 4.02), jb); jstripe.position.y = 0.95; jeep.add(jstripe);
  const jcab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.75, 1.9), new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.8, roughness: 0.15 })); jcab.position.set(0, 1.65, 0.3); jeep.add(jcab);
  const jroof = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.08, 2.0), jw); jroof.position.set(0, 2.05, 0.3); jeep.add(jroof);
  const sirenR = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 0.1, 0.1), toneMapped: false });
  const sirenB = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.1, 0.3, 3), toneMapped: false });
  const lr = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.25), sirenR); lr.position.set(-0.3, 2.15, 0.3); jeep.add(lr);
  const lb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.25), sirenB); lb.position.set(0.3, 2.15, 0.3); jeep.add(lb);
  const jwheelG = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 14); jwheelG.rotateZ(Math.PI / 2);
  const jtyre = new THREE.MeshStandardMaterial({ color: 0x111111 });
  for (const [x, z] of [[-0.95, -1.3], [0.95, -1.3], [-0.95, 1.3], [0.95, 1.3]]) { const w = new THREE.Mesh(jwheelG, jtyre); w.position.set(x, 0.42, z); jeep.add(w); }
  const jdriver = makeHuman(COP);
  jdriver.root.position.set(-0.4, 0.3, -0.1);
  jeep.add(jdriver.root);
  setAction(jdriver, 'drive');
  const jhome = { x: THANA.x0 + 10, z: BAZAAR_Z, h: Math.PI / 2 };
  const J = { g: jeep, x: jhome.x, z: jhome.z, h: jhome.h, speed: 0, active: false };
  jeep.position.set(J.x, 0, J.z);
  jeep.rotation.y = J.h;
  scene.add(jeep);

  // ---------- DHUAAN 🚬 ----------
  const smokeMat = new THREE.SpriteMaterial({ color: 0xdedede, transparent: true, opacity: 0.5, depthWrite: false });
  const puffs = Array.from({ length: 24 }, () => { const sp = new THREE.Sprite(smokeMat.clone()); sp.visible = false; scene.add(sp); return { sp, t: 0 }; });
  let puffI = 0;
  const hp = new THREE.Vector3();
  function puff(h) {
    h.headPivot.getWorldPosition(hp);
    const p = puffs[puffI++ % puffs.length];
    p.t = 2.2; p.sp.visible = true; p.sp.position.set(hp.x, hp.y + 0.12, hp.z); p.sp.scale.setScalar(0.15);
  }

  // ---------- UPDATE ----------
  const tmpV = new THREE.Vector3();
  let frame = 0, chatT = 1;
  // dukaan ke counter pe grahak ke khade hone ki jagah (player wali jagah se thoda side mein)
  const shopSpots = world.triggers.filter((t) => t.foot && t.keeper).map((t) => {
    const sx = Math.cos(t.heading), sz = -Math.sin(t.heading);
    return { x: t.x + sx * 1.6, z: t.z + sz * 1.6, heading: t.heading, busy: false };
  }).filter((s) => footable(s.x, s.z));
  function respawn(n, cam) {
    // bada shehar: player ke aas-paas (30–140m) hi wapas aao, warna mohalla khaali lagega
    for (let k = 0; k < 40; k++) {
      const lane = pickLane(), f = R();
      const x = lane.a[0] + (lane.b[0] - lane.a[0]) * f, z = lane.a[1] + (lane.b[1] - lane.a[1]) * f;
      const d = Math.hypot(x - cam.x, z - cam.z);
      if ((d > 30 && d < 140) || (k > 30 && d > 30) || k === 39) {
        n.lane = lane; n.f = f; n.dir = R() < 0.5 ? 1 : -1; n.x = x; n.z = z;
        n.pause = 0; n.backToLane = false; n.faceTo = null;
        n.heading = headingTo((lane.b[0] - lane.a[0]) * n.dir, (lane.b[1] - lane.a[1]) * n.dir);
        return;
      }
    }
  }
  const dCamQ = (n) => Math.hypot(n.x - camPos.x, n.z - camPos.z);
  const camPos = new THREE.Vector3();
  function lookAtPlayer(n, px, pz, maxD = 9) {
    const dx = px - n.x, dz = pz - n.z;
    if (dx * dx + dz * dz < maxD * maxD) {
      n.h.look = Math.max(-1.1, Math.min(1.1, wrap(headingTo(dx, dz) - n.heading)));
    } else n.h.look *= 0.95;
  }
  let d0 = () => 99;
  function copGun(n, d, dt, ev, ctx) {
    if (ctx.copsShoot) {
      if (!n.gunOut) { n.gunOut = true; hold(n.h, itemMesh('katta')); }
      setOverlay(n.h, d < 26 ? 'aim' : null);
      n.shootCd = (n.shootCd ?? 1.5) - dt;
      if (d < 26 && d > 2 && n.shootCd <= 0) { n.shootCd = 1.3 + R() * 1.3; ev.push({ type: 'copShot', n, hit: R() < 0.32 }); }
    } else if (n.gunOut) { n.gunOut = false; hold(n.h, itemMesh('lathi')); setOverlay(n.h, null); }
  }
  // foot: true = sirf footpath, 'any' = footpath ya sadak (chor/police sadak paar kar sakte hain), false = kahin bhi
  // BUG FIX: pehle seedha raasta band ho to banda wahin khada reh jaata tha (deewar/sadak ke kinaare atak).
  // Ab rukawat ke aas-paas tircha raasta dhoondta hai, aur n.stuckT / n.progT se pata chalta hai ki atka hua hai.
  function moveToward(n, tx, tz, speed, dt, foot = true) {
    const dx = tx - n.x, dz = tz - n.z, d = Math.hypot(dx, dz);
    // naya goal → progress ka hisaab dobara
    if (n.gx === undefined || Math.hypot(tx - n.gx, tz - n.gz) > 1.5) { n.gx = tx; n.gz = tz; n.bestD = d; n.progT = 0; }
    else if (d < n.bestD - 0.4) { n.bestD = d; n.progT = 0; } else n.progT += dt;
    if (d < 0.05) { n.stuckT = 0; return d; }
    let ok = foot === 'any' ? passable : foot ? footable : null;
    // khud hi rukawat ke bahar/andar khada hai (sadak pe gira, spawn, dhakka) → dheela niyam, warna har kadam block:
    // sadak pe ho to sadak+footpath chalega; building ke andar hi phans gaya to kahin bhi nikal jao
    if (ok && !ok(n.x, n.z)) ok = ok !== passable && passable(n.x, n.z) ? passable : null;
    const step = Math.min(d, speed * dt);
    let ux = dx / d, uz = dz / d, moved = !ok || ok(n.x + ux * step, n.z + uz * step);
    if (!moved) {
      const side = n.steer || (R() < 0.5 ? 1 : -1);
      search: for (const a of [0.45, 0.9, 1.35, 1.8, 2.3]) for (const sg of [side, -side]) {
        const c = Math.cos(a * sg), s = Math.sin(a * sg), vx = ux * c - uz * s, vz = ux * s + uz * c;
        if (ok(n.x + vx * step, n.z + vz * step)) { ux = vx; uz = vz; moved = true; n.steer = sg; break search; }
      }
    }
    if (moved) {
      n.x += ux * step; n.z += uz * step;
      n.heading += wrap(headingTo(ux, uz) - n.heading) * Math.min(1, dt * 8);
      n.stuckT = Math.max(0, (n.stuckT || 0) - dt * 2);
    } else {
      n.heading += wrap(headingTo(dx, dz) - n.heading) * Math.min(1, dt * 8);
      n.stuckT = (n.stuckT || 0) + dt;
    }
    return d;
  }
  const isStuck = (n, s) => (n.stuckT || 0) > s || (n.progT || 0) > s * 3;
  const unstick = (n) => { n.stuckT = 0; n.progT = 0; n.gx = undefined; n.steer = 0; };
  // seedhi line mein raasta khula hai? (chor ke goal ke liye)
  const clearLine = (x0, z0, x1, z1) => {
    const L = Math.hypot(x1 - x0, z1 - z0), k = Math.max(1, Math.ceil(L / 2));
    for (let i = 1; i <= k; i++) if (!passable(x0 + ((x1 - x0) * i) / k, z0 + ((z1 - z0) * i) / k)) return false;
    return true;
  };

  function update(dt, t, ctx) {
    const ev = [];
    frame++;
    const pl = ctx.player, px = pl.pos.x, pz = pl.pos.z;
    d0 = (n) => Math.hypot(n.x - px, n.z - pz);
    const cam = ctx.camera.position;
    camPos.copy(cam);
    const hour = ctx.tod * 24;

    for (const p of puffs) {
      if (p.t <= 0) continue;
      p.t -= dt;
      p.sp.position.y += dt * 0.35;
      p.sp.position.x += Math.sin(t * 2 + p.t) * dt * 0.1;
      p.sp.scale.setScalar(0.15 + (2.2 - p.t) * 0.28);
      p.sp.material.opacity = Math.max(0, p.t / 2.2) * 0.45;
      if (p.t <= 0) p.sp.visible = false;
    }
    // do log mile to baatein shuru
    chatT -= dt;
    if (chatT <= 0) {
      chatT = 1;
      const ws = npcs.filter((n) => n.type === 'walker' && !n.cop && !n.girl?.gf && !n.hidden && !n.pause && !n.spot && !n.talking && !n.fall);
      for (let i = 0; i < ws.length; i++) for (let j = i + 1; j < ws.length; j++) {
        const a = ws[i], b = ws[j];
        if (!a.pause && !b.pause && Math.hypot(a.x - b.x, a.z - b.z) < 2.4 && R() < 0.3) {
          const tt = rnd(4, 9);
          a.pause = b.pause = tt; a.pauseAct = b.pauseAct = 'talk'; a.faceTo = b; b.faceTo = a;
        }
      }
    }
    for (const n of npcs) {
      if (n.hidden > 0) {
        n.hidden -= dt;
        if (n.hidden <= 0) respawn(n, cam); else { n.h.root.visible = false; continue; }
      }
      const dCam = Math.hypot(n.x - cam.x, n.z - cam.z);
      const far = dCam > 120;
      // bahut door ka raahgir → chupke se player ke paas
      if (n.type === 'walker' && !n.cop && !n.girl?.gf && !n.fall && !n.talking && !n.spot && dCam > 180 && R() < dt * 0.6) { respawn(n, cam); continue; }
      if (n.riding) continue;
      if (n.scene) { n.h.root.visible = true; updateHuman(n.h, dt, t); continue; }
      n.h.root.visible = !far;

      // gaadi se takkar
      if (!n.fall && (n.type === 'walker' || n.type === 'thief' || n.type === 'keeper' && n.info.id === 'golgappa') && pl.mode === 'drive' && Math.abs(pl.speed) > 4.5) {
        const dd = Math.hypot(n.x - px, n.z - pz);
        if (dd < 1.7 && !n.girl?.gf) {
          n.fall = 3.8;
          const sp = Math.abs(pl.speed) * Math.sign(pl.speed);
          n.fv = { x: -Math.sin(pl.heading) * sp * 0.6, z: -Math.cos(pl.heading) * sp * 0.6, y: 2.5 + Math.abs(sp) * 0.18 };
          n.fy = 0;
          n.cross = null;
          if (n.spot) { n.spot.busy = false; n.spot = null; }
          setAction(n.h, 'fall');
          if (!n.cop && !n.kidW && R() < 0.6) n.angryPending = true;
          ev.push({ type: 'hit', n, speed: Math.abs(sp) });
        }
      }
      if (n.ovT > 0) { n.ovT -= dt; if (n.puffAt && n.ovT < n.puffAt) { n.puffAt = 0; if (dCamQ(n) < 40) puff(n.h); } if (n.ovT <= 0) setOverlay(n.h, null); }
      if (n.smoker && !n.fall && !n.flee && n.h.root.visible) { n.smokeT -= dt; if (n.smokeT <= 0) { n.smokeT = rnd(5, 11); setOverlay(n.h, 'smoke'); n.ovT = 1.7; n.puffAt = 0.35; } }
      if (n.fall > 0) {
        n.fall -= dt;
        if (n.fv) {
          const nx = n.x + n.fv.x * dt, nz = n.z + n.fv.z * dt;
          if (footable(nx, nz)) { n.x = nx; n.z = nz; } else { n.fv.x *= -0.3; n.fv.z *= -0.3; }
          n.fy += n.fv.y * dt; n.fv.y -= 16 * dt;
          n.fv.x *= 1 - dt * 1.5; n.fv.z *= 1 - dt * 1.5;
          if (n.fy <= 0) { n.fy = 0; n.fv = null; }
          n.h.root.rotation.x -= dt * 9;
        } else n.h.root.rotation.x += (-Math.PI / 2 - n.h.root.rotation.x) * Math.min(1, dt * 10);
        n.h.root.position.set(n.x, 0.12 + (n.fy || 0), n.z);
        if (n.fall <= 0) {
          n.h.root.rotation.x = 0; n.pause = 2.5; n.pauseAct = 'point';
          n.faceTo = { x: px, z: pz };
          if (n.shot) { n.shot = false; if (n.type === 'walker' && !n.goon) { n.hidden = rnd(25, 45); n.h.root.visible = false; continue; } }
          ev.push({ type: 'getup', n });
          if (n.angryPending) { n.angryPending = false; n.angry = 9; n.pause = 0; }
          if (n.type === 'walker' && laneProject(n.x, n.z).d > 1) n.backToLane = true;
        }
        if (!far) updateHuman(n.h, dt, t);
        continue;
      }

      switch (n.type) {
        case 'walker': {
          if (n.cop && n.mode === 'chase') {
            const d = moveToward(n, px, pz, ctx.copsShoot && d0(n) < 18 ? 2.5 : 6.4, dt, 'any');
            setAction(n.h, d > 1.2 ? (ctx.copsShoot && d < 18 ? 'walk' : 'run') : 'point');
            copGun(n, d, dt, ev, ctx);
            if (d < 1.35 && (pl.mode === 'foot' || Math.abs(pl.speed) < 1.5)) ev.push({ type: 'caught', n });
            break;
          }
          if (n.hunt) { // 🏃 chor ke peeche daud (mohalle wale + police)
            const q = n.hunt;
            n.huntT -= dt;
            if (q.gone || q.fall > 0 || n.huntT <= 0) {
              n.hunt = null;
              if (q.fall > 0 && !q.gone) { n.pause = 3.5; n.pauseAct = 'point'; n.faceTo = { x: q.x, z: q.z }; } // gher ke khade
              if (n.tmpCop) { const me_ = n; setTimeout(() => remove(me_), 7000); } else if (n.cop) n.mode = 'return'; else n.backToLane = true;
              break;
            }
            const d = moveToward(n, q.x, q.z, n.cop ? 4.7 : 3.9 + (n.huntSp || 0), dt, 'any');
            setAction(n.h, d > 1.3 ? 'run' : 'point');
            if (isStuck(n, 1)) unstick(n);
            n.shoutT -= dt;
            if (n.shoutT <= 0) { n.shoutT = rnd(4, 9); ev.push({ type: 'huntShout', n }); }
            if (n.cop && d < 1.3) { q.fall = 4; q.byCop = true; setAction(q.h, 'fall'); } // police ne daboch liya
            break;
          }
          if (n.flee > 0) {
            n.flee -= dt;
            // atak gaye to bhaagne ki disha ghuma do (deewar mein muh ghusa ke bhaagte nahi rehna)
            if (isStuck(n, 0.4)) { n.fleeAng = (n.fleeAng || 0) + (R() < 0.5 ? 1 : -1) * rnd(0.9, 1.7); unstick(n); }
            const a = n.fleeAng || 0, ex = n.x - px, ez = n.z - pz;
            const dx = ex * Math.cos(a) - ez * Math.sin(a), dz = ex * Math.sin(a) + ez * Math.cos(a), dd = Math.hypot(dx, dz) || 1;
            moveToward(n, n.x + (dx / dd) * 6, n.z + (dz / dd) * 6, 5.4, dt);
            setAction(n.h, n.stuckT > 0.2 ? 'idle' : 'run');
            if (n.flee <= 0) n.fleeAng = 0;
            if (n.flee <= 0) n.backToLane = true;
            break;
          }
          if (n.angry > 0) {
            n.angry -= dt;
            const d = moveToward(n, px, pz, 4.6, dt);
            setAction(n.h, d > 1.1 ? 'run' : 'idle');
            n.punchCd = (n.punchCd || 0) - dt;
            if (d < 1.15 && n.punchCd <= 0 && pl.mode === 'foot') { setOverlay(n.h, 'punch'); n.ovT = 0.45; n.punchCd = 1.4; ev.push({ type: 'punched', n }); }
            if (d > 1.5 && isStuck(n, 2)) { n.angry = 0; unstick(n); } // pahunch hi nahi sakta → gussa chhodo
            if (n.angry <= 0) n.backToLane = true;
            break;
          }
          if (n.cop && n.mode === 'return') {
            const la = n.lane, tx = la.a[0] + (la.b[0] - la.a[0]) * n.f, tz = la.a[1] + (la.b[1] - la.a[1]) * n.f;
            if (moveToward(n, tx, tz, 2, dt, 'any') < 0.5 || isStuck(n, 3)) { n.mode = null; unstick(n); }
            setAction(n.h, 'walk');
            break;
          }
          if (n.girl?.gf) {
            // BUG FIX: pehle `n.gf` check hota tha (jo kabhi set hi nahi hota) — isliye wo apni marzi se ghoomti thi
            n.talking = false; n.pause = 0; n.cross = null; n.backToLane = false; n.flee = 0;
            if (n.spot) { n.spot.busy = false; n.spot = null; }
            const dP = Math.hypot(n.x - px, n.z - pz);
            if (pl.mode === 'drive') {
              if (dP < 9) {
                n.riding = true;
                ctx.vehG.add(n.h.root);
                n.h.root.position.copy(ctx.gfSeat || ctx.passenger);
                n.h.root.rotation.set(0, 0, 0);
                setAction(n.h, 'sit');
                ev.push({ type: 'ride', n });
                continue;
              }
            }
            // bahut peeche reh gayi (teleport / gaadi se aage nikal gaye) — chupke se peeche aa jaaye
            if (dP > 35) {
              for (const k of [1.6, 2.4, 3.2]) {
                const bx = px + Math.sin(pl.heading) * k, bz = pz + Math.cos(pl.heading) * k;
                if (footable(bx, bz)) { n.x = bx; n.z = bz; break; }
              }
            }
            // player ke theek peeche, thoda side mein
            const back = Math.sin(pl.heading), backZ = Math.cos(pl.heading);
            const rx = Math.cos(pl.heading), rz = -Math.sin(pl.heading);
            let tx = px + back * 1.3 + rx * 0.55, tz = pz + backZ * 1.3 + rz * 0.55;
            if (!footable(tx, tz)) { tx = px + back * 1.2; tz = pz + backZ * 1.2; }
            const d = Math.hypot(tx - n.x, tz - n.z);
            const pSpeed = Math.abs(pl.speed || 0);
            if (d > 0.35) {
              const sp = d > 5 ? 7.5 : Math.max(pSpeed * 1.05, Math.min(6.5, d * 2.4));
              moveToward(n, tx, tz, sp, dt);
              // deewar mein phans gayi to seedha player ki taraf
              if (d > 3 && Math.hypot(tx - n.x, tz - n.z) >= d - 0.001) moveToward(n, px, pz, sp, dt, false);
              setAction(n.h, sp > 4 ? 'run' : 'walk');
              n.h.speed = sp;
            } else {
              setAction(n.h, ctx.party ? 'dance' : 'idle');
              n.heading += wrap(pl.heading - n.heading) * Math.min(1, dt * 3);
            }
            break;
          }
          if (n.slapT > 0) { n.slapT -= dt; if (d0(n) > 0.72 && pl.mode === 'foot') moveToward(n, px, pz, 4.5, dt); n.heading = headingTo(px - n.x, pz - n.z); break; } // 0.72m: haath gaal tak pahunche
          if (n.talking) { n.heading += wrap(headingTo(px - n.x, pz - n.z) - n.heading) * Math.min(1, dt * 6); if (n.h.action !== 'slap') setAction(n.h, 'talk'); break; }
          const nearP = Math.hypot(n.x - px, n.z - pz);
          if (ctx.party && n.canDance && nearP < 26 && !n.cop) { setAction(n.h, 'dance'); lookAtPlayer(n, px, pz, 20); break; }
          if (n.pause > 0) {
            n.pause -= dt;
            setAction(n.h, n.pauseAct || 'idle');
            if (n.faceTo) n.heading += wrap(headingTo(n.faceTo.x - n.x, n.faceTo.z - n.z) - n.heading) * Math.min(1, dt * 5);
            else lookAtPlayer(n, px, pz);
            if (n.pause <= 0) n.faceTo = null;
            break;
          }
          // dukaan pe saaman lene jaana
          if (n.spot) {
            const sp = n.spot;
            if (n.shopT > 0) {
              n.shopT -= dt;
              n.heading += wrap(sp.heading - n.heading) * Math.min(1, dt * 5);
              setAction(n.h, 'talk');
              if (n.shopT <= 0) { sp.busy = false; n.spot = null; n.backToLane = true; }
            } else {
              const d = moveToward(n, sp.x, sp.z, n.speed, dt);
              setAction(n.h, 'walk');
              if (d < 0.45) n.shopT = rnd(5, 11);
              else if (isStuck(n, 2)) { sp.busy = false; n.spot = null; n.backToLane = true; unstick(n); } // dukaan tak raasta nahi
            }
            break;
          }
          const la = n.lane;
          const len = Math.hypot(la.b[0] - la.a[0], la.b[1] - la.a[1]);
          if (n.backToLane) {
            const tx = la.a[0] + (la.b[0] - la.a[0]) * n.f, tz = la.a[1] + (la.b[1] - la.a[1]) * n.f;
            if (moveToward(n, tx, tz, n.speed, dt) < 0.5) { n.backToLane = false; unstick(n); }
            else if (isStuck(n, 1.5)) {
              // purani lane tak raasta band → sabse paas wali lane pakdo; phir bhi na bane to ghar ke andar chala gaya
              const p = laneProject(n.x, n.z);
              if (p.d < 1.2) { n.lane = p.lane; n.f = p.f; n.backToLane = false; unstick(n); }
              else if (isStuck(n, 4)) { n.backToLane = false; unstick(n); n.hidden = rnd(3, 8); n.h.root.visible = false; break; }
              else if (p.lane !== n.lane || Math.abs(p.f - n.f) > 0.01) { n.lane = p.lane; n.f = p.f; n.stuckT = 0; }
            }
            setAction(n.h, n.stuckT > 0.3 ? 'idle' : 'walk');
            break;
          }
          // sadak paar karna 🚶‍♂️ (accident yahin hote hain)
          if (n.cross) {
            const d = moveToward(n, n.cross.x, n.cross.z, n.speed * 1.15, dt, false);
            setAction(n.h, 'walk');
            if (d < 0.4) { const p = laneProject(n.x, n.z); n.lane = p.lane; n.f = p.f; n.cross = null; n.backToLane = p.d > 0.5; n.dir = R() < 0.5 ? 1 : -1; }
            break;
          }
          if (!n.cop && !n.kidW && n.lane.road && R() < dt * 0.02) {
            const r = n.lane.road, j = rnd(-4, 4);
            n.cross = r === 'x0' ? { x: -n.x * 0.98, z: n.z + j } : r === 'z0' ? { x: n.x + j, z: -n.z } : r === 'zb' ? { x: n.x + j, z: 2 * BAZAAR_Z - n.z } : { x: n.x + j, z: 660 - n.z };
            break;
          }
          if (!n.cop && !n.kidW && R() < dt * 0.06) {
            const sp = shopSpots.find((s) => !s.busy && Math.hypot(s.x - n.x, s.z - n.z) < 14);
            if (sp) { sp.busy = true; n.spot = sp; break; }
          }
          n.f += (n.dir * n.speed * dt) / len;
          if (n.f > 1 || n.f < 0) {
            n.f = Math.max(0, Math.min(1, n.f));
            if (!n.cop && R() < 0.75) { n.hidden = rnd(4, 12); n.h.root.visible = false; break; } // ghar ke andar chala gaya
            n.dir *= -1; n.pause = rnd(1, 4); n.pauseAct = 'idle';
          }
          const ux = (la.b[0] - la.a[0]) / len, uz = (la.b[1] - la.a[1]) / len;
          n.x = la.a[0] + (la.b[0] - la.a[0]) * n.f - uz * n.off;
          n.z = la.a[1] + (la.b[1] - la.a[1]) * n.f + ux * n.off;
          const want = headingTo(ux * n.dir, uz * n.dir);
          n.heading += wrap(want - n.heading) * Math.min(1, dt * 6);
          setAction(n.h, 'walk');
          n.h.look *= 0.9;
          if (R() < dt * 0.04) { n.pause = rnd(2, 6); n.pauseAct = pick(['idle', 'phone', 'talk', 'idle']); }
          break;
        }
        case 'thief': {
          // BUG FIX: pehle goal poore naksha pe random tha aur seedhi line mein bhaagta tha — beech mein
          // deewar/building aayi to wahin atak jaata tha. Ab paas ka (12–45m) aisa goal jahan tak seedha
          // raasta khula ho, player se door; sadak bhi paar kar sakta hai; atke to turant naya goal.
          const dP = Math.hypot(n.x - px, n.z - pz);
          const reached = n.goal && Math.hypot(n.goal.x - n.x, n.goal.z - n.z) < 2;
          if (!n.goal || reached || isStuck(n, 0.35)) {
            let best = null, bd = -Infinity;
            for (let k = 0; k < 36; k++) {
              let gx, gz;
              if (k < 24) { // aas-paas kisi bhi disha mein
                const a = R() * Math.PI * 2, r = rnd(12, 45);
                gx = n.x + Math.sin(a) * r; gz = n.z + Math.cos(a) * r;
              } else { const l = pickLane(), f = R(); gx = l.a[0] + (l.b[0] - l.a[0]) * f; gz = l.a[1] + (l.b[1] - l.a[1]) * f; }
              if (!passable(gx, gz)) continue;
              const dg = Math.hypot(gx - n.x, gz - n.z);
              if (dg < 8) continue;
              // player se door jaao, aur player ki taraf se hoke nahi
              const awayDot = ((gx - n.x) * (n.x - px) + (gz - n.z) * (n.z - pz)) / ((dg * dP) || 1);
              let sc = Math.hypot(gx - px, gz - pz) + awayDot * 20 - (dg > 50 ? dg - 50 : 0);
              if (clearLine(n.x, n.z, gx, gz)) sc += 60; else sc -= 40;
              if (n.lastGoal && Math.hypot(gx - n.lastGoal.x, gz - n.lastGoal.z) < 4) sc -= 50; // wahi atka hua goal dobara nahi
              if (sc > bd) { bd = sc; best = { x: gx, z: gz }; }
            }
            if (n.goal && !reached) n.lastGoal = n.goal;
            n.goal = best || { x: n.x + rnd(-20, 20), z: n.z + rnd(-20, 20) };
            unstick(n);
          }
          moveToward(n, n.goal.x, n.goal.z, dP < 25 ? 5.7 : 4.2, dt, 'any');
          setAction(n.h, 'run');
          break;
        }
        case 'guard': {
          if (n.mode === 'chase') {
            const d = moveToward(n, px, pz, 6.4, dt, 'any');
            setAction(n.h, d > 1.2 ? 'run' : 'point');
            copGun(n, d, dt, ev, ctx);
            if (d < 1.35 && (pl.mode === 'foot' || Math.abs(pl.speed) < 1.5)) ev.push({ type: 'caught', n });
          } else {
            let d = moveToward(n, n.home.x, n.home.z, 2, dt, 'any');
            if (d > 0.3 && isStuck(n, 3)) { n.x = n.home.x; n.z = n.home.z; d = 0; unstick(n); } // thana ka raasta na mile to seedha duty pe
            if (d < 0.3) { n.heading += wrap(n.home.heading - n.heading) * Math.min(1, dt * 4); setAction(n.h, 'idle'); lookAtPlayer(n, px, pz, 12); } else setAction(n.h, 'walk');
          }
          break;
        }
        case 'keeper': {
          if (n.salon) break;
          // saaman haath mein pakda rahe hain 🤲
          if (n.giveT > 0) {
            n.giveT -= dt;
            setAction(n.h, 'point');
            lookAtPlayer(n, px, pz, 14);
            if (n.giveT <= 0) hold(n.h, n.id === 'barber' ? itemMesh('scissors') : n.id === 'chai' ? itemMesh('cup') : null);
            break;
          }
          if (ctx.activeShop === n.id) { setAction(n.h, ctx.slapKeeper === n.id ? 'point' : 'talk'); lookAtPlayer(n, px, pz, 12); break; }
          const d = Math.hypot(n.x - px, n.z - pz);
          if (d < 7 && !n.near) { n.near = true; n.waveT = 1.6; }
          if (d > 9) n.near = false;
          if (n.waveT > 0) { n.waveT -= dt; setAction(n.h, 'wave'); } else setAction(n.h, n.id === 'barber' ? 'idle' : 'idle');
          lookAtPlayer(n, px, pz, 10);
          break;
        }
        case 'balcony': {
          n.waveCd -= dt;
          const d = Math.hypot(n.x - px, n.z - pz);
          if (d < 18 && n.waveCd <= 0) { n.waveCd = rnd(15, 30); n.waveT = 2; }
          if (n.waveT > 0) { n.waveT -= dt; setAction(n.h, 'wave'); } else setAction(n.h, ctx.party && d < 30 && n.base !== 'clothes' ? 'dance' : n.base);
          lookAtPlayer(n, px, pz, 22);
          break;
        }
        case 'priest':
          setAction(n.h, hour > 17.3 && hour < 21.5 ? 'aarti' : 'pray');
          break;
        case 'bather':
          n.dunk -= dt;
          if (n.dunk < 0) { if (n.dunk < -1.2) n.dunk = rnd(5, 10); }
          n.h.root.position.y = n.y + (n.dunk < 0 ? -0.7 * Math.sin((-n.dunk / 1.2) * Math.PI) : Math.sin(t * 1.5 + n.x) * 0.05);
          break;
        default: break;
      }
      if (n.type !== 'bather') n.h.root.position.set(n.x, n.y, n.z);
      n.h.root.rotation.y = n.heading;
      if (!far && (dCam < 70 || frame % 3 === 0)) updateHuman(n.h, dCam < 70 ? dt : dt * 3, t);
    }

    // girlfriend rickshaw se utri
    for (const n of npcs) {
      if (n.riding && pl.mode === 'foot') {
        n.riding = false;
        scene.add(n.h.root);
        n.x = px + Math.cos(pl.heading) * 1.2;
        n.z = pz - Math.sin(pl.heading) * 1.2;
        n.h.root.position.set(n.x, 0, n.z);
      }
      if (n.riding) updateHuman(n.h, dt, t);
    }

    // police chase
    if (ctx.wanted > 0) {
      const sorted = cops.filter((c) => !c.fall).sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz));
      sorted.forEach((c, i) => { if (i < Math.min(3, 1 + ctx.wanted) && Math.hypot(c.x - px, c.z - pz) < 90) c.mode = 'chase'; });
    } else {
      for (const c of cops) if (c.mode === 'chase') c.mode = c.type === 'walker' ? 'return' : null;
    }
    // jeep
    J.active = ctx.wanted >= 2;
    const tx = J.active ? px : jhome.x, tz = J.active ? pz : jhome.z;
    const jd = Math.hypot(tx - J.x, tz - J.z);
    if (jd > (J.active ? 3 : 1)) {
      const want = headingTo(tx - J.x, tz - J.z);
      J.h += wrap(want - J.h) * Math.min(1, dt * 1.6);
      const target = J.active ? Math.min(14, jd * 1.5) : Math.min(8, jd);
      J.speed += (target - J.speed) * Math.min(1, dt * 1.5);
      const nx = J.x - Math.sin(J.h) * J.speed * dt, nz = J.z - Math.cos(J.h) * J.speed * dt;
      if (driveable(nx, nz)) { J.x = nx; J.z = nz; } else { J.speed *= 0.5; J.h += dt * 2; }
    } else {
      J.speed *= 0.8;
      if (!J.active) J.h += wrap(jhome.h - J.h) * Math.min(1, dt * 2);
    }
    if (J.active && jd < 4.2 && Math.abs(pl.speed) < 3) ev.push({ type: 'caught', n: null });
    jeep.position.set(J.x, 0, J.z);
    jeep.rotation.y = J.h;
    const blink = J.active ? (Math.floor(t * 6) % 2) : 0;
    sirenR.color.setRGB(J.active ? (blink ? 4 : 0.2) : 0.4, 0.1, 0.1);
    sirenB.color.setRGB(0.1, 0.3, J.active ? (blink ? 0.2 : 4) : 0.4);
    updateHuman(jdriver, dt, t);

    // ghat ki naav
    boat.position.x = Math.sin(t * 0.05) * 40;
    boat.rotation.y = Math.cos(t * 0.05) > 0 ? -Math.PI / 2 : Math.PI / 2;
    boat.position.y = -3.25 + Math.sin(t * 1.3) * 0.06;
    updateHuman(boatman, dt, t);
    updateHuman(passenger, dt, t);
    updateHuman(swingKid, dt, t);

    // cricket
    const cr = cricket;
    cr.t += dt;
    const nearPark = Math.hypot(px - P.x, pz - 141) < 110;
    if (nearPark) {
      if (cr.ph === 'walk') {
        bowler.x = P.x; bowler.z = 156 - Math.min(1, cr.t / 1.6) * 5.5; bowler.heading = 0; setAction(bowler.h, 'run');
        ball.position.set(bowler.x + 0.2, 1.0, bowler.z);
        batsman.h.swing = 0;
        if (cr.t > 1.6) { cr.ph = 'bowl'; cr.t = 0; setAction(bowler.h, 'bowl'); }
      } else if (cr.ph === 'bowl') {
        ball.position.set(bowler.x + 0.2, 1.0 + cr.t * 2, bowler.z);
        if (cr.t > 0.45) { cr.ph = 'ball'; cr.t = 0; cr.from.copy(ball.position); cr.to.set(P.x + 0.3, 0.7, P.bat - 0.4); }
      } else if (cr.ph === 'ball') {
        const k = Math.min(1, cr.t / 0.65);
        tmpV.lerpVectors(cr.from, cr.to, k);
        tmpV.y = k < 0.7 ? cr.from.y + (0.05 - cr.from.y) * (k / 0.7) : 0.05 + (cr.to.y - 0.05) * ((k - 0.7) / 0.3);
        ball.position.copy(tmpV);
        batsman.h.swing = Math.max(0, (k - 0.6) / 0.4);
        if (k >= 1) {
          cr.ph = 'fly'; cr.t = 0; cr.from.copy(ball.position);
          const a = rnd(-1.2, 1.2) + (R() < 0.5 ? 0 : Math.PI);
          cr.to.set(Math.max(-150, Math.min(-121, P.x + Math.sin(a) * rnd(6, 14))), 0.05, Math.max(119, Math.min(162, 141 + Math.cos(a) * rnd(6, 16))));
          cr.fielder = fielders.reduce((b, f) => (Math.hypot(f.x - cr.to.x, f.z - cr.to.z) < Math.hypot(b.x - cr.to.x, b.z - cr.to.z) ? f : b));
        }
      } else if (cr.ph === 'fly') {
        const k = Math.min(1, cr.t / 1.6);
        ball.position.lerpVectors(cr.from, cr.to, k);
        ball.position.y = cr.from.y + Math.sin(k * Math.PI) * 6;
        batsman.h.swing = 1;
        const f = cr.fielder;
        const d = moveToward(f, cr.to.x, cr.to.z, 5, dt, false);
        setAction(f.h, d > 0.4 ? 'run' : 'idle');
        if (k >= 1 && d < 0.6) { cr.ph = 'throw'; cr.t = 0; cr.from.copy(ball.position); cr.to.set(P.x, 1, 151); setAction(f.h, 'bowl'); }
      } else if (cr.ph === 'throw') {
        const k = Math.min(1, cr.t / 1.0);
        ball.position.lerpVectors(cr.from, cr.to, k);
        ball.position.y = 1 + Math.sin(k * Math.PI) * 3;
        if (k >= 1) { cr.ph = 'back'; cr.t = 0; }
      } else if (cr.ph === 'back') {
        bowler.heading = Math.PI;
        moveToward(bowler, P.x, 156, 2.5, dt, false);
        setAction(bowler.h, 'walk');
        ball.position.set(bowler.x + 0.2, 1.0, bowler.z);
        for (const f of fielders) { const d = moveToward(f, f.home.x, f.home.z, 2.5, dt, false); setAction(f.h, d > 0.3 ? 'walk' : 'hands'); }
        if (cr.t > 2.5) { cr.ph = 'walk'; cr.t = 0; }
      }
    }
    for (const k of kites) {
      const kp = k.kidN;
      k.kite.position.set(kp.x - 14 + Math.sin(t * 0.7 + k.p) * 2.5, 18 + Math.sin(t * 1.1 + k.p) * 2, kp.z + Math.cos(t * 0.5 + k.p) * 3);
      k.kite.rotation.y = Math.sin(t + k.p) * 0.4;
      k.kite.rotation.x = Math.sin(t * 2 + k.p) * 0.2;
      const pa = k.line.geometry.attributes.position;
      pa.setXYZ(0, kp.x, 1.25 * 0.62 + 0.4, kp.z);
      pa.setXYZ(1, k.kite.position.x, k.kite.position.y, k.kite.position.z);
      pa.needsUpdate = true;
    }
    return ev;
  }

  function nearestGirl(pos, r = 2.4) {
    let best = null, bd = r;
    for (const n of npcs) {
      if (!n.girl || n.riding || n.fall > 0) continue;
      const d = Math.hypot(n.x - pos.x, n.z - pos.z);
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  }

  function salon(on, seat) {
    const b = keepers.barber;
    if (!b) return;
    if (on) {
      b.salon = true;
      b.x = seat.behind.x; b.z = seat.behind.z; b.heading = seat.chairHeading;
      setAction(b.h, 'cut');
    } else {
      b.salon = false;
      b.x = b.home.x; b.z = b.home.z; b.heading = b.home.heading;
    }
    b.h.root.position.set(b.x, 0, b.z);
    b.h.root.rotation.y = b.heading;
  }

  function hitTest(pos, heading, range) {
    const fx = -Math.sin(heading), fz = -Math.cos(heading);
    let best = null, bd = range;
    for (const n of npcs) {
      if (!(n.type === 'walker' || n.type === 'guard' || n.type === 'thief') || n.fall > 0 || n.riding || n.hidden > 0) continue;
      const dx = n.x - pos.x, dz = n.z - pos.z;
      const along = dx * fx + dz * fz, lat = Math.abs(dx * fz - dz * fx);
      if (along > -0.2 && along < bd && lat < 0.95) { bd = along; best = n; }
    }
    return best;
  }
  function knock(n, from, power = 1) {
    const dx = n.x - from.x, dz = n.z - from.z, d = Math.hypot(dx, dz) || 1;
    const push = 0.8 + power * 0.8;
    const nx = n.x + (dx / d) * push, nz = n.z + (dz / d) * push;
    if (footable(nx, nz)) { n.x = nx; n.z = nz; }
    n.heading = headingTo(-dx, -dz);
    n.fall = 2.8 + power;
    setAction(n.h, 'fall');
    if (n.spot) { n.spot.busy = false; n.spot = null; }
    n.talking = false;
    if (n.girl) n.girl.gf = false;
    if (!n.cop && !n.kidW && R() < 0.55) n.angryPending = true;
  }
  function adoptWalker(h, x, z, face) {
    let best = LANES[0], bf = 0, bd = Infinity;
    for (const l of LANES) {
      const ax = l.b[0] - l.a[0], az = l.b[1] - l.a[1], L2 = ax * ax + az * az;
      const f = Math.max(0, Math.min(1, ((x - l.a[0]) * ax + (z - l.a[1]) * az) / L2));
      const d = Math.hypot(l.a[0] + ax * f - x, l.a[1] + az * f - z);
      if (d < bd) { bd = d; best = l; bf = f; }
    }
    h.root.rotation.set(0, 0, 0);
    const n = add(h, { type: 'walker', lane: best, f: bf, dir: 1, speed: 1.6, off: 0, x, z, heading: headingTo(face.x - x, face.z - z) });
    n.pause = 3.5; n.pauseAct = 'point'; n.faceTo = { x: face.x, z: face.z }; n.backToLane = true;
    if (R() < 0.5) n.angryPending = false;
    return n;
  }
  // BUG FIX: pehle poore naksha pe random jagah dhoondhta tha — bade shehar mein paas ki jagah milti hi nahi thi
  // (isliye sawari sirf shuru mein milti thi). Ab har footpath pe player ke paas wale hisse se chunta hai.
  function randomSidewalk(pos, minD = 50, maxD = 200) {
    const cands = [];
    for (const l of LANES) {
      const ax = l.b[0] - l.a[0], az = l.b[1] - l.a[1], len = Math.hypot(ax, az);
      if (len < 1) continue;
      for (let k = 0; k < 6; k++) {
        const f = R();
        const x = l.a[0] + ax * f, z = l.a[1] + az * f;
        const d = Math.hypot(x - pos.x, z - pos.z);
        if (d >= minD && d <= maxD) cands.push({ x, z });
      }
      // lane ke sabse paas wale point ke aas-paas bhi
      const f0 = Math.max(0, Math.min(1, ((pos.x - l.a[0]) * ax + (pos.z - l.a[1]) * az) / (len * len)));
      for (let k = 0; k < 6; k++) {
        const f = Math.max(0, Math.min(1, f0 + ((R() - 0.5) * 2 * maxD) / len));
        const x = l.a[0] + ax * f, z = l.a[1] + az * f;
        const d = Math.hypot(x - pos.x, z - pos.z);
        if (d >= minD && d <= maxD) cands.push({ x, z });
      }
    }
    return cands.length ? pick(cands) : null;
  }
  function spawnThief(x, z) {
    const h = makeHuman({ outfit: 'tshirt', top: 0x222222, bottom: 0x3a3a3a, hat: 'cap', capColor: 0x111111, shades: true });
    return add(h, { type: 'thief', x, z, heading: 0 });
  }
  /** chor (target) ke peeche paas ke mohalle wale aur police daudein; police paas na ho to gali se nikal aaye */
  function hunt(target, nCiv = 4, nCop = 2) {
    const dT = (n) => Math.hypot(n.x - target.x, n.z - target.z);
    const set = (n, i) => { n.hunt = target; n.huntT = 70; n.huntSp = R() * 0.5; n.shoutT = 0.4 + i * 0.9; n.pause = 0; n.backToLane = false; };
    npcs.filter((n) => n.type === 'walker' && !n.cop && !n.kidW && !n.girl && !n.goon && !n.h.spec.female && !n.h.spec.old && !n.h.spec.kid && !(n.fall > 0) && !(n.hidden > 0) && !n.talking && !n.spot && !n.riding && dT(n) < 38)
      .sort((a, b) => dT(a) - dT(b)).slice(0, nCiv).forEach(set);
    const near = cops.filter((c) => c.type === 'walker' && !(c.fall > 0) && c.mode !== 'chase' && dT(c) < 70).sort((a, b) => dT(a) - dT(b)).slice(0, nCop);
    near.forEach((c, i) => { c.mode = null; set(c, i + 1); });
    for (let i = near.length; i < nCop; i++) { // paas koi sipahi nahi → 14-20m door se daudta hua aaye
      let x = target.x, z = target.z;
      for (let k = 0; k < 20; k++) { const a = R() * Math.PI * 2, r = rnd(14, 20); const gx = target.x + Math.sin(a) * r, gz = target.z + Math.cos(a) * r; if (passable(gx, gz)) { x = gx; z = gz; break; } }
      const h = makeHuman(COP);
      hold(h, itemMesh('lathi'));
      const c = add(h, { type: 'walker', cop: true, tmpCop: true, lane: LANES[0], f: R(), dir: 1, speed: 1.1, off: 0, x, z });
      set(c, i + 1);
    }
  }
  function remove(n) {
    n.gone = true;
    const i = npcs.indexOf(n);
    if (i >= 0) npcs.splice(i, 1);
    n.h.root.parent?.remove(n.h.root);
  }
  function shootNpc(n, from) {
    knock(n, from, 2.2);
    n.fall = 6; n.shot = true; n.downed = true; n.angryPending = false; n.flee = 0;
    if (n.girl) n.girl.gf = false;
  }
  function panic(pos, r = 30) {
    const out = [];
    for (const n of npcs) {
      if (n.type !== 'walker' || n.cop || n.goon || n.girl?.gf || n.fall > 0 || n.hidden > 0) continue;
      if (Math.hypot(n.x - pos.x, n.z - pos.z) > r) continue;
      n.flee = 5 + R() * 4; n.pause = 0; n.cross = null; n.talking = false;
      if (n.spot) { n.spot.busy = false; n.spot = null; }
      if (out.length < 2 && R() < 0.5) out.push(n);
    }
    return out;
  }
  function giveItem(id, mesh) {
    const k = keepers[id];
    if (!k) return null;
    k.giveT = 1.2;
    if (mesh) hold(k.h, itemMesh(mesh));
    return k;
  }

  return { giveItem, npcs, update, nearestGirl, randomSidewalk, shootNpc, panic, spawnThief, hunt, remove, keepers, cops, jeep: J, salon, hitTest, knock, adoptWalker, girls: () => npcs.filter((n) => n.girl) };
}
