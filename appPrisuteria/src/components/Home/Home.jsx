/*import React from 'react';*/
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import calidadImg from '/xampp/htdocs/prisuteriapwl/uploads/AretesGummies.png';
import contactoImg from '/xampp/htdocs/prisuteriapwl/uploads/CollarHappyFace.jpg';
import garantiaImg from '/xampp/htdocs/prisuteriapwl/uploads/collargirasol.png';



export function Home() { 
  return ( 
    <Container sx={{ p: 3 }} maxWidth="sm"> 
      <Typography 
        component="h2" 
        variant="h4" 
        align="center" 
        color= '#d83b6a' 
        gutterBottom 
      >Somos Prisuteria Accesorios 
        </Typography> 
      <Typography variant="h7" align="center" color="text.secondary"> 
        Prisutería Accesorios es una PYME dedicada a la creación y venta de bisutería artesanal, Joyeria y accesorios, ofreciendo diseños únicos y personalizados. Nos especializamos en accesorios hechos a mano con materiales de alta calidad, ideales para realzar tu estilo y expresar tu personalidad. Cada pieza está elaborada con amor y atención al detalle, brindando elegancia y originalidad en cada accesorio. 
      </Typography> 

    <Grid container spacing={4} sx={{ mt: 4}}>
        {/* Calidad */}
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <img src={calidadImg} alt="Calidad" style={{ width: '100%', borderRadius: 10 }} />
            <Typography variant="h6" mt={2} sx={{ color: '#d83b6a', fontWeight: 'bold', }}>CALIDAD DURADERA</Typography>
            <Typography variant="body2"   >
              Todas nuestras joyas son de los mejores materiales.
            </Typography>
          </Box>
        </Grid>

        {/* Contacto */}
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <img src={contactoImg} alt="Contacto" style={{ width: '100%', borderRadius: 10 }} />
            <Typography variant="h6" mt={2} sx={{ color: '#d83b6a' , fontWeight: 'bold',}} >CONTACTANOS</Typography>
            <Typography variant="body2">
              Puedes contactarnos 24/7 en redes sociales o WhatsApp.
            </Typography>
          </Box>
        </Grid>

        {/* Garantía */}
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <img src={garantiaImg} alt="Garantía" style={{ width: '100%', borderRadius: 10 }} />
            <Typography variant="h6" mt={2} sx={{ color: '#d83b6a' , fontWeight: 'bold',}} >GARANTÍA</Typography>
            <Typography variant="body2">
              30 días de garantía por cualquier defecto de fábrica.
            </Typography>
          </Box>
        </Grid>
      </Grid>


    </Container> 
  ); 
} 