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
import { useTranslation } from 'react-i18next';

export function FormResena({ productoId, onNuevaResena }) {
  const { decodeToken } = useContext(UserContext);
  const userData = decodeToken();
  const { t } = useTranslation(); //traduccion 
  const [comentario, setComentario] = useState('');
  const [valoracion, setValoracion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
//traduccion

    if (comentario.trim() === '' || valoracion === 0) {
      setError(t('FUser_Review'));
      return;
    }

    const usuarioId = userData?.usuarioId || userData?.id;
    if (!usuarioId) {
      setError(t('FErrorUsuariio_Review'));
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
        setError(response.data?.message ||(t('FError_Review')));
      }
    } catch (error) {
      console.error('Error al guardar reseña:', error);
      setError(t('FError_Review'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('FWrite_Review')}
      </Typography>
      
      {/* Campos igual que tu implementación actual */}
      <TextField
        fullWidth
        label={t('FUser_Review')}
        value={userData?.nombre || userData?.email }
        InputProps={{ readOnly: true }}
        margin="normal"
        variant="outlined"
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label={t('FDate_Review')}
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
        label={t('FYour_Review')}
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
         {t('FRate_Review')}
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
        {loading ? t('FSaving_Review') : t('FSend_Review')}
      </Button>
    </Box>
  );
}

FormResena.propTypes = {
  productoId: PropTypes.number.isRequired,
  onNuevaResena: PropTypes.func.isRequired
};