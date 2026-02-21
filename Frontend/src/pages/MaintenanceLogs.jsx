import { useState, useEffect } from 'react'
import { useFleetStore } from '../store'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'

function MaintenanceLogs() {
  const {
    vehicles,
    maintenanceLogs,
    fetchVehicles,
    fetchMaintenanceLogs,
    addMaintenanceLog,
    completeMaintenanceLog,
    loading,
    error,
  } = useFleetStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'preventative',
    description: '',
    cost: '',
  })

  useEffect(() => {
    fetchVehicles()
    fetchMaintenanceLogs()
  }, [])

  const vehiclesInShop = vehicles.filter((v) => v.status === 'in-shop')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cost' ? parseFloat(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!formData.vehicleId || !formData.description || !formData.cost) {
      setSubmitError('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      await addMaintenanceLog({
        vehicleId: parseInt(formData.vehicleId),
        type: formData.type,
        description: formData.description,
        cost: parseFloat(formData.cost),
      })
      resetForm()
      setIsModalOpen(false)
    } catch (err) {
      setSubmitError(err.message || 'Failed to log maintenance')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      type: 'preventative',
      description: '',
      cost: '',
    })
    setSubmitError('')
  }

  const handleCompleteMaintenanceLog = async (logId) => {
    try {
      await completeMaintenanceLog(logId)
    } catch (err) {
      alert(err.message || 'Failed to complete maintenance log')
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
        <h2 className="text-2xl font-bold text-gray-900">
          Maintenance & Service Logs
        </h2>
        <button
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}
          className="btn btn-primary"
        >
          + Log Maintenance
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title="Log Maintenance Service"
      >
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {submitError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} - {v.licensePlate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="preventative">Preventative</option>
              <option value="reactive">Reactive</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., Oil change, tire rotation, brake inspection"
              className="input-field h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost (₹) *
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleInputChange}
              placeholder="5000"
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              className="btn btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging...' : 'Log Maintenance'}
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

      {/* Vehicles In Shop */}
      {vehiclesInShop.length > 0 && (
        <div className="card">
          <div className="p-6 border-b border-gray-200 bg-yellow-50">
            <h3 className="text-lg font-semibold text-yellow-900">
              🔧 Vehicles Currently In Shop ({vehiclesInShop.length})
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {vehiclesInShop.map((v) => {
              const vehicleMaintenance = maintenanceLogs.find(
                (log) => log.vehicleId === v.id && log.status !== 'completed'
              )
              return (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{v.name}</p>
                    <p className="text-sm text-gray-600">
                      {v.licensePlate} • {v.model}
                    </p>
                  </div>
                  {vehicleMaintenance && (
                    <button
                      onClick={() =>
                        handleCompleteMaintenanceLog(vehicleMaintenance.id)
                      }
                      className="btn btn-success text-sm"
                    >
                      Mark Available
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Maintenance Logs Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Maintenance History
          </h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Service Type</th>
                <th>Description</th>
                <th>Cost (₹)</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-medium">
                    {vehicles.find((v) => v.id === log.vehicleId)?.name}
                  </td>
                  <td className="capitalize">{log.type}</td>
                  <td className="text-gray-600">{log.description}</td>
                  <td className="text-green-600 font-medium">₹{log.cost}</td>
                  <td className="text-sm">{log.date}</td>
                  <td>
                    <StatusBadge status={log.status} />
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

export default MaintenanceLogs
