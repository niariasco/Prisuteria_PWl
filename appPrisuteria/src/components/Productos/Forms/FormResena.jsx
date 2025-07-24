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

    const usuarioId = userData?.usuarioId || userData?.id;
    if (!usuarioId) {
      setError('Error: Usuario no autenticado correctamente.');
      return;
    }

    setLoading(true);

    try {
      const resenaData = {
        usuario_id: usuarioId,
        producto_id: productoId,
        comentario: comentario.trim(),
        calificacion: valoracion
      };

      const response = await ResenaService.createResena(resenaData);
      
      if (response.data && response.data.status === 'success') {
        onNuevaResena(response.data.nuevaResena, response.data.promedioValoracion);
        setComentario('');
        setValoracion(0);
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
      
      {/* Campos igual que tu implementación actual */}
      <TextField
        fullWidth
        label="Usuario"
        value={userData?.nombre || userData?.email || 'Usuario'}
        InputProps={{ readOnly: true }}
        margin="normal"
        variant="outlined"
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Fecha"
        value={new Date().toLocaleDateString()}
        InputProps={{ readOnly: true }}
        margin="normal"
        variant="outlined"
        sx={{ mb: 2 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Tu reseña *"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        multiline
        rows={4}
        margin="normal"
        variant="outlined"
        sx={{ mb: 2 }}
      />

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
      </Box>

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