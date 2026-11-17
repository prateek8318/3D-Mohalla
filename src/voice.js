// 🗣️ Dialogue ki aawaz — browser ki apni TTS (speechSynthesis), koi server nahi.
// Text Roman Hinglish/Bhojpuri mein hai → Indian English (en-IN) awaaz use sahi padhti hai;
// Devanagari ho to hi-IN. 🔊 button / localStorage 'mohalla.voice' se band-chalu.
const synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
let voices = [];
let on = true;
try { on = localStorage.getItem('mohalla.voice') !== '0'; } catch { /* ok */ }
function loadVoices() { voices = synth ? synth.getVoices() : []; }
if (synth) { loadVoices(); synth.addEventListener?.('voiceschanged', loadVoices); }

const DEVA = /[ऀ-ॿ]/;
function pickVoice(text, female) {
  if (!voices.length) loadVoices();
  const want = DEVA.test(text) ? ['hi-IN', 'hi', 'en-IN'] : ['en-IN', 'hi-IN', 'hi', 'en-GB', 'en-US'];
  for (const lang of want) {
    const vs = voices.filter((v) => v.lang?.replace('_', '-').toLowerCase().startsWith(lang.toLowerCase()));
    if (!vs.length) continue;
    // aadmi/aurat ke hisaab se awaaz (naam se andaaza) — warna pehli wali
    const fem = vs.find((v) => /female|heera|kalpana|swara|neerja|veena|lekha|priya|aditi|zira/i.test(v.name));
    const mal = vs.find((v) => /male|ravi|hemant|madhur|prabhat|rishi/i.test(v.name) && !/female/i.test(v.name));
    return (female ? fem : mal) || vs[0];
  }
  return null;
}
// emoji / chinh hata do — warna TTS "smiling face" padhti hai
const clean = (t) => String(t || '')
  .replace(/\[[^\]]*\]/g, ' ')
  .replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}‍️]/gu, ' ')
  .replace(/[*_~#>|]/g, ' ')
  .replace(/\s+/g, ' ').trim();

let lastAt = 0;
/** text bolo. opts: { female, loud, priority } — priority wala beech mein kaat ke bolta hai */
export function speak(text, opts = {}) {
  if (!on || !synth) return;
  const t = clean(text);
  if (t.length < 2) return;
  const now = performance.now();
  // bheed mein ek ke upar ek na bole: chalu awaaz ho to sirf zaroori wala kaate
  if (synth.speaking || synth.pending) {
    if (!opts.priority && now - lastAt < 2500) return;
    synth.cancel();
  }
  lastAt = now;
  const u = new SpeechSynthesisUtterance(t);
  const v = pickVoice(t, opts.female);
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'hi-IN';
  u.rate = opts.loud ? 1.12 : 1.02;
  u.pitch = (opts.female ? 1.25 : 0.9) + (opts.loud ? 0.1 : 0);
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
