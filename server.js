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
  LAST_16: "Round of 16",
  ROUND_OF_16: "Round of 16",
  QUARTER_FINALS: "Quarter-final",
  SEMI_FINALS: "Semi-final",
  THIRD_PLACE: "Final",
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
      stage: STAGE_LABEL[m.stage] || "Group",
      group: groupLetter(m.group),
      home: m.homeTeam?.name || "TBD",
      hflag: flagFor(m.homeTeam?.name),
      away: m.awayTeam?.name || "TBD",
      aflag: flagFor(m.awayTeam?.name),
      hs: m.score?.fullTime?.home ?? null,
      as: m.score?.fullTime?.away ?? null,
      status: st,
      minute: st === "live" ? (m.minute ? `${m.minute}'` : "LIVE") : undefined,
      time: timeLabel(m.utcDate),
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
        p: r.playedGames, w: r.won, d: r.draw, l: r.lost,
        gd: gd(r.goalDifference), pts: r.points,
      })),
    }));
}

async function fdGet(pathname) {
  const res = await fetch(`${FD_BASE}${pathname}`, { headers: { "X-Auth-Token": FD_TOKEN } });
  if (!res.ok) throw new Error(`football-data ${pathname} -> ${res.status} ${res.statusText}`);
  return res.json();
}

async function getWorldCup() {
  if (cache.data && Date.now() - cache.ts < CACHE_MS) return cache.data;
  const [matchesJson, standingsJson] = await Promise.all([
    fdGet(`/competitions/${COMPETITION}/matches`),
    fdGet(`/competitions/${COMPETITION}/standings`).catch(() => ({ standings: [] })),
  ]);
  const data = { matches: mapMatches(matchesJson), groups: mapStandings(standingsJson) };
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
      res.end(JSON.stringify({ error: e.message, matches: [], groups: [] }));
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
