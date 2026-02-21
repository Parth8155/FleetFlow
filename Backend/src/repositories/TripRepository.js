import { BaseRepository } from './BaseRepository.js'

export class TripRepository extends BaseRepository {
  constructor() {
    super('trip')
  }

  async findByVehicle(vehicleId, limit = 100, offset = 0) {
    return this.findMany({ vehicleId }, limit, offset)
  }

  async findByDriver(driverId, limit = 100, offset = 0) {
    return this.findMany({ driverId }, limit, offset)
  }

  async findByStatus(status, limit = 100, offset = 0) {
    return this.findMany({ status }, limit, offset)
  }

  async findCompleted(limit = 100, offset = 0) {
    return this.findMany({ status: 'completed' }, limit, offset)
  }

  async createTrip(data) {
    return this.create(data)
  }

  async updateStatus(id, status) {
    return this.update(id, { status, updatedAt: new Date() })
  }

  async completeTrip(id, endOdometer) {
    return this.update(id, {
      status: 'completed',
      endOdometer,
      endTime: new Date(),
      updatedAt: new Date(),
    })
  }

  async getTripsWithRelations(limit = 100, offset = 0) {
    return this.prisma.trip.findMany({
      include: {
        vehicle: true,
        driver: true,
      },
      take: limit,
      skip: offset,
    })
  }

  async getDraft() {
    return this.findMany({ status: 'draft' })
  }
}

export default new TripRepository()
