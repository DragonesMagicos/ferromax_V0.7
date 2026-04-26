import api from './api'

const productoService = {
  async listar() {
    const { data } = await api.get('/productos')
    return data
  },

  async buscarPorSku(sku) {
    const { data } = await api.get(`/productos/sku/${sku}`)
    return data
  },

  async listarPublico() {
    const { data } = await api.get('/productos/publico')
    return data
  },

  async crear(datos) {
    const { data } = await api.post('/productos', datos)
    return data
  },

  async actualizar(id, datos) {
    const { data } = await api.put(`/productos/${id}`, datos)
    return data
  },

  async desactivar(id) {
    await api.delete(`/productos/${id}`)
  },

  async stockCritico() {
    const { data } = await api.get('/productos/stock-critico')
    return data
  },
}

export default productoService
