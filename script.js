/* =========================================================================
   GoalHub EU — World Cup hub
   - Renders sample data out of the box so the site works immediately.
   - To go LIVE with real scores: see CONFIG.api below + README.md.
   ========================================================================= */

const CONFIG = {
  // ---- Live data (optional) -------------------------------------------------
  // Free options: football-data.org (v4) or API-Football (api-sports.io).
  // Browsers can't safely hold API keys, so route through a tiny serverless
  // proxy (see README). Set `enabled: true` and point `endpoint` at your proxy.
  api: {
    enabled: true,
    endpoint: "/api/worldcup", // served by server.js (football-data.org proxy)
  },
  // ---- AdSense --------------------------------------------------------------
  adsensePubId: "ca-pub-XXXXXXXXXXXXXXXX", // also replace in index.html
};

/* ---------- EU broadcaster guide (official, legal rights-holders) ---------- */
/* Update each tournament — rights change. Links go to official providers. */
const EU_BROADCASTERS = [
  { code: "gb", flag: "🇬🇧", country: "United Kingdom", name: "BBC iPlayer / ITVX", url: "https://www.bbc.co.uk/iplayer" },
  { code: "de", flag: "🇩🇪", country: "Germany", name: "ARD / ZDF / MagentaTV", url: "https://www.ardmediathek.de" },
  { code: "fr", flag: "🇫🇷", country: "France", name: "TF1 / beIN Sports", url: "https://www.tf1.fr" },
  { code: "es", flag: "🇪🇸", country: "Spain", name: "RTVE / Gol Mundial", url: "https://www.rtve.es" },
  { code: "it", flag: "🇮🇹", country: "Italy", name: "Rai Play", url: "https://www.raiplay.it" },
  { code: "nl", flag: "🇳🇱", country: "Netherlands", name: "NOS", url: "https://nos.nl" },
  { code: "pt", flag: "🇵🇹", country: "Portugal", name: "RTP / SPORT TV", url: "https://www.rtp.pt" },
  { code: "be", flag: "🇧🇪", country: "Belgium", name: "RTBF / VRT", url: "https://www.rtbf.be" },
  { code: "pl", flag: "🇵🇱", country: "Poland", name: "TVP Sport", url: "https://sport.tvp.pl" },
  { code: "se", flag: "🇸🇪", country: "Sweden", name: "SVT Play / TV4", url: "https://www.svtplay.se" },
  { code: "no", flag: "🇳🇴", country: "Norway", name: "NRK / TV 2", url: "https://tv.nrk.no" },
  { code: "dk", flag: "🇩🇰", country: "Denmark", name: "DR / TV 2", url: "https://www.dr.dk/drtv" },
  { code: "ch", flag: "🇨🇭", country: "Switzerland", name: "SRF / RTS", url: "https://www.srf.ch" },
  { code: "at", flag: "🇦🇹", country: "Austria", name: "ORF ON", url: "https://on.orf.at" },
  { code: "ie", flag: "🇮🇪", country: "Ireland", name: "RTÉ Player", url: "https://www.rte.ie/player" },
  { code: "gr", flag: "🇬🇷", country: "Greece", name: "ERT", url: "https://www.ertflix.gr" },
];

