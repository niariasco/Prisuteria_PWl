import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import ProductoService from '../../services/ProductoService';
import PropTypes from 'prop-types';
import {  IconButton } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Chip } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';

  export function DetalleProductos({ /*isShopping,*/ addItem  }) {
  const routeParams = useParams();
  //Url para acceder a la imagenes guardadas en el API
  const BASE_URL = import.meta.env.VITE_BASE_URL+'uploads'
  //Resultado de consumo del API, respuesta
  const [data, setData] = useState(null);
  //Error del APIs
  const [error, setError] = useState('');
  //Booleano para establecer sí se ha recibido respuesta
  const [loaded, setLoaded] = useState(false);
    const navigate = useNavigate();
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
      console.error('Error al cargar reseñas:', error);
    });
}, [routeParams.id]);



  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Grid container spacing={4}>
        {/* Imagen del producto */}
<Grid item xs={12} md={6}>
  {data.imagenes && data.imagenes.length > 0 ? (
    data.imagenes.length === 1 ? (
      <img
        src={`${BASE_URL}/${data.imagenes[0]}`}
        alt="producto"
        style={{
          width: '100%',
          maxHeight: 400,
          objectFit: 'contain',
          borderRadius: 10
        }}
      />
    ) : (
      <Slider
        dots={true}
        infinite={true}
        speed={500}
        slidesToShow={1}
        slidesToScroll={1}
        arrows
      >
        {data.imagenes.map((img, index) => (
          <div key={index}>
            <img
              src={`${BASE_URL}/${img}`}
              alt={`img-${index}`}
              style={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'contain',
                borderRadius: 10
              }}
            />
          </div>
        ))}
      </Slider>
    )
  ) : (
    <Typography variant="body2">Sin imágenes disponibles</Typography>
  )}
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


{data.etiquetas
  ? data.etiquetas.split(', ').map((etiqueta, index) => (
      <Chip
        key={index}
        label={etiqueta}
        variant="outlined"
        color="primary"
        sx={{ mr: 1, mb: 1 }}
      />
    ))
  : <Typography variant="body2"></Typography>}

          <Typography variant="body1" gutterBottom>
             <strong> Valoración promedio: </strong>
            {data.promedio_valoracion &&
              '⭐'.repeat(Math.round(data.promedio_valoracion))}
          </Typography>

   
          <IconButton
            aria-label="Comprar"
            sx={{ 
              ml: 'auto',
              backgroundColor: '#d83b6a',
              color: 'white',
              '&:hover': {
                backgroundColor: '#b03052',
              },
              padding: '12px',
              borderRadius: '8px'
            }}
            onClick={() => addItem(data)}
          >
            <AddShoppingCartIcon sx={{ mr: 1 }} />
            <Typography component="span" variant="body1">
              Agregar al carrito
            </Typography>
          </IconButton>

             <Typography variant="body1" gutterBottom sx={{ color: '#d83b6a' }}>
            {'_________________________________________________'}
          </Typography>
         <Typography variant="body1" gutterBottom sx={{ color: '#d83b6a' }}>
            {'Retiro disponible en Retiro en Heredia'}
          </Typography>
           <Typography variant="body1" gutterBottom sx={{ color: '#d83b6a' }}>
               {'Normalmente está listo en 24 horas'}
          </Typography>
        </Grid>
      </Grid>

        <Grid item xs={12}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            ← Volver
          </Button>
        </Grid>

<Grid item xs={12}>
  <Typography variant="h5" gutterBottom sx={{ mt: 4, color: '#d83b6a' }}>
    Reseñas
  </Typography>

 {data.resenas?.length === 0 ? (
  <Typography>No hay reseñas para este producto.</Typography>
) : (
  data.resenas.map((resena, index) => (
    <Grid item xs={12} 
    key={index} 
    sx={{ mb: 2, 
    borderBottom: '1px solid #d83b6a ', //linea separadora
    pb: 2}}> 
      <Typography variant="subtitle1">
        <strong>{resena.nombre}</strong> - {new Date(resena.fecha).toLocaleDateString()}
      </Typography>
      <Typography variant="body2">{resena.comentario}</Typography>
      <Typography variant="body2">
        {'⭐'.repeat(resena.calificacion)} ({resena.calificacion}/5)
      </Typography>
    </Grid>
  ))
)}
</Grid>
    
    </Container>
  );
}
/*después de la declaración del componente para que funcione correctamente.*/
  DetalleProductos.propTypes = { /*propiedades correctas en el formato esperado*/
  isShopping: PropTypes.bool.isRequired,
  addItem: PropTypes.func.isRequired,
  item: PropTypes.object.isRequired,
};
  

/* {isShopping && (  )}*/

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