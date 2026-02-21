import MaintenanceRepository from '../repositories/MaintenanceRepository.js'
import VehicleRepository from '../repositories/VehicleRepository.js'
import { NotFoundError, ValidationError } from '../utils/errors.js'

export class MaintenanceService {
  async getAllMaintenanceRecords(limit = 100, offset = 0) {
    return MaintenanceRepository.findAll(limit, offset)
  }

  async getMaintenanceById(id) {
    const record = await MaintenanceRepository.findById(id)
    if (!record) {
      throw new NotFoundError('Maintenance record')
    }
    return record
  }

  async createMaintenanceRecord(data) {
    if (!data.vehicleId || !data.description || !data.cost) {
      throw new ValidationError('Missing required maintenance fields')
    }

    // Verify vehicle exists
    const vehicle = await VehicleRepository.findById(data.vehicleId)
    if (!vehicle) {
      throw new NotFoundError('Vehicle')
    }

    // Create maintenance record
    const record = await MaintenanceRepository.create({
      ...data,
      status: 'in-progress',
    })

    // Update vehicle status to "in-shop"
    await VehicleRepository.updateStatus(data.vehicleId, 'in-shop')

    return record
  }

  async completeMaintenanceRecord(id) {
    const record = await this.getMaintenanceById(id)

    // Update maintenance record status
    const updated = await MaintenanceRepository.updateStatus(id, 'completed')

    // Update vehicle back to available
    await VehicleRepository.updateStatus(record.vehicleId, 'available')
    await VehicleRepository.update(record.vehicleId, {
      lastMaintenance: new Date(),
    })

    return updated
  }

  async getVehicleMaintenanceHistory(vehicleId, limit = 50) {
    return MaintenanceRepository.getMaintenanceHistory(vehicleId, limit)
  }

  async getMaintenanceCost(vehicleId) {
    return MaintenanceRepository.getTotalMaintenanceCost(vehicleId)
  }

  async getScheduledMaintenance(limit = 100, offset = 0) {
    return MaintenanceRepository.findScheduled(limit, offset)
  }
}

export default new MaintenanceService()

