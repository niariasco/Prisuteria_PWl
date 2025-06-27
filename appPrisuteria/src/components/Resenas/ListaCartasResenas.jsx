import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Rating from '@mui/material/Rating';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Info } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';

ListaCartasResenas.propTypes = {
  data: PropTypes.array.isRequired
};

export function ListaCartasResenas({ data }) {
  return (
    <Grid container sx={{ p: 2 }} spacing={3}>
      {data && data.map((resena) => (
        <Grid item xs={12} sm={6} md={4} key={resena.resenasId}>
          <Card>
            <CardHeader
              title={`Usuario: ${resena.nombre_usuario}`}
              subheader={`${resena.nombre}`}
              sx={{
                backgroundColor: '#d83b6a',
                color: 'white',
                textAlign: 'center'
              }}
            />
            <CardContent>
              <Typography variant="body1" gutterBottom>
                <strong>Fecha de la reseña:</strong> {new Date(resena.fecha).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Comentario:</strong> {resena.comentario || 'Sin comentario'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Valoración:</strong>
              </Typography>
              <Rating
                value={resena.calificacion || 0}
                max={5} // Cambiar a 10 si se desea usar una escala de 1 a 10
                precision={1}
                readOnly
              />
              <IconButton
             component={Link}
              to={`/resena/${resena.resenasId}`}
               aria-label="Detalle"
                sx={{ ml: 'auto' }}
                 >
                 <Info />
           </IconButton>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
