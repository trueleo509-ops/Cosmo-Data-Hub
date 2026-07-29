/* ============================================================
   app.js — PipQuest game flow: level map, lessons, quizzes,
   trading challenges, progression and persistence.
   ============================================================ */

"use strict";

const $ = s => document.querySelector(s);
const STORE_KEY = "pipquest-v1";

/* ---------- state ---------- */
function defaultState() {
  return {
    balance: 10000,
    unlocked: 1,               // highest unlocked level id
    completed: {},             // id -> { wins, attempts }
    quizPassed: {},            // id -> true
    trades: 0, wins: 0,
  };
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) { /* corrupted store — start fresh */ }
  return defaultState();
}
let state = loadState();
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

/* ---------- money / hud ---------- */
const fmtUSD = v => (v < 0 ? "−$" : "$") + Math.abs(v).toLocaleString("en-US", { maximumFractionDigits: 0 });
function renderHud() {
  const b = $("#hud-balance");
  b.textContent = fmtUSD(state.balance);
  b.className = state.balance >= 10000 ? "pos" : state.balance < 9000 ? "neg" : "";
  $("#hud-trades").textContent = state.trades;
  $("#hud-winrate").textContent = state.trades ? Math.round((100 * state.wins) / state.trades) + "%" : "—";
  $("#hud-progress").textContent = Object.keys(state.completed).length + "/" + LESSONS.length;
}

/* ---------- views ---------- */
function show(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  $("#view-" + view).classList.add("active");
  window.scrollTo(0, 0);
}

/* ---------- level map ---------- */
function tierOf(id) { return TIERS.find(t => t.id === id); }
function renderMap() {
  const wrap = $("#map-tiers");
  wrap.innerHTML = "";
  for (const tier of TIERS) {
    const lessons = LESSONS.filter(l => l.tier === tier.id);
    const sec = document.createElement("div");
    sec.className = "tier";
    sec.innerHTML = `<div class="tier-head"><span class="tier-tag ${tier.cls}">${tier.name.split("—")[0].trim().toUpperCase()}</span><h2>${tier.name.split("—")[1].trim()}</h2></div>`;
    const grid = document.createElement("div");
    grid.className = "tier-grid";
    for (const l of lessons) {
      const done = !!state.completed[l.id];
      const open = l.id <= state.unlocked;
      const card = document.createElement("button");
      card.className = "level-card " + (done ? "done" : open ? "open" : "locked");
      card.disabled = !open;
      const stats = done ? `Won in ${state.completed[l.id].attempts} attempt${state.completed[l.id].attempts > 1 ? "s" : ""}` : l.sub;
      card.innerHTML = `
        <span class="level-num">${l.id}</span>
        <span class="level-info"><b>${l.title}</b><span>${stats}</span></span>
        <span class="level-state">${done ? "✅" : open ? "▶️" : "🔒"}</span>`;
      if (open) card.addEventListener("click", () => openLesson(l.id));
      grid.appendChild(card);
    }
    sec.appendChild(grid);
    wrap.appendChild(sec);
  }
  /* practice arena */
  const slot = $("#practice-slot");
  slot.innerHTML = "";
  const doneIds = Object.keys(state.completed).map(Number);
  if (doneIds.length) {
    const card = document.createElement("button");
    card.className = "level-card open practice-card";
    card.innerHTML = `
      <span class="level-num">∞</span>
      <span class="level-info"><b>Practice Arena</b><span>Random challenge from any lesson you've completed. Sharpen skills, no pressure.</span></span>
      <span class="level-state">🎲</span>`;
    card.addEventListener("click", () => {
      const id = doneIds[Math.floor(Math.random() * doneIds.length)];
      startChallenge(LESSON_BY_ID[id], true);
    });
    slot.appendChild(card);
  }
}

