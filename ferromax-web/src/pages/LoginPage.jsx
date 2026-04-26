import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, usuario, cargando } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Si ya hay sesión activa, redirigir sin mostrar el formulario
  useEffect(() => {
    if (!cargando && usuario) {
      navigate(usuario.rol === 'CLIENTE' ? '/tienda' : '/', { replace: true })
    }
  }, [usuario, cargando, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const ok = await login(email, password)

    if (ok) {
      // El usuario recién seteado se lee desde authService porque el estado
      // aún no se actualizó en este render
      const guardado = JSON.parse(localStorage.getItem('usuario') || '{}')
      navigate(guardado.rol === 'CLIENTE' ? '/tienda' : '/', { replace: true })
    } else {
      setError('Credenciales incorrectas. Verificá tu email y contraseña.')
      setLoading(false)
    }
  }

  // Mientras verifica sesión existente no renderizar nada para evitar flash
  if (cargando) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl">🔧</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Ferromax</h1>
          <p className="text-sm text-gray-500 mt-1">Sistema de gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jose@ferromax.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                         transition-colors"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                         transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60
                       text-white font-semibold rounded-lg py-2.5 text-sm
                       transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
