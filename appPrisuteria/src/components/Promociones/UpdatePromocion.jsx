import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Button, Grid, TextField,
  Snackbar, Alert as MuiAlert
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import PromocionService from "../../services/PromocionService";
import ProductoService from "../../services/ProductoService";
import CategoriaService from "../../services/CategoriaService";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

// Alert con forwardRef para Snackbar
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const validationSchema = Yup.object().shape({
  nombre: Yup.string()
    .required("El nombre es obligatorio")
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, "El nombre no debe contener números ni caracteres especiales"),
  tipo: Yup.string().oneOf(["Producto", "Categoria"]).required("El tipo es obligatorio"),
  tipoDescuento: Yup.string()
    .oneOf(["Porcentaje", "Monto"])
    .required("El tipo de descuento es obligatorio"),
  porcentajeDescuento: Yup.number()
    .nullable()
    .when('tipoDescuento', {
      is: 'Porcentaje',
      then: (schema) => schema
        .required("El porcentaje de descuento es obligatorio")
        .min(1, "El descuento debe ser mínimo 1%")
        .max(100, "El descuento debe ser máximo 100%"),
      otherwise: (schema) => schema.nullable().notRequired()
    }),
  montoDescuento: Yup.number()
    .nullable()
    .when('tipoDescuento', {
      is: 'Monto',
      then: (schema) => schema
        .required("El monto de descuento es obligatorio")
        .min(0.01, "El monto debe ser mayor a 0")
        .max(999999, "El monto no puede exceder ₡999,999"),
      otherwise: (schema) => schema.nullable().notRequired()
    }),
  fecha_inicio: Yup.string().required("La fecha de inicio es obligatoria"),
  fecha_fin: Yup.string().required("La fecha de fin es obligatoria"),
  ProductoID: Yup.string().when('tipo', {
    is: 'Producto',
    then: (schema) => schema.required('Debe seleccionar un producto'),
    otherwise: (schema) => schema.nullable().notRequired()
  }),
  CategoriaID: Yup.string().when('tipo', {
    is: 'Categoria', 
    then: (schema) => schema.required('Debe seleccionar una categoría'),
    otherwise: (schema) => schema.nullable().notRequired()
  })
});

