import { useState, useEffect } from 'react'
import { useFleetStore } from '../store'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'

function VehicleRegistry() {
  const { vehicles, fetchVehicles, addVehicle, updateVehicle, deleteVehicle, loading, error } = useFleetStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    licensePlate: '',
    maxCapacity: '',
    type: 'van',
    region: 'North',
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxCapacity' ? parseFloat(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (
      !formData.name ||
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
      name: '',
      model: '',
      licensePlate: '',
      maxCapacity: '',
      type: 'van',
      region: 'North',
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
    <div className="p-6 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Vehicle Registry</h2>
        <button
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}
          className="btn btn-primary"
        >
          + Add Vehicle
        </button>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Van-05"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="e.g., Toyota Hiace"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Plate
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
                Max Capacity (kg)
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
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

      <div className="card overflow-hidden">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle Name</th>
                <th>Model</th>
                <th>License Plate</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Odometer</th>
                <th>Status</th>
                <th>Region</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="font-medium">{vehicle.name}</td>
                  <td>{vehicle.model}</td>
                  <td className="text-gray-600">{vehicle.licensePlate}</td>
                  <td className="capitalize">{vehicle.type}</td>
                  <td>{vehicle.maxCapacity} kg</td>
                  <td>{vehicle.odometer} km</td>
                  <td>
                    <StatusBadge status={vehicle.status} />
                  </td>
                  <td>{vehicle.region}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default VehicleRegistry
