import api from './api'

const pedidoService = {
  async crear(items) {
    // TODO: descomentar cuando exista POST /pedidos en el backend
    // const payload = { items: items.map(i => ({ productoId: i.producto.id, cantidad: i.cantidad })) }
    // const { data } = await api.post('/pedidos', payload)
    // return data
    //
    // Simulación hasta que el endpoint esté disponible:
    await new Promise((r) => setTimeout(r, 600))
    return { id: Date.now(), estado: 'PENDIENTE', items }
  },

  async listarMios() {
    const { data } = await api.get('/pedidos/mis-pedidos')
    return data
  },
}

export default pedidoService
