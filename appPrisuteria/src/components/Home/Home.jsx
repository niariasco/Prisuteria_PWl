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
import Slider from 'react-slick';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import { Info, AccountCircle } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import PropTypes from 'prop-types';

Home.propTypes = {
  data: PropTypes.array.isRequired
};

export function Home({ data }) { 
  const { t } = useTranslation();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    responsive: [
      { breakpoint: 960, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } }
    ]
  };

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
    <Slider {...settings}>
      {data && data.map((resena) => (
        <Box key={resena.resenasId} sx={{ px: 1 }}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: 6,
            background: 'linear-gradient(145deg, #ffffff, #fff0f5)',
          }}>
            <CardHeader
              avatar={<AccountCircle sx={{ fontSize: 40, color: '#f06292' }} />}
              title={
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f06292' }}>
                  {resena.nombre_usuario}
                </Typography>
              }
              sx={{
                background: 'linear-gradient(135deg, #f8bbd0, #ffc1e3)',
                color: '#fff',
                textAlign: 'center',
                py: 2,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16
              }}
            />
            <CardContent sx={{ minHeight: 230 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#d83b6a', mb: 0.5 }}>
                Producto:
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {resena.nombre}
              </Typography>

              <Divider sx={{ my: 1, borderColor: '#f8bbd0' }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#d83b6a', mb: 0.5 }}>
                Comentario:
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontStyle: 'italic' }}>
               {resena.comentario}
              </Typography>

              <Divider sx={{ my: 1, borderColor: '#f8bbd0' }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#d83b6a', mb: 0.5 }}>
                Valoración:
              </Typography>
              <Rating value={resena.calificacion || 0} max={5} precision={0.5} readOnly sx={{ color: '#f06292' }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <IconButton
                  component={Link}
                  to={`/resena/${resena.resenasId}`}
                  aria-label="Detalle"
                  sx={{
                    color: '#fff',
                    backgroundColor: '#f06292',
                    borderRadius: 2,
                  }}
                >
                  <Info />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Slider>



    </Container> 
  ); 
}