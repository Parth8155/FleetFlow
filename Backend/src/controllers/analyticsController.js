import AnalyticsService from '../services/AnalyticsService.js'
import { generateExpenseCSV, generateFinancialReportText } from '../utils/exportUtils.js'

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

export const getFleetUtilization = async (req, res, next) => {
  try {
    const { days = 30 } = req.query
    const utilization = await AnalyticsService.getFleetUtilization(parseInt(days))

    res.json({
      success: true,
      data: utilization,
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

export const getMaintenanceAlerts = async (req, res, next) => {
  try {
    const alerts = await AnalyticsService.getMaintenanceAlerts()

    res.json({
      success: true,
      data: {
        totalAlerts: alerts.length,
        highSeverity: alerts.filter(a => a.severity === 'high').length,
        mediumSeverity: alerts.filter(a => a.severity === 'medium').length,
        alerts,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getPendingCargoTracking = async (req, res, next) => {
  try {
    const cargoData = await AnalyticsService.getPendingCargoTracking()

    res.json({
      success: true,
      data: cargoData,
    })
  } catch (error) {
    next(error)
  }
}

export const getDashboardAggregation = async (req, res, next) => {
  try {
    const dashboard = await AnalyticsService.getDashboardAggregation()

    res.json({
      success: true,
      data: dashboard,
    })
  } catch (error) {
    next(error)
  }
}

export const getComprehensiveReport = async (req, res, next) => {
  try {
    const report = await AnalyticsService.generateComprehensiveReport()

    res.json({
      success: true,
      data: report,
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

export const exportReportCSV = async (req, res, next) => {
  try {
    const report = await AnalyticsService.generateComprehensiveReport()
    
    // Create CSV content with fleet metrics
    const csvContent = [
      'Fleet Analytics Report',
      `Generated: ${report.timestamp}`,
      '',
      'FLEET METRICS',
      `Active Fleet,${report.executiveSummary.fleetMetrics.activeFleet}`,
      `Available Fleet,${report.executiveSummary.fleetMetrics.availableFleet}`,
      `Maintenance Alerts,${report.executiveSummary.fleetMetrics.maintenanceAlerts}`,
      `Utilization Rate,${report.executiveSummary.fleetMetrics.utilizationRate}%`,
      `Total Vehicles,${report.executiveSummary.fleetMetrics.totalVehicles}`,
      `Completed Trips,${report.executiveSummary.fleetMetrics.completedTrips}`,
      '',
      'FINANCIAL METRICS',
      `Total Revenue,${report.executiveSummary.financialHighlights.totalRevenue}`,
      `Total Cost,${report.executiveSummary.financialHighlights.totalCost}`,
      `Net Profit,${report.executiveSummary.financialHighlights.netProfit}`,
      `Profit Margin,${report.executiveSummary.financialHighlights.profitMargin}%`,
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.csv"')
    res.send(csvContent)
  } catch (error) {
    next(error)
  }
}

export const exportReportTXT = async (req, res, next) => {
  try {
    const report = await AnalyticsService.generateComprehensiveReport()
    
    const txtContent = [
      '═════════════════════════════════════════════',
      '     FLEETFLOW ANALYTICS & REPORTING SYSTEM',
      '═════════════════════════════════════════════',
      '',
      `Report Generated: ${report.timestamp}`,
      '',
      '─ EXECUTIVE SUMMARY ─',
      '',
      'FLEET STATUS',
      `  Active Fleet: ${report.executiveSummary.fleetMetrics.activeFleet}`,
      `  Available Fleet: ${report.executiveSummary.fleetMetrics.availableFleet}`,
      `  In Maintenance: ${report.executiveSummary.fleetMetrics.maintenanceAlerts}`,
      `  Total Vehicles: ${report.executiveSummary.fleetMetrics.totalVehicles}`,
      `  Utilization Rate: ${report.executiveSummary.fleetMetrics.utilizationRate}%`,
      `  Pending Trips: ${report.executiveSummary.fleetMetrics.pendingCargo}`,
      '',
      'FINANCIAL HIGHLIGHTS',
      `  Total Revenue: ₹${report.executiveSummary.financialHighlights.totalRevenue.toLocaleString()}`,
      `  Total Cost: ₹${report.executiveSummary.financialHighlights.totalCost.toLocaleString()}`,
      `  Net Profit: ₹${report.executiveSummary.financialHighlights.netProfit.toLocaleString()}`,
      `  Profit Margin: ${report.executiveSummary.financialHighlights.profitMargin}%`,
      '',
      '─ OPERATIONAL INSIGHTS ─',
      '',
      `Maintenance Alerts: ${report.operationalInsights.maintenanceAlerts.length}`,
      `Pending Cargo Trips: ${report.operationalInsights.pendingCargo.totalPendingTrips}`,
      `Total Pending Cargo Weight: ${report.operationalInsights.pendingCargo.totalPendingCargoWeight} kg`,
      '',
      '═════════════════════════════════════════════',
    ].join('\n')

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.txt"')
    res.send(txtContent)
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

export const getKPIs = async (req, res, next) => {
  try {
    const kpis = await AnalyticsService.getKPIs()

    res.json({
      success: true,
      data: kpis,
    })
  } catch (error) {
    next(error)
  }
}
