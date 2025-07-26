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
    createPromocion(promocion) {
        // Validar que los datos requeridos estén presentes
        if (!promocion.tipo_descuento) {
            throw new Error('El tipo de descuento es requerido');
        }

        // Convertir tipo_descuento al formato esperado por la base de datos
        const tipoDescuentoDB = promocion.tipo_descuento === 'porcentaje' ? 'Porcentaje' : 'Monto';

        // Preparar datos para envío
        const promocionData = {
            nombre: promocion.nombre,
            tipo: promocion.tipo,
            tipo_descuento: tipoDescuentoDB,
            descuento: parseFloat(promocion.descuento),
            fecha_inicio: promocion.fecha_inicio,
            fecha_fin: promocion.fecha_fin,
            activo: promocion.activo !== undefined ? promocion.activo : true,
            ProductoID: promocion.ProductoID || null,
            CategoriaID: promocion.CategoriaID || null
        };

        console.log('Datos enviados al backend:', promocionData);

        return axios.post(BASE_URL, promocionData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    updatePromocion(promocion) {
        // Validar que los datos requeridos estén presentes
        if (!promocion.id) {
            throw new Error('El ID de la promoción es requerido para actualizar');
        }

        if (!promocion.tipo_descuento) {
            throw new Error('El tipo de descuento es requerido');
        }

        // Convertir tipo_descuento al formato esperado por la base de datos
        const tipoDescuentoDB = promocion.tipo_descuento === 'porcentaje' ? 'Porcentaje' : 'Monto';

        // Preparar datos para envío
        const promocionData = {
            id: promocion.id,
            nombre: promocion.nombre,
            tipo: promocion.tipo,
            tipo_descuento: tipoDescuentoDB,
            descuento: parseFloat(promocion.descuento),
            fecha_inicio: promocion.fecha_inicio,
            fecha_fin: promocion.fecha_fin,
            activo: promocion.activo !== undefined ? promocion.activo : true,
            ProductoID: promocion.ProductoID || null,
            CategoriaID: promocion.CategoriaID || null
        };

        const urlEstructuraCorrecta = `${BASE_URL}/update/${promocion.id}`;
        console.log('URL de destino:', urlEstructuraCorrecta);
        console.log('Datos enviados al backend:', promocionData);
        
        return axios.put(urlEstructuraCorrecta, promocionData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Eliminar promoción 
    deletePromocion(promocionId) {
        return axios.delete(`${BASE_URL}/${promocionId}`)
            .catch(error => {
                console.error('Error al eliminar promoción:', error);
                throw error;
            });
    }

    // Método para validar descuento según el tipo
    validateDescuento(valor, tipo) {
        const numValue = parseFloat(valor);
        
        if (isNaN(numValue) || numValue <= 0) {
            return 'El valor debe ser un número positivo';
        }
        
        if (tipo === 'porcentaje') {
            if (numValue < 1 || numValue > 100) {
                return 'El porcentaje debe estar entre 1 y 100';
            }
        } else if (tipo === 'monto') {
            if (numValue < 0.01) {
                return 'El monto debe ser mayor a 0.01';
            }
        }
        
        return null; // Sin errores
    }

    // Método para formatear el descuento para mostrar
    formatDescuento(valor, tipo) {
        if (tipo === 'porcentaje') {
            return `${valor}%`;
        } else {
            return `₡${parseFloat(valor).toLocaleString('es-CR')}`;
        }
    }
}

export default new PromocionService();