/* =========================================================================
   GoalHub EU — local server + football-data.org proxy
   Zero dependencies. Requires Node 18+ (built-in fetch).
   Run:  node server.js     then open  http://localhost:8000
   ========================================================================= */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8000;
const ROOT = __dirname;

// API key resolution (kept OUT of source / git):
//   1) env var:        FD_TOKEN=yourkey node server.js
//   2) local file:     a file named ".fdtoken" next to this script (git-ignored)
// Get a free key at https://www.football-data.org
function resolveToken() {
  if (process.env.FD_TOKEN) return process.env.FD_TOKEN.trim();
  try { return fs.readFileSync(path.join(__dirname, ".fdtoken"), "utf8").trim(); }
  catch { return ""; }
}
const FD_TOKEN = resolveToken();
const FD_BASE = "https://api.football-data.org/v4";
const COMPETITION = process.env.FD_COMPETITION || "WC"; // FIFA World Cup

// ---- simple in-memory cache (respect free-tier rate limits ~10 req/min) ----
const cache = { data: null, ts: 0 };
const CACHE_MS = 30 * 1000;

/* ---------------- helpers: map football-data -> frontend shape ------------- */

const FLAGS = {
  Argentina: "🇦🇷", Australia: "🇦🇺", Austria: "🇦🇹", Belgium: "🇧🇪", Brazil: "🇧🇷",
  Cameroon: "🇨🇲", Canada: "🇨🇦", Chile: "🇨🇱", Colombia: "🇨🇴", Croatia: "🇭🇷",
  Denmark: "🇩🇰", Ecuador: "🇪🇨", Egypt: "🇪🇬", England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", France: "🇫🇷",
  Germany: "🇩🇪", Ghana: "🇬🇭", Greece: "🇬🇷", Iran: "🇮🇷", Italy: "🇮🇹",
  "Ivory Coast": "🇨🇮", "Côte d'Ivoire": "🇨🇮", Japan: "🇯🇵", Mexico: "🇲🇽",
  Morocco: "🇲🇦", Netherlands: "🇳🇱", Nigeria: "🇳🇬", Norway: "🇳🇴", Panama: "🇵🇦",
  Paraguay: "🇵🇾", Peru: "🇵🇪", Poland: "🇵🇱", Portugal: "🇵🇹", Qatar: "🇶🇦",
  "Republic of Ireland": "🇮🇪", Romania: "🇷🇴", "Saudi Arabia": "🇸🇦", Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Senegal: "🇸🇳", Serbia: "🇷🇸", "South Korea": "🇰🇷", "Korea Republic": "🇰🇷",
  Spain: "🇪🇸", Sweden: "🇸🇪", Switzerland: "🇨🇭", Tunisia: "🇹🇳", Turkey: "🇹🇷",
  "Türkiye": "🇹🇷", Ukraine: "🇺🇦", "United States": "🇺🇸", "United States of America": "🇺🇸",
  Uruguay: "🇺🇾", Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "Costa Rica": "🇨🇷", "New Zealand": "🇳🇿",
  "South Africa": "🇿🇦", Algeria: "🇩🇿", "Cape Verde": "🇨🇻", Jordan: "🇯🇴",
  Uzbekistan: "🇺🇿", "Bosnia and Herzegovina": "🇧🇦", "Bosnia-Herzegovina": "🇧🇦",
  Hungary: "🇭🇺", Slovenia: "🇸🇮",
  // Additional 2026 qualifiers / common names
  "Cape Verde Islands": "🇨🇻",
  Czechia: "🇨🇿", "Czech Republic": "🇨🇿", Slovakia: "🇸🇰", Albania: "🇦🇱",
  "North Macedonia": "🇲🇰", Iceland: "🇮🇸", Georgia: "🇬🇪", Finland: "🇫🇮",
  Montenegro: "🇲🇪", Kosovo: "🇽🇰", Israel: "🇮🇱", "Cabo Verde": "🇨🇻",
  Curaçao: "🇨🇼", Haiti: "🇭🇹", "DR Congo": "🇨🇩", "Congo DR": "🇨🇩",
  Angola: "🇦🇴", Mali: "🇲🇱", "Burkina Faso": "🇧🇫", Gabon: "🇬🇦", Benin: "🇧🇯",
  "Equatorial Guinea": "🇬🇶", Zambia: "🇿🇲", Guinea: "🇬🇳", Comoros: "🇰🇲",
  Madagascar: "🇲🇬", Mozambique: "🇲🇿", Namibia: "🇳🇦", Tanzania: "🇹🇿",
  Bolivia: "🇧🇴", Venezuela: "🇻🇪", Honduras: "🇭🇳", Guatemala: "🇬🇹",
  Jamaica: "🇯🇲", "Trinidad and Tobago": "🇹🇹", "El Salvador": "🇸🇻", Suriname: "🇸🇷",
  Indonesia: "🇮🇩", Thailand: "🇹🇭", Vietnam: "🇻🇳", India: "🇮🇳", "China PR": "🇨🇳",
  China: "🇨🇳", Iraq: "🇮🇶", "United Arab Emirates": "🇦🇪", Oman: "🇴🇲",
  Bahrain: "🇧🇭", Kuwait: "🇰🇼", Lebanon: "🇱🇧", Palestine: "🇵🇸", Syria: "🇸🇾",
  Tajikistan: "🇹🇯", Kyrgyzstan: "🇰🇬", Turkmenistan: "🇹🇲",
};
const flagFor = (name) => FLAGS[name] || "🏳️";

