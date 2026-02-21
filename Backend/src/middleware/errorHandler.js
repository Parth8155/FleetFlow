import { AppError } from '../utils/errors.js'

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    timestamp: new Date().toISOString(),
  })

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.name,
        message: err.message,
        details: err.details || null,
      },
    })
  }

  // Handle validation errors
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.array().map(e => ({
          field: e.param,
          message: e.msg,
          value: e.value,
        })),
      },
    })
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : null,
    },
  })
}

export default errorHandler
