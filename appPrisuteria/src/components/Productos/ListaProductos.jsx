/*import React, { useEffect } from 'react';*/
import { useEffect } from 'react';
import { useState } from 'react';
import ProductoService from '../../services/ProductoService';
import { ListaCartasProductos } from './ListaCartasProductos';

export function ListaProductos() {
  //Resultado de consumo del API, respuesta
  const [data, setData] = useState(null);
  //Error del API
  const [error, setError] = useState('');
  //Booleano para establecer sí se ha recibido respuesta
  const [loaded, setLoaded] = useState(false);
useEffect(() => {
    ProductoService.getAllProductos()
    .then((response) => {
      console.log(response);
      setData(response.data);
      setError(response.error);
      setError(response.error || ''); 
      setLoaded(true);       
    })                                      
    .catch((error) => {
      console.log(error);
      if (error instanceof SyntaxError) {
        setError(error);
        setLoaded(false);
      }
    });
}, []);


if(!loaded) return <p>Cargando..</p>
if(error) return <p>Error: {error.message}</p>
return <>{data && <ListaCartasProductos data={data} isShopping={true} />}</> 
}