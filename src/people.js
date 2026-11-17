import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

// 🧍 Asli 3D log (GLB / Mixamo FBX)
// Procedural rig (humans.js) chhupa rehta hai aur poses wahi banata hai; har frame uske jodon ka
// ghumaav asli model ki haddiyon pe copy hota hai. Isliye baithna/naachna/chalana sab bina naye
// animation ke chalta hai. Naye model: public/models/people/ mein daalo + MODELS list mein jodo.
// Koi bhi Mixamo-skeleton wala model chalega (Mixamo, Ready Player Me, …).
const BASE = (import.meta.env?.BASE_URL || '/') + 'models/people/';
export const MODELS = [
  { file: 'male1.glb', role: 'male', tint: { Wolf3D_Outfit_Top: 'top', Wolf3D_Outfit_Bottom: 'bottom', Wolf3D_Outfit_Footwear: 'shoe', Wolf3D_Head: 'skinT', Wolf3D_Body: 'skinT', Wolf3D_Beard: 'hairT' }, hat: 'Mesh', beard: 'Wolf3D_Beard' },
  { file: 'female1.glb', role: 'female' },
];

// procedural jod → model haddi. `to` = jis haddi tak ki disha milani hai (calibration)
const MAP = [
  { b: 'Hips', p: 'hips' },
  { b: 'Spine', p: 'spine' },
  { b: 'Head', p: 'headPivot' },
  { b: 'LeftArm', p: 'armL', to: 'LeftForeArm' },
  { b: 'LeftForeArm', p: 'elL', to: 'LeftHand' },
  { b: 'RightArm', p: 'armR', to: 'RightForeArm' },
  { b: 'RightForeArm', p: 'elR', to: 'RightHand' },
  { b: 'LeftUpLeg', p: 'legL', to: 'LeftLeg' },
  { b: 'LeftLeg', p: 'knL', to: 'LeftFoot' },
  { b: 'LeftFoot', p: 'anL' },
  { b: 'RightUpLeg', p: 'legR', to: 'RightLeg' },
  { b: 'RightLeg', p: 'knR', to: 'RightFoot' },
  { b: 'RightFoot', p: 'anR' },
];
// procedural rig: kis jod ka parent kaun (root-space ghumaav nikaalne ke liye)
const PARENT = { hips: null, spine: 'hips', headPivot: 'spine', armL: 'spine', elL: 'armL', armR: 'spine', elR: 'armR', legL: 'hips', knL: 'legL', anL: 'knL', legR: 'hips', knR: 'legR', anR: 'knR' };
const PROC_HIP_Y = 0.95, PROC_LEG = 0.45 + 0.43;
const boneKey = (n) => n.replace(/^mixamorig[:_]?/i, '');

const templates = { male: [], female: [] };
const waiting = [];
let ready = false;

function findBones(obj) {
  const out = {};
  obj.traverse((o) => { if (o.isBone) { const k = boneKey(o.name); if (!out[k]) out[k] = o; } });
  return out;
}
const _v = new THREE.Vector3(), _q = new THREE.Quaternion();

