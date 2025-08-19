import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'orden';

class OrderService {
  // Obtener todas las órdenes
  getAll() {
    return axios.get(BASE_URL);
  }

  // Obtener orden por ID
  getById(ordenId) {
    return axios.get(`${BASE_URL}/${ordenId}`);
  }

   // Crear nueva orden
async crearOrden(datosOrden) {
  try {
    const response = await axios.post(`${BASE_URL}`, datosOrden, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Retorna el ID de la orden creado
    const ordenId = response.data?.orden_id || response.data?.id;
    if (!ordenId) throw new Error('No se recibió ID de orden del backend.');

    return ordenId;
  } catch (error) {
    console.error('Error al crear la orden:', error);
    throw error;
  }
}


  // Finalizar pago y redirigir
  finalizarPago(ordenId) {
    if (!ordenId) throw new Error("No se recibió ID de orden");
    window.location.href = `${BASE_URL}/${ordenId}`;
  }


  // Redirigir al detalle de la orden
  redirigirDetalle(ordenId) {
    window.location.href = `${BASE_URL}/${ordenId}`;
  }

  // Transformar datos del frontend al formato backend
  transformarDatosPago(pedidoData, metodoPago, datosAdicionales = {}) {
    return {
      usuario_id: pedidoData.usuarioDetalle?.usuarioId || pedidoData.usuarioId || 1,
      productos: pedidoData.productos.map(p => ({
        id: p.id || p.productoId,
        cantidad: p.cantidad,
        precio: p.precioUnitario || p.precio || 0,
        nombre: p.nombre
      })),
      direccion_envio: pedidoData.direccionEnvio,
      metodo_pago: metodoPago,
      subtotal: pedidoData.subtotalSinImpuestos || 0,
      impuestos: pedidoData.ivaTotal || 0,
      total: pedidoData.total || 0,
      estado: 'Pendiente',
      moneda: pedidoData.moneda || 'CRC',
      ...datosAdicionales
    };
  }

}

export default new OrderService();