/* ---------- Sample fixtures (fallback / demo) ---------- */
const SAMPLE_MATCHES = [
  { stage: "Group", group: "A", home: "Spain", hflag: "🇪🇸", away: "Croatia", aflag: "🇭🇷", hs: 2, as: 1, status: "live", minute: "67'", time: "Today 18:00" },
  { stage: "Group", group: "B", home: "England", hflag: "🇬🇧", away: "Netherlands", aflag: "🇳🇱", hs: 1, as: 1, status: "live", minute: "54'", time: "Today 18:00" },
  { stage: "Group", group: "C", home: "France", hflag: "🇫🇷", away: "Denmark", aflag: "🇩🇰", hs: null, as: null, status: "up", time: "Today 21:00" },
  { stage: "Group", group: "D", home: "Germany", hflag: "🇩🇪", away: "Portugal", aflag: "🇵🇹", hs: null, as: null, status: "up", time: "Today 21:00" },
  { stage: "Group", group: "A", home: "Italy", hflag: "🇮🇹", away: "Belgium", aflag: "🇧🇪", hs: 0, as: 2, status: "ft", time: "Yesterday" },
  { stage: "Round of 16", home: "Brazil", hflag: "🇧🇷", away: "Argentina", aflag: "🇦🇷", hs: null, as: null, status: "up", time: "Sat 20:00" },
  { stage: "Quarter-final", home: "Winner R16-1", hflag: "🏳️", away: "Winner R16-2", aflag: "🏳️", hs: null, as: null, status: "up", time: "TBD" },
  { stage: "Semi-final", home: "TBD", hflag: "🏳️", away: "TBD", aflag: "🏳️", hs: null, as: null, status: "up", time: "TBD" },
  { stage: "Final", home: "TBD", hflag: "🏳️", away: "TBD", aflag: "🏳️", hs: null, as: null, status: "up", time: "Jul 19, 20:00" },
];

/* ---------- Sample standings ---------- */
const SAMPLE_GROUPS = [
  { name: "Group A", rows: [
    { t: "Spain", flag: "🇪🇸", p: 3, w: 2, d: 1, l: 0, gd: "+4", pts: 7 },
    { t: "Italy", flag: "🇮🇹", p: 3, w: 2, d: 0, l: 1, gd: "+2", pts: 6 },
    { t: "Croatia", flag: "🇭🇷", p: 3, w: 1, d: 0, l: 2, gd: "-1", pts: 3 },
    { t: "Belgium", flag: "🇧🇪", p: 3, w: 0, d: 1, l: 2, gd: "-5", pts: 1 },
  ]},
  { name: "Group B", rows: [
    { t: "England", flag: "🇬🇧", p: 3, w: 2, d: 1, l: 0, gd: "+5", pts: 7 },
    { t: "Netherlands", flag: "🇳🇱", p: 3, w: 2, d: 1, l: 0, gd: "+3", pts: 7 },
    { t: "Senegal", flag: "🇸🇳", p: 3, w: 1, d: 0, l: 2, gd: "-2", pts: 3 },
    { t: "Ecuador", flag: "🇪🇨", p: 3, w: 0, d: 0, l: 3, gd: "-6", pts: 0 },
  ]},
  { name: "Group C", rows: [
    { t: "France", flag: "🇫🇷", p: 3, w: 3, d: 0, l: 0, gd: "+6", pts: 9 },
    { t: "Denmark", flag: "🇩🇰", p: 3, w: 1, d: 1, l: 1, gd: "0", pts: 4 },
    { t: "Mexico", flag: "🇲🇽", p: 3, w: 1, d: 0, l: 2, gd: "-2", pts: 3 },
    { t: "Tunisia", flag: "🇹🇳", p: 3, w: 0, d: 1, l: 2, gd: "-4", pts: 1 },
  ]},
  { name: "Group D", rows: [
    { t: "Germany", flag: "🇩🇪", p: 3, w: 2, d: 0, l: 1, gd: "+3", pts: 6 },
    { t: "Portugal", flag: "🇵🇹", p: 3, w: 2, d: 0, l: 1, gd: "+2", pts: 6 },
    { t: "Japan", flag: "🇯🇵", p: 3, w: 1, d: 1, l: 1, gd: "+1", pts: 4 },
    { t: "Ghana", flag: "🇬🇭", p: 3, w: 0, d: 1, l: 2, gd: "-6", pts: 1 },
  ]},
];

/* ---------- Official highlight embeds (FIFA YouTube) ---------- */
/* Replace VIDEO_ID with current official highlight video IDs. */
const VIDEOS = [
  { id: "RsbXBLLLfgs", cap: "World Cup — Top goals" },
  { id: "M3FpisHFmCs", cap: "Best saves of the tournament" },
  { id: "FyEa9smIYE0", cap: "Greatest World Cup moments" },
];

