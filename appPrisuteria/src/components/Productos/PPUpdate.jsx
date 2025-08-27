import { useEffect, useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import ProductosPService from "../../services/ProductosPService";
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function PPUpdate() {
  const [opciones, setOpciones] = useState([]);
  const [editando, setEditando] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const { t } = useTranslation();


  const cargarOpciones = async () => {
    try {
      const res = await ProductosPService.getlistados();
      setOpciones(res.data);
    } catch (error) {
      console.error("Error al cargar opciones:", error);
    }
  };
  useEffect(() => {
    cargarOpciones();
  }, []);

  const handleEditar = (opciones) => {
    setEditando(opciones.id);
    setNuevoPrecio(opciones.precio_adicional);
  };

  
const handleGuardar = async (opcion) => {
  try {
    await ProductosPService.updatePrecio({
      id: opcion.id,
      precio_adicional: parseFloat(nuevoPrecio),
    });
    toast.success(t('Precio actualizado correctamente'));
    cargarOpciones(); // refrescar lista
    setEditando(null); 
  } catch (error) {
    console.error("Error al actualizar precio:", error);
    toast.error("Error al actualizar precio");
  }
};



  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t('Criterios y Precios')}
      </Typography>

      {opciones.map((opciones) => (
        <Box
          key={opciones.id}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
            p: 2,
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <Typography sx={{ flex: 1 }}>
            {opciones.nombre} 
             
            ({t('criterio')}: {opciones.criterio_id})
          </Typography>

          {editando === opciones.id ? (
            <>
              <TextField
                type="number"
                label={t('adPrice')}
                size="small"
                value={nuevoPrecio}
                onChange={(e) => setNuevoPrecio(e.target.value)}
              />

<Button
  variant="contained"
  color="success"
  onClick={() => handleGuardar(opciones)}
>
          {t('save')}
</Button>

              <Button
                variant="outlined"
                color="error"
                onClick={() => setEditando(null)}
              >
              {t('cancel')}
              </Button>
            </>
          ) : (
            <>
              <Typography sx={{ minWidth: "120px" }}>
                {opciones.precio_adicional ?? "0.00"}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleEditar(opciones)}
              >
                {t('Edit_1')}
              </Button>
            </>
          )}
        </Box>
      ))}
    </Box>
  );
}
