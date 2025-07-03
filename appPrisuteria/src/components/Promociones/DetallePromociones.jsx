import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// MUI Components
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

// Icons
import StarIcon from '@mui/icons-material/Star';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DiscountIcon from '@mui/icons-material/Discount';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

// Services
import PromocionService from '../../services/PromocionService';

export function DetallePromociones({ addItem }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    PromocionService.getPromocionById(id)
      .then((response) => {
        setData(response.data);
        setLoaded(true);
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      });
  }, [id]);

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      py: 6,
    }}>
      <Container maxWidth="xl">
        {/* Heade */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 2,
            padding: '12px 24px',
            backgroundColor: 'rgba(216, 59, 106, 0.1)',
            borderRadius: '50px',
            border: '2px solid rgba(216, 59, 106, 0.2)',
          }}>
            <StarIcon sx={{ color: '#d83b6a', fontSize: 30 }} />
            <Typography 
              component="h1" 
              variant="h3" 
              sx={{ 
                color: '#d83b6a',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                background: 'linear-gradient(45deg, #d83b6a, #ff6b9d)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Promociones Prisutería Accesorios
            </Typography>
            <StarIcon sx={{ color: '#d83b6a', fontSize: 30 }} />
          </Box>
          
        
          
          <Divider sx={{ 
            maxWidth: 200, 
            mx: 'auto', 
            borderWidth: 2, 
            borderColor: '#d83b6a',
            borderRadius: 2,
          }} />
        </Box>

        {/* Detalle visual de la promoción */}
        <Container maxWidth="sm">
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: 4,
              boxShadow: 3,
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" sx={{ color: '#d83b6a', fontWeight: 'bold', mb: 3 }}>
              Detalle de la Promoción
            </Typography>

            <Typography variant="h6" sx={{ mb: 1 }}>
              <strong>Nombre:</strong> {data.nombre}
            </Typography>

            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Tipo:</strong> {data.tipo}
            </Typography>

            <Typography variant="body1" sx={{ mb: 1 }}>
  <strong>Aplicado en:</strong>{' '}
  {data.tipo === 'Categoria' && data.nombre_categoria
    ? data.nombre_categoria
    : data.tipo === 'Producto' && data.nombre_producto
    ? data.nombre_producto
    : 'N/A'}
</Typography>


            <Typography
              variant="h5"
              sx={{ color: 'green', fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
            >
              <DiscountIcon fontSize="small" />
              -{data.descuento}% 
            </Typography>

            <Typography variant="body1" sx={{ mb: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
              <CalendarMonthIcon fontSize="small" />
              <strong>Inicio:</strong> {data.fecha_inicio}
            </Typography>

            <Typography variant="body1" sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
              <CalendarMonthIcon fontSize="small" />
              <strong>Fin:</strong> {data.fecha_fin}
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Estado:
            </Typography>

            <Chip
              label={data.Estado}
              icon={<LocalOfferIcon />}
              sx={{
                backgroundColor: data.color_estado || '#ccc',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '1rem',
                mb: 3,
                px: 2,
                py: 1,
              }}
            />

            <Divider sx={{ my: 3 }} />

            <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
              ← Volver
            </Button>
          </Box>
        </Container>
      </Container>
    </Box>
  );
}
