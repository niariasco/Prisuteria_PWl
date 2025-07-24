import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { UserContext } from '../../../context/UserContext';
import ResenaService from '../../../services/ResenaService';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

export function FormResena({ productoId, onNuevaResena }) {
  const { decodeToken } = useContext(UserContext);
  const userData = decodeToken();
  
  const [comentario, setComentario] = useState('');
  const [valoracion, setValoracion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (comentario.trim() === '' || valoracion === 0) {
      setError('Por favor, escriba un comentario y seleccione una valoración.');
      return;
    }

    // Debug: verificar datos del usuario
    console.log('userData completo:', userData);
    console.log('userData.id:', userData?.id);
    console.log('userData.usuarioId:', userData?.usuarioId);

    if (!userData || (!userData.id && !userData.usuarioId)) {
      setError('Error: Usuario no autenticado correctamente.');
      return;
    }

    setLoading(true);

    try {
      const resenaData = {
        usuario_id: userData.usuarioId || userData.id, // Usar usuarioId si existe, sino id
        producto_id: productoId,
        comentario: comentario.trim(),
        calificacion: valoracion
      };

      console.log('Datos a enviar al backend:', resenaData);

      const response = await ResenaService.createResena(resenaData);
      
      console.log('Respuesta del servidor:', response); // Para debug

      if (response.data && response.data.status === 'success') {
        // Llamar al callback con ambos parámetros
        onNuevaResena(response.data.nuevaResena, response.data.promedioValoracion);
        
        // Limpiar el formulario
        setComentario('');
        setValoracion(0);
        
        // Mostrar mensaje de éxito
        alert('Reseña guardada exitosamente');
      } else {
        setError(response.data?.message || 'Error al guardar la reseña');
      }
    } catch (error) {
      console.error('Error al guardar reseña:', error);
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Escribir una reseña
      </Typography>
      
      {/* Campo de usuario (solo lectura) */}
      <TextField
        fullWidth
        label="Usuario"
        value={userData?.nombre || 'Usuario'}
        InputProps={{
          readOnly: true,
        }}
        margin="normal"
        variant="outlined"
        sx={{ mb: 2 }}
      />
      
      {/* Campo de fecha (solo lectura) */}
      <TextField
        fullWidth
        label="Fecha"
        value={new Date().toLocaleDateString()}
        InputProps={{
          readOnly: true,
        }}
        margin="normal"
        variant="outlined"
        sx={{ mb: 2 }}
      />

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Comentario */}
      <TextField
        fullWidth
        label="Tu reseña *"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        multiline
        rows={4}
        margin="normal"
        variant="outlined"
        placeholder="Escribe tu opinión sobre este producto..."
        sx={{ mb: 2 }}
      />

      {/* Valoración con estrellas */}
      <Box sx={{ mb: 2 }}>
        <Typography component="legend" sx={{ mb: 1 }}>
          Valoración *
        </Typography>
        <Rating
          value={valoracion}
          onChange={(e, newValue) => setValoracion(newValue)}
          max={5}
          size="large"
        />
        {valoracion > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {valoracion} de 5 estrellas
          </Typography>
        )}
      </Box>

      {/* Botón enviar */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? 'Guardando...' : 'Enviar Reseña'}
      </Button>
    </Box>
  );
}

FormResena.propTypes = {
  productoId: PropTypes.number.isRequired,
  onNuevaResena: PropTypes.func.isRequired
};