import { AppError } from '../utils/errors.js'

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      type: err.name,
    })
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
}

export default errorHandler
