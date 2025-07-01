/*import React from 'react';*/
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useEffect } from 'react';
import CategoriaService from '../../services/CategoriaService';

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



ListaCartasPromocion.propTypes = {
  data: PropTypes.array,
  isShopping: PropTypes.bool.isRequired,
};

export function ListaCartasPromocion({data, isShopping }) {

  const { addItem } =useCart()
    //Url para acceder a la imagenes guardadas en el API
    const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';

      
    //Filtro Cargeoria

  /*const FiltroCategoria = ({ filtroCategoria, setFiltroCategoria }) => {
  const [categorias, setCategorias] = useState([]);*/

  


    return(
      <>
      {/* Título */}
      <Typography component="h2" variant="h4" align="center" color="#d83b6a" gutterBottom>
        Promociones Prisutería Accesorios
      </Typography>

     
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
