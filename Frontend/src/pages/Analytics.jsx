import { useEffect } from 'react'
import { useFleetStore } from '../store'

function Analytics() {
  const { vehicles, trips, expenses, drivers, fetchVehicles, fetchTrips, fetchExpenses, fetchDrivers, loading, error } = useFleetStore()

  useEffect(() => {
    fetchVehicles()
    fetchTrips()
    fetchExpenses()
    fetchDrivers()
  }, [])

  // Calculate KPIs
  const completedTrips = trips.filter((t) => t.status === 'completed')

  const totalRevenue = completedTrips.reduce((sum, t) => {
    const distance = (t.endOdometer || 0) - (t.startOdometer || 0)
    return sum + distance * 10 // Assuming ₹10 per km
  }, 0)

  const totalMaintenance = expenses
    .filter((e) => e.type === 'maintenance')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalFuel = expenses
    .filter((e) => e.type === 'fuel')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalCost = totalMaintenance + totalFuel

  const vehicleROI = (vehicle) => {
    const acquisitionCost = vehicle.maxCapacity * 5000 // Assume ₹5000 per kg capacity
    const vehicleTrips = trips.filter((t) => t.vehicleId === vehicle.id)
    const vehicleExpense = expenses
      .filter((e) => e.vehicleId === vehicle.id)
      .reduce((sum, e) => sum + e.amount, 0)

    const vehicleRevenue = vehicleTrips.reduce((sum, t) => {
      const distance = (t.endOdometer || 0) - (t.startOdometer || 0)
      return sum + distance * 10
    }, 0)

    const roi =
      acquisitionCost > 0
        ? (((vehicleRevenue - vehicleExpense) / acquisitionCost) * 100).toFixed(2)
        : 0

    return {
      roi,
      revenue: vehicleRevenue,
      expense: vehicleExpense,
      profit: vehicleRevenue - vehicleExpense,
    }
  }

  const avgFuelLiters =
    expenses
      .filter((e) => e.type === 'fuel')
      .reduce((sum, e) => sum + (e.unit || 0), 0) || 0

  const totalDistance = completedTrips.reduce(
    (sum, t) => sum + ((t.endOdometer || 0) - (t.startOdometer || 0)),
    0
  )

  const fuelEfficiency = totalDistance > 0 ? (totalDistance / avgFuelLiters).toFixed(2) : 0

  const costPerKM = totalDistance > 0 ? (totalCost / totalDistance).toFixed(2) : 0

  const avgDriverSafetyScore =
    drivers.length > 0
      ? (drivers.reduce((sum, d) => sum + d.safetyScore, 0) / drivers.length).toFixed(2)
      : 0

  const costPerTrip =
    completedTrips.length > 0 ? (totalCost / completedTrips.length).toFixed(2) : 0

  if (loading && vehicles.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <h2 className="text-2xl font-bold text-gray-900">
        Operational Analytics & Reports
      </h2>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <p className="text-gray-600 text-sm">Total Trips Completed</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {completedTrips.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {vehicles.length} vehicles operated
          </p>
        </div>

        <div className="card p-6">
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ₹{totalRevenue}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {totalDistance} km traveled
          </p>
        </div>

        <div className="card p-6">
          <p className="text-gray-600 text-sm">Total Operational Cost</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            ₹{totalCost}
          </p>
          <p className="text-xs text-gray-500 mt-1">Fuel + Maintenance</p>
        </div>

        <div className="card p-6">
          <p className="text-gray-600 text-sm">Net Profit</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            ₹{totalRevenue - totalCost}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Margin: {((((totalRevenue - totalCost) / totalRevenue) * 100) || 0).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <p className="text-gray-600 text-sm">Fuel Efficiency</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {fuelEfficiency} km/L
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {avgFuelLiters}L consumed
          </p>
        </div>

        <div className="card p-6">
          <p className="text-gray-600 text-sm">Cost per KM</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            ₹{costPerKM}
          </p>
          <p className="text-xs text-gray-500 mt-1">Operational efficiency</p>
        </div>

        <div className="card p-6">
          <p className="text-gray-600 text-sm">Avg Driver Safety Score</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {avgDriverSafetyScore}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {drivers.length} active drivers
          </p>
        </div>
      </div>

      {/* Vehicle Performance */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Vehicle Performance Analytics
          </h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Trips</th>
                <th>Revenue</th>
                <th>Expenses</th>
                <th>Profit</th>
                <th>ROI (%)</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => {
                const stats = vehicleROI(vehicle)
                const vehicleTrips = trips.filter(
                  (t) => t.vehicleId === vehicle.id
                ).length

                return (
                  <tr key={vehicle.id}>
                    <td className="font-medium">{vehicle.name}</td>
                    <td>{vehicleTrips}</td>
                    <td className="text-green-600 font-medium">
                      ₹{stats.revenue}
                    </td>
                    <td className="text-red-600 font-medium">
                      ₹{stats.expense}
                    </td>
                    <td className="font-medium">
                      ₹{stats.profit}
                    </td>
                    <td>
                      <span
                        className={`font-semibold ${
                          stats.roi >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {stats.roi}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cost Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Fuel Cost</p>
              <p className="font-semibold">₹{totalFuel}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${totalCost > 0 ? (totalFuel / totalCost) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-gray-600">Maintenance Cost</p>
              <p className="font-semibold">₹{totalMaintenance}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{
                  width: `${totalCost > 0 ? (totalMaintenance / totalCost) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">Total Cost</p>
                <p className="font-bold text-lg text-gray-900">
                  ₹{totalCost}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Key Metrics Summary
          </h3>
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm text-gray-600">Cost per Trip</p>
              <p className="text-2xl font-bold text-gray-900">₹{costPerTrip}</p>
            </div>

            <div className="border-b border-gray-200 pb-3">
              <p className="text-sm text-gray-600">Average Profit per Trip</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{completedTrips.length > 0
                  ? ((totalRevenue - totalCost) / completedTrips.length).toFixed(2)
                  : 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">
                Fleet Utilization Rate
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        vehicles.length > 0
                          ? ((vehicles.filter(
                            (v) => v.status === 'on-trip'
                          ).length /
                            vehicles.length) *
                            100).toFixed(0)
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="font-semibold">
                  {vehicles.length > 0
                    ? ((vehicles.filter(
                      (v) => v.status === 'on-trip'
                    ).length /
                      vehicles.length) *
                      100).toFixed(0)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Export Reports
        </h3>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary">
            📄 Export as CSV
          </button>
          <button className="btn btn-primary">
            📋 Export as PDF
          </button>
          <button className="btn btn-primary">
            📊 Export Charts
          </button>
          <button className="btn btn-secondary">
            🖨️ Print Report
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Generate monthly reports for payroll, audits, and compliance purposes.
        </p>
      </div>
    </div>
  )
}

export default Analytics
