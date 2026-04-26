function formatPesos(n) {
  return Number(n ?? 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

const PLACEHOLDER = (
  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 text-5xl select-none">
    📦
  </div>
)

export default function ProductoCard({ producto, onAgregar }) {
  const sinStock = producto.stockActual === 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Imagen */}
      <div className="h-44 overflow-hidden bg-gray-50 relative">
        {producto.imagenUrl
          ? <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover" />
          : PLACEHOLDER
        }
        {/* Badge stock */}
        <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
          sinStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {sinStock ? 'Sin stock' : 'Disponible'}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {producto.nombreCategoria && (
          <span className="text-xs text-violet-600 font-medium uppercase tracking-wide">
            {producto.nombreCategoria}
          </span>
        )}
        <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">{producto.nombre}</p>
        <p className="text-xl font-bold text-gray-900 mt-auto">{formatPesos(producto.precio)}</p>

        <button
          onClick={() => onAgregar(producto)}
          disabled={sinStock}
          className="w-full py-2 rounded-lg text-sm font-medium transition-colors bg-violet-600 hover:bg-violet-700 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {sinStock ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  )
}
