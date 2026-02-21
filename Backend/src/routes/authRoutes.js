import express from 'express'
import * as authController from '../controllers/authController.js'
import { authMiddleware, authorize } from '../middleware/auth.js'
import {
  validateLogin,
  validateRegister,
  validateUpdateProfile,
} from '../validators/authValidator.js'

const router = express.Router()

// Public routes
router.post('/login', validateLogin, authController.login)
router.post('/register', validateRegister, authController.register)
router.post('/logout', authController.logout)

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile)
router.put('/profile', authMiddleware, validateUpdateProfile, authController.updateProfile)

export default router
