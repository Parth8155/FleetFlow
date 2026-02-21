import { useState } from 'react'
import { useAuthStore } from '../store'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('manager')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      login(
        { name: email.split('@')[0], email, role },
        'mock-token-' + Date.now()
      )
      setLoading(false)
    }, 1000)
  }

  const handleForgotPassword = () => {
    alert('Password reset link would be sent to: ' + email)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">FleetFlow</h1>
          <p className="text-gray-600">Fleet & Logistics Management System</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field"
            >
              <option value="manager">Fleet Manager</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="safety">Safety Officer</option>
              <option value="analyst">Financial Analyst</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3 text-lg font-semibold"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={handleForgotPassword}
          className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Forgot Password?
        </button>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo Credentials:</p>
          <p className="text-xs mt-2">Use any email with password</p>
        </div>
      </div>
    </div>
  )
}

export default Login
