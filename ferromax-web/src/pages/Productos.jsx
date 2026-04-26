import { useEffect, useState, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import productoService from '../services/productoService'
import toast from 'react-hot-toast'

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

const FORM_VACIO = {
  sku: '', nombre: '', descripcion: '', precio: '', precioCompra: '',
  stockMinimo: '', imagenUrl: '', categoriaId: '', proveedorId: '',
}

function ModalProducto({ producto, onGuardar, onCerrar }) {
  const esEdicion = Boolean(producto?.id)
  const [form, setForm] = useState(() => {
    if (esEdicion) {
      return {
        nombre: producto.nombre ?? '',
        precio: producto.precio ?? '',
        stockMinimo: producto.stockMinimo ?? '',
        imagenUrl: producto.imagenUrl ?? '',
      }
    }
    return { ...FORM_VACIO }
  })
  const [guardando, setGuardando] = useState(false)

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      if (esEdicion) {
        const payload = {
          nombre: form.nombre || undefined,
          precio: form.precio !== '' ? Number(form.precio) : undefined,
          stockMinimo: form.stockMinimo !== '' ? Number(form.stockMinimo) : undefined,
          imagenUrl: form.imagenUrl || undefined,
        }
        const actualizado = await productoService.actualizar(producto.id, payload)
        onGuardar(actualizado, true)
      } else {
        const payload = {
          sku: form.sku,
          nombre: form.nombre,
          descripcion: form.descripcion || undefined,
          precio: Number(form.precio),
          precioCompra: form.precioCompra !== '' ? Number(form.precioCompra) : undefined,
          stockMinimo: form.stockMinimo !== '' ? Number(form.stockMinimo) : undefined,
          imagenUrl: form.imagenUrl || undefined,
          categoriaId: form.categoriaId !== '' ? Number(form.categoriaId) : undefined,
          proveedorId: form.proveedorId !== '' ? Number(form.proveedorId) : undefined,
        }
        const creado = await productoService.crear(payload)
        onGuardar(creado, false)
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje ?? 'Error al guardar el producto'
      toast.error(msg)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            {esEdicion ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {!esEdicion && (
            <div className="grid grid-cols-2 gap-4">
              <Campo label="SKU *" value={form.sku} onChange={set('sku')} required placeholder="ej. TOR-M6" />
              <Campo label="Categoría ID" value={form.categoriaId} onChange={set('categoriaId')} placeholder="ej. 1" type="number" />
            </div>
          )}

          <Campo label="Nombre *" value={form.nombre} onChange={set('nombre')} required placeholder="Nombre del producto" />

          {!esEdicion && (
            <Campo label="Descripción" value={form.descripcion} onChange={set('descripcion')} placeholder="Descripción opcional" />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Precio venta (ARS) *" value={form.precio} onChange={set('precio')} required type="number" min="0" step="0.01" placeholder="0.00" />
            {!esEdicion
              ? <Campo label="Precio compra (ARS)" value={form.precioCompra} onChange={set('precioCompra')} type="number" min="0" step="0.01" placeholder="0.00" />
              : <Campo label="Stock mínimo" value={form.stockMinimo} onChange={set('stockMinimo')} type="number" min="0" placeholder="ej. 5" />
            }
          </div>

          {!esEdicion && (
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Stock mínimo" value={form.stockMinimo} onChange={set('stockMinimo')} type="number" min="0" placeholder="ej. 5" />
              <Campo label="Proveedor ID" value={form.proveedorId} onChange={set('proveedorId')} type="number" placeholder="ej. 1" />
            </div>
          )}

          <Campo label="URL imagen" value={form.imagenUrl} onChange={set('imagenUrl')} placeholder="https://..." />

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCerrar}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={guardando}
              className="px-5 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-60">
              {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Campo({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        {...props}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
      />
    </div>
  )
}

function ModalConfirmar({ producto, onConfirmar, onCerrar }) {
  const [loading, setLoading] = useState(false)

  const handleConfirmar = async () => {
    setLoading(true)
    try {
      await onConfirmar()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">⚠️</span>
          <h2 className="text-base font-semibold text-gray-800">Desactivar producto</h2>
        </div>
        <p className="text-sm text-gray-600 mb-5">
          ¿Desactivar <strong>{producto.nombre}</strong>? El producto no aparecerá en el catálogo ni en el POS, pero no se elimina.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCerrar} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
          <button onClick={handleConfirmar} disabled={loading}
            className="px-5 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-60">
            {loading ? 'Desactivando…' : 'Desactivar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductosPage() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [soloActivos, setSoloActivos] = useState(true)
  const [modalCrear, setModalCrear] = useState(false)
  const [productoEditar, setProductoEditar] = useState(null)
  const [productoDesactivar, setProductoDesactivar] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const data = await productoService.listar()
      setProductos(data)
    } catch {
      toast.error('No se pudieron cargar los productos')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const productosFiltrados = productos.filter((p) => {
    if (soloActivos && !p.activo) return false
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.nombreCategoria ?? '').toLowerCase().includes(q)
  })

  const handleGuardar = (producto, esEdicion) => {
    if (esEdicion) {
      setProductos((prev) => prev.map((p) => p.id === producto.id ? producto : p))
      toast.success('Producto actualizado')
    } else {
      setProductos((prev) => [producto, ...prev])
      toast.success('Producto creado')
    }
    setModalCrear(false)
    setProductoEditar(null)
  }

  const handleDesactivar = async () => {
    await productoService.desactivar(productoDesactivar.id)
    setProductos((prev) => prev.map((p) => p.id === productoDesactivar.id ? { ...p, activo: false } : p))
    toast.success('Producto desactivado')
    setProductoDesactivar(null)
  }

  const stockBadge = (p) => {
    if (p.stockActual === 0) return <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Sin stock</span>
    if (p.stockActual <= p.stockMinimo) return <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">Crítico</span>
    return <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">OK</span>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">Productos</h1>
          <button
            onClick={() => setModalCrear(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <span>+</span> Nuevo producto
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o categoría…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={soloActivos}
                onChange={(e) => setSoloActivos(e.target.checked)}
                className="accent-violet-600"
              />
              Solo activos
            </label>
            <span className="text-sm text-gray-400 self-center">
              {productosFiltrados.length} resultado{productosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {cargando ? <Spinner /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 font-medium">SKU</th>
                      <th className="px-4 py-3 font-medium">Nombre</th>
                      <th className="px-4 py-3 font-medium">Categoría</th>
                      <th className="px-4 py-3 font-medium text-right">Precio</th>
                      <th className="px-4 py-3 font-medium text-center">Stock</th>
                      <th className="px-4 py-3 font-medium text-center">Estado</th>
                      <th className="px-4 py-3 font-medium text-center">Stock</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                          No se encontraron productos
                        </td>
                      </tr>
                    ) : productosFiltrados.map((p) => (
                      <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${!p.activo ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          <div>{p.nombre}</div>
                          {p.nombreProveedor && <div className="text-xs text-gray-400 font-normal">{p.nombreProveedor}</div>}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{p.nombreCategoria ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatPesos(p.precio)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-gray-700">{p.stockActual}</span>
                          <span className="text-gray-400 text-xs"> / {p.stockMinimo} mín</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.activo
                            ? <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Activo</span>
                            : <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Inactivo</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-center">{stockBadge(p)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setProductoEditar(p)}
                              className="text-xs text-violet-700 hover:text-violet-900 font-medium px-2 py-1 rounded hover:bg-violet-50 transition-colors"
                            >
                              Editar
                            </button>
                            {p.activo && (
                              <button
                                onClick={() => setProductoDesactivar(p)}
                                className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                              >
                                Desactivar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {(modalCrear || productoEditar) && (
        <ModalProducto
          producto={productoEditar}
          onGuardar={handleGuardar}
          onCerrar={() => { setModalCrear(false); setProductoEditar(null) }}
        />
      )}

      {productoDesactivar && (
        <ModalConfirmar
          producto={productoDesactivar}
          onConfirmar={handleDesactivar}
          onCerrar={() => setProductoDesactivar(null)}
        />
      )}
    </div>
  )
}
