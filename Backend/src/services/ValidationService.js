import VehicleRepository from '../repositories/VehicleRepository.js'
import DriverRepository from '../repositories/DriverRepository.js'
import TripRepository from '../repositories/TripRepository.js'
import MaintenanceRepository from '../repositories/MaintenanceRepository.js'
import ExpenseRepository from '../repositories/ExpenseRepository.js'
import {
  ValidationError,
  CargoWeightViolationError,
  DriverLicenseExpiredError,
  InvalidStatusTransitionError,
  DuplicateEntryError,
  ReferentialIntegrityError,
  OptimisticLockError,
  InvalidOperationError,
  BusinessLogicError,
} from '../utils/errors.js'

export class ValidationService {
  /**
   * Validate vehicle exists and is alive (not retired)
   */
  static async validateVehicleExists(vehicleId, allowRetired = false) {
    const vehicle = await VehicleRepository.findById(vehicleId)
    
    if (!vehicle) {
      throw new ValidationError('Vehicle not found', { vehicleId })
    }
    
    if (!allowRetired && vehicle.status === 'retired') {
      throw new InvalidOperationError('Cannot perform operation on retired vehicle', {
        vehicleId,
        currentStatus: vehicle.status,
      })
    }
    
    return vehicle
  }

  /**
   * Validate driver exists and has valid license
   */
  static async validateDriverExists(driverId) {
    const driver = await DriverRepository.findById(driverId)
    
    if (!driver) {
      throw new ValidationError('Driver not found', { driverId })
    }
    
    return driver
  }

  /**
   * Validate trip exists
   */
  static async validateTripExists(tripId) {
    const trip = await TripRepository.findById(tripId)
    
    if (!trip) {
      throw new ValidationError('Trip not found', { tripId })
    }
    
    return trip
  }

  /**
   * Validate driver license is not expired
   */
  static validateDriverLicense(driver) {
    const licenseExpiry = new Date(driver.licenseExpiry)
    const today = new Date()
    
    if (licenseExpiry < today) {
      throw new DriverLicenseExpiredError(driver.id, driver.licenseExpiry)
    }
    
    return true
  }

  /**
   * Validate driver will have valid license within a timeframe
   */
  static validateDriverLicenseExpiringSoon(driver, daysThreshold = 7) {
    const licenseExpiry = new Date(driver.licenseExpiry)
    const today = new Date()
    const daysUntilExpiry = (licenseExpiry - today) / (1000 * 60 * 60 * 24)
    
    if (daysUntilExpiry < daysThreshold) {
      throw new BusinessLogicError(
        `Driver license expires in ${Math.ceil(daysUntilExpiry)} days`,
        {
          driverId: driver.id,
          licenseExpiry: driver.licenseExpiry,
          daysUntilExpiry: Math.ceil(daysUntilExpiry),
        }
      )
    }
    
    return true
  }

  /**
   * Validate cargo weight against vehicle capacity
   */
  static validateCargoWeight(vehicle, cargoWeight) {
    if (cargoWeight > vehicle.maxCapacity) {
      throw new CargoWeightViolationError(vehicle.id, cargoWeight, vehicle.maxCapacity)
    }
    
    return true
  }

