# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Manifestor is a gamified energy management web app based on Human Design "Manifestor" type. Built with React + Vite, backed by Firebase (Auth + Firestore).

**Language**: The app UI is entirely in Traditional Chinese (zh-Hant).

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## Setup

1. Create a Firebase project with Google Auth + Firestore enabled
2. Copy `.env.example` to `.env` and fill in Firebase config values
3. `npm install && npm run dev`

## Architecture

### Project Structure

- `src/main.jsx` — Entry point. BrowserRouter + global CSS import.
- `src/App.jsx` — AuthProvider → AppContent (login gate) → DataProvider + routes.
- `src/lib/firebase.js` — Firebase app init, exports `auth` and `firestore`. Config from `VITE_FIREBASE_*` env vars.
- `src/context/AuthContext.jsx` — Firebase Auth with Google sign-in. Exposes `user`, `signInWithGoogle`, `signOut`.
- `src/context/DataContext.jsx` — Dual-mode data layer: localStorage for offline/local, Firestore sync when authenticated. On first sign-in, migrates existing localStorage data to Firestore.
- `src/context/useAuth.js` / `useData.js` — Hook wrappers for consuming contexts.
- `src/utils/dateUtils.js` — `todayKey()`, `formatDateKey()`, `getWeekDates()`, `getMonthDates()`.
- `src/utils/xpUtils.js` — `calcLevel()`, `calcStreak()`.
- `src/styles/global.css` — Dark theme design system using CSS custom properties.
- `src/pages/` — `LoginPage`, `HomePage`, `QuestsPage`, `GardenPage`, `OraclePage`, `ProfilePage`.
- `src/components/` — `AmbientBackground`, `BottomNav`, `CheckinModal`, `EnergyRing`.
- `firestore.rules` — Security rules: users can only read/write their own `users/{uid}/**`.
- `old/` — Original vanilla HTML/CSS/JS files preserved for reference.

### Data Flow

1. User signs in with Google → `AuthContext` sets `user`
2. `DataProvider` mounts → subscribes to Firestore `users/{uid}` doc via `onSnapshot`
3. On first sign-in, localStorage data is migrated to Firestore
4. All mutations call `updateDB()` → updates React state + localStorage + Firestore write
5. `skipNextSnapshot` ref prevents echo from our own Firestore writes

### Data Model

Stored as a single Firestore document at `users/{uid}` (and mirrored in localStorage key `manifestor_db`):
```
{ checkins: { "YYYY-MM-DD": { date, energy, mood, note, quests[], rituals[], timestamp } },
  quests: { "YYYY-MM-DD": [questName, ...] },
  rituals: { "YYYY-MM-DD": [ritualName, ...] },
  xp: number, focusSessions: number, focusMinutes: number,
  oracleCount: number, gardenVisits: number }
```

### Key Patterns

- **XP system**: Various actions award XP (check-in: 30, quests: 15-40, rituals: 10, focus: 50, oracle: 5). XP is deducted when un-toggling quests.
- **Particle garden**: Canvas animation in `GardenPage` uses `useRef` + `useEffect` with cleanup to stop `requestAnimationFrame` when leaving the page.
- **Auth gate**: `AppContent` in `App.jsx` shows loading → login → main app based on `user` state (undefined/null/object).

## Known Issues

- Guardian levels are hardcoded, not driven by data
- Focus timer "today count" (`db.focusSessions`) is a global counter, not per-day
- Chat input in profile page is non-functional (decorative only)
- Firebase SDK bundle is large (~340KB gzipped); consider code-splitting
