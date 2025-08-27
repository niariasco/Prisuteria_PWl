import DashboardService from "../../services/DashboardService";
import { List, ListItem, ListItemText } from "@mui/material";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
} from "@mui/material";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTranslation } from 'react-i18next';

const COLORS = ["#d219a4ff", "#c287d7ff", "rgba(97, 0, 29, 1)", "#b30fefff", "#b40fa6ff"];

export function Dashboard() {
  const [ventasDia, setVentasDia] = useState([]);
  const [ventasMes, setVentasMes] = useState([]);
  const [pedidosEstado, setPedidosEstado] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [ultimasResenas, setUltimasResenas] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
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

        // Pedidos por Estado: convertir total a número
        const pedidosData = pe.data.map(item => ({
          ...item,
          total: Number(item.total),
        }));
        setPedidosEstado(pedidosData);

        setTopProductos(tp.data);

        // Últimas Reseñas: agregar label y longitud
        const resenasData = ur.data.map((item, index) => ({
          ...item,
          label: `Reseña ${index + 1}`,
          comentarioLength: item.comentario.length,
        }));
        setUltimasResenas(resenasData);

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Grid container spacing={3} sx={{ p: 3 }}>
      {/* Ventas por Día */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title={<Typography variant="h6">{t('VxD')}</Typography>} />
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ventasDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalVentas" fill="#b40fa6ff" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Ventas por Mes */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title={<Typography variant="h6">{t('VxM')}</Typography>} />
          <CardContent>
            <ResponsiveContainer width="90%" height={500}>
              <BarChart data={ventasMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalVentas" fill="#c287d7ff" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Pedidos por Estado */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title={<Typography variant="h6">{t('PxE')}</Typography>} />
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pedidosEstado}
                  dataKey="total"
                  nameKey="estado"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pedidosEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Top 3 Productos */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title={<Typography variant="h6">{t('T3')}</Typography>} />
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart layout="vertical" data={topProductos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nombre" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalVentas" fill="#b30fefff" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

    {/* Últimas 3 Reseñas */}
<Grid item xs={12}>
  <Card>
    <CardHeader title={<Typography variant="h6">{t('LR')}</Typography>} />
    <CardContent>
      <List>
        {ultimasResenas.map((resena, index) => (
          <ListItem key={index} divider>
            <ListItemText
          
              primary={`${t('FUser_Review')}: ${resena.usuarioNombre} - ${new Date(resena.fecha).toLocaleDateString()}`}
              secondary={resena.comentario.length > 100 
                ? resena.comentario.substring(0, 100) + "..." 
                : resena.comentario
              }
            />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
</Grid>
    </Grid>
  );
}