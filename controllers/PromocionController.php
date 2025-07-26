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
//PUT actualizar
public function update($id)
{
    try {
        $request = new Request();
        $response = new Response();
        
        $inputJSON = $request->getJSON();
        
        // Validar que se reciba el JSON
        if (!$inputJSON) {
            $response->toJSON([
                'success' => false,
                'message' => 'No se recibieron datos válidos',
                'data' => null
            ], 400);
            return;
        }
        
        // Asegurar que el ID esté presente
        $inputJSON->id = $id;
        
        // Validar que el ID sea numérico
        if (!is_numeric($id)) {
            $response->toJSON([
                'success' => false,
                'message' => 'ID de promoción inválido',
                'data' => null
            ], 400);
            return;
        }
        
        $promocionModel = new PromocionModel();
        $result = $promocionModel->update($inputJSON);
        
        if ($result) {
            $response->toJSON([
                'success' => true,
                'message' => 'Promoción actualizada correctamente',
                'data' => $result
            ]);
        } else {
            $response->toJSON([
                'success' => false,
                'message' => 'No se pudo actualizar la promoción',
                'data' => null
            ], 500);
        }
    } catch (Exception $e) {
        $response->toJSON([
            'success' => false,
            'message' => 'Error interno del servidor: ' . $e->getMessage(),
            'data' => null
        ], 500);
    }
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
