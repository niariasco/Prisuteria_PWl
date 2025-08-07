/*import React from 'react';*/
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
/*import Language from '@mui/icons-material/Language';*/
import { Link } from 'react-router-dom';
import { Info } from '@mui/icons-material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import PropTypes from 'prop-types';
import { useCart } from '../../hooks/useCart';
import productTranslations from '../../translations/productTranslations.json';
import { useTranslation } from 'react-i18next';

ListaCartasProductos.propTypes = {
  data: PropTypes.array,
  isShopping: PropTypes.bool.isRequired,
};

export function ListaCartasProductos({ data, isShopping }) {
  const { addItem } = useCart();
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';
    const {  i18n } = useTranslation(); //traduccion 
  
//traduccion 

  // Función para obtener el nombre del producto traducido
  const getProductName = (producto) => {
    // Si hay traducciones disponibles en el producto desde la API
    if (producto.translations && producto.translations[i18n.language]) {
      return producto.translations[i18n.language];
    }
    
    // Usar mapeo manual de traducciones desde el archivo JSON
    const productName = producto.nombre;
    if (productTranslations.products[productName] && productTranslations.products[productName][i18n.language]) {
      return productTranslations.products[productName][i18n.language];
    }
    
    // Si no hay traducción, usar el nombre por defecto
    return producto.nombre;
  };

const getProductDescription = (producto) => {
  if (producto.translations && producto.translations[i18n.language]?.description) {
    return producto.translations[i18n.language].description;
  }
  if (
    productTranslations.products[producto.nombre] &&
    productTranslations.products[producto.nombre].description &&
    productTranslations.products[producto.nombre].description[i18n.language]
  ) {
    return productTranslations.products[producto.nombre].description[i18n.language];
  }
  return producto.descripcion; // default en API
};


  return (
    <Grid container sx={{ p: 2 }} spacing={3}>
      {data &&
        data.map((item) => {
          const tienePromo = item.promocion && item.promocion > 0;
          const precioConDescuento = tienePromo
            ? item.precio - (item.precio * item.promocion) / 100
            : item.precio;

          return (
            <Grid key={item.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 6,
                  },
                }}
              >
  <CardHeader
                  sx={{
                    p: 1.5,
                    background: 'linear-gradient(135deg, #F8BBD0 0%, #D1C4E9 100%)',
                    color: '#fff',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                  titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  subheaderTypographyProps={{ variant: 'subtitle2' }}
                  // Usamos getProductName para el título
                  title={getProductName(item)}
                />
                <CardMedia
                  component="img"
                  height="180"
                  image={`${BASE_URL}/${item.imagen || 'default.jpg'}`}
                  alt={item.nombre}
                  sx={{
                    objectFit: 'cover',
                  }}
                />
                <CardContent sx={{ backgroundColor: '#fff', minHeight: 130 }}>
                  <Typography variant="body2" color="text.secondary">
                    {getProductDescription(item)}
                  </Typography>

                  {isShopping && (
  <Typography variant="h6" align="right" mt={2}>
    {tienePromo ? (
      <>
        <Typography
          variant="body2"
          sx={{
            textDecoration: 'line-through',
            color: '#BA68C8',
            display: 'inline',
            mr: 1,
          }}
        >
          {(item.precio)}
        </Typography>
        <Typography variant="h6" color="error" display="inline">
          {(precioConDescuento)}
        </Typography>
      </>
    ) : (
      <>{(item.precio)}</>
    )}
  </Typography>
                  )}
                </CardContent>

                {tienePromo && (
                  <Chip
                    label={`¡${item.promocion}% de descuento!`}
                    color="secondary"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: '#F06292',
                      color: '#fff',
                      fontWeight: 'bold',
                    }}
                  />
                )}

                <CardActions
                  disableSpacing
                  sx={{
                    background: 'linear-gradient(135deg, #F8BBD0 0%, #E1BEE7 100%)',
                    color: '#fff',
                    justifyContent: 'space-between',
                    px: 1,
                  }}
                >
                  <IconButton
                    component={Link}
                    to={`/producto/${item.id}`}
                    aria-label="Detalle"
                    sx={{
                      color: '#fff',
                      '&:hover': {
                        color: '#fff',
                        backgroundColor: '#BA68C8',
                      },
                    }}
                  >
                    <Info />
                  </IconButton>
                  {isShopping && (
                    <IconButton
                      aria-label="Agregar al carrito"
                      onClick={() => addItem(item)}
                      sx={{
                        color: '#fff',
                        '&:hover': {
                          color: '#fff',
                          backgroundColor: '#F06292',
                        },
                      }}
                    >
                      <AddShoppingCartIcon />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
    </Grid>
  );
}

/*                <CardMedia
                  component="img"
                  height="200"
                  image={`${BASE_URL}/${item.imagen || 'default.jpg'}`}
                  alt={item.nombre}
                />*/