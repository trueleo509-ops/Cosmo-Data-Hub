/* ============================================================
   market.js — synthetic price engine, scenario builders,
   and indicator math for PipQuest.
   Every lesson's challenge is generated here: history candles
   engineered to contain the setup being taught, plus a future
   path that rewards reading the setup correctly.
   ============================================================ */

"use strict";

/* ---------- randomness ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rng) {
  let u = 0, v = 0;
  while (!u) u = rng();
  while (!v) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* ---------- pairs ---------- */
const PAIRS = [
  { name: "EUR/USD", base: 1.0850, pip: 0.0001 },
  { name: "GBP/USD", base: 1.2720, pip: 0.0001 },
  { name: "AUD/USD", base: 0.6550, pip: 0.0001 },
  { name: "USD/JPY", base: 154.50, pip: 0.01 },
  { name: "USD/CHF", base: 0.8820, pip: 0.0001 },
  { name: "EUR/GBP", base: 0.8530, pip: 0.0001 },
];
function pickPair(rng) {
  const p = PAIRS[Math.floor(rng() * PAIRS.length)];
  return { name: p.name, pip: p.pip, base: p.base + (rng() - 0.5) * 80 * p.pip };
}

/* ---------- series builder ---------- */
class SB {
  constructor(rng, start, pip, vol = 7) {
    this.rng = rng; this.p = start; this.pip = pip; this.vol = vol;
    this.bars = [];
    this.clampLow = -Infinity; this.clampHigh = Infinity;
  }
  get i() { return this.bars.length; }
  push(cRaw, vol = this.vol) {
    const o = this.p;
    let c = Math.min(Math.max(cRaw, this.clampLow), this.clampHigh);
    const w = () => Math.abs(gauss(this.rng)) * vol * this.pip * 0.45;
    let h = Math.max(o, c) + w();
    let l = Math.min(o, c) - w();
    l = Math.max(l, this.clampLow);
    h = Math.min(h, this.clampHigh);
    l = Math.min(l, o, c); h = Math.max(h, o, c);
    this.bars.push({ o, h, l, c });
    this.p = c;
  }
  /* drift `pips` total over n bars with noise */
  run(n, pips, vol = this.vol) {
    const s = this.p;
    for (let k = 1; k <= n; k++) {
      const target = s + (pips * this.pip * k) / n;
      const noise = gauss(this.rng) * vol * this.pip * (k === n ? 0.15 : 0.6);
      this.push(target + noise, vol);
    }
  }
  /* drift toward an absolute price over n bars */
  runTo(n, price, vol = this.vol) {
    this.run(n, (price - this.p) / this.pip, vol);
  }
  /* hand-crafted candle: move/wicks in pips */
  candle({ move = 0, upWick = 0, downWick = 0, jitter = 1 } = {}) {
    const o = this.p;
    let c = o + move * this.pip + gauss(this.rng) * jitter * this.pip * 0.3;
    c = Math.min(Math.max(c, this.clampLow), this.clampHigh);
    let h = Math.max(o, c) + upWick * this.pip;
    let l = Math.min(o, c) - downWick * this.pip;
    l = Math.max(Math.min(l, o, c), this.clampLow);
    h = Math.min(Math.max(h, o, c), this.clampHigh);
    this.bars.push({ o, h, l, c });
    this.p = c;
  }
}

/* ---------- future path ----------
   Guarantees: price never moves more than ~0.82×defaultSL against
   the correct direction, and eventually crosses ~1.12×defaultTP,
   so a correct read with sensible (default) levels wins. */
