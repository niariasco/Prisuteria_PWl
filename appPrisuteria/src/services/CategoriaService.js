import axios from 'axios';
//http://localhost:81/prisuteriapwl/categorias/
const BASE_URL = import.meta.env.VITE_BASE_URL + 'categorias';

class CategoriaService {
    getAllCategorias() {
        return axios.get(BASE_URL + '/', {  // Agrega la barra final
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    getCategoriaById(categoriaId) {
        return axios.get(`${BASE_URL}/${categoriaId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    createCategoria(categoria) {
        return axios.post(BASE_URL + '/', categoria, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    updateCategoria(categoria) {
        return axios.put(BASE_URL + '/', categoria, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }
}

export default new CategoriaService();