import { useState } from 'react'
import { useData } from '../context/useData'
import { formatCheckinDate } from '../utils/dateUtils'

const moods = [
  { key: '平靜', emoji: '\uD83D\uDE0C' },
  { key: '充電中', emoji: '\uD83D\uDCAB' },
  { key: '流動', emoji: '\uD83C\uDF38' },
  { key: '耗盡', emoji: '\uD83D\uDC94' },
  { key: '燃燒', emoji: '\uD83D\uDD25' },
]

export default function CheckinModal({ onClose }) {
  const { submitCheckin } = useData()
  const [energy, setEnergy] = useState(50)
  const [mood, setMood] = useState(null)
  const [note, setNote] = useState('')
  const [moodError, setMoodError] = useState(false)

  const handleSubmit = () => {
    if (!mood) {
      setMoodError(true)
      setTimeout(() => setMoodError(false), 1000)
      return
    }
    submitCheckin(energy, mood, note)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>每日能量打卡</h2>
        <div className="modal-sub">{formatCheckinDate(new Date())}</div>

        <div className="modal-section">
          <label>現在的能量值</label>
          <div className="energy-slider-row">
            <input
              type="range"
              className="energy-slider"
              min="0"
              max="100"
              value={energy}
              onChange={e => setEnergy(Number(e.target.value))}
            />
            <div className="slider-value">{energy}</div>
          </div>
        </div>

        <div className="modal-section">
          <label>能量狀態</label>
          <div
            className="checkin-mood-grid"
            style={moodError ? { outline: '2px solid var(--accent-rose)' } : {}}
          >
            {moods.map(m => (
              <div
                key={m.key}
                className={`checkin-mood-btn ${mood === m.key ? 'selected' : ''}`}
                onClick={() => setMood(m.key)}
              >
                {m.emoji}<span>{m.key}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-section">
          <label>今日筆記（選填）</label>
          <textarea
            className="checkin-note"
            placeholder="記錄一下今天的狀態、想法..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>稍後再說</button>
          <button className="btn-primary" onClick={handleSubmit}>完成打卡</button>
        </div>
      </div>
    </div>
  )
}
