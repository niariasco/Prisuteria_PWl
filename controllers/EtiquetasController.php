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

 public function get($param)
    {

        try {
            $response = new Response();
            //Instancia del modelo
            $Resena = new EstiquetasModel();
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
        $resenaModel = new EstiquetasModel();
        $result = $resenaModel->create($data);

        $response->toJSON($result);
    }


}