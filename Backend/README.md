# FleetFlow Backend API

A comprehensive REST API for Fleet & Logistics Management System built with **Express.js**, **Prisma ORM**, and **PostgreSQL**.

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL 12+ database
- Git

### Installation

1. **Clone the repository**
```bash
cd Backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Copy example environment file
cp .env.example .env

# Update .env with your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/fleetflow"
```

4. **Setup database**
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed with sample data
npm run prisma:seed
```

5. **Start development server**
```bash
npm run dev
```

Server runs at `http://localhost:5000`

```
src/
├── config/              # Configuration files
│   ├── index.js        # Environment configuration
│   └── database.js     # Database connection pool
├── middleware/         # Express middleware
│   ├── auth.js        # JWT authentication & authorization
│   ├── errorHandler.js # Global error handling
│   └── logger.js      # Request logging
├── controllers/        # API route handlers
│   ├── authController.js
│   ├── vehicleController.js
│   ├── driverController.js
│   ├── tripController.js
│   ├── maintenanceController.js
│   ├── expenseController.js
│   └── analyticsController.js
├── services/          # Business logic layer
│   ├── AuthService.js
│   ├── VehicleService.js
│   ├── DriverService.js
│   ├── TripService.js
│   ├── MaintenanceService.js
│   ├── ExpenseService.js
│   └── AnalyticsService.js
├── repositories/      # Data access layer
│   └── BaseRepository.js
├── routes/           # Express route definitions
│   ├── authRoutes.js
│   ├── vehicleRoutes.js
│   ├── driverRoutes.js
│   ├── tripRoutes.js
│   ├── maintenanceRoutes.js
│   ├── expenseRoutes.js
│   └── analyticsRoutes.js
├── utils/           # Utility functions
│   ├── errors.js   # Custom error classes
│   └── jwt.js      # JWT token management
└── index.js        # Main application file
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure your environment variables
# Update DATABASE_URL, JWT_SECRET, etc.
```

### Environment Variables

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/fleetflow
JWT_SECRET=your-secret-key-change-in-production
REDIS_URL=redis://localhost:6379
```

## Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Lint code
npm run lint
```

## API Authentication

All API endpoints (except `/api/auth/register` and `/api/auth/login`) require JWT authentication.

### Getting Started with Auth

1. **Register or Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@fleetflow.com",
    "password": "password123"
  }'
