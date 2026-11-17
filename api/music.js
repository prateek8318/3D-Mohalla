// 🎧 Vercel serverless function: Mohalla FM ka gaana-search — YouTube aur Spotify ke OFFICIAL API se.
// Keys SIRF server pe (Vercel env vars):
//   YT_API_KEY                               → YouTube Data API v3 (Google Cloud Console, free)
//   SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET → developer.spotify.com/dashboard pe app banao (free)
// Key na ho → 503 { error: 'nokey' } — game khud 🎧 Free gaane dikha deta hai.
const YT_KEY = process.env.YT_API_KEY || process.env.VITE_YT_API_KEY || '';
const SP_ID = process.env.SPOTIFY_CLIENT_ID || '', SP_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';

const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 30;
}
// wahi search dobara → API quota na jale (YouTube: 100 search/din free)
const cache = new Map();
const dec = (t) => String(t || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

async function yt(q) {
  const r = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&videoCategoryId=10&regionCode=IN&maxResults=15&q=${encodeURIComponent(q)}&key=${YT_KEY}`);
  const j = await r.json();
  if (!r.ok || j.error) throw Object.assign(new Error(j.error?.message || 'yt'), { status: r.status === 403 ? 429 : 502 });
  return (j.items || []).filter((it) => it.id?.videoId).map((it) => ({ yt: it.id.videoId, title: dec(it.snippet.title), artist: dec(it.snippet.channelTitle), img: it.snippet.thumbnails?.default?.url || '' }));
}

let spTok = '', spExp = 0;
async function spToken() {
  if (spTok && Date.now() < spExp) return spTok;
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: 'Basic ' + Buffer.from(`${SP_ID}:${SP_SECRET}`).toString('base64') },
    body: 'grant_type=client_credentials',
  });
  const j = await r.json();
  if (!r.ok || !j.access_token) throw Object.assign(new Error('sp token'), { status: 503 });
  spTok = j.access_token; spExp = Date.now() + (j.expires_in - 60) * 1000;
  return spTok;
}
async function sp(q) {
  const r = await fetch(`https://api.spotify.com/v1/search?type=track&limit=15&market=IN&q=${encodeURIComponent(q)}`, { headers: { Authorization: 'Bearer ' + (await spToken()) } });
  const j = await r.json();
  if (!r.ok) throw Object.assign(new Error('sp'), { status: r.status === 429 ? 429 : 502 });
  return (j.tracks?.items || []).filter((t) => t?.id).map((t) => ({ sp: t.id, title: t.name, artist: (t.artists || []).map((a) => a.name).join(', '), dur: Math.round((t.duration_ms || 0) / 1000), img: t.album?.images?.at(-1)?.url || '' }));
}

export default async function handler(req, res) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '?').split(',')[0].trim();
  if (limited(ip)) return res.status(429).json({ error: 'thoda ruko' });
  const src = String(req.query?.src || '') === 'sp' ? 'sp' : 'yt';
  const q = String(req.query?.q || '').trim().slice(0, 120);
  if (!q) return res.status(400).json({ error: 'q khaali' });
  if (src === 'yt' ? !YT_KEY : !(SP_ID && SP_SECRET)) return res.status(503).json({ error: 'nokey' });
  const key = `${src}|${q.toLowerCase()}`;
  try {
    let items = cache.get(key);
    if (!items) {
      items = await (src === 'yt' ? yt(q) : sp(q));
      cache.set(key, items);
      if (cache.size > 300) cache.delete(cache.keys().next().value);
    }
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.status(200).json({ items });
  } catch (e) {
    return res.status(e.status || 502).json({ error: e.status === 503 ? 'nokey' : 'search nahi hua' });
  }
}
