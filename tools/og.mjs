// OG cards (1200 x 630) of the FlowTime web pages, rendered with headless Chrome.
import { writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PAGES } from './build.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CARD = {
  timer: { en: ['Pomodoro timer', '25/5, 50/10 or FlowTime. Free, in your browser.', '25:00', 0.62], es: ['Temporizador Pomodoro', '25/5, 50/10 o FlowTime. Gratis, en el navegador.', '25:00', 0.62] },
  technique: { en: ['The Flowtime technique', 'Work until you stop. Break by how long you worked.', '42:10', 0.81], es: ['La técnica Flowtime', 'Trabaja hasta que pares. Descansa según lo trabajado.', '42:10', 0.81] },
  finals: { en: ['Finals week study plan', 'A study day you can press play on.', '50:00', 0.34] },
  exams: { en: ['Exam season revision', 'A revision day, block by block, with the timer built in.', '50:00', 0.34], es: ['Época de exámenes', 'Un día de estudio, bloque a bloque, con el temporizador dentro.', '50:00', 0.34] },
}
mkdirSync(join(ROOT, 'ft/og'), { recursive: true })
const tmp = mkdtempSync(join(tmpdir(), 'ft-og-'))
for (const kind of Object.keys(PAGES)) {
  for (const lang of Object.keys(PAGES[kind])) {
    const [title, sub, time, frac] = CARD[kind][lang]
    const C = 2 * Math.PI * 88
    const html = join(tmp, `${kind}-${lang}.html`)
    writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Mulish;src:url("${join(ROOT, 'ft/mulish.woff2')}");font-weight:200 1000}
html,body{margin:0;width:1200px;height:630px;background:#15506A;color:#EAF6FB;font-family:Mulish;overflow:hidden}
.t{position:absolute;left:80px;top:0;bottom:0;width:600px;display:flex;flex-direction:column;justify-content:center}
h1{margin:0;font-size:68px;font-weight:300;letter-spacing:-2px;line-height:1.05}
p{margin:24px 0 0;font-size:30px;color:#B5D6E5;line-height:1.35}
.brand{position:absolute;left:80px;bottom:56px;font-size:24px;font-weight:700;display:flex;align-items:center;gap:12px}
.brand img{width:40px;height:40px;border-radius:10px}
.d{position:absolute;right:90px;top:95px;width:440px;height:440px}
.d svg{width:100%;height:100%;transform:rotate(-90deg)}
.r{position:absolute;inset:0;display:grid;place-content:center;font-size:104px;font-weight:300;letter-spacing:-3px}
.r b{color:#8ECAE6;font-weight:300}
</style>
<div class="t"><h1>${title}</h1><p>${sub}</p></div>
<div class="brand"><img src="${join(ROOT, 'ft/icon.svg')}">FlowTime</div>
<div class="d"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" fill="none" stroke="#2B6782" stroke-width="9"/><circle cx="100" cy="100" r="88" fill="none" stroke="#8ECAE6" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}"/></svg>
<div class="r">${time.replace(':', '<b>:</b>')}</div></div>`)
    const profile = mkdtempSync(join(tmpdir(), 'ft-chrome-'))
    execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`, '--window-size=1200,630',
      `--screenshot=${join(ROOT, `ft/og/${kind}-${lang}.png`)}`, `file://${html}`], { stdio: 'ignore' })
    rmSync(profile, { recursive: true, force: true })
  }
}
rmSync(tmp, { recursive: true, force: true })
console.log('og ok')