const STAGE_LABEL = {
  GROUP_STAGE: "Group",
  LAST_32: "Round of 32",
  ROUND_OF_32: "Round of 32",
  LAST_16: "Round of 16",
  ROUND_OF_16: "Round of 16",
  QUARTER_FINALS: "Quarter-final",
  SEMI_FINALS: "Semi-final",
  THIRD_PLACE: "Third place",
  FINAL: "Final",
};

function statusOf(s) {
  if (s === "IN_PLAY" || s === "PAUSED") return "live";
  if (s === "FINISHED" || s === "AWARDED") return "ft";
  return "up"; // TIMED, SCHEDULED, POSTPONED, etc.
}

function timeLabel(utc) {
  if (!utc) return "TBD";
  const d = new Date(utc);
  const now = new Date();
  const fmtTime = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris", hour12: false });
  const dayKey = (x) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(x);
  const diffDays = Math.round((new Date(dayKey(d)) - new Date(dayKey(now))) / 86400000);
  const hm = fmtTime.format(d);
  if (diffDays === 0) return `Today ${hm}`;
  if (diffDays === 1) return `Tomorrow ${hm}`;
  if (diffDays === -1) return `Yesterday ${hm}`;
  const wd = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", timeZone: "Europe/Paris" }).format(d);
  return `${wd} ${hm}`;
}

const gd = (n) => (n > 0 ? `+${n}` : `${n}`);
const groupLetter = (g) => (g ? g.replace(/GROUP[_ ]?/i, "") : "");

function mapMatches(json) {
  return (json.matches || []).map((m) => {
    const st = statusOf(m.status);
    return {
      id: m.id,
      stage: STAGE_LABEL[m.stage] || "Group",
      group: groupLetter(m.group),
      home: m.homeTeam?.name || "TBD",
      hflag: flagFor(m.homeTeam?.name),
      hcrest: m.homeTeam?.crest || null,
      away: m.awayTeam?.name || "TBD",
      aflag: flagFor(m.awayTeam?.name),
      acrest: m.awayTeam?.crest || null,
      hs: m.score?.fullTime?.home ?? null,
      as: m.score?.fullTime?.away ?? null,
      status: st,
      minute: st === "live" ? (m.minute ? `${m.minute}'` : "LIVE") : undefined,
      time: timeLabel(m.utcDate),
      utcDate: m.utcDate || null,
    };
  });
}

function mapStandings(json) {
  return (json.standings || [])
    .filter((s) => s.type === "TOTAL" && s.group)
    .map((s) => ({
      name: `Group ${groupLetter(s.group)}`,
      rows: (s.table || []).map((r) => ({
        t: r.team?.name || "—",
        flag: flagFor(r.team?.name),
        crest: r.team?.crest || null,
        p: r.playedGames, w: r.won, d: r.draw, l: r.lost,
        gd: gd(r.goalDifference), pts: r.points,
      })),
    }));
}

function mapScorers(json) {
  return (json.scorers || []).slice(0, 10).map((s, i) => ({
    rank: i + 1,
    player: s.player?.name || "—",
    team: s.team?.name || "",
    flag: flagFor(s.team?.name),
    crest: s.team?.crest || null,
    goals: s.goals ?? 0,
    assists: s.assists ?? 0,
    penalties: s.penalties ?? 0,
  }));
}

function buildMeta(matches, standingsJson) {
  const finished = matches.filter((m) => m.status === "ft").length;
  const live = matches.filter((m) => m.status === "live").length;
  const upcoming = matches.filter((m) => m.status === "up").length;
  const today = matches.filter((m) => /^Today/.test(m.time)).length;
  const goals = matches.reduce((n, m) => n + (m.hs ?? 0) + (m.as ?? 0), 0);
  const teams = new Set();
  matches.forEach((m) => { if (m.home !== "TBD") teams.add(m.home); if (m.away !== "TBD") teams.add(m.away); });
  const season = standingsJson?.season || {};
  return {
    competition: standingsJson?.competition?.name || "FIFA World Cup",
    matchday: season.currentMatchday || null,
    total: matches.length,
    finished, live, upcoming, today, goals,
    teams: teams.size,
    lastUpdated: new Date().toISOString(),
  };
}