/* ---------- Sample news ---------- */
const NEWS = [
  { tag: "Preview", icon: "🔮", title: "Round of 16: who advances?", text: "Our group-by-group breakdown of the knockout picture and the ties to watch." },
  { tag: "Analysis", icon: "📊", title: "Golden Boot race heats up", text: "The top scorers so far and who's best placed to finish top." },
  { tag: "Guide", icon: "📺", title: "How to watch every match free in Europe", text: "Country-by-country list of the official, legal broadcasters carrying the tournament." },
  { tag: "Team news", icon: "🩹", title: "Injury & suspension tracker", text: "The key players in doubt ahead of the next round of fixtures." },
];

/* ---------- Sample top scorers (fallback) ---------- */
const SAMPLE_SCORERS = [
  { rank: 1, player: "K. Mbappé", team: "France", flag: "🇫🇷", goals: 6, assists: 2 },
  { rank: 2, player: "H. Kane", team: "England", flag: "🇬🇧", goals: 5, assists: 1 },
  { rank: 3, player: "V. Júnior", team: "Brazil", flag: "🇧🇷", goals: 4, assists: 3 },
  { rank: 4, player: "L. Messi", team: "Argentina", flag: "🇦🇷", goals: 4, assists: 2 },
  { rank: 5, player: "C. Ronaldo", team: "Portugal", flag: "🇵🇹", goals: 3, assists: 0 },
];

