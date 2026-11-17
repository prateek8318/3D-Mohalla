// 🤖 Vercel serverless function: mohalle ke kirdaaron ke naye-naye dialogue Claude se.
// API key SIRF yahan server pe (Vercel env var ANTHROPIC_API_KEY) — browser/game code mein kabhi nahi.
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // ANTHROPIC_API_KEY env se
const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';
// refusal pe doosre model pe chalana (server-side fallback) — Haiku pe ye nahi hota, wahan mat bhejo
const FB = /haiku/.test(MODEL) ? {} : { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' };

const SYSTEM = `Tum ek 3D game "Mohalla 3D" ke kirdaaron ke dialogue likhte ho. Game 90s ke ek Indian mohalle (Bihar/UP jaisa) mein hai: chai ki tapri, rickshaw, bazaar, ghat, gunde, police, mohalle ki ladkiyan, dukaandaar.

Niyam:
- Har line bilkul asli zindagi jaisi — jaise sach mein UP/Bihar ke mohalle mein log bolte hain: bol-chaal ki bhasha, adhoore vaakya, "arre", "abe", "haan bhai", taane, mazaak, gussa, apni pareshaani. Kitaabi ya filmi-dialogue jaisa nahi. Chhoti (max ~130 characters), ek hi baat. Har baar naya — alag shabd, alag mazaak, alag shuruaat; "pehle bol chuke" wali lines ya unke jaisi bilkul mat likhna.
- Kirdaar ke mood ke hisaab se: gusse wala sach mein bhadka hua lage, sharmila sharmaaye, dukaandaar dhandhe ki baat kare.
- Bhasha: lang="hi" ho to Roman Hinglish (jaise "Arre bhaiya, chai thandi ho gayi!"); lang="bho" ho to Roman Bhojpuri (jaise "Ae babua, ka haal ba?"). Devanagari mat likhna.
- Har line alag ho — alag mood, alag baat, alag shuruaat. Ek-doosre ko copy mat karo.
- Zyada se zyada ek emoji per line, wo bhi zaroori ho to.
- Kirdaar ka naam, kaam aur situation dhyaan mein rakho. Kahani/mission ki baat ho to uska matlab (kya karna hai, inaam) na badlo.
- spicy=true (game ka 18+ "bakchodi" mode, player ne khud chuna hai): gussa/jhagda/taana ho to asli sadak jaisi desi gaali khul ke (bhenchod, madarchod, bhosdike, chutiya, saala, kamina, gadha…), jaise log sach mein dete hain. Har line mein zabardasti nahi — jahan mood ho wahin.
- spicy=false: gaali nahi; gussa "abe", "andhe ho kya", "dimaag kharab hai kya" jaisa.
- Kabhi bhi: jaati, dharm, kshetra pe gaali/nafrat nahi; aurat ke khilaaf sexual ya hinsak baat nahi; bachchon ke baare mein galat nahi.
- Sirf dialogue lines do, koi explanation nahi.
- Har line ke saath "hindi": wahi line bilkul waise hi Devanagari mein (bolne wali aawaz ke liye) — English shabd bhi Devanagari mein (जैसे सॉरी, हीरो, ट्रेन), emoji nahi.`;

const SCHEMA = {
  type: 'object',
  properties: {
    lines: {
      type: 'array',
      items: { type: 'object', properties: { text: { type: 'string' }, hindi: { type: 'string' } }, required: ['text', 'hindi'], additionalProperties: false },
    },
  },
  required: ['lines'],
  additionalProperties: false,
};
// 🔤 pehle se likhi Roman lines → Devanagari (sirf bolne ke liye)
const HINDI_SCHEMA = { type: 'object', properties: { hindi: { type: 'array', items: { type: 'string' } } }, required: ['hindi'], additionalProperties: false };
async function toHindi(b, res) {
  const list = (Array.isArray(b.list) ? b.list : []).slice(0, 12).map((t) => str(t, 300));
  if (!list.length) return res.status(200).json({ hindi: [] });
  const msg = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 3000,
    ...FB,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: HINDI_SCHEMA } },
    system: 'Tum Roman Hinglish/Bhojpuri lines ko bilkul sahi Devanagari mein likhte ho, taaki Hindi bolne wali aawaz desi uchchaaran se padhe. Matlab ya shabd mat badlo, sirf lipi. English shabd bhi Devanagari mein (सॉरी, हीरो). Emoji hata do. Har input line ke liye ek output, usi kram mein.',
    messages: [{ role: 'user', content: JSON.stringify(list) }],
  });
  const text = msg.content.find((c) => c.type === 'text')?.text || '{}';
  let out = [];
  try { out = JSON.parse(text).hindi || []; } catch { out = []; }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ hindi: out.slice(0, list.length).map((t) => str(t, 400)) });
}

