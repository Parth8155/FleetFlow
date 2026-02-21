import { BaseRepository } from './BaseRepository.js'

export class ExpenseRepository extends BaseRepository {
  constructor() {
    super('expense')
  }

  async findByVehicle(vehicleId, limit = 100, offset = 0) {
    return this.findMany({ vehicleId }, limit, offset)
  }

  async findByType(type, limit = 100, offset = 0) {
    return this.findMany({ type }, limit, offset)
  }

  async createExpense(data) {
    return this.create(data)
  }

  async getFuelExpenses(vehicleId) {
    return this.findMany({ vehicleId, type: 'fuel' })
  }

  async getMaintenanceExpenses(vehicleId) {
    return this.findMany({ vehicleId, type: 'maintenance' })
  }

  async getTotalExpenseCost(vehicleId) {
    const result = await this.prisma.expense.aggregate({
      where: { vehicleId },
      _sum: { amount: true },
    })
    return result._sum.amount || 0
  }

  async getTotalFuelLiters(vehicleId) {
    const result = await this.prisma.expense.aggregate({
      where: { vehicleId, type: 'fuel' },
      _sum: { units: true },
    })
    return result._sum.units || 0
  }

  async getExpensesByDateRange(vehicleId, startDate, endDate) {
    return this.findMany(
      {
        vehicleId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      1000,
      0
    )
  }
}

export default new ExpenseRepository()
