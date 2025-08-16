import axios from 'axios';
//http://localhost:81/prisuteria/Producto/
const BASE_URL = import.meta.env.VITE_BASE_URL + 'producto';

class ProductoPService {
  //Definición para Llamar al API y obtener el listado de productos

  //Lista productos
  //localhost:81/prisuteria/producto
  getAllProductos() {
    return axios.get(BASE_URL);
  }
  
  //Obtener producto por ID
  //localhost:81/prisuteria/producto/1
  getProductoById(ProductoId){
    return axios.get(BASE_URL+'/'+ProductoId);
  }


}

export default new ProductoPService();