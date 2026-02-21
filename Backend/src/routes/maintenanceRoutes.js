import express from 'express'
import * as maintenanceController from '../controllers/maintenanceController.js'
import { authMiddleware, authorize } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

// Managers, dispatchers, and safety officers can view maintenance records
router.get('/', authorize('manager', 'dispatcher', 'safety'), maintenanceController.getAllMaintenance)

// Managers and safety officers can create maintenance records
router.post('/', authorize('manager', 'safety'), maintenanceController.createMaintenance)

// Managers and safety officers can complete maintenance
router.post('/:id/complete', authorize('manager', 'safety'), maintenanceController.completeMaintenance)

export default router
