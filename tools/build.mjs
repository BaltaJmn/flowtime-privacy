// Builds the FlowTime web pages (timer, Flowtime technique, finals week, exam season) in en and es,
// sitemap.xml and robots.txt. Run after changing a text here; the output is committed as plain files.
//
//   node tools/build.mjs && node tools/og.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://flowtime.baltajmn.dev'
const TODAY = new Date().toISOString().slice(0, 10)
// Cloudflare and browsers keep CSS and JS for a while: the URL changes when the file does.
const v = (p) => `${p}?v=${createHash('md5').update(readFileSync(join(ROOT, p))).digest('hex').slice(0, 8)}`

// Campaign tokens: the app has no analytics, so the stores are the only place a web install shows up.
// App Store: `pt` is the provider token (App Store Connect > App Analytics > Campaigns); without it Apple
// ignores `ct`, so it is left out until it is known.
const APPLE_PT = '129564006' // provider ID of the developer account, as App Store Connect puts it in its campaign links
const play = (c) => `https://play.google.com/store/apps/details?id=com.baltajmn.flowtime&referrer=${encodeURIComponent(`utm_source=flowtime.baltajmn.dev&utm_medium=web&utm_campaign=${c}`)}`
const apple = (c) => `https://apps.apple.com/app/apple-store/id6819302003?${APPLE_PT ? `pt=${APPLE_PT}&` : ''}ct=${c}&mt=8`

export const PAGES = {
  timer: { en: '/pomodoro/', es: '/es/pomodoro/' },
  technique: { en: '/flowtime-technique/', es: '/es/tecnica-flowtime/' },
  finals: { en: '/finals-week/' },
  exams: { en: '/exam-season/', es: '/es/epoca-de-examenes/' },
}
const LOCALE = { en: 'en_US', es: 'es_ES' }
const LANG_NAME = { en: 'English', es: 'Español' }

const UI = {
  en: {
    lang: 'en', start: 'Start', pause: 'Pause', resume: 'Resume', stop: 'Stop', startBreak: 'Start break', skipBreak: 'Skip break',
    ready: 'Ready', focus: 'Focus', break: 'Break', pausedLabel: 'Paused',
    idle: { p25: '25 min focus, then a 5 min break', p50: '50 min focus, then a 10 min break', flow: 'Counts up. Your break depends on how long you work.' },
    thenBreak: 'Then a {b} break', hintAt: 'At {a}, {b} break', hintMax: '{b} break when you stop', backAt: 'Back to focus at {t}',
    breakNow: 'Break: {b}', breakOver: "Break over. Press start when you're ready.", focusNow: 'Focus started', paused: 'Paused', resumed: 'Resumed', stopped: 'Stopped',
    confirmSwitch: 'Stop the current timer and switch mode?',
    today: 'Focus today: {t}. Sessions done: {n}',
    rulerEmpty: 'Your focus and breaks will show up here as you go.',
  },
  es: {
    lang: 'es', start: 'Empezar', pause: 'Pausar', resume: 'Seguir', stop: 'Parar', startBreak: 'Empezar descanso', skipBreak: 'Saltar descanso',
    ready: 'Listo', focus: 'Concentración', break: 'Descanso', pausedLabel: 'En pausa',
    idle: { p25: '25 min de concentración y 5 de descanso', p50: '50 min de concentración y 10 de descanso', flow: 'Cuenta hacia arriba. El descanso depende de cuánto trabajes.' },
    thenBreak: 'Después, {b} de descanso', hintAt: 'A los {a}, {b} de descanso', hintMax: '{b} de descanso al parar', backAt: 'Vuelves a concentrarte a las {t}',
    breakNow: 'Descanso: {b}', breakOver: 'Se acabó el descanso. Dale a empezar cuando quieras.', focusNow: 'Empieza la concentración', paused: 'En pausa', resumed: 'Seguimos', stopped: 'Parado',
    confirmSwitch: '¿Parar el temporizador y cambiar de modo?',
    today: 'Hoy: {t} de concentración. Sesiones completas: {n}',
    rulerEmpty: 'Aquí irán apareciendo tus bloques de concentración y descanso.',
  },
}

