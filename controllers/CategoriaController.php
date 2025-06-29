<?php
class categorias
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $categoria = new CategoriaModel();
            $result = $categoria->all();
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
            $categoria = new CategoriaModel();
            $result = $categoria->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    public function getCategoriaProducto($id)
{
    try {
        $response = new Response();
        $categoria = new CategoriaModel();
        $result = $categoria->getCategoriaProducto($id);
        // Dar respuesta
        $response->toJSON($result);
    } catch (Exception $e) {
        handleException($e);
    }
}

public function getProductosPorCategoria($param)
{
    try {
        $response = new Response();
        $categoria = new CategoriaModel();
        $result = $categoria->getProductosPorCategoria($param);
        // Dar respuesta
        $response->toJSON($result);
    } catch (Exception $e) {
        handleException($e);
    }
}

}
