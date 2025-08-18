import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderService from '../../services/OrderService';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { Info, ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// Componente ListCardOrder como exportación nombrada
export function ListCardOrder({ data }) {
  return (
    <Grid container sx={{ p: 2 }} spacing={3}>
      {data && data.map((orden) => (
        <Grid item xs={12} sm={6} md={4} key={orden.ordenesId}>
          <Card sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }
          }}>
            <CardHeader
              title={`Orden #${orden.ordenesId}`}
              sx={{
                backgroundColor: '#ce9fc4',
                color: 'white',
                textAlign: 'center',
                '& .MuiCardHeader-title': {
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }
              }}
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Fecha:</strong> {new Date(orden.fecha).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Estado:</strong> 
                <span style={{ 
                  color: orden.estado === 'Pagado' ? '#4caf50' : '#ff9800',
                  fontWeight: 'bold',
                  marginLeft: 4
                }}>
                  {orden.estado}
                </span>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Total:</strong> ₡{parseFloat(orden.total || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Método:</strong> {orden.metodo_pago}
              </Typography>
              
              <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton
                  component={Link}
                  to={`/orden/${orden.ordenesId}`}
                  aria-label="Ver Detalle"
                  sx={{
                    backgroundColor: '#d83b6a',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#c2185b'
                    }
                  }}
                >
                  <Info />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

ListCardOrder.propTypes = {
  data: PropTypes.array.isRequired
};

// Componente principal de la página de órdenes
export default function OrdenesPage() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        setLoading(true);
        const response = await OrderService.getAll();
        console.log('Órdenes cargadas:', response.data);
        setOrdenes(response.data || []);
      } catch (err) {
        console.error('Error al cargar órdenes:', err);
        setError('Error al cargar las órdenes. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    cargarOrdenes();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#ce9fc4' }} />
          <Typography variant="h6" sx={{ mt: 2, color: '#ce9fc4' }}>
            Cargando órdenes...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ 
              backgroundColor: '#ce9fc4',
              '&:hover': { backgroundColor: '#b388b5' }
            }}
          >
            Reintentar
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ 
            mr: 2,
            backgroundColor: '#f5f5f5',
            '&:hover': { backgroundColor: '#e0e0e0' }
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#d83b6a',
            flexGrow: 1
          }}
        >
          Mis Órdenes
        </Typography>
      </Box>

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ backgroundColor: '#e8f5e8', border: '1px solid #4caf50' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {ordenes.filter(o => o.estado === 'Pagado').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Órdenes Pagadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ backgroundColor: '#fff3e0', border: '1px solid #ff9800' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                {ordenes.filter(o => o.estado === 'Pendiente').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Órdenes Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ backgroundColor: '#f3e5f5', border: '1px solid #ce9fc4' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#ce9fc4', fontWeight: 'bold' }}>
                {ordenes.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Órdenes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de órdenes */}
      {ordenes.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No tienes órdenes registradas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Cuando realices tu primera compra, aparecerá aquí.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/productos')}
            sx={{ 
              backgroundColor: '#ce9fc4',
              '&:hover': { backgroundColor: '#b388b5' }
            }}
          >
            Explorar Productos
          </Button>
        </Card>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 2, color: '#555' }}>
            Todas tus órdenes ({ordenes.length})
          </Typography>
          <ListCardOrder data={ordenes} />
        </>
      )}
    </Container>
  );
}