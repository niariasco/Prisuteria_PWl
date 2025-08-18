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

  // Transformar datos del frontend al formato esperado por la API (QUITAMOS static)
  transformarDatosPago(pedidoData, metodoPago, datosAdicionales = {}) {
    console.log('Transformando datos:', { pedidoData, metodoPago, datosAdicionales });
    
    const datosTransformados = {
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
      estado: 'Pendiente', // Estado por defecto
      moneda: pedidoData.moneda || 'CRC'
    };

    // Agregar datos específicos según método de pago
    if (metodoPago === 'Efectivo') {
      datosTransformados.monto_pagado = parseFloat(datosAdicionales.montoEfectivo || 0);
      datosTransformados.cambio = parseFloat(datosAdicionales.cambio || 0);
    } else if (metodoPago === 'Crédito' || metodoPago === 'Débito') {
      // Para tarjeta, cambiar el método a "Tarjeta" que es lo que espera el backend
      datosTransformados.metodo_pago = 'Tarjeta';
      datosTransformados.numero_tarjeta = datosAdicionales.numeroTarjeta?.replace(/\s/g, '') || '';
      datosTransformados.fecha_expiracion = datosAdicionales.fechaExpiracion || '';
      datosTransformados.cvv = datosAdicionales.cvv || '';
      datosTransformados.nombre_titular = datosAdicionales.nombreTitular || '';
    }

    console.log('Datos transformados:', datosTransformados);
    return datosTransformados;
  }

  // Procesar pago y crear orden (método principal)
  async finalizarPago(paymentData) {
    console.log('[OrderService] Iniciando finalizarPago con datos:', paymentData);

    try {
      // Validar datos antes de enviar
      this.validarDatosOrden(paymentData);

      // Intentar primero con la ruta directa al index.php
      const directUrl = BASE_URL.replace('/orden', '/index.php');
      console.log('[OrderService] Intentando URL directa:', directUrl);
      
      // Realizar la petición al endpoint de creación
      const response = await axios.post(`${directUrl}?action=create_orden`, paymentData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('[OrderService] Respuesta recibida:', response);

      // Procesar la respuesta
      const resultado = this.procesarRespuestaExitosa(response);
      
      return resultado;

    } catch (error) {
      console.error('[OrderService] Error en finalizarPago:', error);
      
      // Si es error 404, intentar con endpoint alternativo
      if (error.response?.status === 404) {
        console.log('[OrderService] Intentando endpoint alternativo...');
        try {
          return await this.intentarEndpointAlternativo(paymentData);
        } catch (altError) {
          console.error('[OrderService] Error en endpoint alternativo:', altError);
          throw this.procesarError(altError);
        }
      }
      
      throw this.procesarError(error);
    }
  }

  // Método alternativo por si falla el principal
  async intentarEndpointAlternativo(paymentData) {
    const datosAlternativos = this.transformarParaEndpointAlternativo(paymentData);
    console.log('[OrderService] Datos para endpoint alternativo:', datosAlternativos);
    
    const response = await axios.post(`${BASE_URL}/finalizar-pago`, datosAlternativos);
    return this.procesarRespuestaExitosa(response);
  }

  // Transformar datos para endpoint alternativo
  transformarParaEndpointAlternativo(paymentData) {
    return {
      usuario_id: paymentData.usuario_id,
      carrito: paymentData.productos?.map(p => ({
        id: p.id,
        cantidad: p.cantidad,
        precio: p.precio
      })),
      direccion_envio: paymentData.direccion_envio,
      metodo_pago: paymentData.metodo_pago,
      subtotal: paymentData.subtotal,
      impuestos: paymentData.impuestos,
      total: paymentData.total,
      estado: paymentData.estado,
      // Datos específicos de pago
      monto_pagado: paymentData.monto_pagado,
      cambio: paymentData.cambio,
      numero_tarjeta: paymentData.numero_tarjeta,
      fecha_expiracion: paymentData.fecha_expiracion,
      cvv: paymentData.cvv,
      nombre_titular: paymentData.nombre_titular
    };
  }

  // Procesar respuesta exitosa
  procesarRespuestaExitosa(response) {
    console.log('[OrderService] Procesando respuesta exitosa:', response.data);
    
    const data = response.data;
    
    // Extraer ID de la orden de diferentes formatos posibles
    let ordenId = null;
    
    if (data.ordenesId) {
      ordenId = data.ordenesId;
    } else if (data.orden_id) {
      ordenId = data.orden_id;
    } else if (data.id) {
      ordenId = data.id;
    } else if (typeof data === 'number') {
      // Si la respuesta es directamente el ID
      ordenId = data;
    }

    console.log('[OrderService] ID de orden extraído:', ordenId);

    const resultado = {
      success: true,
      orden_id: ordenId,
      ordenesId: ordenId, // Para compatibilidad
      id: ordenId,
      total: data.total,
      message: data.message || 'Orden creada exitosamente',
      data: data
    };

    console.log('[OrderService] Resultado procesado:', resultado);
    return resultado;
  }

  // Procesar errores
  procesarError(error) {
    console.error('[OrderService] Procesando error:', error);
    
    let mensajeError = 'Error desconocido al procesar el pago';
    
    if (error.response) {
      const { data, status } = error.response;
      console.log('[OrderService] Error response:', { data, status });
      
      if (data?.errors) {
        mensajeError = Object.values(data.errors).flat().join(', ');
      } else if (data?.message) {
        mensajeError = data.message;
      } else if (data?.error) {
        mensajeError = data.error;
      } else if (status >= 500) {
        mensajeError = 'Error interno del servidor. Por favor, intente nuevamente.';
      } else if (status === 404) {
        mensajeError = 'Servicio no encontrado. Contacte al administrador.';
      } else if (status === 400) {
        mensajeError = 'Datos inválidos. Verifique la información ingresada.';
      } else {
        mensajeError = `Error del servidor (${status})`;
      }
    } else if (error.request) {
      mensajeError = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
    } else if (error.message) {
      mensajeError = error.message;
    }

    const err = new Error(mensajeError);
    err.originalError = error;
    err.status = error.response?.status;
    
    return err;
  }

  // Validar datos mínimos requeridos
  validarDatosOrden(orderData) {
    const errors = [];
    
    if (!orderData.usuario_id) {
      errors.push('Falta ID de usuario');
    }
    
    if (!orderData.productos?.length) {
      errors.push('Debe incluir al menos un producto');
    }
    
    if (!orderData.direccion_envio?.trim()) {
      errors.push('Falta dirección de envío');
    }
    
    if (!orderData.metodo_pago) {
      errors.push('Falta método de pago');
    }
    
    if (!orderData.total || orderData.total <= 0) {
      errors.push('El total debe ser mayor a cero');
    }

    // Validaciones específicas por método de pago
    if (orderData.metodo_pago === 'Efectivo') {
      if (!orderData.monto_pagado || orderData.monto_pagado <= 0) {
        errors.push('Falta monto de pago en efectivo');
      }
      if (orderData.monto_pagado < orderData.total) {
        errors.push('El monto pagado debe ser mayor o igual al total');
      }
    } else if (orderData.metodo_pago === 'Tarjeta') {
      if (!orderData.numero_tarjeta?.trim()) {
        errors.push('Falta número de tarjeta');
      }
      if (!orderData.fecha_expiracion?.trim()) {
        errors.push('Falta fecha de expiración');
      }
      if (!orderData.cvv?.trim()) {
        errors.push('Falta CVV');
      }
      if (!orderData.nombre_titular?.trim()) {
        errors.push('Falta nombre del titular');
      }
    }

    if (errors.length > 0) {
      console.error('[OrderService] Errores de validación:', errors);
      throw new Error(errors.join('. '));
    }

    console.log('[OrderService] Datos validados correctamente');
  }

  // Método alias para compatibilidad
  create(orderData) {
    return this.finalizarPago(orderData);
  }
}

// Exportar una instancia de la clase, NO la clase misma
export default new OrderService();