import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-700">
        Bienvenido, {user?.nombre ?? user?.username}
      </h2>
      <p className="text-gray-500 mt-1">Panel principal de Ferromax ERP</p>
      <button
        onClick={logout}
        className="mt-4 text-sm text-red-600 hover:underline"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