// ek baar har model ke liye: T-pose → procedural "seedha khada" pose, aur haddi-wise offset yaad rakho
function calibrate(scene, def) {
  const holder = new THREE.Group();
  const flip = new THREE.Group(); flip.rotation.y = Math.PI; // Mixamo +Z dekhta hai, hamara rig -Z
  holder.add(flip); flip.add(scene);
  holder.updateMatrixWorld(true);
  // PBR theek karo: metal-jaisa material bina reflection ke kaala dikhta hai → kapda/skin jaisa banao,
  // aur texture se halki khud ki roshni taaki raat mein chehra-kapde dikhein
  scene.traverse((o) => {
    if (!o.isMesh) return;
    for (const mt of Array.isArray(o.material) ? o.material : [o.material]) {
      if (!mt.isMeshStandardMaterial) continue;
      mt.metalness = 0; mt.metalnessMap = null;
      mt.roughness = Math.max(0.6, mt.roughness ?? 0.8);
      if (mt.map) { mt.emissiveMap = mt.map; mt.emissive = new THREE.Color(0xffffff); mt.emissiveIntensity = 0.16; }
      mt.needsUpdate = true;
    }
  });
  const B = findBones(scene);
  for (const m of MAP) if (!B[m.b]) { console.warn('model mein haddi nahi:', def.file, m.b); return null; }
  // pair ki lambai se scale: model ki taang = procedural taang
  const wp = (b) => b.getWorldPosition(new THREE.Vector3());
  const leg = wp(B.LeftUpLeg).distanceTo(wp(B.LeftLeg)) + wp(B.LeftLeg).distanceTo(wp(B.LeftFoot));
  const k = (PROC_LEG / leg) * (def.scale || 1);
  flip.scale.setScalar(k);
  holder.updateMatrixWorld(true);
  // haath-pair seedhe neeche (procedural rest), baaki jaisa hai
  const down = new THREE.Vector3(0, -1, 0);
  for (const m of MAP) {
    if (!m.to) continue;
    const b = B[m.b];
    b.updateMatrixWorld(true);
    const cur = wp(B[m.to]).sub(wp(b)).normalize();
    _q.setFromUnitVectors(cur, down);
    const bw = b.getWorldQuaternion(new THREE.Quaternion()).premultiply(_q);
    const pw = b.parent.getWorldQuaternion(new THREE.Quaternion());
    b.quaternion.copy(pw.invert().multiply(bw));
    b.updateMatrixWorld(true);
  }
  holder.updateMatrixWorld(true);
  const offset = {};
  for (const m of MAP) offset[m.b] = B[m.b].getWorldQuaternion(new THREE.Quaternion()); // proc rest = identity
  const hipRest = wp(B.Hips);
  const hipParentInv = B.Hips.parent.matrixWorld.clone().invert();
  // haath ka frame: forearm haddi ke andar procedural kohni jaisa frame (saaman pakadne ke liye)
  const faScale = B.RightForeArm.getWorldScale(new THREE.Vector3()).x;
  const faLen = wp(B.RightForeArm).distanceTo(wp(B.RightHand));
  flip.remove(scene);
  return { scene, def, k, offset, hipOff: hipRest.sub(new THREE.Vector3(0, PROC_HIP_Y, 0)), hipParentInv, faScale, faLen };
}

function load(def) {
  const url = BASE + def.file;
  const isFbx = /\.fbx$/i.test(def.file);
  const loader = isFbx ? new FBXLoader() : new GLTFLoader();
  return new Promise((res) => loader.load(url, (r) => res(isFbx ? r : r.scene), undefined, (e) => { console.warn('model load fail', url, e); res(null); }));
}

// ?nomodels = purane halke log (kamzor phone ke liye / tulna ke liye)
const OFF = typeof location !== 'undefined' && /[?&]nomodels/.test(location.search);
export const peopleReady = (async () => {
  if (OFF) { ready = true; waiting.length = 0; return false; }
  const list = await Promise.all(MODELS.map(async (d) => { const sc = await load(d); return sc ? calibrate(sc, d) : null; }));
  list.forEach((t) => { if (t) (templates[t.def.role] || (templates[t.def.role] = [])).push(t); });
  ready = true;
  for (const h of waiting.splice(0)) attach(h);
  return true;
})();

const tintCache = new Map();
function tinted(mat, hex, lift = 0.15) {
  const key = mat.uuid + ':' + hex + ':' + lift;
  if (!tintCache.has(key)) {
    const m = mat.clone();
    // texture ka rang rakho, bas kapde ka rang badlo (safed ki taraf halka taaki dikhe)
    m.color = new THREE.Color(hex).lerp(new THREE.Color(0xffffff), lift);
    tintCache.set(key, m);
  }
  return tintCache.get(key);
}

function roleOf(s) {
  if (s.female) return 'female';
  return 'male';
}

