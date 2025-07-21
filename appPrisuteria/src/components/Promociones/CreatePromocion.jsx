import { useEffect, useState } from 'react';
import {
  Box, Button, Container, Grid,
  TextField, Typography, Select, MenuItem, FormControl, InputLabel, FormHelperText
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import CategoriaService from '../../services/CategoriaService';
import ProductoService from '../../services/ProductoService';
import PromocionService from '../../services/PromocionService';
import PropTypes from 'prop-types';

export function CreatePromocion({ promocionId = null, onSuccess }) {
  const { control, handleSubmit, reset, watch, setError, clearErrors, formState: { errors } } = useForm();
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const tipoSeleccionado = watch('tipo');
  const fechaInicioValue = watch('fecha_inicio');
  const fechaFinValue = watch('fecha_fin');

  useEffect(() => {
    CategoriaService.getAllCategorias().then(res => setCategorias(res.data));
    ProductoService.getAllProductos().then(res => setProductos(res.data));
  }, []);

  useEffect(() => {
    if (promocionId) {
      PromocionService.getById(promocionId).then(res => {
        const p = res.data;
        reset({
          nombre: p.nombre,
          tipo: p.tipo,
          descuento: p.descuento,
          fecha_inicio: p.fecha_inicio ? p.fecha_inicio.substring(0, 16) : '',
          fecha_fin: p.fecha_fin ? p.fecha_fin.substring(0, 16) : '',
          ProductoID: p.ProductoID,
          CategoriaID: p.CategoriaID,
        });
      });
    }
  }, [promocionId, reset]);

  // Validar fechas y descuentos personalizadas antes de enviar
  const validarFechasYDescuento = (data) => {
    let valido = true;
    const ahora = new Date();
    const fechaInicio = data.fecha_inicio ? new Date(data.fecha_inicio) : null;
    const fechaFin = data.fecha_fin ? new Date(data.fecha_fin) : null;

    clearErrors('fecha_inicio');
    clearErrors('fecha_fin');
    clearErrors('descuento');
    clearErrors('ProductoID');
    clearErrors('CategoriaID');

    // Fecha inicio >= hoy
    if (!fechaInicio) {
      setError('fecha_inicio', { type: 'manual', message: 'Obligatorio' });
      valido = false;
    } else if (fechaInicio < ahora) {
      setError('fecha_inicio', { type: 'manual', message: 'La fecha de inicio no puede ser anterior a hoy.' });
      valido = false;
    }

    // Fecha fin >= fecha inicio
    if (!fechaFin) {
      setError('fecha_fin', { type: 'manual', message: 'Obligatorio' });
      valido = false;
    } else if (fechaInicio && fechaFin < fechaInicio) {
      setError('fecha_fin', { type: 'manual', message: 'La fecha de fin no puede ser anterior a la fecha de inicio.' });
      valido = false;
    }

    // Descuento entre 0 y 100
    if (data.descuento === undefined || data.descuento === '' || isNaN(data.descuento)) {
      setError('descuento', { type: 'manual', message: 'Obligatorio' });
      valido = false;
    } else if (data.descuento < 0 || data.descuento > 100) {
      setError('descuento', { type: 'manual', message: 'El descuento debe estar entre 0 y 100.' });
      valido = false;
    }

    // Validar selección de producto o categoría según tipo
    if (data.tipo === 'Producto' && (!data.ProductoID || data.ProductoID === '')) {
      setError('ProductoID', { type: 'manual', message: 'Obligatorio' });
      valido = false;
    }

    if (data.tipo === 'Categoria' && (!data.CategoriaID || data.CategoriaID === '')) {
      setError('CategoriaID', { type: 'manual', message: 'Obligatorio' });
      valido = false;
    }

    return valido;
  };

  const onSubmit = (data) => {
    if (!validarFechasYDescuento(data)) return;

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });

    if (promocionId) formData.append('id', promocionId);

    const action = promocionId
      ? PromocionService.updatePromocion(formData)
      : PromocionService.createPromocion(formData);

    action.then(res => {
      if (res.status === 200 && onSuccess) onSuccess();
    }).catch(err => console.error('Error al guardar promoción:', err));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {promocionId ? 'Editar Promoción' : 'Crear Promoción'}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>

          {/* Nombre */}
          <Grid item xs={12}>
            <Controller
              name="nombre"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => (
                <>
                  <TextField
                    label="Nombre de la promoción"
                    fullWidth
                    error={!!errors.nombre}
                    {...field}
                  />
                  {errors.nombre && (
                    <Typography sx={{ color: 'red', fontSize: '0.75rem', mt: 0.5 }}>
                      Obligatorio
                    </Typography>
                  )}
                </>
              )}
            />
          </Grid>

          {/* Tipo */}
          <Grid item xs={6}>
            <Controller
              name="tipo"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.tipo}>
                  <InputLabel>Tipo de promoción</InputLabel>
                  <Select {...field} label="Tipo de promoción" >
                    <MenuItem value="Producto">Producto</MenuItem>
                    <MenuItem value="Categoria">Categoría</MenuItem>
                  </Select>
                  {errors.tipo && (
                    <FormHelperText sx={{ color: 'red', fontSize: '0.75rem' }}>
                      Obligatorio
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Aplica a - Producto */}
          {tipoSeleccionado === 'Producto' && (
            <Grid item xs={6}>
              <Controller
                name="ProductoID"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.ProductoID}>
                    <InputLabel>Producto</InputLabel>
                    <Select {...field} label="Producto">
                      {productos.map(p => (
                        <MenuItem key={p.productosId} value={p.productosId}>{p.nombre}</MenuItem>
                      ))}
                    </Select>
                    {errors.ProductoID && (
                      <FormHelperText sx={{ color: 'red', fontSize: '0.75rem' }}>
                        Obligatorio
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
          )}

          {/* Aplica a - Categoría */}
          {tipoSeleccionado === 'Categoria' && (
            <Grid item xs={6}>
              <Controller
                name="CategoriaID"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.CategoriaID}>
                    <InputLabel>Categoría</InputLabel>
                    <Select {...field} label="Categoría">
                      {categorias.map(c => (
                        <MenuItem key={c.categoriaId} value={c.categoriaId}>{c.nombre}</MenuItem>
                      ))}
                    </Select>
                    {errors.CategoriaID && (
                      <FormHelperText sx={{ color: 'red', fontSize: '0.75rem' }}>
                        Obligatorio
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
          )}

          {/* Descuento */}
          <Grid item xs={6}>
            <Controller
              name="descuento"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <>
                  <TextField
                    label="Descuento (%)"
                    type="number"
                    fullWidth
                    error={!!errors.descuento}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    {...field}
                  />
                  {errors.descuento && (
                    <Typography sx={{ color: 'red', fontSize: '0.75rem', mt: 0.5 }}>
                      {errors.descuento.message === 'Obligatorio' ? 'Obligatorio' : errors.descuento.message}
                    </Typography>
                  )}
                </>
              )}
            />
          </Grid>

          {/* Fecha Inicio */}
          <Grid item xs={6}>
            <Controller
              name="fecha_inicio"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <>
                  <TextField
                    label="Fecha inicio"
                    type="datetime-local"
                    fullWidth
                    error={!!errors.fecha_inicio}
                    InputLabelProps={{ shrink: true }}
                    {...field}
                  />
                  {errors.fecha_inicio && (
                    <Typography sx={{ color: 'red', fontSize: '0.75rem', mt: 0.5 }}>
                      {errors.fecha_inicio.message === 'Obligatorio' ? 'Obligatorio' : errors.fecha_inicio.message}
                    </Typography>
                  )}
                </>
              )}
            />
          </Grid>

          {/* Fecha Fin */}
          <Grid item xs={6}>
            <Controller
              name="fecha_fin"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <>
                  <TextField
                    label="Fecha fin"
                    type="datetime-local"
                    fullWidth
                    error={!!errors.fecha_fin}
                    InputLabelProps={{ shrink: true }}
                    {...field}
                  />
                  {errors.fecha_fin && (
                    <Typography sx={{ color: 'red', fontSize: '0.75rem', mt: 0.5 }}>
                      {errors.fecha_fin.message === 'Obligatorio' ? 'Obligatorio' : errors.fecha_fin.message}
                    </Typography>
                  )}
                </>
              )}
            />
          </Grid>

          {/* Botón enviar */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: '#d83b6a', ':hover': { backgroundColor: '#b03052' } }}
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
