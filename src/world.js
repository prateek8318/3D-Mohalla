import * as THREE from 'three';
import { SHOPS, GHAT } from './data.js';
import { STALLS } from './data2.js';
import {
  rng, signTexture, buildingTextures, stripeTexture, glowTexture, heartTexture, roadTexture, stoneTexture, posterTexture,
} from './textures.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { CIRCLES, FOOT, DRIVE, addBox, addCircle, driveable, rect, BAZAAR_Z, GALI, PARK, THANA, MAIN_Z1, STN_RD_Z } from './collide.js';
export { CIRCLES, walkable } from './collide.js';

function grassTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#4f7a32';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4000; i++) {
    const v = Math.random();
    g.fillStyle = `rgba(${40 + v * 60},${90 + v * 70},${30 + v * 30},0.6)`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 3);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

const PALETTE = ['#f7a8b8', '#ffd27f', '#9fe2d0', '#c3b1ff', '#ffb38a', '#a8d8ff', '#efe6d2', '#f5f5f5', '#ff9fa0', '#b8f0a0'];
const SMALL_SIGNS = [
  ['रेडियो-टीवी मरम्मत', '#2ef2ff'], ['शर्मा ट्यूशन क्लासेस', '#ffd23f'], ['साइकिल रिपेयर', '#3dff7a'], ['फोटो स्टूडियो', '#ff3d7f'],
  ['टेलर मास्टर', '#ff9a1f'], ['मेडिकल स्टोर', '#3dff7a'], ['होटल राजधानी', '#b14bff'], ['टेप रिकॉर्डर रिपेयर', '#2ef2ff'],
  ['ज्वेलर्स', '#ffd23f'], ['अखाड़ा • पहलवानी', '#ff3d7f'], ['लस्सी भंडार', '#ffffff'], ['डॉक्टर क्लिनिक', '#2ef2ff'],
];

addCircle(0, 0, 5.9);
addCircle(-22, -109, 2.2);
addCircle(22, -109, 2.2);