// 🚦 sasta rate-limit (har warm instance mein) — ek IP se ek minute mein 20 se zyada nahi
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 60;
}
const str = (v, n) => String(v ?? '').slice(0, n);

// 💬 CHAT mode: player khud likhta/bolta hai, mohalle ki ladki Claude ban ke jawab deti hai
const CHAT_SYSTEM = `Tum "Mohalla 3D" game mein mohalle ki ek ladki ho (sab kirdaar 18+ baalig hain). Player (mohalle ka ladka) tumse seedhe baat kar raha hai — type karke ya mic se bol ke (mic wala text Devanagari ya tooti-phooti Hinglish ho sakta hai, samajh lena).

Kaise jawab do:
- SABSE ZAROORI: jawab seedha us baat ka ho jo "Player ab bola" mein hai. Usne sawaal poochha (naam, kya kar rahi ho, kahan ja rahi, khaana khaya, kaisi ho…) to pehle USI sawaal ka asli jawab do, phir apni baat. Usne kuch bataya to usi pe react karo. Idhar-udhar ki ya ratti-rataayi line ("kya kaam hai", "jaldi bolo") tabhi jab baat se judi ho. Player ki baat ka koi shabd/vishay jawab mein jhalakna chahiye.
- Mic ka text galat suna gaya lage ya samajh na aaye to andaaza mat lagao — ladki ki tarah poochh lo ("kya bola? phir se bolo na").
- Bilkul asli UP/Bihar ki mohalle wali ladki jaisi — bol-chaal ki bhasha, apni personality (persona field) ke hisaab se. Jawab CHHOTA: ek vaakya, zyada se zyada do chhote (max ~110 characters) — jaise asli baat-cheet mein log bolte hain, bhaashan nahi. Har jawab naya — pichhle jawab ke shabd/andaaz mat dohraana, baat aage badhao, kabhi khud sawaal bhi poochho. lang="hi" → Roman Hinglish, lang="bho" → Roman Bhojpuri. Devanagari mat likhna. Zyada se zyada ek emoji.
- Player ke lehje ka jawab usi lehje mein:
  • pyaar/izzat se baat → pyaar se, dheere-dheere khulti hui
  • flirt/tareef → sharmaati, nakhre dikhati, muskuraati (affinity ke hisaab se kam ya zyada)
  • bakwaas/chhedkhaani/gande comment → gussa, daant, chappal ki dhamki; zyada ho to thappad (action "slap")
  • gaali → gaali ka jawab: spicy=true ho to usi tarah desi gaali waapas (bhosdike, chutiye, kamine, saale…) + thappad; spicy=false ho to bina gaali ke tikha jawab
  • mazaak → mazaak
- Yaad rakho pichhli baatein (history). affinity (0 = ajnabi, 1+ = bahut pasand) aur gf=true (pehle se girlfriend) ke hisaab se kitni khuli ho.
- Propose / "girlfriend banogi" / "shaadi karogi" jaisa sawaal ho → soch ke faisla: affinity, propose_chance (0-1), gift, aur player ne ab tak kaise baat ki. Haan ho to action "accept", na ho to "reject" (achhe se ya gusse se, baat ke hisaab se).
- gf=true ho aur player gale lagne / kiss maange aur mood achha ho → action "hug" ya "kiss"; warna "none".
- Baat bahut buri ho ya baar-baar pareshan kare → "walk_away" (chali jaati hai).
- hindi: wahi jawab bilkul waise hi Devanagari mein (bolne wali aawaz ke liye), emoji nahi.
- affinity: is baat se pasand kitni badli: -3 (bahut bura laga) se +3 (dil chhoo liya). Dil khol ke do: tameez, mazaak, sachchi tareef ya dhyaan se suni baat pe +2/+3; aam theek-thaak baat pe +1. 0 ya minus sirf tab jab baat sach mein rookhi/buri ho.
- Pighalna aasaan rakho: ladka tameez se, dil se baat kare to 3-4 baaton mein khulne lago. Propose pe: affinity 0.45 se upar YA propose_chance 0.5 se upar ho aur usne badtameezi na ki ho → "accept". Bina wajah latkaana ya baar-baar nakhra nahi.
- Kabhi bhi: jaati/dharm pe gaali nahi; koi sexual explicit baat nahi (pyaar, sharmaana, gale lagna, kiss tak theek). Player hinsa ki baat kare to daant ke mana karo.`;
const CHAT_SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    hindi: { type: 'string' },
    mood: { type: 'string', enum: ['shy', 'happy', 'love', 'flirty', 'neutral', 'annoyed', 'angry', 'sad'] },
    affinity: { type: 'integer', enum: [-3, -2, -1, 0, 1, 2, 3] },
    action: { type: 'string', enum: ['none', 'slap', 'accept', 'reject', 'hug', 'kiss', 'walk_away'] },
  },
  required: ['reply', 'hindi', 'mood', 'affinity', 'action'],
  additionalProperties: false,
};

