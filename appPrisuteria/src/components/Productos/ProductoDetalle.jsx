import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductoService from "../../services/ProductoService";
import ProductoPService from "../../services/ProductoPService";
import { Typography, Box, Button } from "@mui/material";

function DetalleProductos() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [opciones, setOpciones] = useState([]); // Ejemplo: [{ opcionId: 1, valor: "rojo" }]
  const [precioTotal, setPrecioTotal] = useState(0);

  // Cargar producto base
  useEffect(() => {
    ProductoService.getProductoById(id).then((data) => {
      setProducto(data);
      setPrecioTotal(data.precio); // precio inicial
    });
  }, [id]);

  // Cada vez que cambian las opciones recalculamos
  useEffect(() => {
    if (!producto) return;

    ProductoPService.calcularPrecioTotal(producto.productoId, opciones)
      .then((res) => {
        setPrecioTotal(res.precioTotal); // <- el backend debe devolver { precioTotal }
      })
      .catch((err) => {
        console.error("Error recalculando precio:", err);
      });
  }, [opciones, producto]);

  // Handler para cuando el usuario selecciona algo
  const handleSeleccion = (nuevaOpcion) => {
    setOpciones((prev) => [...prev, nuevaOpcion]);
  };

  if (!producto) return <p>Cargando...</p>;

  return (
    <Box>
      <Typography variant="h4">{producto.nombre}</Typography>
      <Typography variant="body1">{producto.descripcion}</Typography>

      {/* Mostrar precio dinámico */}
      <Typography variant="h5" sx={{ fontWeight: "bold", color: "#d83b6a", mt: 2 }}>
        Precio total: ₡ {precioTotal}
      </Typography>

      {/* Botón de ejemplo para agregar opción */}
      <Button onClick={() => handleSeleccion({ opcionId: 1, valor: "extra" })}>
        Agregar extra
      </Button>
    </Box>
  );
}

export default DetalleProductos;
