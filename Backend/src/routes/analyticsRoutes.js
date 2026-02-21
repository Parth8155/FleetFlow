import express from 'express'
import * as analyticsController from '../controllers/analyticsController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/fleet/metrics', analyticsController.getFleetMetrics)
router.get('/financial/report', analyticsController.getFinancialReport)
router.post('/export', analyticsController.exportReport)

export default router
