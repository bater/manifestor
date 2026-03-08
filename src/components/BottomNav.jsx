import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: '\uD83C\uDFE0', label: '首頁' },
  { to: '/quests', icon: '\u26A1', label: '任務' },
  { to: '/garden', icon: '\uD83C\uDF38', label: '花園' },
  { to: '/oracle', icon: '\uD83D\uDD2E', label: '神諭' },
  { to: '/profile', icon: '\uD83D\uDC64', label: '個人' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-icon">{icon}</div>
          <div className="nav-label">{label}</div>
        </NavLink>
      ))}
    </nav>
  )
}
