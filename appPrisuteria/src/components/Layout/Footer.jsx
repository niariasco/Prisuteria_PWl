// eslint-disable-next-line no-unused-vars
import React from "react"; 
import { Container, Typography } from "@mui/material"; 
import Grid from "@mui/material/Grid2"; 
import { Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import MusicNoteIcon from '@mui/icons-material/MusicNote'; // para TikTok (alternativa)
import { Box } from '@mui/system';

export function Footer() {
  return (
    <Box sx={{ backgroundColor: '#ce9fc4', color: 'white', mt: 6, pt: 4, pb: 2 }}>
      <Container>
        <Grid container spacing={4}>

          {/* Columna 1: Información de contacto */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              PRISUTERÍA ACCESORIOS
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              Atención al cliente:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Nuestro equipo está disponible de lunes a sábado de 9:00am a 6:00pm.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton
                color="inherit"
                component="a"
                href="https://www.facebook.com/prisuteriaaccesorioscr"
                target="_blank"
                rel="noopener"
              >
                <FacebookIcon />
              </IconButton>

              <IconButton
                color="inherit"
                component="a"
                href="https://www.instagram.com/prisuteria_accesorioscr/"
                target="_blank"
                rel="noopener"
              >
                <InstagramIcon />
              </IconButton>

              <IconButton
                color="inherit"
                component="a"
                href="https://www.tiktok.com/@prisuteria_accesorioscr"
                target="_blank"
                rel="noopener"
              >
                <MusicNoteIcon />
              </IconButton>

              <IconButton
                color="inherit"
                component="a"
                href="https://api.whatsapp.com/send/?phone=50671914947&text&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener"
              >
                <WhatsAppIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Columna 2: Enlaces rápidos */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              ENLACES RÁPIDOS
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover">Inicio</Link>
              <Link href="/nosotros" color="inherit" underline="hover">Acerca de Nosotros</Link>
              <Link href="/productos" color="inherit" underline="hover">Productos</Link>
              <Link href="/contacto" color="inherit" underline="hover">Contáctanos</Link>
              <Link href="/autores" color="inherit" underline="hover">Autores</Link>
            </Box>
          </Grid>

          {/* Columna 3: Agradecimiento */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              ¡GRACIAS!
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Gracias por ser parte de nuestra historia y por elegirnos como tu tienda de moda.
            </Typography>
          </Grid>

        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center', fontSize: 14 }}>
          © 2025 <strong>Proyecto UTN</strong>. Todos los derechos reservados.<br />
        </Box>
      </Container>
    </Box>
  );
}