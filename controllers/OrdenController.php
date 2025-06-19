<?php
class director
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $genero = new OrdenModel();
            $result = $genero->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    public function get($param)
    {
        try {
            $response = new Response();
            $genero = new OrdenModel();
            $result = $genero->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

  public function listarPedidos()
    {
        try {
            $response = new Response();
            $request = new Request();

            $usuarioId = $request->getParam('usuarioId');  
            if (!$usuarioId) throw new Exception("Falta usuarioId");

            $ordenM = new OrdenModel();
            $result = $ordenM->listarPorUsuario($usuarioId);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function detallePedido($id)
    {
        try {
            $response = new Response();
            $ordenM = new OrdenModel();
            $result = $ordenM->detallePedido($id);

            if (!$result) {
                throw new Exception("Orden no encontrada");
            }

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
