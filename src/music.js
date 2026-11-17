const BINS = 64;

export class Music {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.mode = 'idle'; // idle | file | embed
    this.micOn = false;
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.queue = [];
    this.qi = 0;
    this.bpm = 110;
    this.t = 0;
    this.lastPhase = 0;
    this.bassAvg = 0.2;
    this.lastBeat = 0;
    this.bins = new Float32Array(BINS);
    this.out = { bass: 0, mid: 0, treble: 0, energy: 0, beat: false, bins: this.bins };
    this.onchange = null;
    this.audio.addEventListener('ended', () => this.next());
    this.errCount = 0;
    this.audio.addEventListener('error', () => { if (this.mode === 'file' && this.queue.length > 1 && this.errCount++ < 5) this.next(); });
    this.audio.addEventListener('playing', () => { this.errCount = 0; });
    this.audio.addEventListener('play', () => this.onchange?.());
    this.audio.addEventListener('pause', () => this.onchange?.());
  }

  ctxReady() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.fileAnalyser = this.ctx.createAnalyser();
      this.fileAnalyser.fftSize = 512;
      this.fileAnalyser.smoothingTimeConstant = 0.78;
      this.ctx.createMediaElementSource(this.audio).connect(this.fileAnalyser);
      this.fileAnalyser.connect(this.ctx.destination);
      this.freq = new Uint8Array(this.fileAnalyser.frequencyBinCount);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  // ---- local files (100% ad-free) ----
  playList(list, i) {
    this.queue = list.map((r) => ({ name: r.name, url: r.url }));
    this.playIndex(i);
  }
  loadFiles(files) {
    for (const f of files) this.queue.push({ name: f.name.replace(/\.[^.]+$/, ''), url: URL.createObjectURL(f) });
    this.playIndex(this.queue.length - files.length);
  }
  playIndex(i) {
    if (!this.queue.length) return;
    this.ctxReady();
    this.qi = (i + this.queue.length) % this.queue.length;
    this.onEmbedStop?.();
    this.audio.src = this.queue[this.qi].url;
    this.audio.play().catch(() => {});
    this.mode = 'file';
    if (!this.micOn) this.analyser = this.fileAnalyser;
    this.onchange?.();
  }
  toggle() {
    if (!this.queue.length) return;
    if (this.mode !== 'file') return this.playIndex(this.qi);
    if (this.audio.paused) this.audio.play().catch(() => {});
    else this.audio.pause();
  }
  next() { this.playIndex(this.qi + 1); }
  prev() { this.playIndex(this.qi - 1); }

  // ---- embeds ----
  embedStarted() {
    this.audio.pause();
    this.mode = 'embed';
    if (!this.micOn) this.analyser = null;
    this.onchange?.();
  }
  embedStopped() {
    if (this.mode === 'embed') this.mode = 'idle';
    this.onchange?.();
  }

  // ---- mic ----
  async startMic() {
    this.ctxReady();
    this.micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true } });
    const src = this.ctx.createMediaStreamSource(this.micStream);
    this.micAnalyser = this.ctx.createAnalyser();
    this.micAnalyser.fftSize = 512;
    this.micAnalyser.smoothingTimeConstant = 0.7;
    src.connect(this.micAnalyser); // NOT to destination (no feedback)
    this.analyser = this.micAnalyser;
    this.micOn = true;
  }
  stopMic() {
    this.micStream?.getTracks().forEach((t) => t.stop());
    this.micOn = false;
    this.analyser = this.mode === 'file' ? this.fileAnalyser : null;
  }

  levels(dt) {
    this.t += dt;
    const b = this.bins, o = this.out;
    let bass, mid, tre, beat = false;
    const live = this.analyser && (this.micOn || (this.mode === 'file' && !this.audio.paused));
    if (live) {
      const f = this.freq;
      this.analyser.getByteFrequencyData(f);
      const n = f.length * 0.7;
      for (let i = 0; i < BINS; i++) {
        const a = Math.floor(Math.pow(i / BINS, 1.7) * n), e = Math.max(a + 1, Math.floor(Math.pow((i + 1) / BINS, 1.7) * n));
        let s = 0;
        for (let k = a; k < e; k++) s += f[k];
        b[i] = Math.min(1, (s / (e - a) / 255) * (this.micOn ? 1.5 : 1.1));
      }
      bass = avg(f, 1, 6); mid = avg(f, 6, 40); tre = avg(f, 40, 140);
      if (this.micOn) { bass = Math.min(1, bass * 1.5); mid = Math.min(1, mid * 1.6); tre = Math.min(1, tre * 1.8); }
      this.bassAvg += (bass - this.bassAvg) * Math.min(1, dt * 2);
      if (bass > this.bassAvg * 1.18 && bass > 0.35 && this.t - this.lastBeat > 0.22) { beat = true; this.lastBeat = this.t; }
    } else if (this.mode === 'embed' || (this.mode === 'file' && !this.audio.paused)) {
      // synthetic beat at tapped BPM (embeds are cross-origin → no raw audio)
      const phase = (this.t * this.bpm / 60) % 1;
      if (phase < this.lastPhase) beat = true;
      this.lastPhase = phase;
      const kick = Math.exp(-phase * 7);
      bass = 0.25 + 0.75 * kick;
      mid = 0.45 + 0.25 * Math.sin(this.t * 3.1) + 0.15 * Math.sin(this.t * 7.3);
      tre = 0.35 + 0.3 * Math.abs(Math.sin(this.t * 9.7));
      for (let i = 0; i < BINS; i++) {
        const f = i / BINS;
        const v = kick * Math.max(0, 1 - f * 3) + (0.25 + 0.25 * Math.sin(this.t * (4 + i * 0.37) + i)) * (1 - f * 0.6) * mid;
        b[i] += (Math.min(1, v) - b[i]) * Math.min(1, dt * 14);
      }
    } else {
      bass = 0.06 + 0.05 * Math.sin(this.t * 1.2);
      mid = 0.1;
      tre = 0.15;
      for (let i = 0; i < BINS; i++) b[i] = 0.06 + 0.05 * Math.sin(this.t * 1.5 + i * 0.3);
    }
    const k = Math.min(1, dt * 16);
    o.bass += (bass - o.bass) * k;
    o.mid += (mid - o.mid) * k;
    o.treble += (tre - o.treble) * k;
    o.energy = (o.bass + o.mid + o.treble) / 3;
    o.beat = beat;
    return o;
  }

  get playing() {
    return this.micOn || this.mode === 'embed' || (this.mode === 'file' && !this.audio.paused);
  }
}

