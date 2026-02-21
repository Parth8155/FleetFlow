import TripRepository from '../repositories/TripRepository.js'
import VehicleRepository from '../repositories/VehicleRepository.js'
import DriverRepository from '../repositories/DriverRepository.js'
import { NotFoundError, ValidationError } from '../utils/errors.js'

export class TripService {
  async getAllTrips(limit = 100, offset = 0) {
    return TripRepository.getTripsWithRelations(limit, offset)
  }

  async getTripById(id) {
    const trip = await TripRepository.findById(id)
    if (!trip) {
      throw new NotFoundError('Trip')
    }
    return trip
  }

  async createTrip(tripData) {
    if (!tripData.vehicleId || !tripData.driverId || !tripData.cargoWeight) {
      throw new ValidationError('Missing required trip fields')
    }

    // Validate cargo weight
    const vehicle = await VehicleRepository.findById(tripData.vehicleId)
    if (!vehicle) {
      throw new NotFoundError('Vehicle')
    }

    if (tripData.cargoWeight > vehicle.maxCapacity) {
      throw new ValidationError(
        `Cargo weight (${tripData.cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxCapacity}kg)`
      )
    }

    // Validate driver license
    const driver = await DriverRepository.findById(tripData.driverId)
    if (!driver) {
      throw new NotFoundError('Driver')
    }

    if (driver.licenseExpiry < new Date()) {
      throw new ValidationError('Driver license is expired')
    }

    // Create trip and update statuses
    const trip = await TripRepository.create({
      ...tripData,
      status: 'dispatched',
      startOdometer: vehicle.odometer,
    })

    // Update vehicle and driver status
    await VehicleRepository.updateStatus(tripData.vehicleId, 'on-trip')
    await DriverRepository.updateStatus(tripData.driverId, 'on-trip')

    return trip
  }

  async updateTrip(id, tripData) {
    await this.getTripById(id)
    return TripRepository.update(id, tripData)
  }

  async completeTrip(id, endOdometer) {
    const trip = await this.getTripById(id)

    // Complete the trip
    const completed = await TripRepository.completeTrip(id, endOdometer)

    // Update vehicle status and odometer
    await VehicleRepository.updateStatus(trip.vehicleId, 'available')
    
    // Update driver status and trip count
    await DriverRepository.updateStatus(trip.driverId, 'on-duty')
    await DriverRepository.incrementTrips(trip.driverId)

    return completed
  }

  async validateCargoWeight(vehicleId, cargoWeight) {
    const vehicle = await VehicleRepository.findById(vehicleId)
    if (!vehicle) {
      throw new NotFoundError('Vehicle')
    }
    return cargoWeight <= vehicle.maxCapacity
  }

  async getCompletedTrips(limit = 100, offset = 0) {
    return TripRepository.findCompleted(limit, offset)
  }

  async getVehicleTrips(vehicleId, limit = 100, offset = 0) {
    return TripRepository.findByVehicle(vehicleId, limit, offset)
  }

  async getDriverTrips(driverId, limit = 100, offset = 0) {
    return TripRepository.findByDriver(driverId, limit, offset)
  }
}

export default new TripService()