/* ---------- lesson view ---------- */
let currentLesson = null;
function openLesson(id) {
  const l = LESSON_BY_ID[id];
  currentLesson = l;
  const tier = tierOf(l.tier);
  $("#lesson-chip").textContent = `LEVEL ${l.id} · ${tier.name.split("—")[0].trim().toUpperCase()}`;
  $("#lesson-chip").className = "lvl-chip " + tier.cls;
  $("#lesson-title").textContent = l.title;
  $("#lesson-sub").textContent = l.sub;
  $("#lesson-content").innerHTML = l.content;
  $("#lesson-mission").textContent = l.mission;
  renderQuiz(l);
  show("lesson");
}

function setChallengeUnlocked(un) {
  $("#btn-start-challenge").disabled = !un;
  $("#challenge-lock-note").style.display = un ? "none" : "";
}

function renderQuiz(l) {
  const box = $("#quiz-box");
  if (state.quizPassed[l.id]) {
    box.innerHTML = `<h3>🧠 Knowledge check</h3><p class="quiz-passed-banner">✅ Passed — challenge unlocked. Retake it any time below.</p>
      <button class="ghost" id="btn-retake">Retake quiz</button>`;
    $("#btn-retake").addEventListener("click", () => { drawQuizForm(l, box); });
    setChallengeUnlocked(true);
    return;
  }
  drawQuizForm(l, box);
  setChallengeUnlocked(false);
}

function drawQuizForm(l, box) {
  box.innerHTML = `<h3>🧠 Knowledge check</h3><p class="qhint">Answer all ${l.quiz.length} questions correctly to unlock the trading challenge.</p>`;
  l.quiz.forEach((q, qi) => {
    const div = document.createElement("div");
    div.className = "quiz-q";
    div.innerHTML = `<b>${qi + 1}. ${q.q}</b>` + q.a.map((opt, oi) =>
      `<label class="quiz-opt"><input type="radio" name="q${qi}" value="${oi}">${opt}</label>`).join("");
    box.appendChild(div);
  });
  const btn = document.createElement("button");
  btn.className = "primary";
  btn.textContent = "Check answers";
  const res = document.createElement("div");
  res.className = "quiz-result";
  box.appendChild(btn); box.appendChild(res);
  btn.addEventListener("click", () => {
    let correct = 0;
    l.quiz.forEach((q, qi) => {
      const sel = box.querySelector(`input[name="q${qi}"]:checked`);
      const opts = box.querySelectorAll(`input[name="q${qi}"]`);
      opts.forEach((inp, oi) => {
        inp.closest(".quiz-opt").classList.remove("correct", "wrong");
        if (oi === q.c) inp.closest(".quiz-opt").classList.add("correct");
      });
      if (sel && Number(sel.value) === q.c) correct++;
      else if (sel) sel.closest(".quiz-opt").classList.add("wrong");
    });
    if (correct === l.quiz.length) {
      res.textContent = `✅ ${correct}/${l.quiz.length} — challenge unlocked!`;
      res.className = "quiz-result pass";
      state.quizPassed[l.id] = true;
      save();
      setChallengeUnlocked(true);
    } else {
      res.textContent = `${correct}/${l.quiz.length} — review the highlighted answers and try again.`;
      res.className = "quiz-result fail";
    }
  });
}

/* ---------- game ---------- */
const chart = new CandleChart($("#chart"));
const pane = new IndicatorPane($("#pane"));
let game = null;

