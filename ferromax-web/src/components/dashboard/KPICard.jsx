const colores = {
  verde: 'bg-green-50 border-green-200 text-green-700',
  rojo:  'bg-red-50  border-red-200  text-red-700',
  azul:  'bg-blue-50 border-blue-200 text-blue-700',
  gris:  'bg-gray-50 border-gray-200 text-gray-700',
}

const iconos = {
  verde: '💰',
  rojo:  '⚠️',
  azul:  '📦',
  gris:  '🏦',
}

export default function KPICard({ titulo, valor, subtitulo, color = 'gris' }) {
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-1 ${colores[color]}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium opacity-80">{titulo}</span>
        <span className="text-xl">{iconos[color]}</span>
      </div>
      <p className="text-3xl font-bold tracking-tight">{valor}</p>
      {subtitulo && <p className="text-xs opacity-70">{subtitulo}</p>}
    </div>
  )
}
