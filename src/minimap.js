import { DRIVE, FOOT, BOXES, CIRCLES, PARK, GALI, THANA } from './collide.js';
import { HOTEL_AREA } from './hotel.js';

const W0 = -450, W1 = 450, Z0 = -135, Z1 = 665, PX = 2.4; // px per meter (ring road tak)

/** GTA jaisa naksha — chhota (gol) + bada (zoom / pan / tap = GPS raasta) */
export function buildMinimap(el, { triggers, zones = {}, extraIcons = [], onPick = null, onGo = null, onClear = null }) {
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
  let big = false, view = null, zoom = 1, panX = (W0 + W1) / 2, panZ = (Z0 + Z1) / 2, follow = false, lastP = { x: 0, z: 0 };
  let nav = null; // { wp: {x,z}, route: [{x,z}], dist }

  // ---- bada naksha ka UI ----
  const head = document.createElement('div');
  head.className = 'mm-head';
  head.innerHTML = `<div class="mm-title"><b>🗺️ Naksha</b><small>Tap = GPS raasta • Scroll / pinch = zoom • Khincho = idhar-udhar</small></div>
    <div class="mm-acts"><button class="mm-go hidden">🚀 Seedha pahuncho</button><button class="mm-clr hidden">🗑️ Raasta hatao</button><button class="mm-x" aria-label="Band karo">✕</button></div>`;
  el.appendChild(head);
  const ctrls = document.createElement('div');
  ctrls.className = 'mm-ctrls';
  ctrls.innerHTML = '<button data-z="in" title="Zoom in">＋</button><button data-z="out" title="Zoom out">－</button><button data-z="me" title="Mere paas">◎</button><button data-z="all" title="Poora shehar">⤢</button>';
  el.appendChild(ctrls);
  const navCard = document.createElement('div');
  navCard.className = 'mm-navcard hidden';
  el.appendChild(navCard);
  const shade = document.createElement('div');
  shade.className = 'mm-shade hidden';
  document.body.appendChild(shade);

  const fitScale = () => Math.min(el.clientWidth / (W1 - W0), el.clientHeight / (Z1 - Z0));
  const clampPan = () => {
    const s = fitScale() * zoom, hw = el.clientWidth / 2 / s, hh = el.clientHeight / 2 / s;
    panX = Math.max(W0 + Math.min(hw, (W1 - W0) / 2), Math.min(W1 - Math.min(hw, (W1 - W0) / 2), panX));
    panZ = Math.max(Z0 + Math.min(hh, (Z1 - Z0) / 2), Math.min(Z1 - Math.min(hh, (Z1 - Z0) / 2), panZ));
  };
  const setZoom = (z, ax, az) => {
    const nz = Math.max(1, Math.min(9, z));
    if (ax !== undefined) { const k = 1 - zoom / nz; panX += (ax - panX) * k; panZ += (az - panZ) * k; }
    zoom = nz; follow = false; clampPan();
  };
  const setBig = (v) => {
    big = v; el.classList.toggle('big', big); shade.classList.toggle('hidden', !big);
    if (big) { zoom = 1.6; panX = lastP.x; panZ = lastP.z; requestAnimationFrame(clampPan); }
  };
  head.querySelector('.mm-x').addEventListener('click', (e) => { e.stopPropagation(); setBig(false); });
  head.querySelector('.mm-go').addEventListener('click', (e) => { e.stopPropagation(); if (nav && onGo) { setBig(false); onGo(nav.wp.x, nav.wp.z); } });
  head.querySelector('.mm-clr').addEventListener('click', (e) => { e.stopPropagation(); onClear?.(); });
  ctrls.addEventListener('click', (e) => {
    e.stopPropagation();
    const b = e.target.closest('button'); if (!b) return;
    const k = b.dataset.z;
    if (k === 'in') setZoom(zoom * 1.6);
    else if (k === 'out') setZoom(zoom / 1.6);
    else if (k === 'me') { zoom = Math.max(zoom, 3); panX = lastP.x; panZ = lastP.z; follow = true; clampPan(); }
    else { zoom = 1; panX = (W0 + W1) / 2; panZ = (Z0 + Z1) / 2; follow = false; }
  });
  shade.addEventListener('click', () => setBig(false));
  const toWorld = (cx, cy) => {
    const r = cv.getBoundingClientRect();
    return { x: view.cxw + (cx - r.left - view.w / 2) / view.s, z: view.czw + (cy - r.top - view.h / 2) / view.s };
  };
  // pointer: tap / drag-pan / pinch-zoom
  const ptrs = new Map();
  let downAt = null, moved = 0, pinch0 = 0, zoom0 = 1;
  el.addEventListener('pointerdown', (e) => {
    if (!big || head.contains(e.target) || ctrls.contains(e.target)) return;
    try { el.setPointerCapture(e.pointerId); } catch { /* kuch browser mein nahi chalta */ }
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) { downAt = { x: e.clientX, y: e.clientY }; moved = 0; }
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = zoom; moved = 99; }
  });
  el.addEventListener('pointermove', (e) => {
    if (!big || !ptrs.has(e.pointerId) || !view) return;
    const prev = ptrs.get(e.pointerId);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = toWorld((a.x + b.x) / 2, (a.y + b.y) / 2);
      if (pinch0 > 0) setZoom(zoom0 * (d / pinch0), mid.x, mid.z);
      return;
    }
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 6) { panX -= dx / view.s; panZ -= dy / view.s; follow = false; clampPan(); }
  });
  const up = (e) => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.delete(e.pointerId);
    if (ptrs.size === 0 && downAt && moved <= 6 && view && onPick) { const w = toWorld(e.clientX, e.clientY); onPick(w.x, w.z); }
    if (ptrs.size === 0) downAt = null;
  };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', (e) => ptrs.delete(e.pointerId));
  el.addEventListener('wheel', (e) => {
    if (!big || !view) return;
    e.preventDefault();
    const w = toWorld(e.clientX, e.clientY);
    setZoom(zoom * (e.deltaY < 0 ? 1.18 : 1 / 1.18), w.x, w.z);
  }, { passive: false });
  el.addEventListener('click', (e) => { if (!big) setBig(true); e.stopPropagation(); });

  const ZONE_NAMES = [['🌾 Rampur Gaon', -300, 170], ['🏙️ Cyber City', 300, 170], ['🕌 Purana Shehar', 0, 560], ['🏘️ Mohalla', 0, 90], ['🌊 Ganga Ghat', 0, -128]];
  const icons = triggers.filter((t) => t.def.avatar).map((t) => ({ x: t.x, z: t.z, a: t.def.avatar, c: t.def.color || '#fff', big: ['mandir', 'masjid', 'ghat', 'hotel'].includes(t.def.id) }));
  icons.push(...extraIcons, { x: 0, z: 456, a: '🚂', big: true }, { x: 75, z: 100, a: '🏨', big: true }, { x: 130, z: 140, a: '🚓', big: true }, { x: -135, z: 141, a: '🏏', big: true }, { x: -50, z: 200, a: '🛍️', big: true });

  const toS = (x, z, cxw, czw, s, w, h) => [w / 2 + (x - cxw) * s, h / 2 + (z - czw) * s];
  const draw = function draw(p, heading, extra) {
    lastP = { x: p.x, z: p.z };
    const w = el.clientWidth, h = el.clientHeight;
    const dpr = Math.min(2, devicePixelRatio);
    // BUG FIX: 125% scaling pe w*dpr dashmlav hota tha → har frame canvas reset → naksha jhilmilata tha
    const cw = Math.round(w * dpr), chh = Math.round(h * dpr);
    if (cv.width !== cw || cv.height !== chh) { cv.width = cw; cv.height = chh; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#120c1c';
    ctx.fillRect(0, 0, w, h);
    if (big && follow) { panX = p.x; panZ = p.z; clampPan(); }
    const s = big ? fitScale() * zoom : 1.1;
    const cxw = big ? panX : p.x, czw = big ? panZ : p.z;
    ctx.imageSmoothingEnabled = big && s > PX * 0.6;
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
    // 🧭 GPS raasta — chamakti line
    if (nav && nav.route.length > 1) {
      ctx.lineJoin = ctx.lineCap = 'round';
      for (const [lw, col] of [[big ? 9 : 7, 'rgba(0,0,0,.55)'], [big ? 5.5 : 4, '#b46bff'], [big ? 2 : 1.5, '#f2e4ff']]) {
        ctx.strokeStyle = col; ctx.lineWidth = lw;
        ctx.beginPath();
        nav.route.forEach((q, i) => { const [x, y] = S(q.x, q.z); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
        ctx.stroke();
      }
    }
    if (big) {
      ctx.font = `700 ${Math.min(18, 11 + zoom * 1.5)}px "Baloo 2", sans-serif`; ctx.textAlign = 'center';
      for (const [t, x, z] of ZONE_NAMES) { const [px, py] = S(x, z); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillText(t, px + 1, py + 1); ctx.fillStyle = '#fff4e6'; ctx.fillText(t, px, py); }
    }
    ctx.font = `${big ? Math.min(26, 13 + zoom * 1.6) : 12}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const ic of icons) {
      if (!big && !ic.big && Math.hypot(ic.x - p.x, ic.z - p.z) > 70) continue;
      if (big && !ic.big && zoom < 2.2) continue;
      const [x, y] = S(ic.x, ic.z);
      if (x < -10 || y < -10 || x > w + 10 || y > h + 10) continue;
      ctx.fillText(ic.a, x, y);
    }
    for (const m of extra) {
      let [x, y] = S(m.x, m.z);
      if (m.edge && !big) {
        const ddx = x - w / 2, ddy = y - h / 2, dd = Math.hypot(ddx, ddy), rr = w / 2 - 8;
        if (dd > rr) { x = w / 2 + (ddx / dd) * rr; y = h / 2 + (ddy / dd) * rr; }
      }
      ctx.fillStyle = m.c;
      ctx.beginPath(); ctx.arc(x, y, m.r || 3, 0, 7); ctx.fill();
    }
    // 📍 GPS pin
    if (nav) {
      let [x, y] = S(nav.wp.x, nav.wp.z);
      if (!big) { const ddx = x - w / 2, ddy = y - h / 2, dd = Math.hypot(ddx, ddy), rr = w / 2 - 10; if (dd > rr) { x = w / 2 + (ddx / dd) * rr; y = h / 2 + (ddy / dd) * rr; } }
      ctx.fillStyle = '#b46bff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y - 12, 7, Math.PI * 0.75, Math.PI * 2.25); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y - 12, 2.6, 0, 7); ctx.fill();
    }
    // player teer
    const [px, py] = S(p.x, p.z);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-heading);
    const k = big ? 1.3 : 1;
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -8 * k); ctx.lineTo(6 * k, 6 * k); ctx.lineTo(0, 3 * k); ctx.lineTo(-6 * k, 6 * k); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  };
  draw.open = () => setBig(true);
  draw.close = () => setBig(false);
  draw.isBig = () => big;
  draw.setNav = (n) => {
    nav = n;
    head.querySelector('.mm-go').classList.toggle('hidden', !n);
    head.querySelector('.mm-clr').classList.toggle('hidden', !n);
    navCard.classList.toggle('hidden', !n);
    if (n) navCard.innerHTML = `<b>📍 ${n.label || 'Manzil'}</b><span>${n.dist < 1000 ? Math.round(n.dist) + ' m' : (n.dist / 1000).toFixed(1) + ' km'} • ${Math.max(1, Math.round(n.dist / (n.drive ? 11 : 4) / 60))} min</span>`;
  };
  return draw;
}
