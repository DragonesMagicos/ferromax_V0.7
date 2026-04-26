import { useEffect, useRef, useState, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import POSCarrito from '../components/pos/POSCarrito'
import productoService from '../services/productoService'
import ventaService from '../services/ventaService'
import toast from 'react-hot-toast'

const MEDIOS_PAGO = [
  { valor: 'EFECTIVO', label: 'Efectivo', icono: '💵' },
  { valor: 'DEBITO',   label: 'Débito',   icono: '💳' },
  { valor: 'CREDITO',  label: 'Crédito',  icono: '🏦' },
]

function formatPesos(n) {
  return Number(n ?? 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export default function POSPage() {
  const [carrito, setCarrito]           = useState([])
  const [busqueda, setBusqueda]         = useState('')
  const [buscando, setBuscando]         = useState(false)
  const [medioPago, setMedioPago]       = useState(null)
  const [montoRecibido, setMontoRecibido] = useState('')
  const [cobrando, setCobrando]         = useState(false)

  const inputRef = useRef(null)
  const busquedaTimer = useRef(null)

  // Foco automático al cargar
  useEffect(() => { inputRef.current?.focus() }, [])

  const enfocarBuscador = useCallback(() => {
    setBusqueda('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  // Busca por SKU exacto o por nombre (≥3 caracteres)
  const buscarProducto = useCallback(async (texto) => {
    const q = texto.trim()
    if (q.length < 3) return
    setBuscando(true)
    try {
      // Intenta SKU exacto primero
      const producto = await productoService.buscarPorSku(q).catch(() => null)
      if (producto) {
        agregarAlCarrito(producto)
        enfocarBuscador()
        return
      }
      // Si no encuentra por SKU busca en lista completa por nombre
      const todos = await productoService.listar()
      const coincidencias = todos.filter((p) =>
        p.activo && p.nombre.toLowerCase().includes(q.toLowerCase())
      )
      if (coincidencias.length === 1) {
        agregarAlCarrito(coincidencias[0])
        enfocarBuscador()
      } else if (coincidencias.length === 0) {
        toast.error('Producto no encontrado')
      } else {
        setResultados(coincidencias)
      }
    } catch {
      toast.error('Error al buscar el producto')
    } finally {
      setBuscando(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [resultados, setResultados] = useState([])

  const agregarAlCarrito = useCallback((producto) => {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.producto.id === producto.id)
      if (existe) {
        return prev.map((i) =>
          i.producto.id === producto.id
            ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * Number(i.producto.precio) }
            : i
        )
      }
      return [...prev, { producto, cantidad: 1, subtotal: Number(producto.precio) }]
    })
    setResultados([])
    toast.success(`${producto.nombre} agregado`, { duration: 1200, position: 'bottom-right' })
  }, [])

  const cambiarCantidad = useCallback((productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setCarrito((prev) => prev.filter((i) => i.producto.id !== productoId))
      return
    }
    setCarrito((prev) =>
      prev.map((i) =>
        i.producto.id === productoId
          ? { ...i, cantidad: nuevaCantidad, subtotal: nuevaCantidad * Number(i.producto.precio) }
          : i
      )
    )
  }, [])

  const eliminarItem = useCallback((productoId) => {
    setCarrito((prev) => prev.filter((i) => i.producto.id !== productoId))
  }, [])

  const total = carrito.reduce((acc, i) => acc + i.subtotal, 0)
  const vuelto = medioPago === 'EFECTIVO' && montoRecibido !== ''
    ? Number(montoRecibido) - total
    : null

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      clearTimeout(busquedaTimer.current)
      buscarProducto(busqueda)
    }
  }

  const handleChangeBusqueda = (e) => {
    const val = e.target.value
    setBusqueda(val)
    setResultados([])
    clearTimeout(busquedaTimer.current)
    if (val.trim().length >= 3) {
      busquedaTimer.current = setTimeout(() => buscarProducto(val), 400)
    }
  }

  const handleCobrar = async () => {
    if (carrito.length === 0) {
      toast.error('El carrito está vacío')
      return
    }
    if (!medioPago) {
      toast.error('Seleccioná un medio de pago')
      return
    }

    setCobrando(true)
    try {
      await ventaService.registrar({
        medioPago,
        items: carrito.map((i) => ({ productoId: i.producto.id, cantidad: i.cantidad })),
      })
      toast.success('¡Venta registrada!', { duration: 3000 })
      setCarrito([])
      setMedioPago(null)
      setMontoRecibido('')
      enfocarBuscador()
    } catch (err) {
      const msg = err.response?.data?.mensaje ?? 'Error al registrar la venta'
      toast.error(msg)
    } finally {
      setCobrando(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-lg font-semibold text-gray-800">Punto de Venta</h1>
        </header>

        <div className="flex-1 flex overflow-hidden p-6 gap-6">

          {/* ── Columna izquierda 60% ── */}
          <div className="flex-[3] flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">

            {/* Buscador */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base select-none">
                  {buscando ? '⏳' : '🔍'}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={busqueda}
                  onChange={handleChangeBusqueda}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribí el SKU o nombre del producto… (Enter o escaneo de código)"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
                  autoComplete="off"
                />
              </div>

              {/* Resultados de búsqueda múltiple */}
              {resultados.length > 1 && (
                <ul className="mt-2 border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100 shadow-sm">
                  {resultados.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => { agregarAlCarrito(p); enfocarBuscador() }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-violet-50 transition-colors text-left"
                      >
                        <div>
                          <span className="font-medium text-gray-800">{p.nombre}</span>
                          <span className="ml-2 font-mono text-xs text-gray-400">{p.sku}</span>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <span className="font-semibold text-gray-700">{formatPesos(p.precio)}</span>
                          <span className="ml-2 text-xs text-gray-400">stock: {p.stockActual}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Carrito */}
            <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4">
              <POSCarrito
                items={carrito}
                onCambiarCantidad={cambiarCantidad}
                onEliminar={eliminarItem}
              />
            </div>

            {/* Footer carrito: cantidad de items */}
            {carrito.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
                <span>{carrito.reduce((a, i) => a + i.cantidad, 0)} artículo(s)</span>
                <button onClick={() => setCarrito([])} className="text-red-400 hover:text-red-600 transition-colors">
                  Vaciar carrito
                </button>
              </div>
            )}
          </div>

          {/* ── Columna derecha 40% ── */}
          <div className="flex-[2] flex flex-col gap-4">

            {/* Total */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total a cobrar</p>
              <p className="text-5xl font-bold text-gray-900 tabular-nums">{formatPesos(total)}</p>
            </div>

            {/* Medio de pago */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Medio de pago</p>
              <div className="grid grid-cols-3 gap-2">
                {MEDIOS_PAGO.map((mp) => (
                  <button
                    key={mp.valor}
                    onClick={() => { setMedioPago(mp.valor); setMontoRecibido('') }}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      medioPago === mp.valor
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{mp.icono}</span>
                    {mp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Monto recibido / vuelto (solo efectivo) */}
            {medioPago === 'EFECTIVO' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Monto recibido (opcional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  />
                </div>
                {vuelto !== null && (
                  <div className={`rounded-lg px-4 py-3 flex items-center justify-between ${vuelto >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <span className="text-sm font-medium text-gray-700">Vuelto</span>
                    <span className={`text-lg font-bold ${vuelto >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatPesos(vuelto)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Botón cobrar */}
            <button
              onClick={handleCobrar}
              disabled={cobrando || carrito.length === 0}
              className="w-full py-5 rounded-xl text-white text-xl font-bold tracking-wide transition-all bg-green-600 hover:bg-green-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200"
            >
              {cobrando ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Procesando…
                </span>
              ) : (
                '💰 COBRAR'
              )}
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
