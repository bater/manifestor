// ==================== Check-in Modal ====================
let checkinMood = null;

function openCheckin() {
  const today = getToday();
  if (today) return;
  const d = new Date();
  const dayNames = ['日','一','二','三','四','五','六'];
  document.getElementById('checkinDate').textContent =
    `${d.getFullYear()} 年 ${d.getMonth()+1} 月 ${d.getDate()} 日（${dayNames[d.getDay()]}）`;
  document.getElementById('checkinEnergy').value = 50;
  document.getElementById('checkinEnergyVal').textContent = '50';
  document.getElementById('checkinNote').value = '';
  checkinMood = null;
  document.querySelectorAll('.checkin-mood-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('checkinModal').classList.add('show');
}

function closeCheckin() {
  document.getElementById('checkinModal').classList.remove('show');
}

function selectCheckinMood(el) {
  document.querySelectorAll('.checkin-mood-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  checkinMood = el.dataset.mood;
}

document.getElementById('checkinEnergy').addEventListener('input', function() {
  document.getElementById('checkinEnergyVal').textContent = this.value;
});

function submitCheckin() {
  const energy = parseInt(document.getElementById('checkinEnergy').value);
  const note = document.getElementById('checkinNote').value.trim();
  if (!checkinMood) {
    document.querySelector('.checkin-mood-grid').style.outline = '2px solid var(--accent-rose)';
    setTimeout(() => document.querySelector('.checkin-mood-grid').style.outline = 'none', 1000);
    return;
  }
  const db = getDB();
  const key = todayKey();
  db.checkins[key] = {
    date: key, energy, mood: checkinMood, note,
    quests: [], rituals: [], timestamp: Date.now()
  };
  db.xp = (db.xp || 0) + 30;
  saveDB(db);
  closeCheckin();
  refreshUI();
}

// ==================== Navigation ====================
function switchPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItems = document.querySelectorAll('.nav-item');
  const map = { home: 0, quests: 1, garden: 2, oracle: 3, profile: 4 };
  if (map[name] !== undefined) navItems[map[name]].classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'profile') renderProfile();
}

// ==================== Quest tabs ====================
function switchQuestTab(el, tab) {
  document.querySelectorAll('.quest-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('quest-tasks').style.display = tab === 'tasks' ? 'block' : 'none';
  document.getElementById('quest-focus').style.display = tab === 'focus' ? 'block' : 'none';
  document.getElementById('quest-rituals').style.display = tab === 'rituals' ? 'block' : 'none';
}

// ==================== Quest check ====================
function toggleQuest(el) {
  el.classList.toggle('done');
  const questName = el.dataset.quest;
  const db = getDB();
  const key = todayKey();
  if (!db.quests[key]) db.quests[key] = [];

  if (el.classList.contains('done')) {
    if (!db.quests[key].includes(questName)) {
      db.quests[key].push(questName);
      db.xp = (db.xp || 0) + (parseInt(el.closest('.quest-item').querySelector('.quest-xp').textContent) || 20);
    }
    if (db.checkins[key]) {
      if (!db.checkins[key].quests) db.checkins[key].quests = [];
      if (!db.checkins[key].quests.includes(questName)) db.checkins[key].quests.push(questName);
    }
  } else {
    db.quests[key] = db.quests[key].filter(q => q !== questName);
  }
  saveDB(db);
  refreshUI();
}

// ==================== Ritual complete ====================
function completeRitual(el) {
  if (el.dataset.completed) return;
  el.dataset.completed = 'true';
  el.style.opacity = '0.5';
  el.style.pointerEvents = 'none';
  const energyEl = el.querySelector('.ritual-energy');
  const ritualName = el.dataset.ritual;
  energyEl.textContent = '完成！';
  energyEl.style.color = 'var(--accent-glow)';

  const db = getDB();
  const key = todayKey();
  if (!db.rituals[key]) db.rituals[key] = [];
  if (!db.rituals[key].includes(ritualName)) {
    db.rituals[key].push(ritualName);
    db.xp = (db.xp || 0) + 10;
  }
  if (db.checkins[key]) {
    if (!db.checkins[key].rituals) db.checkins[key].rituals = [];
    if (!db.checkins[key].rituals.includes(ritualName)) db.checkins[key].rituals.push(ritualName);
  }
  saveDB(db);
  refreshUI();
}

// ==================== Mood selector ====================
function selectMood(el) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  updateParticles();
  const db = getDB();
  db.gardenVisits = (db.gardenVisits || 0) + 1;
  saveDB(db);
}

