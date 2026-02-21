import prisma from '../config/prisma.js'
import VehicleRepository from '../repositories/VehicleRepository.js'
import MaintenanceRepository from '../repositories/MaintenanceRepository.js'
import TripRepository from '../repositories/TripRepository.js'
import ExpenseRepository from '../repositories/ExpenseRepository.js'
import DriverRepository from '../repositories/DriverRepository.js'

export class AnalyticsService {
  async getFleetMetrics() {
    const vehicles = await VehicleRepository.findAll(10000, 0)
    const trips = await TripRepository.findAll(10000, 0)
    const maintenance = await MaintenanceRepository.findAll(10000, 0)

    const activeFleet = vehicles.filter(v => v.status === 'on-trip').length
    const availableFleet = vehicles.filter(v => v.status === 'available').length
    const maintenanceAlerts = vehicles.filter(v => v.status === 'in-shop').length
    const retiredFleet = vehicles.filter(v => v.status === 'retired').length
    
    const utilizationRate = vehicles.length > 0
      ? ((activeFleet / vehicles.length) * 100).toFixed(2)
      : 0
    
    const pendingCargo = trips.filter(t => t.status === 'draft' || t.status === 'dispatched').length
    const completedTrips = trips.filter(t => t.status === 'completed').length

    return {
      activeFleet,
      availableFleet,
      maintenanceAlerts,
      retiredFleet,
      utilizationRate: parseFloat(utilizationRate),
      pendingCargo,
      totalVehicles: vehicles.length,
      totalTrips: trips.length,
      completedTrips,
      scheduledMaintenance: maintenance.filter(m => m.status === 'scheduled').length,
      inProgressMaintenance: maintenance.filter(m => m.status === 'in-progress').length,
      completedMaintenance: maintenance.filter(m => m.status === 'completed').length,
    }
  }

  async getFleetUtilization(days = 30) {
    const vehicles = await VehicleRepository.findAll(10000, 0)
    const trips = await TripRepository.findAll(10000, 0)
    
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const recentTrips = trips.filter(t => new Date(t.createdAt) >= sinceDate)
    
    const utilizationByVehicle = {}
    vehicles.forEach(v => {
      const vehicleTrips = recentTrips.filter(t => t.vehicleId === v.id)
      utilizationByVehicle[v.model] = {
        vehicleId: v.id,
        totalTrips: vehicleTrips.length,
        completedTrips: vehicleTrips.filter(t => t.status === 'completed').length,
        utilizationRate: vehicleTrips.length > 0 
          ? ((vehicleTrips.filter(t => t.status === 'completed').length / vehicleTrips.length) * 100).toFixed(2)
          : 0,
      }
    })

    return {
      period: `Last ${days} days`,
      totalTrips: recentTrips.length,
      completedTrips: recentTrips.filter(t => t.status === 'completed').length,
      utilizationByVehicle,
    }
  }

