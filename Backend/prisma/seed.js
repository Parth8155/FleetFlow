import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // Clear existing data (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('🗑️  Clearing existing data...')
      await prisma.expense.deleteMany()
      await prisma.maintenanceRecord.deleteMany()
      await prisma.trip.deleteMany()
      await prisma.driver.deleteMany()
      await prisma.vehicle.deleteMany()
      await prisma.user.deleteMany()
      await prisma.dashboard.deleteMany()
    }

    // Create users with different roles
    console.log('👤 Creating users...')
    const hashedPassword = await bcryptjs.hash('password123', 10)

    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'manager@fleetflow.com',
          password: hashedPassword,
          name: 'Fleet Manager',
          role: 'manager',
          status: 'active',
        },
      }),
      prisma.user.create({
        data: {
          email: 'dispatcher@fleetflow.com',
          password: hashedPassword,
          name: 'Trip Dispatcher',
          role: 'dispatcher',
          status: 'active',
        },
      }),
      prisma.user.create({
        data: {
          email: 'safety@fleetflow.com',
          password: hashedPassword,
          name: 'Safety Officer',
          role: 'safety',
          status: 'active',
        },
      }),
      prisma.user.create({
        data: {
          email: 'analyst@fleetflow.com',
          password: hashedPassword,
          name: 'Data Analyst',
          role: 'analyst',
          status: 'active',
        },
      }),
    ])

    console.log(`✅ Created ${users.length} users`)

    // Create vehicles
    console.log('🚚 Creating vehicles...')
    const vehicles = await Promise.all([
      prisma.vehicle.create({
        data: {
          name: 'Vehicle Delhi-01',
          model: 'Volvo FM 460',
          licensePlate: 'DL01XX9999',
          maxCapacity: 20000, // 20 tons
          type: 'truck',
          status: 'available',
          odometer: 45000,
          region: 'Delhi',
          acquisitionCost: 4500000,
          lastMaintenance: new Date('2026-02-01'),
        },
      }),
      prisma.vehicle.create({
        data: {
          name: 'Vehicle Delhi-02',
          model: 'Tata LPT 2518',
          licensePlate: 'DL02XX9999',
          maxCapacity: 18000,
          type: 'truck',
          status: 'available',
          odometer: 32500,
          region: 'Delhi',
          acquisitionCost: 3200000,
          lastMaintenance: new Date('2026-01-15'),
        },
      }),
      prisma.vehicle.create({
        data: {
          name: 'Vehicle Mumbai-01',
          model: 'Ashok Leyland AL 3210',
          licensePlate: 'MH01XX9999',
          maxCapacity: 15000,
          type: 'truck',
          status: 'available',
          odometer: 67890,
          region: 'Mumbai',
          acquisitionCost: 2800000,
          lastMaintenance: new Date('2026-01-30'),
        },
      }),
      prisma.vehicle.create({
        data: {
          name: 'Vehicle Bangalore-01',
          model: 'Eicher Pro 1084',
          licensePlate: 'KA01XX9999',
          maxCapacity: 12000,
          type: 'truck',
          status: 'available',
          odometer: 28500,
          region: 'Bangalore',
          acquisitionCost: 2400000,
          lastMaintenance: new Date('2025-12-20'),
        },
      }),
      prisma.vehicle.create({
        data: {
          name: 'Vehicle Delhi-Van-01',
          model: 'Maruti Suzuki Super Carry',
          licensePlate: 'DL03XX9999',
          maxCapacity: 1000,
          type: 'van',
          status: 'in-shop',
          odometer: 12000,
          region: 'Delhi',
          acquisitionCost: 450000,
          lastMaintenance: new Date('2026-02-18'),
        },
      }),
      prisma.vehicle.create({
        data: {
          name: 'Vehicle Delhi-Bike-01',
          model: 'Hero Splendor Plus',
          licensePlate: 'DL04XX9999',
          maxCapacity: 100,
          type: 'bike',
          status: 'available',
          odometer: 5000,
          region: 'Delhi',
          acquisitionCost: 75000,
          lastMaintenance: new Date('2026-02-10'),
        },
      }),
    ])

    console.log(`✅ Created ${vehicles.length} vehicles`)

    // Create drivers
    console.log('👨‍💼 Creating drivers...')
    const drivers = await Promise.all([
      prisma.driver.create({
        data: {
          name: 'Rajesh Kumar',
          licenseNumber: 'DLK0012345678',
          licenseExpiry: new Date('2027-06-15'),
          licenseCategory: 'HCV',
          status: 'on-duty',
          safetyScore: 98,
          tripsCompleted: 234,
          lastTripDate: new Date('2026-02-20'),
        },
      }),
      prisma.driver.create({
        data: {
          name: 'Amit Patel',
          licenseNumber: 'GJ1234567890',
          licenseExpiry: new Date('2026-09-20'),
          licenseCategory: 'HCV',
          status: 'on-duty',
          safetyScore: 95,
          tripsCompleted: 189,
          lastTripDate: new Date('2026-02-21'),
        },
      }),
      prisma.driver.create({
        data: {
          name: 'Suresh Singh',
          licenseNumber: 'MH5678901234',
          licenseExpiry: new Date('2028-03-10'),
          licenseCategory: 'HCV',
          status: 'off-duty',
          safetyScore: 92,
          tripsCompleted: 156,
          lastTripDate: new Date('2026-02-19'),
        },
      }),
      prisma.driver.create({
        data: {
          name: 'Vikram Reddy',
          licenseNumber: 'KA8901234567',
          licenseExpiry: new Date('2026-05-15'),
          licenseCategory: 'HCV',
          status: 'on-duty',
          safetyScore: 88,
          tripsCompleted: 142,
          lastTripDate: new Date('2026-02-17'),
        },
      }),
      prisma.driver.create({
        data: {
          name: 'Priya Sharma',
          licenseNumber: 'DL5555666677',
          licenseExpiry: new Date('2025-11-30'), // Expired
          licenseCategory: 'LCV',
          status: 'suspended',
          safetyScore: 45,
          tripsCompleted: 23,
          lastTripDate: new Date('2025-11-20'),
        },
      }),
    ])

    console.log(`✅ Created ${drivers.length} drivers`)

    // Create trips
    console.log('📦 Creating trips...')
    const trips = await Promise.all([
      prisma.trip.create({
        data: {
          vehicleId: vehicles[0].id,
          driverId: drivers[0].id,
          cargoWeight: 18000,
          startPoint: 'Delhi Warehouse',
          endPoint: 'Mumbai Distribution Center',
          status: 'completed',
          startOdometer: 45000,
          endOdometer: 45450,
          startTime: new Date('2026-02-18'),
          endTime: new Date('2026-02-19'),
        },
      }),
      prisma.trip.create({
        data: {
          vehicleId: vehicles[1].id,
          driverId: drivers[1].id,
          cargoWeight: 15000,
          startPoint: 'Delhi Factory',
          endPoint: 'Bangalore Depot',
          status: 'completed',
          startOdometer: 32500,
          endOdometer: 32890,
          startTime: new Date('2026-02-17'),
          endTime: new Date('2026-02-18'),
        },
      }),
      prisma.trip.create({
        data: {
          vehicleId: vehicles[2].id,
          driverId: drivers[2].id,
          cargoWeight: 12000,
          startPoint: 'Mumbai Port',
          endPoint: 'Pune Market',
          status: 'dispatched',
          startOdometer: 67890,
          endOdometer: null,
          startTime: new Date('2026-02-21'),
          endTime: null,
        },
      }),
      prisma.trip.create({
        data: {
          vehicleId: vehicles[3].id,
          driverId: drivers[3].id,
          cargoWeight: 8000,
          startPoint: 'Bangalore Hub',
          endPoint: 'Hyderabad Center',
          status: 'draft',
          startOdometer: 28500,
          endOdometer: null,
          startTime: null,
          endTime: null,
        },
      }),
    ])

    console.log(`✅ Created ${trips.length} trips`)

    // Create maintenance records
    console.log('🔧 Creating maintenance records...')
    const maintenance = await Promise.all([
      prisma.maintenanceRecord.create({
        data: {
          vehicleId: vehicles[4].id,
          type: 'preventative',
          description: 'Engine oil change and filter replacement',
          cost: 5000,
          status: 'in-progress',
          scheduledDate: new Date('2026-02-18'),
          completedDate: null,
        },
      }),
      prisma.maintenanceRecord.create({
        data: {
          vehicleId: vehicles[0].id,
          type: 'reactive',
          description: 'Brake pad replacement (worn out)',
          cost: 12000,
          status: 'completed',
          scheduledDate: new Date('2026-02-01'),
          completedDate: new Date('2026-02-01'),
        },
      }),
      prisma.maintenanceRecord.create({
        data: {
          vehicleId: vehicles[1].id,
          type: 'preventative',
          description: 'Tire rotation and air pressure check',
          cost: 3000,
          status: 'scheduled',
          scheduledDate: new Date('2026-02-25'),
          completedDate: null,
        },
      }),
      prisma.maintenanceRecord.create({
        data: {
          vehicleId: vehicles[2].id,
          type: 'emergency',
          description: 'Engine overheating - cooling system flush',
          cost: 18000,
          status: 'completed',
          scheduledDate: new Date('2026-01-30'),
          completedDate: new Date('2026-01-30'),
        },
      }),
    ])

    console.log(`✅ Created ${maintenance.length} maintenance records`)

    // Create expenses
    console.log('💰 Creating expenses...')
    const expenses = await Promise.all([
      prisma.expense.create({
        data: {
          vehicleId: vehicles[0].id,
          type: 'fuel',
          amount: 8500,
          units: 50,
          description: 'Diesel fuel - Delhi to Mumbai trip',
          date: new Date('2026-02-19'),
        },
      }),
      prisma.expense.create({
        data: {
          vehicleId: vehicles[0].id,
          type: 'fuel',
          amount: 7200,
          units: 45,
          description: 'Diesel fuel - Return trip',
          date: new Date('2026-02-20'),
        },
      }),
      prisma.expense.create({
        data: {
          vehicleId: vehicles[1].id,
          type: 'fuel',
          amount: 6500,
          units: 40,
          description: 'Diesel fuel - Delhi to Bangalore',
          date: new Date('2026-02-18'),
        },
      }),
      prisma.expense.create({
        data: {
          vehicleId: vehicles[1].id,
          type: 'maintenance',
          amount: 8000,
          units: 1,
          description: 'Transmission fluid change',
          date: new Date('2026-02-15'),
        },
      }),
      prisma.expense.create({
        data: {
          vehicleId: vehicles[2].id,
          type: 'fuel',
          amount: 5800,
          units: 35,
          description: 'Diesel fuel - Mumbai to Pune',
          date: new Date('2026-02-21'),
        },
      }),
      prisma.expense.create({
        data: {
          vehicleId: vehicles[2].id,
          type: 'other',
          amount: 2500,
          units: 1,
          description: 'Toll charges',
          date: new Date('2026-02-21'),
        },
      }),
    ])

    console.log(`✅ Created ${expenses.length} expenses`)

    // Create dashboard metrics
    console.log('📊 Creating dashboard metrics...')
    const dashboard = await prisma.dashboard.create({
      data: {
        activeFleet: 5,
        maintenanceAlerts: 1,
        utilizationRate: 66.67,
        pendingCargo: 1,
      },
    })

    console.log(`✅ Created dashboard metrics`)

    console.log('\n✨ Database seeding completed successfully!')
    console.log(`
📊 Summary:
   - Users: ${users.length}
   - Vehicles: ${vehicles.length}
   - Drivers: ${drivers.length}
   - Trips: ${trips.length}
   - Maintenance Records: ${maintenance.length}
   - Expenses: ${expenses.length}

Test Credentials:
   - Manager: manager@fleetflow.com / password123
   - Dispatcher: dispatcher@fleetflow.com / password123
   - Safety: safety@fleetflow.com / password123
   - Analyst: analyst@fleetflow.com / password123
    `)
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