// humans.js ka banda → asli model chadha do (model abhi load nahi hua to baad mein)
export function wantModel(h) {
  if (h.spec.noModel || h.spec.kid) return; // bachche: chhota kiya bada model ajeeb lagta hai
  // kirdaar (pandit, police, neta, maiya, dukaandaar, ladkiyan…) apne kapdon mein hi rahein — ek hi model
  // sabko ek jaisa bana deta tha (topi/pagdi/kurta sab gayab). Model sirf aam shirt-pant wale bheed ke liye.
  const s = h.spec;
  if (s.female || s.old || s.role || (s.hat && s.hat !== 'cap') || !['shirt', 'tshirt', 'jacket'].includes(s.outfit)
    || s.gamchha || s.apron != null || s.vest != null || s.garland || s.belly) return;
  if (!ready) { waiting.push(h); return; }
  attach(h);
}
function attach(h) {
  const role = roleOf(h.spec);
  const pool = templates[role];
  if (!pool || !pool.length) return; // is role ka model nahi → procedural hi
  const T = pool[h.spec.modelIdx ?? Math.floor(Math.random() * pool.length)];
  const scene = SkeletonUtils.clone(T.scene);
  const flip = new THREE.Group(); flip.rotation.y = Math.PI; flip.scale.setScalar(T.k);
  flip.add(scene);
  h.root.add(flip);
  // 🎲 har banda alag: lambai, skin ka rang, joote, topi, daadhi
  const s = h.spec, R = Math.random;
  const v = {
    top: s.top, bottom: s.bottom,
    shoe: [0x2a1a10, 0x111111, 0x5a3a20, 0xf2f2f2, 0x3a3a3a][Math.floor(R() * 5)],
    skinT: new THREE.Color(s.skin).lerp(new THREE.Color(0xffffff), 0.45).getHex(), // texture pe halka desi rang
    hairT: new THREE.Color(s.hair ?? 0x111111).lerp(new THREE.Color(0xffffff), 0.25).getHex(),
  };
  const hat = s.hat ? true : R() < 0.35, beard = s.beard || s.stache || R() < 0.3;
  scene.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = false;
    if (T.def.hat && o.name === T.def.hat) o.visible = hat;
    if (T.def.beard && o.name === T.def.beard) o.visible = beard;
    const which = T.def.tint?.[o.name];
    if (which && v[which] != null) o.material = tinted(o.material, v[which], which === 'skinT' || which === 'hairT' ? 0 : 0.15);
  });
  // lambai-chaudai thodi alag (procedural rig bhi saath mein, taaki pair zameen pe rahein)
  const hs = s.female ? 0.92 + R() * 0.09 : 0.94 + R() * 0.12;
  h.root.scale.multiplyScalar(hs);
  const B = findBones(scene);
  // purane procedural hisse chhupao
  for (const m of Object.values(h.meshes)) m.visible = false;
  if (h.watch) h.watch.visible = false;
  // saaman pakadne wale haath: model ke forearm mein procedural kohni jaisa frame
  for (const [side, anchor] of [['Right', h.hand], ['Left', h.handL]]) {
    const fr = new THREE.Group();
    fr.quaternion.copy(T.offset[side + 'ForeArm']).invert();
    fr.scale.setScalar(1 / T.faScale);
    B[side + 'ForeArm'].add(fr);
    anchor.position.set(0, -T.faLen, -0.02);
    fr.add(anchor);
  }
  h.model = { T, B, flip, scene, bones: MAP.map((m) => ({ ...m, bone: B[m.b], off: T.offset[m.b], rq: new THREE.Quaternion() })), near: true, pool: [] };
  live.push(h);
}

// 🔭 LOD: door ke log purane halke rig mein (bheed mein bhi game tez chale)
const live = [];
const _w = new THREE.Vector3();
export function peopleLOD(cam, near = 32) {
  const n2 = near * near;
  for (const h of live) {
    h.root.getWorldPosition(_w);
    const isNear = !h.noModel && _w.distanceToSquared(cam) < n2; // noModel = apna rig hi dikhe (khaas kapde)
    if (isNear === h.model.near) continue;
    h.model.near = isNear;
    h.model.flip.visible = isNear;
    for (const m of Object.values(h.meshes)) m.visible = !isNear;
  }
}

// har frame: procedural jodon ka ghumaav → model ki haddiyan
const PQ = {};
for (const k of Object.keys(PARENT)) PQ[k] = new THREE.Quaternion();
const memo = new Map();
let poolI = 0, pool = null;
function rootQ(o, flip) {
  if (o === flip) return flip.quaternion;
  let q = memo.get(o);
  if (q) return q;
  q = pool[poolI] || (pool[poolI] = new THREE.Quaternion());
  poolI++;
  q.multiplyQuaternions(rootQ(o.parent, flip), o.quaternion);
  memo.set(o, q);
  return q;
}
export function driveModel(h) {
  const M = h.model;
  if (!M || !M.near) return; // door wale: model chhupa hai, haddiyan mat ghumao
  for (const k in PARENT) { const p = PARENT[k]; PQ[k].copy(h[k].quaternion); if (p) PQ[k].premultiply(PQ[p]); }
  memo.clear(); poolI = 0; pool = M.pool;
  for (const m of M.bones) {
    m.rq.multiplyQuaternions(PQ[m.p], m.off);
    m.bone.quaternion.copy(rootQ(m.bone.parent, M.flip)).invert().multiply(m.rq);
    memo.set(m.bone, m.rq);
  }
  // kamar ki oonchai (baithna / kudna)
  M.B.Hips.position.copy(_v.copy(h.hips.position).add(M.T.hipOff).applyMatrix4(M.T.hipParentInv));
}
