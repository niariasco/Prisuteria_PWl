<?php
class CarritoController
{
    public function obtenerCarrito()
    {
        try {
            $response = new Response();
            $request = new Request();

            $usuarioId = $request->getParam('usuarioId');
            if (!$usuarioId) throw new Exception("Falta usuarioId");

            $carritoM = new CarritoModel();
            $result = $carritoM->obtenerCarritoPorUsuario($usuarioId);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function agregarProducto()
    {
        try {
            $request = new Request();
            $inputJSON = $request->getJSON();

            $carritoM = new CarritoModel();
            $result = $carritoM->agregarProducto($inputJSON);

            $response = new Response();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Agregar CRUD Manejo de productos en el carrito 
}
