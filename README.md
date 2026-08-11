# ✦ IARE Events — Campus Clubs & Events

A full-featured, premium 3D web app for college clubs and events — built for the
Institute of Aeronautical Engineering (IARE). Discover clubs, RSVP to events,
track participation points, browse the campus calendar and publish your own
events — all wrapped in a dark, glassmorphic UI with real WebGL 3D.

![stack](https://img.shields.io/badge/React%2018-3D%20UI-8b5cf6) ![stack](https://img.shields.io/badge/Three.js-WebGL-22d3ee)

## ✨ Features

| Area | What you can do |
| --- | --- |
| **3D hero** | Live React-Three-Fiber scene: glass torus knot, floating metallic shapes, stars, sparkles + mouse parallax |
| **Events hub** | Filter by category, live search, sort (soonest / popular / almost-full), grid ↔ list views, completed-event toggle |
| **Event pages** | Countdown timer, capacity bar, attendee avatars, RSVP / save / share, points, prizes, similar events |
| **Clubs** | 9 societies with 3D tilt cards, join/leave membership, officers, achievements, socials, club event lists |
| **Calendar** | Month view with event dots, day drill-down, month-at-a-glance sidebar |
| **Announcements** | Priority-tagged (urgent / important) campus feed with club attribution |
| **Accounts** | Sign-up / sign-in (demo, persisted in localStorage), club-admin flag for emails starting with `admin@` |
| **Profile** | Going / saved events, joined clubs, participation points, next-event reminder strip |
| **Create events** | Full publishing form with live card preview, gradient & icon pickers — instantly added to the feed |
| **Global search** | Instant results across events and clubs with quick chips |

**Premium touches** — spring-physics 3D tilt cards with cursor glare, animated
conic "glow ring" borders, glassmorphism + backdrop blur, marquee announcement
ticker, confetti on RSVP/signup, animated countdown units, toast notifications,
smooth page transitions and scroll-reveal animations.

## 🚀 Getting started

```bash
npm install
npm run dev       # start the dev server (default http://localhost:5173)
npm run build     # production build
npm run preview   # preview the production build
```

## 🧱 Tech stack

- **React 18 + Vite + TypeScript**
- **Three.js / React Three Fiber / drei** — real-time 3D scenes (code-split, lazy-loaded)
- **Framer Motion** — 3D tilt, scroll reveals, layout animations
- **Tailwind CSS v4** — design system, glassmorphism utilities
- **Zustand + persist** — global state (auth, RSVPs, memberships, custom events) saved to localStorage
- **React Router v6** — 12 routes with detail pages and 404

## 📁 Structure

```
src/
├── components/    Navbar, Footer, EventCard, ClubCard, TiltCard, Countdown, Toasts, visuals…
├── pages/         Home, Events, EventDetail, Clubs, ClubDetail, Calendar,
│                  Announcements, Profile, Auth, CreateEvent, Search, NotFound
├── three/         HeroScene.tsx — R3F scene (glass torus knot, sparkles, stars, parallax)
├── data.ts        seed clubs, events, announcements
├── store.ts       Zustand store with localStorage persistence
└── types.ts       domain types
```

## 🧪 Smoke test

```bash
npm install -D jsdom
node smoke.mjs     # server-renders every route to catch runtime errors
```

## 📝 Notes

- Demo app — no real backend; all state lives in `localStorage`.
- Event/club covers are generated gradient art (zero external images → instant load).
- Fonts: Space Grotesk (display) + Inter (body) via Google Fonts with system fallbacks.
