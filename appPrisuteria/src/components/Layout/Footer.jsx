// eslint-disable-next-line no-unused-vars
import React from "react";
import { Container, Typography, Grid, IconButton, Link, Box } from "@mui/material";
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t, i18n } = useTranslation(); // Hook para obtener las traducciones

  // Función para obtener las traducciones del footer según el idioma
  const getFooterText = (key, fallbackES, fallbackEN) => {
    if (i18n.language === 'en') {
      return t(`promotion_detail.footer.${key}`, fallbackEN);
    }
    return t(`promotion_detail.footer.${key}`, fallbackES);
  };

  return (
    <Box sx={{ backgroundColor: '#ce9fc4', color: 'white', mt: 4, pt: 2, pb: 1 }}>
      <Container maxWidth="md">
        <Grid container spacing={1} justifyContent="space-between" alignItems="flex-start">
          
          {/* Columna 1 - Información de la empresa */}
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" fontWeight="bold">
              {getFooterText('company_name', 'PRISUTERÍA ACCESORIOS', 'PRISUTERÍA ACCESSORIES')}
            </Typography>
            <Typography variant="caption">
              {getFooterText('schedule', 'Lunes a sábado: 9:00am - 6:00pm', 'Monday to Saturday: 9:00am - 6:00pm')}
            </Typography>
            
            {/* Iconos de redes sociales */}
            <Box sx={{ mt: 1 }}>
              <IconButton 
                size="small" 
                color="inherit" 
                href="https://www.facebook.com/prisuteriaaccesorioscr" 
                target="_blank"
                aria-label="Facebook"
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color="inherit" 
                href="https://www.instagram.com/prisuteria_accesorioscr/" 
                target="_blank"
                aria-label="Instagram"
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color="inherit" 
                href="https://www.tiktok.com/@prisuteria_accesorioscr" 
                target="_blank"
                aria-label="TikTok"
              >
                <MusicNoteIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color="inherit" 
                href="https://api.whatsapp.com/send/?phone=50671914947" 
                target="_blank"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          {/* Columna 2 - Enlaces de navegación */}
          <Grid item xs={12} sm={5}>
            <Typography variant="body1" fontWeight="bold">
              {getFooterText('links_title', 'ENLACES', 'LINKS')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, mt: 0.5 }}>
              <Link 
                href="/" 
                color="inherit" 
                underline="hover" 
                variant="caption"
                sx={{ 
                  transition: 'color 0.2s ease',
                  '&:hover': { color: 'rgba(255,255,255,0.8)' }
                }}
              >
                {getFooterText('links.home', 'Inicio', 'Home')}
              </Link>
              <Link 
                href="/nosotros" 
                color="inherit" 
                underline="hover" 
                variant="caption"
                sx={{ 
                  transition: 'color 0.2s ease',
                  '&:hover': { color: 'rgba(255,255,255,0.8)' }
                }}
              >
                {getFooterText('links.about', 'Nosotros', 'About Us')}
              </Link>
              <Link 
                href="/productos" 
                color="inherit" 
                underline="hover" 
                variant="caption"
                sx={{ 
                  transition: 'color 0.2s ease',
                  '&:hover': { color: 'rgba(255,255,255,0.8)' }
                }}
              >
                {getFooterText('links.products', 'Productos', 'Products')}
              </Link>
              <Link 
                href="/contacto" 
                color="inherit" 
                underline="hover" 
                variant="caption"
                sx={{ 
                  transition: 'color 0.2s ease',
                  '&:hover': { color: 'rgba(255,255,255,0.8)' }
                }}
              >
                {getFooterText('links.contact', 'Contacto', 'Contact')}
              </Link>
            </Box>
          </Grid>

        </Grid>

        {/* Sección de créditos y copyright */}
        <Box sx={{ 
          mt: 2, 
          textAlign: 'center', 
          fontSize: 12,
          borderTop: '1px solid rgba(255,255,255,0.2)',
          pt: 1.5
        }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
            {getFooterText('copyright', '© 2025 Proyecto UTN. Todos los derechos reservados.', '© 2025 UTN Project. All rights reserved.')}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {getFooterText('developers', 'Nicole Arias & Priscilla Sanchez', 'Nicole Arias & Priscilla Sanchez')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}