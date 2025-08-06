/*import React from 'react';*/
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import calidadImg from '/xampp/htdocs/prisuteriapwl/uploads/AretesGummies.png';
import contactoImg from '/xampp/htdocs/prisuteriapwl/uploads/CollarHappyFace.jpg';
import garantiaImg from '/xampp/htdocs/prisuteriapwl/uploads/collargirasol.png';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Home() { 
  const { t } = useTranslation();

  return ( 
    <Container sx={{ p: 3 }} maxWidth="sm"> 
      <Typography 
        component="h2" 
        variant="h4" 
        align="center" 
        color='#d83b6a' 
        gutterBottom 
      >
        {t('home.title', 'Somos Prisuteria Accesorios')}
      </Typography> 
      <Typography variant="h7" align="center" color="text.secondary"> 
        {t('home.description', 'Prisutería Accesorios es una PYME dedicada a la creación y venta de bisutería artesanal, Joyeria y accesorios, ofreciendo diseños únicos y personalizados. Nos especializamos en accesorios hechos a mano con materiales de alta calidad, ideales para realzar tu estilo y expresar tu personalidad. Cada pieza está elaborada con amor y atención al detalle, brindando elegancia y originalidad en cada accesorio.')}
      </Typography> 

      <Grid container spacing={4} sx={{ mt: 4}}>
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <img src={calidadImg} alt={t('home.features.quality.alt', 'Calidad')} style={{ width: '100%', borderRadius: 10 }} />
            <Typography variant="h6" mt={2} sx={{ color: '#d83b6a', fontWeight: 'bold' }}>
              {t('home.features.quality.title', 'CALIDAD DURADERA')}
            </Typography>
            <Typography variant="body2">
              {t('home.features.quality.description', 'Todas nuestras joyas son de los mejores materiales.')}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <img src={contactoImg} alt={t('home.features.contact.alt', 'Contacto')} style={{ width: '100%', borderRadius: 10 }} />
            <Typography variant="h6" mt={2} sx={{ color: '#d83b6a', fontWeight: 'bold' }}>
              {t('home.features.contact.title', 'CONTACTANOS')}
            </Typography>
            <Typography variant="body2">
              {t('home.features.contact.description', 'Puedes contactarnos 24/7 en redes sociales o WhatsApp.')}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <img src={garantiaImg} alt={t('home.features.warranty.alt', 'Garantía')} style={{ width: '100%', borderRadius: 10 }} />
            <Typography variant="h6" mt={2} sx={{ color: '#d83b6a', fontWeight: 'bold' }}>
              {t('home.features.warranty.title', 'GARANTÍA')}
            </Typography>
            <Typography variant="body2">
              {t('home.features.warranty.description', '30 días de garantía por cualquier defecto de fábrica.')}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Button
        component={Link}
        to="/resena"
        variant="contained"
        sx={{
          backgroundColor: '#d83b6a',
          textTransform: 'none',
          fontSize: '1rem',
          mt: 2,
          '&:hover': {
            backgroundColor: '#b03052',
          },
        }}
      >
        {t('home.reviews_button', 'Lo que opinan Nuestros Clientes')}
      </Button>
    </Container> 
  ); 
}