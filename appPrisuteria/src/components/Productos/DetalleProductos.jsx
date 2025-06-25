import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import ProductoService from '../../services/ProductoService';
import PropTypes from 'prop-types';
import {  IconButton } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

  export function DetalleProductos({ isShopping, addItem }) {
  const routeParams = useParams();
  
  //console.log(routeParams);
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
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Grid container spacing={4}>
        {/* Imagen del producto */}
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            sx={{
              width: '60%',
              borderRadius: 2,
              objectFit: 'cover',
              boxShadow: 3,
            }}
            alt={data.nombre}
            src={`${BASE_URL}/${data.imagen || 'default.jpg'}`}
          />
        </Grid>

        {/* Detalles del producto */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 'bold', color: '#d83b6a' }}
          >
            {data.nombre}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ color: '#444' }}>
            ₡{Number(data.precio).toLocaleString()} CRC
          </Typography>

          <Typography variant="subtitle1" gutterBottom color="text.secondary">
            {data.descripcion}
          </Typography>

          <Typography variant="body1" gutterBottom>
            <strong>Categoría:</strong> {data.nombreSCategoria}
          </Typography>

          <Typography variant="body1" gutterBottom>
            Valoración promedio: 
            {data.promedio_valoracion &&
              '⭐'.repeat(Math.round(data.promedio_valoracion))}
          </Typography>

  {/* Botón de agregar al carrito */}
          {isShopping && (
            <Box sx={{ mt: 3, mb: 3 }}>
              <IconButton
                aria-label="Agregar al carrito"
                onClick={() => addItem(data)}
                sx={{ 
                  backgroundColor: '#d83b6a',
                  color: 'black',
                  padding: 2,
                  '&:hover': {
                    backgroundColor: '#c23456'
                  }
                }}
              >
                <AddShoppingCartIcon />
              </IconButton>
            </Box>
          )}


        </Grid>
      </Grid>
    </Container>
  );
}

DetalleProductos.propTypes = {
  isShopping: PropTypes.bool.isRequired,
  addItem: PropTypes.func.isRequired,
  item: PropTypes.object.isRequired,
};
/*            <Button variant="contained" size="large" sx={{ backgroundColor: '#d83b6a', textTransform: 'none' }}>
              Comprar ahora
            </Button>*/
            /*export function DetalleProductos() {
  const routeParams = useParams();*/

  /*
  import { Divider } from '@mui/material';
            <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              <strong>Material:</strong>
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              <strong>Detalles:</strong>
            </Typography>

          </Box>
  */

          /*
          
                 <Typography variant="body1" gutterBottom>
            Valoración promedio: {data.promedio_valoracion ?? 'Sin valoraciones'}{' '}
            {data.promedio_valoracion &&
              '⭐'.repeat(Math.round(data.promedio_valoracion))}
          </Typography>

          */