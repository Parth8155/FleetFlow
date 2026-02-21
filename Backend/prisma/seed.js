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
          name: 'Arjun Mehta',
          role: 'manager',
          status: 'active',
        },
      }),
      prisma.user.create({
        data: {
          email: 'dispatcher@fleetflow.com',
          password: hashedPassword,
          name: 'Sanjay Gupta',
          role: 'dispatcher',
          status: 'active',
        },
      }),
      prisma.user.create({
        data: {
          email: 'safety@fleetflow.com',
          password: hashedPassword,
          name: 'Karthik Raman',
          role: 'safety',
          status: 'active',
        },
      }),
      prisma.user.create({
        data: {
          email: 'analyst@fleetflow.com',
          password: hashedPassword,
          name: 'Anjali Sharma',
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
          model: 'BharatBenz 3523R',
          licensePlate: 'MH04JK1234',
          maxCapacity: 25000, 
          type: 'truck',
          status: 'available',
          odometer: 45000,
          acquisitionCost: 3800000,
          lastMaintenance: new Date('2026-02-01'),
        },
      }),
      prisma.vehicle.create({
        data: {
          model: 'Tata Signa 4825.T',
          licensePlate: 'GJ01XY9876',
          maxCapacity: 32000,
          type: 'truck',
          status: 'available',
          odometer: 32500,
          acquisitionCost: 4200000,
          lastMaintenance: new Date('2026-01-15'),
        },
      }),
      prisma.vehicle.create({
        data: {
          model: 'Ashok Leyland Ecomet 1615',
          licensePlate: 'TN02AB5555',
          maxCapacity: 16000,
          type: 'truck',
          status: 'available', // Dispatched trip 3
          odometer: 67890,
          acquisitionCost: 2800000,
          lastMaintenance: new Date('2026-01-30'),
        },
      }),
      prisma.vehicle.create({
        data: {
          model: 'Mahindra Blazo X 49',
          licensePlate: 'KA03MN4321',
          maxCapacity: 49000,
          type: 'truck',
          status: 'available',
          odometer: 28500,
          acquisitionCost: 4500000,
          lastMaintenance: new Date('2025-12-20'),
        },
      }),
      prisma.vehicle.create({
        data: {
          model: 'Tata Ace Gold (Chota Hathi)',
          licensePlate: 'DL05ZZ7777',
          maxCapacity: 750,
          type: 'van',
          status: 'available',
          odometer: 12000,
          acquisitionCost: 550000,
          lastMaintenance: new Date('2026-02-18'),
        },
      }),
      prisma.vehicle.create({
        data: {
          model: 'TVS XL100 Heavy Duty',
          licensePlate: 'UP16RT9999',
          maxCapacity: 150,
          type: 'bike',
          status: 'available',
          odometer: 5000,
          acquisitionCost: 45000,
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
          status: 'on-duty', // Trip 3
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


    // Create maintenance records
    console.log('🔧 Creating maintenance records...')
  



    // Create dashboard metrics
    console.log('📊 Creating dashboard metrics...')
 

    console.log(`✅ Created dashboard metrics`)

    console.log('\n✨ Database seeding completed successfully!')
    console.log(`
📊 Summary:
 

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
