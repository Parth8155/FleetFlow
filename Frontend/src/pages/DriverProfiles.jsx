import { useState } from 'react'
import { useFleetStore } from '../store'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'

function DriverProfiles() {
  const { drivers, addDriver, updateDriver } = useFleetStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    licenseExpiry: '',
    licenseCategory: 'B',
    safetyScore: 100,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'safetyScore' ? parseFloat(value) : value,
    }))
  }

  const isLicenseExpiring = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.floor(
      (expiry - today) / (1000 * 60 * 60 * 24)
    )
    return daysUntilExpiry < 90 && daysUntilExpiry >= 0
  }

  const isLicenseExpired = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    return expiry <= today
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (
      !formData.name ||
      !formData.licenseNumber ||
      !formData.licenseExpiry ||
      !formData.licenseCategory
    ) {
      alert('Please fill in all required fields')
      return
    }

    if (editingId) {
      updateDriver(editingId, formData)
    } else {
      addDriver({
        ...formData,
        status: 'on-duty',
        tripsCompleted: 0,
      })
    }

    resetForm()
    setIsModalOpen(false)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      licenseNumber: '',
      licenseExpiry: '',
      licenseCategory: 'B',
      safetyScore: 100,
    })
    setEditingId(null)
  }

  const handleEdit = (driver) => {
    setFormData(driver)
    setEditingId(driver.id)
    setIsModalOpen(true)
  }

  const expiredLicenses = drivers.filter((d) =>
    isLicenseExpired(d.licenseExpiry)
  )
  const expiringLicenses = drivers.filter(
    (d) =>
      isLicenseExpiring(d.licenseExpiry) &&
      !isLicenseExpired(d.licenseExpiry)
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Driver Profiles</h2>
        <button
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}
          className="btn btn-primary"
        >
          + Add Driver
        </button>
      </div>

      {/* License Alerts */}
      {(expiredLicenses.length > 0 || expiringLicenses.length > 0) && (
        <div className="space-y-3">
          {expiredLicenses.length > 0 && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="font-semibold">
                ⚠️ {expiredLicenses.length} Driver(s) with Expired License
              </p>
              <p className="text-sm mt-1">
                {expiredLicenses.map((d) => d.name).join(', ')}
              </p>
              <p className="text-sm mt-2">
                These drivers cannot be assigned to trips.
              </p>
            </div>
          )}

          {expiringLicenses.length > 0 && (
            <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
              <p className="font-semibold">
                ⚠️ {expiringLicenses.length} Driver(s) with License Expiring Soon
              </p>
              <p className="text-sm mt-1">
                {expiringLicenses.map((d) => d.name).join(', ')}
              </p>
              <p className="text-sm mt-2">
                Renewal recommended within 90 days.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingId ? 'Edit Driver' : 'Add New Driver'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Number *
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                placeholder="DL-001"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Category *
              </label>
              <select
                name="licenseCategory"
                value={formData.licenseCategory}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="A">A</option>
                <option value="A1">A1</option>
                <option value="B">B</option>
                <option value="B+E">B+E</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Expiry Date *
            </label>
            <input
              type="date"
              name="licenseExpiry"
              value={formData.licenseExpiry}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Safety Score (0-100)
            </label>
            <input
              type="number"
              name="safetyScore"
              value={formData.safetyScore}
              onChange={handleInputChange}
              min="0"
              max="100"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Based on trip history and compliance
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              {editingId ? 'Update Driver' : 'Add Driver'}
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

      {/* Drivers Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Drivers
          </h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>License</th>
                <th>Category</th>
                <th>Expiry Date</th>
                <th>Safety Score</th>
                <th>Trips Completed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => {
                const expired = isLicenseExpired(driver.licenseExpiry)
                const rowClass = expired ? 'bg-red-50' : ''

                return (
                  <tr key={driver.id} className={rowClass}>
                    <td className="font-medium">{driver.name}</td>
                    <td className="text-gray-600">{driver.licenseNumber}</td>
                    <td className="text-sm">{driver.licenseCategory}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{driver.licenseExpiry}</span>
                        {expired && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            EXPIRED
                          </span>
                        )}
                        {isLicenseExpiring(driver.licenseExpiry) &&
                          !expired && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              EXPIRING
                            </span>
                          )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${driver.safetyScore}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {driver.safetyScore}%
                        </span>
                      </div>
                    </td>
                    <td className="text-gray-600">{driver.tripsCompleted}</td>
                    <td>
                      <StatusBadge status={driver.status} />
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(driver)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DriverProfiles
