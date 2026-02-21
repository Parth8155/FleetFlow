/**
 * API Client Service
 * Handles all communication with the FleetFlow backend using Axios
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Handle errors and 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - Token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    // Normalize error response
    const errorData = {
      status: error.response?.status || 500,
      code: error.response?.data?.error?.code || 'ERROR',
      message:
        error.response?.data?.error?.message ||
        error.message ||
        'An error occurred',
      details: error.response?.data?.error?.details || null,
    }

    return Promise.reject(errorData)
  }
)

class APIClient {
  /**
   * Make HTTP request with error handling
   */
  async request(endpoint, method = 'GET', data = null) {
    try {
      const config = { method, url: endpoint }
      if (data) {
        config.data = data
      }

      const response = await axiosInstance(config)
      // Backend returns { success, data, message }
      // Return just the data part
      return response.data.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Authentication Endpoints
   */
  auth = {
    register: async (email, password, name, role = 'dispatcher') => {
      const data = await this.request('/auth/register', 'POST', {
        email,
        password,
        name,
        role,
      })
      return data
    },

    login: async (email, password) => {
      const data = await this.request('/auth/login', 'POST', {
        email,
        password,
      })
      // Store token and user data
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    },

    logout: async () => {
      try {
        await this.request('/auth/logout', 'POST')
      } finally {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    },

    getProfile: async () => {
      return await this.request('/auth/profile', 'GET')
    },

    updateProfile: async (name, email) => {
      const data = await this.request('/auth/profile', 'PUT', {
        name,
        email,
      })
      localStorage.setItem('user', JSON.stringify(data))
      return data
    },
  }

  /**
   * Vehicle Endpoints
   */
  vehicles = {
    getAll: async () => {
      return await this.request('/vehicles', 'GET')
    },

    getById: async (id) => {
      return await this.request(`/vehicles/${id}`, 'GET')
    },

    create: async (vehicleData) => {
      return await this.request('/vehicles', 'POST', vehicleData)
    },

    update: async (id, vehicleData) => {
      return await this.request(`/vehicles/${id}`, 'PUT', vehicleData)
    },

    delete: async (id) => {
      return await this.request(`/vehicles/${id}`, 'DELETE')
    },
  }

  /**
   * Driver Endpoints
   */
  drivers = {
    getAll: async () => {
      return await this.request('/drivers', 'GET')
    },

    getById: async (id) => {
      return await this.request(`/drivers/${id}`, 'GET')
    },

    create: async (driverData) => {
      return await this.request('/drivers', 'POST', driverData)
    },

    update: async (id, driverData) => {
      return await this.request(`/drivers/${id}`, 'PUT', driverData)
    },

    delete: async (id) => {
      return await this.request(`/drivers/${id}`, 'DELETE')
    },
  }

  /**
   * Trip Endpoints
   */
  trips = {
    getAll: async () => {
      return await this.request('/trips', 'GET')
    },

    getById: async (id) => {
      return await this.request(`/trips/${id}`, 'GET')
    },

    create: async (tripData) => {
      return await this.request('/trips', 'POST', tripData)
    },

    update: async (id, tripData) => {
      return await this.request(`/trips/${id}`, 'PUT', tripData)
    },

    complete: async (id) => {
      return await this.request(`/trips/${id}/complete`, 'POST')
    },
  }

  /**
   * Maintenance Endpoints
   */
  maintenance = {
    getAll: async () => {
      return await this.request('/maintenance', 'GET')
    },

    create: async (maintenanceData) => {
      return await this.request('/maintenance', 'POST', maintenanceData)
    },

    complete: async (id) => {
      return await this.request(`/maintenance/${id}/complete`, 'POST')
    },
  }

  /**
   * Expense Endpoints
   */
  expenses = {
    getAll: async () => {
      return await this.request('/expenses', 'GET')
    },

    getById: async (id) => {
      return await this.request(`/expenses/${id}`, 'GET')
    },

    create: async (expenseData) => {
      return await this.request('/expenses', 'POST', expenseData)
    },
  }

  /**
   * Analytics Endpoints
   */
  analytics = {
    getFleetMetrics: async () => {
      return await this.request('/analytics/fleet/metrics', 'GET')
    },

    getFinancialReport: async () => {
      return await this.request('/analytics/financial/report', 'GET')
    },

    export: async (reportData) => {
      return await this.request('/analytics/export', 'POST', reportData)
    },
  }
}

export default new APIClient()
