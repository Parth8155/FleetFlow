import express from 'express'
import * as maintenanceController from '../controllers/maintenanceController.js'
import { authMiddleware, authorize } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

// Managers, dispatchers, and safety officers can view maintenance records
router.get('/', authorize('manager', 'dispatcher', 'safety'), maintenanceController.getAllMaintenance)

// Managers and safety officers can create maintenance records
router.post('/', authorize('manager', 'safety'), maintenanceController.createMaintenance)

// Managers, dispatchers, and safety officers can get a specific maintenance record
router.get('/:id', authorize('manager', 'dispatcher', 'safety'), maintenanceController.getMaintenanceById)

// Managers and safety officers can complete maintenance
router.post('/:id/complete', authorize('manager', 'safety'), maintenanceController.completeMaintenance)

// Managers, dispatchers, and safety officers can get maintenance history for a vehicle
router.get('/vehicle/:vehicleId/history', authorize('manager', 'dispatcher', 'safety'), maintenanceController.getVehicleMaintenanceHistory)

// Managers, dispatchers, and safety officers can get total maintenance cost for a vehicle
router.get('/vehicle/:vehicleId/cost', authorize('manager', 'dispatcher', 'safety'), maintenanceController.getMaintenanceCost)

export default router
