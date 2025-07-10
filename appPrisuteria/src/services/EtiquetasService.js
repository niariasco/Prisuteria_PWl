import axios from 'axios';
//http://localhost:81/prisuteriapwl/etiquetas/
const BASE_URL = import.meta.env.VITE_BASE_URL + 'etiquetas';
class EtiquetasService {
  //Definición para Llamar al API y obtener el listado de categorias

  //Listas Categorias
  //localhost:81//appPrisuteria/categoria
  getEtiqueta() {
    return axios.get(BASE_URL);
  }


}
export default new EtiquetasService();
