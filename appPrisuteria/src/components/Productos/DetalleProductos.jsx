import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import ProductoService from '../../services/ProductoService';
import PropTypes from 'prop-types';
import { IconButton, Box, Rating, Divider } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Chip } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { FormResena } from './Forms/FormResena';

export function DetalleProductos({ addItem }) {
  const routeParams = useParams();
  //Url para acceder a la imagenes guardadas en el API
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads'
  //Resultado de consumo del API, respuesta
  const [data, setData] = useState(null);
  //Error del APIs
  const [error] = useState('');
  //Booleano para establecer sí se ha recibido respuesta
  const [loaded, setLoaded] = useState(false);

  const navigate = useNavigate();

  // Función para formatear fecha correctamente
  const formatearFecha = (fecha) => {
    console.log('Fecha recibida:', fecha, 'Tipo:', typeof fecha);
    
    if (!fecha) return 'Fecha no disponible';

    try {
      let fechaObj;
      
      // Si ya es un objeto Date
      if (fecha instanceof Date) {
        fechaObj = fecha;
      } 
      // Si es string, intentar parsear
      else if (typeof fecha === 'string') {
        // Manejar diferentes formatos de fecha de MySQL
        if (fecha.includes('T')) {
          fechaObj = new Date(fecha); // ISO format
        } else {
          // Formato MySQL YYYY-MM-DD HH:MM:SS
          fechaObj = new Date(fecha.replace(' ', 'T'));
        }
      } 
      // Si es número (timestamp)
      else if (typeof fecha === 'number') {
        fechaObj = new Date(fecha);
      } else {
        return 'Fecha no disponible';
      }

      // Verificar si la fecha es válida
      if (isNaN(fechaObj.getTime())) {
        console.log('Fecha inválida:', fecha);
        return 'Fecha no disponible';
      }

      // Formatear la fecha
      return fechaObj.toLocaleDateString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      console.log('Error al formatear fecha:', err);
      return 'Fecha no disponible';
    }
  };

  useEffect(() => {
    ProductoService.getProductoById(routeParams.id)
      .then((response) => {
        const producto = response.data;
        producto.etiquetas = producto.etiquetas || []; // aseguramos array
        producto.resenas = producto.resenas || [];
        producto.promedio_valoracion = producto.promedio_valoracion || 0;
        setData(producto);
        setLoaded(true);
      })
      .catch((err) => {
        console.error('Error al cargar producto:', err);
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

        <Grid item xs={12} md={6}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 'bold', color: '#d83b6a' }}
          >
            {data.nombre}
          </Typography>

          {data.precio_con_descuento && data.precio_con_descuento !== data.precio ? (
            <>
              <Typography sx={{ textDecoration: 'line-through', color: 'gray' }}>
                ₡{Number(data.precio).toLocaleString()}
              </Typography>
              <Typography variant="h5" sx={{ color: '#d83b6a', fontWeight: 'bold' }}>
                ₡{Math.round(data.precio_con_descuento).toLocaleString()}
              </Typography>

              {(data.descuento_producto || data.descuento_categoria) && (
                <Typography variant="caption" color="primary">
                  {data.nombre_promocion_producto && `${data.nombre_promocion_producto} `}
                  {data.nombre_promocion_categoria && `${data.nombre_promocion_categoria}`}
                </Typography>
              )}

              {data.nombre_promocion && (
                <Typography variant="caption" color="primary">
                  {data.nombre_promocion}
                  {Number(data.descuento) > 0 ? ` (-${data.descuento}%)` : ''}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="h5">
              ₡{Number(data.precio).toLocaleString()}
            </Typography>
          )}

          <Typography variant="subtitle1" gutterBottom color="text.secondary">
            {data.descripcion}
          </Typography>

          <Typography variant="body1" gutterBottom>
            <strong>Categoría:</strong> {data.nombreSCategoria}
          </Typography>

          {typeof data.etiquetas === 'string' && data.etiquetas.length > 0 ? (
            data.etiquetas.split(',').map((etiqueta, index) => (
              <Chip
                key={index}
                label={etiqueta.trim()}
                variant="outlined"
                color="primary"
                sx={{ mr: 1, mb: 1 }}
              />
            ))
          ) : <Typography variant="body2"></Typography>}

          {/* Valoración promedio */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ mr: 1 }}>
              <strong>Valoración promedio:</strong>
            </Typography>
            {data.promedio_valoracion > 0 ? (
              <>
                <Rating
                  value={parseFloat(data.promedio_valoracion)}
                  precision={0.1}
                  readOnly
                  size="small"
                />
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Sin valoraciones
              </Typography>
            )}
          </Box>

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

        {/* Sección de Reseñas  */}
        <Grid item xs={12}>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom sx={{ color: '#d83b6a' }}>
            Reseñas del producto
        
          </Typography>

          {/* Lista de reseñas existentes */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {Array.isArray(data.resenas) && data.resenas.length > 0 ? (
              data.resenas
                .filter(resena => resena && !resena.status && resena.resenasId) // Filtrar errores
                .map((resena, index) => {
                  // Debuggggggggggggg
                  console.log('Datos de reseña válida:', resena);

                return (
                  <Grid
                    item
                    xs={12}
                    key={resena.resenasId || index}
                    sx={{
                      mb: 2,
                      borderBottom: '1px solid #d83b6a',
                      pb: 2,
                      backgroundColor: '#f9f9f9',
                      borderRadius: 1,
                      p: 2
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {resena.nombre || resena.usuario_nombre || 'Usuario anónimo'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {formatearFecha(resena.fecha)}
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {resena.comentario || 'Sin comentario'}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating
                        value={parseInt(resena.calificacion) || 0}
                        readOnly
                        size="small"
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({resena.calificacion })
                      </Typography>
                    </Box>
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  No hay reseñas para este producto. ¡Sé el primero en escribir una!
                </Typography>
              </Grid>
            )}
          </Grid>

          {/* Formulario para nueva reseña */}
          <FormResena
            productoId={parseInt(routeParams.id)}
            onNuevaResena={(nuevaResena, nuevoPromedio) => {
              console.log('Nueva reseña recibida:', nuevaResena);
              console.log('Nuevo promedio:', nuevoPromedio);

              // Solo actualizar si la reseña es válida (no es un error)
              if (nuevaResena && !nuevaResena.status && nuevaResena.resenasId) {
                setData((prevData) => ({
                  ...prevData,
                  resenas: [nuevaResena, ...(prevData.resenas || [])],
                  promedio_valoracion: nuevoPromedio || prevData.promedio_valoracion,
                }));
              } else {
                console.error('Error al agregar reseña:', nuevaResena);
              }
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

DetalleProductos.propTypes = {
  addItem: PropTypes.func.isRequired,
};