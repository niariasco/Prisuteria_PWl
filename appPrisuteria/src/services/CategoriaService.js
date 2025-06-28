import axios from 'axios';
//http://localhost:81/appPrisuteria/categoria/
const BASE_URL = import.meta.env.VITE_BASE_URL + 'categoria';
class CategoriaService {
  //Definición para Llamar al API y obtener el listado de categorias

  //Listas Categorias
  //localhost:81//appPrisuteria/categoria
  getCategoria() {
    return axios.get(BASE_URL);
  }
  //Obtener Categoria id
  //localhost:81//appPrisuteria/categoria/1
  getCategoriaById(CategoriaId){
    return axios.get(BASE_URL+'/'+CategoriaId);
  }
  //Obtener peliculas por tienda
  

  createCategoria(Categoria) {
    return axios.post(BASE_URL, JSON.stringify(Categoria));
  }
  
  updateCategoria(Categoria) {
    return axios({
      method: 'put',
      url: BASE_URL,
      data: JSON.stringify(Categoria)

    })
  }
}
export default new CategoriaService();
