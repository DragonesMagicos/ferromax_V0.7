import api from './api'

const ventaService = {
  async registrar(ventaRequest) {
    const { data } = await api.post('/ventas', ventaRequest)
    return data
  },

  async listar(desde, hasta) {
    const params = {}
    if (desde) params.desde = desde
    if (hasta) params.hasta = hasta
    const { data } = await api.get('/ventas', { params })
    return data
  },

  async buscarPorId(id) {
    const { data } = await api.get(`/ventas/${id}`)
    return data
  },

  async anular(id) {
    const { data } = await api.put(`/ventas/${id}/anular`)
    return data
  },
}

export default ventaService
