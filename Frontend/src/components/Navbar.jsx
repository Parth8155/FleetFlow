import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store'

function Navbar({ onMenuClick }) {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const getPageTitle = () => {
    const titles = {
      '/dashboard': 'Dashboard',
      '/vehicles': 'Vehicle Registry',
      '/trips': 'Trip Dispatcher',
      '/maintenance': 'Maintenance Logs',
      '/expenses': 'Expenses & Fuel',
      '/drivers': 'Driver Profiles',
      '/analytics': 'Analytics & Reports',
    }
    return titles[location.pathname] || 'FleetFlow'
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {user?.name || 'User'}
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
