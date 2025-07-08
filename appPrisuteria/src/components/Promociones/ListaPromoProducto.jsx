import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PromocionService from '../../services/PromocionService';
import { useCart } from '../../hooks/useCart';

// MUI
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
} from '@mui/material';

export default function ProductosPromocion() {
  const { id } = useParams(); // id de la promoción desde la URL
  const { addItem } = useCart();
  const [productos, setProductos] = useState([]);

  const BASE_URL_IMG = import.meta.env.VITE_BASE_URL + 'uploads/';

  useEffect(() => {
    PromocionService.getProductosConPromocion(id).then((data) => {
      setProductos(data);
    });
  }, [id]);

  return (
    <Box sx={{ px: 3, py: 4 }}>
      <Typography variant="h4" align="center" color="#d83b6a" gutterBottom>
        Productos con Promoción
      </Typography>

      <Grid container spacing={3}>
        {productos.map((producto) => (
          <Grid item xs={12} sm={6} md={4} key={producto.productosId}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                image={`${BASE_URL_IMG}${producto.imagen}`}
                alt={producto.nombre}
                height="200"
              />
              <CardContent>
                <Typography variant="h6">{producto.nombre}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {producto.descripcion}
                </Typography>
                <Typography variant="body1" sx={{ textDecoration: 'line-through', color: 'gray' }}>
                  ₡{producto.precio_original}
                </Typography>
                <Typography variant="h6" color="green" fontWeight="bold">
                  ₡{producto.precio_con_descuento}
                </Typography>
                <Typography variant="caption" color="primary">
                  {producto.nombre_promocion} (-{producto.descuento}%)
                </Typography>
              </CardContent>
              <CardActions sx={{ mt: 'auto' }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => addItem(producto)}
                >
                  Agregar al carrito
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
