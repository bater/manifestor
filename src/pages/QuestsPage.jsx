import { useState, useRef, useEffect, useCallback } from 'react'
import { useData } from '../context/useData'
import { todayKey } from '../utils/dateUtils'

const quests = [
  { name: '晨間能量掃描', meta: '記錄起床時的能量狀態', xp: 20 },
  { name: '創意爆發時段', meta: '25 分鐘深度工作', xp: 40 },
  { name: '界限宣告', meta: '行動前先告知', xp: 30 },
  { name: '無罪惡感休息', meta: '15 分鐘刻意休息', xp: 25 },
  { name: '晚間回顧', meta: '寫下 3 件感恩的事', xp: 15 },
]

const questRituals = [
  { name: '拜日式伸展', icon: '\uD83C\uDF1E', dur: '5 分鐘', energy: '+8' },
  { name: '正念茶道', icon: '\u2615', dur: '10 分鐘', energy: '+10' },
  { name: '自由書寫腦內清空', icon: '\u270D\uFE0F', dur: '7 分鐘', energy: '+6' },
  { name: '視覺冥想：能量重置', icon: '\uD83C\uDF08', dur: '3 分鐘', energy: '+5' },
]

export default function QuestsPage() {
  const { db, toggleQuest, completeRitual, addXP, incrementCounter } = useData()
  const [activeTab, setActiveTab] = useState('tasks')
  const [focusSeconds, setFocusSeconds] = useState(25 * 60)
  const [focusRunning, setFocusRunning] = useState(false)
  const intervalRef = useRef(null)

  const key = todayKey()
  const todayQuests = db.quests[key] || []
  const todayRituals = db.rituals[key] || []

  const handleFocusComplete = useCallback(() => {
    incrementCounter('focusSessions')
    incrementCounter('focusMinutes', 25)
    addXP(50)
  }, [incrementCounter, addXP])

  useEffect(() => {
    if (focusRunning) {
      intervalRef.current = setInterval(() => {
        setFocusSeconds(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setFocusRunning(false)
            handleFocusComplete()
            return 25 * 60
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [focusRunning, handleFocusComplete])

  const toggleFocusTimer = () => {
    if (focusRunning) {
      clearInterval(intervalRef.current)
      setFocusRunning(false)
    } else {
      setFocusRunning(true)
    }
  }

  const mins = Math.floor(focusSeconds / 60)
  const secs = focusSeconds % 60

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>任務</h1>
          <div className="subtitle">每日任務與專注模式</div>
        </div>
      </div>

      <div className="quest-tabs">
        {[['tasks', '能量任務'], ['focus', '專注模式'], ['rituals', '微小儀式']].map(([tab, label]) => (
          <div
            key={tab}
            className={`quest-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {label}
          </div>
        ))}
      </div>

      {activeTab === 'tasks' && (
        <div>
          {quests.map(q => {
            const done = todayQuests.includes(q.name)
            return (
              <div key={q.name} className="quest-item">
                <div
                  className={`quest-check ${done ? 'done' : ''}`}
                  onClick={() => toggleQuest(q.name, q.xp)}
                />
                <div className="quest-content">
                  <div className="quest-name">{q.name}</div>
                  <div className="quest-meta">{q.meta}</div>
                </div>
                <div className="quest-xp">+{q.xp} XP</div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'focus' && (
        <div>
          <div className="focus-timer">
            <div className="focus-time">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
            <div className="focus-label">慢熱專注：溫和啟動，漸入深流</div>
            <div className="focus-phases">
              {[0, 1, 2, 3, 4].map(i => {
                const elapsed = 25 * 60 - focusSeconds
                const phaseLen = 5 * 60
                let cls = ''
                if (elapsed >= (i + 1) * phaseLen) cls = 'done'
                else if (elapsed >= i * phaseLen) cls = 'active'
                return <div key={i} className={`focus-phase ${cls}`} />
              })}
            </div>
            <button className="focus-btn" onClick={toggleFocusTimer}>
              {focusRunning ? '\u23F8 暫停' : '\u25B6 開始專注'}
            </button>
          </div>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{db.focusSessions || 0}</div>
              <div className="stat-label">今日次數</div>
            </div>
            <div className="stat-card">
              <div className="stat-value amber">{((db.focusMinutes || 0) / 60).toFixed(1)}h</div>
              <div className="stat-label">累計專注</div>
            </div>
            <div className="stat-card">
              <div className="stat-value green">{Math.floor((db.focusSessions || 0) / 5)}</div>
              <div className="stat-label">勳章</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rituals' && (
        <div>
          {questRituals.map(r => {
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
      )}
    </div>
  )
}