```

2. **Use the returned token in requests**
```bash
curl -X GET http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer your_jwt_token_here"
```

### User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Manager** | Full system access, user management, all reports |
| **Dispatcher** | Manage trips, assign vehicles/drivers, view status |
| **Safety Officer** | Driver compliance, maintenance oversight, reports |
| **Data Analyst** | View analytics, generate reports, export data |

**For detailed auth documentation, see [AUTHENTICATION.md](AUTHENTICATION.md)**

### Test Credentials

After running `npm run prisma:seed`:

```
Manager:     manager@fleetflow.com / password123
Dispatcher:  dispatcher@fleetflow.com / password123
Safety:      safety@fleetflow.com / password123
Analyst:     analyst@fleetflow.com / password123
```

### Vehicles
- `GET /api/vehicles` - Get all vehicles *(manager, dispatcher, safety, analyst)*
- `POST /api/vehicles` - Create vehicle *(manager only)*
- `GET /api/vehicles/:id` - Get vehicle by ID *(manager, dispatcher, safety, analyst)*
- `PUT /api/vehicles/:id` - Update vehicle *(manager, dispatcher)*
- `DELETE /api/vehicles/:id` - Delete vehicle *(manager only)*

### Drivers
- `GET /api/drivers` - Get all drivers *(manager, dispatcher, safety)*
- `POST /api/drivers` - Create driver *(manager only)*
- `GET /api/drivers/:id` - Get driver by ID *(manager, dispatcher, safety)*
- `PUT /api/drivers/:id` - Update driver *(manager, safety)*
- `DELETE /api/drivers/:id` - Delete driver *(manager only)*

### Trips
- `GET /api/trips` - Get all trips *(dispatcher, manager)*
- `POST /api/trips` - Create trip *(dispatcher, manager)*
- `GET /api/trips/:id` - Get trip by ID *(dispatcher, manager)*
- `PUT /api/trips/:id` - Update trip *(dispatcher, manager)*
- `POST /api/trips/:id/complete` - Complete trip *(dispatcher, manager)*

### Maintenance
- `GET /api/maintenance` - Get all maintenance records *(manager, dispatcher, safety)*
- `POST /api/maintenance` - Create maintenance record *(manager, safety)*
- `POST /api/maintenance/:id/complete` - Complete maintenance *(manager, safety)*

### Expenses
- `GET /api/expenses` - Get all expenses *(manager, analyst)*
- `POST /api/expenses` - Create expense *(dispatcher, manager)*
- `GET /api/expenses/:id` - Get expense by ID *(manager, analyst)*

### Analytics
- `GET /api/analytics/fleet/metrics` - Get fleet KPIs *(manager, analyst)*
- `GET /api/analytics/financial/report` - Get financial report *(manager, analyst)*
- `POST /api/analytics/export` - Export report *(manager, analyst)*

## Key Features

✅ **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Manager, Dispatcher, Safety Officer, Financial Analyst)

✅ **Vehicle Management**
- CRUD operations for vehicles
- Status tracking (Available, On Trip, In Shop)
- Capacity validation

✅ **Driver Management**
- Driver profiles with license tracking
- Compliance monitoring
- Performance metrics

✅ **Trip Management**
- Trip lifecycle (Draft → Dispatched → Completed)
- Cargo weight validation
- Vehicle/Driver assignment

✅ **Financial Tracking**
- Fuel consumption logging
- Maintenance cost tracking
- Financial analytics and ROI calculation

✅ **Real-time Status Management**
- Status synchronization across modules
- Redis caching for performance

✅ **Error Handling**
- Standardized error responses
- Custom error classes
- Validation error handling

## Documentation

- **[AUTHENTICATION.md](AUTHENTICATION.md)** - Complete authentication guide with API examples
- **[DATABASE.md](DATABASE.md)** - Database schema, migrations, and seeding guide
- **[AUTH_TESTING_GUIDE.md](AUTH_TESTING_GUIDE.md)** - Comprehensive testing guide with curl examples
- **[TASK3_CHECKLIST.md](TASK3_CHECKLIST.md)** - Task 3 implementation tracking
- **[TASK3_SUMMARY.md](TASK3_SUMMARY.md)** - Task 3 completion summary
- **[../INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md)** - Frontend-Backend integration with Axios
- **[../FRONTEND_BACKEND_INTEGRATION.md](../FRONTEND_BACKEND_INTEGRATION.md)** - Complete integration documentation

## Architecture

### Layers

1. **Controller Layer** - Handles HTTP requests/responses
2. **Service Layer** - Contains business logic
3. **Repository Layer** - Data access abstraction
4. **Middleware** - Request processing and error handling
5. **Utilities** - Helper functions and custom errors

### Error Classes

- `AppError` - Base error class
- `ValidationError` - Input validation (400)
- `AuthenticationError` - Auth failures (401)
- `AuthorizationError` - Permission denied (403)
- `NotFoundError` - Resource not found (404)
- `ConflictError` - Data conflicts (409)

## Security

- Helmet for HTTP headers security
- CORS enabled for frontend integration
- JWT token-based authentication
- Password hashing with bcryptjs
- Input validation with express-validator

## Dependencies

- **express** - Web framework
- **pg** - PostgreSQL client with connection pooling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation & verification
- **cors** - Cross-origin resource sharing
- **helmet** - HTTP headers security
- **express-validator** - Input validation
- **redis** - Caching & status management
- **uuid** - Unique ID generation

## Development

```bash
# Install dev dependencies
npm install --save-dev eslint nodemon

# Run with auto-reload
npm run dev

# Lint code
npm run lint
```

## Next Steps

1. Set up PostgreSQL database schema (Task 2)
2. Implement authentication system (Task 3)
3. Build vehicle management module (Task 4)
4. Implement driver management (Task 5)
5. Create trip dispatcher system (Task 6)
6. Add maintenance management (Task 7)
7. Implement financial tracking (Task 8)
8. Add analytics & reporting (Task 10)

## License

ISC

## Support

For issues or questions, contact the FleetFlow development team.
