import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import VehicleRegistry from './pages/VehicleRegistry'
import TripDispatcher from './pages/TripDispatcher'
import MaintenanceLogs from './pages/MaintenanceLogs'
import ExpensesAndFuel from './pages/ExpensesAndFuel'
import DriverProfiles from './pages/DriverProfiles'
import Analytics from './pages/Analytics'

function AppContent() {
  const { isAuthenticated } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vehicles" element={<VehicleRegistry />} />
            <Route path="/trips" element={<TripDispatcher />} />
            <Route path="/maintenance" element={<MaintenanceLogs />} />
            <Route path="/expenses" element={<ExpensesAndFuel />} />
            <Route path="/drivers" element={<DriverProfiles />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
