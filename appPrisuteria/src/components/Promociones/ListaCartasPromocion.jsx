import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCart } from '../../hooks/useCart';
import Slider from 'react-slick';
import CategoriaService from '../../services/CategoriaService';
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
} from '@mui/material';
import {
  LocalOffer as LocalOfferIcon,
  CalendarToday as CalendarTodayIcon,
  AddShoppingCart as AddShoppingCartIcon,
  Info,
  ArrowForwardIos as ArrowForwardIosIcon,
  ArrowBackIos as ArrowBackIosIcon,
  Star as StarIcon,
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
const getColorPorFechas = (fechaInicio, fechaFin) => {
  const hoy = new Date();
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  if (hoy >= inicio && hoy <= fin) return '#FF4D4D'; // Vigente
  if (hoy > fin) return '#D3D3D3'; // Aplicado
  return '#ADD8E6'; // Pendiente
};

const getEstadoTexto = (fechaInicio, fechaFin) => {
  const hoy = new Date();
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  if (hoy >= inicio && hoy <= fin) return 'Vigente';
  if (hoy > fin) return 'Aplicado';
  return 'Pendiente';
};

const formatearFecha = (fechaString) => {
  return new Date(fechaString).toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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

// Componente principal
export function ListaCartasPromocion({ isShopping }) {
  const [productos, setProductos] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const BASE_IMG = import.meta.env.VITE_BASE_URL + 'uploads';

  useEffect(() => {
    ProductoService.obtenerProductosConPromociones()
      .then((data) => {
        const productosConCalculos = data.map(calcularPromocion);
        setProductos(productosConCalculos);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar productos con promociones.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    PromocionService.getTodasLasPromocionesConNombreAplicado()
      .then((responseData) => {
        setPromociones(responseData);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar promociones');
        setLoading(false);
      });
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, mb: 2, px: 3, py: 1.5, backgroundColor: 'rgba(216, 59, 106, 0.1)', borderRadius: '50px', border: '2px solid rgba(216, 59, 106, 0.2)' }}>
          <StarIcon sx={{ color: '#d83b6a', fontSize: 30 }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #d83b6a, #ff6b9d)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Promociones Prisutería Accesorios
          </Typography>
          <StarIcon sx={{ color: '#d83b6a', fontSize: 30 }} />
        </Box>
        <Typography variant="h5" sx={{ color: '#6c757d', fontWeight: 'medium', mb: 3 }}>
          Descubre nuestras mejores ofertas y promociones especiales
        </Typography>
        <Divider sx={{ maxWidth: 200, mx: 'auto', borderWidth: 2, borderColor: '#d83b6a', borderRadius: 2 }} />
      </Box>

      <Typography component="h2" variant="h4" align="center" color="#d83b6a" gutterBottom>
        Listado Promociones Prisuteria
      </Typography>

      <Slider {...settings}>
        {promociones.map((item) => (
          <Box key={item.id} sx={{ p: 1 }}>
            <Card>
              <CardHeader
                sx={{ p: 0, backgroundColor: getColorPorFechas(item.fecha_inicio, item.fecha_fin), color: '#ffffff', textAlign: 'center' }}
                title={item.nombre}
                subheader={` Estado: ${getEstadoTexto(item.fecha_inicio, item.fecha_fin)}`}
              />
              <CardContent>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 1 }}>
                  <LocalOfferIcon fontSize="small" sx={{ color: (theme) => theme.palette.primary.main }} />
                  {item.tipo}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Aplicado en:</strong>{' '}
                  {item.tipo === 'Categoria' && item.nombre_categoria
                    ? `Categoría: ${item.nombre_categoria}`
                    : item.tipo === 'Producto' && item.nombre_producto
                    ? `Producto: ${item.nombre_producto}`
                    : 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.5rem', color: 'green', fontWeight: 'bold', mb: 1 }}>
                  -{item.descuento}%
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <CalendarTodayIcon fontSize="small" sx={{ color: (theme) => theme.palette.primary.main }} />
                  {formatearFecha(item.fecha_inicio)} <strong>-</strong> {formatearFecha(item.fecha_fin)}
                </Typography>
              </CardContent>
              <CardActions disableSpacing sx={{ p: 0, backgroundColor: getColorPorFechas(item.fecha_inicio, item.fecha_fin), color: '#ffffff' }}>
                <IconButton component={Link} to={`/promocion/${item.id}`} color="blue" sx={{ ml: 'auto' }}>
                  <Info />
                </IconButton>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Slider>

      <Typography component="h2" variant="h4" align="center" color="#d83b6a" gutterBottom>
        Productos con promociones
      </Typography>
      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
      ) : error ? (
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      ) : (
        <Slider {...settings}>
          {productos.map((prod) => (
            <Box key={prod.id} sx={{ p: 1 }}>
              <Card>
                {prod.imagen && (
                  <CardMedia component="img" height="160" image={`${BASE_IMG}${prod.imagen}`} alt={prod.nombre} />
                )}
                <CardHeader title={prod.nombre} subheader={``} sx={{ backgroundColor: '#d83b6a', color: '#fff', textAlign: 'center' }} />
                <CardContent>
                  <Typography variant="body2">Categoría: {prod.categoria}</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <s>₡{prod.precio_original}</s>
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'green', fontWeight: 'bold' }}>
                    ₡{prod.precio_con_descuento}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Ahorro: ₡{prod.ahorro} ({prod.porcentaje_descuento}%)
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton onClick={() => addItem(prod)}>
                    <AddShoppingCartIcon />
                  </IconButton>
                  <IconButton component={Link} to={`/producto/${prod.id}`} sx={{ ml: 'auto' }}>
                    <Info />
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
