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
  descuento: Yup.number()
    .required("El descuento es obligatorio")
    .min(1, "El descuento debe ser mínimo 1%")
    .max(100, "El descuento debe ser máximo 100%"),
  fecha_inicio: Yup.string().required("La fecha de inicio es obligatoria"),
  fecha_fin: Yup.string()
    .required("La fecha de fin es obligatoria")
    .test('fecha-fin-mayor', 'La fecha de fin debe ser posterior a la fecha de inicio', function(value) {
      const { fecha_inicio } = this.parent;
      if (!fecha_inicio || !value) return true;
      return new Date(value) > new Date(fecha_inicio);
    }),
  ProductoID: Yup.string().when('tipo', {
    is: 'Producto',
    then: () => Yup.string().required('Debe seleccionar un producto'),
    otherwise: () => Yup.string().nullable()
  }),
  CategoriaID: Yup.string().when('tipo', {
    is: 'Categoria', 
    then: () => Yup.string().required('Debe seleccionar una categoría'),
    otherwise: () => Yup.string().nullable()
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
      descuento: "",
      fecha_inicio: "",
      fecha_fin: "",
      activo: true
    },
  });

  const tipo = watch("tipo");

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
        console.error("Error al cargar datos:", err);
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
          
          console.log("Datos de promoción cargados:", promo);

          // Verificar si la promoción es editable (no aplicada)
          const fechaActual = new Date();
          const fechaInicio = new Date(promo.fecha_inicio);
          const esEditable = fechaInicio >= fechaActual || promo.Estado === 'Pendiente';
          
          setPromocionEditable(esEditable);

          // Formatear fechas para datetime-local
          const formatearFecha = (fecha) => {
            if (!fecha) return "";
            const fechaObj = new Date(fecha);
            return fechaObj.toISOString().slice(0, 16);
          };

          // Resetear formulario con datos de la promoción
          reset({
            id: promo.id,
            nombre: promo.nombre || "",
            tipo: promo.tipo || "",
            ProductoID: promo.ProductoID ? String(promo.ProductoID) : "",
            CategoriaID: promo.CategoriaID ? String(promo.CategoriaID) : "",
            descuento: promo.descuento || "",
            fecha_inicio: formatearFecha(promo.fecha_inicio),
            fecha_fin: formatearFecha(promo.fecha_fin),
            activo: promo.activo !== undefined ? promo.activo : true
          });

          // Limpiar campos según el tipo
          if (promo.tipo === "Producto") {
            setValue("CategoriaID", "");
          } else if (promo.tipo === "Categoria") {
            setValue("ProductoID", "");
          }

          setMostrarFormulario(true);
          
          if (!esEditable) {
            setMensajeError("Esta promoción ya no se puede modificar porque ya ha iniciado o ha sido aplicada.");
          }
        } catch (err) {
          console.error("Error al cargar promoción:", err);
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

  const onSubmit = async (data) => {
    if (!promocionEditable) {
      setMensajeError("No se puede modificar una promoción que ya ha iniciado o sido aplicada.");
      return;
    }

    try {
      console.log("Datos a enviar:", data);
      
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
        tipo: data.tipo,
        descuento: parseFloat(data.descuento),
        fecha_inicio: formatearFechaParaMySQL(data.fecha_inicio),
        fecha_fin: formatearFechaParaMySQL(data.fecha_fin),
        activo: data.activo !== undefined ? data.activo : true,
        ProductoID: data.tipo === "Producto" && data.ProductoID ? parseInt(data.ProductoID) : null,
        CategoriaID: data.tipo === "Categoria" && data.CategoriaID ? parseInt(data.CategoriaID) : null
      };

      console.log("Datos finales a enviar:", datosParaEnvio);
      console.log("Fecha inicio formateada:", datosParaEnvio.fecha_inicio);
      console.log("Fecha fin formateada:", datosParaEnvio.fecha_fin);

      await PromocionService.updatePromocion(datosParaEnvio);
      
      // Establecer ID de promoción modificada para mostrar mensaje de éxito
      setPromocionModificadaId(promoSeleccionada);
      setMensajeExito(true);
      
      // Opcional: recargar la lista de promociones
      const promosRes = await PromocionService.getallPromociones();
      setPromociones(promosRes.data || []);
      
    } catch (err) {
      console.error("Error al actualizar promoción:", err);
      
      // Manejo de errores más específico
      if (err.response?.data?.message) {
        setMensajeError(err.response.data.message);
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
              const fechaInicio = new Date(promo.fecha_inicio);
              const fechaActual = new Date();
              const esEditable = fechaInicio >= fechaActual;
              
              return (
                <MenuItem 
                  key={promo.id} 
                  value={promo.id}
                  sx={{ 
                    color: esEditable ? 'inherit' : 'text.disabled',
                    fontStyle: esEditable ? 'normal' : 'italic'
                  }}
                >
                  {promo.nombre} (ID: {promo.id}) {!esEditable && " - No editable"}
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
                ⚠️ Esta promoción no se puede modificar porque ya ha iniciado o ha sido aplicada.
              </Typography>
            )}
          </Typography>
          
          <form onSubmit={handleSubmit(onSubmit)}>
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

              <Grid item xs={12}>
                <Controller
                  name="descuento"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descuento (%)"
                      type="number"
                      fullWidth
                      disabled={!promocionEditable}
                      inputProps={{ min: 1, max: 100, step: 0.01 }}
                      error={!!errors.descuento}
                      helperText={errors.descuento?.message}
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