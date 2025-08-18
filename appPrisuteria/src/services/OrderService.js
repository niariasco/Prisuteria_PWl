import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'orden';

class OrderService {
  getAll() {
    return axios.get(BASE_URL);
  }

  getById(ordenId) {
    return axios.get(`${BASE_URL}/${ordenId}`);
  }
}

export default new OrderService();