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

const EX = {
  hi: {
    rushBoard: ['Bhaiya train chhoot rahi hai!! UDAA DO! 🚂💨', 'Hospital chalo! Jaldi!! 😱', 'Exam hai 10 min mein! Bhagao!!'],
    rushChat: ['Aur tez! AUR TEZ!! 😫', 'Ghadi dekho bhaiya, ghadi!!', 'Bhagao bhagao bhagao!! 🔥'],
    vipBoard: ['Dhyaan se chalana, hum Netaji hain 🎩', 'Ek bhi takkar lagi to paisa katega! 😤'],
    vipChat: ['Humara vote pakka samjho… agar time pe pahunchaya 😏', 'Is sadak ka udghatan humne hi kiya tha!'],
    vipCrash: ['Arre! Gaadi chala rahe ho ya tank?! 😡', 'Ye kya tamasha hai! Paisa katega!', 'Humara kurta kharab ho gaya! 😤'],
    scared: ['Arre baap re!! Dhyaan se!! 😱', 'Bhaiya! Kisi ko maar doge! 😨'],
    hail: ['Bhaiya! Auto! 🙋', 'O auto wale! Ruko!', 'Khaali ho? 🙋‍♂️'],
  },
  bho: {
    rushBoard: ['Bhaiya train chhoot jaai!! UDAA DA! 🚂💨', 'Aspatal chala! Jaldi!! 😱', 'Exam ba 10 minat mein! Bhagaava!!'],
    rushChat: ['Aur tej! AUR TEJ!! 😫', 'Ghadi dekha bhaiya, ghadi!!', 'Bhagaava bhagaava!! 🔥'],
    vipBoard: ['Dhyaan se chalaiha, ham Netaji hayin 🎩', 'Ek go takkar lagal ta paisa katai! 😤'],
    vipChat: ['Hamar vote pakka samjha… agar time pe pahunchaiba 😏', 'Ee sadak ke udghatan hamhi kaile rahin!'],
    vipCrash: ['Arre! Gaadi chalawat baada ki tank?! 😡', 'Ee ka tamasha ba! Paisa katai!', 'Hamar kurta kharab ho gail! 😤'],
    scared: ['Arre baap re!! Dhyaan se!! 😱', 'Bhaiya! Kehu ke maar deba! 😨'],
    hail: ['Bhaiya! Auto! 🙋', 'Ae auto wala! Ruka!', 'Khaali baada? 🙋‍♂️'],
  },
};
const KIND = {
  normal: { title: '🛺 Sawari', tag: '🙋 SAWARI', tMul: 1, payMul: 1 },
  rush: { title: '🚨 EMERGENCY Sawari', tag: '🚨 EMERGENCY', tMul: 0.55, payMul: 2.2, hard: true },
  vip: { title: '🎩 Netaji VIP', tag: '🎩 NETAJI', tMul: 1.15, payMul: 2.8, maxCrash: 3 },
  patient: { title: '🚑 Ambulance — Mareez bachao', tag: '🤕 MAREEZ', tMul: 1, payMul: 2.4, hard: true },
};
// gaadi ke hisaab se kaam 💪
const VEH_TXT = {
  hi: {
    patientHail: ['Aaah… koi bachao… 🤕', 'Ambulance! Idhar! Saans nahi aa rahi!', 'Mera pair… 😣'],
    patientChat: ['Jaldi bhaiya… dard ho raha hai 😣', 'Hospital kitni door hai? 🤕', 'Bas thoda aur… himmat rakho 💪'],
    patientThanks: ['Doctor sahab ne kaha — time pe laaye, jaan bach gayi! 🙏', 'Bhagwan tumhara bhala kare! 🙏'],
    mafiaCall: ['📞 Boss: "Meri gaadi utha li? Himmat hai teri 😏 Theek hai — kaam kar, gaadi teri!"', '📞 Boss: "Gaadi rakh le… par rival gang ka dada aaj khatam hona chahiye 🔫"'],
    goonLine: ['Kaun hai be? Bhai ko haath lagaya to…!', 'Pakdo isko! 😡', 'Tu jaanta nahi main kaun hoon!'],
    raceStart: ['🏁 Street race! Checkpoint se checkpoint — time pe pahuncho!', '🏎️ Shehar ke lafange race lagaa rahe hain — dikha do kaun asli driver hai!'],
  },
  bho: {
    patientHail: ['Aaah… kehu bachaava… 🤕', 'Ambulance! Ehar! Saans naikhe aawat!', 'Hamar goda… 😣'],
    patientChat: ['Jaldi bhaiya… dard hot ba 😣', 'Aspatal ketna door ba? 🤕', 'Bas thoda aur… himmat rakha 💪'],
    patientThanks: ['Doctor sahab kahlan — time pe le aaila, jaan bach gail! 🙏', 'Bhagwan tohar bhala kare! 🙏'],
    mafiaCall: ['📞 Boss: "Hamar gaadi utha lihla? Himmat ba tohra mein 😏 Theek ba — kaam kara, gaadi tohar!"', '📞 Boss: "Gaadi rakh la… baaki rival gang ke dada aaj khatam hoye ke chaahi 🔫"'],
    goonLine: ['Ke ha be? Bhai ke haath lagaile ta…!', 'Pakda ehke! 😡', 'Tu jaanat naikhe ham ke hayin!'],
    raceStart: ['🏁 Street race! Checkpoint se checkpoint — time pe pahuncha!', '🏎️ Shahar ke lafanga race lagawat baade — dekha da asli driver ke ba!'],
  },
};

