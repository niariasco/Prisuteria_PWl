<?php
class ProductoPersonalizadoController
{
    // Listar personalizados de un usuario
    public function personalizadosPorUsuario($usuarioId)
    {
        try {
            $response = new Response();
            $model = new ProductoPersonalizadoModel();

            $result = $model->getPorUsuario($usuarioId);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Crear producto personalizado
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();

            $model = new ProductoPersonalizadoModel();
            $nuevo = $model->create($inputJSON);

            $response->toJSON($nuevo);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Obtener un producto personalizado por ID
    public function get($id)
    {
        try {
            $response = new Response();
            $model = new ProductoPersonalizadoModel();

            $result = $model->get($id);

            if (!$result) {
                throw new Exception("Producto personalizado no encontrado");
            }

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}