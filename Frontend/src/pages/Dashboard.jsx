import { useState, useEffect } from 'react'
import { useFleetStore, useDashboardStore } from '../store'
import StatusBadge from '../components/StatusBadge'

function Dashboard() {
  const { vehicles, trips, drivers, fetchVehicles, fetchTrips, fetchDrivers, loading, error } = useFleetStore()
  const { filters, setFilters } = useDashboardStore()

  useEffect(() => {
    fetchVehicles()
    fetchTrips()
    fetchDrivers()
  }, [])

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

  const filteredVehicles = vehicles.filter((v) => {
    if (filters.vehicleType && v.type !== filters.vehicleType) return false
    if (filters.status && v.status !== filters.status) return false
    if (filters.region && v.region !== filters.region) return false
    return true
  })

  if (loading && vehicles.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Fleet</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats.activeFleet}/{stats.totalVehicles}
              </p>
            </div>
            <div className="text-4xl">🚐</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Maintenance Alerts
              </p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.maintenanceAlerts}
              </p>
            </div>
            <div className="text-4xl">🔧</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Utilization Rate
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.utilizationRate}%
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Cargo</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {stats.pendingCargo}
              </p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Type
            </label>
            <select
              value={filters.vehicleType || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  vehicleType: e.target.value || null,
                })
              }
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="bike">Bike</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value || null,
                })
              }
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="on-trip">On Trip</option>
              <option value="in-shop">In Shop</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              value={filters.region || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  region: e.target.value || null,
                })
              }
              className="input-field"
            >
              <option value="">All Regions</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fleet Overview Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Fleet Overview
          </h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle Name</th>
                <th>Type</th>
                <th>License Plate</th>
                <th>Status</th>
                <th>Region</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="font-medium">{vehicle.name}</td>
                    <td>{vehicle.type.toUpperCase()}</td>
                    <td className="text-gray-600">{vehicle.licensePlate}</td>
                    <td>
                      <StatusBadge status={vehicle.status} />
                    </td>
                    <td>{vehicle.region}</td>
                    <td>{vehicle.maxCapacity} kg</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No vehicles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <p className="text-gray-600 text-sm">Total Drivers</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {stats.totalDrivers}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-gray-600 text-sm">Completed Trips</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {stats.completedTrips}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-gray-600 text-sm">Total Vehicles</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {stats.totalVehicles}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
