import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TextField, Autocomplete } from '@mui/material';
//import { toast } from 'react-hot-toast';
//import EtiquetasService from '../../../services/EtiquetasService';

export function SelectEtiquetas({ field, data,  }) { //setData
  const [options, setOptions] = useState(data || []);
  const [inputValue, setInputValue] = useState('');

  // Mantener sincronizado con cambios en props.data
  useEffect(() => {
    setOptions(data);
  }, [data]);

  

  return (
    <div>
      <Autocomplete
        multiple
        options={options}
        getOptionLabel={(option) => option.nombrEtiquetas}
        value={options.filter(opt => (field.value || []).includes(opt.etiquetaId))}
        onChange={(e, newValue) => field.onChange(newValue.map(v => v.etiquetaId))}
        inputValue={inputValue}
        onInputChange={(e, newInputValue) => setInputValue(newInputValue)}
        renderInput={(params) => <TextField {...params} label="Etiquetas" />}
        isOptionEqualToValue={(option, value) => option.etiquetaId === value.etiquetaId}
      />
      
    </div>
  );
}

SelectEtiquetas.propTypes = {
  field: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  setData: PropTypes.func,
};

/*
/ Crear nueva etiqueta
  const handleCreate = async () => {
    const nombre = inputValue.trim();
    if (!nombre) return;

    // Verificar que no exista ya
    if (options.some(opt => opt.nombrEtiquetas.toLowerCase() === nombre.toLowerCase())) {
      toast.error('La etiqueta ya existe');
      return;
    }

    try {
      const res = await EtiquetasService.createResena({ nombrEtiquetas: nombre });
      const nuevaEtiqueta = { etiquetaId: res.data.etiquetaId, nombrEtiquetas: nombre };

      // Actualizar lista local de etiquetas
      const nuevaLista = [...options, nuevaEtiqueta];
      setOptions(nuevaLista);
      setData && setData(nuevaLista);

      // Seleccionar automáticamente la nueva etiqueta
      const nuevoValor = [...(field.value || []), nuevaEtiqueta.etiquetaId];
      field.onChange(nuevoValor);

      setInputValue(''); // limpiar input
      toast.success('Etiqueta creada');
    } catch (err) {
      console.error(err);
      toast.error('Error creando etiqueta');
    }
  };
*/