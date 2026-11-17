// 🎻 Love theme — bina internet ke, WebAudio se banti dheemi romantic dhun
// (pad chords + bansuri jaisi melody + halki ghanti). Asli gaana na mile to background mein yahi.
const CHORDS = [ // C – Am – F – G (filmi romantic progression), Hz
  [261.6, 329.6, 392.0], [220.0, 261.6, 329.6], [174.6, 220.0, 261.6], [196.0, 246.9, 293.7],
];
const MELODY = [ // [note Hz, beats] — chaar chord pe ek chhoti si dhun
  [523.3, 1], [587.3, 0.5], [659.3, 1.5], [587.3, 1],
  [523.3, 1], [440.0, 1], [493.9, 1], [523.3, 1],
  [440.0, 1.5], [392.0, 0.5], [349.2, 1], [392.0, 1],
  [440.0, 1], [493.9, 1], [523.3, 1.5], [392.0, 0.5],
];

export function playLoveTheme(ctx, dur = 24) {
  const t0 = ctx.currentTime + 0.05;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.exponentialRampToValueAtTime(0.22, t0 + 2.5);
  master.gain.setValueAtTime(0.22, t0 + dur - 3);
  master.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  // halka reverb jaisa: delay feedback
  const dl = ctx.createDelay(1); dl.delayTime.value = 0.32;
  const fb = ctx.createGain(); fb.gain.value = 0.35;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
  master.connect(lp); lp.connect(ctx.destination); lp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(ctx.destination);
  const nodes = [];
  const BAR = 3.2, beat = BAR / 4;
  const bars = Math.ceil(dur / BAR);
  for (let b = 0; b < bars; b++) {
    const ch = CHORDS[b % 4], tb = t0 + b * BAR;
    for (const f of ch) for (const det of [-4, 4]) { // do thode alag oscillator = bharaa hua pad
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = f / 2; o.detune.value = det;
      g.gain.setValueAtTime(0.0001, tb);
      g.gain.exponentialRampToValueAtTime(0.05, tb + 0.9);
      g.gain.exponentialRampToValueAtTime(0.0001, tb + BAR + 0.4);
      o.connect(g).connect(master); o.start(tb); o.stop(tb + BAR + 0.5); nodes.push(o);
    }
    // ghanti (har bar ki shuruaat)
    const bo = ctx.createOscillator(), bg = ctx.createGain();
    bo.type = 'sine'; bo.frequency.value = ch[2] * 2;
    bg.gain.setValueAtTime(0.0001, tb); bg.gain.exponentialRampToValueAtTime(0.04, tb + 0.01); bg.gain.exponentialRampToValueAtTime(0.0001, tb + 1.6);
    bo.connect(bg).connect(master); bo.start(tb); bo.stop(tb + 1.7); nodes.push(bo);
  }
  // bansuri jaisi melody (vibrato ke saath), doosre bar se
  let tm = t0 + BAR;
  for (let i = 0; tm < t0 + dur - 2; i++) {
    const [f, bt] = MELODY[i % MELODY.length], len = bt * beat;
    const o = ctx.createOscillator(), g = ctx.createGain(), vib = ctx.createOscillator(), vg = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    vib.frequency.value = 5.2; vg.gain.value = f * 0.008; vib.connect(vg).connect(o.frequency);
    g.gain.setValueAtTime(0.0001, tm);
    g.gain.exponentialRampToValueAtTime(0.07, tm + 0.08);
    g.gain.setValueAtTime(0.06, tm + len * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, tm + len + 0.15);
    o.connect(g).connect(master);
    o.start(tm); vib.start(tm); o.stop(tm + len + 0.2); vib.stop(tm + len + 0.2);
    nodes.push(o, vib);
    tm += len;
  }
  return function stop() {
    const n = ctx.currentTime;
    master.gain.cancelScheduledValues(n);
    master.gain.setValueAtTime(master.gain.value || 0.2, n);
    master.gain.exponentialRampToValueAtTime(0.0001, n + 1.2);
    setTimeout(() => { for (const o of nodes) { try { o.stop(); } catch { /* ho chuka */ } } master.disconnect(); }, 1400);
  };
}

