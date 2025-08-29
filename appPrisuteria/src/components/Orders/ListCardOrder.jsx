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

  // Función para obtener el estado traducido - CORREGIDA
  const getTranslatedStatus = (status) => {
    // Verificar si el estado está vacío, es null, undefined o string vacío
    if (!status || status === '' || status === 'null' || status === 'undefined') {
      return t('orders.status_paid', 'Pagado'); // Por defecto "Pagado" para órdenes completadas
    }
    
    // Convertir a string y limpiar espacios
    const cleanStatus = String(status).trim();
    
    // Mapeo directo de estados comunes
    const statusMap = {
      'Pendiente': t('order_states.pending', 'Pendiente'),
      'Confirmado': t('order_states.confirmed', 'Confirmado'),
      'En Proceso': t('order_states.in_process', 'En Proceso'),
      'Enviado': t('order_states.shipped', 'Enviado'),
      'Entregado': t('order_states.delivered', 'Entregado'),
      'Cancelado': t('order_states.cancelled', 'Cancelado'),
      'Pagado': t('order_states.paid', 'Pagado'),
      'Pago Orden completa': t('order_states.paid', 'Pagado'),
      'En Preparación': t('order_states.preparing', 'En Preparación'),
      'Listo': t('order_states.ready', 'Listo')
    };
    
    // Devolver traducción si existe, sino el estado original limpio
    return statusMap[cleanStatus] || cleanStatus;
  };

  // Función para formatear la fecha según el idioma
  const formatDate = (dateString) => {
    if (!dateString) return t('orders.date_not_available', 'N/A');
    
    try {
      const date = new Date(dateString);
      const locale = i18n.language === 'en' ? 'en-US' : 'es-ES';
      
      return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Error al formatear fecha:', error);
      return dateString;
    }
  };

  // Función para obtener color del estado - CORREGIDA
  const getStatusColor = (status) => {
    // Si no hay estado, devolver color verde para "Pagado"
    if (!status || status === '' || status === 'null' || status === 'undefined') {
      return '#4caf50'; // Verde - por defecto "Pagado"
    }
    
    const cleanStatus = String(status).trim();
    
    const statusColors = {
      'Pendiente': '#ff9800',     // Naranja - pendiente de procesar
      'Confirmado': '#4caf50',    // Verde - confirmado
      'En Proceso': '#2196f3',    // Azul - en proceso
      'Enviado': '#9c27b0',       // Morado - enviado
      'Entregado': '#4caf50',     // Verde - entregado exitosamente
      'Cancelado': '#f44336',     // Rojo - cancelado
      'Pagado': '#4caf50',        // Verde - pago completado
      'En Preparación': '#ff5722', // Naranja rojizo - preparando
      'Listo': '#8bc34a'          // Verde claro - listo para envío
    };
    
    return statusColors[cleanStatus] || '#4caf50'; // Verde por defecto
  };

  if (!data || data.length === 0) {
    return (
      <Grid container sx={{ p: 2 }} spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" color="text.secondary" textAlign="center">
            {t('orders.no_orders', 'No hay órdenes disponibles')}
          </Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container sx={{ p: 2 }} spacing={3}>
      {data.map((orden) => {
        return (
          <Grid item xs={12} sm={6} md={4} key={orden.ordenesId || orden.id}>
            <Card sx={{ 
              height: '100%',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardHeader
                title={`${t('orders.order_number', 'Número de Orden')}: ${orden.ordenesId || orden.id}`}
                sx={{
                  backgroundColor: '#ce9fc4',
                  color: 'white',
                  textAlign: 'center',
                  pb: 1
                }}
              />
              <CardContent sx={{ pt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>{t('orders.date', 'Fecha')}:</strong> {formatDate(orden.fecha)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <strong>{t('orders.status', 'Estado')}:</strong>
                  <span 
                    style={{ 
                      marginLeft: '8px',
                      backgroundColor: getStatusColor(orden.estado),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {getTranslatedStatus(orden.estado)}
                  </span>
                </Typography>
                
                {/* Información adicional si está disponible */}
                {orden.total && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>{t('orders.total', 'Total')}:</strong> ₡{parseFloat(orden.total).toLocaleString()}
                  </Typography>
                )}
                
                <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                  <Grid item>
                    <IconButton
                      component={Link}
                      to={`/orden/${orden.ordenesId || orden.id}`}
                      aria-label={t('orders.detail', 'Ver detalle')}
                      sx={{
                        backgroundColor: '#f5f5f5',
                        '&:hover': {
                          backgroundColor: '#e0e0e0',
                          color: '#ce9fc4'
                        }
                      }}
                    >
                      <Info />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}