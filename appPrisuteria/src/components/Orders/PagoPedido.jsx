import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OrderService from '../../services/OrderService';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  Divider,
  Card,
  CardContent,
  Grid,
  Paper,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { 
  CheckCircle, 
  Receipt, 
  Print, 
  Business, 
  Person, 
  LocationOn, 
  CreditCard, 
  AttachMoney 
} from '@mui/icons-material';

const PagoPedido = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados principales
  const [pedidoData, setPedidoData] = useState({});
  const [metodoPago, setMetodoPago] = useState("tarjeta-credito");
  const [loading, setLoading] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  const initialFormData = {
    numeroTarjeta: "",
    fechaExpiracion: "",
    cvv: "",
    nombreTitular: "",
    montoEfectivo: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [cambio, setCambio] = useState(0);

  // Estados para los selectores de fecha
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Estados para el modal de factura
  const [showFacturaDialog, setShowFacturaDialog] = useState(false);
  const [ordenCreada, setOrdenCreada] = useState(null);

  // Cargar datos del pedido
  useEffect(() => {
    console.log('PagoPedido - location.state:', location.state);
    
    let datosPedido = null;

    // Intentar obtener datos del state primero
    if (location.state?.pedidoData) {
      console.log('Datos obtenidos desde location.state');
      datosPedido = location.state.pedidoData;
    } else {
      // Si no hay datos en state, intentar desde localStorage
      console.log('Intentando obtener datos desde localStorage');
      try {
        const datosGuardados = localStorage.getItem('pedidoEnProceso');
        if (datosGuardados) {
          datosPedido = JSON.parse(datosGuardados);
          console.log('Datos obtenidos desde localStorage');
        }
      } catch (error) {
        console.error('Error al leer localStorage:', error);
      }
    }

    if (datosPedido && datosPedido.productos && datosPedido.productos.length > 0) {
      console.log('Estableciendo datos del pedido:', datosPedido);
      setPedidoData(datosPedido);
      setCargandoDatos(false);
    } else {
      console.error('No se encontraron datos del pedido, redirigiendo al carrito');
      setTimeout(() => {
        navigate('/cart');
      }, 2000);
    }
  }, [location.state, navigate]);

  const totalCompra = pedidoData?.total || 0;
  const usuarioId = pedidoData?.usuarioDetalle?.usuarioId || 1;

  // Formatear número de tarjeta
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };


  // Detectar tipo de tarjeta
  const getCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'Visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'Mastercard';
    if (cleanNumber.startsWith('3')) return 'American Express';
    return '';
  };

  // Generar años para selector
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 15; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  // Meses para selector
  const months = [
    { value: '01', label: '01 - Enero' },
    { value: '02', label: '02 - Febrero' },
    { value: '03', label: '03 - Marzo' },
    { value: '04', label: '04 - Abril' },
    { value: '05', label: '05 - Mayo' },
    { value: '06', label: '06 - Junio' },
    { value: '07', label: '07 - Julio' },
    { value: '08', label: '08 - Agosto' },
    { value: '09', label: '09 - Septiembre' },
    { value: '10', label: '10 - Octubre' },
    { value: '11', label: '11 - Noviembre' },
    { value: '12', label: '12 - Diciembre' },
  ];

  // Actualizar fecha expiración
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      const yearShort = selectedYear.toString().slice(-2);
      setFormData(prev => ({
        ...prev,
        fechaExpiracion: `${selectedMonth}/${yearShort}`
      }));
    }
  }, [selectedMonth, selectedYear]);

  // Validación algoritmo Luhn
  const validarLuhn = (numero) => {
    let suma = 0;
    let alternar = false;
    for (let i = numero.length - 1; i >= 0; i--) {
      let n = parseInt(numero[i]);
      if (alternar) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      suma += n;
      alternar = !alternar;
    }
    return suma % 10 === 0;
  };

  // Determinar si es método de tarjeta
  const esTarjeta = () => {
    return metodoPago === "tarjeta-credito" || metodoPago === "tarjeta-debito";
  };

  // Obtener tipo de método para mostrar
  const getTipoMetodo = () => {
    switch(metodoPago) {
      case "tarjeta-credito": return "Crédito";
      case "tarjeta-debito": return "Débito"; 
      case "efectivo": return "Efectivo";
      default: return "";
    }
  };

  // Obtener símbolo de moneda
  const getCurrencySymbol = () => {
    return pedidoData.moneda === 'USD' ? '$' : '₡';
  };

  // Validación de tarjeta
  const validarTarjeta = () => {
    const { numeroTarjeta, fechaExpiracion, cvv, nombreTitular } = formData;
    const cleanCardNumber = numeroTarjeta.replace(/\s/g, '');

    if (!/^\d{16}$/.test(cleanCardNumber)) {
      return "El número de tarjeta debe tener 16 dígitos.";
    }
    if (!validarLuhn(cleanCardNumber)) {
      return "El número de tarjeta no es válido.";
    }

    if (!/^\d{2}\/\d{2}$/.test(fechaExpiracion)) {
      return "Debe seleccionar una fecha de expiración válida.";
    }
    const [mes, año] = fechaExpiracion.split("/").map((v) => parseInt(v, 10));
    if (mes < 1 || mes > 12) {
      return "El mes de expiración debe estar entre 01 y 12.";
    }
    const fechaActual = new Date();
    const añoActual = parseInt(fechaActual.getFullYear().toString().slice(-2));
    const mesActual = fechaActual.getMonth() + 1;
    if (año < añoActual || (año === añoActual && mes < mesActual)) {
      return "La tarjeta está expirada.";
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      return "El CVV debe tener 3 o 4 dígitos numéricos.";
    }

    if (!nombreTitular.trim()) {
      return "El nombre del titular no puede estar vacío.";
    }

    return null;
  };

  // Validación de efectivo
  const validarEfectivo = () => {
    const monto = parseFloat(formData.montoEfectivo);
    if (isNaN(monto) || monto <= 0) {
      return "El monto en efectivo debe ser un número positivo.";
    }
    if (monto < totalCompra) {
      return "El monto en efectivo no puede ser menor al total del pedido.";
    }
    return null;
  };



  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "montoEfectivo") {
      const total = parseFloat(pedidoData.total || 0);
      const pago = parseFloat(value) || 0;
      setCambio(pago >= total ? pago - total : 0);
    }
  };

  // Preparar productos para backend
  const mapearProductos = () => {
    return (pedidoData.productos || []).map((producto, index) => ({
      id: producto.productosId || producto.id || producto.productoId,
      cantidad: parseInt(producto.cantidad) || 0,
      precio: parseFloat(producto.precioUnitario || producto.precio) || 0,
    }));
  };

  // Preparar datos finales para backend
  const prepararDatosOrden = () => {
    const productosBackend = mapearProductos();
    const subtotal = productosBackend.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    const impuestos = parseFloat((subtotal * 0.13).toFixed(2)); // ejemplo 13%
    const total = parseFloat((subtotal + impuestos).toFixed(2));

    const datosOrden = {
      usuario_id: parseInt(usuarioId),
      subtotal,
      impuestos,
      total,
      direccion_envio: pedidoData.direccionEnvio || "No especificada",
      estado: 'Pendiente',
      metodo_pago: (metodoPago === "efectivo") ? "Efectivo" : "Tarjeta",
      productos: productosBackend
    };

    if (metodoPago === "efectivo") {
      datosOrden.pago_efectivo = {
        monto_pagado: parseFloat(formData.montoEfectivo) || total,
        cambio: cambio || 0
      };
    } else if (metodoPago === "tarjeta-credito" || metodoPago === "tarjeta-debito") {
      datosOrden.pago_tarjeta = {
        numero_tarjeta: formData.numeroTarjeta.replace(/\s/g, ''),
        fecha_expiracion: formData.fechaExpiracion,
        cvv: formData.cvv,
        nombre_titular: formData.nombreTitular
      };
    } else if (metodoPago === "mixto") {
      datosOrden.pago_efectivo = {
        monto_pagado: parseFloat(formData.montoEfectivo) || 0,
        cambio: cambio || 0
      };
      datosOrden.pago_tarjeta = {
        numero_tarjeta: formData.numeroTarjeta.replace(/\s/g, ''),
        fecha_expiracion: formData.fechaExpiracion,
        cvv: formData.cvv,
        nombre_titular: formData.nombreTitular
      };
    }

    return datosOrden;
  };

  // Manejar pago
  const handlePagar = async () => {
    try {
      setLoading(true);

      if (!pedidoData?.productos?.length) throw new Error("No hay productos en el pedido");

      const datosOrden = prepararDatosOrden();
      console.log("Datos finales a enviar:", datosOrden);

      const response = await OrderService.crearOrden(datosOrden);
      console.log("Orden creada:", response);
      setOrdenCreada(response);
      setShowFacturaDialog(true);

      setFormData(initialFormData);
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      alert(error.response?.data?.message || error.message || "Error al crear la orden");
    } finally {
      setLoading(false);
    }
  };

