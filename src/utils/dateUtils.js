export function formatDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function todayKey() {
  return formatDateKey(new Date())
}

export function getWeekDates() {
  const now = new Date()
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  return dates
}

export function getMonthDates() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const dates = []
  for (let d = 1; d <= last.getDate(); d++) {
    dates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }
  return { dates, firstDayOfWeek: first.getDay(), year, month }
}

export function formatCheckinDate(date) {
  const dayNames = ['日', '一', '二', '三', '四', '五', '六']
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日（${dayNames[date.getDay()]}）`
}