export function createMissions(ctx) {
  const { scene, npcs } = ctx;
  const T = () => (ctx.level() === 2 ? { ...L[ctx.lang()], ...L18[ctx.lang()] } : L[ctx.lang()]);
  let m = null;
  let respect = ctx.loadRespect();
  let nextEvent = 120 + R() * 60, nextBaraat = 200 + R() * 120;
  let hailT = 10, streak = 0;
  const E = () => EX[ctx.lang()];
  const streakMul = () => 1 + Math.min(streak, 4) * 0.25;

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
  // ---- upar bada teer: kidhar jaana hai ➤ ----
  const arrow = document.createElement('div');
  arrow.className = 'navArrow hidden';
  arrow.innerHTML = '<svg viewBox="0 0 64 64"><path d="M32 4 L58 54 L32 41 L6 54 Z" fill="#ffd23f" stroke="#1a1020" stroke-width="3" stroke-linejoin="round"/></svg><div class="dist"></div>';
  document.body.appendChild(arrow);
  const arrowSvg = arrow.firstChild, arrowDist = arrow.lastChild;
  const camF = new THREE.Vector3();
  function updateArrow() {
    const p = ctx.getP();
    if (!m || !beacon.visible || ctx.uiBusy() || !ctx.camera) { arrow.classList.add('hidden'); return; }
    arrow.classList.remove('hidden');
    ctx.camera.getWorldDirection(camF);
    const fl = Math.hypot(camF.x, camF.z) || 1, fx = camF.x / fl, fz = camF.z / fl;
    const dx = beacon.position.x - p.pos.x, dz = beacon.position.z - p.pos.z;
    const ang = Math.atan2(dx * -fz + dz * fx, dx * fx + dz * fz);
    arrowSvg.style.transform = `rotate(${(ang * 180) / Math.PI}deg)`;
    arrowDist.textContent = `${Math.round(Math.hypot(dx, dz))}m`;
  }

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
    const a = document.createElement('b'); a.textContent = title + (streak >= 2 ? `  🔥 Streak x${streak}` : '');
    const b = document.createElement('div'); b.textContent = obj;
    hud.append(a, b);
    if (timer !== undefined) { const c = document.createElement('span'); c.className = 'timer' + (timer < 15 ? ' low' : ''); c.textContent = `⏱ ${Math.max(0, Math.ceil(timer))}s`; hud.append(c); }
  }
  function target(x, z) { beacon.visible = true; beacon.position.set(x, 0, z); m.tx = x; m.tz = z; }
  function done(msg) {
    beacon.visible = false;
    arrow.classList.add('hidden');
    setHud(null);
    if (msg) ctx.toast(msg, 3200);
    m = null;
  }

  // ---------- SAWARI 🛺 ----------
  const V = () => VEH_TXT[ctx.lang()];
  // mareez zameen pe leta hua 🤕
  function layDown(h, x, z) { h.root.position.set(x, 0.12, z); h.root.rotation.set(-Math.PI / 2, 0, 0); setAction(h, 'fall'); }
  function spawnPax(kind) {
    if (kind === 'vip') return makeHuman({ outfit: 'kurta', top: 0xffffff, bottom: 0xffffff, hat: 'topi', stache: true, buff: 1 });
    if (kind === 'patient') return makeHuman({ female: R() < 0.4, old: R() < 0.4 });
    return makeHuman({ female: R() < 0.4, old: kind !== 'rush' && R() < 0.25 });
  }
  // gaadi ke aage wali footpath pe jagah dhundo
  function aheadPoint(p, minD, maxD) {
    const fx = -Math.sin(p.heading), fz = -Math.cos(p.heading);
    let best = null, bs = -Infinity;
    for (let k = 0; k < 25; k++) {
      const q = npcs.randomSidewalk(p.pos, minD, maxD);
      if (!q) continue;
      const dx = q.x - p.pos.x, dz = q.z - p.pos.z, d = Math.hypot(dx, dz);
      const sc = (dx * fx + dz * fz) / d - d / 400;
      if (sc > bs) { bs = sc; best = q; }
    }
    return best;
  }
  function startSawari(kind = 'normal', offered = false) {
    const p = ctx.getP();
    if (p.mode !== 'drive') { ctx.toast('Pehle apni 🛺 mein baitho (F) — tab sawari milegi!', 2600); return false; }
    const pt = offered ? aheadPoint(p, 35, 95) : aheadPoint(p, 45, 150);
    if (!pt) return false;
    const pax = spawnPax(kind);
    pax.root.position.set(pt.x, 0, pt.z);
    scene.add(pax.root);
    if (kind === 'patient') layDown(pax, pt.x, pt.z); else setAction(pax, 'wave');
    m = { type: 'sawari', kind, K: KIND[kind], stage: 'pickup', pax, pt, offered, life: offered ? (kind === 'patient' ? 70 : 50) : Infinity, crashes: 0, hits: 0, hailT: 0 };
    target(pt.x, pt.z);
    ctx.sfx('alarm');
    if (kind === 'patient') ctx.toast(`🚑 Emergency call! Ek mareez sadak kinare pada hai — teer follow karo, paas jaa ke RUKO, phir 🏥 Hospital`, 3800);
    else if (offered) ctx.toast(`${KIND[kind].tag} haath de rahi hai! 🟡 Upar ka teer follow karo, paas jaa ke RUKO`, 3400);
    else ctx.toast(`${KIND[kind].title}! 🟡 Upar ka teer follow karo → sawari ke paas jaa ke RUKO`, 3600);
    return true;
  }
  function boardPax(veh) {
    const tt = T(), ex = E();
    veh.g.add(m.pax.root);
    m.pax.root.position.copy(veh.passenger);
    m.pax.root.rotation.set(0, 0, 0);
    setAction(m.pax, 'sit');
    if (m.kind === 'patient') {
      m.dest = ctx.hospital();
      m.dist = Math.hypot(m.dest.x - m.pt.x, m.dest.z - m.pt.z);
      m.total = m.timer = m.dist / 9 + 20;
    } else {
      const all = ctx.destinations();
      let dests = all.filter((q) => Math.hypot(q.x - m.pt.x, q.z - m.pt.z) > (m.kind === 'rush' ? 70 : 90));
      if (!dests.length) dests = all;
      m.dest = pick(dests);
      m.dist = Math.hypot(m.dest.x - m.pt.x, m.dest.z - m.pt.z);
      m.total = m.timer = m.kind === 'rush' ? m.dist / 10 + 14 : (m.dist / 7.5 + 25) * m.K.tMul;
    }
    m.stage = 'drive';
    m.chat = 6;
    m.veh = veh;
    target(m.dest.x, m.dest.z);
    const boardLine = m.kind === 'patient' ? pick(V().patientChat) : pick(m.kind === 'rush' ? ex.rushBoard : m.kind === 'vip' ? ex.vipBoard : tt.paxBoard);
    ctx.bubble(veh.g, boardLine, m.kind === 'rush' || m.kind === 'patient' ? 'loud' : '');
    ctx.sfx('coin');
    if (m.kind === 'patient') ctx.toast(`🚑 Mareez stretcher pe! 🏥 ${m.dest.name} — jaldi, time kam hai!`, 3400);
    else ctx.toast(`✅ Sawari baith gayi! 🏁 Manzil: ${m.dest.name} — teer follow karo${m.kind === 'vip' ? ' • TAKKAR MAT MAARNA!' : ''}`, 3400);
  }
  // ---------- DELIVERY 📦 ----------
  function startDelivery(count = 1) {
    const shop = ctx.shopPoint(pick(['mithai', 'samosa', 'chai', 'dhaba']));
    m = { type: 'delivery', stage: 'pickup', shop, count, left: count, earned: 0 };
    target(shop.x, shop.z);
    ctx.toast(count > 1 ? `📦×${count} Bulk delivery! Pehle ${shop.name} se parcel uthao — ek ke baad ek ${count} ghar` : `📦 Delivery! Pehle ${shop.name} se parcel uthao`, 3000);
  }
  function nextDrop(p) {
    const bs = ctx.dropPoints().filter((q) => Math.hypot(q.x - p.pos.x, q.z - p.pos.z) > (m.count > 1 ? 45 : 70));
    m.drop = pick(bs.length ? bs : ctx.dropPoints());
    m.dist = Math.hypot(m.drop.x - p.pos.x, m.drop.z - p.pos.z);
    const add = m.dist / 6 + (m.count > 1 ? 18 : 30);
    m.timer = (m.timer > 0 ? m.timer : 0) + add;
    m.total = m.timer;
    target(m.drop.x, m.drop.z);
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
  // ---------- 🖤 MAFIA HIT — rival gang ke dada ko khatam karo ----------
  function startHit(offered = false) {
    const p = ctx.getP();
    const pt = aheadPoint(p, 60, 160);
    if (!pt) return false;
    const mk = (boss) => boss
      ? makeHuman({ outfit: 'shirt', top: 0xf4f4f4, bottom: 0xf4f4f4, shades: true, stache: true, beard: true, buff: 1 })
      : makeHuman({ outfit: 'tshirt', top: 0x1a1a1a, bottom: 0x2a2a3a, buff: 1, stache: true, hat: R() < 0.5 ? 'cap' : null, capColor: 0x8a0a0a, shades: R() < 0.5 });
    const gang = [[0, 0, true], [1.6, 1.1, false], [-1.6, 1.1, false]].map(([dx, dz, boss]) => {
      const n = npcs.adoptWalker(mk(boss), pt.x + dx, pt.z + dz, p.pos);
      n.goon = true; n.boss = boss; n.speed = 1.6; n.canDance = false; n.smoker = false;
      n.pause = 1e6; n.pauseAct = boss ? 'phone' : 'idle'; n.faceTo = null; n.angry = 0; n.angryPending = false;
      n.need = boss ? 2 : 1; n.downs = 0; n.wasDown = false;
      return n;
    });
    m = { type: 'hit', gang, pt, timer: 150, total: 150, offered, life: offered ? 60 : Infinity, alerted: false };
    target(pt.x, pt.z);
    ctx.sfx('alarm');
    ctx.toast(`${pick(V().mafiaCall)}\n🔴 Teer follow karo — 👔 safed kapde wala DADA (2 baar giraana hai) + 2 gunde`, 4600);
    return true;
  }
  function endHit() {
    for (const n of m.gang) { n.goon = false; n.angry = 0; n.pause = 0; }
    const g = m.gang;
    setTimeout(() => g.forEach((n) => npcs.remove(n)), 9000);
  }
  // ---------- 🏎️ STREET RACE — checkpoint pe checkpoint ----------
  function startRace(offered = false) {
    const p = ctx.getP();
    if (p.mode !== 'drive') { ctx.toast('Race ke liye gaadi chahiye 🏎️', 2200); return false; }
    const all = ctx.destinations();
    const cps = [];
    let from = { x: p.pos.x, z: p.pos.z };
    for (let k = 0; k < 4; k++) {
      const c = all.filter((q) => { const d = Math.hypot(q.x - from.x, q.z - from.z); return d > 60 && d < 260 && !cps.includes(q); });
      const q = pick(c.length ? c : all.filter((x) => !cps.includes(x)));
      cps.push(q); from = q;
    }
    m = { type: 'race', cps, i: 0, timer: 0, total: 0, from: { x: p.pos.x, z: p.pos.z }, offered, life: offered ? 45 : Infinity, started: false };
    raceLeg();
    ctx.sfx('alarm');
    ctx.toast(`${pick(V().raceStart)} • ${cps.length} checkpoint`, 3600);
    return true;
  }
  function raceLeg() {
    const q = m.cps[m.i];
    const prev = m.i ? m.cps[m.i - 1] : m.from;
    const add = Math.hypot(q.x - prev.x, q.z - prev.z) / 13 + 8;
    m.timer = Math.max(0, m.timer) + add;
    m.total = m.timer;
    target(q.x, q.z);
  }
  // gaadi ke hisaab se kaam — chori ki gaadi / sadak pe chalate hue
  function jobFor(kind, offered) {
    if (kind === 'ambulance') return startSawari('patient', offered);
    if (kind === 'mafia') return startHit(offered);
    if (kind === 'sports') return startRace(offered);
    if (kind === 'scooter' && R() < 0.5) { startDelivery(1); return true; }
    const r = R(), lv = level();
    return startSawari(lv >= 2 && r < 0.15 ? 'vip' : r < 0.35 ? 'rush' : 'normal', offered);
  }
  function cancel() {
    if (!m) return;
    if (m.type === 'sawari' && m.pax) m.pax.root.parent?.remove(m.pax.root);
    if (m.type === 'delivery') ctx.holdItem(null);
    if (m.type === 'chor') npcs.remove(m.thief);
    if (m.type === 'hit') endHit();
    done(null);
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
      arrow.classList.add('hidden');
      if (ctx.uiBusy()) return;
      // BUG FIX: story mission chal raha ho tab bhi sadak pe sawari haath de (story khud "3 sawari" maangta hai!)
      if (!ctx.busy()) {
        nextEvent -= dt; nextBaraat -= dt;
        if (nextEvent <= 0) { nextEvent = 150 + R() * 90; startChor(); }
        if (nextBaraat <= 0 && !baraat) { nextBaraat = 260 + R() * 160; startBaraat(); }
      }
      // sadak kinare log haath dete hain 🙋 — khud se kaam milta rahe
      if (!m && p.mode === 'drive') {
        hailT -= dt;
        if (hailT <= 0) {
          // 🚑 ambulance → mareez, 🖤 mafia → hit, 🏎️ sports → race, 🛵 scooter → delivery/sawari, baaki → sawari
          const kind = ctx.getVeh()?.kind;
          hailT = (kind === 'mafia' || kind === 'sports' ? 18 : 10) + R() * 10;
          if (!jobFor(kind, true)) hailT = 3;
        }
      }
      return;
    }
    updateArrow();
    const tt = T(), ex = E();
    if (m.type === 'sawari') {
      const veh = ctx.getVeh();
      const K = m.K;
      if (m.stage === 'pickup') {
        updateHuman(m.pax, dt, t);
        const d = Math.hypot(p.pos.x - m.pt.x, p.pos.z - m.pt.z);
        const patient = m.kind === 'patient';
        if (!patient) m.pax.root.rotation.y = headingTo(p.pos.x - m.pt.x, p.pos.z - m.pt.z);
        if (m.offered) {
          m.life -= dt;
          if (m.life <= 0 || d > 180) { scene.remove(m.pax.root); done(null); return; }
        }
        m.hailT -= dt;
        if (d < 35 && m.hailT <= 0) { m.hailT = 5; ctx.bubble(m.pax.root, pick(patient ? V().patientHail : ex.hail), patient ? 'loud' : ''); if (!patient) setAction(m.pax, 'wave'); }
        // 🚑 mareez chal nahi sakta — paas ruko to seedha stretcher pe
        if (patient) {
          setHud(K.title + (m.offered ? ' (optional)' : ''), p.mode !== 'drive' ? `Gaadi mein baitho • ${Math.round(d)}m` : d < 14 ? '🛑 RUKO (S) — mareez ko stretcher pe uthao' : `🟡 Teer follow karo → 🤕 mareez pada hai • ${Math.round(d)}m`);
          if (p.mode === 'drive' && d < 9 && Math.abs(p.speed) < 2) boardPax(veh);
          return;
        }
        setHud(K.title + (m.offered ? ' (optional)' : ''), p.mode !== 'drive' ? `F se gaadi mein baitho, phir sawari tak chalao • ${Math.round(d)}m` : d < 14 ? `🛑 RUK JAO (S dabao) — sawari khud aa ke baithegi` : `🟡 Teer follow karo → ${K.tag} khadi hai • ${Math.round(d)}m`);
        if (p.mode === 'drive' && d < 8 && Math.abs(p.speed) < 2) { m.stage = 'board'; m.board = 0; m.veh = veh; setAction(m.pax, 'walk'); }
      } else if (m.stage === 'board') {
        // sawari chal ke gaadi tak aati hai
        const v = m.veh, r = m.pax.root.position;
        const sx = v.pos.x + Math.cos(v.heading) * 1.7 + Math.sin(v.heading) * 0.6, sz = v.pos.z - Math.sin(v.heading) * 1.7 + Math.cos(v.heading) * 0.6;
        const dx = sx - r.x, dz = sz - r.z, dd = Math.hypot(dx, dz);
        m.board += dt;
        if (dd > 0.3) { const st = Math.min(dd, 3.4 * dt); r.x += (dx / dd) * st; r.z += (dz / dd) * st; m.pax.root.rotation.y = headingTo(dx, dz); setAction(m.pax, m.kind === 'rush' ? 'run' : 'walk'); m.pax.speed = 1.6; }
        updateHuman(m.pax, dt, t);
        setHud(K.title, '🙋 Sawari aa rahi hai… RUKE RAHO!');
        if (Math.abs(p.speed) > 2.5 || p.mode !== 'drive' || ctx.getVeh() !== v) {
          m.stage = 'pickup'; m.pt = { x: r.x, z: r.z }; target(r.x, r.z); setAction(m.pax, 'wave');
          ctx.toast('Arre ruko! Sawari baithi bhi nahi 😅', 1800);
        } else if (dd <= 0.3 || m.board > 4) boardPax(v);
      } else {
        updateHuman(m.pax, dt, t);
        m.timer -= dt;
        m.chat -= dt;
        const d = Math.hypot(p.pos.x - m.dest.x, p.pos.z - m.dest.z);
        const crashTxt = K.maxCrash ? ` • 💥 ${m.crashes}/${K.maxCrash}` : '';
        setHud(K.title, d < 16 ? `🛑 ${m.dest.name} aa gaya — RUKO, sawari utaro!${crashTxt}` : `🏁 ${m.dest.name} pe chhodo • ${Math.round(d)}m${crashTxt}`, m.timer);
        if (m.chat <= 0) {
          m.chat = m.kind === 'rush' ? 4 + R() * 3 : 10 + R() * 8;
          ctx.bubble(m.veh.g, pick(m.kind === 'patient' ? V().patientChat : m.kind === 'rush' ? ex.rushChat : m.kind === 'vip' ? ex.vipChat : tt.paxChat), m.kind === 'rush' ? 'loud' : '');
        }
        const crashedOut = K.maxCrash && m.crashes >= K.maxCrash;
        const quit = p.mode !== 'drive' || ctx.getVeh() !== m.veh || (K.hard ? m.timer <= 0 : m.timer <= -10) || crashedOut;
        if (d < 9 && Math.abs(p.speed) < 2 && !quit) {
          const fast = K.hard ? true : m.timer > m.total * 0.3;
          streak++;
          const base = 30 + m.dist * 0.55 + (fast ? 35 : 0);
          const fine = m.crashes * 50 + m.hits * 40;
          const pay = Math.max(10, Math.round(base * K.payMul * streakMul() - fine));
          dropPax(m.kind === 'patient' ? pick(V().patientThanks) : fast ? pick(tt.paxThanks) : pick(tt.paxLate));
          ctx.addMoney(pay);
          ctx.sfx('coin');
          addRespect(Math.round((fast ? 12 : 6) * (K.payMul > 1 ? 1.6 : 1)));
          ctx.jobDone?.('sawari');
          ctx.passed?.(`${K.title} ✔`, `₹${pay}${streak >= 2 ? ` • 🔥 Streak x${streak}` : ''}${fine ? ` • -₹${fine} jurmana` : ''}`);
          done(`💰 Kiraya mila ₹${pay}${fast ? ' (tip ke saath!)' : ''}${streak >= 2 ? ` 🔥 x${streak} streak bonus` : ''} — agli sawari sadak pe haath degi 🙋`);
          hailT = 6 + R() * 6;
        } else if (quit) {
          streak = 0;
          dropPax(pick(tt.paxFail));
          done(m.kind === 'patient' ? '💔 Mareez time pe hospital nahi pahuncha… (streak toot gaya)' : crashedOut ? '😡 Netaji naraz — itni takkar! Sawari utar gayi, paisa nahi mila' : K.hard && m.timer <= 0 ? '⌛ Time khatam! Emergency sawari chali gayi 😤 (streak toot gaya)' : '😤 Sawari naraz ho ke utar gayi (streak toot gaya)');
        }
      }
    } else if (m.type === 'delivery') {
      const d = Math.hypot(p.pos.x - m.tx, p.pos.z - m.tz);
      const near = d < (p.mode === 'drive' ? 7 : 3);
      const title = m.count > 1 ? `📦 Bulk Delivery (${m.count - m.left}/${m.count})` : '📦 Delivery';
      if (m.stage === 'pickup') {
        setHud(title, `🟡 ${m.shop.name} ja ke parcel uthao • ${Math.round(d)}m`);
        if (near) {
          m.timer = 0;
          nextDrop(p);
          m.stage = 'drop';
          ctx.holdItem('gift');
          ctx.sfx('coin');
          ctx.toast(m.count > 1 ? `📦 ${m.count} parcel mil gaye! Pehla ghar — teer follow karo` : '📦 Parcel mil gaya! Ghar tak pahunchao — teer follow karo', 2400);
        }
      } else {
        m.timer -= dt;
        setHud(title, `🏠 Parcel ghar tak pahunchao • ${Math.round(d)}m`, m.timer);
        if (near) {
          const fast = m.timer > 0;
          const pay = Math.round((fast ? 60 + m.dist * 0.4 : 30) * (m.count > 1 ? 1.3 : 1));
          m.earned += pay;
          m.left--;
          ctx.bubble({ x: m.drop.bx, y: m.drop.by, z: m.drop.bz }, pick(tt.thanksDelivery));
          ctx.addMoney(pay);
          ctx.sfx('coin');
          addRespect(fast ? 10 : 3);
          if (m.left > 0 && fast) {
            nextDrop(p);
            ctx.toast(`✅ ₹${pay}! Agla ghar (${m.left} baaki) — ⏱ +time mila`, 2400);
          } else {
            ctx.holdItem(null);
            ctx.jobDone?.('delivery');
            if (fast) streak++; else streak = 0;
            let bonus = 0;
            if (m.count > 1 && m.left === 0) { bonus = Math.round(80 * streakMul()); ctx.addMoney(bonus); }
            ctx.passed?.(m.count > 1 ? '📦 Bulk Delivery ✔' : '📦 Delivery ✔', `₹${m.earned + bonus}${bonus ? ` (bonus ₹${bonus})` : ''}`);
            done(`💰 Delivery ke kul ₹${m.earned + bonus} mile!${fast ? '' : ' (late ho gaye 😅)'}`);
          }
        } else if (m.timer < -20) { streak = 0; ctx.holdItem(null); done('⌛ Delivery cancel — bahut late! (streak toot gaya)'); }
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
    } else if (m.type === 'hit') {
      const boss = m.gang[0];
      const d = Math.hypot(p.pos.x - boss.x, p.pos.z - boss.z);
      if (m.offered && !m.alerted) {
        m.life -= dt;
        if (m.life <= 0 || d > 200) { endHit(); m.gang.forEach((n) => npcs.remove(n)); done(null); return; }
      }
      // har giraawat gino (ghoonsa / goli / gaadi se thoka — sab chalega)
      for (const n of m.gang) {
        const down = n.fall > 0;
        if (down && !n.wasDown) { n.downs++; if (n.downs === 1 && !n.boss) ctx.bubble(n.h.root, 'Aaah! 😵', 'loud'); }
        n.wasDown = down;
        const out = n.downs >= n.need;
        // khatam — zameen pe hi pade rahein (mission ke baad hata diye jaate hain)
        if (out) { n.angry = 0; if (n.fall < 50) { n.fall = 999; n.fv = null; } continue; }
        // paas aaye to gang toot padti hai 😡
        const dn = Math.hypot(p.pos.x - n.x, p.pos.z - n.z);
        if (dn < 22 && !down) {
          if (!m.alerted) { m.alerted = true; ctx.bubble(boss.h.root, pick(V().goonLine), 'loud'); ctx.sfx('alarm'); }
          n.angry = 999; n.pause = 0;
        }
      }
      const left = m.gang.filter((n) => n.downs < n.need);
      if (m.alerted) m.timer -= dt;
      if (left.length) target(left[0].x, left[0].z);
      const bossLeft = boss.need - Math.min(boss.need, boss.downs);
      setHud('🖤 Mafia ka kaam — Rival Dada', `🔴 ${m.gang.length - left.length}/${m.gang.length} khatam • Dada ${bossLeft ? `${bossLeft} baar aur giraao` : '✔'} • ${Math.round(d)}m`, m.alerted ? m.timer : undefined);
      if (!left.length) {
        const pay = Math.round(550 * streakMul());
        streak++;
        ctx.addMoney(pay); ctx.sfx('coin'); addRespect(20);
        ctx.passed?.('🖤 Mafia Hit ✔', `₹${pay} • Boss khush 😎`);
        endHit();
        done(`💰 Boss: "Shabaash! Gaadi teri, aur ye le ₹${pay}" 😎`);
      } else if (m.timer <= 0) {
        streak = 0;
        endHit();
        done('⌛ Dada bach nikla… Boss naraz 😤 (streak toot gaya)');
      }
    } else if (m.type === 'race') {
      const q = m.cps[m.i];
      const d = Math.hypot(p.pos.x - q.x, p.pos.z - q.z);
      if (!m.started) {
        // pehla checkpoint = start line; wahan tak pahuncho to ghadi chalu
        if (m.offered) { m.life -= dt; if (m.life <= 0) { done(null); return; } }
      }
      if (m.started) m.timer -= dt;
      setHud(`🏎️ Street Race (${m.i}/${m.cps.length})`, `🏁 ${q.name} — checkpoint • ${Math.round(d)}m${m.started ? '' : ' (pahuncho to race shuru)'}`, m.started ? m.timer : undefined);
      if (p.mode !== 'drive') { streak = 0; done('🚶 Gaadi chhod di — race khatam 😅'); return; }
      if (d < 12) {
        ctx.sfx('coin');
        m.i++;
        if (!m.started) { m.started = true; m.timer = 0; ctx.toast('🚦 GO GO GO! Race shuru 🏁', 1600); }
        if (m.i >= m.cps.length) {
          const pay = Math.round((260 + Math.max(0, m.timer) * 6) * streakMul());
          streak++;
          ctx.addMoney(pay); addRespect(15);
          ctx.passed?.('🏎️ Street Race ✔', `₹${pay}${m.timer > 10 ? ' • ⚡ Toofani!' : ''}`);
          done(`🏆 Race jeet li! ₹${pay} 🏎️💨`);
        } else { raceLeg(); ctx.toast(`✅ Checkpoint ${m.i}/${m.cps.length} • ⏱ +time`, 1400); }
      } else if (m.started && m.timer <= 0) { streak = 0; done('⌛ Race haar gaye — time khatam! 😤'); }
    }
  }
  function dropPax(line) {
    const veh = m.veh || ctx.getVeh();
    m.pax.root.parent?.remove(m.pax.root);
    const sx = veh.pos.x + Math.cos(veh.heading) * 1.8, sz = veh.pos.z - Math.sin(veh.heading) * 1.8;
    const n = npcs.adoptWalker(m.pax, sx, sz, veh.pos);
    n.angryPending = false;
    ctx.bubble(m.pax.root, line);
  }
  // main.js batata hai: takkar / kisi ko thoka
  function notify(kind) {
    if (!m || m.type !== 'sawari' || m.stage !== 'drive') return;
    const ex = E();
    if (kind === 'crash') {
      m.crashes++;
      if (m.kind === 'vip') { ctx.bubble(m.veh.g, pick(ex.vipCrash), 'loud'); ctx.toast(`💥 Takkar ${m.crashes}/${m.K.maxCrash} — ₹50 katenge!`, 1800); }
      else ctx.bubble(m.veh.g, pick(ex.scared), 'loud');
    } else if (kind === 'hit') {
      m.hits++;
      ctx.bubble(m.veh.g, pick(ex.scared), 'loud');
      ctx.toast('😱 Sawari dar gayi — ₹40 kam milenge', 1800);
    }
  }
  function labels() {
    const out = [];
    if (!m) return out;
    if (m.type === 'sawari') {
      if (m.stage === 'pickup' || m.stage === 'board') {
        const r = m.pax.root.position;
        out.push({ key: 'm_pax', x: r.x, y: 2.5, z: r.z, cls: 'job', text: `${m.K.tag} — yahan ruko 🛑` });
      } else out.push({ key: 'm_dest', x: m.dest.x, y: 3.2, z: m.dest.z, cls: 'job', text: `🏁 ${m.dest.name} — yahan utaro` });
    } else if (m.type === 'delivery') {
      if (m.stage === 'pickup') out.push({ key: 'm_shop', x: m.shop.x, y: 3.4, z: m.shop.z, cls: 'job', text: '📦 Parcel yahan se lo' });
      else out.push({ key: 'm_drop', x: m.drop.x, y: 2.6, z: m.drop.z, cls: 'job', text: `🏠 Parcel yahan do${m.count > 1 ? ` (${m.left} baaki)` : ''}` });
    } else if (m.type === 'chor' && !m.caught) out.push({ key: 'm_chor', x: m.thief.x, y: 2.3, z: m.thief.z, cls: 'job', text: '🏃 CHOR — pakdo!' });
    else if (m.type === 'hit') {
      for (const n of m.gang) if (n.downs < n.need) out.push({ key: 'm_goon' + m.gang.indexOf(n), x: n.x, y: 2.4, z: n.z, cls: 'job', text: n.boss ? `👔 DADA (${n.need - n.downs}x)` : '🔴 Gunda' });
    } else if (m.type === 'race') {
      const q = m.cps[m.i];
      out.push({ key: 'm_cp', x: q.x, y: 3.4, z: q.z, cls: 'job', text: `🏁 Checkpoint ${m.i + 1}/${m.cps.length}` });
    }
    return out;
  }

  return {
    update, notify, labels,
    jobs: () => [
      { id: 'sawari', n: '🛺 Sawari uthao (taxi)', d: 'Sawari ko manzil tak chhodo • ₹40–185 (sadak pe 🙋 log khud bhi haath denge)' },
      { id: 'rush', n: '🚨 Emergency sawari', d: 'Bahut kam time, fail = paisa nahi • ₹ x2.2' },
      { id: 'vip', n: '🎩 Netaji VIP', d: '3 takkar = fail, har takkar -₹50 • ₹ x2.8' },
      { id: 'delivery', n: '📦 Delivery karo', d: 'Dukaan se parcel → ghar pahunchao • ₹60–120' },
      { id: 'delivery3', n: '📦×3 Bulk delivery', d: '3 ghar ek ke baad ek, har drop pe time badhta hai • bonus ₹80+' },
      { id: 'chor', n: '🏃 Chor pakdo', d: 'Bhaagte chor ko maar ke roko • ₹150' },
      { id: 'baraat', n: '🎺 Baraat bulao', d: 'Dhol-ghodi; paas ja ke Q se naacho' },
      { id: 'patient', n: '🚑 Ambulance — mareez bachao', d: 'Sadak pe pade mareez ko 🏥 Hospital, time pe • ₹ x2.4 (ambulance chura lo to khud milega)' },
      { id: 'hit', n: '🖤 Mafia hit', d: 'Rival gang ke Dada + 2 gunde giraao • ₹550 (mafia ki kaali SUV churao to khud milega)' },
      { id: 'race', n: '🏎️ Street race', d: '4 checkpoint, time ke andar • ₹260+ (sports car churao to khud milega)' },
    ],
    start(id) {
      cancel();
      if (id === 'sawari' || id === 'rush' || id === 'vip' || id === 'patient') startSawari(id === 'sawari' ? 'normal' : id);
      else if (id === 'hit') { if (!startHit()) ctx.toast('Abhi Dada ka pata nahi chala… thodi der baad 😅', 2200); }
      else if (id === 'race') startRace();
      else if (id === 'delivery') startDelivery(1);
      else if (id === 'delivery3') startDelivery(3);
      else if (id === 'chor') { if (!startChor()) ctx.toast('Abhi koi chor nahi dikha… thodi der baad 😅', 2200); }
      else if (id === 'baraat') { if (baraat || !startBaraat()) ctx.toast('Baraat abhi aa nahi sakti 😅', 2000); }
    },
    // 😈 gaadi chura li → us gaadi ka kaam turant (koi kaam chal raha ho to bas hint)
    forVehicle(v) {
      const kind = v?.kind;
      if (!['ambulance', 'mafia', 'sports'].includes(kind)) return;
      if (m) { ctx.toast(kind === 'ambulance' ? '🚑 Ambulance mili! Abhi wala kaam khatam karo — phir mareez ki call aayegi' : kind === 'mafia' ? '🖤 Mafia ki gaadi! Abhi wala kaam khatam karo — phir Boss ka call aayega' : '🏎️ Tagdi gaadi! Abhi wala kaam khatam karo — phir race milegi', 3000); return; }
      setTimeout(() => { if (!m && ctx.getVeh() === v && ctx.getP().mode === 'drive') { jobFor(kind, false); hailT = 25; } }, 1800);
    },
    get active() { return m; },
    marker() { return m && beacon.visible ? { x: beacon.position.x, z: beacon.position.z } : null; },
    peds() { return baraat ? [{ x: baraat.x, z: baraat.z }, { x: baraat.x, z: baraat.z - baraat.dir * 4 }] : []; },
    level, respect: () => respect, addRespect,
  };
}
