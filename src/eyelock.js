import * as THREE from 'three';

// 🎬 Nazrein mili — jab paidal chalte hue koi ladki saamne se cross kare,
// waqt tham jaata hai: letterbox, over-the-shoulder shot, reverse shot, aankhon ka extreme closeup.
const LINES = [
  (n) => `Nazrein mili… aur waqt tham gaya ✨`,
  (n) => `${n} ne palat ke dekha… 👀💘`,
  (n) => `Pehli nazar ka asar… 💞`,
  (n) => `Dil ne kaha — bas yahi hai 🌸`,
  (n) => `Ek pal… aur ${n} muskura di 😊`,
  (n) => `Hawa ruk gayi, dhadkan badh gayi 💓`,
];
const DUR = 3.9;
const COOLDOWN = 45;

function ensureDom() {
  if (document.getElementById('eyeLock')) return;
  const st = document.createElement('style');
  st.textContent = `
#eyeLock { position: fixed; inset: 0; z-index: 34; pointer-events: none; opacity: 0; transition: opacity .35s; }
#eyeLock.on { opacity: 1; }
#eyeLock .b { position: absolute; left: 0; right: 0; height: 0; background: #000; transition: height .45s cubic-bezier(.2,.8,.2,1); }
#eyeLock.on .b { height: 12vh; }
#eyeLock .t { top: 0; } #eyeLock .d { bottom: 0; }
#eyeLock .vig { position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 45%, rgba(255, 70, 140, .22) 80%, rgba(40, 0, 20, .55)); }
#eyeLock .sub { position: absolute; left: 0; right: 0; bottom: 3.5vh; text-align: center; padding: 0 16px;
  color: #ffe2ef; font: italic 700 clamp(16px, 3.2vw, 26px)/1.3 system-ui, sans-serif; text-shadow: 0 0 14px #ff3d8b, 0 2px 6px #000;
  opacity: 0; transform: translateY(8px); transition: opacity .6s .5s, transform .6s .5s; }
#eyeLock.on .sub { opacity: 1; transform: none; }
#eyeLock .hearts { position: absolute; inset: 0; overflow: hidden; }
#eyeLock .hearts i { position: absolute; bottom: -30px; font-style: normal; animation: elFloat 3.6s ease-in forwards; opacity: .85; }
@keyframes elFloat { to { transform: translateY(-80vh) rotate(25deg); opacity: 0; } }`;
  document.head.appendChild(st);
  const d = document.createElement('div');
  d.id = 'eyeLock';
  d.innerHTML = '<div class="vig"></div><div class="hearts"></div><div class="b t"></div><div class="b d"></div><div class="sub"></div>';
  document.body.appendChild(d);
}

export function createEyeLock({ camera, onStart }) {
  ensureDom();
  const el = document.getElementById('eyeLock');
  const hp = new THREE.Vector3(), hg = new THREE.Vector3(), dir = new THREE.Vector3(), right = new THREE.Vector3();
  const pos = new THREE.Vector3(), look = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  let cur = null, cdUntil = 25, baseFov = 60;

  function hearts() {
    const box = el.querySelector('.hearts');
    box.innerHTML = '';
    for (let i = 0; i < 10; i++) {
      const h = document.createElement('i');
      h.textContent = ['💗', '💖', '🌸', '✨'][i % 4];
      h.style.left = `${5 + Math.random() * 90}%`;
      h.style.fontSize = `${14 + Math.random() * 18}px`;
      h.style.animationDelay = `${0.3 + Math.random() * 1.6}s`;
      box.appendChild(h);
    }
  }

  return {
    get active() { return !!cur; },
    /** har frame: trigger check. true lautaye to camera isi ke haath mein hai */
    update(dt, t, { mode, walker, me, girls, blocked }) {
      if (!cur) {
        if (blocked || mode !== 'foot' || t < cdUntil || walker.speed < 0.8) return false;
        const fx = -Math.sin(walker.heading), fz = -Math.cos(walker.heading);
        for (const n of girls) {
          if (n.type !== 'walker' || n.hidden || n.fall > 0 || n.talking || n.girl.gf) continue;
          const dx = n.x - walker.pos.x, dz = n.z - walker.pos.z, d = Math.hypot(dx, dz);
          if (d > 3.4 || d < 1.1) continue;
          if ((dx * fx + dz * fz) / d < 0.55) continue; // saamne ho
          const gfx = -Math.sin(n.heading), gfz = -Math.cos(n.heading);
          if (gfx * fx + gfz * fz > -0.3) continue; // saamne se aa rahi ho (cross)
          cur = { n, t: 0, line: LINES[Math.floor(Math.random() * LINES.length)](n.girl.name || 'Woh') };
          baseFov = camera.fov;
          n.pause = DUR + 1.2; n.pauseAct = 'idle'; n.faceTo = { x: walker.pos.x, z: walker.pos.z };
          n.girl.affinity = Math.min(1, (n.girl.affinity || 0) + 0.06);
          el.querySelector('.sub').textContent = cur.line;
          hearts();
          el.classList.add('on');
          onStart?.(n);
          break;
        }
        if (!cur) return false;
      }

      const c = cur, n = c.n;
      c.t += dt;
      walker.speed = 0;
      // dono ek dusre ki taraf mude
      const toG = Math.atan2(-(n.x - walker.pos.x), -(n.z - walker.pos.z));
      walker.heading += Math.atan2(Math.sin(toG - walker.heading), Math.cos(toG - walker.heading)) * Math.min(1, dt * 6);
      me.root.rotation.y = walker.heading;
      me.look = 0;
      n.faceTo = { x: walker.pos.x, z: walker.pos.z };
      n.h.look = 0;

      me.headPivot.getWorldPosition(hp); hp.y += 0.13;
      n.h.headPivot.getWorldPosition(hg); hg.y += 0.13;
      dir.subVectors(hg, hp); dir.y = 0;
      if (dir.lengthSq() < 1e-4) dir.set(0, 0, -1);
      dir.normalize();
      right.crossVectors(dir, up).normalize();

      let fov;
      const k = c.t;
      if (k < 1.35) {
        // shot 1: uske kandhe ke peeche se — ladki ka chehra
        const push = k / 1.35;
        pos.copy(hp).addScaledVector(dir, -0.6 + push * 0.15).addScaledVector(right, 0.32).y += 0.06;
        look.copy(hg); fov = 30 - push * 3;
      } else if (k < 2.5) {
        // shot 2: reverse — hero ka chehra
        const push = (k - 1.35) / 1.15;
        pos.copy(hg).addScaledVector(dir, 0.6 - push * 0.15).addScaledVector(right, -0.32).y += 0.06;
        look.copy(hp); fov = 30 - push * 3;
      } else {
        // shot 3: aankhon ka extreme closeup, dheere dolly-in
        const push = Math.min(1, (k - 2.5) / 1.4);
        pos.copy(hg).addScaledVector(dir, -(0.7 - push * 0.2)).y += 0.015;
        look.copy(hg).y += 0.01; fov = 16 - push * 3;
      }
      camera.position.copy(pos);
      camera.lookAt(look);
      camera.rotation.z += Math.sin(t * 0.8) * 0.01;
      camera.fov = fov;
      camera.updateProjectionMatrix();

      if (c.t >= DUR) {
        cur = null;
        cdUntil = t + COOLDOWN;
        el.classList.remove('on');
        camera.fov = baseFov;
        camera.updateProjectionMatrix();
        return false;
      }
      return true;
    },
  };
}
