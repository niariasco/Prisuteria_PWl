/*import React from 'react';*/
import  Typography  from "@mui/material";
import IconButton from "@mui/material";
import AccessTime from '@mui/icons-material/AccessTime';
//import Language from '@mui/icons-material/Language';
import { Link } from 'react-router-dom';
import { Info } from '@mui/icons-material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import PropTypes from 'prop-types';
import { useCart } from '../../hooks/useCart';
import Select from "@mui/material";
import Box from "@mui/material";
import Paper from "@mui/material";
import Grid from '@mui/material/Grid2';
import TextField from "@mui/material";
import FormControl from "@mui/material";
import InputLabel from "@mui/material";
import MenuItem from "@mui/material";
import InputAdornment from "@mui/material";
import CircularProgress from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

ListaCartasPromocion.propTypes = {
  data: PropTypes.array,
  isShopping: PropTypes.bool.isRequired,
};

export function CarruselPromociones({ data }) {
  


  const { addItem } =useCart()
    //Url para acceder a la imagenes guardadas en el API
    const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';

    return(
       <Typography 
        component="h2" 
        variant="h4" 
        align="center" 
        color= '#d83b6a' 
        gutterBottom 
      >Promociones Prisutería Accesorios 
        </Typography> 


    );


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
