/*import React from 'react';*/
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useEffect } from 'react';
import CategoriaService from '../../services/CategoriaService';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';




// MUI Components
import Typography from '@mui/material/Typography';
/*import Language from '@mui/icons-material/Language';*/
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid2';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

// MUI Icons
import AccessTime from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Info } from '@mui/icons-material';
import { Cart } from '../Rental/Cart';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
//import FilterIcon from '@mui/icons-material/FilterList';

// Flechas personalizadas para react-slick
// Flechas personalizadas para react-slick con íconos MUI
function NextArrow(props) {
  const { style, onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        ...style,
        display: 'block',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
      }}
      aria-label="Siguiente"
    >
      <ArrowForwardIosIcon />
    </IconButton>
  );
}

function PrevArrow(props) {
  const { style, onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        ...style,
        display: 'block',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        position: 'absolute',
        left: 10,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
      }}
      aria-label="Anterior"
    >
      <ArrowBackIosIcon />
    </IconButton>
  );
}



ListaCartasPromocion.propTypes = {
  data: PropTypes.array,
  isShopping: PropTypes.bool.isRequired,
};
// Función para determinar el estado de la promoción
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






export function ListaCartasPromocion({data, isShopping }) {
//Se obtiene el método addItem para agregar Producto al carrito
  const { addItem } =useCart()
    //Url para acceder a la imagenes guardadas en el API
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';
  
  // Estado para las categorías
 /* const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  // Estado para la categoría seleccionada
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  useEffect(() => {
    setLoadingCategorias(true);
    CategoriaService.getCategoria()
      .then((response) => {
        // Asumiendo que la respuesta es un array de categorías
        setCategorias(response.data);
      })
      .catch((error) => {
        console.error('Error al cargar categorías:', error);
      })
      .finally(() => setLoadingCategorias(false));
  }, []);*/
  // Configuración de slider (react-slick)
 const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,          // Autoplay activado
    autoplaySpeed: 3000,     // Cambia slide cada 3 segundos
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1 },
      },
    ],
  };
   /*const promocionesFiltradas = categoriaSeleccionada
    ? data.filter((item) => item.categoriaId === categoriaSeleccionada.id)
    : data;*/



  /*const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [soloPromociones, setSoloPromociones] = useState(false);*/

      
    //Filtro Cargeoria

  /*const FiltroCategoria = ({ filtroCategoria, setFiltroCategoria }) => {
  const [categorias, setCategorias] = useState([]);*/

     return (
    <>
      <Typography component="h2" variant="h4" align="center" color="#d83b6a" gutterBottom>
        Promociones Prisutería Accesorios
      </Typography>
      <Typography component="h2" variant="h4" align="center" color="#d83b6a" gutterBottom>
        Listado Promociones Prisuteria
      </Typography>

      {/* Slider con react-slick */}
      <Slider {...settings}>
        {data &&
          data.map((item) => (
            <Box key={item.id} sx={{ p: 1 }}>
              <Card>
                <CardHeader
                  sx={{
                    p: 0,
                    backgroundColor: getColorPorFechas(item.fecha_inicio, item.fecha_fin),
                    color: '#ffffff',
                    textAlign: 'center',
                  }}
                  title={item.nombre}
                  subheader={` Estado: ${getEstadoTexto(item.fecha_inicio, item.fecha_fin)}`}
                />
                <CardContent>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 1 }}>
                    <LocalOfferIcon fontSize="small" sx={{ color: (theme) => theme.palette.primary.main }} />
                    {item.tipo}
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.5rem', color: 'green', fontWeight: 'bold', mb: 1 }}>
                     -{item.descuento}% descuento
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 1 }}>
                     Aplicado a:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
                  >
                    <CalendarTodayIcon fontSize="small" sx={{ color: (theme) => theme.palette.primary.main }} />
                    {formatearFecha(item.fecha_inicio)} <strong>-</strong> {formatearFecha(item.fecha_fin)}
                  </Typography>
                </CardContent>
                <CardActions
                  disableSpacing
                  sx={{
                    p: 0,
                    backgroundColor: getColorPorFechas(item.fecha_inicio, item.fecha_fin),
                    color: '#ffffff',
                  }}
                >
                  <IconButton
                    component={Link}
                    to={`/movie/${item.id}`}
                    color="blue"
                    aria-label="Ver Detalle"
                    sx={{ ml: 'auto' }}
                  >
                    <Info />
                  </IconButton>
                </CardActions>
              </Card>
            </Box>
          ))}
      </Slider>
      
    </>
  );
}


//}


/*const calculateStatus = (fechaInicio, fechaFin) => {
    const today = new Date();
    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);
    
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (today >= startDate && today <= endDate) {
      return {
        status: 'Vigente',
        color: '#FF4D4D',
        textColor: '#FFFFFF'
      };
    } else if (today > endDate) {
      return {
        status: 'Aplicado',
        color: '#D3D3D3',
        textColor: '#666666'
      };
    } else {
      return {
        status: 'Pendiente',
        color: '#ADD8E6',
        textColor: '#0066CC'
      };
    }
  };*/
  // Cambio automático del banner cada 4 segundos
