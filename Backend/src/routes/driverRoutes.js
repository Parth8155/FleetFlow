import express from 'express'
import * as driverController from '../controllers/driverController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', driverController.getAllDrivers)
router.post('/', driverController.createDriver)
router.get('/:id', driverController.getDriverById)
router.put('/:id', driverController.updateDriver)
router.delete('/:id', driverController.deleteDriver)

export default router