function startChallenge(lesson, practice = false) {
  const scn = buildScenario(lesson.scenario, (Date.now() ^ (Math.random() * 1e9)) | 0);
  game = {
    lesson, scn, practice,
    dir: null,
    slPips: scn.defSL, tpPips: scn.defTP,
    phase: "setup",
    revealed: 0,
    speed: 1,
    entry: scn.bars[scn.bars.length - 1].c,
    timer: null,
  };
  $("#game-title").textContent = (practice ? "🎲 Practice — " : `Level ${lesson.id} — `) + lesson.title;
  $("#game-pair").textContent = scn.pair.name;
  $("#game-mission").textContent = "🎯 " + lesson.mission;
  $("#btn-buy").classList.remove("sel");
  $("#btn-sell").classList.remove("sel");
  $("#btn-buy").disabled = false;
  $("#btn-sell").disabled = false;
  $("#inp-sl").value = game.slPips;
  $("#inp-tp").value = game.tpPips;
  $("#inp-sl").disabled = false; $("#inp-tp").disabled = false; $("#sel-risk").disabled = false;
  $("#btn-execute").disabled = true;
  $("#btn-execute").textContent = "3 · Execute trade";
  $("#speed-row").classList.add("hidden");
  $("#trade-status").innerHTML = "Pick a direction to place your order lines.";
  chart.setPair(scn.pair.pip);
  chart.order = null;
  chart.orderEditable = true;
  chart.onOrderChange = o => {
    game.slPips = Math.round(Math.abs(o.entry - o.sl) / scn.pair.pip);
    game.tpPips = Math.round(Math.abs(o.entry - o.tp) / scn.pair.pip);
    $("#inp-sl").value = game.slPips;
    $("#inp-tp").value = game.tpPips;
    updateReadouts();
  };
  pane.canvas.classList.toggle("hidden", !(scn.ann.rsi || scn.ann.macd));
  refreshChart();
  updateReadouts();
  show("game");
  refreshChart(); // second pass after layout so canvas sizes are correct
}

function visibleBars() {
  return game.scn.bars.concat(game.scn.future.slice(0, game.revealed));
}

function refreshChart() {
  const scn = game.scn;
  const bars = visibleBars();
  const closes = bars.map(b => b.c);
  const showAnn = $("#chk-analysis").checked;
  const ov = { mas: [] };
  if (showAnn) {
    if (scn.ann.hlines) ov.hlines = scn.ann.hlines;
    if (scn.ann.trendline) ov.trendline = scn.ann.trendline;
    if (scn.ann.fib) ov.fib = scn.ann.fib;
    if (scn.ann.marks) ov.marks = scn.ann.marks;
  }
  if (scn.ann.ema) ov.mas.push({ values: emaArr(closes, scn.ann.ema), color: "#f2a53c", label: "EMA" + scn.ann.ema });
  chart.overlays = ov;
  chart.setData(bars);
  if (scn.ann.rsi) pane.setRSI(rsiArr(closes, 14));
  if (scn.ann.macd) pane.setMACD(macdArr(closes));
}

function setDirection(dir) {
  if (!game || game.phase !== "setup") return;
  game.dir = dir;
  $("#btn-buy").classList.toggle("sel", dir === "buy");
  $("#btn-sell").classList.toggle("sel", dir === "sell");
  applyOrderFromInputs();
  $("#btn-execute").disabled = false;
  $("#trade-status").innerHTML = "Adjust SL/TP if you like, then execute.";
}

function applyOrderFromInputs() {
  if (!game || !game.dir) return;
  const pip = game.scn.pair.pip;
  const d = game.dir === "buy" ? 1 : -1;
  game.slPips = Math.max(5, Math.round(Number($("#inp-sl").value) || game.scn.defSL));
  game.tpPips = Math.max(5, Math.round(Number($("#inp-tp").value) || game.scn.defTP));
  chart.setOrder({
    entry: game.entry,
    sl: game.entry - d * game.slPips * pip,
    tp: game.entry + d * game.tpPips * pip,
    dir: game.dir,
  });
  updateReadouts();
}

function updateReadouts() {
  if (!game) return;
  const rr = game.slPips ? game.tpPips / game.slPips : 0;
  const riskPct = Number($("#sel-risk").value);
  const riskUsd = state.balance * riskPct;
  const rrEl = $("#out-rr");
  rrEl.textContent = "1 : " + rr.toFixed(2);
  const minRR = game.lesson.rules?.minRR;
  rrEl.className = minRR && rr < minRR ? "bad" : "";
  $("#out-risk").textContent = fmtUSD(riskUsd);
}

function execute() {
  if (!game || !game.dir || game.phase !== "setup") return;
  const minRR = game.lesson.rules?.minRR;
  const rr = game.tpPips / game.slPips;
  if (minRR && rr < minRR) {
    $("#trade-status").innerHTML = `<span class="neg">⛔ This level requires R:R ≥ ${minRR}. Yours is ${rr.toFixed(2)} — adjust SL/TP.</span>`;
    return;
  }
  game.phase = "running";
  game.riskUsd = state.balance * Number($("#sel-risk").value);
  chart.orderEditable = false;
  ["#btn-buy", "#btn-sell"].forEach(s => $(s).disabled = true);
  ["#inp-sl", "#inp-tp", "#sel-risk"].forEach(s => $(s).disabled = true);
  $("#btn-execute").disabled = true;
  $("#btn-execute").textContent = "Trade running…";
  $("#speed-row").classList.remove("hidden");
  tick();
}

