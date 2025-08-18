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
  
  // Obtener órdenes por usuario
  getByUserId(userId) {
    return axios.get(`${BASE_URL}/user/${userId}`);
  }
  
  // *** MÉTODO PRINCIPAL PARA FINALIZAR PAGO Y GUARDAR ORDEN ***
  // Este método asegura que la orden se guarde en la tabla 'orden'
  finalizarPago(paymentData) {
    console.log('🚀 Finalizando pago y guardando orden en base de datos...');
    console.log('📋 Datos de pago a enviar:', paymentData);
    
    // Validar datos antes de enviar
    this.validarDatosOrden(paymentData);
    
    // El endpoint /create debe guardar la orden en la tabla 'orden'
    return axios.post(`${BASE_URL}/create`, paymentData)
      .then(response => {
        console.log('✅ Orden guardada exitosamente:', response.data);
        
        // Verificar que la respuesta contiene el ID de la orden
        const ordenId = response.data?.orden_id || response.data?.id || response.data?.ordenesId;
        if (!ordenId) {
          console.warn('⚠️ No se recibió ID de orden en la respuesta');
        } else {
          console.log('🆔 ID de orden creada:', ordenId);
        }
        
        return response;
      })
      .catch(error => {
        console.error('❌ Error al guardar orden:', error);
        throw error;
      });
  }
  
  // Validar que los datos de la orden estén completos
  validarDatosOrden(orderData) {
    const errores = [];
    
    // Validaciones básicas
    if (!orderData.usuario_id) {
      errores.push('ID de usuario es requerido');
    }
    
    if (!orderData.productos || !Array.isArray(orderData.productos) || orderData.productos.length === 0) {
      errores.push('Debe incluir al menos un producto');
    }
    
    if (!orderData.direccion_envio || orderData.direccion_envio.trim() === '') {
      errores.push('Dirección de envío es requerida');
    }
    
    if (!orderData.metodo_pago) {
      errores.push('Método de pago es requerido');
    }
    
    // Validar productos
    if (orderData.productos) {
      orderData.productos.forEach((producto, index) => {
        if (!producto.id) {
          errores.push(`Producto ${index + 1}: ID es requerido`);
        }
        if (!producto.nombre || producto.nombre.trim() === '') {
          errores.push(`Producto ${index + 1}: Nombre es requerido`);
        }
        if (!producto.cantidad || producto.cantidad <= 0) {
          errores.push(`Producto ${index + 1}: Cantidad debe ser mayor a 0`);
        }
        if (!producto.precio || producto.precio <= 0) {
          errores.push(`Producto ${index + 1}: Precio debe ser mayor a 0`);
        }
      });
    }
    
    // Validar datos específicos del método de pago
    if (orderData.metodo_pago === 'Efectivo' && orderData.pago_efectivo) {
      if (!orderData.pago_efectivo.monto_pagado || orderData.pago_efectivo.monto_pagado <= 0) {
        errores.push('Monto pagado en efectivo debe ser mayor a 0');
      }
    } else if ((orderData.metodo_pago === 'Tarjeta' || orderData.metodo_pago === 'Crédito' || orderData.metodo_pago === 'Débito') && orderData.pago_tarjeta) {
      if (!orderData.pago_tarjeta.numero_tarjeta) {
        errores.push('Número de tarjeta es requerido');
      }
      if (!orderData.pago_tarjeta.nombre_titular) {
        errores.push('Nombre del titular es requerido');
      }
    }
    
    if (errores.length > 0) {
      const mensaje = 'Errores de validación:\n' + errores.join('\n');
      console.error('❌ Errores de validación:', errores);
      throw new Error(mensaje);
    }
    
    console.log('✅ Datos de orden validados correctamente');
  }
  
  // Actualizar estado de orden
  updateStatus(ordenId, estado) {
    return axios.put(`${BASE_URL}/${ordenId}/status`, { estado });
  }
  
  // Cancelar orden
  cancel(ordenId) {
    return axios.put(`${BASE_URL}/${ordenId}/cancel`);
  }
  
  // Crear nueva orden (método alternativo)
  create(orderData) {
    return this.finalizarPago(orderData);
  }
  
  // Procesar pago con efectivo
  pagoEfectivo(orderData, montoPagado) {
    const total = orderData.total || 0;
    const cambio = parseFloat(montoPagado) - parseFloat(total);
    
    const paymentData = {
      usuario_id: orderData.usuario_id,
      productos: orderData.productos || orderData.carrito,
      direccion_envio: orderData.direccion_envio,
      metodo_pago: 'Efectivo',
      pago_efectivo: {
        monto_pagado: parseFloat(montoPagado),
        cambio: Math.max(0, cambio)
      }
    };
    
    return this.finalizarPago(paymentData);
  }
  
  // Procesar pago con tarjeta
  pagoTarjeta(orderData, datosTarjeta) {
    const paymentData = {
      usuario_id: orderData.usuario_id,
      productos: orderData.productos || orderData.carrito,
      direccion_envio: orderData.direccion_envio,
      metodo_pago: 'Tarjeta',
      pago_tarjeta: {
        numero_tarjeta: datosTarjeta.numeroTarjeta.replace(/\s/g, ''),
        fecha_expiracion: datosTarjeta.fechaExpiracion,
        cvv: datosTarjeta.cvv,
        nombre_titular: datosTarjeta.nombreTitular
      }
    };
    
    return this.finalizarPago(paymentData);
  }
  
  // Método mejorado para transformar datos de PagoPage al formato esperado
  transformarDatosPago(pedidoData, metodoPago, datosAdicionales = {}) {
    console.log('🔄 Transformando datos del pedido...');
    console.log('📋 Datos de entrada:', { pedidoData, metodoPago, datosAdicionales });
    
    // Transformar productos del formato de PagoPage al formato esperado
    const productos = pedidoData.productos?.map(producto => ({
      id: producto.id || producto.productosId,
      nombre: producto.nombre,
      cantidad: producto.cantidad,
      precio: producto.precio || producto.precioUnitario || 0
    })) || [];

    // Validar que tengamos productos
    if (!productos || productos.length === 0) {
      throw new Error('No se encontraron productos en el pedido');
    }

    // Calcular totales si no están disponibles
    const subtotal = productos.reduce((sum, producto) => {
      return sum + (producto.precio * producto.cantidad);
    }, 0);
    const impuestos = subtotal * 0.13; // 13% IVA
    const total = subtotal + impuestos;

    const baseData = {
      usuario_id: pedidoData.usuarioDetalle?.usuarioId || pedidoData.usuario_id || 1,
      productos: productos,
      direccion_envio: pedidoData.direccionEnvio || pedidoData.direccion_envio,
      metodo_pago: metodoPago,
      // Agregar información de totales para el backend
      subtotal: pedidoData.subtotalSinImpuestos || subtotal,
      impuestos: pedidoData.ivaTotal || impuestos,
      total: pedidoData.total || total,
      // Información adicional
      estado: 'Procesando', // Estado inicial de la orden
      fecha: new Date().toISOString(),
      moneda: pedidoData.moneda || 'CRC'
    };

    // Validar campos requeridos
    if (!baseData.usuario_id) {
      throw new Error('Campo requerido faltante: usuario_id');
    }
    
    if (!baseData.productos || baseData.productos.length === 0) {
      throw new Error('Campo requerido faltante: productos');
    }
    
    if (!baseData.direccion_envio) {
      throw new Error('Campo requerido faltante: direccion_envio');
    }
    
    if (!baseData.metodo_pago) {
      throw new Error('Campo requerido faltante: metodo_pago');
    }

    // Agregar datos específicos del método de pago
    if (metodoPago === 'Efectivo' && datosAdicionales.montoEfectivo) {
      const montoEfectivo = parseFloat(datosAdicionales.montoEfectivo);
      const totalPedido = parseFloat(baseData.total);
      
      if (isNaN(montoEfectivo) || isNaN(totalPedido)) {
        throw new Error('Montos inválidos para pago en efectivo');
      }
      
      baseData.pago_efectivo = {
        monto_pagado: montoEfectivo,
        cambio: Math.max(0, montoEfectivo - totalPedido)
      };
    } else if ((metodoPago === 'Tarjeta' || metodoPago === 'Crédito' || metodoPago === 'Débito') && datosAdicionales.datosTarjeta) {
      const tarjeta = datosAdicionales.datosTarjeta;
      
      // Validar datos de tarjeta
      if (!tarjeta.numeroTarjeta || !tarjeta.fechaExpiracion || !tarjeta.cvv || !tarjeta.nombreTitular) {
        throw new Error('Datos de tarjeta incompletos');
      }
      
      baseData.pago_tarjeta = {
        numero_tarjeta: tarjeta.numeroTarjeta.replace(/\s/g, ''),
        fecha_expiracion: tarjeta.fechaExpiracion,
        cvv: tarjeta.cvv,
        nombre_titular: tarjeta.nombreTitular
      };
    }

    console.log('✅ Datos transformados correctamente:', baseData);
    return baseData;
  }
  
  // Calcular totales de una orden
  calcularTotales(productos) {
    const subtotal = productos.reduce((sum, producto) => {
      return sum + (producto.precio * producto.cantidad);
    }, 0);
    
    const impuestos = subtotal * 0.13; // 13% IVA Costa Rica
    const total = subtotal + impuestos;
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      impuestos: parseFloat(impuestos.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  }
  
  // Validar datos de tarjeta
  validarTarjeta(datosTarjeta) {
    const errores = [];
    
    if (!datosTarjeta.numeroTarjeta || datosTarjeta.numeroTarjeta.replace(/\s/g, '').length < 16) {
      errores.push('Número de tarjeta inválido');
    }
    
    if (!datosTarjeta.fechaExpiracion || !/^\d{2}\/\d{2}$/.test(datosTarjeta.fechaExpiracion)) {
      errores.push('Fecha de expiración inválida (MM/YY)');
    }
    
    if (!datosTarjeta.cvv || datosTarjeta.cvv.length < 3) {
      errores.push('CVV inválido');
    }
    
    if (!datosTarjeta.nombreTitular || datosTarjeta.nombreTitular.trim().length < 3) {
      errores.push('Nombre del titular requerido');
    }
    
    return errores;
  }
  
  // Validar datos de efectivo
  validarEfectivo(montoPagado, total) {
    const errores = [];
    
    if (!montoPagado || parseFloat(montoPagado) <= 0) {
      errores.push('Monto pagado debe ser mayor a 0');
    }
    
    if (parseFloat(montoPagado) < parseFloat(total)) {
      errores.push('Monto pagado insuficiente');
    }
    
    return errores;
  }

  // Formatear número de tarjeta para mostrar
  formatearNumeroTarjeta(numero) {
    if (!numero) return '';
    const numeroLimpio = numero.replace(/\s/g, '');
    const grupos = numeroLimpio.match(/.{1,4}/g);
    return grupos ? grupos.join(' ') : numeroLimpio;
  }

  // Obtener el último dígito de tarjeta (para mostrar ****1234)
  obtenerUltimosDigitos(numero, cantidad = 4) {
    if (!numero) return '';
    const numeroLimpio = numero.replace(/\s/g, '');
    return '*'.repeat(Math.max(0, numeroLimpio.length - cantidad)) + 
           numeroLimpio.slice(-cantidad);
  }

  // Métodos de compatibilidad
  createOrden(orden) {
    return this.finalizarPago(orden);
  }

  updateOrden(ordenId, data) {
    return axios.put(`${BASE_URL}/${ordenId}`, data);
  }
  
  // Obtener estados válidos de orden
  getEstadosValidos() {
    return ['Procesando', 'Enviado', 'Entregado', 'Cancelado', 'Pendiente'];
  }
  
  // Obtener métodos de pago válidos
  getMetodosPagoValidos() {
    return ['Efectivo', 'Crédito', 'Débito', 'Tarjeta'];
  }

  // Utilidad mejorada para manejar respuestas del API
  procesarRespuesta(response) {
    console.log('🔍 Procesando respuesta del servidor...');
    console.log('📤 Respuesta recibida:', response.data);
    
    let resultado = null;
    
    // Manejar diferentes formatos de respuesta del backend
    if (response.data?.success && response.data?.data) {
      resultado = response.data.data;
      console.log('✅ Respuesta con éxito y data:', resultado);
    } else if (response.data?.data) {
      resultado = response.data.data;
      console.log('✅ Respuesta con data:', resultado);
    } else if (Array.isArray(response.data)) {
      resultado = response.data[0] || response.data;
      console.log('✅ Respuesta como array:', resultado);
    } else if (response.data?.orden_id || response.data?.id || response.data?.ordenesId) {
      resultado = response.data;
      console.log('✅ Respuesta con ID de orden:', resultado);
    } else {
      resultado = response.data;
      console.log('✅ Respuesta directa:', resultado);
    }
    
    // Asegurar que tenemos un ID de orden
    if (resultado && !resultado.id && !resultado.orden_id && !resultado.ordenesId) {
      if (response.data?.insertId) {
        resultado.id = response.data.insertId;
        console.log('🆔 ID de orden obtenido desde insertId:', resultado.id);
      } else if (response.data?.affectedRows > 0) {
        // Si el backend no devuelve el ID pero confirma inserción
        resultado.id = 'generado-' + Date.now();
        console.log('🆔 ID temporal generado:', resultado.id);
      }
    }
    
    return resultado;
  }

  // Interceptor mejorado para manejo consistente de errores
  static setupInterceptors() {
    axios.interceptors.request.use(
      (config) => {
        console.log('🚀 Enviando petición:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data
        });
        return config;
      },
      (error) => {
        console.error('❌ Error en petición:', error);
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => {
        console.log('✅ Respuesta exitosa:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      (error) => {
        console.error('❌ Error en respuesta:', error);
        
        let mensajeError = 'Error desconocido';
        
        if (error.response?.data?.message) {
          mensajeError = error.response.data.message;
        } else if (error.response?.data?.error) {
          mensajeError = error.response.data.error;
        } else if (error.response?.data?.result) {
          mensajeError = error.response.data.result;
        } else if (error.response?.status === 404) {
          mensajeError = 'Endpoint no encontrado - Verifica la configuración del servidor';
        } else if (error.response?.status === 400) {
          mensajeError = 'Datos inválidos enviados al servidor';
        } else if (error.response?.status === 500) {
          mensajeError = 'Error interno del servidor';
        } else if (!error.response) {
          mensajeError = 'Error de conexión con el servidor';
        }
        
        error.message = mensajeError;
        console.error('💥 Error procesado:', mensajeError);
        
        return Promise.reject(error);
      }
    );
  }

  // Método para verificar si una orden fue guardada exitosamente
  async verificarOrdenGuardada(ordenId) {
    try {
      console.log('🔍 Verificando orden guardada:', ordenId);
      const response = await this.getById(ordenId);
      console.log('✅ Orden verificada exitosamente:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Error al verificar orden:', error);
      return false;
    }
  }

  // Método para obtener el siguiente número de orden disponible
  async obtenerSiguienteNumeroOrden() {
    try {
      const response = await this.getAll();
      const ordenes = response.data || [];
      
      if (ordenes.length === 0) {
        return 1;
      }
      
      const maxId = Math.max(...ordenes.map(orden => 
        parseInt(orden.ordenesId || orden.id || 0)
      ));
      
      return maxId + 1;
    } catch (error) {
      console.error('Error al obtener siguiente número de orden:', error);
      return Date.now(); // Fallback usando timestamp
    }
  }

  // Método para reenviar confirmación de orden por email
  async reenviarConfirmacion(ordenId, email) {
    try {
      return await axios.post(`${BASE_URL}/${ordenId}/reenviar-confirmacion`, { email });
    } catch (error) {
      console.error('Error al reenviar confirmación:', error);
      throw error;
    }
  }

  // Método para obtener estadísticas de órdenes
  async obtenerEstadisticas(usuarioId = null) {
    try {
      const url = usuarioId ? `${BASE_URL}/estadisticas/${usuarioId}` : `${BASE_URL}/estadisticas`;
      return await axios.get(url);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Método para exportar órdenes
  async exportarOrdenes(formato = 'csv', filtros = {}) {
    try {
      return await axios.post(`${BASE_URL}/exportar`, {
        formato,
        filtros
      }, {
        responseType: 'blob'
      });
    } catch (error) {
      console.error('Error al exportar órdenes:', error);
      throw error;
    }
  }
}

// Configurar interceptors al importar
OrderService.setupInterceptors();

export default new OrderService();