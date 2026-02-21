import { AppError, RequestValidationError } from '../utils/errors.js'

/**
 * Global error handler middleware
 * Centralized error handling for all routes and services
 */
export const errorHandler = (err, req, res, next) => {
  // Log all errors with context
  logError(err, req)

  // Handle known AppError instances
  if (err instanceof AppError) {
    return sendErrorResponse(res, err.statusCode, err.code, err.message, err.details)
  }

  // Handle express-validator errors
  if (err.array && typeof err.array === 'function') {
    const validationErr = new RequestValidationError(err.array())
    return sendErrorResponse(
      res,
      validationErr.statusCode,
      validationErr.code,
      validationErr.message,
      validationErr.details
    )
  }

  // Handle Prisma/database errors
  if (err.code === 'P2002') {
    // Unique constraint violation
    const field = err.meta?.target?.[0] || 'field'
    return sendErrorResponse(res, 409, 'DUPLICATE_ENTRY', `${field} already exists`, {
      field,
      code: 'P2002',
    })
  }

  if (err.code === 'P2025') {
    // Record not found in relation
    return sendErrorResponse(res, 404, 'NOT_FOUND_ERROR', 'Record not found', {
      code: 'P2025',
    })
  }

  if (err.code === 'P2003') {
    // Foreign key constraint failed
    return sendErrorResponse(res, 409, 'REFERENTIAL_INTEGRITY_ERROR', 'Related record not found', {
      code: 'P2003',
    })
  }

  if (err.code && err.code.startsWith('P')) {
    // Generic Prisma error
    return sendErrorResponse(res, 500, 'DATABASE_ERROR', 'Database operation failed', {
      code: err.code,
      meta: process.env.NODE_ENV === 'development' ? err.meta : undefined,
    })
  }

  // Handle syntax errors or JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    return sendErrorResponse(res, 400, 'INVALID_JSON', 'Invalid JSON in request body', {
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    })
  }

  // Handle timeout errors
  if (err.code === 'ETIMEDOUT' || err.message === 'Request timeout') {
    return sendErrorResponse(res, 504, 'TIMEOUT_ERROR', 'Request took too long to process', null)
  }

  // Handle multer/file upload errors
  if (err.name === 'MulterError') {
    return sendErrorResponse(res, 400, 'FILE_UPLOAD_ERROR', err.message, {
      code: err.code,
    })
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendErrorResponse(res, 401, 'INVALID_TOKEN', 'Invalid or malformed token', null)
  }

  if (err.name === 'TokenExpiredError') {
    return sendErrorResponse(res, 401, 'TOKEN_EXPIRED', 'Token has expired', {
      expiredAt: err.expiredAt,
    })
  }

  // Generic server error - don't expose details to client
  console.error('Unhandled error:', err)
  return sendErrorResponse(
    res,
    500,
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred',
    process.env.NODE_ENV === 'development'
      ? {
          message: err.message,
          stack: err.stack,
        }
      : null
  )
}

/**
 * Helper function to send standardized error response
 */
function sendErrorResponse(res, statusCode, code, message, details = null) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Log error with request context
 */
function logError(err, req) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      name: err.name,
      message: err.message,
      code: err.code,
      statusCode: err.statusCode || 500,
    },
    request: {
      method: req.method,
      path: req.path,
      ip: req.ip,
      user: req.user?.id || 'anonymous',
    },
  }

  // Add details for debugging in development
  if (process.env.NODE_ENV === 'development') {
    errorLog.stack = err.stack
    errorLog.fullRequest = {
      body: req.body,
      query: req.query,
      params: req.params,
    }
  }

  console.error('ERROR_LOG:', JSON.stringify(errorLog, null, 2))
}

export default errorHandler

