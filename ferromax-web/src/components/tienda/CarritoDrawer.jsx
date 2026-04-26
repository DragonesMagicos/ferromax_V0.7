import { useEffect } from 'react'

function formatPesos(n) {
  return Number(n ?? 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export default function CarritoDrawer({ items, onCerrar, onCambiarCantidad, onEliminar, onPagar, pagando }) {
  const total = items.reduce((acc, i) => acc + i.subtotal, 0)

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCerrar])

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onCerrar}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Mi carrito</h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-3 py-16">
              <span className="text-5xl">🛒</span>
              <p>Tu carrito está vacío</p>
            </div>
          ) : items.map((item) => (
            <div key={item.producto.id} className="flex items-center gap-3 py-3">
              {/* Imagen mini */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {item.producto.imagenUrl
                  ? <img src={item.producto.imagenUrl} alt={item.producto.nombre} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.producto.nombre}</p>
                <p className="text-xs text-gray-500">{formatPesos(item.producto.precio)} c/u</p>
              </div>

              {/* Controles */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onCambiarCantidad(item.producto.id, item.cantidad - 1)}
                  className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center leading-none"
                >−</button>
                <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.cantidad}</span>
                <button
                  onClick={() => onCambiarCantidad(item.producto.id, item.cantidad + 1)}
                  className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center leading-none"
                >+</button>
              </div>

              {/* Subtotal + eliminar */}
              <div className="text-right shrink-0 ml-1">
                <p className="text-sm font-semibold text-gray-800">{formatPesos(item.subtotal)}</p>
                <button
                  onClick={() => onEliminar(item.producto.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  quitar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-xl font-bold text-gray-900">{formatPesos(total)}</span>
            </div>
            <button
              onClick={onPagar}
              disabled={pagando}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-colors disabled:opacity-60"
            >
              {pagando
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    Procesando…
                  </span>
                : 'Ir a pagar →'
              }
            </button>
          </div>
        )}
      </div>
    </>
  )
}