/* ============================ Rendering ============================ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Crest image (from API) with emoji-flag fallback if the image fails/missing
function badge(crest, flag, cls) {
  if (crest) {
    return `<img class="${cls} crest" src="${crest}" alt="" loading="lazy" decoding="async" onerror="this.outerHTML=&quot;<span class='${cls}'>${flag || "🏳️"}</span>&quot;">`;
  }
  return `<span class="${cls}">${flag || "🏳️"}</span>`;
}

function matchCard(m) {
  let center;
  if (m.status === "live") {
    center = `<div class="match__score">${m.hs}–${m.as}</div><span class="match__status match__status--live">● ${m.minute || "LIVE"}</span>`;
  } else if (m.status === "ft") {
    center = `<div class="match__score">${m.hs}–${m.as}</div><span class="match__status match__status--ft">FT</span>`;
  } else {
    const t = (m.time || "").replace(/^.*\s/, "") || m.time;
    center = `<div class="match__time">${t}</div><span class="match__status match__status--up">Upcoming</span>`;
  }
  const meta = [m.stage === "Group" ? `Group ${m.group}` : m.stage, m.time].filter(Boolean).join(" • ");
  return `<div class="match${m.status === "live" ? " match--live" : ""}">
    <div class="match__team match__team--home"><span>${m.home}</span>${badge(m.hcrest, m.hflag, "match__flag")}</div>
    <div class="match__center">${center}</div>
    <div class="match__team">${badge(m.acrest, m.aflag, "match__flag")}<span>${m.away}</span></div>
    <div class="match__meta">${meta}</div>
  </div>`;
}

function skeleton(n = 5) {
  return Array.from({ length: n }, () => `<div class="match match--skeleton"><span></span></div>`).join("");
}

function renderLive(matches) {
  const live = matches.filter((m) => m.status === "live" || m.status === "up");
  $("#liveMatches").innerHTML = live.length
    ? live.map(matchCard).join("")
    : `<p class="loading">No live or upcoming matches right now — check the full schedule.</p>`;
  const motd = matches.find((m) => m.status === "live") || matches.find((m) => m.status === "up");
  $("#motd").textContent = motd ? `${motd.home} vs ${motd.away} — ${motd.time}` : "—";
}

let allMatches = [];
let activeStage = "all";
function renderSchedule(stage = activeStage) {
  activeStage = stage;
  const list = stage === "all" ? allMatches : allMatches.filter((m) => m.stage === stage);
  $("#scheduleMatches").innerHTML = list.length ? list.map(matchCard).join("") : `<p class="loading">No matches for this stage yet.</p>`;
}

function renderGroups(groups) {
  $("#groups").innerHTML = groups.map((g) => `
    <div class="group">
      <h3>${g.name}</h3>
      <table class="table">
        <thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead>
        <tbody>
          ${g.rows.map((r, i) => `
            <tr class="${i < 2 ? "qualify" : ""}">
              <td class="pos">${i + 1}</td>
              <td class="team">${badge(r.crest, r.flag, "tbadge")} ${r.t}</td>
              <td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gd}</td>
              <td class="pts">${r.pts}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`).join("");
}

function renderScorers(list) {
  const el = $("#scorersList");
  if (!list || !list.length) {
    el.innerHTML = `<p class="loading">Top scorers will appear once tournament data is available.</p>`;
    return;
  }
  el.innerHTML = list.map((s) => `
    <div class="scorer${s.rank === 1 ? " scorer--lead" : ""}">
      <span class="scorer__rank">${s.rank}</span>
      ${badge(s.crest, s.flag, "scorer__flag")}
      <div class="scorer__info">
        <span class="scorer__name">${s.player}</span>
        <span class="scorer__team">${s.team}</span>
      </div>
      <div class="scorer__stats">
        <span class="scorer__goals">${s.goals}</span>
        <span class="scorer__sub">goals${s.assists ? ` · ${s.assists} assists` : ""}</span>
      </div>
    </div>`).join("");
}

function computeMeta(matches) {
  const finished = matches.filter((m) => m.status === "ft").length;
  const live = matches.filter((m) => m.status === "live").length;
  const today = matches.filter((m) => /^Today/.test(m.time || "")).length;
  const goals = matches.reduce((n, m) => n + (m.hs || 0) + (m.as || 0), 0);
  const teams = new Set();
  matches.forEach((m) => { if (m.home && m.home !== "TBD") teams.add(m.home); if (m.away && m.away !== "TBD") teams.add(m.away); });
  return { live, today, finished, goals, teams: teams.size, total: matches.length };
}

function renderStats(meta) {
  if (!meta) return;
  $$("[data-stat]").forEach((el) => {
    const v = meta[el.dataset.stat];
    if (v != null) el.textContent = v;
  });
  const liveStat = $('[data-stat="live"]');
  if (liveStat) liveStat.closest(".stat").classList.toggle("stat--live", (meta.live || 0) > 0);
}

let lastUpdatedTs = null;
function setUpdated(iso) {
  lastUpdatedTs = iso ? new Date(iso) : new Date();
  paintUpdated();
}
function paintUpdated() {
  const el = $("#updatedText");
  if (!el || !lastUpdatedTs) return;
  const sec = Math.max(0, Math.round((Date.now() - lastUpdatedTs) / 1000));
  el.textContent = sec < 10 ? "Updated just now" : sec < 60 ? `Updated ${sec}s ago` : `Updated ${Math.round(sec / 60)}m ago`;
}
setInterval(paintUpdated, 15000);

function renderWatch(country) {
  const grid = $("#watchGrid");
  const ordered = country
    ? [...EU_BROADCASTERS].sort((a, b) => (a.code === country ? -1 : b.code === country ? 1 : 0))
    : EU_BROADCASTERS;
  grid.innerHTML = ordered.map((b) => `
    <div class="watch">
      <span class="watch__flag">${b.flag}</span>
      <div>
        <div class="watch__name">${b.country}</div>
        <div class="watch__broadcaster"><a href="${b.url}" target="_blank" rel="noopener nofollow">${b.name} ↗</a></div>
      </div>
    </div>`).join("");
  const sel = EU_BROADCASTERS.find((b) => b.code === country);
  $("#watchCountry").textContent = sel ? sel.country : "Europe";
}

function renderVideos() {
  $("#videoGrid").innerHTML = VIDEOS.map((v) => `
    <div class="video">
      <iframe class="video__frame" src="https://www.youtube.com/embed/${v.id}" title="${v.cap}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
      <div class="video__cap">${v.cap}</div>
    </div>`).join("");
}

function renderNews() {
  $("#newsGrid").innerHTML = NEWS.map((n) => `
    <article class="article">
      <div class="article__img">${n.icon}</div>
      <div class="article__body">
        <span class="article__tag">${n.tag}</span>
        <h3>${n.title}</h3>
        <p>${n.text}</p>
      </div>
    </article>`).join("");
}

function renderCountrySelect() {
  const sel = $("#countrySelect");
  sel.innerHTML = `<option value="">Europe (all)</option>` +
    EU_BROADCASTERS.map((b) => `<option value="${b.code}">${b.flag} ${b.country}</option>`).join("");
  const saved = localStorage.getItem("gh_country") || "";
  sel.value = saved;
  renderWatch(saved);
  sel.addEventListener("change", () => {
    localStorage.setItem("gh_country", sel.value);
    renderWatch(sel.value);
  });
}

/* ============================ Data loading ============================ */
async function loadData() {
  allMatches = SAMPLE_MATCHES;
  let groups = SAMPLE_GROUPS;
  let scorers = SAMPLE_SCORERS;
  let meta = null;
  let live = false;

  if (CONFIG.api.enabled && CONFIG.api.endpoint) {
    try {
      const res = await fetch(CONFIG.api.endpoint, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.matches) && data.matches.length) { allMatches = data.matches; live = true; }
        if (Array.isArray(data.groups) && data.groups.length) groups = data.groups;
        if (Array.isArray(data.scorers) && data.scorers.length) scorers = data.scorers;
        if (data.meta) meta = data.meta;
      }
    } catch (e) {
      console.warn("Live data fetch failed, using sample data.", e);
    }
  }

  renderLive(allMatches);
  renderSchedule(activeStage);
  renderGroups(groups);
  renderScorers(scorers);
  renderStats(meta || computeMeta(allMatches));
  setUpdated(meta && meta.lastUpdated);
  return live;
}

