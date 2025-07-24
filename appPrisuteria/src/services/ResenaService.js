import axios from 'axios';
//http://localhost:81/prisuteriapwl/resena/
const BASE_URL = import.meta.env.VITE_BASE_URL + 'resena';
class ResenaService {
  //Definición para Llamar al API y obtener el listado de películas

  //Listas peliculas
  //localhost:81/apiProducto/Producto
  
  getAll() {
    return axios.get(BASE_URL);
  }
  
  //Obtener pelicula
  //localhost:81/apiProducto/Producto/1
  getId(id){
    return axios.get(BASE_URL+'/'+id);
  }
  //Obtener peliculas por tienda
  //localhost:81/apiProducto/Producto/ProductosByShopRental/1
 // getProductoByShopRental(ShopRentalId){
 //   return axios.get(BASE_URL+'/ProductosByShopRental/'+ShopRentalId);
 // }
/*
  createResena(resena) {
    return axios.post(BASE_URL, JSON.stringify(resena));
  }*/
  
    createResena(resenaData) {
    try {
      console.log('Enviando reseña a:', `${BASE_URL}`); // Debug
      console.log('Enviando reseña:', resenaData);
      
      const response = axios.post(`${BASE_URL}`, resenaData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 segundos de timeout
      });
      
      console.log('Respuesta del servidor:', response.data);
      return response;
      
    } catch (error) {
      console.error('Error completo:', error);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout: El servidor tardó demasiado en responder');
      } else if (error.response) {
        // El servidor respondió con un error
        console.error('Error del servidor:', error.response.status, error.response.data);
        throw new Error(error.response.data.message || `Error del servidor: ${error.response.status}`);
      } else if (error.request) {
        // No se recibió respuesta - problema de conexión
        console.error('No se pudo conectar con el servidor:', error.request);
        throw new Error('No se pudo conectar con el servidor. Verifica que esté funcionando.');
      } else {
        // Error en la configuración de la petición
        console.error('Error de configuración:', error.message);
        throw new Error('Error en la petición: ' + error.message);
      }
    }
  }
  updateProducto(resena) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(resena)

    })
  }
  
}

export default new ResenaService();
