import { useState, useEffect } from 'react'
import { useFleetStore } from '../store'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import FilterBar from '../components/FilterBar'

function TripDispatcher() {
  const { vehicles, drivers, trips, fetchVehicles, fetchDrivers, fetchTrips, addTrip, completeTrip, cancelTrip, loading, error } = useFleetStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [endOdometer, setEndOdometer] = useState('')
  const [fuelConsumed, setFuelConsumed] = useState('')
  const [actualFuelCost, setActualFuelCost] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    cargoWeight: '',
    estimatedFuelCost: '',
    startPoint: '',
    endPoint: '',
  })

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ status: '' })
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' })

  useEffect(() => {
    fetchVehicles()
    fetchDrivers()
    fetchTrips()
  }, [])

  const filteredTrips = trips
    .filter((trip) => {
      const vehicle = vehicles.find((v) => String(v.id) === String(trip.vehicleId))
      const driver = drivers.find((d) => String(d.id) === String(trip.driverId))
      
      const vehicleModel = (vehicle?.model || '').toLowerCase()
      const driverName = (driver?.name || '').toLowerCase()
      const startPoint = (trip.startPoint || '').toLowerCase()
      const endPoint = (trip.endPoint || '').toLowerCase()
      const idStr = trip.id.toString()
      const search = searchQuery.toLowerCase()

      const matchesSearch =
        vehicleModel.includes(search) ||
        driverName.includes(search) ||
        startPoint.includes(search) ||
        endPoint.includes(search) ||
        idStr.includes(search)
      
      const matchesStatus = filters.status ? trip.status === filters.status : true

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key] || ''
      const bValue = b[sortConfig.key] || ''
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSortChange = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const resetFilters = () => {
    setSearchQuery('')
    setFilters({ status: '' })
    setSortConfig({ key: 'id', direction: 'desc' })
  }


  const availableVehicles = vehicles.filter((v) => v.status === 'available')
  const availableDrivers = drivers.filter((d) => d.status === 'on-duty')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: (name === 'cargoWeight' || name === 'estimatedFuelCost') ? parseFloat(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (
      !formData.vehicleId ||
      !formData.driverId ||
      !formData.cargoWeight ||
      !formData.estimatedFuelCost ||
      !formData.startPoint ||
      !formData.endPoint
    ) {
      setSubmitError('Please fill in all fields')
      return
    }

    const vehicle = vehicles.find((v) => String(v.id) === String(formData.vehicleId))
    if (!vehicle) {
      setSubmitError('Vehicle not found')
      return
    }

    if (formData.cargoWeight > vehicle.maxCapacity) {
      setSubmitError(
        `Cargo weight (${formData.cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxCapacity}kg)`
      )
      return
    }

    setIsSubmitting(true)
    try {
      await addTrip({
        vehicleId: formData.vehicleId.toString(),
        driverId: formData.driverId.toString(),
        cargoWeight: formData.cargoWeight,
        estimatedFuelCost: formData.estimatedFuelCost,
        startPoint: formData.startPoint,
        endPoint: formData.endPoint,
      })
      resetForm()
      setIsModalOpen(false)
    } catch (err) {
      setSubmitError(err.message || 'Failed to create trip')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      driverId: '',
      cargoWeight: '',
      estimatedFuelCost: '',
      startPoint: '',
      endPoint: '',
    })
    setSubmitError('')
  }

  const handleCompleteTrip = (trip) => {
    setSelectedTrip(trip)
    setEndOdometer(trip.startOdometer + 100)
    setIsCompleteModalOpen(true)
  }

  const submitComplete = async () => {
    if (!endOdometer) {
      alert('Please enter final odometer reading')
      return
    }

    setIsSubmitting(true)
    try {
      await completeTrip(
        selectedTrip.id, 
        parseFloat(endOdometer),
        fuelConsumed ? parseFloat(fuelConsumed) : null,
        actualFuelCost ? parseFloat(actualFuelCost) : null
      )
      setIsCompleteModalOpen(false)
      setSelectedTrip(null)
      setEndOdometer('')
      setFuelConsumed('')
      setActualFuelCost('')
    } catch (err) {
      alert(err.message || 'Failed to complete trip')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to cancel this trip? The driver and vehicle will be set to available.')) {
      return
    }

    try {
      await cancelTrip(tripId)
    } catch (err) {
      alert(err.message || 'Failed to cancel trip')
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Trip Dispatcher</h2>
        <button
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}
          className="btn btn-primary"
        >
          + Create Trip
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title="Create New Trip"
      >
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {submitError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Vehicle *
              </label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Choose vehicle...</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model} ({v.maxCapacity}kg capacity)
                  </option>
                ))}
              </select>
              {availableVehicles.length === 0 && (
                <p className="text-red-600 text-xs mt-1">
                  No available vehicles
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Driver *
              </label>
              <select
                name="driverId"
                value={formData.driverId}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Choose driver...</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {availableDrivers.length === 0 && (
                <p className="text-red-600 text-xs mt-1">
                  No available drivers
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo Weight (kg) *
              </label>
              <input
                type="number"
                name="cargoWeight"
                value={formData.cargoWeight}
                onChange={handleInputChange}
                placeholder="450"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Est. Fuel Cost (₹) *
              </label>
              <input
                type="number"
                name="estimatedFuelCost"
                value={formData.estimatedFuelCost}
                onChange={handleInputChange}
                placeholder="2500"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Point *
              </label>
              <input
                type="text"
                name="startPoint"
                value={formData.startPoint}
                onChange={handleInputChange}
                placeholder="Warehouse A"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Point *
              </label>
              <input
                type="text"
                name="endPoint"
                value={formData.endPoint}
                onChange={handleInputChange}
                placeholder="Distribution Center B"
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              className="btn btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Trip'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                resetForm()
              }}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false)
          setSelectedTrip(null)
        }}
        title="Complete Trip"
      >
        <div className="space-y-4">
          {selectedTrip && (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Vehicle:</strong>{' '}
                  {
                    vehicles.find((v) => String(v.id) === String(selectedTrip.vehicleId))
                      ?.model
                  }
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Start Odometer:</strong> {selectedTrip.startOdometer}{' '}
                  km
                </p>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Odometer Reading (km) *
                </label>
                <input
                  type="number"
                  value={endOdometer}
                  onChange={(e) => setEndOdometer(e.target.value)}
                  placeholder="15150"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Consumed (L)
                  </label>
                  <input
                    type="number"
                    value={fuelConsumed}
                    onChange={(e) => setFuelConsumed(e.target.value)}
                    placeholder="45.5"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Fuel Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={actualFuelCost}
                    onChange={(e) => setActualFuelCost(e.target.value)}
                    placeholder="4500"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={submitComplete}
                  className="btn btn-success flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Completing...' : 'Complete Trip'}
                </button>
                <button
                  onClick={() => {
                    setIsCompleteModalOpen(false)
                    setSelectedTrip(null)
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={handleFilterChange}
        filterOptions={[
          { key: 'status', label: 'Status', options: [
            { value: 'planned', label: 'Planned' },
            { value: 'dispatched', label: 'Dispatched' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' }
          ]}
        ]}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        sortOptions={[
          { value: 'id', label: 'Trip ID' },
          { value: 'startPoint', label: 'Start Point' },
          { value: 'endPoint', label: 'End Point' },
          { value: 'cargoWeight', label: 'Cargo Weight' }
        ]}
        onReset={resetFilters}
      />

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Trips
          </h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Model</th>
                <th>Driver</th>
                <th>Cargo (kg)</th>
                <th>Fuel (₹)</th>
                <th>Route</th>
                <th>Status</th>
                <th>Distance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip) => {
                const vehicle = vehicles.find((v) => String(v.id) === String(trip.vehicleId))
                const driver = drivers.find((d) => String(d.id) === String(trip.driverId))
                return (
                  <tr key={trip.id}>
                    <td className="text-gray-600">#{trip.id}</td>
                    <td className="font-medium">
                      {vehicle?.model || 'Unknown'}
                    </td>
                    <td>
                      {driver?.name || 'N/A'}
                    </td>
                    <td>{trip.cargoWeight} kg</td>
                    <td className="text-gray-600">
                      {trip.status === 'completed' ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">₹{trip.actualFuelCost?.toLocaleString() || '0'}</span>
                          <span className="text-[10px] text-gray-400">Est: ₹{trip.estimatedFuelCost?.toLocaleString()}</span>
                        </div>
                      ) : (
                        `₹${trip.estimatedFuelCost?.toLocaleString() || '0'}`
                      )}
                    </td>
                    <td className="text-sm">
                      {trip.startPoint} → {trip.endPoint}
                    </td>
                    <td>
                      <StatusBadge status={trip.status} />
                    </td>
                    <td>
                      {trip.endOdometer && trip.startOdometer
                        ? `${trip.endOdometer - trip.startOdometer} km`
                        : '-'}
                    </td>
                    <td>
                      <div className="flex flex-col space-y-1">
                        {trip.status === 'dispatched' && (
                          <>
                            <button
                              onClick={() => handleCompleteTrip(trip)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium text-left"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleCancelTrip(trip.id)}
                              className="text-red-500 hover:text-red-700 text-xs text-left"
                            >
                              Cancel Trip
                            </button>
                          </>
                        )}
                        {trip.status === 'cancelled' && (
                          <span className="text-gray-400 text-sm">Cancelled</span>
                        )}
                        {trip.status === 'completed' && (
                          <span className="text-gray-500 text-sm">Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredTrips.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">
                    No trips found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TripDispatcher
