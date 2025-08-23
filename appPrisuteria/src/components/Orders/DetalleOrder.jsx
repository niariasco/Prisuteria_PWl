import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OrderService from '../../services/OrderService';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';

export function DetalleOrder() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    OrderService.getById(id)
      .then((res) => {
        console.log('Datos recibidos:', res.data);
        setOrden(res.data);
        setLoaded(true);
      })
      .catch((err) => {
        setError(err.message || t('order_detail.error', { message: 'Error al cargar orden' }));
      });
  }, [id, t]);

  if (!loaded) return <p>{t('order_detail.loading', 'Cargando...')}</p>;
  if (error) return <p>{error}</p>;

  const { pedido, productos = [], personalizados = [] } = orden || {};

  const subtotalCalculado =
    (productos || []).reduce((acc, p) => acc + parseFloat(p.subtotal || 0), 0) +
    (personalizados || []).reduce((acc, p) => acc + (p.total_personalizado || 0), 0);

  const impuestosCalculados = subtotalCalculado * 0.13;
  const totalCalculado = subtotalCalculado + impuestosCalculados;

  // Función para traducir estados de orden
  const translateOrderState = (state) => {
    if (!state) return t('order_detail.not_available', 'N/A');
    
    // Usar las traducciones de estados de orden del i18n
    const translatedState = t(`order_states.${state}`, state);
    return translatedState !== state ? translatedState : state;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#d83b6a' }}>
        {t('order_detail.invoice_title', 'Factura - Orden #{{orderNumber}}', { orderNumber: pedido?.ordenesId })}
      </Typography>

      <Typography variant="body1" gutterBottom>
        <strong>{t('order_detail.date', 'Fecha')}:</strong> {pedido?.fecha ? new Date(pedido.fecha).toLocaleString() : t('order_detail.not_available', 'N/A')}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>{t('order_detail.customer', 'Cliente')}:</strong> {pedido?.nombre_usuario || t('order_detail.not_available', 'N/A')}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>{t('order_detail.address', 'Dirección')}:</strong> {pedido?.direccion_envio || t('order_detail.not_available', 'N/A')}
      </Typography>

      <Typography variant="h6" sx={{ mt: 4, color: '#ce9fc4' }}>
        {t('order_detail.products', 'Productos')}
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('order_detail.product_name', 'Producto')}</TableCell>
            <TableCell>{t('order_detail.quantity', 'Cantidad')}</TableCell>
            <TableCell>{t('order_detail.unit_price', 'Precio Unitario')}</TableCell>
            <TableCell>{t('order_detail.subtotal', 'Subtotal')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(productos || []).map((p, idx) => (
            <TableRow key={idx}>
              <TableCell>{p.nombre}</TableCell>
              <TableCell>{p.cantidad}</TableCell>
              <TableCell>
                {p.precio_original && p.precio_original > p.precio_unitario ? (
                  <>
                    <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: 6 }}>
                      ₡{parseFloat(p.precio_original).toLocaleString()}
                    </span>
                    <span style={{ color: '#d83b6a', fontWeight: 'bold' }}>
                      ₡{parseFloat(p.precio_unitario).toLocaleString()}
                    </span>
                  </>
                ) : (
                  `₡${parseFloat(p.precio_unitario || 0).toLocaleString()}`
                )}
              </TableCell>
              <TableCell>₡{parseFloat(p.subtotal || 0).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {personalizados.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 4, color: '#ce9fc4' }}>
            {t('order_detail.customized_products', 'Productos Personalizados')}
          </Typography>
          {personalizados.map((prod, idx) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              <Typography variant="subtitle1">
                <strong>{prod.nombre}</strong> - {t('order_detail.base', 'Base')}: ₡{(prod.costo_base || 0).toLocaleString()}
              </Typography>
              <ul>
                {(prod.criterios || []).map((crit, i) => (
                  <li key={i}>
                    {crit.nombre_criterio}: {crit.opcion} (₡{(crit.costo || 0).toLocaleString()})
                  </li>
                ))}
              </ul>
              <Typography variant="body2">
                <strong>{t('order_detail.customized_total', 'Total Personalizado')}:</strong> ₡{(prod.total_personalizado || 0).toLocaleString()}
              </Typography>
            </div>
          ))}
        </>
      )}

      <Typography variant="h6" sx={{ mt: 4, color: '#ce9fc4' }}>
        {t('order_detail.summary', 'Resumen')}
      </Typography>
      <Typography variant="body1">
        {t('order_detail.subtotal', 'Subtotal')}: ₡{subtotalCalculado.toLocaleString()}
      </Typography>
      <Typography variant="body1">
        {t('order_detail.taxes', 'Impuestos')}: ₡{impuestosCalculados.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
        {t('order_detail.total', 'Total')}: ₡{totalCalculado.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </Typography>
      <Typography variant="body1">
        {t('order_detail.payment_method', 'Método de Pago')}: {pedido?.metodo_pago || t('order_detail.not_available', 'N/A')}
      </Typography>

      <Button
        variant="outlined"
        color="secondary"
        onClick={() => navigate(-1)}
        sx={{ mt: 4 }}
      >
        {t('order_detail.back', '← Volver')}
      </Button>
    </Container>
  );
}