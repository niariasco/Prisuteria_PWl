import axios from 'axios';
//http://localhost:81/prisuteriapwl/resenas/
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

  createProducto(resena) {
    return axios.post(BASE_URL, JSON.stringify(resena));
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
