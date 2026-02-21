import express from 'express'
import * as expenseController from '../controllers/expenseController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', expenseController.getAllExpenses)
router.post('/', expenseController.createExpense)
router.get('/:id', expenseController.getExpenseById)

export default router
