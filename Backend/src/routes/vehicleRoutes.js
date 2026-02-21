import express from 'express'
import * as vehicleController from '../controllers/vehicleController.js'
import { authMiddleware, authorize } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

// All authenticated users can view vehicles
router.get('/', authorize('manager', 'dispatcher', 'safety', 'analyst'), vehicleController.getAllVehicles)

// Only managers can create vehicles
router.post('/', authorize('manager'), vehicleController.createVehicle)

// All authenticated users can view vehicle details
router.get('/:id', authorize('manager', 'dispatcher', 'safety', 'analyst'), vehicleController.getVehicleById)

// Managers and dispatchers can update vehicles
router.put('/:id', authorize('manager', 'dispatcher'), vehicleController.updateVehicle)

// Only managers can delete vehicles
router.delete('/:id', authorize('manager'), vehicleController.deleteVehicle)

export default router
