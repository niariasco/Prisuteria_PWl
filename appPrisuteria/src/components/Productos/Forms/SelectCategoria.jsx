import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

SelectCategoria.propTypes = {
  data: PropTypes.array,
  field: PropTypes.object,
};
export function SelectCategoria({ field, data }) {
    const { t } = useTranslation(); //traduccion 
  
  return (
    <>
      <>
        <InputLabel id="categoria">{t('Fcategory_ProductoMant')}</InputLabel>
<Select
  {...field}
  labelId="categoria"
  label="categoria"
  value={field.value ?? ''} // importante: valor por defecto
>
  {data &&
    data.map((categorias) => (
      <MenuItem key={categorias.categoriaId} value={categorias.categoriaId}>
        {categorias.nombreSCategoria}
      </MenuItem>
    ))}
</Select>
      </>
    </>
  );
}
