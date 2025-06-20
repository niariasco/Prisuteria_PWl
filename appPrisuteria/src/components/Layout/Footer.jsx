// eslint-disable-next-line no-unused-vars
import React from "react"; 
import { Container, Typography } from "@mui/material"; 
import Grid from "@mui/material/Grid2"; 
import Toolbar from "@mui/material/Toolbar"; 
export function Footer() { 
  return ( 
    <Toolbar 
      sx={{ 
        px: 2, 
        position: "fixed", 
        bottom: 0, 
        width: "100%", 
        height: "4.5rem", 
        backgroundColor: "primary.main", 
        paddingTop: "1rem", 
        paddingBottom: "1rem", 
      }} 
    > 
      {/* Comentario */} 
      <Container> 
        <Grid container rowSpacing={1}> 
          <Grid size={12}> 
            <Typography align="center" color="white" variant="subtitle1"> 
© 2025 Proyecto UTN. Todos los derechos reservados.
            </Typography> 
          </Grid> 
          <Grid size={12}> 
            <Typography align="center" color="#FFFFFF" variant="body1"> 
              Diseñado por Priscilla & Nicole
            </Typography> 
          </Grid> 
        </Grid> 
      </Container> 
    </Toolbar> 
  ); 
} 
