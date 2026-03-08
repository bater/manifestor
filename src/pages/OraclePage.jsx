import { useState } from 'react'
import { useData } from '../context/useData'

const oracleResponses = [
  '你的直覺已經知道答案了。你最先感受到的那股衝動——那就是答案。',
  '等一個呼吸的時間。如果衝動還在，那就是真的。行動吧。',
  '這個決定不需要更多資訊。它需要的是你的勇氣。',
  '你的發起者守護說：時機就是現在。',
  '先休息。清晰來自靜止之後，而非之前。',
]

const guardians = [
  { emoji: '\uD83D\uDEE1\uFE0F', name: '守護者', role: '界限與安全感', level: 'Lv.4 | 320 點' },
  { emoji: '\uD83C\uDFA8', name: '創造者', role: '靈感與心流', level: 'Lv.6 | 580 點' },
  { emoji: '\uD83E\uDE79', name: '療癒者', role: '休息與恢復', level: 'Lv.3 | 210 點' },
  { emoji: '\uD83D\uDE80', name: '發起者', role: '行動與衝勁', level: 'Lv.7 | 720 點' },
]

export default function OraclePage() {
  const { addXP, incrementCounter } = useData()
  const [selectedOption, setSelectedOption] = useState(null)
  const [status, setStatus] = useState('等待你的提問')
  const [oracleIcon, setOracleIcon] = useState('\uD83D\uDD2E')
  const [consulting, setConsulting] = useState(false)

  const handleConsult = () => {
    if (consulting) return
    setConsulting(true)
    setOracleIcon('\u2728')
    setStatus('正在感應你的能量...')
    incrementCounter('oracleCount')
    addXP(5)

    setTimeout(() => {
      setStatus(oracleResponses[Math.floor(Math.random() * oracleResponses.length)])
      setOracleIcon('\uD83D\uDD2E')
      setConsulting(false)
    }, 1500)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>神諭</h1>
          <div className="subtitle">決策指引與內在守護者</div>
        </div>
      </div>

      <div className="oracle-visual">
        <div className="oracle-circle">
          <div className="oracle-inner">
            <div className="oracle-icon">{oracleIcon}</div>
            <div className="oracle-status" style={status.length > 20 ? { fontSize: '12px' } : {}}>
              {status}
            </div>
          </div>
        </div>
      </div>

      <div className="decision-input-area">
        <label>什麼決定正讓你猶豫不決？</label>
        <textarea rows="2" placeholder="例如：我該接下這個新專案嗎？" />
      </div>

      <div className="decision-options">
        {['A', 'B'].map(opt => (
          <div
            key={opt}
            className="decision-option"
            style={selectedOption === opt ? {
              borderColor: 'var(--accent-primary)',
              background: 'rgba(124, 92, 252, 0.1)',
            } : {}}
            onClick={() => setSelectedOption(opt)}
          >
            選項 {opt}<br />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {opt === 'A' ? '直接行動' : '等待觀察'}
            </span>
          </div>
        ))}
      </div>

      <button className="draw-btn" style={{ marginBottom: '24px' }} onClick={handleConsult}>
        諮詢神諭
      </button>

      <div className="section-title">內在守護者</div>
      <div className="guardian-cards">
        {guardians.map(g => (
          <div key={g.name} className="guardian-card">
            <div className="guardian-emoji">{g.emoji}</div>
            <div className="guardian-name">{g.name}</div>
            <div className="guardian-role">{g.role}</div>
            <div className="guardian-level">{g.level}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
