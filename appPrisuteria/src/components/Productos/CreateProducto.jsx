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
import ImageService from '../../services/ImageService';
import CategoriaService from '../../services/CategoriaService';
import EtiquetaService from '../../services/EtiquetasService';
import { SelectCategoria } from './Forms/SelectCategoria';
import { SelectEtiquetas } from './Forms/SelectEtiquetas';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import AddIcon from '@mui/icons-material/Add';

export function CreateProducto({ productoId = null, onSuccess }) {
  const { control, handleSubmit, reset } = useForm();
  const [categorias, setCategorias] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [imagenesNuevas, setImagenesNuevas] = useState([]); // imágenes de inputs básicos
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
  const [imagenesExtra, setImagenesExtra] = useState([]); // bloques dinámicos
  const [productoCreadoId, setProductoCreadoId] = useState(null);
  const [file, setFile] = useState(null); // imagen principal
  const [fileURL, setFileURL] = useState(null);
  const [setError] = useState(null);

  useEffect(() => {
    CategoriaService.getAllCategorias().then(res => setCategorias(res.data));
    EtiquetaService.getAllEtiquetas().then(res => setEtiquetas(res.data));
  }, []);

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

  // Imagen principal
  const handleChangeImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileURL(URL.createObjectURL(selectedFile));
    }
  };

  // Imagenes dinámicas
  const handleAddImage = (e, index) => {
    if (e.target.files && e.target.files[0]) {
      const imgFile = e.target.files[0];
      const url = URL.createObjectURL(imgFile);
      setImagenesExtra(prev => {
        const copia = [...prev];
        copia[index] = { file: imgFile, url };
        return copia;
      });
    }
  };

  const agregarBloqueImagen = () => {
    setImagenesExtra(prev => [...prev, { file: null, url: null }]);
  };

  const eliminarImagenExtra = (index) => {
    setImagenesExtra(prev => prev.filter((_, i) => i !== index));
  };

  const eliminarImagenExistente = (url) => {
    setImagenesExistentes(prev => prev.filter(img => img !== url));
    setImagenesAEliminar(prev => [...prev, url]);
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('descripcion', data.descripcion);
    formData.append('precio', data.precio);
    formData.append('categoria_id', data.categoria_id);

    data.etiquetas.forEach(id => formData.append('etiquetas[]', id));

    // imágenes nuevas (inputs regulares)
    imagenesNuevas.forEach(file => formData.append('imagenes_nuevas[]', file));

    // imágenes dinámicas (NO se suben aquí todavía)
    imagenesExtra.forEach(img => {
      if (img.file) formData.append('imagenes_nuevas[]', img.file);
    });

    // imágenes para eliminar
    imagenesAEliminar.forEach(url => formData.append('imagenes_eliminar[]', url));

    if (productoId) formData.append('producto_id', productoId);

    const submitAction = productoId
      ? ProductoService.updateProducto(formData)
      : ProductoService.createProducto(formData);

    submitAction
      .then((res) => {
        if (res.status === 200) {
          const idProducto = productoId || res.data?.id;

          // Subir imagen principal
          if (idProducto && file) {
            const imgForm = new FormData();
            imgForm.append('file', file);
            imgForm.append('producto_id', idProducto);

            ImageService.createImage(imgForm)
              .then((response) => {
                if (response.error) {
                  setError(response.error);
                } else if (response.data) {
                  toast.success(response.data, { duration: 4000, position: 'top-center' });
                }
              })
              .catch(err => console.error('Error al subir imagen principal:', err));
          }

          // Subir cada imagen extra como independiente
          if (idProducto && imagenesExtra.length > 0) {
            imagenesExtra.forEach(img => {
              if (img.file) {
                const imgForm = new FormData();
                imgForm.append('file', img.file);
                imgForm.append('producto_id', idProducto);

                ImageService.createImage(imgForm)
                  .then((response) => {
                    if (response.error) {
                      setError(response.error);
                    } else if (response.data) {
                      toast.success(response.data, { duration: 4000, position: 'top-center' });
                    }
                  })
                  .catch(err => console.error('Error al subir imagen extra:', err));
              }
            });
          }

          // Resetear si es creación
          if (!productoId && res.data.productosId) {
            setProductoCreadoId(res.data.productosId);
            reset();
            setImagenesNuevas([]);
            setImagenesExtra([]);
            setImagenesAEliminar([]);
            setImagenesExistentes([]);
            setFile(null);
            setFileURL(null);
          }

          toast.success('Producto guardado correctamente', {
            duration: 4000,
            position: 'top-center',
          });

          if (onSuccess) onSuccess();
        }
      })
      .catch(err => {
        console.error('Error al guardar producto:', err);
        setError('Error al guardar el producto.');
      });
  };
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {productoId ? 'Editar Producto' : 'Crear Producto'}
      </Typography>

      {productoCreadoId && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#c287d7ff', borderRadius: 2 }}>
          <Typography variant="h6" color="#d219a4ff">
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
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="nombre"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField label="Nombre" fullWidth required {...field} />
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
              render={({ field }) => <SelectCategoria field={field} data={categorias} />}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="etiquetas"
              control={control}
              defaultValue={[]}
              render={({ field }) => <SelectEtiquetas field={field} data={etiquetas} />}
            />
          </Grid>

          {/* Imagen principal */}
          <Grid item xs={12}>
            <Typography variant="h6">Imagen principal</Typography>
            <input type="file" onChange={handleChangeImage} />
            {fileURL && (
              <Box sx={{ position: 'relative', mt: 1, display: 'inline-block' }}>
                <img src={fileURL} width={300} alt="preview" style={{ borderRadius: 8 }} />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    setFile(null);
                    setFileURL(null);
                  }}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Grid>

          {/* Imágenes existentes */}
          {imagenesExistentes.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6">Imágenes existentes</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                {imagenesExistentes.map((img, i) => (
                  <Box key={i} sx={{ position: 'relative' }}>
                    <img
                      src={img}
                      alt={`img-${i}`}
                      style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6 }}
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
          )}

          {/* Imágenes dinámicas */}
          <Grid item xs={12}>
            <Typography variant="h6">Otras imágenes</Typography>
            {imagenesExtra.map((img, index) => (
              <Box key={index} sx={{ position: 'relative', mb: 2 }}>
                <input type="file" onChange={e => handleAddImage(e, index)} />
                {img.url && (
                  <img src={img.url} width={300} alt={`preview-${index}`} style={{ borderRadius: 8 }} />
                )}
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => eliminarImagenExtra(index)}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <IconButton
              color="primary"
              aria-label="Agregar imagen"
              onClick={agregarBloqueImagen}
              sx={{ mt: 1 }}
            >
              <AddIcon />
            </IconButton>
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