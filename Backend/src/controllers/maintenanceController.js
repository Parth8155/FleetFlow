import { validationResult } from 'express-validator'
import MaintenanceService from '../services/MaintenanceService.js'
import { ValidationError } from '../utils/errors.js'

export const getAllMaintenance = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query
    const records = await MaintenanceService.getAllMaintenanceRecords(parseInt(limit), parseInt(offset))

    res.json({
      success: true,
      data: records,
    })
  } catch (error) {
    next(error)
  }
}

export const getMaintenanceById = async (req, res, next) => {
  try {
    const record = await MaintenanceService.getMaintenanceById(req.params.id)

    res.json({
      success: true,
      data: record,
    })
  } catch (error) {
    next(error)
  }
}

export const createMaintenance = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation failed', errors.array()))
  }

  try {
    const record = await MaintenanceService.createMaintenanceRecord(req.body)

    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      data: record,
    })
  } catch (error) {
    next(error)
  }
}

export const completeMaintenance = async (req, res, next) => {
  try {
    const record = await MaintenanceService.completeMaintenanceRecord(req.params.id)

    res.json({
      success: true,
      message: 'Maintenance completed successfully',
      data: record,
    })
  } catch (error) {
    next(error)
  }
}

export const getVehicleMaintenanceHistory = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query
    const records = await MaintenanceService.getVehicleMaintenanceHistory(req.params.vehicleId, parseInt(limit))

    res.json({
      success: true,
      data: records,
    })
  } catch (error) {
    next(error)
  }
}

export const getMaintenanceCost = async (req, res, next) => {
  try {
    const cost = await MaintenanceService.getMaintenanceCost(req.params.vehicleId)

    res.json({
      success: true,
      data: { totalCost: cost },
    })
  } catch (error) {
    next(error)
  }
}
