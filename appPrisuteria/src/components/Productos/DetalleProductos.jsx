/*import React from 'react';*/
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
//import ticket from '../../assets/ticket.jpg';
import ProductoService from '../../services/ProductoService';

export function DetalleProductos() {
  const routeParams = useParams();
  console.log(routeParams);
  //Url para acceder a la imagenes guardadas en el API
  const BASE_URL = import.meta.env.VITE_BASE_URL+'uploads'
  //Resultado de consumo del API, respuesta
  const [data, setData] = useState(null);
  //Error del API
  const [error, setError] = useState('');
  //Booleano para establecer sí se ha recibido respuesta
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    //Llamar al API y obtener una Producto
    ProductoService.getProductoById(routeParams.id)
      .then((response) => {
        setData(response.data);
        console.log(response.data);
        setError(response.error);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        throw new Error('Respuesta no válida del servidor');
      });
  }, [routeParams.id]);

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
   <Container component="main" sx={{ mt: 8, mb: 2 }}>
      {data && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Box
              component="img"
              sx={{
                borderRadius: 2,
                maxWidth: '40%',
                height: 'auto',
              }}
              alt={data.nombre}
              src={`${BASE_URL}/${data.imagen || 'default.jpg'}`}
            />
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography variant="h4" gutterBottom>
              {data.nombre}
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              Categoría: {data.categoria || 'N/A'}
            </Typography>

            <Typography variant="body1" gutterBottom>
              {data.descripcion}
            </Typography>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
