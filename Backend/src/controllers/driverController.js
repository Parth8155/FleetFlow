import { validationResult } from 'express-validator'
import DriverService from '../services/DriverService.js'
import { ValidationError } from '../utils/errors.js'

export const getAllDrivers = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query
    const drivers = await DriverService.getAllDrivers(parseInt(limit), parseInt(offset))

    res.json({
      success: true,
      data: drivers,
    })
  } catch (error) {
    next(error)
  }
}

export const getDriverById = async (req, res, next) => {
  try {
    const driver = await DriverService.getDriverById(req.params.id)

    res.json({
      success: true,
      data: driver,
    })
  } catch (error) {
    next(error)
  }
}

export const createDriver = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation failed', errors.array()))
  }

  try {
    const driver = await DriverService.createDriver(req.body)

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driver,
    })
  } catch (error) {
    next(error)
  }
}

export const updateDriver = async (req, res, next) => {
  try {
    const driver = await DriverService.updateDriver(req.params.id, req.body)

    res.json({
      success: true,
      message: 'Driver updated successfully',
      data: driver,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteDriver = async (req, res, next) => {
  try {
    await DriverService.deleteDriver(req.params.id)

    res.json({
      success: true,
      message: 'Driver deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const updateDriverStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const driver = await DriverService.updateDriverStatus(req.params.id, status)

    res.json({
      success: true,
      message: 'Driver status updated successfully',
      data: driver,
    })
  } catch (error) {
    next(error)
  }
}

export const getAvailableDrivers = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query
    const drivers = await DriverService.getAvailableDrivers(parseInt(limit), parseInt(offset))

    res.json({
      success: true,
      data: drivers,
    })
  } catch (error) {
    next(error)
  }
}

export const validateLicense = async (req, res, next) => {
  try {
    const validation = await DriverService.validateLicense(req.params.id)

    res.json({
      success: true,
      data: validation,
    })
  } catch (error) {
    next(error)
  }
}

export const getExpiringLicenses = async (req, res, next) => {
  try {
    const { daysFromNow = 90 } = req.query
    const drivers = await DriverService.getExpiringLicenses(parseInt(daysFromNow))

    res.json({
      success: true,
      data: drivers,
    })
  } catch (error) {
    next(error)
  }
}
