import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store'
import { 
  BellIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon 
} from '@heroicons/react/24/outline'

function Navbar({ onMenuClick }) {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

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

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="bg-bg-main pt-4 px-6 pb-2">
      <div className="flex items-center justify-between h-20 bg-white rounded-2xl shadow-sm px-6 border border-gray-100">
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuClick}
            className="text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors lg:hidden"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800 hidden md:block">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-indigo-600 transition-all">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          
          <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-700">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Manager'}</p>
             </div>
             <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center">
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-tr from-indigo-500 to-purple-600">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
             </div>
          </div>

          <button 
            onClick={handleLogout}
            className="ml-2 p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}
export default Navbar
