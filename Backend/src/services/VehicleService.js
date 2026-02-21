import VehicleRepository from '../repositories/VehicleRepository.js'
import DriverRepository from '../repositories/DriverRepository.js'
import TripRepository from '../repositories/TripRepository.js'
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
    if (!vehicleData.model || !vehicleData.maxCapacity || !vehicleData.licensePlate) {
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
      odometer: vehicleData.odometer || 0,
    })
  }

  async updateVehicle(id, vehicleData) {
    const vehicle = await this.getVehicleById(id)
    return VehicleRepository.update(id, vehicleData)
  }

  async deleteVehicle(id) {
    const vehicle = await this.getVehicleById(id)

    // Find if vehicle is on a trip
    const activeTrip = await TripRepository.findOne({
      vehicleId: id,
      status: 'dispatched'
    })

    if (activeTrip) {
      // If there's an active trip, free up the driver as well
      await DriverRepository.updateStatus(activeTrip.driverId, 'on-duty')
      // Cancel the trip since vehicle is being deleted
      await TripRepository.updateStatus(activeTrip.id, 'cancelled')
    }

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

  async incrementOdometer(vehicleId, distance) {
    return VehicleRepository.incrementOdometer(vehicleId, distance)
  }
}

export default new VehicleService()

