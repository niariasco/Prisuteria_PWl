import axios from 'axios';
//http://localhost:81/prisuteriapwl/etiquetas/
const BASE_URL = import.meta.env.VITE_BASE_URL + 'etiquetas';
class EtiquetasService {
  //Definición para Llamar al API y obtener el listado de categorias

  //Listas Categorias
  //localhost:81//appPrisuteria/categoria
  getAllEtiquetas() {
    return axios.get(BASE_URL);
  }
    getId(id){
    return axios.get(BASE_URL+'/'+id);
  }

  create(etiqueta) {
    return axios.post(BASE_URL, etiqueta); // Axios envía JSON automáticamente
  }

  update(etiqueta) {
    return axios.put(`${BASE_URL}/${etiqueta.etiquetaId}`, etiqueta);
  }

}
export default new EtiquetasService();
