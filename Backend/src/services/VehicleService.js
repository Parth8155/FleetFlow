import VehicleRepository from '../repositories/VehicleRepository.js'
import { NotFoundError, ValidationError } from '../utils/errors.js'

export class VehicleService {
  async getAllVehicles(limit = 100, offset = 0) {
    return VehicleRepository.findAll(limit, offset)
  }

  async getVehicleById(id) {
    const vehicle = await VehicleRepository.findById(id)
    if (!vehicle) {
      throw new NotFoundError('Vehicle')
    }
    return vehicle
  }

  async createVehicle(vehicleData) {
    if (!vehicleData.name || !vehicleData.maxCapacity || !vehicleData.licensePlate) {
      throw new ValidationError('Missing required vehicle fields')
    }

    // Check for duplicate license plate
    const existing = await VehicleRepository.findByLicensePlate(vehicleData.licensePlate)
    if (existing) {
      throw new ValidationError('License plate already exists')
    }

    return VehicleRepository.create({
      ...vehicleData,
      status: 'available',
      odometer: 0,
    })
  }

  async updateVehicle(id, vehicleData) {
    const vehicle = await this.getVehicleById(id)
    return VehicleRepository.update(id, vehicleData)
  }

  async deleteVehicle(id) {
    await this.getVehicleById(id)
    return VehicleRepository.delete(id)
  }

  async updateVehicleStatus(id, status) {
    await this.getVehicleById(id)
    return VehicleRepository.updateStatus(id, status)
  }

  async getAvailableVehicles(limit = 100, offset = 0) {
    return VehicleRepository.findAvailable(limit, offset)
  }

  async getVehiclesByType(type, limit = 100, offset = 0) {
    return VehicleRepository.findMany({ type }, limit, offset)
  }

  async getVehiclesByStatus(status, limit = 100, offset = 0) {
    return VehicleRepository.findByStatus(status, limit, offset)
  }

  async getVehiclesByRegion(region, limit = 100, offset = 0) {
    return VehicleRepository.findMany({ region }, limit, offset)
  }

  async incrementOdometer(vehicleId, distance) {
    return VehicleRepository.incrementOdometer(vehicleId, distance)
  }
}

export default new VehicleService()