// 🎬 SCENE mode: romantic scene (kiss/jhappi/dance/dinner/kamra) mein hero-heroine ki AAPAS ki baat
const SCENE_SYSTEM = `Tum "Mohalla 3D" game ke romantic scene ke liye hero aur heroine (dono 18+ baalig, ek-doosre ke premi) ki aapas ki asli baat-cheet likhte ho.
- Sirf unke bole hue shabd — koi narration, koi "nazrein mili", koi scene samjhana nahi. Jaise film mein do log sach mein baat karte hain.
- Jagah, samay, mausam, scene (kya ho raha hai), ladki ki personality aur pichhli baat-cheet (history) ke hisaab se — har baar naya, us pal ke liye.
- Ek line ek insaan ki, baari-baari; chhoti aur dil se (max ~120 characters). Pyaar, sharm, halka mazaak — sab asli. Zyada se zyada ek emoji.
- lang="hi" → Roman Hinglish, lang="bho" → Roman Bhojpuri. Har line ke saath "hindi": wahi line Devanagari mein (bolne ke liye).
- Saaf-suthra romance: kiss/gale lagna/haath pakadna tak; koi sexual explicit baat nahi.`;
const SCENE_SCHEMA = {
  type: 'object',
  properties: {
    lines: {
      type: 'array',
      items: { type: 'object', properties: { who: { type: 'string', enum: ['hero', 'heroine'] }, text: { type: 'string' }, hindi: { type: 'string' } }, required: ['who', 'text', 'hindi'], additionalProperties: false },
    },
  },
  required: ['lines'],
  additionalProperties: false,
};
async function sceneTalk(b, res) {
  const order = (Array.isArray(b.order) ? b.order : ['hero', 'heroine']).slice(0, 5).map((w) => (w === 'heroine' ? 'heroine' : 'hero'));
  const hist = (Array.isArray(b.history) ? b.history : []).slice(-8).map((h) => `${h.who === 'girl' ? 'Heroine' : 'Hero'}: ${str(h.text, 200)}`).join('\n');
  const ask = [
    `scene: ${str(b.scene, 200)}`,
    `jagah/samay: ${str(b.where, 120)}`,
    `heroine: ${str(b.heroine, 30) || 'heroine'} (${str(b.persona, 100) || 'pyaari'}) | hero: ${str(b.hero, 30) || 'hero'}`,
    hist ? `inki pichhli baat-cheet:\n${hist}` : '',
    `lang=${b.lang === 'bho' ? 'bho' : 'hi'}`,
    `Bolne ka kram (har ek ki ek line): ${order.join(', ')}`,
  ].filter(Boolean).join('\n');
  const msg = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 2000,
    ...FB,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCENE_SCHEMA } },
    system: [{ type: 'text', text: SCENE_SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: ask }],
  });
  if (msg.stop_reason === 'refusal') return res.status(200).json({ lines: [] });
  const text = msg.content.find((c) => c.type === 'text')?.text || '{}';
  let lines = [];
  try { lines = JSON.parse(text).lines || []; } catch { lines = []; }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ lines: lines.slice(0, order.length).map((l) => ({ who: l.who === 'heroine' ? 'heroine' : 'hero', text: str(l.text, 200), hindi: str(l.hindi, 400) })) });
}

