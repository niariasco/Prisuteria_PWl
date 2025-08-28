import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'orden';

class OrderService {
  // Obtener todas las órdenes
  getAll() {
    return axios.get(BASE_URL);
  }

  // Obtener orden por ID
  async getById(ordenId) {
    try {
      const response = await axios.get(`${BASE_URL}/${ordenId}`);
      
      // Verificar si la respuesta tiene la estructura esperada
      if (response.data) {
        console.log('Respuesta del backend para orden:', response.data);
        return response;
      } else {
        throw new Error('Respuesta vacía del servidor');
      }
    } catch (error) {
      console.error('Error al obtener orden por ID:', error);
      
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
        console.error('Estado HTTP:', error.response.status);
        
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

  // Crear nueva orden
  async crearOrden(datosOrden) {
    try {
      console.log('Enviando datos al backend:', datosOrden);
      
      const response = await axios.post(`${BASE_URL}`, datosOrden, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('Respuesta del backend:', response.data);

      // Extraer el ID de la orden de la respuesta del backend
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
    // Asegurar que los productos tengan la estructura correcta
    const productos = (pedidoData.productos || []).map(p => ({
      id: p.productosId || p.id || p.productoId,
      cantidad: Number(p.cantidad) || 0,
      precio: Number(p.precioUnitario || p.precio) || 0,
      nombre: p.nombre || 'Producto sin nombre'
    })).filter(p => p.id && p.cantidad > 0 && !isNaN(p.precio));

    console.log('Productos transformados:', productos);

    const datosTransformados = {
      usuario_id: pedidoData.usuarioDetalle?.usuarioId || pedidoData.usuarioId || 1,
      productos: productos,
      direccion_envio: pedidoData.direccionEnvio || 'No especificada',
      metodo_pago: metodoPago === 'efectivo' ? 'Efectivo' : 'Tarjeta',
      subtotal: Number(pedidoData.subtotalSinImpuestos || pedidoData.subtotal) || 0,
      impuestos: Number(pedidoData.ivaTotal || pedidoData.impuestos) || 0,
      total: Number(pedidoData.total) || 0,
      estado: 'Pagado', // Cambiar a 'Pagado' cuando se procesa el pago
      moneda: pedidoData.moneda || 'CRC',
      ...datosAdicionales
    };

    console.log('Datos finales transformados:', datosTransformados);
    return datosTransformados;
  }

  // Procesar la respuesta de obtener orden para asegurar compatibilidad
  procesarRespuestaOrden(respuesta) {
    if (!respuesta || !respuesta.data) {
      return null;
    }

    const datos = respuesta.data;
    
    // Si viene en el formato antiguo (con pedido y productos separados)
    if (datos.pedido && datos.productos) {
      return {
        ...datos.pedido,
        productos: datos.productos,
        personalizados: datos.personalizados || []
      };
    }
    
    // Si viene en el formato nuevo (directo)
    return datos;
  }
}

export default new OrderService();