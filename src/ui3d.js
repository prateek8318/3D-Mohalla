import * as THREE from 'three';

/** Logon ke sar pe bolne wale bubble + cheezon ke upar tairte naam */
export function createUI3D(camera) {
  const layer = document.getElementById('ui3d');
  const v = new THREE.Vector3();
  const bubbles = [];
  const labels = new Map();

  function bubble(target, text, cls = '', dur = 3) {
    const el = document.createElement('div');
    el.className = 'bubble ' + cls;
    el.textContent = text;
    layer.appendChild(el);
    const b = { el, target, until: performance.now() + dur * 1000 };
    // ek insaan ka ek hi bubble
    for (const o of bubbles) if (o.target === target) o.until = 0;
    bubbles.push(b);
    if (bubbles.length > 7) bubbles[0].until = 0;
  }

  function place(el, wp, y) {
    v.set(wp.x, y, wp.z).project(camera);
    if (v.z > 1 || v.x < -1.2 || v.x > 1.2 || v.y < -1.2 || v.y > 1.2) { el.style.display = 'none'; return false; }
    el.style.display = '';
    el.style.transform = `translate(${((v.x + 1) / 2) * innerWidth}px, ${((1 - v.y) / 2) * innerHeight}px) translate(-50%, -100%)`;
    return true;
  }
  const tmp = new THREE.Vector3();
  function update() {
    const now = performance.now();
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      if (now > b.until) { b.el.remove(); bubbles.splice(i, 1); continue; }
      let wp, y;
      if (b.target.isObject3D) { b.target.getWorldPosition(tmp); wp = tmp; y = tmp.y + 2.25; } else { wp = b.target; y = (b.target.y || 0) + 2.3; }
      const d = camera.position.distanceTo(tmp.set(wp.x, y, wp.z));
      if (d > 45) { b.el.style.display = 'none'; continue; }
      place(b.el, wp, y);
      b.el.style.opacity = Math.min(1, (b.until - now) / 400);
    }
  }
  /** items: [{ key, x, y, z, text, hot }] */
  function setLabels(items) {
    const seen = new Set();
    for (const it of items) {
      seen.add(it.key);
      let el = labels.get(it.key);
      if (!el) { el = document.createElement('div'); el.className = 'lbl'; layer.appendChild(el); labels.set(it.key, el); }
      if (el.dataset.t !== it.text) { el.textContent = it.text; el.dataset.t = it.text; }
      const cn = 'lbl' + (it.hot ? ' hot' : '') + (it.cls ? ' ' + it.cls : '');
      if (el.className !== cn) el.className = cn;
      place(el, it, it.y);
    }
    for (const [k, el] of labels) if (!seen.has(k)) { el.remove(); labels.delete(k); }
  }
  return { bubble, setLabels, update };
}
