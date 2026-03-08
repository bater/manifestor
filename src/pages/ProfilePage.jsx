import { useState } from 'react'
import { useData } from '../context/useData'
import { useAuth } from '../context/useAuth'
import { todayKey, getWeekDates, getMonthDates } from '../utils/dateUtils'
import { calcLevel, calcStreak } from '../utils/xpUtils'

const moodEmojis = { '平靜': '\uD83D\uDE0C', '充電中': '\uD83D\uDCAB', '流動': '\uD83C\uDF38', '耗盡': '\uD83D\uDC94', '燃燒': '\uD83D\uDD25' }
const dayLabels = ['一', '二', '三', '四', '五', '六', '日']
const barColors = [
  'linear-gradient(to top,#7c5cfc,#a78bfa)',
  'linear-gradient(to top,#7c5cfc,#f59e0b)',
  'linear-gradient(to top,#7c5cfc,#22d3ee)',
  'linear-gradient(to top,#7c5cfc,#a78bfa)',
  'linear-gradient(to top,#7c5cfc,#34d399)',
  'linear-gradient(to top,#7c5cfc,#f472b6)',
  'linear-gradient(to top,#7c5cfc,#22d3ee)',
]
const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

function WeeklyReview({ db }) {
  const dates = getWeekDates()
  const key = todayKey()
  let totalEnergy = 0, checkinCount = 0, ritualCount = 0
  const moodCount = {}

  dates.forEach(date => {
    const checkin = db.checkins[date]
    if (checkin) {
      totalEnergy += checkin.energy
      checkinCount++
      if (checkin.mood) moodCount[checkin.mood] = (moodCount[checkin.mood] || 0) + 1
    }
    if (db.rituals[date]) ritualCount += db.rituals[date].length
  })

  const avg = checkinCount ? Math.round(totalEnergy / checkinCount) : null

  let insightText = '再累積幾天打卡資料，就能看到你的能量趨勢分析了。'
  if (checkinCount >= 3) {
    const topMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]
    insightText = `本週你打卡了 ${checkinCount} 天，平均能量 ${avg}。`
    if (topMood) insightText += `最常出現的狀態是「${topMood[0]}」。`
    if (avg >= 70) insightText += '能量狀態不錯！持續保持這個節奏。'
    else if (avg >= 40) insightText += '能量中等，記得適時安排休息儀式。'
    else insightText += '能量偏低，建議多做一些充電儀式，對自己溫柔一點。'
  }

  return (
    <div>
      <div className="energy-chart">
        <div className="chart-header">
          <div className="chart-title">每週能量曲線</div>
          <div className="chart-period">本週</div>
        </div>
        <div className="chart-bars">
          {dates.map((date, i) => {
            const checkin = db.checkins[date]
            const energy = checkin ? checkin.energy : 0
            const isToday = date === key
            return (
              <div key={date} className="chart-bar-wrapper">
                <div className="chart-bar-value">{checkin ? energy : ''}</div>
                <div
                  className="chart-bar"
                  style={{
                    height: `${checkin ? Math.max(energy, 5) : 2}%`,
                    background: barColors[i],
                    ...(isToday ? { boxShadow: '0 0 8px rgba(124,92,252,0.4)' } : {}),
                  }}
                />
                <div className="chart-bar-label" style={isToday ? { color: 'var(--accent-warm)', fontWeight: 600 } : {}}>
                  {dayLabels[i]}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value purple">{avg ?? '--'}</div>
          <div className="stat-label">平均能量</div>
        </div>
        <div className="stat-card">
          <div className="stat-value amber">{checkinCount}</div>
          <div className="stat-label">打卡天數</div>
        </div>
        <div className="stat-card">
          <div className="stat-value green">{ritualCount}</div>
          <div className="stat-label">完成儀式</div>
        </div>
      </div>

      <div className="section-title">本週心情分佈</div>
      <MoodSummary moodCount={moodCount} emptyText="本週尚無打卡資料" />

      <div className="insight-card">
        <div className="insight-title">能量洞察</div>
        <div className="insight-text">{insightText}</div>
      </div>
    </div>
  )
}

function MonthlyReview({ db }) {
  const { dates, firstDayOfWeek, year, month } = getMonthDates()
  const key = todayKey()
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  let totalEnergy = 0, checkinCount = 0, questCount = 0
  const moodCount = {}

  dates.forEach(date => {
    const checkin = db.checkins[date]
    if (checkin) {
      checkinCount++
      totalEnergy += checkin.energy
      if (checkin.mood) moodCount[checkin.mood] = (moodCount[checkin.mood] || 0) + 1
    }
    if (db.quests[date]) questCount += db.quests[date].length
  })

  const avg = checkinCount ? Math.round(totalEnergy / checkinCount) : null

  let insightText = '持續每天打卡，月底就能看到完整的能量分析報告。'
  if (checkinCount >= 7) {
    const topMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]
    insightText = `本月已打卡 ${checkinCount} 天，平均能量 ${avg}。`
    if (topMood) insightText += `最主要的能量狀態是「${topMood[0]}」（${topMood[1]} 次）。`
    insightText += `共完成 ${questCount} 個任務。`
    if (avg >= 65) insightText += '整體能量表現穩健，你正走在好的節奏上！'
    else insightText += '這個月能量波動較大，建議關注休息品質和儀式的規律性。'
  }

  return (
    <div>
      <div className="energy-chart">
        <div className="chart-header">
          <div className="chart-title">月度能量熱力圖</div>
          <div className="chart-period">{year} 年 {monthNames[month]}</div>
        </div>
        <div className="heatmap">
          {dayLabels.map(l => <div key={l} className="heatmap-label">{l}</div>)}
        </div>
        <div className="heatmap">
          {Array.from({ length: offset }).map((_, i) => <div key={`pad-${i}`} className="heatmap-cell" />)}
          {dates.map(date => {
            const checkin = db.checkins[date]
            const isToday = date === key
            let levelClass = ''
            if (checkin) {
              if (checkin.energy >= 80) levelClass = 'level-4'
              else if (checkin.energy >= 60) levelClass = 'level-3'
              else if (checkin.energy >= 40) levelClass = 'level-2'
              else levelClass = 'level-1'
            }
            return (
              <div
                key={date}
                className={`heatmap-cell ${levelClass} ${checkin ? 'has-data' : ''} ${isToday ? 'today' : ''}`}
                title={checkin ? `${date}: 能量 ${checkin.energy} / ${checkin.mood}` : date}
              />
            )
          })}
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value purple">{avg ?? '--'}</div>
          <div className="stat-label">平均能量</div>
        </div>
        <div className="stat-card">
          <div className="stat-value amber">{checkinCount}</div>
          <div className="stat-label">打卡天數</div>
        </div>
        <div className="stat-card">
          <div className="stat-value green">{questCount}</div>
          <div className="stat-label">完成任務</div>
        </div>
      </div>

      <div className="section-title">月度心情分佈</div>
      <MoodSummary moodCount={moodCount} emptyText="本月尚無打卡資料" />

      <div className="insight-card">
        <div className="insight-title">月度洞察</div>
        <div className="insight-text">{insightText}</div>
      </div>
    </div>
  )
}

function CheckinLog({ db }) {
  const allDates = Object.keys(db.checkins).sort().reverse()

  if (allDates.length === 0) {
    return <div className="empty-state">還沒有打卡紀錄<br />點擊首頁的「每日能量打卡」開始吧！</div>
  }

  return (
    <div className="checkin-log">
      {allDates.map(date => {
        const c = db.checkins[date]
        const rituals = db.rituals[date] || []
        const quests = db.quests[date] || []
        const allTasks = [...quests, ...rituals]
        return (
          <div key={date} className="log-item">
            <div className="log-date">{date}</div>
            <div className="log-row">
              <span className="log-mood">{moodEmojis[c.mood] || ''}</span>
              <span>{c.mood}</span>
              <span className="log-energy">能量 {c.energy}</span>
            </div>
            {c.note && <div className="log-note">{c.note}</div>}
            {allTasks.length > 0 && (
              <div className="log-tasks">
                {allTasks.map(t => <span key={t} className="log-tag">{t}</span>)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function MoodSummary({ moodCount, emptyText }) {
  const entries = Object.entries(moodCount).sort((a, b) => b[1] - a[1])
  if (entries.length === 0) {
    return <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{emptyText}</div>
  }
  return (
    <div className="mood-summary">
      {entries.map(([mood, count]) => (
        <div key={mood} className="mood-chip">
          {moodEmojis[mood] || ''} {mood} <span className="mood-count">x{count}</span>
        </div>
      ))}
    </div>
  )
}

function BadgeGrid({ db }) {
  const streak = calcStreak(db.checkins)
  const totalRituals = Object.values(db.rituals).reduce((sum, arr) => sum + arr.length, 0)
  const totalCheckins = Object.keys(db.checkins).length
  const unlocks = {
    streak7: streak >= 7,
    focus: (db.focusSessions || 0) >= 5,
    garden: (db.gardenVisits || 0) >= 10,
    oracle: (db.oracleCount || 0) >= 10,
    guard: totalCheckins >= 14,
    ritual: totalRituals >= 20,
    streak30: streak >= 30,
    master: (db.xp || 0) >= 5000,
  }

  const badges = [
    { key: 'streak7', emoji: '\uD83C\uDF1F', label: '七日' },
    { key: 'focus', emoji: '\uD83D\uDD25', label: '專注' },
    { key: 'garden', emoji: '\uD83C\uDF38', label: '花園' },
    { key: 'oracle', emoji: '\uD83D\uDD2E', label: '神諭' },
    { key: 'guard', emoji: '\uD83D\uDEE1\uFE0F', label: '守護' },
    { key: 'ritual', emoji: '\u2615', label: '儀式' },
    { key: 'streak30', emoji: '\uD83D\uDD12', label: unlocks.streak30 ? '三十日' : '???' },
    { key: 'master', emoji: '\uD83D\uDD12', label: unlocks.master ? '大師' : '???' },
  ]

  return (
    <div className="badge-grid">
      {badges.map(b => (
        <div key={b.key} className={`badge-item ${unlocks[b.key] ? '' : 'locked'}`}>
          {b.emoji}<span>{b.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function ProfilePage() {
  const { db } = useData()
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('weekly')
  const levelInfo = calcLevel(db.xp || 0)

  const displayName = user?.displayName || 'Manifestor'
  const initial = displayName.charAt(0).toUpperCase()
  const photoURL = user?.photoURL

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>個人檔案</h1>
          <div className="subtitle">能量分析與成就</div>
        </div>
      </div>

      <div className="profile-header">
        {photoURL ? (
          <img
            src={photoURL}
            alt={displayName}
            className="profile-avatar"
            style={{ objectFit: 'cover' }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="profile-avatar">{initial}</div>
        )}
        <div className="profile-name">{displayName}</div>
        <div className="profile-title">顯示者 / 能量建築師</div>
        <div className="profile-level">
          <div className="profile-level-text">等級 <strong>{levelInfo.level}</strong></div>
          <div className="level-bar">
            <div className="level-bar-fill" style={{ width: `${(levelInfo.current / levelInfo.next) * 100}%` }} />
          </div>
          <div className="profile-level-text">{db.xp || 0}/{levelInfo.next} XP</div>
        </div>
      </div>

      <div className="review-tabs">
        {[['weekly', '本週盤點'], ['monthly', '月度盤點'], ['log', '打卡紀錄']].map(([tab, label]) => (
          <div
            key={tab}
            className={`review-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {label}
          </div>
        ))}
      </div>

      {activeTab === 'weekly' && <WeeklyReview db={db} />}
      {activeTab === 'monthly' && <MonthlyReview db={db} />}
      {activeTab === 'log' && <CheckinLog db={db} />}

      <div className="section-title">成就徽章</div>
      <BadgeGrid db={db} />

      <div className="section-title">能量夥伴</div>
      <div className="chat-container">
        <div className="chat-bubble bot">嗨 Ting！你今天的能量看起來很穩定。想做個快速能量掃描，還是抽一張靈感卡？</div>
        <div className="chat-bubble user">來做個掃描吧。我感覺有創作衝動，但同時有點耗盡。</div>
        <div className="chat-bubble bot">經典的顯示者張力！你的創造者守護已經 Lv.6 -- 把那股衝動導入一段短爆發，然後讓療癒者帶你休息。試試：15 分鐘創作，10 分鐘休息。</div>
      </div>
      <div className="chat-input-row">
        <input className="chat-input" type="text" placeholder="和你的能量夥伴聊聊..." />
        <button className="chat-send">{'\u279E'}</button>
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center', paddingBottom: '16px' }}>
        <button
          className="btn-secondary"
          style={{ padding: '10px 24px', fontSize: '13px', cursor: 'pointer' }}
          onClick={signOut}
        >
          登出帳號
        </button>
        <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-dim)' }}>
          {user?.email}
        </div>
      </div>
    </div>
  )
}
