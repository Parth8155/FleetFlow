import { useState, useEffect } from 'react'
import { useFleetStore, useAuthStore } from '../store'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import FilterBar from '../components/FilterBar'

function DriverProfiles() {
  const { drivers, fetchDrivers, addDriver, updateDriver, loading, error } = useFleetStore()
  const { user } = useAuthStore()
  const canEdit = ['manager', 'safety'].includes(user?.role)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    licenseExpiry: '',
    licenseCategory: 'B',
    safetyScore: 100,
  })

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ status: '', licenseCategory: '' })
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })

  useEffect(() => {
    fetchDrivers()
  }, [])

  const filteredDrivers = drivers
    .filter((driver) => {
      const matchesSearch =
        (driver.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (driver.licenseNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = filters.status ? driver.status === filters.status : true
      const matchesCategory = filters.licenseCategory ? driver.licenseCategory === filters.licenseCategory : true

      return matchesSearch && matchesStatus && matchesCategory
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
    setFilters({ status: '', licenseCategory: '' })
    setSortConfig({ key: 'name', direction: 'asc' })
  }


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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (
      !formData.name ||
      !formData.licenseNumber ||
      !formData.licenseExpiry ||
      !formData.licenseCategory
    ) {
      setSubmitError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      // Prepare payload
      const payload = {
        name: formData.name,
        licenseNumber: formData.licenseNumber,
        licenseExpiry: new Date(formData.licenseExpiry).toISOString(),
        licenseCategory: formData.licenseCategory,
        // Only include safetyScore if provided (it handles 0 correctly)
        safetyScore: formData.safetyScore !== '' ? Number(formData.safetyScore) : undefined
      }

      if (editingId) {
        await updateDriver(editingId, payload)
      } else {
        await addDriver(payload)
      }
      resetForm()
      setIsModalOpen(false)
    } catch (err) {
      setSubmitError(err.message || 'Failed to save driver')
    } finally {
      setIsSubmitting(false)
    }
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
    setSubmitError('')
  }

  const handleEdit = (driver) => {
    // Format date for input field (YYYY-MM-DD)
    const formattedDriver = {
      ...driver,
      licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : ''
    }
    setFormData(formattedDriver)
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
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Driver Profiles</h2>
        {canEdit && (
          <button
            onClick={() => {
              resetForm()
              setIsModalOpen(true)
            }}
            className="btn btn-primary"
          >
            + Add Driver
          </button>
        )}
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
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {submitError}
          </div>
        )}
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
            <button 
              type="submit" 
              className="btn btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Driver' : 'Add Driver')}
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

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={handleFilterChange}
        filterOptions={[
          { key: 'status', label: 'Status', options: [
            { value: 'on-duty', label: 'Available (On-Duty)' },
            { value: 'off-duty', label: 'Off Duty' },
            { value: 'on-trip', label: 'On Trip' }
          ]},
          { key: 'licenseCategory', label: 'Category', options: [
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
            { value: 'D', label: 'D' },
            { value: 'CE', label: 'CE' }
          ]}
        ]}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        sortOptions={[
          { value: 'name', label: 'Name' },
          { value: 'safetyScore', label: 'Safety Score' },
          { value: 'licenseExpiry', label: 'License Expiry' }
        ]}
        onReset={resetFilters}
      />

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
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver) => {
                const expired = isLicenseExpired(driver.licenseExpiry)
                const rowClass = expired ? 'bg-red-50' : ''

                return (
                  <tr key={driver.id} className={rowClass}>
                    <td className="font-medium">{driver.name}</td>
                    <td className="text-gray-600">{driver.licenseNumber}</td>
                    <td className="text-sm">{driver.licenseCategory}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{new Date(driver.licenseExpiry).toLocaleDateString()}</span>
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
                    <td className="text-gray-600">{driver.tripsCompleted || 0}</td>
                    <td>
                      <StatusBadge status={driver.status} />
                    </td>
                    {canEdit && (
                      <td>
                        <button
                          onClick={() => handleEdit(driver)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
              {filteredDrivers.length === 0 && !loading && (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="text-center py-12 text-gray-400">
                    No drivers found matching your criteria.
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

export default DriverProfiles
