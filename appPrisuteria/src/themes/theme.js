import { createTheme } from '@mui/material/styles'; 
export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#EC407A', // rosado suave
    },
    secondary: {
      main: '#BA68C8', // lila claro
    },
    primaryLight: {
      main: '#EC407A', // rosado suave
      contrastText: '#FFFFFF', // blanco
    }
  },
});