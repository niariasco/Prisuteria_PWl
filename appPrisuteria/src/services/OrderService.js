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
    console.log('Enviando datos al backend:', datosOrden);
    
    const response = await axios.post(`${BASE_URL}`, datosOrden, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Respuesta del backend:', response.data);

    // Extraer el ID de la orden de la respuesta del backend
    // El backend devuelve: {success: true, message: "...", data: {orden_id: X, ordenesId: X, id: X}}
    const responseData = response.data;
    
    if (!responseData.success) {
      throw new Error(responseData.message || 'Error al crear la orden en el backend');
    }

    // Intentar obtener el ID de diferentes formas que el backend podría devolverlo
    const ordenId = responseData.data?.orden_id || 
                    responseData.data?.ordenesId || 
                    responseData.data?.id || 
                    responseData.orden_id || 
                    responseData.ordenesId || 
                    responseData.id;

    if (!ordenId) {
      console.error('Estructura de respuesta inesperada:', responseData);
      throw new Error('No se recibió ID de orden del backend. Estructura de respuesta: ' + JSON.stringify(responseData));
    }

    // Devolver el ID de la orden
    return ordenId;
  } catch (error) {
    console.error('Error al crear la orden:', error);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
      console.error('Estado HTTP:', error.response.status);
      console.error('Headers:', error.response.headers);
      
      // Proporcionar un mensaje de error más detallado
      const serverMessage = error.response.data?.message || error.response.data?.error || 'Error del servidor';
      throw new Error(`Error del servidor (${error.response.status}): ${serverMessage}`);
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor:', error.request);
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión de red.');
    } else {
      throw error;
    }
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
