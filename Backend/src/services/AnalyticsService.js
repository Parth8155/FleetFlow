import prisma from '../config/prisma.js'
import VehicleRepository from '../repositories/VehicleRepository.js'
import MaintenanceRepository from '../repositories/MaintenanceRepository.js'
import TripRepository from '../repositories/TripRepository.js'
import ExpenseRepository from '../repositories/ExpenseRepository.js'

export class AnalyticsService {
  async getFleetMetrics() {
    const vehicles = await VehicleRepository.findAll(10000, 0)
    const trips = await TripRepository.findAll(10000, 0)
    const maintenance = await MaintenanceRepository.findAll(10000, 0)

    const activeFleet = vehicles.filter(v => v.status === 'on-trip').length
    const maintenanceAlerts = vehicles.filter(v => v.status === 'in-shop').length
    const utilizationRate = vehicles.length > 0
      ? ((activeFleet / vehicles.length) * 100).toFixed(2)
      : 0
    const pendingCargo = trips.filter(t => t.status === 'draft').length

    return {
      activeFleet,
      maintenanceAlerts,
      utilizationRate: parseFloat(utilizationRate),
      pendingCargo,
      totalVehicles: vehicles.length,
      totalTrips: trips.length,
      completedTrips: trips.filter(t => t.status === 'completed').length,
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
    for (const trip of trips) {
      if (trip.endOdometer) {
        const distance = trip.endOdometer - trip.startOdometer
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
      vehicleName: vehicle.name,
      revenue,
      totalCost,
      profit: revenue - totalCost,
      roi: parseFloat(roi),
    }
  }

  async generateReport(format = 'json') {
    const fleetMetrics = await this.getFleetMetrics()
    const financialMetrics = await this.getFinancialMetrics()
    const vehicles = await VehicleRepository.findAll(10000, 0)

    const vehicleROIs = []
    for (const vehicle of vehicles) {
      const roi = await this.getVehicleROI(vehicle.id)
      vehicleROIs.push(roi)
    }

    return {
      timestamp: new Date().toISOString(),
      fleetMetrics,
      financialMetrics,
      vehicleROIs,
      format,
    }
  }

  async getDriverPerformance() {
    return prisma.driver.findMany({
      select: {
        id: true,
        name: true,
        tripsCompleted: true,
        safetyScore: true,
        status: true,
      },
    })
  }

  async getMaintenanceAlerts() {
    return MaintenanceRepository.findScheduled(10000, 0)
  }
}

export default new AnalyticsService()

