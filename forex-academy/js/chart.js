/* ============================================================
   chart.js — canvas candlestick chart + indicator pane.
   Supports: candles, MAs, horizontal levels, trendlines,
   fibonacci retracements, pattern marks, and draggable
   entry/SL/TP order lines.
   ============================================================ */

"use strict";

const CH_COLORS = {
  bg: "#0e1421",
  grid: "#1c2740",
  text: "#8494ad",
  up: "#26a69a",
  down: "#ef5350",
  entry: "#c9d6ec",
  sl: "#ef5350",
  tp: "#2fe0a2",
};

class CandleChart {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.bars = [];
    this.overlays = {};       // {hlines, trendline, fib, marks, mas:[{values,color,label}]}
    this.order = null;        // {entry, sl, tp, dir:'buy'|'sell'}
    this.orderEditable = false;
    this.onOrderChange = null;
    this.pip = 0.0001; this.dec = 5;
    this.padR = 66; this.padT = 12; this.padB = 20;
    this.mouse = null;
    this.dragging = null;
    this._bind();
  }

  setPair(pip) { this.pip = pip; this.dec = pip === 0.01 ? 3 : 5; }
  setData(bars) { this.bars = bars; this.draw(); }
  setOverlays(o) { this.overlays = o || {}; this.draw(); }
  setOrder(o) { this.order = o; this.draw(); }

  fmt(p) { return p.toFixed(this.dec); }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (this.canvas.width !== Math.round(r.width * dpr) || this.canvas.height !== Math.round(r.height * dpr)) {
      this.canvas.width = Math.round(r.width * dpr);
      this.canvas.height = Math.round(r.height * dpr);
    }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = r.width; this.h = r.height;
    this.plotW = this.w - this.padR;
    this.plotH = this.h - this.padT - this.padB;
  }

  range() {
    let lo = Infinity, hi = -Infinity;
    for (const b of this.bars) { if (b.l < lo) lo = b.l; if (b.h > hi) hi = b.h; }
    if (this.order) {
      lo = Math.min(lo, this.order.sl, this.order.tp, this.order.entry);
      hi = Math.max(hi, this.order.sl, this.order.tp, this.order.entry);
    }
    for (const hl of (this.overlays.hlines || [])) { lo = Math.min(lo, hl.p); hi = Math.max(hi, hl.p); }
    if (!isFinite(lo)) { lo = 0; hi = 1; }
    const pad = (hi - lo) * 0.08 || this.pip * 20;
    return { lo: lo - pad, hi: hi + pad };
  }

  yAt(p) { return this.padT + ((this._hi - p) / (this._hi - this._lo)) * this.plotH; }
  priceAt(y) { return this._hi - ((y - this.padT) / this.plotH) * (this._hi - this._lo); }
  xAt(i) { return (i + 0.5) * (this.plotW / Math.max(this.bars.length, 1)); }

  draw() {
    this.resize();
    const ctx = this.ctx, n = this.bars.length;
    const { lo, hi } = this.range();
    this._lo = lo; this._hi = hi;
    ctx.fillStyle = CH_COLORS.bg;
    ctx.fillRect(0, 0, this.w, this.h);
    if (!n) return;

    /* grid + price axis */
    ctx.font = "11px sans-serif";
    const rawStep = (hi - lo) / 6;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= rawStep) || rawStep;
    ctx.strokeStyle = CH_COLORS.grid;
    ctx.fillStyle = CH_COLORS.text;
    ctx.lineWidth = 1;
    for (let p = Math.ceil(lo / step) * step; p <= hi; p += step) {
      const y = this.yAt(p);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.plotW, y); ctx.stroke();
      ctx.fillText(this.fmt(p), this.plotW + 6, y + 4);
    }
    for (let i = 0; i < n; i += 10) {
      const x = this.xAt(i);
      ctx.strokeStyle = "#161f33";
      ctx.beginPath(); ctx.moveTo(x, this.padT); ctx.lineTo(x, this.padT + this.plotH); ctx.stroke();
    }

    /* order risk/reward shading */
    if (this.order) {
      const yE = this.yAt(this.order.entry), yS = this.yAt(this.order.sl), yT = this.yAt(this.order.tp);
      ctx.fillStyle = "rgba(239,83,80,0.07)";
      ctx.fillRect(0, Math.min(yE, yS), this.plotW, Math.abs(yS - yE));
      ctx.fillStyle = "rgba(47,224,162,0.07)";
      ctx.fillRect(0, Math.min(yE, yT), this.plotW, Math.abs(yT - yE));
    }

    /* candles */
    const cw = this.plotW / n;
    const bw = Math.max(2, cw * 0.65);
    for (let i = 0; i < n; i++) {
      const b = this.bars[i], x = this.xAt(i);
      const up = b.c >= b.o;
      ctx.strokeStyle = ctx.fillStyle = up ? CH_COLORS.up : CH_COLORS.down;
      ctx.beginPath();
      ctx.moveTo(x, this.yAt(b.h)); ctx.lineTo(x, this.yAt(b.l)); ctx.stroke();
      const yO = this.yAt(b.o), yC = this.yAt(b.c);
      const top = Math.min(yO, yC), hgt = Math.max(1, Math.abs(yC - yO));
      ctx.fillRect(x - bw / 2, top, bw, hgt);
    }

    /* moving averages */
    for (const ma of (this.overlays.mas || [])) {
      ctx.strokeStyle = ma.color; ctx.lineWidth = 1.6;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < n; i++) {
        const v = ma.values[i];
        if (v == null) continue;
        const x = this.xAt(i), y = this.yAt(v);
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    /* horizontal levels */
    for (const hl of (this.overlays.hlines || [])) {
      const y = this.yAt(hl.p);
      ctx.strokeStyle = hl.color || "#f2c14e";
      ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.plotW, y); ctx.stroke();
      ctx.setLineDash([]);
      if (hl.label) {
        ctx.fillStyle = hl.color || "#f2c14e";
        ctx.fillText(hl.label, 8, y - 5);
      }
    }

    /* trendline */
    const tl = this.overlays.trendline;
    if (tl) {
      const slope = (tl.p2 - tl.p1) / (tl.i2 - tl.i1);
      const pEnd = tl.p1 + slope * (n - 1 + 2 - tl.i1);
      ctx.strokeStyle = "#4ea1ff";
      ctx.beginPath();
      ctx.moveTo(this.xAt(tl.i1), this.yAt(tl.p1));
      ctx.lineTo(this.xAt(n - 1 + 2), this.yAt(pEnd));
      ctx.stroke();
      if (tl.label) { ctx.fillStyle = "#4ea1ff"; ctx.fillText(tl.label, this.xAt(tl.i1) + 6, this.yAt(tl.p1) - 8); }
    }

    /* fibonacci */
    const fib = this.overlays.fib;
    if (fib) {
      const lv = [0, 0.382, 0.5, 0.618, 0.786, 1];
      for (const l of lv) {
        const p = fib.b - l * (fib.b - fib.a);
        const y = this.yAt(p);
        if (y < this.padT || y > this.padT + this.plotH) continue;
        ctx.strokeStyle = l === 0.618 ? "#f2c14e" : "#3a4763";
        ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(this.plotW * 0.25, y); ctx.lineTo(this.plotW, y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = l === 0.618 ? "#f2c14e" : CH_COLORS.text;
        ctx.fillText((l * 100).toFixed(1) + "%", this.plotW * 0.25 - 44, y + 4);
      }
    }

    /* marks */
    for (const m of (this.overlays.marks || [])) {
      const x = this.xAt(m.i), y = this.yAt(m.p);
      ctx.fillStyle = "#f2c14e";
      ctx.textAlign = "center";
      ctx.fillText(m.text, x, m.above ? y - 10 : y + 16);
      ctx.beginPath();
      ctx.arc(x, m.above ? y - 4 : y + 4, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = "left";
    }

    /* order lines */
    if (this.order) {
      const o = this.order;
      this._orderLine(o.entry, CH_COLORS.entry, "ENTRY " + this.fmt(o.entry), [2, 3]);
      const slp = Math.round(Math.abs(o.entry - o.sl) / this.pip);
      const tpp = Math.round(Math.abs(o.entry - o.tp) / this.pip);
      this._orderLine(o.sl, CH_COLORS.sl, `SL −${slp}p`, []);
      this._orderLine(o.tp, CH_COLORS.tp, `TP +${tpp}p`, []);
    }

    /* last price tag */
    const last = this.bars[n - 1];
    const yL = this.yAt(last.c);
    ctx.fillStyle = last.c >= last.o ? CH_COLORS.up : CH_COLORS.down;
    ctx.fillRect(this.plotW, yL - 9, this.padR, 16);
    ctx.fillStyle = "#fff";
    ctx.fillText(this.fmt(last.c), this.plotW + 5, yL + 4);

    /* crosshair */
    if (this.mouse && !this.dragging) {
      const { x, y } = this.mouse;
      if (y > this.padT && y < this.padT + this.plotH && x < this.plotW) {
        ctx.strokeStyle = "#3a4763";
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.plotW, y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#232e45";
        ctx.fillRect(this.plotW, y - 8, this.padR, 15);
        ctx.fillStyle = "#dbe4f3";
        ctx.fillText(this.fmt(this.priceAt(y)), this.plotW + 5, y + 4);
        const i = Math.min(n - 1, Math.max(0, Math.floor(x / (this.plotW / n))));
        const b = this.bars[i];
        ctx.fillStyle = CH_COLORS.text;
        ctx.fillText(`O ${this.fmt(b.o)}  H ${this.fmt(b.h)}  L ${this.fmt(b.l)}  C ${this.fmt(b.c)}`, 8, this.padT + 12);
      }
    }
  }

  _orderLine(p, color, label, dash) {
    const ctx = this.ctx, y = this.yAt(p);
    ctx.strokeStyle = color;
    ctx.setLineDash(dash);
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.plotW, y); ctx.stroke();
    ctx.setLineDash([]); ctx.lineWidth = 1;
    ctx.fillStyle = color;
    ctx.fillRect(this.plotW, y - 8, this.padR, 15);
    ctx.fillStyle = "#0b0f16";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText(label, this.plotW + 4, y + 3);
    ctx.font = "11px sans-serif";
  }

  _bind() {
    const pos = e => {
      const r = this.canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    this.canvas.addEventListener("pointerdown", e => {
      if (!this.order || !this.orderEditable) return;
      const { y } = pos(e);
      const dS = Math.abs(y - this.yAt(this.order.sl));
      const dT = Math.abs(y - this.yAt(this.order.tp));
      if (Math.min(dS, dT) < 9) {
        this.dragging = dS < dT ? "sl" : "tp";
        this.canvas.setPointerCapture(e.pointerId);
      }
    });
    this.canvas.addEventListener("pointermove", e => {
      const m = pos(e);
      this.mouse = m;
      if (this.dragging && this.order) {
        let p = this.priceAt(m.y);
        const o = this.order, d = o.dir === "buy" ? 1 : -1;
        const minGap = 5 * this.pip;
        if (this.dragging === "sl") {
          p = d > 0 ? Math.min(p, o.entry - minGap) : Math.max(p, o.entry + minGap);
          o.sl = p;
        } else {
          p = d > 0 ? Math.max(p, o.entry + minGap) : Math.min(p, o.entry - minGap);
          o.tp = p;
        }
        if (this.onOrderChange) this.onOrderChange(o);
      }
      this.draw();
    });
    const end = () => { this.dragging = null; };
    this.canvas.addEventListener("pointerup", end);
    this.canvas.addEventListener("pointerleave", () => { this.mouse = null; this.dragging = null; this.draw(); });
    this.canvas.style.touchAction = "none";
    this.canvas.style.cursor = "crosshair";
  }
}

