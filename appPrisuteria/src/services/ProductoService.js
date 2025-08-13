import axios from 'axios';
//http://localhost:81/prisuteria/Producto/
const BASE_URL = import.meta.env.VITE_BASE_URL + 'producto';

class ProductoService {
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

  // Obtener productos con promociones aplicadas
  obtenerProductosConPromociones() {
    return axios
      .get(`${BASE_URL}/obtenerProductosPromocion`)
      .then(response => {
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Error al obtener promociones');
        }
      });
  }

  // Nuevo método: obtener producto con promoción aplicada
  getProductoConPromocion(ProductoId) {
    return axios.get(`${BASE_URL}/conPromocion/${ProductoId}`)
      .then(response => {
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Error al obtener producto con promoción');
        }
      });
  }

  // Método para preparar producto para el carrito
  // Este método asegura que el producto tenga la información correcta de precios
  prepararProductoParaCarrito(producto) {
    const promocion = parseFloat(producto.promocion) || 0;
    const precioOriginal = parseFloat(producto.precio) || 0;
    
    // Si tiene promoción, calculamos el precio con descuento
    if (promocion > 0) {
      const descuento = precioOriginal * (promocion / 100);
      const precioConDescuento = precioOriginal - descuento;
      
      return {
        ...producto,
        precio_original: precioOriginal,
        precio: precioConDescuento, // Este será el precio que se use en el carrito
        precio_con_descuento: precioConDescuento,
        ahorro: descuento,
        tiene_promocion: true,
        porcentaje_promocion: promocion
      };
    } else {
      // Si no tiene promoción, mantenemos el precio original
      return {
        ...producto,
        precio_original: precioOriginal,
        precio: precioOriginal, // Precio original
        precio_con_descuento: null,
        ahorro: 0,
        tiene_promocion: false,
        porcentaje_promocion: 0
      };
    }
  }

  // Método para obtener todos los productos con precios calculados
  getAllProductosConPrecios() {
    return this.getAllProductos()
      .then(response => {
        const productos = response.data;
        return productos.map(producto => this.prepararProductoParaCarrito(producto));
      });
  }

  // Método para obtener un producto específico con precios calculados
  getProductoByIdConPrecios(ProductoId) {
    return this.getProductoById(ProductoId)
      .then(response => {
        const producto = response.data;
        return this.prepararProductoParaCarrito(producto);
      });
  }

  createProducto(producto) {
    return axios.post(BASE_URL, producto, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  updateProducto(producto) {
    return axios.put(BASE_URL, producto, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export default new ProductoService();