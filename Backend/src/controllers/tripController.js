import { validationResult } from 'express-validator'
import TripService from '../services/TripService.js'
import { ValidationError } from '../utils/errors.js'

export const getAllTrips = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query
    const trips = await TripService.getAllTrips(parseInt(limit), parseInt(offset))

    res.json({
      success: true,
      data: trips,
    })
  } catch (error) {
    next(error)
  }
}

export const getTripById = async (req, res, next) => {
  try {
    const trip = await TripService.getTripById(req.params.id)

    res.json({
      success: true,
      data: trip,
    })
  } catch (error) {
    next(error)
  }
}

export const createTrip = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation failed', errors.array()))
  }

  try {
    const trip = await TripService.createTrip(req.body)

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: trip,
    })
  } catch (error) {
    next(error)
  }
}

export const updateTrip = async (req, res, next) => {
  try {
    const trip = await TripService.updateTrip(req.params.id, req.body)

    res.json({
      success: true,
      message: 'Trip updated successfully',
      data: trip,
    })
  } catch (error) {
    next(error)
  }
}

export const completeTrip = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation failed', errors.array()))
  }

  try {
    const { endOdometer, fuelConsumed, actualFuelCost } = req.body
    const trip = await TripService.completeTrip(
      req.params.id, 
      parseFloat(endOdometer), 
      fuelConsumed ? parseFloat(fuelConsumed) : null,
      actualFuelCost ? parseFloat(actualFuelCost) : null
    )

    res.json({
      success: true,
      message: 'Trip completed successfully',
      data: trip,
    })
  } catch (error) {
    next(error)
  }
}

export const cancelTrip = async (req, res, next) => {
  try {
    const trip = await TripService.cancelTrip(req.params.id)
    res.json({
      success: true,
      message: 'Trip cancelled successfully',
      data: trip,
    })
  } catch (error) {
    next(error)
  }
}
