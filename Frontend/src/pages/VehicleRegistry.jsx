import { useState } from 'react'
import { useFleetStore } from '../store'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'

function VehicleRegistry() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useFleetStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    licensePlate: '',
    maxCapacity: '',
    type: 'van',
    region: 'North',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxCapacity' ? parseFloat(value) : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (
      !formData.name ||
      !formData.model ||
      !formData.licensePlate ||
      !formData.maxCapacity
    ) {
      alert('Please fill in all required fields')
      return
    }

    if (editingId) {
      updateVehicle(editingId, {
        ...formData,
        odometer: vehicles.find((v) => v.id === editingId).odometer,
      })
    } else {
      addVehicle({
        ...formData,
        status: 'available',
        odometer: 0,
        lastMaintenance: new Date().toISOString().split('T')[0],
      })
    }

    resetForm()
    setIsModalOpen(false)
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
  }

  const handleEdit = (vehicle) => {
    setFormData(vehicle)
    setEditingId(vehicle.id)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteVehicle(id)
    }
  }

  return (
    <div className="p-6 space-y-6">
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
            <button type="submit" className="btn btn-primary flex-1">
              {editingId ? 'Update Vehicle' : 'Add Vehicle'}
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
