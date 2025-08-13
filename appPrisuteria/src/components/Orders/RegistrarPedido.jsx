import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Button,
  TextField,
  Autocomplete,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Receipt,
  Person,
  LocationOn,
  CalendarToday,
  ShoppingCart,
  CheckCircle
} from '@mui/icons-material';
import { useCart } from '../../hooks/useCart';
import { UserContext } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function RegistrarPedido() {
  const { cart, getCountItems, clearCart } = useCart();
  const { user, decodeToken } = useContext(UserContext);
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  // Estados para la información del pedido
  const [userData, setUserData] = useState(decodeToken());
  const [fechaActual] = useState(new Date());
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [direccionEnvio, setDireccionEnvio] = useState('');
  const [estadoPedido] = useState('Pendiente');
  const [loading, setLoading] = useState(false);
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  // Estados para información detallada del cliente
  const [detalleCliente, setDetalleCliente] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // Función para obtener la moneda según el idioma
  const getCurrency = () => {
    return i18n.language === 'es' ? 'CRC' : 'USD';
  };

  // Función para convertir precio según la moneda
  const convertPrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    return i18n.language === 'es' ? numPrice * 500 : numPrice;
  };

  // Simular carga de clientes disponibles
  useEffect(() => {
    const cargarClientes = async () => {
      setLoadingClientes(true);
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos simulados de clientes
      const clientesSimulados = [
        {
          id: 1,
          nombre: 'Juan Pérez',
          email: 'juan.perez@email.com',
          telefono: '+506 8888-8888',
          cedula: '1-1111-1111',
          direccion: 'San José, Costa Rica, Barrio Escalante, Casa #123'
        },
        {
          id: 2,
          nombre: 'María González',
          email: 'maria.gonzalez@email.com',
          telefono: '+506 7777-7777',
          cedula: '2-2222-2222',
          direccion: 'Cartago, Costa Rica, Centro, Apartamento 45'
        },
        {
          id: 3,
          nombre: 'Carlos Rodríguez',
          email: 'carlos.rodriguez@email.com',
          telefono: '+506 6666-6666',
          cedula: '3-3333-3333',
          direccion: 'Alajuela, Costa Rica, San Antonio, Casa Verde'
        }
      ];
      
      setClientesDisponibles(clientesSimulados);
      
      // Si hay usuario logueado, buscarlo en la lista
      if (userData && userData.email) {
        const clienteEncontrado = clientesSimulados.find(c => c.email === userData.email);
        if (clienteEncontrado) {
          setClienteSeleccionado(clienteEncontrado);
          setDireccionEnvio(clienteEncontrado.direccion);
        }
      }
      
      setLoadingClientes(false);
    };

    cargarClientes();
  }, [userData]);

  // Función para cargar detalles del cliente seleccionado
  const cargarDetalleCliente = async (cliente) => {
    if (!cliente) {
      setDetalleCliente(null);
      return;
    }

    setLoadingDetalle(true);
    // Simular llamada API asincrónica
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simular información detallada del cliente
    const detalleCompleto = {
      ...cliente,
      fechaRegistro: '2023-01-15',
      pedidosAnteriores: Math.floor(Math.random() * 20),
      totalCompras: (Math.random() * 500000).toFixed(2),
      categoriaCliente: 'Premium',
      metodoPagoPreferido: 'Tarjeta de Crédito'
    };
    
    setDetalleCliente(detalleCompleto);
    setDireccionEnvio(cliente.direccion);
    setLoadingDetalle(false);
  };

  // Manejar cambio de cliente
  const handleClienteChange = (event, newValue) => {
    setClienteSeleccionado(newValue);
    cargarDetalleCliente(newValue);
  };

  // Validar que hay productos en el carrito
  const validItems = cart?.filter(item => item && item.id && item.nombre) || [];

  if (validItems.length === 0) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          No hay productos en el carrito para registrar un pedido.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/producto')}
          sx={{ backgroundColor: '#F06292' }}
        >
          Ir a Productos
        </Button>
      </Box>
    );
  }

  // Calcular totales
  const currency = getCurrency();
  const subtotal = validItems.reduce((sum, item) => {
    const precio = convertPrice(item.precio);
    const cantidad = item.quantity || 1;
    const promocion = parseFloat(item.promocion) || 0;
    const precioConDescuento = promocion > 0 ? precio - (precio * promocion) / 100 : precio;
    return sum + (precioConDescuento * cantidad);
  }, 0);

  const shippingCost = i18n.language === 'es' ? 75000 : 150;
  const shipping = subtotal > shippingCost ? 0 : (i18n.language === 'es' ? 7500 : 15);
  const total = subtotal + shipping;

  // Función para procesar el pedido
  const procesarPedido = async () => {
    if (!clienteSeleccionado || !direccionEnvio.trim()) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    
    // Simular procesamiento del pedido
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Aquí iría la lógica para enviar el pedido al backend
    const pedidoData = {
      cliente: clienteSeleccionado,
      fecha: fechaActual,
      direccionEnvio,
      estado: estadoPedido,
      productos: validItems,
      subtotal,
      envio: shipping,
      total,
      moneda: currency
    };
    
    console.log('Pedido registrado:', pedidoData);
    
    // Limpiar carrito y redirigir
    clearCart();
    setLoading(false);
    
    alert('¡Pedido registrado exitosamente!');
    navigate('/orden');
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Título principal */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Receipt sx={{ fontSize: 40, color: '#F06292', mr: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>
          REGISTRAR PEDIDO
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Encabezado del Pedido */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3, boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#F06292' }}>
                INFORMACIÓN GENERAL
              </Typography>
              
              <Grid container spacing={3}>
                {/* Fecha Actual */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarToday sx={{ color: '#F06292', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Fecha:
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    value={fechaActual.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                  />
                </Grid>

                {/* Estado del Pedido */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircle sx={{ color: '#F06292', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Estado:
                    </Typography>
                  </Box>
                  <Chip
                    label={estadoPedido}
                    color="warning"
                    variant="outlined"
                    sx={{ 
                      fontSize: '1rem', 
                      fontWeight: 'bold',
                      height: '40px',
                      borderColor: '#F06292',
                      color: '#F06292'
                    }}
                  />
                </Grid>

                {/* Selector de Cliente */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ color: '#F06292', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Cliente:
                    </Typography>
                  </Box>
                  <Autocomplete
                    options={clientesDisponibles}
                    getOptionLabel={(option) => `${option.nombre} - ${option.email}`}
                    value={clienteSeleccionado}
                    onChange={handleClienteChange}
                    loading={loadingClientes}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Seleccionar Cliente"
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <React.Fragment>
                              {loadingClientes ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Información detallada del cliente */}
                {clienteSeleccionado && (
                  <Grid item xs={12}>
                    <Card sx={{ backgroundColor: '#f8f9fa', border: '1px solid #F06292' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#F06292' }}>
                          Información del Cliente
                        </Typography>
                        
                        {loadingDetalle ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress />
                          </Box>
                        ) : detalleCliente ? (
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography><strong>Nombre:</strong> {detalleCliente.nombre}</Typography>
                              <Typography><strong>Cédula:</strong> {detalleCliente.cedula}</Typography>
                              <Typography><strong>Email:</strong> {detalleCliente.email}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography><strong>Teléfono:</strong> {detalleCliente.telefono}</Typography>
                              <Typography><strong>Categoría:</strong> {detalleCliente.categoriaCliente}</Typography>
                              <Typography><strong>Pedidos Anteriores:</strong> {detalleCliente.pedidosAnteriores}</Typography>
                            </Grid>
                          </Grid>
                        ) : null}
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Dirección de Envío */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ color: '#F06292', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Dirección de Envío:
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={direccionEnvio}
                    onChange={(e) => setDireccionEnvio(e.target.value)}
                    placeholder="Ingrese la dirección de envío detallada"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Detalle de Productos */}
          <Card sx={{ boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ShoppingCart sx={{ color: '#F06292', mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F06292' }}>
                  DETALLE DEL PEDIDO
                </Typography>
              </Box>

              <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#F06292' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Producto</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Cantidad</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Precio Unit.</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Descuento</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {validItems.map((item, index) => {
                      const precio = convertPrice(item.precio);
                      const cantidad = item.quantity || 1;
                      const promocion = parseFloat(item.promocion) || 0;
                      const precioConDescuento = promocion > 0 ? precio - (precio * promocion) / 100 : precio;
                      const subtotalItem = precioConDescuento * cantidad;

                      return (
                        <TableRow key={`${item.id}-${index}`} sx={{ '&:nth-of-type(even)': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell>
                            <Typography sx={{ fontWeight: 'bold' }}>{item.nombre}</Typography>
                          </TableCell>
                          <TableCell align="center">{cantidad}</TableCell>
                          <TableCell align="right">{currency} {precio.toLocaleString()}</TableCell>
                          <TableCell align="right">
                            {promocion > 0 ? `${promocion}%` : '-'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {currency} {subtotalItem.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Resumen y Totales */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20, boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#F06292' }}>
                RESUMEN DEL PEDIDO
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {currency} {subtotal.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Envío:</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {shipping === 0 ? 'GRATIS' : `${currency} ${shipping.toLocaleString()}`}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    TOTAL:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#F06292' }}>
                    {currency} {total.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={procesarPedido}
                disabled={loading || !clienteSeleccionado || !direccionEnvio.trim()}
                sx={{
                  backgroundColor: '#F06292',
                  color: 'white',
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#E91E63',
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'CONFIRMAR PEDIDO'
                )}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => navigate('/cart')}
                sx={{
                  mt: 2,
                  borderColor: '#F06292',
                  color: '#F06292',
                  '&:hover': {
                    borderColor: '#E91E63',
                    backgroundColor: 'rgba(240, 98, 146, 0.1)',
                  }
                }}
              >
                VOLVER AL CARRITO
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}