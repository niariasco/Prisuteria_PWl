import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useParams, useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import ProductoService from '../../services/ProductoService';
import PropTypes from 'prop-types';
import { Button, Box, Rating, Divider, Chip } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FormResena } from './Forms/FormResena';
import { useTranslation } from 'react-i18next';
import productTranslations from '../../translations/productTranslations.json';
import categoryTranslations from '../../translations/categoryTranslations.json';
import ProductosPService from '../../services/ProductosPService';

export function DetalleProductos({ addItem, isShopping }) {
  const { id } = useParams();
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState({});
  const [precioTotal, setPrecioTotal] = useState(0);
  const [precioBase, setPrecioBase] = useState(0); 
  const [precioBaseConDescuento, setPrecioBaseConDescuento] = useState(0);
  const [calculandoPrecio, setCalculandoPrecio] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Funciones de conversión de moneda (agregadas desde ListaCartasProductos)
  const EXCHANGE_RATE = 500; // 1 USD = 500 CRC
  const BASE_CURRENCY = 'CRC'; // moneda base de la BD

  const getCurrency = (language) => (language === 'es' ? 'CRC' : 'USD');

  const convertPrice = (price, language) => {
    const numPrice = parseFloat(price) || 0;

    if ((language === 'en' && BASE_CURRENCY === 'USD') || (language === 'es' && BASE_CURRENCY === 'CRC')) {
      return numPrice;
    }

    if (language === 'es' && BASE_CURRENCY === 'USD') return numPrice * EXCHANGE_RATE;
    if (language === 'en' && BASE_CURRENCY === 'CRC') return numPrice / EXCHANGE_RATE;

    return numPrice;
  };

  // Función mejorada para formatear precios con conversión de moneda
  const formatPrice = (price, language = i18n.language) => {
    const convertedPrice = convertPrice(price, language);
    return convertedPrice.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' ' + getCurrency(language);
  };

  const getProductName = (producto) => {
    if (producto.translations && producto.translations[i18n.language]) return producto.translations[i18n.language];
    const productName = producto.nombre;
    if (productTranslations.products[productName] && productTranslations.products[productName][i18n.language]) {
      return productTranslations.products[productName][i18n.language];
    }
    return producto.nombre;
  };

  const getProductDescription = (producto) => {
    if (producto.translations && producto.translations[i18n.language]?.description) return producto.translations[i18n.language].description;
    if (
      productTranslations.products[producto.nombre] &&
      productTranslations.products[producto.nombre].description &&
      productTranslations.products[producto.nombre].description[i18n.language]
    ) {
      return productTranslations.products[producto.nombre].description[i18n.language];
    }
    return producto.descripcion;
  };

  const getCategoryName = (categoria) => {
    if (categoria.translations && categoria.translations[i18n.language]) return categoria.translations[i18n.language];
    const categoryName = categoria.nombreSCategoria;
    if (categoryTranslations.categories[categoryName] && categoryTranslations.categories[categoryName][i18n.language]) {
      return categoryTranslations.categories[categoryName][i18n.language];
    }
    return categoria.nombreSCategoria;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    let fechaObj;
    if (fecha instanceof Date) fechaObj = fecha;
    else if (typeof fecha === 'string') fechaObj = new Date(fecha.includes('T') ? fecha : fecha.replace(' ', 'T'));
    else if (typeof fecha === 'number') fechaObj = new Date(fecha);
    else return 'Fecha no disponible';
    return isNaN(fechaObj.getTime()) ? 'Fecha no disponible' : fechaObj.toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Función para calcular precio localmente (fallback) - modificada para usar conversión
  const calcularPrecioLocal = (opcionesSeleccionadas) => {
    let precioCalculado = precioBaseConDescuento;
    
    Object.values(opcionesSeleccionadas).forEach(opcion => {
      if (opcion && opcion.precio_adicional) {
        precioCalculado += parseFloat(opcion.precio_adicional) || 0;
      }
    });
    
    return precioCalculado;
  };

  // Función para actualizar el precio
  const actualizarPrecio = async (nuevasOpciones) => {
    setCalculandoPrecio(true);
    
    try {
      const opcionesValidas = Object.entries(nuevasOpciones)
        .filter(([criterioId, opcion]) => opcion && opcion.id && criterioId)
        .map(([criterioId, opcion]) => ({ 
          criterioId: parseInt(criterioId),
          opcionId: parseInt(opcion.id)
        }));
        
      if (opcionesValidas.length === 0) {
        setPrecioTotal(precioBaseConDescuento);
        setCalculandoPrecio(false);
        return;
      }
      precioBase;
      setPrecioTotal(calcularPrecioLocal(nuevasOpciones));
      
      try {
        const response = await ProductosPService.calcularPrecioTotal(
        data.productosId || data.id, 
         opcionesValidas
        );
        
        console.log('Respuesta del servicio:', response);
        
        if (response && response.precioTotal !== undefined) {
          let precioServicio = parseFloat(response.precioTotal);
          
          if (data.precio_con_descuento && data.precio_con_descuento !== data.precio) {
            const factorDescuento = data.precio_con_descuento / data.precio;
            precioServicio = precioServicio * factorDescuento;
          }
          
          setPrecioTotal(precioServicio);
        } else {
          console.warn('Respuesta inválida del servicio, calculando localmente');
          setPrecioTotal(calcularPrecioLocal(nuevasOpciones));
        }
      } catch (serviceError) {
        console.error('Error en servicio, calculando localmente:', serviceError);
      }
    } catch (error) {
      console.error('Error calculando precio:', error);
      setPrecioTotal(precioBaseConDescuento);
    } finally {
      setCalculandoPrecio(false);
    }
  };

  const handleOpcionChange = async (criterioId, e) => {
    const opcionIdStr = e.target.value;
    
    if (!opcionIdStr || opcionIdStr === '') {
      const nuevasOpciones = { ...opcionesSeleccionadas };
      delete nuevasOpciones[criterioId];
      setOpcionesSeleccionadas(nuevasOpciones);
      await actualizarPrecio(nuevasOpciones);
      return;
    }

    const criterio = data.criterios.find(c => c.id === criterioId || c.id === String(criterioId));
    if (!criterio) {
      console.error('Criterio no encontrado:', criterioId);
      return;
    }

    const opcionSeleccionada = criterio.opciones?.find(op => 
      op.id === opcionIdStr || op.id === parseInt(opcionIdStr) || String(op.id) === opcionIdStr
    );
    
    if (!opcionSeleccionada) {
      console.error('Opción no encontrada:', opcionIdStr);
      return;
    }

    const nuevasOpciones = {
      ...opcionesSeleccionadas,
      [criterioId]: {
        ...opcionSeleccionada,
        criterioId: criterioId
      }
    };

    setOpcionesSeleccionadas(nuevasOpciones);
    await actualizarPrecio(nuevasOpciones);
  };

  useEffect(() => {
    ProductoService.getProductoById(id)
      .then((response) => {
        const producto = response.data;
        
        console.log('=== DEBUG PRODUCTO CARGADO ===');
        console.log('producto completo:', producto);
        
        producto.etiquetas = producto.etiquetas || [];
        producto.resenas = producto.resenas || [];
        producto.promedio_valoracion = producto.promedio_valoracion || 0;
        
        const precio = parseFloat(producto.precio) || 0;
        const precioConDescuento = producto.precio_con_descuento ? 
          parseFloat(producto.precio_con_descuento) : precio;
        
        setPrecioBase(precio);
        setPrecioBaseConDescuento(precioConDescuento);
        setPrecioTotal(precioConDescuento);
        setData(producto);
        setLoaded(true);
      })
      .catch((err) => {
        console.error('Error al cargar producto:', err);
        setLoaded(true);
      });
  }, [id]);

  if (!loaded) return <p>Cargando...</p>;
  if (!data) return <p>Producto no disponible</p>;

  const handleAddToCart = (producto) => {
    const seleccionesValidas = Object.entries(opcionesSeleccionadas)
      .map(([criterioId, op]) => ({
        criterioId: Number(criterioId),
        opcionId: op?.id ?? null,
      }))
      .filter(sel => sel.opcionId !== null);

    addItem({
      ...producto,
      selecciones: seleccionesValidas,
      precio_total: precioTotal,
    });
  };

  // Determinar si hay promoción
  const tienePromo = data.precio_con_descuento && data.precio_con_descuento !== data.precio;

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Grid container spacing={4}>
        {/* Imagen */}
        <Grid item xs={12} md={6}>
          {data.imagenes && data.imagenes.length > 0 ? (
            data.imagenes.length === 1 ? (
              <img src={`${BASE_URL}/${data.imagenes[0]}`} alt="producto" style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 10 }} />
            ) : (
              <Slider dots infinite speed={500} slidesToShow={1} slidesToScroll={1} arrows>
                {data.imagenes.map((img, idx) => (
                  <div key={idx}>
                    <img src={`${BASE_URL}/${img}`} alt={`img-${idx}`} style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 10 }} />
                  </div>
                ))}
              </Slider>
            )
          ) : (
            <strong>{t('NoImages')}</strong>
          )}
        </Grid>

        {/* Información */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#d83b6a' }}>
            {getProductName(data)}
          </Typography>

          {/* Precios con conversión de moneda */}
          {tienePromo ? (
            <>
              <Typography sx={{ textDecoration: 'line-through', color: 'gray' }}>
                {formatPrice(data.precio)}
              </Typography>
              <Typography variant="h5" sx={{ color: '#d83b6a', fontWeight: 'bold' }}>
                {formatPrice(data.precio_con_descuento)}
              </Typography>
              {(data.descuento_producto || data.descuento_categoria) && (
                <Typography variant="caption" color="primary">
                  {data.nombre_promocion_producto && `${data.nombre_promocion_producto} `}
                  {data.nombre_promocion_categoria && `${data.nombre_promocion_categoria}`}
                </Typography>
              )}
              {data.nombre_promocion && (
                <Typography variant="caption" color="primary">
                  {data.nombre_promocion}
                  {Number(data.descuento) > 0 ? ` (-${data.descuento}%)` : ''}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="h5">
              {formatPrice(data.precio)}
            </Typography>
          )}

          <Typography variant="subtitle1" gutterBottom color="text.secondary">
            {getProductDescription(data)}
          </Typography>

          <Typography variant="body1" gutterBottom>
            <strong>{t('promocion.options.category')}</strong> : {getCategoryName(data)}
          </Typography>

          {/* Etiquetas */}
          {typeof data.etiquetas === 'string' && data.etiquetas.length > 0
            ? data.etiquetas.split(',').map((etiqueta, idx) => (
                <Chip key={idx} label={t(`tags.${etiqueta.trim()}`, { defaultValue: etiqueta.trim() })} variant="outlined" color="primary" sx={{ mr: 1, mb: 1 }} />
              ))
            : null}

          {/* Valoración */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ mr: 1 }}>
              <strong> {t('valoracion')}</strong> :
            </Typography>
            {data.promedio_valoracion > 0 ? (
              <Rating value={parseFloat(data.promedio_valoracion)} precision={0.1} readOnly size="small" />
            ) : (
              <Typography variant="body2" color="text.secondary">
                <strong> {t('NoValoracion')}</strong>
              </Typography>
            )}
          </Box>

          {/* Personalización */}
          {data.criterios && data.criterios.length > 0 && (
            <Box sx={{ mt: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {t('personalizar_producto')}
              </Typography>

              {Object.keys(opcionesSeleccionadas).length === 0 && (
                <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic', mt: 1 }}>
                  Seleccione las opciones para personalizar su producto
                </Typography>
              )}

              {data.criterios.map((criterio) => (
                <Box key={criterio.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 0.5 }}>{criterio.nombre}:</Typography>
                  <select
                    value={opcionesSeleccionadas[criterio.id]?.id || ''}
                    onChange={(e) => handleOpcionChange(criterio.id, e)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '14px',
                      color: opcionesSeleccionadas[criterio.id]?.id ? '#000' : '#666'
                    }}
                    disabled={calculandoPrecio}
                  >
                    <option value="" style={{ color: '#666', fontStyle: 'italic' }}>
                      {t('seleccione_opcion', 'Seleccione una opción...')}
                    </option>
                    {criterio.opciones && Array.isArray(criterio.opciones) && criterio.opciones.map((opcion) => (
                      <option key={opcion.id} value={opcion.id} style={{ color: '#000' }}>
                        {opcion.nombre} (+{formatPrice(opcion.precio_adicional || 0)})
                      </option>
                    ))}
                  </select>
                </Box>
              ))}

              {/* Precio total destacado con conversión */}
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d83b6a' }}>
                {t('precio_total', 'Precio Total')}: {formatPrice(precioTotal)}
              </Typography>
              {calculandoPrecio && (
                <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                  Actualizando precio...
                </Typography>
              )}
            </Box>
          )}

          {/* Botón agregar al carrito */}
          {isShopping && (
            <Button
              variant="contained"
              startIcon={<AddShoppingCartIcon />}
              onClick={() => handleAddToCart(data)}
              disabled={calculandoPrecio}
              sx={{
                backgroundColor: '#d83b6a',
                color: '#fff',
                '&:hover': { backgroundColor: '#b03052' },
                '&:disabled': { backgroundColor: '#ccc' },
                padding: '12px 24px',
                borderRadius: '8px',
                mt: 2,
              }}
            >
              {calculandoPrecio ? 'Calculando...' : t('agregarAlCarrito')}
            </Button>
          )}
        </Grid>

        {/* Botón regresar */}
        <Grid item xs={12}>
          <Button variant="outlined" color="secondary" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            {t('Return')}
          </Button>
        </Grid>

        {/* Reseñas */}
        <Grid item xs={12}>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom sx={{ color: '#d83b6a' }}>{t('FProduct_Reviews')}</Typography>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            {Array.isArray(data.resenas) && data.resenas.length > 0
              ? data.resenas.filter((r) => r && !r.status && r.resenasId).map((resena) => (
                  <Grid key={resena.resenasId} item xs={12} sx={{ mb: 2, borderBottom: '1px solid #d83b6a', pb: 2, backgroundColor: '#f9f9f9', borderRadius: 1, p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{resena.nombre || resena.usuario_nombre}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{formatearFecha(resena.fecha)}</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{resena.comentario}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={parseInt(resena.calificacion)} readOnly size="small" />
                    </Box>
                  </Grid>
                ))
              : <Typography variant="body1" color="text.secondary">{t('FNoreview')}</Typography>}
          </Grid>

          <FormResena
            productoId={parseInt(id)}
            onNuevaResena={(nuevaResena, nuevoPromedio) => {
              if (nuevaResena && !nuevaResena.status && nuevaResena.resenasId) {
                setData((prev) => ({ ...prev, resenas: [nuevaResena, ...(prev.resenas || [])], promedio_valoracion: nuevoPromedio || prev.promedio_valoracion }));
              }
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

DetalleProductos.propTypes = { 
  addItem: PropTypes.func.isRequired, 
  isShopping: PropTypes.bool };