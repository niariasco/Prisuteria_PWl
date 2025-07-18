<?php
//localhost:81/apiproducto/producto
//localhost:81/apiprisuteria/producto
class etiquetas
{
    //GET listar
    public function index()
    {
        try {
            $response = new Response();
            //Instancia modelo
            $productoM = new EstiquetasModel();
            //Método del modelo
            $result = $productoM->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}