// ==================== Inspiration cards ====================
const cards = [
  { tag: '創意之流', text: '「你想行動的衝動，就是訊號本身。<br/>相信那股推力。告知，然後行動。」' },
  { tag: '靜養恢復', text: '「靜止不是懶惰。<br/>你的力量在寂靜中重新充電。」' },
  { tag: '顯示者能量', text: '「你不需要許可。<br/>你需要的是清晰。然後行動。」' },
  { tag: '內在平靜', text: '「內心的風暴不是你的敵人。<br/>它是等待方向的引擎。」' },
  { tag: '連結', text: '「告知身邊的人。<br/>不是為了獲得認可——是為了順流。」' },
  { tag: '界限智慧', text: '「說不是一種創造性的行為。<br/>它守護著你說好的空間。」' },
  { tag: '發起', text: '「你天生就是來啟動事物的。<br/>讓別人接手你點燃的火焰。」' },
  { tag: '自我信任', text: '「你的身體比頭腦更早知道答案。<br/>聽從那股拉力，而非雜音。」' },
];
let cardIndex = 0;

function drawCard() {
  cardIndex = (cardIndex + 1) % cards.length;
  const card = cards[cardIndex];
  const el = document.querySelector('.inspiration-card');
  el.style.opacity = '0';
  el.style.transform = 'scale(0.95)';
  setTimeout(() => {
    el.querySelector('.card-tag').textContent = `卡片 #${(cardIndex + 1) * 7} / ${card.tag}`;
    el.querySelector('.card-text').innerHTML = card.text;
    el.style.opacity = '1';
    el.style.transform = 'scale(1)';
  }, 200);
  el.style.transition = 'all 0.2s ease';
}

// ==================== Oracle ====================
function chooseDecision(el) {
  document.querySelectorAll('.decision-option').forEach(o => {
    o.style.borderColor = 'var(--border-subtle)';
    o.style.background = 'var(--bg-card)';
  });
  el.style.borderColor = 'var(--accent-primary)';
  el.style.background = 'rgba(124, 92, 252, 0.1)';
}

const oracleResponses = [
  '你的直覺已經知道答案了。你最先感受到的那股衝動——那就是答案。',
  '等一個呼吸的時間。如果衝動還在，那就是真的。行動吧。',
  '這個決定不需要更多資訊。它需要的是你的勇氣。',
  '你的發起者守護說：時機就是現在。',
  '先休息。清晰來自靜止之後，而非之前。',
];

function consultOracle() {
  const statusEl = document.querySelector('.oracle-status');
  const iconEl = document.querySelector('.oracle-icon');
  iconEl.textContent = '\u2728';
  statusEl.textContent = '正在感應你的能量...';
  const db = getDB();
  db.oracleCount = (db.oracleCount || 0) + 1;
  db.xp = (db.xp || 0) + 5;
  saveDB(db);
  setTimeout(() => {
    statusEl.textContent = oracleResponses[Math.floor(Math.random() * oracleResponses.length)];
    statusEl.style.fontSize = '12px';
    iconEl.textContent = '\uD83D\uDD2E';
    refreshUI();
  }, 1500);
}

// ==================== Focus Timer ====================
let focusRunning = false;
let focusSeconds = 25 * 60;
let focusInterval;

