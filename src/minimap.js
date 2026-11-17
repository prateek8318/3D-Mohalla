import { DRIVE, FOOT, BOXES, CIRCLES, PARK, GALI, THANA } from './collide.js';
import { HOTEL_AREA } from './hotel.js';

const W0 = -450, W1 = 450, Z0 = -135, Z1 = 665, PX = 1.6; // px per meter (ring road tak)

/** GTA jaisa chhota naksha */
export function buildMinimap(el, { triggers, zones = {}, extraIcons = [], onPick = null }) {
  const bg = document.createElement('canvas');
  bg.width = (W1 - W0) * PX; bg.height = (Z1 - Z0) * PX;
  const g = bg.getContext('2d');
  const R = (r, c) => { g.fillStyle = c; g.fillRect((r.x0 - W0) * PX, (r.z0 - Z0) * PX, (r.x1 - r.x0) * PX, (r.z1 - r.z0) * PX); };
  g.fillStyle = '#1d1726'; g.fillRect(0, 0, bg.width, bg.height);
  g.fillStyle = '#1b3a6a'; g.fillRect(0, (-123 - Z0) * PX, bg.width, (-Z0 - 123) * PX + 10);
  FOOT.forEach((r) => R(r, '#6b5f58'));
  for (const [k, r] of Object.entries(zones)) R(r, k.startsWith('gaon') || k === 'oldNW' ? '#4a5a2c' : k.startsWith('tech') || k === 'oldNE' ? '#2a3550' : '#6a4f40');
  R(PARK, '#3f6a2c');
  R(GALI, '#9a7a4a');
  R(THANA, '#4a5a7a');
  R(HOTEL_AREA, '#b08a3a');
  DRIVE.forEach((r) => R(r, '#8a8a92'));
  BOXES.forEach((b) => { if (b.x1 - b.x0 > 3 || b.z1 - b.z0 > 3) R(b, '#2e2638'); });
  g.fillStyle = '#ff3d7f';
  for (const c of CIRCLES) if (c.r > 3) { g.beginPath(); g.arc((c.x - W0) * PX, (c.z - Z0) * PX, c.r * PX, 0, 7); g.fill(); }

  const cv = document.createElement('canvas');
  el.appendChild(cv);
  const ctx = cv.getContext('2d');
  let big = false, view = null;
  // bada naksha: upar title + band button, peeche andhera parda
  const head = document.createElement('div');
  head.className = 'mm-head';
  head.innerHTML = '<div><b>🗺️ Naksha</b><small>Kahin bhi tap karo — wahin pahunch jaoge</small></div><button class="mm-x" aria-label="Band karo">✕</button>';
  el.appendChild(head);
  const shade = document.createElement('div');
  shade.className = 'mm-shade hidden';
  document.body.appendChild(shade);
  const setBig = (v) => { big = v; el.classList.toggle('big', big); shade.classList.toggle('hidden', !big); };
  head.querySelector('.mm-x').addEventListener('click', (e) => { e.stopPropagation(); setBig(false); });
  shade.addEventListener('click', () => setBig(false));
  el.addEventListener('click', (e) => {
    if (!big) { setBig(true); return; }
    if (!view || !onPick || head.contains(e.target)) return;
    const r = cv.getBoundingClientRect();
    const x = view.cxw + (e.clientX - r.left - view.w / 2) / view.s;
    const z = view.czw + (e.clientY - r.top - view.h / 2) / view.s;
    setBig(false);
    onPick(x, z);
  });
  const ZONE_NAMES = [['🌾 Rampur Gaon', -300, 170], ['🏙️ Cyber City', 300, 170], ['🕌 Purana Shehar', 0, 560], ['🏘️ Mohalla', 0, 90], ['🌊 Ganga Ghat', 0, -128]];
  const icons = triggers.filter((t) => t.def.avatar).map((t) => ({ x: t.x, z: t.z, a: t.def.avatar, c: t.def.color || '#fff', big: ['mandir', 'masjid', 'ghat', 'hotel'].includes(t.def.id) }));
  icons.push(...extraIcons, { x: 0, z: 456, a: '🚂', big: true }, { x: 75, z: 100, a: '🏨', big: true }, { x: 130, z: 140, a: '🚓', big: true }, { x: -135, z: 141, a: '🏏', big: true }, { x: -50, z: 200, a: '🛍️', big: true });

  const toS = (x, z, cxw, czw, s, w, h) => [w / 2 + (x - cxw) * s, h / 2 + (z - czw) * s];
  const draw = function draw(p, heading, extra) {
    const w = el.clientWidth, h = el.clientHeight;
    const dpr = Math.min(2, devicePixelRatio);
    // BUG FIX: 125% scaling pe w*dpr dashmlav hota tha → har frame canvas reset → naksha jhilmilata tha
    const cw = Math.round(w * dpr), chh = Math.round(h * dpr);
    if (cv.width !== cw || cv.height !== chh) { cv.width = cw; cv.height = chh; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // flicker-proof: pehle solid background, phir map (bina clearRect ke)
    ctx.fillStyle = '#120c1c';
    ctx.fillRect(0, 0, w, h);
    // north-up; badi map mein poora shehar
    const s = big ? Math.min(w / (W1 - W0), h / (Z1 - Z0)) : 1.1;
    const cxw = big ? (W0 + W1) / 2 : p.x, czw = big ? (Z0 + Z1) / 2 : p.z;
    ctx.imageSmoothingEnabled = false;
    // source rect ko bg image ke andar clamp karo warna kinare pe khaali flash hota hai
    let sx = (cxw - W0) * PX - (w / 2) / s * PX, sy = (czw - Z0) * PX - (h / 2) / s * PX;
    let sw = (w / s) * PX, sh = (h / s) * PX;
    let dx = 0, dy = 0, dw = w, dh = h;
    if (sx < 0) { dx = -sx / sw * w; dw -= dx; sw += sx; sx = 0; }
    if (sy < 0) { dy = -sy / sh * h; dh -= dy; sh += sy; sy = 0; }
    if (sx + sw > bg.width) { const over = sx + sw - bg.width; dw -= over / sw * w; sw -= over; }
    if (sy + sh > bg.height) { const over = sy + sh - bg.height; dh -= over / sh * h; sh -= over; }
    if (sw > 0 && sh > 0) ctx.drawImage(bg, sx, sy, sw, sh, dx, dy, dw, dh);
    const S = (x, z) => toS(x, z, cxw, czw, s, w, h);
    view = { s, cxw, czw, w, h };
    if (big) {
      ctx.font = '700 13px "Baloo 2", sans-serif'; ctx.textAlign = 'center';
      for (const [t, x, z] of ZONE_NAMES) { const [px, py] = S(x, z); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillText(t, px + 1, py + 1); ctx.fillStyle = '#fff4e6'; ctx.fillText(t, px, py); }
    }
    ctx.font = `${big ? 16 : 12}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const ic of icons) {
      if (!big && !ic.big && Math.hypot(ic.x - p.x, ic.z - p.z) > 70) continue;
      const [x, y] = S(ic.x, ic.z);
      if (x < -10 || y < -10 || x > w + 10 || y > h + 10) continue;
      ctx.fillText(ic.a, x, y);
    }
    for (const m of extra) {
      let [x, y] = S(m.x, m.z);
      if (m.edge && !big) {
        const dx = x - w / 2, dy = y - h / 2, dd = Math.hypot(dx, dy), rr = w / 2 - 8;
        if (dd > rr) { x = w / 2 + (dx / dd) * rr; y = h / 2 + (dy / dd) * rr; }
      }
      ctx.fillStyle = m.c;
      ctx.beginPath(); ctx.arc(x, y, m.r || 3, 0, 7); ctx.fill();
    }
    // player teer
    const [px, py] = S(p.x, p.z);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-heading);
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(6, 6); ctx.lineTo(0, 3); ctx.lineTo(-6, 6); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  };
  draw.open = () => setBig(true);
  draw.close = () => setBig(false);
  draw.isBig = () => big;
  return draw;
}
