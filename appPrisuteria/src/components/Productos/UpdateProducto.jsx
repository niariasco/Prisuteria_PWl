import ProductoService from '../../services/ProductoService';
import { SelectCategoria } from '../Productos/Forms/SelectCategoria';
import { SelectEtiquetas } from '../Productos/Forms/SelectEtiquetas';
import CategoriaService from '../../services/CategoriaService';
import EtiquetasService from '../../services/EtiquetasService';

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Card,
  CardMedia,
  CardActions,
  Grid,
  IconButton,
  Alert as MuiAlert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Fade
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

const Alert = (props) => <MuiAlert elevation={6} variant="filled" {...props} />;

const validationSchema = Yup.object().shape({
  nombre: Yup.string().required("El nombre es obligatorio"),
  descripcion: Yup.string().required("La descripción es obligatoria"),
  precio: Yup.number().typeError("Debe ser un número").positive("Debe ser mayor que 0").required("El precio es obligatorio"),
  categoriaId: Yup.string().required("La categoría es obligatoria"),
  etiquetas: Yup.array().min(1, "Debe seleccionar al menos una etiqueta")
});

// Función utilitaria para procesar etiquetas de forma segura
const procesarEtiquetas = (etiquetas) => {
  console.log("Procesando etiquetas:", etiquetas);
  console.log("Tipo:", typeof etiquetas);
  console.log("Es array:", Array.isArray(etiquetas));
  
  if (!etiquetas) {
    console.log("No hay etiquetas, retornando array vacío");
    return [];
  }
  
  // Si ya es un array, procesarlo normalmente
  if (Array.isArray(etiquetas)) {
    console.log("Etiquetas es array, mapeando...");
    return etiquetas.map((e) => {
      if (typeof e === 'object' && e !== null && e.id) {
        return e.id;
      }
      return e;
    });
  }
  
  // Si es un string, intentar parsearlo como JSON
  if (typeof etiquetas === 'string') {
    try {
      console.log("Etiquetas es string, intentando parsear JSON...");
      const parsed = JSON.parse(etiquetas);
      if (Array.isArray(parsed)) {
        return parsed.map((e) => {
          if (typeof e === 'object' && e !== null && e.id) {
            return e.id;
          }
          return e;
        });
      }
    } catch (error) {
      console.error("Error al parsear JSON de etiquetas:", error);
    }
  }
  
  // Si es un objeto, intentar extraer propiedades
  if (typeof etiquetas === 'object' && etiquetas !== null) {
    console.log("Etiquetas es objeto, verificando propiedades...");
    
    // Si tiene una propiedad 'data' que es array
    if (etiquetas.data && Array.isArray(etiquetas.data)) {
      return etiquetas.data.map((e) => {
        if (typeof e === 'object' && e !== null && e.id) {
          return e.id;
        }
        return e;
      });
    }
    
    // Si tiene una propiedad 'id' (es una sola etiqueta)
    if (etiquetas.id) {
      return [etiquetas.id];
    }
  }
  
  console.warn("No se pudo procesar las etiquetas, retornando array vacío");
  return [];
};

