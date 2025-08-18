import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
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
} from "@mui/material";
import { CheckCircle } from '@mui/icons-material';
import OrderService from '../../services/OrderService';

export default function PagoPage() {
  const navigate = useNavigate();
  const [metodoPago, setMetodoPago] = useState("tarjeta-credito");
  const [pedidoData, setPedidoData] = useState(null);

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
  const [loading, setLoading] = useState(false);

  // Estados para los selectores de fecha
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Estados para el modal de confirmación
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [ordenCreada, setOrdenCreada] = useState(null);

  // Cargar datos del pedido desde localStorage
  useEffect(() => {
    try {
      const pedidoGuardado = localStorage.getItem('pedidoEnProceso');
      if (pedidoGuardado) {
        const datosRecuperados = JSON.parse(pedidoGuardado);
        setPedidoData(datosRecuperados);
        console.log('Datos del pedido recuperados:', datosRecuperados);
      } else {
        console.log('No se encontraron datos del pedido en localStorage');
        setPedidoData(null);
      }
    } catch (error) {
      console.error('Error al recuperar datos del pedido:', error);
      setPedidoData(null);
    }
  }, []);

  const totalCompra = pedidoData?.total || 0;
  const usuarioId = pedidoData?.usuarioDetalle?.usuarioId || 1;

  // Función para formatear número de tarjeta con espacios cada 4 dígitos
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

  // Detectar tipo de tarjeta basado en el número
  const getCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'Visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'Mastercard';
    if (cleanNumber.startsWith('3')) return 'American Express';
    return '';
  };

  // Generar años (actual + 15 años)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 15; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  // Generar meses
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

  // Actualizar fechaExpiracion cuando cambian mes o año
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      const yearShort = selectedYear.toString().slice(-2);
      setFormData(prev => ({
        ...prev,
        fechaExpiracion: `${selectedMonth}/${yearShort}`
      }));
    }
  }, [selectedMonth, selectedYear]);

  // Función de validación Luhn (tarjeta)
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

  // Determinar si es método de tarjeta (crédito o débito)
  const esTarjeta = () => {
    return metodoPago === "tarjeta-credito" || metodoPago === "tarjeta-debito";
  };

  // Obtener el tipo de método para mostrar
  const getTipoMetodo = () => {
    switch(metodoPago) {
      case "tarjeta-credito": return "Crédito";
      case "tarjeta-debito": return "Débito"; 
      case "efectivo": return "Efectivo";
      default: return "";
    }
  };

  // Validaciones de tarjeta (aplica tanto para crédito como débito)
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

  // Validaciones de efectivo
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "numeroTarjeta") {
      const formattedValue = formatCardNumber(value);
      if (formattedValue.replace(/\s/g, '').length <= 16) {
        setFormData((prev) => ({ ...prev, [name]: formattedValue }));
      }
    } else if (name === "cvv") {
      // Solo permitir números para CVV
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 4) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "montoEfectivo") {
      const pago = parseFloat(value) || 0;
      setCambio(pago >= totalCompra ? pago - totalCompra : 0);
    }
  };

  const handlePagar = async () => {
    if (!pedidoData) {
      setMensaje("No hay datos del pedido disponibles.");
      setAlertType("error");
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      let error = null;
      if (esTarjeta()) {
        error = validarTarjeta();
      } else if (metodoPago === "efectivo") {
        error = validarEfectivo();
      }

      if (error) {
        setMensaje(error);
        setAlertType("warning");
        setOpenSnackbar(true);
        setLoading(false);
        return;
      }

      // 1. Crear Orden Principal
      const orden = {
        usuario_id: usuarioId,
        subtotal: pedidoData.subtotalSinImpuestos,
        total: pedidoData.total,
        estado: "Pendiente",
        metodo_pago: getTipoMetodo(),
        direccion_envio: pedidoData.direccionEnvio,
        impuestos: pedidoData.ivaTotal || 0
      };

      console.log('Enviando orden:', orden);
      const { data: ordenCreada } = await OrderService.createOrden(orden);
      console.log('Orden creada:', ordenCreada);
      
      const ordenId = ordenCreada.id;

      // 2. Crear pago según método
      if (esTarjeta()) {
        const pagoData = {
          orden_id: ordenId,
          numero_tarjeta: formData.numeroTarjeta.replace(/\s/g, ''),
          fecha_expiracion: formData.fechaExpiracion,
          cvv: formData.cvv,
          nombre_titular: formData.nombreTitular,
          tipo_tarjeta: metodoPago === "tarjeta-credito" ? "credito" : "debito",
          monto: pedidoData.total
        };
        
        console.log('Enviando pago tarjeta:', pagoData);
        await OrderService.createPagoTarjeta(pagoData);
        
      } else if (metodoPago === "efectivo") {
        const pagoData = {
          orden_id: ordenId,
          monto_pagado: parseFloat(formData.montoEfectivo),
          cambio: cambio,
        };
        
        console.log('Enviando pago efectivo:', pagoData);
        await OrderService.createPagoEfectivo(pagoData);
      }

      // 3. Actualizar estado de la orden a "Pagado"
      await OrderService.updateOrden(ordenId, {
        ...orden,
        estado: "Pagado",
      });

      // 4. Guardar información de la orden creada para mostrar en el modal
      setOrdenCreada({
        id: ordenId,
        metodoPago: getTipoMetodo(),
        cambio: cambio,
        fecha: new Date().toISOString(),
        ...pedidoData
      });

      // 5. Limpiar localStorage después del pago exitoso
      localStorage.removeItem('pedidoEnProceso');

      // 6. Limpiar formulario
      setFormData(initialFormData);
      setSelectedMonth("");
      setSelectedYear("");
      setCambio(0);

      // 7. Mostrar modal de confirmación
      setShowConfirmDialog(true);

    } catch (error) {
      console.error("Error completo:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      
      let errorMessage = `Hubo un error al procesar el pago con ${getTipoMetodo().toLowerCase()}.`;
      
      if (error.response?.status === 404) {
        errorMessage = "El endpoint del servidor no fue encontrado. Verifica la configuración de la API.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMensaje(errorMessage);
      setAlertType("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Función para ver el detalle de la orden
  const verDetalleOrden = () => {
    setShowConfirmDialog(false);
    navigate(`/orden/${ordenCreada.id}`);
  };

  // Función para ir a la lista de órdenes
  const irAOrdenes = () => {
    setShowConfirmDialog(false);
    navigate('/ordenes');
  };

  // Si no hay datos del pedido, mostrar mensaje
  if (!pedidoData) {
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
          onClick={() => navigate('/carrito')}
          sx={{ mt: 2 }}
        >
          Volver al Carrito
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
        <Grid container spacing={4}>
          {/* Información del Pedido */}
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                  Resumen del Pedido
                </Typography>
                
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

                <Typography variant="h6" gutterBottom>
                  Productos ({pedidoData.productos?.length || 0}):
                </Typography>
                
                {pedidoData.productos?.map((producto, index) => (
                  <Box key={index} sx={{ mb: 1, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {producto.nombre} x {producto.cantidad}
                    </Typography>
                    <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                      {pedidoData.moneda} {Math.round(producto.totalConIva).toLocaleString()}
                    </Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>{pedidoData.moneda} {Math.round(pedidoData.subtotalSinImpuestos).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>IVA (13%):</Typography>
                  <Typography>{pedidoData.moneda} {Math.round(pedidoData.ivaTotal).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Envío:</Typography>
                  <Typography color="success.main" sx={{ fontWeight: 'bold' }}>GRATIS</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {pedidoData.moneda} {Math.round(pedidoData.total).toLocaleString()}
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
                Total a pagar: <strong>{pedidoData.moneda} {Math.round(totalCompra).toLocaleString()}</strong>
              </Typography>

              {/* Selección del método de pago */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Método de Pago</InputLabel>
                <Select 
                  value={metodoPago} 
                  onChange={(e) => setMetodoPago(e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="tarjeta-credito">💳 Tarjeta de Crédito</MenuItem>
                  <MenuItem value="tarjeta-debito">💳 Tarjeta de Débito</MenuItem>
                  <MenuItem value="efectivo">💰 Efectivo</MenuItem>
                </Select>
              </FormControl>

              {/* Formulario de Tarjeta (Crédito y Débito) */}
              {esTarjeta() && (
                <Box sx={{ animation: 'fadeIn 0.3s ease-in' }}>
                  <Box sx={{ mb: 2, p: 2, backgroundColor: 'primary.light', borderRadius: 2 }}>
                    <Typography variant="body2" color="primary.contrastText" sx={{ fontWeight: 'bold' }}>
                      🔒 Pagando con tarjeta de {getTipoMetodo().toLowerCase()}
                    </Typography>
                  </Box>

                  {/* Número de Tarjeta con detección de tipo */}
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

                  {/* Fecha de Expiración con Selectores */}
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
                      💰 Pago en efectivo
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
                          {pedidoData.moneda}
                        </InputAdornment>
                      ),
                    }}
                    helperText={`Mínimo: ${pedidoData.moneda} ${Math.round(totalCompra).toLocaleString()}`}
                  />
                  {cambio > 0 && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'success.light', borderRadius: 2, border: '2px solid', borderColor: 'success.main' }}>
                      <Typography variant="h6" color="success.dark" sx={{ fontWeight: 'bold' }}>
                        💵 Cambio: {pedidoData.moneda} {cambio.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate(-1)}
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
                    "💳 Finalizar Pago"
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

      {/* Modal de Confirmación de Pago Exitoso */}
      <Dialog 
        open={showConfirmDialog} 
        maxWidth="md" 
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
            ¡Pago Exitoso!
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {ordenCreada && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: '#4caf50', fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
                Tu orden ha sido procesada correctamente
              </Typography>

              <Card sx={{ mb: 2, backgroundColor: '#f8f9fa', borderLeft: '4px solid #4caf50' }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Número de Orden:</strong>
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        #{ordenCreada.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Fecha:</strong>
                      </Typography>
                      <Typography variant="body1">
                        {new Date(ordenCreada.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Método de Pago:</strong>
                      </Typography>
                      <Typography variant="body1">
                        {ordenCreada.metodoPago}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Total Pagado:</strong>
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        {pedidoData.moneda} {Math.round(ordenCreada.total).toLocaleString()}
                      </Typography>
                    </Grid>
                    {ordenCreada.cambio > 0 && (
                      <Grid item xs={12}>
                        <Box sx={{ p: 2, backgroundColor: '#e8f5e8', borderRadius: 2, border: '1px solid #4caf50' }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                            💵 Cambio a devolver: {pedidoData.moneda} {ordenCreada.cambio.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                Se ha enviado un email de confirmación a tu dirección de correo electrónico.
                Puedes ver el detalle completo de tu orden haciendo clic en el botón de abajo.
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={irAOrdenes}
            sx={{ minWidth: 140 }}
          >
            Ver Mis Órdenes
          </Button>
          <Button 
            variant="contained" 
            onClick={verDetalleOrden}
            sx={{ 
              minWidth: 140,
              background: 'linear-gradient(45deg, #4caf50 30%, #45a049 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049 30%, #388e3c 90%)',
              }
            }}
          >
            Ver Detalle de Orden
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}