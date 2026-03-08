// ==================== Database (localStorage) ====================
const DB_KEY = 'manifestor_db';

function getDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) return { checkins: {}, quests: {}, rituals: {}, xp: 0, focusSessions: 0, focusMinutes: 0, oracleCount: 0, gardenVisits: 0 };
  return JSON.parse(raw);
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getToday() {
  const db = getDB();
  return db.checkins[todayKey()] || null;
}

function addXP(amount) {
  const db = getDB();
  db.xp = (db.xp || 0) + amount;
  saveDB(db);
  refreshUI();
}

function calcLevel(xp) {
  let level = 1, needed = 200;
  let remaining = xp;
  while (remaining >= needed) {
    remaining -= needed;
    level++;
    needed = level * 200;
  }
  return { level, current: remaining, next: needed };
}

function calcStreak() {
  const db = getDB();
  const checkins = db.checkins;
  let streak = 0;
  const d = new Date();
  if (!checkins[todayKey()]) {
    d.setDate(d.getDate() - 1);
  }
  while (true) {
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (checkins[key]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
  }
  return dates;
}

function getMonthDates() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const dates = [];
  for (let d = 1; d <= last.getDate(); d++) {
    dates.push(`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
  }
  return { dates, firstDayOfWeek: first.getDay(), year, month };
}
