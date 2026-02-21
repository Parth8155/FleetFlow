import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'

function Login() {
  const [email, setEmail] = useState('manager@fleetflow.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
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
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[100px] opacity-30"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-[100px] opacity-30"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 relative z-10 border border-gray-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg shadow-indigo-500/30">
            <span className="text-3xl font-bold text-white">F</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to access your fleet dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="input-field" // Updated in index.css
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3.5 text-lg font-bold tracking-wide shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
          >
            {loading ? (
               <span className="flex items-center justify-center gap-2">
                 <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Signing in...
               </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">Use Test Credentials</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button 
              onClick={() => {setEmail('manager@fleetflow.com'); setPassword('password123')}}
              className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 transition-colors text-left"
            >
              <strong>Manager</strong>
            </button>
            <button 
              onClick={() => {setEmail('dispatcher@fleetflow.com'); setPassword('password123')}}
              className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 transition-colors text-left"
            >
              <strong>Dispatcher</strong>
            </button>
            <button 
              onClick={() => {setEmail('safety@fleetflow.com'); setPassword('password123')}}
              className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 transition-colors text-left"
            >
              <strong>Safety</strong>
            </button>
             <button 
              onClick={() => {setEmail('analyst@fleetflow.com'); setPassword('password123')}}
              className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 transition-colors text-left"
            >
              <strong>Analyst</strong>
            </button>
          </div>
          <p className="text-xs text-center text-gray-400 mt-3">Password: <span className="font-mono bg-gray-100 px-1 rounded">password123</span></p>
        </div>
      </div>
    </div>
  )
}

export default Login