function tick() {
  if (!game || game.phase !== "running") return;
  game.revealed++;
  refreshChart();
  const outcome = checkOutcome();
  if (outcome) { finish(outcome); return; }
  const bar = game.scn.future[game.revealed - 1];
  const pip = game.scn.pair.pip;
  const d = game.dir === "buy" ? 1 : -1;
  const flt = (d * (bar.c - game.entry)) / pip;
  $("#trade-status").innerHTML = `Floating P/L: <span class="${flt >= 0 ? "pos" : "neg"}">${flt >= 0 ? "+" : ""}${flt.toFixed(0)} pips</span>`;
  game.timer = setTimeout(tick, 420 / game.speed);
}

function checkOutcome() {
  const pip = game.scn.pair.pip;
  const d = game.dir === "buy" ? 1 : -1;
  const sl = game.entry - d * game.slPips * pip;
  const tp = game.entry + d * game.tpPips * pip;
  const bar = game.scn.future[game.revealed - 1];
  // conservative: if a bar spans both levels, the stop counts first
  if (d > 0 ? bar.l <= sl : bar.h >= sl) return { type: "sl", exit: sl };
  if (d > 0 ? bar.h >= tp : bar.l <= tp) return { type: "tp", exit: tp };
  if (game.revealed >= game.scn.future.length) return { type: "expiry", exit: bar.c };
  return null;
}

function finish(outcome) {
  clearTimeout(game.timer);
  game.phase = "done";
  const pip = game.scn.pair.pip;
  const d = game.dir === "buy" ? 1 : -1;
  const movePips = (d * (outcome.exit - game.entry)) / pip;
  const R = movePips / game.slPips;
  const pnl = Math.round(game.riskUsd * R);
  const win = outcome.type === "tp" || (outcome.type === "expiry" && pnl > 0);

  state.balance = Math.round(state.balance + pnl);
  state.trades++;
  if (win) state.wins++;
  const l = game.lesson;
  if (!game.practice) {
    const log = (state.attemptLog ||= {});
    log[l.id] = (log[l.id] || 0) + 1;
    if (win && !state.completed[l.id]) {
      state.completed[l.id] = { attempts: log[l.id] };
      if (l.id === state.unlocked && state.unlocked < LESSONS.length) state.unlocked++;
    }
  }
  // margin-call safety net
  let marginCalled = false;
  if (state.balance < 500) { state.balance = 10000; marginCalled = true; }
  save();
  renderHud();
  showResult(outcome, movePips, pnl, R, win, marginCalled);
}