const COMMON = {
  en: {
    nav: { timer: 'Timer', technique: 'Flowtime technique', finals: 'Finals week', exams: 'Exam season', privacy: 'Privacy' },
    modes: 'Timer mode',
    legendFocus: 'Focus', legendBreak: 'Break',
    keys: '<kbd>Space</kbd> starts or pauses',
    offer: 'On your phone, FlowTime shows the timer in a notification and a widget, and Coop lets up to 8 people share one. <a href="#app">Get FlowTime</a>',
    appH: 'FlowTime on your phone',
    appP1: "The same Pomodoro and FlowTime modes with your own times, plus a third one, Percentage, and what a browser tab can't do: the timer in a notification and a widget, today's tasks, 12 focus sounds, and your streak, goal and stats.",
    appP2: 'Coop is a private room where up to 8 people share one timer: anyone can start, pause or skip the break, so you can study together from different places.',
    appP3: 'Free, with no ads and no account. Only Coop asks you to sign in.',
    appAlt: 'FlowTime on Android: a focus session counting up, at 42:10',
    iosSoon: 'FlowTime is coming to iPhone soon.',
    footer: 'FlowTime: Pomodoro Focus Timer, by Baltasar Jiménez.',
    start: 'Start',
    worked: 'Worked', breakCol: 'Break',
    ranges: [['Up to 15 min', '5 min'], ['Over 15, up to 30 min', '10 min'], ['More than 30 min', '15 min']],
  },
  es: {
    nav: { timer: 'Temporizador', technique: 'Técnica Flowtime', exams: 'Exámenes', privacy: 'Privacidad' },
    modes: 'Modo del temporizador',
    legendFocus: 'Concentración', legendBreak: 'Descanso',
    keys: '<kbd>Espacio</kbd> empieza o pausa',
    offer: 'En el móvil, FlowTime muestra el temporizador en una notificación y en un widget, y con Coop hasta 8 personas comparten uno. <a href="#app">Consigue FlowTime</a>',
    appH: 'FlowTime en el móvil',
    appP1: 'Los mismos modos Pomodoro y FlowTime con tus propios tiempos, un tercero (Porcentaje) y lo que una pestaña del navegador no puede hacer: el temporizador en una notificación y en un widget, las tareas del día, 12 sonidos para concentrarte, tu racha, tu objetivo y tus estadísticas.',
    appP2: 'Coop es una sala privada donde hasta 8 personas comparten un temporizador: cualquiera puede empezar, pausar o saltar el descanso, así que podéis estudiar juntos desde sitios distintos.',
    appP3: 'Gratis, sin anuncios y sin cuenta. Solo Coop te pide iniciar sesión.',
    appAlt: 'FlowTime en Android: una sesión de concentración contando hacia arriba, en 42:10',
    iosSoon: 'FlowTime llega pronto al iPhone.',
    footer: 'FlowTime: temporizador Pomodoro, de Baltasar Jiménez.',
    start: 'Empezar',
    worked: 'Trabajado', breakCol: 'Descanso',
    ranges: [['Hasta 15 min', '5 min'], ['Más de 15, hasta 30 min', '10 min'], ['Más de 30 min', '15 min']],
  },
}

// A study day: [time, title, text, mode or null for a rest block, label of the mode].
const DAY = {
  finals: [
    ['08:30', 'Warm up', "Review yesterday's notes and write down today's three goals.", 'p25', '1 x 25/5'],
    ['09:00', 'Hardest subject', 'Three 50-minute blocks on the exam that worries you most. Phone in another room.', 'p50', '3 x 50/10'],
    ['12:00', 'Lunch, away from screens', '', null],
    ['13:00', 'Practice exams and problems', 'Shorter blocks for the afternoon dip: four rounds of 25/5, timed like the real exam.', 'p25', '4 x 25/5'],
    ['15:00', 'Walk outside for 20 minutes', '', null],
    ['15:30', 'Second subject', 'FlowTime: work until your focus fades, then take the break it gives you.', 'flow', 'FlowTime'],
    ['17:30', 'Dinner and a real break', '', null],
    ['19:00', 'Active recall', 'Flashcards, practice questions, explaining it out loud. Three rounds of 25/5.', 'p25', '3 x 25/5'],
    ['20:30', 'Plan tomorrow in five minutes, then stop', '', null],
  ],
  examsEn: [
    ['08:30', 'Warm up', "Look over yesterday's mistakes and pick today's topics.", 'p25', '1 x 25/5'],
    ['09:00', 'Your weakest topic', 'Three 50-minute blocks while your head is fresh.', 'p50', '3 x 50/10'],
    ['12:00', 'Lunch, away from your desk', '', null],
    ['13:00', 'Past papers, timed', 'Do a paper under exam conditions in 25-minute rounds, then mark it.', 'p25', '4 x 25/5'],
    ['15:00', "Get outside while it's light", '', null],
    ['15:30', 'Second subject', 'FlowTime: work until your focus fades, then take the break it gives you.', 'flow', 'FlowTime'],
    ['17:30', 'Dinner', '', null],
    ['19:00', 'Recall', 'Flashcards and blurting: write down everything you remember, then check what you missed.', 'p25', '3 x 25/5'],
    ['20:30', 'Plan tomorrow, then stop', '', null],
  ],
  examsEs: [
    ['08:30', 'Calentamiento', 'Repasa los fallos de ayer y elige los temas de hoy.', 'p25', '1 x 25/5'],
    ['09:00', 'La asignatura más difícil', 'Cuatro bloques de 50 minutos con la cabeza fresca. El móvil, en otra habitación.', 'p50', '4 x 50/10'],
    ['13:00', 'Problemas o test', 'Dos rondas cortas antes de comer.', 'p25', '2 x 25/5'],
    ['14:00', 'Comida, lejos de la mesa de estudio', '', null],
    ['15:30', 'Exámenes de otros años', 'Haz uno con el tiempo del examen real, en rondas de 25 minutos, y corrígelo.', 'p25', '4 x 25/5'],
    ['17:30', 'Sal a la calle mientras haya luz', '', null],
    ['18:00', 'Segunda asignatura', 'FlowTime: estudia hasta que se te vaya la concentración y toma el descanso que te da.', 'flow', 'FlowTime'],
    ['20:00', 'Repaso activo', 'Tarjetas de estudio, preguntas tipo test, explicarlo en voz alta. Dos rondas de 25/5.', 'p25', '2 x 25/5'],
    ['21:00', 'Cena. Planifica mañana en cinco minutos y para', '', null],
  ],
}

