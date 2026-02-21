import express from 'express'
import * as analyticsController from '../controllers/analyticsController.js'
import { authMiddleware, authorize } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

// Only managers and analysts can access fleet metrics
router.get('/fleet/metrics', authorize('manager', 'analyst'), analyticsController.getFleetMetrics)

// Only managers and analysts can access financial reports
router.get('/financial/report', authorize('manager', 'analyst'), analyticsController.getFinancialReport)

// Only managers and analysts can export reports
router.post('/export', authorize('manager', 'analyst'), analyticsController.exportReport)

export default router
