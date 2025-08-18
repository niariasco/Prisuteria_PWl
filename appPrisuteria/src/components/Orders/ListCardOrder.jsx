import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import { Info } from '@mui/icons-material';

ListCardOrder.propTypes = {
  data: PropTypes.array.isRequired
};

export function ListCardOrder({ data }) {
  return (
    <Grid container sx={{ p: 2 }} spacing={3}>
      {data && data.map((orden) => (
        <Grid item xs={12} sm={6} md={4} key={orden.ordenesId}>
          <Card>
            <CardHeader
              title={`Numero de Orden: ${orden.ordenesId}`}
              sx={{
                backgroundColor: '#ce9fc4',
                color: 'white',
                textAlign: 'center'
              }}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Fecha: {new Date(orden.fecha).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Estado: {orden.estado}
              </Typography>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <IconButton
                    component={Link}
                    to={`/orden/${orden.ordenesId}`}
                    aria-label="Detalle"
                  >
                    <Info />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}