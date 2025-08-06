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
import { useTranslation } from 'react-i18next';

// Importar las traducciones de categorías y productos
import categoryTranslations from '../../translations/categoryTranslations.json';
import productTranslations from '../../translations/productTranslations.json';

export function CreatePromocion({ promocionId = null, onSuccess }) {
  const { t, i18n } = useTranslation();
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [promocionCreadaId, setPromocionCreadaId] = useState(null);
  const [error, setError] = useState(null);

  // Observar el tipo de promoción y tipo de descuento seleccionado
  const tipoPromocion = watch('tipo_promocion');
  const tipoDescuento = watch('tipo_descuento');

  // Función para obtener el símbolo de moneda según el idioma
  const getCurrencySymbol = () => {
    return i18n.language === 'en' ? '$' : '₡';
  };

  // Función para obtener el nombre de la moneda según el idioma
  const getCurrencyName = () => {
    return i18n.language === 'en' ? 'dollars' : 'colones';
  };

  // Función para obtener el nombre de la categoría traducido
  const getCategoryName = (categoria) => {
    // Si hay traducciones disponibles en la categoría desde la API
    if (categoria.translations && categoria.translations[i18n.language]) {
      return categoria.translations[i18n.language];
    }
    
    // Usar mapeo manual de traducciones desde el archivo JSON
    const categoryName = categoria.nombreSCategoria;
    if (categoryTranslations.categories[categoryName] && categoryTranslations.categories[categoryName][i18n.language]) {
      return categoryTranslations.categories[categoryName][i18n.language];
    }
    
    // Si no hay traducción, usar el nombre por defecto
    return categoria.nombreSCategoria;
  };

  // Función para obtener el nombre del producto traducido
  const getProductName = (producto) => {
    // Si hay traducciones disponibles en el producto desde la API
    if (producto.translations && producto.translations[i18n.language]) {
      return producto.translations[i18n.language];
    }
    
    // Usar mapeo manual de traducciones desde el archivo JSON
    const productName = producto.nombre;
    if (productTranslations.products[productName] && productTranslations.products[productName][i18n.language]) {
      return productTranslations.products[productName][i18n.language];
    }
    
    // Si no hay traducción, usar el nombre por defecto
    return producto.nombre;
  };

  // Función para validar que solo contenga letras, espacios, tildes y eñes
  const validarTextoSoloLetras = (value) => {
    if (!value) return t('promocion.validation.required');
    
    // Expresión regular que permite letras, espacios, tildes, eñes y diéresis
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    
    if (!regex.test(value)) {
      return t('promocion.validation.letters_only');
    }
    
    // Validar que no sea solo espacios
    if (value.trim().length === 0) {
      return t('promocion.validation.not_empty');
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
        toast.error(t('promocion.errors.load_products'), {
          duration: 3000,
          position: 'top-center',
        });
      });
  }, [t]);

  useEffect(() => {
    if (promocionId) {
      PromocionService.getPromocionById(promocionId).then(res => {
        const p = res.data;
        reset({
          nombre: p.nombre,
          tipo_promocion: p.tipo_promocion,
          aplica_a: p.aplica_a,
          tipo_descuento: p.tipo_descuento || 'porcentaje', // Valor por defecto
          descuento_porcentaje: p.descuento_porcentaje,
          descuento_monto: p.descuento_monto,
          fecha_inicio: p.fecha_inicio,
          fecha_fin: p.fecha_fin,
        });
      });
    }
  }, [promocionId, reset]);

  // Función para validar fechas
  const validarFecha = (value, fechaComparacion = null, tipo = 'inicio') => {
    if (!value) return t('promocion.validation.required');
    
    // Para la fecha seleccionada, mantener solo la fecha sin horas
    const fechaSeleccionada = new Date(value + 'T00:00:00');
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);
    
    if (tipo === 'inicio') {
      // Comparar solo fechas, permitiendo fecha actual
      if (fechaSeleccionada.getTime() < fechaActual.getTime()) {
        return t('promocion.validation.start_date');
      }
    }
    
    if (tipo === 'fin' && fechaComparacion) {
      const fechaInicio = new Date(fechaComparacion + 'T00:00:00');
      if (fechaSeleccionada.getTime() <= fechaInicio.getTime()) {
        return t('promocion.validation.end_date');
      }
    }
    
    return true;
  };

  // Función para validar el descuento según el tipo
  const validarDescuento = (value, tipoDescuento) => {
    if (!value) return t('promocion.validation.required');
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue <= 0) {
      return t('promocion.validation.positive_number');
    }
    
    if (tipoDescuento === 'porcentaje') {
      if (numValue < 1 || numValue > 100) {
        return t('promocion.validation.percentage_range');
      }
    } else if (tipoDescuento === 'monto') {
      if (numValue < 0.01) {
        return t('promocion.validation.min_amount');
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
      tipo_descuento: data.tipo_descuento, // Tipo de descuento (porcentaje o monto)
      // Enviar el descuento según el tipo seleccionado
      descuento: data.tipo_descuento === 'porcentaje' 
        ? parseFloat(data.descuento_porcentaje) 
        : parseFloat(data.descuento_monto),
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

          toast.success(t('promocion.success.saved'), {
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
        
        let errorMessage = t('promocion.errors.save');
        
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
        {promocionId ? t('promocion.title.edit') : t('promocion.title.create')}
      </Typography>

      {error && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#ffebee', borderRadius: 2 }}>
          <Typography variant="h6" color="error">
            {t('promocion.error_label')}: {error}
          </Typography>
        </Box>
      )}

      {promocionCreadaId && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#c287d7ff', borderRadius: 2 }}>
          <Typography variant="h6" color="#d219a4ff">
            {t('promocion.success.created')}
          </Typography>
          <Typography sx={{ mt: 1 }}>
            <a
              href={`/promocion/${promocionCreadaId}`}
              style={{ color: '#d219a4ff', textDecoration: 'underline' }}
            >
              {t('promocion.view_promotion')}
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
                required: t('promocion.validation.name_required'),
                validate: validarTextoSoloLetras
              }}
              render={({ field }) => (
                <TextField
                  label={t('promocion.fields.name')}
                  fullWidth
                  required
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message}
                  placeholder={t('promocion.placeholders.name')}
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
              rules={{ required: t('promocion.validation.select_type') }}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.tipo_promocion}>
                  <InputLabel>{t('promocion.fields.type')}</InputLabel>
                  <Select label={t('promocion.fields.type')} {...field}>
                    <MenuItem value="categoria">{t('promocion.options.category')}</MenuItem>
                    <MenuItem value="producto">{t('promocion.options.product')}</MenuItem>
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
              rules={{ required: t('promocion.validation.select_applies_to', `${t('promocion.select')} ${tipoPromocion === 'categoria' ? t('promocion.options.category').toLowerCase() : t('promocion.options.product').toLowerCase()}`) }}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.aplica_a} disabled={!tipoPromocion}>
                  <InputLabel>
                    {tipoPromocion === 'categoria' ? t('promocion.options.category') : 
                     tipoPromocion === 'producto' ? t('promocion.options.product') : 
                     t('promocion.select_type_first')}
                  </InputLabel>
                  <Select
                    label={tipoPromocion === 'categoria' ? t('promocion.options.category') : 
                           tipoPromocion === 'producto' ? t('promocion.options.product') : 
                           t('promocion.select_type_first')}
                    {...field}
                  >
                    {tipoPromocion === 'categoria' &&
                      categorias.map((cat) => (
                        <MenuItem key={cat.categoriaId} value={cat.categoriaId}>
                          {getCategoryName(cat)}
                        </MenuItem>
                      ))}

                    {tipoPromocion === 'producto' &&
                      productos.map((prod) => (
                        <MenuItem key={prod.id} value={prod.id}>
                          {getProductName(prod)}
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

          {/* Tipo de descuento */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="tipo_descuento"
              control={control}
              defaultValue="porcentaje"
              rules={{ required: t('promocion.validation.select_discount_type') }}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.tipo_descuento}>
                  <InputLabel>{t('promocion.fields.discount_type')}</InputLabel>
                  <Select label={t('promocion.fields.discount_type')} {...field}>
                    <MenuItem value="porcentaje">{t('promocion.options.percentage')}</MenuItem>
                    <MenuItem value="monto">{t('promocion.options.fixed_amount', `Fixed Amount (${getCurrencySymbol()})`)}</MenuItem>
                  </Select>
                  {errors.tipo_descuento && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.tipo_descuento.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Campo de descuento dinámico */}
          <Grid item xs={12} sm={6}>
            {tipoDescuento === 'porcentaje' ? (
              <Controller
                name="descuento_porcentaje"
                control={control}
                defaultValue=""
                rules={{
                  required: t('promocion.validation.percentage_required'),
                  validate: (value) => validarDescuento(value, 'porcentaje')
                }}
                render={({ field }) => (
                  <TextField
                    label={t('promocion.fields.discount_percentage')}
                    fullWidth
                    type="number"
                    required
                    inputProps={{ min: 1, max: 100, step: 0.01 }}
                    error={!!errors.descuento_porcentaje}
                    helperText={errors.descuento_porcentaje?.message || t('promocion.helpers.percentage')}
                    placeholder={t('promocion.placeholders.percentage')}
                    {...field}
                  />
                )}
              />
            ) : (
              <Controller
                name="descuento_monto"
                control={control}
                defaultValue=""
                rules={{
                  required: t('promocion.validation.amount_required'),
                  validate: (value) => validarDescuento(value, 'monto')
                }}
                render={({ field }) => (
                  <TextField
                    label={t('promocion.fields.discount_amount', `Discount Amount (${getCurrencySymbol()})`)}
                    fullWidth
                    type="number"
                    required
                    inputProps={{ min: 0.01, step: 0.01 }}
                    error={!!errors.descuento_monto}
                    helperText={errors.descuento_monto?.message || t('promocion.helpers.amount', `Enter amount in ${getCurrencyName()}`)}
                    placeholder={t('promocion.placeholders.amount', i18n.language === 'en' ? 'Example: 50' : 'Ejemplo: 5000')}
                    {...field}
                  />
                )}
              />
            )}
          </Grid>

          {/* Fecha de inicio */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="fecha_inicio"
              control={control}
              defaultValue=""
              rules={{
                required: t('promocion.validation.start_date_required'),
                validate: (value) => validarFecha(value, null, 'inicio')
              }}
              render={({ field }) => (
                <TextField
                  label={t('promocion.fields.start_date')}
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
                required: t('promocion.validation.end_date_required'),
                validate: (value) => validarFecha(value, watch('fecha_inicio'), 'fin')
              }}
              render={({ field }) => (
                <TextField
                  label={t('promocion.fields.end_date')}
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
              {promocionId ? t('promocion.buttons.update') : t('promocion.buttons.create')}
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