function futurePath(rng, entry, d, slPips, tpPips, pip, opts = {}) {
  const sb = new SB(rng, entry, pip, opts.vol ?? 6);
  const adverse = (opts.adverseFrac ?? 0.45) * slPips;
  const bound = entry - d * slPips * 0.82 * pip;
  const target = entry + d * tpPips * 1.12 * pip;
  if (d > 0) sb.clampLow = bound; else sb.clampHigh = bound;

  sb.run(2 + Math.floor(rng() * 3), -d * adverse * 0.85, 5);
  if (opts.chop) {
    sb.run(4, d * adverse * 0.5, 5);
    sb.run(3, -d * adverse * 0.45, 5);
  }
  const runBars = opts.runBars ?? (10 + Math.floor(rng() * 6));
  sb.run(runBars, d * (tpPips * 1.35 + adverse * 0.85), 6);

  // deterministic guarantee that the target is crossed
  let guard = 0;
  const crossed = () => sb.bars.some(b => (d > 0 ? b.h >= target : b.l <= target));
  while (!crossed() && guard++ < 3) sb.run(3, d * 25, 5);
  if (!crossed()) {
    const need = Math.abs(target - sb.p) / pip + 6;
    sb.candle({ move: d * need, jitter: 0 });
  }
  return sb.bars;
}

/* ---------- indicators ---------- */
function smaArr(cl, n) {
  const out = new Array(cl.length).fill(null);
  let sum = 0;
  for (let i = 0; i < cl.length; i++) {
    sum += cl[i];
    if (i >= n) sum -= cl[i - n];
    if (i >= n - 1) out[i] = sum / n;
  }
  return out;
}
function emaArr(cl, n) {
  const out = new Array(cl.length).fill(null);
  if (cl.length < n) return out;
  const k = 2 / (n + 1);
  let e = cl.slice(0, n).reduce((a, b) => a + b, 0) / n;
  out[n - 1] = e;
  for (let i = n; i < cl.length; i++) { e = cl[i] * k + e * (1 - k); out[i] = e; }
  return out;
}
function rsiArr(cl, n = 14) {
  const out = new Array(cl.length).fill(null);
  if (cl.length <= n) return out;
  let g = 0, l = 0;
  for (let i = 1; i <= n; i++) {
    const d = cl[i] - cl[i - 1];
    if (d > 0) g += d; else l -= d;
  }
  g /= n; l /= n;
  out[n] = 100 - 100 / (1 + (l === 0 ? 100 : g / l));
  for (let i = n + 1; i < cl.length; i++) {
    const d = cl[i] - cl[i - 1];
    g = (g * (n - 1) + Math.max(d, 0)) / n;
    l = (l * (n - 1) + Math.max(-d, 0)) / n;
    out[i] = 100 - 100 / (1 + (l === 0 ? 100 : g / l));
  }
  return out;
}
function macdArr(cl) {
  const e12 = emaArr(cl, 12), e26 = emaArr(cl, 26);
  const macd = cl.map((_, i) => (e12[i] != null && e26[i] != null) ? e12[i] - e26[i] : null);
  const valid = macd.map(v => v).filter(v => v != null);
  const sigValid = emaArr(valid, 9);
  const signal = new Array(cl.length).fill(null);
  let j = 0;
  for (let i = 0; i < cl.length; i++) if (macd[i] != null) { signal[i] = sigValid[j] ?? null; j++; }
  const hist = macd.map((v, i) => (v != null && signal[i] != null) ? v - signal[i] : null);
  return { macd, signal, hist };
}

/* ============================================================
   Scenario builders.
   Each returns { pair, bars, future, dir, defSL, defTP, ann }
   ann: { hlines:[{p,label,color}], trendline:{i1,p1,i2,p2,label},
          fib:{a,b}, marks:[{i,p,text,above}] }
   ============================================================ */

function pack(rng, pr, sb, d, o) {
  const entry = sb.p;
  const sl = Math.max(12, Math.round(o.sl));
  // never model a sub-1.5R default plan — it would contradict the curriculum
  const tp = Math.max(15, Math.round(o.tp), Math.round(sl * 1.5));
  return {
    pair: pr, bars: sb.bars,
    future: futurePath(rng, entry, d, sl, tp, pr.pip, o.f || {}),
    dir: d > 0 ? "buy" : "sell",
    defSL: sl, defTP: tp,
    ann: o.ann || {},
  };
}
const rdir = rng => (rng() < 0.5 ? 1 : -1);