function toggleFocus(btn) {
  if (!focusRunning) {
    focusRunning = true;
    btn.innerHTML = '&#9646;&#9646; 暫停';
    focusInterval = setInterval(() => {
      focusSeconds--;
      if (focusSeconds <= 0) {
        clearInterval(focusInterval);
        focusRunning = false;
        btn.innerHTML = '&#9654; 開始專注';
        focusSeconds = 25 * 60;
        const db = getDB();
        db.focusSessions = (db.focusSessions || 0) + 1;
        db.focusMinutes = (db.focusMinutes || 0) + 25;
        db.xp = (db.xp || 0) + 50;
        saveDB(db);
        refreshUI();
      }
      const m = Math.floor(focusSeconds / 60);
      const s = focusSeconds % 60;
      document.getElementById('focus-display').textContent =
        String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }, 1000);
  } else {
    focusRunning = false;
    clearInterval(focusInterval);
    btn.innerHTML = '&#9654; 開始專注';
  }
}

// ==================== Particle Garden ====================
const canvas = document.getElementById('gardenCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth * 2;
  canvas.height = container.clientHeight * 2;
  canvas.style.width = container.clientWidth + 'px';
  canvas.style.height = container.clientHeight + 'px';
  ctx.scale(2, 2);
}

function initParticles() {
  resizeCanvas();
  particles = [];
  const w = canvas.width / 2, h = canvas.height / 2;
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 4 + 2,
      dx: (Math.random() - 0.5) * 0.6, dy: (Math.random() - 0.5) * 0.6,
      hue: 250 + Math.random() * 60, alpha: Math.random() * 0.5 + 0.3,
    });
  }
}

function updateParticles() {
  const selected = document.querySelector('.mood-btn.selected span');
  if (!selected) return;
  const mood = selected.textContent;
  const moodConfig = {
    '平靜': { hueBase: 200, speed: 0.3, count: 40 },
    '充電中': { hueBase: 280, speed: 1.2, count: 80 },
    '流動': { hueBase: 250, speed: 0.6, count: 60 },
    '耗盡': { hueBase: 220, speed: 0.15, count: 25 },
    '燃燒': { hueBase: 20, speed: 1.0, count: 70 },
  };
  const cfg = moodConfig[mood] || moodConfig['流動'];
  const w = canvas.width / 2, h = canvas.height / 2;
  particles = [];
  for (let i = 0; i < cfg.count; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 4 + 2,
      dx: (Math.random() - 0.5) * cfg.speed, dy: (Math.random() - 0.5) * cfg.speed,
      hue: cfg.hueBase + Math.random() * 40, alpha: Math.random() * 0.5 + 0.3,
    });
  }
  const labels = {
    '平靜': '粒子在寧靜中輕輕飄盪',
    '充電中': '能量粒子正蓄勢待發！',
    '流動': '你的能量粒子正輕柔地流動',
    '耗盡': '粒子正在休息，蓄積能量中...',
    '燃燒': '粒子正燃燒著創意之火！',
  };
  document.querySelector('.garden-label').textContent = labels[mood] || '';
}

