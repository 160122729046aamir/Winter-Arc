# Winter Arc – 97 Days of Backend Engineering (Java & Spring Boot)

A study planner for the Coder Army **Core Java** (57 lectures) and **Spring Framework / Spring Boot** (40 lectures) playlists: one lecture per study day, a daily quiz, hands-on projects, streaks and progress tracking. Everything runs in the browser; progress is saved in localStorage.

## Features

- **97-day plan** – Days 1–57 Core Java, 58–75 Spring Boot & Web, 76–97 Persistence & Security. Study days skip your rest weekdays (Settings → Preferred Study Days).
- **Scheduling that keeps up with you** – auto-reschedule missed days (or keep a fixed calendar and use the Recovery panel), skip a day, move any day to today, and pause/resume the journey.
- **Daily quiz** – 10 questions per lecture (970 total), written from the lecture notes and code. Easy → medium → hard, mixing conceptual, scenario and coding questions, each with an explanation and a reference link.
- **System projects** – 3 projects built alongside the plan (CRUD API, link shortener, JWT-secured API) plus the course's GateKeeper capstone. Start/finish dates follow your schedule and each milestone appears in the Daily Planner on its day.
- **Focus timer** – Pomodoro/deep-work timer that keeps running across pages and reloads, logs sessions automatically and tracks a daily study goal.
- **Progress** – XP and levels (calculated from what you actually completed), streaks that respect rest/skip/pause days, badges, analytics, notes and backup export/import.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Project structure

| Path | What it holds |
|---|---|
| `src/data/roadmapData.js` | The 97 plan days (lecture, tasks, phase) |
| `src/data/questionBank/day_XX.json` | Quiz questions, one file per day |
| `src/data/projectsData.js` | System project specs, anchored to plan days |
| `src/context/PlannerContext.jsx` | All progress state, scheduling, XP and stats |
| `src/context/TimerContext.jsx` | Global focus timer |
| `scripts/build_question_index.mjs` | Builds the small quiz index (runs automatically before dev/build) |

### Editing quiz questions

Edit or replace `src/data/questionBank/day_XX.json`. Each file has 10 questions with `difficulty` (easy/medium/hard), `kind` (conceptual/scenario/coding), 4 `options`, a 0-based `correctAnswer`, an `explanation`, a `source` and an optional `reference` URL. The index is rebuilt automatically the next time you run `npm run dev` or `npm run build`.

## Tech stack

React 18, Vite, Tailwind CSS, React Router, Framer Motion, SweetAlert2, Recharts, Lucide icons.
