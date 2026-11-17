// 🗣️ Dialogue ki aawaz — browser ki apni TTS (speechSynthesis), koi server nahi.
// Har bolne wale (speaker) ki apni pakki aawaz: aadmi = male voice, aurat = female voice,
// aur har insaan ka pitch/raftaar thoda alag — taaki sab ek jaise na lagein.
// Text Roman Hinglish/Bhojpuri hai → Indian English (en-IN) sabse sahi padhti hai; phir hi-IN, en-GB, en-US.
// Edge mein "Prabhat/Madhur" (aadmi) aur "Neerja/Swara" (aurat) jaisi natural aawazein sabse achhi lagti hain.
const synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
let voices = [];
let on = true;
try { on = localStorage.getItem('mohalla.voice') !== '0'; } catch { /* ok */ }
function loadVoices() { voices = synth ? synth.getVoices() : []; pools.clear(); }
const pools = new Map();
if (synth) { loadVoices(); synth.addEventListener?.('voiceschanged', loadVoices); }

const FEM = /female|woman|heera|kalpana|swara|neerja|veena|lekha|priya|aditi|zira|hazel|susan|libby|sonia|jenny|aria|samantha|karen|moira|tessa|fiona|victoria|kajal|ananya|shruti/i;
const MAL = /\bmale\b|\bman\b|ravi|hemant|madhur|prabhat|rishi|david|mark|george|guy|ryan|james|daniel|thomas|aaron|arthur|fred|alex|tom\b|oliver|rahul|ajay|kunal|nishant|christopher|eric|roger|brian|william|liam/i;
const isFem = (v) => FEM.test(v.name) && !/\bmale\b/i.test(v.name.replace(/female/ig, ''));
const isMal = (v) => MAL.test(v.name) && !/female/i.test(v.name);
const DEVA = /[ऀ-ॿ]/;
const norm = (l) => (l || '').replace('_', '-').toLowerCase();

// ek gender ke liye aawazon ki list (pehli bhasha jismein us gender ki aawaz mile)
function poolFor(female, deva) {
  const key = (female ? 'f' : 'm') + (deva ? 'd' : 'r');
  if (pools.has(key)) return pools.get(key);
  if (!voices.length) loadVoices();
  const langs = deva ? ['hi-in', 'hi', 'en-in'] : ['en-in', 'hi-in', 'hi', 'en-gb', 'en-us', 'en'];
  let res = { list: [], exact: false };
  for (const lang of langs) {
    const vs = voices.filter((v) => norm(v.lang).startsWith(lang));
    const g = vs.filter(female ? isFem : isMal);
    if (g.length) { res = { list: g, exact: true }; break; }
  }
  if (!res.list.length) { // sahi gender ki aawaz hai hi nahi → koi bhi, pitch se bhaari/patli
    for (const lang of langs) { const vs = voices.filter((v) => norm(v.lang).startsWith(lang)); if (vs.length) { res = { list: vs, exact: false }; break; } }
  }
  if (res.list.length) pools.set(key, res);
  return res;
}

// bolne wale ki pakki pehchaan → pakki aawaz
const speakers = new Map();
let anon = 0;
function hash(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
function voiceOf(who, female, deva) {
  const id = (who ?? 'anon' + (anon++ % 7)) + (female ? ':f' : ':m');
  let sp = speakers.get(id);
  if (!sp) {
    const h = hash(id);
    sp = { h, pitchJ: ((h % 100) / 100 - 0.5) * 0.18, rateJ: (((h >> 7) % 100) / 100 - 0.5) * 0.14 };
    speakers.set(id, sp);
    if (speakers.size > 400) speakers.clear();
  }
  const pool = poolFor(female, deva);
  const v = pool.list.length ? pool.list[sp.h % pool.list.length] : null;
  // sahi gender ki aawaz na ho to pitch se adjust (aadmi bhaari, aurat patli)
  const base = female ? (pool.exact ? 1.05 : 1.35) : (pool.exact ? 0.95 : 0.55);
  return { v, pitch: base + sp.pitchJ, rate: 1 + sp.rateJ };
}

// emoji / chinh hata do — warna TTS "smiling face" padhti hai
const clean = (t) => String(t || '')
  .replace(/\[[^\]]*\]/g, ' ')
  .replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}‍️]/gu, ' ')
  .replace(/[*_~#>|"“”]/g, ' ')
  .replace(/\s+/g, ' ').trim();

let lastAt = 0;
/** text bolo. opts: { female, who (pakki pehchaan), loud, priority, rate } */
export function speak(text, opts = {}) {
  if (!on || !synth) return;
  const t = clean(text);
  if (t.length < 2) return;
  const now = performance.now();
  // bheed mein ek ke upar ek na bole: chalu awaaz ho to sirf zaroori wala kaate
  if (synth.speaking || synth.pending) {
    if (!opts.priority && now - lastAt < 2200) return;
    synth.cancel();
  }
  lastAt = now;
  const u = new SpeechSynthesisUtterance(t);
  const { v, pitch, rate } = voiceOf(opts.who, !!opts.female, DEVA.test(t));
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-IN';
  u.rate = (opts.rate || 1) * rate * (opts.loud ? 1.12 : 1);
  u.pitch = Math.max(0.1, Math.min(2, pitch + (opts.loud ? 0.08 : 0)));
  u.volume = 1;
  synth.speak(u);
}
export function stopSpeaking() { synth?.cancel(); }
export function voiceOn() { return on && !!synth; }
export function setVoice(v) {
  on = v;
  try { localStorage.setItem('mohalla.voice', v ? '1' : '0'); } catch { /* ok */ }
  if (!v) synth?.cancel();
}
export const voiceSupported = !!synth;
/** debug: kaun si aawazein mili */
export function voiceInfo() { return { male: poolFor(false, false), female: poolFor(true, false) }; }
