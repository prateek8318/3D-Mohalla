import * as THREE from 'three';
import { makeHuman, updateHuman, setAction, hold, itemMesh } from './humans.js';

const R = Math.random;
const pick = (a) => a[Math.floor(R() * a.length)];
const headingTo = (dx, dz) => Math.atan2(-dx, -dz);

const L = {
  hi: {
    paxBoard: ['Bhaiya, jaldi chalo!', 'Meter se chalna, haan!', 'Train chhoot jaayegi, tez chalao!', 'Seedha chalo, shortcut mat lena'],
    paxChat: ['Bhaiya AC nahi hai kya? 😅', 'Ye raasta lamba to nahi?', 'Aaram se bhai, dil kamzor hai!', 'Gaana tez karo! 🎶', 'Ghar pe biwi intezaar kar rahi hai…'],
    paxThanks: ['Shukriya bhaiya! Ye lo tip 🙏', 'Waah, ekdum time pe! 👌'],
    paxLate: ['Itni der? Tip bhool jao!'],
    paxFail: ['Bas bhai, main yahin utar raha hoon! 😤', 'Pairon se jaldi pahunch jaata!'],
    thanksDelivery: ['Shukriya beta! Garma garam hai 😋', 'Aa gaya parcel! Jeete raho 🙏'],
    chor: ['Chor! Chor! Mera purse! 😱', 'Pakdo use! Bachao!'],
    chorCaught: ['Maaf kar do bhai, galti ho gayi! 🙏', 'Chhod do, kabhi nahi karunga!'],
    girlThanks: ['Thank you hero! 💞', 'Tum to sach mein hero nikle! 🥹'],
    baraat: '🎺 Baraat aa rahi hai! Naacho (Q) aur respect kamao 💃',
  },
  bho: {
    paxBoard: ['Bhaiya, jaldi chala!', 'Meter se chaliha, haan!', 'Train chhoot jaai, tej chalaava!', 'Seedha chala, shortcut mat lih'],
    paxChat: ['Bhaiya AC naikhe ka? 😅', 'Ee raasta lamba ta naikhe?', 'Aaram se ho, karejwa kamjor ba!', 'Gaana tej kara! 🎶', 'Ghare mehraru intezaar karat baadi…'],
    paxThanks: ['Dhanyabaad bhaiya! Ee la tip 🙏', 'Waah, ekdam time pe! 👌'],
    paxLate: ['Etna der? Tip bhool ja!'],
    paxFail: ['Bas ho, ham ehije utarat bani! 😤', 'Paidal jaldi pahunch jaitin!'],
    thanksDelivery: ['Dhanyabaad babua! Garam ba 😋', 'Aa gail parcel! Jiyat raha 🙏'],
    chor: ['Chor! Chor! Hamar purse! 😱', 'Pakda oke! Bachaava!'],
    chorCaught: ['Maaf kar da bhaiya, galti ho gail! 🙏', 'Chhod da, kabahu na karab!'],
    girlThanks: ['Thank you hero! 💞', 'Tu ta sachho hero nikalla! 🥹'],
    baraat: '🎺 Baraat aawat ba! Naacha (Q) aa respect kamaa 💃',
  },
};
const L18 = {
  hi: { paxFail: ['Bhosdike, itni der? Utaar mujhe yahin!', 'Chutiye, rickshaw chala raha hai ya bailgaadi?!'], chorCaught: ['Chhod madarchod, dard ho raha hai!'] },
  bho: { paxFail: ['Bhosdiwala, etna der? Utaar hamra ke ehije!', 'Chutiya, rickshaw chalawat baade ki bailgaadi?!'], chorCaught: ['Chhod madarchod, dard hot ba!'] },
};

