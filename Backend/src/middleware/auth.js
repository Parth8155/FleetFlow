import { AuthenticationError, AuthorizationError } from '../utils/errors.js'
import { verifyToken } from '../utils/jwt.js'

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      throw new AuthenticationError('Missing authorization header')
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthenticationError('Invalid authorization header format. Use: Bearer <token>')
    }

    const token = parts[1]
    const decoded = verifyToken(token)
    
    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      role: decoded.role,
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('User not authenticated'))
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError(`This action requires one of these roles: ${allowedRoles.join(', ')}`))
    }

    next()
  }
}
