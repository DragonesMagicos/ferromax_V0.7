import { useState } from 'react'
import dashboardService from '../../services/dashboardService'
import toast from 'react-hot-toast'

export default function AlertaStockPanel({ alertas: inicial = [] }) {
  const [alertas, setAlertas] = useState(inicial)

  const marcarLeida = async (id) => {
    try {
      await dashboardService.marcarAlertaLeida(id)
      setAlertas((prev) => prev.filter((a) => a.id !== id))
      toast.success('Alerta marcada como leída')
    } catch {
      toast.error('No se pudo marcar la alerta')
    }
  }

  if (alertas.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4 text-center">
        ✅ Sin alertas de stock pendientes
      </p>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {alertas.map((a) => (
        <li
          key={a.id}
          className={`flex items-center justify-between py-3 px-2 rounded-lg ${
            a.stockActual === 0 ? 'bg-red-50' : ''
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-gray-800">{a.nombreProducto}</span>
            <span className="text-xs text-gray-500">
              Stock: <strong>{a.stockActual}</strong> / mínimo: {a.stockMinimo}
              {a.stockActual === 0 && (
                <span className="ml-2 text-red-600 font-semibold">SIN STOCK</span>
              )}
            </span>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => toast('Funcionalidad de OC próximamente', { icon: '🛒' })}
              className="text-xs bg-violet-100 hover:bg-violet-200 text-violet-700 font-medium px-2 py-1 rounded-md transition-colors"
            >
              Generar OC
            </button>
            <button
              onClick={() => marcarLeida(a.id)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-2 py-1 rounded-md transition-colors"
            >
              Marcar leída
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
