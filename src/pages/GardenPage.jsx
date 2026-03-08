import { useState, useRef, useEffect, useCallback } from 'react'
import { useData } from '../context/useData'

const moodConfig = {
  '平靜': { hueBase: 200, speed: 0.3, count: 40, label: '粒子在寧靜中輕輕飄盪' },
  '充電中': { hueBase: 280, speed: 1.2, count: 80, label: '能量粒子正蓄勢待發！' },
  '流動': { hueBase: 250, speed: 0.6, count: 60, label: '你的能量粒子正輕柔地流動' },
  '耗盡': { hueBase: 220, speed: 0.15, count: 25, label: '粒子正在休息，蓄積能量中...' },
  '燃燒': { hueBase: 20, speed: 1.0, count: 70, label: '粒子正燃燒著創意之火！' },
}

const moodButtons = [
  { key: '平靜', emoji: '\uD83D\uDE0C' },
  { key: '充電中', emoji: '\uD83D\uDCAB' },
  { key: '流動', emoji: '\uD83C\uDF38' },
  { key: '耗盡', emoji: '\uD83D\uDC94' },
  { key: '燃燒', emoji: '\uD83D\uDD25' },
]

const cards = [
  { tag: '創意之流', text: '「你想行動的衝動，就是訊號本身。\n相信那股推力。告知，然後行動。」' },
  { tag: '靜養恢復', text: '「靜止不是懶惰。\n你的力量在寂靜中重新充電。」' },
  { tag: '顯示者能量', text: '「你不需要許可。\n你需要的是清晰。然後行動。」' },
  { tag: '內在平靜', text: '「內心的風暴不是你的敵人。\n它是等待方向的引擎。」' },
  { tag: '連結', text: '「告知身邊的人。\n不是為了獲得認可——是為了順流。」' },
  { tag: '界限智慧', text: '「說不是一種創造性的行為。\n它守護著你說好的空間。」' },
  { tag: '發起', text: '「你天生就是來啟動事物的。\n讓別人接手你點燃的火焰。」' },
  { tag: '自我信任', text: '「你的身體比頭腦更早知道答案。\n聽從那股拉力，而非雜音。」' },
]

export default function GardenPage() {
  const { incrementCounter } = useData()
  const [selectedMood, setSelectedMood] = useState('流動')
  const [cardIndex, setCardIndex] = useState(0)
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animFrameRef = useRef(null)

  const cfg = moodConfig[selectedMood]

  const initParticles = useCallback((w, h) => {
    const particles = []
    for (let i = 0; i < cfg.count; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 4 + 2,
        dx: (Math.random() - 0.5) * cfg.speed,
        dy: (Math.random() - 0.5) * cfg.speed,
        hue: cfg.hueBase + Math.random() * 40,
        alpha: Math.random() * 0.5 + 0.3,
      })
    }
    return particles
  }, [cfg])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const container = canvas.parentElement

    const resize = () => {
      canvas.width = container.clientWidth * 2
      canvas.height = container.clientHeight * 2
      canvas.style.width = container.clientWidth + 'px'
      canvas.style.height = container.clientHeight + 'px'
      ctx.setTransform(2, 0, 0, 2, 0, 0)
    }

    resize()
    const w = canvas.width / 2
    const h = canvas.height / 2
    particlesRef.current = initParticles(w, h)

    const draw = () => {
      const particles = particlesRef.current
      const cw = canvas.width / 2
      const ch = canvas.height / 2
      ctx.clearRect(0, 0, cw, ch)

      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > cw) p.dx *= -1
        if (p.y < 0 || p.y > ch) p.dy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.alpha})`
        ctx.fill()

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.alpha * 0.15})`
        ctx.fill()
      })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 60) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `hsla(260, 50%, 60%, ${0.1 * (1 - dist / 60)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    animFrameRef.current = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [selectedMood, initParticles])

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood)
    incrementCounter('gardenVisits')
  }

  const handleDrawCard = () => {
    setCardIndex(prev => (prev + 1) % cards.length)
  }

  const card = cards[cardIndex]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>心靈花園</h1>
          <div className="subtitle">心情粒子與創意火花</div>
        </div>
      </div>

      <div className="section-title">現在的能量狀態？</div>
      <div className="mood-selector">
        {moodButtons.map(m => (
          <div
            key={m.key}
            className={`mood-btn ${selectedMood === m.key ? 'selected' : ''}`}
            onClick={() => handleMoodSelect(m.key)}
          >
            {m.emoji}<span>{m.key}</span>
          </div>
        ))}
      </div>

      <div className="garden-canvas">
        <canvas ref={canvasRef} />
        <div className="garden-label">{cfg.label}</div>
      </div>

      <div className="section-title">每日靈感卡</div>
      <div className="inspiration-card">
        <div className="card-tag">卡片 #{(cardIndex + 1) * 7} / {card.tag}</div>
        <div className="card-text" style={{ whiteSpace: 'pre-line' }}>{card.text}</div>
      </div>
      <button className="draw-btn" onClick={handleDrawCard}>抽取新的靈感卡</button>
    </div>
  )
}
