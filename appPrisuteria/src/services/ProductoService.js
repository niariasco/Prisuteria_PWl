import axios from 'axios';

// Usar la misma URL base pero con 'productos' para mantener consistencia
const BASE_URL = import.meta.env.VITE_BASE_URL + 'producto';
const API_URL = BASE_URL.replace(/\/+$/, '');

class ProductosService {
  // Obtener todos los productos
  getProductos() {
    return axios.get(API_URL)
      .then(response => response.data)
      .catch(error => {
        console.error('Error obteniendo productos:', error);
        throw error;
      });
  }
// Cambiar estado de un producto (activar/desactivar)
cambiarEstado({ productosId, activo }) {
  return axios.put(`${API_URL}/cambiarEstado`, { productosId, activo }, {
    headers: { 'Content-Type': 'application/json' },
  });
}

  // Obtener todos los productos (alias para compatibilidad)
  getAllProductos() {
    return axios.get(API_URL);
  }

  // Obtener un producto específico por ID
  get(id) {
    return axios.get(`${API_URL}/${id}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error obteniendo producto ${id}:`, error);
        throw error;
      });
  }

  // Obtener producto por ID (alias para compatibilidad)
  getProductoById(ProductoId) {
    return axios.get(`${API_URL}/${ProductoId}`);
  }

  // Crear nuevo producto
  create(productoData) {
    return axios.post(API_URL, productoData, {
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.data)
    .catch(error => {
      console.error('Error creando producto:', error);
      throw error;
    });
  }

  // Crear producto (alias para compatibilidad)
  createProducto(producto) {
    return axios.post(API_URL, producto, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Actualizar producto
  update(id, productoData) {
    return axios.put(`${API_URL}/${id}`, productoData, {
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.data)
    .catch(error => {
      console.error(`Error actualizando producto ${id}:`, error);
      throw error;
    });
  }

  // Actualizar producto (alias para compatibilidad)
  updateProducto(producto) {
    return axios.put(API_URL, producto, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Eliminar producto
  delete(id) {
    return axios.delete(`${API_URL}/${id}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error eliminando producto ${id}:`, error);
        throw error;
      });
  }

 /*
  async validarStockMultiple(productos) {
    try {
      const validaciones = await Promise.allSettled(
        productos.map(async (item) => {
          try {
            const response = await this.get(item.id);
            const producto = response.data || response;
            
            return {
              id: item.id,
              nombre: item.nombre,
              cantidadSolicitada: item.cantidad,
              stockDisponible: parseInt(producto.stock || 0),
              tieneStock: parseInt(producto.stock || 0) >= item.cantidad,
              producto: producto
            };
          } catch (error) {
            return {
              id: item.id,
              nombre: item.nombre,
              cantidadSolicitada: item.cantidad,
              error: 'No se pudo verificar el stock',
              tieneStock: false
            };
          }
        })
      );

      return validaciones.map(result => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            error: 'Error en la validación',
            tieneStock: false
          };
        }
      });

    } catch (error) {
      console.error('Error en validación múltiple de stock:', error);
      throw error;
    }
  }
*/
  // Validar stock de un producto específico
  async validarStock(productId, cantidadSolicitada) {
    try {
      const response = await this.get(productId);
      const producto = response.data || response;
      const stockDisponible = parseInt(producto.stock || 0);
      
      return {
        id: productId,
        stockDisponible,
        cantidadSolicitada,
        tieneStock: stockDisponible >= cantidadSolicitada,
        diferencia: stockDisponible - cantidadSolicitada
      };
    } catch (error) {
      console.error(`Error validando stock para producto ${productId}:`, error);
      return {
        id: productId,
        error: 'No se pudo verificar el stock',
        tieneStock: false
      };
    }
  }

  // Actualizar stock después de una compra
  async actualizarStock(productId, cantidadVendida) {
    try {
      const producto = await this.get(productId);
      const stockActual = parseInt(producto.stock || 0);
      const nuevoStock = Math.max(0, stockActual - cantidadVendida);
      
      return await this.update(productId, {
        ...producto,
        stock: nuevoStock
      });
    } catch (error) {
      console.error(`Error actualizando stock para producto ${productId}:`, error);
      throw error;
    }
  }

  // Obtener productos con stock bajo
  async getProductosStockBajo(limite = 5) {
    try {
      const productos = await this.getProductos();
      return productos.filter(producto => 
        parseInt(producto.stock || 0) <= limite
      );
    } catch (error) {
      console.error('Error obteniendo productos con stock bajo:', error);
      throw error;
    }
  }

  // Búsqueda de productos
  search(query) {
    return axios.get(`${API_URL}/search?q=${encodeURIComponent(query)}`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error en búsqueda de productos:', error);
        throw error;
      });
  }

  // Obtener productos por categoría
  getByCategoria(categoriaId) {
    return axios.get(`${API_URL}/categorias/${categoriaId}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error obteniendo productos de categoría ${categoriaId}:`, error);
        throw error;
      });
  }

    // Obtener productos por categoría
getCategoria(categoriaId) {
  return axios.get(`${API_URL}/productosXCategoria/${categoriaId}`)
    .then(response => response.data)
    .catch(error => {
      console.error(`Error obteniendo productos de categoría ${categoriaId}:`, error);
      throw error;
    });
}


  // Obtener productos con promociones
  getProductosConPromocion() {
    return axios.get(`${API_URL}/promociones`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error obteniendo productos con promoción:', error);
        throw error;
      });
  }

  // Obtener productos con promociones aplicadas (del ProductoService original)
  obtenerProductosConPromociones() {
    return axios
      .get(`${API_URL}/obtenerProductosPromocion`)
      .then(response => {
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Error al obtener promociones');
        }
      });
  }

  // Obtener producto con promoción aplicada (del ProductoService original)
  getProductoConPromocion(ProductoId) {
    return axios.get(`${API_URL}/conPromocion/${ProductoId}`)
      .then(response => {
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Error al obtener producto con promoción');
        }
      });
  }

  // Método para preparar producto para el carrito (del ProductoService original)
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
}

export default new ProductosService();