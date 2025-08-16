import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useParams, useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import ProductoService from '../../services/ProductoService';
import PropTypes from 'prop-types';
import { IconButton, Box, Rating, Divider, Chip } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Button from '@mui/material/Button';
import { FormResena } from './Forms/FormResena';
import productTranslations from '../../translations/productTranslations.json';
import categoryTranslations from '../../translations/categoryTranslations.json';
import { useTranslation } from 'react-i18next';

export function DetalleProductos({ addItem }) {
  const routeParams = useParams();
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';
  const [data, setData] = useState(null);
  const [error] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [selecciones] = useState({});
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

const [ setOpcionesSeleccionadas] = useState({});


// Precio total dinámico
const [precioTotal, setPrecioTotal] = useState(data ? data.precio : 0);



  const getProductName = (producto) => {
    if (producto.translations && producto.translations[i18n.language]) {
      return producto.translations[i18n.language];
    }
    const productName = producto.nombre;
    if (productTranslations.products[productName] && productTranslations.products[productName][i18n.language]) {
      return productTranslations.products[productName][i18n.language];
    }
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
    return producto.descripcion;
  };

  const getCategoryName = (categoria) => {
    if (categoria.translations && categoria.translations[i18n.language]) {
      return categoria.translations[i18n.language];
    }
    const categoryName = categoria.nombreSCategoria;
    if (categoryTranslations.categories[categoryName] && categoryTranslations.categories[categoryName][i18n.language]) {
      return categoryTranslations.categories[categoryName][i18n.language];
    }
    return categoria.nombreSCategoria;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
      let fechaObj;
      if (fecha instanceof Date) fechaObj = fecha;
      else if (typeof fecha === 'string') {
        if (fecha.includes('T')) fechaObj = new Date(fecha);
        else fechaObj = new Date(fecha.replace(' ', 'T'));
      } else if (typeof fecha === 'number') fechaObj = new Date(fecha);
      else return 'Fecha no disponible';
      if (isNaN(fechaObj.getTime())) return 'Fecha no disponible';
      return fechaObj.toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' });
    }


  useEffect(() => {
    ProductoService.getProductoById(routeParams.id)
      .then((response) => {
        const producto = response.data;
        producto.etiquetas = producto.etiquetas || [];
        producto.resenas = producto.resenas || [];
        producto.promedio_valoracion = producto.promedio_valoracion || 0;
        setData(producto);
        setPrecioTotal(producto.precio); // Inicializa precio base
        setLoaded(true);
      })
      .catch((err) => console.error('Error al cargar producto:', err));
  }, [routeParams.id]);

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Grid container spacing={4}>
        {/* Imagen del producto */}
        <Grid item xs={12} md={6}>
          {data.imagenes && data.imagenes.length > 0 ? (
            data.imagenes.length === 1 ? (
              <img
                src={`${BASE_URL}/${data.imagenes[0]}`}
                alt="producto"
                style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 10 }}
              />
            ) : (
              <Slider dots={true} infinite={true} speed={500} slidesToShow={1} slidesToScroll={1} arrows>
                {data.imagenes.map((img, index) => (
                  <div key={index}>
                    <img
                      src={`${BASE_URL}/${img}`}
                      alt={`img-${index}`}
                      style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 10 }}
                    />
                  </div>
                ))}
              </Slider>
            )
          ) : (
            <strong>{t('NoImages')}</strong>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#d83b6a' }}>
            {getProductName(data)}
          </Typography>

          {data.precio_con_descuento && data.precio_con_descuento !== data.precio ? (
            <>
              <Typography sx={{ textDecoration: 'line-through', color: 'gray' }}>
                {Number(data.precio).toLocaleString()}
              </Typography>
              <Typography variant="h5" sx={{ color: '#d83b6a', fontWeight: 'bold' }}>
                {Math.round(data.precio_con_descuento).toLocaleString()}
              </Typography>
              {(data.descuento_producto || data.descuento_categoria) && (
                <Typography variant="caption" color="primary">
                  {data.nombre_promocion_producto && `${data.nombre_promocion_producto} `}
                  {data.nombre_promocion_categoria && `${data.nombre_promocion_categoria}`}
                </Typography>
              )}
              {data.nombre_promocion && (
                <Typography variant="caption" color="primary">
                  {data.nombre_promocion}
                  {Number(data.descuento) > 0 ? ` (-${data.descuento}%)` : ''}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="h5">{Number(data.precio).toLocaleString()}</Typography>
          )}

          <Typography variant="subtitle1" gutterBottom color="text.secondary">
            {getProductDescription(data)}
          </Typography>

          <Typography variant="body1" gutterBottom>
            <strong>{t('promocion.options.category')}</strong> : {getCategoryName(data)}
          </Typography>

          {typeof data.etiquetas === 'string' && data.etiquetas.length > 0 ? (
            data.etiquetas.split(',').map((etiqueta, index) => (
              <Chip
                key={index}
                label={t(`tags.${etiqueta.trim()}`, { defaultValue: etiqueta.trim() })}
                variant="outlined"
                color="primary"
                sx={{ mr: 1, mb: 1 }}
              />
            ))
          ) : (
            <Typography variant="body2"></Typography>
          )}

          {/* Valoración promedio */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ mr: 1 }}>
              <strong> {t('valoracion')}</strong> :
            </Typography>
            {data.promedio_valoracion > 0 ? (
              <Rating value={parseFloat(data.promedio_valoracion)} precision={0.1} readOnly size="small" />
            ) : (
              <Typography variant="body2" color="text.secondary">
                <strong> {t('NoValoracion')}</strong>
              </Typography>
            )}
          </Box>

{/* CRITERIOS DE PERSONALIZACIÓN */}

{data.criterios && data.criterios.length > 0 && (
  <Box sx={{ mt: 3, mb: 3 }}>
    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{t('personalizar_producto')}</Typography>
    {data.criterios.map((criterio) => (
      <Box key={criterio.id} sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>{criterio.nombre}:</Typography>
        <select
      onChange={(e) => {
  const opcionSeleccionada = criterio.opciones.find(
    (op) => op.id === Number(e.target.value)
  );

  setOpcionesSeleccionadas((prev) => {
    const nuevoEstado = { ...prev, [criterio.id]: opcionSeleccionada };
    
    // Recalcular precio total dinámico
    let total = parseFloat(data.precio) || 0;
    Object.values(nuevoEstado).forEach((op) => {
      if (op && op.precio_adicional) total += parseFloat(op.precio_adicional) || 0;
    });
    setPrecioTotal(total.toFixed(3));

    return nuevoEstado;
  });
}}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">{t('seleccione_opcion')}</option>
          {criterio.opciones.map((opcion) => (
            <option key={opcion.id} value={opcion.id}>
              {opcion.nombre} (+ {Number(opcion.precio_adicional).toFixed(3)})
            </option>
          ))}
        </select>
      </Box>
    ))}

    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d83b6a', mt: 2 }}>
      {t('precio_total')}: ₡ {precioTotal}
    </Typography>
  </Box>
)}



          {/* Botón agregar al carrito */}
          <IconButton
            aria-label="Comprar"
            sx={{
              ml: 'auto',
              backgroundColor: '#d83b6a',
              color: 'white',
              '&:hover': { backgroundColor: '#b03052' },
              padding: '12px',
              borderRadius: '8px',
            }}
            onClick={() => addItem({ ...data, selecciones, precio_total: precioTotal })}
          >
            <AddShoppingCartIcon sx={{ mr: 1 }} />
            <Typography component="span" variant="body1">
              {t('agregarAlCarrito')}
            </Typography>
          </IconButton>

          <Typography variant="body1" gutterBottom sx={{ color: '#d83b6a' }}>
            {'_________________________________________________'}
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: '#d83b6a' }}>
            {t('msjEnvio')}
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: '#d83b6a' }}>
            {t('msjEnvio2')}
          </Typography>
        </Grid>

        {/* Botón regresar */}
        <Grid item xs={12}>
          <Button variant="outlined" color="secondary" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            {t('Return')}
          </Button>
        </Grid>

        {/* Reseñas */}
        <Grid item xs={12}>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom sx={{ color: '#d83b6a' }}>
            {t('FProduct_Reviews')}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            {Array.isArray(data.resenas) && data.resenas.length > 0 ? (
              data.resenas
                .filter((resena) => resena && !resena.status && resena.resenasId)
                .map((resena, index) => (
                  <Grid
                    item
                    xs={12}
                    key={resena.resenasId || index}
                    sx={{ mb: 2, borderBottom: '1px solid #d83b6a', pb: 2, backgroundColor: '#f9f9f9', borderRadius: 1, p: 2 }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {resena.nombre || resena.usuario_nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {formatearFecha(resena.fecha)}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {resena.comentario}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={parseInt(resena.calificacion)} readOnly size="small" />
                    </Box>
                  </Grid>
                ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  {t('FNoreview')}
                </Typography>
              </Grid>
            )}
          </Grid>

          <FormResena
            productoId={parseInt(routeParams.id)}
            onNuevaResena={(nuevaResena, nuevoPromedio) => {
              if (nuevaResena && !nuevaResena.status && nuevaResena.resenasId) {
                setData((prevData) => ({
                  ...prevData,
                  resenas: [nuevaResena, ...(prevData.resenas || [])],
                  promedio_valoracion: nuevoPromedio || prevData.promedio_valoracion,
                }));
              }
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

DetalleProductos.propTypes = {
  addItem: PropTypes.func.isRequired,
};