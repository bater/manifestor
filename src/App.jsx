import { Routes, Route } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import AmbientBackground from './components/AmbientBackground'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import QuestsPage from './pages/QuestsPage'
import GardenPage from './pages/GardenPage'
import OraclePage from './pages/OraclePage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <DataProvider>
      <AmbientBackground />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quests" element={<QuestsPage />} />
        <Route path="/garden" element={<GardenPage />} />
        <Route path="/oracle" element={<OraclePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <BottomNav />
    </DataProvider>
  )
}
