import { Link, useLocation } from 'react-router-dom'
import { 
  ChartBarIcon, 
  TruckIcon, 
  MapIcon, 
  WrenchScrewdriverIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  PresentationChartLineIcon 
} from '@heroicons/react/24/outline'

function Sidebar({ open, setOpen }) {
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { path: '/vehicles', label: 'Vehicle Registry', icon: TruckIcon },
    { path: '/trips', label: 'Trip Dispatcher', icon: MapIcon },
    { path: '/maintenance', label: 'Maintenance', icon: WrenchScrewdriverIcon },
    { path: '/expenses', label: 'Expenses & Fuel', icon: CurrencyDollarIcon },
    { path: '/drivers', label: 'Driver Profiles', icon: UserGroupIcon },
    { path: '/analytics', label: 'Analytics', icon: PresentationChartLineIcon },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-sidebar text-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 rounded-r-3xl overflow-hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:rounded-none lg:h-auto lg:shadow-none shrink-0`}
      >
        <div className="p-8 pb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-xl font-bold text-white">F</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">FleetFlow</h2>
            <p className="text-xs text-gray-400 font-medium">Logistics Management</p>
          </div>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)} // Close on mobile navigation
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'bg-white text-sidebar shadow-lg font-semibold transform scale-[1.02]'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-600' : ''}`} />
                <span className="tracking-wide">{item.label}</span>
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-l-full" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-8 left-6 right-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-xs font-bold ring-2 ring-sidebar">
              JD
            </div>
            <div>
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-gray-400">Manager</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
