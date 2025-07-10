import { useEffect, useState } from 'react';
import {
  Button, FormControl, FormHelperText, Grid, TextField,
  Typography, Select, MenuItem, InputLabel
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ProductoService from '../../services/ProductoService';
import ImageService from '../../services/ImageService';
import CategoriaService from '../../services/CategoriaService';
import EtiquetasService from '../../services/EtiquetasService';

export function CreateProducto() {
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [previewURLs, setPreviewURLs] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);

  // Validación Yup
  const schema = yup.object({
    nombre: yup.string().required('Nombre requerido'),
    descripcion: yup.string().required('Descripción requerida'),
    precio: yup.number().typeError('Debe ser un número').required('Precio requerido'),
    inventario: yup.number().typeError('Debe ser un número').required('Inventario requerido'),
    categoria_id: yup.number().required('Seleccione una categoría'),
    etiquetas: yup.array().of(yup.number()).min(1, 'Seleccione al menos una etiqueta'),
  });

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      precio: '',
      inventario: '',
      categoria_id: '',
      etiquetas: [],
      es_personalizable: false,
    },
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    CategoriaService.getCategoria()
      .then(res => {
        setCategorias(res.data);
      })
      .catch(err => {
        console.error("Error al cargar categorías:", err);
        toast.error("No se pudieron cargar las categorías");
      });

    EtiquetasService.getEtiqueta()
      .then(res => {
        setEtiquetas(res.data);
      })
      .catch(err => {
        console.error("Error al cargar etiquetas:", err);
        toast.error("No se pudieron cargar las etiquetas");
      });
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFileList(files);
    setPreviewURLs(files.map(file => URL.createObjectURL(file)));
  };

  const onSubmit = async (dataForm) => {
    try {
      // Preparar los datos del producto incluyendo las etiquetas
      const productoData = {
        nombre: dataForm.nombre,
        descripcion: dataForm.descripcion,
        precio: parseFloat(dataForm.precio),
        inventario: parseInt(dataForm.inventario),
        categoria_id: parseInt(dataForm.categoria_id),
        es_personalizable: dataForm.es_personalizable ? 1 : 0,
        etiquetas: dataForm.etiquetas // Incluir las etiquetas en el objeto
      };

      console.log("Datos del producto a enviar:", productoData);

      // Crear el producto - Asegúrate de que la URL sea correcta
      const res = await ProductoService.createProducto(productoData);
      const idProducto = res.data.productosId || res.data.id;

      // Subir imágenes si existen
      if (fileList.length > 0) {
        const formData = new FormData();
        fileList.forEach((file) => formData.append('files[]', file));
        formData.append('producto_id', idProducto);
        await ImageService.createImages(formData);
      }

      toast.success('Producto creado correctamente');
      navigate('/productos');
    } catch (err) {
      toast.error('Error al crear el producto');
      console.error("Error en creación de producto:", err);
      console.error("Detalles del servidor:", err.response?.data || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5">Crear Producto</Typography>
        </Grid>

        <Grid item xs={6}>
          <Controller name="nombre" control={control}
            render={({ field }) => (
              <TextField {...field} label="Nombre" fullWidth
                error={Boolean(errors.nombre)} helperText={errors.nombre?.message} />
            )} />
        </Grid>

        <Grid item xs={6}>
          <Controller name="precio" control={control}
            render={({ field }) => (
              <TextField {...field} label="Precio" fullWidth type="number"
                error={Boolean(errors.precio)} helperText={errors.precio?.message} />
            )} />
        </Grid>

        <Grid item xs={12}>
          <Controller name="descripcion" control={control}
            render={({ field }) => (
              <TextField {...field} label="Descripción" fullWidth multiline rows={4}
                error={Boolean(errors.descripcion)} helperText={errors.descripcion?.message} />
            )} />
        </Grid>

        <Grid item xs={6}>
          <Controller name="inventario" control={control}
            render={({ field }) => (
              <TextField {...field} label="Inventario" fullWidth type="number"
                error={Boolean(errors.inventario)} helperText={errors.inventario?.message} />
            )} />
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth error={Boolean(errors.categoria_id)}>
            <InputLabel id="categoria-label">Categoría</InputLabel>
            <Controller
              name="categoria_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="categoria-label"
                  id="categoria_id"
                  label="Categoría"
                >
                  {categorias.map((cat) => (
                    <MenuItem key={cat.categoriaId} value={cat.categoriaId}>
                      {cat.nombreSCategoria}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText>{errors.categoria_id?.message}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={Boolean(errors.etiquetas)}>
            <InputLabel id="etiquetas-label">Etiquetas</InputLabel>
            <Controller
              name="etiquetas"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="etiquetas-label"
                  id="etiquetas"
                  multiple
                  value={field.value}
                  onChange={field.onChange}
                  renderValue={(selected) =>
                    etiquetas
                      .filter((etiqueta) => selected.includes(etiqueta.etiquetaId))
                      .map((e) => e.nombrEtiquetas)
                      .join(', ')
                  }
                >
                  {etiquetas.map((etiqueta) => (
                    <MenuItem key={etiqueta.etiquetaId} value={etiqueta.etiquetaId}>
                      {etiqueta.nombrEtiquetas}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText>{errors.etiquetas?.message}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <label htmlFor="imagenes">Imágenes</label>
            <input multiple type="file" id="imagenes" onChange={handleFileChange} />
            <Grid container spacing={1}>
              {previewURLs.map((src, i) => (
                <Grid item key={i}>
                  <img src={src} width={100} alt="preview" />
                </Grid>
              ))}
            </Grid>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            Guardar
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}