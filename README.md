# flowtime-privacy

The public web of **FlowTime**, the Pomodoro focus timer for Android and iOS (app repository:
`BaltaJmn/FlowTime-Pomodoro`). Served at <https://flowtime.baltajmn.dev/> by GitHub Pages from `main`,
behind Cloudflare.

| Path | What it is |
|---|---|
| `index.html` | Privacy policy, English and Spanish. The URL in the app, Play and the App Store |
| `terms.html`, `delete.html` | Terms of use, and how to delete the Coop account |
| `404.html` | Any unknown path. For Coop links (`/f/<code>`, `/r/<code>`) without the app: Android goes to Play, iPhone to the App Store once FlowTime is on sale there (iTunes lookup), a computer sees both |
| `.well-known/` | `assetlinks.json` and `apple-app-site-association`: Coop links open the app |
| `.nojekyll` | Without it Pages runs Jekyll, which drops `.well-known` |
| `pomodoro/`, `es/pomodoro/` | Web timer: 25/5, 50/10 and FlowTime (counts up, break from time worked) |
| `flowtime-technique/`, `es/tecnica-flowtime/` | The Flowtime technique explained, with the timer in FlowTime mode |
| `finals-week/` | December finals (US and UK): a study day whose blocks start the timer |
| `exam-season/`, `es/epoca-de-examenes/` | January exams (UK revision; Spain), same idea |
| `ft/` | Shared CSS, `timer.js`, Mulish (subset woff2, OFL), icon, app screenshots, OG cards |
| `sitemap.xml`, `robots.txt` | For Google; the sitemap lists the pages with their language alternates |
| `tools/` | `build.mjs` writes the pages, sitemap and robots; `og.mjs` the OG cards; `check.mjs` checks them |

## Web pages (from 23-10-2026)

Search pages that bring people to the app, part of the growth plan (`plan-apps/0-plan.md`). Languages:
en and es, the two with search volume worth it for these terms (Google autocomplete, 23-10-2026);
pt and de were looked at and left out.

- **Edit texts in `tools/build.mjs`**, never in the generated `index.html`, then:

  ```bash
  node tools/build.mjs && node tools/og.mjs && node tools/check.mjs . https://flowtime.baltajmn.dev
  ```

  `og.mjs` needs Google Chrome installed (headless). Commit the generated files with the change.
- **The timer** keeps time from the clock (`Date.now`), not from counting ticks, because browsers slow
  down timers in background tabs; the end-of-phase chimes are scheduled on the Web Audio clock for the
  same reason. State and today's blocks are in `localStorage` (`ft-web-state`, `ft-web-log`). FlowTime
  breaks use the app's defaults: up to 15 min of work, 5 min; up to 30, 10; more, 15
  (`TimerDefaults.kt` in the app). If the app's defaults change, change `RANGES` in `ft/timer.js` and
  the tables in `tools/build.mjs`.
- **Store links** carry a campaign so web installs show in the consoles, since the app has no
  analytics: Play `referrer=utm_source=flowtime.baltajmn.dev&utm_medium=web&utm_campaign=ft-<page>-<lang>`
  (Play Console, Acquisition, once Google shows UTM data for that volume) and App Store
  `ct=ft-<page>-<lang>` (App Analytics, Campaigns). The App Store counts `ct` only with the provider
  token `pt` (`APPLE_PT` in `tools/build.mjs`, 129564006, the same for both apps). Android sees only Play, iPhone only
  the App Store (or "coming soon" while the iTunes lookup does not find the app).
- **No cookies, no analytics scripts.** Cloudflare's own traffic numbers (no script) are the only web
  measure.
- CSS and JS URLs carry `?v=<hash>` so a change reaches visitors past the Cloudflare cache.

Nothing private is published: no source of the app, no keys, no user data.
