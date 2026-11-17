// 🤖 AI dialogue (client side) — /api/talk (Vercel function) se naye-naye dialogue.
// Har kirdaar/situation ka ek "pool": ek baar mein kai lines aati hain (bulk), ek-ek karke bolte hain,
// khatam hone se pehle pichhe se aur mangwa lete hain. AI na chale (key nahi, offline, dev server)
// to chup-chaap purani likhi lines — game kabhi atakta nahi.
import { registerHindi, setHindiFetcher } from './voice.js';

const URL_ = '/api/talk';
const pools = new Map(); // key → { lines: [], loading: false, used: Set, recent: [] }
let down = false, downUntil = 0;

async function call(req, timeout = 6000) {
  if (down && Date.now() < downUntil) return null;
  const ctl = new AbortController();
  const tm = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(URL_, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req), signal: ctl.signal });
    const ct = r.headers.get('content-type') || '';
    if (!r.ok || !ct.includes('json')) {
      // 503 = key nahi / 404 = local dev: der tak dobara mat poochho
      if (r.status === 503 || r.status === 404 || !ct.includes('json')) { down = true; downUntil = Date.now() + 10 * 60000; }
      else { down = true; downUntil = Date.now() + 30000; }
      return null;
    }
    down = false;
    const j = await r.json();
    if (!Array.isArray(j.lines)) return null;
    // har line ke saath uska Devanagari (desi aawaz ke liye) — yaad rakho, wapas sirf text
    const out = [];
    for (const l of j.lines) {
      const t = typeof l === 'string' ? l : l?.text;
      if (typeof t !== 'string' || !t.trim()) continue;
      if (l?.hindi) registerHindi(t, l.hindi);
      out.push(t);
    }
    return out;
  } catch {
    down = true; downUntil = Date.now() + 30000;
    return null;
  } finally { clearTimeout(tm); }
}

function refill(key, req) {
  const p = pools.get(key);
  if (p.loading) return;
  p.loading = true;
  // Claude ko batao kya bol chuke — wo naya likhe, dohraaye nahi
  call({ ...req, n: 8, avoid: p.recent.slice(-15) }).then((lines) => {
    p.loading = false;
    if (lines?.length) for (const l of lines) if (!p.used.has(l) && !p.lines.includes(l)) p.lines.push(l);
  });
}

/**
 * Turant ek line do: AI pool mein ho to wahan se, warna `fallback()` (purani lines).
 * key = kirdaar+situation (jaise 'girl:Priya:hello'), req = { who, role, situation, lang, spicy }
 */
export function aiLine(key, req, fallback) {
  let p = pools.get(key);
  if (!p) { p = { lines: [], loading: false, used: new Set(), recent: [] }; pools.set(key, p); }
  if (p.lines.length < 4) refill(key, req); // khatam hone se pehle hi aur mangwa lo
  const l = p.lines.shift();
  if (l) { p.used.add(l); p.recent.push(l); if (p.recent.length > 30) p.recent.shift(); return l; }
  return typeof fallback === 'function' ? fallback() : fallback;
}

/** Ek taaza line ka intezaar (mission intro jaisi jagah) — na mile to null. */
export async function aiFresh(req, timeout = 5000) {
  const lines = await call({ ...req, n: 1 }, timeout);
  return lines?.[0] || null;
}

/**
 * 💬 Seedhi baat-cheet: player ka text → kirdaar ka jawab { reply, mood, affinity, action }.
 * Na mile (key nahi / offline / time out) to null — tab game apna chhota jawab deta hai.
 */
export async function aiChat(payload, timeout = 9000) {
  if (down && Date.now() < downUntil) return null;
  const ctl = new AbortController();
  const tm = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(URL_, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, mode: 'chat' }), signal: ctl.signal });
    const ct = r.headers.get('content-type') || '';
    if (!r.ok || !ct.includes('json')) {
      if (r.status === 503 || r.status === 404 || !ct.includes('json')) { down = true; downUntil = Date.now() + 10 * 60000; }
      return null;
    }
    const j = await r.json();
    if (typeof j.reply !== 'string' || !j.reply.trim()) return null;
    if (j.hindi) registerHindi(j.reply, j.hindi);
    return j;
  } catch { return null; } finally { clearTimeout(tm); }
}

/** pehle se pool bhar lo (jaise sawari baithne se pehle) */
export function aiWarm(key, req) { if (!pools.has(key)) { pools.set(key, { lines: [], loading: false, used: new Set(), recent: [] }); refill(key, req); } }

export const aiAvailable = () => !(down && Date.now() < downUntil);

// 🔤 pehle se likhi Roman lines ka sahi Devanagari (voice.js agli baar ke liye yaad rakhta hai)
async function aiHindi(list) {
  if (down && Date.now() < downUntil) return null;
  try {
    const r = await fetch(URL_, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'hindi', list }) });
    if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) return null;
    const j = await r.json();
    return Array.isArray(j.hindi) ? j.hindi : null;
  } catch { return null; }
}
setHindiFetcher(aiHindi);
