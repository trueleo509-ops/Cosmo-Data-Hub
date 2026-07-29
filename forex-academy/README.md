# 📈 PipQuest — Forex Trading Academy

An interactive game that teaches forex trading from **complete beginner to expert**, built as a
single-page web app with zero dependencies (vanilla JS + canvas).

## How it works

Every lesson is a **level**. Each level has three gates:

1. **Learn** — a full written lesson on one concept.
2. **Knowledge check** — a short quiz; all answers correct to unlock the challenge.
3. **Trading challenge** — a candlestick chart is generated containing *exactly the setup you
   just studied*. Pick a direction, set your stop loss and take profit (drag the lines on the
   chart or type pips), and execute. The market then plays out candle by candle.
   **Win the trade to unlock the next level.** Lose, and you get a hint, review, and retry.

Progress, virtual balance ($10,000 to start), win rate and trade history persist in your
browser (localStorage). A **Practice Arena** unlocks after your first completed level for
pressure-free reps of any setup you've already beaten.

## The curriculum — 18 levels

| Tier | Levels | Topics |
|------|--------|--------|
| 🟢 Beginner | 1–4 | Pairs, pips & lots · Candlesticks & engulfing patterns · Market structure & trends · Support & resistance |
| 🔵 Novice | 5–8 | Orders, SL/TP & R:R · Risk management & position sizing · Moving averages · RSI |
| 🟡 Intermediate | 9–12 | MACD · Double tops/bottoms · Head & shoulders · Trendlines & channels |
| 🟣 Advanced | 13–16 | Breakouts · Fakeouts & stop hunts · Fibonacci retracements · Pin bars |
| 🔴 Expert | 17–18 | Confluence & the A+ setup checklist · Trading psychology (the final boss) |

The curriculum is enforced in-game: from Level 6 onward, trades with a risk:reward below 1.5
won't execute — sloppy risk plans don't get filled.

## Running it

No build, no server needed:

- **Open `index.html` directly** in any modern browser, or
- serve the folder: `npx serve forex-academy` / `python3 -m http.server` and browse to it, or
- enable **GitHub Pages** on this repo and visit `/forex-academy/`.

## Under the hood

| File | Role |
|------|------|
| `js/market.js` | Synthetic price engine: 16 scenario builders (one per setup type) generate history candles containing the lesson's pattern, plus a bounded future path. A correct read with sensible levels wins; a wrong read loses. Also: SMA/EMA/RSI/MACD math. |
| `js/chart.js` | Canvas candlestick chart — candles, MAs, S/R levels, trendlines, fib retracements, pattern marks, crosshair, and draggable entry/SL/TP order lines — plus an RSI/MACD sub-pane. |
| `js/lessons.js` | The full 18-lesson curriculum: content, quizzes, missions, hints and per-level rules. |
| `js/app.js` | Game flow: level map, quiz gating, trade execution/playback, P&L, progression, persistence. |

⚠️ **Disclaimer**: PipQuest is an educational game using synthetic data. It is not financial
advice, and demo results never guarantee real-market results. Forex trading carries a high
risk of loss.
