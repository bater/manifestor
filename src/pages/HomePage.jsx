import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/useData'
import { todayKey } from '../utils/dateUtils'
import { calcLevel, calcStreak } from '../utils/xpUtils'
import EnergyRing from '../components/EnergyRing'
import CheckinModal from '../components/CheckinModal'

const homeRituals = [
  { name: '晨間接地呼吸', icon: '\u2600\uFE0F', dur: '3 分鐘', energy: '+5' },
  { name: '補水提醒', icon: '\uD83D\uDCA7', dur: '30 秒', energy: '+2' },
  { name: '晚間能量釋放', icon: '\uD83C\uDF19', dur: '5 分鐘', energy: '+8' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { db, completeRitual } = useData()
  const [showCheckin, setShowCheckin] = useState(false)

  const key = todayKey()
  const today = db.checkins[key] || null
  const streak = calcStreak(db.checkins)
  const levelInfo = calcLevel(db.xp || 0)
  const todayQuests = db.quests[key] || []
  const todayRituals = db.rituals[key] || []
  const remaining = 5 - todayQuests.length

  useEffect(() => {
    if (!today) {
      const timer = setTimeout(() => setShowCheckin(true), 800)
      return () => clearTimeout(timer)
    }
  }, [today])

  return (
    <div className="page">
      {showCheckin && !today && (
        <CheckinModal onClose={() => setShowCheckin(false)} />
      )}

      <div className="page-header">
        <div>
          <h1>Manifestor</h1>
          <div className="subtitle">Ting 的能量儀表板</div>
        </div>
        <div className="avatar" onClick={() => navigate('/profile')}>T</div>
      </div>

      <div
        className={`checkin-banner ${today ? 'checkin-done' : ''}`}
        onClick={() => !today && setShowCheckin(true)}
        style={{ cursor: today ? 'default' : 'pointer' }}
      >
        <div className="banner-icon">{'\uD83D\uDCCC'}</div>
        <div className="banner-info">
          <div className="banner-title">每日能量打卡</div>
          <div className="banner-desc">
            {today ? `今日能量 ${today.energy} / ${today.mood}` : '記錄今天的能量狀態'}
          </div>
        </div>
        <div className="banner-action">{today ? '已完成' : '立即打卡'}</div>
      </div>

      <div className="energy-ring-container">
        <EnergyRing energy={today ? today.energy : 0} hasCheckin={!!today} />
        <div className="energy-time">連續打卡：<span>{streak} 天</span></div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value purple">{streak}</div>
          <div className="stat-label">連續天數</div>
        </div>
        <div className="stat-card">
          <div className="stat-value amber">{db.xp || 0}</div>
          <div className="stat-label">經驗值</div>
        </div>
        <div className="stat-card">
          <div className="stat-value green">Lv.{levelInfo.level}</div>
          <div className="stat-label">等級</div>
        </div>
      </div>

      <div className="section-title">快速入口</div>

      <div className="card" onClick={() => navigate('/quests')}>
        <div className="card-row">
          <div className="card-icon purple">{'\u26A1'}</div>
          <div className="card-info">
            <div className="card-title">能量任務</div>
            <div className="card-desc">
              {remaining > 0 ? `今天還有 ${remaining} 個任務待完成` : '今日任務已全部完成！'}
            </div>
          </div>
          <div className="card-badge active">進行中</div>
        </div>
      </div>

      <div className="card" onClick={() => navigate('/garden')}>
        <div className="card-row">
          <div className="card-icon rose">{'\uD83C\uDF38'}</div>
          <div className="card-info">
            <div className="card-title">心情花園</div>
            <div className="card-desc">記錄今天的能量狀態</div>
          </div>
          <div className="card-badge active">新</div>
        </div>
      </div>

      <div className="card" onClick={() => navigate('/oracle')}>
        <div className="card-row">
          <div className="card-icon cyan">{'\uD83D\uDD2E'}</div>
          <div className="card-info">
            <div className="card-title">決策神諭</div>
            <div className="card-desc">讓直覺引導你</div>
          </div>
          <div className="card-badge active">就緒</div>
        </div>
      </div>

      <div className="section-title">微小儀式</div>

      {homeRituals.map(r => {
        const done = todayRituals.includes(r.name)
        return (
          <div
            key={r.name}
            className="ritual-item"
            style={done ? { opacity: 0.5, pointerEvents: 'none' } : {}}
            onClick={() => completeRitual(r.name)}
          >
            <div className="ritual-icon">{r.icon}</div>
            <div className="ritual-info">
              <div className="ritual-name">{r.name}</div>
              <div className="ritual-dur">{r.dur}</div>
            </div>
            <div className="ritual-energy" style={done ? { color: 'var(--accent-glow)' } : {}}>
              {done ? '完成！' : r.energy}
            </div>
          </div>
        )
      })}
    </div>
  )
}