const P = {
  timer: {
    en: {
      title: 'Free Pomodoro Timer Online: 25/5, 50/10 and FlowTime',
      desc: 'Free Pomodoro timer in your browser: 25/5, 50/10 or FlowTime, which counts up and gives you a break that fits how long you worked. No sign-up, no ads.',
      h1: 'Pomodoro timer',
      sub: '25/5, 50/10 or FlowTime. It keeps time in a background tab and chimes when each phase ends.',
      mode: 'p25',
      sections: [
        ['How to use this Pomodoro timer', [
          ['Pick a rhythm', '25/5 is the classic Pomodoro: 25 minutes of focus, then a 5 minute break. 50/10 suits deep work, reading or problem sets, where 25 minutes ends just as you get going.'],
          ['Press start and keep the tab', 'The timer runs on the clock, so it stays right in a background tab. A soft chime plays when focus ends and again when the break is over.'],
          ['Take a real break', 'Stand up, look away from the screen, drink some water. When the second chime plays, press start for the next block.'],
        ]],
        ['Which one to use', [
          ['25/5', 'When starting is the hard part, when you are tired, or for review and small tasks.'],
          ['50/10', 'For work that needs a warm-up: writing, coding, a chapter, a problem set.'],
          ['FlowTime', "When you don't want a bell to cut you off. Work until you stop; the break fits what you did."],
        ]],
      ],
      flowH: 'The FlowTime mode',
      flowP: 'FlowTime counts up instead of down. Work until you reach a natural stop, then press Start break: the break depends on how long you worked.',
      flowLink: ['More on the Flowtime technique', 'technique'],
    },
    es: {
      title: 'Temporizador Pomodoro online: 25/5, 50/10 y FlowTime, gratis',
      desc: 'Temporizador Pomodoro gratis en el navegador: 25/5, 50/10 o FlowTime, que cuenta hacia arriba y ajusta el descanso a lo trabajado. Sin registro ni anuncios.',
      h1: 'Temporizador Pomodoro',
      sub: 'La técnica Pomodoro en tu navegador: 25/5, 50/10 o FlowTime. Sigue contando en una pestaña de fondo y suena al acabar cada fase.',
      mode: 'p25',
      sections: [
        ['Cómo usar este temporizador Pomodoro', [
          ['Elige un ritmo', '25/5 es el Pomodoro clásico: 25 minutos de concentración y 5 de descanso. 50/10 va mejor para estudiar a fondo, leer o hacer problemas: a los 25 minutos apenas estás cogiendo ritmo.'],
          ['Dale a empezar y deja la pestaña', 'El temporizador va con el reloj, así que no se desajusta en una pestaña de fondo. Suena un aviso suave al acabar la concentración y otro al acabar el descanso.'],
          ['Descansa de verdad', 'Levántate, aparta la vista de la pantalla, bebe agua. Cuando suene el segundo aviso, dale a empezar para el siguiente bloque.'],
        ]],
        ['Qué ritmo elegir', [
          ['25/5', 'Cuando lo difícil es empezar, cuando vas con poca energía o para repasar y hacer tareas pequeñas.'],
          ['50/10', 'Para lo que necesita calentar: escribir, programar, un tema entero, una hoja de problemas.'],
          ['FlowTime', 'Cuando no quieres que un aviso te corte. Trabaja hasta que pares; el descanso se ajusta a lo que has trabajado.'],
        ]],
      ],
      flowH: 'El modo FlowTime',
      flowP: 'FlowTime cuenta hacia arriba en vez de hacia abajo. Trabaja hasta una pausa natural y dale a Empezar descanso: el descanso depende de lo que hayas trabajado.',
      flowLink: ['Más sobre la técnica Flowtime', 'technique'],
    },
  },
  technique: {
    en: {
      title: 'Flowtime Technique: Free Online Timer and How It Works',
      desc: 'The Flowtime technique explained, with a free timer: work until your focus fades, then take a break that fits how long you worked. Flowtime vs Pomodoro.',
      h1: 'The Flowtime technique',
      sub: 'Work for as long as your focus lasts, then take a break that fits. A free Flowtime timer, how it works and how it compares with Pomodoro.',
      mode: 'flow',
      whatH: 'What is the Flowtime technique?',
      what: [
        'Flowtime is a way of timing your work without a fixed countdown. You start a timer, work on one task, and stop when your attention starts to drift or the task reaches a natural end. Then you rest for a time that depends on how long you worked: a short session earns a short break, a long one a longer break.',
        'It suits work that takes a while to get into, like writing, coding or studying a hard topic, where a 25 minute bell can interrupt you at the worst moment.',
      ],
      breakH: 'How long should the break be?',
      breakP: "This timer uses the FlowTime app's default ranges:",
      breakNote: 'In the app you can change these ranges or add your own.',
      vsH: 'Flowtime vs Pomodoro',
      vsHead: ['', 'Pomodoro', 'Flowtime'],
      vs: [
        ['Session length', 'Fixed, usually 25 minutes', 'As long as your focus lasts'],
        ['Breaks', 'Fixed, usually 5 minutes', 'Longer after longer work'],
        ['Best for', "Getting started, review, tasks you've been putting off", 'Deep work: writing, coding, problem sets'],
        ['Watch out for', 'The bell cutting you off mid-thought', 'Forgetting to stop: notice when you start rereading the same line'],
      ],
      vsP: 'You can use both: Pomodoro to get going in the morning, Flowtime once you are in the zone. The timer above switches between them.',
      howH: 'How to start',
      how: ['Pick one task and write it down.', 'Start the timer in FlowTime mode and work.', 'When your focus fades, press Start break.', 'Rest for the time shown, then pick the next task.'],
    },
    es: {
      title: 'Técnica Flowtime: temporizador gratis y cómo funciona',
      desc: 'La técnica Flowtime explicada, con temporizador gratis: trabaja hasta perder la concentración y descansa según lo trabajado. Flowtime frente a Pomodoro.',
      h1: 'La técnica Flowtime',
      sub: 'Trabaja mientras te dure la concentración y descansa lo que te toca. Un temporizador Flowtime gratis, cómo funciona y en qué se diferencia del Pomodoro.',
      mode: 'flow',
      whatH: '¿Qué es la técnica Flowtime?',
      what: [
        'Flowtime es una forma de medir el trabajo sin cuenta atrás fija. Pones el temporizador, trabajas en una sola tarea y paras cuando se te empieza a ir la atención o la tarea llega a un final natural. Luego descansas un tiempo que depende de lo que hayas trabajado: una sesión corta da un descanso corto, y una larga, uno más largo.',
        'Va bien con las tareas en las que cuesta entrar, como escribir, programar o estudiar un tema difícil, donde un aviso a los 25 minutos puede cortarte en el peor momento.',
      ],
      breakH: '¿Cuánto debe durar el descanso?',
      breakP: 'Este temporizador usa los tramos por defecto de la app FlowTime:',
      breakNote: 'En la app puedes cambiar estos tramos o añadir los tuyos.',
      vsH: 'Flowtime frente a Pomodoro',
      vsHead: ['', 'Pomodoro', 'Flowtime'],
      vs: [
        ['Duración', 'Fija, normalmente 25 minutos', 'Lo que te dure la concentración'],
        ['Descansos', 'Fijos, normalmente 5 minutos', 'Más largos tras más trabajo'],
        ['Mejor para', 'Arrancar, repasar, tareas que llevas días aplazando', 'Trabajo a fondo: escribir, programar, hojas de problemas'],
        ['Ojo con', 'Que el aviso te corte a mitad de una idea', 'Olvidarte de parar: fíjate en cuándo empiezas a releer la misma línea'],
      ],
      vsP: 'Puedes usar los dos: Pomodoro para arrancar por la mañana y Flowtime cuando ya has cogido ritmo. El temporizador de arriba cambia entre ellos.',
      howH: 'Cómo empezar',
      how: ['Elige una sola tarea y apúntala.', 'Pon el temporizador en modo FlowTime y trabaja.', 'Cuando se te vaya la concentración, dale a Empezar descanso.', 'Descansa el tiempo que marca y elige la siguiente tarea.'],
    },
  },
  finals: {
    en: {
      title: 'Finals Week Study Plan: A Day Schedule With a Built-In Timer',
      desc: 'A finals week study schedule you can start now: focus blocks, practice exams and active recall, with a free Pomodoro and FlowTime timer built in.',
      h1: 'Finals week study plan, one block at a time',
      sub: 'A finals week study schedule for one full day, with the timer built in. Press start on any block and keep the tab open.',
      mode: 'p50',
      dayH: 'A finals week study day',
      dayP: 'Long blocks in the morning, shorter ones after lunch, recall in the evening. Move the times to fit your exams; keep the order.',
      day: DAY.finals,
      tipsH: 'Make the schedule work',
      tips: [
        ['Sleep is part of the plan', 'Sleep helps your memory hold on to what you studied. A 1 a.m. session usually costs you the next morning.'],
        ["Test yourself, don't reread", 'Practice questions and recall stick better than rereading notes, and they show you what you still miss.'],
        ['Study with someone', "A friend on the same timer makes it harder to quit early. That's what Coop is for."],
      ],
    },
  },
  exams: {
    en: {
      title: 'Exam Season Revision Plan: Day Timetable and Study Timer',
      desc: 'A revision timetable for one day of January exams, with a free Pomodoro and FlowTime timer built in: long blocks, past papers, recall.',
      h1: 'Exam season revision timetable, block by block',
      sub: 'A revision timetable for one day of January exams, with the timer built in. Press start on any block and keep the tab open.',
      mode: 'p50',
      dayH: 'A revision day',
      dayP: 'Long blocks in the morning, past papers after lunch, recall in the evening. Move the times to fit your exams; keep the order.',
      day: DAY.examsEn,
      tipsH: 'Building your revision timetable',
      tips: [
        ['Work back from exam dates', 'Put each exam in the calendar, then give the nearest and the hardest ones the most mornings.'],
        ['One subject per long block', "Switching subjects every hour feels productive, but each switch costs you time to get back in. Keep each morning for one."],
        ['Leave one evening off a week', 'A planned night off is easier to keep than an unplanned collapse.'],
      ],
    },
    es: {
      title: 'Época de exámenes: plan de estudio diario con temporizador',
      desc: 'Plan de estudio para los exámenes de enero, con temporizador Pomodoro y FlowTime gratis: bloques largos, exámenes de otros años y repaso por la noche.',
      h1: 'Época de exámenes, bloque a bloque',
      sub: 'Un día de estudio para los exámenes de enero, con el temporizador dentro. Dale a empezar en cualquier bloque y deja la pestaña abierta.',
      mode: 'p50',
      dayH: 'Un día de estudio',
      dayP: 'Bloques largos por la mañana, exámenes de otros años por la tarde y repaso activo por la noche. Ajusta las horas a tu horario; mantén el orden.',
      day: DAY.examsEs,
      tipsH: 'Cómo organizar la época de exámenes',
      tips: [
        ['Empieza por las fechas', 'Apunta cada examen en el calendario y da más mañanas al más cercano y al más difícil.'],
        ['Una asignatura por bloque largo', 'Cambiar de asignatura cada hora parece productivo, pero cada cambio te cuesta volver a entrar. Dedica cada mañana a una sola.'],
        ['Una tarde libre a la semana', 'Un descanso previsto se cumple mejor que un bajón imprevisto.'],
      ],
    },
  },
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const ICON = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m0 0-5.5-5.5M19 12l-5.5 5.5"/></svg>',
  play: '<svg class="i-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6Z"/></svg>',
  pause: '<svg class="i-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6.5" y="6.5" width="11" height="11" rx="2"/></svg>',
  skip: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 6.3v11.4a.9.9 0 0 0 1.4.75l8.3-5.7a.9.9 0 0 0 0-1.5L7.4 5.55A.9.9 0 0 0 6 6.3Z"/><rect x="16.5" y="5.5" width="2.5" height="13" rx="1"/></svg>',
}

