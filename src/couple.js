import * as THREE from 'three';

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, ...o });
function part(parent, geo, mat, x, y, z) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

/** Baitha hua insaan (ghat ki seedhi pe), front = -Z */
function person({ female, skin, top, bottom, hair }) {
  const p = new THREE.Group();
  const mt = M(top), mb = M(bottom), ms = M(skin), mh = M(hair), dark = M(0x2a1a10);
  for (const s of [-1, 1]) {
    part(p, new THREE.BoxGeometry(0.15, 0.15, 0.5), mb, s * 0.1, 0.08, -0.22);
    part(p, new THREE.BoxGeometry(0.13, 0.46, 0.13), mb, s * 0.1, -0.15, -0.46);
    part(p, new THREE.BoxGeometry(0.12, 0.07, 0.2), dark, s * 0.1, -0.38, -0.53);
  }
  const upper = new THREE.Group();
  upper.position.y = 0.1;
  p.add(upper);
  part(upper, new THREE.CylinderGeometry(0.15, 0.19, 0.58, 12), mt, 0, 0.29, 0);
  if (female) {
    const pallu = part(upper, new THREE.BoxGeometry(0.06, 0.74, 0.4), mb, 0, 0.3, -0.01);
    pallu.rotation.z = 0.6;
    part(upper, new THREE.CylinderGeometry(0.2, 0.26, 0.2, 12), mb, 0, 0.04, 0);
  }
  const arms = [];
  for (const s of [-1, 1]) {
    const piv = new THREE.Group();
    piv.position.set(s * 0.21, 0.52, 0);
    piv.rotation.x = -0.55;
    part(piv, new THREE.BoxGeometry(0.09, 0.46, 0.09), female ? ms : mt, 0, -0.22, 0);
    upper.add(piv);
    arms.push(piv);
  }
  const headPivot = new THREE.Group();
  headPivot.position.y = 0.64;
  upper.add(headPivot);
  part(headPivot, new THREE.SphereGeometry(0.14, 16, 12), ms, 0, 0.14, 0);
  const eyeM = M(0x111111);
  for (const s of [-1, 1]) part(headPivot, new THREE.SphereGeometry(0.018, 6, 4), eyeM, s * 0.05, 0.17, -0.128);
  part(headPivot, new THREE.BoxGeometry(0.06, 0.012, 0.01), M(0x7a2a2a), 0, 0.08, -0.135);
  if (female) {
    part(headPivot, new THREE.SphereGeometry(0.152, 16, 10, 0, Math.PI * 2, 0, Math.PI / 1.8), mh, 0, 0.15, 0.01);
    part(headPivot, new THREE.BoxGeometry(0.24, 0.42, 0.08), mh, 0, -0.02, 0.1);
    part(headPivot, new THREE.TorusGeometry(0.09, 0.025, 6, 14), M(0xffffff, { emissive: 0x444444 }), 0, 0.12, 0.15);
    part(headPivot, new THREE.CircleGeometry(0.016, 8), new THREE.MeshBasicMaterial({ color: 0xd0001a }), 0, 0.2, -0.139).rotation.y = Math.PI;
  } else {
    part(headPivot, new THREE.SphereGeometry(0.148, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2.1), mh, 0, 0.16, 0.01);
    part(headPivot, new THREE.BoxGeometry(0.12, 0.025, 0.03), mh, 0, 0.1, -0.135);
  }
  return { p, upper, headPivot, arms };
}

export function buildCouple(scene) {
  const C = new THREE.Vector3(4, 0.03, -119.95);
  const g = new THREE.Group();
  g.position.copy(C);
  scene.add(g);
  const man = person({ female: false, skin: 0xb9774a, top: 0xf5f0e6, bottom: 0x2a2a40, hair: 0x111111 });
  const woman = person({ female: true, skin: 0xc68a5e, top: 0xb0123f, bottom: 0xd81b60, hair: 0x0a0a0a });
  g.add(man.p, woman.p);
  // saamne jalta diya — chehre pe garam roshni
  part(g, new THREE.CylinderGeometry(0.1, 0.06, 0.06, 10), M(0x9a4a22), 0, -0.4, -0.75);
  part(g, new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.5, 0.4), toneMapped: false }), 0, -0.33, -0.75);
  const diyaLight = new THREE.PointLight(0xffa060, 4, 5, 2);
  diyaLight.position.set(0, 0.2, -1.2);
  g.add(diyaLight);

  // 90s censor wale phool 🌸
  const F = new THREE.Vector3(-8, 0.03, -113);
  const fl = new THREE.Group();
  fl.position.copy(F);
  scene.add(fl);
  part(fl, new THREE.CylinderGeometry(0.35, 0.25, 0.5, 14), M(0xb5562a), 0, 0.25, 0);
  const stems = [-1, 1].map((s) => {
    const piv = new THREE.Group();
    piv.position.set(s * 0.16, 0.5, 0);
    part(piv, new THREE.CylinderGeometry(0.02, 0.025, 0.82, 6), M(0x2f8a2f), 0, 0.41, 0);
    const leaf = part(piv, new THREE.SphereGeometry(0.08, 8, 6), M(0x2f8a2f), s * 0.07, 0.3, 0);
    leaf.scale.set(1, 0.3, 0.5);
    const head = new THREE.Group();
    head.position.y = 0.84;
    head.rotation.z = s * 0.9; // ek dusre ki taraf dekhte hue
    head.rotation.x = -0.5;
    part(head, new THREE.SphereGeometry(0.06, 10, 8), M(0xffd23f, { emissive: 0x553300 }), 0, 0, 0);
    const petal = M(s < 0 ? 0xff4f8b : 0xff2d55, { emissive: s < 0 ? 0x401020 : 0x400010 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const pm = part(head, new THREE.SphereGeometry(0.07, 8, 6), petal, Math.cos(a) * 0.1, 0.01, Math.sin(a) * 0.1);
      pm.scale.set(1.3, 0.35, 0.8);
      pm.rotation.y = -a;
    }
    piv.add(head);
    fl.add(piv);
    return piv;
  });

  function setK(k, lean = 0) {
    man.p.position.x = -0.42 + 0.12 * k + 0.08 * lean;
    woman.p.position.x = 0.42 - 0.12 * k - 0.08 * lean;
    man.upper.rotation.z = -0.3 * k;
    woman.upper.rotation.z = 0.3 * k + 0.22 * lean;
    man.headPivot.rotation.y = -1.1 * k;
    woman.headPivot.rotation.y = 1.1 * k;
    man.headPivot.rotation.z = -0.12 * k;
    woman.headPivot.rotation.z = 0.12 * k + 0.4 * lean;
    man.arms[1].rotation.z = 1.0 * Math.max(k, lean);
    woman.arms[0].rotation.z = -0.7 * k;
  }
  function setFlowers(f) {
    stems[0].rotation.z = -0.11 * f;
    stems[1].rotation.z = 0.11 * f;
  }
  setK(0);

  return {
    C, F, setK, setFlowers,
    idle(t) {
      man.upper.rotation.x = Math.sin(t * 1.3) * 0.02;
      woman.upper.rotation.x = Math.sin(t * 1.3 + 1) * 0.02;
      setFlowers(0.35 + 0.15 * Math.sin(t * 1.5));
    },
  };
}
