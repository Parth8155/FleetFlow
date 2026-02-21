import AnalyticsService from '../services/AnalyticsService.js'

export const getFleetMetrics = async (req, res, next) => {
  try {
    const metrics = await AnalyticsService.getFleetMetrics()

    res.json({
      success: true,
      data: metrics,
    })
  } catch (error) {
    next(error)
  }
}

export const getFinancialMetrics = async (req, res, next) => {
  try {
    const metrics = await AnalyticsService.getFinancialMetrics()

    res.json({
      success: true,
      data: metrics,
    })
  } catch (error) {
    next(error)
  }
}

export const getFinancialReport = async (req, res, next) => {
  try {
    const report = await AnalyticsService.generateReport('json')

    res.json({
      success: true,
      data: report,
    })
  } catch (error) {
    next(error)
  }
}

export const exportReport = async (req, res, next) => {
  try {
    const { format = 'json' } = req.body
    const report = await AnalyticsService.generateReport(format)

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=report.csv')
      // CSV export logic here
    }

    res.json({
      success: true,
      message: `Report exported as ${format}`,
      data: report,
    })
  } catch (error) {
    next(error)
  }
}

export const getVehicleROI = async (req, res, next) => {
  try {
    const roi = await AnalyticsService.getVehicleROI(req.params.vehicleId)

    if (!roi) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      })
    }

    res.json({
      success: true,
      data: roi,
    })
  } catch (error) {
    next(error)
  }
}

export const getDriverPerformance = async (req, res, next) => {
  try {
    const performance = await AnalyticsService.getDriverPerformance()

    res.json({
      success: true,
      data: performance,
    })
  } catch (error) {
    next(error)
  }
}

export const getMaintenanceAlerts = async (req, res, next) => {
  try {
    const alerts = await AnalyticsService.getMaintenanceAlerts()

    res.json({
      success: true,
      data: alerts,
    })
  } catch (error) {
    next(error)
  }
}
