import express from 'express'
import * as maintenanceController from '../controllers/maintenanceController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', maintenanceController.getAllMaintenance)
router.post('/', maintenanceController.createMaintenance)
router.post('/:id/complete', maintenanceController.completeMaintenance)

export default router
