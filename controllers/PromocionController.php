<?php
class promocion
{
    public function index()
    {
        try {
            $response = new Response();
            //Obtener el listado del Modelo
            $promo = new PromocionModel();
            $result = $promo->all();
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
            $promo = new PromocionModel();
            $result = $promo->get($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    public function todasLasPromocionesConNombre()
{
    try {
         $promo = new PromocionModel();
        $resultado = $promo->getTodasLasPromocionesConNombreAplicado();

        echo json_encode([
            'status' => 'success',
            'data' => $resultado
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
}

public function create()
{
    try{
        $response = new Response();
    $request = new Request();

    // Obtener el JSON enviado por el frontend
    $inputJSON = $request->getJSON();

    // Instanciar modelo y crear producto
    $producto = new PromocionModel();
    $result = $producto->create($inputJSON);

    // Devolver la respuesta como JSON
    $response->toJSON($result);


    }catch(Exception $e){
         handleException($e);

    }




}

//PUT actualizar
   public function update($id)
{
    $request = new Request();
    $response = new Response();
    
    $inputJSON = $request->getJSON();
    $inputJSON->id = $id;
    
    $promocionModel = new PromocionModel();
    $result = $promocionModel->update($inputJSON);
    
    $response->toJSON([
        'success' => true,
        'message' => 'Promoción actualizada correctamente',
        'data' => $result
    ]);
}
    
    /*
    public function getActorMovie($id)
    {
        try {
            $response = new Response();
            $promo = new PromocionModel();
            $result = $promo->get($id);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    */
}
