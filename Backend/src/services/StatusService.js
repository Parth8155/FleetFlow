import StatusHistoryRepository from '../repositories/StatusHistoryRepository.js'
import VehicleRepository from '../repositories/VehicleRepository.js'
import DriverRepository from '../repositories/DriverRepository.js'
import TripRepository from '../repositories/TripRepository.js'
import { NotFoundError, ValidationError } from '../utils/errors.js'

// In-memory event listeners for status changes
const statusChangeListeners = []

export class StatusService {
  /**
   * Register a callback for status change events
   */
  static onStatusChange(callback) {
    statusChangeListeners.push(callback)
  }

  /**
   * Internal method to emit status change events
   */
  static _emitStatusChange(event) {
    statusChangeListeners.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in status change listener:', error)
      }
    })
  }

  /**
   * Update vehicle status with history tracking
   */
  async updateVehicleStatus(vehicleId, newStatus, reason = null) {
    const vehicle = await VehicleRepository.findById(vehicleId)
    if (!vehicle) {
      throw new NotFoundError('Vehicle')
    }

    // Verify status transition is valid
    this._validateVehicleStatusTransition(vehicle.status, newStatus)

    const previousStatus = vehicle.status

    // Update vehicle status
    await VehicleRepository.updateStatus(vehicleId, newStatus)

    // Record in status history
    const record = await StatusHistoryRepository.recordStatusChange(
      'vehicle',
      vehicleId,
      previousStatus,
      newStatus,
      reason
    )

    // Emit event for real-time propagation
    this._emitStatusChange({
      type: 'vehicle',
      entityId: vehicleId,
      previousStatus,
      newStatus,
      reason,
      timestamp: new Date(),
    })

    return record
  }

  /**
   * Update driver status with history tracking
   */
  async updateDriverStatus(driverId, newStatus, reason = null) {
    const driver = await DriverRepository.findById(driverId)
    if (!driver) {
      throw new NotFoundError('Driver')
    }

    // Verify status transition is valid
    this._validateDriverStatusTransition(driver.status, newStatus)

    const previousStatus = driver.status

    // Update driver status directly
    await DriverRepository.update(driverId, { status: newStatus, updatedAt: new Date() })

    // Record in status history
    const record = await StatusHistoryRepository.recordStatusChange(
      'driver',
      driverId,
      previousStatus,
      newStatus,
      reason
    )

    // Emit event
    this._emitStatusChange({
      type: 'driver',
      entityId: driverId,
      previousStatus,
      newStatus,
      reason,
      timestamp: new Date(),
    })

    return record
  }

  /**
   * Update trip status with history tracking
   */
  async updateTripStatus(tripId, newStatus, reason = null) {
    const trip = await TripRepository.findById(tripId)
    if (!trip) {
      throw new NotFoundError('Trip')
    }

    // Verify status transition is valid
    this._validateTripStatusTransition(trip.status, newStatus)

    const previousStatus = trip.status

    // Update trip status
    await TripRepository.updateStatus(tripId, newStatus)

    // Record in status history
    const record = await StatusHistoryRepository.recordStatusChange(
      'trip',
      tripId,
      previousStatus,
      newStatus,
      reason
    )

    // Emit event
    this._emitStatusChange({
      type: 'trip',
      entityId: tripId,
      previousStatus,
      newStatus,
      reason,
      timestamp: new Date(),
    })

    return record
  }

  /**
   * Validate vehicle status transition rules
   */
  _validateVehicleStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      available: ['on-trip', 'in-shop', 'retired'],
      'on-trip': ['available', 'in-shop'],
      'in-shop': ['available', 'retired'],
      retired: [], // terminal state
    }

    if (!validTransitions[currentStatus]) {
      throw new ValidationError(`Invalid current vehicle status: ${currentStatus}`)
    }

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new ValidationError(
        `Cannot transition vehicle from ${currentStatus} to ${newStatus}`
      )
    }
  }

  /**
   * Validate driver status transition rules
   */
  _validateDriverStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      'on-duty': ['off-duty', 'suspended'],
      'off-duty': ['on-duty', 'suspended'],
      suspended: ['on-duty', 'off-duty'], // can restart from suspension
    }

    if (!validTransitions[currentStatus]) {
      throw new ValidationError(`Invalid current driver status: ${currentStatus}`)
    }

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new ValidationError(
        `Cannot transition driver from ${currentStatus} to ${newStatus}`
      )
    }
  }

  /**
   * Validate trip status transition rules
   */
  _validateTripStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      draft: ['dispatched', 'cancelled'],
      dispatched: ['completed', 'cancelled'],
      completed: [], // terminal state
      cancelled: [], // terminal state
    }

    if (!validTransitions[currentStatus]) {
      throw new ValidationError(`Invalid current trip status: ${currentStatus}`)
    }

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new ValidationError(
        `Cannot transition trip from ${currentStatus} to ${newStatus}`
      )
    }
  }

  /**
   * Get entity status history
   */
  async getStatusHistory(entityType, entityId, limit = 100, offset = 0) {
    // Verify entity exists
    if (entityType === 'vehicle') {
      const vehicle = await VehicleRepository.findById(entityId)
      if (!vehicle) throw new NotFoundError('Vehicle')
    } else if (entityType === 'driver') {
      const driver = await DriverRepository.findById(entityId)
      if (!driver) throw new NotFoundError('Driver')
    } else if (entityType === 'trip') {
      const trip = await TripRepository.findById(entityId)
      if (!trip) throw new NotFoundError('Trip')
    } else {
      throw new ValidationError('Invalid entity type')
    }

    return StatusHistoryRepository.getEntityHistory(entityType, entityId, limit, offset)
  }

  /**
   * Get current status for any entity
   */
  async getCurrentStatus(entityType, entityId) {
    if (entityType === 'vehicle') {
      const vehicle = await VehicleRepository.findById(entityId)
      return vehicle ? vehicle.status : null
    } else if (entityType === 'driver') {
      const driver = await DriverRepository.findById(entityId)
      return driver ? driver.status : null
    } else if (entityType === 'trip') {
      const trip = await TripRepository.findById(entityId)
      return trip ? trip.status : null
    }
    return null
  }

  /**
   * Get recent status changes across all entities of a type
   */
  async getRecentStatusChanges(entityType, minutes = 60, limit = 100) {
    return StatusHistoryRepository.getRecentStatusChanges(entityType, minutes, limit)
  }

  /**
   * Get status change statistics
   */
  async getStatusChangeStats(entityType, entityId, startDate, endDate) {
    const changes = await StatusHistoryRepository.getStatusChangesByDateRange(
      entityType,
      entityId,
      startDate,
      endDate
    )

    if (changes.length === 0) {
      return {
        totalChanges: 0,
        uniqueStatuses: [],
        averageDuration: 0,
        statusBreakdown: {},
      }
    }

    const uniqueStatuses = [...new Set(changes.map(c => c.newStatus))]
    const statusBreakdown = {}

    for (let i = 0; i < changes.length - 1; i++) {
      const status = changes[i].newStatus
      const duration = changes[i].createdAt - changes[i + 1].createdAt
      
      if (!statusBreakdown[status]) {
        statusBreakdown[status] = { count: 0, totalDuration: 0 }
      }
      statusBreakdown[status].count++
      statusBreakdown[status].totalDuration += duration
    }

    // Calculate average duration per status
    const averageDuration = {}
    for (const [status, data] of Object.entries(statusBreakdown)) {
      averageDuration[status] = (data.totalDuration / data.count / 1000 / 60).toFixed(2)
    }

    return {
      totalChanges: changes.length,
      uniqueStatuses,
      statusBreakdown,
      averageDuration,
      dateRange: { from: startDate, to: endDate },
    }
  }

  /**
   * Validate and correct status inconsistencies
   */
  async validateStatusConsistency(entityType, entityId) {
    const latestHistory = await StatusHistoryRepository.getLatestStatus(entityType, entityId)
    let currentDbStatus = null

    if (entityType === 'vehicle') {
      const vehicle = await VehicleRepository.findById(entityId)
      currentDbStatus = vehicle ? vehicle.status : null
    } else if (entityType === 'driver') {
      const driver = await DriverRepository.findById(entityId)
      currentDbStatus = driver ? driver.status : null
    } else if (entityType === 'trip') {
      const trip = await TripRepository.findById(entityId)
      currentDbStatus = trip ? trip.status : null
    }

    const isConsistent = latestHistory === currentDbStatus

    return {
      isConsistent,
      expectedStatus: latestHistory,
      actualStatus: currentDbStatus,
      needsCorrection: !isConsistent,
    }
  }

  /**
   * Correct status inconsistencies by syncing to latest history
   */
  async correctStatusInconsistency(entityType, entityId) {
    const check = await this.validateStatusConsistency(entityType, entityId)

    if (!check.needsCorrection) {
      return { corrected: false, message: 'Status is already consistent' }
    }

    const correctStatus = check.expectedStatus
    
    if (entityType === 'vehicle') {
      await VehicleRepository.updateStatus(entityId, correctStatus)
    } else if (entityType === 'driver') {
      await DriverRepository.update(entityId, { 
        status: correctStatus, 
        updatedAt: new Date() 
      })
    } else if (entityType === 'trip') {
      await TripRepository.updateStatus(entityId, correctStatus)
    }

    return {
      corrected: true,
      previousStatus: check.actualStatus,
      correctedStatus: correctStatus,
    }
  }
}

export default new StatusService()
