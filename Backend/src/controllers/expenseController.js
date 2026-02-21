import { validationResult } from 'express-validator'
import ExpenseService from '../services/ExpenseService.js'
import { ValidationError } from '../utils/errors.js'

export const getAllExpenses = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query
    const expenses = await ExpenseService.getAllExpenses(parseInt(limit), parseInt(offset))

    res.json({
      success: true,
      data: expenses,
    })
  } catch (error) {
    next(error)
  }
}

export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await ExpenseService.getExpenseById(req.params.id)

    res.json({
      success: true,
      data: expense,
    })
  } catch (error) {
    next(error)
  }
}

export const createExpense = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation failed', errors.array()))
  }

  try {
    const expense = await ExpenseService.createExpense(req.body)

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense,
    })
  } catch (error) {
    next(error)
  }
}

export const getVehicleExpenses = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query
    const expenses = await ExpenseService.getVehicleExpenses(req.params.vehicleId, parseInt(limit), parseInt(offset))

    res.json({
      success: true,
      data: expenses,
    })
  } catch (error) {
    next(error)
  }
}

export const calculateFuelEfficiency = async (req, res, next) => {
  try {
    const efficiency = await ExpenseService.calculateFuelEfficiency(req.params.vehicleId)

    res.json({
      success: true,
      data: { fuelEfficiency: efficiency, unit: 'km/liter' },
    })
  } catch (error) {
    next(error)
  }
}

export const calculateOperationalCost = async (req, res, next) => {
  try {
    const cost = await ExpenseService.calculateOperationalCost(req.params.vehicleId)

    res.json({
      success: true,
      data: { totalCost: cost },
    })
  } catch (error) {
    next(error)
  }
}

export const generateFinancialReport = async (req, res, next) => {
  try {
    const report = await ExpenseService.generateFinancialReport(req.body)

    res.json({
      success: true,
      data: report,
    })
  } catch (error) {
    next(error)
  }
}