// 🪩 Club beat — gaana na mile to party ki dhun (kick + hi-hat + bass + chord stab), 124 BPM, band karne tak
export function playClubBeat(ctx) {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 1.5);
  master.connect(ctx.destination);
  const beat = 60 / 124;
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const BASS = [55, 55, 65.4, 49];
  let next = ctx.currentTime + 0.1, bar = 0;
  const kick = (t) => { const o = ctx.createOscillator(), gg = ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14); gg.gain.setValueAtTime(0.9, t); gg.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(gg).connect(master); o.start(t); o.stop(t + 0.32); };
  const hat = (t, v) => { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), gg = ctx.createGain(); s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = 7000; gg.gain.setValueAtTime(v, t); gg.gain.exponentialRampToValueAtTime(0.001, t + 0.06); s.connect(f).connect(gg).connect(master); s.start(t); s.stop(t + 0.08); };
  const bass = (t, f0) => { const o = ctx.createOscillator(), gg = ctx.createGain(), lp = ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = f0; lp.type = 'lowpass'; lp.frequency.value = 380; gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(0.25, t + 0.02); gg.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.45); o.connect(lp).connect(gg).connect(master); o.start(t); o.stop(t + beat * 0.5); };
  const stab = (t, f0) => { for (const m of [1, 1.26, 1.5]) { const o = ctx.createOscillator(), gg = ctx.createGain(); o.type = 'square'; o.frequency.value = f0 * 4 * m; gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(0.03, t + 0.01); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); o.connect(gg).connect(master); o.start(t); o.stop(t + 0.2); } };
  const timer = setInterval(() => {
    while (next < ctx.currentTime + 1.2) { // ek bar aage tak schedule
      const f0 = BASS[bar % 4];
      for (let b = 0; b < 4; b++) {
        const t = next + b * beat;
        kick(t); hat(t + beat / 2, 0.25); hat(t + beat * 0.75, 0.1);
        bass(t + beat / 2, f0);
        if (b === 1 || b === 3) stab(t + beat * 0.5, f0);
      }
      next += 4 * beat; bar++;
    }
  }, 250);
  return function stop() {
    clearInterval(timer);
    const n = ctx.currentTime;
    master.gain.cancelScheduledValues(n);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), n);
    master.gain.exponentialRampToValueAtTime(0.0001, n + 0.8);
    setTimeout(() => master.disconnect(), 1200);
  };
}

// 🌿 Spa ki dhun — dheemi, shaant: lambe pad + pentatonic ghantiyan + paani ki boondein; band karne tak
export function playSpaTheme(ctx) {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 3);
  const dl = ctx.createDelay(1.5); dl.delayTime.value = 0.45;
  const fb = ctx.createGain(); fb.gain.value = 0.4;
  master.connect(ctx.destination); master.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(ctx.destination);
  const PAD = [[220, 277.2, 329.6], [196, 246.9, 293.7], [174.6, 220, 261.6], [196, 246.9, 329.6]];
  const PENTA = [440, 493.9, 554.4, 659.3, 740, 880];
  let next = ctx.currentTime + 0.1, bar = 0;
  const BAR = 6;
  const timer = setInterval(() => {
    while (next < ctx.currentTime + 2) {
      const ch = PAD[bar % 4];
      for (const f of ch) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f / 2;
        g.gain.setValueAtTime(0.0001, next); g.gain.exponentialRampToValueAtTime(0.05, next + 2.2); g.gain.exponentialRampToValueAtTime(0.0001, next + BAR + 1);
        o.connect(g).connect(master); o.start(next); o.stop(next + BAR + 1.1);
      }
      for (let i = 0; i < 4; i++) { // ghanti
        const t = next + 0.8 + i * 1.4 + Math.random() * 0.3, o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = PENTA[Math.floor(Math.random() * PENTA.length)];
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.035, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
        o.connect(g).connect(master); o.start(t); o.stop(t + 2.6);
      }
      for (let i = 0; i < 2; i++) { // paani ki boond
        const t = next + Math.random() * BAR, o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(1400 + Math.random() * 500, t); o.frequency.exponentialRampToValueAtTime(500, t + 0.12);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.02, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
        o.connect(g).connect(master); o.start(t); o.stop(t + 0.2);
      }
      next += BAR; bar++;
    }
  }, 400);
  return function stop() {
    clearInterval(timer);
    const n = ctx.currentTime;
    master.gain.cancelScheduledValues(n);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), n);
    master.gain.exponentialRampToValueAtTime(0.0001, n + 1.5);
    setTimeout(() => master.disconnect(), 2000);
  };
}
