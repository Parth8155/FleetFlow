import express from 'express'
import * as vehicleController from '../controllers/vehicleController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', vehicleController.getAllVehicles)
router.post('/', vehicleController.createVehicle)
router.get('/:id', vehicleController.getVehicleById)
router.put('/:id', vehicleController.updateVehicle)
router.delete('/:id', vehicleController.deleteVehicle)

export default router
