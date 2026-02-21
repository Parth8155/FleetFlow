import express from 'express'
import * as tripController from '../controllers/tripController.js'
import { authMiddleware, authorize } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

// Dispatchers and managers can view all trips
router.get('/', authorize('dispatcher', 'manager', 'safety', 'analyst'), tripController.getAllTrips)

// Dispatchers and managers can create new trips
router.post('/', authorize('dispatcher', 'manager'), tripController.createTrip)

// Dispatchers and managers can view trip details
router.get('/:id', authorize('dispatcher', 'manager', 'safety', 'analyst'), tripController.getTripById)

// Dispatchers and managers can update trips
router.put('/:id', authorize('dispatcher', 'manager'), tripController.updateTrip)

// Dispatchers and managers can complete trips
router.post('/:id/complete', authorize('dispatcher', 'manager'), tripController.completeTrip)

// Dispatchers and managers can cancel trips
router.post('/:id/cancel', authorize('dispatcher', 'manager'), tripController.cancelTrip)

export default router
