import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'usuarioDetalle';

class UsuarioDetalleService {
  
  // Obtener todos los detalles de usuario
  getUsuarioDetalles() {
    return axios.get(BASE_URL);
  }

  // Obtener detalle de usuario por ID
  getUsuarioDetalleById(usuarioDetalleId) {
    return axios.get(`${BASE_URL}/${usuarioDetalleId}`);
  }

  // Crear un nuevo detalle de usuario
  createUsuarioDetalle(usuarioDetalle) {
    return axios.post(BASE_URL, JSON.stringify(usuarioDetalle), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Actualizar un detalle de usuario
  updateUsuarioDetalle(usuarioDetalleId, usuarioDetalle) {
    return axios.put(`${BASE_URL}/${usuarioDetalleId}`, JSON.stringify(usuarioDetalle), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Eliminar un detalle de usuario
  deleteUsuarioDetalle(usuarioDetalleId) {
    return axios.delete(`${BASE_URL}/${usuarioDetalleId}`);
  }
}

export default new UsuarioDetalleService();
