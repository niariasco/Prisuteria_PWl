import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "orden";

class OrderService {
  // === Órdenes ===
  getAll() {
    return axios.get(`${BASE_URL}/index`);
  }

  getById(ordenId) {
    return axios.get(`${BASE_URL}/get/${ordenId}`);
  }

  createOrden(orden) {
    return axios.post(`${BASE_URL}/create`, orden, {
      headers: { "Content-Type": "application/json" },
    });
  }

  updateOrden(ordenId, orden) {
    return axios.put(`${BASE_URL}/update/${ordenId}`, orden, {
      headers: { "Content-Type": "application/json" },
    });
  }

  deleteOrden(ordenId) {
    return axios.delete(`${BASE_URL}/delete/${ordenId}`);
  }

  // === Pagos con tarjeta ===
  createPagoTarjeta(data) {
    // Agregar el monto del total de la orden
    const pagoData = {
      ...data,
      monto: data.monto || data.total || 0
    };
    
    return axios.post(`${BASE_URL}/createPagoTarjeta`, pagoData, {
      headers: { "Content-Type": "application/json" },
    });
  }

  getPagoTarjetaByOrdenId(ordenId) {
    return axios.get(`${BASE_URL}/getPagoTarjeta/${ordenId}`);
  }

  // === Pagos en efectivo ===
  createPagoEfectivo(data) {
    // Mapear los campos correctamente
    const pagoData = {
      orden_id: data.orden_id,
      monto_recibido: data.monto_pagado, // Cambiar nombre del campo
      monto_cambio: data.cambio
    };
    
    return axios.post(`${BASE_URL}/createPagoEfectivo`, pagoData, {
      headers: { "Content-Type": "application/json" },
    });
  }

  getPagoEfectivoByOrdenId(ordenId) {
    return axios.get(`${BASE_URL}/getPagoEfectivo/${ordenId}`);
  }
}

export default new OrderService();