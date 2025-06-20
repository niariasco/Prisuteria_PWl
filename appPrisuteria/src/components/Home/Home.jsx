import React from 'react'; 
import Container from '@mui/material/Container'; 
import Typography from '@mui/material/Typography'; 
export function Home() { 
  return ( 
    <Container sx={{ p: 2 }} maxWidth="sm"> 
      <Typography 
        component="h2" 
        variant="h4" 
        align="center" 
        color="text.primary" 
        gutterBottom 
      > 
Somos Prisuteria Accesorios 
        </Typography> 
      <Typography variant="h7" align="center" color="text.secondary"> 
        Prisutería Accesorios es una PYME dedicada a la creación y venta de bisutería artesanal, Joyeria y accesorios, ofreciendo diseños únicos y personalizados. Nos especializamos en accesorios hechos a mano con materiales de alta calidad, ideales para realzar tu estilo y expresar tu personalidad. Cada pieza está elaborada con amor y atención al detalle, brindando elegancia y originalidad en cada accesorio. 
      </Typography> 
    </Container> 
  ); 
} 