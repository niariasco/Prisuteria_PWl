// React
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// MUI Components
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

// MUI Icons
import StarIcon from '@mui/icons-material/Star';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

// Services
import PromocionService from '../../services/PromocionService';

export function DetallePromociones({ addItem }) {
  const routeParams = useParams();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    PromocionService.getPromocionById(routeParams.id)
      .then((response) => {
        setData(response.data);
        setError(response.error);
        setLoaded(true);
      })
      .catch((error) => {
        console.error(error);
        setError(error);
        throw new Error('Respuesta no válida del servidor');
      });
  }, [routeParams.id]);

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Container>
      <Grid container spacing={4}>
        {/* Detalles del producto */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#d83b6a' }}>
            Detalle de Promoción
          </Typography>

          <Typography variant="body1"
                    sx={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            Nombre de la promoción:{data.nombre} 
          </Typography>

          <Typography variant="subtitle1" gutterBottom color="text.secondary">
            {data.descripcion}
          </Typography>

          <Typography variant="body1" gutterBottom>
            <strong>Categoría:</strong> {data.nombreSCategoria}
          </Typography>

          {data.etiquetas ? (
            data.etiquetas.split(', ').map((etiqueta, index) => (
              <Chip
                key={index}
                label={etiqueta}
                variant="outlined"
                color="primary"
                sx={{ mr: 1, mb: 1 }}
              />
            ))
          ) : (
            <Typography variant="body2"></Typography>
          )}

          <Typography variant="body1" gutterBottom>
            <strong>Valoración promedio:</strong>{' '}
            {data.promedio_valoracion && '⭐'.repeat(Math.round(data.promedio_valoracion))}
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
              borderRadius: '8px',
              mt: 2,
            }}
            onClick={() => addItem(data)}
          >
            <AddShoppingCartIcon sx={{ mr: 1 }} />
            <Typography component="span" variant="body1">
              Agregar al carrito
            </Typography>
          </IconButton>

          <Typography variant="body1" gutterBottom sx={{ color: '#d83b6a', mt: 3 }}>
            _________________________________________________
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: '#d83b6a' }}>
            Retiro disponible en Retiro en Heredia
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: '#d83b6a' }}>
            Normalmente está listo en 24 horas
          </Typography>
        </Grid>

        {/* Botón volver */}
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

        {/* Reseñas */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 4, color: '#d83b6a' }}>
            Reseñas
          </Typography>

          {data.resenas?.length === 0 ? (
            <Typography>No hay reseñas para este producto.</Typography>
          ) : (
            data.resenas.map((resena, index) => (
              <Grid
                item
                xs={12}
                key={index}
                sx={{ mb: 2, borderBottom: '1px solid #d83b6a', pb: 2 }}
              >
                <Typography variant="subtitle1">
                  <strong>{resena.nombre}</strong> -{' '}
                  {new Date(resena.fecha).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">{resena.comentario}</Typography>
                <Typography variant="body2">
                  {'⭐'.repeat(resena.calificacion)} ({resena.calificacion}/5)
                </Typography>
              </Grid>
            ))
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
