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

  //promocion por producto


//Crear promocion

createPromocion(Promocion) {
    return axios.post(BASE_URL, JSON.stringify(Promocion));
}

}