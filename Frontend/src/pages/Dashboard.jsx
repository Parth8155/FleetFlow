import { useState, useEffect } from 'react'
import { useFleetStore, useDashboardStore } from '../store'
import StatusBadge from '../components/StatusBadge'
import { 
  TruckIcon, 
  WrenchScrewdriverIcon, 
  ChartBarIcon, 
  CubeIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  VariableIcon
} from '@heroicons/react/24/outline'

function Dashboard() {
  const { vehicles, trips, drivers, fetchVehicles, fetchTrips, fetchDrivers, loading, error } = useFleetStore()
  const { filters, setFilters, searchQuery } = useDashboardStore()
  
  // Group, Filter, Sort state
  const [groupBy, setGroupBy] = useState('none')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  useEffect(() => {
    fetchVehicles()
    fetchTrips()
    fetchDrivers()
  }, [])

  const getDriverName = (vehicleId) => {
    const activeTrip = trips.find(t => t.vehicleId === vehicleId && t.status === 'dispatched')
    if (!activeTrip) return '—'
    const driver = drivers.find(d => d.id === activeTrip.driverId)
    return driver ? driver.name : 'Unknown'
  }

  const stats = {
    activeFleet: vehicles.filter((v) => v.status === 'on-trip').length,
    maintenanceAlerts: vehicles.filter((v) => v.status === 'in-shop').length,
    utilizationRate: vehicles.length > 0
      ? Math.round((vehicles.filter((v) => v.status === 'on-trip').length / vehicles.length) * 100)
      : 0,
    pendingCargo: trips.filter((t) => t.status === 'draft').length,
    totalVehicles: vehicles.length,
    totalDrivers: drivers.length,
    completedTrips: trips.filter((t) => t.status === 'completed').length,
  }

  // Apply filters
  const filteredVehicles = vehicles.filter((v) => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const driverName = getDriverName(v.id).toLowerCase()
      const matchesSearch = 
        v.name?.toLowerCase().includes(query) || 
        v.licensePlate?.toLowerCase().includes(query) ||
        v.type?.toLowerCase().includes(query) ||
        driverName.includes(query)
      
      if (!matchesSearch) return false
    }

    if (filters.vehicleType && v.type !== filters.vehicleType) return false
    if (filters.status && v.status !== filters.status) return false
    return true
  })

  // Apply sorting
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    let comparison = 0
    
    switch(sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'capacity':
        comparison = a.maxCapacity - b.maxCapacity
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      default:
        comparison = 0
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  // Apply grouping
  const getGroupedData = () => {
    if (groupBy === 'none') {
      return { 'All Vehicles': sortedVehicles }
    }

    const grouped = {}
    
    sortedVehicles.forEach((vehicle) => {
      let key
      
      switch(groupBy) {
        case 'status':
          key = vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1).replace('-', ' ')
          break
        case 'type':
          key = vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)
          break
        default:
          key = 'All Vehicles'
      }
      
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(vehicle)
    })
    
    return grouped
  }

  const groupedData = getGroupedData()

  if (loading && vehicles.length === 0) {
    return (
      <div className="p-10 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass, bgClass }) => (
    <div className="card p-6 flex items-start justify-between group hover:shadow-lg transition-all duration-300">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-4 rounded-2xl ${bgClass} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-8 h-8 ${colorClass}`} />
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded shadow-sm">
          <p className="font-medium text-sm">Error loading data</p>
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Fleet" 
          value={`${stats.activeFleet}/${stats.totalVehicles}`}
          icon={TruckIcon}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
          subtext="On trip"
        />
        <StatCard 
          title="Maintenance" 
          value={stats.maintenanceAlerts}
          icon={WrenchScrewdriverIcon}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
          subtext="In shop"
        />
        <StatCard 
          title="Utilization" 
          value={`${stats.utilizationRate}%`}
          icon={ChartBarIcon}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
          subtext="Fleet rate"
        />
        <StatCard 
          title="Pending Cargo" 
          value={stats.pendingCargo}
          icon={CubeIcon}
          colorClass="text-purple-600"
          bgClass="bg-purple-50"
          subtext="Drafts"
        />
      </div>

      {/* Fleet Management Controls */}
      <div className="card p-5">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 1. Filter Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wider">
              <FunnelIcon className="w-3.5 h-3.5 text-indigo-600" />
              Filter
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <select
                  value={filters.vehicleType || ''}
                  onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value || null })}
                  className="input-field appearance-none py-1.5 px-3 text-xs"
                >
                  <option value="">All Types</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="bike">Bike</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
              <div className="relative">
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value || null })}
                  className="input-field appearance-none py-1.5 px-3 text-xs"
                >
                  <option value="">All Status</option>
                  <option value="available">Available</option>
                  <option value="on-trip">On Trip</option>
                  <option value="in-shop">In Shop</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Group Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wider">
              <VariableIcon className="w-3.5 h-3.5 text-indigo-600" />
              Group
            </h3>
            <div className="relative">
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="input-field appearance-none py-1.5 px-3 text-xs"
              >
                <option value="none">No Grouping</option>
                <option value="status">By Status</option>
                <option value="type">By Type</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
          </div>

          {/* 3. Sort Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wider">
              <ArrowsUpDownIcon className="w-3.5 h-3.5 text-indigo-600" />
              Sort
            </h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field appearance-none py-1.5 px-3 text-xs w-full"
                >
                  <option value="name">Name</option>
                  <option value="capacity">Capacity</option>
                  <option value="type">Type</option>
                  <option value="status">Status</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1.5 min-w-[70px]"
              >
                {sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
              </button>
              <button 
                onClick={() => {
                  setFilters({})
                  setGroupBy('none')
                  setSortBy('name')
                  setSortOrder('asc')
                  useDashboardStore.getState().setSearchQuery('')
                }}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all ml-auto"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Fleet Overview */}
      {Object.entries(groupedData).map(([groupName, groupVehicles]) => (
        <div key={groupName} className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800">{groupName}</h3>
                <p className="text-xs text-gray-500">{groupVehicles.length} vehicles</p>
              </div>
              <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold text-xs">
                {groupVehicles.length}
              </div>
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="pl-6 py-3 text-xs">Vehicle Name</th>
                  <th className="py-3 text-xs">Type</th>
                  <th className="py-3 text-xs">License Plate</th>
                  <th className="py-3 text-xs">Status</th>
                  <th className="py-3 text-xs">Driver</th>
                  <th className="pr-6 py-3 text-xs text-right">Capacity</th>
                </tr>
              </thead>
              <tbody>
                {groupVehicles.length > 0 ? (
                  groupVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="group hover:bg-gray-50/50">
                      <td className="pl-6 py-3">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <TruckIcon className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-gray-700">{vehicle.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-xs italic text-gray-500 uppercase">
                        {vehicle.type}
                      </td>
                      <td className="py-3 text-gray-500 font-mono text-xs">{vehicle.licensePlate}</td>
                      <td className="py-3">
                        <StatusBadge status={vehicle.status} />
                      </td>
                      <td className="py-3 text-xs font-medium text-gray-600">
                        {getDriverName(vehicle.id)}
                      </td>
                      <td className="pr-6 py-3 text-right">
                        <span className="text-sm text-gray-900 font-semibold">{vehicle.maxCapacity} kg</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-xs text-gray-400">
                      No vehicles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
             <UserGroupIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Drivers</p>
            <p className="text-xl font-bold text-gray-900">{stats.totalDrivers}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
             <CheckBadgeIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Trips</p>
            <p className="text-xl font-bold text-gray-900">{stats.completedTrips}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
             <TruckIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Fleet</p>
            <p className="text-xl font-bold text-gray-900">{stats.totalVehicles}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
