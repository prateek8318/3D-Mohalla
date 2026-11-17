import * as THREE from 'three';
import { makeHuman, setAction } from './humans.js';

const R = Math.random;

// GTA jaisi kahani — har Respect level pe naya mission
export const STORY = [
  {
    id: 1, lv: 1, title: 'Rickshaw ka Raja', who: 'Pappu (chai wala)', at: { x: -8.5, z: 24 },
    intro: { hi: '"Naye ho mohalle mein? Pehle rickshaw chalana seekho. 3 sawari karke dikhao, phir baat karenge!"', bho: '"Naya baada mohalla mein? Pahile rickshaw chalawe seekha. 3 go sawari kar ke dekhaava!"' },
    steps: [{ type: 'count', key: 'sawari', n: 3, text: '💼 se 3 Sawari poori karo' }], reward: 250,
  },
  {
    id: 2, lv: 2, title: 'Gali ke Gunde', who: 'Gupta ji', at: { x: -8.5, z: 49 },
    intro: { hi: '"Beta, gali ke do gunde roz hafta maangte hain. Unhe aisa sabak sikhao ki dobara na aayein!"', bho: '"Babua, gali ke du go gunda roj hafta maangela. Aisan sabak sikhaava ki phir na aawas!"' },
    steps: [{ type: 'goto', at: { x: -48, z: 200 }, text: 'Chowk Bazaar Gali pahuncho' }, { type: 'goons', at: { x: -48, z: 200 }, n: 2, text: 'Dono gundon ko dhool chatao (J / 👊)' }], reward: 350,
  },
  {
    id: 3, lv: 3, title: 'Kallu ka Katta', who: 'Kallu Kattewala', at: { x: -121.5, z: 151 },
    intro: { hi: '"Hathiyaar chahiye? Pehle nishana dikha. Ye katta le aur deewar pe rakhi 4 botal tod!"', bho: '"Hathiyaar chaahi? Pahile nishana dekha. Ee katta le aa deewaar pe rakhal 4 go botal tor!"' },
    steps: [{ type: 'gun', gun: 'katta', ammo: 16 }, { type: 'targets', n: 4, text: 'Right-click/🎯 se nishana, click/🔫 se goli — 4 botal todo' }], reward: 300,
  },
  {
    id: 4, lv: 4, title: 'Chhat ka Sniper', who: 'Malhotra (Hotel)', at: { x: 71, z: 108.5 },
    intro: { hi: '"Bazaar Road pe Shera gang ka boss khada hai. Ye sniper lo, lift se chhat pe jao aur use gira do. Kisi ko pata na chale!"', bho: '"Bazaar Road pe Shera gang ke boss thaadh ba. Ee sniper la, lift se chhat pe ja aa oke gira da!"' },
    steps: [{ type: 'gun', gun: 'sniper', ammo: 6 }, { type: 'roof', text: '🛗 Lift se Hotel ki chhat pe jao' }, { type: 'snipe', at: { x: 30, z: 151 }, text: 'Sniper (🎯 zoom) se Shera ko girao' }], reward: 800,
  },
  {
    id: 5, lv: 5, title: 'Thullon se Bacho', who: 'Inspector Pandey ka khabri', at: { x: 108, z: 132 },
    intro: { hi: '"Thane mein tumhari file khul gayi hai! 3 star wanted le ke dikhao aur phir police se bach ke nikal jao. Mohalla tumhe salaam karega."', bho: '"Thana mein tohar file khul gail ba! 3 star wanted le ke dekhaava aa phir police se bach ke nikal ja."' },
    steps: [{ type: 'wanted', n: 3, text: 'Gadbad karo — 3 ⭐ wanted lo' }, { type: 'lose', text: 'Police se bach ke nikal jao (wanted 0)' }], reward: 1000,
  },
];

