import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import PromocionService from '../../services/PromocionService';
import ProductoService from '../../services/ProductoService';
import CategoriaService from '../../services/CategoriaService';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';

export function CreatePromocion({ promocionId = null, onSuccess }) {
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [promocionCreadaId, setPromocionCreadaId] = useState(null);
  const [error, setError] = useState(null);

  // Observar el tipo de promoción seleccionado
  const tipoPromocion = watch('tipo_promocion');

  // Función para validar que solo contenga letras, espacios, tildes y eñes
  const validarTextoSoloLetras = (value) => {
    if (!value) return 'Este campo es requerido';
    
    // Expresión regular que permite letras, espacios, tildes, eñes y diéresis
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    
    if (!regex.test(value)) {
      return 'Solo se permiten letras, espacios, tildes y eñes. No se permiten números ni caracteres especiales.';
    }
    
    // Validar que no sea solo espacios
    if (value.trim().length === 0) {
      return 'El nombre no puede estar vacío o contener solo espacios';
    }
    
    return true;
  };

  useEffect(() => {
    
  CategoriaService.getAllCategorias()
      .then((res) => {
        console.log("Categorías recibidas:", res.data);
        setCategorias(res.data);
      })
      .catch((err) => console.error(err));

    ProductoService.getAllProductos()
      .then(res => {
        console.log('Productos cargados:', res.data); // Debug
        setProductos(res.data || []);
      })
      .catch(err => {
        console.error('Error al cargar productos:', err);
        toast.error('Error al cargar productos', {
          duration: 3000,
          position: 'top-center',
        });
      });
  }, []);

  useEffect(() => {
    if (promocionId) {
      PromocionService.getPromocionById(promocionId).then(res => {
        const p = res.data;
        reset({
          nombre: p.nombre,
          tipo_promocion: p.tipo_promocion,
          aplica_a: p.aplica_a,
          descuento_porcentaje: p.descuento_porcentaje,

          fecha_inicio: p.fecha_inicio,
          fecha_fin: p.fecha_fin,
        });
      });
    }
  }, [promocionId, reset]);

  // Función para validar fechas
  const validarFecha = (value, fechaComparacion = null, tipo = 'inicio') => {
    if (!value) return 'Este campo es requerido';
    
    const fechaSeleccionada = new Date(value);
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);
    
    if (tipo === 'inicio') {
      if (fechaSeleccionada < fechaActual) {
        return 'La fecha de inicio no puede ser anterior a la fecha actual';
      }
    }
    
    if (tipo === 'fin' && fechaComparacion) {
      const fechaInicio = new Date(fechaComparacion);
      if (fechaSeleccionada <= fechaInicio) {
        return 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    
    return true;
  };

  const onSubmit = (data) => {
    console.log('Datos del formulario:', data); // Debug

    // Crear objeto JSON en lugar de FormData para coincidir con el backend
    const promocionData = {
      nombre: data.nombre.trim(), // Eliminar espacios al inicio y final
      tipo: data.tipo_promocion, // Backend espera 'tipo', no 'tipo_promocion'
      descuento: parseFloat(data.descuento_porcentaje), // Backend espera 'descuento' como número
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      activo: true, // Campo requerido por el backend
      // Según el tipo de promoción, establecer ProductoID o CategoriaID
      ProductoID: data.tipo_promocion === 'producto' ? parseInt(data.aplica_a) : null,
      CategoriaID: data.tipo_promocion === 'categoria' ? parseInt(data.aplica_a) : null
    };

    console.log('Datos para enviar al backend:', promocionData); // Debug

    const submitAction = promocionId
      ? PromocionService.updatePromocion(promocionData)
      : PromocionService.createPromocion(promocionData);

    submitAction
      .then((res) => {
        console.log('Respuesta del servidor:', res); // Debug
        
        if (res.status === 200 || res.status === 201) {
          // Resetear si es creación
          if (!promocionId) {
            const idGenerado = res.data?.id || res.data?.promocionId;
            if (idGenerado) {
              setPromocionCreadaId(idGenerado);
            }
            reset();
          }

          toast.success('Promoción guardada correctamente', {
            duration: 4000,
            position: 'top-center',
          });

          if (onSuccess) onSuccess();
        } else {
          throw new Error(`Status inesperado: ${res.status}`);
        }
      })
      .catch(err => {
        console.error('Error completo:', err); // Debug más detallado
        console.error('Error response:', err.response); // Debug respuesta del servidor
        
        let errorMessage = 'Error al guardar la promoción.';
        
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        toast.error(errorMessage, {
          duration: 4000,
          position: 'top-center',
        });
      });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {promocionId ? 'Editar Promoción' : 'Crear Promoción'}
      </Typography>

      {error && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#ffebee', borderRadius: 2 }}>
          <Typography variant="h6" color="error">
            Error: {error}
          </Typography>
        </Box>
      )}

      {promocionCreadaId && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#c287d7ff', borderRadius: 2 }}>
          <Typography variant="h6" color="#d219a4ff">
            ¡Promoción creada exitosamente!
          </Typography>
          <Typography sx={{ mt: 1 }}>
            <a
              href={`/promocion/${promocionCreadaId}`}
              style={{ color: '#d219a4ff', textDecoration: 'underline' }}
            >
              Ver promoción
            </a>
          </Typography>
        </Box>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {/* Nombre de la promoción */}
          <Grid item xs={12}>
            <Controller
              name="nombre"
              control={control}
              defaultValue=""
              rules={{ 
                required: 'El nombre de la promoción es requerido',
                validate: validarTextoSoloLetras
              }}
              render={({ field }) => (
                <TextField
                  label="Nombre de la promoción"
                  fullWidth
                  required
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message}
                  placeholder="Ejemplo: Descuento de Año Nuevo"
                  {...field}
                />
              )}
            />
          </Grid>

          {/* Tipo de promoción */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="tipo_promocion"
              control={control}
              defaultValue=""
              rules={{ required: 'Seleccione el tipo de promoción' }}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.tipo_promocion}>
                  <InputLabel>Tipo de promoción</InputLabel>
                  <Select label="Tipo de promoción" {...field}>
                    <MenuItem value="categoria">Categoría</MenuItem>
                    <MenuItem value="producto">Producto</MenuItem>
                  </Select>
                  {errors.tipo_promocion && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.tipo_promocion.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Aplica a (Categoría o Producto) */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="aplica_a"
              control={control}
              defaultValue=""
              rules={{ required: `Seleccione ${tipoPromocion === 'categoria' ? 'una categoría' : 'un producto'}` }}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.aplica_a} disabled={!tipoPromocion}>
                  <InputLabel>
                    {tipoPromocion === 'categoria' ? 'Categoría' : tipoPromocion === 'producto' ? 'Producto' : 'Seleccione tipo primero'}
                  </InputLabel>
                  <Select
                    label={tipoPromocion === 'categoria' ? 'Categoría' : tipoPromocion === 'producto' ? 'Producto' : 'Seleccione tipo primero'}
                    {...field}
                  >
                    {tipoPromocion === 'categoria' &&
  categorias.map((cat) => (
    <MenuItem key={cat.categoriaId} value={cat.categoriaId}>
      {cat.nombreSCategoria}
    </MenuItem>
  ))}

                    {tipoPromocion === 'producto' &&
                      productos.map((prod) => (
                        <MenuItem key={prod.id} value={prod.id}>
                          {prod.nombre}
                        </MenuItem>
                      ))}
                  </Select>
                  {errors.aplica_a && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.aplica_a.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Descuento por porcentaje */}
          <Grid item xs={12}>
            <Controller
              name="descuento_porcentaje"
              control={control}
              defaultValue=""
              rules={{
                required: 'El descuento por porcentaje es requerido',
                validate: (value) => {
                  if (value && (value < 1 || value > 100)) {
                    return 'El porcentaje debe estar entre 1 y 100';
                  }
                  return true;
                }
              }}
              render={({ field }) => (
                <TextField
                  label="Descuento (%)"
                  fullWidth
                  type="number"
                  required
                  inputProps={{ min: 1, max: 100, step: 0.01 }}
                  error={!!errors.descuento_porcentaje}
                  helperText={errors.descuento_porcentaje?.message}
                  {...field}
                />
              )}
            />
          </Grid>

          {/* Fecha de inicio */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="fecha_inicio"
              control={control}
              defaultValue=""
              rules={{
                required: 'La fecha de inicio es requerida',
                validate: (value) => validarFecha(value, null, 'inicio')
              }}
              render={({ field }) => (
                <TextField
                  label="Fecha de inicio"
                  fullWidth
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.fecha_inicio}
                  helperText={errors.fecha_inicio?.message}
                  {...field}
                />
              )}
            />
          </Grid>

          {/* Fecha de fin */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="fecha_fin"
              control={control}
              defaultValue=""
              rules={{
                required: 'La fecha de fin es requerida',
                validate: (value) => validarFecha(value, watch('fecha_inicio'), 'fin')
              }}
              render={({ field }) => (
                <TextField
                  label="Fecha de fin"
                  fullWidth
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.fecha_fin}
                  helperText={errors.fecha_fin?.message}
                  {...field}
                />
              )}
            />
          </Grid>

          {/* Botón de envío */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: '#d83b6a',
                ':hover': { backgroundColor: '#b03052' },
                mt: 2
              }}
            >
              {promocionId ? 'Actualizar Promoción' : 'Crear Promoción'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

CreatePromocion.propTypes = {
  promocionId: PropTypes.number,
  onSuccess: PropTypes.func,
};