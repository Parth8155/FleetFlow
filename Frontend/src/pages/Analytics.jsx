import { useState, useEffect } from 'react'
import { useFleetStore } from '../store'
import FilterBar from '../components/FilterBar'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Fuel, Zap, AlertTriangle, Download, FileSpreadsheet, Printer 
} from 'lucide-react'

function Analytics() {
  const { 
    vehicles, 
    trips, 
    expenses, 
    drivers, 
    maintenanceLogs,
    fetchVehicles, 
    fetchTrips, 
    fetchExpenses, 
    fetchDrivers,
    fetchMaintenanceLogs,
    loading, 
    error 
  } = useFleetStore()

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'profit', direction: 'desc' })

  useEffect(() => {
    fetchVehicles()
    fetchTrips()
    fetchExpenses()
    fetchDrivers()
    fetchMaintenanceLogs()
  }, [])

  // Calculate KPIs
  const completedTrips = trips.filter((t) => t.status === 'completed')

  const totalRevenue = completedTrips.reduce((sum, t) => {
    const distance = (t.endOdometer || 0) - (t.startOdometer || 0)
    return sum + distance * 10 // Assuming ₹10 per km
  }, 0)

  // Maintenance includes both maintenance expenses and completed maintenance records
  const totalMaintenance = [
    ...expenses.filter((e) => e.type === 'maintenance'),
    ...maintenanceLogs.filter((m) => m.status === 'completed')
  ].reduce((sum, item) => sum + (item.amount || item.cost || 0), 0)

  const totalFuelFromTrips = completedTrips.reduce((sum, t) => sum + (t.actualFuelCost || 0), 0)
  const totalFuel = expenses
    .filter((e) => e.type === 'fuel')
    .reduce((sum, e) => sum + e.amount, 0) + totalFuelFromTrips

  const totalCost = totalMaintenance + totalFuel
  const netProfit = totalRevenue - totalCost
  const fleetROI = totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(1) : 0
  const utilizationRate = vehicles.length > 0 
    ? Math.round((vehicles.filter(v => v.status === 'on-trip').length / vehicles.length) * 100)
    : 0

  // Monthly Data Processing
  const getMonthlyData = () => {
    const monthlyMap = {}
    
    // Group Revenue (from trips)
    completedTrips.forEach(t => {
      const month = new Date(t.endTime || t.createdAt).toLocaleString('default', { month: 'short' })
      const dist = (t.endOdometer || 0) - (t.startOdometer || 0)
      const rev = dist * 10
      if (!monthlyMap[month]) monthlyMap[month] = { month, revenue: 0, fuel: 0, maintenance: 0, distance: 0, fuelLiters: 0 }
      monthlyMap[month].revenue += rev
      monthlyMap[month].distance += dist
      // Include fuel recorded directly on the trip
      monthlyMap[month].fuel += (t.actualFuelCost || 0)
      monthlyMap[month].fuelLiters += (t.fuelConsumed || 0)
    })

    // Group Fuel Expenses
    expenses.filter(e => e.type === 'fuel').forEach(e => {
      const month = new Date(e.date).toLocaleString('default', { month: 'short' })
      if (!monthlyMap[month]) monthlyMap[month] = { month, revenue: 0, fuel: 0, maintenance: 0, distance: 0, fuelLiters: 0 }
      monthlyMap[month].fuel += e.amount
      monthlyMap[month].fuelLiters += (e.units || 0)
    })

    // Group Maintenance
    const allMaint = [
      ...expenses.filter(e => e.type === 'maintenance'),
      ...maintenanceLogs.filter(m => m.status === 'completed').map(m => ({ ...m, amount: m.cost, date: m.completedDate || m.updatedAt }))
    ]
    allMaint.forEach(m => {
      const month = new Date(m.date).toLocaleString('default', { month: 'short' })
      if (!monthlyMap[month]) monthlyMap[month] = { month, revenue: 0, fuel: 0, maintenance: 0, distance: 0, fuelLiters: 0 }
      monthlyMap[month].maintenance += (m.amount || m.cost || 0)
    })

    return Object.values(monthlyMap).map(m => ({
      ...m,
      netProfit: m.revenue - m.fuel - m.maintenance,
      efficiency: m.fuelLiters > 0 ? (m.distance / m.fuelLiters).toFixed(1) : 0
    }))
  }

  const monthlyReport = getMonthlyData()

  // Top 5 Costliest Vehicles
  const costliestVehicles = vehicles.map(v => {
    const cost = [
      ...expenses.filter(e => e.vehicleId === v.id),
      ...maintenanceLogs.filter(m => m.vehicleId === v.id && m.status === 'completed'),
      ...trips.filter(t => t.vehicleId === v.id).map(t => ({ amount: t.actualFuelCost || 0 }))
    ].reduce((sum, item) => sum + (item.amount || item.cost || 0), 0)
    return { name: v.model.split(' ')[0], fullModel: v.model, cost }
  }).sort((a,b) => b.cost - a.cost).slice(0, 5)

  // Dead Stock Alert (Idle for > 30 days)
  const deadStock = vehicles.filter(v => {
    const vehicleTrips = trips.filter(t => t.vehicleId === v.id)
    if (vehicleTrips.length === 0) return true
    const lastTrip = [...vehicleTrips].sort((a,b) => new Date(b.endTime || b.createdAt) - new Date(a.endTime || a.createdAt))[0]
    const daysIdle = (new Date() - new Date(lastTrip.endTime || lastTrip.createdAt)) / (1000 * 60 * 60 * 24)
    return daysIdle > 30 && v.status === 'available'
  })

  const vehicleROI = (vehicle) => {
    const acquisitionCost = vehicle.acquisitionCost || (vehicle.maxCapacity * 5000)
    const vehicleTrips = trips.filter((t) => t.vehicleId === vehicle.id)
    
    // Sum maintenance expenses + maintenance records + fuel for this vehicle
    const vehicleExpense = [
      ...expenses.filter((e) => e.vehicleId === vehicle.id),
      ...maintenanceLogs.filter((m) => m.vehicleId === vehicle.id && m.status === 'completed'),
      ...vehicleTrips.map(t => ({ amount: t.actualFuelCost || 0 }))
    ].reduce((sum, item) => sum + (item.amount || item.cost || 0), 0)

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

  const totalFuelLiters =
    (expenses
      .filter((e) => e.type === 'fuel')
      .reduce((sum, e) => sum + (e.units || 0), 0) || 0) +
    completedTrips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0)

  const totalDistance = completedTrips.reduce(
    (sum, t) => sum + ((t.endOdometer || 0) - (t.startOdometer || 0)),
    0
  )

  const fuelEfficiency = (totalDistance > 0 && totalFuelLiters > 0) 
    ? (totalDistance / totalFuelLiters).toFixed(2) 
    : 0

  const costPerKM = totalDistance > 0 ? (totalCost / totalDistance).toFixed(2) : 0

  const avgDriverSafetyScore =
    drivers.length > 0
      ? (drivers.reduce((sum, d) => sum + d.safetyScore, 0) / drivers.length).toFixed(2)
      : 0

  const costPerTrip =
    completedTrips.length > 0 ? (totalCost / completedTrips.length).toFixed(2) : 0

  const processedVehicles = vehicles.map(vehicle => {
    const stats = vehicleROI(vehicle)
    const tripCount = trips.filter(t => t.vehicleId === vehicle.id).length
    return {
      ...vehicle,
      ...stats,
      tripCount,
      revenueVal: stats.revenue, // Store raw numbers for sorting
      expenseVal: stats.expense,
      profitVal: stats.profit,
      roiVal: parseFloat(stats.roi)
    }
  })

  const filteredVehicles = processedVehicles
    .filter(vehicle => 
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let valA, valB
      
      switch(sortConfig.key) {
        case 'tripCount': valA = a.tripCount; valB = b.tripCount; break;
        case 'revenue': valA = a.revenueVal; valB = b.revenueVal; break;
        case 'expense': valA = a.expenseVal; valB = b.expenseVal; break;
        case 'profit': valA = a.profitVal; valB = b.profitVal; break;
        case 'roi': valA = a.roiVal; valB = b.roiVal; break;
        default: valA = 0; valB = 0;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

  const handleSortChange = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSortConfig({ key: 'profit', direction: 'desc' })
  }

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
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Operational Analytics & Reports
        </h2>
        <div className="flex gap-2">
            <button 
              onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8,Month,Distance,Revenue,Expenses,Efficiency\n" + 
                  monthlyReport.map(r => `${r.month},${r.distance},${r.revenue},${r.expenses},${r.efficiency}`).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `FleetFlow_Report_${new Date().toLocaleDateString()}.csv`);
                document.body.appendChild(link);
                link.click();
              }}
              className="btn btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 hover:bg-gray-100 border-gray-300"
            >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                CSV Report
            </button>
            <button 
              onClick={() => window.print()}
              className="btn btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 hover:bg-gray-100 border-gray-300"
            >
                <Download className="w-4 h-4 text-indigo-600" />
                Print/PDF
            </button>
        </div>
      </div>

      {/* Main Metrics - Fixed to match wireframe style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-2 border-emerald-100 bg-white hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
             <p className="text-emerald-800 text-sm font-bold uppercase tracking-wider">Total Fuel Cost</p>
             <Fuel className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-900 mt-2">
            ₹{(totalFuel / 100000).toFixed(1)} Lakh
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600">
            <TrendingDown className="w-3 h-3" />
            <span>-2.4% vs last month</span>
          </div>
        </div>

        <div className="card p-6 border-2 border-indigo-100 bg-white hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
             <p className="text-indigo-800 text-sm font-bold uppercase tracking-wider">Fleet ROI</p>
             <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-indigo-900 mt-2">
            +{fleetROI}%
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-indigo-600">
            <TrendingUp className="w-3 h-3" />
            <span>+1.5% improvement</span>
          </div>
        </div>

        <div className="card p-6 border-2 border-amber-100 bg-white hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
             <p className="text-amber-800 text-sm font-bold uppercase tracking-wider">Utilization Rate</p>
             <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-900 mt-2">
            {utilizationRate}%
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-amber-600">
             <span>{vehicles.filter(v => v.status === 'on-trip').length} active vehicles</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 min-h-[400px]">
          <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
             <TrendingUp className="w-4 h-4 text-indigo-600" />
             Fuel Efficiency Trend (km/L)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyReport}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#4f46e5" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 min-h-[400px]">
          <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
             <TrendingDown className="w-4 h-4 text-rose-600" />
             Top 5 Costliest Vehicles (₹)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costliestVehicles}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                   cursor={{ fill: '#f3f4f6' }}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
                  {costliestVehicles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#f59e0b', '#fbbf24', '#fcd34d'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dead Stock & Alerts */}
      {deadStock.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-100 rounded-2xl p-4 flex items-start gap-4">
            <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
                <h4 className="text-rose-900 font-bold">Dead Stock Alert</h4>
                <p className="text-rose-700 text-sm mt-0.5">
                    {deadStock.length} vehicles have been idle for more than 30 days. Consider selling or re-allocating:
                    <span className="font-bold ml-1">{deadStock.map(v => v.model).join(', ')}</span>
                </p>
            </div>
        </div>
      )}

      {/* Financial Summary Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
           <h3 className="text-base font-bold text-gray-800">Monthly Financial Summary</h3>
           <div className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
               Last 6 Months
           </div>
        </div>
        <div className="table-responsive">
          <table className="table w-full">
            <thead>
              <tr className="bg-white">
                <th className="pl-6 py-4 text-left font-bold text-gray-400 uppercase tracking-wider text-[10px]">Month</th>
                <th className="py-4 text-left font-bold text-gray-400 uppercase tracking-wider text-[10px]">Revenue</th>
                <th className="py-4 text-left font-bold text-gray-400 uppercase tracking-wider text-[10px]">Fuel Cost</th>
                <th className="py-4 text-left font-bold text-gray-400 uppercase tracking-wider text-[10px]">Maintenance</th>
                <th className="pr-6 py-4 text-right font-bold text-gray-400 uppercase tracking-wider text-[10px]">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {monthlyReport.length > 0 ? (
                monthlyReport.map((row) => (
                  <tr key={row.month} className="hover:bg-gray-50/50 transition-colors">
                    <td className="pl-6 py-4 font-bold text-gray-800">{row.month}</td>
                    <td className="py-4 font-medium text-green-600">₹{(row.revenue / 100000).toFixed(1)}L</td>
                    <td className="py-4 font-medium text-rose-600">₹{(row.fuel / 100000).toFixed(1)}L</td>
                    <td className="py-4 font-medium text-orange-600">₹{(row.maintenance / 100000).toFixed(1)}L</td>
                    <td className="pr-6 py-4 text-right">
                       <span className={`px-3 py-1 rounded-lg font-bold text-sm ${row.netProfit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          ₹{(row.netProfit / 100000).toFixed(1)}L
                       </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 font-medium">No financial data available for the current period.</td>
                </tr>
              )}
            </tbody>
          </table>
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
            {totalFuelLiters}L consumed
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

      
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={{}}
        onFilterChange={() => {}}
        filterOptions={[]}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        sortOptions={[
          { value: 'profit', label: 'Profit' },
          { value: 'roi', label: 'ROI' },
          { value: 'revenue', label: 'Revenue' },
          { value: 'expense', label: 'Expenses' },
          { value: 'tripCount', label: 'Total Trips' }
        ]}
        onReset={resetFilters}
      />

      {/* Vehicle Performance */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">
            Vehicle Value & ROI Tracker
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Analyzing Revenue vs (Fuel + Maintenance + Acquisition Cost)
          </p>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Trips</th>
                <th>Revenue</th>
                <th>Expenses</th>
                <th>Profit</th>
                <th>ROI (%)</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="font-medium">{vehicle.model}</td>
                  <td>{vehicle.tripCount}</td>
                  <td className="text-green-600 font-medium">
                    ₹{vehicle.revenue.toLocaleString()}
                  </td>
                  <td className="text-red-600 font-medium">
                    ₹{vehicle.expense.toLocaleString()}
                  </td>
                  <td className="font-medium">
                    ₹{vehicle.profit.toLocaleString()}
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        vehicle.roi >= 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {vehicle.roi}%
                    </span>
                  </td>
                </tr>
              ))}
              {filteredVehicles.length === 0 && (
                <tr>
                   <td colSpan={6} className="text-center py-6 text-gray-400">No vehicles found.</td>
                </tr>
              )}
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
          One-Click Reports
        </h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8,Month,Distance,Revenue,Expenses,Efficiency\n" + 
                monthlyReport.map(r => `${r.month},${r.distance},${r.revenue},${r.expenses},${r.efficiency}`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `FleetFlow_Full_Report_${new Date().toLocaleDateString()}.csv`);
              document.body.appendChild(link);
              link.click();
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            📄 Export as CSV
          </button>
          <button 
            onClick={() => window.print()}
            className="btn btn-primary flex items-center gap-2"
          >
            📋 Export as PDF
          </button>
          <button 
            onClick={() => alert("Chart export feature coming soon!")}
            className="btn btn-primary flex items-center gap-2"
          >
            📊 Export Charts
          </button>
          <button 
            onClick={() => window.print()}
            className="btn btn-secondary flex items-center gap-2"
          >
            🖨️ Print Report
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Generate professional reports for stakeholders, maintenance audits, and financial tracking.
        </p>
      </div>
    </div>
  )
}

export default Analytics