  /**
   * Validate vehicle status transition
   */
  static validateVehicleStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      available: ['on-trip', 'in-shop', 'retired'],
      'on-trip': ['available', 'in-shop'],
      'in-shop': ['available', 'retired'],
      retired: [],
    }
    
    if (!validTransitions[currentStatus]) {
      throw new ValidationError(`Invalid current vehicle status: ${currentStatus}`)
    }
    
    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new InvalidStatusTransitionError('vehicle', currentStatus, newStatus)
    }
    
    return true
  }

  /**
   * Validate driver status transition
   */
  static validateDriverStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      'on-duty': ['off-duty', 'suspended'],
      'off-duty': ['on-duty', 'suspended'],
      suspended: ['on-duty', 'off-duty'],
    }
    
    if (!validTransitions[currentStatus]) {
      throw new ValidationError(`Invalid current driver status: ${currentStatus}`)
    }
    
    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new InvalidStatusTransitionError('driver', currentStatus, newStatus)
    }
    
    return true
  }

  /**
   * Validate trip status transition
   */
  static validateTripStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      draft: ['dispatched', 'cancelled'],
      dispatched: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    }
    
    if (!validTransitions[currentStatus]) {
      throw new ValidationError(`Invalid current trip status: ${currentStatus}`)
    }
    
    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new InvalidStatusTransitionError('trip', currentStatus, newStatus)
    }
    
    return true
  }

  /**
   * Validate vehicle is available for trip dispatch
   */
  static validateVehicleCanDispatch(vehicle) {
    if (vehicle.status !== 'available') {
      throw new InvalidOperationError('Vehicle is not available for dispatch', {
        vehicleId: vehicle.id,
        currentStatus: vehicle.status,
      })
    }
    
    return true
  }

  /**
   * Validate driver is available for trip dispatch
   */
  static validateDriverCanDispatch(driver) {
    if (driver.status !== 'on-duty') {
      throw new InvalidOperationError('Driver is not on duty', {
        driverId: driver.id,
        currentStatus: driver.status,
      })
    }
    
    return true
  }

  /**
   * Validate referential integrity - trip references
   */
  static async validateTripReferences(trip) {
    // Verify vehicle exists
    const vehicle = await this.validateVehicleExists(trip.vehicleId)
    
    // Verify driver exists
    const driver = await this.validateDriverExists(trip.driverId)
    
    return { vehicle, driver }
  }

  /**
   * Validate referential integrity - maintenance record
   */
  static async validateMaintenanceReferences(record) {
    const vehicle = await this.validateVehicleExists(record.vehicleId)
    return vehicle
  }

  /**
   * Validate referential integrity - expense record
   */
  static async validateExpenseReferences(record) {
    const vehicle = await this.validateVehicleExists(record.vehicleId)
    return vehicle
  }

  /**
   * Validate concurrent update using version field
   * This implements optimistic locking pattern
   */
  static validateConcurrentUpdate(dbVersion, providedVersion, resource, id) {
    if (dbVersion !== providedVersion) {
      throw new OptimisticLockError(resource, id)
    }
    
    return true
  }

  /**
   * Validate cross-entity constraints
   * Ensures consistency across related entities
   */
  static async validateCrossEntityConstraints(entityType, entityData) {
    switch (entityType) {
      case 'trip':
        return await this.validateTripConstraints(entityData)
      case 'vehicle':
        return await this.validateVehicleConstraints(entityData)
      case 'driver':
        return await this.validateDriverConstraints(entityData)
      case 'maintenance':
        return await this.validateMaintenanceConstraints(entityData)
      default:
        throw new ValidationError(`Unknown entity type: ${entityType}`)
    }
  }

  /**
   * Trip-specific cross-entity validation
   */
  static async validateTripConstraints(trip) {
    const vehicle = await this.validateVehicleExists(trip.vehicleId)
    const driver = await this.validateDriverExists(trip.driverId)
    
    // Check cargo weight
    this.validateCargoWeight(vehicle, trip.cargoWeight)
    
    // Check driver license
    this.validateDriverLicense(driver)
    
    // Check status transitions if updating existing trip
    if (trip._currentStatus && trip.status) {
      this.validateTripStatusTransition(trip._currentStatus, trip.status)
    }
    
    return { vehicle, driver }
  }

  /**
   * Vehicle-specific cross-entity validation
   */
  static async validateVehicleConstraints(vehicle) {
    // Cannot retire vehicle with active trips
    if (vehicle.status === 'retired') {
      const activeTrips = await TripRepository.findMany(
        { vehicleId: vehicle.id, status: 'dispatched' },
        100,
        0
      )
      
      if (activeTrips.length > 0) {
        throw new ReferentialIntegrityError(
          'Cannot retire vehicle with active trips',
          {
            vehicleId: vehicle.id,
            activeTripsCount: activeTrips.length,
          }
        )
      }
    }
    
    return true
  }

  /**
   * Driver-specific cross-entity validation
   */
  static async validateDriverConstraints(driver) {
    // Cannot suspend driver with active trips
    if (driver.status === 'suspended') {
      const activeTrips = await TripRepository.findMany(
        { driverId: driver.id, status: 'dispatched' },
        100,
        0
      )
      
      if (activeTrips.length > 0) {
        throw new ReferentialIntegrityError(
          'Cannot suspend driver with active trips',
          {
            driverId: driver.id,
            activeTripsCount: activeTrips.length,
          }
        )
      }
    }
    
    return true
  }

  /**
   * Maintenance-specific cross-entity validation
   */
  static async validateMaintenanceConstraints(maintenance) {
    const vehicle = await this.validateVehicleExists(maintenance.vehicleId)
    
    // Check if vehicle is in correct status for maintenance
    if (maintenance.status === 'in-progress' && vehicle.status !== 'in-shop') {
      throw new BusinessLogicError(
        'Vehicle must be in-shop status for in-progress maintenance',
        {
          vehicleId: vehicle.id,
          vehicleStatus: vehicle.status,
        }
      )
    }
    
    return true
  }

  /**
   * Validate no duplicate entries by checking unique fields
   */
  static async validateNoDuplicate(model, field, value, excludeId = null) {
    const query = { [field]: value }
    
    const existing = await model.findFirst({
      where: query,
    })
    
    if (existing && (!excludeId || existing.id !== excludeId)) {
      throw new DuplicateEntryError(field, value)
    }
    
    return true
  }

  /**
   * Validate data types and format
   */
  static validateDataTypes(data, schema) {
    const errors = []
    
    for (const [field, type] of Object.entries(schema)) {
      const value = data[field]
      
      if (value === undefined || value === null) {
        if (type.required) {
          errors.push(`${field} is required`)
        }
        continue
      }
      
      // Type checking
      const actualType = typeof value
      if (type.type && actualType !== type.type) {
        errors.push(`${field} must be of type ${type.type}, got ${actualType}`)
      }
      
      // Additional validation
      if (type.validator && !type.validator(value)) {
        errors.push(type.errorMessage || `${field} validation failed`)
      }
    }
    
    if (errors.length > 0) {
      throw new ValidationError('Data validation failed', { errors })
    }
    
    return true
  }

  /**
   * Validate numeric ranges
   */
  static validateNumericRange(value, field, min = null, max = null) {
    if (min !== null && value < min) {
      throw new ValidationError(`${field} must be at least ${min}`)
    }
    
    if (max !== null && value > max) {
      throw new ValidationError(`${field} must not exceed ${max}`)
    }
    
    return true
  }

  /**
   * Validate date ranges
   */
  static validateDateRange(startDate, endDate, field = 'Date range') {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start > end) {
      throw new ValidationError(`${field}: start date must be before end date`)
    }
    
    return true
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(limit, offset) {
    const errors = []
    
    if (limit && (limit < 1 || limit > 1000)) {
      errors.push('limit must be between 1 and 1000')
    }
    
    if (offset && offset < 0) {
      errors.push('offset must be non-negative')
    }
    
    if (errors.length > 0) {
      throw new ValidationError('Invalid pagination parameters', { errors })
    }
    
    return true
  }
}

export default ValidationService
