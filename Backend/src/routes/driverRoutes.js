import express from 'express'
import * as driverController from '../controllers/driverController.js'
import { authMiddleware, authorize } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

// Managers, dispatchers, and safety officers can view drivers
router.get('/', authorize('manager', 'dispatcher', 'safety', 'analyst'), driverController.getAllDrivers)

// Only managers can create drivers
router.post('/', authorize('manager'), driverController.createDriver)

// Managers, dispatchers, and safety officers can view driver details
router.get('/:id', authorize('manager', 'dispatcher', 'safety', 'analyst'), driverController.getDriverById)

// Managers and safety officers can update driver information
router.put('/:id', authorize('manager', 'safety'), driverController.updateDriver)

// Only managers can delete drivers
router.delete('/:id', authorize('manager'), driverController.deleteDriver)

export default router