function kickoffLabel(utc) {
  if (!utc) return "TBD";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris", hour12: false,
  }).format(new Date(utc)) + " CET";
}

function mapMatchDetail(d) {
  const st = statusOf(d.status);
  const ref = Array.isArray(d.referees) && d.referees.length
    ? { name: d.referees[0].name, nationality: d.referees[0].nationality || "" } : null;
  return {
    id: d.id,
    status: st,
    stage: STAGE_LABEL[d.stage] || "",
    group: groupLetter(d.group),
    home: d.homeTeam?.name || "TBD", hflag: flagFor(d.homeTeam?.name), hcrest: d.homeTeam?.crest || null,
    away: d.awayTeam?.name || "TBD", aflag: flagFor(d.awayTeam?.name), acrest: d.awayTeam?.crest || null,
    hs: d.score?.fullTime?.home ?? null,
    as: d.score?.fullTime?.away ?? null,
    htHome: d.score?.halfTime?.home ?? null,
    htAway: d.score?.halfTime?.away ?? null,
    winner: d.score?.winner || null,
    minute: st === "live" ? (d.minute ? `${d.minute}'` : "LIVE") : null,
    time: timeLabel(d.utcDate),
    kickoff: kickoffLabel(d.utcDate),
    venue: d.venue || null,
    referee: ref,
    matchday: d.matchday || null,
    competition: d.competition?.name || "FIFA World Cup",
    // Free-tier note: lineups, events and detailed stats are not provided.
    hasExtras: false,
  };
}

async function fdGet(pathname) {
  const res = await fetch(`${FD_BASE}${pathname}`, { headers: { "X-Auth-Token": FD_TOKEN } });
  if (!res.ok) throw new Error(`football-data ${pathname} -> ${res.status} ${res.statusText}`);
  return res.json();
}

// per-match cache (id -> { data, ts })
const matchCache = new Map();
async function getMatch(id) {
  const hit = matchCache.get(id);
  if (hit && Date.now() - hit.ts < CACHE_MS) return hit.data;
  const detail = mapMatchDetail(await fdGet(`/matches/${id}`));
  matchCache.set(id, { data: detail, ts: Date.now() });
  return detail;
}

async function getWorldCup() {
  if (cache.data && Date.now() - cache.ts < CACHE_MS) return cache.data;
  const [matchesJson, standingsJson, scorersJson] = await Promise.all([
    fdGet(`/competitions/${COMPETITION}/matches`),
    fdGet(`/competitions/${COMPETITION}/standings`).catch(() => ({ standings: [] })),
    fdGet(`/competitions/${COMPETITION}/scorers?limit=10`).catch(() => ({ scorers: [] })),
  ]);
  const matches = mapMatches(matchesJson);
  const data = {
    matches,
    groups: mapStandings(standingsJson),
    scorers: mapScorers(scorersJson),
    meta: buildMeta(matches, standingsJson),
  };
  cache.data = data;
  cache.ts = Date.now();
  return data;
}

/* ------------------------------- static files ----------------------------- */
const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".ico": "image/x-icon",
};

function serveStatic(req, res) {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const filePath = path.join(ROOT, path.normalize(p));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403).end("Forbidden"); return; }
  fs.readFile(filePath, (err, buf) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found"); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(buf);
  });
}

/* --------------------------------- server --------------------------------- */
http.createServer(async (req, res) => {
  if (req.url.startsWith("/api/worldcup")) {
    try {
      const data = await getWorldCup();
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=30" });
      res.end(JSON.stringify(data));
    } catch (e) {
      console.error(e.message);
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message, matches: [], groups: [], scorers: [], meta: null }));
    }
    return;
  }

  if (req.url.startsWith("/api/match")) {
    const id = new URL(req.url, `http://localhost:${PORT}`).searchParams.get("id");
    if (!id || !/^\d+$/.test(id)) { res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: "invalid id" })); return; }
    try {
      const detail = await getMatch(id);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=30" });
      res.end(JSON.stringify(detail));
    } catch (e) {
      console.error(e.message);
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  serveStatic(req, res);
}).listen(PORT, () => {
  console.log(`\n  GoalHub EU running →  http://localhost:${PORT}`);
  console.log(`  Live data proxy   →  http://localhost:${PORT}/api/worldcup`);
  console.log(`  Competition: ${COMPETITION} | data: football-data.org`);
  if (!FD_TOKEN) {
    console.log(`  ⚠ No API key found — serving SAMPLE data only.`);
    console.log(`    Add a key: create a ".fdtoken" file here, or set FD_TOKEN env var.`);
  }
  console.log("");
});