function drawParticles() {
  const w = canvas.width / 2, h = canvas.height / 2;
  ctx.clearRect(0, 0, w, h);
  particles.forEach(p => {
    p.x += p.dx; p.y += p.dy;
    if (p.x < 0 || p.x > w) p.dx *= -1;
    if (p.y < 0 || p.y > h) p.dy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.alpha})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.alpha * 0.15})`;
    ctx.fill();
  });
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 60) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `hsla(260, 50%, 60%, ${0.1 * (1 - dist / 60)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}

// ==================== Profile / Review ====================
function switchReview(el, tab) {
  document.querySelectorAll('.review-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.review-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('review-' + tab).classList.add('active');
  renderProfile();
}

const moodEmojis = { '平靜': '&#128524;', '充電中': '&#128171;', '流動': '&#127800;', '耗盡': '&#128148;', '燃燒': '&#128293;' };
const barColors = [
  'linear-gradient(to top,#7c5cfc,#a78bfa)',
  'linear-gradient(to top,#7c5cfc,#f59e0b)',
  'linear-gradient(to top,#7c5cfc,#22d3ee)',
  'linear-gradient(to top,#7c5cfc,#a78bfa)',
  'linear-gradient(to top,#7c5cfc,#34d399)',
  'linear-gradient(to top,#7c5cfc,#f472b6)',
  'linear-gradient(to top,#7c5cfc,#22d3ee)',
];
const dayLabels = ['一','二','三','四','五','六','日'];

function renderProfile() {
  const db = getDB();
  const levelInfo = calcLevel(db.xp || 0);
  document.getElementById('profileLevel').textContent = levelInfo.level;
  document.getElementById('profileXP').textContent = db.xp || 0;
  document.getElementById('profileLevelBar').style.width = (levelInfo.current / levelInfo.next * 100) + '%';
  renderWeekly(db);
  renderMonthly(db);
  renderLog(db);
  renderBadges(db);
}

function renderWeekly(db) {
  const dates = getWeekDates();
  const barsEl = document.getElementById('weeklyBars');
  barsEl.innerHTML = '';
  let totalEnergy = 0, checkinCount = 0, ritualCount = 0;
  const moodCount = {};

  dates.forEach((date, i) => {
    const checkin = db.checkins[date];
    const energy = checkin ? checkin.energy : 0;
    if (checkin) {
      totalEnergy += energy;
      checkinCount++;
      if (checkin.mood) moodCount[checkin.mood] = (moodCount[checkin.mood] || 0) + 1;
    }
    if (db.rituals[date]) ritualCount += db.rituals[date].length;
    const isToday = date === todayKey();
    const wrapper = document.createElement('div');
    wrapper.className = 'chart-bar-wrapper';
    wrapper.innerHTML = `
      <div class="chart-bar-value">${checkin ? energy : ''}</div>
      <div class="chart-bar" style="height:${checkin ? Math.max(energy, 5) : 2}%;background:${barColors[i]};${isToday ? 'box-shadow:0 0 8px rgba(124,92,252,0.4)' : ''}"></div>
      <div class="chart-bar-label" style="${isToday ? 'color:var(--accent-warm);font-weight:600' : ''}">${dayLabels[i]}</div>
    `;
    barsEl.appendChild(wrapper);
  });

  document.getElementById('weeklyAvg').textContent = checkinCount ? Math.round(totalEnergy / checkinCount) : '--';
  document.getElementById('weeklyCheckins').textContent = checkinCount;
  document.getElementById('weeklyRituals').textContent = ritualCount;
  renderMoodSummary('weeklyMoods', moodCount, '本週尚無打卡資料');
  renderWeeklyInsight(checkinCount, totalEnergy, moodCount);
}

function renderMonthly(db) {
  const { dates, firstDayOfWeek, year, month } = getMonthDates();
  const monthNames = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  document.getElementById('monthlyPeriod').textContent = `${year} 年 ${monthNames[month]}`;

  const heatmapEl = document.getElementById('monthlyHeatmap');
  heatmapEl.innerHTML = '';
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  for (let i = 0; i < offset; i++) {
    heatmapEl.innerHTML += '<div class="heatmap-cell"></div>';
  }

  let totalEnergy = 0, checkinCount = 0, questCount = 0;
  const moodCount = {};

  dates.forEach(date => {
    const checkin = db.checkins[date];
    const isToday = date === todayKey();
    let levelClass = '';
    if (checkin) {
      checkinCount++;
      totalEnergy += checkin.energy;
      if (checkin.mood) moodCount[checkin.mood] = (moodCount[checkin.mood] || 0) + 1;
      if (checkin.energy >= 80) levelClass = 'level-4';
      else if (checkin.energy >= 60) levelClass = 'level-3';
      else if (checkin.energy >= 40) levelClass = 'level-2';
      else levelClass = 'level-1';
    }
    if (db.quests[date]) questCount += db.quests[date].length;
    const cell = document.createElement('div');
    cell.className = `heatmap-cell ${levelClass} ${checkin ? 'has-data' : ''} ${isToday ? 'today' : ''}`;
    cell.title = checkin ? `${date}: 能量 ${checkin.energy} / ${checkin.mood}` : date;
    heatmapEl.appendChild(cell);
  });

  document.getElementById('monthlyAvg').textContent = checkinCount ? Math.round(totalEnergy / checkinCount) : '--';
  document.getElementById('monthlyCheckins').textContent = checkinCount;
  document.getElementById('monthlyQuests').textContent = questCount;
  renderMoodSummary('monthlyMoods', moodCount, '本月尚無打卡資料');
  renderMonthlyInsight(checkinCount, totalEnergy, questCount, moodCount);
}

function renderMoodSummary(elementId, moodCount, emptyText) {
  const el = document.getElementById(elementId);
  el.innerHTML = '';
  if (Object.keys(moodCount).length === 0) {
    el.innerHTML = `<div style="font-size:12px;color:var(--text-dim)">${emptyText}</div>`;
  } else {
    Object.entries(moodCount).sort((a,b) => b[1]-a[1]).forEach(([mood, count]) => {
      el.innerHTML += `<div class="mood-chip">${moodEmojis[mood] || ''} ${mood} <span class="mood-count">x${count}</span></div>`;
    });
  }
}

function renderWeeklyInsight(checkinCount, totalEnergy, moodCount) {
  const el = document.getElementById('weeklyInsight');
  if (checkinCount >= 3) {
    const avg = Math.round(totalEnergy / checkinCount);
    const topMood = Object.entries(moodCount).sort((a,b) => b[1]-a[1])[0];
    let text = `本週你打卡了 ${checkinCount} 天，平均能量 ${avg}。`;
    if (topMood) text += `最常出現的狀態是「${topMood[0]}」。`;
    if (avg >= 70) text += '能量狀態不錯！持續保持這個節奏。';
    else if (avg >= 40) text += '能量中等，記得適時安排休息儀式。';
    else text += '能量偏低，建議多做一些充電儀式，對自己溫柔一點。';
    el.querySelector('.insight-text').textContent = text;
  } else {
    el.querySelector('.insight-text').textContent = '再累積幾天打卡資料，就能看到你的能量趨勢分析了。';
  }
}

function renderMonthlyInsight(checkinCount, totalEnergy, questCount, moodCount) {
  const el = document.getElementById('monthlyInsight');
  if (checkinCount >= 7) {
    const avg = Math.round(totalEnergy / checkinCount);
    const topMood = Object.entries(moodCount).sort((a,b) => b[1]-a[1])[0];
    let text = `本月已打卡 ${checkinCount} 天，平均能量 ${avg}。`;
    if (topMood) text += `最主要的能量狀態是「${topMood[0]}」（${topMood[1]} 次）。`;
    text += `共完成 ${questCount} 個任務。`;
    if (avg >= 65) text += '整體能量表現穩健，你正走在好的節奏上！';
    else text += '這個月能量波動較大，建議關注休息品質和儀式的規律性。';
    el.querySelector('.insight-text').textContent = text;
  } else {
    el.querySelector('.insight-text').textContent = '持續每天打卡，月底就能看到完整的能量分析報告。';
  }
}

function renderLog(db) {
  const logEl = document.getElementById('checkinLog');
  const allDates = Object.keys(db.checkins).sort().reverse();
  if (allDates.length === 0) {
    logEl.innerHTML = '<div class="empty-state">還沒有打卡紀錄<br/>點擊首頁的「每日能量打卡」開始吧！</div>';
    return;
  }
  logEl.innerHTML = '';
  allDates.forEach(date => {
    const c = db.checkins[date];
    const rituals = db.rituals[date] || [];
    const quests = db.quests[date] || [];
    const allTasks = [...quests, ...rituals];
    let html = `<div class="log-item">
      <div class="log-date">${date}</div>
      <div class="log-row">
        <span class="log-mood">${moodEmojis[c.mood] || ''}</span>
        <span>${c.mood}</span>
        <span class="log-energy">能量 ${c.energy}</span>
      </div>`;
    if (c.note) html += `<div class="log-note">${c.note}</div>`;
    if (allTasks.length > 0) {
      html += '<div class="log-tasks">';
      allTasks.forEach(t => html += `<span class="log-tag">${t}</span>`);
      html += '</div>';
    }
    html += '</div>';
    logEl.innerHTML += html;
  });
}

function renderBadges(db) {
  const streak = calcStreak();
  const totalRituals = Object.values(db.rituals).reduce((sum, arr) => sum + arr.length, 0);
  const totalCheckins = Object.keys(db.checkins).length;
  const unlocks = {
    streak7: streak >= 7,
    focus: (db.focusSessions || 0) >= 5,
    garden: (db.gardenVisits || 0) >= 10,
    oracle: (db.oracleCount || 0) >= 10,
    guard: totalCheckins >= 14,
    ritual: totalRituals >= 20,
    streak30: streak >= 30,
    master: (db.xp || 0) >= 5000,
  };
  document.querySelectorAll('#badgeGrid .badge-item').forEach(el => {
    if (unlocks[el.dataset.badge]) el.classList.remove('locked');
  });
}

// ==================== Refresh all UI ====================
function refreshUI() {
  const db = getDB();
  const today = db.checkins[todayKey()];
  const streak = calcStreak();
  const levelInfo = calcLevel(db.xp || 0);

  // Home energy ring
  const energy = today ? today.energy : 0;
  document.getElementById('homeEnergyValue').textContent = today ? energy : '--';
  const ring = document.getElementById('energyRing');
  ring.setAttribute('stroke-dashoffset', today ? 502 - (energy / 100 * 502) : 502);

  // Home stats
  document.getElementById('homeStreak').textContent = streak + ' 天';
  document.getElementById('homeStreakVal').textContent = streak;
  document.getElementById('homeXP').textContent = db.xp || 0;
  document.getElementById('homeLevel').textContent = 'Lv.' + levelInfo.level;

  // Check-in banner
  const banner = document.getElementById('checkinBanner');
  const bannerAction = document.getElementById('checkinBannerAction');
  const bannerDesc = document.getElementById('checkinBannerDesc');
  if (today) {
    banner.classList.add('checkin-done');
    bannerAction.textContent = '已完成';
    bannerDesc.textContent = `今日能量 ${today.energy} / ${today.mood}`;
    banner.onclick = null;
    banner.style.cursor = 'default';
  } else {
    banner.classList.remove('checkin-done');
    bannerAction.textContent = '立即打卡';
    bannerDesc.textContent = '記錄今天的能量狀態';
    banner.onclick = openCheckin;
    banner.style.cursor = 'pointer';
  }

  // Quest remaining
  const todayQuests = db.quests[todayKey()] || [];
  const remaining = 5 - todayQuests.length;
  document.getElementById('homeQuestDesc').textContent = remaining > 0
    ? `今天還有 ${remaining} 個任務待完成`
    : '今日任務已全部完成！';

  // Restore quest check states
  document.querySelectorAll('.quest-check[data-quest]').forEach(el => {
    if (todayQuests.includes(el.dataset.quest)) el.classList.add('done');
  });

  // Restore ritual states
  const todayRituals = db.rituals[todayKey()] || [];
  document.querySelectorAll('.ritual-item[data-ritual]').forEach(el => {
    if (todayRituals.includes(el.dataset.ritual)) {
      el.dataset.completed = 'true';
      el.style.opacity = '0.5';
      el.style.pointerEvents = 'none';
      el.querySelector('.ritual-energy').textContent = '完成！';
      el.querySelector('.ritual-energy').style.color = 'var(--accent-glow)';
    }
  });

  // Focus stats
  document.getElementById('focusSessions').textContent = db.focusSessions || 0;
  document.getElementById('focusTotal').textContent = ((db.focusMinutes || 0) / 60).toFixed(1) + 'h';
  document.getElementById('focusMedals').textContent = Math.floor((db.focusSessions || 0) / 5);
}

// ==================== Init ====================
initParticles();
drawParticles();
refreshUI();
window.addEventListener('resize', () => { resizeCanvas(); updateParticles(); });

if (!getToday()) {
  setTimeout(openCheckin, 800);
}
