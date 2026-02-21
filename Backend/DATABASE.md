# Database Setup & Migration Guide

## Overview

FleetFlow uses **PostgreSQL** as the primary database with **Prisma ORM** for schema management and data access. This guide covers database setup, migration, and seeding.

## Prerequisites

- PostgreSQL 12 or higher installed and running
- Node.js 16+ with npm installed
- All dependencies installed (`npm install`)

## Database Configuration

### 1. PostgreSQL Setup

**On Windows (using WSL or PostgreSQL installer):**
```bash
# If using PostgreSQL installer, ensure PostgreSQL service is running
# Service should be accessible at localhost:5432
```

**On Linux/Mac:**
```bash
# Using Homebrew (Mac)
brew install postgresql
brew services start postgresql

# Or using package manager (Linux)
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### 2. Create FleetFlow Database

Connect to PostgreSQL and create the database:

```bash
# Using psql command line
psql -U postgres

# In psql prompt
CREATE DATABASE fleetflow;
\l  # List databases to verify creation
\q  # Quit psql
```

Or use a single command:
```bash
createdb -U postgres fleetflow
```

### 3. Environment Configuration

Create a `.env` file in the Backend directory with your database credentials:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:parth123@localhost:5432/fleetflow"
JWT_SECRET="your-secret-key-change-in-production"
```

**Important:** Replace `parth123` with your actual PostgreSQL password.

## Prisma Setup

### Generate Prisma Client

Generate the Prisma client with the latest schema:

```bash
npm run prisma:generate
```

This creates typed TypeScript/JavaScript interfaces for all models.

## Database Migrations

### Run Initial Migration

Create and apply the initial database schema:

```bash
npm run prisma:migrate
```

This will:
1. Create PostgreSQL tables based on `prisma/schema.prisma`
2. Create migration files in `prisma/migrations/`
3. Run the seed script automatically

**First-time setup output:**
```
✔ Enter a name for the new migration: › initial_schema
✔ Your database is now in sync with your schema.
🚀 Don't forget to run `npx prisma db push` or `npx prisma migrate deploy` to apply changes to other environments.

Generated Prisma Client (v5.7.1) to ./node_modules/@prisma/client in 285ms
```

### Apply Existing Migrations (Production)

```bash
npx prisma migrate deploy
```

## Database Seeding

### Seed with Sample Data

Populate the database with initial test data:

```bash
npm run prisma:seed
```

**Expected output:**
```
🌱 Starting database seeding...
👤 Creating users...
✅ Created 4 users
🚚 Creating vehicles...
✅ Created 6 vehicles
👨‍💼 Creating drivers...
✅ Created 5 drivers
📦 Creating trips...
✅ Created 4 trips
🔧 Creating maintenance records...
✅ Created 4 maintenance records
💰 Creating expenses...
✅ Created 6 expenses
📊 Creating dashboard metrics...
✅ Created dashboard metrics

✨ Database seeding completed successfully!

📊 Summary:
   - Users: 4
   - Vehicles: 6
   - Drivers: 5
   - Trips: 4
   - Maintenance Records: 4
   - Expenses: 6

Test Credentials:
   - Manager: manager@fleetflow.com / password123
   - Dispatcher: dispatcher@fleetflow.com / password123
   - Safety: safety@fleetflow.com / password123
   - Analyst: analyst@fleetflow.com / password123
```

## Database Schema

### Core Tables

#### users
- **Fields:** id, email, password, name, role, status, createdAt, updatedAt
- **Roles:** manager, dispatcher, safety, analyst
- **Statuses:** active, inactive, suspended

#### vehicles
- **Fields:** id, name, model, licensePlate, maxCapacity, type, status, odometer, lastMaintenance, region, acquisitionCost
- **Types:** truck, van, bike
- **Statuses:** available, on-trip, in-shop, retired
- **Relations:** trips[], maintenance[], expenses[]

#### drivers
- **Fields:** id, name, licenseNumber, licenseExpiry, licenseCategory, status, safetyScore, tripsCompleted, lastTripDate
- **Statuses:** on-duty, off-duty, suspended
- **Relations:** trips[]

#### trips
- **Fields:** id, vehicleId, driverId, cargoWeight, startPoint, endPoint, status, startOdometer, endOdometer, startTime, endTime
- **Statuses:** draft, dispatched, completed, cancelled
- **Relations:** vehicle (Vehicle), driver (Driver)

#### maintenanceRecords
- **Fields:** id, vehicleId, type, description, cost, status, scheduledDate, completedDate
- **Types:** preventative, reactive, emergency
- **Statuses:** scheduled, in-progress, completed
- **Relations:** vehicle (Vehicle)

#### expenses
- **Fields:** id, vehicleId, type, amount, units, description, date
- **Types:** fuel, maintenance, other
- **Relations:** vehicle (Vehicle)

#### dashboard
- **Fields:** id, activeFleet, maintenanceAlerts, utilizationRate, pendingCargo

## Prisma Studio

Visualize and manage database data with Prisma Studio:

```bash
npm run prisma:studio
```

This opens an interactive web UI at `http://localhost:5555` where you can:
- View all database records
- Create/update/delete data
- Filter and search records
- Export data

## Database Operations

### View Database Schema

```bash
# Generate schema documentation
npx prisma db pull  # Introspect existing database

# View schema file
cat prisma/schema.prisma
```

### Reset Database (Development Only)

⚠️ **Warning: This deletes all data!**

```bash
npx prisma migrate reset
```

This will:
1. Drop the entire database
2. Recreate schema from migrations
3. Run seed script automatically

### Manual SQL Queries

Connect to PostgreSQL directly:

```bash
psql -U postgres -d fleetflow

# List tables
\dt

# View table structure
\d users

# Run SQL query
SELECT * FROM users;

# Exit
\q
```

## Troubleshooting

### Connection Error: "could not connect to server"

```bash
# Verify PostgreSQL is running
# Windows: Check Services -> PostgreSQL
# Mac: brew services list
# Linux: sudo service postgresql status

# If not running, start it
sudo service postgresql start  # Linux
brew services start postgresql  # Mac
```

### Error: "database does not exist"

Create the database:
```bash
createdb -U postgres fleetflow
```

### Error: "password authentication failed"

Update DATABASE_URL in .env with correct PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fleetflow"
```

### Error: "relation does not exist"

Run migrations:
```bash
npm run prisma:migrate
```

### Reset Everything (Fresh Start)

```bash
# Drop database
dropdb -U postgres fleetflow

# Recreate database
createdb -U postgres fleetflow

# Run migrations and seed
npm run prisma:migrate
```

## Production Deployment

### 1. Use Managed Database Service
- AWS RDS PostgreSQL
- Google Cloud SQL
- Azure Database for PostgreSQL
- Heroku Postgres

### 2. Update Environment Variables
```env
DATABASE_URL="postgresql://user:password@production-host:5432/fleetflow"
NODE_ENV=production
```

### 3. Apply Migrations
```bash
npx prisma migrate deploy
```

### 4. Backup Database
```bash
pg_dump -U postgres fleetflow > backup.sql
```

### 5. Restore Database
```bash
psql -U postgres fleetflow < backup.sql
```

## Best Practices

✅ **DO:**
- Keep .env file in .gitignore
- Use connection pooling for production
- Run migrations before deployment
- Backup database regularly
- Monitor database performance
- Use separate databases for dev/test/prod

❌ **DON'T:**
- Commit .env to version control
- Modify schema.prisma without migrations
- Use raw SQL in production code
- Store sensitive data in plain text
- Run migrations on production manually

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)
