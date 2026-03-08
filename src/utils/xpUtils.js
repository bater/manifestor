import { formatDateKey } from './dateUtils'

export function calcLevel(xp) {
  let level = 1
  let needed = 200
  let remaining = xp
  while (remaining >= needed) {
    remaining -= needed
    level++
    needed = level * 200
  }
  return { level, current: remaining, next: needed }
}

export function calcStreak(checkins) {
  let streak = 0
  const d = new Date()
  const todayStr = formatDateKey(d)
  if (!checkins[todayStr]) {
    d.setDate(d.getDate() - 1)
  }
  while (true) {
    const key = formatDateKey(d)
    if (checkins[key]) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}
