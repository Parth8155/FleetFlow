import ExpenseRepository from '../repositories/ExpenseRepository.js'
import VehicleRepository from '../repositories/VehicleRepository.js'
import { NotFoundError, ValidationError } from '../utils/errors.js'

export class ExpenseService {
  async getAllExpenses(limit = 100, offset = 0) {
    return ExpenseRepository.findAll(limit, offset)
  }

  async getExpenseById(id) {
    const expense = await ExpenseRepository.findById(id)
    if (!expense) {
      throw new NotFoundError('Expense')
    }
    return expense
  }

  async createExpense(data) {
    if (!data.vehicleId || !data.type || !data.amount) {
      throw new ValidationError('Missing required expense fields')
    }

    // Verify vehicle exists
    const vehicle = await VehicleRepository.findById(data.vehicleId)
    if (!vehicle) {
      throw new NotFoundError('Vehicle')
    }

    return ExpenseRepository.create(data)
  }

  async calculateFuelEfficiency(vehicleId) {
    const vehicle = await VehicleRepository.findById(vehicleId)
    if (!vehicle) {
      throw new NotFoundError('Vehicle')
    }

    const liters = await ExpenseRepository.getTotalFuelLiters(vehicleId)
    if (liters === 0) return 0

    return (vehicle.odometer / liters).toFixed(2)
  }

  async calculateOperationalCost(vehicleId) {
    return ExpenseRepository.getTotalExpenseCost(vehicleId)
  }

  async getVehicleExpenses(vehicleId, limit = 100, offset = 0) {
    return ExpenseRepository.findByVehicle(vehicleId, limit, offset)
  }

  async getFuelExpenses(vehicleId) {
    return ExpenseRepository.getFuelExpenses(vehicleId)
  }

  async getMaintenanceExpenses(vehicleId) {
    return ExpenseRepository.getMaintenanceExpenses(vehicleId)
  }

  async getExpensesByDateRange(vehicleId, startDate, endDate) {
    return ExpenseRepository.getExpensesByDateRange(vehicleId, new Date(startDate), new Date(endDate))
  }

  async calculateCostPerKilometer(vehicleId) {
    const vehicle = await VehicleRepository.findById(vehicleId)
    if (!vehicle) {
      throw new NotFoundError('Vehicle')
    }

    if (vehicle.odometer === 0) return 0

    const totalCost = await this.calculateOperationalCost(vehicleId)
    return (totalCost / vehicle.odometer).toFixed(4)
  }

  async generateFinancialReport(filters = {}) {
    const { vehicleId, startDate, endDate } = filters

    let expenses = []
    if (vehicleId && startDate && endDate) {
      expenses = await ExpenseRepository.getExpensesByDateRange(vehicleId, startDate, endDate)
    } else if (vehicleId) {
      expenses = await ExpenseRepository.findByVehicle(vehicleId, 1000, 0)
    } else {
      expenses = await ExpenseRepository.findAll(10000, 0)
    }

    const totalCost = expenses.reduce((sum, e) => sum + e.amount, 0)
    const fuelCost = expenses
      .filter(e => e.type === 'fuel')
      .reduce((sum, e) => sum + e.amount, 0)
    const maintenanceCost = expenses
      .filter(e => e.type === 'maintenance')
      .reduce((sum, e) => sum + e.amount, 0)
    const otherCost = expenses
      .filter(e => e.type === 'other')
      .reduce((sum, e) => sum + e.amount, 0)

    return {
      totalCost,
      fuelCost,
      maintenanceCost,
      otherCost,
      expenses,
      summary: {
        fuelPercentage: totalCost > 0 ? ((fuelCost / totalCost) * 100).toFixed(2) : '0',
        maintenancePercentage: totalCost > 0 ? ((maintenanceCost / totalCost) * 100).toFixed(2) : '0',
        otherPercentage: totalCost > 0 ? ((otherCost / totalCost) * 100).toFixed(2) : '0',
        transactionCount: expenses.length,
        dateRange: {
          from: startDate || 'All-time',
          to: endDate || 'Today',
        },
      },
    }
  }

  async getFleetFinancialMetrics() {
    const allExpenses = await ExpenseRepository.findAll(10000, 0)
    
    const totalCost = allExpenses.reduce((sum, e) => sum + e.amount, 0)
    const fuelCost = allExpenses
      .filter(e => e.type === 'fuel')
      .reduce((sum, e) => sum + e.amount, 0)
    const maintenanceCost = allExpenses
      .filter(e => e.type === 'maintenance')
      .reduce((sum, e) => sum + e.amount, 0)

    const vehicles = await VehicleRepository.findAll(1000, 0)
    const costPerVehicle = vehicles.length > 0 ? (totalCost / vehicles.length).toFixed(2) : 0

    return {
      totalFleetCost: totalCost,
      fuelCost,
      maintenanceCost,
      costPerVehicle,
      averageFuelCost: vehicles.length > 0 ? (fuelCost / vehicles.length).toFixed(2) : 0,
      averageMaintenanceCost: vehicles.length > 0 ? (maintenanceCost / vehicles.length).toFixed(2) : 0,
      vehicleCount: vehicles.length,
      transactionCount: allExpenses.length,
    }
  }

  async getExpensesByType(type, limit = 100, offset = 0) {
    return ExpenseRepository.findByType(type, limit, offset)
  }
}

export default new ExpenseService()