export function UpdatePromocion() {
  const [promociones, setPromociones] = useState([]);
  const [promoSeleccionada, setPromoSeleccionada] = useState("");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mensajeExito, setMensajeExito] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [promocionEditable, setPromocionEditable] = useState(true);
  const [promocionModificadaId, setPromocionModificadaId] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      nombre: "",
      tipo: "",
      ProductoID: "",
      CategoriaID: "",
      tipoDescuento: "Porcentaje", // Valor por defecto
      porcentajeDescuento: null,
      montoDescuento: null,
      fecha_inicio: "",
      fecha_fin: "",
      activo: true
    },
  });

  const tipo = watch("tipo");
  const tipoDescuento = watch("tipoDescuento");
  const porcentajeDescuento = watch("porcentajeDescuento");
  const montoDescuento = watch("montoDescuento");

  // Función para determinar si una promoción es editable basada en su estado
  const esPromocionEditable = (promocion) => {
    const estadosEditables = ['Vigente', 'Pendiente'];
    return estadosEditables.includes(promocion.Estado);
  };

  // Función para obtener el texto del estado con color
  const obtenerEstadoTexto = (estado) => {
    const estadosConfig = {
      'Pendiente': { texto: 'Pendiente', color: '#ADD8E6' },
      'Vigente': { texto: 'Vigente', color: '#FF4D4D ' },
      'Aplicado': { texto: 'Aplicado', color: '#D3D3D3 ' }
    };
    
    return estadosConfig[estado] || { texto: estado, color: '#757575' };
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [promosRes, productosRes, categoriasRes] = await Promise.all([
          PromocionService.getallPromociones(),
          ProductoService.getAllProductos(),
          CategoriaService.getAllCategorias(),
        ]);

        setPromociones(promosRes.data || []);
        setProductos(productosRes.data || []);
        setCategorias(categoriasRes.data || []);
      } catch (err) {
        setMensajeError("Error al cargar los datos iniciales");
      }
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    setPromocionModificadaId(null); // Limpiar mensaje de éxito al cambiar promoción
    
    if (promoSeleccionada) {
      const cargarDatosPromocion = async () => {
        setLoadingPromo(true);
        setMostrarFormulario(false);

        try {
          const res = await PromocionService.getPromocionById(promoSeleccionada);
          const promo = res.data;

          // Verificar si la promoción es editable basada en el estado
          const esEditable = esPromocionEditable(promo);
          
          setPromocionEditable(esEditable);

          // Formatear fechas para datetime-local
          const formatearFecha = (fecha) => {
            if (!fecha) return "";
            const fechaObj = new Date(fecha);
            return fechaObj.toISOString().slice(0, 16);
          };

          // Determinar el tipo de descuento basado en los datos existentes
          // El backend devuelve tipo_descuento, no tipoDescuento
          let tipoDescuentoDetectado = "Porcentaje"; // valor por defecto
          
          if (promo.tipo_descuento) {
            // Si existe el campo tipo_descuento en la BD, usarlo directamente
            tipoDescuentoDetectado = promo.tipo_descuento;
          } else {
            // Fallback: detectar por valor (si es <= 100 probablemente es porcentaje)
            tipoDescuentoDetectado = (promo.descuento && promo.descuento <= 100) ? "Porcentaje" : "Monto";
          }

          // Resetear formulario con datos de la promoción
          const datosFormulario = {
            id: promo.id,
            nombre: promo.nombre || "",
            tipo: promo.tipo || "",
            ProductoID: promo.ProductoID ? String(promo.ProductoID) : "",
            CategoriaID: promo.CategoriaID ? String(promo.CategoriaID) : "",
            tipoDescuento: tipoDescuentoDetectado,
            porcentajeDescuento: "",
            montoDescuento: "",
            fecha_inicio: formatearFecha(promo.fecha_inicio),
            fecha_fin: formatearFecha(promo.fecha_fin),
            activo: promo.activo !== undefined ? promo.activo : true
          };

          // Asignar el valor al campo correspondiente
          if (tipoDescuentoDetectado === "Porcentaje") {
            datosFormulario.porcentajeDescuento = String(promo.descuento || "");
            datosFormulario.montoDescuento = null; // Usar null en lugar de string vacío
          } else if (tipoDescuentoDetectado === "Monto") {
            datosFormulario.montoDescuento = String(promo.descuento || "");
            datosFormulario.porcentajeDescuento = null; // Usar null en lugar de string vacío
          }
          
          reset(datosFormulario);

          // Forzar la actualización de los campos después del reset
          setTimeout(() => {
            if (tipoDescuentoDetectado === "Porcentaje" && promo.descuento) {
              setValue("porcentajeDescuento", String(promo.descuento));
            } else if (tipoDescuentoDetectado === "Monto" && promo.descuento) {
              setValue("montoDescuento", String(promo.descuento));
            }
          }, 100);

          // Limpiar campos según el tipo
          if (promo.tipo === "Producto") {
            setValue("CategoriaID", "");
          } else if (promo.tipo === "Categoria") {
            setValue("ProductoID", "");
          }

          setMostrarFormulario(true);
          
          if (!esEditable) {
            const estadoConfig = obtenerEstadoTexto(promo.Estado);
            setMensajeError(`Esta promoción no se puede modificar porque tiene estado "${estadoConfig.texto}". Solo se pueden modificar promociones con estado "Pendiente" o "Vigente".`);
          }
        } catch (err) {
          setMensajeError("No se pudo cargar la promoción seleccionada");
        } finally {
          setLoadingPromo(false);
        }
      };

      cargarDatosPromocion();
    } else {
      reset();
      setMostrarFormulario(false);
      setPromocionEditable(true);
    }
  }, [promoSeleccionada, reset, setValue]);

  // Limpiar campos cuando cambia el tipo
  useEffect(() => {
    if (tipo === "Producto") {
      setValue("CategoriaID", "");
    } else if (tipo === "Categoria") {
      setValue("ProductoID", "");
    }
  }, [tipo, setValue]);

  // Limpiar campos de descuento cuando cambia el tipo de descuento (solo si es cambio manual del usuario)
  useEffect(() => {
    // Solo limpiar si hay una promoción seleccionada, no estamos cargando datos,
    // el formulario está visible Y es un cambio manual (no la carga inicial)
    if (promoSeleccionada && !loadingPromo && mostrarFormulario) {
      const promocionActual = promociones.find(p => p.id == promoSeleccionada);
      
      // Si la promoción existe y el tipo de descuento cambió del original, limpiar campos
      if (promocionActual && promocionActual.tipo_descuento !== tipoDescuento) {
        setValue("porcentajeDescuento", null);
        setValue("montoDescuento", null);
      }
    }
  }, [tipoDescuento, setValue, promoSeleccionada, loadingPromo, mostrarFormulario, promociones]);

  const onSubmit = async (data) => {
    if (!promocionEditable) {
      setMensajeError("No se puede modificar una promoción con estado 'Aplicado'. Solo se pueden modificar promociones con estado 'Pendiente' o 'Vigente'.");
      return;
    }

    try {
      if (!promoSeleccionada) {
        setMensajeError("No se ha seleccionado ninguna promoción");
        return;
      }

      // Función para convertir datetime-local a formato MySQL
      const formatearFechaParaMySQL = (fechaDatetimeLocal) => {
        if (!fechaDatetimeLocal) return null;
        // Convertir "2024-01-15T14:30" a "2024-01-15 14:30:00"
        return fechaDatetimeLocal.replace('T', ' ') + ':00';
      };

      // Preparar datos para envío
      const datosParaEnvio = {
        id: parseInt(promoSeleccionada),
        nombre: data.nombre.trim(),
        tipo: data.tipo, // Se mantiene como "Producto"/"Categoria", el service lo convierte
        tipo_descuento: data.tipoDescuento, // "Porcentaje" o "Monto"
        descuento: data.tipoDescuento === "Porcentaje" 
          ? parseFloat(data.porcentajeDescuento) 
          : parseFloat(data.montoDescuento),
        fecha_inicio: formatearFechaParaMySQL(data.fecha_inicio),
        fecha_fin: formatearFechaParaMySQL(data.fecha_fin),
        activo: data.activo !== undefined ? data.activo : true,
        ProductoID: data.tipo === "Producto" && data.ProductoID ? parseInt(data.ProductoID) : null,
        CategoriaID: data.tipo === "Categoria" && data.CategoriaID ? parseInt(data.CategoriaID) : null
      };

      const response = await PromocionService.updatePromocion(datosParaEnvio);
      
      // Establecer ID de promoción modificada para mostrar mensaje de éxito
      setPromocionModificadaId(promoSeleccionada);
      setMensajeExito(true);
      
      // Opcional: recargar la lista de promociones
      const promosRes = await PromocionService.getallPromociones();
      setPromociones(promosRes.data || []);
      
    } catch (err) {
      // Manejo de errores más específico
      if (err.response?.data?.message) {
        setMensajeError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setMensajeError(err.response.data.error);
      } else if (err.message) {
        setMensajeError(err.message);
      } else {
        setMensajeError("No se pudo actualizar la promoción. Intente nuevamente.");
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 3, p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <EditIcon color="primary" />
        Modificar Promoción
      </Typography>

      {/* Mensaje de éxito morado estilo promoción creada */}
      {promocionModificadaId && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#c287d7ff', borderRadius: 2, mt: 8 }}>
          <Typography variant="h6" color="#d219a4ff">
            ¡Promoción modificada exitosamente!
          </Typography>
          <Typography sx={{ mt: 1 }}>
            <a
              href={`/promocion/${promocionModificadaId}`}
              style={{ color: '#d219a4ff', textDecoration: 'underline' }}
            >
              Ver detalle de promoción
            </a>
          </Typography>
        </Box>
      )}

      {/* Mensaje de error arriba centro */}
      {mensajeError && (
        <Box 
          sx={{ 
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            mb: 3, 
            p: 2, 
            backgroundColor: '#ffebee', 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '300px',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" color="error">
            Error: {mensajeError}
          </Typography>
        </Box>
      )}

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>1. Seleccionar Promoción</Typography>
        <FormControl fullWidth>
          <InputLabel id="promocion-label">Promoción</InputLabel>
          <Select
            labelId="promocion-label"
            value={promoSeleccionada}
            label="Promoción"
            onChange={(e) => setPromoSeleccionada(e.target.value)}
            disabled={loadingPromo}
          >
            {promociones.map((promo) => {
              const esEditable = esPromocionEditable(promo);
              const estadoConfig = obtenerEstadoTexto(promo.Estado);
              
              return (
                <MenuItem 
                  key={promo.id} 
                  value={promo.id}
                  sx={{ 
                    color: esEditable ? 'inherit' : 'text.disabled',
                    fontStyle: esEditable ? 'normal' : 'italic'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Typography sx={{ flexGrow: 1 }}>
                      {promo.nombre} (ID: {promo.id})
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        ml: 2, 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1, 
                        backgroundColor: estadoConfig.color + '20',
                        color: estadoConfig.color,
                        fontWeight: 'bold'
                      }}
                    >
                      {estadoConfig.texto}
                    </Typography>
                    {!esEditable && (
                      <Typography 
                        variant="caption" 
                        sx={{ ml: 1, fontStyle: 'italic', color: 'text.disabled' }}
                      >
                        - No editable
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Card>

      {loadingPromo && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {mostrarFormulario && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            2. Modificar Datos de la Promoción
            {!promocionEditable && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                ⚠ Esta promoción no se puede modificar porque tiene estado "Aplicado". Solo se pueden modificar promociones con estado "Pendiente" o "Vigente".
              </Typography>
            )}
          </Typography>
          
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="nombre"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nombre"
                      fullWidth
                      disabled={!promocionEditable}
                      error={!!errors.nombre}
                      helperText={errors.nombre?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="tipo"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.tipo}>
                      <InputLabel>Tipo</InputLabel>
                      <Select {...field} label="Tipo" disabled={!promocionEditable}>
                        <MenuItem value="Producto">Producto</MenuItem>
                        <MenuItem value="Categoria">Categoría</MenuItem>
                      </Select>
                      {errors.tipo && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                          {errors.tipo.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {tipo === "Producto" && (
                <Grid item xs={12}>
                  <Controller
                    name="ProductoID"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.ProductoID}>
                        <InputLabel>Producto</InputLabel>
                        <Select {...field} label="Producto" disabled={!promocionEditable}>
                          <MenuItem value="">Seleccione un producto</MenuItem>
                          {productos.map((p) => (
                            <MenuItem key={p.productosId} value={String(p.productosId)}>
                              {p.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.ProductoID && (
                          <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                            {errors.ProductoID.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
              )}

              {tipo === "Categoria" && (
                <Grid item xs={12}>
                  <Controller
                    name="CategoriaID"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.CategoriaID}>
                        <InputLabel>Categoría</InputLabel>
                        <Select {...field} label="Categoría" disabled={!promocionEditable}>
                          <MenuItem value="">Seleccione una categoría</MenuItem>
                          {categorias.map((cat) => (
                            <MenuItem key={cat.categoriaId} value={String(cat.categoriaId)}>
                              {cat.nombreSCategoria}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.CategoriaID && (
                          <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                            {errors.CategoriaID.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
              )}

              {/* Nuevo campo: Tipo de Descuento */}
              <Grid item xs={12}>
                <Controller
                  name="tipoDescuento"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.tipoDescuento}>
                      <InputLabel>Tipo de Descuento</InputLabel>
                      <Select {...field} label="Tipo de Descuento" disabled={!promocionEditable}>
                        <MenuItem value="Porcentaje">Porcentaje (%)</MenuItem>
                        <MenuItem value="Monto">Monto Fijo (₡)</MenuItem>
                      </Select>
                      {errors.tipoDescuento && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                          {errors.tipoDescuento.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Campo específico para Porcentaje */}
              {tipoDescuento === "Porcentaje" && (
                <Grid item xs={12}>
                  <Controller
                    name="porcentajeDescuento"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Porcentaje de Descuento"
                        type="number"
                        fullWidth
                        disabled={!promocionEditable}
                        inputProps={{ min: 1, max: 100, step: 0.01 }}
                        error={!!errors.porcentajeDescuento}
                        helperText={
                          errors.porcentajeDescuento?.message || 
                          "Ingrese un porcentaje entre 1% y 100%"
                        }
                        InputProps={{
                          endAdornment: "%"
                        }}
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Campo específico para Monto */}
              {tipoDescuento === "Monto" && (
                <Grid item xs={12}>
                  <Controller
                    name="montoDescuento"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Monto de Descuento"
                        type="number"
                        fullWidth
                        disabled={!promocionEditable}
                        inputProps={{ min: 0.01, max: 999999, step: 0.01 }}
                        error={!!errors.montoDescuento}
                        helperText={
                          errors.montoDescuento?.message || 
                          "Ingrese el monto fijo de descuento en colones"
                        }
                        InputProps={{
                          startAdornment: "₡"
                        }}
                      />
                    )}
                  />
                </Grid>
              )}

              <Grid item xs={6}>
                <Controller
                  name="fecha_inicio"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Fecha Inicio"
                      type="datetime-local"
                      fullWidth
                      disabled={!promocionEditable}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.fecha_inicio}
                      helperText={errors.fecha_inicio?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <Controller
                  name="fecha_fin"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Fecha Fin"
                      type="datetime-local"
                      fullWidth
                      disabled={!promocionEditable}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.fecha_fin}
                      helperText={errors.fecha_fin?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={!isDirty || !promocionEditable || loadingPromo}
              >
                {promocionEditable ? "Guardar Cambios" : "No Editable"}
              </Button>
            </Box>
          </form>
        </Card>
      )}

      <Snackbar
        open={mensajeExito}
        autoHideDuration={4000}
        onClose={() => setMensajeExito(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          top: '80px !important', // Posición justo debajo del navbar
        }}
      >
        <Alert 
          severity="success" 
          onClose={() => setMensajeExito(false)}
          sx={{
            backgroundColor: '#4caf50',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            '& .MuiAlert-action': {
              color: 'white'
            }
          }}
        >
          ¡Promoción actualizada correctamente!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!mensajeError}
        autoHideDuration={6000}
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