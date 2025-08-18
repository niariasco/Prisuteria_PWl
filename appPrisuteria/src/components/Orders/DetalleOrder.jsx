import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
        setError(err.message || 'Error al cargar orden');
      });
  }, [id]);

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  const { pedido, productos = [], personalizados = [] } = orden || {};

  const subtotalCalculado =
    (productos || []).reduce((acc, p) => acc + parseFloat(p.subtotal || 0), 0) +
    (personalizados || []).reduce((acc, p) => acc + (p.total_personalizado || 0), 0);

  const impuestosCalculados = subtotalCalculado * 0.13;
  const totalCalculado = subtotalCalculado + impuestosCalculados;

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#d83b6a' }}>
        Factura - Orden #{pedido?.ordenesId}
      </Typography>

      <Typography variant="body1" gutterBottom>
        <strong>Fecha:</strong> {pedido?.fecha ? new Date(pedido.fecha).toLocaleString() : 'N/A'}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Cliente:</strong> {pedido?.nombre_usuario || 'N/A'}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Dirección:</strong> {pedido?.direccion_envio || 'N/A'}
      </Typography>

      <Typography variant="h6" sx={{ mt: 4, color: '#ce9fc4' }}>Productos</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell>Cantidad</TableCell>
            <TableCell>Precio Unitario</TableCell>
            <TableCell>Subtotal</TableCell>
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
          <Typography variant="h6" sx={{ mt: 4, color: '#ce9fc4' }}>Productos Personalizados</Typography>
          {personalizados.map((prod, idx) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              <Typography variant="subtitle1">
                <strong>{prod.nombre}</strong> - Base: ₡{(prod.costo_base || 0).toLocaleString()}
              </Typography>
              <ul>
                {(prod.criterios || []).map((crit, i) => (
                  <li key={i}>
                    {crit.nombre_criterio}: {crit.opcion} (₡{(crit.costo || 0).toLocaleString()})
                  </li>
                ))}
              </ul>
              <Typography variant="body2">
                <strong>Total Personalizado:</strong> ₡{(prod.total_personalizado || 0).toLocaleString()}
              </Typography>
            </div>
          ))}
        </>
      )}

      <Typography variant="h6" sx={{ mt: 4, color: '#ce9fc4' }}>Resumen</Typography>
      <Typography variant="body1">
        Subtotal: ₡{subtotalCalculado.toLocaleString()}
      </Typography>
      <Typography variant="body1">
        Impuestos: ₡{impuestosCalculados.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
        Total: ₡{totalCalculado.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </Typography>
      <Typography variant="body1">
        Método de Pago: {pedido?.metodo_pago || 'N/A'}
      </Typography>

      <Button
        variant="outlined"
        color="secondary"
        onClick={() => navigate(-1)}
        sx={{ mt: 4 }}
      >
        ← Volver
      </Button>
    </Container>
  );
}
