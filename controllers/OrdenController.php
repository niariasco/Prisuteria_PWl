<?php
class orden
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
    
public function create($data = null)
{
    try {
        $response = new Response();

        // Si $data no fue pasado, leer del JSON enviado por POST
        if (!$data) {
            $data = json_decode(file_get_contents('php://input'), true);
        }

        if (empty($data)) {
            throw new Exception("No se recibieron datos para crear la orden");
        }

        $camposRequeridos = ['usuario_id', 'subtotal', 'impuestos', 'total', 'metodo_pago', 'direccion_envio'];
        foreach ($camposRequeridos as $campo) {
            if (!isset($data[$campo])) {
                throw new Exception("Campo requerido faltante: " . $campo);
            }
        }

        $genero = new OrdenModel();
        $orden_id = $genero->create($data);

        if (!$orden_id) {
            throw new Exception("Error al crear la orden - ID no generado");
        }

        $response->setResponse(true, "Orden creada exitosamente", [
            "orden_id" => $orden_id,
            "ordenesId" => $orden_id,
            "id" => $orden_id
        ]);
        $response->toJSON();

    } catch (Exception $e) {
        error_log("Error en orden::create(): " . $e->getMessage());
        handleException($e);
    }
}

}