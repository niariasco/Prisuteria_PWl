import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Button, Grid, TextField,
  Snackbar, Alert as MuiAlert
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import PromocionService from "../../services/PromocionService";
import ProductoService from "../../services/ProductoService";
import CategoriaService from "../../services/CategoriaService";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

// Alert con forwardRef para Snackbar
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export function UpdatePromocion() {
  const { t, i18n } = useTranslation();

  // Función helper para obtener texto con fallback
  const getTextWithFallback = (key, fallbackEs, fallbackEn) => {
    const translation = t(key);
    if (translation === key) {
      // Si la traducción devuelve la misma clave, usar fallback
      return i18n.language === 'en' ? fallbackEn : fallbackEs;
    }
    return translation;
  };

  // Crear esquema de validación dinámico basado en el idioma actual
  const createValidationSchema = () => {
    return Yup.object().shape({
      nombre: Yup.string()
        .required(getTextWithFallback("promocion.validation.name_required", "El nombre es requerido", "Name is required"))
        .matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, getTextWithFallback("promocion.validation.letters_only", "Solo se permiten letras", "Only letters are allowed")),
      tipo: Yup.string().oneOf(["Producto", "Categoria"]).required(getTextWithFallback("promocion.validation.select_type", "Seleccione un tipo", "Select a type")),
      tipoDescuento: Yup.string()
        .oneOf(["Porcentaje", "Monto"])
        .required(getTextWithFallback("promocion.validation.select_discount_type", "Seleccione tipo de descuento", "Select discount type")),
      porcentajeDescuento: Yup.number()
        .nullable()
        .when('tipoDescuento', {
          is: 'Porcentaje',
          then: (schema) => schema
            .required(getTextWithFallback("promocion.validation.percentage_required", "El porcentaje es requerido", "Percentage is required"))
            .min(1, getTextWithFallback("promocion.validation.percentage_range", "Debe estar entre 1% y 100%", "Must be between 1% and 100%"))
            .max(100, getTextWithFallback("promocion.validation.percentage_range", "Debe estar entre 1% y 100%", "Must be between 1% and 100%")),
          otherwise: (schema) => schema.nullable().notRequired()
        }),
      montoDescuento: Yup.number()
        .nullable()
        .when('tipoDescuento', {
          is: 'Monto',
          then: (schema) => schema
            .required(getTextWithFallback("promocion.validation.amount_required", "El monto es requerido", "Amount is required"))
            .min(0.01, getTextWithFallback("promocion.validation.min_amount", "Monto mínimo 0.01", "Minimum amount 0.01"))
            .max(999999, "El monto no puede exceder ₡999,999"),
          otherwise: (schema) => schema.nullable().notRequired()
        }),
      fecha_inicio: Yup.string().required(getTextWithFallback("promocion.validation.start_date_required", "Fecha de inicio requerida", "Start date is required")),
      fecha_fin: Yup.string().required(getTextWithFallback("promocion.validation.end_date_required", "Fecha de fin requerida", "End date is required")),
      ProductoID: Yup.string().when('tipo', {
        is: 'Producto',
        then: (schema) => schema.required(getTextWithFallback("promocion.validation.select_product", "Seleccione un producto", "Select a product")),
        otherwise: (schema) => schema.nullable().notRequired()
      }),
      CategoriaID: Yup.string().when('tipo', {
        is: 'Categoria', 
        then: (schema) => schema.required(getTextWithFallback("promocion.validation.select_category", "Seleccione una categoría", "Select a category")),
        otherwise: (schema) => schema.nullable().notRequired()
      })
    });
  };

  const [validationSchema, setValidationSchema] = useState(createValidationSchema());
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

  // Actualizar esquema de validación cuando cambie el idioma
  useEffect(() => {
    const newSchema = createValidationSchema();
    setValidationSchema(newSchema);
  }, [i18n.language, t]);

  // Función para obtener la traducción de categorías
  const getCategoryTranslation = (categoryName) => {
    if (!categoryName) return categoryName;
    
    try {
      const categoryKey = Object.keys(t("categories", { returnObjects: true }) || {})
        .find(key => key === categoryName);
      
      if (categoryKey) {
        const translations = t("categories", { returnObjects: true })[categoryKey];
        return translations[i18n.language] || translations.es || categoryName;
      }
    } catch (error) {
      console.warn('Error getting category translation:', error);
    }
    
    return categoryName;
  };

  // Función para obtener la traducción de productos
  const getProductTranslation = (productName) => {
    if (!productName) return productName;
    
    try {
      const productKey = Object.keys(t("products", { returnObjects: true }) || {})
        .find(key => key === productName);
      
      if (productKey) {
        const translations = t("products", { returnObjects: true })[productKey];
        return translations[i18n.language] || translations.es || productName;
      }
    } catch (error) {
      console.warn('Error getting product translation:', error);
    }
    
    return productName;
  };

  // Función CORREGIDA para obtener la traducción de promociones
  const getPromotionTranslation = (promotionName) => {
    if (!promotionName) return promotionName;
    
    try {
      // Obtener el objeto de traducciones de promociones
      const promotionsTranslations = t("promotions", { returnObjects: true });
      
      if (!promotionsTranslations) {
        return promotionName;
      }
      
      // 1. Búsqueda exacta (case-sensitive)
      if (promotionsTranslations[promotionName]) {
        const translation = promotionsTranslations[promotionName];
        return translation[i18n.language] || translation.es || promotionName;
      }
      
      // 2. Búsqueda exacta (case-insensitive)
      const normalizedInput = promotionName.toLowerCase().trim();
      for (const [key, translation] of Object.entries(promotionsTranslations)) {
        if (key.toLowerCase() === normalizedInput) {
          return translation[i18n.language] || translation.es || promotionName;
        }
      }
      
      // 3. Mapeo directo simplificado basado en el JSON proporcionado
      const directMapping = {
        'holy week': i18n.language === 'es' ? 'Semana Santa' : 'Holy Week',
        'semana santa': i18n.language === 'en' ? 'Holy Week' : 'Semana Santa',
        
        'dog day': i18n.language === 'es' ? 'Día del perro' : 'Dog Day',
        'día del perro': i18n.language === 'en' ? 'Dog Day' : 'Día del perro',
        
        "father's day": i18n.language === 'es' ? 'Día de los padres' : "Father's Day",
        'día de los padres': i18n.language === 'en' ? "Father's Day" : 'Día de los padres',
        'día del padres': i18n.language === 'en' ? "Father's Day" : 'Día del Padres',
        
        "men's day": i18n.language === 'es' ? 'Día del hombres' : "Men's Day",
        'día del hombres': i18n.language === 'en' ? "Men's Day" : 'Día del hombres',
        
        "women's day": i18n.language === 'es' ? 'Día de la mujer' : "Women's Day",
        'día de la mujer': i18n.language === 'en' ? "Women's Day" : 'Día de la mujer',
        
        "bride's day": i18n.language === 'es' ? 'Día de la novia' : "Bride's Day",
        'día de la novia': i18n.language === 'en' ? "Bride's Day" : 'Día de la novia',
        
        "children's day": i18n.language === 'es' ? 'Día del niños' : "Children's Day",
        'día del niños': i18n.language === 'en' ? "Children's Day" : 'Día del niños',
        
        "mother's day": i18n.language === 'es' ? 'Día de la madre' : "Mother's Day",
        'día de la madre': i18n.language === 'en' ? "Mother's Day" : 'Día de la madre',
        
        'coquette': 'Coquette', // Mismo en ambos idiomas
        
        'final clearance': i18n.language === 'es' ? 'Liquidación Final' : 'Final Clearance',
        'liquidación final': i18n.language === 'en' ? 'Final Clearance' : 'Liquidación Final',
        
        'weekend promo': i18n.language === 'es' ? 'Promo Fin de Semana' : 'Weekend Promo',
        'promo fin de semana': i18n.language === 'en' ? 'Weekend Promo' : 'Promo Fin de Semana',
        
        'january sale': i18n.language === 'es' ? 'Rebajas de Enero' : 'January Sale',
        'rebajas de enero': i18n.language === 'en' ? 'January Sale' : 'Rebajas de Enero',
        
        'winter discounts': i18n.language === 'es' ? 'Descuentos Invierno' : 'Winter Discounts',
        'descuentos invierno': i18n.language === 'en' ? 'Winter Discounts' : 'Descuentos Invierno',
        
        'special offer': i18n.language === 'es' ? 'Oferta Especial' : 'Special Offer',
        'oferta especial': i18n.language === 'en' ? 'Special Offer' : 'Oferta Especial',
        
        'summer promo': i18n.language === 'es' ? 'Promo Verano' : 'Summer Promo',
        'promo verano': i18n.language === 'en' ? 'Summer Promo' : 'Promo Verano'
      };
      
      // Buscar en el mapeo directo
      if (directMapping[normalizedInput]) {
        return directMapping[normalizedInput];
      }
      
      // 4. Último recurso: devolver el nombre original
      return promotionName;
      
    } catch (error) {
      console.error('Error getting promotion translation:', error, 'for promotion:', promotionName);
      return promotionName;
    }
  };

  // Función CORREGIDA para obtener la traducción de estados
  const getStatusTranslation = (status) => {
    if (!status) return status;
    
    try {
      // Usar el JSON de promotion_status directamente
      const statusTranslations = t("promotion_status", { returnObjects: true });
      
      if (statusTranslations && statusTranslations[status]) {
        const translation = statusTranslations[status];
        return translation[i18n.language] || translation.es || status;
      }
      
      // Mapeo directo como fallback
      const directMap = {
        'Pendiente': i18n.language === 'en' ? 'Pending' : 'Pendiente',
        'Pending': i18n.language === 'es' ? 'Pendiente' : 'Pending',
        'Vigente': i18n.language === 'en' ? 'Active' : 'Vigente',
        'Active': i18n.language === 'es' ? 'Vigente' : 'Active',
        'Activo': i18n.language === 'en' ? 'Active' : 'Vigente',
        'Aplicado': i18n.language === 'en' ? 'Applied' : 'Aplicado',
        'Applied': i18n.language === 'es' ? 'Aplicado' : 'Applied',
        'Inactivo': i18n.language === 'en' ? 'Inactive' : 'Inactivo',
        'Inactive': i18n.language === 'es' ? 'Inactivo' : 'Inactive',
        'Expirado': i18n.language === 'en' ? 'Expired' : 'Expirado',
        'Expired': i18n.language === 'es' ? 'Expirado' : 'Expired',
        'Vencido': i18n.language === 'en' ? 'Expired' : 'Vencido'
      };
      
      return directMap[status] || status;
      
    } catch (error) {
      console.warn('Error getting status translation:', error, 'for status:', status);
      return status;
    }
  };

  // Función para determinar si una promoción es editable basada en su estado
  const esPromocionEditable = (promocion) => {
    const estadosEditables = ['Vigente', 'Pendiente', 'Active', 'Pending'];
    return estadosEditables.includes(promocion.Estado);
  };

  // Función para obtener el texto del estado con color
  const obtenerEstadoTexto = (estado) => {
    const estadosConfig = {
      'Pendiente': { texto: getStatusTranslation('Pendiente'), color: '#ADD8E6' },
      'Pending': { texto: getStatusTranslation('Pending'), color: '#ADD8E6' },
      'Vigente': { texto: getStatusTranslation('Vigente'), color: '#FF4D4D' },
      'Active': { texto: getStatusTranslation('Active'), color: '#FF4D4D' },
      'Aplicado': { texto: getStatusTranslation('Aplicado'), color: '#D3D3D3' },
      'Applied': { texto: getStatusTranslation('Applied'), color: '#D3D3D3' }
    };
    
    return estadosConfig[estado] || { texto: getStatusTranslation(estado) || estado, color: '#757575' };
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
        setMensajeError(getTextWithFallback("promocion.errors.load_initial_data", "Error al cargar datos iniciales", "Error loading initial data"));
      }
    };

    cargarDatos();
  }, [t]);

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

          // CORREGIDO: Determinar el tipo de descuento y validar el valor
          let tipoDescuentoDetectado = "Porcentaje";
          let valorDescuento = promo.descuento || 0;
          
          // Validar que el valor esté dentro de los rangos correctos
          if (promo.tipo_descuento) {
            tipoDescuentoDetectado = promo.tipo_descuento;
          } else {
            // Si no hay tipo específico, inferir basado en el valor
            if (valorDescuento <= 100) {
              tipoDescuentoDetectado = "Porcentaje";
            } else {
              tipoDescuentoDetectado = "Monto";
            }
          }

          // VALIDACIÓN ADICIONAL: Corregir valores fuera de rango
          if (tipoDescuentoDetectado === "Porcentaje" && valorDescuento > 100) {
            // Si el valor es mayor a 100 pero debería ser porcentaje, probablemente es un error
            console.warn(`Valor de descuento ${valorDescuento} parece ser incorrecto para porcentaje`);
            valorDescuento = Math.min(valorDescuento, 100); // Limitar a 100%
          }

          // Resetear formulario con datos de la promoción
          const datosFormulario = {
            id: promo.id,
            nombre: promo.nombre || "",
            tipo: promo.tipo || "",
            ProductoID: promo.ProductoID ? String(promo.ProductoID) : "",
            CategoriaID: promo.CategoriaID ? String(promo.CategoriaID) : "",
            tipoDescuento: tipoDescuentoDetectado,
            porcentajeDescuento: null,
            montoDescuento: null,
            fecha_inicio: formatearFecha(promo.fecha_inicio),
            fecha_fin: formatearFecha(promo.fecha_fin),
            activo: promo.activo !== undefined ? promo.activo : true
          };

          // Asignar el valor al campo correspondiente CON VALIDACIÓN
          if (tipoDescuentoDetectado === "Porcentaje") {
            // Validar que esté en rango 1-100
            const porcentajeValido = Math.max(1, Math.min(100, valorDescuento));
            datosFormulario.porcentajeDescuento = porcentajeValido;
            datosFormulario.montoDescuento = null;
          } else if (tipoDescuentoDetectado === "Monto") {
            // Validar que sea un monto positivo
            const montoValido = Math.max(0.01, Math.min(999999, valorDescuento));
            datosFormulario.montoDescuento = montoValido;
            datosFormulario.porcentajeDescuento = null;
          }
          
          reset(datosFormulario);

          // Limpiar campos según el tipo
          if (promo.tipo === "Producto") {
            setValue("CategoriaID", "");
          } else if (promo.tipo === "Categoria") {
            setValue("ProductoID", "");
          }

          setMostrarFormulario(true);
          
          if (!esEditable) {
            const estadoConfig = obtenerEstadoTexto(promo.Estado);
            setMensajeError(getTextWithFallback("promocion.warnings.state_restriction", `Promoción no editable por estado: ${estadoConfig.texto}`, `Promotion not editable due to status: ${estadoConfig.texto}`));
          }
        } catch (err) {
          console.error('Error cargando promoción:', err);
          setMensajeError(getTextWithFallback("promocion.errors.load_selected", "Error al cargar promoción seleccionada", "Error loading selected promotion"));
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
  }, [promoSeleccionada, reset, setValue, t]);

  // Limpiar campos cuando cambia el tipo
  useEffect(() => {
    if (tipo === "Producto") {
      setValue("CategoriaID", "");
    } else if (tipo === "Categoria") {
      setValue("ProductoID", "");
    }
  }, [tipo, setValue]);

  // Limpiar campos de descuento cuando cambia el tipo de descuento
  useEffect(() => {
    if (promoSeleccionada && !loadingPromo && mostrarFormulario) {
      const promocionActual = promociones.find(p => p.id == promoSeleccionada);
      
      if (promocionActual && promocionActual.tipo_descuento !== tipoDescuento) {
        setValue("porcentajeDescuento", null);
        setValue("montoDescuento", null);
      }
    }
  }, [tipoDescuento, setValue, promoSeleccionada, loadingPromo, mostrarFormulario, promociones]);

  const onSubmit = async (data) => {
    if (!promocionEditable) {
      setMensajeError(getTextWithFallback("promocion.errors.not_editable", "Promoción no editable", "Promotion not editable"));
      return;
    }

    try {
      if (!promoSeleccionada) {
        setMensajeError(getTextWithFallback("promocion.errors.no_selection", "No hay promoción seleccionada", "No promotion selected"));
        return;
      }

      // Función para convertir datetime-local a formato MySQL
      const formatearFechaParaMySQL = (fechaDatetimeLocal) => {
        if (!fechaDatetimeLocal) return null;
        return fechaDatetimeLocal.replace('T', ' ') + ':00';
      };

      // VALIDACIÓN ADICIONAL antes de enviar
      let valorDescuento;
      if (data.tipoDescuento === "Porcentaje") {
        valorDescuento = parseFloat(data.porcentajeDescuento);
        if (isNaN(valorDescuento) || valorDescuento < 1 || valorDescuento > 100) {
          setMensajeError("El porcentaje debe estar entre 1% y 100%");
          return;
        }
      } else {
        valorDescuento = parseFloat(data.montoDescuento);
        if (isNaN(valorDescuento) || valorDescuento < 0.01 || valorDescuento > 999999) {
          setMensajeError("El monto debe estar entre 0.01 y 999,999");
          return;
        }
      }

      // Preparar datos para envío
      const datosParaEnvio = {
        id: parseInt(promoSeleccionada),
        nombre: data.nombre.trim(),
        tipo: data.tipo,
        tipo_descuento: data.tipoDescuento,
        descuento: valorDescuento,
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
        setMensajeError(getTextWithFallback("promocion.errors.update_failed", "Error al actualizar promoción", "Failed to update promotion"));
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 3, p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <EditIcon color="primary" />
        {getTextWithFallback("promocion.title.update", "Actualizar Promoción", "Update Promotion")}
      </Typography>

      {/* Mensaje de éxito morado estilo promoción creada */}
      {promocionModificadaId && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#c287d7ff', borderRadius: 2, mt: 8 }}>
          <Typography variant="h6" color="#d219a4ff">
            {getTextWithFallback("promocion.success.modified", "Promoción modificada exitosamente", "Promotion successfully modified")}
          </Typography>
          <Typography sx={{ mt: 1 }}>
            <a
              href={`/promocion/${promocionModificadaId}`}
              style={{ color: '#d219a4ff', textDecoration: 'underline' }}
            >
              {getTextWithFallback("promocion.view_promotion", "Ver promoción", "View promotion")}
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
            {getTextWithFallback("promocion.error_label", "Error", "Error")}: {mensajeError}
          </Typography>
        </Box>
      )}

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {getTextWithFallback("promocion.steps.select", "Seleccionar Promoción", "Select Promotion")}
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="promocion-label">
            {getTextWithFallback("promocion.fields.promotion", "Promoción", "Promotion")}
          </InputLabel>
          <Select
            labelId="promocion-label"
            value={promoSeleccionada}
            label={getTextWithFallback("promocion.fields.promotion", "Promoción", "Promotion")}
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
                      {getPromotionTranslation(promo.nombre)} (ID: {promo.id})
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
                        - {getTextWithFallback("promocion.buttons.not_editable", "No editable", "Not editable")}
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
            {getTextWithFallback("promocion.steps.modify", "Modificar Promoción", "Modify Promotion")}
            {!promocionEditable && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {getTextWithFallback("promocion.warnings.not_editable", "Esta promoción no es editable", "This promotion is not editable")}
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
                      label={getTextWithFallback("promocion.fields.name", "Nombre", "Name")}
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
                      <InputLabel>{getTextWithFallback("promocion.fields.type", "Tipo", "Type")}</InputLabel>
                      <Select {...field} label={getTextWithFallback("promocion.fields.type", "Tipo", "Type")} disabled={!promocionEditable}>
                        <MenuItem value="Producto">{getTextWithFallback("promocion.options.product", "Producto", "Product")}</MenuItem>
                        <MenuItem value="Categoria">{getTextWithFallback("promocion.options.category", "Categoría", "Category")}</MenuItem>
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
                        <InputLabel>{getTextWithFallback("promocion.fields.product", "Producto", "Product")}</InputLabel>
                        <Select {...field} label={getTextWithFallback("promocion.fields.product", "Producto", "Product")} disabled={!promocionEditable}>
                          <MenuItem value="">{getTextWithFallback("promocion.placeholders.select_product", "Seleccionar producto", "Select product")}</MenuItem>
                          {productos.map((p) => (
                            <MenuItem key={p.productosId} value={String(p.productosId)}>
                              {getProductTranslation(p.nombre)}
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
                        <InputLabel>{getTextWithFallback("promocion.fields.category", "Categoría", "Category")}</InputLabel>
                        <Select {...field} label={getTextWithFallback("promocion.fields.category", "Categoría", "Category")} disabled={!promocionEditable}>
                          <MenuItem value="">{getTextWithFallback("promocion.placeholders.select_category", "Seleccionar categoría", "Select category")}</MenuItem>
                          {categorias.map((cat) => (
                            <MenuItem key={cat.categoriaId} value={String(cat.categoriaId)}>
                              {getCategoryTranslation(cat.nombreSCategoria)}
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

              {/* Campo: Tipo de Descuento */}
              <Grid item xs={12}>
                <Controller
                  name="tipoDescuento"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.tipoDescuento}>
                      <InputLabel>{getTextWithFallback("promocion.fields.discount_type", "Tipo de Descuento", "Discount Type")}</InputLabel>
                      <Select {...field} label={getTextWithFallback("promocion.fields.discount_type", "Tipo de Descuento", "Discount Type")} disabled={!promocionEditable}>
                        <MenuItem value="Porcentaje">{getTextWithFallback("promocion.options.percentage", "Porcentaje", "Percentage")}</MenuItem>
                        <MenuItem value="Monto">{getTextWithFallback("promocion.options.fixed_amount", "Monto Fijo", "Fixed Amount")}</MenuItem>
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
                        label={getTextWithFallback("promocion.fields.discount_percentage", "Porcentaje de Descuento", "Discount Percentage")}
                        type="number"
                        fullWidth
                        disabled={!promocionEditable}
                        inputProps={{ min: 1, max: 100, step: 0.01 }}
                        error={!!errors.porcentajeDescuento}
                        helperText={
                          errors.porcentajeDescuento?.message || 
                          getTextWithFallback("promocion.validation.percentage_helper", "Ingrese un porcentaje entre 1% y 100%", "Enter a percentage between 1% and 100%")
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
                        label={getTextWithFallback("promocion.fields.discount_amount", "Monto de Descuento", "Discount Amount")}
                        type="number"
                        fullWidth
                        disabled={!promocionEditable}
                        inputProps={{ min: 0.01, max: 999999, step: 0.01 }}
                        error={!!errors.montoDescuento}
                        helperText={
                          errors.montoDescuento?.message || 
                          getTextWithFallback("promocion.validation.amount_helper", "Ingrese un monto entre 0.01 y 999,999", "Enter an amount between 0.01 and 999,999")
                        }
                        InputProps={{
                          startAdornment: i18n.language === 'es' ? "₡" : "$"
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
                      label={getTextWithFallback("promocion.fields.start_date", "Fecha de Inicio", "Start Date")}
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
                      label={getTextWithFallback("promocion.fields.end_date", "Fecha de Fin", "End Date")}
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
                {promocionEditable 
                  ? getTextWithFallback("promocion.buttons.save_changes", "Guardar Cambios", "Save Changes")
                  : getTextWithFallback("promocion.buttons.not_editable", "No Editable", "Not Editable")
                }
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
          top: '80px !important',
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
          {getTextWithFallback("promocion.success.updated", "Promoción actualizada exitosamente", "Promotion updated successfully")}
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