import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'usuarioDetalle';

// Configurar interceptor para mejor manejo de errores
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en UsuarioDetalleService:', error);
    
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Datos del error:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      // La solicitud se hizo pero no hubo respuesta
      console.error('No response:', error.request);
    } else {
      // Error al configurar la solicitud
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

class UsuarioDetalleService {
  
  // Obtener todos los detalles de usuario
  async getUsuarioDetalles() {
    try {
      console.log('Llamando a:', BASE_URL);
      const response = await axios.get(BASE_URL);
      console.log('Respuesta recibida:', response.data);
      return response;
    } catch (error) {
      console.error('Error en getUsuarioDetalles:', error);
      throw error;
    }
  }
  
  // Obtener detalle de usuario por ID
  async getUsuarioDetalleById(usuarioDetalleId) {
    try {
      if (!usuarioDetalleId) {
        throw new Error('ID de usuario detalle requerido');
      }
      
      const response = await axios.get(`${BASE_URL}/${usuarioDetalleId}`);
      return response;
    } catch (error) {
      console.error('Error en getUsuarioDetalleById:', error);
      throw error;
    }
  }
  
  // NUEVO: Obtener detalles por usuarioId
  async getUsuarioDetallesByUsuarioId(usuarioId) {
    try {
      if (!usuarioId) {
        throw new Error('Usuario ID requerido');
      }
      
      const response = await axios.get(`${BASE_URL}/usuario/${usuarioId}`);
      return response;
    } catch (error) {
      console.error('Error en getUsuarioDetallesByUsuarioId:', error);
      throw error;
    }
  }
  
  // Crear un nuevo detalle de usuario
  async createUsuarioDetalle(usuarioDetalle) {
    try {
      if (!usuarioDetalle) {
        throw new Error('Datos del usuario detalle requeridos');
      }
      
      // Validar datos requeridos
      if (!usuarioDetalle.usuarioId || !usuarioDetalle.nombre_completo || !usuarioDetalle.correo) {
        throw new Error('Datos requeridos faltantes: usuarioId, nombre_completo, correo');
      }
      
      const response = await axios.post(BASE_URL, usuarioDetalle, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Error en createUsuarioDetalle:', error);
      throw error;
    }
  }
  
  // Actualizar un detalle de usuario
  async updateUsuarioDetalle(usuarioDetalleId, usuarioDetalle) {
    try {
      if (!usuarioDetalleId) {
        throw new Error('ID de usuario detalle requerido');
      }
      
      if (!usuarioDetalle) {
        throw new Error('Datos del usuario detalle requeridos');
      }
      
      // Asegurar que el ID esté incluido en los datos
      usuarioDetalle.usuarioDetalleId = usuarioDetalleId;
      
      const response = await axios.put(`${BASE_URL}/${usuarioDetalleId}`, usuarioDetalle, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Error en updateUsuarioDetalle:', error);
      throw error;
    }
  }
  
  // Eliminar un detalle de usuario
  async deleteUsuarioDetalle(usuarioDetalleId) {
    try {
      if (!usuarioDetalleId) {
        throw new Error('ID de usuario detalle requerido');
      }
      
      const response = await axios.delete(`${BASE_URL}/${usuarioDetalleId}`);
      return response;
    } catch (error) {
      console.error('Error en deleteUsuarioDetalle:', error);
      throw error;
    }
  }
  
  // NUEVO: Método de prueba para verificar conectividad
  async testConnection() {
    try {
      console.log('Probando conexión a:', BASE_URL);
      const response = await axios.get(BASE_URL);
      console.log('Conexión exitosa. Status:', response.status);
      return { success: true, status: response.status, data: response.data };
    } catch (error) {
      console.error('Error de conexión:', error);
      return { 
        success: false, 
        error: error.message,
        status: error.response?.status || 'No response'
      };
    }
  }
}

export default new UsuarioDetalleService();