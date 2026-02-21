import jwt from 'jsonwebtoken'
import config from '../config/index.js'

export const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  )
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export const decodeToken = (token) => {
  return jwt.decode(token)
}
