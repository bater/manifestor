const RING_RADIUS = 80
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export default function EnergyRing({ energy, hasCheckin }) {
  const dashoffset = hasCheckin ? CIRCUMFERENCE - (energy / 100 * CIRCUMFERENCE) : CIRCUMFERENCE

  return (
    <div className="energy-ring">
      <svg viewBox="0 0 180 180">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c5cfc" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <circle className="ring-bg" cx="90" cy="90" r={RING_RADIUS} />
        <circle
          className="ring-fill"
          cx="90"
          cy="90"
          r={RING_RADIUS}
          style={{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: dashoffset }}
        />
      </svg>
      <div className="ring-center">
        <div className="energy-value">{hasCheckin ? energy : '--'}</div>
        <div className="energy-label">能量值</div>
      </div>
    </div>
  )
}
