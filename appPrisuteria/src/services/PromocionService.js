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