import * as THREE from 'three';
import { PHASES } from './data.js';

// 1 game-ghanta = 30 second → poora din 12 minute
export const HOUR_SECONDS = 30;

const C = (h) => new THREE.Color(h);
const NIGHT = { top: C(0x05030f), bottom: C(0x4a1a55), fog: C(0x1c0f30) };
const GOLD = { top: C(0x3a3a7a), bottom: C(0xff8a50), fog: C(0xb86a5a) };
const DAY = { top: C(0x2f7fd6), bottom: C(0xd6e4ea), fog: C(0xcbd2cf) };

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function makeEnv() {
  return {
    sunDir: new THREE.Vector3(), skyTop: new THREE.Color(), skyBottom: new THREE.Color(),
    fog: new THREE.Color(), sunColor: new THREE.Color(), day: 0, night: 1, golden: 0, fogDensity: 0.01,
  };
}

/** tod: 0..1 (0 = aadhi raat, 0.5 = dopahar) */
export function computeEnv(tod, env) {
  const ang = (tod - 0.25) * Math.PI * 2; // 6 baje sunrise
  const elev = Math.sin(ang);
  env.sunDir.set(Math.cos(ang) * 0.8, elev, -0.45).normalize();
  const day = smooth(-0.1, 0.3, elev);
  const golden = Math.exp(-(((elev - 0.06) / 0.17) ** 2));
  env.day = day;
  env.night = 1 - day;
  env.golden = golden;
  env.skyTop.copy(NIGHT.top).lerp(DAY.top, day).lerp(GOLD.top, golden * 0.45);
  env.skyBottom.copy(NIGHT.bottom).lerp(DAY.bottom, day).lerp(GOLD.bottom, golden * 0.85);
  env.fog.copy(NIGHT.fog).lerp(DAY.fog, day).lerp(GOLD.fog, golden * 0.7);
  env.fogDensity = 0.0105 - day * 0.0045;
  env.sunColor.setRGB(1, 0.93 - golden * 0.35, 0.82 - golden * 0.5);
  return env;
}

export function clockLabel(tod) {
  const m = Math.floor(tod * 24 * 60);
  const h = Math.floor(m / 60) % 24, mm = m % 60;
  return `${h % 12 || 12}:${String(mm).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export function phase(tod, lang) {
  const h = tod * 24;
  const P = PHASES[lang];
  if (h >= 5 && h < 11) return { icon: '🌅', name: P.morning };
  if (h >= 11 && h < 16) return { icon: '☀️', name: P.noon };
  if (h >= 16 && h < 19.5) return { icon: '🌇', name: P.evening };
  return { icon: '🌙', name: P.night };
}

/** Clock dabane pe agla pahar */
export function nextPhaseTod(tod) {
  const h = tod * 24;
  const stops = [6.5, 12, 17.6, 21];
  const n = stops.find((s) => s > h + 0.1) ?? stops[0];
  return n / 24;
}

// 90s VHS / film look
export const RetroShader = {
  uniforms: {
    tDiffuse: { value: null }, time: { value: 0 }, amount: { value: 0 }, cine: { value: 1 }, res: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time; uniform float amount; uniform float cine; uniform vec2 res; varying vec2 vUv;
    float rnd(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    vec3 grade(vec3 c){
      // film jaisa teal-orange grade
      float l = dot(c, vec3(0.2126,0.7152,0.0722));
      vec3 sh = c * vec3(0.9, 1.0, 1.1);
      vec3 hi = c * vec3(1.08, 1.0, 0.88);
      vec3 g = mix(sh, hi, smoothstep(0.05, 0.7, l));
      float l2 = dot(g, vec3(0.2126,0.7152,0.0722));
      g = mix(vec3(l2), g, 1.12);
      g = pow(max(g, 0.0), vec3(1.06));
      return g;
    }
    void main(){
      vec2 uv = vUv;
      if (amount < 0.001) {
        vec3 c = texture2D(tDiffuse, uv).rgb;
        c = mix(c, grade(c), cine);
        vec2 d = vUv - 0.5;
        c *= mix(1.0, 1.0 - dot(d,d)*0.55, cine);
        c += (rnd(uv*res + fract(time)*91.0) - 0.5) * 0.012 * cine;
        gl_FragColor = vec4(max(c, 0.0), 1.0);
        return;
      }
      uv.x += sin(uv.y*3.0 + time*1.7) * 0.0006 * amount;
      float ca = 0.0016 * amount;
      vec3 c = vec3(texture2D(tDiffuse, uv + vec2(ca,0.)).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - vec2(ca,0.)).b);
      vec3 g = c * vec3(1.07, 1.0, 0.84);
      float l = dot(g, vec3(0.299,0.587,0.114));
      g = mix(vec3(l), g, 0.8);
      g = g * 0.93 + vec3(0.03, 0.022, 0.016);
      c = mix(c, g, amount);
      c *= 1.0 - 0.045 * amount * (0.5 + 0.5*sin(uv.y*res.y*1.3));
      c += (rnd(uv*res + fract(time)*91.0) - 0.5) * 0.07 * amount;
      vec2 d = vUv - 0.5;
      c *= mix(1.0, 1.0 - dot(d,d)*1.15, amount);
      gl_FragColor = vec4(max(c, 0.0), 1.0);
    }`,
};
