import { BaseRepository } from './BaseRepository.js'

export class MaintenanceRepository extends BaseRepository {
  constructor() {
    super('maintenanceRecord')
  }

  async findByVehicle(vehicleId, limit = 100, offset = 0) {
    return this.findMany({ vehicleId }, limit, offset)
  }

  async findByStatus(status, limit = 100, offset = 0) {
    return this.findMany({ status }, limit, offset)
  }

  async findScheduled(limit = 100, offset = 0) {
    return this.findMany({ status: 'scheduled' }, limit, offset)
  }

  async createMaintenance(data) {
    return this.create(data)
  }

  async updateStatus(id, status) {
    const updateData = { status, updatedAt: new Date() }
    if (status === 'completed') {
      updateData.completedDate = new Date()
    }
    return this.update(id, updateData)
  }

  async getMaintenanceHistory(vehicleId, limit = 50) {
    return this.findMany({ vehicleId }, limit, 0)
  }

  async getTotalMaintenanceCost(vehicleId) {
    const result = await this.prisma.maintenanceRecord.aggregate({
      where: { vehicleId },
      _sum: { cost: true },
    })
    return result._sum.cost || 0
  }
}

export default new MaintenanceRepository()
