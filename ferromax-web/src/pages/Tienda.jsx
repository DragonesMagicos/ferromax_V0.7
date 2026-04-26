import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProductoCard from '../components/tienda/ProductoCard'
import CarritoDrawer from '../components/tienda/CarritoDrawer'
import productoService from '../services/productoService'
import pedidoService from '../services/pedidoService'
import toast from 'react-hot-toast'

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function TiendaPage() {
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [productos, setProductos]             = useState([])
  const [cargando, setCargando]               = useState(true)
  const [busqueda, setBusqueda]               = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [carrito, setCarrito]                 = useState([])
  const [drawerAbierto, setDrawerAbierto]     = useState(false)
  const [pagando, setPagando]                 = useState(false)

  useEffect(() => {
    productoService.listarPublico()
      .then(setProductos)
      .catch(() => toast.error('No se pudieron cargar los productos'))
      .finally(() => setCargando(false))
  }, [])

  // Categorías únicas derivadas de los productos
  const categorias = useMemo(() => {
    const set = new Set(productos.map((p) => p.nombreCategoria).filter(Boolean))
    return ['Todos', ...Array.from(set).sort()]
  }, [productos])

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      if (categoriaActiva !== 'Todos' && p.nombreCategoria !== categoriaActiva) return false
      if (!busqueda) return true
      return p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    })
  }, [productos, categoriaActiva, busqueda])

  // ── Carrito ──────────────────────────────────────────
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
    toast.success(`${producto.nombre} agregado`, { duration: 1500, position: 'bottom-right' })
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

  const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0)

  // ── Pagar ─────────────────────────────────────────────
  const handlePagar = async () => {
    if (!usuario) {
      setDrawerAbierto(false)
      navigate('/login')
      return
    }
    setPagando(true)
    try {
      await pedidoService.crear(carrito)
      setCarrito([])
      setDrawerAbierto(false)
      navigate('/tienda/confirmacion')
    } catch (err) {
      const msg = err.response?.data?.mensaje ?? 'Error al procesar el pedido'
      toast.error(msg)
    } finally {
      setPagando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header fijo ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link to="/tienda" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold text-gray-800">🔧 Ferromax</span>
          </Link>

          {/* Buscador */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">🔍</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar productos…"
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
            />
          </div>

          {/* Carrito */}
          <button
            onClick={() => setDrawerAbierto(true)}
            className="relative flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-violet-400 hover:text-violet-700 transition-colors shrink-0"
          >
            🛒 Mi carrito
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-violet-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center tabular-nums">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* Ingresar / usuario */}
          {usuario ? (
            <span className="text-sm text-gray-600 shrink-0 hidden sm:block">
              Hola, <strong>{usuario.nombre?.split(' ')[0]}</strong>
            </span>
          ) : (
            <Link
              to="/login"
              className="shrink-0 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Ingresar
            </Link>
          )}
        </div>
      </header>

      {/* ── Contenido ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Filtros por categoría */}
        {!cargando && categorias.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  categoriaActiva === cat
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-violet-400 hover:text-violet-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Contador de resultados */}
        {!cargando && (
          <p className="text-sm text-gray-500">
            {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
            {categoriaActiva !== 'Todos' && ` en "${categoriaActiva}"`}
            {busqueda && ` para "${busqueda}"`}
          </p>
        )}

        {/* Grilla */}
        {cargando ? <Spinner /> : (
          productosFiltrados.length === 0 ? (
            <div className="text-center py-24 text-gray-400 space-y-2">
              <div className="text-5xl">🔍</div>
              <p className="font-medium">No se encontraron productos</p>
              <button
                onClick={() => { setBusqueda(''); setCategoriaActiva('Todos') }}
                className="text-sm text-violet-600 hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {productosFiltrados.map((p) => (
                <ProductoCard
                  key={p.id}
                  producto={p}
                  onAgregar={agregarAlCarrito}
                />
              ))}
            </div>
          )
        )}
      </main>

      {/* ── Drawer carrito ── */}
      {drawerAbierto && (
        <CarritoDrawer
          items={carrito}
          onCerrar={() => setDrawerAbierto(false)}
          onCambiarCantidad={cambiarCantidad}
          onEliminar={eliminarItem}
          onPagar={handlePagar}
          pagando={pagando}
        />
      )}
    </div>
  )
}
