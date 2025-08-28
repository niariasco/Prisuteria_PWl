import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  Button, 
  Divider,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Add, 
  Remove, 
  Delete, 
  LocalShipping, 
  Security, 
  Refresh,
  ExpandMore,
  CheckCircle
} from '@mui/icons-material';
import { useCart } from '../../hooks/useCart';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import productTranslations from '../../translations/productTranslations.json';

export function ListaCarrito() {
  const { cart, removeItem, addItem, updateQuantity } = useCart();
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';
  const { t, i18n } = useTranslation();

  // Estado para manejar las cantidades localmente
  const [quantities, setQuantities] = useState({});
  
  // Estado para manejar la alerta de eliminación
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    productName: '',
    type: 'manual' // 'manual' o 'quantity'
  });

  // FUNCIONES DE CONVERSIÓN DE MONEDA
  const getCurrency = () => {
    return i18n.language === 'es' ? 'CRC' : 'USD';
  };

  // Tasa de cambio actualizada - ajusta según tu necesidad
  const EXCHANGE_RATE = 500; // 1 USD = 500 CRC
  // IMPORTANTE: Define cuál es tu moneda base en la base de datos
  const BASE_CURRENCY = 'CRC'; // Los precios están almacenados en CRC (colones)

  const convertPrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    
    // Si la moneda actual es la misma que la base, no convertir
    if ((i18n.language === 'en' && BASE_CURRENCY === 'USD') || 
        (i18n.language === 'es' && BASE_CURRENCY === 'CRC')) {
      return numPrice; // No convertir - mantener precio original
    }
    
    // Convertir según sea necesario
    if (i18n.language === 'es' && BASE_CURRENCY === 'USD') {
      // Convertir de USD (base) a CRC (mostrar)
      return numPrice * EXCHANGE_RATE;
    } else if (i18n.language === 'en' && BASE_CURRENCY === 'CRC') {
      // Convertir de CRC (base) a USD (mostrar)
      return numPrice / EXCHANGE_RATE;
    }
    
    return numPrice;
  };

  // Función para obtener la cantidad actual de un producto
  const getQuantity = (itemId) => {
    if (quantities[itemId]) {
      return quantities[itemId];
    }
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity || 1 : 1;
  };

  // Función para manejar el incremento de cantidad
  const handleIncreaseQuantity = (item) => {
    const currentQty = getQuantity(item.id);
    const newQuantity = currentQty + 1;
    
    setQuantities(prev => ({
      ...prev,
      [item.id]: newQuantity
    }));

    addItem(item);
  };

  // Función para manejar el decremento de cantidad - CORREGIDA
  const handleDecreaseQuantity = (item) => {
    const currentQty = getQuantity(item.id);
    
    if (currentQty > 1) {
      const newQuantity = currentQty - 1;
      
      setQuantities(prev => ({
        ...prev,
        [item.id]: newQuantity
      }));

      if (updateQuantity) {
        updateQuantity(item.id, newQuantity);
      }
    } else {
      // Si la cantidad es 1 y se decrementa, eliminar el producto
      handleRemoveItem(item, 'quantity');
    }
  };

  // Función CORREGIDA para manejar la eliminación de productos con alerta
  const handleRemoveItem = (item, removalType = 'manual') => {
    const productName = getProductName(item);
    
    // Mostrar alerta
    setAlertInfo({
      show: true,
      productName: productName,
      type: removalType
    });
    
    // Limpiar la cantidad local - CORREGIDO: usar 'quantities' no 'setCantidades'
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[item.id];
      return newQuantities;
    });
    
    // Eliminar del carrito
    removeItem(item);
  };

  // Función para cerrar la alerta
  const handleCloseAlert = () => {
    setAlertInfo({
      show: false,
      productName: '',
      type: 'manual'
    });
  };

  // Función para obtener el mensaje de la alerta
  const getAlertMessage = () => {
    if (alertInfo.type === 'quantity') {
      return t('cart.alerts.product_removed_quantity', 
        'Se eliminó "{{productName}}" del carrito al reducir la cantidad a cero', 
        { productName: alertInfo.productName }
      );
    } else {
      return t('cart.alerts.product_removed_manual', 
        'Se eliminó "{{productName}}" del carrito', 
        { productName: alertInfo.productName }
      );
    }
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

  // Función para determinar si un producto tiene personalizaciones
  const tienePersonalizaciones = (item) => {
    return item.opcionesPersonalizacion && 
           Object.keys(item.opcionesPersonalizacion).length > 0;
  };

  // Función para obtener el precio correcto (personalizado o normal)
  const getPrecioProducto = (item) => {
    // Si es producto personalizado, usar precio_total o precio_unitario
    if (tienePersonalizaciones(item)) {
      return convertPrice(item.precio_unitario || item.precio_total || item.precio);
    }

    // Para productos normales, usar la lógica existente de promociones
    if (tienePromocionActiva(item)) {
      return getPrecioConDescuentoConvertido(item);
    }
    
    return convertPrice(item.precio);
  };

  // Función para renderizar las características personalizadas
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
            {t('cart.customizations.view_details', 'Ver detalles')} ({Object.keys(opcionesPersonalizacion).length})
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
                    {opcion.criterioNombre || t('cart.customizations.option', 'Opción') + ` ${criterioId}`}:
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

  // FUNCIONES DE PROMOCIONES (mantenidas para compatibilidad con productos normales)

  // Función para determinar si el producto tiene promoción activa
  const tienePromocionActiva = (item) => {
    // Si es producto personalizado, no aplicar promociones
    if (tienePersonalizaciones(item)) {
      return false;
    }

    // Verificar múltiples campos que pueden indicar promoción
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

  // Función para obtener el precio original (antes del descuento) en la moneda correcta
  const getPrecioOriginalConvertido = (item) => {
    let precioOriginalBase = 0;
    
    // 1. Determinar el precio original en la moneda base (BD)
    if (item.precio_original && parseFloat(item.precio_original) > 0) {
      precioOriginalBase = parseFloat(item.precio_original);
    } else if (!tienePromocionActiva(item)) {
      precioOriginalBase = parseFloat(item.precio);
    } else {
      // Si tiene promoción pero no hay precio_original, calcularlo
      const precioActualBase = parseFloat(item.precio) || 0;
      const promocion = parseFloat(item.promocion || item.descuento_producto || item.descuento_categoria || 0);
      
      if (promocion > 0) {
        // precio_con_descuento = precio_original * (1 - promocion/100)
        // precio_original = precio_con_descuento / (1 - promocion/100)
        precioOriginalBase = precioActualBase / (1 - promocion / 100);
      } else {
        precioOriginalBase = precioActualBase;
      }
    }
    
    // 2. Convertir a la moneda de visualización
    const precioConvertido = convertPrice(precioOriginalBase);
    
    return precioConvertido;
  };

  // Función para obtener el precio con descuento en la moneda correcta
  const getPrecioConDescuentoConvertido = (item) => {
    let precioConDescuentoBase = 0;
    
    // 1. Determinar el precio con descuento en la moneda base (BD)
    if (item.precio_con_descuento && parseFloat(item.precio_con_descuento) > 0 && tienePromocionActiva(item)) {
      precioConDescuentoBase = parseFloat(item.precio_con_descuento);
    } 
    else if (tienePromocionActiva(item)) {
      // Calcular el precio con descuento
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
      // Si no tiene promoción, usar precio normal
      precioConDescuentoBase = parseFloat(item.precio);
    }
    
    // 2. Convertir a la moneda de visualización
    const precioConvertido = convertPrice(precioConDescuentoBase);
    
    return precioConvertido;
  };

  // Función para obtener el porcentaje de descuento
  const getPorcentajeDescuento = (item) => {
    return parseFloat(item.promocion || item.descuento_producto || item.descuento_categoria || 0);
  };

  // Función para obtener el nombre de la promoción
  const getNombrePromocion = (item) => {
    return item.nombre_promocion || 
           item.nombre_promocion_producto || 
           item.nombre_promocion_categoria || 
           t('cart.promotion.special_offer', 'Oferta Especial');
  };

  if (!cart || cart.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        p: 4 
      }}>
        <Typography variant="h4" gutterBottom color="text.secondary">
          {t('cart.empty.title', 'Tu bolsa de compras está vacía')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          {t('cart.empty.description', 'Agrega algunos productos increíbles y regresa para finalizar tu compra')}
        </Typography>
        <Button 
          variant="contained" 
          component={Link} 
          to="/producto"
          sx={{ 
            mt: 2, 
            px: 4, 
            py: 1.5,
            backgroundColor: '#F06292',
            '&:hover': {
              backgroundColor: '#E91E63'
            }
          }}
        >
          {t('cart.empty.explore_button', 'Explorar productos')}
        </Button>
      </Box>
    );
  }

  const validItems = cart.filter(item => item && item.id && item.nombre);

  if (validItems.length === 0) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        {t('cart.empty.no_valid_products', 'No hay productos válidos en tu bolsa de compras.')}
      </Typography>
    );
  }

  // Calcular totales con conversión de moneda correcta
  const currency = getCurrency();
  const subtotal = validItems.reduce((sum, item) => {
    const precio = getPrecioProducto(item);
    const cantidad = getQuantity(item.id);
    return sum + (precio * cantidad);
  }, 0);

  const subtotalOriginal = validItems.reduce((sum, item) => {
    let precioOriginal;
    
    if (tienePersonalizaciones(item)) {
      // Para productos personalizados, usar el precio base sin personalizaciones
      precioOriginal = convertPrice(item.precio || 0);
    } else {
      precioOriginal = getPrecioOriginalConvertido(item);
    }
    
    const cantidad = getQuantity(item.id);
    return sum + (precioOriginal * cantidad);
  }, 0);

  const totalAhorros = subtotalOriginal - subtotal;

  // Envío siempre gratis
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Snackbar para mostrar alerta de eliminación */}
      <Snackbar
        open={alertInfo.show}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity="info" 
          sx={{ 
            width: '100%',
            backgroundColor: '#E3F2FD',
            color: '#1565C0',
            '& .MuiAlert-icon': {
              color: '#1565C0'
            }
          }}
          icon={<CheckCircle />}
        >
          {getAlertMessage()}
        </Alert>
      </Snackbar>

      <Grid container spacing={4}>
        {/* Lista de productos - Lado izquierdo */}
        <Grid item xs={12} md={7}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            {t('cart.title', 'TU BOLSA')} ({validItems.length})
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            {validItems.map((item, index) => {
              const esPersonalizado = tienePersonalizaciones(item);
              const tienePromo = tienePromocionActiva(item);
              const precioOriginal = esPersonalizado ? 
                convertPrice(item.precio || 0) : 
                getPrecioOriginalConvertido(item);
              const precioFinal = getPrecioProducto(item);
              const cantidad = getQuantity(item.id);
              const promocion = getPorcentajeDescuento(item);
              const nombrePromocion = getNombrePromocion(item);

              return (
                <Card key={`${item.id}-${index}`} sx={{ mb: 2, boxShadow: 1 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                      {/* Imagen del producto */}
                      <Grid item xs={12} sm={3}>
                        <Box
                          component="img"
                          src={`${BASE_URL}/${item.imagen || 'default.jpg'}`}
                          alt={item.nombre}
                          sx={{
                            width: '100%',
                            maxWidth: 120,
                            height: 120,
                            objectFit: 'cover',
                            borderRadius: 2
                          }}
                        />
                      </Grid>

                      {/* Detalles del producto */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6">
                            {getProductName(item)}
                          </Typography>
                          {esPersonalizado && (
                            <Chip 
                              label={t('cart.customizations.customized_label', 'Personalizado')} 
                              size="small"
                              sx={{
                                backgroundColor: '#E3F2FD',
                                color: '#1976D2',
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                        </Box>
                        
                        {/* Chip de promoción para productos normales */}
                        {!esPersonalizado && tienePromo && promocion > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Chip 
                              label={`${promocion}% ${t('cart.promotion.discount_suffix', 'OFF')}`} 
                              sx={{
                                backgroundColor: '#F06292',
                                color: 'white',
                                mr: 1
                              }}
                              size="small" 
                            />
                            <Typography variant="caption" sx={{ color: '#F06292' }}>
                              {nombrePromocion}
                            </Typography>
                          </Box>
                        )}

                        {/* Precios */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#F06292' }}>
                            {currency} {Math.round(precioFinal).toLocaleString()}
                            {esPersonalizado && (
                              <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                ({t('cart.customizations.custom_price', 'precio personalizado')})
                              </Typography>
                            )}
                          </Typography>
                          {((!esPersonalizado && tienePromo) || (esPersonalizado && precioOriginal !== precioFinal)) && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                textDecoration: 'line-through', 
                                color: 'text.secondary'
                              }}
                            >
                              {currency} {Math.round(precioOriginal).toLocaleString()}
                            </Typography>
                          )}
                        </Box>

                        {/* Mostrar personalizaciones si existen */}
                        {esPersonalizado && renderPersonalizaciones(item.opcionesPersonalizacion)}

                        {/* Controles de cantidad */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 2,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 2,
                          p: 1,
                          width: 'fit-content'
                        }}>
                          <IconButton 
                            size="small"
                            onClick={() => handleDecreaseQuantity(item)}
                            sx={{ 
                              backgroundColor: '#F8BBD0',
                              color: '#fff',
                              '&:hover': {
                                backgroundColor: '#F06292',
                              },
                              width: 32,
                              height: 32
                            }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          
                          <Typography sx={{ 
                            mx: 3, 
                            minWidth: 30, 
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                          }}>
                            {cantidad}
                          </Typography>
                          
                          <IconButton 
                            size="small"
                            onClick={() => handleIncreaseQuantity(item)}
                            sx={{ 
                              backgroundColor: '#F8BBD0',
                              color: '#fff',
                              '&:hover': {
                                backgroundColor: '#F06292',
                              },
                              width: 32,
                              height: 32
                            }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>

                        <Button 
                          startIcon={<Delete />}
                          onClick={() => handleRemoveItem(item, 'manual')}
                          sx={{ 
                            mt: 2, 
                            color: '#F06292',
                            '&:hover': {
                              backgroundColor: 'rgba(240, 98, 146, 0.1)'
                            }
                          }}
                          size="small"
                        >
                          {t('cart.actions.remove', 'Eliminar')}
                        </Button>
                      </Grid>

                      {/* Precio total del item */}
                      <Grid item xs={12} sm={3} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {currency} {Math.round(precioFinal * cantidad).toLocaleString()}
                        </Typography>
                        {((esPersonalizado && precioOriginal !== precioFinal) || (!esPersonalizado && tienePromo)) && (
                          <Typography variant="body2" sx={{ color: 'success.main' }}>
                            {esPersonalizado ? 
                              `${t('cart.savings.customization', 'Personalización')}: +${currency} ${Math.round((precioFinal - precioOriginal) * cantidad).toLocaleString()}` :
                              `${t('cart.savings.you_save', 'Ahorras')}: ${currency} ${Math.round((precioOriginal - precioFinal) * cantidad).toLocaleString()}`
                            }
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          <Button
            variant="outlined"
            component={Link}
            to="/producto"
            sx={{ 
              mb: 3,
              borderColor: '#F06292',
              color: '#F06292',
              px: 4,
              py: 1.5,
              '&:hover': {
                borderColor: '#E91E63',
                backgroundColor: 'rgba(240, 98, 146, 0.1)',
                color: '#E91E63'
              }
            }}
          >
            {t('cart.actions.continue_shopping', 'SEGUIR COMPRANDO')}
          </Button>
        </Grid>

        {/* Resumen - Lado derecho */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              {t('cart.summary.title', 'RESUMEN DE COMPRA')}
            </Typography>

            {/* Resumen de precios */}
            <Box sx={{ mt: 4 }}>
              {totalAhorros > 0 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>{t('cart.summary.original_subtotal', 'Subtotal original')}</Typography>
                    <Typography sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                      {currency} {Math.round(subtotalOriginal).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      {t('cart.summary.discounts_customizations', 'Descuentos/Personalizaciones')}
                    </Typography>
                    <Typography sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      {totalAhorros > 0 ? '-' : '+'}{currency} {Math.round(Math.abs(totalAhorros)).toLocaleString()}
                    </Typography>
                  </Box>
                </>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>{t('cart.summary.product_total', 'Total productos')}</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {currency} {Math.round(subtotal).toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>{t('cart.summary.shipping', 'Gastos de envío')}</Typography>
                <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {t('cart.summary.free', 'GRATIS')}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {t('cart.summary.total', 'Total')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {currency} {Math.round(total).toLocaleString()}
                </Typography>
              </Box>

              {totalAhorros !== 0 && (
                <Box sx={{ 
                  backgroundColor: totalAhorros > 0 ? 'success.light' : 'info.light', 
                  p: 2, 
                  borderRadius: 2, 
                  mb: 2,
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: totalAhorros > 0 ? 'success.dark' : 'info.dark' }}>
                    {totalAhorros > 0 
                      ? t('cart.summary.total_savings', '¡Has ahorrado {{amount}} en total!', { amount: `${currency} ${Math.round(totalAhorros).toLocaleString()}` })
                      : t('cart.summary.customization_cost', 'Costo de personalizaciones: {{amount}}', { amount: `${currency} ${Math.round(Math.abs(totalAhorros)).toLocaleString()}` })
                    }
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Botón de checkout */}
            <Button
              variant="contained"
              fullWidth
              component={Link}
              to="/registrar-pedido"
              sx={{ 
                backgroundColor: '#F06292',
                color: 'white',
                py: 2,
                mb: 3,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#E91E63',
                },
                '&:active': {
                  backgroundColor: '#C2185B'
                }
              }}
            >
              {t('cart.actions.place_order', 'REALIZAR PEDIDO')}
            </Button>

            {/* Beneficios */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Refresh sx={{ mr: 2, color: '#F06292' }} />
                <Typography variant="body2" color="text.secondary">
                  {t('cart.benefits.return_policy', '30 DÍAS PARA DEVOLVER GRATIS TUS COMPRAS')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalShipping sx={{ mr: 2, color: '#F06292' }} />
                <Typography variant="body2" color="text.secondary">
                  {t('cart.benefits.free_shipping', 'ENVÍO GRATIS')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 2, color: '#F06292' }} />
                <Typography variant="body2" color="text.secondary">
                  {t('cart.benefits.secure_payment', 'PAGO SEGURO')}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}