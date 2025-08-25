import { useState, useEffect } from 'react';
import { TextField, Button, Box } from '@mui/material';
import PropTypes from 'prop-types';
import EtiquetasService from '../../../services/EtiquetasService';
import { toast } from 'react-hot-toast';

export function FormEtiquetas({ etiqueta, onClose, onSuccess }) {
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    if (etiqueta) {
      setNombre(etiqueta.nombrEtiquetas || '');
    }
  }, [etiqueta]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error('El nombre de la etiqueta es obligatorio');
      return;
    }

    try {
      if (etiqueta && etiqueta.etiquetaId) {
        // 🔹 Update
        await EtiquetasService.update({
          etiquetaId: etiqueta.etiquetaId,
          nombrEtiquetas: nombre,
        });
        toast.success('Etiqueta actualizada correctamente');
      } else {
        // 🔹 Create
        await EtiquetasService.create({ nombrEtiquetas: nombre });
        toast.success('Etiqueta creada correctamente');
      }
      onSuccess(); // refresca la lista
      onClose();   // cierra modal o formulario
    } catch (error) {
      console.error('Error al guardar etiqueta:', error);
      toast.error('Error al guardar etiqueta');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <TextField
        label="Nombre de la Etiqueta"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button type="submit" variant="contained" color="primary">
          {etiqueta && etiqueta.etiquetaId ? 'Actualizar Etiqueta' : 'Crear Etiqueta'}
        </Button>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}

// PropTypes
FormEtiquetas.propTypes = {
  etiqueta: PropTypes.shape({
    etiquetaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nombrEtiquetas: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
