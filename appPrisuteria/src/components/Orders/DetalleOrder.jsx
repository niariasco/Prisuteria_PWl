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
        setError(err.message || t('order_detail.error', 'Error al cargar orden'));
      });
  }, [id, t]);

  if (!loaded) return <p>{t('order_detail.loading', 'Cargando...')}</p>;
  if (error) return <p>{error}</p>;

  const { pedido, productos = [], personalizados = [] } = orden || {};

  // Extraer datos con múltiples fuentes posibles
  const ordenId = pedido?.id || pedido?.ordenesId || orden?.id || id;
  const fechaOrden = pedido?.fecha || pedido?.created_at || orden?.fecha;
  const clienteNombre = pedido?.nombre_usuario || pedido?.cliente?.nombre || orden?.cliente?.nombre || 'N/A';
  const clienteEmail = pedido?.cliente?.email || orden?.cliente?.email;
  const direccionEnvio = pedido?.direccion_envio || orden?.direccion_envio || 'N/A';
  const metodoPago = pedido?.metodo_pago || orden?.metodo_pago || 'N/A';
  const estadoOrden = pedido?.estado || orden?.estado;

  // Función para calcular precios correctamente como en PagoPedido
  const calcularPreciosProducto = (producto) => {
    if (producto.esPersonalizado) {
      if (producto.totalConIva && Number(producto.totalConIva) > 0) {
        const totalConIva = Number(producto.totalConIva);
        const precioUnitarioConIva = totalConIva / (Number(producto.cantidad) || 1);
        const precioUnitarioSinIva = precioUnitarioConIva / 1.13;
        return {
          precioUnitarioSinIva: Math.round(precioUnitarioSinIva),
          totalConIva: Math.round(totalConIva),
          precioUnitarioConIva: Math.round(precioUnitarioConIva)
        };
      }
      
      if (producto.precioUnitario && Number(producto.precioUnitario) !== Number(producto.precio || 0)) {
        const precioUnitarioConIva = Number(producto.precioUnitario);
        const precioUnitarioSinIva = precioUnitarioConIva / 1.13;
        const totalConIva = precioUnitarioConIva * (Number(producto.cantidad) || 1);
        return {
          precioUnitarioSinIva: Math.round(precioUnitarioSinIva),
          totalConIva: Math.round(totalConIva),
          precioUnitarioConIva: Math.round(precioUnitarioConIva)
        };
      }
    }
    
    const precioBase = Number(producto.precio_unitario || producto.precio || 0);
    const precioUnitarioConIva = precioBase * 1.13;
    const totalConIva = precioUnitarioConIva * (Number(producto.cantidad) || 1);
    
    return {
      precioUnitarioSinIva: Math.round(precioBase),
      totalConIva: Math.round(totalConIva),
      precioUnitarioConIva: Math.round(precioUnitarioConIva)
    };
  };

  // Calcular totales correctamente
  let subtotalCalculado = 0;

  // Sumar productos regulares con cálculo correcto
  productos.forEach(producto => {
    const precios = calcularPreciosProducto(producto);
    subtotalCalculado += precios.precioUnitarioSinIva * (Number(producto.cantidad) || 1);
  });

  // Sumar productos personalizados
  personalizados.forEach(producto => {
    subtotalCalculado += parseFloat(producto.total_personalizado || 0) / 1.13; // Convertir a sin IVA
  });

  const impuestosCalculados = subtotalCalculado * 0.13;
  const totalCalculado = subtotalCalculado + impuestosCalculados;

  // Usar totales de la orden si existen, sino los calculados
  const subtotalFinal = pedido?.subtotal || subtotalCalculado;
  const impuestosFinal = pedido?.impuestos || impuestosCalculados;
  const totalFinal = pedido?.total || totalCalculado;

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
        {t('order_detail.invoice_title', 'Factura - Orden #{{orderNumber}}', { orderNumber: ordenId })}
      </Typography>

      <Typography variant="body1" gutterBottom>
        <strong>{t('order_detail.date', 'Fecha')}:</strong> {fechaOrden ? new Date(fechaOrden).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : t('order_detail.not_available', 'N/A')}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>{t('order_detail.customer', 'Cliente')}:</strong> {clienteNombre}
      </Typography>
      {clienteEmail && (
        <Typography variant="body1" gutterBottom>
          <strong>Email:</strong> {clienteEmail}
        </Typography>
      )}
      <Typography variant="body1" gutterBottom>
        <strong>{t('order_detail.address', 'Dirección')}:</strong> {direccionEnvio}
      </Typography>
      {estadoOrden && (
        <Typography variant="body1" gutterBottom>
          <strong>{t('order_detail.status', 'Estado')}:</strong> {translateOrderState(estadoOrden)}
        </Typography>
      )}

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
          {(productos || []).map((p, idx) => {
            const precios = calcularPreciosProducto(p);
            const cantidad = parseInt(p.cantidad || 0);
            const precioOriginal = parseFloat(p.precio_original || 0);
            
            return (
              <TableRow key={idx}>
                <TableCell>
                  {p.nombre}
                  {p.esPersonalizado && (
                    <span style={{ 
                      backgroundColor: '#E3F2FD', 
                      color: '#1976D2', 
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginLeft: '8px',
                      fontWeight: 'bold'
                    }}>
                      Personalizado
                    </span>
                  )}
                </TableCell>
                <TableCell>{cantidad}</TableCell>
                <TableCell>
                  {precioOriginal && precioOriginal * 1.13 > precios.precioUnitarioConIva ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: 6 }}>
                        ₡{Math.round(precioOriginal * 1.13).toLocaleString()}
                      </span>
                      <span style={{ color: '#d83b6a', fontWeight: 'bold' }}>
                        ₡{precios.precioUnitarioConIva.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    `₡${precios.precioUnitarioConIva.toLocaleString()}`
                  )}
                </TableCell>
                <TableCell>₡{precios.totalConIva.toLocaleString()}</TableCell>
              </TableRow>
            );
          })}
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
        {t('order_detail.subtotal', 'Subtotal')}: ₡{Math.round(subtotalFinal).toLocaleString()}
      </Typography>
      <Typography variant="body1">
        {t('order_detail.taxes', 'Impuestos')}: ₡{Math.round(impuestosFinal).toLocaleString()}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
        {t('order_detail.total', 'Total')}: ₡{Math.round(totalFinal).toLocaleString()}
      </Typography>
      <Typography variant="body1">
        {t('order_detail.payment_method', 'Método de Pago')}: {metodoPago}
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