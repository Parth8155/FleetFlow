import { Link, useLocation } from 'react-router-dom'

function Sidebar({ open, setOpen }) {
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/vehicles', label: 'Vehicle Registry', icon: '🚐' },
    { path: '/trips', label: 'Trip Dispatcher', icon: '🗺️' },
    { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
    { path: '/expenses', label: 'Expenses & Fuel', icon: '⛽' },
    { path: '/drivers', label: 'Driver Profiles', icon: '👥' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:relative lg:w-auto lg:shadow-none`}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-blue-600">FleetFlow</h2>
          <p className="text-sm text-gray-600 mt-1">Fleet & Logistics</p>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-4 right-4 text-xs text-gray-500">
          <p>© 2026 FleetFlow</p>
          <p>v1.0.0</p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
