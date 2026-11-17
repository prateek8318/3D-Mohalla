// 🗺️ Bada shehar: Ring road + 🌾 Rampur Gaon (pashchim) + 🏙️ Cyber City (purab) + 🕌 Purana Shehar (uttar)
// Saari imaaratein instanced hain — hazaar ghar bhi phone pe halke chalein.
import * as THREE from 'three';
import { signTexture, roadTexture, stoneTexture, buildingTextures, rng } from './textures.js';
import { addBox, addCircle, RING, LINK_X, ZONES, STN_RD_Z } from './collide.js';

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, ...o });
const HDR = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });
const inR = (r, x, z, pad = 0) => x >= r.x0 - pad && x <= r.x1 + pad && z >= r.z0 - pad && z <= r.z1 + pad;

// ---------- 🏪 nayi dukaanein ----------
export const CAFE = {
  id: 'cafe', color: '#2ef2ff', sign: 'BYTE BREW CAFÉ', sub: 'Cold coffee • Wi-Fi free • Startup gossip',
  name: { hi: 'Byte Brew Café ☕', bho: 'Byte Brew Café ☕' }, owner: 'Rohan (barista)', avatar: '🧑‍💻',
  greet: { hi: ['Hey bro! Oat milk ya normal? 😎', 'Laptop charge karna hai to plug wahan hai 🔌'], bho: ['Ka ho bhai! Coffee piba? 😎', 'Laptop charge kare ke ba ta plug ohija ba 🔌'] },
  gaali: { hi: ['Itna mehenga laga? Chai ki tapri pe jao, chomu!', 'Order karo ya Wi-Fi ka bill bharo, kanjoos!'], bho: ['Mahanga lagal? Chai ke dukaan pe ja, chomu!', 'Order kara na ta Wi-Fi ke bill bhara!'] },
  keeper: { outfit: 'tshirt', top: 0x111111, bottom: 0x2a3a5a, hairStyle: 'spiky', shades: false, print: 0x2ef2ff },
  items: [
    { n: '🧋 Cold Coffee', p: 90, fx: 'turbo', mesh: 'glass', say: { hi: 'Brain booster! Ab code bhi likh loge 🤓', bho: 'Dimaag tej! 🤓' } },
    { n: '🥪 Club Sandwich', p: 140, fx: 'full', mesh: 'plate' },
    { n: '⚡ Energy Drink', p: 70, fx: 'sugar', mesh: 'bottle', say: { hi: 'Dil ki dhadkan 200 BPM! ⚡', bho: 'Karejwa 200 BPM pe! ⚡' } },
    { n: '🍩 Donut', p: 60, fx: 'sugar', mesh: 'laddoo' },
  ],
};
export const MALL = {
  id: 'mall', color: '#ff3df0', sign: 'NEON MEGA MALL', sub: 'Branded kapde • Chashme • AC thand',
  name: { hi: 'Neon Mega Mall 🛍️', bho: 'Neon Mega Mall 🛍️' }, owner: 'Ms. Kavya (manager)', avatar: '👩‍💼',
  greet: { hi: ['Welcome sir! New collection aaya hai ✨', 'Trial room udhar hai, aaram se dekhiye 😊'], bho: ['Swagat ba sir! Naya maal aail ba ✨', 'Trial room ohar ba 😊'] },
  gaali: { hi: ['Sirf AC khaane aaye ho kya, sasta aadmi?', 'Kuch lena hai ya selfie lene aaye ho?'], bho: ['Khali AC khaye aail baada ka?', 'Kuchh lebe ki selfie?'] },
  keeper: { female: true, outfit: 'jeans', top: 0xff3df0, bottom: 0x1f2f5a, hairStyle: 'long' },
  items: [
    { n: '👕 Branded T-shirt', p: 450, kind: 'shirt', color: 0x111111, outfit: 'tshirt' },
    { n: '🧥 Leather Jacket', p: 1500, kind: 'shirt', color: 0x2a1a10, outfit: 'jacket' },
    { n: '👔 Party Shirt', p: 700, kind: 'shirt', color: 0xb0123f, outfit: 'shirt' },
    { n: '🕶️ Aviator Chashma', p: 650, kind: 'shades' },
  ],
};
export const HOSPITAL_DEF = {
  id: 'hospital', color: '#ff4d4d', sign: '✚ CITY HOSPITAL', sub: '24x7 Emergency • Ambulance 108',
  name: { hi: 'City Hospital 🏥', bho: 'City Hospital 🏥' }, owner: 'Dr. Mehta', avatar: '👨‍⚕️',
  greet: { hi: ['Kahan chot lagi? Dikhao 🩺', 'Phir accident? Dhyaan se chalaya karo!'], bho: ['Kahan chot lagal? Dekhaava 🩺', 'Phir accident? Dhyaan se chalaava!'] },
  gaali: { hi: ['Itna maar khaate ho, insurance karwa lo, gadhe!'], bho: ['Etna maar khaala, insurance kara la, gadha!'] },
  keeper: { outfit: 'shirt', top: 0xf4f4f4, bottom: 0x2a2a3a, hairStyle: 'side', shades: false, stache: true },
  items: [
    { n: '🩹 Marham-patti (full HP)', p: 120, fx: 'heal', say: { hi: 'Ho gaya ilaaj! Ab ekdum fit 💪', bho: 'Ilaaj ho gail! Ekdam fit 💪' } },
    { n: '❤️ Extra Lifeline', p: 900, fx: 'life', say: { hi: 'Ek aur zindagi mili — sambhal ke! ❤️', bho: 'Ek aur jindagi mil gail ❤️' } },
    { n: '💊 Taakat ki goli', p: 60, fx: 'turbo', mesh: 'white' },
  ],
};
export const CHAUPAL = {
  id: 'chaupal', color: '#ffd23f', sign: 'रामपुर की चौपाल', sub: 'छाछ • मक्के की रोटी • गुड़ • गप्पें',
  name: { hi: 'Gaon ki Chaupal 🌾', bho: 'Gaon ke Chaupal 🌾' }, owner: 'Mukhiya Ramdeen', avatar: '👳',
  greet: { hi: ['Aao beta, shehar se aaye ho? Chhachh piyo 🥛', 'Baith jao khatiya pe, thakaan utaro 🌾'], bho: ['Aava babua, shahar se aail baada? Matha pi la 🥛', 'Khatiya pe baith ja 🌾'] },
  gaali: { hi: ['Shehar ka chhora, dimaag ghutne mein!', 'Bhains bhi tujhse samajhdaar hai, buddhu!'], bho: ['Shahar ke chhora, dimaag ghutna mein!', 'Bhainso tohra se samajhdaar ba!'] },
  keeper: { outfit: 'kurta', top: 0xfff5e0, bottom: 0xfff5e0, hat: 'pagdi', stache: true, old: true },
  items: [
    { n: '🥛 Chhachh', p: 10, fx: 'turbo', mesh: 'glass' },
    { n: '🌽 Makke ki Roti + Saag', p: 40, fx: 'full', mesh: 'plate' },
    { n: '🍯 Gud ki Dali', p: 5, fx: 'sugar', mesh: 'brown' },
    { n: '🔮 Mukhiya ki bhavishyavani', p: 11, fx: 'fortune' },
  ],
};
export const KABAB = {
  id: 'kabab', color: '#ff9a1f', sign: 'चाचा कबाब कॉर्नर', sub: 'सीख कबाब • तिक्का • फिरनी • 1952 से',
  name: { hi: 'Chacha Kabab Corner 🍢', bho: 'Chacha Kabab Corner 🍢' }, owner: 'Chacha Rafiq', avatar: '🧔',
  greet: { hi: ['Aaiye janaab, garma garam seekh tayyar hai 🍢', 'Purane shehar ka asli zaayka! 😋'], bho: ['Aaiye janaab, garam seekh taiyaar ba 🍢', 'Puraana shahar ke asli swaad! 😋'] },
  gaali: { hi: ['Muft mein sirf khushboo milegi, miyan!'], bho: ['Muft mein khali khushboo mili!'] },
  keeper: { outfit: 'kurta', top: 0xffffff, bottom: 0xffffff, hat: 'topi', beard: true, old: true },
  items: [
    { n: '🍢 Seekh Kabab', p: 90, fx: 'full', mesh: 'plate' },
    { n: '🍗 Chicken Tikka', p: 160, fx: 'full', mesh: 'plate' },
    { n: '🫖 Sulaimani Chai', p: 20, fx: 'turbo', mesh: 'cup' },
    { n: '🍮 Phirni', p: 40, fx: 'sugar', mesh: 'white' },
  ],
};
export const HOSPITAL = { x: 370, z: -15, h: Math.PI };

