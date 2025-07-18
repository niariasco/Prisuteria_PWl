import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import PropTypes from 'prop-types';

SelectEtiquetas.propTypes = {
  data: PropTypes.array,
  field: PropTypes.object,
  error: PropTypes.bool,
};

export function SelectEtiquetas({ field, data, error }) {
  return (
    <FormControl fullWidth margin="normal" error={error}>
      <InputLabel id="etiquetas-label">Etiquetas</InputLabel>
      <Select
        {...field}
        labelId="etiquetas-label"
        label="Etiquetas"
        multiple
        value={field.value || []}
        defaultValue={[]}
      >
        {data &&
          data.map((etiqueta) => (
            <MenuItem key={etiqueta.etiquetaId} value={etiqueta.etiquetaId}>
              {etiqueta.nombrEtiquetas}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
}