  async getFinancialMetrics() {
    const trips = await TripRepository.findCompleted(10000, 0)
    const vehicles = await VehicleRepository.findAll(10000, 0)

    let totalRevenue = 0
    let totalDistance = 0
    
    for (const trip of trips) {
      const distance = trip.endOdometer - trip.startOdometer
      totalDistance += distance
      totalRevenue += distance * 10 // ₹10 per km
    }

    let totalFuelCost = 0
    let totalMaintenanceCost = 0

    for (const vehicle of vehicles) {
      const fuelCost = await ExpenseRepository.getTotalExpenseCost(vehicle.id)
      totalFuelCost += fuelCost
      
      const maintenanceCost = await MaintenanceRepository.getTotalMaintenanceCost(vehicle.id)
      totalMaintenanceCost += maintenanceCost
    }

    const totalCost = totalFuelCost + totalMaintenanceCost
    const fuelEfficiency = totalDistance > 0 ? (totalDistance / totalFuelCost * 10).toFixed(2) : 0
    const costPerKm = totalDistance > 0 ? (totalCost / totalDistance).toFixed(2) : 0

    return {
      totalRevenue,
      totalCost,
      totalFuelCost,
      totalMaintenanceCost,
      netProfit: totalRevenue - totalCost,
      profitMargin: totalRevenue > 0 ? (((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(2) : 0,
      fuelEfficiency,
      costPerKm: parseFloat(costPerKm),
      totalDistance,
    }
  }

  async getVehicleROI(vehicleId) {
    const vehicle = await VehicleRepository.findById(vehicleId)
    if (!vehicle) return null

    const trips = await TripRepository.findByVehicle(vehicleId, 10000, 0)
    const expenses = await ExpenseRepository.findByVehicle(vehicleId, 10000, 0)
    const maintenance = await MaintenanceRepository.findByVehicle(vehicleId, 10000, 0)

    let revenue = 0
    let totalDistance = 0
    for (const trip of trips) {
      if (trip.endOdometer) {
        const distance = trip.endOdometer - trip.startOdometer
        totalDistance += distance
        revenue += distance * 10
      }
    }

    const expenseCost = expenses.reduce((sum, e) => sum + e.amount, 0)
    const maintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0)
    const totalCost = expenseCost + maintenanceCost

    const roi = vehicle.acquisitionCost > 0
      ? (((revenue - totalCost) / vehicle.acquisitionCost) * 100).toFixed(2)
      : 0

    return {
      vehicleId,
      vehicleName: vehicle.model,
      acquisitionCost: vehicle.acquisitionCost,
      status: vehicle.status,
      revenue,
      totalCost,
      profit: revenue - totalCost,
      roi: parseFloat(roi),
      totalDistance,
      tripsCompleted: trips.filter(t => t.status === 'completed').length,
      averageRevenuePerTrip: trips.length > 0 ? (revenue / trips.length).toFixed(2) : 0,
    }
  }

  async getMaintenanceAlerts() {
    const vehicles = await VehicleRepository.findAll(10000, 0)
    const maintenanceRecords = await MaintenanceRepository.findAll(10000, 0)
    
    const alerts = []
    
    for (const vehicle of vehicles) {
      const vehicleMaintenances = maintenanceRecords.filter(m => m.vehicleId === vehicle.id)
      const scheduledMaintenance = vehicleMaintenances.filter(m => m.status === 'scheduled')
      
      // Check for overdue maintenance
      const now = new Date()
      scheduledMaintenance.forEach(m => {
        const scheduledDate = new Date(m.scheduledDate)
        if (scheduledDate < now && m.status === 'scheduled') {
          alerts.push({
            type: 'overdue',
            severity: 'high',
            vehicleId: vehicle.id,
            vehicleName: vehicle.model,
            maintenanceId: m.id,
            description: m.description,
            scheduledDate: m.scheduledDate,
            daysOverdue: Math.floor((now - scheduledDate) / (1000 * 60 * 60 * 24)),
          })
        }
      })

      // Check if vehicle hasn't had maintenance recently
      if (vehicle.lastMaintenance) {
        const lastMaintenance = new Date(vehicle.lastMaintenance)
        const daysSinceLastMaintenance = Math.floor((now - lastMaintenance) / (1000 * 60 * 60 * 24))
        
        if (daysSinceLastMaintenance > 90) {
          alerts.push({
            type: 'due-soon',
            severity: 'medium',
            vehicleId: vehicle.id,
            vehicleName: vehicle.model,
            lastMaintenanceDate: vehicle.lastMaintenance,
            daysSinceLastMaintenance,
            recommendation: 'Schedule preventive maintenance',
          })
        }
      }
    }
    
    return alerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
  }

  async getPendingCargoTracking() {
    const trips = await TripRepository.findAll(10000, 0)
    const pendingTrips = trips.filter(t => t.status === 'draft' || t.status === 'dispatched')
    
    let totalCargoWeight = 0
    const cargoByVehicle = {}
    const cargoByStatus = {}
    
    for (const trip of pendingTrips) {
      totalCargoWeight += trip.cargoWeight
      
      if (!cargoByVehicle[trip.vehicleId]) {
        cargoByVehicle[trip.vehicleId] = { count: 0, totalWeight: 0 }
      }
      cargoByVehicle[trip.vehicleId].count++
      cargoByVehicle[trip.vehicleId].totalWeight += trip.cargoWeight
      
      if (!cargoByStatus[trip.status]) {
        cargoByStatus[trip.status] = { count: 0, totalWeight: 0 }
      }
      cargoByStatus[trip.status].count++
      cargoByStatus[trip.status].totalWeight += trip.cargoWeight
    }
    
    return {
      totalPendingTrips: pendingTrips.length,
      totalPendingCargoWeight: totalCargoWeight,
      cargoByStatus,
      cargoByVehicle,
      averageCargoPerTrip: pendingTrips.length > 0 ? (totalCargoWeight / pendingTrips.length).toFixed(2) : 0,
    }
  }

  async getDashboardAggregation() {
    const fleetMetrics = await this.getFleetMetrics()
    const financialMetrics = await this.getFinancialMetrics()
    const maintenanceAlerts = await this.getMaintenanceAlerts()
    const pendingCargo = await this.getPendingCargoTracking()
    const driverPerformance = await this.getDriverPerformance()

    const drivers = await DriverRepository.findAll(10000, 0)
    const licensesExpiringCount = drivers.filter(d => {
      const daysUntilExpiry = (new Date(d.licenseExpiry) - new Date()) / (1000 * 60 * 60 * 24)
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0
    }).length

    const expiredLicensesCount = drivers.filter(d => {
      return new Date(d.licenseExpiry) < new Date()
    }).length

    return {
      timestamp: new Date().toISOString(),
      fleetStatus: fleetMetrics,
      financialSummary: {
        totalRevenue: financialMetrics.totalRevenue,
        totalCost: financialMetrics.totalCost,
        netProfit: financialMetrics.netProfit,
        profitMargin: financialMetrics.profitMargin,
      },
      operationalAlerts: {
        maintenanceAlerts: maintenanceAlerts.length,
        highSeverityAlerts: maintenanceAlerts.filter(a => a.severity === 'high').length,
        licensesExpiringSoon: licensesExpiringCount,
        expiredLicenses: expiredLicensesCount,
      },
      cargoStatus: {
        pendingTrips: pendingCargo.totalPendingTrips,
        totalPendingCargoWeight: pendingCargo.totalPendingCargoWeight,
      },
      driverPerformance: {
        totalDrivers: driverPerformance.length,
        averageSafetyScore: driverPerformance.length > 0
          ? (driverPerformance.reduce((sum, d) => sum + d.safetyScore, 0) / driverPerformance.length).toFixed(2)
          : 0,
        topPerformers: driverPerformance
          .sort((a, b) => b.tripsCompleted - a.tripsCompleted)
          .slice(0, 5),
      },
    }
  }

  async generateComprehensiveReport() {
    const fleetMetrics = await this.getFleetMetrics()
    const financialMetrics = await this.getFinancialMetrics()
    const utilization = await this.getFleetUtilization(30)
    const vehicles = await VehicleRepository.findAll(10000, 0)
    const maintenanceAlerts = await this.getMaintenanceAlerts()
    const pendingCargo = await this.getPendingCargoTracking()
    const driverPerformance = await this.getDriverPerformance()

    const vehicleROIs = []
    for (const vehicle of vehicles) {
      const roi = await this.getVehicleROI(vehicle.id)
      vehicleROIs.push(roi)
    }

    return {
      timestamp: new Date().toISOString(),
      reportPeriod: 'Current',
      executiveSummary: {
        fleetMetrics,
        financialHighlights: {
          totalRevenue: financialMetrics.totalRevenue,
          totalCost: financialMetrics.totalCost,
          netProfit: financialMetrics.netProfit,
          profitMargin: financialMetrics.profitMargin,
        },
      },
      detailedAnalysis: {
        utilization,
        vehiclePerformance: vehicleROIs,
        driverPerformance,
      },
      operationalInsights: {
        maintenanceAlerts,
        pendingCargo,
      },
    }
  }

  async generateReport(format = 'json') {
    return this.generateComprehensiveReport()
  }

  async getDriverPerformance() {
    return prisma.driver.findMany({
      select: {
        id: true,
        name: true,
        tripsCompleted: true,
        safetyScore: true,
        status: true,
        licenseExpiry: true,
      },
      orderBy: { tripsCompleted: 'desc' },
    })
  }

  async getMaintenanceAlertsLegacy() {
    return MaintenanceRepository.findScheduled(10000, 0)
  }

  async getKPIs() {
    const fleetMetrics = await this.getFleetMetrics()
    const financialMetrics = await this.getFinancialMetrics()
    const pendingCargo = await this.getPendingCargoTracking()

    return {
      operationalKPIs: {
        fleetUtilization: `${fleetMetrics.utilizationRate}%`,
        activeVehicles: fleetMetrics.activeFleet,
        totalVehicles: fleetMetrics.totalVehicles,
        maintenanceVehicles: fleetMetrics.maintenanceAlerts,
        completedTrips: fleetMetrics.completedTrips,
      },
      financialKPIs: {
        totalRevenue: financialMetrics.totalRevenue,
        totalCost: financialMetrics.totalCost,
        profitMargin: `${financialMetrics.profitMargin}%`,
        costPerKm: financialMetrics.costPerKm,
      },
      cargoKPIs: {
        pendingCargo: pendingCargo.totalPendingTrips,
        totalCargoWeight: pendingCargo.totalPendingCargoWeight,
      },
    }
  }
}

export default new AnalyticsService()

