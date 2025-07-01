/*import React from 'react';*/
import { useEffect } from 'react'
import { useState } from 'react';
import PromocionService from '../../services/PromocionService';
import { ListaCartasPromocion } from './ListaCartasPromocion';


export function ListaPromociones() {
  //Resultado de consumo del API, respuesta
  const [data, setData] = useState(null);
  //Error del API
  const [error, setError] = useState('');
  //Booleano para establecer sí se ha recibido respuesta
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
      PromocionService.getallPromociones()
      .then((response) => {
        console.log(response);
        setData(response.data);
        setError(response.error);
        setError(response.error || ''); 
        setLoaded(true);       
      })                                      
      .catch((error) => {
        if (error instanceof SyntaxError) {
          setError(error);
          setLoaded(false);
        }
      });
  }, []);

  if(!loaded) return <p>Cargando...</p>
  if(error) return <p>Error: {error.message}</p>
  return <>{data && <ListaCartasPromocion data={data} isShopping={true} />}</> 
  
}