export function buildWorld(scene, { isTouch, renderer }) {
  const R = rng(7);
  const updaters = [];
  const buildingMats = [];
  const triggers = [];
  const signMats = [];
  const balconies = [];
  const keepers = [];
  const lightSources = [];
  const color = new THREE.Color();
  const dummy = new THREE.Object3D();

  // ---------- SKY / FOG / LIGHTS ----------
  const FOG_N = new THREE.Color(0x1c0f30), FOG_R = new THREE.Color(0x3a0f30);
  const SKYB_N = new THREE.Color(0x4a1a55), SKYB_R = new THREE.Color(0x8a1a50);
  scene.fog = new THREE.FogExp2(FOG_N.clone(), 0.0105);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x05030f) }, bottom: { value: SKYB_N.clone() }, pulse: { value: 0 } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform vec3 top; uniform vec3 bottom; uniform float pulse; varying vec3 vP;
      void main(){ float h = clamp(vP.y*1.4+0.15,0.,1.); vec3 c = mix(bottom*(1.0+pulse*0.6), top, pow(h,0.55)); gl_FragColor = vec4(c,1.); }`,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), skyMat));

  const starGeo = new THREE.BufferGeometry();
  const sp = [];
  for (let i = 0; i < 1600; i++) {
    const th = R() * Math.PI * 2, ph = Math.acos(R() * 0.9);
    sp.push(Math.sin(ph) * Math.cos(th) * 800, Math.cos(ph) * 800 + 20, Math.sin(ph) * Math.sin(th) * 800);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true });
  scene.add(new THREE.Points(starGeo, starMat));

  const moon = new THREE.Mesh(new THREE.SphereGeometry(28, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.5, 1.3), fog: false, toneMapped: false }));
  moon.position.set(-90, 170, -650);
  scene.add(moon);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffd6f0, transparent: true, opacity: 0.55, fog: false, depthWrite: false }));
  halo.scale.set(260, 260, 1);
  halo.position.copy(moon.position);
  scene.add(halo);

  const HEMI_N = new THREE.Color(0x7a6adf), HEMI_D = new THREE.Color(0xd8e8ff);
  const GND_N = new THREE.Color(0x3b2216), GND_D = new THREE.Color(0x8a6a4a);
  const hemi = new THREE.HemisphereLight(0x7a6adf, 0x3b2216, 0.9);
  scene.add(hemi);
  const amb = new THREE.AmbientLight(0x40305a, 0.6);
  scene.add(amb);
  const sunLight = new THREE.DirectionalLight(0xfff0d0, 0);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(isTouch ? 1024 : 2048, isTouch ? 1024 : 2048);
  const sc = sunLight.shadow.camera;
  sc.left = sc.bottom = -45; sc.right = sc.top = 45; sc.near = 10; sc.far = 400;
  sunLight.shadow.bias = -0.0006;
  sunLight.shadow.normalBias = 0.03;
  scene.add(sunLight);
  scene.add(sunLight.target);
  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(30, 24, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.6, 1.8), fog: false, toneMapped: false }));
  scene.add(sunMesh);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffd9a0, transparent: true, opacity: 0.8, fog: false, depthWrite: false }));
  sunGlow.scale.set(320, 320, 1);
  scene.add(sunGlow);
  const moonLight = new THREE.DirectionalLight(0x9fb4ff, 0.8);
  moonLight.position.set(-60, 100, -120);
  scene.add(moonLight);

  // ---------- GROUND / ROADS ----------
  // zameen nadi ke kinare (z=-123) pe khatam — pehle ye nadi aur ghat ki seedhiyan dhak deti thi
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 860), new THREE.MeshStandardMaterial({ color: 0x4a3c30, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.02, 307);
  ground.receiveShadow = true;
  scene.add(ground);

  const rt = roadTexture();
  const mainLen = MAIN_Z1 + 117;
  const mainTex = rt.clone();
  mainTex.repeat.set(1, mainLen / 18);
  const main = new THREE.Mesh(new THREE.PlaneGeometry(18, mainLen), new THREE.MeshStandardMaterial({ map: mainTex, roughness: 0.55, metalness: 0.2 }));
  main.rotation.x = -Math.PI / 2;
  main.position.set(0, 0.01, (MAIN_Z1 - 117) / 2);
  main.receiveShadow = true;
  scene.add(main);
  // Bazaar road (E-W)
  const bzTex = rt.clone();
  bzTex.repeat.set(1, 258 / 18);
  const bz = new THREE.Mesh(new THREE.PlaneGeometry(18, 258), new THREE.MeshStandardMaterial({ map: bzTex, roughness: 0.55, metalness: 0.2 }));
  bz.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
  bz.position.set(11, 0.02, BAZAAR_Z);
  bz.receiveShadow = true;
  scene.add(bz);
  const srTex = rt.clone();
  srTex.repeat.set(1, 140 / 18);
  const sr = new THREE.Mesh(new THREE.PlaneGeometry(18, 140), new THREE.MeshStandardMaterial({ map: srTex, roughness: 0.55, metalness: 0.2 }));
  sr.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
  sr.position.set(0, 0.022, STN_RD_Z);
  sr.receiveShadow = true;
  scene.add(sr);
  // sidewalk / gali / park / thana floors
  const paveTex = stoneTexture();
  const floor = (r, mat, y = 0.015) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r.x1 - r.x0, r.z1 - r.z0), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set((r.x0 + r.x1) / 2, y, (r.z0 + r.z1) / 2);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  };
  const galiTex = paveTex.clone();
  galiTex.repeat.set((GALI.x1 - GALI.x0) / 4, (GALI.z1 - GALI.z0) / 4);
  floor(GALI, new THREE.MeshStandardMaterial({ map: galiTex, color: 0xb0a090, roughness: 0.95 }), 0.02);
  const gTex = grassTexture();
  gTex.repeat.set(8, 12);
  floor(PARK, new THREE.MeshStandardMaterial({ map: gTex, roughness: 1 }), 0.02);
  floor(THANA, new THREE.MeshStandardMaterial({ color: 0x8a8a84, roughness: 0.9 }), 0.025);
  const swTex = paveTex.clone();
  swTex.repeat.set(1, mainLen / 3);
  const swMat = new THREE.MeshStandardMaterial({ map: swTex, color: 0x9a8f86, roughness: 0.95 });
  for (const s of [-1, 1]) floor(rect(s * 9, s * 10.6, -117, MAIN_Z1), swMat, 0.018);
  const crossTex = rt.clone();
  crossTex.repeat.set(1, 120 / 18);
  const cross = new THREE.Mesh(new THREE.PlaneGeometry(18, 120), new THREE.MeshStandardMaterial({ map: crossTex, roughness: 0.55, metalness: 0.2 }));
  cross.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
  cross.position.y = 0.02;
  scene.add(cross);

  const curbMat = new THREE.MeshStandardMaterial({ color: 0x8c7b6b, roughness: 0.9 });
  const curbStripe = new THREE.MeshStandardMaterial({ map: stripeTexture('#111111', '#f2f2f2', 16), roughness: 0.9 });
  curbStripe.map.repeat.set(30, 1);
  void curbStripe;
  for (const s of [-1, 1]) {
    for (const [z0, z1] of [[-100, -9], [9, BAZAAR_Z - 9], [BAZAAR_Z + 9, STN_RD_Z - 9], [STN_RD_Z + 9, MAIN_Z1]]) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, z1 - z0), curbMat);
      c.position.set(s * 9, 0.04, (z0 + z1) / 2);
      scene.add(c);
    }
    for (const [x0, x1] of [[-58, -9], [9, 58]]) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.08, 0.25), curbMat);
      c.position.set((x0 + x1) / 2, 0.04, s * 9);
      scene.add(c);
    }
    for (const [x0, x1] of [[-118, -9], [9, 118]]) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.08, 0.25), curbMat);
      c.position.set((x0 + x1) / 2, 0.04, BAZAAR_Z + s * 9);
      scene.add(c);
    }
  }

  // ---------- BUILDINGS ----------
  const texVariants = Array.from({ length: 6 }, (_, i) => buildingTextures(100 + i));
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a3340, roughness: 1 });
  const tankMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
  const tankGeo = new THREE.CylinderGeometry(0.9, 0.9, 1.6, 14);
  const antMat = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.8, roughness: 0.4 });
  const antMastGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.2, 5);
  const antBarGeo = new THREE.BoxGeometry(1.6, 0.04, 0.04);
  const balSlabGeo = new THREE.BoxGeometry(2.6, 0.16, 1.1);
  const balRailGeo = new THREE.BoxGeometry(2.6, 0.9, 0.06);
  const balSideGeo = new THREE.BoxGeometry(0.06, 0.9, 1.0);
  const balMat = new THREE.MeshStandardMaterial({ color: 0xbdb2a2, roughness: 0.9 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0x2a3a3a, roughness: 0.6, metalness: 0.4 });
  const clothGeo = new THREE.PlaneGeometry(0.6, 0.9);
  const clothes = [];

  function addBuilding(cx, cz, sx, sz, h, faceDir) {
    const v = texVariants[Math.floor(R() * texVariants.length)];
    const map = v.map.clone(), em = v.em.clone();
    const rep = Math.max(sx, sz) / 12;
    map.repeat.set(rep, h / 12);
    em.repeat.set(rep, h / 12);
    map.offset.set(R(), 0);
    em.offset.copy(map.offset);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(PALETTE[Math.floor(R() * PALETTE.length)]),
      map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 0.8, roughness: 0.85,
    });
    const b = new THREE.Mesh(new THREE.BoxGeometry(sx, h, sz), [mat, mat, roofMat, roofMat, mat, mat]);
    b.position.set(cx, h / 2, cz);
    b.castShadow = b.receiveShadow = true;
    scene.add(b);
    addBox(cx, cz, sx, sz);
    buildingMats.push({ mat, x: cx, z: cz });
    // balcony + log
    if (faceDir && h > 7 && R() < (isTouch ? 0.22 : 0.34)) {
      const floorY = 3.2 * (1 + Math.floor(R() * Math.min(3, (h - 4) / 3.2)));
      const along = (R() - 0.5) * (Math.max(sx, sz) - 4);
      const bx = faceDir.x ? cx + faceDir.x * (sx / 2 + 0.55) : cx + along;
      const bz = faceDir.x ? cz + along : cz + faceDir.z * (sz / 2 + 0.55);
      const bal = new THREE.Group();
      bal.position.set(bx, floorY, bz);
      bal.rotation.y = faceDir.x ? (faceDir.x > 0 ? Math.PI / 2 : -Math.PI / 2) : faceDir.z > 0 ? 0 : Math.PI;
      const slab = new THREE.Mesh(balSlabGeo, balMat);
      slab.position.y = -0.08;
      bal.add(slab);
      const rail = new THREE.Mesh(balRailGeo, railMat);
      rail.position.set(0, 0.45, 0.5);
      bal.add(rail);
      for (const s of [-1, 1]) { const rs = new THREE.Mesh(balSideGeo, railMat); rs.position.set(s * 1.25, 0.45, 0); bal.add(rs); }
      if (R() < 0.5) {
        const line = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 2.4, 3), railMat);
        line.rotation.z = Math.PI / 2;
        line.position.set(0, 1.7, 0.35);
        bal.add(line);
        for (let k = 0; k < 3; k++) {
          const cl = new THREE.Mesh(clothGeo, new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(R(), 0.7, 0.5), side: THREE.DoubleSide, roughness: 0.9 }));
          cl.position.set(-0.8 + k * 0.8, 1.25, 0.36);
          bal.add(cl);
          clothes.push(cl);
        }
      }
      scene.add(bal);
      const w = new THREE.Vector3(0, 0, -0.1).applyEuler(bal.rotation).add(bal.position);
      balconies.push({ x: w.x, y: floorY, z: w.z, heading: bal.rotation.y + Math.PI, kid: R() < 0.3 });
    }
    if (R() < 0.55) {
      const t = new THREE.Mesh(tankGeo, tankMat);
      t.position.set(cx + (R() - 0.5) * sx * 0.5, h + 0.8, cz + (R() - 0.5) * sz * 0.5);
      scene.add(t);
    }
    if (R() < 0.7) {
      // 90s ka TV antenna
      const ant = new THREE.Group();
      ant.position.set(cx + (R() - 0.5) * sx * 0.6, h, cz + (R() - 0.5) * sz * 0.6);
      const mast = new THREE.Mesh(antMastGeo, antMat);
      mast.position.y = 1.6;
      ant.add(mast);
      for (let k = 0; k < 4; k++) {
        const bar = new THREE.Mesh(antBarGeo, antMat);
        bar.position.y = 2.2 + k * 0.32;
        bar.scale.x = 1 - k * 0.18;
        ant.add(bar);
      }
      ant.rotation.y = R() * Math.PI;
      ant.rotation.z = (R() - 0.5) * 0.15;
      scene.add(ant);
    }
    if (faceDir && R() < 0.45) {
      const pm = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.4), new THREE.MeshStandardMaterial({ map: posterTexture(Math.floor(R() * 6)), roughness: 0.9 }));
      const off = (R() - 0.5) * 4;
      if (faceDir.x) {
        pm.position.set(cx + faceDir.x * (sx / 2 + 0.04), 1.7, cz + off);
        pm.rotation.y = faceDir.x > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        pm.position.set(cx + off, 1.7, cz + faceDir.z * (sz / 2 + 0.04));
        pm.rotation.y = faceDir.z > 0 ? 0 : Math.PI;
      }
      pm.rotation.z = (R() - 0.5) * 0.08;
      scene.add(pm);
    }
    if (faceDir && R() < 0.5) {
      const [txt, col] = SMALL_SIGNS[Math.floor(R() * SMALL_SIGNS.length)];
      const sm = new THREE.MeshBasicMaterial({ map: signTexture(txt, '', col, 512, 128), toneMapped: false, transparent: true });
      sm.color.setScalar(1.3);
      signMats.push(sm);
      const s = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), sm);
      const y = 3.5 + Math.floor(R() * 2) * 3;
      if (faceDir.x) {
        s.position.set(cx + faceDir.x * (sx / 2 + 0.06), y, cz);
        s.rotation.y = faceDir.x > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        s.position.set(cx, y, cz + faceDir.z * (sz / 2 + 0.06));
        s.rotation.y = faceDir.z > 0 ? 0 : Math.PI;
      }
      scene.add(s);
    }
  }

  for (const side of [-1, 1]) {
    for (let z = -95; z <= MAIN_Z1 - 6; z += 10) {
      if (Math.abs(z) < 14 || Math.abs(z - BAZAAR_Z) < 14 || Math.abs(z - STN_RD_Z) < 14) continue;
      if (side < 0 && z > GALI.z0 - 6 && z < GALI.z1 + 6) continue;
      if (SHOPS.some((s) => s.side === side && Math.abs(s.z - z) < 9)) continue;
      const d = 8 + R() * 6, h = 8 + R() * 20;
      addBuilding(side * (10.6 + d / 2), z, d, 9.2, h, { x: -side });
    }
    for (let x = 22; x <= 142; x += 10) {
      for (const zs of [-1, 1]) {
        const d = 8 + R() * 6, h = 8 + R() * 18;
        addBuilding(side * x, zs * (10.6 + d / 2), 9.2, d, h, { z: -zs });
      }
    }
    // Bazaar road ke dono taraf
    for (let x = 32; x <= 112; x += 10) {
      for (const zs of [-1, 1]) {
        if (side > 0 && x > THANA.x0 - 6) continue;
        if (side > 0 && zs < 0 && x > 50 && x < 98) continue; // Hotel Raj Palace
        const d = 8 + R() * 6, h = 8 + R() * 16;
        addBuilding(side * x, BAZAAR_Z + zs * (10.6 + d / 2), 9.2, d, h, { z: -zs });
      }
    }
    // Station Road ke dono taraf
    for (let x = 22; x <= 62; x += 10) {
      for (const zs of [-1, 1]) {
        const d = 8 + R() * 6, h = 8 + R() * 18;
        addBuilding(side * x, STN_RD_Z + zs * (10.6 + d / 2), 9.2, d, h, { z: -zs });
      }
    }
    // Gali ke dono taraf (thelon ke peeche)
    if (side < 0) {
      for (let x = -32; x >= -86; x -= 10) {
        for (const zs of [-1, 1]) {
          const d = 7 + R() * 4, h = 7 + R() * 10;
          const edge = zs < 0 ? GALI.z0 : GALI.z1;
          addBuilding(x, edge + zs * (d / 2), 9.2, d, h, { z: -zs });
        }
      }
      addBuilding(-96, (GALI.z0 + GALI.z1) / 2, 12, 20, 14, { x: 1 });
    }
    // (ghat ke bagal wali imaaratein hata di — ab yahan se nadi-kinare ki ring road jaati hai)
  }

  // ---------- STRING LIGHTS (jhalar) ----------
  const strings = [];
  for (let z = -92; z <= MAIN_Z1 - 8; z += 11) if (Math.abs(z) > 10 && Math.abs(z - BAZAAR_Z) > 10 && Math.abs(z - STN_RD_Z) > 10) strings.push([[-10, 12.5, z], [10, 12.5, z]]);
  for (let x = 16; x <= 144; x += 11) for (const s of [-1, 1]) strings.push([[s * x, 12.5, -10], [s * x, 12.5, 10]]);
  for (let x = -110; x <= 110; x += 13) if (Math.abs(x) > 12) strings.push([[x, 12, BAZAAR_Z - 10], [x, 12, BAZAAR_Z + 10]]);
  for (let x = -86; x <= -14; x += 5) strings.push([[x, 6.5, GALI.z0 + 0.5], [x + 2, 6.5, GALI.z1 - 0.5]]);
  const PER = 26;
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshBasicMaterial({ toneMapped: false }), strings.length * PER);
  let bi = 0;
  for (const [a, b] of strings) {
    for (let i = 0; i < PER; i++) {
      const f = i / (PER - 1);
      dummy.position.set(a[0] + (b[0] - a[0]) * f, a[1] - Math.sin(f * Math.PI) * 2.2, a[2] + (b[2] - a[2]) * f);
      dummy.updateMatrix();
      bulbs.setMatrixAt(bi, dummy.matrix);
      bulbs.setColorAt(bi, color.set(0xffaa00));
      bi++;
    }
  }
  scene.add(bulbs);

  // street lamps
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.4 });
  const lampHead = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.6, 0.9), toneMapped: false });
  const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7, 8);
  const headGeo = new THREE.BoxGeometry(1.2, 0.2, 0.5);
  const poolMat = new THREE.MeshBasicMaterial({ map: glowTexture(), color: 0x6a4a22, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const lampSpots = [];
  for (let z = -86; z <= MAIN_Z1 - 10; z += 22) if (Math.abs(z) >= 12 && Math.abs(z + 5 - BAZAAR_Z) > 11 && Math.abs(z + 5 - STN_RD_Z) > 11) for (const s of [-1, 1]) lampSpots.push([s, z]);
  for (const [s, z] of lampSpots) {
    {
      const p = new THREE.Mesh(poleGeo, poleMat);
      p.position.set(s * 9.6, 3.5, z + 5);
      scene.add(p);
      const h = new THREE.Mesh(headGeo, lampHead);
      h.position.set(s * 9.0, 7, z + 5);
      scene.add(h);
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), poolMat);
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(s * 7.5, 0.04, z + 5);
      scene.add(pool);
      addCircle(s * 9.6, z + 5, 0.2);
    }
  }
  for (let x = -104; x <= 104; x += 26) {
    if (Math.abs(x) < 14) continue;
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(poleGeo, poleMat);
      p.position.set(x, 3.5, BAZAAR_Z + s * 9.6);
      scene.add(p);
      const h = new THREE.Mesh(headGeo, lampHead);
      h.rotation.y = Math.PI / 2;
      h.position.set(x, 7, BAZAAR_Z + s * 9.0);
      scene.add(h);
      addCircle(x, BAZAAR_Z + s * 9.6, 0.2);
    }
  }

  // ---------- SHOPS ----------
  const W = 9, D = 7, H = 6;
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x7a4a2a, roughness: 0.7 });
  function M(c, o = {}) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, ...o }); }

  const CZ = -0.6; // counter (local z)
  let barberMirror = null;
  function buildShop(def) {
    const g = new THREE.Group();
    const rotY = def.side < 0 ? Math.PI / 2 : -Math.PI / 2;
    const gx = def.side * (10.6 + D / 2), gz = def.z;
    const toWorld = (lx, lz) => (def.side < 0 ? { x: gx + lz, z: gz - lx } : { x: gx - lz, z: gz + lx });
    const solid = (lx, lz, w, d) => { const p = toWorld(lx, lz); addBox(p.x, p.z, d, w); };
    const wall = M(def.wall, { roughness: 0.8 });
    const add = (geo, mat, x, y, z, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
    add(new THREE.BoxGeometry(W, H, 0.4), wall, 0, H / 2, -D / 2);
    for (const sx of [-1, 1]) add(new THREE.BoxGeometry(0.4, H, D), wall, sx * W / 2, H / 2, 0);
    add(new THREE.BoxGeometry(W + 0.6, 0.4, D + 0.6), M(0x3a3340), 0, H, 0);
    add(new THREE.BoxGeometry(W, 0.2, D), M(0x9b8b78), 0, 0.1, 0);
    const v = texVariants[Math.floor(R() * texVariants.length)];
    const um = v.map.clone(), ue = v.em.clone();
    um.repeat.set(0.75, 0.6); ue.repeat.set(0.75, 0.6);
    const upMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE[Math.floor(R() * PALETTE.length)]), map: um, emissiveMap: ue, emissive: 0xffffff, emissiveIntensity: 0.8 });
    add(new THREE.BoxGeometry(W + 0.6, 7, D + 0.6), [upMat, upMat, roofMat, roofMat, upMat, upMat], 0, H + 3.7, 0);
    // warm interior glow
    const inner = new THREE.MeshBasicMaterial({ color: new THREE.Color(def.color).multiplyScalar(0.55) });
    add(new THREE.PlaneGeometry(W - 0.6, H - 0.6), inner, 0, H / 2, -D / 2 + 0.22);
    if (def.id !== 'barber' && def.id !== 'golgappa') {
      add(new THREE.BoxGeometry(W - 2, 1.1, 0.9), woodMat, 0, 0.55, CZ);
      solid(0, CZ, W - 2, 0.9);
    }
    // awning
    const aw = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.4, 2.8), new THREE.MeshStandardMaterial({ map: stripeTexture(def.color, '#fff6e0', 10), side: THREE.DoubleSide, roughness: 0.8 }));
    aw.rotation.x = -Math.PI / 2 + 0.5;
    aw.position.set(0, H - 1.0, D / 2 + 1.15);
    g.add(aw);
    // neon sign
    const sm = new THREE.MeshBasicMaterial({ map: signTexture(def.sign, def.sub, def.color), toneMapped: false });
    sm.color.setScalar(1.5);
    signMats.push(sm);
    add(new THREE.PlaneGeometry(W, 2.25), sm, 0, H + 1.6, D / 2 + 0.32);
    // marigold toran
    const toran = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 8, 6), M(0xff8c00, { emissive: 0x552000 }), 24);
    for (let i = 0; i < 24; i++) {
      const f = i / 23;
      dummy.position.set(-W / 2 + f * W, H - 0.15 - Math.sin(f * Math.PI * 4) ** 2 * 0.5, D / 2 + 0.15);
      dummy.updateMatrix();
      toran.setMatrixAt(i, dummy.matrix);
      toran.setColorAt(i, color.set(i % 2 ? 0xffd000 : 0xff6a00));
    }
    g.add(toran);
    const lp = toWorld(0, D / 2 + 1.5);
    lightSources.push({ x: lp.x, y: H - 1.6, z: lp.z, color: new THREE.Color(def.color).lerp(new THREE.Color(0xffaa55), 0.5), intensity: 60 });

    const anim = buildProps(def.id, g, add, solid);
    g.position.set(gx, 0, gz);
    g.rotation.y = rotY;
    scene.add(g);
    // andar ghoomne ki jagah
    const a = toWorld(-4.25, -3.2), b = toWorld(4.25, 3.6);
    FOOT.push(rect(a.x, b.x, a.z, b.z));
    const tz = def.id === 'golgappa' ? D / 2 + 3.0 : def.id === 'barber' ? 1.6 : 0.6;
    const tp = toWorld(0, tz);
    const kz = def.id === 'golgappa' ? D / 2 + 0.45 : def.id === 'barber' ? -0.2 : CZ - 1.25;
    const kp = toWorld(def.id === 'barber' ? 0.2 : 0, kz);
    const keeper = { id: def.id, def, x: kp.x, z: kp.z, heading: rotY + Math.PI };
    if (def.id === 'barber') {
      keeper.chair = toWorld(-2, -0.5);
      keeper.chairHeading = rotY;
      keeper.behind = toWorld(-2, 0.75);
    }
    keepers.push(keeper);
    triggers.push({ def, x: tp.x, z: tp.z, heading: rotY, r: def.id === 'barber' ? 4.6 : 4.4, foot: true, front: { x: def.side * 7.2, z: def.z }, keeper });
    if (anim) updaters.push(anim);
  }

  function buildProps(id, g, add, solid) {
    const cy = 1.1, cz = CZ;
    if (id === 'mithai') {
      const cols = [0xff9a1f, 0xfff4e0, 0x6b2e12, 0xffd23f, 0xff5c97];
      cols.forEach((c, k) => {
        const mat = M(c, { roughness: 0.4, emissive: c, emissiveIntensity: 0.15 });
        const x0 = -2.8 + k * 1.4;
        add(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 20), M(0xcccccc, { metalness: 0.9, roughness: 0.2 }), x0, cy + 0.03, cz);
        let n = 0;
        for (let l = 0; l < 3; l++)
          for (let i = 0; i < 3 - l; i++)
            for (let j = 0; j < 3 - l; j++) {
              if (n++ > 14) break;
              add(new THREE.SphereGeometry(0.12, 10, 8), mat, x0 + (i - (2 - l) / 2) * 0.24, cy + 0.15 + l * 0.2, cz + (j - (2 - l) / 2) * 0.24);
            }
      });
      const kadhai = add(new THREE.SphereGeometry(0.9, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0x222222, { metalness: 0.7 }), 3.2, 1.2, D / 2 + 0.3);
      kadhai.material.side = THREE.DoubleSide;
      solid(3.2, D / 2 + 0.3, 1.9, 1.9);
      const fire = add(new THREE.CylinderGeometry(0.7, 0.8, 0.5, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.5, 0.8, 0.1), toneMapped: false }), 3.2, 0.25, D / 2 + 0.3);
      const jal = new THREE.MeshStandardMaterial({ color: 0xff9a00, emissive: 0xff6a00, emissiveIntensity: 0.5 });
      for (let i = 0; i < 5; i++) add(new THREE.TorusGeometry(0.15 + (i % 2) * 0.05, 0.04, 6, 16), jal, 3.0 + (i % 3) * 0.2, 1.0, D / 2 + 0.1 + (i % 2) * 0.3).rotation.x = Math.PI / 2;
      return (t) => { fire.scale.y = 0.8 + Math.sin(t * 18) * 0.2; };
    }
    if (id === 'barber') {
      const pole = add(new THREE.CylinderGeometry(0.22, 0.22, 2.4, 20), new THREE.MeshBasicMaterial({ map: stripeTexture('#ff2a2a', '#ffffff', 8, true), toneMapped: false }), W / 2 - 0.2, 2.2, D / 2 + 0.6);
      pole.material.color.setScalar(1.3);
      add(new THREE.SphereGeometry(0.28, 12, 8), M(0xdddddd, { metalness: 0.9 }), W / 2 - 0.2, 3.5, D / 2 + 0.6);
      for (const x of [-2, 2]) {
        add(new THREE.BoxGeometry(1.2, 0.3, 1.2), M(0xb3122a), x, 1.0, -0.5);
        add(new THREE.BoxGeometry(1.2, 1.4, 0.2), M(0xb3122a), x, 1.8, 0.05);
        add(new THREE.BoxGeometry(0.15, 0.25, 0.9), M(0x222222), x - 0.6, 1.3, -0.5);
        add(new THREE.BoxGeometry(0.15, 0.25, 0.9), M(0x222222), x + 0.6, 1.3, -0.5);
        add(new THREE.CylinderGeometry(0.15, 0.3, 0.9, 10), M(0xcccccc, { metalness: 0.9 }), x, 0.45, -0.5);
        if (x < 0) {
          const mirror = new Reflector(new THREE.PlaneGeometry(1.9, 2.3), { textureWidth: isTouch ? 384 : 768, textureHeight: isTouch ? 464 : 928, color: 0xc8d8e0 });
          mirror.position.set(x, 2.0, -D / 2 + 0.24);
          mirror.visible = false;
          g.add(mirror);
          barberMirror = mirror;
          add(new THREE.BoxGeometry(2.1, 2.5, 0.06), M(0x6b4423), x, 2.0, -D / 2 + 0.2);
        } else add(new THREE.PlaneGeometry(1.8, 2.2), new THREE.MeshStandardMaterial({ color: 0x9fd8ff, metalness: 1, roughness: 0.05, emissive: 0x18303a }), x, 2.0, -D / 2 + 0.25);
      }
      solid(-2, -0.5, 1.3, 1.5); solid(2, -0.5, 1.3, 1.5); solid(W / 2 - 0.2, D / 2 + 0.6, 0.5, 0.5);
      const tex = pole.material.map;
      return (t, dt) => { tex.offset.y = (tex.offset.y + dt * 0.5) % 1; };
    }
    if (id === 'chai') {
      add(new THREE.CylinderGeometry(0.6, 0.6, 0.2, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.5, 0.9, 0.2), toneMapped: false }), -2, cy + 0.1, cz);
      add(new THREE.CylinderGeometry(0.45, 0.5, 0.6, 16), M(0xb8b8b8, { metalness: 0.9, roughness: 0.3 }), -2, cy + 0.5, cz);
      for (let i = 0; i < 6; i++) add(new THREE.CylinderGeometry(0.09, 0.07, 0.2, 10), M(0xffffff), 0.5 + i * 0.35, cy + 0.1, cz);
      for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.13, 0.1, 0.24, 10), M(0xa0522d), 0.7 + i * 0.4, cy + 0.12, cz - 0.3);
      // bench
      add(new THREE.BoxGeometry(3.2, 0.15, 0.8), woodMat, 0, 0.6, D / 2 + 2.6);
      for (const x of [-1.4, 1.4]) add(new THREE.BoxGeometry(0.12, 0.6, 0.7), woodMat, x, 0.3, D / 2 + 2.6);
      solid(0, D / 2 + 2.6, 3.2, 0.8);
      const steamMat = new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false });
      const steam = Array.from({ length: 6 }, (_, i) => { const s = new THREE.Sprite(steamMat); s.userData.o = i / 6; g.add(s); return s; });
      return (t) => {
        steam.forEach((s) => {
          const f = (t * 0.4 + s.userData.o) % 1;
          s.position.set(-2 + Math.sin(t * 2 + s.userData.o * 9) * 0.2, cy + 0.9 + f * 2.2, cz);
          s.scale.setScalar(0.4 + f * 1.2);
        });
      };
    }
    if (id === 'paan') {
      const leaf = M(0x2f9e3a, { emissive: 0x0a3a10 });
      for (let i = 0; i < 18; i++) {
        const l = add(new THREE.ConeGeometry(0.18, 0.04, 3), leaf, -2.5 + (i % 6) * 0.5, cy + 0.05 + Math.floor(i / 6) * 0.05, cz + (Math.floor(i / 6) - 1) * 0.3);
        l.rotation.y = i;
      }
      for (let i = 0; i < 8; i++) add(new THREE.CylinderGeometry(0.15, 0.15, 0.25, 10), M([0xff3d7f, 0xffd23f, 0x3dff7a, 0xffffff][i % 4], { metalness: 0.6 }), 0.6 + (i % 4) * 0.45, cy + 0.13, cz + (i < 4 ? -0.2 : 0.2));
      const lanterns = [-3, 3].map((x) => add(new THREE.SphereGeometry(0.35, 12, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 0.3, 0.3), toneMapped: false }), x, H - 1.6, D / 2 + 0.7));
      return (t) => { lanterns.forEach((l, i) => { l.position.x = (i ? 3 : -3) + Math.sin(t * 1.5 + i) * 0.15; }); };
    }
    if (id === 'dj') {
      const speakers = [];
      for (const x of [-3.2, 3.2]) {
        for (let k = 0; k < 2; k++) {
          const box = new THREE.Group();
          box.position.set(x, 0.9 + k * 1.6, D / 2 + 0.2);
          add(new THREE.BoxGeometry(1.4, 1.5, 1.0), M(0x111111), 0, 0, 0, box);
          const cone = add(new THREE.CircleGeometry(0.45, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 0.4, 2.5), toneMapped: false }), 0, -0.1, 0.51, box);
          speakers.push(cone);
          if (k === 0) solid(x, D / 2 + 0.2, 1.4, 1.0);
          g.add(box);
        }
      }
      const ball = add(new THREE.IcosahedronGeometry(0.7, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.15, flatShading: true, emissive: 0x332244 }), 0, H - 1.4, 0.5);
      const beams = [];
      for (let i = 0; i < 4; i++) {
        const b = add(new THREE.ConeGeometry(0.9, 5, 16, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(i / 4, 1, 0.5), transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 0, H - 3.9, 0.5);
        beams.push(b);
      }
      return (t, dt, lv) => {
        const s = 1 + lv.bass * 0.35;
        speakers.forEach((c) => c.scale.set(s, s, 1));
        ball.rotation.y += dt * (0.8 + lv.energy * 3);
        beams.forEach((b, i) => {
          b.rotation.z = Math.sin(t * 1.3 + i * 1.7) * 0.6;
          b.rotation.x = Math.cos(t * 1.1 + i) * 0.4;
          b.material.opacity = 0.08 + lv.mid * 0.35;
        });
      };
    }
    if (id === 'dhaba') {
      const tandoor = add(new THREE.CylinderGeometry(0.7, 0.9, 1.2, 16), M(0x9a5b33), 3, 0.6, D / 2 + 0.6);
      const glow = add(new THREE.CircleGeometry(0.6, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1, 0.2), toneMapped: false }), 3, 1.21, D / 2 + 0.6);
      glow.rotation.x = -Math.PI / 2;
      void tandoor;
      solid(3, D / 2 + 0.6, 1.8, 1.8); solid(-1.5, D / 2 + 2.8, 3.2, 1.6);
      // charpai
      const cp = new THREE.Group();
      cp.position.set(-1.5, 0, D / 2 + 2.8);
      add(new THREE.BoxGeometry(3.2, 0.12, 1.6), M(0xc2a36b), 0, 0.7, 0, cp);
      for (const [x, z] of [[-1.5, -0.7], [1.5, -0.7], [-1.5, 0.7], [1.5, 0.7]]) add(new THREE.BoxGeometry(0.12, 0.7, 0.12), woodMat, x, 0.35, z, cp);
      g.add(cp);
      for (let i = 0; i < 5; i++) add(new THREE.CylinderGeometry(0.3, 0.25, 0.25, 14), M(0x999999, { metalness: 0.9, roughness: 0.25 }), -2.4 + i * 1.0, cy + 0.12, cz);
      return (t) => { glow.material.color.setRGB(2.5 + Math.sin(t * 9) * 0.5, 0.9, 0.2); };
    }
    if (id === 'std') {
      // shishe ka booth + phone + meter
      add(new THREE.BoxGeometry(1.8, 2.6, 1.8), new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.25, metalness: 0.8, roughness: 0.1 }), 3.2, 1.5, 2.2);
      solid(3.2, 2.2, 1.8, 1.8);
      add(new THREE.BoxGeometry(1.9, 0.15, 1.9), M(0xffc800), 3.2, 2.85, 2.2);
      for (const x of [-2.2, -0.6, 3.2]) {
        add(new THREE.BoxGeometry(0.5, 0.25, 0.4), M(0xc0161e, { roughness: 0.3 }), x, x === 3.2 ? 1.3 : cy + 0.13, x === 3.2 ? 2.2 : cz);
        add(new THREE.BoxGeometry(0.55, 0.1, 0.12), M(0x111111), x, x === 3.2 ? 1.48 : cy + 0.31, x === 3.2 ? 2.2 : cz);
      }
      const meter = add(new THREE.BoxGeometry(0.9, 0.35, 0.1), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 2.2, 0.4), toneMapped: false }), 1.0, cy + 0.6, cz - 0.3);
      return (t) => { meter.material.color.setRGB(0.3, 1.6 + Math.sin(t * 3) * 0.6, 0.4); };
    }
    if (id === 'video') {
      const shelf = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.4, 0.12), new THREE.MeshStandardMaterial({ roughness: 0.6 }), 96);
      let n = 0;
      for (let row = 0; row < 4; row++)
        for (let i = 0; i < 24; i++) {
          dummy.position.set(-3.6 + i * 0.31, 1.2 + row * 1.0, -D / 2 + 0.4);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          shelf.setMatrixAt(n, dummy.matrix);
          shelf.setColorAt(n++, color.setHSL(R(), 0.7, 0.45));
        }
      g.add(shelf);
      for (let row = 0; row < 4; row++) add(new THREE.BoxGeometry(8, 0.08, 0.5), woodMat, 0, 0.96 + row * 1.0, -D / 2 + 0.45);
      add(new THREE.BoxGeometry(1.4, 1.0, 1.0), M(0x2a2018), -1.5, cy + 0.5, cz);
      const screen = add(new THREE.PlaneGeometry(1.05, 0.75), new THREE.MeshBasicMaterial({ color: 0x88aaff, toneMapped: false }), -1.5, cy + 0.52, cz + 0.51);
      add(new THREE.BoxGeometry(1.3, 0.2, 0.8), M(0x222222, { metalness: 0.6 }), 1.0, cy + 0.1, cz);
      add(new THREE.BoxGeometry(0.2, 0.04, 0.02), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.5, 0.2, 0.2), toneMapped: false }), 1.4, cy + 0.12, cz + 0.41);
      return (t) => { screen.material.color.setHSL((Math.floor(t * 2) * 0.17) % 1, 0.6, 0.45 + Math.random() * 0.15).multiplyScalar(1.6); };
    }
    if (id === 'kirana') {
      for (let row = 0; row < 3; row++) {
        add(new THREE.BoxGeometry(8, 0.08, 0.6), woodMat, 0, 1.4 + row * 1.2, -D / 2 + 0.5);
        for (let i = 0; i < 14; i++) {
          const jar = add(new THREE.CylinderGeometry(0.18, 0.18, 0.45, 10), M(new THREE.Color().setHSL(R(), 0.75, 0.5), { transparent: true, opacity: 0.85, roughness: 0.2 }), -3.6 + i * 0.55, 1.67 + row * 1.2, -D / 2 + 0.5);
          void jar;
        }
      }
      for (let i = 0; i < 3; i++) add(new THREE.SphereGeometry(0.5, 10, 8), M(0xd8c39a, { roughness: 1 }), -2.6 + i * 1.1, 0.45, D / 2 + 0.5).scale.set(1, 0.9, 0.8);
      solid(-1.5, D / 2 + 0.5, 3.4, 1);
      const strip = [];
      for (let i = 0; i < 10; i++) {
        const p = add(new THREE.BoxGeometry(0.28, 0.4, 0.04), M(new THREE.Color().setHSL(i / 10, 0.9, 0.55), { metalness: 0.5, roughness: 0.3 }), 1 + (i % 5) * 0.32, 3.6 - Math.floor(i / 5) * 0.45, D / 2 + 0.2);
        strip.push(p);
      }
      return (t) => { strip.forEach((p, i) => { p.rotation.y = Math.sin(t * 1.5 + i) * 0.3; }); };
    }
    if (id === 'golgappa') {
      const cart = new THREE.Group();
      cart.position.set(0, 0, D / 2 + 1.6);
      add(new THREE.BoxGeometry(3, 0.9, 1.4), M(0x2f6fd0), 0, 1.0, 0, cart);
      add(new THREE.BoxGeometry(3.2, 0.08, 1.6), M(0xcccccc, { metalness: 0.8, roughness: 0.3 }), 0, 1.5, 0, cart);
      for (const x of [-1, 1]) add(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 16), M(0x111111), x * 1.1, 0.45, 0.75, cart).rotation.x = Math.PI / 2;
      add(new THREE.CylinderGeometry(0.4, 0.4, 0.8, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.3, side: THREE.DoubleSide }), -0.8, 1.95, 0, cart);
      const pm = M(0xd9a441, { roughness: 0.6 });
      for (let i = 0; i < 14; i++) add(new THREE.SphereGeometry(0.1, 8, 6), pm, -0.8 + (R() - 0.5) * 0.5, 1.65 + R() * 0.6, (R() - 0.5) * 0.5, cart);
      add(new THREE.SphereGeometry(0.4, 14, 10), M(0x9a4a22, { roughness: 0.9 }), 0.7, 1.9, 0, cart);
      const lamp = add(new THREE.SphereGeometry(0.15, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2, 0.8), toneMapped: false }), 0, 2.9, 0, cart);
      add(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 5), M(0x333333), 0, 2.25, 0, cart);
      g.add(cart);
      solid(0, D / 2 + 1.6, 3.2, 1.6);
      return (t) => { lamp.scale.setScalar(1 + Math.sin(t * 12) * 0.08); };
    }
    return null;
  }
  SHOPS.forEach(buildShop);

  // ---------- BAZAAR GALI KE THELE ----------
  const bambooMat = M(0xb08850, { roughness: 0.9 });
  const poleG = new THREE.CylinderGeometry(0.06, 0.06, 3, 6);
  function buildStall(def) {
    const sx = def.x, szc = def.side < 0 ? GALI.z0 + 2.1 : GALI.z1 - 2.1;
    const rot = def.side < 0 ? 0 : Math.PI;
    const toW = (lx, lz) => (def.side < 0 ? { x: sx + lx, z: szc + lz } : { x: sx - lx, z: szc - lz });
    const g = new THREE.Group();
    g.position.set(sx, 0, szc);
    g.rotation.y = rot;
    const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
    for (const [x, z] of [[-2.8, -1.8], [2.8, -1.8], [-2.8, 1.6], [2.8, 1.6]]) add(poleG, bambooMat, x, 1.5, z);
    const tarp = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 4.2), new THREE.MeshStandardMaterial({ map: stripeTexture(def.color, '#fff6e0', 8), side: THREE.DoubleSide, roughness: 0.9 }));
    tarp.rotation.x = -Math.PI / 2 + 0.18;
    tarp.position.set(0, 3.05, -0.1);
    g.add(tarp);
    add(new THREE.BoxGeometry(4.6, 0.95, 0.9), M(0x7a4a2a), 0, 0.48, 0.8);
    add(new THREE.BoxGeometry(4.7, 0.04, 1.0), M(new THREE.Color(def.color).lerp(new THREE.Color(0xffffff), 0.4).getHex()), 0, 0.97, 0.8);
    const sm = new THREE.MeshBasicMaterial({ map: signTexture(def.sign, def.sub || '', def.color, 512, 128), toneMapped: false });
    signMats.push(sm);
    add(new THREE.PlaneGeometry(4.6, 1.15), sm, 0, 3.5, 1.75).castShadow = false;
    add(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.2, 1), toneMapped: false }), 0, 2.8, 0.6);
    // saaman
    const goods = { phool: [0xd0001a, 0xff4f8b, 0xffd23f, 0xffffff], chudi: [0xb14bff, 0xff3d7f, 0x2ef2ff, 0xffd23f], juice: [0x8bc34a, 0xffeb3b, 0xff9800], patang: [0x2ef2ff, 0xff3d7f, 0xffd23f, 0x3dff7a], kapda: [0xff3d7f, 0x3949ab, 0xffd23f, 0x2a1a12], samosa: [0xd9a441, 0xff9a00], jyotish: [0xff5c97, 0xffd23f], mochi: [0x2a1a10, 0x6b2e12] }[def.id] || [0xffffff];
    for (let i = 0; i < 12; i++) {
      const c = goods[i % goods.length];
      const m = def.id === 'patang' ? add(new THREE.PlaneGeometry(0.4, 0.4), M(c, { side: THREE.DoubleSide }), -2 + (i % 6) * 0.8, 2.2 + Math.floor(i / 6) * 0.5, -1.7)
        : def.id === 'kapda' ? add(new THREE.BoxGeometry(0.5, 0.7, 0.05), M(c), -2.1 + (i % 6) * 0.85, 2.0, -1.7)
          : add(new THREE.SphereGeometry(0.11, 8, 6), M(c, { roughness: 0.5 }), -1.9 + (i % 6) * 0.75, 1.08, 0.6 + Math.floor(i / 6) * 0.35);
      if (def.id === 'patang') m.rotation.z = Math.PI / 4;
    }
    if (def.id === 'juice') add(new THREE.CylinderGeometry(0.35, 0.35, 1.2, 12), M(0x888888, { metalness: 0.8 }), 1.8, 1.6, 0.6);
    scene.add(g);
    const tw = toW(0, 0.8);
    addBox(tw.x, tw.z, 4.6, 0.9);
    const kp = toW(0, -0.5);
    const tp = toW(0, 2.0);
    const keeper = { id: def.id, def, x: kp.x, z: kp.z, heading: rot + Math.PI, stall: true };
    keepers.push(keeper);
    triggers.push({ def, x: tp.x, z: tp.z, heading: rot, r: 3.4, foot: true, keeper, front: tp });
  }
  STALLS.forEach(buildStall);
  // gali ka gate board
  {
    const m = new THREE.MeshBasicMaterial({ map: signTexture('चौक बाज़ार', 'सिर्फ़ पैदल • No Rickshaw', '#ffd23f'), toneMapped: false });
    signMats.push(m);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.75), m);
    s.position.set(-10.2, 6, (GALI.z0 + GALI.z1) / 2);
    s.rotation.y = Math.PI / 2;
    scene.add(s);
    for (const z of [GALI.z0 + 0.5, GALI.z1 - 0.5]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7, 0.5), M(0xd9a066));
      p.position.set(-10.2, 3.5, z);
      scene.add(p);
      addCircle(-10.2, z, 0.35);
    }
    // rickshaw andar na jaaye — bollards
    for (let z = GALI.z0 + 2; z <= GALI.z1 - 2; z += 2) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.9, 8), M(0xffd23f));
      b.position.set(-9.6, 0.45, z);
      scene.add(b);
    }
  }

  // ---------- CHOWK + EQUALIZER ----------
  const chowk = new THREE.Group();
  scene.add(chowk);
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 6, 0.5, 48), new THREE.MeshStandardMaterial({ map: stoneTexture(), roughness: 0.8 }));
  plat.position.y = 0.25;
  chowk.add(plat);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 7, 16), new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.5 }));
  pillar.position.y = 4;
  chowk.add(pillar);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.12, 12, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 2.5, 3), toneMapped: false }));
  ring.position.y = 7.2;
  chowk.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.08, 12, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 0.5, 1.5), toneMapped: false }));
  ring2.position.y = 7.2;
  chowk.add(ring2);
  const fmSign = new THREE.Group();
  fmSign.position.y = 10;
  const fmMat = new THREE.MeshBasicMaterial({ map: signTexture('मोहल्ला FM', '♪ 24x7 देसी बीट ♪', '#2ef2ff'), toneMapped: false });
  fmMat.color.setScalar(1.5);
  signMats.push(fmMat);
  for (const r of [0, Math.PI]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.75), fmMat);
    p.rotation.y = r;
    fmSign.add(p);
  }
  chowk.add(fmSign);
  const BARS = 64;
  const barGeo = new THREE.BoxGeometry(0.32, 1, 0.32);
  barGeo.translate(0, 0.5, 0);
  const bars = new THREE.InstancedMesh(barGeo, new THREE.MeshBasicMaterial({ toneMapped: false }), BARS);
  for (let i = 0; i < BARS; i++) bars.setColorAt(i, color.setHSL(i / BARS, 1, 0.5));
  chowk.add(bars);
  const chowkLight = new THREE.PointLight(0xff3d7f, 60, 30, 2);
  chowkLight.position.y = 6;
  chowk.add(chowkLight);
  triggers.push({ def: { id: 'chowk', name: { hi: 'Mohalla FM Chowk', bho: 'Mohalla FM Chowk' }, music: true }, x: 0, z: 8, heading: 0, r: 4 });

  // ---------- GATE ----------
  const gateMat = new THREE.MeshStandardMaterial({ color: 0xd9a066, roughness: 0.6 });
  const GATE_Z = MAIN_Z1 + 2;
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(1.6, 12, 1.6), gateMat);
    p.position.set(s * 10.5, 6, GATE_Z);
    scene.add(p);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xffb347, metalness: 0.6, roughness: 0.3 }));
    dome.position.set(s * 10.5, 12, GATE_Z);
    scene.add(dome);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(22, 1.4, 1.4), gateMat);
  beam.position.set(0, 10.5, GATE_Z);
  scene.add(beam);
  const gm = new THREE.MeshBasicMaterial({ map: signTexture('मोहल्ले में आपका स्वागत है', 'धीरे चलाइए • स्टेशन आगे है', '#ffd23f'), toneMapped: false });
  gm.color.setScalar(1.4);
  signMats.push(gm);
  const gs = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), gm);
  gs.position.set(0, 8, GATE_Z - 0.8);
  gs.rotation.y = Math.PI;
  scene.add(gs);

  // ---------- GHAT ----------
  const stone = stoneTexture();
  const plazaTex = stone.clone();
  plazaTex.repeat.set(12, 4);
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(64, 20), new THREE.MeshStandardMaterial({ map: plazaTex, roughness: 0.9 }));
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, 0.03, -109);
  scene.add(plaza);
  const stepMat = new THREE.MeshStandardMaterial({ map: stone, color: 0xc8b8a0, roughness: 0.9 });
  for (let i = 0; i < 8; i++) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(76, 0.45, 1.3), stepMat);
    st.position.set(0, -0.2 - i * 0.45, -119.6 - i * 1.3);
    scene.add(st);
  }
  for (const s of [-1, 1]) {
    const ch = new THREE.Group();
    ch.position.set(s * 22, 0, -109);
    for (const [x, z] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 4, 10), gateMat);
      p.position.set(x, 2, z);
      ch.add(p);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 4.2), gateMat);
    top.position.y = 4.2;
    ch.add(top);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xfff0d0, roughness: 0.5 }));
    dome.position.y = 4.4;
    ch.add(dome);
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.5, 1.8, 0.6), toneMapped: false }));
    bell.position.y = 3.3;
    ch.add(bell);
    scene.add(ch);
  }
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(1400, 500, 90, 40),
    new THREE.MeshStandardMaterial({ color: 0x1a2350, metalness: 0.85, roughness: 0.18, emissive: 0x0a0820 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -3.4, -375);
  scene.add(water);
  const wpos = water.geometry.attributes.position;
  const wbase = wpos.array.slice();
  const moonPath = new THREE.Mesh(new THREE.PlaneGeometry(14, 300), new THREE.MeshBasicMaterial({ map: glowTexture(), color: 0x6a5a80, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  moonPath.rotation.x = -Math.PI / 2;
  moonPath.position.set(-30, -3.2, -280);
  scene.add(moonPath);
  const ghatSign = new THREE.MeshBasicMaterial({ map: signTexture(GHAT.sign, GHAT.sub, GHAT.color), toneMapped: false });
  ghatSign.color.setScalar(1.5);
  signMats.push(ghatSign);
  const gsign = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), ghatSign);
  gsign.position.set(0, 6, -100.5);
  gsign.rotation.y = Math.PI;
  scene.add(gsign);
  const gsign2 = gsign.clone();
  gsign2.rotation.y = 0;
  gsign2.position.z = -100.4;
  scene.add(gsign2);
  const ghatLight = new THREE.PointLight(0xff6aa0, 26, 26, 2);
  ghatLight.position.set(0, 5, -112);
  scene.add(ghatLight);
  triggers.push({ def: GHAT, x: 0, z: -110, heading: 0, r: 7 });

  // diyas on river
  const DIYAS = 70;
  const diyas = new THREE.InstancedMesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.4, 0.3), toneMapped: false }), DIYAS);
  const diyaData = Array.from({ length: DIYAS }, () => ({ x: (R() - 0.5) * 70, z: -128 - R() * 120, s: 0.5 + R() * 0.8, p: R() * 6 }));
  scene.add(diyas);
  let diyaCursor = 0;
  // sky lanterns
  const LAN = 40;
  const lanterns = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.35, 0.25, 0.8, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.2, 0.35), toneMapped: false }), LAN);
  const lanData = Array.from({ length: LAN }, () => ({ x: (R() - 0.5) * 80, z: -125 - R() * 100, y: R() * 80, v: 0.8 + R() * 1.2, p: R() * 6 }));
  scene.add(lanterns);
  // hearts
  const HN = 160;
  const hgeo = new THREE.BufferGeometry();
  const hp = new Float32Array(HN * 3);
  const hv = [];
  for (let i = 0; i < HN; i++) {
    hp[i * 3] = (R() - 0.5) * 50;
    hp[i * 3 + 1] = R() * 16;
    hp[i * 3 + 2] = -102 - R() * 30;
    hv.push(0.6 + R() * 1.4);
  }
  hgeo.setAttribute('position', new THREE.BufferAttribute(hp, 3));
  const heartMat = new THREE.PointsMaterial({ map: heartTexture(), size: 1.3, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(1.6, 1.2, 1.4), toneMapped: false });
  scene.add(new THREE.Points(hgeo, heartMat));

  // ---------- COINS ----------
  const coinGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.14, 24);
  coinGeo.rotateX(Math.PI / 2);
  const coinMat = new THREE.MeshStandardMaterial({ color: 0xffc83d, metalness: 1, roughness: 0.25, emissive: 0x7a4a00, emissiveIntensity: 1.2 });
  const coins = [];
  const areas = DRIVE.map((r) => (r.x1 - r.x0) * (r.z1 - r.z0));
  const tot = areas.reduce((a, b) => a + b, 0);
  let guard = 0;
  while (coins.length < 46 && guard++ < 5000) {
    let k = R() * tot, ri = 0;
    while (k > areas[ri]) { k -= areas[ri]; ri++; }
    const r = DRIVE[ri];
    const x = r.x0 + R() * (r.x1 - r.x0), z = r.z0 + R() * (r.z1 - r.z0);
    if (!driveable(x, z)) continue;
    const m = new THREE.Mesh(coinGeo, coinMat);
    m.position.set(x, 1.3, z);
    scene.add(m);
    coins.push({ mesh: m, active: true, respawn: 0 });
  }

  // ---------- COWS 🐄 ----------
  const cows = [];
  const cowWhite = M(0xf2efe8, { roughness: 0.9 }), cowDark = M(0x3a2a20), horn = M(0xd9c7a0);
  function makeCow(path) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.0, 2.2), cowWhite);
    body.position.y = 1.4;
    g.add(body);
    const hump = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), cowWhite);
    hump.position.set(0, 2.0, -0.7);
    g.add(hump);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.8), cowWhite);
    head.position.set(0, 1.8, -1.4);
    g.add(head);
    for (const s of [-1, 1]) {
      const h = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.45, 6), horn);
      h.position.set(s * 0.2, 2.25, -1.3);
      h.rotation.z = -s * 0.5;
      g.add(h);
    }
    const tika = new THREE.Mesh(new THREE.CircleGeometry(0.08, 10), new THREE.MeshBasicMaterial({ color: 0xff2200 }));
    tika.position.set(0, 1.95, -1.81);
    tika.rotation.y = Math.PI;
    g.add(tika);
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffcc33, metalness: 1, roughness: 0.3 }));
    bell.position.set(0, 1.35, -1.55);
    g.add(bell);
    const legs = [];
    for (const [x, z] of [[-0.35, -0.8], [0.35, -0.8], [-0.35, 0.8], [0.35, 0.8]]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, 0.95, z);
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.95, 0.2), cowDark);
      leg.position.y = -0.47;
      pivot.add(leg);
      g.add(pivot);
      legs.push(pivot);
    }
    scene.add(g);
    const cow = { g, legs, path, f: R(), dir: 1, speed: 0.025 + R() * 0.02, x: 0, z: 0, pause: 0 };
    cows.push(cow);
  }
  void makeCow; // gaay hata di gayi

  // ---------- UPDATE ----------
  let romanceMix = 0;
  const FOG_TMP = new THREE.Color();
  let poolTimer = 0;
  const lightPool = Array.from({ length: isTouch ? 2 : 3 }, () => { const l = new THREE.PointLight(0xffaa55, 0, 24, 2); scene.add(l); return l; });
  function update(t, dt, lv, fx, ppos, env) {
    romanceMix += ((fx.romance ? 1 : 0) - romanceMix) * Math.min(1, dt * 1.5);
    const night = env.night, day = env.day;
    scene.fog.color.copy(FOG_TMP.copy(env.fog).lerp(FOG_R, romanceMix * (0.35 + 0.65 * night)));
    scene.fog.density = env.fogDensity;
    skyMat.uniforms.top.value.copy(env.skyTop);
    skyMat.uniforms.bottom.value.copy(env.skyBottom).lerp(SKYB_R, romanceMix * (0.3 + 0.7 * night));
    skyMat.uniforms.pulse.value = lv.bass * 0.3 * night;
    starMat.opacity = (0.6 + lv.treble * 0.4) * Math.max(0, night * 1.3 - 0.3);
    moon.visible = halo.visible = night > 0.2;
    halo.material.opacity = 0.55 * night;
    sunMesh.position.copy(env.sunDir).multiplyScalar(650);
    sunGlow.position.copy(sunMesh.position);
    sunMesh.visible = sunGlow.visible = env.sunDir.y > -0.08;
    sunMesh.material.color.copy(env.sunColor).multiplyScalar(3);
    sunGlow.material.color.copy(env.sunColor);
    sunLight.position.copy(env.sunDir).multiplyScalar(150).add(ppos);
    sunLight.target.position.copy(ppos);
    sunLight.color.copy(env.sunColor);
    renderer.shadowMap.autoUpdate = day > 0.04;
    // sabse paas ki dukaanon ko asli roshni (light pool)
    poolTimer -= dt;
    if (poolTimer <= 0) {
      poolTimer = 0.4;
      lightSources.sort((a, b) => ((a.x - ppos.x) ** 2 + (a.z - ppos.z) ** 2) - ((b.x - ppos.x) ** 2 + (b.z - ppos.z) ** 2));
      lightPool.forEach((l, i) => {
        const s = lightSources[i];
        if (!s) { l.intensity = 0; return; }
        l.position.set(s.x, s.y, s.z);
        l.color.copy(s.color);
        l.userData.base = s.intensity;
      });
    }
    for (const l of lightPool) l.intensity = (l.userData.base || 0) * (0.35 + 0.65 * night);
    for (const c of clothes) c.rotation.y = Math.sin(t * 2 + c.position.x * 3) * 0.25;
    sunLight.intensity = day * 2.15 + env.golden * 0.5;
    moonLight.intensity = 1.15 * night;
    hemi.color.copy(HEMI_N).lerp(HEMI_D, day);
    hemi.groundColor.copy(GND_N).lerp(GND_D, day);
    // din mein sab safed-chamakta na lage
    // raat mein bhi log/gaadiyan dikhein (pehle bahut andhera tha)
    hemi.intensity = 1.15 + day * 0.12;
    amb.intensity = 0.78 - day * 0.2;
    if (scene.environment) scene.environmentIntensity = 0.28 + day * 0.27;
    lampHead.color.setRGB(2.2, 1.6, 0.9).multiplyScalar(0.2 + 0.8 * night);
    poolMat.opacity = night;
    diyas.material.color.setRGB(3, 1.4, 0.3).multiplyScalar(0.35 + 0.65 * night);
    lanterns.material.color.setRGB(2.6, 1.2, 0.35).multiplyScalar(0.35 + 0.65 * night);

    for (const b of buildingMats) {
      const d = Math.hypot(b.x - ppos.x, b.z - ppos.z);
      let k = 0.55 + lv.bass * 0.5 * (0.5 + 0.5 * Math.sin(t * 5 - d * 0.12));
      if (fx.sugar) k += 0.9 * Math.max(0, Math.sin(t * 10 + d * 0.3));
      b.mat.emissiveIntensity = k * (0.08 + 0.92 * night);
    }
    const sc = 0.92 + lv.bass * 0.7;
    for (const m of signMats) m.color.setScalar(sc);

    const n = bulbs.count;
    for (let i = 0; i < n; i++) {
      let h, l = 0.5;
      if (fx.sugar) h = (i * 0.07 + t * 1.6) % 1;
      else if (romanceMix > 0.5) h = 0.92 + 0.06 * Math.sin(i * 0.4 + t * 2);
      else h = (0.08 + 0.05 * Math.sin(i * 0.9) + (i % 3) * 0.28 + t * 0.03) % 1;
      const wave = 0.5 + 0.5 * Math.sin(t * 6 - i * 0.35);
      color.setHSL(h, 1, l).multiplyScalar((1.0 + lv.bass * 0.7 * wave + (lv.beat ? 0.2 : 0)) * (0.4 + 0.6 * night));
      bulbs.setColorAt(i, color);
    }
    bulbs.instanceColor.needsUpdate = true;

    for (let i = 0; i < BARS; i++) {
      const a = (i / BARS) * Math.PI * 2;
      const v = lv.bins[i];
      dummy.position.set(Math.cos(a) * 4.7, 0.5, Math.sin(a) * 4.7);
      dummy.rotation.set(0, -a, 0);
      dummy.scale.set(1, 0.2 + v * 7, 1);
      dummy.updateMatrix();
      bars.setMatrixAt(i, dummy.matrix);
      color.setHSL((i / BARS + t * 0.05) % 1, 1, 0.5).multiplyScalar(1 + v * 2.5);
      bars.setColorAt(i, color);
    }
    bars.instanceMatrix.needsUpdate = true;
    bars.instanceColor.needsUpdate = true;
    ring.rotation.x = t * 0.7;
    ring.rotation.y = t * 0.5;
    ring.scale.setScalar(1 + lv.bass * 0.5);
    ring2.rotation.y = -t * 0.9;
    ring2.rotation.z = t * 0.6;
    fmSign.rotation.y = t * 0.4;
    chowkLight.color.setHSL((t * 0.08) % 1, 1, 0.55);
    chowkLight.intensity = 40 + lv.bass * 45;
    ghatLight.intensity = 30 + romanceMix * 80;

    // water waves (only near → cheap enough)
    for (let i = 0; i < wpos.count; i++) {
      const x = wbase[i * 3], y = wbase[i * 3 + 1];
      wpos.array[i * 3 + 2] = Math.sin(x * 0.08 + t * 1.2) * 0.25 + Math.cos(y * 0.1 + t * 0.9) * 0.25 + lv.bass * 0.3 * Math.sin(x * 0.2 + y * 0.2 + t * 4);
    }
    wpos.needsUpdate = true;

    for (let i = 0; i < DIYAS; i++) {
      const d = diyaData[i];
      d.z -= dt * d.s * 0.6;
      if (d.z < -260) { d.z = -127; d.x = (Math.random() - 0.5) * 60; }
      dummy.position.set(d.x + Math.sin(t * 0.5 + d.p) * 0.6, -3.1 + Math.sin(t * 2 + d.p) * 0.1, d.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(0.8 + 0.3 * Math.sin(t * 8 + d.p));
      dummy.updateMatrix();
      diyas.setMatrixAt(i, dummy.matrix);
    }
    diyas.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < LAN; i++) {
      const d = lanData[i];
      d.y += dt * d.v;
      if (d.y > 90) { d.y = 0; d.x = (Math.random() - 0.5) * 80; }
      dummy.position.set(d.x + Math.sin(t * 0.3 + d.p) * 2, d.y, d.z);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      lanterns.setMatrixAt(i, dummy.matrix);
    }
    lanterns.instanceMatrix.needsUpdate = true;

    heartMat.opacity += ((fx.romance ? 1 : 0) - heartMat.opacity) * Math.min(1, dt * 2);
    if (heartMat.opacity > 0.01) {
      for (let i = 0; i < HN; i++) {
        hp[i * 3 + 1] += dt * hv[i];
        hp[i * 3] += Math.sin(t + i) * dt * 0.3;
        if (hp[i * 3 + 1] > 18) hp[i * 3 + 1] = 0;
      }
      hgeo.attributes.position.needsUpdate = true;
      heartMat.size = 1.1 + lv.bass * 0.8;
    }

    for (const c of coins) {
      if (!c.active) {
        if (t > c.respawn) { c.active = true; c.mesh.visible = true; }
        continue;
      }
      c.mesh.rotation.y += dt * 3;
      c.mesh.position.y = 1.3 + Math.sin(t * 3 + c.mesh.position.x) * 0.2;
    }

    for (const cow of cows) {
      if (cow.pause > 0) cow.pause -= dt;
      else {
        cow.f += cow.dir * cow.speed * dt;
        if (cow.f > 1 || cow.f < 0) { cow.dir *= -1; cow.f = Math.min(1, Math.max(0, cow.f)); cow.pause = 1 + Math.random() * 3; }
      }
      const [a, b] = cow.path;
      cow.x = a[0] + (b[0] - a[0]) * cow.f;
      cow.z = a[1] + (b[1] - a[1]) * cow.f;
      cow.g.position.set(cow.x, 0, cow.z);
      const dx = (b[0] - a[0]) * cow.dir, dz = (b[1] - a[1]) * cow.dir;
      cow.g.rotation.y = Math.atan2(-dx, -dz);
      const walk = cow.pause > 0 ? 0 : Math.sin(t * 6);
      cow.legs.forEach((l, i) => { l.rotation.x = walk * 0.4 * (i % 2 ? 1 : -1) * (i < 2 ? 1 : -1); });
    }

    for (const u of updaters) u(t, dt, lv, fx);
  }

  function releaseDiyas(n = 8) {
    for (let i = 0; i < n; i++) {
      const d = diyaData[diyaCursor++ % DIYAS];
      d.z = -126 - Math.random() * 2;
      d.x = (Math.random() - 0.5) * 10;
    }
  }

  return { update, triggers, coins, cows, releaseDiyas, balconies, keepers, lightSources, get barberMirror() { return barberMirror; } };
}
