import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',         label: 'Inicio',        icono: '🏠' },
  { to: '/pos',      label: 'POS',           icono: '🛒' },
  { to: '/productos',label: 'Productos',     icono: '📦' },
  { to: '/ventas',   label: 'Ventas',        icono: '💳' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-100">
        <span className="text-xl font-bold text-gray-800">🔧 Ferromax</span>
        <p className="text-xs text-gray-400 mt-0.5">Sistema ERP</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icono }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <span>{icono}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">v1.0.0</p>
      </div>
    </aside>
  )
}
