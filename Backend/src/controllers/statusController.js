import { validationResult } from 'express-validator'
import StatusService from '../services/StatusService.js'
import { ValidationError } from '../utils/errors.js'

export const updateVehicleStatus = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation failed', errors.array()))
  }

  try {
    const { vehicleId } = req.params
    const { status, reason } = req.body

    const record = await StatusService.updateVehicleStatus(vehicleId, status, reason)

    res.json({
      success: true,
      message: 'Vehicle status updated successfully',
      data: record,
    })
  } catch (error) {
    next(error)
  }
}

export const updateDriverStatus = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation failed', errors.array()))
  }

  try {
    const { driverId } = req.params
    const { status, reason } = req.body

    const record = await StatusService.updateDriverStatus(driverId, status, reason)

    res.json({
      success: true,
      message: 'Driver status updated successfully',
      data: record,
    })
  } catch (error) {
    next(error)
  }
}

export const updateTripStatus = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation failed', errors.array()))
  }

  try {
    const { tripId } = req.params
    const { status, reason } = req.body

    const record = await StatusService.updateTripStatus(tripId, status, reason)

    res.json({
      success: true,
      message: 'Trip status updated successfully',
      data: record,
    })
  } catch (error) {
    next(error)
  }
}

export const getStatusHistory = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params
    const { limit = 100, offset = 0 } = req.query

    const history = await StatusService.getStatusHistory(
      entityType,
      entityId,
      parseInt(limit),
      parseInt(offset)
    )

    res.json({
      success: true,
      data: history,
    })
  } catch (error) {
    next(error)
  }
}

export const getCurrentStatus = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params

    const status = await StatusService.getCurrentStatus(entityType, entityId)

    res.json({
      success: true,
      data: { entityType, entityId, currentStatus: status },
    })
  } catch (error) {
    next(error)
  }
}

export const getRecentStatusChanges = async (req, res, next) => {
  try {
    const { entityType } = req.params
    const { minutes = 60, limit = 100 } = req.query

    const changes = await StatusService.getRecentStatusChanges(
      entityType,
      parseInt(minutes),
      parseInt(limit)
    )

    res.json({
      success: true,
      data: {
        entityType,
        timeWindowMinutes: parseInt(minutes),
        changesCount: changes.length,
        changes,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getStatusChangeStats = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params
    const { startDate, endDate } = req.body

    if (!startDate || !endDate) {
      return next(new ValidationError('startDate and endDate are required'))
    }

    const stats = await StatusService.getStatusChangeStats(
      entityType,
      entityId,
      new Date(startDate),
      new Date(endDate)
    )

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    next(error)
  }
}

export const validateStatusConsistency = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params

    const check = await StatusService.validateStatusConsistency(entityType, entityId)

    res.json({
      success: true,
      data: check,
    })
  } catch (error) {
    next(error)
  }
}

export const correctStatusInconsistency = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params

    const result = await StatusService.correctStatusInconsistency(entityType, entityId)

    res.json({
      success: true,
      message: result.message || 'Status corrected successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const getEntityStatusOverview = async (req, res, next) => {
  try {
    const { entityType } = req.params
    const { minutes = 60 } = req.query

    const changes = await StatusService.getRecentStatusChanges(
      entityType,
      parseInt(minutes)
    )

    // Group by status
    const statusGroups = {}
    changes.forEach(change => {
      if (!statusGroups[change.newStatus]) {
        statusGroups[change.newStatus] = 0
      }
      statusGroups[change.newStatus]++
    })

    res.json({
      success: true,
      data: {
        entityType,
        timeWindowMinutes: parseInt(minutes),
        totalChanges: changes.length,
        statusBreakdown: statusGroups,
        changes: changes.slice(0, 20), // Latest 20
      },
    })
  } catch (error) {
    next(error)
  }
}
