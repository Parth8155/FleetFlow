export class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message)
    this.statusCode = statusCode
    this.code = code || this.constructor.name
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
    this.resource = resource
  }
}

export class ConflictError extends AppError {
  constructor(message, details = null) {
    super(message, 409, 'CONFLICT_ERROR', details)
    this.name = 'ConflictError'
  }
}

/**
 * Business Logic Errors
 */

export class CargoWeightViolationError extends ValidationError {
  constructor(vehicleId, cargoWeight, maxCapacity) {
    super(
      `Cargo weight ${cargoWeight}kg exceeds vehicle capacity ${maxCapacity}kg`,
      {
        vehicleId,
        cargoWeight,
        maxCapacity,
        code: 'CARGO_WEIGHT_VIOLATION',
      }
    )
    this.name = 'CargoWeightViolationError'
  }
}

export class DriverLicenseExpiredError extends ValidationError {
  constructor(driverId, licenseExpiry) {
    super(`Driver license expired on ${licenseExpiry}`, {
      driverId,
      licenseExpiry,
      code: 'DRIVER_LICENSE_EXPIRED',
    })
    this.name = 'DriverLicenseExpiredError'
  }
}

export class InvalidStatusTransitionError extends ValidationError {
  constructor(entityType, currentStatus, newStatus) {
    super(
      `Cannot transition ${entityType} from ${currentStatus} to ${newStatus}`,
      {
        entityType,
        currentStatus,
        newStatus,
        code: 'INVALID_STATUS_TRANSITION',
      }
    )
    this.name = 'InvalidStatusTransitionError'
  }
}

export class DuplicateEntryError extends ConflictError {
  constructor(field, value) {
    super(`${field} '${value}' already exists`, {
      field,
      value,
      code: 'DUPLICATE_ENTRY',
    })
    this.name = 'DuplicateEntryError'
  }
}

export class ReferentialIntegrityError extends ConflictError {
  constructor(message, details = null) {
    super(message, { ...details, code: 'REFERENTIAL_INTEGRITY_ERROR' })
    this.name = 'ReferentialIntegrityError'
  }
}

export class OptimisticLockError extends ConflictError {
  constructor(resource, id) {
    super(
      `Concurrent update detected on ${resource}. Your changes conflict with recent modifications.`,
      {
        resource,
        id,
        code: 'OPTIMISTIC_LOCK_ERROR',
      }
    )
    this.name = 'OptimisticLockError'
  }
}

export class InvalidOperationError extends ValidationError {
  constructor(message, details = null) {
    super(message, { ...details, code: 'INVALID_OPERATION' })
    this.name = 'InvalidOperationError'
  }
}

export class BusinessLogicError extends AppError {
  constructor(message, details = null) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR', details)
    this.name = 'BusinessLogicError'
  }
}

export class DatabaseError extends AppError {
  constructor(message, details = null) {
    super(message, 500, 'DATABASE_ERROR', details)
    this.name = 'DatabaseError'
  }
}

export class ExternalServiceError extends AppError {
  constructor(service, message, details = null) {
    super(`External service error: ${service} - ${message}`, 503, 'EXTERNAL_SERVICE_ERROR', {
      ...details,
      service,
    })
    this.name = 'ExternalServiceError'
  }
}

/**
 * Request validation error helper
 */
export class RequestValidationError extends ValidationError {
  constructor(errors = []) {
    const message = 'Request validation failed'
    const details = errors.map(e => ({
      field: e.param || e.path,
      message: e.msg,
      value: e.value,
      location: e.location,
    }))
    
    super(message, details)
    this.name = 'RequestValidationError'
    this.validationErrors = errors
  }
}

