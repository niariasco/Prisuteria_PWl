import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../hooks/useCart';
import { UserContext } from '../../context/UserContext';
import Slider from 'react-slick';
import ProductoService from '../../services/ProductoService';
import PromocionService from '../../services/PromocionService';

// Estilos y componentes MUI
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
  Box,
  Typography,
  Divider,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  LocalOffer as LocalOfferIcon,
  CalendarToday as CalendarTodayIcon,
  AddShoppingCart as AddShoppingCartIcon,
  Info,
  ArrowForwardIos as ArrowForwardIosIcon,
  ArrowBackIos as ArrowBackIosIcon,
  Star as StarIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon, // Nuevo icono para ver detalle
} from '@mui/icons-material';

// Flechas personalizadas para Slider
function NextArrow(props) {
  const { style, onClick } = props;
  return (
    <IconButton onClick={onClick} sx={{ ...style, position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' } }}>
      <ArrowForwardIosIcon />
    </IconButton>
  );
}

function PrevArrow(props) {
  const { style, onClick } = props;
  return (
    <IconButton onClick={onClick} sx={{ ...style, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' } }}>
      <ArrowBackIosIcon />
    </IconButton>
  );
}

// Utilidades
const getColorPorEstado = (fechaInicio, fechaFin) => {
  const hoy = new Date();
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  hoy.setHours(0, 0, 0, 0);
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(23, 59, 59, 999);

  if (hoy >= inicio && hoy <= fin) return '#FF4D4D'; // Vigente
  if (hoy > fin) return '#D3D3D3'; // Aplicado (expirada)
  return '#ADD8E6'; // Pendiente
};

const getEstadoTexto = (fechaInicio, fechaFin, t) => {
  const hoy = new Date();
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  hoy.setHours(0, 0, 0, 0);
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(23, 59, 59, 999);

  if (hoy >= inicio && hoy <= fin) return t('promotions_page.states.active', 'Vigente');
  if (hoy > fin) return t('promotions_page.states.applied', 'Aplicado');
  return t('promotions_page.states.pending', 'Pendiente');
};

const formatearFecha = (fechaString, locale = 'es-CR') => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  const currentLocale = locale === 'en' ? 'en-US' : 'es-CR';
  return new Date(fechaString).toLocaleDateString(currentLocale, options);
};

const calcularPromocion = (producto) => {
  const precioOriginal = parseFloat(producto.precio_original || producto.precio);
  const descuento = parseFloat(producto.descuento || 0);
  if (isNaN(precioOriginal) || isNaN(descuento)) {
    return { ...producto, precio_con_descuento: precioOriginal, ahorro: 0, porcentaje_descuento: 0 };
  }
  const ahorro = +(precioOriginal * descuento / 100).toFixed(2);
  const precio_con_descuento = +(precioOriginal - ahorro).toFixed(2);
  return { ...producto, precio_con_descuento, ahorro, porcentaje_descuento: descuento };
};

const esPromocionVigente = (fechaInicio, fechaFin) => {
  const hoy = new Date();
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  hoy.setHours(0, 0, 0, 0);
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(23, 59, 59, 999);

  return hoy >= inicio && hoy <= fin;
};

// Componente principal
export function ListaCartasPromocion({ isShopping }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { getUserInfo, isAdmin } = useContext(UserContext);
  const [productos, setProductos] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [promocionesFiltradas, setPromocionesFiltradas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const BASE_IMG = import.meta.env.VITE_BASE_URL + 'uploads';

  const userInfo = getUserInfo();
  const esAdministrador = isAdmin();

  useEffect(() => {    
    ProductoService.obtenerProductosConPromociones()
      .then((data) => {
        const productosConCalculos = data.map(calcularPromocion);
        let productosFiltrados = esAdministrador
          ? productosConCalculos
          : productosConCalculos.filter(producto => {
              if (!producto.fecha_inicio || !producto.fecha_fin) return true;
              return esPromocionVigente(producto.fecha_inicio, producto.fecha_fin);
            });
        setProductos(productosFiltrados);
        setLoading(false);
      })
      .catch(() => {
        setError(t('promotions_page.error_loading_products', 'Error al cargar productos con promociones.'));
        setLoading(false);
      });
  }, [t, esAdministrador]);

  useEffect(() => {
    PromocionService.getTodasLasPromocionesConNombreAplicado()
      .then((responseData) => {
        setPromociones(responseData);
        let promocionesFiltradas = esAdministrador
          ? responseData
          : responseData.filter(promocion => {
              if (!promocion.fecha_inicio || !promocion.fecha_fin) return false;
              return esPromocionVigente(promocion.fecha_inicio, promocion.fecha_fin);
            });
        setPromocionesFiltradas(promocionesFiltradas);
        setLoading(false);
      })
      .catch(() => {
        setError(t('promotions_page.error_loading_promotions', 'Error al cargar promociones'));
        setLoading(false);
      });
  }, [t, esAdministrador]);

  const settings = {
    dots: true,
    infinite: promocionesFiltradas.length > 1,
    speed: 500,
    slidesToShow: Math.min(3, promocionesFiltradas.length),
    slidesToScroll: 1,
    arrows: promocionesFiltradas.length > 1,
    autoplay: promocionesFiltradas.length > 1,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(2, promocionesFiltradas.length) } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  const settingsProducts = {
    dots: true,
    infinite: productos.length > 1,
    speed: 500,
    slidesToShow: Math.min(3, productos.length),
    slidesToScroll: 1,
    arrows: productos.length > 1,
    autoplay: productos.length > 1,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(2, productos.length) } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  const translateCategoryName = (categoryName) => {
    if (!categoryName) return t('promotions_page.not_available', 'N/A');
    return t(`categories.${categoryName}`, categoryName);
  };

  const translateProductName = (productName) => {
    if (!productName) return t('promotions_page.not_available', 'N/A');
    return t(`products.${productName}`, productName);
  };

  return (
    <>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
          <Chip
            icon={esAdministrador ? <AdminIcon /> : <PersonIcon />}
            label={esAdministrador ? 'Modo Administrador' : 'Modo Cliente'}
            color={esAdministrador ? 'error' : 'primary'}
            variant={esAdministrador ? 'filled' : 'outlined'}
            sx={{ fontSize: '1rem', py: 2 }}
          />
          {userInfo.nombre && (
            <Chip label={`${userInfo.nombre} (${userInfo.rolNombre})`} color="secondary" size="small" sx={{ ml: 1 }} />
          )}
        </Box>
        
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, mb: 2, px: 3, py: 1.5, backgroundColor: 'rgba(216, 59, 106, 0.1)', borderRadius: '50px', border: '2px solid rgba(216, 59, 106, 0.2)' }}>
          <StarIcon sx={{ color: '#d83b6a', fontSize: 30 }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #d83b6a, #ff6b9d)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('promotions_page.title', 'Promociones Prisutería Accesorios')}
          </Typography>
          <StarIcon sx={{ color: '#d83b6a', fontSize: 30 }} />
        </Box>
        
        <Typography variant="h5" sx={{ color: '#6c757d', fontWeight: 'medium', mb: 3 }}>
          {esAdministrador 
            ? t('promotions_page.admin_subtitle', `Vista de administrador - Mostrando ${promocionesFiltradas.length} de ${promociones.length} promociones totales`)
            : t('promotions_page.subtitle', 'Descubre nuestras mejores ofertas y promociones especiales')
          }
        </Typography>
        
        <Divider sx={{ maxWidth: 200, mx: 'auto', borderWidth: 2, borderColor: '#d83b6a', borderRadius: 2 }} />
      </Box>

      <Typography component="h2" variant="h4" align="center" color="#d83b6a" gutterBottom>
        {esAdministrador 
          ? t('promotions_page.all_promotions_admin_title', 'Gestión de Promociones - Todas las promociones')
          : t('promotions_page.active_promotions_title', 'Promociones Vigentes')
        }
      </Typography>

      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
      ) : error ? (
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      ) : promocionesFiltradas.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2, mx: 2 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {esAdministrador 
              ? t('promotions_page.no_promotions_admin', `No hay promociones en la base de datos`)
              : t('promotions_page.no_active_promotions', 'No hay promociones vigentes en este momento')
            }
          </Typography>
          
          {esAdministrador && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ color: 'orange', mb: 1 }}>
                📊 Total de promociones en BD: {promociones.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                En modo administrador se muestran todas las promociones sin filtros de fecha
              </Typography>
            </Box>
          )}
          
          {!esAdministrador && promociones.length > 0 && (
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Hay {promociones.length} promociones en total, pero ninguna está vigente actualmente
            </Typography>
          )}
        </Box>
      ) : (
        <Box sx={{ mb: 4 }}>
          <Slider {...settings}>
            {promocionesFiltradas.map((item) => {
              const estadoColor = getColorPorEstado(item.fecha_inicio, item.fecha_fin);
              const estadoTexto = getEstadoTexto(item.fecha_inicio, item.fecha_fin, t);
              
              return (
                <Box key={item.id} sx={{ p: 1 }}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardHeader
                      sx={{ 
                        p: 2, 
                        backgroundColor: estadoColor, 
                        color: '#000', 
                        textAlign: 'center',
                        '& .MuiCardHeader-title': { fontSize: '1.1rem', fontWeight: 'bold' },
                        '& .MuiCardHeader-subheader': { color: '#000' }
                      }}
                      title={item.nombre}
                      subheader={`${t('promotions_page.status')}: ${estadoTexto}`}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" sx={{ color: '#000', fontWeight: 'bold', mb: 1 }}>
                        -{item.descuento}% OFF
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {formatearFecha(item.fecha_inicio, i18n.language)} – {formatearFecha(item.fecha_fin, i18n.language)}
                      </Typography>
                    </CardContent>
                    
                    {/* NUEVO: CardActions con botón para ver detalle */}
                    <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                      <IconButton 
                        component={Link} 
                        to={`/promocion/${item.id}`}
                        sx={{ 
                          backgroundColor: '#2196F3', 
                          color: 'white',
                          '&:hover': { backgroundColor: '#1976D2' }
                        }}
                        title={t('promotions_page.view_detail', 'Ver detalle')}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Box>
              );
            })}
          </Slider>
        </Box>
      )}

      <Typography component="h2" variant="h4" align="center" color="#d83b6a" gutterBottom sx={{ mt: 6 }}>
        {esAdministrador 
          ? t('promotions_page.all_products_admin_title', 'Gestión de Productos - Todos los productos con promociones')
          : t('promotions_page.products_with_promotions', 'Productos con promociones vigentes')
        }
      </Typography>

      {productos.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2, mx: 2 }}>
          <Typography variant="h6" color="text.secondary">
            {esAdministrador 
              ? t('promotions_page.no_products_promotions_admin', 'No hay productos con promociones en la base de datos')
              : t('promotions_page.no_active_products_promotions', 'No hay productos con promociones vigentes')
            }
          </Typography>
        </Box>
      ) : (
        <Slider {...settingsProducts}>
          {productos.map((prod) => (
            <Box key={prod.id} sx={{ p: 1 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {prod.imagen && (
                  <CardMedia 
                    component="img" 
                    height="180" 
                    image={`${BASE_IMG}${prod.imagen}`} 
                    alt={translateProductName(prod.nombre)}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardHeader 
                  title={translateProductName(prod.nombre)} 
                  sx={{ 
                    backgroundColor: '#d83b6a', 
                    color: '#fff', 
                    textAlign: 'center',
                    py: 1,
                    '& .MuiCardHeader-title': { fontSize: '1rem', fontWeight: 'bold' }
                  }} 
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    {t('promotions_page.category', 'Categoría')}: {translateCategoryName(prod.categoria)}
                  </Typography>
                  
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                      ₡{prod.precio_original}
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                      ₡{prod.precio_con_descuento}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#FF5722', fontWeight: 'medium' }}>
                      {t('promotions_page.savings', 'Ahorro')}: ₡{prod.ahorro} ({prod.porcentaje_descuento}%)
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  {!esAdministrador && (
                    <IconButton 
                      onClick={() => addItem(prod)}
                      sx={{ 
                        backgroundColor: '#4CAF50', 
                        color: 'white',
                        '&:hover': { backgroundColor: '#45a049' }
                      }}
                    >
                      <AddShoppingCartIcon />
                    </IconButton>
                  )}
                  <IconButton 
                    component={Link} 
                    to={`/producto/${prod.id}`}
                    sx={{ 
                      backgroundColor: '#d83b6a', 
                      color: 'white',
                      ml: !esAdministrador ? 1 : 0,
                      '&:hover': { backgroundColor: '#c13456' }
                    }}
                  >
                    <Info />
                  </IconButton>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Slider>
      )}

      {/* Historial de promociones aplicadas */}
      <Typography component="h2" variant="h4" align="center" color="#9E9E9E" gutterBottom sx={{ mt: 6 }}>
        {t('promotions_page.history_title', 'Historial de Promociones Aplicadas')}
      </Typography>

      {promociones.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, backgroundColor: 'rgba(211, 211, 211, 0.2)', borderRadius: 2, mx: 2 }}>
          <Typography variant="h6" color="text.secondary">
            {t('promotions_page.no_history', 'No hay promociones finalizadas')}
          </Typography>
        </Box>
      ) : (
        <Slider {...settingsProducts}>
          {promociones
            .filter(promo => {
              const fin = new Date(promo.fecha_fin);
              fin.setHours(23, 59, 59, 999);
              return new Date() > fin;
            })
            .map((item) => (
              <Box key={`history-${item.id}`} sx={{ p: 1 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    sx={{
                      p: 2,
                      backgroundColor: '#D3D3D3',
                      color: '#000',
                      textAlign: 'center',
                      '& .MuiCardHeader-title': { fontSize: '1.1rem', fontWeight: 'bold' },
                      '& .MuiCardHeader-subheader': { color: '#000' }
                    }}
                    title={item.nombre}
                    subheader={`${t('promotions_page.status')}: ${getEstadoTexto(item.fecha_inicio, item.fecha_fin, t)}`}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ color: '#000', fontWeight: 'bold', mb: 1 }}>
                      -{item.descuento}% OFF
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {formatearFecha(item.fecha_inicio, i18n.language)} – {formatearFecha(item.fecha_fin, i18n.language)}
                    </Typography>
                  </CardContent>
                  
                  {/* NUEVO: CardActions también en el historial */}
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <IconButton 
                      component={Link} 
                      to={`/promocion/${item.id}`}
                      sx={{ 
                        backgroundColor: '#2196F3', 
                        color: 'white',
                        '&:hover': { backgroundColor: '#1976D2' }
                      }}
                      title={t('promotions_page.view_detail', 'Ver detalle')}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Box>
            ))}
        </Slider>
      )}
    </>
  );
}

ListaCartasPromocion.propTypes = {
  isShopping: PropTypes.bool.isRequired,
};