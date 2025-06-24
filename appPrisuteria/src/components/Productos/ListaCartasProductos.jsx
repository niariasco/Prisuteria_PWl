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

ListaCartasProductos.propTypes = {
  data: PropTypes.array,
  isShopping: PropTypes.bool.isRequired,
};

export function ListaCartasProductos({ data, isShopping }) {
  const { addItem } = useCart();
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';

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
              <Card>
                <CardHeader
                  sx={{
                    p: 0,
                    backgroundColor: (theme) => theme.palette.secondary.main,
                    color: (theme) => theme.palette.common.white,
                  }}
                  style={{ textAlign: 'center' }}
                  title={item.nombre}
                  subheader={item.categoria || 'Producto'}
                />
                <CardMedia
                  component="img"
                  height="200"
                  image={`${BASE_URL}/${item.imagen || 'default.jpg'}`}
                  alt={item.nombre}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {item.descripcion}
                  </Typography>

                  {isShopping && (
                    <Typography variant="h6" align="right" gutterBottom>
                      {tienePromo ? (
                        <>
                          <Typography
                            variant="body2"
                            sx={{ textDecoration: 'line-through', color: 'gray', display: 'inline', mr: 1 }}
                          >
                            &cent;{item.precio}
                          </Typography>
                          <Typography variant="h6" color="error" display="inline">
                            &cent;{precioConDescuento.toFixed(2)}
                          </Typography>
                        </>
                      ) : (
                        <>&cent;{item.precio}</>
                      )}
                    </Typography>
                  )}
                </CardContent>

                {tienePromo && (
                  <Chip
                    label={`¡${item.promocion}% de descuento!`}
                    color="secondary"
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                  />
                )}

                <CardActions
                  disableSpacing
                  sx={{
                    backgroundColor: (theme) => theme.palette.action.focus,
                    color: (theme) => theme.palette.common.white,
                  }}
                >
                  <IconButton
                    component={Link}
                    to={`/producto/${item.id}`}
                    aria-label="Detalle"
                    sx={{ ml: 'auto' }}
                  >
                    <Info />
                  </IconButton>
                  {isShopping && (
                    <IconButton
                      aria-label="Agregar al carrito"
                      onClick={() => addItem(item)}
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