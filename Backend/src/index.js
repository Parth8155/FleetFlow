import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import config from './config/index.js'
import requestLogger from './middleware/logger.js'
import errorHandler from './middleware/errorHandler.js'

// Routes
import authRoutes from './routes/authRoutes.js'
import vehicleRoutes from './routes/vehicleRoutes.js'
import driverRoutes from './routes/driverRoutes.js'
import tripRoutes from './routes/tripRoutes.js'
import maintenanceRoutes from './routes/maintenanceRoutes.js'
import expenseRoutes from './routes/expenseRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import statusRoutes from './routes/statusRoutes.js'

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(requestLogger)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/drivers', driverRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/maintenance', maintenanceRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/status', statusRoutes)

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error Handler
app.use(errorHandler)

// Start Server
const PORT = config.port
app.listen(PORT, () => {
  console.log(`🚀 FleetFlow Backend running on port ${PORT}`)
  console.log(`Environment: ${config.nodeEnv}`)
})

export default app
