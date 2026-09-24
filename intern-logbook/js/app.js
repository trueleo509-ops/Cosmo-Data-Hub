/* Intern Logbook — attendance & weekly hours for one supervisor and two interns.
   All data lives in this browser's localStorage. */

const STORE_KEY = 'internLogbook.v1';
const $ = (sel, root = document) => root.querySelector(sel);

// ---------- state ----------

let db = load();
let session = null;     // { role: 'supervisor' } | { role: 'intern', id }
let weekOffset = 0;     // 0 = current week, -1 = last week, ...
let pendingIntern = null;

function load() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null; }
  catch { return null; }
}
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(db)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// ---------- date & time helpers ----------

const pad = n => String(n).padStart(2, '0');
const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const nowTime = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const parseDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

function weekRange(offset) {
  // Weeks run Monday–Sunday
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow + offset * 7);
  const end = new Date(d);
  end.setDate(d.getDate() + 6);
  return { start: isoDate(d), end: isoDate(end), startD: d, endD: end };
}

function fmtDate(s, opts = { weekday: 'short', month: 'short', day: 'numeric' }) {
  return parseDate(s).toLocaleDateString(undefined, opts);
}
function fmtTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${(h % 12) || 12}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
}
function hoursWorked(e) {
  if (!e.timeIn || !e.timeOut) return 0;
  const [h1, m1] = e.timeIn.split(':').map(Number);
  const [h2, m2] = e.timeOut.split(':').map(Number);
  const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  return mins > 0 ? mins / 60 : 0;
}
const fmtHours = h => `${(Math.round(h * 100) / 100).toFixed(2)} h`;

function weekLabel(offset) {
  const r = weekRange(offset);
  const opts = { month: 'short', day: 'numeric' };
  return `${r.startD.toLocaleDateString(undefined, opts)} – ${r.endD.toLocaleDateString(undefined, { ...opts, year: 'numeric' })}`;
}

function entriesFor(internId, offset) {
  const r = weekRange(offset);
  return db.entries
    .filter(e => (!internId || e.internId === internId) && e.date >= r.start && e.date <= r.end)
    .sort((a, b) => (a.date + a.timeIn).localeCompare(b.date + b.timeIn));
}
const weekTotal = (internId, offset) => entriesFor(internId, offset).reduce((s, e) => s + hoursWorked(e), 0);
const intern = id => db.interns.find(i => i.id === id);

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- views ----------

function show(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
  const loggedIn = !!session;
  $('#btn-logout').classList.toggle('hidden', !loggedIn);
  $('#who').textContent = !loggedIn ? '' :
    session.role === 'supervisor' ? `Supervisor · ${db.supervisor.name}` : `Intern · ${intern(session.id).name}`;
}

function route() {
  if (!db) return show('setup');
  if (!session) { renderLogin(); return show('login'); }
  if (session.role === 'supervisor') { renderSupervisor(); return show('supervisor'); }
  renderIntern();
  show('intern');
}

// ---------- setup ----------

$('#form-setup').addEventListener('submit', ev => {
  ev.preventDefault();
  const f = new FormData(ev.target);
  db = {
    supervisor: { name: f.get('supName').trim(), pin: f.get('supPin') },
    target: Number(f.get('target')) || 20,
    interns: [f.get('intern1'), f.get('intern2')].map(n => ({ id: uid(), name: n.trim(), pin: null, signature: null })),
    entries: []
  };
  save();
  route();
});

// ---------- login ----------

let loginTarget = null;

function renderLogin() {
  loginTarget = null;
  $('#form-login').classList.add('hidden');
  $('#login-people').classList.remove('hidden');
  const people = [{ key: 'sup', name: db.supervisor.name, role: 'Supervisor' },
    ...db.interns.map(i => ({ key: i.id, name: i.name, role: i.signature ? 'Intern' : 'Intern · first login' }))];
  $('#login-people').innerHTML = people.map(p =>
    `<button data-key="${p.key}"><b>${esc(p.name)}</b><span class="role">${p.role}</span></button>`).join('');
}

