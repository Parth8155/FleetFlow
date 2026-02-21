import { BaseRepository } from './BaseRepository.js'

export class DriverRepository extends BaseRepository {
  constructor() {
    super('driver')
  }

  async findByLicense(licenseNumber) {
    return this.findOne({ licenseNumber })
  }

  async findByStatus(status, limit = 100, offset = 0) {
    return this.findMany({ status }, limit, offset)
  }

  async findAvailable(limit = 100, offset = 0) {
    return this.findMany({ status: 'on-duty' }, limit, offset)
  }

  async updateStatus(id, status) {
    return this.update(id, { status, updatedAt: new Date() })
  }

  async incrementTrips(id) {
    return this.prisma.driver.update({
      where: { id },
      data: {
        tripsCompleted: {
          increment: 1,
        },
        lastTripDate: new Date(),
      },
    })
  }

  async updateSafetyScore(id, score) {
    return this.update(id, { safetyScore: score })
  }

  async findExpiredLicenses() {
    return this.prisma.driver.findMany({
      where: {
        licenseExpiry: {
          lt: new Date(),
        },
      },
    })
  }

  async findExpiringLicenses(daysFromNow = 90) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysFromNow)

    return this.prisma.driver.findMany({
      where: {
        licenseExpiry: {
          gte: new Date(),
          lte: futureDate,
        },
      },
    })
  }
}

export default new DriverRepository()
