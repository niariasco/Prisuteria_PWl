import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import PropTypes from 'prop-types';

SelectEtiquetas.propTypes = {
  data: PropTypes.array,
  field: PropTypes.object,
};
export function SelectEtiquetas({ field, data }) {
  return (
    <>
      <>
        <InputLabel id="etiquetas">Etiquetas</InputLabel>
        <Select
          {...field}  
          labelId="etiquetas"
          label="etiquetas"
          multiple
          defaultValue={[]}
          value={field.value}
        >
          {data &&
            data.map((etiquetas) => (
              <MenuItem key={etiquetas.etiquetaId} value={etiquetas.etiquetaId}>
                {etiquetas.nombrEtiquetas}
              </MenuItem>
            ))}
        </Select>
      </>
    </>
  );
}
