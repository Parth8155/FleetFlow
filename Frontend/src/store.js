import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}))

export const useFleetStore = create((set, get) => ({
  vehicles: [
    {
      id: 1,
      name: 'Van-05',
      model: 'Toyota Hiace',
      licensePlate: 'ABC-1234',
      maxCapacity: 500,
      type: 'van',
      status: 'available',
      odometer: 15000,
      lastMaintenance: '2026-01-15',
      region: 'North',
    },
    {
      id: 2,
      name: 'Truck-01',
      model: 'Volvo FH16',
      licensePlate: 'XYZ-5678',
      maxCapacity: 2000,
      type: 'truck',
      status: 'on-trip',
      odometer: 45000,
      lastMaintenance: '2026-02-01',
      region: 'South',
    },
  ],

  drivers: [
    {
      id: 1,
      name: 'Alex Johnson',
      licenseNumber: 'DL-001',
      licenseExpiry: '2027-06-15',
      licenseCategory: 'B+E',
      status: 'on-duty',
      safetyScore: 95,
      tripsCompleted: 120,
    },
    {
      id: 2,
      name: 'Maria Garcia',
      licenseNumber: 'DL-002',
      licenseExpiry: '2026-12-20',
      licenseCategory: 'C',
      status: 'on-duty',
      safetyScore: 88,
      tripsCompleted: 95,
    },
  ],

  trips: [
    {
      id: 1,
      vehicleId: 1,
      driverId: 1,
      cargoWeight: 450,
      startPoint: 'Warehouse A',
      endPoint: 'Distribution Center B',
      status: 'completed',
      startOdometer: 15000,
      endOdometer: 15150,
      createdAt: '2026-02-20',
    },
  ],

  expenses: [
    {
      id: 1,
      vehicleId: 1,
      type: 'fuel',
      amount: 2500,
      unit: 45,
      unitType: 'liters',
      date: '2026-02-19',
    },
    {
      id: 2,
      vehicleId: 1,
      type: 'maintenance',
      amount: 5000,
      description: 'Oil Change',
      date: '2026-02-18',
    },
  ],

  maintenanceLogs: [
    {
      id: 1,
      vehicleId: 1,
      type: 'preventative',
      description: 'Regular oil change',
      cost: 5000,
      date: '2026-02-18',
      status: 'completed',
    },
  ],

  addVehicle: (vehicle) =>
    set((state) => ({
      vehicles: [...state.vehicles, { ...vehicle, id: Math.max(...state.vehicles.map((v) => v.id), 0) + 1 }],
    })),

  updateVehicle: (id, updates) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    })),

  deleteVehicle: (id) =>
    set((state) => ({
      vehicles: state.vehicles.filter((v) => v.id !== id),
    })),

  addDriver: (driver) =>
    set((state) => ({
      drivers: [...state.drivers, { ...driver, id: Math.max(...state.drivers.map((d) => d.id), 0) + 1 }],
    })),

  updateDriver: (id, updates) =>
    set((state) => ({
      drivers: state.drivers.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),

  addTrip: (trip) =>
    set((state) => {
      const vehicle = state.vehicles.find((v) => v.id === trip.vehicleId)
      if (vehicle && trip.cargoWeight > vehicle.maxCapacity) {
        throw new Error(`Cargo weight exceeds vehicle capacity`)
      }
      return {
        trips: [...state.trips, { ...trip, id: Math.max(...state.trips.map((t) => t.id || 0), 0) + 1 }],
        vehicles: state.vehicles.map((v) =>
          v.id === trip.vehicleId ? { ...v, status: 'on-trip' } : v
        ),
        drivers: state.drivers.map((d) =>
          d.id === trip.driverId ? { ...d, status: 'on-trip' } : d
        ),
      }
    }),

  completeTrip: (tripId, endOdometer) =>
    set((state) => {
      const trip = state.trips.find((t) => t.id === tripId)
      if (!trip) return state

      return {
        trips: state.trips.map((t) =>
          t.id === tripId ? { ...t, status: 'completed', endOdometer } : t
        ),
        vehicles: state.vehicles.map((v) =>
          v.id === trip.vehicleId ? { ...v, status: 'available', odometer: endOdometer } : v
        ),
        drivers: state.drivers.map((d) =>
          d.id === trip.driverId ? { ...d, status: 'on-duty' } : d
        ),
      }
    }),

  addExpense: (expense) =>
    set((state) => ({
      expenses: [...state.expenses, { ...expense, id: Math.max(...state.expenses.map((e) => e.id), 0) + 1 }],
    })),

  addMaintenanceLog: (log) =>
    set((state) => ({
      maintenanceLogs: [...state.maintenanceLogs, { ...log, id: Math.max(...state.maintenanceLogs.map((l) => l.id), 0) + 1 }],
      vehicles: state.vehicles.map((v) =>
        v.id === log.vehicleId ? { ...v, status: 'in-shop' } : v
      ),
    })),

  removeFromMaintenance: (vehicleId) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === vehicleId ? { ...v, status: 'available' } : v
      ),
    })),
}))

export const useDashboardStore = create((set) => ({
  filters: {
    vehicleType: null,
    status: null,
    region: null,
  },
  setFilters: (filters) => set({ filters }),
}))