// Actualizar cambio en tiempo real
const handleMontoEfectivoChange = (e) => {
  const valor = parseFloat(e.target.value) || 0;
  setFormData(prev => ({ ...prev, montoEfectivo: valor }));
  const total = pedidoData.totalConImpuestos || pedidoData.total || 0;
  setCambio(valor >= total ? valor - total : 0);
};

handleMontoEfectivoChange;


  // Ver detalle de la orden (desde el modal)
  const verDetalleOrden = () => {
    setShowFacturaDialog(false);
    if (ordenCreada?.id) {
      navigate(`/orden/${ordenCreada.id}`);
    } else {
      navigate('/orden');
    }
  };

  // Ir a la lista de órdenes
  const irAOrdenes = () => {
    setShowFacturaDialog(false);
    navigate('/orden');
  };

  // Imprimir factura
  const handleImprimir = () => {
    window.print();
  };

  // Estado de carga inicial
  if (cargandoDatos) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress size={50} sx={{ color: '#d83b6a' }} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Cargando datos del pedido...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Si no hay datos del pedido
  if (!pedidoData || !pedidoData.productos || pedidoData.productos.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          No hay datos del pedido
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          No se encontraron datos del pedido. Por favor, regresa al carrito y procesa tu pedido nuevamente.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/cart')}
          sx={{ mt: 2 }}
        >
          Volver al Carrito
        </Button>
      </Container>
    );
  }

  const currencySymbol = getCurrencySymbol();
  return (
    <>
      <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
        <Grid container spacing={4}>
          {/* Resumen del Pedido */}
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                  Resumen del Pedido
                </Typography>
                
                {/* Información del cliente */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" color="secondary">
                    Cliente: {pedidoData.cliente?.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {pedidoData.cliente?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dirección: {pedidoData.direccionEnvio}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Lista de productos */}
                <Typography variant="h6" gutterBottom>
                  Productos ({pedidoData.productos?.length || 0}):
                </Typography>
                
                {pedidoData.productos?.map((producto, index) => (
                  <Box key={index} sx={{ mb: 1, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {producto.nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Cantidad: {producto.cantidad}
                        </Typography>
                        {producto.esPersonalizado && (
                          <Chip 
                            label="Personalizado" 
                            size="small"
                            sx={{
                              backgroundColor: '#E3F2FD',
                              color: '#1976D2',
                              fontSize: '0.7rem',
                              height: '20px',
                              mt: 0.5
                            }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        {currencySymbol} {Math.round(producto.totalConIva || (producto.precioUnitario * producto.cantidad) || (producto.precio * producto.cantidad)).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                {/* Totales */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>{currencySymbol} {Math.round(pedidoData.subtotalSinImpuestos).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>IVA (13%):</Typography>
                  <Typography>{currencySymbol} {Math.round(pedidoData.ivaTotal).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Envío:</Typography>
                  <Typography color="success.main" sx={{ fontWeight: 'bold' }}>GRATIS</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {currencySymbol} {Math.round(pedidoData.total).toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Formulario de Pago */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: 3 }}>
              <Typography variant="h5" align="center" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                Proceso de Pago
              </Typography>

              <Typography variant="h6" align="center" gutterBottom sx={{ color: 'secondary.main', mb: 3 }}>
                Total a pagar: <strong>{currencySymbol} {Math.round(totalCompra).toLocaleString()}</strong>
              </Typography>

              {/* Selección del método de pago */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Método de Pago</InputLabel>
                <Select 
                  value={metodoPago} 
                  onChange={(e) => setMetodoPago(e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="tarjeta-credito">Tarjeta de Crédito</MenuItem>
                  <MenuItem value="tarjeta-debito">Tarjeta de Débito</MenuItem>
                  <MenuItem value="efectivo">Efectivo</MenuItem>
                </Select>
              </FormControl>

              {/* Formulario de Tarjeta */}
              {esTarjeta() && (
                <Box sx={{ animation: 'fadeIn 0.3s ease-in' }}>
                  <Box sx={{ mb: 2, p: 2, backgroundColor: 'primary.light', borderRadius: 2 }}>
                    <Typography variant="body2" color="primary.contrastText" sx={{ fontWeight: 'bold' }}>
                      Pagando con tarjeta de {getTipoMetodo().toLowerCase()}
                    </Typography>
                  </Box>

                  {/* Número de Tarjeta */}
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      fullWidth
                      label="Número de Tarjeta"
                      name="numeroTarjeta"
                      value={formData.numeroTarjeta}
                      onChange={handleChange}
                      margin="normal"
                      placeholder="0000 0000 0000 0000"
                      disabled={loading}
                      InputProps={{
                        endAdornment: getCardType(formData.numeroTarjeta) && (
                          <InputAdornment position="end">
                            <Chip 
                              label={getCardType(formData.numeroTarjeta)} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiInputBase-input': {
                          fontSize: '1.1rem',
                          letterSpacing: '0.05em'
                        }
                      }}
                    />
                  </Box>

                  {/* Fecha de Expiración */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Mes</InputLabel>
                      <Select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        disabled={loading}
                      >
                        {months.map((month) => (
                          <MenuItem key={month.value} value={month.value}>
                            {month.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>Año</InputLabel>
                      <Select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        disabled={loading}
                      >
                        {generateYears().map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* CVV */}
                  <TextField
                    fullWidth
                    label="CVV"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    margin="normal"
                    placeholder="123"
                    disabled={loading}
                    helperText="Código de seguridad de 3-4 dígitos"
                  />

                  {/* Nombre del Titular */}
                  <TextField
                    fullWidth
                    label="Nombre del Titular"
                    name="nombreTitular"
                    value={formData.nombreTitular}
                    onChange={handleChange}
                    margin="normal"
                    placeholder="Como aparece en la tarjeta"
                    disabled={loading}
                    sx={{
                      '& .MuiInputBase-input': {
                        textTransform: 'uppercase'
                      }
                    }}
                  />
                </Box>
              )}

              {/* Formulario de Efectivo */}
              {metodoPago === "efectivo" && (
                <Box sx={{ animation: 'fadeIn 0.3s ease-in' }}>
                  <Box sx={{ mb: 2, p: 2, backgroundColor: 'success.light', borderRadius: 2 }}>
                    <Typography variant="body2" color="success.contrastText" sx={{ fontWeight: 'bold' }}>
                      Pago en efectivo
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Monto con el que paga"
                    name="montoEfectivo"
                    type="number"
                    value={formData.montoEfectivo}
                    onChange={handleChange}
                    margin="normal"
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {currencySymbol}
                        </InputAdornment>
                      ),
                    }}
                    helperText={`Mínimo: ${currencySymbol} ${Math.round(totalCompra).toLocaleString()}`}
                  />
                  {cambio > 0 && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'success.light', borderRadius: 2, border: '2px solid', borderColor: 'success.main' }}>
                      <Typography variant="h6" color="success.dark" sx={{ fontWeight: 'bold' }}>
                        Cambio: {currencySymbol} {cambio.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Botones de acción */}
              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/registrar-pedido')}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  Volver
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handlePagar}
                  disabled={loading}
                  sx={{ 
                    flex: 1,
                    background: 'linear-gradient(45deg, #1976d2 30%, #21cbf3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)',
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Procesando...
                    </>
                  ) : (
                    "Finalizar Pago"
                  )}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Notificación */}
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
          <Alert severity={alertType} onClose={() => setOpenSnackbar(false)}>
            {mensaje}
          </Alert>
        </Snackbar>

        {/* Estilos CSS para animaciones */}
        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </Container>

      {/* Modal de Factura Completa */}
      <Dialog 
        open={showFacturaDialog} 
        onClose={() => setShowFacturaDialog(false)}
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 2,
          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}>
          <CheckCircle sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            ¡Pago Procesado Exitosamente!
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Su orden ha sido confirmada y guardada
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {ordenCreada && (
            <Paper sx={{ m: 3, p: 3, backgroundColor: '#fafafa' }}>
              {/* Header de la factura */}
              <Box sx={{ mb: 3 }}>
                <Grid container justifyContent="space-between" alignItems="center">
                  <Grid item>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Business sx={{ mr: 1, color: '#1976d2' }} />
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        TuTienda.com
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Carrillos, Alajuela, Costa Rica
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tel: +506 2222-3333 | Email: info@tutienda.com
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Receipt sx={{ fontSize: 60, color: '#1976d2', opacity: 0.3 }} />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Información de la orden */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2, color: '#1976d2' }}>
                      <Receipt sx={{ mr: 1 }} />
                      Datos de la Orden
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Número de Orden:</strong> #{ordenCreada.id}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Fecha:</strong> {new Date(ordenCreada.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Estado:</strong> 
                      <Chip 
                        label="Confirmado" 
                        color="success" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2, color: '#1976d2' }}>
                      <Person sx={{ mr: 1 }} />
                      Información del Cliente
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Cliente:</strong> {ordenCreada.cliente?.nombre || 'Cliente Registrado'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Email:</strong> {ordenCreada.cliente?.email || 'cliente@email.com'}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <LocationOn sx={{ mr: 0.5, fontSize: 16, mt: 0.2 }} />
                      <span>
                        <strong>Dirección:</strong><br />
                        {ordenCreada.direccionEnvio}
                      </span>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Método de pago */}
              <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2, color: '#1976d2' }}>
                  {ordenCreada.metodoPago === 'Efectivo' ? <AttachMoney sx={{ mr: 1 }} /> : <CreditCard sx={{ mr: 1 }} />}
                  Método de Pago
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Tipo:</strong> {ordenCreada.metodoPago}
                    </Typography>
                  </Grid>
                  {ordenCreada.cambio > 0 && (
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, backgroundColor: '#e8f5e8', borderRadius: 2, border: '1px solid #4caf50' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                          Cambio: {currencySymbol} {ordenCreada.cambio.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Detalle de productos */}
              <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                Detalle de Productos
              </Typography>
              
              <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 1 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell><strong>Producto</strong></TableCell>
                      <TableCell align="center"><strong>Cantidad</strong></TableCell>
                      <TableCell align="right"><strong>Precio Unit.</strong></TableCell>
                      <TableCell align="right"><strong>Total</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ordenCreada.productos?.map((producto, index) => (
                      <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {producto.nombre}
                            </Typography>
                            {producto.esPersonalizado && (
                              <Chip 
                                label="Personalizado" 
                                size="small"
                                sx={{
                                  backgroundColor: '#E3F2FD',
                                  color: '#1976D2',
                                  fontSize: '0.7rem',
                                  height: '20px',
                                  mt: 0.5
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">{producto.cantidad}</TableCell>
                        <TableCell align="right">
                          {currencySymbol} {Math.round(producto.precioUnitario || producto.precio || 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {currencySymbol} {Math.round(producto.totalConIva || (producto.precioUnitario || producto.precio) * producto.cantidad).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Totales */}
              <Box sx={{ backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0', p: 2 }}>
                <Grid container>
                  <Grid item xs={12} md={8}></Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Subtotal:</Typography>
                        <Typography variant="body2">
                          {currencySymbol} {Math.round(ordenCreada.subtotalSinImpuestos || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">IVA (13%):</Typography>
                        <Typography variant="body2">
                          {currencySymbol} {Math.round(ordenCreada.ivaTotal || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Envío:</Typography>
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                          GRATIS
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                          {currencySymbol} {Math.round(ordenCreada.total || 0).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Nota de agradecimiento */}
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                  ¡Gracias por su compra!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Se ha enviado un email de confirmación a su dirección de correo electrónico.
                  Su pedido será procesado en las próximas 24 horas.
                </Typography>
              </Box>

              {/* Información adicional */}
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff3e0', borderRadius: 2, border: '1px dashed #ff9800' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f57c00', mb: 1 }}>
                  Información importante:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  • Conserve este comprobante para cualquier consulta<br />
                  • Tiempo estimado de entrega: 3-5 días hábiles<br />
                  • Para consultas contacte: +506 2222-3333<br />
                  • Puede rastrear su pedido en la sección "Mis Órdenes"
                </Typography>
              </Box>
            </Paper>
          )}
        </DialogContent>

        {/* Botones de acción */}
        <DialogActions sx={{ p: 3, justifyContent: 'space-between', backgroundColor: '#f5f5f5' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<Print />}
              onClick={handleImprimir}
              size="small"
            >
              Imprimir
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={irAOrdenes}
              sx={{ minWidth: 120 }}
            >
              Mis Órdenes
            </Button>
            <Button 
              variant="contained" 
              onClick={verDetalleOrden}
              sx={{ 
                minWidth: 120,
                background: 'linear-gradient(45deg, #1976d2 30%, #21cbf3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)',
                }
              }}
            >
              Ver Detalle
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PagoPedido;