// Auto-refresh live scores (only when API is enabled and there are live games)
function startAutoRefresh() {
  if (!CONFIG.api.enabled) return;
  setInterval(() => {
    if (document.hidden) return;
    loadData();
  }, 60 * 1000);
}

/* ============================ UI wiring ============================ */
// Header shadow
const header = $("#header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Mobile nav
const navToggle = $("#navToggle");
const nav = $("#nav");
navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});
$$("#nav a").forEach((a) => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}));

// Tabs
$$(".tab").forEach((tab) => tab.addEventListener("click", () => {
  $$(".tab").forEach((t) => t.classList.remove("is-active"));
  $$(".panel").forEach((p) => p.classList.remove("is-active"));
  tab.classList.add("is-active");
  $("#" + tab.dataset.tab).classList.add("is-active");
}));

// Schedule filter chips
$$(".chip").forEach((chip) => chip.addEventListener("click", () => {
  $$(".chip").forEach((c) => c.classList.remove("is-active"));
  chip.classList.add("is-active");
  renderSchedule(chip.dataset.stage);
}));

// Manual refresh
const refreshBtn = $("#refreshBtn");
if (refreshBtn) {
  refreshBtn.addEventListener("click", async () => {
    if (refreshBtn.classList.contains("is-spinning")) return;
    refreshBtn.classList.add("is-spinning");
    const el = $("#updatedText");
    if (el) el.textContent = "Refreshing…";
    await loadData();
    setTimeout(() => refreshBtn.classList.remove("is-spinning"), 700);
  });
}

// Footer year
$("#year").textContent = new Date().getFullYear();

/* ============================ Cookie consent + Ads ============================ */
function loadAds() {
  $$(".adsbygoogle").forEach(() => {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { /* noop */ }
  });
}
function initConsent() {
  const choice = localStorage.getItem("gh_consent");
  const bar = $("#cookie");
  if (choice === "accept") { loadAds(); return; }
  if (choice === "reject") { return; }
  bar.hidden = false;
  $("#cookieAccept").addEventListener("click", () => {
    localStorage.setItem("gh_consent", "accept");
    bar.hidden = true;
    loadAds();
  });
  $("#cookieReject").addEventListener("click", () => {
    localStorage.setItem("gh_consent", "reject");
    bar.hidden = true;
  });
}

/* ============================ Init ============================ */
renderCountrySelect();
renderVideos();
renderNews();
$("#liveMatches").innerHTML = skeleton(5); // loading state before first fetch
loadData();
startAutoRefresh();
initConsent();
