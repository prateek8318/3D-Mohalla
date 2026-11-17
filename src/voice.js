// 🗣️ Dialogue ki aawaz — browser ki apni TTS, ekdum DESI:
// har line pehle Devanagari (हिंदी लिपि) mein badalti hai, phir HINDI aawaz bolti hai.
// Sabse achhi: Microsoft Edge ki "Madhur / Swara … Online (Natural)" aawazein (free, bilkul insaan jaisi).
// Chrome mein "Google हिन्दी". Videshi (US/UK) aawaz kabhi nahi — Hindi aawaz na ho tabhi Indian English.
import { romanToDeva } from './translit.js';

const synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
let voices = [];
let on = true;
try { on = localStorage.getItem('mohalla.voice') !== '0'; } catch { /* ok */ }
const pools = new Map();
function loadVoices() { voices = synth ? synth.getVoices() : []; pools.clear(); }
if (synth) { loadVoices(); synth.addEventListener?.('voiceschanged', loadVoices); }

const FEM = /swara|kalpana|aarti|ananya|kavya|heera|neerja|google\s*(हिन्दी|hindi)|female|lekha|priya|shruti|vani|aditi|kajal/i;
const MAL = /madhur|hemant|aarav|arjun|kunal|rehaan|prabhat|ravi|male/i;
const isFem = (v) => FEM.test(v.name) && !/\bmale\b/i.test(v.name.replace(/female/ig, ''));
const isMal = (v) => MAL.test(v.name) && !/female/i.test(v.name);
const norm = (l) => (l || '').replace('_', '-').toLowerCase();
// insaan jaisi (natural/online) aawaz pehle
const score = (v) => (/natural|neural/i.test(v.name) ? 4 : 0) + (/online/i.test(v.name) ? 2 : 0) + (/google/i.test(v.name) ? 1 : 0);
const best = (list) => [...list].sort((a, b) => score(b) - score(a));

/** { list, lang: 'hi'|'en', exact } — exact=false matlab sahi gender ki aawaz nahi, pitch se banayenge */
function poolFor(female) {
  const key = female ? 'f' : 'm';
  if (pools.has(key)) return pools.get(key);
  if (!voices.length) loadVoices();
  const hi = voices.filter((v) => norm(v.lang).startsWith('hi'));
  const en = voices.filter((v) => norm(v.lang) === 'en-in');
  let res = null;
  const g = hi.filter(female ? isFem : isMal);
  if (g.length) res = { list: best(g), lang: 'hi', exact: true };
  else if (hi.length) res = { list: best(hi), lang: 'hi', exact: false }; // Hindi hi bolegi, pitch se aadmi/aurat
  else {
    const ge = en.filter(female ? isFem : isMal);
    if (ge.length) res = { list: best(ge), lang: 'en', exact: true };
    else if (en.length) res = { list: best(en), lang: 'en', exact: false };
  }
  res ||= { list: [], lang: 'hi', exact: false };
  if (voices.length) pools.set(key, res);
  return res;
}

// ---- Roman → Devanagari: Claude ka diya hua sahi roop yaad rakho, warna apna converter ----
const deva = new Map();
try { for (const [k, v] of JSON.parse(localStorage.getItem('mohalla.deva') || '[]')) deva.set(k, v); } catch { /* ok */ }
let saveT = 0;
function persist() {
  clearTimeout(saveT);
  saveT = setTimeout(() => { try { localStorage.setItem('mohalla.deva', JSON.stringify([...deva].slice(-1500))); } catch { /* ok */ } }, 1500);
}
/** AI ne line ke saath Devanagari diya → yaad rakho */
export function registerHindi(roman, hindi) {
  if (!roman || !hindi || !/[ऀ-ॿ]/.test(hindi)) return;
  deva.set(clean(roman), clean(hindi));
  persist();
}
// pehle se likhi lines ka sahi Devanagari server (Claude) se — agli baar ke liye
let fetcher = null, queue = new Set(), qT = 0;
export function setHindiFetcher(fn) { fetcher = fn; }
function want(t) {
  if (!fetcher || deva.has(t)) return;
  queue.add(t);
  clearTimeout(qT);
  qT = setTimeout(async () => {
    const list = [...queue].slice(0, 12); queue = new Set();
    const out = await fetcher(list);
    if (out) list.forEach((r, i) => { if (out[i]) { deva.set(r, clean(out[i])); } }), persist();
  }, 400);
}