const SCENARIOS = {

  /* L1 — obvious established trend, ride it */
  "trend": rng => {
    const pr = pickPair(rng), d = rdir(rng);
    const sb = new SB(rng, pr.base, pr.pip);
    sb.run(16, (rng() - 0.5) * 24, 6);
    sb.run(34, d * (110 + rng() * 40), 7);
    return pack(rng, pr, sb, d, { sl: 30, tp: 48, ann: {} });
  },

  /* L2 — engulfing candle at the end of a move */
  "engulf": rng => {
    const pr = pickPair(rng), d = rdir(rng);
    const sb = new SB(rng, pr.base, pr.pip);
    sb.run(10, (rng() - 0.5) * 20, 5);
    sb.run(28, -d * (90 + rng() * 30), 7);
    sb.candle({ move: -d * 4, jitter: 1 });                       // small counter-color candle
    sb.candle({ move: d * 15, upWick: d > 0 ? 2 : 5, downWick: d > 0 ? 5 : 2 }); // engulfing bar
    const last = sb.bars[sb.bars.length - 1];
    const inval = d > 0 ? last.l - 8 * pr.pip : last.h + 8 * pr.pip;
    const sl = Math.abs(sb.p - inval) / pr.pip;
    return pack(rng, pr, sb, d, {
      sl, tp: sl * 1.8,
      ann: { marks: [{ i: sb.i - 1, p: d > 0 ? last.l : last.h, text: d > 0 ? "Bullish engulfing" : "Bearish engulfing", above: d < 0 }] },
    });
  },

  /* L3 — trend + pullback continuation */
  "pullback": rng => {
    const pr = pickPair(rng), d = rdir(rng);
    const sb = new SB(rng, pr.base, pr.pip);
    sb.run(8, (rng() - 0.5) * 16, 5);
    sb.run(26, d * (105 + rng() * 30), 7);
    sb.run(7, -d * (30 + rng() * 10), 5);
    sb.candle({ move: d * 7, jitter: 1 });
    return pack(rng, pr, sb, d, { sl: 32, tp: 52, ann: {} });
  },

  /* L4/L5 — bounce off a horizontal level (support if buy, resistance if sell) */
  "level-bounce": rng => {
    const pr = pickPair(rng), d = rdir(rng);
    const L = pr.base;
    const sb = new SB(rng, L + d * 115 * pr.pip, pr.pip);
    sb.runTo(20, L + d * 10 * pr.pip, 6);
    sb.run(10, d * (40 + rng() * 10), 6);
    sb.runTo(12, L + d * 8 * pr.pip, 6);
    sb.candle({ move: d * 6, upWick: d > 0 ? 1 : 6, downWick: d > 0 ? 6 : 1 });
    const level = d > 0
      ? Math.min(...sb.bars.slice(15).map(b => b.l))
      : Math.max(...sb.bars.slice(15).map(b => b.h));
    const sl = Math.abs(sb.p - level) / pr.pip + 14;
    return pack(rng, pr, sb, d, {
      sl, tp: sl * 1.8,
      ann: { hlines: [{ p: level, label: d > 0 ? "Support" : "Resistance", color: "#f2c14e" }] },
    });
  },

  /* L7 — pullback to a rising/falling moving average */
  "ma-bounce": rng => {
    const pr = pickPair(rng), d = rdir(rng);
    const sb = new SB(rng, pr.base, pr.pip);
    const n = 62, period = 21, amp = 22, trend = 2.3;
    for (let i = 1; i <= n; i++) {
      const t = ((i - n) / period) * 2 * Math.PI - Math.PI / 2;
      sb.push(pr.base + d * trend * i * pr.pip + d * amp * pr.pip * Math.sin(t) + gauss(rng) * 4 * pr.pip * 0.5, 5);
    }
    sb.candle({ move: d * 6, jitter: 1 });
    return pack(rng, pr, sb, d, { sl: 34, tp: 55, ann: { ema: 21 } });
  },

  /* L8 — deep extended move, RSI at extreme, reversal */
  "rsi-rev": rng => {
    const pr = pickPair(rng), d = rdir(rng);
    const sb = new SB(rng, pr.base, pr.pip);
    sb.run(6, (rng() - 0.5) * 14, 5);
    sb.run(26, -d * (140 + rng() * 40), 8);
    sb.run(4, d * 3, 4);
    sb.candle({ move: d * 11, jitter: 1 });
    return pack(rng, pr, sb, d, { sl: 26, tp: 44, ann: { rsi: true }, f: { adverseFrac: 0.4 } });
  },

  /* L9 — base after decline, MACD crossing */
  "macd-cross": rng => {
    const pr = pickPair(rng), d = rdir(rng);
    const sb = new SB(rng, pr.base, pr.pip);
    sb.run(8, (rng() - 0.5) * 16, 5);
    sb.run(24, -d * (85 + rng() * 25), 7);
    sb.run(9, d * 2, 4);
    sb.run(5, d * 26, 5);
    return pack(rng, pr, sb, d, { sl: 30, tp: 48, ann: { macd: true } });
  },

  /* L10 — double top (sell) / double bottom (buy) */
  "double-top": rng => {
    const pr = pickPair(rng), d = rdir(rng);   // d = trade direction
    const u = -d;                              // pattern side
    const sb = new SB(rng, pr.base, pr.pip);
    sb.run(22, u * (95 + rng() * 20), 7);
    const T = sb.p, iT = sb.i - 1;
    sb.run(9, -u * (32 + rng() * 6), 5);
    const V = sb.p;
    sb.runTo(11, T - u * 4 * pr.pip, 5);
    const iT2 = sb.i - 1;
    sb.run(5, -u * 22, 5);
    const height = Math.abs(T - V) / pr.pip;
    const sl = Math.abs(T + u * 10 * pr.pip - sb.p) / pr.pip;
    const tp = Math.abs(sb.p - (V - u * height * 0.8 * pr.pip)) / pr.pip;
    return pack(rng, pr, sb, d, {
      sl, tp,
      ann: {
        hlines: [
          { p: T, label: u > 0 ? "Double top" : "Double bottom", color: "#e07be0" },
          { p: V, label: "Neckline", color: "#8494ad" },
        ],
        marks: [{ i: iT, p: T, text: "1", above: u > 0 }, { i: iT2, p: T - u * 4 * pr.pip, text: "2", above: u > 0 }],
      },
    });
  },

  /* L11 — head & shoulders (sell) / inverse (buy) */
  "head-shoulders": rng => {
    const pr = pickPair(rng), d = rdir(rng);
    const u = -d;
    const sb = new SB(rng, pr.base, pr.pip);
    sb.run(6, (rng() - 0.5) * 12, 5);
    sb.run(14, u * 62, 6);
    const LS = sb.p, iLS = sb.i - 1;
    sb.run(6, -u * 28, 5);
    const n1 = sb.p;
    sb.run(9, u * 52, 6);
    const H = sb.p, iH = sb.i - 1;
    sb.run(7, -u * 50, 6);
    const n2 = sb.p;
    sb.runTo(8, LS - u * 4 * pr.pip, 5);
    const RS = sb.p, iRS = sb.i - 1;
    const neck = (n1 + n2) / 2;
    sb.runTo(6, neck - u * 14 * pr.pip, 5);
    const height = Math.abs(H - neck) / pr.pip;
    const sl = Math.abs(RS + u * 8 * pr.pip - sb.p) / pr.pip;
    const tp = Math.abs(sb.p - (neck - u * height * 0.75 * pr.pip)) / pr.pip;
    return pack(rng, pr, sb, d, {
      sl, tp,
      ann: {
        hlines: [{ p: neck, label: "Neckline", color: "#8494ad" }],
        marks: [
          { i: iLS, p: LS, text: "LS", above: u > 0 },
          { i: iH, p: H, text: "HEAD", above: u > 0 },
          { i: iRS, p: RS, text: "RS", above: u > 0 },
        ],
      },
    });
  },

  /* L12 — third touch of a trendline */
  "trendline": rng => {
    const pr = pickPair(rng), d = rdir(rng);
    const slope = d * 1.15; // pips per bar
    const sb = new SB(rng, pr.base, pr.pip);
    sb.run(9, d * 46, 5);
    sb.run(7, -d * 33, 5);
    const p1 = sb.p, i1 = sb.i - 1;
    sb.run(9, d * 48, 5);
    sb.runTo(7, p1 + d * slope * ((sb.i + 7) - i1) * pr.pip, 5);
    sb.run(9, d * 46, 5);
    const i3target = sb.i + 6;
    sb.runTo(6, p1 + d * slope * (i3target - i1) * pr.pip, 5);
    const p3 = sb.p, i3 = sb.i - 1;
    sb.candle({ move: d * 6, upWick: d > 0 ? 1 : 5, downWick: d > 0 ? 5 : 1 });
    return pack(rng, pr, sb, d, {
      sl: 24, tp: 44,
      ann: { trendline: { i1, p1, i2: i3, p2: p3, label: "Trendline" } },
    });
  },

  /* L13 — range breakout with momentum */
  "breakout": rng => {
    const pr = pickPair(rng), d = rdir(rng);
    const amp = 26;
    const sb = new SB(rng, pr.base, pr.pip);
    for (let i = 1; i <= 46; i++)
      sb.push(pr.base + amp * pr.pip * Math.sin((2 * Math.PI * i) / 16) * -d + gauss(rng) * 4 * pr.pip * 0.5, 5);
    const R = pr.base + d * (amp + 2) * pr.pip;   // boundary being broken
    const S = pr.base - d * (amp + 2) * pr.pip;   // far side
    sb.runTo(3, R + d * 12 * pr.pip, 8);
    sb.candle({ move: d * 8, jitter: 1 });
    const sl = Math.abs(sb.p - (R - d * 16 * pr.pip)) / pr.pip;
    return pack(rng, pr, sb, d, {
      sl, tp: sl * 1.7,
      ann: {
        hlines: [
          { p: R, label: d > 0 ? "Resistance (broken)" : "Support (broken)", color: "#f2c14e" },
          { p: S, label: d > 0 ? "Range support" : "Range resistance", color: "#8494ad" },
        ],
      },
      f: { adverseFrac: 0.55 },
    });
  },

  /* L14 — false breakout: wick through the level, close back inside */
  "fakeout": rng => {
    const pr = pickPair(rng), d = rdir(rng);  // d = trade dir; fake break happens on opposite side
    const u = -d;
    const amp = 26;
    const sb = new SB(rng, pr.base, pr.pip);
    for (let i = 1; i <= 44; i++)
      sb.push(pr.base + amp * pr.pip * Math.sin((2 * Math.PI * i) / 15) * u + gauss(rng) * 4 * pr.pip * 0.5, 5);
    const R = pr.base + u * (amp + 2) * pr.pip;
    const S = pr.base - u * (amp + 2) * pr.pip;
    sb.runTo(4, R - u * 8 * pr.pip, 6);
    sb.candle({ move: u * 3, upWick: u > 0 ? 20 : 2, downWick: u > 0 ? 2 : 20 }); // spike & reject
    const spike = sb.bars[sb.bars.length - 1];
    const wickEnd = u > 0 ? spike.h : spike.l;
    sb.candle({ move: -u * 11, jitter: 1 });   // confirmation back inside
    const sl = Math.abs(wickEnd + u * 8 * pr.pip - sb.p) / pr.pip;
    const tp = Math.abs(sb.p - (S + u * 10 * pr.pip)) / pr.pip;
    return pack(rng, pr, sb, d, {
      sl, tp,
      ann: {
        hlines: [
          { p: R, label: "Broken level (trap)", color: "#e07be0" },
          { p: S, label: "Target side of range", color: "#8494ad" },
        ],
        marks: [{ i: sb.i - 2, p: wickEnd, text: "Fakeout!", above: u > 0 }],
      },
      f: { adverseFrac: 0.35 },
    });
  },

  /* L15 — impulse, retrace to 61.8% fib */
  "fib": rng => {
    const pr = pickPair(rng), d = rdir(rng);
    const sb = new SB(rng, pr.base, pr.pip);
    sb.run(6, (rng() - 0.5) * 12, 5);
    const A = sb.p;
    const size = 150 + rng() * 30;
    sb.run(22, d * size, 7);
    const B = sb.p;
    sb.runTo(12, B - d * 0.55 * size * pr.pip, 6);
    sb.runTo(3, B - d * 0.618 * size * pr.pip, 4);
    sb.candle({ move: d * 7, upWick: d > 0 ? 1 : 5, downWick: d > 0 ? 5 : 1 });
    const inval = B - d * 0.80 * size * pr.pip;
    const sl = Math.abs(sb.p - inval) / pr.pip + 4;
    const tp = Math.abs(B - d * 0.1 * size * pr.pip - sb.p) / pr.pip;
    return pack(rng, pr, sb, d, {
      sl, tp,
      ann: { fib: { a: A, b: B } },
    });
  },

  /* L16 — pin bar rejection at a level */
  "pinbar": rng => {
    const pr = pickPair(rng), d = rdir(rng);
    const sb = new SB(rng, pr.base, pr.pip);
    sb.run(8, (rng() - 0.5) * 16, 5);
    sb.run(24, -d * (95 + rng() * 30), 7);
    sb.candle({ move: d * 4, upWick: d > 0 ? 2 : 17, downWick: d > 0 ? 17 : 2 }); // pin bar
    const pin = sb.bars[sb.bars.length - 1];
    const wickEnd = d > 0 ? pin.l : pin.h;
    sb.candle({ move: d * 8, jitter: 1 });
    const sl = Math.abs(wickEnd - d * 7 * pr.pip - sb.p) / pr.pip;
    return pack(rng, pr, sb, d, {
      sl, tp: sl * 1.8,
      ann: {
        hlines: [{ p: wickEnd, label: d > 0 ? "Rejected low" : "Rejected high", color: "#f2c14e" }],
        marks: [{ i: sb.i - 2, p: wickEnd, text: "Pin bar", above: d < 0 }],
      },
    });
  },

  /* L17 — confluence: structure + fib + trend all in one zone */
  "confluence": rng => {
    const pr = pickPair(rng), d = rdir(rng);
    const sb = new SB(rng, pr.base, pr.pip);
    sb.run(12, (rng() - 0.5) * 10, 4);       // consolidation = future structure zone
    const Z = sb.p;
    const A = sb.p;
    const size = 120 + rng() * 30;
    sb.run(20, d * size, 7);
    const B = sb.p;
    sb.runTo(12, Z + d * 6 * pr.pip, 6);     // pullback into the zone
    sb.candle({ move: d * 7, upWick: d > 0 ? 1 : 5, downWick: d > 0 ? 5 : 1 });
    const sl = Math.abs(sb.p - (Z - d * 16 * pr.pip)) / pr.pip;
    const tp = Math.abs(B - d * 8 * pr.pip - sb.p) / pr.pip;
    return pack(rng, pr, sb, d, {
      sl, tp,
      ann: {
        hlines: [{ p: Z, label: "Prior structure", color: "#f2c14e" }],
        fib: { a: A, b: B },
        ema: 21,
      },
    });
  },

  /* L18 — psychology: valid setup that draws down hard before working */
  "psych": rng => {
    const pr = pickPair(rng), d = rdir(rng);
    const sb = new SB(rng, pr.base, pr.pip);
    sb.run(8, (rng() - 0.5) * 16, 5);
    sb.run(26, d * (105 + rng() * 30), 7);
    sb.run(7, -d * (32 + rng() * 8), 5);
    sb.candle({ move: d * 6, jitter: 1 });
    return pack(rng, pr, sb, d, {
      sl: 34, tp: 52,
      ann: {},
      f: { adverseFrac: 0.78, chop: true, runBars: 14 },
    });
  },
};

function buildScenario(name, seed) {
  const rng = mulberry32(seed);
  const fn = SCENARIOS[name];
  if (!fn) throw new Error("Unknown scenario: " + name);
  return fn(rng);
}
