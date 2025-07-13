import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import ProductoService from '../../services/ProductoService';
import CategoriaService from '../../services/CategoriaService';
import EtiquetaService from '../../services/EtiquetasService';
import { SelectCategoria } from './Forms/SelectCategoria';
import { SelectEtiquetas } from './Forms/SelectEtiquetas';
import PropTypes from 'prop-types';

export function CreateProducto({ productoId = null, onSuccess }) {
  const { control, handleSubmit, reset } = useForm();
  const [categorias, setCategorias] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [imagenesNuevas, setImagenesNuevas] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
  const [productoCreadoId, setProductoCreadoId] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads/';

  // Obtener categorías y etiquetas
  useEffect(() => {
    CategoriaService.getAllCategorias().then(res => setCategorias(res.data));
    EtiquetaService.getAllEtiquetas().then(res => setEtiquetas(res.data));
  }, []);

  // Si es edición, carga datos del producto
  useEffect(() => {
    if (productoId) {
      ProductoService.getProductoById(productoId).then(res => {
        const p = res.data;
        reset({
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          categoria_id: p.categoriaId,
          etiquetas: p.etiquetas.map(e => e.etiquetaId),
        });
        setImagenesExistentes(p.imagenes || []);
      });
    }
  }, [productoId, reset]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenesNuevas(prev => [...prev, ...files]);
  };

  const eliminarImagenExistente = (url) => {
    setImagenesExistentes(prev => prev.filter(img => img !== url));
    setImagenesAEliminar(prev => [...prev, url]);
  };

  const eliminarImagenNueva = (index) => {
    setImagenesNuevas(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('descripcion', data.descripcion);
    formData.append('precio', data.precio);
    formData.append('categoria_id', data.categoria_id);

    data.etiquetas.forEach(id => formData.append('etiquetas[]', id));
    imagenesNuevas.forEach(file => formData.append('imagenes_nuevas[]', file));
    imagenesAEliminar.forEach(url => formData.append('imagenes_eliminar[]', url));

    if (productoId) formData.append('producto_id', productoId);

    const submitAction = productoId
      ? ProductoService.updateProducto(formData)
      : ProductoService.createProducto(formData);

submitAction.then(res => {
  console.log('Respuesta:', res);
  if (res.status === 200) {
    if (!productoId && res.data.productosId) {
      setProductoCreadoId(res.data.productosId);
      reset();
      setImagenesNuevas([]);
      setImagenesAEliminar([]);
      setImagenesExistentes([]);
    }
    if (onSuccess) onSuccess();
  }
}).catch(err => {
  console.error('Error al crear producto:', err);
});
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {productoId ? 'Editar Producto' : 'Crear Producto'}
      </Typography>

      {productoCreadoId && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#c287d7ff', borderRadius: 2 }}>
          <Typography variant="h6" color="success.main">
            ¡Producto creado exitosamente!
          </Typography>
          <Typography sx={{ mt: 1 }}>
            <a
              href={`/producto/${productoCreadoId}`}
              style={{ color: '#d219a4ff', textDecoration: 'underline' }}
            >
              Ver producto
            </a>
          </Typography>
        </Box>
      )}

      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="nombre"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField label="Nombre del producto" fullWidth required {...field} />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="descripcion"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  label="Descripción"
                  fullWidth
                  multiline
                  rows={4}
                  required
                  {...field}
                />
              )}
            />
          </Grid>

          <Grid item xs={6}>
            <Controller
              name="precio"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField label="Precio" fullWidth type="number" required {...field} />
              )}
            />
          </Grid>

          <Grid item xs={6}>
            <Controller
              name="categoria_id"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <SelectCategoria field={field} data={categorias} />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="etiquetas"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <SelectEtiquetas field={field} data={etiquetas} />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Imágenes existentes</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {imagenesExistentes.map((img, i) => (
                <Box key={i} sx={{ position: 'relative' }}>
                  <img
                    src={BASE_URL + img}
                    alt={`img-${i}`}
                    style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 6 }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => eliminarImagenExistente(img)}
                    sx={{ position: 'absolute', top: 0, right: 0 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1">Agregar nuevas imágenes</Typography>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              {imagenesNuevas.map((img, i) => (
                <Box key={i} sx={{ position: 'relative' }}>
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`preview-${i}`}
                    style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 6 }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => eliminarImagenNueva(i)}
                    sx={{ position: 'absolute', top: 0, right: 0 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#d83b6a',
                ':hover': { backgroundColor: '#b03052' },
              }}
            >
              {productoId ? 'Actualizar Producto' : 'Crear Producto'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

CreateProducto.propTypes = {
  productoId: PropTypes.number,
  onSuccess: PropTypes.func,
};
