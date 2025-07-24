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
 public function create() {
        $response = new Response();
        $request = new Request();

        $data = $request->getJSON();  
        $resenaModel = new ResenaModel();
        $result = $resenaModel->create($data);

        $response->toJSON($result);
    }
    public function porProducto($productoId) {
   
        try {
            $response = new Response();
            //Instancia del modelo
            $movie = new ResenaModel();
            //Acción del modelo a ejecutar
            $result = $movie->getByProducto($productoId);
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
