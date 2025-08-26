// src/services/ProductosPService.js
import axios from 'axios';

// Base real del recurso de personalizados
const BASE_URL = import.meta.env.VITE_BASE_URL + 'ProductoP';
// Quitar barra final si la hubiera
const API_URL = BASE_URL.replace(/\/+$/, '');

class ProductosPService {
  calcularPrecioTotal(productoBaseId, opciones) {
    return axios.post(
      `${API_URL}/calcularPrecioTotal`,
      {
        productoBaseId: Number(productoBaseId),
        opciones, // [{ criterioId, opcionId }]
      },
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(r => r.data)
    .catch(err => {
      console.error('Error calculando precio:', err);
      throw err;
    });
  }

  crearProductoPersonalizado(usuarioId, productoBaseId, opciones) {
    return axios.post(
      `${API_URL}`,
      { usuarioId: Number(usuarioId), productoBaseId: Number(productoBaseId), opciones },
      { headers: { 'Content-Type': 'application/json' } }
    ).then(r => r.data);
  }

  getProductosPersonalizados() {
    return axios.get(API_URL).then(r => r.data);
  }

  getProductoPersonalizadoById(id) {
    return axios.get(`${API_URL}/${id}`).then(r => r.data);
  }

  getProductosPersonalizadosByUsuario(usuarioId) {
    return axios.get(`${API_URL}/usuario/${usuarioId}`).then(r => r.data);
  }

  calcularPrecioTotalGET(productoBaseId, opciones) {
    const qs = encodeURIComponent(JSON.stringify(opciones));
    return axios.get(`${API_URL}/calcularPrecioTotal?productoBaseId=${productoBaseId}&opciones=${qs}`)
      .then(r => r.data);
  }

updatePrecio(data) {
  return axios.put(`${API_URL}/updatePrecio`, data);
}


getlistado(id) {
    return axios.get(`${API_URL}/${id}`);
  }
  getlistados() {
    return axios.get(`${API_URL}/getlistados`);
  }
}

export default new ProductosPService();
