import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
} from "@mui/material";
import DashboardService from "../../services/DashboardService";

export function Dashboard() {
  const [ventasDia, setVentasDia] = useState([]);
  const [ventasMes, setVentasMes] = useState([]);
  const [pedidosEstado, setPedidosEstado] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [ultimasResenas, setUltimasResenas] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vd, vm, pe, tp, ur] = await Promise.all([
        DashboardService.getVentasPorDia(),
        DashboardService.getVentasPorMes(),
        DashboardService.getPedidosPorEstado(),
        DashboardService.getTopProductos(),
        DashboardService.getUltimasResenas(),
      ]);

      setVentasDia(vd.data);
      setVentasMes(vm.data);
      setPedidosEstado(pe.data);
      setTopProductos(tp.data);
      setUltimasResenas(ur.data);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    }
  };

  return (
    <Grid container spacing={3} sx={{ p: 3 }}>
      {/* Ventas por día */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title={<Typography variant="h6">Ventas por Día</Typography>}
          />
          <CardContent>
            {ventasDia.map((v) => (
              <Typography key={v.dia}>
                {v.dia}: {v.totalVentas} ventas
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Ventas por mes */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title={<Typography variant="h6">Ventas por Mes</Typography>}
          />
          <CardContent>
            {ventasMes.map((v) => (
              <Typography key={v.mes}>
                {v.mes}: {v.totalVentas} ventas
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Pedidos por estado */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title={<Typography variant="h6">Pedidos por Estado</Typography>}
          />
          <CardContent>
            {pedidosEstado.map((p) => (
              <Typography key={p.estado}>
                {p.estado}: {p.total}
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Top 3 productos */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title={<Typography variant="h6">Top 3 Productos</Typography>}
          />
          <CardContent>
            {topProductos.map((p) => (
              <Typography key={p.nombre}>
                {p.nombre}: {p.totalVentas} ventas
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Últimas 3 reseñas */}
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={<Typography variant="h6">Últimas 3 Reseñas</Typography>}
          />
          <CardContent>
            {ultimasResenas.map((r, index) => (
              <Typography key={index}>
                Usuario {r.usuario_id} ({r.fecha}): {r.comentario}
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