// ---------- textures ----------
function techTextures(seed) {
  const r = rng(seed), S = 256;
  const cm = document.createElement('canvas'), ce = document.createElement('canvas');
  cm.width = cm.height = ce.width = ce.height = S;
  const gm = cm.getContext('2d'), ge = ce.getContext('2d');
  gm.fillStyle = '#1c2a40'; gm.fillRect(0, 0, S, S);
  ge.fillStyle = '#000'; ge.fillRect(0, 0, S, S);
  const cols = 8, rows = 16, cw = S / cols, ch = S / rows;
  const lit = ['#9fe8ff', '#ffffff', '#ffd27f', '#7ab8ff'];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    gm.fillStyle = r() < 0.5 ? '#3a5a80' : '#2e4a6c';
    gm.fillRect(i * cw + 2, j * ch + 2, cw - 4, ch - 3);
    if (r() < 0.42) { ge.fillStyle = lit[Math.floor(r() * lit.length)]; ge.globalAlpha = 0.5 + r() * 0.5; ge.fillRect(i * cw + 2, j * ch + 2, cw - 4, ch - 3); }
  }
  ge.globalAlpha = 1;
  const t = (c) => { const x = new THREE.CanvasTexture(c); x.colorSpace = THREE.SRGBColorSpace; x.wrapS = x.wrapT = THREE.RepeatWrapping; return x; };
  return { map: t(cm), em: t(ce) };
}
function cropTexture(base, line) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 128; i += 8) { g.fillStyle = line; g.fillRect(i, 0, 4, 128); }
  for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.15})`; g.fillRect(Math.random() * 128, Math.random() * 128, 2, 2); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
// instanced box ki UV uske size ke hisaab se — khidkiyan khinchi hui na dikhein
function uvByScale(mat, cell = 12) {
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <uv_vertex>', `#include <uv_vertex>
#ifdef USE_INSTANCING
  float _sx = length(instanceMatrix[0].xyz), _sy = length(instanceMatrix[1].xyz), _sz = length(instanceMatrix[2].xyz);
  vec2 _rep = abs(normal.y) > 0.5 ? vec2(0.0) : vec2((abs(normal.x) > 0.5 ? _sz : _sx) / ${cell.toFixed(1)}, _sy / ${cell.toFixed(1)});
  #ifdef USE_MAP
    vMapUv *= _rep;
  #endif
  #ifdef USE_EMISSIVEMAP
    vEmissiveMapUv *= _rep;
  #endif
