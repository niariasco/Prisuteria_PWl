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
     e.stopPropagation();
    if (!nombre.trim()) {
      toast.error('El nombre de la etiqueta es obligatorio');
      return;
    }

    try {
      if (etiqueta && etiqueta.etiquetaId) {
        await EtiquetasService.update({
          etiquetaId: etiqueta.etiquetaId,
          nombrEtiquetas: nombre,
        });
        toast.success('Etiqueta actualizada correctamente');
      } else {
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
 <Box component="div" sx={{ p: 2 }} onClick={(e) => e.stopPropagation()}>
    <TextField
      label="Nombre de la Etiqueta"
      value={nombre}
      onChange={(e) => setNombre(e.target.value)}
      fullWidth
      required
      sx={{ mb: 2 }}
      onKeyDown={(e) => {
        // Evita que Enter dispare un submit global
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }
      }}
    />
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      {/* 👇 botón explícito, no submit */}
      <Button type="button" variant="contained" color="primary" onClick={handleSubmit}>
        {etiqueta?.etiquetaId ? 'Actualizar Etiqueta' : 'Crear Etiqueta'}
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
