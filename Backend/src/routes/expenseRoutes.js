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

export default router
