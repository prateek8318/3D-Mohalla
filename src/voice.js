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
// pehle se likhi lines ka sahi Devanagari server (Claude) se — bolne se PEHLE (thoda intezaar), phir hamesha yaad
let fetcher = null;
const inflight = new Map();
export function setHindiFetcher(fn) { fetcher = fn; }
function fetchHindi(t, ms) {
  if (!fetcher) return Promise.resolve(null);
  let p = inflight.get(t);
  if (!p) {
    p = Promise.resolve(fetcher([t])).then((out) => {
      const h = clean(out?.[0]);
      if (h && DEVA.test(h)) { deva.set(t, h); persist(); return h; }
      return null;
    }).catch(() => null).finally(() => inflight.delete(t));
    inflight.set(t, p);
  }
  return Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))]);
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
// Ek waqt mein EK hi aawaz. `active` = jo abhi bol raha hai (aawaz ban rahi ho tab bhi).
//  • aam (raah chalte) line: kisi ko kabhi nahi kaat-ti — koi bol raha ho to chup.
//  • priority (baat-cheet) line: aam line ko kaat deti hai; queue=true ho to pehle wali baat poori hone ka intezaar.
let ttsDownUntil = 0, cur = null, curTok = 0, active = null, wd = 0;
let waiting = [];
let quiet = null;
/** fn() true de to aam (bina-priority) lines chup — jaise jab kisi se baat chal rahi ho */
export function setQuietWhen(fn) { quiet = fn; }
const audioCache = new Map(); // "who|f|line" → blob URL (wahi line dobara → turant)
function stopAll() { curTok++; active = null; waiting = []; clearTimeout(wd); if (cur) { cur.pause(); cur = null; } synth?.cancel(); }
function finish(tok) {
  if (tok !== curTok || !active) return;
  active = null; cur = null; clearTimeout(wd);
  const nx = waiting.shift();
  if (nx) start(nx.t, nx.opts);
}
// aawaz ki file (cache / chal rahi request dobara nahi) — na bane to null
const loading = new Map();
function getAudio(say, opts) {
  if (Date.now() < ttsDownUntil) return Promise.resolve(null);
  const key = `${opts.who || ''}|${opts.female ? 'f' : 'm'}|${say}`;
  const hit = audioCache.get(key);
  if (hit) return Promise.resolve(hit);
  let p = loading.get(key);
  if (!p) { p = fetchAudio(key, say, opts).finally(() => loading.delete(key)); loading.set(key, p); }
  return p;
}
async function fetchAudio(key, say, opts) {
  let url = null;
  {
    const ctl = new AbortController();
    const tm = setTimeout(() => ctl.abort(), opts.priority ? 7000 : 4500);
    try {
      const r = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: say, female: !!opts.female, who: opts.who, pace: (opts.rate || 1) * (opts.loud ? 1.1 : 1) }), signal: ctl.signal });
      if (!r.ok || !(r.headers.get('content-type') || '').includes('audio')) {
        // 402 credit khatam / 503 key nahi / 404 ya HTML = local dev (api nahi) → 30 min browser aawaz
        // 429 busy / 5xx → 20 sec; 400 (ye line hi galat) → sirf is line ke liye browser aawaz
        const long = [402, 403, 404, 503].includes(r.status) || r.ok;
        if (long) ttsDownUntil = Date.now() + 30 * 60000;
        else if (r.status === 429 || r.status >= 500) ttsDownUntil = Date.now() + 20000;
        return null;
      }
      url = URL.createObjectURL(await r.blob());
      audioCache.set(key, url);
      if (audioCache.size > 80) { const [k0, u0] = audioCache.entries().next().value; URL.revokeObjectURL(u0); audioCache.delete(k0); }
    } catch { ttsDownUntil = Date.now() + 15000; return null; } finally { clearTimeout(tm); }
  }
  return url;
}
async function sarvam(say, opts, tok) {
  const url = await getAudio(say, opts);
  if (!url) return false;
  if (tok !== curTok) return true; // beech mein koi aur bolne laga — ye chhod do
  const a = new Audio(url);
  a.volume = opts.vol ?? 1;
  a.onended = a.onerror = () => finish(tok);
  cur = a;
  try { await a.play(); } catch { if (cur === a) cur = null; return false; }
  return true;
}

/** text bolo. opts: { female, who (pakki pehchaan), loud, priority, queue, rate, vol } */
export function speak(text, opts = {}) {
  if (!on) return;
  const t = clean(text);
  if (t.length < 2) return;
  if (!opts.priority) {
    if (active || quiet?.()) return; // aam line kisi ki baat nahi kaat-ti
  } else if (opts.queue && active?.prio) {
    waiting.push({ t, opts }); // pehle wala apni baat poori kare, phir ye
    if (waiting.length > 2) waiting.shift();
    hindiOf(t, opts).then((hi) => getAudio(hi, opts)); // tab tak iski aawaz bana lo — baari aate hi turant bole
    return;
  } else stopAll();
  start(t, opts);
}
// Devanagari roop: yaad ho to wahi; quick=true (player ki apni line) → turant apna converter, Claude ka intezaar nahi
async function hindiOf(t, opts) {
  if (DEVA.test(t)) return t;
  return deva.get(t) || (opts.quick ? romanToDeva(t) : (await fetchHindi(t, opts.priority ? 1500 : 2500)) || romanToDeva(t));
}
async function start(t, opts) {
  const tok = ++curTok;
  active = { tok, prio: !!opts.priority };
  clearTimeout(wd);
  wd = setTimeout(() => finish(tok), 9000 + t.length * 130); // kabhi atke nahi
  // Sarvam ko bhi Devanagari (desi uchchaaran) — sahi roop na ho to pehle Claude se, warna apna converter
  const hi = await hindiOf(t, opts);
  if (tok !== curTok) return;
  const ok = await sarvam(hi, opts, tok);
  if (!ok && tok === curTok) browserSpeak(t, hi, opts, tok);
}
function browserSpeak(t, hi, opts, tok) {
  if (!synth) return finish(tok);
  const { v, lang, pitch, rate, natural } = voiceOf(opts.who, !!opts.female);
  // Hindi aawaz → Devanagari text (desi uchchaaran); Indian English aawaz → Roman hi theek
  const u = new SpeechSynthesisUtterance(lang === 'hi' ? hi : t);
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'hi-IN';
  u.rate = Math.min(1.3, (opts.rate || 1) * rate * (opts.loud ? 1.08 : 1));
  // natural aawazon pe pitch zyada chhedne se robotic lagti hain
  u.pitch = Math.max(0.1, Math.min(2, natural ? 1 + (pitch - 1) * 0.4 : pitch + (opts.loud ? 0.05 : 0)));
  u.volume = opts.vol ?? 1;
  u.onend = u.onerror = () => finish(tok);
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