export function UpdateProducto() {
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [productos, setProductos] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
  const [nuevasImagenes, setNuevasImagenes] = useState([]);
  const [previewNuevasImagenes, setPreviewNuevasImagenes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [mensajeExito, setMensajeExito] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProducto, setLoadingProducto] = useState(false);
  const [dialogEliminar, setDialogEliminar] = useState(false);
  const [imagenAEliminar, setImagenAEliminar] = useState(null);
  const [productoData, setProductoData] = useState(null);

  // Usar useRef para mantener referencias a las URLs de preview
  const previewUrlsRef = useRef([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      precio: "",
      categoriaId: "",
      etiquetas: []
    }
  });

  // Función para limpiar previews - ahora usando useCallback correctamente
  const limpiarPreviews = useCallback(() => {
    previewUrlsRef.current.forEach(url => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    });
    previewUrlsRef.current = [];
    setPreviewNuevasImagenes([]);
  }, []); // Sin dependencias que cambien

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        const [productosRes, categoriasRes, etiquetasRes] = await Promise.all([
          ProductoService.getAllProductos(),
          CategoriaService.getAllCategorias(),
          EtiquetasService.getAllEtiquetas()
        ]);
        
        setProductos(productosRes.data || []);
        setCategorias(categoriasRes.data || []);
        setEtiquetas(etiquetasRes.data || []);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        setMensajeError("Error al cargar los datos iniciales");
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // Cargar datos del producto seleccionado
  useEffect(() => {
    if (productoSeleccionado) {
      const cargarProducto = async () => {
        try {
          setLoadingProducto(true);
          setProductoData(null);
          
          const response = await ProductoService.getProductoById(productoSeleccionado);
          const producto = response.data;
          
          console.log("=== DEBUG: Producto cargado ===");
          console.log("Producto completo:", producto);
          console.log("Etiquetas del producto:", producto.etiquetas);
          console.log("Tipo de etiquetas:", typeof producto.etiquetas);
          console.log("Es array:", Array.isArray(producto.etiquetas));
          
          // Limpiar previews anteriores
          limpiarPreviews();
          
          // Establecer datos del producto
          setProductoData(producto);
          setImagenes(producto.imagenes || []);
          setImagenesAEliminar([]);
          setNuevasImagenes([]);
          
          // Procesar etiquetas de forma segura
          const etiquetasIds = procesarEtiquetas(producto.etiquetas);
          console.log("Etiquetas procesadas:", etiquetasIds);
          
          // Resetear formulario con datos del producto
          reset({
            nombre: producto.nombre || "",
            descripcion: producto.descripcion || "",
            precio: producto.precio || "",
            categoriaId: producto.categoria_id || "",
            etiquetas: etiquetasIds
          });
          
        } catch (error) {
          console.error("Error al cargar producto:", error);
          setMensajeError("Error al cargar el producto seleccionado");
          setProductoData(null);
        } finally {
          setLoadingProducto(false);
        }
      };

      cargarProducto();
    } else {
      setProductoData(null);
      limpiarPreviews();
      reset({
        nombre: "",
        descripcion: "",
        precio: "",
        categoriaId: "",
        etiquetas: []
      });
    }
  }, [productoSeleccionado, reset, limpiarPreviews]);

  // Manejar selección de nuevas imágenes
  const handleImagenChange = (e) => {
    try {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      
      // Limpiar previews anteriores
      limpiarPreviews();
      
      setNuevasImagenes(files);
      
      // Crear previews para las nuevas imágenes
      const previews = files.map(file => {
        const url = URL.createObjectURL(file);
        previewUrlsRef.current.push(url); // Guardar referencia
        return {
          file,
          url,
          name: file.name
        };
      });
      
      setPreviewNuevasImagenes(previews);
    } catch (error) {
      console.error("Error al procesar imágenes:", error);
      setMensajeError("Error al procesar las imágenes seleccionadas");
    }
  };

  // Confirmar eliminación de imagen existente
  const confirmarEliminarImagen = (imagen) => {
    setImagenAEliminar(imagen);
    setDialogEliminar(true);
  };

  // Eliminar imagen existente
  const handleDeleteImagen = () => {
    if (imagenAEliminar) {
      setImagenes((prev) => prev.filter((img) => img.id !== imagenAEliminar.id));
      setImagenesAEliminar((prev) => [...prev, imagenAEliminar.id]);
      setDialogEliminar(false);
      setImagenAEliminar(null);
    }
  };

  // Eliminar nueva imagen (antes de guardar)
  const handleDeleteNuevaImagen = (index) => {
    setNuevasImagenes((prev) => prev.filter((_, i) => i !== index));
    setPreviewNuevasImagenes((prev) => {
      // Limpiar URL del objeto para evitar memory leaks
      if (prev[index] && prev[index].url) {
        URL.revokeObjectURL(prev[index].url);
        // Remover de las referencias
        previewUrlsRef.current = previewUrlsRef.current.filter(url => url !== prev[index].url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Restablecer formulario
  const handleReset = () => {
    if (productoData) {
      // Limpiar previews
      limpiarPreviews();
      
      // Restablecer datos
      setImagenes(productoData.imagenes || []);
      setImagenesAEliminar([]);
      setNuevasImagenes([]);
      
      // Procesar etiquetas de forma segura
      const etiquetasIds = procesarEtiquetas(productoData.etiquetas);
      
      reset({
        nombre: productoData.nombre || "",
        descripcion: productoData.descripcion || "",
        precio: productoData.precio || "",
        categoriaId: productoData.categoria_id || "",
        etiquetas: etiquetasIds
      });
    }
  };

  // Enviar formulario
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Agregar campos básicos
      formData.append("nombre", data.nombre);
      formData.append("descripcion", data.descripcion);
      formData.append("precio", data.precio);
      formData.append("categoria_id", data.categoriaId);

      // Agregar etiquetas
      data.etiquetas.forEach((etiqueta) => {
        formData.append("etiquetas[]", etiqueta);
      });

      // Agregar imágenes existentes que se mantienen
      imagenes.forEach((img) => {
        formData.append("imagenes_existentes[]", img.nombre);
      });

      // Agregar IDs de imágenes a eliminar
      imagenesAEliminar.forEach((id) => {
        formData.append("imagenes_eliminar[]", id);
      });

      // Agregar nuevas imágenes
      nuevasImagenes.forEach((file) => {
        formData.append("imagenes[]", file);
      });

      console.log("=== DEBUG: Enviando formulario ===");
      console.log("Datos del formulario:", data);
      console.log("Imágenes existentes:", imagenes);
      console.log("Imágenes a eliminar:", imagenesAEliminar);
      console.log("Nuevas imágenes:", nuevasImagenes);

      await ProductoService.updateProducto(productoSeleccionado, formData);
      setMensajeExito(true);
      
      // Limpiar previews para evitar memory leaks
      limpiarPreviews();
      
      // Recargar el producto para mostrar los cambios
      const response = await ProductoService.getProductoById(productoSeleccionado);
      const producto = response.data;
      setProductoData(producto);
      setImagenes(producto.imagenes || []);
      setImagenesAEliminar([]);
      setNuevasImagenes([]);
      
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      setMensajeError("Error al actualizar el producto. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Limpiar URLs de objeto al desmontar componente
  useEffect(() => {
    return () => {
      // Limpiar todas las URLs al desmontar
      previewUrlsRef.current.forEach(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
      previewUrlsRef.current = [];
    };
  }, []); // Solo se ejecuta al montar y desmontar

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 3, p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EditIcon color="primary" />
        Modificar Producto
      </Typography>

      {/* Selector de producto */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          1. Seleccionar Producto
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="producto-label">Producto</InputLabel>
          <Select
            labelId="producto-label"
            value={productoSeleccionado}
            label="Producto"
            onChange={(e) => setProductoSeleccionado(e.target.value)}
            disabled={loading}
          >
            {productos.map((prod) => (
              <MenuItem key={prod.id} value={prod.id}>
                {prod.nombre} (ID: {prod.id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Card>

      {/* Formulario de edición */}
      {productoSeleccionado && (
        <Fade in={true} timeout={300}>
          <Box>
            {loadingProducto && (
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>Cargando información del producto...</Typography>
              </Card>
            )}
            
            {productoData && !loadingProducto && (
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EditIcon />
                  2. Editar Información del Producto
                </Typography>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={2}>
                    {/* Campos básicos */}
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="nombre"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Nombre del Producto"
                            fullWidth
                            margin="normal"
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Controller
                        name="precio"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Precio"
                            fullWidth
                            margin="normal"
                            type="number"
                            error={!!errors.precio}
                            helperText={errors.precio?.message}
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
                            fullWidth
                            margin="normal"
                            multiline
                            rows={3}
                            error={!!errors.descripcion}
                            helperText={errors.descripcion?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Controller
                        name="categoriaId"
                        control={control}
                        render={({ field }) => (
                          <SelectCategoria
                            data={categorias}
                            field={field}
                            error={!!errors.categoriaId}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Controller
                        name="etiquetas"
                        control={control}
                        render={({ field }) => (
                          <SelectEtiquetas
                            data={etiquetas}
                            field={field}
                            error={!!errors.etiquetas}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>

                  {/* Gestión de imágenes */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      3. Gestión de Imágenes
                    </Typography>

                    {/* Imágenes existentes */}
                    {imagenes.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Imágenes Actuales:
                        </Typography>
                        <Grid container spacing={2}>
                          {imagenes.map((img) => (
                            <Grid item xs={6} sm={4} md={3} key={img.id}>
                              <Card>
                                <CardMedia
                                  component="img"
                                  height="120"
                                  image={`/uploads/${img.nombre}`}
                                  alt={`Imagen ${img.id}`}
                                  sx={{ objectFit: "cover" }}
                                />
                                <CardActions>
                                  <IconButton
                                    color="error"
                                    onClick={() => confirmarEliminarImagen(img)}
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </CardActions>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {/* Nuevas imágenes */}
                    <Box sx={{ mb: 2 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mb: 2 }}
                      >
                        Agregar Nuevas Imágenes
                        <input
                          type="file"
                          hidden
                          multiple
                          accept="image/*"
                          onChange={handleImagenChange}
                        />
                      </Button>
                      
                      {nuevasImagenes.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Nuevas imágenes seleccionadas ({nuevasImagenes.length}):
                          </Typography>
                          <Grid container spacing={2}>
                            {previewNuevasImagenes.map((preview, index) => (
                              <Grid item xs={6} sm={4} md={3} key={index}>
                                <Card>
                                  <CardMedia
                                    component="img"
                                    height="120"
                                    image={preview.url}
                                    alt={`Nueva imagen ${index}`}
                                    sx={{ objectFit: "cover" }}
                                  />
                                  <CardActions>
                                    <IconButton
                                      color="error"
                                      onClick={() => handleDeleteNuevaImagen(index)}
                                      size="small"
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </CardActions>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Botones de acción */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading || !isDirty}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      sx={{ flex: 1 }}
                    >
                      {loading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleReset}
                      disabled={loading || loadingProducto}
                      startIcon={<CancelIcon />}
                    >
                      Restablecer
                    </Button>
                  </Box>
                </form>
              </Card>
            )}
          </Box>
        </Fade>
      )}

      {/* Dialog de confirmación para eliminar imagen */}
      <Dialog open={dialogEliminar} onClose={() => setDialogEliminar(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar esta imagen? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogEliminar(false)}>Cancelar</Button>
          <Button onClick={handleDeleteImagen} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars para mensajes */}
      <Snackbar
        open={mensajeExito}
        autoHideDuration={4000}
        onClose={() => setMensajeExito(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setMensajeExito(false)}>
          ¡Producto actualizado correctamente!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!mensajeError}
        autoHideDuration={4000}
        onClose={() => setMensajeError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setMensajeError("")}>
          {mensajeError}
        </Alert>
      </Snackbar>
    </Box>
  );
}