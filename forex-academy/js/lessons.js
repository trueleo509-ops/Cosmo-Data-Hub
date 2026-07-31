/* ============================================================
   lessons.js — the PipQuest curriculum.
   18 levels, complete beginner → expert.
   Each lesson: content (HTML), 3-question knowledge check,
   a mission briefing, and the scenario type used to build
   its trading challenge (see market.js SCENARIOS).
   ============================================================ */

"use strict";

const TIERS = [
  { id: "beginner",     name: "Beginner — The Foundations",   cls: "t-beginner" },
  { id: "novice",       name: "Novice — Tools of the Trade",  cls: "t-novice" },
  { id: "intermediate", name: "Intermediate — Chart Patterns", cls: "t-intermediate" },
  { id: "advanced",     name: "Advanced — Edge & Precision",  cls: "t-advanced" },
  { id: "expert",       name: "Expert — The Complete Trader", cls: "t-expert" },
];

const LESSONS = [

/* ================= TIER 1 — BEGINNER ================= */
{
  id: 1, tier: "beginner", scenario: "trend",
  title: "Welcome to Forex",
  sub: "Currency pairs, pips, lots — and your very first trade.",
  content: `
<h3>What is forex?</h3>
<p>The foreign exchange market is where currencies are traded — over <b>$7 trillion</b> changes hands every day, making it the largest financial market in the world. You never buy a currency alone; you always trade one <b>against</b> another, which is why prices are quoted in <b>pairs</b>.</p>
<h3>Reading a currency pair</h3>
<p>In <code>EUR/USD = 1.0850</code>, the first currency (EUR) is the <b>base</b>, the second (USD) is the <b>quote</b>. The price means: 1 euro costs 1.0850 dollars.</p>
<ul>
<li><b>BUY (go long)</b> — you profit if the price goes <b>up</b>.</li>
<li><b>SELL (go short)</b> — you profit if the price goes <b>down</b>. Yes, you can profit from falling prices!</li>
</ul>
<h3>Pips and lots</h3>
<p>A <b>pip</b> is the smallest standard price move: <code>0.0001</code> for most pairs (<code>0.01</code> for JPY pairs). If EUR/USD moves from 1.0850 to 1.0860, that's <b>+10 pips</b>.</p>
<p>A <b>lot</b> is your trade size. On a standard lot (100,000 units), 1 pip ≈ $10. Smaller sizes (mini/micro lots) make each pip worth less — that's how traders control risk.</p>
<div class="callout">💡 <b>The one rule that never changes:</b> price moves in waves, not straight lines. Your job is never to predict the future perfectly — it's to find moments where the odds tilt in your favor, and manage risk when you're wrong.</div>
<h3>Your first edge: trade with the flow</h3>
<p>The simplest edge in trading: when price has been moving clearly in one direction, it's statistically more likely to continue than to instantly reverse. "The trend is your friend."</p>`,
  mission: "The chart shows a market moving clearly in one direction. Trade WITH the flow: BUY if it's climbing, SELL if it's falling. Hit your take profit to pass Level 1.",
  hint: "Look at the overall slope of the chart from left to right. Is price making its way up or down? Trade in that direction — don't fight the flow.",
  quiz: [
    { q: "You BUY EUR/USD at 1.0850. Price rises to 1.0880. What happened?", a: ["You lost 30 pips", "You gained 30 pips", "You gained 3 pips", "Nothing until you buy more"], c: 1 },
    { q: "In GBP/USD, which is the base currency?", a: ["USD", "GBP", "Both", "Whichever you buy"], c: 1 },
    { q: "How do you profit from a falling market?", a: ["You can't — only rising markets are tradable", "Buy more as it falls", "SELL (go short) and buy back cheaper later", "Wait for it to rise"], c: 2 },
  ],
},
{
  id: 2, tier: "beginner", scenario: "engulf",
  title: "Candlesticks 101",
  sub: "Every candle tells a story of buyers vs sellers.",
  content: `
<h3>Anatomy of a candlestick</h3>
<p>Each candle summarizes the battle between buyers and sellers over one period of time:</p>
<ul>
<li><b>Body</b> — the range between <b>open</b> and <b>close</b>. Green/teal = closed higher (buyers won). Red = closed lower (sellers won).</li>
<li><b>Wicks (shadows)</b> — the extremes price reached but couldn't hold. A long wick means one side tried to push price there and got <b>rejected</b>.</li>
</ul>
<h3>What candles reveal</h3>
<ul>
<li><b>Big body, small wicks</b> → strong conviction in that direction.</li>
<li><b>Small body, long wicks</b> → indecision, or rejection of a price area.</li>
<li><b>Doji</b> (open ≈ close) → a stand-off. Often appears before reversals.</li>
</ul>
<h3>The engulfing pattern</h3>
<p>One of the most reliable single-candle signals. A <b>bullish engulfing</b> appears after a decline: a large green candle whose body completely swallows the previous red candle's body. It means sellers were in control… and buyers just steamrolled them. A <b>bearish engulfing</b> is the mirror image at the top of a rise.</p>
<div class="callout">💡 Context is everything. An engulfing candle <b>after an extended move</b> is a reversal signal. The same candle in the middle of nowhere means little.</div>`,
  mission: "Price has been trending, and the very last candle is a large engulfing candle swallowing the one before it. That's a reversal signal — trade in the direction of the engulfing candle.",
  hint: "Look at the final candle on the chart. Is it a big green candle engulfing a red one (buy signal), or a big red candle engulfing a green one (sell signal)? Trade in the direction of that last big candle — against the old move.",
  quiz: [
    { q: "A candle has a long lower wick and closes near its high. What does the wick tell you?", a: ["Buyers gave up", "Sellers pushed price down but were rejected", "The market was closed", "Nothing important"], c: 1 },
    { q: "A bullish engulfing pattern appears after a long decline. What does it suggest?", a: ["The decline will accelerate", "Buyers have overwhelmed sellers — possible reversal up", "Price will go sideways", "Volume is low"], c: 1 },
    { q: "A candle's body shows the range between…", a: ["High and low", "Open and close", "Yesterday and today", "Bid and ask"], c: 1 },
  ],
},
{
  id: 3, tier: "beginner", scenario: "pullback",
  title: "Market Structure: Trends",
  sub: "Higher highs, higher lows — the skeleton of every chart.",
  content: `
<h3>The three market states</h3>
<ul>
<li><b>Uptrend</b> — price makes <b>higher highs (HH)</b> and <b>higher lows (HL)</b>.</li>
<li><b>Downtrend</b> — <b>lower highs (LH)</b> and <b>lower lows (LL)</b>.</li>
<li><b>Range</b> — price bounces sideways between two levels.</li>
</ul>
<h3>Waves: impulse and pullback</h3>
<p>Trends don't move in straight lines — they breathe. An <b>impulse</b> is the strong move in the trend direction. A <b>pullback</b> (retracement) is the smaller counter-move against it. This rhythm — push, rest, push, rest — is the heartbeat of every trending market.</p>
<h3>The professional entry: buy the dip</h3>
<p>Beginners chase price when the impulse is already extended — and get in at the worst spot. Professionals wait for the <b>pullback</b>, then enter as the trend resumes:</p>
<ol>
<li>Identify a clear trend (HH + HL, or LH + LL).</li>
<li>Wait for a pullback against it.</li>
<li>Enter when price shows signs of resuming (e.g. a strong candle back in the trend direction).</li>
</ol>
<div class="callout">💡 A pullback in an uptrend is a <b>discount</b> on something people want to buy. The trend resuming is your confirmation the sale is over.</div>`,
  mission: "This market is trending, has just finished a pullback, and is showing signs of resuming. Enter in the direction of the TREND — you're buying the dip (or selling the rally).",
  hint: "Zoom out mentally: what direction are the big impulses? The recent small counter-move is just a pullback. Trade in the direction of the larger trend, not the recent dip.",
  quiz: [
    { q: "An uptrend is defined by…", a: ["Higher highs and higher lows", "Lower highs and lower lows", "Equal highs", "More green candles than red"], c: 0 },
    { q: "Price is in a strong uptrend and pulls back slightly. What's the professional play?", a: ["Sell — the trend is over", "Buy the pullback as the trend resumes", "Wait for a new all-time high to buy", "Flip a coin"], c: 1 },
    { q: "What is an 'impulse' move?", a: ["Any red candle", "The strong move in the trend's direction", "A news spike", "The first candle of the day"], c: 1 },
  ],
},
{
  id: 4, tier: "beginner", scenario: "level-bounce",
  title: "Support & Resistance",
  sub: "The price levels where battles are won and lost.",
  content: `
<h3>The market has memory</h3>
<p><b>Support</b> is a price floor — a level where buyers have repeatedly stepped in and pushed price up. <b>Resistance</b> is a ceiling — where sellers have repeatedly capped rallies. These levels work because thousands of traders remember them, place orders around them, and react at them.</p>
<h3>How to find good levels</h3>
<ul>
<li>Look for areas price has <b>touched and reversed from at least twice</b>.</li>
<li>Treat them as <b>zones</b>, not exact lines — price often overshoots by a few pips.</li>
<li>The more times a level holds, the more traders watch it… but also the weaker it may become (each test eats the orders defending it).</li>
</ul>
<h3>The two trades at a level</h3>
<ol>
<li><b>The bounce</b> — price returns to support → buy the rejection (or sell at resistance). Stop loss goes just <b>beyond</b> the level.</li>
<li><b>The breakout</b> — price smashes through the level with force (covered in Level 13).</li>
</ol>
<h3>Role reversal</h3>
<p>When support breaks, it often becomes resistance — and vice versa. Old floors become ceilings.</p>
<div class="callout">💡 Never trade a level blindly. Wait for a <b>rejection sign</b> — a wick, a strong reversal candle — showing that the level is actually holding this time.</div>`,
  mission: "Price has returned to a marked level that has held before, and the last candle shows rejection. Trade the bounce — away from the level — with your stop just beyond it.",
  hint: "Find the dashed level line. If it's below price, it's support — buy the bounce. If it's above, it's resistance — sell the rejection. Your SL belongs on the far side of the level.",
  quiz: [
    { q: "Support is best described as…", a: ["A price ceiling where sellers dominate", "A price floor where buyers repeatedly step in", "The day's opening price", "A moving average"], c: 1 },
    { q: "Price bounces at support. Where does your stop loss belong?", a: ["Just below the support level", "At your entry", "Far above resistance", "No stop needed at support"], c: 0 },
    { q: "Support at 1.0800 breaks decisively. What often happens to that level?", a: ["It disappears forever", "It becomes resistance on the way back up", "It becomes stronger support", "Price must return to it same-day"], c: 1 },
  ],
},

/* ================= TIER 2 — NOVICE ================= */
{
  id: 5, tier: "novice", scenario: "level-bounce",
  title: "Orders, Stop Loss & Take Profit",
  sub: "Plan the exit before you enter. Always.",
  content: `
<h3>Order types</h3>
<ul>
<li><b>Market order</b> — execute now, at the current price (what you use in this game).</li>
<li><b>Limit order</b> — execute at a better price than now (buy lower / sell higher).</li>
<li><b>Stop order</b> — execute at a worse price than now (used to enter breakouts — or to exit losers).</li>
</ul>
<h3>The stop loss (SL)</h3>
<p>Your SL is a pre-set order that closes the trade automatically at a defined loss. It is <b>not optional</b>. It's the difference between a controlled, planned loss and a blown account. Place it at the price where your trade idea is <b>proven wrong</b> — e.g. below the support you bought, beyond the wick that rejected.</p>
<h3>The take profit (TP)</h3>
<p>Your TP closes the trade at a defined gain. Place it at a <b>logical target</b> — the next opposing level, not a random hope. Between entry and target there should be "clean air".</p>
<h3>Risk : Reward (R:R)</h3>
<p>If your SL risks 20 pips and your TP targets 40, your R:R is <b>1:2</b> — you make twice what you risk. With 1:2, you can be wrong more often than right and <b>still be profitable</b>: win just 40% of trades and you come out ahead.</p>
<div class="callout">💡 Amateurs decide exits after entering, with emotions raging. Professionals decide entry, SL and TP <b>before</b> clicking the button — then let the plan play out.</div>`,
  mission: "Trade the level bounce — but this time, pay attention to your SL (just beyond the level) and TP (aim for at least 1.5× your risk). Drag the lines on the chart to adjust them.",
  hint: "Direction: trade away from the marked level. Then check your R:R readout — is your reward bigger than your risk? Is your SL beyond the level (not inside the battle zone)?",
  quiz: [
    { q: "Where should a stop loss be placed?", a: ["As close as possible to save money", "At the price where your trade idea is proven wrong", "Never — stops are for cowards", "Exactly 10 pips away, always"], c: 1 },
    { q: "You risk 25 pips to make 50 pips. Your R:R is…", a: ["1:0.5", "1:2", "2:1 against you", "25:50 = even"], c: 1 },
    { q: "With a 1:2 risk:reward, what win rate do you need to break even?", a: ["Above 66%", "Exactly 50%", "About 33%", "90%"], c: 2 },
  ],
},
{
  id: 6, tier: "novice", scenario: "pullback",
  title: "Risk Management & Position Sizing",
  sub: "The skill that separates survivors from statistics.",
  rules: { minRR: 1.5 },
  content: `
<h3>Why most traders fail</h3>
<p>Not because their analysis is bad — because they risk too much. Risk 20% per trade and a normal losing streak of 5 wipes out two-thirds of your account. Risk 1% and the same streak costs you 5%. <b>Survival is the strategy.</b></p>
<h3>The 1–2% rule</h3>
<p>Never risk more than 1–2% of your account on a single trade. Your position size is <b>calculated</b> from that, not guessed:</p>
<p><code>Position size = (Account × Risk%) ÷ (SL distance in pips × pip value)</code></p>
<p>Example: $10,000 account, 1% risk = $100. SL is 25 pips away. Pip value at 0.4 lots ≈ $4 → 25 × $4 = $100. ✔</p>
<h3>The magic of asymmetric bets</h3>
<table>
<tr><th>Win rate</th><th>R:R</th><th>Result over 100 trades (1% risk)</th></tr>
<tr><td>40%</td><td>1:2</td><td>+20R → up ~20%</td></tr>
<tr><td>50%</td><td>1:1</td><td>0R → breakeven (minus costs)</td></tr>
<tr><td>60%</td><td>1:0.5</td><td>0R → breakeven (minus costs)</td></tr>
</table>
<p>The 40% win-rate trader beats the 60% one. Let that sink in: <b>you don't need to be right often — you need your wins to outweigh your losses.</b></p>
<div class="callout">⚠️ From this level on, the game enforces discipline: your trade must have <b>R:R of at least 1.5</b> to execute. Sloppy risk plans don't get filled.</div>`,
  mission: "A trend-pullback setup. Trade it in the trend direction — but the game will only let you execute with R:R ≥ 1.5. Size your SL sensibly and place your TP at a worthwhile target.",
  hint: "Trend direction first. Then: if your R:R shows under 1.5, either tighten your SL (to a still-logical spot) or extend your TP. Never tighten the SL so much that normal noise would hit it.",
  quiz: [
    { q: "With a $10,000 account and the 1% rule, your max loss per trade is…", a: ["$1,000", "$100", "$10", "Whatever feels right"], c: 1 },
    { q: "Your SL needs to be 50 pips for the setup to be valid, but that risks 3% at your current size. You should…", a: ["Move the SL closer anyway", "Reduce your position size", "Skip the stop loss", "Double the TP to compensate"], c: 1 },
    { q: "Trader A wins 40% with 1:2 R:R. Trader B wins 55% with 1:0.7. Who profits long-term?", a: ["Trader B — higher win rate always wins", "Trader A", "Both equally", "Neither"], c: 1 },
  ],
},
{
  id: 7, tier: "novice", scenario: "ma-bounce",
  title: "Moving Averages",
  sub: "The trend, smoothed — and a dynamic level to trade from.",
  content: `
<h3>What a moving average is</h3>
<p>A <b>moving average (MA)</b> plots the average closing price of the last N candles, drawn as a flowing line. It smooths out the noise so you can see the underlying current.</p>
<ul>
<li><b>SMA</b> — simple average of the last N closes.</li>
<li><b>EMA</b> — exponential MA, weights recent candles more, reacts faster. Popular settings: 21 (short-term trend), 50, 200 (the "big picture" line).</li>
</ul>
<h3>Three ways traders use MAs</h3>
<ol>
<li><b>Trend filter</b> — price above a rising MA = uptrend bias; below a falling MA = downtrend bias. Simple and powerful.</li>
<li><b>Dynamic support/resistance</b> — in a healthy trend, pullbacks often find support right at the EMA and bounce. It's a moving version of the levels you learned in Level 4.</li>
<li><b>Crossovers</b> — a fast MA crossing a slow one signals momentum shift (crude, but visualizes the turn).</li>
</ol>
<h3>The MA bounce setup</h3>
<ol>
<li>Confirm the MA is clearly <b>sloping</b> (trending market — MAs are useless in flat chop).</li>
<li>Wait for price to pull back and <b>touch the MA</b>.</li>
<li>Enter on a rejection candle, SL beyond the MA, TP at 1.5–2R.</li>
</ol>
<div class="callout">💡 The MA isn't magic — it works because so many traders watch it that it becomes a self-fulfilling meeting point for buyers in an uptrend.</div>`,
  mission: "Price is trending along the EMA-21 (orange line) and has just pulled back to touch it. Trade the bounce in the direction of the MA's slope.",
  hint: "Which way is the orange EMA line sloping? That's your direction. Price touching the line is your discounted entry — SL goes on the far side of the line.",
  quiz: [
    { q: "Price is above a rising EMA. Your bias should be…", a: ["Bearish", "Bullish", "Neutral", "Whatever the last candle says"], c: 1 },
    { q: "When are moving averages least useful?", a: ["In strong uptrends", "In strong downtrends", "In flat, choppy ranges", "On high timeframes"], c: 2 },
    { q: "An EMA differs from an SMA because it…", a: ["Uses highs instead of closes", "Weights recent prices more heavily", "Only works on daily charts", "Ignores the last candle"], c: 1 },
  ],
},
{
  id: 8, tier: "novice", scenario: "rsi-rev",
  title: "RSI: Momentum & Exhaustion",
  sub: "Reading when a move is running out of fuel.",
  content: `
<h3>What RSI measures</h3>
<p>The <b>Relative Strength Index</b> compares the size of recent gains vs recent losses and squeezes it into a 0–100 scale. It answers: <i>how stretched is this move?</i></p>
<ul>
<li><b>RSI &gt; 70</b> — "overbought": the rally has been unusually one-sided.</li>
<li><b>RSI &lt; 30</b> — "oversold": the sell-off has been unusually one-sided.</li>
<li><b>RSI ≈ 50</b> — balance.</li>
</ul>
<h3>The right way to use it</h3>
<p>⚠️ Overbought does <b>not</b> mean "sell now". In strong trends, RSI can stay pinned above 70 for a long time. RSI works best as an <b>exhaustion + confirmation</b> tool:</p>
<ol>
<li>Price makes an extended, steep move (many candles, little pause).</li>
<li>RSI reaches an extreme (&lt;30 or &gt;70).</li>
<li>Price prints a <b>reversal candle</b> (engulfing, strong close the other way).</li>
<li>→ Now the reversal trade has odds behind it. The candle is the trigger; RSI is the context.</li>
</ol>
<h3>Divergence (preview)</h3>
<p>When price makes a new low but RSI makes a <i>higher</i> low, the selling is losing force even as price ticks lower — a classic early reversal clue.</p>
<div class="callout">💡 Indicators never replace price. They <b>rank</b> the quality of what price is already showing you.</div>`,
  mission: "The market has made a steep, extended move and RSI (bottom panel) is at an extreme. The last candle turns against the move. Trade the reversal.",
  hint: "Check the RSI panel: below 30 means the drop is exhausted (look to buy); above 70 means the rally is exhausted (look to sell). Confirm with the last candle's direction.",
  quiz: [
    { q: "RSI below 30 means…", a: ["Guaranteed reversal up — buy immediately", "The recent move down has been unusually one-sided", "The market is closed", "Volume is low"], c: 1 },
    { q: "In a strong uptrend, RSI above 70 for many candles usually means…", a: ["Sell everything", "The trend is strong — overbought can stay overbought", "RSI is broken", "Buy more with no stop"], c: 1 },
    { q: "The best use of RSI extremes is…", a: ["As an automatic entry signal", "As context — then wait for a price reversal signal to trigger", "To set stop losses", "To pick position size"], c: 1 },
  ],
},

/* ================= TIER 3 — INTERMEDIATE ================= */
{
  id: 9, tier: "intermediate", scenario: "macd-cross",
  title: "MACD: Trend Momentum Shifts",
  sub: "Catching the turn as momentum flips.",
  content: `
<h3>The MACD's moving parts</h3>
<p>The <b>MACD (12, 26, 9)</b> distills trend momentum into three elements (bottom panel):</p>
<ul>
<li><b>MACD line</b> (blue) — the gap between a fast EMA(12) and slow EMA(26). Above zero = bullish momentum regime; below = bearish.</li>
<li><b>Signal line</b> (yellow) — a 9-period EMA of the MACD line.</li>
<li><b>Histogram</b> — the gap between the two. Shrinking bars = momentum fading; flipping color = momentum crossing.</li>
</ul>
<h3>The signals</h3>
<ol>
<li><b>Signal-line crossover</b> — MACD crossing above the signal line = bullish shift; crossing below = bearish. Strongest when it happens after an extended move, at depressed levels.</li>
<li><b>Zero-line cross</b> — confirms the broader regime change.</li>
<li><b>Histogram flip</b> — the earliest, noisiest clue.</li>
</ol>
<h3>The base-and-turn setup</h3>
<p>The highest-quality MACD trade: a market falls hard, then stops falling and <b>bases sideways</b> (sellers exhausted). MACD curls up and crosses its signal line while price pushes out of the base. You're not catching a falling knife — you're joining a turn that's already begun.</p>
<div class="callout">💡 MACD is a <b>lagging</b> indicator: it confirms rather than predicts. That lag is a feature — it filters out half-formed reversals.</div>`,
  mission: "This market fell, based sideways, and is turning — the MACD has just crossed its signal line. Trade in the direction of the fresh cross.",
  hint: "In the MACD panel, find where the blue line crosses the yellow line at the far right. Cross up = buy, cross down = sell. Price breaking out of its base should agree.",
  quiz: [
    { q: "The MACD line is the difference between…", a: ["High and low", "EMA(12) and EMA(26)", "RSI and price", "Today and yesterday's close"], c: 1 },
    { q: "The MACD line crosses ABOVE its signal line after a decline and base. This suggests…", a: ["Bearish continuation", "A bullish momentum shift", "Nothing — ignore it", "Time to widen your stop"], c: 1 },
    { q: "MACD 'lags' price. Why can that be useful?", a: ["It can't — lag is always bad", "It filters out noise and half-formed reversals", "It predicts news events", "It removes the need for stops"], c: 1 },
  ],
},
{
  id: 10, tier: "intermediate", scenario: "double-top",
  title: "Double Tops & Bottoms",
  sub: "When the market knocks twice and gets rejected twice.",
  content: `
<h3>The psychology of the pattern</h3>
<p>Price rallies to a high and gets rejected. It retreats, gathers itself, and attacks the <b>same level</b> again — and fails <b>again</b>. Two rejections at the same price is the market saying: <i>there are heavy sellers here.</i> That's a <b>double top</b> (an "M" shape). A <b>double bottom</b> ("W") is the mirror at lows.</p>
<h3>The anatomy</h3>
<ul>
<li><b>Two peaks</b> at roughly the same level (a few pips apart is fine).</li>
<li><b>The neckline</b> — the valley low between the peaks. This is the trigger line.</li>
<li><b>Confirmation</b> — the pattern only completes when price <b>breaks the neckline</b>. Before that, it's just a range.</li>
</ul>
<h3>Trading it</h3>
<ol>
<li>Wait for the second rejection and the push toward/through the neckline.</li>
<li>Enter on the neckline break (or the retest of it).</li>
<li><b>SL</b>: beyond the peaks. <b>TP</b>: the pattern's height (peak-to-neckline distance) projected below the neckline.</li>
</ol>
<div class="callout">⚠️ The #1 mistake: shorting at the second peak <i>before</i> any rejection is confirmed. If price punches through instead, that's a breakout — and you're on the wrong side of it.</div>`,
  mission: "Two rejections at the same level, and price is now breaking the neckline. Trade the pattern — away from the double top/bottom — with your SL beyond the peaks.",
  hint: "Find the two marked touches (1 and 2) at the same level. Price should move AWAY from that level: double top → sell, double bottom → buy. Target ≈ the height of the pattern.",
  quiz: [
    { q: "A double top completes (confirms) when…", a: ["The second peak forms", "Price breaks below the neckline", "RSI hits 70", "Volume doubles"], c: 1 },
    { q: "The measured target of a double top is…", a: ["Twice the entry price", "The pattern's height projected below the neckline", "Always 100 pips", "The nearest MA"], c: 1 },
    { q: "Why is a double top bearish?", a: ["Two failures at the same price reveal heavy sellers there", "Even numbers are bearish", "It only appears in downtrends", "It isn't bearish"], c: 0 },
  ],
},
{
  id: 11, tier: "intermediate", scenario: "head-shoulders",
  title: "Head & Shoulders",
  sub: "The classic reversal: the trend's last gasp.",
  content: `
<h3>The story the pattern tells</h3>
<p>An uptrend makes a high (<b>left shoulder</b>), pulls back, then powers to a higher high (<b>head</b>) — so far, a healthy trend. But the next rally fails <b>below</b> the head (<b>right shoulder</b>): buyers couldn't even match the previous peak. The trend's engine has stalled — the structure of higher highs is broken.</p>
<h3>The anatomy</h3>
<ul>
<li><b>Left shoulder → Head → Right shoulder</b>, with the head as the highest peak.</li>
<li><b>Neckline</b> — connects the two troughs between the peaks.</li>
<li><b>Confirmation</b> — a decisive close <b>below the neckline</b>. Until then, the uptrend deserves the benefit of the doubt.</li>
</ul>
<h3>Trading it</h3>
<ol>
<li>Enter on the neckline break (aggressive) or its retest (conservative).</li>
<li><b>SL</b>: above the right shoulder.</li>
<li><b>TP</b>: head-to-neckline height, projected down from the break.</li>
</ol>
<p>The <b>inverse head &amp; shoulders</b> is the same pattern flipped upside-down at the end of downtrends — one of the most reliable bottoming patterns in trading.</p>
<div class="callout">💡 What makes H&S powerful isn't the shape — it's what the shape encodes: a failed higher-high plus a broken higher-low. It's Level 3's market structure, drawn as a picture.</div>`,
  mission: "The chart shows LS, HEAD and RS marks and a neckline — and price has just broken through it. Trade the reversal, SL beyond the right shoulder.",
  hint: "Head & shoulders on top (peaks up) → the reversal is DOWN, so sell. Inverse H&S (upside-down, at lows) → buy. The neckline break is your green light.",
  quiz: [
    { q: "In a head & shoulders top, the right shoulder shows that…", a: ["Buyers failed to even reach the head's high — the trend is stalling", "The trend is accelerating", "Volume is rising", "Nothing — shoulders are decoration"], c: 0 },
    { q: "The pattern confirms when…", a: ["The right shoulder forms", "Price closes decisively beyond the neckline", "The head is 2× the shoulders", "RSI diverges"], c: 1 },
    { q: "Where does the stop loss belong on a confirmed H&S short?", a: ["Below the neckline", "Above the right shoulder", "Above the head ×2", "No stop needed on patterns"], c: 1 },
  ],
},
{
  id: 12, tier: "intermediate", scenario: "trendline",
  title: "Trendlines & Channels",
  sub: "Drawing the market's diagonal support and resistance.",
  content: `
<h3>What a trendline is</h3>
<p>Connect two or more <b>swing lows</b> in an uptrend (or swing highs in a downtrend) and extend the line right: you've drawn a <b>diagonal support</b> — the rising floor the trend keeps respecting. It's Level 4's support, but tilted with the trend.</p>
<h3>Drawing rules that matter</h3>
<ul>
<li><b>Minimum two touches</b> to draw it; the <b>third touch</b> is where it becomes tradeable.</li>
<li>Connect the <b>wicks or the bodies — consistently</b>. Don't force the line through the chart; if it needs bending, it's not a real trendline.</li>
<li>Steeper = weaker. Sustainable trends have moderate slopes; near-vertical lines break fast.</li>
</ul>
<h3>The third-touch setup</h3>
<ol>
<li>Uptrend with two clean higher lows on a line.</li>
<li>Price returns to the line for the <b>third touch</b>.</li>
<li>A rejection candle at the line = entry. <b>SL</b> below the line, <b>TP</b> near the top of the channel or 2R.</li>
</ol>
<h3>Channels</h3>
<p>Draw a parallel line across the swing highs and you have a <b>channel</b> — the trend's full lane. Buy the floor, take profit at the ceiling.</p>
<div class="callout">⚠️ When a mature trendline (3+ touches) finally <b>breaks</b>, it often signals the whole trend is changing — trendline breaks are many traders' first reversal alarm.</div>`,
  mission: "Price is touching a drawn trendline for the third time and rejecting. Trade the bounce in the trend's direction, SL on the far side of the line.",
  hint: "The blue diagonal line is the trend's floor (or ceiling). Rising line under price → buy the touch. Falling line above price → sell the touch.",
  quiz: [
    { q: "How many touches validate a trendline enough to trade it?", a: ["One", "The third touch is the classic tradeable one", "Ten", "Touches don't matter"], c: 1 },
    { q: "An uptrend line connects…", a: ["Swing highs", "Swing lows", "Open prices", "Random candles"], c: 1 },
    { q: "A very steep trendline is usually…", a: ["The strongest kind", "Unsustainable and quick to break", "Only valid on Fridays", "A buy signal by itself"], c: 1 },
  ],
},

/* ================= TIER 4 — ADVANCED ================= */
{
  id: 13, tier: "advanced", scenario: "breakout",
  title: "Breakout Trading",
  sub: "When the dam breaks, trade the flood.",
  content: `
<h3>Compression → expansion</h3>
<p>Markets alternate between <b>ranges</b> (energy building) and <b>trends</b> (energy releasing). A <b>breakout</b> is the moment price escapes a well-defined range — and the longer and tighter the range, the more stored energy gets released.</p>
<h3>Why breakouts run</h3>
<ul>
<li>Traders who sold the top of the range are now <b>trapped</b> — their stop-buying fuels the move.</li>
<li>Breakout traders pile in with the move.</li>
<li>There's no nearby resistance left — price is in "clean air".</li>
</ul>
<h3>Real vs weak breakouts</h3>
<p>A tradeable breakout shows <b>conviction</b>: a large-bodied candle <b>closing</b> clearly beyond the level — not a timid poke. (Timid pokes are often fakeouts — that's Level 14.)</p>
<h3>Trading it</h3>
<ol>
<li>Identify a clear range: flat support and resistance, several touches each.</li>
<li>Wait for a <b>strong close</b> beyond one boundary.</li>
<li>Enter on the break (aggressive) or the <b>retest</b> of the broken level (conservative — role reversal from Level 4!).</li>
<li><b>SL</b>: back inside the range, beyond the broken level. <b>TP</b>: about the height of the range, projected in the break's direction.</li>
</ol>
<div class="callout">💡 Expect the retest: breakouts frequently return to kiss the broken level before running. That pullback is your gift entry — not a failure.</div>`,
  mission: "A long sideways range has just broken with a strong candle. Trade in the direction of the breakout — and don't panic if price retests the broken level first.",
  hint: "Which boundary line did price just smash through with a big candle? Trade in that direction. SL goes back inside the range; the broken level should now defend your trade.",
  quiz: [
    { q: "What makes a breakout credible?", a: ["A tiny wick poking the level", "A large-bodied candle closing decisively beyond the level", "Low volatility", "It happens at midnight"], c: 1 },
    { q: "After breaking resistance, price returns to touch the broken level. This is…", a: ["A failed breakout — exit instantly", "A retest — often a second entry opportunity", "Impossible", "A reason to reverse your trade"], c: 1 },
    { q: "A common breakout target is…", a: ["The height of the range projected from the break", "Exactly 10 pips", "The next round number ×3", "There are no targets"], c: 0 },
  ],
},
{
  id: 14, tier: "advanced", scenario: "fakeout",
  title: "Fakeouts & Stop Hunts",
  sub: "Trading the trap instead of falling into it.",
  content: `
<h3>The trap</h3>
<p>Everyone can see an obvious level. So when price breaks it, a crowd jumps in… and sometimes the market snaps back, leaving them all trapped. That's a <b>fakeout</b> (false breakout) — and it's not random: clustered stop orders beyond obvious levels are <b>liquidity</b>, and big players push into them to fill large positions, then drive price the other way.</p>
<h3>Spotting a fakeout</h3>
<ul>
<li>Price pokes beyond a level but <b>fails to close</b> beyond it — a long wick punches through and snaps back inside.</li>
<li>The next candle confirms, moving away from the level.</li>
<li>The "breakout" candle had no follow-through, no conviction.</li>
</ul>
<h3>Why fakeout trades are excellent</h3>
<p>Every trapped breakout trader is now forced to exit at a loss — and their exits <b>fuel your trade</b>. Fakeout entries also have crystal-clear invalidation: beyond the wick that did the trapping. Tight stop, big target.</p>
<h3>Trading it</h3>
<ol>
<li>Range with an obvious boundary.</li>
<li>Spike through the boundary that <b>closes back inside</b> (long rejection wick).</li>
<li>Enter on the confirmation candle, <b>against</b> the failed break. <b>SL</b>: beyond the spike's wick. <b>TP</b>: the opposite side of the range.</li>
</ol>
<div class="callout">💡 The market's cruelest lesson, turned into an edge: <b>the failed move is itself a signal.</b> When an obvious breakout fails, the reaction is usually violent — in the other direction.</div>`,
  mission: "Price spiked through an obvious level, failed, and snapped back inside — trapping the breakout crowd. Trade AGAINST the failed break, toward the other side of the range.",
  hint: "Find the 'Fakeout!' wick that poked through the level and closed back inside. Trade in the opposite direction of that spike. SL beyond the wick's tip.",
  quiz: [
    { q: "A fakeout is identified by…", a: ["A close far beyond the level", "A wick through the level that closes back inside", "Three green candles", "A gap"], c: 1 },
    { q: "Why do fakeout reversals move fast?", a: ["Luck", "Trapped breakout traders exiting fuel the reversal", "Fakeouts don't move fast", "Because of spreads"], c: 1 },
    { q: "Where's the stop loss on a fakeout trade?", a: ["Beyond the tip of the trapping wick", "In the middle of the range", "There isn't one", "At the opposite range boundary"], c: 0 },
  ],
},
{
  id: 15, tier: "advanced", scenario: "fib",
  title: "Fibonacci Retracements",
  sub: "Measuring the dip: how deep is too deep?",
  content: `
<h3>The idea</h3>
<p>You know trends move in impulses and pullbacks (Level 3). Fibonacci retracement answers the practical question: <b>how far will the pullback go?</b> Stretch the tool from the impulse's start (0%) to its end (100%), and it marks the classic retracement depths: <b>38.2%, 50%, 61.8%, 78.6%</b>.</p>
<h3>Reading the levels</h3>
<ul>
<li><b>Shallow (38.2%)</b> — very strong trend; buyers can't wait.</li>
<li><b>The golden pocket (50–61.8%)</b> — the classic zone where healthy pullbacks end and trends resume. This is the money zone.</li>
<li><b>Deep (78.6%)</b> — last defense. Beyond it, the impulse is likely fully reversing, not retracing.</li>
</ul>
<h3>Trading the golden pocket</h3>
<ol>
<li>Clear impulse in a trend.</li>
<li>Pullback reaches the 50–61.8% zone.</li>
<li>Price stalls and prints a rejection candle in the zone → enter with the trend.</li>
<li><b>SL</b>: beyond the 78.6% level. <b>TP</b>: the old impulse high (or beyond, for trend continuation).</li>
</ol>
<div class="callout">💡 Fib levels aren't magic numbers — they work as <b>consensus focal points</b>: enough traders watch them that orders cluster there. Strongest when a fib level lines up with real structure — old support, an MA, a trendline. That's confluence, and it's Level 17's whole story.</div>`,
  mission: "An impulse move has retraced to the 61.8% golden-pocket level and is stalling. Trade the trend's resumption from the fib zone.",
  hint: "Find the 61.8% line (highlighted). Price pulled back to it after a big move. Trade in the direction of the ORIGINAL impulse — the pullback should be ending here.",
  quiz: [
    { q: "The 'golden pocket' refers to…", a: ["0–23.6%", "The 50–61.8% retracement zone", "100%+", "The spread"], c: 1 },
    { q: "Price retraces 90% of an impulse. What does that suggest?", a: ["Perfect entry — deeper is better", "The move is likely a full reversal, not a pullback", "Fibs guarantee a bounce at 100%", "Nothing"], c: 1 },
    { q: "Fib levels work best when…", a: ["Used alone on any chart", "They line up with real structure (S/R, MAs, trendlines)", "Drawn on 1-second charts", "The market is closed"], c: 1 },
  ],
},
{
  id: 16, tier: "advanced", scenario: "pinbar",
  title: "Pin Bars & Rejection Candles",
  sub: "One candle that screams 'rejection'.",
  content: `
<h3>The pin bar</h3>
<p>A <b>pin bar</b> (Pinocchio bar — it lies about where price was going) has a long wick at least ~2× its small body, with the body squeezed at the opposite end. A long <b>lower</b> wick after a decline = sellers drove price down, and buyers slammed it all the way back — a <b>bullish</b> rejection. Long upper wick after a rally = bearish.</p>
<h3>What makes a pin bar A-grade</h3>
<ul>
<li><b>Location, location, location</b> — at a support/resistance level, a trendline, a fib zone, or an MA. A pin bar in the middle of nowhere is noise.</li>
<li><b>After an extended move</b> — the more stretched the move it rejects, the more fuel for the reversal.</li>
<li><b>Size</b> — it should stand out from surrounding candles, not blend in.</li>
</ul>
<h3>Trading it</h3>
<ol>
<li>Wait for the pin bar to <b>close</b> — half-formed wicks change.</li>
<li>Enter at the close (or on the break of the pin bar's nose).</li>
<li><b>SL</b>: a few pips beyond the wick's tip — the wick's extreme is your exact invalidation.</li>
<li><b>TP</b>: next opposing level, minimum 1.5R.</li>
</ol>
<div class="callout">💡 The wick is literally the footprint of the losing side's failure. The market showed you what it rejected — your job is just to not argue with it.</div>`,
  mission: "After an extended move, a textbook pin bar has printed at a level — long wick, tiny body. Trade in the direction of the rejection (away from the wick).",
  hint: "The wick points at what was REJECTED. Long wick sticking down → buyers won, go long. Long wick sticking up → sellers won, go short. SL beyond the wick tip.",
  quiz: [
    { q: "A bullish pin bar has…", a: ["A long upper wick and a body at the bottom", "A long lower wick and a small body near the top", "No wicks", "Equal wicks both sides"], c: 1 },
    { q: "The most important factor in a pin bar's quality is…", a: ["Its color", "Its location — at a meaningful level after an extended move", "The time of day", "The pair"], c: 1 },
    { q: "Where does the SL belong on a pin bar trade?", a: ["A few pips beyond the wick's tip", "Inside the body", "50% of the candle", "At the previous day's open"], c: 0 },
  ],
},

/* ================= TIER 5 — EXPERT ================= */
{
  id: 17, tier: "expert", scenario: "confluence",
  title: "Confluence: Stacking the Odds",
  sub: "One signal is a guess. Three agreeing signals are an edge.",
  content: `
<h3>The expert difference</h3>
<p>Beginners hunt for the one magic signal. Experts do the opposite: they wait for <b>multiple independent reasons</b> to point at the same price zone, in the same direction. That overlap is <b>confluence</b> — and it's why two traders can look at the same chart and only one of them prints money.</p>
<h3>Building a confluence checklist</h3>
<p>For a long trade, you might require, say, three of:</p>
<ul>
<li>✅ <b>Trend</b>: higher-timeframe structure is bullish (HH/HL).</li>
<li>✅ <b>Structure</b>: price is at prior support / a broken-then-retested level.</li>
<li>✅ <b>Fib</b>: the zone overlaps the 50–61.8% golden pocket of the last impulse.</li>
<li>✅ <b>Dynamic</b>: a rising EMA passes through the same zone.</li>
<li>✅ <b>Trigger</b>: a rejection candle (pin bar / engulfing) prints in the zone.</li>
</ul>
<p>Each factor alone is mediocre. Stacked in one zone, they describe a price where <i>many different types of traders</i> all want to do the same thing.</p>
<h3>The A+ setup mindset</h3>
<p>Confluence also means <b>fewer trades</b>. Most hours of most days offer nothing. The expert's job is to wait — flat is a position — and strike only when the checklist fills. One A+ setup a week beats twenty C-setups a day, in both P&amp;L and sanity.</p>
<div class="callout">💡 Score your setups before entering: 5/5 factors = full risk (1–2%). 3/5 = half risk. Under 3 = no trade. Systemize your selectivity.</div>`,
  mission: "This chart stacks three signals in one zone: trend direction, prior structure, and the fib golden pocket — plus a trigger candle. Read the confluence and trade it.",
  hint: "Everything points the same way: the overall trend, the yellow structure level price returned to, and the 61.8% fib. Trade in the direction of the original trend/impulse.",
  quiz: [
    { q: "Confluence means…", a: ["Using the most indicators possible", "Multiple independent reasons pointing at the same zone and direction", "Trading every session", "Copying another trader"], c: 1 },
    { q: "You find 2 of your 5 checklist factors. The expert move is…", a: ["Full size — feeling lucky", "Half size", "Skip the trade — flat is a position", "Remove the checklist"], c: 2 },
    { q: "Why does confluence improve odds?", a: ["It doesn't", "Different trader groups (trend, structure, fib traders) all act at the same zone", "It guarantees wins", "Because five is a lucky number"], c: 1 },
  ],
},
{
  id: 18, tier: "expert", scenario: "psych",
  title: "Psychology: The Final Boss",
  sub: "The market can't beat you. Only you can.",
  content: `
<h3>Why psychology is the last lesson</h3>
<p>Everything you've learned — structure, levels, patterns, risk — is learnable in weeks. What takes years is <b>executing it while your brain screams at you</b>. The final boss of trading isn't a pattern. It's you, at maximum drawdown, with your finger hovering over the close button.</p>
<h3>The four horsemen</h3>
<ul>
<li><b>Fear</b> — closing winners early, skipping valid setups after a loss. Antidote: position sizes small enough that no single trade <i>matters</i>.</li>
<li><b>Greed</b> — oversizing, moving TPs further mid-trade, overtrading. Antidote: the plan is written <b>before</b> the trade; mid-trade you're an executor, not a strategist.</li>
<li><b>Revenge</b> — doubling size after a loss to "win it back". The fastest way to turn a scratch into a crater. Antidote: a hard daily-loss stop; walk away.</li>
<li><b>Impatience</b> — exiting a healthy trade because it wobbled. Drawdown <b>within your planned risk</b> is not a signal. It's Tuesday.</li>
</ul>
<h3>Process over outcome</h3>
<p>A good trade is one that followed your plan — <b>even if it lost</b>. A bad trade is one that broke your rules — <b>even if it won</b> (those are the most expensive wins of your life: they teach you the wrong lesson). Judge yourself on 100-trade samples, never on one.</p>
<h3>Your final exam</h3>
<p>The setup in this challenge is valid. But the trade will <b>hurt before it works</b> — price will run deep against you, tease your stop, and chop around. Your test: place a sound trade with a sound stop… and <b>let it play out</b>. No panic. Trust the process you've built over 17 levels.</p>
<div class="callout">🏆 Pass this level and you've completed PipQuest. The real market's tuition is expensive — you've just paid it in virtual dollars instead.</div>`,
  mission: "A valid trend-continuation setup — but this trade will draw down HARD before it works. Set a proper SL (not too tight!), and let the trade breathe. Discipline wins this level.",
  hint: "The setup is a normal trend pullback — trade with the trend. But don't tighten your SL below the default: this trade is designed to test a full-size stop before turning. Give it room and let it run.",
  quiz: [
    { q: "You're down 60% of your planned risk mid-trade, but nothing about the setup has changed. You should…", a: ["Close immediately — feelings first", "Double the position to average down", "Let the trade play out to SL or TP as planned", "Remove the SL to avoid being stopped"], c: 2 },
    { q: "A rule-breaking trade that made money is…", a: ["A great trade", "Dangerous — it rewards and reinforces bad process", "Proof rules are useless", "Impossible"], c: 1 },
    { q: "After two losses in a row, the disciplined response is…", a: ["Double size to win it back", "Keep executing the plan at normal size (or stop for the day if at your loss limit)", "Switch strategies immediately", "Trade a random pair for luck"], c: 1 },
  ],
},
];

const LESSON_BY_ID = Object.fromEntries(LESSONS.map(l => [l.id, l]));
