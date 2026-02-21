import DriverRepository from '../repositories/DriverRepository.js'
import { NotFoundError, ValidationError } from '../utils/errors.js'

export class DriverService {
  async getAllDrivers(limit = 100, offset = 0) {
    return DriverRepository.findAll(limit, offset)
  }

  async getDriverById(id) {
    const driver = await DriverRepository.findById(id)
    if (!driver) {
      throw new NotFoundError('Driver')
    }
    return driver
  }

  async createDriver(driverData) {
    if (!driverData.name || !driverData.licenseNumber || !driverData.licenseExpiry) {
      throw new ValidationError('Missing required driver fields')
    }

    // Check for duplicate license
    const existing = await DriverRepository.findByLicense(driverData.licenseNumber)
    if (existing) {
      throw new ValidationError('License number already registered')
    }

    return DriverRepository.create({
      ...driverData,
      status: 'on-duty',
      safetyScore: 100,
      tripsCompleted: 0,
    })
  }

  async updateDriver(id, driverData) {
    await this.getDriverById(id)
    return DriverRepository.update(id, driverData)
  }

  async deleteDriver(id) {
    await this.getDriverById(id)
    return DriverRepository.delete(id)
  }

  async updateDriverStatus(id, status) {
    await this.getDriverById(id)
    return DriverRepository.updateStatus(id, status)
  }

  async getAvailableDrivers(limit = 100, offset = 0) {
    return DriverRepository.findAvailable(limit, offset)
  }

  async validateLicense(driverId) {
    const driver = await this.getDriverById(driverId)
    const today = new Date()
    
    if (driver.licenseExpiry < today) {
      return { valid: false, message: 'License expired' }
    }
    
    return { valid: true, message: 'License valid' }
  }

  async incrementTripsCompleted(driverId) {
    return DriverRepository.incrementTrips(driverId)
  }

  async updateSafetyScore(driverId, score) {
    if (score < 0 || score > 100) {
      throw new ValidationError('Safety score must be between 0 and 100')
    }
    return DriverRepository.updateSafetyScore(driverId, score)
  }

  async getExpiredLicenses() {
    return DriverRepository.findExpiredLicenses()
  }

  async getExpiringLicenses(daysFromNow = 90) {
    return DriverRepository.findExpiringLicenses(daysFromNow)
  }
}

export default new DriverService()

