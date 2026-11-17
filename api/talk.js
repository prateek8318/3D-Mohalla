// 🤖 Vercel serverless function: mohalle ke kirdaaron ke naye-naye dialogue Claude se.
// API key SIRF yahan server pe (Vercel env var ANTHROPIC_API_KEY) — browser/game code mein kabhi nahi.
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // ANTHROPIC_API_KEY env se
const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';

const SYSTEM = `Tum ek 3D game "Mohalla 3D" ke kirdaaron ke dialogue likhte ho. Game 90s ke ek Indian mohalle (Bihar/UP jaisa) mein hai: chai ki tapri, rickshaw, bazaar, ghat, gunde, police, mohalle ki ladkiyan, dukaandaar.

Niyam:
- Har line ek asli mohalle wale insaan ki tarah, filmi-desi tadke ke saath, chhoti (max ~110 characters), ek hi baat.
- Bhasha: lang="hi" ho to Roman Hinglish (jaise "Arre bhaiya, chai thandi ho gayi!"); lang="bho" ho to Roman Bhojpuri (jaise "Ae babua, ka haal ba?"). Devanagari mat likhna.
- Har line alag ho — alag mood, alag baat, alag shuruaat. Ek-doosre ko copy mat karo.
- Zyada se zyada ek emoji per line, wo bhi zaroori ho to.
- Kirdaar ka naam, kaam aur situation dhyaan mein rakho. Kahani/mission ki baat ho to uska matlab (kya karna hai, inaam) na badlo.
- spicy=true ho to sadak-chhaap bakchodi aur halki gaali chal sakti hai (game ka 18+ mode). Kabhi bhi jaati, dharm, aurat-virodhi ya sexual baat nahi.
- Sirf dialogue lines do, koi explanation nahi.`;

const SCHEMA = {
  type: 'object',
  properties: { lines: { type: 'array', items: { type: 'string' } } },
  required: ['lines'],
  additionalProperties: false,
};

// 🚦 sasta rate-limit (har warm instance mein) — ek IP se ek minute mein 20 se zyada nahi
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 20;
}
const str = (v, n) => String(v ?? '').slice(0, n);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'AI band hai (key nahi)' });
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '?').split(',')[0].trim();
  if (limited(ip)) return res.status(429).json({ error: 'thoda ruko' });

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const n = Math.max(1, Math.min(8, Number(b.n) || 4));
  const ask = [
    `kirdaar: ${str(b.who, 60)}`,
    `kaun/kaam: ${str(b.role, 120)}`,
    `situation: ${str(b.situation, 400)}`,
    b.base ? `asli line (isi matlab ko naye andaaz mein kaho): ${str(b.base, 300)}` : '',
    `lang=${b.lang === 'bho' ? 'bho' : 'hi'} spicy=${b.spicy ? 'true' : 'false'}`,
    `${n} alag-alag lines do.`,
  ].filter(Boolean).join('\n');

  try {
    const msg = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 1500,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default', // mana kare to API khud doosre model pe chala deta hai
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: ask }],
    });
    if (msg.stop_reason === 'refusal') return res.status(200).json({ lines: [] });
    const text = msg.content.find((c) => c.type === 'text')?.text || '{}';
    let lines = [];
    try { lines = JSON.parse(text).lines || []; } catch { lines = []; }
    lines = lines.map((l) => str(l, 160).trim()).filter(Boolean).slice(0, n);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ lines });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'AI busy' });
    if (e instanceof Anthropic.AuthenticationError) return res.status(503).json({ error: 'key galat' });
    if (e instanceof Anthropic.APIError) return res.status(502).json({ error: `AI error ${e.status}` });
    return res.status(500).json({ error: 'server error' });
  }
}
