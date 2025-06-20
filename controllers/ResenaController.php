<?php
//class Resena
class resena
{
    //Listar en el API
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $Resena = new ResenaModel();
            $result = $Resena->all();
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
            //Instancia del modelo
            $Resena = new ResenaModel();
            //Acción del modelo a ejecutar
            $result = $Resena->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //POST Crear
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $Resena = new ResenaModel($inputJSON);
            //Acción del modelo a ejecutar
            $result = $Resena->create($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    /*
    public function ResenaMonthbyShop()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $Resena = new ResenaModel();
            $result = $Resena->ResenaMonthbyShop();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    public function ResenabyMovie()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $Resena = new ResenaModel();
            $result = $Resena->ResenabyMovie();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
        */
}
