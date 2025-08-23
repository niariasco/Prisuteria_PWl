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
import EtiquetasService from '../../services/EtiquetasService';
import { SelectCategoria } from './Forms/SelectCategoria';
import { SelectEtiquetas } from './Forms/SelectEtiquetas';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { Switch, FormControlLabel } from '@mui/material';
import { Modal } from '@mui/material';
import { FormEtiquetas } from './Forms/FormEtiquetas';

export function UpdateProducto() {
  const { control, handleSubmit, reset } = useForm();
  const [categorias, setCategorias] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promedioValoracion, setPromedioValoracion] = useState(null);
  const [totalResenas, setTotalResenas] = useState(0);
  const [productoActualizadoId, setProductoActualizadoId] = useState(null);
  const { t } = useTranslation(); //traduccion 
  const [activo, setActivo] = useState(true);

  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
FormEtiquetas;
//etiquetas
  const [openEtiquetaModal, setOpenEtiquetaModal] = useState(false);
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState(null);
  // Función para abrir modal para crear
  const handleCrearEtiqueta = () => {
    setEtiquetaSeleccionada(null);
    setOpenEtiquetaModal(true);
  };
 // Callback cuando se crea o actualiza la etiqueta
  const recargarEtiquetas = () => {
    EtiquetasService.getAllEtiquetas().then(res => setEtiquetas(res.data));
  };
  // Función para abrir modal para editar
  const handleEditarEtiqueta = (etiqueta) => {
    setEtiquetaSeleccionada(etiqueta);
    setOpenEtiquetaModal(true);
  };


  // IMAGENES ADICIONALES (dinámicas)
  const [imagenesExtra, setImagenesExtra] = useState([]);

  // Imagen principal
  const [file, setFile] = useState(null);
  //const [fileURL, setFileURL] = useState(null);

  // Cargar categorías, etiquetas y lista de productos
  useEffect(() => {
    CategoriaService.getAllCategorias().then(res => setCategorias(res.data));
    EtiquetasService.getAllEtiquetas().then(res => setEtiquetas(res.data));
    ProductoService.getAllProductos().then(res => setProductos(res.data));
  }, []);

  // Cargar producto seleccionado
  useEffect(() => {
    if (!productoSeleccionado) return;
    setLoading(true);
    
    ProductoService.getProductoById(productoSeleccionado)
      .then(res => {
        const p = res.data;
         console.log('Producto cargado:', res.data);
        if (!p) throw new Error('No se encontró el producto');

          setActivo(p.activo === "1"); 

        // Etiquetas seleccionadas, transformar string a ids
        let etiquetasSeleccionadas = [];
        if (p.etiquetas && typeof p.etiquetas === 'string') {
          etiquetasSeleccionadas = p.etiquetas
            .split(',')
            .map(e => e.trim())
            .map(nombre => {
              const etq = etiquetas.find(et => et.nombrEtiquetas === nombre);
              return etq ? etq.etiquetaId : null;
            })
            .filter(Boolean);
        }

        reset({
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          categoria_id: Number(p.categoria_id),
          etiquetas: etiquetasSeleccionadas,
        });

        setImagenesExistentes(p.imagenes || []);
        setPromedioValoracion(p.promedio_valoracion ?? 0);
        setTotalResenas(p.resenas?.length || 0);

        // Si el producto tiene imagen principal (se asume la primera)
        if (p.imagen_principal_url) {
       //   setFileURL(p.imagen_principal_url);
          setFile(null); // No file selected, solo URL
        } else {
      //    setFileURL(null);
          setFile(null);
        }

        setImagenesExtra([]); // limpiar imágenes extra al cambiar producto
        setImagenesAEliminar([]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar producto:', err);
        setError( t('FErrorCargar_ProductoMant'));
        setLoading(false);
      });
  }, [productoSeleccionado, etiquetas, reset]);

  // Manejar cambio imagen principal
 /* const handleChangeImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileURL(URL.createObjectURL(selectedFile));
    }
  };
*/
  // Agregar bloque dinámico para imagen extra
  const agregarBloqueImagen = () => {
    setImagenesExtra(prev => [...prev, { file: null, url: null }]);
  };

  // Manejar selección de imagen extra en bloque dinámico
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

  // Eliminar imagen extra bloque dinámico
  const eliminarImagenExtra = (index) => {
    setImagenesExtra(prev => prev.filter((_, i) => i !== index));
  };

  // Eliminar imagen existente y agregar a la lista de eliminar en backend
  const eliminarImagenExistente = (url) => {
    setImagenesExistentes(prev => prev.filter(img => img !== url));
    setImagenesAEliminar(prev => [...prev, url]);
  };

  // Enviar formulario y actualizar producto
  const onSubmit = (data) => {
    if (!productoSeleccionado) return;
    const formData = new FormData();
    formData.append('productosId', productoSeleccionado);
    formData.append('nombre', data.nombre);
    formData.append('descripcion', data.descripcion);
    formData.append('precio', data.precio);
    formData.append('categoria_id', data.categoria_id);

    data.etiquetas.forEach(id => formData.append('etiquetas[]', id));
    imagenesAEliminar.forEach(url => formData.append('imagenes_eliminar[]', url));
    imagenesExtra.forEach(img => {
      if (img.file && img.url) {
        formData.append('imagenes_nuevas[]', img.file);
      }
    });

    ProductoService.updateProducto(formData)
      .then(res => {
        if (res.status === 200) {
          toast.success( t('FSuccess_ProductoMant'), {
            duration: 4000,
            position: 'top-center',
          });

        setProductoActualizadoId(productoSeleccionado);
            
          // Reset formulario y estados
          reset({
            nombre: '',
            descripcion: '',
            precio: '',
            categoria_id: '',
            etiquetas: [],
          });
          setFile(null);
        //  setFileURL(null);
          setImagenesAEliminar([]);
          setImagenesExistentes([]);
          setProductoSeleccionado('');
          setImagenesExtra([]);

          // Subir imagen principal si existe
          if (file) {
            const imgForm = new FormData();
            imgForm.append('file', file);
            imgForm.append('producto_id', productoSeleccionado);
            ImageService.createImage(imgForm)
              .then(() => console.log('Imagen principal subida'))
              .catch(err => console.error('Error al subir imagen principal:', err));
          }

          // Subir cada imagen extra individualmente
          imagenesExtra.forEach(img => {
            if (img.file) {
              const imgForm = new FormData();
              imgForm.append('file', img.file);
              imgForm.append('producto_id', productoSeleccionado);
              ImageService.createImage(imgForm)
                .then(() => console.log('Imagen extra subida'))
                .catch(err => console.error('Error al subir imagen extra:', err));
            }
          });
        }
      })
      .catch(err => {
        console.error('Error al actualizar producto:', err);
        setError(t('FError_ProductoMant'));
      });
  };

  if (loading) return <p>{t('Cargando')}</p>;
  if (error) return <p>{error}</p>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {t('FEdit_ProductoMant')}
      </Typography>
      {/* MENSAJE DE PRODUCTO ACTUALIZADO */}
      {productoActualizadoId && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#c287d7ff', borderRadius: 2 }}>
          <Typography variant="h6" color="#d219a4ff">
             {t('FSuccess_ProductoMant')}
          </Typography>
          <Typography sx={{ mt: 1 }}>
            <a
              href={`/producto/${productoActualizadoId}`}
              style={{ color: '#d219a4ff', textDecoration: 'underline' }}
            >
               {t('FVer_ProductoMant')}
            </a>
          </Typography>
        </Box>
      )}
      {/* Select inicial para escoger el producto */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">  {t('FSeleccionar_ProductoMant')}</Typography>
        <select
          value={productoSeleccionado}
          onChange={e => setProductoSeleccionado(e.target.value)}
          style={{ padding: '8px', width: '100%', marginTop: '8px' }}
        >
          <option value="">{t('FSeleccionar_ProductoMant')}</option>
          {productos.map(prod => (
            <option key={prod.productosId} value={prod.productosId}>
              {prod.nombre}
            </option>
          ))}
        </select>
      </Box>

      {productoSeleccionado && (
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <Grid container spacing={2}>

<Grid item xs={12}>
  <FormControlLabel
    control={
      <Switch
        checked={activo}
        onChange={async (e) => {
          const nuevoEstado = e.target.checked;
          setActivo(nuevoEstado);

          try {
            await ProductoService.cambiarEstado({
              productosId: productoSeleccionado,
              activo: nuevoEstado ? 1 : 0,
            });
            toast.success(
              t('FSuccess_CambiarEstado'),
              { duration: 3000, position: 'top-center' }
            );
          } catch (error) {
            console.error('Error al cambiar estado del producto:', error);
            toast.error(
              t('FError_CambiarEstado'),
              { duration: 3000, position: 'top-center' }
            );
            // Revertir toggle en caso de error
            setActivo(!nuevoEstado);
          }
        }}
      />
    }
    label={activo ? t('Activo') : t('Inactivo')}
  />
</Grid>

            <Grid item xs={12}>
              <Controller
                name="nombre"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField label={t('FNombre_ProductoMant')} fullWidth required {...field} />
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
                    label={t('FDescripcion_ProductoMant')}
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
                  <TextField label={t('FPrecio_ProductoMant')} fullWidth type="number" required {...field} />
                )}
              />
            </Grid>

            <Grid item xs={12}>
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
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleCrearEtiqueta}>
          Crear Etiqueta
        </Button>
      </Box>

      {/* LISTADO DE ETIQUETAS CON BOTÓN EDITAR */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {etiquetas.map((etq) => (
          <Button
            key={etq.etiquetaId}
            variant="outlined"
            onClick={() => handleEditarEtiqueta(etq)}
          >
            {etq.nombrEtiquetas}
          </Button>
        ))}
      </Box>

      {/* MODAL FORMULARIO DE ETIQUETA */}
      <Modal
        open={openEtiquetaModal}
        onClose={() => setOpenEtiquetaModal(false)}
        aria-labelledby="modal-etiqueta"
        aria-describedby="formulario-crear-editar-etiqueta"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: 400
          }}
        >
          <FormEtiquetas
            etiqueta={etiquetaSeleccionada}
            onClose={() => setOpenEtiquetaModal(false)}
            onSuccess={recargarEtiquetas}
          />
        </Box>
      </Modal>

   
            {/* Imagen principal 
            
            
                       <Grid item xs={12}>
              <Typography variant="h6">Agregar Imagen</Typography>
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
            
            */}


            {/* Imágenes existentes */}
            {imagenesExistentes.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6">{t('FActivesImagenes_ProductoMant')}</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  {imagenesExistentes.map((img, i) => (
                    <Box key={i} sx={{ position: 'relative' }}>
                      <img
                        src={`http://localhost:81/prisuteriapwl/uploads/${img}`}
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
                aria-label={t('FAgregarImagen_ProductoMant')}
                onClick={agregarBloqueImagen}
                sx={{ mt: 1 }}
              >
                <AddIcon />
              </IconButton>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label={t('valoracion')}
                  value={`${promedioValoracion} / 5 (${totalResenas}) ${t('Review')}`}
                InputProps={{ readOnly: true }}
                fullWidth
              />
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
              {t('FActualizar_ProductoMant')}
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
    </Container>
  );
}

UpdateProducto.propTypes = {
  productoId: PropTypes.number,
  onSuccess: PropTypes.func,
};