function showResult(outcome, movePips, pnl, R, win, marginCalled) {
  const l = game.lesson;
  const isLast = l.id === LESSONS.length;
  const nextL = LESSON_BY_ID[l.id + 1];
  const title =
    win && outcome.type === "tp" ? "Take profit hit!" :
    win ? "Closed in profit" :
    outcome.type === "sl" ? "Stopped out" : "Closed at a loss";
  const emoji = win ? (isLast && !game.practice ? "🏆" : "🎉") : "📉";
  let body = `
    <div class="big-emoji">${emoji}</div>
    <h2 class="${win ? "win" : "loss"}">${title}</h2>
    <p class="muted">${game.dir.toUpperCase()} ${game.scn.pair.name} · ${outcome.type === "expiry" ? "closed at market on expiry" : outcome.type.toUpperCase() + " @ " + chart.fmt(outcome.exit)}</p>
    <div class="rstats">
      <div><label>Pips</label><b class="${movePips >= 0 ? "" : ""}">${movePips >= 0 ? "+" : ""}${movePips.toFixed(0)}</b></div>
      <div><label>P/L</label><b style="color:${pnl >= 0 ? "var(--green-bright)" : "var(--red)"}">${fmtUSD(pnl)}</b></div>
      <div><label>R multiple</label><b>${R >= 0 ? "+" : ""}${R.toFixed(2)}R</b></div>
      <div><label>Balance</label><b>${fmtUSD(state.balance)}</b></div>
    </div>`;
  if (marginCalled) body += `<div class="hint">💥 <b>Margin call!</b> Your balance fell too low and the academy reset it to $10,000. In the real market there are no resets — this is exactly why Level 6 exists.</div>`;
  if (!win) body += `<div class="hint">💡 <b>Hint:</b> ${l.hint}</div>`;
  if (win && !game.practice && isLast) body += `<div class="hint">🏆 <b>You've completed PipQuest — all ${LESSONS.length} levels, beginner to expert.</b> The Practice Arena stays open forever. Remember: a demo win is a hypothesis; only consistent process makes it real.</div>`;

  const btns = [];
  if (win && !game.practice && nextL) btns.push({ label: `Next: Level ${nextL.id} →`, cls: "primary", fn: () => openLesson(nextL.id) });
  if (!win) btns.push({ label: "Retry challenge", cls: "primary", fn: () => startChallenge(l, game.practice) });
  if (!win) btns.push({ label: "Review lesson", cls: "ghost", fn: () => openLesson(l.id) });
  if (win && game.practice) btns.push({ label: "Another practice", cls: "primary", fn: () => { const ids = Object.keys(state.completed).map(Number); startChallenge(LESSON_BY_ID[ids[Math.floor(Math.random() * ids.length)]], true); } });
  btns.push({ label: "Level map", cls: "ghost", fn: () => { renderMap(); show("map"); } });

  const card = $("#modal-card");
  card.innerHTML = body + `<div class="btn-row"></div>`;
  const row = card.querySelector(".btn-row");
  for (const b of btns) {
    const el = document.createElement("button");
    el.className = b.cls;
    el.textContent = b.label;
    el.addEventListener("click", () => { $("#modal").classList.add("hidden"); b.fn(); });
    row.appendChild(el);
  }
  $("#modal").classList.remove("hidden");
}

/* ---------- wiring ---------- */
$("#btn-back-map").addEventListener("click", () => { renderMap(); show("map"); });
$("#btn-quit-game").addEventListener("click", () => {
  if (game?.timer) clearTimeout(game.timer);
  game = null;
  renderMap(); show("map");
});
$("#btn-start-challenge").addEventListener("click", () => startChallenge(currentLesson));
$("#btn-buy").addEventListener("click", () => setDirection("buy"));
$("#btn-sell").addEventListener("click", () => setDirection("sell"));
$("#inp-sl").addEventListener("input", applyOrderFromInputs);
$("#inp-tp").addEventListener("input", applyOrderFromInputs);
$("#sel-risk").addEventListener("change", updateReadouts);
$("#chk-analysis").addEventListener("change", () => game && refreshChart());
$("#btn-execute").addEventListener("click", execute);
$("#btn-speed").addEventListener("click", () => {
  if (!game) return;
  game.speed = game.speed === 1 ? 4 : 1;
  $("#btn-speed").textContent = game.speed === 1 ? "Speed ×4" : "Speed ×1";
});
$("#btn-skip").addEventListener("click", () => {
  if (!game || game.phase !== "running") return;
  clearTimeout(game.timer);
  let outcome = null;
  while (!outcome && game.revealed < game.scn.future.length) {
    game.revealed++;
    outcome = checkOutcome();
  }
  refreshChart();
  finish(outcome || { type: "expiry", exit: game.scn.future[game.scn.future.length - 1].c });
});
$("#btn-reset").addEventListener("click", () => {
  if (confirm("Reset ALL progress, balance and stats?")) {
    state = defaultState();
    save(); renderHud(); renderMap(); show("map");
  }
});
window.addEventListener("resize", () => { if (game) refreshChart(); });

/* debug/testing hook */
window.__pq = { get state() { return state; }, get game() { return game; }, setDirection, execute };

renderHud();
renderMap();
