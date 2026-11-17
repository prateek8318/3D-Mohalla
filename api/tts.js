// 🗣️ Vercel serverless function: asli desi aawaz — Sarvam AI (bulbul:v3) Hindi TTS.
// Key SIRF server pe (Vercel env var SARVAM_API_KEY). Game har line ke liye MP3 maangta hai;
// credit khatam / key nahi / error → game apne aap browser ki aawaz pe chala jaata hai.
import { SarvamAIClient } from 'sarvamai';

const client = process.env.SARVAM_API_KEY ? new SarvamAIClient({ apiSubscriptionKey: process.env.SARVAM_API_KEY }) : null;

// bulbul:v3 ki aawazein (sab test ki hui). 'varun' jaan-boojh ke nahi (villain jaisi bhaari).
const MALE = ['rahul', 'shubh', 'aditya', 'rohan', 'amit', 'dev', 'ratan', 'manan', 'sumit', 'kabir', 'aayan', 'ashutosh', 'advait', 'anand', 'tarun', 'sunny', 'gokul', 'vijay', 'mohit', 'rehan', 'soham'];
const FEMALE = ['priya', 'ishita', 'ritu', 'neha', 'pooja', 'simran', 'kavya', 'shreya', 'roopa', 'tanya', 'shruti', 'suhani', 'kavitha', 'rupali'];
const hash = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };

// 🚦 sasta rate-limit: ek IP se ek minute mein 40 line
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 40;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!client) return res.status(503).json({ error: 'TTS band hai (key nahi)' });
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '?').split(',')[0].trim();
  if (limited(ip)) return res.status(429).json({ error: 'thoda ruko' });

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const text = String(b.text || '').trim().slice(0, 500);
  if (!text) return res.status(400).json({ error: 'text khaali' });
  const list = b.female ? FEMALE : MALE;
  const speaker = list[hash(b.who || text) % list.length];
  const pace = Math.max(0.6, Math.min(1.6, Number(b.pace) || 1));

  try {
    const r = await client.textToSpeech.convert({ text, language_code: 'hi-IN', model: 'bulbul:v3', speaker, pace, output_audio_codec: 'mp3' });
    const audio = Buffer.from((r.audios || []).join(''), 'base64');
    if (!audio.length) return res.status(502).json({ error: 'aawaz nahi bani' });
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Speaker', speaker);
    return res.status(200).send(audio);
  } catch (e) {
    const st = e?.statusCode;
    // 402 = credit khatam, 403 = key galat → game browser ki aawaz pe chala jaaye
    if (st === 402) return res.status(402).json({ error: 'Sarvam credit khatam' });
    if (st === 403) return res.status(503).json({ error: 'Sarvam key galat' });
    if (st === 429) return res.status(429).json({ error: 'Sarvam busy' });
    return res.status(502).json({ error: `Sarvam error ${st || ''}`.trim() });
  }
}
