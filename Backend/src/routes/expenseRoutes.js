import express from 'express'
import * as expenseController from '../controllers/expenseController.js'
import { authMiddleware, authorize } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

// Managers and analysts can view all expenses
router.get('/', authorize('manager', 'analyst'), expenseController.getAllExpenses)

// Dispatchers and managers can create expenses
router.post('/', authorize('dispatcher', 'manager'), expenseController.createExpense)

// Managers and analysts can view expense details
router.get('/:id', authorize('manager', 'analyst'), expenseController.getExpenseById)

// Managers and analysts can view expenses by vehicle
router.get('/vehicle/:vehicleId/list', authorize('manager', 'analyst'), expenseController.getVehicleExpenses)

// Managers and analysts can get fuel efficiency metrics
router.get('/vehicle/:vehicleId/fuel-efficiency', authorize('manager', 'analyst'), expenseController.calculateFuelEfficiency)

// Managers and analysts can get operational cost
router.get('/vehicle/:vehicleId/operational-cost', authorize('manager', 'analyst'), expenseController.calculateOperationalCost)

// Managers and analysts can get financial metrics
router.get('/vehicle/:vehicleId/metrics', authorize('manager', 'analyst'), expenseController.getFinancialMetrics)

// Managers and analysts can get expenses by type
router.get('/type/:type/list', authorize('manager', 'analyst'), expenseController.getExpensesByType)

// Managers and analysts can generate financial reports
router.post('/report/generate', authorize('manager', 'analyst'), expenseController.generateFinancialReport)

// Managers and analysts can export financial reports as CSV
router.post('/report/export-csv', authorize('manager', 'analyst'), expenseController.exportFinancialReportCSV)

// Managers and analysts can export financial reports as text
router.post('/report/export-txt', authorize('manager', 'analyst'), expenseController.exportFinancialReportTXT)

// Managers and analysts can get fleet-wide financial metrics
router.get('/fleet/metrics', authorize('manager', 'analyst'), expenseController.getFleetFinancialMetrics)

export default router
