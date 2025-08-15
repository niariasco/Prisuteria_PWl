import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import { Link } from 'react-router-dom';
import { Info } from '@mui/icons-material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import PropTypes from 'prop-types';
import { useCart } from '../../hooks/useCart';
import ProductoService from '../../services/ProductoService';

ListaCartasProductos.propTypes = {
  data: PropTypes.array,
  isShopping: PropTypes.bool.isRequired,
};

export function ListaCartasProductos({ data, isShopping }) {
  const { addItem } = useCart();
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';

  const handleAddToCart = (producto) => {
    const productoPreparado = ProductoService.prepararProductoParaCarrito(producto);
    addItem(productoPreparado);
  };

  return (
    <Grid container spacing={3} sx={{ p: 2 }}>
      {data?.map((item) => {
        const tienePromo = item.promocion && item.promocion > 0;
        const precioOriginal = parseFloat(item.precio) || 0;
        const promocion = parseFloat(item.promocion) || 0;
        const precioConDescuento = tienePromo
          ? precioOriginal - (precioOriginal * promocion) / 100
          : precioOriginal;

        return (
          <Grid item xs={6} sm={4} md={3} key={item.id}>
            <Card
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                textAlign: 'center',
                position: 'relative',
                '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
                transition: 'transform 0.2s ease-in-out',
              }}
            >
              <CardMedia
                component="img"
                height="180"
                image={`${BASE_URL}/${item.imagen || 'default.jpg'}`}
                alt={item.nombre}
                sx={{ objectFit: 'cover' }}
              />

              <CardContent sx={{ backgroundColor: '#fff' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {item.nombre}
                </Typography>
                {tienePromo ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    ₡{precioOriginal.toLocaleString()}
                  </Typography>
                ) : null}
                <Typography variant="h6" color={tienePromo ? 'error' : 'text.primary'}>
                  ₡{precioConDescuento.toLocaleString()}
                </Typography>
              </CardContent>

              {tienePromo && (
                <Chip
                  label={`¡${promocion}% OFF!`}
                  color="secondary"
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    backgroundColor: '#F06292',
                    color: '#fff',
                    fontWeight: 'bold',
                  }}
                />
              )}

              <CardActions
                disableSpacing
                sx={{
                  justifyContent: 'space-between',
                  px: 1,
                  background: '#F8BBD0',
                }}
              >
                <IconButton
                  component={Link}
                  to={`/producto/${item.id}`}
                  aria-label="Detalle"
                  sx={{ color: '#fff' }}
                >
                  <Info />
                </IconButton>

                {isShopping && (
                  <IconButton
                    aria-label="Agregar al carrito"
                    onClick={() => handleAddToCart(item)}
                    sx={{ color: '#fff' }}
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
