import { Component } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import { DataProvider } from './context/DataContext'
import AmbientBackground from './components/AmbientBackground'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import QuestsPage from './pages/QuestsPage'
import GardenPage from './pages/GardenPage'
import OraclePage from './pages/OraclePage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{'\u26A0\uFE0F'}</div>
            <div style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>發生了一些問題</div>
            <button className="btn-secondary" style={{ padding: '8px 20px', cursor: 'pointer' }}
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/' }}>
              重新載入
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function AppContent() {
  const { user } = useAuth()

  // Loading state
  if (user === undefined) {
    return (
      <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>{'\uD83D\uDD2E'}</div>
          <div style={{ color: 'var(--text-secondary)' }}>載入中...</div>
        </div>
      </div>
    )
  }

  // Not signed in
  if (!user) {
    return <LoginPage />
  }

  // Signed in
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quests" element={<QuestsPage />} />
        <Route path="/garden" element={<GardenPage />} />
        <Route path="/oracle" element={<OraclePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </DataProvider>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AmbientBackground />
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  )
}
