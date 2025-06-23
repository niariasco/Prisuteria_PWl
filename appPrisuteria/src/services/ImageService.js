class ImageService {
    createImage(formData){
          try {
    const response = ImageService.createImage(formData);
    const filename = response.data.filename;  // nombre de archivo retornado por backend
    const urlImagen = `${filename}`;
    document.getElementById('miImagen').src = urlImagen;
  } catch (error) {
    console.error('Error subiendo imagen:', error);
  } 
}
}
export default new ImageService()

/*
 import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'image';

class ImageService {
    createImage(formData){
        return axios.post(BASE_URL,formData,{
            headers:{
                'Content-Type':'multipart/form-data;',
                'Accept':'multipart/form-data'
            }
        })
    } 
}
export default new ImageService()
*/