export function createMissions(ctx) {
  const { scene, npcs } = ctx;
  const T = () => (ctx.level() === 2 ? { ...L[ctx.lang()], ...L18[ctx.lang()] } : L[ctx.lang()]);
  let m = null;
  let respect = ctx.loadRespect();
  let nextEvent = 120 + R() * 60, nextBaraat = 200 + R() * 120;

  // ---- beacon ----
  const beacon = new THREE.Group();
  const col = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 60, 20, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.8, 0.3), transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  col.position.y = 30;
  beacon.add(col);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2, 0.12, 8, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.4, 0.4), toneMapped: false }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.15;
  beacon.add(ring);
  beacon.visible = false;
  scene.add(beacon);
  const hud = document.getElementById('mission');

  const level = () => 1 + Math.floor(Math.sqrt(respect / 15));
  function addRespect(n) {
    const before = level();
    respect += n;
    ctx.saveRespect(respect);
    if (level() > before) ctx.toast(`🏅 Respect Level ${level()}! Mohalla tumhe jaanne laga hai 😎`, 3500);
  }
  function setHud(title, obj, timer) {
    if (!title) { hud.classList.add('hidden'); return; }
    hud.classList.remove('hidden');
    hud.innerHTML = '';
    const a = document.createElement('b'); a.textContent = title;
    const b = document.createElement('div'); b.textContent = obj;
    hud.append(a, b);
    if (timer !== undefined) { const c = document.createElement('span'); c.className = 'timer' + (timer < 15 ? ' low' : ''); c.textContent = `⏱ ${Math.max(0, Math.ceil(timer))}s`; hud.append(c); }
  }
  function target(x, z) { beacon.visible = true; beacon.position.set(x, 0, z); m.tx = x; m.tz = z; }
  function done(msg) {
    beacon.visible = false;
    setHud(null);
    if (msg) ctx.toast(msg, 3200);
    m = null;
  }

  // ---------- SAWARI 🛺 ----------
  function startSawari() {
    const p = ctx.getP();
    if (p.mode !== 'drive') return ctx.toast('Pehle koi gaadi chalao — auto best hai! 🛺', 2500);
    const pt = npcs.randomSidewalk(p.pos, 50, 170);
    if (!pt) return;
    const pax = makeHuman({ female: R() < 0.4, old: R() < 0.25 });
    pax.root.position.set(pt.x, 0, pt.z);
    scene.add(pax.root);
    setAction(pax, 'wave');
    m = { type: 'sawari', stage: 'pickup', pax, pt };
    target(pt.x, pt.z);
    ctx.toast('🛺 Sawari job! Peela ➤ teer / nishaan tak gaadi le jao, paas ja ke RUKO', 3500);
  }
  // ---------- DELIVERY 📦 ----------
  function startDelivery() {
    const shop = ctx.shopPoint(pick(['mithai', 'samosa', 'chai', 'dhaba']));
    m = { type: 'delivery', stage: 'pickup', shop };
    target(shop.x, shop.z);
    ctx.toast(`📦 Delivery! Pehle ${shop.name} se parcel uthao`, 2600);
  }
  // ---------- CHOR 🏃 ----------
  function startChor() {
    const p = ctx.getP();
    const girls = npcs.girls().filter((g) => !g.girl.gf && !g.riding && !g.scene && Math.hypot(g.x - p.pos.x, g.z - p.pos.z) < 55 && Math.hypot(g.x - p.pos.x, g.z - p.pos.z) > 8);
    if (!girls.length) return false;
    const g = pick(girls);
    const th = npcs.spawnThief(g.x + 1, g.z + 0.5);
    ctx.bubble(g.h.root, pick(T().chor), 'loud');
    g.pause = 6; g.pauseAct = 'point'; g.faceTo = th;
    m = { type: 'chor', thief: th, girl: g, timer: 75 };
    ctx.sfx('alarm');
    ctx.toast('🏃 Chor! Pakdo use — ghoonsa (J) ya rickshaw se rok do!', 3000);
    return true;
  }
  // ---------- BARAAT 🎺 ----------
  let baraat = null;
  function startBaraat() {
    const p = ctx.getP();
    const dir = R() < 0.5 ? 1 : -1;
    let z0 = p.pos.z + dir * 70;
    if (z0 < -80 || z0 > 410) z0 = p.pos.z - dir * 70;
    if (z0 < -80 || z0 > 410) return false;
    const g = new THREE.Group();
    scene.add(g);
    const members = [];
    // ghodi + dulha
    const horse = new THREE.Group();
    const wh = new THREE.MeshStandardMaterial({ color: 0xf5f2ea, roughness: 0.8 });
    const bodyH = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 2.0), wh); bodyH.position.y = 1.4; horse.add(bodyH);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.0, 0.45), wh); neck.position.set(0, 2.0, -0.9); neck.rotation.x = 0.5; horse.add(neck);
    const headH = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.8), wh); headH.position.set(0, 2.45, -1.35); horse.add(headH);
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.5, 1.2), new THREE.MeshStandardMaterial({ color: 0xc2185b, emissive: 0x330010 })); cloth.position.y = 1.75; horse.add(cloth);
    const hl = [];
    for (const [x, z] of [[-0.25, -0.75], [0.25, -0.75], [-0.25, 0.75], [0.25, 0.75]]) {
      const pv = new THREE.Group(); pv.position.set(x, 0.95, z);
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.95, 0.16), wh); leg.position.y = -0.47; pv.add(leg);
      horse.add(pv); hl.push(pv);
    }
    const groom = makeHuman({ outfit: 'kurta', top: 0xfff0c8, bottom: 0xfff0c8, hat: 'pagdi', stache: true });
    groom.root.position.set(0, 1.2, 0.1);
    horse.add(groom.root);
    setAction(groom, 'sit');
    g.add(horse);
    for (let i = 0; i < 12; i++) {
      const h = makeHuman({ female: i % 3 === 0 });
      const row = Math.floor(i / 3), c = (i % 3) - 1;
      h.root.position.set(c * 1.5, 0, 3 + row * 1.6);
      if (i < 2) { const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.55, 12), new THREE.MeshStandardMaterial({ color: 0xc8402a })); drum.rotation.z = Math.PI / 2; drum.position.set(0, 0.95, -0.3); h.root.add(drum); }
      h.phase = R() * 6;
      g.add(h.root);
      setAction(h, 'dance');
      members.push(h);
    }
    // jhalar wale lamp
    const lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.2, 0.8), toneMapped: false });
    for (const x of [-3, 3]) for (let k = 0; k < 3; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), lampM); l.position.set(x, 2.4, 2 + k * 2.5); g.add(l); }
    baraat = { g, horse, hl, groom, members, z: z0, dir: -dir, x: R() < 0.5 ? -4.4 : 4.4, life: 130, beat: 0, danceT: 0, given: 0 };
    g.rotation.y = baraat.dir > 0 ? Math.PI : 0;
    ctx.toast(T().baraat, 3500);
    return true;
  }
  function updateBaraat(dt, t) {
    const b = baraat;
    if (!b) return;
    b.life -= dt;
    b.z += b.dir * 1.0 * dt;
    b.g.position.set(b.x, 0, b.z);
    b.hl.forEach((l, i) => { l.rotation.x = Math.sin(t * 5 + i * 1.6) * 0.35; });
    for (const h of b.members) updateHuman(h, dt, t);
    updateHuman(b.groom, dt, t);
    const p = ctx.getP();
    const d = Math.hypot(p.pos.x - b.x, p.pos.z - b.z);
    if (d < 60) {
      b.beat -= dt;
      if (b.beat <= 0) { b.beat = 0.26; ctx.sfx('dhol', (Math.floor(t / 0.26) % 4)); }
    }
    if (d < 12 && ctx.isDancing()) {
      b.danceT += dt;
      if (b.danceT > 2 && b.given < 10) { b.danceT = 0; b.given++; addRespect(1); if (b.given === 1) ctx.toast('💃 Baraat mein naach rahe ho! Respect ⬆️', 2000); }
    }
    if (b.life <= 0 || b.z < -110 || b.z > 425) { scene.remove(b.g); baraat = null; }
  }

  // ---------- UPDATE ----------
  function update(dt, t) {
    beacon.rotation.y += dt;
    ring.scale.setScalar(1 + Math.sin(t * 4) * 0.12);
    updateBaraat(dt, t);
    const p = ctx.getP();
    if (!m) {
      setHud(null);
      if (ctx.busy()) return;
      nextEvent -= dt; nextBaraat -= dt;
      if (nextEvent <= 0) { nextEvent = 150 + R() * 90; startChor(); }
      if (nextBaraat <= 0 && !baraat) { nextBaraat = 260 + R() * 160; startBaraat(); }
      return;
    }
    const tt = T();
    if (m.type === 'sawari') {
      const veh = ctx.getVeh();
      if (m.stage === 'pickup') {
        updateHuman(m.pax, dt, t);
        const d = Math.hypot(p.pos.x - m.pt.x, p.pos.z - m.pt.z);
        m.pax.root.rotation.y = headingTo(p.pos.x - m.pt.x, p.pos.z - m.pt.z);
        setHud('🛺 Sawari', p.mode !== 'drive' ? `F se gaadi mein baitho, phir sawari tak chalao • ${Math.round(d)}m` : d < 10 ? `Sawari ke paas RUK jao (speed kam) — khud baith jaayegi` : `🟡 Peele nishaan par sawari khadi hai • ${Math.round(d)}m`);
        if (p.mode === 'drive' && d < 6.5 && Math.abs(p.speed) < 1.6) {
          veh.g.add(m.pax.root);
          m.pax.root.position.copy(veh.passenger);
          m.pax.root.rotation.set(0, 0, 0);
          setAction(m.pax, 'sit');
          const dests = ctx.destinations().filter((q) => Math.hypot(q.x - m.pt.x, q.z - m.pt.z) > 90);
          m.dest = pick(dests);
          m.dist = Math.hypot(m.dest.x - m.pt.x, m.dest.z - m.pt.z);
          m.total = m.timer = m.dist / 7.5 + 25;
          m.stage = 'drive';
          m.chat = 6;
          m.veh = veh;
          target(m.dest.x, m.dest.z);
          ctx.bubble(veh.g, pick(tt.paxBoard));
        }
      } else {
        updateHuman(m.pax, dt, t);
        m.timer -= dt;
        m.chat -= dt;
        const d = Math.hypot(p.pos.x - m.dest.x, p.pos.z - m.dest.z);
        setHud('🛺 Sawari', `🟡 ${m.dest.name} chhodo (time se = tip) • ${Math.round(d)}m`, m.timer);
        if (m.chat <= 0) { m.chat = 10 + R() * 8; ctx.bubble(m.veh.g, pick(tt.paxChat)); }
        const quit = p.mode !== 'drive' || ctx.getVeh() !== m.veh || m.timer <= -10;
        if (d < 8 && Math.abs(p.speed) < 1.6 && !quit) {
          const fast = m.timer > m.total * 0.3;
          const pay = Math.round(30 + m.dist * 0.55 + (fast ? 35 : 0));
          dropPax(fast ? pick(tt.paxThanks) : pick(tt.paxLate));
          ctx.addMoney(pay);
          ctx.sfx('coin');
          addRespect(fast ? 12 : 6);
          ctx.jobDone?.('sawari');
          done(`💰 Kiraya mila ₹${pay}${fast ? ' (tip ke saath!)' : ''} — 💼 se agli sawari`);
        } else if (quit) {
          dropPax(pick(tt.paxFail));
          done('😤 Sawari naraz ho ke utar gayi');
        }
      }
    } else if (m.type === 'delivery') {
      const d = Math.hypot(p.pos.x - m.tx, p.pos.z - m.tz);
      const near = d < (p.mode === 'drive' ? 7 : 3);
      if (m.stage === 'pickup') {
        setHud('📦 Delivery', `🟡 ${m.shop.name} ja ke parcel uthao • ${Math.round(d)}m`);
        if (near) {
          const bs = ctx.dropPoints().filter((q) => Math.hypot(q.x - p.pos.x, q.z - p.pos.z) > 70);
          m.drop = pick(bs.length ? bs : ctx.dropPoints());
          m.dist = Math.hypot(m.drop.x - p.pos.x, m.drop.z - p.pos.z);
          m.total = m.timer = m.dist / 6 + 30;
          m.stage = 'drop';
          if (p.mode === 'foot') ctx.holdItem('gift');
          target(m.drop.x, m.drop.z);
          ctx.toast('📦 Parcel mil gaya! Ghar tak pahunchao', 2200);
        }
      } else {
        m.timer -= dt;
        setHud('📦 Delivery', `🟡 Parcel ghar tak pahunchao • ${Math.round(d)}m`, m.timer);
        if (near) {
          const fast = m.timer > 0;
          const pay = fast ? Math.round(60 + m.dist * 0.4) : 30;
          ctx.bubble({ x: m.drop.bx, y: m.drop.by, z: m.drop.bz }, pick(tt.thanksDelivery));
          ctx.holdItem(null);
          ctx.addMoney(pay);
          ctx.sfx('coin');
          addRespect(fast ? 10 : 3);
          ctx.jobDone?.('delivery');
          done(`💰 Delivery ke ₹${pay} mile!${fast ? '' : ' (late ho gaye 😅)'}`);
        } else if (m.timer < -20) { ctx.holdItem(null); done('⌛ Delivery cancel — bahut late!'); }
      }
    } else if (m.type === 'chor') {
      const th = m.thief;
      m.timer -= dt;
      const d = Math.hypot(p.pos.x - th.x, p.pos.z - th.z);
      if (!m.caught) {
        target(th.x, th.z);
        setHud('🏃 Chor pakdo!', `🔴 Chor ke paas jao, J/👊 se maaro ya rickshaw se roko • ${Math.round(d)}m`, m.timer);
        if (th.fall > 0 || (p.mode === 'foot' && d < 1.3)) {
          m.caught = 3.5;
          if (!(th.fall > 0)) { th.fall = 4; setAction(th.h, 'fall'); }
          ctx.bubble(th.h.root, pick(tt.chorCaught));
          setTimeout(() => ctx.bubble(m?.girl?.h?.root || th.h.root, pick(tt.girlThanks), 'love'), 1200);
          m.girl.girl.affinity += 0.3;
          ctx.addMoney(150);
          ctx.sfx('coin');
          addRespect(15);
          ctx.jobDone?.('chor');
          ctx.toast('👮 Chor pakda gaya! Inaam ₹150 + respect ⬆️', 3000);
          beacon.visible = false;
        } else if (m.timer <= 0 || d > 170) {
          npcs.remove(th);
          done('😤 Chor bhaag gaya…');
        }
      } else {
        m.caught -= dt;
        setHud(null);
        if (m.caught <= 0) { npcs.remove(th); done(null); }
      }
    }
  }
  function dropPax(line) {
    const veh = m.veh || ctx.getVeh();
    const wp = new THREE.Vector3();
    m.pax.root.getWorldPosition(wp);
    m.pax.root.parent?.remove(m.pax.root);
    const sx = veh.pos.x + Math.cos(veh.heading) * 1.8, sz = veh.pos.z - Math.sin(veh.heading) * 1.8;
    const n = npcs.adoptWalker(m.pax, sx, sz, veh.pos);
    n.angryPending = false;
    ctx.bubble(m.pax.root, line);
  }

  return {
    update,
    jobs: () => [
      { id: 'sawari', n: '🛺 Sawari uthao (taxi)', d: 'Gaadi mein sawari ko manzil tak chhodo • ₹40–185' },
      { id: 'delivery', n: '📦 Delivery karo', d: 'Dukaan se parcel → ghar pahunchao • ₹60–120' },
      { id: 'chor', n: '🏃 Chor pakdo', d: 'Bhaagte chor ko maar ke roko • ₹150' },
      { id: 'baraat', n: '🎺 Baraat bulao', d: 'Dhol-ghodi; paas ja ke Q se naacho' },
    ],
    start(id) {
      if (m) { if (m.type === 'sawari' && m.pax && m.stage === 'pickup') scene.remove(m.pax.root); if (m.type === 'chor') npcs.remove(m.thief); done(null); }
      if (id === 'sawari') startSawari();
      else if (id === 'delivery') startDelivery();
      else if (id === 'chor') { if (!startChor()) ctx.toast('Abhi koi chor nahi dikha… thodi der baad 😅', 2200); }
      else if (id === 'baraat') { if (baraat || !startBaraat()) ctx.toast('Baraat abhi aa nahi sakti 😅', 2000); }
    },
    get active() { return m; },
    marker() { return m && beacon.visible ? { x: beacon.position.x, z: beacon.position.z } : null; },
    peds() { return baraat ? [{ x: baraat.x, z: baraat.z }, { x: baraat.x, z: baraat.z - baraat.dir * 4 }] : []; },
    level, respect: () => respect, addRespect,
  };
}
