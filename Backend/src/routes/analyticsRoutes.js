import express from 'express'
import * as analyticsController from '../controllers/analyticsController.js'
import { authMiddleware, authorize } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

// Only managers and analysts can access analytics endpoints

// Fleet metrics and utilization
router.get('/fleet/metrics', authorize('manager', 'analyst'), analyticsController.getFleetMetrics)
router.get('/fleet/utilization', authorize('manager', 'analyst'), analyticsController.getFleetUtilization)

// Financial metrics
router.get('/financial/metrics', authorize('manager', 'analyst'), analyticsController.getFinancialMetrics)
router.get('/financial/report', authorize('manager', 'analyst'), analyticsController.getFinancialReport)

// Maintenance and operational alerts
router.get('/maintenance/alerts', authorize('manager', 'analyst'), analyticsController.getMaintenanceAlerts)
router.get('/cargo/pending', authorize('manager', 'analyst'), analyticsController.getPendingCargoTracking)

// Dashboard and comprehensive reporting
router.get('/dashboard', authorize('manager', 'analyst'), analyticsController.getDashboardAggregation)
router.get('/comprehensive-report', authorize('manager', 'analyst'), analyticsController.getComprehensiveReport)

// KPI endpoints
router.get('/kpis', authorize('manager', 'analyst'), analyticsController.getKPIs)

// Vehicle and driver performance
router.get('/vehicle/:vehicleId/roi', authorize('manager', 'analyst'), analyticsController.getVehicleROI)
router.get('/driver/performance', authorize('manager', 'analyst'), analyticsController.getDriverPerformance)

// Report export functionality
router.post('/export/csv', authorize('manager', 'analyst'), analyticsController.exportReportCSV)
router.post('/export/txt', authorize('manager', 'analyst'), analyticsController.exportReportTXT)

export default router