/* ---------- indicator sub-pane (RSI / MACD) ---------- */
class IndicatorPane {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.mode = null; this.data = null;
  }
  setRSI(values) { this.mode = "rsi"; this.data = values; this.draw(); }
  setMACD(m) { this.mode = "macd"; this.data = m; this.draw(); }
  resize() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = r.width; this.h = r.height;
  }
  draw() {
    this.resize();
    const ctx = this.ctx;
    ctx.fillStyle = CH_COLORS.bg;
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.font = "10px sans-serif";
    const padR = 66, plotW = this.w - padR, padT = 6, plotH = this.h - padT - 8;
    if (!this.mode || !this.data) return;

    if (this.mode === "rsi") {
      const vals = this.data, n = vals.length;
      const y = v => padT + ((100 - v) / 100) * plotH;
      for (const lvl of [30, 50, 70]) {
        ctx.strokeStyle = lvl === 50 ? "#1c2740" : "#3a4763";
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(0, y(lvl)); ctx.lineTo(plotW, y(lvl)); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = CH_COLORS.text;
        ctx.fillText(String(lvl), plotW + 6, y(lvl) + 3);
      }
      ctx.strokeStyle = "#c48bf0"; ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < n; i++) {
        if (vals[i] == null) continue;
        const x = (i + 0.5) * (plotW / n);
        if (!started) { ctx.moveTo(x, y(vals[i])); started = true; }
        else ctx.lineTo(x, y(vals[i]));
      }
      ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = "#c48bf0";
      ctx.fillText("RSI (14)", 6, padT + 10);
      const lastV = [...vals].reverse().find(v => v != null);
      if (lastV != null) ctx.fillText(lastV.toFixed(1), plotW + 32, padT + 10);
    }

    if (this.mode === "macd") {
      const { macd, signal, hist } = this.data, n = macd.length;
      let lo = Infinity, hi = -Infinity;
      for (let i = 0; i < n; i++) {
        for (const v of [macd[i], signal[i], hist[i]])
          if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
      }
      if (!isFinite(lo)) return;
      const pad = (hi - lo) * 0.15 || 1e-6; lo -= pad; hi += pad;
      const y = v => padT + ((hi - v) / (hi - lo)) * plotH;
      ctx.strokeStyle = "#1c2740";
      ctx.beginPath(); ctx.moveTo(0, y(0)); ctx.lineTo(plotW, y(0)); ctx.stroke();
      const bw = Math.max(1, (plotW / n) * 0.5);
      for (let i = 0; i < n; i++) {
        if (hist[i] == null) continue;
        const x = (i + 0.5) * (plotW / n);
        ctx.fillStyle = hist[i] >= 0 ? "rgba(38,166,154,0.7)" : "rgba(239,83,80,0.7)";
        ctx.fillRect(x - bw / 2, Math.min(y(0), y(hist[i])), bw, Math.abs(y(hist[i]) - y(0)) || 1);
      }
      const line = (vals, color) => {
        ctx.strokeStyle = color; ctx.lineWidth = 1.5;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < n; i++) {
          if (vals[i] == null) continue;
          const x = (i + 0.5) * (plotW / n);
          if (!started) { ctx.moveTo(x, y(vals[i])); started = true; }
          else ctx.lineTo(x, y(vals[i]));
        }
        ctx.stroke(); ctx.lineWidth = 1;
      };
      line(macd, "#4ea1ff");
      line(signal, "#f2c14e");
      ctx.fillStyle = "#4ea1ff"; ctx.fillText("MACD (12,26,9)", 6, padT + 10);
    }
  }
}
