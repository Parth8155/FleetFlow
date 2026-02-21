import { useState, useEffect } from 'react'
import { useFleetStore, useAuthStore } from '../store'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import FilterBar from '../components/FilterBar'

function VehicleRegistry() {
  const { vehicles, fetchVehicles, addVehicle, updateVehicle, deleteVehicle, loading, error } = useFleetStore()
  const { user } = useAuthStore()
  const isManager = user?.role === 'manager'
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    model: '',
    licensePlate: '',
    maxCapacity: '',
    type: 'van',
    odometer: '',
  })

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ status: '', type: '' })
  const [sortConfig, setSortConfig] = useState({ key: 'model', direction: 'asc' })

  useEffect(() => {
    fetchVehicles()
  }, [])

  const filteredVehicles = vehicles
    .filter((vehicle) => {
      const matchesSearch =
        (vehicle.model || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle.licensePlate || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = filters.status ? vehicle.status === filters.status : true
      const matchesType = filters.type ? vehicle.type === filters.type : true

      return matchesSearch && matchesStatus && matchesType
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
    setFilters({ status: '', type: '' })
    setSortConfig({ key: 'model', direction: 'asc' })
  }


  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxCapacity' || name === 'odometer' ? parseFloat(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (
      !formData.model ||
      !formData.licensePlate ||
      !formData.maxCapacity
    ) {
      setSubmitError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingId) {
        await updateVehicle(editingId, formData)
      } else {
        await addVehicle(formData)
      }
      resetForm()
      setIsModalOpen(false)
    } catch (err) {
      setSubmitError(err.message || 'Failed to save vehicle')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      model: '',
      licensePlate: '',
      maxCapacity: '',
      type: 'van',
      odometer: '',
    })
    setEditingId(null)
    setSubmitError('')
  }

  const handleEdit = (vehicle) => {
    setFormData(vehicle)
    setEditingId(vehicle.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(id)
      } catch (err) {
        alert(err.message || 'Failed to delete vehicle')
      }
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Registry</h2>
          <p className="text-gray-500 mt-1">Manage your fleet inventory</p>
        </div>
        {isManager && (
          <button
            onClick={() => {
              resetForm()
              setIsModalOpen(true)
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> Add Vehicle
          </button>
        )}
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={handleFilterChange}
        filterOptions={[
          { key: 'status', label: 'Status', options: [
            { value: 'active', label: 'Active' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'active', label: 'Active' }
          ]},
          { key: 'type', label: 'Type', options: [
            { value: 'van', label: 'Van' },
            { value: 'truck', label: 'Truck' }
          ]}
        ]}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        sortOptions={[
          { value: 'model', label: 'Model' },
          { value: 'licensePlate', label: 'License Plate' },
          { value: 'maxCapacity', label: 'Capacity' },
          { value: 'odometer', label: 'Odometer' }
        ]}
        onReset={resetFilters}
      />

      <div className="card overflow-hidden">
        <div className="table-responsive">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="pl-6">Model</th>
                <th>License Plate</th>
                <th>Capacity</th>
                <th>Type</th>
                <th>Odometer</th>
                <th>Status</th>
                {isManager && <th className="text-right pr-6">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="group hover:bg-gray-50/50">
                  <td className="pl-6 py-4 font-medium text-gray-800">{vehicle.model}</td>
                  <td className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">{vehicle.licensePlate}</td>
                  <td>{vehicle.maxCapacity} kg</td>
                  <td>
                    <span className="capitalize px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold">
                      {vehicle.type}
                    </span>
                  </td>
                  <td className="font-mono text-sm text-gray-600">
                    {vehicle.odometer.toLocaleString()} km
                  </td>
                  <td>
                    <StatusBadge status={vehicle.status} />
                  </td>
                  {isManager && (
                    <td className="text-right pr-6 space-x-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredVehicles.length === 0 && !loading && (
                <tr>
                  <td colSpan={isManager ? 6 : 5} className="text-center py-12 text-gray-400">
                    No vehicles found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
      >
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {submitError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Name *
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              placeholder="e.g., Toyota Hiace / Van-05"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Plate *
              </label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                placeholder="ABC-1234"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Capacity (kg) *
              </label>
              <input
                type="number"
                name="maxCapacity"
                value={formData.maxCapacity}
                onChange={handleInputChange}
                placeholder="500"
                className="input-field"
              />
            </div>
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="bike">Bike</option>
              </select>
            </div>
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Odometer (km)
                </label>
                <input
                  type="number"
                  name="odometer"
                  value={formData.odometer}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="input-field"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              className="btn btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Vehicle' : 'Add Vehicle')}
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

    </div>
  )
}

export default VehicleRegistry
