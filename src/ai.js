// 🤖 AI dialogue (client side) — /api/talk (Vercel function) se naye-naye dialogue.
// Har kirdaar/situation ka ek "pool": ek baar mein kai lines aati hain (bulk), ek-ek karke bolte hain,
// khatam hone se pehle pichhe se aur mangwa lete hain. AI na chale (key nahi, offline, dev server)
// to chup-chaap purani likhi lines — game kabhi atakta nahi.
const URL_ = '/api/talk';
const pools = new Map(); // key → { lines: [], loading: false, used: Set }
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
    return Array.isArray(j.lines) ? j.lines.filter((l) => typeof l === 'string' && l.trim()) : null;
  } catch {
    down = true; downUntil = Date.now() + 30000;
    return null;
  } finally { clearTimeout(tm); }
}

function refill(key, req) {
  const p = pools.get(key);
  if (p.loading) return;
  p.loading = true;
  call({ ...req, n: 6 }).then((lines) => {
    p.loading = false;
    if (lines?.length) for (const l of lines) if (!p.used.has(l)) p.lines.push(l);
  });
}

/**
 * Turant ek line do: AI pool mein ho to wahan se, warna `fallback()` (purani lines).
 * key = kirdaar+situation (jaise 'girl:Priya:hello'), req = { who, role, situation, lang, spicy }
 */
export function aiLine(key, req, fallback) {
  let p = pools.get(key);
  if (!p) { p = { lines: [], loading: false, used: new Set() }; pools.set(key, p); }
  if (p.lines.length < 2) refill(key, req);
  const l = p.lines.shift();
  if (l) { p.used.add(l); return l; }
  return typeof fallback === 'function' ? fallback() : fallback;
}

/** Ek taaza line ka intezaar (mission intro jaisi jagah) — na mile to null. */
export async function aiFresh(req, timeout = 5000) {
  const lines = await call({ ...req, n: 1 }, timeout);
  return lines?.[0] || null;
}

/** pehle se pool bhar lo (jaise sawari baithne se pehle) */
export function aiWarm(key, req) { if (!pools.has(key)) { pools.set(key, { lines: [], loading: false, used: new Set() }); refill(key, req); } }

export const aiAvailable = () => !(down && Date.now() < downUntil);
