import { BaseRepository } from './BaseRepository.js'

export class VehicleRepository extends BaseRepository {
  constructor() {
    super('vehicle')
  }

  async findByLicensePlate(licensePlate) {
    return this.findOne({ licensePlate })
  }

  async findByStatus(status, limit = 100, offset = 0) {
    return this.findMany({ status }, limit, offset)
  }

  async findAvailable(limit = 100, offset = 0) {
    return this.findMany({ status: 'available' }, limit, offset)
  }

  async updateStatus(id, status) {
    return this.update(id, { status, updatedAt: new Date() })
  }

  async incrementOdometer(id, distance) {
    return this.prisma.vehicle.update({
      where: { id },
      data: {
        odometer: {
          increment: distance,
        },
      },
    })
  }

  async getVehicleStats() {
    return this.prisma.vehicle.aggregate({
      _count: true,
      _avg: { odometer: true },
    })
  }
}

export default new VehicleRepository()
