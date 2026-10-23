// FlowTime web timer. Time comes from the clock (Date.now), never from counting ticks, because
// browsers slow timers down in background tabs; the end-of-phase chime is scheduled on the audio
// clock for the same reason. State and today's blocks live in localStorage only.
(() => {
  const root = document.getElementById('timer')
  if (!root) return
  const T = JSON.parse(document.getElementById('ft-t').textContent)
  const $ = (id) => document.getElementById(id)
  const MODES = { p25: { focus: 25, rest: 5 }, p50: { focus: 50, rest: 10 }, flow: null }
  // The app's default FlowTime ranges: up to 15 min of work, 5 min break; up to 30, 10; more, 15.
  const RANGES = [[15, 5], [30, 10], [Infinity, 15]]
  const MIN = 60000
  const KEY_STATE = 'ft-web-state'
  const KEY_LOG = 'ft-web-log'
  const C = 2 * Math.PI * 88

  const flowBreak = (ms) => RANGES.find(([up]) => ms / MIN <= up)[1] * MIN
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)) } catch (e) { return null } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} },
  }
  const dayKey = (t) => { const d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() }

  let s = store.get(KEY_STATE) || {}
  if (!MODES.hasOwnProperty(s.mode)) s = { mode: root.dataset.mode || 'p25', phase: 'idle', running: false, start: 0, elapsed: 0, len: 0 }
  let log = store.get(KEY_LOG)
  if (!log || log.day !== dayKey(Date.now())) log = { day: dayKey(Date.now()), seg: [], sessions: 0 }

  const elapsed = (now = Date.now()) => s.elapsed + (s.running ? now - s.start : 0)
  const focusLen = () => (MODES[s.mode] ? MODES[s.mode].focus * MIN : Infinity)
  const save = () => { store.set(KEY_STATE, s); store.set(KEY_LOG, log) }

  // --- Today's blocks -------------------------------------------------------------------------
  function openSeg(t) { s.seg = t }
  function closeSeg(t) {
    if (!s.seg) return
    if (dayKey(s.seg) !== log.day) log = { day: dayKey(t), seg: [], sessions: 0 }
    if (t - s.seg > 1000) log.seg.push({ k: s.phase === 'break' ? 'b' : 'f', s: s.seg, e: t })
    s.seg = 0
  }

  // --- Sound ----------------------------------------------------------------------------------
  let ctx = null
  let pending = []
  function audio() {
    if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A() }
    if (ctx && ctx.state === 'suspended') ctx.resume()
    return ctx
  }
  function chimeAt(t) {
    // Two soft notes at wall-clock time t.
    if (!ctx) return
    const at = ctx.currentTime + Math.max(0, (t - Date.now()) / 1000)
    ;[659.25, 880].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = f
      const t0 = at + i * 0.28
      g.gain.setValueAtTime(0.0001, t0)
      g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4)
      o.connect(g).connect(ctx.destination)
      o.start(t0); o.stop(t0 + 1.5)
      pending.push(o)
    })
  }
  function cancelChimes() { pending.forEach((o) => { try { o.stop() } catch (e) {} }); pending = [] }
  function scheduleChimes() {
    cancelChimes()
    if (!s.running || !ctx) return
    const now = Date.now()
    if (s.phase === 'focus' && MODES[s.mode]) {
      const end = now + (focusLen() - elapsed(now))
      chimeAt(end)
      chimeAt(end + MODES[s.mode].rest * MIN)
    } else if (s.phase === 'break') {
      chimeAt(now + (s.len - elapsed(now)))
    }
  }

  // --- Transitions ----------------------------------------------------------------------------
  function startFocus(t) {
    s.phase = 'focus'; s.running = true; s.start = t; s.elapsed = 0; s.len = 0
    openSeg(t)
  }
  function endFocus(t) {
    const worked = elapsed(t)
    closeSeg(t)
    if (dayKey(t) === log.day) log.sessions++
    s.phase = 'break'; s.len = MODES[s.mode] ? MODES[s.mode].rest * MIN : flowBreak(worked)
    s.running = true; s.start = t; s.elapsed = 0
    openSeg(t)
    announce(T.breakNow.replace('{b}', minutes(s.len)))
  }
  function endBreak(t) {
    closeSeg(t)
    s.phase = 'idle'; s.running = false; s.elapsed = 0; s.len = 0
    announce(T.breakOver)
  }
  // Catches up on every phase that ended while the tab slept or was closed.
  function advance() {
    let changed = false
    for (let i = 0; i < 4 && s.running; i++) {
      const now = Date.now()
      if (s.phase === 'focus' && elapsed(now) >= focusLen()) { endFocus(s.start + (focusLen() - s.elapsed)); changed = true }
      else if (s.phase === 'break' && elapsed(now) >= s.len) { endBreak(s.start + (s.len - s.elapsed)); changed = true }
      else break
    }
    if (changed) save()
  }

  function toggle() {
    audio()
    const now = Date.now()
    if (s.phase === 'idle') { startFocus(now); announce(T.focusNow) }
    else if (s.running) { s.elapsed = elapsed(now); s.running = false; closeSeg(now); announce(T.paused) }
    else { s.running = true; s.start = now; openSeg(now); announce(T.resumed) }
    save(); scheduleChimes(); render()
  }
  function skip() {
    const now = Date.now()
    if (s.phase === 'focus') endFocus(now)
    else if (s.phase === 'break') endBreak(now)
    else return
    save(); scheduleChimes(); render()
  }
  function stop() {
    if (s.phase === 'idle') return
    closeSeg(Date.now())
    s.phase = 'idle'; s.running = false; s.elapsed = 0; s.len = 0
    cancelChimes(); save(); render(); announce(T.stopped)
  }
  function setMode(m, ask = true) {
    if (m === s.mode) return true
    if (s.phase !== 'idle' && ask && !confirm(T.confirmSwitch)) return false
    if (s.phase !== 'idle') stop()
    s.mode = m
    save(); render()
    return true
  }

  // --- Rendering ------------------------------------------------------------------------------
  const timeEl = $('time'), phaseEl = $('phase'), hintEl = $('hint'), prog = root.querySelector('.prog')
  const play = $('play'), skipBtn = $('skip'), stopBtn = $('stop')
  const liveEl = $('tlive')
  const baseTitle = document.title
  const clock = new Intl.DateTimeFormat(T.lang, { hour: 'numeric', minute: '2-digit' })
  const hourFmt = new Intl.DateTimeFormat(T.lang, { hour: 'numeric' })
  function minutes(ms) {
    const m = Math.round(ms / MIN)
    if (m < 60) return m + ' min'
    const h = Math.floor(m / 60), r = m % 60
    return h + ' h' + (r ? ' ' + r + ' min' : '')
  }
  function fmt(ms) {
    const t = Math.max(0, Math.round(ms / 1000))
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60
    const p = (n) => String(n).padStart(2, '0')
    return h ? h + ':' + p(m) + ':' + p(sec) : p(m) + ':' + p(sec)
  }
  function announce(text) { liveEl.textContent = ''; setTimeout(() => { liveEl.textContent = text }, 50) }

  function render() {
    const now = Date.now()
    const e = elapsed(now)
    let shown, frac, hint
    if (s.phase === 'idle') {
      shown = MODES[s.mode] ? MODES[s.mode].focus * MIN : 0
      frac = 0
      hint = T.idle[s.mode]
    } else if (s.phase === 'focus' && MODES[s.mode]) {
      shown = focusLen() - e
      frac = e / focusLen()
      hint = T.thenBreak.replace('{b}', minutes(MODES[s.mode].rest * MIN))
    } else if (s.phase === 'focus') {
      shown = e
      const m = e / MIN
      const next = RANGES.find(([up]) => m < up && up !== Infinity)
      if (next) {
        const lo = RANGES[RANGES.indexOf(next) - 1] ? RANGES[RANGES.indexOf(next) - 1][0] : 0
        const after = RANGES[RANGES.indexOf(next) + 1]
        frac = (m - lo) / (next[0] - lo)
        hint = T.hintAt.replace('{a}', next[0] + ' min').replace('{b}', after[1] + ' min').replace('{now}', minutes(flowBreak(e)))
      } else {
        frac = 1
        hint = T.hintMax.replace('{b}', minutes(flowBreak(e)))
      }
    } else {
      shown = s.len - e
      frac = e / s.len
      hint = T.backAt.replace('{t}', clock.format(new Date(now + s.len - e)))
    }
    const text = fmt(shown)
    timeEl.innerHTML = text.replace(/:/g, '<span class="colon">:</span>')
    timeEl.setAttribute('aria-label', text)
    phaseEl.textContent = s.phase === 'idle' ? T.ready : !s.running ? T.pausedLabel : s.phase === 'focus' ? T.focus : T.break
    hintEl.textContent = hint
    prog.style.strokeDashoffset = C * (1 - Math.min(1, Math.max(0, frac)))
    root.dataset.phase = s.phase
    play.setAttribute('aria-label', s.running ? T.pause : s.phase === 'idle' ? T.start : T.resume)
    play.querySelector('.i-play').style.display = s.running ? 'none' : ''
    play.querySelector('.i-pause').style.display = s.running ? '' : 'none'
    $('playcap').textContent = s.running ? T.pause : s.phase === 'idle' ? T.start : T.resume
    skipBtn.disabled = s.phase === 'idle'
    stopBtn.disabled = s.phase === 'idle'
    const skipLabel = s.phase === 'break' ? T.skipBreak : T.startBreak
    skipBtn.setAttribute('aria-label', skipLabel)
    $('skipcap').textContent = skipLabel
    root.querySelectorAll('input[name="mode"]').forEach((r) => { r.checked = r.value === s.mode })
    document.title = s.phase === 'idle' ? baseTitle : text + ' ' + (s.phase === 'focus' ? T.focus : T.break) + ' - FlowTime'
    favicon(frac)
    ruler(now)
  }

  // The tab icon is a small ring with the progress, readable in a row of tabs.
  const fav = document.querySelector('link[rel="icon"]')
  const favHref = fav.href
  const cv = document.createElement('canvas'); cv.width = cv.height = 64
  let lastFav = ''
  function favicon(frac) {
    if (s.phase === 'idle') { if (lastFav) { fav.href = favHref; lastFav = '' } return }
    const key = s.phase + Math.round(frac * 40)
    if (key === lastFav) return
    lastFav = key
    const g = cv.getContext('2d')
    g.clearRect(0, 0, 64, 64)
    g.fillStyle = '#15506A'; g.beginPath(); g.roundRect(0, 0, 64, 64, 14); g.fill()
    g.lineWidth = 8; g.lineCap = 'round'
    g.strokeStyle = '#2B6782'; g.beginPath(); g.arc(32, 32, 20, 0, Math.PI * 2); g.stroke()
    g.strokeStyle = s.phase === 'break' ? '#8FCFB5' : '#8ECAE6'
    g.beginPath(); g.arc(32, 32, 20, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.02, Math.min(1, frac))); g.stroke()
    fav.href = cv.toDataURL('image/png')
  }

  const rail = $('rail'), ticks = $('ticks'), todayEl = $('today')
  function ruler(now) {
    if (!rail) return
    if (log.day !== dayKey(now)) log = { day: dayKey(now), seg: [], sessions: 0 }
    const segs = log.seg.slice()
    if (s.seg && s.running) segs.push({ k: s.phase === 'break' ? 'b' : 'f', s: s.seg, e: now })
    const H = 3600000
    const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0)
    const first = segs.length ? Math.min(segs[0].s, now) : now
    let from = Math.max(dayStart.getTime(), Math.floor((first - dayStart) / H) * H + dayStart.getTime())
    if (!segs.length) from = Math.max(dayStart.getTime(), from - H)
    let to = Math.max(from + 4 * H, Math.ceil((now - dayStart) / H) * H + dayStart.getTime() + H)
    to = Math.min(to, dayStart.getTime() + 24 * H)
    const x = (t) => ((t - from) / (to - from)) * 100
    rail.innerHTML = segs.map((g) => `<span class="blk${g.k === 'b' ? ' b' : ''}" style="left:${x(g.s)}%;width:${x(g.e) - x(g.s)}%"></span>`).join('') +
      `<span class="now" style="left:${x(now)}%"></span>` + (segs.length ? '' : `<span class="empty">${T.rulerEmpty}</span>`)
    const hours = (to - from) / H
    const step = hours > 8 ? 2 : 1
    let tk = ''
    for (let t = from; t <= to; t += step * H) tk += `<span style="left:${x(t)}%">${hourFmt.format(new Date(t))}</span>`
    ticks.innerHTML = tk
    const focusMs = segs.filter((g) => g.k === 'f').reduce((a, g) => a + g.e - g.s, 0)
    todayEl.innerHTML = T.today.replace('{t}', '<b>' + minutes(focusMs) + '</b>').replace('{n}', log.sessions)
  }

  // --- Wiring ---------------------------------------------------------------------------------
  play.addEventListener('click', toggle)
  skipBtn.addEventListener('click', skip)
  stopBtn.addEventListener('click', stop)
  root.querySelectorAll('input[name="mode"]').forEach((r) => r.addEventListener('change', () => { if (!setMode(r.value)) render() }))
  document.addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || e.target.closest('button, input, a, textarea, select')) return
    e.preventDefault(); toggle()
  })
  document.addEventListener('visibilitychange', () => { advance(); render() })
  // After a reload the timer may already be running: the first touch anywhere re-arms the chimes.
  document.addEventListener('pointerdown', () => { if (!ctx) { audio(); scheduleChimes() } }, { once: true })
  window.FT = {
    start(mode) {
      if (!setMode(mode)) return
      if (s.phase === 'idle' || !s.running) toggle()
      root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
      play.focus({ preventScroll: true })
    },
  }
  document.querySelectorAll('[data-start]').forEach((b) => b.addEventListener('click', () => window.FT.start(b.dataset.start)))

  advance()
  render()
  setInterval(() => { advance(); render() }, 1000)
})()
