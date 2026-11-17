// Map ka layout: kahan rickshaw chal sakta hai, kahan paidal, aur kya thos (solid) hai.
export const rect = (x0, x1, z0, z1) => ({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) });

export const MAIN_Z0 = -117, MAIN_Z1 = 430;
export const STN_RD_Z = 330;
export const HWY_X = 300;
export const STATION = { x0: -45, x1: 45, z0: 429, z1: 450 };
export const BAZAAR_Z = 140;
export const GALI = { x0: -90, x1: -9, z0: 192, z1: 208 };
export const PARK = { x0: -152, x1: -118, z0: 116, z1: 164 };
export const THANA = { x0: 118, x1: 146, z0: 122, z1: 158 };
// 🛣️ Ring road — kahin sadak khatam nahi hoti. Bahar ka gol chakkar + beech ki jod-sadkein
export const RING = { x: 430, zN: 640, zS: -109 };
export const LINK_X = 175; // purab/pashchim ki lambi sadak (river se north ring tak)
export const ZONES = {
  gaon: rect(-419.5, -185.5, 10.5, 319.5),       // 🌾 Rampur Gaon (pashchim)
  gaonS: rect(-419.5, -185.5, -98.5, -10.5),
  tech: rect(185.5, 419.5, 10.5, 319.5),         // 🏙️ Cyber City (purab)
  techS: rect(185.5, 419.5, -98.5, -10.5),
  oldNW: rect(-419.5, -185.5, 340.5, 629.5),
  oldN: rect(-164.5, 164.5, 470, 629.5),          // 🕌 Purana Shehar (uttar)
  oldNE: rect(185.5, 419.5, 340.5, 629.5),
};
const HW = 8.4, SW = 10.5;

export const DRIVE = [
  rect(-8.4, 8.4, MAIN_Z0, MAIN_Z1),
  rect(-150, 150, -8.4, 8.4),
  rect(-155, -149, -11, 11), rect(149, 155, -11, 11),
  rect(-118, 140, BAZAAR_Z - 8.4, BAZAAR_Z + 8.4),
  rect(THANA.x0, THANA.x1 - 2, THANA.z0 + 2, THANA.z1 - 2),
  rect(-30, 30, -117, -101),
  rect(-HWY_X, HWY_X, STN_RD_Z - 8.4, STN_RD_Z + 8.4),
  rect(211, 229, 338, 346),
  rect(STATION.x0, STATION.x1, STATION.z0, STATION.z1 - 2),
  // ring road
  rect(-RING.x - HW, RING.x + HW, RING.zS - HW, RING.zS + HW),
  rect(-RING.x - HW, RING.x + HW, RING.zN - HW, RING.zN + HW),
  rect(-RING.x - HW, -RING.x + HW, RING.zS - HW, RING.zN + HW),
  rect(RING.x - HW, RING.x + HW, RING.zS - HW, RING.zN + HW),
  // cross road + station road ab ring tak
  rect(-RING.x, RING.x, -HW, HW),
  rect(-RING.x, RING.x, STN_RD_Z - HW, STN_RD_Z + HW),
  // jod-sadkein
  rect(-LINK_X - HW, -LINK_X + HW, RING.zS - HW, RING.zN + HW),
  rect(LINK_X - HW, LINK_X + HW, RING.zS - HW, RING.zN + HW),
];
export const FOOT = [
  rect(-10.5, 10.5, MAIN_Z0, MAIN_Z1 + 1),
  rect(-155, 155, -10.5, 10.5),
  rect(-155, -149, -11, 11), rect(149, 155, -11, 11),
  rect(-120, 142, BAZAAR_Z - 10.5, BAZAAR_Z + 10.5),
  rect(THANA.x0, THANA.x1, THANA.z0, THANA.z1),
  rect(PARK.x0, PARK.x1, PARK.z0, PARK.z1),
  rect(GALI.x0, GALI.x1, GALI.z0, GALI.z1),
  rect(-30, 30, -123.4, -100),
  rect(-HWY_X - 2, HWY_X + 2, STN_RD_Z - 10.5, STN_RD_Z + 10.5),
  rect(-228, -212, 339, 352), rect(211, 229, 339, 347),
  rect(STATION.x0, STATION.x1, STATION.z0, STATION.z1),
  rect(-45, -25, 449, 463), rect(25, 45, 449, 463),
  rect(-60, 60, 461.9, 469.2),
  // ring road + jod-sadkon ke footpath
  rect(-RING.x - SW, RING.x + SW, RING.zS - SW, RING.zS + SW),
  rect(-RING.x - SW, RING.x + SW, RING.zN - SW, RING.zN + SW),
  rect(-RING.x - SW, -RING.x + SW, RING.zS - SW, RING.zN + SW),
  rect(RING.x - SW, RING.x + SW, RING.zS - SW, RING.zN + SW),
  rect(-RING.x, RING.x, -SW, SW),
  rect(-RING.x, RING.x, STN_RD_Z - SW, STN_RD_Z + SW),
  rect(-LINK_X - SW, -LINK_X + SW, RING.zS - SW, RING.zN + SW),
  rect(LINK_X - SW, LINK_X + SW, RING.zS - SW, RING.zN + SW),
  // naye ilaake — andar ghoom sakte ho (imaaratein khud rokti hain)
  ...Object.values(ZONES),
  rect(-24, 24, 600, 632), // masjid ka aangan
];
export const BOXES = [];
export const CIRCLES = [];

const inR = (r, x, z) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1;

export function addBox(cx, cz, w, d, footOnly = false) {
  BOXES.push({ x0: cx - w / 2, x1: cx + w / 2, z0: cz - d / 2, z1: cz + d / 2, footOnly });
}
export function addCircle(x, z, r) { CIRCLES.push({ x, z, r }); }

export function solidAt(x, z, rad, vehicle = false) {
  for (const c of CIRCLES) {
    const dx = x - c.x, dz = z - c.z, rr = c.r + rad;
    if (dx * dx + dz * dz < rr * rr) return true;
  }
  for (const b of BOXES) {
    if (vehicle && b.footOnly) continue;
    if (x > b.x0 - rad && x < b.x1 + rad && z > b.z0 - rad && z < b.z1 + rad) return true;
  }
  return false;
}

export function driveable(x, z) {
  for (const r of DRIVE) if (inR(r, x, z)) return !solidAt(x, z, 1.15, true);
  return false;
}
export function footable(x, z) {
  for (const r of FOOT) if (inR(r, x, z)) return !solidAt(x, z, 0.46);
  return false;
}
export function inFoot(x, z) {
  for (const r of FOOT) if (inR(r, x, z)) return true;
  return false;
}
// purani API (jaanwar waghera ke liye)
export const walkable = driveable;

/** Ghat ki seedhiyan */
export function heightAt(x, z) {
  if (z < -118.95 && Math.abs(x) < 38) {
    const i = Math.floor((-118.95 - z) / 1.3);
    return 0.025 - i * 0.45;
  }
  return 0;
}
