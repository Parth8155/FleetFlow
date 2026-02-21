import express from 'express'
import * as statusController from '../controllers/statusController.js'
import { authMiddleware, authorize } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

// All authenticated users can view status information
router.get('/current/:entityType/:entityId', statusController.getCurrentStatus)

// All authenticated users can view status history
router.get('/history/:entityType/:entityId', statusController.getStatusHistory)

// All authenticated users can view recent status changes for an entity type
router.get('/recent/:entityType', statusController.getRecentStatusChanges)

// All authenticated users can view status overview
router.get('/overview/:entityType', statusController.getEntityStatusOverview)

// Managers and dispatchers can update vehicle status
router.post(
  '/vehicle/:vehicleId/update',
  authorize('manager', 'dispatcher'),
  statusController.updateVehicleStatus
)

// Managers can update driver status
router.post(
  '/driver/:driverId/update',
  authorize('manager'),
  statusController.updateDriverStatus
)

// Dispatchers and managers can update trip status
router.post(
  '/trip/:tripId/update',
  authorize('dispatcher', 'manager'),
  statusController.updateTripStatus
)

// Managers and analysts can view status change statistics
router.post(
  '/stats/:entityType/:entityId',
  authorize('manager', 'analyst'),
  statusController.getStatusChangeStats
)

// Managers and safety officers can validate status consistency
router.get(
  '/validate/:entityType/:entityId',
  authorize('manager', 'safety'),
  statusController.validateStatusConsistency
)

// Managers can correct status inconsistencies
router.post(
  '/correct/:entityType/:entityId',
  authorize('manager'),
  statusController.correctStatusInconsistency
)

export default router
