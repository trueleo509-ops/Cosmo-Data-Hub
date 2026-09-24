(() => {
  const KEY = 'intern-logbook-v1';
  const $ = (id) => document.getElementById(id);

  // ---------- State ----------
  const defaults = {
    settings: {
      supervisor: '', target: 20, embed: false,
      interns: [{ name: 'Intern 1', cal: '' }, { name: 'Intern 2', cal: '' }],
      m365: { siteUrl: '', listName: 'Intern Attendance', clientId: '', tenant: '' },
    },
    // { id, spId? (SharePoint item id), intern (0|1), date 'YYYY-MM-DD', in 'HH:MM', out 'HH:MM', hours, sig (dataURL) }
    entries: [],
  };
  let state = load();
  let weekStart = mondayOf(todayISO());
  let syncMsg = '', syncErr = false, busy = false;

  function merge(s) {
    return {
      settings: { ...defaults.settings, ...s.settings, m365: { ...defaults.settings.m365, ...(s.settings || {}).m365 } },
      entries: s.entries || [],
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return merge(JSON.parse(raw));
    } catch (e) { /* storage unavailable: fall back to defaults */ }
    return structuredClone(defaults);
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { alert('Could not save — browser storage is full or blocked. Download a backup.'); }
  }

  // ---------- Date helpers (local time, ISO strings) ----------
  function iso(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  function parse(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
  function todayISO() { return iso(new Date()); }
  function mondayOf(s) { const d = parse(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); }
  function addDays(s, n) { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
  function fmtDate(s) { return parse(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); }
  function fmtTime(t) {
    const [h, m] = t.split(':').map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  }
  function hoursBetween(tin, tout) {
    if (!tin || !tout) return 0;
    const [h1, m1] = tin.split(':').map(Number), [h2, m2] = tout.split(':').map(Number);
    return Math.round(((h2 * 60 + m2) - (h1 * 60 + m1)) / 60 * 100) / 100;
  }
  const h2 = (n) => n.toFixed(2);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function weekEntries(start) {
    const end = addDays(start, 6);
    return state.entries.filter((e) => e.date >= start && e.date <= end)
      .sort((a, b) => (a.date + a.in).localeCompare(b.date + b.in) || a.intern - b.intern);
  }
  function weekTotal(start, intern) {
    return weekEntries(start).filter((e) => e.intern === intern).reduce((s, e) => s + e.hours, 0);
  }
  const pending = () => state.entries.filter((e) => !e.spId);

  // ---------- Render ----------
  function render() {
    const { settings } = state;
    const target = Number(settings.target) || 20;
    $('subtitle').textContent = settings.supervisor
      ? `Supervisor: ${settings.supervisor} · Target ${target} hrs/week per intern`
      : `Daily attendance · Target ${target} hrs/week per intern`;

    renderSync();

    // Intern cards
    $('interns').innerHTML = settings.interns.map((it, i) => {
      const done = weekTotal(weekStart, i);
      const pct = Math.min(100, (done / target) * 100);
      const left = Math.max(0, target - done);
      const hasCal = /^https?:\/\//i.test(it.cal || '');
      return `<div class="card intern">
        <div class="intern-head"><b>${esc(it.name)}</b><span class="muted">${h2(done)} / ${target} hrs</span></div>
        <div class="bar ${done >= target ? 'done' : ''}"><span style="width:${pct}%"></span></div>
        <div class="status ${done >= target ? 'ok' : 'warn'}">${done >= target ? '✓ Weekly hours complete' : `${h2(left)} hrs remaining this week`}</div>
        <div class="row">
          <a class="cal ${hasCal ? '' : 'disabled'}" href="${hasCal ? esc(it.cal) : '#'}" target="_blank" rel="noopener">📅 Open SharePoint calendar</a>
          ${hasCal ? '' : '<span class="muted">Add the link in Settings below</span>'}
        </div>
        ${hasCal && settings.embed ? `<iframe class="cal-embed" src="${esc(it.cal)}" title="${esc(it.name)} calendar"></iframe>` : ''}
      </div>`;
    }).join('');

    // Intern dropdown
    const sel = $('f-intern'), prev = sel.value;
    sel.innerHTML = settings.interns.map((it, i) => `<option value="${i}">${esc(it.name)}</option>`).join('');
    if (prev) sel.value = prev;

    // Week sheet
    const end = addDays(weekStart, 6);
    const showLocal = M365.configured(settings.m365);
    $('wk-label').textContent = `Week of ${fmtDate(weekStart)} – ${fmtDate(end)}`;
    const rows = weekEntries(weekStart);
    const running = [0, 0];
    $('sheet').innerHTML = rows.length ? rows.map((e) => {
      running[e.intern] += e.hours;
      return `<tr>
        <td>${fmtDate(e.date)}${showLocal && !e.spId ? ' <span class="tag" title="Saved on this device only — not yet uploaded to SharePoint">not uploaded</span>' : ''}</td>
        <td>${esc(settings.interns[e.intern]?.name ?? '?')}</td>
        <td>${fmtTime(e.in)}</td><td>${fmtTime(e.out)}</td>
        <td>${e.sig ? `<img src="${esc(e.sig)}" alt="signature">` : '<span class="muted">—</span>'}</td>
        <td class="num">${h2(e.hours)}</td>
        <td class="num">${h2(running[e.intern])} / ${target}</td>
        <td class="no-print"><button class="link" data-del="${esc(e.id)}" title="Delete entry">✕</button></td>
      </tr>`;
    }).join('') : `<tr><td colspan="8" class="empty">No attendance logged for this week yet.</td></tr>`;

    $('sheet-foot').innerHTML = settings.interns.map((it, i) => {
      const t = weekTotal(weekStart, i);
      return `<tr><td colspan="5">Weekly total — ${esc(it.name)}</td>
        <td class="num">${h2(t)}</td>
        <td class="num" style="color:var(${t >= target ? '--ok' : '--warn'})">${t >= target ? 'Complete' : h2(target - t) + ' left'}</td>
        <td class="no-print"></td></tr>`;
    }).join('');

    // Settings form
    $('s-supervisor').value = settings.supervisor;
    $('s-target').value = target;
    $('s-embed').checked = !!settings.embed;
    settings.interns.forEach((it, i) => { $(`s-name-${i}`).value = it.name; $(`s-cal-${i}`).value = it.cal; });
    const m = settings.m365;
    $('s-site').value = m.siteUrl; $('s-list').value = m.listName; $('s-client').value = m.clientId; $('s-tenant').value = m.tenant;
  }

  function renderSync() {
    const m = state.settings.m365, el = $('sync');
    const configured = M365.configured(m), n = pending().length;
    let text, cls;
    if (!configured) { text = '💾 Saved on this device only'; cls = ''; }
    else if (!M365.available()) { text = '⚠️ Open this page from its web address (https) to use SharePoint'; cls = 'warn'; }
    else if (M365.ready) { text = `☁️ SharePoint · ${M365.user}`; cls = 'ok'; }
    else { text = '🔒 Not signed in — entries stay on this device'; cls = 'warn'; }
    if (busy) text = '⏳ ' + (syncMsg || 'Syncing…');
    else if (syncMsg) { text = syncMsg; cls = syncErr ? 'bad' : cls; }
    el.textContent = text;
    el.className = 'pill ' + cls;
    $('btn-signin').hidden = !configured || !M365.available() || M365.ready;
    $('btn-refresh').hidden = !M365.ready;
    $('btn-signout').hidden = !M365.ready;
    $('btn-upload').hidden = !M365.ready || n === 0;
    $('btn-upload').textContent = `⬆ Upload ${n} device entr${n === 1 ? 'y' : 'ies'}`;
    $('m365-file-warn').hidden = M365.available();
  }

  function status(msg, isErr = false) { syncMsg = msg; syncErr = isErr; renderSync(); }

  // ---------- SharePoint sync ----------
  async function withBusy(label, fn) {
    if (busy) return;
    busy = true; status(label);
    try { await fn(); syncMsg = ''; }
    catch (e) { console.error(e); syncMsg = '⚠️ ' + friendly(e); syncErr = true; }
    finally { busy = false; render(); }
  }
  function friendly(e) {
    if (e.errorCode === 'user_cancelled' || e.errorCode === 'popup_window_error') return 'Sign-in was cancelled or the popup was blocked.';
    if (e.status === 401 || e.status === 403) return 'Access denied — check the app permissions and that you can edit the SharePoint site.';
    if (e.status === 404) return 'SharePoint site not found — check the site URL in Settings.';
    return e.message || String(e);
  }

  async function connect({ interactive }) {
    const m = state.settings.m365;
    if (!M365.configured(m) || !M365.available()) { render(); return; }
    await withBusy('Connecting to SharePoint…', async () => {
      let signedIn = await M365.init(m);
      if (!signedIn && interactive) { await M365.signIn(); signedIn = true; }
      if (!signedIn) return;
      const found = await M365.resolve(m);
      if (!found.list) {
        if (!interactive || !confirm(`There is no list called "${m.listName}" on the "${found.site}" site yet.\n\nCreate it now? (Needs permission to manage the site.)`)) {
          throw new Error(`List "${m.listName}" not found on "${found.site}".`);
        }
        await M365.createList(m);
      }
      await pull();
    });
  }

  async function pull() {
    if (!M365.ready) return;
    const remote = await M365.load();
    remote.forEach((e) => { e.hours = hoursBetween(e.in, e.out) || e.hours; });
    state.entries = remote.concat(pending());
    save();
  }

  const refresh = () => withBusy('Refreshing…', pull);

  // ---------- Signature pad ----------
  const canvas = $('sig'), ctx = canvas.getContext('2d');
  let drawing = false, signed = false, ink = null; // ink = bounding box of strokes (CSS px)
  function sizeCanvas() {
    const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    ctx.scale(dpr, dpr); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#111';
    signed = false; ink = null;
  }
  function pos(ev) {
    const r = canvas.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
    ink = ink ? { x0: Math.min(ink.x0, x), y0: Math.min(ink.y0, y), x1: Math.max(ink.x1, x), y1: Math.max(ink.y1, y) } : { x0: x, y0: y, x1: x, y1: y };
    return [x, y];
  }
  canvas.addEventListener('pointerdown', (ev) => { drawing = true; canvas.setPointerCapture(ev.pointerId); ctx.beginPath(); ctx.moveTo(...pos(ev)); });
  canvas.addEventListener('pointermove', (ev) => { if (!drawing) return; ctx.lineTo(...pos(ev)); ctx.stroke(); signed = true; });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => canvas.addEventListener(t, () => { drawing = false; }));
  $('sig-clear').onclick = sizeCanvas;
  window.addEventListener('resize', () => { if (!signed) sizeCanvas(); });

  function signatureData() {
    // Crop to the drawn area and downscale (keeping proportions) to keep storage small
    const W = 240, H = 70, pad = 4, dpr = canvas.width / canvas.getBoundingClientRect().width;
    const sx = Math.max(0, ink.x0 - pad) * dpr, sy = Math.max(0, ink.y0 - pad) * dpr;
    const sw = Math.min(canvas.width - sx, (ink.x1 - ink.x0 + pad * 2) * dpr), sh = Math.min(canvas.height - sy, (ink.y1 - ink.y0 + pad * 2) * dpr);
    const k = Math.min(W / sw, H / sh), dw = sw * k, dh = sh * k;
    const out = document.createElement('canvas'); out.width = W; out.height = H;
    const o = out.getContext('2d'); o.fillStyle = '#fff'; o.fillRect(0, 0, W, H);
    o.drawImage(canvas, sx, sy, sw, sh, (W - dw) / 2, (H - dh) / 2, dw, dh);
    return out.toDataURL('image/png');
  }

  // ---------- Entry form ----------
  const updatePreview = () => { $('f-hours').textContent = h2(Math.max(0, hoursBetween($('f-in').value, $('f-out').value))); };
  $('f-in').oninput = $('f-out').oninput = updatePreview;

  $('entry').onsubmit = async (ev) => {
    ev.preventDefault();
    const msg = $('f-msg'), btn = ev.submitter;
    const intern = Number($('f-intern').value), date = $('f-date').value, tin = $('f-in').value, tout = $('f-out').value;
    const hours = hoursBetween(tin, tout);
    if (hours <= 0) { msg.textContent = '⚠️ Time out must be after time in.'; return; }
    if (!signed) { msg.textContent = '⚠️ Please sign before saving.'; return; }
    if (M365.ready) { try { await pull(); } catch (e) { /* offline: check against what we have */ } }
    if (state.entries.some((e) => e.intern === intern && e.date === date && tin < e.out && tout > e.in)) {
      msg.textContent = '⚠️ This overlaps an existing entry for that intern on that day.'; render(); return;
    }
    const entry = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), intern, date, in: tin, out: tout, hours, sig: signatureData() };
    const name = state.settings.interns[intern].name;
    let where = '';
    if (M365.ready) {
      if (btn) btn.disabled = true;
      try { entry.spId = await M365.add(entry, name); entry.id = 'sp' + entry.spId; where = ' to SharePoint'; }
      catch (e) { where = ` on this device only (SharePoint said: ${friendly(e)}). Use “Upload” later.`; }
      finally { if (btn) btn.disabled = false; }
    }
    state.entries.push(entry);
    save();
    weekStart = mondayOf(date);
    $('f-in').value = ''; $('f-out').value = ''; updatePreview(); sizeCanvas();
    const total = weekTotal(weekStart, intern), target = Number(state.settings.target) || 20;
    msg.textContent = `✓ Saved${where}. ${name}: ${h2(total)} of ${target} hrs this week.`;
    render();
  };

  $('sheet').onclick = async (ev) => {
    const id = ev.target.dataset?.del;
    if (!id) return;
    const entry = state.entries.find((e) => e.id === id);
    if (!entry) return;
    if (entry.spId && !M365.ready) { alert('This entry is stored in SharePoint. Sign in to delete it.'); return; }
    if (!confirm(entry.spId ? 'Delete this entry from SharePoint for everyone?' : 'Delete this entry?')) return;
    if (entry.spId) {
      try { await M365.remove(entry.spId); }
      catch (e) { if (e.status !== 404) { status('⚠️ ' + friendly(e), true); return; } }
    }
    state.entries = state.entries.filter((e) => e !== entry);
    save(); render();
  };

  // ---------- Week navigation ----------
  $('wk-prev').onclick = () => { weekStart = addDays(weekStart, -7); render(); };
  $('wk-next').onclick = () => { weekStart = addDays(weekStart, 7); render(); };
  $('wk-today').onclick = () => { weekStart = mondayOf(todayISO()); render(); };

  // ---------- Settings ----------
  function readSettingsForm() {
    const s = state.settings;
    s.supervisor = $('s-supervisor').value.trim();
    s.target = Math.max(1, Number($('s-target').value) || 20);
    s.embed = $('s-embed').checked;
    s.interns = [0, 1].map((i) => ({ name: $(`s-name-${i}`).value.trim() || `Intern ${i + 1}`, cal: $(`s-cal-${i}`).value.trim() }));
    s.m365 = {
      siteUrl: $('s-site').value.trim(), listName: $('s-list').value.trim() || 'Intern Attendance',
      clientId: $('s-client').value.trim(), tenant: $('s-tenant').value.trim(),
    };
    save();
  }
  $('settings').onsubmit = (ev) => {
    ev.preventDefault();
    readSettingsForm();
    $('settings-box').open = false;
    render();
    connect({ interactive: ev.submitter?.id === 's-connect' });
  };

  // Share the same setup (names, calendar links, SharePoint connection) with the interns.
  $('btn-share').onclick = async () => {
    readSettingsForm();
    const s = state.settings;
    const payload = { supervisor: s.supervisor, target: s.target, embed: s.embed, interns: s.interns, m365: s.m365 };
    const link = location.href.split('#')[0] + '#setup=' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    try { await navigator.clipboard.writeText(link); alert('Setup link copied. Send it to the interns — opening it fills in these settings for them.'); }
    catch { prompt('Copy this setup link and send it to the interns:', link); }
  };
  function applySetupLink() {
    const m = location.hash.match(/^#setup=(.+)$/);
    if (!m) return;
    try {
      const s = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
      state.settings = merge({ settings: { ...state.settings, ...s } }).settings;
      save();
    } catch (e) { alert('That setup link is damaged — ask your supervisor to send it again.'); }
    history.replaceState(null, '', location.pathname + location.search);
  }

  // ---------- Header actions ----------
  $('btn-signin').onclick = () => connect({ interactive: true });
  $('btn-refresh').onclick = refresh;
  $('btn-signout').onclick = async () => {
    await M365.signOut();
    state.entries = pending(); // SharePoint entries are not kept on a signed-out device
    save(); status(''); render();
  };
  $('btn-upload').onclick = () => withBusy('Uploading…', async () => {
    const list = pending();
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      status(`Uploading ${i + 1} of ${list.length}…`);
      e.spId = await M365.add(e, state.settings.interns[e.intern]?.name ?? `Intern ${e.intern + 1}`);
      e.id = 'sp' + e.spId;
      save();
    }
    await pull();
  });

  // ---------- Export / backup ----------
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  $('btn-export').onclick = () => {
    const target = Number(state.settings.target) || 20;
    const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [['Week of', 'Date', 'Intern', 'Time in', 'Time out', 'Signed', 'Hours', 'Week to date', 'Weekly target'].map(q).join(',')];
    const sorted = [...state.entries].sort((a, b) => (a.date + a.in).localeCompare(b.date + b.in));
    const running = {};
    for (const e of sorted) {
      const wk = mondayOf(e.date), k = wk + '|' + e.intern;
      running[k] = (running[k] || 0) + e.hours;
      lines.push([wk, e.date, state.settings.interns[e.intern]?.name ?? '?', e.in, e.out, e.sig ? 'Yes' : 'No', h2(e.hours), h2(running[k]), target].map(q).join(','));
    }
    download(`intern-logbook-${todayISO()}.csv`, '﻿' + lines.join('\r\n'), 'text/csv');
  };
  $('btn-print').onclick = () => window.print();
  $('btn-backup').onclick = () => download(`intern-logbook-backup-${todayISO()}.json`, JSON.stringify(state), 'application/json');
  $('btn-restore').onchange = async (ev) => {
    const f = ev.target.files[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!Array.isArray(data.entries)) throw new Error('bad file');
      if (!confirm(`Replace current data with backup (${data.entries.length} entries)?`)) return;
      state = merge(data);
      save(); render();
      if (M365.ready) refresh(); // SharePoint stays the source of truth for uploaded entries
    } catch { alert('That file is not a valid logbook backup.'); }
    ev.target.value = '';
  };

  // ---------- Init ----------
  applySetupLink();
  $('f-date').value = todayISO();
  render();
  sizeCanvas();
  if (!M365.configured(state.settings.m365)) $('settings-box').open = state.entries.length === 0;
  connect({ interactive: false });
  // Pick up entries logged by others when the tab comes back into view, and every few minutes while open.
  document.addEventListener('visibilitychange', () => { if (!document.hidden && M365.ready) refresh(); });
  setInterval(() => { if (!document.hidden && M365.ready) refresh(); }, 3 * 60 * 1000);
})();
