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
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 3,
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.015)',
                boxShadow: 6,
              },
            }}
          >
            <CardHeader
              title={
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {resena.nombre_usuario}
                </Typography>
              }
              sx={{
                background: 'linear-gradient(135deg, #F8BBD0 0%, #D1C4E9 100%)',
                color: '#fff',
                textAlign: 'center',
                py: 2,
              }}
            />
            <CardContent sx={{ backgroundColor: '#fff', minHeight: 200 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#d83b6a' }}>
                Producto:
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {resena.nombre}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#d83b6a', mt: 2 }}>
                Comentario:
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {resena.comentario}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#d83b6a', mt: 2 }}>
                Valoración:
              </Typography>
              <Rating
                value={resena.calificacion || 0}
                max={5}
                precision={0.5}
                readOnly
                sx={{ color: '#f06292', mt: 0.5 }}
              />

              <Grid container justifyContent="flex-end" mt={2}>
                <IconButton
                  component={Link}
                  to={`/resena/${resena.resenasId}`}
                  aria-label="Detalle"
                  sx={{
                    color: '#d83b6a',
                    border: '1px solid #f8bbd0',
                    borderRadius: 2,
                    transition: '0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f8bbd0',
                      color: '#fff',
                    },
                  }}
                >
                  <Info />
                </IconButton>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
