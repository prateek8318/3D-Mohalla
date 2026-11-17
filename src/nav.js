// 🧭 GPS: sadkon ka graph + sabse chhota raasta (Dijkstra)
import { RING, LINK_X, STN_RD_Z, BAZAAR_Z, MAIN_Z1 } from './collide.js';

// har sadak ki beech wali line
const H = [ // z, x0, x1
  [RING.zS, -RING.x, RING.x], [0, -RING.x, RING.x], [BAZAAR_Z, -118, 140], [STN_RD_Z, -RING.x, RING.x], [RING.zN, -RING.x, RING.x],
];
const V = [ // x, z0, z1
  [0, RING.zS, MAIN_Z1], [-RING.x, RING.zS, RING.zN], [RING.x, RING.zS, RING.zN], [-LINK_X, RING.zS, RING.zN], [LINK_X, RING.zS, RING.zN],
];
const SEGS = [
  ...H.map(([z, a, b]) => ({ x0: a, z0: z, x1: b, z1: z })),
  ...V.map(([x, a, b]) => ({ x0: x, z0: a, x1: x, z1: b })),
];

// chauraahe (nodes)
const nodes = [];
const nodeAt = (x, z) => {
  let n = nodes.find((q) => Math.abs(q.x - x) < 0.5 && Math.abs(q.z - z) < 0.5);
  if (!n) { n = { x, z, id: nodes.length, adj: [] }; nodes.push(n); }
  return n;
};
for (const s of SEGS) { s.nodes = [nodeAt(s.x0, s.z0), nodeAt(s.x1, s.z1)]; }
for (const h of SEGS.filter((s) => s.z0 === s.z1)) {
  for (const v of SEGS.filter((s) => s.x0 === s.x1)) {
    if (v.x0 >= h.x0 - 0.1 && v.x0 <= h.x1 + 0.1 && h.z0 >= v.z0 - 0.1 && h.z0 <= v.z1 + 0.1) {
      const n = nodeAt(v.x0, h.z0);
      if (!h.nodes.includes(n)) h.nodes.push(n);
      if (!v.nodes.includes(n)) v.nodes.push(n);
    }
  }
}
const along = (s, p) => (s.z0 === s.z1 ? p.x : p.z);
for (const s of SEGS) {
  s.nodes.sort((a, b) => along(s, a) - along(s, b));
  for (let i = 0; i < s.nodes.length - 1; i++) {
    const a = s.nodes[i], b = s.nodes[i + 1], d = Math.hypot(a.x - b.x, a.z - b.z);
    if (d < 0.5) continue;
    a.adj.push([b, d]); b.adj.push([a, d]);
  }
}

function snap(x, z) {
  let best = null;
  for (const s of SEGS) {
    const px = Math.max(Math.min(s.x0, s.x1), Math.min(Math.max(s.x0, s.x1), x));
    const pz = Math.max(Math.min(s.z0, s.z1), Math.min(Math.max(s.z0, s.z1), z));
    const d = Math.hypot(px - x, pz - z);
    if (!best || d < best.d) best = { s, x: px, z: pz, d };
  }
  return best;
}

/** start → end ka raasta: [{x,z}, ...] (sadkon pe chalta hua) */
export function findRoute(sx, sz, ex, ez) {
  const A = snap(sx, sz), B = snap(ex, ez);
  const a = { x: A.x, z: A.z, id: -1, adj: [] }, b = { x: B.x, z: B.z, id: -2, adj: [] };
  const link = (t, s) => {
    const k = along(s, t);
    let lo = null, hi = null;
    for (const n of s.nodes) { const v = along(s, n); if (v <= k) lo = n; if (v >= k && !hi) hi = n; }
    for (const n of [lo, hi]) if (n) { const d = Math.hypot(n.x - t.x, n.z - t.z); t.adj.push([n, d]); n.adj.push([t, d]); }
  };
  link(a, A.s); link(b, B.s);
  if (A.s === B.s) { const d = Math.hypot(a.x - b.x, a.z - b.z); a.adj.push([b, d]); }
  // Dijkstra (~40 nodes, simple array)
  const all = [a, b, ...nodes], dist = new Map(all.map((n) => [n, Infinity])), prev = new Map(), done = new Set();
  dist.set(a, 0);
  while (true) {
    let u = null, ud = Infinity;
    for (const n of all) if (!done.has(n) && dist.get(n) < ud) { ud = dist.get(n); u = n; }
    if (!u || u === b) break;
    done.add(u);
    for (const [v, w] of u.adj) if (ud + w < dist.get(v)) { dist.set(v, ud + w); prev.set(v, u); }
  }
  // temp links hatao
  for (const t of [a, b]) for (const [n] of t.adj) n.adj = n.adj.filter(([q]) => q !== t);
  const path = [];
  for (let n = b; n; n = prev.get(n)) path.unshift({ x: n.x, z: n.z });
  if (path[0]?.x !== a.x || path[0]?.z !== a.z) path.unshift({ x: a.x, z: a.z });
  const out = [{ x: sx, z: sz }, ...path, { x: ex, z: ez }];
  // lagbhag same points hatao
  return out.filter((p, i) => i === 0 || Math.hypot(p.x - out[i - 1].x, p.z - out[i - 1].z) > 0.8);
}
export function routeLength(r) { let d = 0; for (let i = 1; i < r.length; i++) d += Math.hypot(r[i].x - r[i - 1].x, r[i].z - r[i - 1].z); return d; }
