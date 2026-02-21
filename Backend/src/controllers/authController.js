import { validationResult } from 'express-validator'
import AuthService from '../services/AuthService.js'
import { AuthenticationError, ValidationError } from '../utils/errors.js'

export const login = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation failed', errors.array()))
  }

  try {
    const { email, password } = req.body
    const { user, token } = await AuthService.authenticateUser(email, password)

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const register = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation failed', errors.array()))
  }

  try {
    const { email, password, name, role } = req.body
    const { user, token } = await AuthService.registerUser({
      email,
      password,
      name,
      role: role || 'dispatcher',
    })

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
  })
}

export const getProfile = async (req, res, next) => {
  try {
    const user = await AuthService.getUserById(req.user.id)
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body
    const user = await AuthService.updateUserProfile(req.user.id, { name, email })
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}
