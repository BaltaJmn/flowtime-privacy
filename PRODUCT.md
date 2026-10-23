# Product

<!-- impeccable:product-schema 1 -->

Inferred from the brief of 23-10-2026 and the app repository (`BaltaJmn/FlowTime-Pomodoro`); no
interview round was held because the owner runs this work from another session. Facts marked
(inferred) are not confirmed.

## Platform

web

## Users

- Students who search for a Pomodoro or study timer to use in a browser tab while they study, above all
  in finals week (US and UK, December) and in January exams (Spain and much of Europe), in English and
  Spanish.
- People who look up the Flowtime Technique and want a timer for it: count up while you work, break
  from how long you worked.
- On a phone, a visitor who may install FlowTime to keep timing away from the computer, alone or with
  friends in Coop.

## Product Purpose

The web of FlowTime (`flowtime.baltajmn.dev`): privacy policy, terms, account deletion and Coop invite
links, and from October 2026 a free web timer and seasonal study pages that bring search traffic to the
app. Success is installs from Google Play (and the App Store once FlowTime is live there) with the web
campaign token, and a timer people come back to.

## Positioning

FlowTime is a focus timer whose breaks adapt to how long you worked: Pomodoro when you want fixed blocks,
FlowTime when you do not want a countdown cutting you off, and Coop to study with up to 8 friends on one
shared timer. No ads, no account except for Coop.

## Operating Context

- The web timer runs in a desktop tab next to notes or a laptop on a desk; a phone visitor glances at it
  between pages. Sessions last 25 minutes to several hours.
- The browser throttles background tabs: the timer must keep time from the clock, not from ticks.
- Store links carry a campaign token (`ct=` on the App Store, `referrer=utm_...` on Play) because the app
  has no analytics by contract; the stores are the only measure.

## Capabilities and Constraints

- Static files on GitHub Pages behind Cloudflare. No server code, no cookies, no third party scripts.
- `404.html` is the Coop invite page (`/f/<code>`, `/r/<code>`); it must keep working.
- The app: `com.baltajmn.flowtime`, App Store id 6819302003, which is not on sale yet (2.4.0 in review on
  23-10-2026). Store buttons on iPhone check the iTunes lookup, like `404.html`.
- Free with no ads; Pro is a one-time payment or monthly, never needed for the timer.
- Languages of the web pages: en and es (search data of 23-10-2026). The app has 14.

## Brand Commitments

- Store title: "FlowTime: Pomodoro Focus Timer". Font Mulish. Deep blue `#15506A` with light blue
  `#8ECAE6` / `#EAF6FB` (the icon), a progress ring around large light numerals.
- Calm, no hype, no fake urgency.

## Evidence on Hand

- Google Play: 1,000+ installs, 4.9 stars from 49 reviews (October 2026).
- App screenshots in `FlowTime-Pomodoro/store/screenshots/`.
- No testimonials or press to quote.

## Product Principles

- The web timer is complete on its own; the app is offered for what a browser tab cannot do (the phone,
  the lock screen, Coop), never forced.
- Nothing about the user leaves the browser.
- True claims only: say what FlowTime does today, not what a later version might.

## Accessibility & Inclusion

Timer state is announced without a screen reader hearing every second; keyboard shortcuts for start,
pause and skip; reduced motion respected.
