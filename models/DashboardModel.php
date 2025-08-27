<?php
class DashboardModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Ventas por día
     */
    public function ventasPorDia()
    {
        try {
            $vSQL = "
                  SELECT DATE(fecha) as dia, COUNT(*) as totalVentas
                FROM ordenes
                GROUP BY DATE(fecha)
                ORDER BY dia DESC
                LIMIT 7
            ";
            return $this->enlace->ExecuteSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Ventas por mes
     */
    public function ventasPorMes()
    {
        try {
            $vSQL = "
                   SELECT DATE_FORMAT(fecha, '%Y-%m') as mes, COUNT(*) as totalVentas
                FROM ordenes
                GROUP BY DATE_FORMAT(fecha, '%Y-%m')
                ORDER BY mes DESC
                LIMIT 12
            ";
            return $this->enlace->ExecuteSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Pedidos clasificados por estado
     */
    public function pedidosPorEstado()
    {
        try {
            $vSQL = "
                SELECT estado, COUNT(*) as total
                FROM ordenes
                GROUP BY estado
            ";
            return $this->enlace->ExecuteSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Top 3 productos más vendidos
     */
    public function topProductos()
    {
        try {
            $vSQL = "
               SELECT p.nombre, SUM(d.cantidad) as totalVentas
                FROM detalle_orden d
                INNER JOIN productos p ON p.productosId = d.producto_id
                GROUP BY p.nombre
                ORDER BY totalVentas DESC
                LIMIT 3
            ";
            return $this->enlace->ExecuteSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Últimas 3 reseñas
     */
    public function ultimasResenas()
    {
        try {
            $vSQL = "
               SELECT r.usuario_id, u.nombre_usuario AS usuarioNombre, r.comentario, r.fecha
FROM resenas r
INNER JOIN usuarios u ON r.usuario_id = u.usuarioId
ORDER BY r.fecha DESC
LIMIT 3
            ";
            return $this->enlace->ExecuteSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
