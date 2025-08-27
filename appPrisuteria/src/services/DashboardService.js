import axios from "axios";

//  http://localhost:81/prisuteriapwl/dashboard
const BASE_URL = import.meta.env.VITE_BASE_URL + "dashboard";

class DashboardService {
  // Ventas por día
  getVentasPorDia() {
    return axios.get(`${BASE_URL}/ventasPorDia`);
  }

  // Ventas por mes
  getVentasPorMes() {
    return axios.get(`${BASE_URL}/ventasPorMes`);
  }

  // Pedidos por estado
  getPedidosPorEstado() {
    return axios.get(`${BASE_URL}/pedidosPorEstado`);
  }

  // Top 3 productos más vendidos
  getTopProductos() {
    return axios.get(`${BASE_URL}/topProductos`);
  }

  // Últimas 3 reseñas
  getUltimasResenas() {
    return axios.get(`${BASE_URL}/ultimasResenas`);
  }
}

export default new DashboardService();
