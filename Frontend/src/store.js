import { create } from 'zustand'
import api from './services/api'

/**
 * Authentication Store
 * Manages user authentication state and operations
 */
export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('authToken') || null,
  isAuthenticated: !!localStorage.getItem('authToken'),
  error: null,
  loading: false,

  /**
   * Register new user
   */
  register: async (email, password, name, role = 'dispatcher') => {
    set({ loading: true, error: null })
    try {
      const data = await api.auth.register(email, password, name, role)
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
      })
      return data
    } catch (error) {
      set({
        error: error.message || 'Registration failed',
        loading: false,
      })
      throw error
    }
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const data = await api.auth.login(email, password)
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
      })
      return data
    } catch (error) {
      set({
        error: error.message || 'Login failed',
        loading: false,
      })
      throw error
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    })
  },

  /**
   * Clear error message
   */
  clearError: () => set({ error: null }),
}))

export const useFleetStore = create((set) => ({
  vehicles: [],
  drivers: [],
  trips: [],
  expenses: [],
  maintenanceLogs: [],
  loading: false,
  error: null,

  // Vehicles
  fetchVehicles: async () => {
    set({ loading: true, error: null })
    try {
      const data = await api.vehicles.getAll()
      set({ vehicles: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  addVehicle: async (vehicle) => {
    try {
      const newVehicle = await api.vehicles.create(vehicle)
      set((state) => ({ vehicles: [...state.vehicles, newVehicle] }))
      return newVehicle
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  updateVehicle: async (id, updates) => {
    try {
      const updated = await api.vehicles.update(id, updates)
      set((state) => ({
        vehicles: state.vehicles.map((v) => (v.id === id ? updated : v)),
      }))
      return updated
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deleteVehicle: async (id) => {
    try {
      await api.vehicles.delete(id)
      set((state) => ({
        vehicles: state.vehicles.filter((v) => v.id !== id),
      }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Drivers
  fetchDrivers: async () => {
    set({ loading: true, error: null })
    try {
      const data = await api.drivers.getAll()
      set({ drivers: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  addDriver: async (driver) => {
    try {
      const newDriver = await api.drivers.create(driver)
      set((state) => ({ drivers: [...state.drivers, newDriver] }))
      return newDriver
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  updateDriver: async (id, updates) => {
    try {
      const updated = await api.drivers.update(id, updates)
      set((state) => ({
        drivers: state.drivers.map((d) => (d.id === id ? updated : d)),
      }))
      return updated
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Trips
  fetchTrips: async () => {
    set({ loading: true, error: null })
    try {
      const data = await api.trips.getAll()
      set({ trips: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  addTrip: async (trip) => {
    try {
      const newTrip = await api.trips.create(trip)
      set((state) => ({ trips: [...state.trips, newTrip] }))
      // Re-fetch vehicles and drivers to reflect status changes (on-trip)
      const [vData, dData] = await Promise.all([
        api.vehicles.getAll(),
        api.drivers.getAll()
      ])
      set({ vehicles: vData, drivers: dData })
      return newTrip
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  completeTrip: async (tripId, endOdometer, fuelConsumed = null, actualFuelCost = null) => {
    try {
      const completed = await api.trips.complete(tripId, endOdometer, fuelConsumed, actualFuelCost)
      set((state) => ({
        trips: state.trips.map((t) => (t.id === tripId ? completed : t)),
      }))
      // Re-fetch to reflect "available" status and updated odometer
      const [vData, dData] = await Promise.all([
        api.vehicles.getAll(),
        api.drivers.getAll()
      ])
      set({ vehicles: vData, drivers: dData })
      return completed
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  cancelTrip: async (tripId) => {
    try {
      const cancelled = await api.trips.cancel(tripId)
      set((state) => ({
        trips: state.trips.map((t) => (t.id === tripId ? cancelled : t)),
      }))
      // Re-fetch to reflect "available" status and updated odometer
      const [vData, dData] = await Promise.all([
        api.vehicles.getAll(),
        api.drivers.getAll()
      ])
      set({ vehicles: vData, drivers: dData })
      return cancelled
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Expenses
  fetchExpenses: async () => {
    set({ loading: true, error: null })
    try {
      const data = await api.expenses.getAll()
      set({ expenses: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  addExpense: async (expense) => {
    try {
      const newExpense = await api.expenses.create(expense)
      set((state) => ({ expenses: [...state.expenses, newExpense] }))
      return newExpense
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Maintenance Logs
  fetchMaintenanceLogs: async () => {
    set({ loading: true, error: null })
    try {
      const data = await api.maintenance.getAll()
      set({ maintenanceLogs: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  addMaintenanceLog: async (log) => {
    try {
      const newLog = await api.maintenance.create(log)
      set((state) => ({ maintenanceLogs: [...state.maintenanceLogs, newLog] }))
      // Re-fetch vehicles to reflect "in-shop" status
      const vData = await api.vehicles.getAll()
      set({ vehicles: vData })
      return newLog
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  completeMaintenanceLog: async (logId) => {
    try {
      const completed = await api.maintenance.complete(logId)
      set((state) => ({
        maintenanceLogs: state.maintenanceLogs.map((l) =>
          l.id === logId ? completed : l
        ),
      }))
      // Re-fetch to reflect "available" status
      const vData = await api.vehicles.getAll()
      set({ vehicles: vData })
      return completed
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
}))

export const useDashboardStore = create((set) => ({
  filters: {
    vehicleType: null,
    status: null,
  },
  searchQuery: '',
  setFilters: (filters) => set({ filters }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