function avg(f, a, b) {
  let s = 0;
  for (let i = a; i < b; i++) s += f[i];
  return s / (b - a) / 255;
}

// ---------------- UI ----------------
export function parseYT(u) {
  u = u.trim();
  if (/^[\w-]{11}$/.test(u)) return { v: u };
  try {
    const url = new URL(u);
    if (!/youtube\.com|youtu\.be/.test(url.hostname)) return null;
    const list = url.searchParams.get('list');
    let v = url.searchParams.get('v');
    if (url.hostname.includes('youtu.be')) v = url.pathname.slice(1).split('/')[0];
    const m = url.pathname.match(/\/(shorts|embed|live)\/([\w-]{11})/);
    if (m) v = m[2];
    if (v || list) return { v, list };
  } catch { /* not a url */ }
  return null;
}

export function parseSP(u) {
  const m = u.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/);
  if (m) return { type: m[1], id: m[2] };
  const s = u.trim().match(/^spotify:(track|album|playlist|episode|show|artist):([A-Za-z0-9]+)$/);
  return s ? { type: s[1], id: s[2] } : null;
}

const AUD = 'https://api.audius.co';
const YTKEY = import.meta.env.VITE_YT_API_KEY || '';
const dec = (t) => { const e = document.createElement('textarea'); e.innerHTML = t; return e.value; };
export async function searchAudius(q) {
  const r = await fetch(`${AUD}/v1/tracks/search?query=${encodeURIComponent(q)}&app_name=mohalla3d`);
  const j = await r.json();
  return (j.data || []).filter((t) => t.is_streamable !== false && !t.is_delete).slice(0, 20).map((t) => ({
    title: t.title, artist: t.user?.name || '', dur: t.duration, img: t.artwork?.['150x150'] || '',
    url: `${AUD}/v1/tracks/${t.id}/stream?app_name=mohalla3d`,
  }));
}
// Public Piped mirrors — bina API key ke YouTube search (CORS allowed)
const PIPED = ['https://pipedapi.kavin.rocks', 'https://pipedapi.adminforge.de', 'https://api-piped.mha.fi', 'https://pipedapi.leptons.xyz', 'https://pipedapi.reallyaweso.me'];
function timed(url, ms = 6000) {
  const c = new AbortController();
  const id = setTimeout(() => c.abort(), ms);
  return fetch(url, { signal: c.signal }).finally(() => clearTimeout(id));
}
async function searchYTKeyless(q) {
  // saare mirrors ek saath (parallel) — jo pehle de de wahi — tez
  const tryOne = async (base) => {
    const r = await timed(`${base}/search?q=${encodeURIComponent(q + ' song')}&filter=music_songs`, 7000);
    if (!r.ok) throw new Error('bad');
    const j = await r.json();
    const items = (j.items || []).filter((i) => i.url && i.type !== 'channel' && i.type !== 'playlist').slice(0, 18)
      .map((i) => ({ yt: (i.url.split('v=')[1] || '').split('&')[0], title: i.title, artist: i.uploaderName || '', dur: i.duration > 0 ? i.duration : 0, img: i.thumbnail || '' }))
      .filter((x) => x.yt);
    if (!items.length) throw new Error('empty');
    return items;
  };
  return Promise.any(PIPED.map(tryOne)).catch(() => { throw new Error('ytdown'); });
}
async function searchYT(q) {
  if (YTKEY) {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=15&q=${encodeURIComponent(q)}&key=${YTKEY}`);
    const j = await r.json();
    if (!j.error) return (j.items || []).map((it) => ({ yt: it.id.videoId, title: dec(it.snippet.title), artist: dec(it.snippet.channelTitle), img: it.snippet.thumbnails?.default?.url || '' }));
  }
  // apna server (/api/music, official YouTube API) → na chale to public mirrors
  try { const items = await searchApi('yt', q); if (items.length) return items; } catch { /* aage */ }
  return searchYTKeyless(q);
}
// 🎧 /api/music — YouTube/Spotify ka official search (keys server pe). 'nokey' = key hi nahi lagi
async function searchApi(src, q) {
  const r = await timed(`/api/music?src=${src}&q=${encodeURIComponent(q)}`, 9000);
  const json = (r.headers.get('content-type') || '').includes('json');
  if (!r.ok || !json) {
    let err = '';
    if (json) { try { err = (await r.json()).error || ''; } catch { /* ok */ } }
    throw new Error(err === 'nokey' || !json ? 'nokey' : 'down');
  }
  return (await r.json()).items || [];
}
const fmt = (s) => (s ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '');

export function initMusicUI(music, { toast }) {
  const $ = (id) => document.getElementById(id);
  const panel = $('music'), dock = $('dock'), frame = $('dockFrame');

  const setTab = (name) => {
    panel.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === name));
    panel.querySelectorAll('.pane').forEach((p) => p.classList.toggle('hidden', p.dataset.pane !== name));
  };
  panel.querySelectorAll('.tabs button').forEach((b) => (b.onclick = () => setTab(b.dataset.tab)));

  function showDock(src, title, h, minimized = false) {
    frame.innerHTML = '';
    const f = document.createElement('iframe');
    f.src = src;
    f.style.height = h + 'px';
    f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    f.allowFullscreen = true;
    f.loading = 'eager';
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.appendChild(f);
    $('dockTitle').textContent = title;
    dock.classList.remove('hidden', 'min', 'file');
    if (minimized) dock.classList.add('min');
    $('dockMin').textContent = minimized ? '▢' : '–';
    music.embedStarted();
  }
  music.onEmbedStop = () => { if (!dock.classList.contains('hidden')) closeDock(); };
  function closeDock() {
    frame.innerHTML = '';
    if (dock.classList.contains('file')) { music.audio.pause(); dock.classList.remove('file'); }
    dock.classList.add('hidden');
    music.embedStopped();
  }
  $('dockClose').onclick = closeDock;
  $('dockMin').onclick = () => { dock.classList.toggle('min'); $('dockMin').textContent = dock.classList.contains('min') ? '▢' : '–'; };

  $('ytPlay').onclick = () => {
    const r = parseYT($('ytUrl').value);
    if (!r) return toast('YouTube ka sahi link daalo bhai 🙏');
    const qs = 'autoplay=1&playsinline=1&rel=0&modestbranding=1';
    const src = r.v
      ? `https://www.youtube-nocookie.com/embed/${r.v}?${qs}${r.list ? `&list=${r.list}` : ''}`
      : `https://www.youtube-nocookie.com/embed/videoseries?list=${r.list}&${qs}`;
    showDock(src, '🎶 YouTube baj raha hai', Math.round(Math.min(360, innerWidth - 24) * 9 / 16), true);
    panel.classList.add('hidden');
    toast('🎶 Gaana background mein baj raha hai — ▢ dabao to video dikhega');
  };
  $('ytUrl').onkeydown = (e) => e.key === 'Enter' && $('ytPlay').click();
  $('ytFind').onclick = () => {
    const q = $('ytSearch').value.trim();
    if (!q) return;
    // ab naya tab nahi — isi app mein YouTube se dhoond ke list dikhayenge
    $('sq').value = q;
    setTab('search');
    const yb = document.querySelector('.srcs [data-src="yt"]');
    yb.click(); // ye khud doSearch chala deta hai
  };
  $('ytSearch').onkeydown = (e) => e.key === 'Enter' && $('ytFind').click();

  $('spPlay').onclick = () => {
    const r = parseSP($('spUrl').value);
    if (!r) return toast('Spotify ka sahi link daalo 🙏');
    const h = r.type === 'track' || r.type === 'episode' ? 152 : 352;
    showDock(`https://open.spotify.com/embed/${r.type}/${r.id}?utm_source=generator&theme=0`, '🎧 Spotify', h);
    panel.classList.add('hidden');
    toast('Spotify ready — player mein ▶ dabao');
  };
  $('spUrl').onkeydown = (e) => e.key === 'Enter' && $('spPlay').click();
  $('spFind').onclick = () => {
    const q = $('spSearch').value.trim();
    if (!q) return;
    $('sq').value = q;
    setTab('search');
    document.querySelector('.srcs [data-src="sp"]').click(); // ye khud doSearch chala deta hai
  };
  $('spSearch').onkeydown = (e) => e.key === 'Enter' && $('spFind').click();

  const queueEl = $('queue');
  const renderQueue = () => {
    queueEl.innerHTML = '';
    music.queue.forEach((q, i) => {
      const d = document.createElement('div');
      d.textContent = `${i === music.qi && music.mode === 'file' ? (music.audio.paused ? '⏸' : '🔊') : '🎵'} ${q.name}`;
      if (i === music.qi && music.mode === 'file') d.className = 'on';
      d.onclick = () => music.playIndex(i);
      queueEl.appendChild(d);
    });
  };
  music.onchange = () => {
    renderQueue();
    if (music.mode === 'file' && music.queue[music.qi]) {
      frame.innerHTML = '';
      dock.classList.remove('hidden');
      dock.classList.add('file');
      $('dockTitle').textContent = (music.audio.paused ? '⏸ ' : '🎶 ') + music.queue[music.qi].name;
      document.querySelectorAll('#sres .res').forEach((el, i) => el.classList.toggle('on', i === music.qi && lastSrc === 'audius'));
    }
  };
  $('dPrev').onclick = () => music.prev();
  $('dNext').onclick = () => music.next();
  $('dPlay').onclick = () => music.toggle();

  // ---- 🔍 search ----
  let src = 'audius', lastSrc = 'audius', results = [];
  const sres = $('sres'), snote = $('snote');
  document.querySelectorAll('.srcs button').forEach((b) => (b.onclick = () => {
    src = b.dataset.src;
    document.querySelectorAll('.srcs button').forEach((x) => x.classList.toggle('on', x === b));
    snote.textContent = src === 'yt'
      ? '▶ YouTube gaane isi app mein chalenge (ads YouTube ke hisaab se). Nahi chala to 🎧 Free apne aap aa jaayega.'
      : src === 'sp' ? '🟢 Spotify: gaana chuno, phir player mein ▶ dabao. Premium login = poora gaana, warna 30 sec preview.'
        : '🎧 Free: poore gaane, bina ads ke, aur city asli beat pe naachti hai.';
    if ($('sq').value.trim()) doSearch($('sq').value.trim());
  }));
  async function doSearch(q) {
    sres.innerHTML = '<div class="note">Dhoond rahe hain… 🔎</div>';
    try {
      if (src === 'yt') {
        try { results = await searchYT(q); lastSrc = 'yt'; }
        catch { results = await searchAudius(q); lastSrc = 'audius'; snote.textContent = '⚠️ YouTube search abhi nahi chala (server pe YT_API_KEY lagao) — ye 🎧 Free (ad-free) gaane dikha rahe hain.'; }
      } else if (src === 'sp') {
        try { results = await searchApi('sp', q); lastSrc = 'sp'; }
        catch (e) { results = await searchAudius(q); lastSrc = 'audius'; snote.textContent = e.message === 'nokey' ? '⚠️ Spotify search ke liye server pe SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET lagao — abhi 🎧 Free gaane dikha rahe hain.' : '⚠️ Spotify abhi nahi mila — ye 🎧 Free (ad-free) gaane dikha rahe hain.'; }
      } else { results = await searchAudius(q); lastSrc = 'audius'; }
      sres.innerHTML = '';
      if (!results.length) { sres.innerHTML = '<div class="note">Kuch nahi mila 😕 doosra naam try karo</div>'; return; }
      results.forEach((r, i) => {
        const b = document.createElement('button');
        b.className = 'res';
        const im = r.img ? document.createElement('img') : document.createElement('div');
        if (r.img) { im.src = r.img; im.loading = 'lazy'; im.alt = ''; } else { im.className = 'ph'; im.textContent = '🎵'; }
        const tx = document.createElement('div');
        const t1 = document.createElement('div'); t1.className = 'tt'; t1.textContent = r.title;
        const t2 = document.createElement('div'); t2.className = 'ar'; t2.textContent = [r.artist, fmt(r.dur)].filter(Boolean).join(' • ');
        tx.append(t1, t2);
        b.append(im, tx);
        b.onclick = () => playResult(i);
        sres.appendChild(b);
      });
    } catch {
      sres.innerHTML = '';
      snote.textContent = 'Internet/server mein dikkat 😕 thodi der baad try karo (ya 🎧 Free source)';
    }
  }
  function playResult(i) {
    const r = results[i];
    if (r.yt) {
      showDock(`https://www.youtube-nocookie.com/embed/${r.yt}?autoplay=1&playsinline=1&rel=0`, '🎶 ' + r.title, Math.round(Math.min(360, innerWidth - 24) * 9 / 16), true);
      dock.classList.remove('file');
    } else if (r.sp) {
      showDock(`https://open.spotify.com/embed/track/${r.sp}?utm_source=generator&theme=0`, '🎧 ' + r.title, 152);
      dock.classList.remove('file');
      toast('🟢 Spotify ready — player mein ▶ dabao', 2200);
      panel.classList.add('hidden');
      return;
    } else {
      music.playList(results.map((x) => ({ name: `${x.title} — ${x.artist}`, url: x.url })), i);
    }
    toast('🎶 ' + r.title, 2000);
    panel.classList.add('hidden');
  }
  $('sgo').onclick = () => { const q = $('sq').value.trim(); if (q) doSearch(q); };
  $('sq').onkeydown = (e) => e.key === 'Enter' && $('sgo').click();
  document.querySelectorAll('.chips button').forEach((b) => (b.onclick = () => { $('sq').value = b.dataset.q; doSearch(b.dataset.q); }));
  // hotel show / dance ke liye: dhoondo aur pehla gaana bajao
  async function autoPlay(q) {
    try {
      const list = await searchAudius(q);
      if (!list.length) return false;
      const k = Math.floor(Math.random() * Math.min(5, list.length));
      music.playList(list.map((x) => ({ name: `${x.title} — ${x.artist}`, url: x.url })), k);
      return true;
    } catch { return false; }
  }
  $('mp3In').onchange = (e) => {
    if (!e.target.files.length) return;
    music.loadFiles([...e.target.files]);
    e.target.value = '';
    toast('Gaana baj raha hai — city ko dekho naachte hue! 💃');
    panel.classList.add('hidden');
  };
  $('mPlay').onclick = () => music.toggle();
  $('mNext').onclick = () => music.next();
  $('mPrev').onclick = () => music.prev();

  $('micBtn').onclick = async () => {
    const btn = $('micBtn');
    if (music.micOn) {
      music.stopMic();
      btn.textContent = '🎤 Mic chalu karo';
      btn.classList.remove('on');
      return;
    }
    try {
      await music.startMic();
      btn.textContent = '🎤 Mic ON — band karo';
      btn.classList.add('on');
      toast('Mic sun raha hai… gaana bajao! 🎶');
    } catch {
      toast('Mic ki permission nahi mili 😕');
    }
  };

  const taps = [];
  $('tapBtn').onclick = () => {
    const now = performance.now();
    if (taps.length && now - taps[taps.length - 1] > 2000) taps.length = 0;
    taps.push(now);
    if (taps.length > 6) taps.shift();
    if (taps.length >= 3) {
      const iv = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
      setBpm(Math.round(60000 / iv));
    }
  };
  const setBpm = (b) => {
    music.bpm = Math.max(50, Math.min(200, b));
    $('bpm').textContent = music.bpm;
  };

  return {
    open(opts = {}) {
      music.ctxReady();
      if (opts.tab) setTab(opts.tab);
      if (opts.q) $('ytSearch').value = opts.q;
      if (opts.bpm) setBpm(opts.bpm);
      panel.classList.remove('hidden');
    },
    close() { panel.classList.add('hidden'); },
    autoPlay,
    search: (q) => { $('sq').value = q; setTab('search'); doSearch(q); },
  };
}
