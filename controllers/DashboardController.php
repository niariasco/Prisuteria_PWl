<?php
class dashboard
{
    // Cantidad de ventas por día
    public function ventasPorDia()
    {
        try {
            $response = new Response();
            $model = new DashboardModel();
            $result = $model->ventasPorDia();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Cantidad de ventas por mes
    public function ventasPorMes()
    {
        try {
            $response = new Response();
            $model = new DashboardModel();
            $result = $model->ventasPorMes();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Pedidos clasificados por estado
    public function pedidosPorEstado()
    {
        try {
            $response = new Response();
            $model = new DashboardModel();
            $result = $model->pedidosPorEstado();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Tres productos más vendidos
    public function topProductos()
    {
        try {
            $response = new Response();
            $model = new DashboardModel();
            $result = $model->topProductos();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Tres reseñas más recientes
    public function ultimasResenas()
    {
        try {
            $response = new Response();
            $model = new DashboardModel();
            $result = $model->ultimasResenas();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
