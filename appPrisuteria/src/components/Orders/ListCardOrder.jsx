import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import { Info } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

ListCardOrder.propTypes = {
  data: PropTypes.array.isRequired
};

export function ListCardOrder({ data }) {
  const { t, i18n } = useTranslation();

  // Función para obtener el estado traducido
  const getTranslatedStatus = (status) => {
    const currentLang = i18n.language;
    
    // Intentar obtener las traducciones de estados de orden
    try {
      const orderStates = t('order_states', { returnObjects: true });
      
      if (orderStates && orderStates[currentLang] && orderStates[currentLang][status]) {
        return orderStates[currentLang][status];
      }
      
      // Si no encuentra la traducción, intentar directamente con la clave
      const directTranslation = t(`order_states.${currentLang}.${status}`, { defaultValue: status });
      if (directTranslation !== status) {
        return directTranslation;
      }
    } catch (error) {
      console.warn('Error al traducir estado:', error);
    }
    
    // Fallback: devolver el estado original
    return status;
  };

  // Función para formatear la fecha según el idioma
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'en' ? 'en-US' : 'es-ES';
    
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Grid container sx={{ p: 2 }} spacing={3}>
      {data && data.map((orden) => (
        <Grid item xs={12} sm={6} md={4} key={orden.ordenesId}>
          <Card>
            <CardHeader
              title={`${t('orders.order_number', 'Número de Orden')}: ${orden.ordenesId}`}
              sx={{
                backgroundColor: '#ce9fc4',
                color: 'white',
                textAlign: 'center'
              }}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {t('orders.date', 'Fecha')}: {formatDate(orden.fecha)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('orders.status', 'Estado')}: {getTranslatedStatus(orden.estado)}
              </Typography>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <IconButton
                    component={Link}
                    to={`/orden/${orden.ordenesId}`}
                    aria-label={t('orders.detail', 'Detalle')}
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