import ValidationService from '../services/ValidationService.js'
import { ValidationError } from '../utils/errors.js'

/**
 * Middleware for request data validation
 * Validates request body, query, and params against schemas
 */
export const validateRequestData = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate body
      if (schema.body && req.body) {
        ValidationService.validateDataTypes(req.body, schema.body)
      }
      
      // Validate query
      if (schema.query && req.query) {
        ValidationService.validateDataTypes(req.query, schema.query)
      }
      
      // Validate params
      if (schema.params && req.params) {
        ValidationService.validateDataTypes(req.params, schema.params)
      }
      
      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Middleware for pagination validation
 */
export const validatePagination = (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query
    
    ValidationService.validatePagination(
      limit ? parseInt(limit) : undefined,
      offset ? parseInt(offset) : undefined
    )
    
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Middleware for trip creation validation
 * Comprehensive cross-entity validation
 */
export const validateTripCreation = async (req, res, next) => {
  try {
    const { vehicleId, driverId, cargoWeight, status } = req.body
    
    // Validate required fields
    if (!vehicleId || !driverId || cargoWeight === undefined) {
      throw new ValidationError('Missing required fields: vehicleId, driverId, cargoWeight')
    }
    
    // Validate against cross-entity constraints
    await ValidationService.validateTripConstraints({
      vehicleId,
      driverId,
      cargoWeight,
      status: status || 'draft',
    })
    
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Middleware for vehicle status update validation
 */
export const validateVehicleStatusUpdate = async (req, res, next) => {
  try {
    const { vehicleId } = req.params
    const { status } = req.body
    
    if (!status) {
      throw new ValidationError('Status is required')
    }
    
    // Get current vehicle
    const vehicle = await ValidationService.validateVehicleExists(vehicleId, true)
    
    // Validate status transition
    ValidationService.validateVehicleStatusTransition(vehicle.status, status)
    
    // Validate cross-entity constraints
    await ValidationService.validateVehicleConstraints({ ...vehicle, status })
    
    // Attach vehicle to request for use in controller
    req.vehicle = vehicle
    
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Middleware for trip status update validation
 */
export const validateTripStatusUpdate = async (req, res, next) => {
  try {
    const { tripId } = req.params
    const { status } = req.body
    
    if (!status) {
      throw new ValidationError('Status is required')
    }
    
    // Get current trip
    const trip = await ValidationService.validateTripExists(tripId)
    
    // Validate status transition
    ValidationService.validateTripStatusTransition(trip.status, status)
    
    // Attach trip to request for use in controller
    req.trip = trip
    
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Middleware for driver license validation
 */
export const validateDriverLicense = async (req, res, next) => {
  try {
    const { driverId } = req.params || req.body
    
    if (!driverId) {
      throw new ValidationError('Driver ID is required')
    }
    
    const driver = await ValidationService.validateDriverExists(driverId)
    
    // Validate license is not expired
    ValidationService.validateDriverLicense(driver)
    
    // Warn if expiring soon
    try {
      ValidationService.validateDriverLicenseExpiringSoon(driver, 30)
    } catch (e) {
      // Log warning but don't fail
      console.warn('Driver license expiring soon:', driverId, e.message)
    }
    
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Middleware for maintenance record validation
 */
export const validateMaintenanceRecord = async (req, res, next) => {
  try {
    const { vehicleId, description, cost, status } = req.body
    
    // Validate required fields
    if (!vehicleId || !description || cost === undefined) {
      throw new ValidationError('Missing required fields: vehicleId, description, cost')
    }
    
    // Validate numeric range for cost
    ValidationService.validateNumericRange(cost, 'cost', 0, 999999)
    
    // Validate against cross-entity constraints
    if (status) {
      await ValidationService.validateMaintenanceConstraints({
        vehicleId,
        status,
      })
    }
    
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Middleware for expense record validation
 */
export const validateExpenseRecord = async (req, res, next) => {
  try {
    const { vehicleId, type, amount, units } = req.body
    
    // Validate required fields
    if (!vehicleId || !type || amount === undefined) {
      throw new ValidationError('Missing required fields: vehicleId, type, amount')
    }
    
    // Validate numeric ranges
    ValidationService.validateNumericRange(amount, 'amount', 0, 999999)
    if (units !== undefined) {
      ValidationService.validateNumericRange(units, 'units', 0, 99999)
    }
    
    // Validate expense type
    const validTypes = ['fuel', 'maintenance', 'other']
    if (!validTypes.includes(type)) {
      throw new ValidationError(`Invalid expense type. Must be one of: ${validTypes.join(', ')}`)
    }
    
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Helper to attach validated entity to request
 */
export const attachEntity = (entityType) => {
  return async (req, res, next) => {
    try {
      const id = req.params[`${entityType}Id`]
      
      if (!id) {
        throw new ValidationError(`${entityType}Id is required`)
      }
      
      // Load entity based on type
      let entity
      switch (entityType) {
        case 'vehicle':
          entity = await ValidationService.validateVehicleExists(id, true)
          break
        case 'driver':
          entity = await ValidationService.validateDriverExists(id)
          break
        default:
          throw new ValidationError(`Unknown entity type: ${entityType}`)
      }
      
      req[entityType] = entity
      next()
    } catch (error) {
      next(error)
    }
  }
}

export default {
  validateRequestData,
  validatePagination,
  validateTripCreation,
  validateVehicleStatusUpdate,
  validateTripStatusUpdate,
  validateDriverLicense,
  validateMaintenanceRecord,
  validateExpenseRecord,
  attachEntity,
}