function head(kind, lang, t) {
  const url = SITE + PAGES[kind][lang]
  const langs = Object.keys(PAGES[kind])
  const alts = langs.length > 1 ? langs.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE + PAGES[kind][l]}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${SITE + PAGES[kind].en}">` : ''
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.title)}</title>
<meta name="description" content="${esc(t.desc)}">
<link rel="canonical" href="${url}">
${alts}
<meta property="og:type" content="website">
<meta property="og:site_name" content="FlowTime">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${esc(t.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/ft/og/${kind}-${lang}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${LOCALE[lang]}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#15506A">
<link rel="icon" href="/ft/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/ft/icon-180.png">
<link rel="preload" href="/ft/mulish.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${v('/ft/ft.css')}">`
}

function header(kind, lang) {
  const c = COMMON[lang]
  const links = Object.keys(PAGES).filter((k) => PAGES[k][lang])
  const other = (l) => PAGES[kind][l] || PAGES.timer[l]
  const langs = Object.keys(LOCALE).map((l) => `<a href="${other(l)}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="page"' : ''}><span aria-hidden="true">${l.toUpperCase()}</span><span class="sr">${LANG_NAME[l]}</span></a>`).join('')
  return `<header class="wrap top">
<a class="brand" href="${PAGES.timer[lang]}"><img src="/ft/icon.svg" alt="" width="30" height="30">FlowTime</a>
<nav aria-label="FlowTime">
${links.map((k) => `<a href="${PAGES[k][lang]}"${k === kind ? ' aria-current="page"' : ''}>${esc(c.nav[k])}</a>`).join('\n')}
<span class="langs">${langs}</span>
</nav>
</header>`
}

function timer(lang, mode) {
  const c = COMMON[lang]
  const u = UI[lang]
  const label = (m) => ({ p25: '25 / 5', p50: '50 / 10', flow: 'FlowTime' })[m]
  return `<div class="timer" id="timer" data-mode="${mode}" data-phase="idle">
<fieldset class="modes"><legend class="sr">${esc(c.modes)}</legend>
${['p25', 'p50', 'flow'].map((m) => `<label><input type="radio" name="mode" value="${m}"${m === mode ? ' checked' : ''}><span>${label(m)}</span></label>`).join('')}
</fieldset>
<div class="dial">
<svg viewBox="0 0 200 200" aria-hidden="true"><circle class="track" cx="100" cy="100" r="88"/><circle class="prog" cx="100" cy="100" r="88" stroke-dasharray="552.92" stroke-dashoffset="552.92"/></svg>
<div class="read"><span class="phase" id="phase">${esc(u.ready)}</span><span class="time" id="time" role="timer">${mode === 'p50' ? '50:00' : mode === 'flow' ? '00:00' : '25:00'}</span><span class="hint" id="hint">${esc(u.idle[mode])}</span></div>
</div>
<div class="ctrl">
<figure><button class="round" id="stop" type="button" aria-label="${esc(u.stop)}" disabled>${ICON.stop}</button><figcaption aria-hidden="true">${esc(u.stop)}</figcaption></figure>
<figure><button class="round main" id="play" type="button" aria-label="${esc(u.start)}">${ICON.play}${ICON.pause.replace('<svg ', '<svg style="display:none" ')}</button><figcaption id="playcap" aria-hidden="true">${esc(u.start)}</figcaption></figure>
<figure><button class="round" id="skip" type="button" aria-label="${esc(u.startBreak)}" disabled>${ICON.skip}</button><figcaption id="skipcap" aria-hidden="true">${esc(u.startBreak)}</figcaption></figure>
</div>
<p class="keys">${c.keys}</p>
<p class="today" id="today"></p>
<div class="ruler" aria-hidden="true"><div class="rail" id="rail"></div><div class="ticks" id="ticks"></div>
<p class="legend"><span><i></i>${esc(c.legendFocus)}</span><span><i class="b"></i>${esc(c.legendBreak)}</span></p></div>
<p class="sr" id="tlive" aria-live="polite"></p>
</div>
<script type="application/json" id="ft-t">${JSON.stringify(u)}</script>`
}

function app(kind, lang) {
  const c = COMMON[lang]
  const camp = `ft-${kind}-${lang}`
  return `<section class="band deep" id="app"><div class="wrap split">
<div>
<h2>${esc(c.appH)}</h2>
<p>${esc(c.appP1)}</p>
<p>${esc(c.appP2)}</p>
<p class="note">${esc(c.appP3)}</p>
<div class="stores">
<a class="btn fill" data-store="play" href="${esc(play(camp))}">Google Play ${ICON.arrow}</a>
<a class="btn" data-store="apple" href="${esc(apple(camp))}" hidden>App Store ${ICON.arrow}</a>
</div>
<p class="note" id="ios-soon" hidden>${esc(c.iosSoon)}</p>
</div>
<img src="/ft/img/app-${lang}.webp" alt="${esc(c.appAlt)}" width="640" height="1134" loading="lazy">
</div></section>`
}

// Android sees Play; iPhone sees the App Store once the iTunes lookup finds FlowTime, and a "coming
// soon" line until then; a computer sees both, the App Store only once it is live.
const STORE_JS = `<script>(function(){var u=navigator.userAgent||"",a=/Android/i.test(u),i=/iPhone|iPad|iPod/i.test(u)||(/Macintosh/i.test(u)&&navigator.maxTouchPoints>1);
var P=document.querySelectorAll('[data-store="play"]'),A=document.querySelectorAll('[data-store="apple"]'),S=document.getElementById("ios-soon");
if(i)P.forEach(function(e){e.hidden=true});if(a)return;
fetch("https://itunes.apple.com/lookup?id=6819302003&t="+Math.floor(Date.now()/36e5)).then(function(r){return r.json()}).then(function(j){return j.resultCount>0}).catch(function(){return false}).then(function(live){
if(live){A.forEach(function(e){e.hidden=false;if(i)e.classList.add("fill")})}else if(S){S.hidden=false}})})()</script>`

// A visitor who arrives with utm_* (a Pinterest pin, a newsletter) takes that origin to the store instead of
// the page's own web campaign, so the consoles tell the channels apart. Values are cut to [a-z0-9_-], 40 chars.
const UTM_JS = `<script>(function(){var q=new URLSearchParams(location.search),c=function(v){return(v||"").toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,40)},s=c(q.get("utm_source"));if(!s)return;var m=c(q.get("utm_medium"))||"referral",n=c(q.get("utm_campaign"))||"none";
document.querySelectorAll('[data-store="play"]').forEach(function(e){var x=new URL(e.href);x.searchParams.set("referrer","utm_source="+s+"&utm_medium="+m+"&utm_campaign="+n);e.href=x});
document.querySelectorAll('[data-store="apple"]').forEach(function(e){var x=new URL(e.href);x.searchParams.set("ct",(s+"-"+n).slice(0,40));e.href=x})})()</script>`


function footer(lang) {
  const c = COMMON[lang]
  const links = Object.keys(PAGES).filter((k) => PAGES[k][lang])
  return `<footer><div class="wrap"><span>${esc(c.footer)}</span><nav aria-label="${esc(c.nav.privacy)}">
${links.map((k) => `<a href="${PAGES[k][lang]}">${esc(c.nav[k])}</a>`).join('')}<a href="/">${esc(c.nav.privacy)}</a></nav></div></footer>`
}

const appLd = () => ({
  '@type': 'MobileApplication',
  name: 'FlowTime: Pomodoro Focus Timer',
  operatingSystem: 'Android',
  applicationCategory: 'ProductivityApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  sameAs: ['https://play.google.com/store/apps/details?id=com.baltajmn.flowtime'],
})
const webLd = (kind, lang, name) => ({
  '@type': 'WebApplication',
  name,
  url: SITE + PAGES[kind][lang],
  inLanguage: lang,
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
})
const ld = (graph) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`

function rangesTable(lang) {
  const c = COMMON[lang]
  return `<div class="tablewrap"><table class="ranges"><thead><tr><th scope="col">${esc(c.worked)}</th><th scope="col">${esc(c.breakCol)}</th></tr></thead><tbody>
${c.ranges.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</tbody></table></div>`
}

function page(kind, lang) {
  const t = P[kind][lang]
  const c = COMMON[lang]
  let body, graph
  if (kind === 'timer' || kind === 'technique') {
    graph = [webLd(kind, lang, t.h1), appLd()]
    let reading
    if (kind === 'timer') {
      reading = t.sections.map(([h, items], i) => `<section class="band${i % 2 ? ' deep' : ''}"><div class="wrap"><h2>${esc(h)}</h2><div class="cols">${items.map(([a, b]) => `<div><h3>${esc(a)}</h3><p>${esc(b)}</p></div>`).join('')}</div></div></section>`).join('\n') +
        `\n<section class="band"><div class="wrap"><h2>${esc(t.flowH)}</h2><p>${esc(t.flowP)}</p>${rangesTable(lang)}<p><a href="${PAGES[t.flowLink[1]][lang]}">${esc(t.flowLink[0])}</a></p></div></section>`
    } else {
      graph.push({ '@type': 'HowTo', name: t.howH, inLanguage: lang, step: t.how.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })) })
      reading = `<section class="band"><div class="wrap"><h2>${esc(t.whatH)}</h2>${t.what.map((p) => `<p>${esc(p)}</p>`).join('')}</div></section>
<section class="band deep"><div class="wrap"><h2>${esc(t.breakH)}</h2><p>${esc(t.breakP)}</p>${rangesTable(lang)}<p class="note">${esc(t.breakNote)}</p></div></section>
<section class="band"><div class="wrap"><h2>${esc(t.vsH)}</h2><div class="tablewrap"><table class="vs"><thead><tr>${t.vsHead.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>
${t.vs.map(([a, b, d]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td><td>${esc(d)}</td></tr>`).join('\n')}</tbody></table></div><p style="margin-top:20px">${esc(t.vsP)}</p></div></section>
<section class="band deep"><div class="wrap"><h2>${esc(t.howH)}</h2><ol class="ticks-list">${t.how.map((h) => `<li>${esc(h)}</li>`).join('')}</ol></div></section>`
    }
    body = `<section class="wrap tool">
<div class="tool-title"><h1>${esc(t.h1)}</h1><p>${esc(t.sub)}</p></div>
${timer(lang, t.mode)}
<p class="offer" style="margin:22px auto 0">${c.offer}</p>
</section>
${reading}`
  } else {
    graph = [webLd(kind, lang, t.h1), appLd(), {
      '@type': 'HowTo', name: t.dayH, inLanguage: lang,
      step: t.day.map(([time, title, text], i) => ({ '@type': 'HowToStep', position: i + 1, name: `${time} ${title}`, text: text || title })),
    }]
    const rows = t.day.map(([time, title, text, mode, label]) => mode
      ? `<li><time>${time}</time><span class="bar" aria-hidden="true"></span><div><h3>${esc(title)}</h3><p>${esc(text)}</p><span class="mode">${esc(label)}</span></div><button class="btn" type="button" data-start="${mode}" aria-label="${esc(c.start)}: ${esc(title)}, ${esc(label)}">${esc(c.start)} ${ICON.arrow}</button></li>`
      : `<li class="rest"><time>${time}</time><span class="bar" aria-hidden="true"></span><div><h3>${esc(title)}</h3></div></li>`).join('\n')
    body = `<section class="wrap season">
<div><h1>${esc(t.h1)}</h1><p class="lede">${esc(t.sub)}</p>
<div class="season-cta"><a class="btn" href="#day">${esc(t.dayH)} ${ICON.arrow}</a></div></div>
${timer(lang, t.mode)}
</section>
<section class="band" id="day"><div class="wrap"><h2>${esc(t.dayH)}</h2><p>${esc(t.dayP)}</p><ol class="day">
${rows}
</ol></div></section>
<section class="band deep"><div class="wrap"><h2>${esc(t.tipsH)}</h2><div class="cols">${t.tips.map(([a, b]) => `<div><h3>${esc(a)}</h3><p>${esc(b)}</p></div>`).join('')}</div></div></section>`
  }
  return `${head(kind, lang, t)}
${ld(graph)}
<script src="${v('/ft/timer.js')}" defer></script>
</head>
<body>
${header(kind, lang)}
<main>
${body}
${app(kind, lang)}
</main>
${footer(lang)}
${UTM_JS}
${STORE_JS}
</body>
</html>
`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const urls = []
  for (const kind of Object.keys(PAGES)) {
    for (const lang of Object.keys(PAGES[kind])) {
      const dir = join(ROOT, PAGES[kind][lang])
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, 'index.html'), page(kind, lang))
      const langs = Object.keys(PAGES[kind])
      const alts = langs.length > 1 ? langs.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${SITE + PAGES[kind][l]}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE + PAGES[kind].en}"/>` : ''
      urls.push(`<url><loc>${SITE + PAGES[kind][lang]}</loc><lastmod>${TODAY}</lastmod>${alts}</url>`)
    }
  }
  for (const p of ['/', '/terms.html', '/delete.html']) urls.push(`<url><loc>${SITE + p}</loc></url>`)
  writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`)
  writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
  console.log('ok')
}
