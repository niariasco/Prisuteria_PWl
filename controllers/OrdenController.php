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
    
    public function create($data)
    {
        try {
            $response = new Response();
            
            // Debug: Log de los datos recibidos
            error_log("Datos recibidos en create: " . json_encode($data));
            
            // Verificar que se recibieron los datos necesarios
            if (empty($data)) {
                throw new Exception("No se recibieron datos para crear la orden");
            }
            
            // Verificar campos requeridos
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
            
            // Debug: Log del ID generado
            error_log("Orden creada con ID: " . $orden_id);
            
            $response->setResponse(true, "Orden creada exitosamente", [
                "orden_id" => $orden_id,
                "ordenesId" => $orden_id, // Para compatibilidad
                "id" => $orden_id
            ]);
            $response->toJSON();
            
        } catch (Exception $e) {
            error_log("Error en orden::create(): " . $e->getMessage());
            handleException($e);
        }
    }
}