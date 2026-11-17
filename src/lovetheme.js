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