export function createStory(ctx) {
  const { scene, npcs } = ctx;
  let done = ctx.load() || 0; // kitne mission poore
  let act = null; // { m, step, data }
  const hud = document.getElementById('story');
  const trig = { def: { id: 'story', name: { hi: '', bho: '' }, avatar: '🅼', color: '#ff3df0' }, x: 0, z: 0, r: 3.4, foot: true, story: true };
  let trigIn = false;

  // magenta beacon
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 40, 16, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 0.4, 2.4), transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  beacon.position.y = 20;
  const bgrp = new THREE.Group();
  bgrp.add(beacon);
  scene.add(bgrp);
  const tgtBeacon = bgrp.clone();
  tgtBeacon.children[0].material = beacon.material.clone();
  tgtBeacon.children[0].material.color.setRGB(3, 0.5, 0.4);
  scene.add(tgtBeacon);

  const next = () => STORY[done];
  function refreshTrigger() {
    const m = next();
    const show = !act && m && ctx.level() >= m.lv;
    bgrp.visible = !!show;
    if (show) {
      trig.x = m.at.x; trig.z = m.at.z;
      trig.def.name.hi = trig.def.name.bho = `Mission ${m.id}: ${m.title}`;
      bgrp.position.set(m.at.x, 0, m.at.z);
      if (!trigIn) { ctx.triggers.push(trig); trigIn = true; }
    } else if (trigIn) { ctx.triggers.splice(ctx.triggers.indexOf(trig), 1); trigIn = false; }
  }
  function setHud(text) {
    if (!text) { hud.classList.add('hidden'); return; }
    hud.classList.remove('hidden');
    hud.innerHTML = '';
    const a = document.createElement('b'); a.textContent = `🅼 ${act.m.id}. ${act.m.title}`;
    const b = document.createElement('div'); b.textContent = text;
    hud.append(a, b);
  }
  function begin() {
    const m = next();
    act = { m, step: 0, data: {} };
    refreshTrigger();
    enterStep();
  }
  function enterStep() {
    const s = act.m.steps[act.step];
    if (!s) return complete();
    act.data = {};
    tgtBeacon.visible = false;
    if (s.type === 'count') act.data.c = 0;
    if (s.type === 'gun') { ctx.giveGun(s.gun, s.ammo); act.step++; return enterStep(); }
    if (s.type === 'goto' || s.type === 'goons') { tgtBeacon.visible = true; tgtBeacon.position.set(s.at.x, 0, s.at.z); }
    if (s.type === 'targets') spawnBottles();
    if (s.type === 'roof') { tgtBeacon.visible = true; tgtBeacon.position.set(ctx.liftPos.x, 0, ctx.liftPos.z); }
    if (s.type === 'snipe') spawnBoss(s.at);
  }
  function complete() {
    const m = act.m;
    tgtBeacon.visible = false;
    act = null;
    done++;
    ctx.save(done);
    ctx.addMoney(m.reward);
    ctx.addRespect(25);
    setHud(null);
    ctx.missionPassed(m, m.reward);
    refreshTrigger();
  }
  function spawnBottles() {
    act.data.hits = 0;
    act.data.meshes = [];
    const cols = [0x2f8a3a, 0x8a5a2a, 0x2a5a8a, 0x2f8a3a, 0x9a2a2a, 0x2f8a3a];
    for (let i = 0; i < 6; i++) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.35, 10), new THREE.MeshStandardMaterial({ color: cols[i], transparent: true, opacity: 0.85, roughness: 0.1, metalness: 0.3 }));
      const pos = new THREE.Vector3(-151.4, 1.3, 128 + i * 4);
      b.position.copy(pos);
      scene.add(b);
      act.data.meshes.push(b);
      ctx.targets.push({ pos, r: 0.28, mesh: b, story: true, onHit: () => { scene.remove(b); act && act.data.hits++; ctx.sfx('glass'); } });
    }
    tgtBeacon.visible = true;
    tgtBeacon.position.set(-151, 0, 138);
  }
  function spawnBoss(at) {
    const boss = npcs.spawnThief(at.x, at.z);
    boss.type = 'boss';
    boss.heading = Math.PI / 2;
    boss.h.spec.top = 0x7a0a0a; boss.h.spec.buff = 1; boss.h.rebuild();
    setAction(boss.h, 'phone');
    act.data.boss = boss;
    act.data.guards = [-1.4, 1.4].map((dz) => { const g = npcs.spawnThief(at.x + 1.2, at.z + dz); g.type = 'boss'; g.heading = Math.PI / 2; setAction(g.h, 'idle'); return g; });
    tgtBeacon.visible = true;
    tgtBeacon.position.set(at.x, 0, at.z);
  }
  function cleanupStep() {
    if (!act) return;
    const d = act.data;
    if (d.goons) for (const g of d.goons) { g.goon = false; g.angry = 0; }
    if (d.meshes) { for (const b of d.meshes) scene.remove(b); for (let i = ctx.targets.length - 1; i >= 0; i--) if (ctx.targets[i].story) ctx.targets.splice(i, 1); }
    if (d.boss) setTimeout(() => { npcs.remove(d.boss); d.guards.forEach((g) => npcs.remove(g)); }, 8000);
  }

  function update(dt, t) {
    bgrp.rotation.y += dt;
    if (!act) { refreshTrigger(); return; }
    const s = act.m.steps[act.step];
    const p = ctx.getP();
    let ok = false, text = s.text;
    switch (s.type) {
      case 'count': text = `${s.text} (${act.data.c}/${s.n})`; ok = act.data.c >= s.n; break;
      case 'goto': ok = Math.hypot(p.pos.x - s.at.x, p.pos.z - s.at.z) < 10; break;
      case 'goons': {
        if (!act.data.goons) {
          act.data.goons = [0, 1].map((i) => {
            const h = makeHuman({ outfit: 'tshirt', top: 0x1a1a1a, bottom: 0x2a2a3a, buff: 1, stache: true, hat: i ? 'cap' : null, capColor: 0x8a0a0a });
            const n = npcs.adoptWalker(h, s.at.x + (i ? 2 : -2), s.at.z + (i ? 1 : -1), p.pos);
            n.goon = true; n.angry = 9999; n.speed = 1.6;
            ctx.bubble(h.root, i ? 'Hafta de, warna haddi tod denge!' : 'Kaun hai be tu? Hero banega?', 'loud');
            return n;
          });
        }
        const down = act.data.goons.filter((g) => g.downedOnce).length;
        for (const g of act.data.goons) if (g.fall > 0) g.downedOnce = true;
        text = `${s.text} (${down}/${s.n})`;
        ok = down >= s.n;
        break;
      }
      case 'targets': text = `${s.text} (${act.data.hits}/${s.n})`; ok = act.data.hits >= s.n; break;
      case 'roof': ok = ctx.onRoof(); break;
      case 'snipe': ok = act.data.boss && (act.data.boss.fall > 0 || act.data.boss.downed); break;
      case 'wanted': text = `${s.text} (${ctx.wanted()}/${s.n} ⭐)`; ok = ctx.wanted() >= s.n; break;
      case 'lose': ok = ctx.wanted() === 0; break;
      default: break;
    }
    setHud(text);
    if (ok) {
      cleanupStep();
      act.step++;
      ctx.toast('✅ ' + (s.text || ''), 1600);
      ctx.sfx('step');
      enterStep();
    }
  }
  return {
    update, trig,
    open() {
      const m = next();
      if (!m) return;
      ctx.dialog({
        kind: 'story', avatar: '🅼', title: `Mission ${m.id}: ${m.title}`, sub: m.who,
        line: m.intro[ctx.lang()],
        ai: { who: m.who, role: `mission dene wala (${m.who})`, situation: `player ko mission '${m.title}' de raha hai. Mission ka kaam aur inaam ₹${m.reward} same rehna chahiye.` },
        chat: { key: 'story:' + m.id, name: m.who, role: `mission dene wala (${m.who})`, info: `player ko mission '${m.title}' de raha hai: ${m.intro[ctx.lang()]} Inaam ₹${m.reward}.` },
        options: [
          { n: '▶ Mission shuru karo', cls: 'good', d: `Inaam ₹${m.reward} + Respect`, on: () => { ctx.close(); begin(); } },
          { n: '⏳ Baad mein', on: () => ctx.close() },
        ],
      });
    },
    jobDone(key) { if (act && act.m.steps[act.step]?.type === 'count' && act.m.steps[act.step].key === key) act.data.c++; },
    get active() { return act; },
    get done() { return done; },
    cancel() { if (act) { cleanupStep(); act = null; setHud(null); tgtBeacon.visible = false; ctx.toast('❌ Mission chhod diya', 1500); } },
    marker() { if (tgtBeacon.visible) return { x: tgtBeacon.position.x, z: tgtBeacon.position.z }; if (bgrp.visible) return { x: bgrp.position.x, z: bgrp.position.z, m: true }; return null; },
    total: STORY.length,
  };
}