// bolne wale ki pakki pehchaan → pakki aawaz + thoda alag pitch
const speakers = new Map();
let anon = 0;
function hash(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
function voiceOf(who, female) {
  const id = (who ?? 'anon' + (anon++ % 7)) + (female ? ':f' : ':m');
  let sp = speakers.get(id);
  if (!sp) { const h = hash(id); sp = { h, pj: ((h % 100) / 100 - 0.5) * 0.12, rj: (((h >> 7) % 100) / 100 - 0.5) * 0.1 }; speakers.set(id, sp); if (speakers.size > 400) speakers.clear(); }
  const pool = poolFor(female);
  // natural aawaz ek-do hi hoti hain → sabse achhi wali zyada baar
  const v = pool.list.length ? pool.list[pool.list.length > 1 && sp.h % 4 === 3 ? 1 : 0] : null;
  const base = pool.exact ? 1 : female ? 1.3 : 0.62; // sahi gender na mile: aadmi bhaari, aurat patli
  return { v, lang: pool.lang, pitch: base + sp.pj, rate: 1 + sp.rj, natural: v && score(v) >= 4 };
}

// emoji / chinh hata do — warna TTS "smiling face" padhti hai
function clean(t) {
  return String(t || '')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}‍️]/gu, ' ')
    .replace(/[*_~#>|"“”]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}
const DEVA = /[ऀ-ॿ]/;

// ---------- 🎙️ SARVAM (asli desi aawaz, /api/tts) — na chale to browser ki aawaz ----------
let ttsDownUntil = 0, cur = null, curTok = 0;
const audioCache = new Map(); // "who|f|line" → blob URL (wahi line dobara → turant)
function busy() { return (cur && !cur.paused && !cur.ended) || synth?.speaking || synth?.pending; }
function stopAll() { curTok++; if (cur) { cur.pause(); cur = null; } synth?.cancel(); }
async function sarvam(say, opts, tok) {
  if (Date.now() < ttsDownUntil) return false;
  const key = `${opts.who || ''}|${opts.female ? 'f' : 'm'}|${say}`;
  let url = audioCache.get(key);
  if (!url) {
    const ctl = new AbortController();
    const tm = setTimeout(() => ctl.abort(), 4000);
    try {
      const r = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: say, female: !!opts.female, who: opts.who, pace: (opts.rate || 1) * (opts.loud ? 1.1 : 1) }), signal: ctl.signal });
      if (!r.ok || !(r.headers.get('content-type') || '').includes('audio')) {
        // 402 credit khatam / 503 key nahi / 404 ya HTML = local dev (api nahi) → 30 min browser aawaz
        // 429 busy / 5xx → 20 sec; 400 (ye line hi galat) → sirf is line ke liye browser aawaz
        const long = [402, 403, 404, 503].includes(r.status) || r.ok;
        if (long) ttsDownUntil = Date.now() + 30 * 60000;
        else if (r.status === 429 || r.status >= 500) ttsDownUntil = Date.now() + 20000;
        return false;
      }
      url = URL.createObjectURL(await r.blob());
      audioCache.set(key, url);
      if (audioCache.size > 80) { const [k0, u0] = audioCache.entries().next().value; URL.revokeObjectURL(u0); audioCache.delete(k0); }
    } catch { ttsDownUntil = Date.now() + 20000; return false; } finally { clearTimeout(tm); }
  }
  if (tok !== curTok) return true; // beech mein koi aur bolne laga — ye chhod do
  const a = new Audio(url);
  a.volume = 1;
  cur = a;
  try { await a.play(); } catch { return false; }
  return true;
}

let lastAt = 0;
/** text bolo. opts: { female, who (pakki pehchaan), loud, priority, rate } */
export function speak(text, opts = {}) {
  if (!on) return;
  const t = clean(text);
  if (t.length < 2) return;
  const now = performance.now();
  if (busy()) {
    if (!opts.priority && now - lastAt < 2200) return;
  }
  stopAll();
  lastAt = now;
  const tok = curTok;
  // Sarvam ko bhi Devanagari (desi uchchaaran); fail ho to wahi line browser aawaz se
  const hiText = DEVA.test(t) ? t : (deva.get(t) || romanToDeva(t));
  if (!DEVA.test(t)) want(t);
  sarvam(hiText, opts, tok).then((ok) => { if (!ok && tok === curTok) browserSpeak(t, opts); });
}
function browserSpeak(t, opts) {
  if (!synth) return;
  const { v, lang, pitch, rate, natural } = voiceOf(opts.who, !!opts.female);
  // Hindi aawaz → Devanagari text (desi uchchaaran); Indian English aawaz → Roman hi theek
  let say = t;
  if (lang === 'hi' && !DEVA.test(t)) { say = deva.get(t) || romanToDeva(t); want(t); }
  const u = new SpeechSynthesisUtterance(say);
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'hi-IN';
  u.rate = Math.min(1.3, (opts.rate || 1) * rate * (opts.loud ? 1.08 : 1));
  // natural aawazon pe pitch zyada chhedne se robotic lagti hain
  u.pitch = Math.max(0.1, Math.min(2, natural ? 1 + (pitch - 1) * 0.4 : pitch + (opts.loud ? 0.05 : 0)));
  u.volume = 1;
  synth.speak(u);
}
export function stopSpeaking() { stopAll(); }
export function voiceOn() { return on && !!synth; }
export function setVoice(v) {
  on = v;
  try { localStorage.setItem('mohalla.voice', v ? '1' : '0'); } catch { /* ok */ }
  if (!v) stopAll();
}
export const voiceSupported = !!synth || typeof Audio !== 'undefined';
/** debug + "kaunsi aawaz mili" hint */
export function voiceInfo() { const m = poolFor(false), f = poolFor(true); return { male: m, female: f, natural: [...m.list, ...f.list].some((v) => score(v) >= 4), hindi: m.lang === 'hi' || f.lang === 'hi' }; }
