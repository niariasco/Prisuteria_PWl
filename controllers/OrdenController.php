<?php
class Orden
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

        // Log incoming data for debugging
        error_log("Datos recibidos para crear orden: " . print_r($data, true));

        if (empty($data)) {
            throw new Exception("No se recibieron datos para crear la orden");
        }

        $camposRequeridos = ['usuario_id', 'subtotal', 'impuestos', 'total', 'metodo_pago', 'direccion_envio'];
        foreach ($camposRequeridos as $campo) {
            if (!isset($data[$campo])) {
                error_log("Campo requerido faltante: " . $campo);
                throw new Exception("Campo requerido faltante: " . $campo);
            }
        }

        $genero = new OrdenModel();
        $orden_id = $genero->create($data);

        if (!$orden_id) {
            error_log("Error: No se generó ID de orden después de la creación");
            throw new Exception("Error al crear la orden - ID no generado");
        }

        error_log("Orden creada exitosamente con ID: " . $orden_id);

        $responseData = [
            "success" => true,
            "message" => "Orden creada exitosamente",
            "data" => [
                "orden_id" => $orden_id,
                "ordenesId" => $orden_id,
                "id" => $orden_id
            ]
        ];
        $response->toJSON($responseData);

    } catch (Exception $e) {
        error_log("Error en orden::create(): " . $e->getMessage());
        handleException($e);
    }
}

}