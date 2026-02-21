import express from 'express'
import * as tripController from '../controllers/tripController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', tripController.getAllTrips)
router.post('/', tripController.createTrip)
router.get('/:id', tripController.getTripById)
router.put('/:id', tripController.updateTrip)
router.post('/:id/complete', tripController.completeTrip)

export default router
