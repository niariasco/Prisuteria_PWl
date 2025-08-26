<?php
//localhost:81/prisuteriapwl/etiquetas
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

  public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $producto = new EstiquetasModel();
            //Acción del modelo a ejecutar
            $result = $producto->update($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}