// 🧑‍🔧 NPC mode: dukaandaar / mission wala / koi bhi kirdaar — player ki baat ka seedha jawab
const NPC_SYSTEM = `Tum "Mohalla 3D" game (90s ka UP/Bihar ka mohalla) ke ek kirdaar ho — kaun, wo "kirdaar" field mein hai (dukaandaar, mission dene wala, waghairah). Player (mohalle ka ladka, rickshaw chalata hai) tumse seedhe baat kar raha hai — type karke ya mic se (mic ka text Devanagari ya tooti-phooti Hinglish ho sakta hai).

Kaise jawab do:
- SABSE ZAROORI: jawab seedha us baat ka ho jo "Player ab bola" mein hai — sawaal ka asli jawab, baat pe asli reaction. Ratti-rataayi line nahi. Samajh na aaye to poochh lo "kya bola bhai? phir se bolo".
- Apne kirdaar mein raho: dukaandaar ho to apne saaman/daam ("saaman" field) ki baat, mol-bhaav pe nakhra, udhaar pe mana, mohalle ki gossip; mission wala ho to kaam ki baat ("jaankari" field ke hisaab se, kaam/inaam mat badlo). Jo cheez tumhare paas nahi, saaf bol do nahi hai. Daam sirf wahi jo list mein hain — khud se chhoot ya naya saaman mat banao (khareedna neeche ke button se hota hai).
- Bilkul asli bol-chaal, CHHOTA (ek vaakya, max ~110 characters), har baar naya, pichhli baat (history) yaad rakho. lang="hi" → Roman Hinglish, lang="bho" → Roman Bhojpuri. Devanagari mat likhna. Zyada se zyada ek emoji.
- Player ke lehje ke hisaab se: izzat → izzat, mazaak → mazaak, badtameezi → daant. spicy=true ho aur player gaali de to desi gaali waapas; spicy=false to bina gaali ke tikha jawab.
- hindi: wahi jawab bilkul waise hi Devanagari mein (bolne wali aawaz ke liye), English shabd bhi Devanagari mein, emoji nahi.
- Kabhi bhi: jaati/dharm pe gaali nahi, sexual baat nahi.`;
const NPC_SCHEMA = {
  type: 'object',
  properties: { reply: { type: 'string' }, hindi: { type: 'string' }, mood: { type: 'string', enum: ['happy', 'neutral', 'annoyed', 'angry'] } },
  required: ['reply', 'hindi', 'mood'],
  additionalProperties: false,
};
async function npcChat(b, res) {
  const p = b.npc || {};
  const nm = str(p.name, 40) || 'Kirdaar';
  const hist = (Array.isArray(b.history) ? b.history : []).slice(-10)
    .map((h) => `${h.who === 'npc' ? nm : 'Player'}: ${str(h.text, 300)}`).join('\n');
  const ask = [
    `kirdaar: ${nm} — ${str(p.role, 160)} (${p.female ? 'aurat' : 'aadmi'})`,
    p.items ? `saaman (naam ₹daam): ${str(p.items, 700)}` : '',
    p.info ? `jaankari: ${str(p.info, 600)}` : '',
    `jagah/samay: ${str(p.where, 80)} | player ki jeb: ₹${Number(p.money) || 0}`,
    `lang=${b.lang === 'bho' ? 'bho' : 'hi'} spicy=${b.spicy ? 'true' : 'false'}`,
    hist ? `Ab tak ki baat:\n${hist}` : 'Abhi baat shuru hui hai.',
    `Player ab bola: "${str(b.text, 400)}"`,
  ].filter(Boolean).join('\n');
  const msg = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 1200,
    ...FB,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: NPC_SCHEMA } },
    system: [{ type: 'text', text: NPC_SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: ask }],
  });
  if (msg.stop_reason === 'refusal') return res.status(200).json({ reply: 'Ye sab baatein yahan nahi chalti bhai.', mood: 'annoyed' });
  const text = msg.content.find((c) => c.type === 'text')?.text || '{}';
  let out;
  try { out = JSON.parse(text); } catch { out = null; }
  if (!out?.reply) return res.status(502).json({ error: 'AI ka jawab samajh nahi aaya' });
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ reply: str(out.reply, 300), hindi: str(out.hindi, 600), mood: out.mood });
}

