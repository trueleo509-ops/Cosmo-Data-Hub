const form = document.getElementById("search-form");
const locationInput = document.getElementById("location");
const radiusSelect = document.getElementById("radius");
const searchBtn = document.getElementById("search-btn");
const demoBtn = document.getElementById("demo-btn");
const statusBox = document.getElementById("status");
const resultsSection = document.getElementById("results");
const resultsTitle = document.getElementById("results-title");
const leadList = document.getElementById("lead-list");
const exportBtn = document.getElementById("export-btn");

let currentLeads = [];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  fetchLeads({ location: locationInput.value.trim(), radius: radiusSelect.value });
});

demoBtn.addEventListener("click", () => fetchLeads({ demo: "1" }));

exportBtn.addEventListener("click", exportCsv);

async function fetchLeads(params) {
  setBusy(true);
  showStatus("Searching for businesses… this can take up to a minute for large areas.");
  resultsSection.hidden = true;

  try {
    const qs = new URLSearchParams(params);
    const resp = await fetch(`/api/leads?${qs}`);
    const data = await resp.json();

    if (!resp.ok) {
      showStatus(data.error || "Something went wrong.", "error");
      return;
    }

    currentLeads = data.leads;
    renderResults(data);

    if (data.notice) {
      showStatus(data.notice, "notice");
    } else if (data.demo) {
      showStatus("Showing sample data (demo mode).", "notice");
    } else if (data.count === 0) {
      showStatus("No promising leads found here — try a bigger radius or a nearby town.", "notice");
    } else {
      hideStatus();
    }
  } catch (err) {
    showStatus("Could not reach the server. Is the app running?", "error");
  } finally {
    setBusy(false);
  }
}

function renderResults(data) {
  resultsTitle.textContent =
    `${data.count} lead${data.count === 1 ? "" : "s"} near ${data.resolved_location}`;
  leadList.innerHTML = "";

  data.leads.forEach((lead, i) => {
    const li = document.createElement("li");
    li.className = "lead";

    const scoreClass = lead.score >= 70 ? "score-hi" : lead.score >= 45 ? "score-md" : "score-lo";

    const nameHtml = lead.website
      ? `<a href="${escapeAttr(lead.website)}" target="_blank" rel="noopener">${escapeHtml(lead.name)}</a>`
      : escapeHtml(lead.name);

    const contacts = [];
    if (lead.email) contacts.push(`<a href="mailto:${escapeAttr(lead.email)}">✉ ${escapeHtml(lead.email)}</a>`);
    if (lead.phone) contacts.push(`<span>☎ ${escapeHtml(lead.phone)}</span>`);
    if (lead.address) contacts.push(`<span>📍 ${escapeHtml(lead.address)}</span>`);
    if (lead.lat && lead.lon) {
      contacts.push(`<a href="https://www.openstreetmap.org/?mlat=${lead.lat}&mlon=${lead.lon}#map=18/${lead.lat}/${lead.lon}" target="_blank" rel="noopener">🗺 Map</a>`);
    }

    li.innerHTML = `
      <div class="rank">${i + 1}</div>
      <div class="name">${nameHtml}</div>
      <div class="scorebox">
        <div class="score-num">${lead.score}</div>
        <div class="score-bar ${scoreClass}"><span style="width:${lead.score}%"></span></div>
      </div>
      <div class="meta">${escapeHtml(lead.category_label || "")}</div>
      <div class="contacts">${contacts.join("")}</div>
      <ul class="reasons">${lead.reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
    `;
    leadList.appendChild(li);
  });

  resultsSection.hidden = false;
}

function exportCsv() {
  if (!currentLeads.length) return;
  const headers = ["rank", "score", "name", "category", "email", "phone", "website", "address", "why"];
  const rows = currentLeads.map((l, i) => [
    i + 1, l.score, l.name, l.category_label || "", l.email || "",
    l.phone || "", l.website || "", l.address || "", l.reasons.join(" | "),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leads.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function setBusy(busy) {
  searchBtn.disabled = busy;
  demoBtn.disabled = busy;
  searchBtn.textContent = busy ? "Searching…" : "Find leads";
}

function showStatus(msg, kind = "") {
  statusBox.textContent = msg;
  statusBox.className = kind;
  statusBox.hidden = false;
}

function hideStatus() {
  statusBox.hidden = true;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function escapeAttr(s) {
  return escapeHtml(s);
}
