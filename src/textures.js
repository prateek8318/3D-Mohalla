import * as THREE from 'three';

export const FONT = '"Baloo 2", "Nirmala UI", "Noto Sans Devanagari", "Mangal", sans-serif';

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}
function tex(c, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

const signCache = new Map();
/** Neon signboard texture (Devanagari friendly). */
export function signTexture(text, sub = '', color = '#ff3d7f', w = 1024, h = 256) {
  const key = [text, sub, color, w, h].join('|');
  if (signCache.has(key)) return signCache.get(key);
  const c = canvas(w, h);
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(14,5,26,0.94)';
  rr(g, 4, 4, w - 8, h - 8, h * 0.12);
  g.fill();
  g.save();
  g.shadowColor = color;
  g.shadowBlur = h * 0.12;
  g.lineWidth = h * 0.035;
  g.strokeStyle = color;
  rr(g, h * 0.07, h * 0.07, w - h * 0.14, h - h * 0.14, h * 0.09);
  g.stroke();
  g.restore();

  g.textAlign = 'center';
  g.textBaseline = 'middle';
  let size = sub ? h * 0.44 : h * 0.56;
  g.font = `800 ${size}px ${FONT}`;
  while (g.measureText(text).width > w * 0.86 && size > 10) {
    size -= 2;
    g.font = `800 ${size}px ${FONT}`;
  }
  g.shadowColor = color;
  g.shadowBlur = h * 0.09;
  g.fillStyle = '#ffffff';
  const ty = sub ? h * 0.43 : h * 0.54;
  g.fillText(text, w / 2, ty);
  g.shadowBlur = 0;
  g.fillText(text, w / 2, ty);
  if (sub) {
    let s2 = h * 0.17;
    g.font = `700 ${s2}px ${FONT}`;
    while (g.measureText(sub).width > w * 0.8 && s2 > 8) {
      s2 -= 1;
      g.font = `700 ${s2}px ${FONT}`;
    }
    g.shadowBlur = h * 0.05;
    g.fillStyle = color;
    g.fillText(sub, w / 2, h * 0.76);
  }
  const t = tex(c);
  signCache.set(key, t);
  return t;
}

/** Building facade: colour map (tinted by material colour) + emissive map for lit windows. */
export function buildingTextures(seed) {
  const r = rng(seed);
  const S = 256;
  const cm = canvas(S, S), ce = canvas(S, S);
  const gm = cm.getContext('2d'), ge = ce.getContext('2d');
  gm.fillStyle = '#ffffff';
  gm.fillRect(0, 0, S, S);
  ge.fillStyle = '#000000';
  ge.fillRect(0, 0, S, S);
  // grime
  for (let i = 0; i < 250; i++) {
    gm.fillStyle = `rgba(0,0,0,${r() * 0.06})`;
    gm.fillRect(r() * S, r() * S, 2 + r() * 14, 2 + r() * 30);
  }
  const cols = 4, rows = 4, cw = S / cols, ch = S / rows;
  const lits = ['#ffcf7a', '#ffb35c', '#ffd9a0', '#cfe6ff', '#ff9de2', '#9dffea', '#ffe27a'];
  for (let y = 0; y < rows; y++) {
    gm.fillStyle = 'rgba(0,0,0,0.16)';
    gm.fillRect(0, y * ch + ch - 7, S, 7);
    for (let x = 0; x < cols; x++) {
      const wx = x * cw + cw * 0.2, wy = y * ch + ch * 0.18, ww = cw * 0.6, wh = ch * 0.56;
      const lit = r() < 0.55;
      if (lit) {
        const col = lits[Math.floor(r() * (r() < 0.7 ? 3 : lits.length))];
        gm.fillStyle = col;
        ge.fillStyle = col;
        gm.fillRect(wx, wy, ww, wh);
        ge.fillRect(wx, wy, ww, wh);
        if (r() < 0.5) {
          // curtain
          const cc = `rgba(${(r() * 255) | 0},${(r() * 120) | 0},${(r() * 160) | 0},0.55)`;
          ge.fillStyle = cc;
          gm.fillStyle = cc;
          ge.fillRect(wx, wy, ww * 0.35, wh);
          gm.fillRect(wx, wy, ww * 0.35, wh);
        }
      } else {
        gm.fillStyle = '#1a1730';
        gm.fillRect(wx, wy, ww, wh);
      }
      gm.strokeStyle = 'rgba(0,0,0,0.4)';
      gm.lineWidth = 3;
      gm.strokeRect(wx, wy, ww, wh);
      if (r() < 0.35) {
        // balcony railing
        gm.fillStyle = 'rgba(50,35,25,0.75)';
        gm.fillRect(wx - 6, wy + wh + 2, ww + 12, 8);
        for (let k = 0; k < 6; k++) gm.fillRect(wx - 6 + k * ((ww + 12) / 5), wy + wh - 10, 2, 12);
      }
    }
  }
  const map = tex(cm), em = tex(ce);
  for (const t of [map, em]) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return { map, em };
}

export function stripeTexture(c1, c2, n = 8, diagonal = false) {
  const S = 256;
  const c = canvas(S, S);
  const g = c.getContext('2d');
  g.fillStyle = c1;
  g.fillRect(0, 0, S, S);
  g.fillStyle = c2;
  const sw = S / n;
  if (!diagonal) {
    for (let i = 0; i < n; i += 2) g.fillRect(i * sw, 0, sw, S);
  } else {
    for (let i = -n; i < n * 2; i += 2) {
      g.beginPath();
      g.moveTo(i * sw, 0);
      g.lineTo(i * sw + sw, 0);
      g.lineTo(i * sw + sw + S, S);
      g.lineTo(i * sw + S, S);
      g.fill();
    }
  }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

let _glow;
export function glowTexture() {
  if (_glow) return _glow;
  const c = canvas(128, 128);
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  _glow = tex(c);
  return _glow;
}

export function heartTexture() {
  const c = canvas(64, 64);
  const g = c.getContext('2d');
  g.shadowColor = '#ff2d75';
  g.shadowBlur = 10;
  g.fillStyle = '#ff5c97';
  g.beginPath();
  g.moveTo(32, 52);
  g.bezierCurveTo(6, 34, 8, 12, 22, 12);
  g.bezierCurveTo(28, 12, 31, 16, 32, 20);
  g.bezierCurveTo(33, 16, 36, 12, 42, 12);
  g.bezierCurveTo(56, 12, 58, 34, 32, 52);
  g.fill();
  return tex(c);
}

export function roadTexture() {
  const c = canvas(256, 512);
  const g = c.getContext('2d');
  g.fillStyle = '#26232c';
  g.fillRect(0, 0, 256, 512);
  const r = rng(3);
  for (let i = 0; i < 3000; i++) {
    const v = 25 + r() * 35;
    g.fillStyle = `rgb(${v},${v},${v + 6})`;
    g.fillRect(r() * 256, r() * 512, 2, 2);
  }
  // patches (desi road ki pehchaan)
  for (let i = 0; i < 6; i++) {
    g.fillStyle = 'rgba(10,10,14,0.5)';
    g.beginPath();
    g.ellipse(r() * 256, r() * 512, 10 + r() * 30, 8 + r() * 20, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = '#e8b923';
  for (let y = 0; y < 512; y += 128) g.fillRect(124, y + 20, 8, 70);
  g.fillStyle = 'rgba(255,255,255,0.6)';
  g.fillRect(8, 0, 5, 512);
  g.fillRect(243, 0, 5, 512);
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

const POSTERS = [
  ['मोहल्ले का दबंग', '#ff3d3d', '#2a0a3a'], ['प्यार का पंगा', '#ff5c97', '#301040'], ['चाय वाला हीरो', '#ffb000', '#5a1010'],
  ['नागिन vs नेवला', '#3dff7a', '#0a2a1a'], ['रिक्शा किंग', '#2ef2ff', '#1a1050'], ['दिल का चोर', '#ff9a1f', '#3a0a0a'],
];
const posterCache = [];
/** 90s filmy poster (naam sab kaalpanik hain) */
export function posterTexture(i) {
  i %= POSTERS.length;
  if (posterCache[i]) return posterCache[i];
  const [title, c1, c2] = POSTERS[i];
  const c = canvas(256, 360);
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 360);
  grd.addColorStop(0, c1);
  grd.addColorStop(1, c2);
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 360);
  g.fillStyle = 'rgba(255,240,200,0.25)';
  g.beginPath();
  g.arc(128, 170, 110, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(0,0,0,0.6)';
  g.beginPath();
  g.arc(105, 150, 34, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.moveTo(40, 330); g.lineTo(70, 200); g.lineTo(140, 200); g.lineTo(170, 330);
  g.fill();
  g.beginPath();
  g.arc(185, 185, 24, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.moveTo(140, 330); g.lineTo(162, 225); g.lineTo(208, 225); g.lineTo(235, 330);
  g.fill();
  g.textAlign = 'center';
  let s = 42;
  g.font = `800 ${s}px ${FONT}`;
  while (g.measureText(title).width > 232) { s -= 2; g.font = `800 ${s}px ${FONT}`; }
  g.lineWidth = 6;
  g.strokeStyle = '#000';
  g.strokeText(title, 128, 64);
  g.fillStyle = '#fff6d0';
  g.fillText(title, 128, 64);
  g.font = `700 17px ${FONT}`;
  g.fillStyle = '#ffd23f';
  g.fillText('शुक्रवार से सिनेमाघरों में', 128, 350);
  const r = rng(i + 50);
  for (let k = 0; k < 60; k++) {
    g.fillStyle = `rgba(255,255,255,${r() * 0.35})`;
    g.fillRect(r() * 256, r() * 360, 1 + r() * 4, 1 + r() * 4);
  }
  posterCache[i] = tex(c);
  return posterCache[i];
}

export function stoneTexture() {
  const c = canvas(256, 256);
  const g = c.getContext('2d');
  g.fillStyle = '#8a7a66';
  g.fillRect(0, 0, 256, 256);
  const r = rng(11);
  for (let y = 0; y < 256; y += 32)
    for (let x = (y / 32) % 2 ? -32 : 0; x < 256; x += 64) {
      const v = 110 + r() * 40;
      g.fillStyle = `rgb(${v},${v * 0.9},${v * 0.75})`;
      g.fillRect(x + 2, y + 2, 60, 28);
    }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
