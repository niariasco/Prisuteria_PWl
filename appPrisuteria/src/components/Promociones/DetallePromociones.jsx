import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import StarIcon from '@mui/icons-material/Star';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DiscountIcon from '@mui/icons-material/Discount';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useTranslation } from 'react-i18next';

import PromocionService from '../../services/PromocionService';

export function DetallePromociones({ addItem }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  // Función para mostrar el nombre de la promoción sin traducir
  const getPromotionName = (promotionName) => {
    // Retorna el nombre original sin traducir
    return promotionName || t('promotion_detail.messages.not_available', 'N/A');
  };

  // Función para traducir categorías (actualizada para usar la configuración procesada)
  const translateCategory = (categoryName) => {
    if (!categoryName) return t('promotion_detail.messages.not_available', 'N/A');
    
    // Con la nueva configuración, las categorías ya están procesadas como strings simples
    const translation = t(`categories.${categoryName}`, { defaultValue: null });
    return translation !== null ? translation : categoryName;
  };

  // Función para traducir productos (actualizada para usar la configuración procesada)
  const translateProduct = (productName) => {
    if (!productName) return t('promotion_detail.messages.not_available', 'N/A');
    
    // Con la nueva configuración, los productos ya están procesados como strings simples
    const translation = t(`products.${productName}`, { defaultValue: null });
    return translation !== null ? translation : productName;
  };

  // Función para traducir estados (actualizada para usar la configuración procesada)
  const translateStatus = (status) => {
    if (!status) return t('promotion_detail.messages.not_available', 'N/A');
    
    // Con la nueva configuración, los estados ya están procesados como strings simples
    const translation = t(`promotion_status.${status}`, { defaultValue: null });
    return translation !== null ? translation : status;
  };

  // Función para traducir tipos
  const translateType = (type) => {
    if (!type) return t('promotion_detail.messages.not_available', 'N/A');
    
    const typeTranslations = {
      'Categoria': t('promocion.options.category', 'Categoría'),
      'Producto': t('promocion.options.product', 'Producto')
    };
    
    return typeTranslations[type] || type;
  };

  // Función para formatear fechas de YYYY-MM-DD a DD/MM/YYYY (sin horas)
  const formatearFecha = (fecha) => {
    if (!fecha) return t('promotion_detail.messages.not_available', 'N/A');
    // Extraer solo la parte de la fecha (antes del espacio o 'T' si hay hora)
    const soloFecha = fecha.split(' ')[0].split('T')[0];
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    PromocionService.getPromocionById(id)
      .then((response) => {
        setData(response.data);
        setLoaded(true);
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      });
  }, [id]);

  if (!loaded) return <p>{t('promotion_detail.messages.loading', 'Cargando...')}</p>;
  if (error) return <p>{t('promotion_detail.messages.error', 'Error')}: {error.message}</p>;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      py: 6,
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 2,
            padding: '12px 24px',
            backgroundColor: 'rgba(216, 59, 106, 0.1)',
            borderRadius: '50px',
            border: '2px solid rgba(216, 59, 106, 0.2)',
          }}>
            <StarIcon sx={{ color: '#d83b6a', fontSize: 30 }} />
            <Typography 
              component="h1" 
              variant="h3" 
              sx={{ 
                color: '#d83b6a',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                background: 'linear-gradient(45deg, #d83b6a, #ff6b9d)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('promotion_detail.page_title', 'Promociones Prisutería Accesorios')}
            </Typography>
            <StarIcon sx={{ color: '#d83b6a', fontSize: 30 }} />
          </Box>
          
          <Divider sx={{ 
            maxWidth: 200, 
            mx: 'auto', 
            borderWidth: 2, 
            borderColor: '#d83b6a',
            borderRadius: 2,
          }} />
        </Box>

        {/* Detalle visual de la promoción */}
        <Container maxWidth="sm">
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: 4,
              boxShadow: 3,
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" sx={{ color: '#d83b6a', fontWeight: 'bold', mb: 3 }}>
              {t('promotion_detail.detail_title', 'Detalle de la Promoción')}
            </Typography>

            <Typography variant="h6" sx={{ mb: 1 }}>
              <strong>{t('promotion_detail.fields.name', 'Nombre')}:</strong> {getPromotionName(data.nombre)}
            </Typography>

            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t('promotion_detail.fields.type', 'Tipo')}:</strong> {translateType(data.tipo)}
            </Typography>

            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t('promotion_detail.fields.applied_to', 'Aplicado en')}:</strong>{' '}
              {data.tipo === 'Categoria' && data.nombre_categoria
                ? translateCategory(data.nombre_categoria)
                : data.tipo === 'Producto' && data.nombre_producto
                ? translateProduct(data.nombre_producto)
                : t('promotion_detail.messages.not_available', 'N/A')}
            </Typography>

            <Typography
              variant="h5"
              sx={{ color: 'green', fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
            >
              <DiscountIcon fontSize="small" />
              -{data.descuento}% 
            </Typography>

            <Typography variant="body1" sx={{ mb: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
              <CalendarMonthIcon fontSize="small" />
              <strong>{t('promotion_detail.fields.start', 'Inicio')}:</strong> {formatearFecha(data.fecha_inicio)}
            </Typography>

            <Typography variant="body1" sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
              <CalendarMonthIcon fontSize="small" />
              <strong>{t('promotion_detail.fields.end', 'Fin')}:</strong> {formatearFecha(data.fecha_fin)}
            </Typography>

            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              {t('promotion_detail.fields.status', 'Estado')}:
            </Typography>

            <Chip
              label={translateStatus(data.Estado)}
              icon={<LocalOfferIcon />}
              sx={{
                backgroundColor: data.color_estado || '#ccc',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '1rem',
                mb: 3,
                px: 2,
                py: 1,
              }}
            />

            <Divider sx={{ my: 3 }} />

            <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
              {t('promotion_detail.buttons.back', '← Volver')}
            </Button>
          </Box>
        </Container>
      </Container>
    </Box>
  );
}