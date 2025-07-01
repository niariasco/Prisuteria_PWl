import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

// MUI Components
import Typography from '@mui/material/Typography';
/*import Language from '@mui/icons-material/Language';*/
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
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
import FilterIcon from '@mui/icons-material/FilterList';
import CategoriaService from '../../services/CategoriaService';

ListaCartasPromocion.propTypes = {
  data: PropTypes.array,
  isShopping: PropTypes.bool.isRequired,
};

export function CarruselPromociones({ data, isShopping }) {

  


  const { addItem } =useCart()
    //Url para acceder a la imagenes guardadas en el API
    const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';

    //Resultado de consumo del API, respuesta
      const [data, setData] = useState(null);
      //Error del API
      const [error, setError] = useState('');
      //Booleano para establecer sí se ha recibido respuesta
      const [loaded, setLoaded] = useState(false);
      
    //Filtro Cargeoria

  const FiltroCategoria = ({ filtroCategoria, setFiltroCategoria }) => {
  const [categorias, setCategorias] = useState([]);

   useEffect(() => {
      CategoriaService.getCategoria()
        .then((response) => {
          console.log(response);
          setData(response.data);
          setError(response.error);
          setLoaded(true);       
        })
        .catch((error) => {
          console.log(error);
          if (error instanceof SyntaxError) {
            setError(error);
            setLoaded(false);
          }
        });
    }, []);


  const handleChange = (event) => {
    setFiltroCategoria(event.target.value);
  };


    return(
      <>
      {/* Título */}
      <Typography component="h2" variant="h4" align="center" color="#d83b6a" gutterBottom>
        Promociones Prisutería Accesorios
      </Typography>

      {/* Filtro de Categorías */}
        <div className="relative">
      <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
      <FormControl fullWidth sx={{ pl: 4 }}>
        <InputLabel id="categoria-label">Categoría</InputLabel>
        <Select
          labelId="categoria-label"
          id="categoria-select"
          value={filtroCategoria}
          label="Categoría"
          onChange={handleChange}
        >
          <MenuItem value="">Todas las categorías</MenuItem>
          {categorias.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
    </>
  );
}


}


const calculateStatus = (fechaInicio, fechaFin) => {
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
  };
  // Cambio automático del banner cada 4 segundos