#endif`);
  };
  mat.customProgramCacheKey = () => 'uvscale' + cell;
  return mat;
}

export function buildDistricts(scene, { triggers, keepers, isTouch }) {
  const R = rng(4242);
  const updaters = [];
  const unitBox = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();

  // ---------- 🛣️ SADKEIN ----------
  const rt = roadTexture(), stone = stoneTexture();
  const swMat = new THREE.MeshStandardMaterial({ map: stone.clone(), color: 0x9a8f86, roughness: 0.95 });
  swMat.map.repeat.set(1, 60);
  function road(x0, x1, z0, z1, y) {
    const alongZ = z1 - z0 > x1 - x0;
    const len = alongZ ? z1 - z0 : x1 - x0, w = alongZ ? x1 - x0 : z1 - z0;
    const t = rt.clone(); t.needsUpdate = true; t.repeat.set(1, len / 18);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, len), new THREE.MeshStandardMaterial({ map: t, roughness: 0.55, metalness: 0.2 }));
    m.rotation.set(-Math.PI / 2, 0, alongZ ? 0 : Math.PI / 2);
    m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
    m.receiveShadow = true;
    scene.add(m);
    // dono taraf footpath
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(2.1, len), swMat);
      p.rotation.set(-Math.PI / 2, 0, alongZ ? 0 : Math.PI / 2);
      if (alongZ) p.position.set((x0 + x1) / 2 + s * 9.45, 0.016, (z0 + z1) / 2);
      else p.position.set((x0 + x1) / 2, 0.016, (z0 + z1) / 2 + s * 9.45);
      p.receiveShadow = true;
      scene.add(p);
    }
  }
  const { x: RX, zN, zS } = RING, HW = 9;
  road(-RX - HW, -34, zS - HW, zS + HW, 0.021); road(34, RX + HW, zS - HW, zS + HW, 0.021); // nadi kinare (ghat ke beech pathar)
  road(-RX - HW, RX + HW, zN - HW, zN + HW, 0.021);
  road(-RX - HW, -RX + HW, zS - HW, zN + HW, 0.026); road(RX - HW, RX + HW, zS - HW, zN + HW, 0.026);
  road(-RX, -60, -HW, HW, 0.019); road(60, RX, -HW, HW, 0.019);
  road(-RX, -300, STN_RD_Z - HW, STN_RD_Z + HW, 0.023); road(300, RX, STN_RD_Z - HW, STN_RD_Z + HW, 0.023);
  road(-LINK_X - HW, -LINK_X + HW, zS - HW, zN + HW, 0.027); road(LINK_X - HW, LINK_X + HW, zS - HW, zN + HW, 0.027);

  // nadi ka pakka kinara (ghat ki seedhiyon ke bahar)
  for (const s of [-1, 1]) {
    const bank = new THREE.Mesh(new THREE.BoxGeometry(560, 3.6, 2.2), M(0x8a7a66, { map: stone.clone() }));
    bank.material.map.repeat.set(80, 1);
    bank.position.set(s * (38 + 280), -1.78, -124.1);
    scene.add(bank);
  }
  // ghat ki chhatriyan ab sadak ke beech — gaadi andar se na nikle
  addBox(-22, -109, 4.2, 4.2); addBox(22, -109, 4.2, 4.2);
  // nadi kinare railing (ghat ke bahar)
  {
    const posts = [], rails = [];
    for (const s of [-1, 1]) {
      for (let x = 40; x <= RX + 10; x += 4) posts.push([s * x, -119.9]);
      rails.push([s * (40 + (RX + 10 - 40) / 2), RX + 10 - 40]);
    }
    const pm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.15, 1.1, 0.15).translate(0, 0.55, 0), M(0xd8d0c0), posts.length);
    posts.forEach(([x, z], i) => { dummy.position.set(x, 0, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); pm.setMatrixAt(i, dummy.matrix); });
    scene.add(pm);
    for (const [cx, len] of rails) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(len, 0.12, 0.2), M(0xd8d0c0));
      r.position.set(cx, 1.05, -119.9);
      scene.add(r);
      addBox(cx, -120.2, len, 0.6);
    }
  }

  // ---------- 💡 street lamps (instanced) ----------
  {
    const spots = [];
    const along = (x0, x1, z, side) => { for (let x = x0; x <= x1; x += 34) spots.push([x, z + side * 9.7, side > 0 ? Math.PI : 0, 'x']); };
    const alongZ = (z0, z1, x, side) => { for (let z = z0; z <= z1; z += 34) spots.push([x + side * 9.7, z, 0, 'z', side]); };
    along(-RX + 20, -40, zS, 1); along(40, RX - 20, zS, 1);
    along(-RX + 20, RX - 20, zN, -1); along(-RX + 20, RX - 20, zN, 1);
    alongZ(zS + 20, zN - 20, -RX, 1); alongZ(zS + 20, zN - 20, RX, -1);
    alongZ(zS + 20, zN - 20, -LINK_X, 1); alongZ(zS + 20, zN - 20, LINK_X, -1);
    along(-RX + 20, -170, 0, 1); along(170, RX - 20, 0, -1);
    const n = spots.length;
    const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.16, 7, 6).translate(0, 3.5, 0), M(0x2a2a2a, { metalness: 0.6, roughness: 0.4 }), n);
    const headMat = HDR(2.2, 1.6, 0.9);
    const heads = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, 0.2, 0.5), headMat, n);
    spots.forEach(([x, z], i) => {
      dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1);
      dummy.position.set(x, 0, z); dummy.updateMatrix(); poles.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 7, z); dummy.updateMatrix(); heads.setMatrixAt(i, dummy.matrix);
      addCircle(x, z, 0.2);
    });
    scene.add(poles, heads);
    updaters.push((t, dt, env) => headMat.color.setRGB(2.2, 1.6, 0.9).multiplyScalar(0.15 + 0.85 * env.night));
  }

  // ---------- 🏢 instanced imaaratein ----------
  const bldg = []; // {x,z,sx,sz,h,kind,v,c}
  function building(x, z, sx, sz, h, kind = 'old', block = true) {
    bldg.push({ x, z, sx, sz, h, kind, v: Math.floor(R() * 6), c: R() });
    if (block) addBox(x, z, sx, sz);
  }
  const OLD_PAL = [0xf7a8b8, 0xffd27f, 0x9fe2d0, 0xc3b1ff, 0xffb38a, 0xa8d8ff, 0xefe6d2, 0xf5f5f5, 0xff9fa0, 0xb8f0a0];
  const oldMats = Array.from({ length: 6 }, (_, i) => { const v = buildingTextures(300 + i); return uvByScale(new THREE.MeshStandardMaterial({ map: v.map, emissiveMap: v.em, emissive: 0xffffff, emissiveIntensity: 0.5, roughness: 0.85 })); });
  const techMats = Array.from({ length: 3 }, (_, i) => { const v = techTextures(900 + i); return uvByScale(new THREE.MeshStandardMaterial({ map: v.map, emissiveMap: v.em, emissive: 0xffffff, emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.75 }), 10); });
  const crownMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const crowns = [], beacons = [];

  // frontage helper: sadak ke kinare ek line mein ghar
  function rowX(x0, x1, zRoad, side, kind, skip = () => false, hMin = 8, hMax = 22) {
    for (let x = x0; x <= x1; x += 11 + R() * 2) {
      if (skip(x)) continue;
      const d = 8 + R() * 6;
      building(x, zRoad + side * (10.8 + d / 2), 9.4, d, hMin + R() * (hMax - hMin), kind);
    }
  }
  function rowZ(z0, z1, xRoad, side, kind, skip = () => false, hMin = 8, hMax = 22) {
    for (let z = z0; z <= z1; z += 11 + R() * 2) {
      if (skip(z)) continue;
      const d = 8 + R() * 6;
      building(xRoad + side * (10.8 + d / 2), z, d, 9.4, hMin + R() * (hMax - hMin), kind);
    }
  }

  // ===== 🕌 PURANA SHEHAR (uttar) =====
  {
    const Z = ZONES.oldN;
    rowX(-158, 158, zN, -1, 'old', (x) => Math.abs(x) < 58);
    rowZ(480, 625, LINK_X, -1, 'old');
    rowZ(480, 625, -LINK_X, 1, 'old');
    // andar ki galiyan
    for (let x = Z.x0 + 14; x <= Z.x1 - 14; x += 22) {
      for (let z = 488; z <= 598; z += 24) {
        if (Math.abs(x) < 34 && z > 590) continue; // masjid ka aangan
        if (R() < 0.12) continue;
        building(x + (R() - 0.5) * 3, z + (R() - 0.5) * 3, 12 + R() * 4, 13 + R() * 4, 7 + R() * 14, 'old');
      }
    }
    // masjid ka aangan
    const court = new THREE.Mesh(new THREE.PlaneGeometry(48, 32), new THREE.MeshStandardMaterial({ map: stone.clone(), color: 0xe8e0d0, roughness: 0.9 }));
    court.material.map.repeat.set(10, 7);
    court.rotation.x = -Math.PI / 2; court.position.set(0, 0.014, 616);
    scene.add(court);
    // north ring ke uttar — har jagah shehar
    rowX(-158, 158, zN, 1, 'old');
  }

  // ===== 🏙️ CYBER CITY (purab) =====
  const towerSkip = [[300, 20, 26], [230, -18, 22], [370, -22, 26]]; // mall, cafe, hospital
  function tower(x, z, w, d, h, block = true) {
    bldg.push({ x, z, sx: w, sz: d, h, kind: 'tech', v: Math.floor(R() * 3), c: R() });
    if (block) addBox(x, z, w + 1, d + 1);
    // podium
    bldg.push({ x, z, sx: w + 3, sz: d + 3, h: 4.5, kind: 'podium', v: 0, c: R() });
    crowns.push({ x, z, w: w + 0.4, d: d + 0.4, y: h, c: [0x2ef2ff, 0xff3df0, 0x7a5cff, 0x3dff7a][Math.floor(R() * 4)] });
    if (h > 45) beacons.push([x, h + 2.5, z]);
  }
  {
    const zones = [ZONES.tech, ZONES.techS, ZONES.oldNE];
    for (const Zr of zones) {
      for (let x = Zr.x0 + 22; x <= Zr.x1 - 16; x += 40) {
        for (let z = Zr.z0 + 26; z <= Zr.z1 - 16; z += 44) {
          if (towerSkip.some(([sx, sz, r]) => Math.abs(x - sx) < r + 12 && Math.abs(z - sz) < r + 20)) continue;
          if (Zr === ZONES.oldNE && z < 380) continue; // highway ke khet
          if (Zr === ZONES.tech && z > 290 && z < 320) continue;
          const w = 14 + R() * 8, d = 14 + R() * 8;
          tower(x + (R() - 0.5) * 6, z + (R() - 0.5) * 6, w, d, 26 + R() * 62);
        }
      }
    }
    // ring ke bahar skyline
    for (let z = -60; z <= 660; z += 38) for (const x of [470, 520]) tower(x + (R() - 0.5) * 10, z, 18 + R() * 10, 18 + R() * 10, 50 + R() * 90, false);
    // north ring ke uttar, purab mein
    for (let x = 200; x <= 410; x += 32) tower(x, zN + 26 + R() * 6, 16 + R() * 6, 16, 30 + R() * 50);
    // tech plaza farsh (chamakti grid)
    const gc = document.createElement('canvas'); gc.width = gc.height = 64;
    const gg = gc.getContext('2d'); gg.fillStyle = '#22252e'; gg.fillRect(0, 0, 64, 64); gg.fillStyle = '#3a4258'; gg.fillRect(0, 0, 64, 2); gg.fillRect(0, 0, 2, 64);
    const gt = new THREE.CanvasTexture(gc); gt.wrapS = gt.wrapT = THREE.RepeatWrapping; gt.colorSpace = THREE.SRGBColorSpace;
    for (const Zr of [ZONES.tech, ZONES.techS, ZONES.oldNE]) {
      const w = Zr.x1 - Zr.x0, d = Zr.z1 - Zr.z0;
      const t = gt.clone(); t.needsUpdate = true; t.repeat.set(w / 6, d / 6);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: t, roughness: 0.4, metalness: 0.3 }));
      f.rotation.x = -Math.PI / 2; f.position.set((Zr.x0 + Zr.x1) / 2, 0.012, (Zr.z0 + Zr.z1) / 2); f.receiveShadow = true;
      scene.add(f);
    }
    // 📺 bade LED billboard
    const boards = [
      ['MOHALLA CYBER CITY', 'Startup • 5G • Fiber • Coffee', '#2ef2ff', 250, 12.5, 0],
      ['RAMPUR → ← CYBER', 'Gaon se Global tak 🚀', '#ff3df0', 405, 12.5, 0],
      ['ULTRA 5G', 'Ab buffering band 📶', '#3dff7a', 188, 160, Math.PI / 2],
    ];
    for (const [a, b, c, x, z, ry] of boards) {
      const mat = new THREE.MeshBasicMaterial({ map: signTexture(a, b, c), toneMapped: false });
      const s = new THREE.Mesh(new THREE.PlaneGeometry(16, 4), mat);
      s.position.set(x, 13, z); s.rotation.y = ry;
      scene.add(s);
      const s2 = s.clone(); s2.rotation.y = ry + Math.PI; s2.position.y = 13; scene.add(s2);
      for (const dx of [-6, 6]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 11, 8), M(0x333844, { metalness: 0.7 })); p.position.set(x + Math.cos(ry) * dx, 5.5, z - Math.sin(ry) * dx); scene.add(p); addCircle(p.position.x, p.position.z, 0.3); }
      updaters.push((t) => { mat.color.setHSL((t * 0.05 + x * 0.001) % 1, 0.4, 0.75); });
    }
  }

  // ===== 🌾 RAMPUR GAON (pashchim) =====
  const huts = [], stacks = [], trees = [];
  const FIELDS = [
    [-410, -335, 200, 300], [-262, -196, 215, 300], [-410, -330, 45, 130], [-410, -200, -90, -20], [-410, -200, 400, 520], [-330, -200, 560, 620],
  ];
  const inField = (x, z, p = 4) => FIELDS.some(([x0, x1, z0, z1]) => x > x0 - p && x < x1 + p && z > z0 - p && z < z1 + p);
  const POND = { x: -360, z: 165, r: 12 };
  const busy = (x, z) => inField(x, z) || (Math.abs(x + 300) < 22 && z < 52) || (Math.abs(x + 250) < 16 && z < 40) || Math.hypot(x - POND.x, z - POND.z) < POND.r + 6 || Math.abs(z - 160) < 6 || (Math.abs(x + 300) < 5 && z > 50);
  {
    const crops = [cropTexture('#5f8a2c', '#7aa83a'), cropTexture('#b9a13a', '#d4bd52'), cropTexture('#4f7a32', '#3f6a28')];
    FIELDS.forEach(([x0, x1, z0, z1], i) => {
      const w = x1 - x0, d = z1 - z0, t = crops[i % 3].clone(); t.needsUpdate = true; t.repeat.set(w / 12, d / 12);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: t, roughness: 1 }));
      f.rotation.x = -Math.PI / 2; f.position.set((x0 + x1) / 2, 0.013, (z0 + z1) / 2); f.receiveShadow = true;
      scene.add(f);
    });
    // kachchi zameen + pagdandi
    for (const Zr of [ZONES.gaon, ZONES.gaonS, ZONES.oldNW]) {
      const f = new THREE.Mesh(new THREE.PlaneGeometry(Zr.x1 - Zr.x0, Zr.z1 - Zr.z0), M(0x7a6040, { roughness: 1 }));
      f.rotation.x = -Math.PI / 2; f.position.set((Zr.x0 + Zr.x1) / 2, 0.008, (Zr.z0 + Zr.z1) / 2); f.receiveShadow = true;
      scene.add(f);
    }
    for (const [x0, x1, z0, z1] of [[-419, -186, 156, 164], [-304, -296, 32, 319]]) {
      const f = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), M(0xa88a5a, { roughness: 1 }));
      f.rotation.x = -Math.PI / 2; f.position.set((x0 + x1) / 2, 0.011, (z0 + z1) / 2);
      scene.add(f);
    }
    // talaab
    const pond = new THREE.Mesh(new THREE.CircleGeometry(POND.r, 28), new THREE.MeshStandardMaterial({ color: 0x2a5a6a, metalness: 0.7, roughness: 0.15 }));
    pond.rotation.x = -Math.PI / 2; pond.position.set(POND.x, 0.03, POND.z);
    scene.add(pond);
    addCircle(POND.x, POND.z, POND.r);
    // kuan (well)
    const well = new THREE.Group(); well.position.set(-230, 0, 120);
    const wr = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 1, 16, 1, true), M(0xb0a090)); wr.position.y = 0.5; well.add(wr);
    for (const x of [-1.3, 1.3]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.4, 0.15), M(0x6b4423)); p.position.set(x, 1.2, 0); well.add(p); }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 6), M(0x6b4423)); bar.rotation.z = Math.PI / 2; bar.position.y = 2.3; well.add(bar);
    scene.add(well); addCircle(-230, 120, 1.6);

    // ghar, bhoose ke dher, ped
    for (const Zr of [ZONES.gaon, ZONES.gaonS, ZONES.oldNW]) {
      for (let x = Zr.x0 + 10; x <= Zr.x1 - 8; x += 19) {
        for (let z = Zr.z0 + 12; z <= Zr.z1 - 8; z += 19) {
          const jx = x + (R() - 0.5) * 8, jz = z + (R() - 0.5) * 8;
          if (busy(jx, jz)) { if (inField(jx, jz, -2) && R() < 0.04) trees.push([jx, jz, 0.8 + R() * 0.5]); continue; }
          if (Zr === ZONES.oldNW && jz < 375) continue;
          const r = R();
          if (r < 0.5) huts.push([jx, jz, R() * Math.PI, 5 + R() * 3, 4 + R() * 2]);
          else if (r < 0.62) stacks.push([jx, jz]);
          else if (r < 0.86) trees.push([jx, jz, 0.8 + R() * 0.6]);
        }
      }
    }
    // ring ke bahar pashchim: ped hi ped
    for (let z = -90; z <= 660; z += 14) for (const x of [-452, -470, -495]) if (R() < 0.7) trees.push([x + (R() - 0.5) * 8, z + (R() - 0.5) * 8, 0.9 + R() * 0.6]);
    // north ring ke uttar, pashchim mein jhopdiyan
    for (let x = -415; x <= -190; x += 18) if (R() < 0.7) huts.push([x, zN + 18 + R() * 8, R() * Math.PI, 5 + R() * 3, 4 + R() * 2]);

    // instanced jhopdi: mitti ki deewar + phoos/khaprail ki chhat + darwaza
    const wallM = M(0xffffff, { roughness: 1 }), roofM = M(0xffffff, { roughness: 1 });
    const walls = new THREE.InstancedMesh(unitBox, wallM, huts.length);
    const roofs = new THREE.InstancedMesh(new THREE.ConeGeometry(0.75, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0), roofM, huts.length);
    const doors = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), M(0x3a2414), huts.length);
    const WALLC = [0xb8875a, 0xc9a070, 0xe8e0d0, 0xd4a878, 0xa86c48], ROOFC = [0x8a6a3a, 0xa04a2a, 0x7a5a30];
    huts.forEach(([x, z, ry, w, d], i) => {
      const h = 2.8 + R() * 0.6;
      dummy.position.set(x, 0, z); dummy.rotation.set(0, ry, 0); dummy.scale.set(w, h, d); dummy.updateMatrix(); walls.setMatrixAt(i, dummy.matrix);
      walls.setColorAt(i, col.set(WALLC[i % WALLC.length]));
      dummy.position.set(x, h, z); dummy.scale.set(w * 1.12 / 1.06, 2 + R(), d * 1.12 / 1.06); dummy.updateMatrix(); roofs.setMatrixAt(i, dummy.matrix);
      roofs.setColorAt(i, col.set(ROOFC[i % ROOFC.length]));
      const fx = -Math.sin(ry), fz = -Math.cos(ry);
      dummy.position.set(x + fx * (d / 2 + 0.02), 0, z + fz * (d / 2 + 0.02)); dummy.scale.set(1.1, 2, 0.08); dummy.updateMatrix(); doors.setMatrixAt(i, dummy.matrix);
      const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry));
      addBox(x, z, w * c + d * s, w * s + d * c);
    });
    walls.castShadow = roofs.castShadow = true; walls.receiveShadow = true;
    scene.add(walls, roofs, doors);
    const hay = new THREE.InstancedMesh(new THREE.ConeGeometry(1.8, 3, 10).translate(0, 1.5, 0), M(0xd8b860, { roughness: 1 }), stacks.length * 2);
    stacks.forEach(([x, z], i) => {
      for (let k = 0; k < 2; k++) { dummy.position.set(x + k * 3.6, 0, z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(0.85 + R() * 0.3); dummy.updateMatrix(); hay.setMatrixAt(i * 2 + k, dummy.matrix); }
      addCircle(x, z, 1.7); addCircle(x + 3.6, z, 1.7);
    });
    scene.add(hay);
  }
  // purab/uttar mein bhi kuch ped (shehar ke kinare)
  for (let z = 30; z <= 300; z += 22) { trees.push([158, z, 0.9]); trees.push([-160, z + 11, 0.9]); }
  {
    const n = trees.length;
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.3, 0.5, 4, 6).translate(0, 2, 0), M(0x5a3a22), n);
    const leafGeo = new THREE.IcosahedronGeometry(1, 0);
    const leaf = new THREE.InstancedMesh(leafGeo, M(0xffffff, { roughness: 0.9, flatShading: true }), n * 2);
    trees.forEach(([x, z, s], i) => {
      dummy.rotation.set(0, R() * 6, 0);
      dummy.position.set(x, 0, z); dummy.scale.setScalar(s); dummy.updateMatrix(); trunk.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 4.6 * s, z); dummy.scale.set(3 * s, 2.4 * s, 3 * s); dummy.updateMatrix(); leaf.setMatrixAt(i * 2, dummy.matrix);
      leaf.setColorAt(i * 2, col.setHSL(0.27 + R() * 0.06, 0.55, 0.28 + R() * 0.08));
      dummy.position.set(x + 0.4, 6.2 * s, z); dummy.scale.set(2 * s, 1.8 * s, 2 * s); dummy.updateMatrix(); leaf.setMatrixAt(i * 2 + 1, dummy.matrix);
      leaf.setColorAt(i * 2 + 1, col.setHSL(0.28 + R() * 0.06, 0.6, 0.33 + R() * 0.08));
      if (Math.abs(x) < RING.x + 12) addCircle(x, z, 0.6 * s);
    });
    trunk.castShadow = leaf.castShadow = true;
    scene.add(trunk, leaf);
  }

  // ---------- 🏪 DUKAANEIN + 🛕 jagah ----------
  function signBoard(def, w = 8, h = 2) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTexture(def.sign, def.sub, def.color), toneMapped: false }));
    return m;
  }
  /** dukaan: x,z = dukaandaar; facing = jis taraf sadak hai (+1 = +z, -1 = -z) */
  function shop(def, x, z, facing, look) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = facing > 0 ? Math.PI : 0; // group ka "front" = -Z local
    scene.add(g);
    const add = (geo, mat, px, py, pz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); g.add(m); return m; };
    look(g, add);
    const counter = add(new THREE.BoxGeometry(4, 1.05, 0.9), M(0x6b4423), 0, 0.52, -1.1);
    void counter;
    const s = signBoard(def);
    s.position.set(0, 4.6, -2.2);
    s.rotation.y = Math.PI;
    g.add(s);
    const fz = facing; // world front direction (z)
    addBox(x, z + fz * 1.1, 4, 0.9, true);
    const k = { id: def.id, def, x, z: z - fz * 0.3, heading: facing > 0 ? Math.PI : 0, stall: true };
    keepers.push(k);
    triggers.push({ def, x, z: z + fz * 2.7, heading: facing > 0 ? Math.PI : 0, r: 3.6, foot: true, keeper: k, front: { x, z: z + fz * 8 } });
  }
  // ☕ Cafe (cross road ke dakshin, mooh uttar ki taraf)
  shop(CAFE, 230, -15, 1, (g, add) => {
    add(new THREE.BoxGeometry(14, 5, 9), M(0x1c2a40, { metalness: 0.6, roughness: 0.2 }), 0, 2.5, 5.5);
    add(new THREE.BoxGeometry(14.2, 0.3, 4), M(0x2ef2ff, { emissive: 0x0a5a6a }), 0, 3.6, -1.6);
    addBox(230, -20.5, 14, 9);
  });
  // 🛍️ Mall (cross road ke uttar)
  shop(MALL, 300, 15, -1, (g, add) => {
    add(new THREE.BoxGeometry(34, 14, 20), M(0x2a2238, { metalness: 0.5, roughness: 0.3 }), 0, 7, 11);
    add(new THREE.BoxGeometry(34.4, 1, 20.4), HDR(1.8, 0.3, 1.6), 0, 14.2, 11);
    add(new THREE.BoxGeometry(10, 5, 0.2), M(0x88ccff, { metalness: 0.9, roughness: 0.05, transparent: true, opacity: 0.6 }), 0, 2.5, 0.9);
    addBox(300, 26, 34, 20);
  });
  // 🏥 Hospital
  shop(HOSPITAL_DEF, HOSPITAL.x, HOSPITAL.z, 1, (g, add) => {
    add(new THREE.BoxGeometry(30, 18, 18), M(0xf2f2f2), 0, 9, 10);
    add(new THREE.BoxGeometry(5, 1.4, 0.3), HDR(3, 0.2, 0.2), 0, 15, 0.8);
    add(new THREE.BoxGeometry(1.4, 5, 0.3), HDR(3, 0.2, 0.2), 0, 15, 0.8);
    add(new THREE.BoxGeometry(10, 0.4, 5), M(0xdddddd), 0, 4, -1);
    addBox(HOSPITAL.x, HOSPITAL.z - 10, 30, 18);
  });
  // 🌾 Chaupal (mandir ke paas, cross road ke uttar)
  shop(CHAUPAL, -250, 16, -1, (g, add) => {
    add(new THREE.BoxGeometry(7, 0.25, 5), M(0x8a6a3a), 0, 3.4, 0.5);
    for (const [x, z] of [[-3.2, -1.8], [3.2, -1.8], [-3.2, 2.8], [3.2, 2.8]]) add(new THREE.CylinderGeometry(0.12, 0.12, 3.4, 6), M(0x6b4423), x, 1.7, z);
    // khatiya
    for (const x of [-5.5, 5.5]) { add(new THREE.BoxGeometry(1.2, 0.12, 2.2), M(0xc2a36b), x, 0.5, -2); add(new THREE.BoxGeometry(1.25, 0.4, 0.08), M(0x6b4423), x, 0.25, -3.05); }
  });
  // 🍢 Kabab (masjid ke paas, north ring ki taraf mooh)
  shop(KABAB, -44, 622, 1, (g, add) => {
    add(new THREE.BoxGeometry(8, 6, 6), M(0xd8c8a8), 0, 3, 3.5);
    add(new THREE.BoxGeometry(8.4, 0.25, 3), M(0x1e8a4a), 0, 3.4, -1.4);
    add(new THREE.CylinderGeometry(0.5, 0.5, 0.9, 10), M(0x333333), 1.5, 1.4, -1.1); // angeethi
  });

  // ---------- instanced imaaraton ko scene mein daalo ----------
  {
    const groups = new Map();
    for (const b of bldg) {
      const key = b.kind === 'tech' ? 'tech' + b.v : b.kind === 'podium' ? 'podium' : 'old' + b.v;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(b);
    }
    const podiumMat = M(0x2a2e38, { metalness: 0.4, roughness: 0.5 });
    for (const [key, list] of groups) {
      const mat = key === 'podium' ? podiumMat : key.startsWith('tech') ? techMats[+key.slice(4)] : oldMats[+key.slice(3)];
      const im = new THREE.InstancedMesh(unitBox, mat, list.length);
      list.forEach((b, i) => {
        dummy.position.set(b.x, 0, b.z); dummy.rotation.set(0, 0, 0); dummy.scale.set(b.sx, b.h, b.sz); dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
        if (key.startsWith('old')) im.setColorAt(i, col.set(OLD_PAL[Math.floor(b.c * OLD_PAL.length)]));
        else if (key.startsWith('tech')) im.setColorAt(i, col.setHSL(0.58 + b.c * 0.08, 0.25, 0.75 + b.c * 0.2));
      });
      im.castShadow = true; im.receiveShadow = true;
      scene.add(im);
    }
    // tower ke upar neon taaj + laal batti
    if (crowns.length) {
      const cr = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.5, 1), crownMat, crowns.length);
      crowns.forEach((c, i) => { dummy.position.set(c.x, c.y + 0.25, c.z); dummy.scale.set(c.w, 1, c.d); dummy.updateMatrix(); cr.setMatrixAt(i, dummy.matrix); cr.setColorAt(i, col.set(c.c).multiplyScalar(2)); });
      scene.add(cr);
      const bm = HDR(3, 0.1, 0.1);
      const bl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 8, 6), bm, beacons.length || 1);
      beacons.forEach(([x, y, z], i) => { dummy.position.set(x, y, z); dummy.scale.setScalar(1); dummy.updateMatrix(); bl.setMatrixAt(i, dummy.matrix); });
      bl.count = beacons.length;
      scene.add(bl);
      updaters.push((t, dt, env) => { bm.color.setRGB(3, 0.1, 0.1).multiplyScalar(Math.sin(t * 3) > 0 ? 1 : 0.15); crownMat.color.setScalar(0.35 + 0.65 * env.night); });
    }
    updaters.push((t, dt, env) => {
      const k = 0.06 + 0.7 * env.night;
      for (const m of oldMats) m.emissiveIntensity = k * 0.8;
      for (const m of techMats) m.emissiveIntensity = 0.1 + 0.9 * env.night;
    });
  }

  return {
    update(t, dt, env) { for (const u of updaters) u(t, dt, env); },
    places: [
      { label: '🌾 Rampur Gaon (Mandir)', x: -300, z: 6, h: 0, drive: true },
      { label: '🏙️ Cyber City', x: 300, z: 0, h: Math.PI / 2, drive: true },
      { label: '🏥 City Hospital', x: HOSPITAL.x, z: -8, h: Math.PI },
      { label: '🕌 Purana Shehar (Masjid)', x: 0, z: 630, h: 0 },
      { label: '🛣️ Ring Road', x: -RX, z: 300, h: 0, drive: true },
    ],
    dests: [
      ['🛕 Rampur Mandir', -300, 4], ['🌾 Gaon Chaupal', -250, 4], ['☕ Cyber Cafe', 230, -4], ['🛍️ Neon Mall', 300, 4],
      ['🏥 City Hospital', HOSPITAL.x, -4], ['🕌 Jama Masjid', 0, zN - 4], ['🍢 Kabab Corner', -44, zN - 4], ['🌊 Riverfront', 200, zS + 4],
    ],
    icons: [
      { x: -300, z: 24, a: '🛕', big: true }, { x: 0, z: 615, a: '🕌', big: true }, { x: 300, z: 30, a: '🛍️', big: true },
      { x: HOSPITAL.x, z: -25, a: '🏥', big: true }, { x: 230, z: -20, a: '☕', big: true }, { x: -250, z: 20, a: '🌾', big: true }, { x: POND.x, z: POND.z, a: '💧' },
    ],
  };
}
