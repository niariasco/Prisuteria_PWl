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
import { useTranslation } from 'react-i18next';

export function CreateProducto({ productoId = null, onSuccess }) {
  const { control, handleSubmit, reset } = useForm();
  const [categorias, setCategorias] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [imagenesNuevas, setImagenesNuevas] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
  const [imagenesExtra, setImagenesExtra] = useState([]);
  const [productoCreadoId, setProductoCreadoId] = useState(null);
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriasRes, etiquetasRes] = await Promise.all([
          CategoriaService.getAllCategorias(),
          EtiquetaService.getAllEtiquetas()
        ]);
        
        setCategorias(categoriasRes.data || []);
        setEtiquetas(etiquetasRes.data || []);
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error al cargar categorías y etiquetas');
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (productoId) {
      ProductoService.getProductoById(productoId)
        .then(res => {
          const p = res.data;
          reset({
            nombre: p.nombre || '',
            descripcion: p.descripcion || '',
            precio: p.precio || '',
            categoria_id: p.categoriaId || '', // Asegurar que tenga un valor válido
            etiquetas: p.etiquetas?.map(e => e.etiquetaId) || [],
          });
          setImagenesExistentes(p.imagenes || []);
        })
        .catch(error => {
          console.error('Error cargando producto:', error);
          toast.error('Error al cargar el producto');
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

  const onSubmit = async (data) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('nombre', data.nombre);
      formData.append('descripcion', data.descripcion);
      formData.append('precio', data.precio);
      formData.append('categoria_id', data.categoria_id);

      // Validar que se seleccionó una categoría
      if (!data.categoria_id) {
        toast.error('Por favor selecciona una categoría');
        setLoading(false);
        return;
      }

      // Agregar etiquetas
      if (data.etiquetas && data.etiquetas.length > 0) {
        data.etiquetas.forEach(id => formData.append('etiquetas[]', id));
      }

      // Imágenes nuevas
      imagenesNuevas.forEach(file => formData.append('imagenes_nuevas[]', file));

      // Imágenes dinámicas
      imagenesExtra.forEach(img => {
        if (img.file) formData.append('imagenes_nuevas[]', img.file);
      });

      // Imágenes para eliminar
      imagenesAEliminar.forEach(url => formData.append('imagenes_eliminar[]', url));

      if (productoId) formData.append('producto_id', productoId);

      // Determinar la acción a realizar
      let submitAction;
      if (productoId) {
        submitAction = ProductoService.updateProducto(formData);
      } else {
        submitAction = ProductoService.createProducto(formData);
      }

      // Verificar que submitAction no sea null
      if (!submitAction) {
        throw new Error('Error: El servicio no está disponible');
      }

      const res = await submitAction;

      if (res && (res.status === 200 || res.status === 201)) {
        const idProducto = productoId || res.data?.id || res.data?.productosId;

        // Subir imagen principal
        if (idProducto && file) {
          try {
            const imgForm = new FormData();
            imgForm.append('file', file);
            imgForm.append('producto_id', idProducto);

            const response = await ImageService.createImage(imgForm);
            if (response.error) {
              console.error('Error al subir imagen principal:', response.error);
            } else if (response.data) {
              toast.success('Imagen principal subida correctamente');
            }
          } catch (imgError) {
            console.error('Error al subir imagen principal:', imgError);
          }
        }

        // Subir imágenes extras
        if (idProducto && imagenesExtra.length > 0) {
          for (const img of imagenesExtra) {
            if (img.file) {
              try {
                const imgForm = new FormData();
                imgForm.append('file', img.file);
                imgForm.append('producto_id', idProducto);

                const response = await ImageService.createImage(imgForm);
                if (response.error) {
                  console.error('Error al subir imagen extra:', response.error);
                } else if (response.data) {
                  toast.success('Imagen adicional subida correctamente');
                }
              } catch (imgError) {
                console.error('Error al subir imagen extra:', imgError);
              }
            }
          }
        }

        // Resetear formulario si es creación
        if (!productoId && (res.data?.productosId || res.data?.id)) {
          setProductoCreadoId(res.data?.productosId || res.data?.id);
          reset({
            nombre: '',
            descripcion: '',
            precio: '',
            categoria_id: '',
            etiquetas: []
          });
          setImagenesNuevas([]);
          setImagenesExtra([]);
          setImagenesAEliminar([]);
          setImagenesExistentes([]);
          setFile(null);
          setFileURL(null);
        }

        toast.success(
          productoId ? 'Producto actualizado exitosamente' : t('FSuccess_ProductoMant'),
          { duration: 4000, position: 'top-center' }
        );

        if (onSuccess) onSuccess();
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('Error al guardar producto:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al guardar el producto';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {productoId ? 'Editar Producto' : t('FCreate_ProductoMant')}
      </Typography>

      {error && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#ffebee', borderRadius: 2 }}>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Box>
      )}

      {productoCreadoId && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#c287d7ff', borderRadius: 2 }}>
          <Typography variant="h6" color="#d219a4ff">
            {t('FSuccess_ProductoMant')}
          </Typography>
          <Typography sx={{ mt: 1 }}>
            <a
              href={`/producto/${productoCreadoId}`}
              style={{ color: '#d219a4ff', textDecoration: 'underline' }}
            >
              {t('FVer_ProductoMant')}
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
              rules={{ required: 'El nombre es requerido' }}
              render={({ field, fieldState: { error } }) => (
                <TextField 
                  label={t('FNombre_ProductoMant')}
                  fullWidth 
                  required 
                  error={!!error}
                  helperText={error?.message}
                  {...field} 
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="descripcion"
              control={control}
              defaultValue=""
              rules={{ required: 'La descripción es requerida' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  label={t('FDescripcion_ProductoMant')}
                  fullWidth
                  multiline
                  rows={4}
                  required
                  error={!!error}
                  helperText={error?.message}
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
              rules={{ 
                required: 'El precio es requerido',
                min: { value: 0, message: 'El precio debe ser mayor a 0' }
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField 
                  label={t('FPrecio_ProductoMant')} 
                  fullWidth 
                  type="number" 
                  required
                  error={!!error}
                  helperText={error?.message}
                  inputProps={{ min: 0, step: 0.01 }}
                  {...field} 
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="categoria_id"
              control={control}
              defaultValue=""
              rules={{ required: 'La categoría es requerida' }}
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
            <Typography variant="h6">{t('FAgregarImagen_ProductoMant')}</Typography>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleChangeImage} 
            />
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
              <Typography variant="h6">{t('FActivesImagenes_ProductoMant')}</Typography>
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
            <Typography variant="h6">{t('FOtrasImagenes_ProductoMant')}</Typography>
            {imagenesExtra.map((img, index) => (
              <Box key={index} sx={{ position: 'relative', mb: 2 }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => handleAddImage(e, index)} 
                />
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
              aria-label={t('FAgregarImagen_ProductoMant')}
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
              disabled={loading}
              sx={{
                backgroundColor: '#d83b6a',
                ':hover': { backgroundColor: '#b03052' },
              }}
            >
              {loading ? 'Guardando...' : (productoId ? 'Actualizar Producto' : t('FCreate_ProductoMant'))}
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