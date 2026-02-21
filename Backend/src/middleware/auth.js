import { AuthenticationError, AuthorizationError } from '../utils/errors.js'
import { verifyToken } from '../utils/jwt.js'

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      throw new AuthenticationError('No token provided')
    }

    const decoded = verifyToken(token)
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    }

    next()
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return res.status(401).json({ error: error.message })
    }
    res.status(401).json({ error: 'Invalid token' })
  }
}

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}
