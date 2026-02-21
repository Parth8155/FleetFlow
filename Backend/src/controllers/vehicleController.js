import { validationResult } from 'express-validator'
import VehicleService from '../services/VehicleService.js'
import { ValidationError } from '../utils/errors.js'

export const getAllVehicles = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query
    const vehicles = await VehicleService.getAllVehicles(parseInt(limit), parseInt(offset))

    res.json({
      success: true,
      data: vehicles,
    })
  } catch (error) {
    next(error)
  }
}

export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await VehicleService.getVehicleById(req.params.id)

    res.json({
      success: true,
      data: vehicle,
    })
  } catch (error) {
    next(error)
  }
}

export const createVehicle = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation failed', errors.array()))
  }

  try {
    const vehicle = await VehicleService.createVehicle(req.body)

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle,
    })
  } catch (error) {
    next(error)
  }
}

export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await VehicleService.updateVehicle(req.params.id, req.body)

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteVehicle = async (req, res, next) => {
  try {
    await VehicleService.deleteVehicle(req.params.id)

    res.json({
      success: true,
      message: 'Vehicle deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const updateVehicleStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const vehicle = await VehicleService.updateVehicleStatus(req.params.id, status)

    res.json({
      success: true,
      message: 'Vehicle status updated successfully',
      data: vehicle,
    })
  } catch (error) {
    next(error)
  }
}

export const getAvailableVehicles = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query
    const vehicles = await VehicleService.getAvailableVehicles(parseInt(limit), parseInt(offset))

    res.json({
      success: true,
      data: vehicles,
    })
  } catch (error) {
    next(error)
  }
}

export const getVehiclesByStatus = async (req, res, next) => {
  try {
    const { status } = req.params
    const { limit = 100, offset = 0 } = req.query
    const vehicles = await VehicleService.getVehiclesByStatus(status, parseInt(limit), parseInt(offset))

    res.json({
      success: true,
      data: vehicles,
    })
  } catch (error) {
    next(error)
  }
}