async function chat(b, res) {
  const p = b.persona || {};
  const hist = (Array.isArray(b.history) ? b.history : []).slice(-12)
    .map((h) => `${h.who === 'girl' ? str(p.name, 30) || 'Ladki' : 'Player'}: ${str(h.text, 300)}`).join('\n');
  const ask = [
    `naam: ${str(p.name, 30)} | persona: ${str(p.persona, 120)} | gf=${!!p.gf} | affinity=${Number(p.affinity || 0).toFixed(2)} | pehle mana kiya: ${Number(p.rejected) || 0} baar | thappad khaya: ${Number(p.slapped) || 0} baar`,
    `propose_chance=${Number(p.chance || 0).toFixed(2)} | gift haath mein: ${str(p.gift, 40) || 'nahi'} | jagah/samay: ${str(p.where, 80)}`,
    `lang=${b.lang === 'bho' ? 'bho' : 'hi'} spicy=${b.spicy ? 'true' : 'false'}`,
    hist ? `Ab tak ki baat:\n${hist}` : 'Abhi baat shuru hui hai.',
    `Player ab bola: "${str(b.text, 400)}"`,
  ].join('\n');
  const msg = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 1500,
    ...FB,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: CHAT_SCHEMA } },
    system: [{ type: 'text', text: CHAT_SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: ask }],
  });
  if (msg.stop_reason === 'refusal') return res.status(200).json({ reply: 'Ye kaisi baat kar rahe ho? Jao yahan se 😒', mood: 'annoyed', affinity: -1, action: 'none' });
  const text = msg.content.find((c) => c.type === 'text')?.text || '{}';
  let out;
  try { out = JSON.parse(text); } catch { out = null; }
  if (!out?.reply) return res.status(502).json({ error: 'AI ka jawab samajh nahi aaya' });
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ reply: str(out.reply, 400), hindi: str(out.hindi, 800), mood: out.mood, affinity: out.affinity, action: out.action });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'AI band hai (key nahi)' });
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '?').split(',')[0].trim();
  if (limited(ip)) return res.status(429).json({ error: 'thoda ruko' });

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  if (b.mode === 'chat' || b.mode === 'hindi' || b.mode === 'scene' || b.mode === 'npc') {
    try { return await (b.mode === 'chat' ? chat(b, res) : b.mode === 'npc' ? npcChat(b, res) : b.mode === 'scene' ? sceneTalk(b, res) : toHindi(b, res)); } catch (e) {
      if (e instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'AI busy' });
      if (e instanceof Anthropic.APIError) return res.status(502).json({ error: `AI error ${e.status}` });
      return res.status(500).json({ error: 'server error' });
    }
  }
  const n = Math.max(1, Math.min(10, Number(b.n) || 4));
  const avoid = (Array.isArray(b.avoid) ? b.avoid : []).slice(-15).map((t) => str(t, 160));
  const ask = [
    `kirdaar: ${str(b.who, 60)}`,
    `kaun/kaam: ${str(b.role, 120)}`,
    `situation: ${str(b.situation, 400)}`,
    b.base ? `asli line (isi matlab ko naye andaaz mein kaho): ${str(b.base, 300)}` : '',
    `lang=${b.lang === 'bho' ? 'bho' : 'hi'} spicy=${b.spicy ? 'true' : 'false'}`,
    avoid.length ? `pehle bol chuke (inse alag likho, inka matlab bhi mat dohrao):\n- ${avoid.join('\n- ')}` : '',
    `${n} alag-alag lines do.`,
  ].filter(Boolean).join('\n');

  try {
    const msg = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 1500,
      ...FB, // mana kare to API khud doosre model pe chala deta hai
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: ask }],
    });
    if (msg.stop_reason === 'refusal') return res.status(200).json({ lines: [] });
    const text = msg.content.find((c) => c.type === 'text')?.text || '{}';
    let lines = [];
    try { lines = JSON.parse(text).lines || []; } catch { lines = []; }
    lines = lines.map((l) => (typeof l === 'string' ? { text: l, hindi: '' } : { text: str(l?.text, 200).trim(), hindi: str(l?.hindi, 400).trim() })).filter((l) => l.text).slice(0, n);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ lines });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'AI busy' });
    if (e instanceof Anthropic.AuthenticationError) return res.status(503).json({ error: 'key galat' });
    if (e instanceof Anthropic.APIError) return res.status(502).json({ error: `AI error ${e.status}` });
    return res.status(500).json({ error: 'server error' });
  }
}
