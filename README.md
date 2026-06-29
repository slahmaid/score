# GoalHub EU — World Cup Hub (ad-monetised)

A fast, legal, ad-supported World Cup site for a **European** audience:
live scores, full schedule, group standings, a **"where to watch"** guide pointing to the
official broadcaster in each country, official highlight embeds, and news.

Built with plain HTML/CSS/JS — **no build step**. It works immediately with sample data,
and you plug in a live sports API + your AdSense ID when you're ready.

> ⚖️ This site is a **companion / information hub**. It does NOT stream or rebroadcast
> matches — that's what keeps it legal, gets it approved by ad networks, and keeps your
> revenue (and you) safe. Re-streaming the matches is the one thing that gets sites seized
> and ad/payment accounts permanently banned, so it's intentionally not here.

## Files
| File | Purpose |
|---|---|
| `index.html` | The hub (hero, live/schedule, standings, where-to-watch, highlights, news, ad slots) |
| `styles.css` | Theme + responsive layout |
| `script.js` | Data rendering, tabs/filters, country selector, cookie consent, AdSense init. **All config + data live here.** |
| `privacy.html` / `terms.html` | Required legal pages for AdSense approval |

## Run it

### Option A — with LIVE scores (recommended) — needs Node 18+
The live data uses a football-data.org key, which must stay server-side, so a tiny
zero-dependency proxy (`server.js`) serves the site **and** the live data.

First, provide your API key (never committed to git):
```powershell
cd site
# create a git-ignored token file with your key:
"YOUR_FOOTBALL_DATA_KEY" | Out-File -Encoding ascii .fdtoken
# (or instead: $env:FD_TOKEN="YOUR_FOOTBALL_DATA_KEY")
node server.js        # then open http://localhost:8000
```
You'll see real World Cup matches, scores and standings (auto-refreshing every 60s).
Get a free key at <https://www.football-data.org>. Without a key the server runs but
serves sample data.

### Option B — static only (sample data)
- Double-click `index.html`, or:
  ```powershell
  cd site
  python -m http.server 8000
  ```
  This shows the built-in sample fixtures (set `CONFIG.api.enabled = false` in `script.js`
  to silence the "live fetch failed" console note when running without the server).

---

## 💰 Step 1 — Turn on the ads (Google AdSense)
1. Create content first (the sample news + this real data is a start; add a few original articles).
2. Apply at <https://adsense.google.com> and get approved (needs a live domain + privacy/terms pages — both included).
3. Replace the placeholder **`ca-pub-XXXXXXXXXXXXXXXX`** with your publisher ID in:
   - `index.html` (the `<script ... adsbygoogle.js?client=...>` tag **and** every `data-ad-client`)
   - `script.js` (`CONFIG.adsensePubId`)
4. In AdSense, create ad units and paste each unit's `data-ad-slot` number into the matching
   `<ins>` in `index.html` (placeholders: `1111111111`, `2222222222`, …).

**Ad placements already built in** (best-earning spots):
- Top leaderboard (below hero)
- Sticky sidebar rectangle (next to live scores)
- Two in-content units (between sections)

Ads only load **after** the visitor accepts the cookie banner (EU/GDPR compliant).

---

## 📡 Step 2 — Live scores (already wired up ✅)
Live data comes from **[football-data.org](https://www.football-data.org)** (v4) via `server.js`.

- The API key lives in `server.js` (`FD_TOKEN`) — never in the browser.
  Override it without editing the file: `FD_TOKEN=yourkey node server.js`.
- It pulls the `WC` (FIFA World Cup) competition: `/competitions/WC/matches` and `/standings`.
- Responses are cached for 30s to respect the free-tier rate limit (~10 requests/min).
- The frontend (`script.js`) calls `/api/worldcup`; if it ever fails it falls back to sample data.
- Country names are mapped to flag emojis in `server.js` (`FLAGS`) — add any missing nations there.

**Deploying live data to the web:** host `server.js` on any Node host (Render, Railway, Fly,
a VPS) **or** port the `/api/worldcup` logic into a Netlify/Vercel/Cloudflare serverless
function and point `CONFIG.api.endpoint` at it. Keep the key in an environment variable.

---

## ✍️ Step 3 — Customize
- **Brand name:** replace `GoalHub` / `GoalHub EU` across the HTML files.
- **Colors:** edit the `:root` variables at the top of `styles.css`.
- **Where to watch:** update `EU_BROADCASTERS` in `script.js` each tournament (rights change).
- **Highlights:** put current official YouTube video IDs in `VIDEOS`.
- **News:** the real money-maker — replace `NEWS` with links to full original articles you write
  (previews, predictions, player profiles). More quality content = more traffic = more ad revenue.

## 🚀 Step 4 — Deploy (free)
Drag the `site/` folder into **Netlify**, **Vercel**, or **Cloudflare Pages**. Add your custom
domain. Done.

## Revenue tips
- Traffic spikes around match days — publish previews the day before and recaps right after.
- Add SEO titles/meta per article; target "[team] vs [team] where to watch" searches.
- Consider affiliate links to legal streaming services in the "Where to Watch" cards.
- Don't overload pages with ads — AdSense penalises poor ad-to-content ratio.

## ⚠️ Compliance checklist before going live
- [ ] Real domain + HTTPS
- [ ] Privacy + Terms pages reachable (already linked in the footer)
- [ ] Cookie consent shown before ads (already implemented)
- [ ] Original written content added
- [ ] No links to unauthorised/pirate streams (keep it to official broadcasters)
