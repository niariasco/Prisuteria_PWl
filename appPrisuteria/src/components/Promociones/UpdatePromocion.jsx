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

  // Crear esquema de validación dinámico basado en el idioma actual
  const createValidationSchema = () => {
    return Yup.object().shape({
      nombre: Yup.string()
        .required(t("promocion.validation.name_required"))
        .matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, t("promocion.validation.letters_only")),
      tipo: Yup.string().oneOf(["Producto", "Categoria"]).required(t("promocion.validation.select_type")),
      tipoDescuento: Yup.string()
        .oneOf(["Porcentaje", "Monto"])
        .required(t("promocion.validation.select_discount_type")),
      porcentajeDescuento: Yup.number()
        .nullable()
        .when('tipoDescuento', {
          is: 'Porcentaje',
          then: (schema) => schema
            .required(t("promocion.validation.percentage_required"))
            .min(1, t("promocion.validation.percentage_range"))
            .max(100, t("promocion.validation.percentage_range")),
          otherwise: (schema) => schema.nullable().notRequired()
        }),
      montoDescuento: Yup.number()
        .nullable()
        .when('tipoDescuento', {
          is: 'Monto',
          then: (schema) => schema
            .required(t("promocion.validation.amount_required"))
            .min(0.01, t("promocion.validation.min_amount"))
            .max(999999, "El monto no puede exceder ₡999,999"),
          otherwise: (schema) => schema.nullable().notRequired()
        }),
      fecha_inicio: Yup.string().required(t("promocion.validation.start_date_required")),
      fecha_fin: Yup.string().required(t("promocion.validation.end_date_required")),
      ProductoID: Yup.string().when('tipo', {
        is: 'Producto',
        then: (schema) => schema.required(t("promocion.validation.select_product")),
        otherwise: (schema) => schema.nullable().notRequired()
      }),
      CategoriaID: Yup.string().when('tipo', {
        is: 'Categoria', 
        then: (schema) => schema.required(t("promocion.validation.select_category")),
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
    
    // Buscar en las traducciones de categorías
    const categoryKey = Object.keys(t("categories", { returnObjects: true }) || {})
      .find(key => key === categoryName);
    
    if (categoryKey) {
      const translations = t("categories", { returnObjects: true })[categoryKey];
      return translations[i18n.language] || translations.es || categoryName;
    }
    
    return categoryName;
  };

  // Función para obtener la traducción de productos
  const getProductTranslation = (productName) => {
    if (!productName) return productName;
    
    // Buscar en las traducciones de productos
    const productKey = Object.keys(t("products", { returnObjects: true }) || {})
      .find(key => key === productName);
    
    if (productKey) {
      const translations = t("products", { returnObjects: true })[productKey];
      return translations[i18n.language] || translations.es || productName;
    }
    
    return productName;
  };

  // FUNCIÓN MEJORADA Y SIMPLIFICADA para obtener la traducción de promociones
  const getPromotionTranslation = (promotionName) => {
    if (!promotionName) return promotionName;
    
    try {
      // Obtener el objeto de traducciones de promociones
      const promotionsTranslations = t("promotions", { returnObjects: true });
      
      if (!promotionsTranslations) {
        console.warn('No promotions translations found');
        return promotionName;
      }
      
      console.log('Searching translation for:', promotionName);
      
      // 1. Búsqueda exacta (case-sensitive)
      if (promotionsTranslations[promotionName]) {
        const translation = promotionsTranslations[promotionName];
        const result = translation[i18n.language] || translation.es || promotionName;
        console.log('Exact match found:', result);
        return result;
      }
      
      // 2. Búsqueda exacta (case-insensitive)
      const normalizedInput = promotionName.toLowerCase().trim();
      for (const [key, translation] of Object.entries(promotionsTranslations)) {
        if (key.toLowerCase() === normalizedInput) {
          const result = translation[i18n.language] || translation.es || promotionName;
          console.log('Case-insensitive match found:', key, '->', result);
          return result;
        }
      }
      
      // 3. Mapeo directo más completo - ACTUALIZADO para incluir todas las promociones
      const directMapping = {
        // Mapeo directo desde tu JSON
        'holy week': i18n.language === 'es' ? 'Semana Santa' : 'Holy Week',
        'semana santa': i18n.language === 'en' ? 'Holy Week' : 'Semana Santa',
        
        'dia del perro': i18n.language === 'en' ? 'Dog Day' : 'Día del perro',
        'dog day': i18n.language === 'es' ? 'Día del perro' : 'Dog Day',
        
        'father\'s day': i18n.language === 'es' ? 'Día de los padres' : 'Father\'s Day',
        'dia de los padres': i18n.language === 'en' ? 'Father\'s Day' : 'Día de los padres',
        'dia del padres': i18n.language === 'en' ? 'Father\'s Day' : 'Día del Padres',
        
        'men\'s day': i18n.language === 'es' ? 'Día del hombres' : 'Men\'s Day',
        'dia del hombres': i18n.language === 'en' ? 'Men\'s Day' : 'Día del hombres',
        
        'women\'s day': i18n.language === 'es' ? 'Día de la mujer' : 'Women\'s Day',
        'dia de la mujer': i18n.language === 'en' ? 'Women\'s Day' : 'Día de la mujer',
        
        'bride\'s day': i18n.language === 'es' ? 'Día de la novia' : 'Bride\'s Day',
        'dia de la novia': i18n.language === 'en' ? 'Bride\'s Day' : 'Día de la novia',
        
        'children\'s day': i18n.language === 'es' ? 'Día del niños' : 'Children\'s Day',
        'dia del niños': i18n.language === 'en' ? 'Children\'s Day' : 'Día del niños',
        
        'mother\'s day': i18n.language === 'es' ? 'Día de la madre' : 'Mother\'s Day',
        'dia de la madre': i18n.language === 'en' ? 'Mother\'s Day' : 'Día de la madre',
        
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
        const result = directMapping[normalizedInput];
        console.log('Direct mapping found:', normalizedInput, '->', result);
        return result;
      }
      
      // 4. Último recurso: devolver el nombre original
      console.warn('No translation found for:', promotionName);
      return promotionName;
      
    } catch (error) {
      console.error('Error getting promotion translation:', error, 'for promotion:', promotionName);
      return promotionName;
    }
  };

  // Función actualizada para obtener la traducción de estados usando tu JSON
  const getStatusTranslation = (status) => {
    if (!status) return status;
    
    try {
      // Método 1: Usar promotion_status directamente
      const statusTranslations = t("promotion_status", { returnObjects: true });
      if (statusTranslations && statusTranslations[status]) {
        const translation = statusTranslations[status];
        return translation[i18n.language] || translation.es || status;
      }
      
      // Método 2: Usar el sistema de mapeo de status_mappings
      const statusMappings = t("status_mappings", { returnObjects: true });
      if (statusMappings && statusMappings[i18n.language] && statusMappings[i18n.language][status]) {
        const mappingKey = statusMappings[i18n.language][status];
        const defaultTranslations = t("status_translations", { returnObjects: true });
        if (defaultTranslations && defaultTranslations[mappingKey]) {
          return defaultTranslations[mappingKey];
        }
      }
      
      // Método 3: Usar directamente el mapeo desde default_translations
      const defaultTranslations = t("default_translations", { returnObjects: true });
      if (defaultTranslations && defaultTranslations[i18n.language]) {
        // Buscar el valor directamente
        const translations = defaultTranslations[i18n.language];
        for (const [key, value] of Object.entries(translations)) {
          // Si el status coincide con algún valor en español, buscar su traducción
          if (value === status) {
            return value;
          }
        }
        
        // Mapeo directo de estados conocidos
        const statusKeyMap = {
          'Vigente': 'promocion.status_active',
          'Active': 'promocion.status_active',
          'Activo': 'promocion.status_active',
          'Pendiente': 'promocion.status_pending',
          'Pending': 'promocion.status_pending',
          'Aplicado': 'promocion.status_applied',
          'Applied': 'promocion.status_applied',
          'Inactivo': 'promocion.status_inactive',
          'Inactive': 'promocion.status_inactive',
          'Expirado': 'promocion.status_expired',
          'Expired': 'promocion.status_expired',
          'Vencido': 'promocion.status_expired'
        };
        
        const statusKey = statusKeyMap[status];
        if (statusKey && translations[statusKey]) {
          return translations[statusKey];
        }
      }
      
      // Fallback: mapeo directo simple
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
        setMensajeError(t("promocion.errors.load_initial_data"));
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

          // Determinar el tipo de descuento basado en los datos existentes
          let tipoDescuentoDetectado = "Porcentaje";
          
          if (promo.tipo_descuento) {
            tipoDescuentoDetectado = promo.tipo_descuento;
          } else {
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
            datosFormulario.montoDescuento = null;
          } else if (tipoDescuentoDetectado === "Monto") {
            datosFormulario.montoDescuento = String(promo.descuento || "");
            datosFormulario.porcentajeDescuento = null;
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
            setMensajeError(t("promocion.warnings.state_restriction", { status: estadoConfig.texto }));
          }
        } catch (err) {
          setMensajeError(t("promocion.errors.load_selected"));
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
      setMensajeError(t("promocion.errors.not_editable"));
      return;
    }

    try {
      if (!promoSeleccionada) {
        setMensajeError(t("promocion.errors.no_selection"));
        return;
      }

      // Función para convertir datetime-local a formato MySQL
      const formatearFechaParaMySQL = (fechaDatetimeLocal) => {
        if (!fechaDatetimeLocal) return null;
        return fechaDatetimeLocal.replace('T', ' ') + ':00';
      };

      // Preparar datos para envío
      const datosParaEnvio = {
        id: parseInt(promoSeleccionada),
        nombre: data.nombre.trim(),
        tipo: data.tipo,
        tipo_descuento: data.tipoDescuento,
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
        setMensajeError(t("promocion.errors.update_failed"));
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 3, p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <EditIcon color="primary" />
        {t("promocion.title.update")}
      </Typography>

      {/* Mensaje de éxito morado estilo promoción creada */}
      {promocionModificadaId && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#c287d7ff', borderRadius: 2, mt: 8 }}>
          <Typography variant="h6" color="#d219a4ff">
            {t("promocion.success.modified")}
          </Typography>
          <Typography sx={{ mt: 1 }}>
            <a
              href={`/promocion/${promocionModificadaId}`}
              style={{ color: '#d219a4ff', textDecoration: 'underline' }}
            >
              {t("promocion.view_promotion")}
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
            {t("promocion.error_label")}: {mensajeError}
          </Typography>
        </Box>
      )}

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>{t("promocion.steps.select")}</Typography>
        <FormControl fullWidth>
          <InputLabel id="promocion-label">{t("promocion.fields.promotion")}</InputLabel>
          <Select
            labelId="promocion-label"
            value={promoSeleccionada}
            label={t("promocion.fields.promotion")}
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
                        - {t("promocion.buttons.not_editable")}
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
            {t("promocion.steps.modify")}
            {!promocionEditable && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {t("promocion.warnings.not_editable")}
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
                      label={t("promocion.fields.name")}
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
                      <InputLabel>{t("promocion.fields.type")}</InputLabel>
                      <Select {...field} label={t("promocion.fields.type")} disabled={!promocionEditable}>
                        <MenuItem value="Producto">{t("promocion.options.product")}</MenuItem>
                        <MenuItem value="Categoria">{t("promocion.options.category")}</MenuItem>
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
                        <InputLabel>{t("promocion.fields.product")}</InputLabel>
                        <Select {...field} label={t("promocion.fields.product")} disabled={!promocionEditable}>
                          <MenuItem value="">{t("promocion.placeholders.select_product")}</MenuItem>
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
                        <InputLabel>{t("promocion.fields.category")}</InputLabel>
                        <Select {...field} label={t("promocion.fields.category")} disabled={!promocionEditable}>
                          <MenuItem value="">{t("promocion.placeholders.select_category")}</MenuItem>
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

              {/* Nuevo campo: Tipo de Descuento */}
              <Grid item xs={12}>
                <Controller
                  name="tipoDescuento"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.tipoDescuento}>
                      <InputLabel>{t("promocion.fields.discount_type")}</InputLabel>
                      <Select {...field} label={t("promocion.fields.discount_type")} disabled={!promocionEditable}>
                        <MenuItem value="Porcentaje">{t("promocion.options.percentage")}</MenuItem>
                        <MenuItem value="Monto">{t("promocion.options.fixed_amount")}</MenuItem>
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
                        label={t("promocion.fields.discount_percentage")}
                        type="number"
                        fullWidth
                        disabled={!promocionEditable}
                        inputProps={{ min: 1, max: 100, step: 0.01 }}
                        error={!!errors.porcentajeDescuento}
                        helperText={
                          errors.porcentajeDescuento?.message || 
                          t("promocion.validation.percentage_helper")
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
                        label={t("promocion.fields.discount_amount")}
                        type="number"
                        fullWidth
                        disabled={!promocionEditable}
                        inputProps={{ min: 0.01, max: 999999, step: 0.01 }}
                        error={!!errors.montoDescuento}
                        helperText={
                          errors.montoDescuento?.message || 
                          t("promocion.validation.amount_helper")
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
                      label={t("promocion.fields.start_date")}
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
                      label={t("promocion.fields.end_date")}
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
                {promocionEditable ? t("promocion.buttons.save_changes") : t("promocion.buttons.not_editable")}
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
          {t("promocion.success.updated")}
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