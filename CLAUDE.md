# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Manifestor is a gamified energy management web app based on Human Design "Manifestor" type. Built with React + Vite, data stored in localStorage (Firebase migration planned).

**Language**: The app UI is entirely in Traditional Chinese (zh-Hant).

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## Architecture

### Project Structure

- `src/main.jsx` — Entry point. BrowserRouter + global CSS import.
- `src/App.jsx` — Route definitions + DataProvider + layout shell (ambient bg + bottom nav).
- `src/context/DataContext.jsx` — React Context replacing the old data layer. Single localStorage key (`manifestor_db`). All mutations go through `updateDB()` which persists to localStorage and triggers re-render.
- `src/utils/dateUtils.js` — `todayKey()`, `formatDateKey()`, `getWeekDates()`, `getMonthDates()`.
- `src/utils/xpUtils.js` — `calcLevel()`, `calcStreak()`.
- `src/styles/global.css` — Dark theme design system using CSS custom properties (e.g., `--accent-primary`, `--bg-card`).
- `src/pages/` — 5 page components: `HomePage`, `QuestsPage`, `GardenPage`, `OraclePage`, `ProfilePage`.
- `src/components/` — Shared components: `AmbientBackground`, `BottomNav`, `CheckinModal`, `EnergyRing`.
- `old/` — Original vanilla HTML/CSS/JS files preserved for reference.

### Data Model

The DB object in localStorage (`manifestor_db`) has this shape:
```
{ checkins: { "YYYY-MM-DD": { date, energy, mood, note, quests[], rituals[], timestamp } },
  quests: { "YYYY-MM-DD": [questName, ...] },
  rituals: { "YYYY-MM-DD": [ritualName, ...] },
  xp: number, focusSessions: number, focusMinutes: number,
  oracleCount: number, gardenVisits: number }
```

### Key Patterns

- **XP system**: Various actions award XP (check-in: 30, quests: 15-40, rituals: 10, focus: 50, oracle: 5). XP is deducted when un-toggling quests.
- **DataContext**: All data mutations use `useCallback` + functional `setState` to avoid stale closures. Every mutation auto-persists to localStorage.
- **Particle garden**: Canvas animation in `GardenPage` uses `useRef` + `useEffect` with cleanup to stop `requestAnimationFrame` when leaving the page.
- **Routing**: `react-router-dom` with `NavLink` for bottom nav. 5 routes: `/`, `/quests`, `/garden`, `/oracle`, `/profile`.

## Known Issues

- Guardian levels are hardcoded, not driven by data
- Focus timer "today count" (`db.focusSessions`) is a global counter, not per-day
- Chat input in profile page is non-functional (decorative only)
