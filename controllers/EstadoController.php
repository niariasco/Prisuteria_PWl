<?php
class EstadoController
{
    // Listar todos los estados de pedido
    public function index()
    {
        try {
            $response = new Response();
            $model = new EstadoModel();

            $result = $model->all();

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Obtener un estado por ID
    public function get($id)
    {
        try {
            $response = new Response();
            $model = new EstadoModel();

            $result = $model->get($id);

            if (!$result) {
                throw new Exception("Estado no encontrado");
            }

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}