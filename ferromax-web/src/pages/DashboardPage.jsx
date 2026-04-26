import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import KPICard from '../components/dashboard/KPICard'
import VentasBarChart from '../components/dashboard/VentasBarChart'
import AlertaStockPanel from '../components/dashboard/AlertaStockPanel'
import dashboardService from '../services/dashboardService'

const ESTADO_BADGE = {
  COMPLETADA: 'bg-green-100 text-green-700',
  PENDIENTE:  'bg-yellow-100 text-yellow-700',
  ANULADA:    'bg-red-100 text-red-700',
}

function formatPesos(n) {
  return Number(n ?? 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function DashboardPage() {
  const { usuario, logout } = useAuth()
  const [resumen, setResumen] = useState(null)
  const [ventasSemana, setVentasSemana] = useState([])
  const [transacciones, setTransacciones] = useState([])
  const [alertas, setAlertas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      dashboardService.resumen(),
      dashboardService.ventasSemana(),
      dashboardService.transacciones(),
      dashboardService.alertas(),
    ])
      .then(([r, vs, tr, al]) => {
        setResumen(r)
        setVentasSemana(vs)
        setTransacciones(tr)
        setAlertas(al)
      })
      .catch(() => setError('No se pudieron cargar los datos del dashboard.'))
      .finally(() => setCargando(false))
  }, [])

  const saludo = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        {/* Barra superior */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            {saludo()}, {usuario?.nombre} 👋
          </h1>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </header>

        <div className="p-8 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* KPI Cards */}
          {cargando ? <Spinner /> : (
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                titulo="Ventas del día"
                valor={formatPesos(resumen?.ventasHoy)}
                subtitulo={`${resumen?.cantidadVentasHoy ?? 0} operaciones`}
                color="verde"
              />
              <KPICard
                titulo="Stock crítico"
                valor={resumen?.productosStockCritico ?? 0}
                subtitulo="productos bajo mínimo"
                color="rojo"
              />
              <KPICard
                titulo="Pedidos online"
                valor={resumen?.pedidosPendientes ?? 0}
                subtitulo="pendientes / confirmados"
                color="azul"
              />
              <KPICard
                titulo="Caja (efectivo)"
                valor={formatPesos(resumen?.saldoCaja)}
                subtitulo="ventas en efectivo hoy"
                color="gris"
              />
            </section>
          )}

          {/* Gráfico + Alertas */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Ventas últimos 7 días
              </h2>
              {cargando ? <Spinner /> : <VentasBarChart datos={ventasSemana} />}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Alertas de stock
                {alertas.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {alertas.length}
                  </span>
                )}
              </h2>
              {cargando ? <Spinner /> : <AlertaStockPanel alertas={alertas} />}
            </div>
          </section>

          {/* Últimas transacciones */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Últimas transacciones
            </h2>
            {cargando ? <Spinner /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                      <th className="pb-2 font-medium">Hora</th>
                      <th className="pb-2 font-medium">Cajero</th>
                      <th className="pb-2 font-medium">Medio de pago</th>
                      <th className="pb-2 font-medium text-right">Monto</th>
                      <th className="pb-2 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transacciones.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-400">
                          Sin transacciones registradas
                        </td>
                      </tr>
                    ) : transacciones.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 text-gray-600">
                          {new Date(t.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 text-gray-800 font-medium">{t.nombreCajero}</td>
                        <td className="py-2.5 text-gray-600">{t.medioPago}</td>
                        <td className="py-2.5 text-right font-semibold text-gray-800">
                          {formatPesos(t.total)}
                        </td>
                        <td className="py-2.5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ESTADO_BADGE[t.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                            {t.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
