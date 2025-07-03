// eslint-disable-next-line no-unused-vars
import React from "react";
import { Container, Typography, Grid, IconButton, Link, Box } from "@mui/material";
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export function Footer() {
  return (
    <Box sx={{ backgroundColor: '#ce9fc4', color: 'white', mt: 4, pt: 2, pb: 1 }}>
      <Container maxWidth="md">
        <Grid container spacing={1} justifyContent="space-between" alignItems="flex-start">
          
          {/* Columna 1 */}
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" fontWeight="bold">
              PRISUTERÍA ACCESORIOS
            </Typography>
            <Typography variant="caption">
              Lunes a sábado: 9:00am - 6:00pm
            </Typography>
            <Box sx={{ mt: 1 }}>
              <IconButton size="small" color="inherit" href="https://www.facebook.com/prisuteriaaccesorioscr" target="_blank">
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="inherit" href="https://www.instagram.com/prisuteria_accesorioscr/" target="_blank">
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="inherit" href="https://www.tiktok.com/@prisuteria_accesorioscr" target="_blank">
                <MusicNoteIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="inherit" href="https://api.whatsapp.com/send/?phone=50671914947" target="_blank">
                <WhatsAppIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          {/* Columna 2 */}
          <Grid item xs={12} sm={5}>
            <Typography variant="body1" fontWeight="bold">
              ENLACES
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, mt: 0.5 }}>
              <Link href="/" color="inherit" underline="hover" variant="caption">Inicio</Link>
              <Link href="/nosotros" color="inherit" underline="hover" variant="caption">Nosotros</Link>
              <Link href="/productos" color="inherit" underline="hover" variant="caption">Productos</Link>
              <Link href="/contacto" color="inherit" underline="hover" variant="caption">Contacto</Link>
            </Box>
          </Grid>

        </Grid>

        {/* Créditos */}
        <Box sx={{ mt: 2, textAlign: 'center', fontSize: 12 }}>
          © 2025 <strong>Proyecto UTN</strong>. Todos los derechos reservados.<br />
          <Typography variant="caption">Nicole Arias & Priscilla Sanchez</Typography>
        </Box>
      </Container>
    </Box>
  );
}
