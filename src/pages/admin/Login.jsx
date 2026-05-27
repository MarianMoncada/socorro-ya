import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../lib/useAdmin'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login } = useAdmin()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <span className="text-4xl">🚨</span>
          <h1 className="text-2xl font-bold text-white mt-2">SocorroYA</h1>
          <p className="text-gray-400 text-sm mt-1">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@socorroya.com"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5
                         text-white placeholder-gray-500 text-sm focus:outline-none
                         focus:border-red-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5
                         text-white placeholder-gray-500 text-sm focus:outline-none
                         focus:border-red-500 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando || !email || !password}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white
                       font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? 'Entrando...' : 'Entrar al panel'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          Solo para administradores autorizados
        </p>
      </div>
    </div>
  )
}
