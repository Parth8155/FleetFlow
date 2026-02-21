# FleetFlow Frontend

A modern, modular UI for the FleetFlow Fleet & Logistics Management System.

## Features

📊 **Dashboard** - High-level fleet overview with KPIs
- Active fleet count, maintenance alerts, utilization rate, pending cargo
- Real-time filtering by vehicle type, status, and region

🚐 **Vehicle Registry** - Asset management
- Add, edit, and delete vehicles
- Track capacity, odometer, and maintenance dates
- Status management (Available, On Trip, In Shop, Retired)

🗺️ **Trip Dispatcher** - Workflow management
- Create trips with vehicle-driver assignment
- Cargo weight validation
- Trip lifecycle (Draft → Dispatched → Completed)

🔧 **Maintenance Logs** - Preventative & reactive tracking
- Log maintenance services
- Auto-update vehicle status to "In Shop"
- Complete maintenance history

⛽ **Expenses & Fuel** - Financial tracking
- Record fuel consumption and costs
- Log maintenance expenses
- Calculate fuel efficiency and operational costs

👥 **Driver Profiles** - HR & compliance management
- License expiry tracking
- Safety score monitoring
- Trip completion statistics
- License category validation

📈 **Analytics & Reports** - Data-driven insights
- Revenue, cost, and profit analysis
- Vehicle ROI calculations
- Fuel efficiency metrics
- Export to CSV/PDF

🔐 **Authentication** - Role-based access control
- Manager, Dispatcher, Safety Officer, Financial Analyst roles

## Tech Stack

- **Frontend**: React 18 + Vite
- **State Management**: Zustand
- **API Client**: Axios with interceptors
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Language**: JavaScript (JSX)
- **Authentication**: JWT with Bearer tokens

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── VehicleRegistry.jsx
│   ├── TripDispatcher.jsx
│   ├── MaintenanceLogs.jsx
│   ├── ExpensesAndFuel.jsx
│   ├── DriverProfiles.jsx
│   └── Analytics.jsx
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── StatusBadge.jsx
│   └── Modal.jsx
├── store.js          # Zustand state management
├── App.jsx           # Main app with routing
├── main.jsx          # Entry point
└── index.css         # Tailwind CSS
```

## Quick Start

1. **Login**: Use any email and password to access the system
2. **Dashboard**: View fleet overview and key metrics
3. **Add Vehicle**: Create new vehicles in the registry
4. **Add Driver**: Register drivers with license details
5. **Create Trip**: Assign available vehicles and drivers
6. **Track Expenses**: Log fuel and maintenance costs
7. **Analyze**: View analytics and financial reports

## Default Demo Credentials

- **Email**: any email (e.g., manager@fleetflow.com)
- **Password**: any password
- **Roles**: Manager, Dispatcher, Safety Officer, Financial Analyst

## Features Breakdown

### 1. Login & Authentication
- Email/Password authentication
- Forgot password functionality
- Role-based access control

### 2. Command Center (Dashboard)
- KPI cards: Active Fleet, Maintenance Alerts, Utilization Rate, Pending Cargo
- Filter by vehicle type, status, region
- Fleet overview table

### 3. Vehicle Registry
- CRUD operations for vehicles
- Capacity tracking
- Odometer logging
- Status management

### 4. Trip Dispatcher
- Vehicle & driver selection
- Cargo weight validation (prevents overload)
- Trip lifecycle management
- Odometer tracking

### 5. Maintenance & Service
- Preventative and reactive maintenance logging
- Auto-status update to "In Shop"
- Service history tracking
- Mark vehicles as available

### 6. Expenses & Fuel
- Fuel consumption tracking (liters & cost)
- Maintenance expense logging
- Fuel efficiency calculation (km/L)
- Operational cost aggregation

### 7. Driver Performance & Safety
- License expiry tracking with alerts
- Safety score monitoring
- Trip completion statistics
- License category validation

### 8. Analytics & Reports
- Revenue vs. Operational Cost analysis
- Vehicle ROI calculation
- Fuel efficiency metrics
- Cost per KM
- CSV/PDF export capabilities

## Validation Rules

✅ **Cargo Weight Validation**: System prevents trip creation if cargo > vehicle capacity
✅ **License Expiry**: Drivers with expired licenses cannot be assigned
✅ **Status Management**: Status automatically updates during trip lifecycle
✅ **Financial Tracking**: Automated cost-per-KM calculation

## API Integration with Axios

The frontend uses Axios for all backend communication with automatic token injection and error handling.

### Configuration

Set your backend API URL in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Authentication Flow

1. User logs in → JWT token stored in localStorage
2. Axios request interceptor adds `Authorization: Bearer <token>` header automatically
3. Response interceptor handles errors and 401 redirects to login
4. All API calls include proper error handling and data normalization

### Using the API Client

```javascript
// In any component
import api from '../services/api'

// Authentication
await api.auth.login(email, password)
await api.auth.register(email, password, name, role)
await api.auth.logout()

// Vehicles
const vehicles = await api.vehicles.getAll()
const vehicle = await api.vehicles.getById(id)
await api.vehicles.create(vehicleData)
await api.vehicles.update(id, vehicleData)
await api.vehicles.delete(id)

// Drivers
const drivers = await api.drivers.getAll()
await api.drivers.create(driverData)

// Trips
const trips = await api.trips.getAll()
await api.trips.create(tripData)
await api.trips.complete(tripId)

// Maintenance, Expenses, Analytics
// See INTEGRATION_GUIDE.md for complete endpoint reference
```

### Error Handling

All API errors are normalized to:
```javascript
{
  status: 400,           // HTTP status code
  code: 'VALIDATION_ERROR',
  message: 'User-friendly error message',
  details: { field: 'error details' }
}
```

### Test Credentials

After running backend seeding:
- **Manager**: manager@fleetflow.com / password123
- **Dispatcher**: dispatcher@fleetflow.com / password123
- **Safety Officer**: safety@fleetflow.com / password123
- **Analyst**: analyst@fleetflow.com / password123

See [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md) for complete API documentation and [FRONTEND_BACKEND_INTEGRATION.md](../FRONTEND_BACKEND_INTEGRATION.md) for integration details.

## Component Reusability

- **StatusBadge**: Displays status with color coding
- **Modal**: Reusable modal for forms
- **Sidebar**: Navigation component with responsive design
- **Navbar**: Top navigation with user info and logout

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC

## Support

For issues or feature requests, please contact the development team.
