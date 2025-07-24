import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { UserContext } from '../../../context/UserContext';
import ResenaService from '../../../services/ResenaService';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export function FormResena({ productoId, onNuevaResena }) {
  const { decodeToken } = useContext(UserContext);
  const userData = decodeToken(); //  id y nombre del usuario autenticado

  const [comentario, setComentario] = useState('');
  const [valoracion, setValoracion] = useState(0);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (comentario.trim() === '' || valoracion === 0) {
    alert('Por favor, escriba un comentario y seleccione una valoración.');
    return; // Evita que se siga y se intente enviar
  }

  try {
    const resenaData = {
      usuario_id: userData.id,
      producto_id: productoId,
      comentario,
      calificacion: valoracion
    };

    const response = await ResenaService.createResena(resenaData);

    if (response.data) {
      onNuevaResena(response.data);  // Aquí notificas al componente padre
      setComentario('');
      setValoracion(0);
    }
  } catch (error) {
    console.error('Error al guardar reseña', error);
  }
};


  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <TextField
        fullWidth
        label="Tu reseña"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        multiline
        rows={3}
        margin="normal"
      />
      <Rating
        value={valoracion}
        onChange={(e, newValue) => setValoracion(newValue)}
        max={5}
      />
      <Button
        type="submit"
        variant="contained"
        color="secondary"
        sx={{ mt: 2 }}
      >
        Enviar Reseña
      </Button>
    </form>
  );
}

// Validación de props
FormResena.propTypes = {
  productoId: PropTypes.number.isRequired,     // ID del producto que recibe
  onNuevaResena: PropTypes.func.isRequired     // Callback para actualizar reseñas
};
