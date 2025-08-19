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
  CircularProgress,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Receipt,
  Person,
  LocationOn,
  CalendarToday,
  ShoppingCart,
  CheckCircle,
  Add,
  Remove,
  Delete,
  ExpandMore,
  Warning
} from '@mui/icons-material';
import { useCart } from '../../hooks/useCart';
import { UserContext } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import UsuarioDetalleService from '../../services/UsuariosDetalleService.js';
// CAMBIO: Usar ProductoService (sin "s") en lugar de ProductosService
import ProductoService from '../../services/ProductoService.js'; // Para verificar stock
import productTranslations from '../../translations/productTranslations.json';

export function RegistrarPedido() {
  const { cart, getCountItems, clearCart, removeItem, updateQuantity } = useCart();
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

  // Estados para manejo de datos reales del usuario
  const [usuarioDetalleActual, setUsuarioDetalleActual] = useState(null);
  const [loadingUsuarioDetalle, setLoadingUsuarioDetalle] = useState(false);
  const [errorUsuarioDetalle, setErrorUsuarioDetalle] = useState(null);

  // Estados para validaciones
  const [erroresStock, setErroresStock] = useState([]);
  const [validandoStock, setValidandoStock] = useState(false);
  const [dialogConfirmacion, setDialogConfirmacion] = useState(false);

  // Estados para cantidades locales (para actualizaciones en tiempo real)
  const [cantidadesLocales, setCantidadesLocales] = useState({});

  // Constantes de moneda y conversión
  const getCurrency = () => {
    return i18n.language === 'es' ? 'CRC' : 'USD';
  };

  const EXCHANGE_RATE = 500;
  const BASE_CURRENCY = 'CRC';
  const IVA_PERCENTAGE = 13; // 13% IVA en Costa Rica

  const convertPrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    
    if ((i18n.language === 'en' && BASE_CURRENCY === 'USD') || 
        (i18n.language === 'es' && BASE_CURRENCY === 'CRC')) {
      return numPrice;
    }
    
    if (i18n.language === 'es' && BASE_CURRENCY === 'USD') {
      return numPrice * EXCHANGE_RATE;
    } else if (i18n.language === 'en' && BASE_CURRENCY === 'CRC') {
      return numPrice / EXCHANGE_RATE;
    }
    
    return numPrice;
  };

  // Función para obtener el nombre traducido
  const getProductName = (producto) => {
    if (producto.translations && producto.translations[i18n.language]) {
      return producto.translations[i18n.language];
    }
    const productName = producto.nombre;
    if (productTranslations.products[productName] && productTranslations.products[productName][i18n.language]) {
      return productTranslations.products[productName][i18n.language];
    }
    return producto.nombre;
  };

  // Función para obtener la cantidad actual de un producto
  const getCantidadActual = (itemId) => {
    if (cantidadesLocales[itemId] !== undefined) {
      return cantidadesLocales[itemId];
    }
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity || 1 : 1;
  };

  // Función para actualizar cantidad local y del carrito
  const actualizarCantidad = (itemId, nuevaCantidad) => {
    // Validar que sea número positivo
    const cantidad = Math.max(0, parseInt(nuevaCantidad) || 0);
    
    setCantidadesLocales(prev => ({
      ...prev,
      [itemId]: cantidad
    }));

    // Si la cantidad es 0, eliminar del carrito
    if (cantidad === 0) {
      const item = cart.find(item => item.id === itemId);
      if (item) {
        removeItem(item);
      }
    } else {
      // Actualizar en el carrito
      if (updateQuantity) {
        updateQuantity(itemId, cantidad);
      }
    }
  };

  // FUNCIONES DE PRODUCTOS PERSONALIZADOS

  const tienePersonalizaciones = (item) => {
    return item.opcionesPersonalizacion && 
           Object.keys(item.opcionesPersonalizacion).length > 0;
  };

  const renderPersonalizaciones = (opcionesPersonalizacion) => {
    if (!opcionesPersonalizacion || Object.keys(opcionesPersonalizacion).length === 0) {
      return null;
    }

    return (
      <Accordion sx={{ mt: 1, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{ 
            backgroundColor: '#f8f9fa', 
            minHeight: '40px',
            '& .MuiAccordionSummary-content': {
              margin: '8px 0'
            }
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#F06292' }}>
            Ver personalizaciones ({Object.keys(opcionesPersonalizacion).length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(opcionesPersonalizacion).map(([criterioId, opcion]) => {
              if (!opcion || !opcion.nombre) return null;
              
              return (
                <Box key={criterioId} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1,
                  backgroundColor: '#f9f9f9',
                  borderRadius: 1,
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {opcion.criterioNombre || `Opción ${criterioId}`}:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {opcion.nombre}
                    </Typography>
                    {opcion.precio_adicional && parseFloat(opcion.precio_adicional) > 0 && (
                      <Chip 
                        label={`+${getCurrency()} ${Math.round(convertPrice(opcion.precio_adicional)).toLocaleString()}`}
                        size="small"
                        sx={{ 
                          backgroundColor: '#E8F5E8',
                          color: '#2E7D32',
                          fontSize: '0.75rem',
                          height: '24px'
                        }}
                      />
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  // FUNCIONES DE PRECIOS Y PROMOCIONES

  const tienePromocionActiva = (item) => {
    if (tienePersonalizaciones(item)) {
      return false;
    }

    const promocionPorcentaje = parseFloat(item.promocion || 0);
    const tienePromocion = item.tiene_promocion;
    const precioConDescuento = item.precio_con_descuento;
    const descuentoProducto = parseFloat(item.descuento_producto || 0);
    const descuentoCategoria = parseFloat(item.descuento_categoria || 0);
    
    return promocionPorcentaje > 0 || 
           tienePromocion || 
           (precioConDescuento && precioConDescuento !== item.precio) ||
           descuentoProducto > 0 ||
           descuentoCategoria > 0;
  };

  const getPrecioOriginalConvertido = (item) => {
    let precioOriginalBase = 0;
    
    if (item.precio_original && parseFloat(item.precio_original) > 0) {
      precioOriginalBase = parseFloat(item.precio_original);
    } else if (!tienePromocionActiva(item)) {
      precioOriginalBase = parseFloat(item.precio);
    } else {
      const precioActualBase = parseFloat(item.precio) || 0;
      const promocion = parseFloat(item.promocion || item.descuento_producto || item.descuento_categoria || 0);
      
      if (promocion > 0) {
        precioOriginalBase = precioActualBase / (1 - promocion / 100);
      } else {
        precioOriginalBase = precioActualBase;
      }
    }
    
    return convertPrice(precioOriginalBase);
  };

  const getPrecioConDescuentoConvertido = (item) => {
    let precioConDescuentoBase = 0;
    
    if (item.precio_con_descuento && parseFloat(item.precio_con_descuento) > 0 && tienePromocionActiva(item)) {
      precioConDescuentoBase = parseFloat(item.precio_con_descuento);
    } 
    else if (tienePromocionActiva(item)) {
      let precioOriginalBase = 0;
      
      if (item.precio_original && parseFloat(item.precio_original) > 0) {
        precioOriginalBase = parseFloat(item.precio_original);
      } else {
        precioOriginalBase = parseFloat(item.precio);
      }
      
      const promocion = parseFloat(item.promocion || item.descuento_producto || item.descuento_categoria || 0);
      
      if (promocion > 0) {
        precioConDescuentoBase = precioOriginalBase * (1 - promocion / 100);
      } else {
        precioConDescuentoBase = precioOriginalBase;
      }
    } 
    else {
      precioConDescuentoBase = parseFloat(item.precio);
    }
    
    return convertPrice(precioConDescuentoBase);
  };

  const getPorcentajeDescuento = (item) => {
    return parseFloat(item.promocion || item.descuento_producto || item.descuento_categoria || 0);
  };

  const getPrecioUnitario = (item) => {
    if (tienePersonalizaciones(item)) {
      return convertPrice(item.precio_unitario || item.precio_total || item.precio);
    }

    if (tienePromocionActiva(item)) {
      return getPrecioConDescuentoConvertido(item);
    }
    
    return convertPrice(item.precio);
  };

  // Función para calcular IVA
  const calcularIVA = (precio) => {
    return precio * (IVA_PERCENTAGE / 100);
  };

  // Función para validar stock - CAMBIO: Usar ProductoService en lugar de ProductosService
  const validarStock = async () => {
    setValidandoStock(true);
    setErroresStock([]);
    
    const errores = [];
    const validItems = cart?.filter(item => item && item.id && item.nombre) || [];

    try {
      for (const item of validItems) {
        // Solo validar stock para productos normales, no personalizados
        if (!tienePersonalizaciones(item)) {
          const cantidadSolicitada = getCantidadActual(item.id);
          
          if (cantidadSolicitada > 0) {
            try {
              // CAMBIO: Usar getProductoById del ProductoService existente
              const response = await ProductoService.getProductoById(item.id);
              const productoActual = response.data || response;
              
              const stockDisponible = parseInt(productoActual.stock || 0);
              
              if (stockDisponible < cantidadSolicitada) {
                errores.push({
                  producto: getProductName(item),
                  cantidadSolicitada,
                  stockDisponible
                });
              }
            } catch (error) {
              console.error(`Error validando stock para producto ${item.id}:`, error);
              errores.push({
                producto: getProductName(item),
                cantidadSolicitada: getCantidadActual(item.id),
                error: 'No se pudo verificar el stock'
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error general validando stock:', error);
    }
    
    setErroresStock(errores);
    setValidandoStock(false);
    
    return errores.length === 0;
  };

  // Función para cargar los datos del usuario
  const cargarUsuarioDetalleActual = async () => {
    if (!userData || !userData.usuarioId) {
      console.log('No hay usuario logueado o falta usuarioId');
      return;
    }

    setLoadingUsuarioDetalle(true);
    setErrorUsuarioDetalle(null);

    try {
      const response = await UsuarioDetalleService.getUsuarioDetalles();
      
      if (response.data && Array.isArray(response.data)) {
        const detalleUsuario = response.data.find(
          detalle => detalle.usuarioId === userData.usuarioId
        );

        if (detalleUsuario) {
          setUsuarioDetalleActual(detalleUsuario);
          
          const clienteReal = {
            id: detalleUsuario.usuarioDetalleId,
            nombre: detalleUsuario.nombre_completo,
            email: detalleUsuario.correo,
            telefono: detalleUsuario.telefono || 'No especificado',
            cedula: detalleUsuario.cedula || 'No especificada',
            direccion: detalleUsuario.direccion_envio || ''
          };

          setClienteSeleccionado(clienteReal);
          setDireccionEnvio(clienteReal.direccion);
          setClientesDisponibles([clienteReal]);
          cargarDetalleCliente(clienteReal);
          
          console.log('Datos del usuario cargados:', detalleUsuario);
        } else {
          setErrorUsuarioDetalle('No se encontraron detalles para este usuario');
        }
      }
    } catch (error) {
      console.error('Error al cargar los detalles del usuario:', error);
      setErrorUsuarioDetalle('Error al cargar los datos del usuario');
    } finally {
      setLoadingUsuarioDetalle(false);
    }
  };

  const cargarDetalleCliente = async (cliente) => {
    if (!cliente) {
      setDetalleCliente(null);
      return;
    }

    setLoadingDetalle(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const detalleCompleto = {
      ...cliente,
      fechaRegistro: usuarioDetalleActual?.created_at || '2023-01-15',
      pedidosAnteriores: Math.floor(Math.random() * 20),
      totalCompras: (Math.random() * 500000).toFixed(2),
      categoriaCliente: 'Premium',
      metodoPagoPreferido: 'Tarjeta de Crédito'
    };
    
    setDetalleCliente(detalleCompleto);
    setLoadingDetalle(false);
  };

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (userData && userData.usuarioId) {
      cargarUsuarioDetalleActual();
    }
  }, [userData]);

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

  if (!userData || !userData.usuarioId) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Debes iniciar sesión para registrar un pedido.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/user/login')}
          sx={{ backgroundColor: '#F06292' }}
        >
          Iniciar Sesión
        </Button>
      </Box>
    );
  }

  // Calcular totales
  const currency = getCurrency();
  
  // Subtotal sin impuestos
  const subtotalSinImpuestos = validItems.reduce((sum, item) => {
    const precioUnitario = getPrecioUnitario(item);
    const cantidad = getCantidadActual(item.id);
    return sum + (precioUnitario * cantidad);
  }, 0);

  // Calcular IVA total
  const ivaTotal = calcularIVA(subtotalSinImpuestos);
  
  // Total con impuestos
  const totalConImpuestos = subtotalSinImpuestos + ivaTotal;

  // Envío siempre gratis
  const shipping = 0;
  const total = totalConImpuestos + shipping;

  // FUNCIONES MODIFICADAS PARA REDIRIGIR AL PAGO

// Reemplazar la función proceedToPayment en RegistrarPedido.js

const proceedToPayment = () => {
  console.log('Procediendo al pago...'); // Debug
  
  // Preparar los datos del pedido para pasarlos a la página de pago
  const pedidoData = {
    cliente: clienteSeleccionado,
    usuarioDetalle: usuarioDetalleActual,
    fecha: fechaActual,
    direccionEnvio,
    estado: estadoPedido,
    productos: validItems.map(item => ({
      ...item,
      cantidad: getCantidadActual(item.id),
      precioUnitario: getPrecioUnitario(item),
      subtotal: getPrecioUnitario(item) * getCantidadActual(item.id),
      iva: calcularIVA(getPrecioUnitario(item) * getCantidadActual(item.id)),
      totalConIva: getPrecioUnitario(item) * getCantidadActual(item.id) + calcularIVA(getPrecioUnitario(item) * getCantidadActual(item.id)),
      esPersonalizado: tienePersonalizaciones(item),
      opcionesPersonalizacion: item.opcionesPersonalizacion || null
    })),
    subtotalSinImpuestos,
    ivaTotal,
    totalConImpuestos,
    envio: shipping,
    total,
    moneda: currency
  };

  console.log('Datos del pedido a enviar:', pedidoData); // Debug

  try {
    // OPCIÓN 1: Usar navigate con state (recomendado)
    console.log('Navegando a /pago-pedido con state'); // Debug
    navigate('/pago-pedido', { 
      state: { 
        pedidoData: pedidoData 
      }
    });

    // OPCIÓN 2: También guardar en localStorage como respaldo
    localStorage.setItem('pedidoEnProceso', JSON.stringify(pedidoData));
    
  } catch (error) {
    console.error('Error al navegar:', error);
    alert('Error al procesar el pedido. Por favor intente nuevamente.');
  }
};

  // Función para procesar el pedido - MODIFICADA
  const procesarPedido = async () => {
    console.log('Iniciando procesamiento del pedido...'); // Debug
    
    // Validaciones básicas
    if (!clienteSeleccionado || !direccionEnvio.trim()) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    console.log('Cliente seleccionado:', clienteSeleccionado); // Debug
    console.log('Dirección de envío:', direccionEnvio); // Debug

    // Validar cantidades
    const hayErroresCantidad = validItems.some(item => {
      const cantidad = getCantidadActual(item.id);
      return cantidad <= 0 || !Number.isInteger(cantidad);
    });

    if (hayErroresCantidad) {
      alert('Todas las cantidades deben ser números enteros positivos');
      return;
    }

    console.log('Validaciones básicas completadas'); // Debug

    // Validar stock
    try {
      const stockValido = await validarStock();
      console.log('Resultado de validación de stock:', stockValido); // Debug
      
      if (!stockValido) {
        setDialogConfirmacion(true);
        return;
      }

      // Si llegamos aquí, todo está bien
      proceedToPayment();
    } catch (error) {
      console.error('Error en validación de stock:', error);
      alert('Error al validar el inventario. Por favor intente nuevamente.');
    }
  };

  // Función para proceder con el pedido a pesar de errores de stock - MODIFICADA
  const proceedWithOrder = () => {
    console.log('Procediendo con el pedido a pesar de errores de stock'); // Debug
    setDialogConfirmacion(false);
    proceedToPayment();
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

      {/* Mostrar errores si los hay */}
      {errorUsuarioDetalle && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorUsuarioDetalle}
        </Alert>
      )}

      {/* Mostrar errores de stock */}
      {erroresStock.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <Warning sx={{ mr: 1 }} />
            Problemas de inventario detectados:
          </Typography>
          {erroresStock.map((error, index) => (
            <Typography key={index} variant="body2">
              • {error.producto}: Solicitado {error.cantidadSolicitada}, Disponible: {error.stockDisponible || error.error}
            </Typography>
          ))}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Información del pedido - Lado izquierdo */}
        <Grid item xs={12} md={8}>
          {/* Información General */}
          <Card sx={{ mb: 3, boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#F06292' }}>
                INFORMACIÓN GENERAL
              </Typography>
              
              <Grid container spacing={3}>
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
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>

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
                    loading={loadingUsuarioDetalle}
                    disabled={true}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cliente (Usuario actual)"
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <React.Fragment>
                              {loadingUsuarioDetalle ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

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
                  DETALLE DEL PEDIDO ({validItems.length} productos)
                </Typography>
              </Box>

              {validItems.map((item, index) => {
                const esPersonalizado = tienePersonalizaciones(item);
                const precioUnitario = getPrecioUnitario(item);
                const cantidad = getCantidadActual(item.id);
                const subtotalItem = precioUnitario * cantidad;
                const ivaItem = calcularIVA(subtotalItem);
                const totalConIvaItem = subtotalItem + ivaItem;
                const promocion = getPorcentajeDescuento(item);

                return (
                  <Card key={`${item.id}-${index}`} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={3} alignItems="center">
                        {/* Información del producto */}
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {getProductName(item)}
                              </Typography>
                              {esPersonalizado && (
                                <Chip 
                                  label="Personalizado" 
                                  size="small"
                                  sx={{
                                    backgroundColor: '#E3F2FD',
                                    color: '#1976D2',
                                    fontWeight: 'bold'
                                  }}
                                />
                              )}
                              {!esPersonalizado && promocion > 0 && (
                                <Chip 
                                  label={`${promocion}% OFF`} 
                                  size="small"
                                  sx={{
                                    backgroundColor: '#F06292',
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }}
                                />
                              )}
                            </Box>
                            <IconButton 
                              onClick={() => {
                                removeItem(item);
                                setCantidadesLocales(prev => {
                                  const newState = {...prev};
                                  delete newState[item.id];
                                  return newState;
                                });
                              }}
                              sx={{ color: '#F06292' }}
                            >
                              <Delete />
                            </IconButton>
                          </Box>

                          {/* Información específica para productos personalizados */}
                          {esPersonalizado && (
                            <Box sx={{ mb: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#F06292' }}>
                                Información del Producto Personalizado:
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Producto Base:</strong> {getProductName(item)}
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Costo Base:</strong> {currency} {Math.round(convertPrice(item.precio || 0)).toLocaleString()}
                              </Typography>
                              {renderPersonalizaciones(item.opcionesPersonalizacion)}
                              <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold', color: '#F06292' }}>
                                <strong>Total Personalizado:</strong> {currency} {Math.round(precioUnitario).toLocaleString()}
                              </Typography>
                            </Box>
                          )}

                          {/* Controles de cantidad y precios */}
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Cantidad:
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton 
                                  size="small"
                                  onClick={() => actualizarCantidad(item.id, cantidad - 1)}
                                  disabled={cantidad <= 1}
                                  sx={{ 
                                    backgroundColor: '#F8BBD0',
                                    color: '#fff',
                                    '&:hover': { backgroundColor: '#F06292' },
                                    '&:disabled': { backgroundColor: '#e0e0e0', color: '#9e9e9e' }
                                  }}
                                >
                                  <Remove fontSize="small" />
                                </IconButton>
                                
                                <TextField
                                  size="small"
                                  value={cantidad}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    // Permitir campo vacío temporalmente para edición
                                    if (newValue === '') {
                                      setCantidadesLocales(prev => ({ ...prev, [item.id]: '' }));
                                    } else {
                                      const numValue = parseInt(newValue);
                                      if (!isNaN(numValue) && numValue >= 0) {
                                        actualizarCantidad(item.id, numValue);
                                      }
                                    }
                                  }}
                                  onBlur={() => {
                                    // Al perder el foco, asegurar que hay un valor válido
                                    if (cantidad === '' || cantidad <= 0) {
                                      actualizarCantidad(item.id, 1);
                                    }
                                  }}
                                  inputProps={{ 
                                    min: 1, 
                                    style: { textAlign: 'center', width: '60px' },
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*'
                                  }}
                                  error={cantidad === '' || cantidad <= 0}
                                  helperText={cantidad === '' || cantidad <= 0 ? 'Cantidad requerida' : ''}
                                />
                                
                                <IconButton 
                                  size="small"
                                  onClick={() => actualizarCantidad(item.id, cantidad + 1)}
                                  sx={{ 
                                    backgroundColor: '#F8BBD0',
                                    color: '#fff',
                                    '&:hover': { backgroundColor: '#F06292' }
                                  }}
                                >
                                  <Add fontSize="small" />
                                </IconButton>
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={3}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Precio Unitario:
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#F06292' }}>
                                {currency} {Math.round(precioUnitario).toLocaleString()}
                              </Typography>
                              {!esPersonalizado && tienePromocionActiva(item) && (
                                <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                  {currency} {Math.round(getPrecioOriginalConvertido(item)).toLocaleString()}
                                </Typography>
                              )}
                            </Grid>

                            <Grid item xs={12} sm={3}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Subtotal (sin IVA):
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {currency} {Math.round(subtotalItem).toLocaleString()}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                IVA (13%): {currency} {Math.round(ivaItem).toLocaleString()}
                              </Typography>
                            </Grid>

                            <Grid item xs={12} sm={3}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Total con IVA:
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#F06292' }}>
                                {currency} {Math.round(totalConIvaItem).toLocaleString()}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Botón para validar stock */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={validarStock}
                  disabled={validandoStock}
                  startIcon={validandoStock ? <CircularProgress size={20} /> : <CheckCircle />}
                  sx={{
                    borderColor: '#F06292',
                    color: '#F06292',
                    '&:hover': {
                      borderColor: '#E91E63',
                      backgroundColor: 'rgba(240, 98, 146, 0.1)',
                    }
                  }}
                >
                  {validandoStock ? 'Validando Inventario...' : 'Validar Disponibilidad'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Resumen y Totales - Lado derecho */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20, boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#F06292' }}>
                RESUMEN DEL PEDIDO
              </Typography>

              {/* Desglose de totales */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Subtotal (sin impuestos):</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {currency} {Math.round(subtotalSinImpuestos).toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>IVA (13%):</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {currency} {Math.round(ivaTotal).toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Total con impuestos:</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#F06292' }}>
                    {currency} {Math.round(totalConImpuestos).toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Envío:</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    GRATIS
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    TOTAL FINAL:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#F06292' }}>
                    {currency} {Math.round(total).toLocaleString()}
                  </Typography>
                </Box>

                {/* Información de impuestos */}
                <Box sx={{ 
                  backgroundColor: '#e8f5e8', 
                  p: 2, 
                  borderRadius: 2, 
                  mb: 2,
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    Impuestos incluidos: {currency} {Math.round(ivaTotal).toLocaleString()} (13% IVA)
                  </Typography>
                </Box>
              </Box>

              {/* Botón de confirmar pedido - MODIFICADO PARA IR AL PAGO */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={procesarPedido}
                disabled={loading || !clienteSeleccionado || !direccionEnvio.trim() || loadingUsuarioDetalle}
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
                  'PROCEDER AL PAGO'
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

      {/* Dialog de confirmación para errores de stock */}
      <Dialog
        open={dialogConfirmacion}
        onClose={() => setDialogConfirmacion(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#F06292', fontWeight: 'bold' }}>
          <Warning sx={{ mr: 1 }} />
          Confirmar Pedido con Problemas de Inventario
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Se detectaron problemas de inventario para algunos productos. ¿Desea continuar con el pedido?
          </Typography>
          <Box sx={{ backgroundColor: '#fff3cd', p: 2, borderRadius: 1, border: '1px solid #ffeaa7' }}>
            {erroresStock.map((error, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                • <strong>{error.producto}:</strong> Solicitado {error.cantidadSolicitada}, 
                Disponible: {error.stockDisponible || error.error}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogConfirmacion(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={proceedWithOrder} 
            variant="contained"
            sx={{ backgroundColor: '#F06292', '&:hover': { backgroundColor: '#E91E63' } }}
          >
            Continuar al Pago
          </Button>
        </DialogActions>
      </Dialog>
      
    </Box>
  );
}