$('#login-people').addEventListener('click', ev => {
  const btn = ev.target.closest('button');
  if (!btn) return;
  const key = btn.dataset.key;
  if (key !== 'sup' && !intern(key).pin) {
    // First login for this intern: register PIN + signature
    pendingIntern = intern(key);
    $('#reg-name').textContent = pendingIntern.name;
    $('#form-register').reset();
    $('#reg-error').textContent = '';
    show('register');
    sigPad.resize();
    sigPad.clear();
    return;
  }
  loginTarget = key;
  $('#login-hint').textContent = `Logging in as ${key === 'sup' ? db.supervisor.name : intern(key).name}`;
  $('#login-error').textContent = '';
  $('#form-login').reset();
  $('#login-people').classList.add('hidden');
  $('#form-login').classList.remove('hidden');
  $('#form-login [name=pin]').focus();
});

$('#login-back').addEventListener('click', renderLogin);

$('#form-login').addEventListener('submit', ev => {
  ev.preventDefault();
  const pin = new FormData(ev.target).get('pin');
  const expected = loginTarget === 'sup' ? db.supervisor.pin : intern(loginTarget).pin;
  if (pin !== expected) { $('#login-error').textContent = 'Incorrect PIN.'; return; }
  session = loginTarget === 'sup' ? { role: 'supervisor' } : { role: 'intern', id: loginTarget };
  weekOffset = 0;
  route();
});

$('#btn-logout').addEventListener('click', () => { session = null; route(); });

// ---------- signature pad ----------

