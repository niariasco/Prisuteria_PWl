import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'promocion';

class PromocionService{

    //Listas Promociones
    //Obtener todas las promociones 
  //localhost:81/prisuteriapwl/promocion
    getallPromociones(){
        return axios.get(BASE_URL);

    }

    getPromocionById(PromocionId) {
    return axios.get(BASE_URL + '/' + PromocionId);
}

  //Obtener promocion por producto

  getPromocionPorProducto(idProducto) {
    return axios.get(`${BASE_URL}/producto/${idProducto}`);
  }
  getTodasLasPromocionesConNombreAplicado() {
  return axios.get(`${BASE_URL}/todasLasPromocionesConNombre`)
    .then(response => {
      if (response.data.status === 'success') {
        return response.data.data; // ← Aquí están las promociones
      } else {
        throw new Error(response.data.message || 'Error al obtener promociones');
      }
    })
    .catch(error => {
      console.error('Error al obtener promociones con nombre aplicado:', error);
      throw error;
    });
}



//Crear promocion

createPromocion(Promocion) {
    return axios.post(BASE_URL, JSON.stringify(Promocion));
}
updateMovie(Promocion) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Promocion)

    })
  }

}
export default new PromocionService();