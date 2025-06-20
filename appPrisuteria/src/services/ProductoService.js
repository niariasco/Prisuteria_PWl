import axios from 'axios';
//http://localhost:81/apiProducto/Producto/
const BASE_URL = import.meta.env.VITE_BASE_URL + 'producto';
class ProductoService {
  //Definición para Llamar al API y obtener el listado de películas

  //Listas peliculas
  //localhost:81/apiProducto/Producto
  getAllProductos() {
    return axios.get(BASE_URL);
  }
  //Obtener pelicula
  //localhost:81/apiProducto/Producto/1
  getProductoById(ProductoId){
    return axios.get(BASE_URL+'/'+ProductoId);
  }
  //Obtener peliculas por tienda
  //localhost:81/apiProducto/Producto/ProductosByShopRental/1
 // getProductoByShopRental(ShopRentalId){
 //   return axios.get(BASE_URL+'/ProductosByShopRental/'+ShopRentalId);
 // }
  createProducto(Producto) {
    return axios.post(BASE_URL, JSON.stringify(Producto));
  }
  
  updateProducto(Producto) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Producto)

    })
  }
}
export default new ProductoService();