const sigPad = (() => {
  const canvas = $('#sig-pad');
  const ctx = canvas.getContext('2d');
  let drawing = false, dirty = false, last = null;

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = r.width * ratio;
    canvas.height = r.height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111a2e';
  }
  function pos(ev) {
    const r = canvas.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }
  canvas.addEventListener('pointerdown', ev => {
    drawing = true;
    last = pos(ev);
    canvas.setPointerCapture(ev.pointerId);
    ctx.beginPath();
    ctx.arc(last.x, last.y, 1, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    dirty = true;
  });
  canvas.addEventListener('pointermove', ev => {
    if (!drawing) return;
    const p = pos(ev);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => canvas.addEventListener(t, () => { drawing = false; }));

  return {
    resize,
    clear() { ctx.clearRect(0, 0, canvas.width, canvas.height); dirty = false; },
    isEmpty: () => !dirty,
    toDataURL: () => canvas.toDataURL('image/png')
  };
})();

$('#sig-clear').addEventListener('click', () => sigPad.clear());
$('#reg-cancel').addEventListener('click', () => { pendingIntern = null; route(); });

$('#form-register').addEventListener('submit', ev => {
  ev.preventDefault();
  const f = new FormData(ev.target);
  if (f.get('pin') !== f.get('pin2')) { $('#reg-error').textContent = 'PINs do not match.'; return; }
  if (sigPad.isEmpty()) { $('#reg-error').textContent = 'Please add your signature.'; return; }
  pendingIntern.pin = f.get('pin');
  pendingIntern.signature = sigPad.toDataURL();
  save();
  session = { role: 'intern', id: pendingIntern.id };
  pendingIntern = null;
  weekOffset = 0;
  route();
});

// ---------- shared rendering ----------

function progressHTML(total) {
  const target = db.target;
  const pct = Math.min(100, (total / target) * 100);
  const done = total >= target;
  const remaining = Math.max(0, target - total);
  return `
    <div class="hours-big">${fmtHours(total)} <small>of ${target} h</small></div>
    <div class="progress ${done ? 'done' : ''}"><div style="width:${pct}%"></div></div>
    <div class="small">${done
      ? `<span class="badge good">Target met</span>${total > target ? ` <span class="muted">+${fmtHours(total - target)} over</span>` : ''}`
      : `<span class="badge warn">${fmtHours(remaining)} remaining</span>`}</div>`;
}

function sigCell(e) {
  const i = intern(e.internId);
  if (e.signed && i?.signature) return `<img class="sig" src="${i.signature}" alt="signed by ${esc(i.name)}">`;
  return '<span class="badge bad">Unsigned</span>';
}

function tableHTML(entries, { showIntern, actions }) {
  if (!entries.length) return '<p class="empty">No entries for this week.</p>';
  const total = entries.reduce((s, e) => s + hoursWorked(e), 0);
  const rows = entries.map(e => `
    <tr>
      <td>${fmtDate(e.date)}</td>
      ${showIntern ? `<td>${esc(intern(e.internId)?.name)}</td>` : ''}
      <td>${fmtTime(e.timeIn)}</td>
      <td>${e.timeOut ? fmtTime(e.timeOut) : '<span class="badge warn">In progress</span>'}</td>
      <td class="num">${e.timeOut ? fmtHours(hoursWorked(e)) : '—'}</td>
      <td>${sigCell(e)}</td>
      <td class="muted small">${esc(e.note)}</td>
      ${actions ? `<td>${actions(e)}</td>` : ''}
    </tr>`).join('');
  const cols = showIntern ? 4 : 3;
  return `<div class="table-wrap"><table>
    <thead><tr><th>Date</th>${showIntern ? '<th>Intern</th>' : ''}<th>Time in</th><th>Time out</th>
      <th class="num">Hours</th><th>Signature</th><th>Note</th>${actions ? '<th></th>' : ''}</tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td colspan="${cols}">Week total</td><td class="num">${fmtHours(total)}</td><td colspan="${actions ? 3 : 2}"></td></tr></tfoot>
  </table></div>`;
}

document.querySelectorAll('[data-week]').forEach(b => b.addEventListener('click', () => {
  weekOffset = Math.min(0, weekOffset + Number(b.dataset.week));
  route();
}));

// ---------- intern dashboard ----------

function openEntryToday(id) {
  const today = isoDate(new Date());
  return db.entries.find(e => e.internId === id && e.date === today && !e.timeOut);
}

function renderIntern() {
  const me = intern(session.id);
  const today = isoDate(new Date());
  const open = openEntryToday(me.id);
  const todays = db.entries.filter(e => e.internId === me.id && e.date === today);

  $('#i-today').textContent = fmtDate(today, { weekday: 'long', month: 'long', day: 'numeric' });
  $('#i-status').innerHTML = open
    ? `🟢 Timed in at <b>${fmtTime(open.timeIn)}</b>`
    : todays.length
      ? `✅ Done for today — ${fmtHours(todays.reduce((s, e) => s + hoursWorked(e), 0))} logged`
      : '⚪ Not timed in yet';
  $('#btn-timein').disabled = !!open;
  $('#btn-timeout').disabled = !open;

  $('#i-week').innerHTML = progressHTML(weekTotal(me.id, 0));
  $('#i-sig').src = me.signature;

  $('#i-weeklabel').textContent = weekLabel(weekOffset);
  $('#view-intern [data-week="1"]').disabled = weekOffset === 0;
  $('#i-table').innerHTML = tableHTML(entriesFor(me.id, weekOffset), {
    showIntern: false,
    actions: e => e.signed ? '' : `<button class="link" data-sign="${e.id}">Sign</button>`
  });
}

$('#btn-timein').addEventListener('click', () => {
  db.entries.push({ id: uid(), internId: session.id, date: isoDate(new Date()), timeIn: nowTime(), timeOut: null, signed: true, note: '' });
  save();
  renderIntern();
});

$('#btn-timeout').addEventListener('click', () => {
  const open = openEntryToday(session.id);
  if (!open) return;
  open.timeOut = nowTime();
  open.signed = true;
  save();
  renderIntern();
});

$('#i-table').addEventListener('click', ev => {
  const id = ev.target.dataset.sign;
  if (!id) return;
  const e = db.entries.find(x => x.id === id);
  if (e && e.internId === session.id) { e.signed = true; save(); renderIntern(); }
});

// ---------- supervisor dashboard ----------

function renderSupervisor() {
  $('#s-weeklabel').textContent = weekLabel(weekOffset);
  $('#view-supervisor [data-week="1"]').disabled = weekOffset === 0;
  $('#s-thisweek').classList.toggle('hidden', weekOffset === 0);

  $('#s-summary').innerHTML = db.interns.map(i => {
    const entries = entriesFor(i.id, weekOffset);
    const days = new Set(entries.map(e => e.date)).size;
    const unsigned = entries.filter(e => !e.signed).length;
    return `<div class="summary-card">
      <h3>${esc(i.name)} ${i.signature ? '' : '<span class="badge warn">Not registered</span>'}</h3>
      ${progressHTML(weekTotal(i.id, weekOffset))}
      <p class="muted small">${days} day${days === 1 ? '' : 's'} attended${unsigned ? ` · <span class="badge bad">${unsigned} unsigned</span>` : ''}</p>
    </div>`;
  }).join('');

  $('#s-table').innerHTML = tableHTML(entriesFor(null, weekOffset), {
    showIntern: true,
    actions: e => `<button class="link" data-edit="${e.id}">Edit</button><button class="link bad" data-del="${e.id}">Delete</button>`
  });

  $('#form-settings [name=target]').value = db.target;
  $('#s-interns').innerHTML = '<h3 class="small">Interns</h3>' + db.interns.map(i => `
    <div class="intern-row">
      <b>${esc(i.name)}</b>
      ${i.signature ? `<img class="sig" src="${i.signature}" alt="">` : '<span class="muted">not registered yet</span>'}
      ${i.pin ? `<button class="link" data-reset="${i.id}">Reset PIN &amp; signature</button>` : ''}
    </div>`).join('');
}

$('#s-thisweek').addEventListener('click', () => { weekOffset = 0; route(); });

$('#s-table').addEventListener('click', ev => {
  const { edit, del } = ev.target.dataset;
  if (edit) openEntryDialog(db.entries.find(e => e.id === edit));
  if (del && confirm('Delete this entry?')) {
    db.entries = db.entries.filter(e => e.id !== del);
    save();
    renderSupervisor();
  }
});

$('#s-interns').addEventListener('click', ev => {
  const i = intern(ev.target.dataset.reset);
  if (!i || !confirm(`Reset ${i.name}'s PIN and signature? They'll set new ones at their next login.`)) return;
  i.pin = null;
  i.signature = null;
  save();
  renderSupervisor();
});

$('#form-settings').addEventListener('submit', ev => {
  ev.preventDefault();
  db.target = Number(new FormData(ev.target).get('target')) || 20;
  save();
  renderSupervisor();
});

$('#s-wipe').addEventListener('click', () => {
  if (!confirm('Erase ALL logbook data (people, signatures and attendance)? This cannot be undone.')) return;
  localStorage.removeItem(STORE_KEY);
  db = null;
  session = null;
  route();
});

$('#s-add').addEventListener('click', () => openEntryDialog(null));
$('#s-print').addEventListener('click', () => window.print());

$('#s-csv').addEventListener('click', () => {
  const header = ['Date', 'Intern', 'Time in', 'Time out', 'Hours', 'Signed', 'Note'];
  const rows = [...db.entries]
    .sort((a, b) => (a.date + a.timeIn).localeCompare(b.date + b.timeIn))
    .map(e => [e.date, intern(e.internId)?.name, e.timeIn, e.timeOut || '', hoursWorked(e).toFixed(2), e.signed ? 'Yes' : 'No', e.note || '']);
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `intern-logbook-${isoDate(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
});

// ---------- entry dialog ----------

const dlg = $('#dlg-entry');
let editing = null;

function openEntryDialog(entry) {
  editing = entry;
  const f = $('#form-entry');
  f.reset();
  f.internId.innerHTML = db.interns.map(i => `<option value="${i.id}">${esc(i.name)}</option>`).join('');
  $('#dlg-title').textContent = entry ? 'Edit entry' : 'Add entry';
  $('#dlg-error').textContent = '';
  f.internId.value = entry?.internId || db.interns[0].id;
  f.date.value = entry?.date || isoDate(new Date());
  f.timeIn.value = entry?.timeIn || '';
  f.timeOut.value = entry?.timeOut || '';
  f.note.value = entry?.note || '';
  dlg.showModal();
}

$('#dlg-cancel').addEventListener('click', () => dlg.close());

$('#form-entry').addEventListener('submit', ev => {
  ev.preventDefault();
  const f = ev.target;
  const data = {
    internId: f.internId.value,
    date: f.date.value,
    timeIn: f.timeIn.value,
    timeOut: f.timeOut.value || null,
    note: f.note.value.trim()
  };
  if (data.timeOut && data.timeOut <= data.timeIn) {
    $('#dlg-error').textContent = 'Time out must be after time in.';
    return;
  }
  if (editing) {
    // Changing who/when/how long voids the intern's signature
    const changed = ['internId', 'date', 'timeIn', 'timeOut'].some(k => editing[k] !== data[k]);
    Object.assign(editing, data);
    if (changed) editing.signed = false;
  } else {
    db.entries.push({ id: uid(), ...data, signed: false });
  }
  save();
  dlg.close();
  renderSupervisor();
});

// ---------- boot ----------

route();
