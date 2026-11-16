import { DRIVE, FOOT, BOXES, CIRCLES, PARK, GALI, THANA } from './collide.js';
import { HOTEL_AREA } from './hotel.js';

const W0 = -310, W1 = 310, Z0 = -135, Z1 = 480, PX = 1.6; // px per meter

/** GTA jaisa chhota naksha */
export function buildMinimap(el, { triggers }) {
  const bg = document.createElement('canvas');
  bg.width = (W1 - W0) * PX; bg.height = (Z1 - Z0) * PX;
  const g = bg.getContext('2d');
  const R = (r, c) => { g.fillStyle = c; g.fillRect((r.x0 - W0) * PX, (r.z0 - Z0) * PX, (r.x1 - r.x0) * PX, (r.z1 - r.z0) * PX); };
  g.fillStyle = '#1d1726'; g.fillRect(0, 0, bg.width, bg.height);
  g.fillStyle = '#1b3a6a'; g.fillRect(0, (-123 - Z0) * PX, bg.width, (-Z0 - 123) * PX + 10);
  FOOT.forEach((r) => R(r, '#6b5f58'));
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
  let big = false;
  el.addEventListener('click', () => { big = !big; el.classList.toggle('big', big); });
  const icons = triggers.filter((t) => t.def.avatar).map((t) => ({ x: t.x, z: t.z, a: t.def.avatar, c: t.def.color || '#fff', big: ['mandir', 'masjid', 'ghat', 'hotel'].includes(t.def.id) }));
  icons.push({ x: 0, z: 456, a: '🚂', big: true }, { x: 75, z: 100, a: '🏨', big: true }, { x: 130, z: 140, a: '🚓', big: true }, { x: -135, z: 141, a: '🏏', big: true }, { x: -50, z: 200, a: '🛍️', big: true });

  const toS = (x, z, cxw, czw, s, w, h) => [w / 2 + (x - cxw) * s, h / 2 + (z - czw) * s];
  return function draw(p, heading, extra) {
    const w = el.clientWidth, h = el.clientHeight;
    const dpr = Math.min(2, devicePixelRatio);
    if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
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
}
