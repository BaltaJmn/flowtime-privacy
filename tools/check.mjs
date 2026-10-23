// Checks the built pages: every sitemap URL has its file, a canonical to itself, reciprocal hreflang,
// a title and description of sane length, an OG image that exists, and a 2027 grid of 365 days.
//   node tools/check.mjs <site-root-dir> <https://domain>
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const [root, site] = [process.argv[2] || '.', process.argv[3] || 'https://color.baltajmn.dev']
const fail = []
const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8')
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.endsWith('/') && u !== site + '/') // the policy page at / is not built here
const pages = {}
for (const url of locs) {
  const file = join(root, url.replace(site, ''), 'index.html')
  if (!existsSync(file)) { fail.push(`${url}: no file`); continue }
  const html = readFileSync(file, 'utf8')
  const get = (re) => (html.match(re) || [])[1]
  const title = get(/<title>([^<]*)<\/title>/)
  const desc = get(/<meta name="description" content="([^"]*)"/)
  if (get(/<link rel="canonical" href="([^"]+)"/) !== url) fail.push(`${url}: canonical`)
  if (!title || title.length > 70) fail.push(`${url}: title ${title && title.length}`)
  if (!desc || desc.length < 70 || desc.length > 170) fail.push(`${url}: description ${desc && desc.length}`)
  const og = get(/<meta property="og:image" content="([^"]+)"/)
  if (!og || !existsSync(join(root, og.replace(site, '')))) fail.push(`${url}: og image`)
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) fail.push(`${url}: one h1`)
  if (/[—–“”‘’…→•× ]/.test(html)) fail.push(`${url}: non-ASCII punctuation`)
  pages[url] = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]))
  for (const m of html.matchAll(/(?:href|src)="(\/[^"?#]*)/g)) {
    const p = m[1].endsWith('/') ? m[1] + 'index.html' : m[1]
    if (!existsSync(join(root, p))) fail.push(`${url}: broken ${m[1]}`)
  }
}
for (const [url, alts] of Object.entries(pages)) {
  for (const [lang, href] of Object.entries(alts)) {
    if (lang === 'x-default') continue
    if (!pages[href]) fail.push(`${url}: hreflang ${lang} not in sitemap`)
    else if (!Object.values(pages[href]).includes(url)) fail.push(`${url}: hreflang ${lang} not reciprocal`)
  }
}
const days = (y) => Array.from({ length: 12 }, (_, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate()).reduce((a, b) => a + b)
if (existsSync(join(root, 'yip/sheets/en-classic-a4.svg'))) {
  const cells = (readFileSync(join(root, 'yip/sheets/en-classic-a4.svg'), 'utf8').match(/class="c"/g) || []).length
  if (cells !== days(2027)) fail.push(`classic sheet: ${cells} cells, expected ${days(2027)}`)
}
console.log(fail.length ? fail.join('\n') : `ok: ${Object.keys(pages).length} pages`)
process.exit(fail.length ? 1 : 0)
