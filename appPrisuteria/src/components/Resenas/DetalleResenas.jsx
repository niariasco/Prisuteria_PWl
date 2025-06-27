import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import ResenaService from '../../services/ResenaService';

export function DetalleResenas() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    ResenaService.getId(id)
      .then((response) => {
        setData(response.data[0]); 
        setLoaded(true);
      })
      .catch((error) => {
        setError(error.message || 'Error al obtener la reseña');
        setLoaded(true);
      });
  }, [id]);

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>No se encontró la reseña.</p>;

  const estrellas = '⭐'.repeat(Math.round(data.calificacion));

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#d83b6a' }}>
        Detalle de Reseña
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            <strong>Usuario:</strong>
          </Typography>
          <Typography variant="h6" gutterBottom>
            <strong>Producto:</strong> {data.nombre_usuario}
          </Typography>
          <Typography variant="h6" gutterBottom>
            <strong>Fecha:</strong> {new Date(data.fecha).toLocaleDateString()}
          </Typography>
          <Typography variant="h6" gutterBottom>
            <strong>Comentario:</strong> {data.comentario}
          </Typography>
          <Typography variant="h6" gutterBottom>
            <strong>Calificación:</strong> {estrellas} ({data.calificacion}/5)
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}
 //?(no lanza error)