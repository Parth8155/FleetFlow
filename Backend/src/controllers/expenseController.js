import { validationResult } from 'express-validator'
import ExpenseService from '../services/ExpenseService.js'
import { ValidationError } from '../utils/errors.js'
import { generateExpenseCSV, generateFinancialReportText } from '../utils/exportUtils.js'

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

export const exportFinancialReportCSV = async (req, res, next) => {
  try {
    const report = await ExpenseService.generateFinancialReport(req.body)
    const csvContent = generateExpenseCSV(report)

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="financial-report.csv"')
    res.send(csvContent)
  } catch (error) {
    next(error)
  }
}

export const exportFinancialReportTXT = async (req, res, next) => {
  try {
    const report = await ExpenseService.generateFinancialReport(req.body)
    const { vehicleId } = req.body
    const vehicleInfo = vehicleId ? `Vehicle ID: ${vehicleId}` : 'Fleet-wide Report'
    const txtContent = generateFinancialReportText(report, vehicleInfo)

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="financial-report.txt"')
    res.send(txtContent)
  } catch (error) {
    next(error)
  }
}

export const getFinancialMetrics = async (req, res, next) => {
  try {
    const { vehicleId } = req.params
    
    const totalCost = await ExpenseService.calculateOperationalCost(vehicleId)
    const fuelEfficiency = await ExpenseService.calculateFuelEfficiency(vehicleId)
    const fuelExpenses = await ExpenseService.getFuelExpenses(vehicleId)
    const maintenanceExpenses = await ExpenseService.getMaintenanceExpenses(vehicleId)

    const totalFuelCost = fuelExpenses.reduce((sum, e) => sum + e.amount, 0)
    const totalMaintenanceCost = maintenanceExpenses.reduce((sum, e) => sum + e.amount, 0)

    res.json({
      success: true,
      data: {
        totalOperationalCost: totalCost,
        fuelEfficiency: `${fuelEfficiency} km/liter`,
        fuelCost: totalFuelCost,
        maintenanceCost: totalMaintenanceCost,
        costBreakdown: {
          fuel: ((totalFuelCost / totalCost) * 100).toFixed(2) + '%',
          maintenance: ((totalMaintenanceCost / totalCost) * 100).toFixed(2) + '%',
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getExpensesByType = async (req, res, next) => {
  try {
    const { type } = req.params
    const { limit = 100, offset = 0 } = req.query
    const expenses = await ExpenseService.getExpensesByType(type, parseInt(limit), parseInt(offset))

    res.json({
      success: true,
      data: expenses,
    })
  } catch (error) {
    next(error)
  }
}

export const getFleetFinancialMetrics = async (req, res, next) => {
  try {
    const metrics = await ExpenseService.getFleetFinancialMetrics()

    res.json({
      success: true,
      data: metrics,
    })
  } catch (error) {
    next(error)
  }
}
