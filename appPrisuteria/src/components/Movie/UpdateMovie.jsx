import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ProductoService from '../../services/ProductoService';
import {
  Grid,
  TextField,
  Button,
  Typography,
} from '@mui/material';

const schema = yup.object().shape({
  nombre: yup.string().required('Nombre requerido'),
  precio: yup.number().positive().required('Precio requerido'),
  stock: yup.number().integer().positive().required('Stock requerido'),
  descripcion: yup.string().required('Descripción requerida'),
  categoria_id: yup.number().required('Categoría requerida'),
});

export default function UpdateProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [nuevasImagenes, setNuevasImagenes] = useState([]);
  const [imagenesEliminadas, setImagenesEliminadas] = useState([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    values: producto,
  });

  useEffect(() => {
    ProductoService.getProductoById(id).then((res) => {
      const data = res.data;
      setProducto(data);
      setImagenes(data.imagenes); // imágenes ya subidas
    });
  }, [id]);

  const handleImagenNueva = (e) => {
    setNuevasImagenes([...nuevasImagenes, ...e.target.files]);
  };

  const eliminarImagen = (idImagen) => {
    setImagenesEliminadas([...imagenesEliminadas, idImagen]);
    setImagenes(imagenes.filter((img) => img.id !== idImagen));
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('producto', JSON.stringify(data));
    nuevasImagenes.forEach((img) => formData.append('nuevasImagenes[]', img));
    formData.append('imagenesEliminadas', JSON.stringify(imagenesEliminadas));

    try {
      await ProductoService.updateProductoFormData(id, formData);
      navigate('/productos');
    } catch (err) {
      console.error(err);
    }
  };

  if (!producto) return <p>Cargando...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5">Actualizar Producto</Typography>
        </Grid>

        <Grid item xs={6}>
          <Controller
            name="nombre"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre"
                fullWidth
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={3}>
          <Controller
            name="precio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Precio"
                type="number"
                fullWidth
                error={!!errors.precio}
                helperText={errors.precio?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={3}>
          <Controller
            name="stock"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Stock"
                type="number"
                fullWidth
                error={!!errors.stock}
                helperText={errors.stock?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="descripcion"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descripción"
                multiline
                rows={4}
                fullWidth
                error={!!errors.descripcion}
                helperText={errors.descripcion?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Imágenes actuales</Typography>
          <Grid container spacing={2}>
            {imagenes.map((img) => (
              <Grid item key={img.id}>
                <img
                  src={`/uploads/${img.ruta}`}
                  alt=""
                  width="100"
                  style={{ borderRadius: '8px' }}
                />
                <Button
                  onClick={() => eliminarImagen(img.id)}
                  variant="outlined"
                  color="error"
                  size="small"
                >
                  Eliminar
                </Button>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Agregar nuevas imágenes</Typography>
          <input type="file" multiple accept="image/*" onChange={handleImagenNueva} />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" color="primary" type="submit">
            Guardar Cambios
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
