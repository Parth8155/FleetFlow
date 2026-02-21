import { useState } from 'react'
import { useFleetStore } from '../store'
import Modal from '../components/Modal'

function ExpensesAndFuel() {
  const { vehicles, expenses, addExpense } = useFleetStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [expenseType, setExpenseType] = useState('fuel')
  const [formData, setFormData] = useState({
    vehicleId: '',
    amount: '',
    unit: '',
    description: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' || name === 'unit' ? parseFloat(value) : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.vehicleId || !formData.amount) {
      alert('Please fill in required fields')
      return
    }

    addExpense({
      ...formData,
      vehicleId: parseInt(formData.vehicleId),
      type: expenseType,
      unitType: expenseType === 'fuel' ? 'liters' : null,
      date: new Date().toISOString().split('T')[0],
    })

    resetForm()
    setIsModalOpen(false)
  }

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      amount: '',
      unit: '',
      description: '',
    })
  }

  // Calculate metrics
  const totalFuelCost = expenses
    .filter((e) => e.type === 'fuel')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalFuelLiters = expenses
    .filter((e) => e.type === 'fuel')
    .reduce((sum, e) => sum + (e.unit || 0), 0)

  const avgFuelEfficiency =
    totalFuelLiters > 0
      ? (
        vehicles.reduce(
          (sum, v) => sum + (v.odometer || 0),
          0
        ) / totalFuelLiters
      ).toFixed(2)
      : 0

  const totalMaintenanceCost = expenses
    .filter((e) => e.type === 'maintenance')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalOperationalCost = totalFuelCost + totalMaintenanceCost

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Expenses & Fuel Logging
        </h2>
        <button
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}
          className="btn btn-primary"
        >
          + Log Expense
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <p className="text-gray-600 text-sm">Total Fuel Cost</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            ₹{totalFuelCost}
          </p>
          <p className="text-xs text-gray-500 mt-1">{totalFuelLiters}L total</p>
        </div>

        <div className="card p-6">
          <p className="text-gray-600 text-sm">Maintenance Cost</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            ₹{totalMaintenanceCost}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {expenses.filter((e) => e.type === 'maintenance').length} services
          </p>
        </div>

        <div className="card p-6">
          <p className="text-gray-600 text-sm">Fuel Efficiency</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {avgFuelEfficiency} km/L
          </p>
        </div>

        <div className="card p-6">
          <p className="text-gray-600 text-sm">Total Operational Cost</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            ₹{totalOperationalCost}
          </p>
          <p className="text-xs text-gray-500 mt-1">Fuel + Maintenance</p>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title="Log Expense"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="fuel"
                checked={expenseType === 'fuel'}
                onChange={(e) => setExpenseType(e.target.value)}
              />
              <span className="text-sm font-medium">Fuel</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="maintenance"
                checked={expenseType === 'maintenance'}
                onChange={(e) => setExpenseType(e.target.value)}
              />
              <span className="text-sm font-medium">Maintenance</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle *
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

          {expenseType === 'fuel' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liters Refueled *
              </label>
              <input
                type="number"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                placeholder="45"
                step="0.01"
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost (₹) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="2500"
              className="input-field"
            />
          </div>

          {expenseType === 'maintenance' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Details of maintenance..."
                className="input-field h-20"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              Log Expense
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

      {/* Expenses Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Log */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-900">⛽ Fuel Log</h3>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Liters</th>
                  <th>Cost</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses
                  .filter((e) => e.type === 'fuel')
                  .map((exp) => (
                    <tr key={exp.id}>
                      <td className="font-medium">
                        {
                          vehicles.find((v) => v.id === exp.vehicleId)
                            ?.name
                        }
                      </td>
                      <td>{exp.unit}L</td>
                      <td className="text-green-600 font-medium">₹{exp.amount}</td>
                      <td className="text-sm">{exp.date}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance Log */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-orange-50">
            <h3 className="text-lg font-semibold text-orange-900">
              🔧 Maintenance Log
            </h3>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Details</th>
                  <th>Cost</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses
                  .filter((e) => e.type === 'maintenance')
                  .map((exp) => (
                    <tr key={exp.id}>
                      <td className="font-medium">
                        {
                          vehicles.find((v) => v.id === exp.vehicleId)
                            ?.name
                        }
                      </td>
                      <td className="text-sm">{exp.description}</td>
                      <td className="text-orange-600 font-medium">
                        ₹{exp.amount}
                      </td>
                      <td className="text-sm">{exp.date}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpensesAndFuel
