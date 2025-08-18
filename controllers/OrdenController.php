<?php
// Incluir el manejador de CORS


class Orden
{
    // === LISTAR TODAS LAS ÓRDENES ===
    public function index()
    {
        try {
            $response = new Response();
            $orden = new OrdenModel();
            $result = $orden->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    // === OBTENER ORDEN POR ID ===
    public function get($param)
    {
        try {
            $response = new Response();
            $orden = new OrdenModel();
            $result = $orden->get($param);
            $response->toJSON($result);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    // === CREAR NUEVA ORDEN ===
    public function create()
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            // Verificar que se recibieron datos
            if (empty($data)) {
                throw new Exception("No se recibieron datos para crear la orden");
            }
            
            // Debug: Log de los datos recibidos
            error_log("Datos recibidos para crear orden: " . print_r($data, true));
            
            $response = new Response();
            $orden = new OrdenModel();

            $id = $orden->create($data); // Retorna el ID insertado
            
            // Respuesta con formato consistente
            $response->toJSON([
                "success" => true, 
                "id" => $id,
                "data" => ["id" => $id]
            ]);

        } catch (Exception $e) {
            error_log("Error creando orden: " . $e->getMessage());
            $this->handleException($e);
        }
    }

    // === ACTUALIZAR ORDEN ===
    public function update($param)
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            // Verificar que se recibieron datos
            if (empty($data)) {
                throw new Exception("No se recibieron datos para actualizar la orden");
            }
            
            // Debug: Log de los datos recibidos
            error_log("Actualizando orden $param con datos: " . print_r($data, true));
            
            $response = new Response();
            $orden = new OrdenModel();

            $orden->update($param, $data);
            $response->toJSON(["success" => true]);

        } catch (Exception $e) {
            error_log("Error actualizando orden: " . $e->getMessage());
            $this->handleException($e);
        }
    }

    // === ELIMINAR ORDEN ===
    public function delete($param)
    {
        try {
            $response = new Response();
            $orden = new OrdenModel();
            $orden->delete($param);
            $response->toJSON(["success" => true]);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    // === CREAR PAGO CON TARJETA ===
    public function createPagoTarjeta()
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            // Verificar que se recibieron datos
            if (empty($data)) {
                throw new Exception("No se recibieron datos para el pago con tarjeta");
            }
            
            // Debug: Log de los datos recibidos
            error_log("Datos recibidos para pago tarjeta: " . print_r($data, true));
            
            $response = new Response();
            $pago = new OrdenPagoTarjetaModel();

            $id = $pago->insert($data);
            $response->toJSON(["success" => true, "pago_id" => $id]);

        } catch (Exception $e) {
            error_log("Error creando pago tarjeta: " . $e->getMessage());
            $this->handleException($e);
        }
    }

    // === OBTENER PAGO TARJETA POR ORDEN ===
    public function getPagoTarjeta($ordenId)
    {
        try {
            $response = new Response();
            $pago = new OrdenPagoTarjetaModel();

            $result = $pago->getByOrden($ordenId);
            $response->toJSON($result);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    // === CREAR PAGO EN EFECTIVO ===
    public function createPagoEfectivo()
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            // Verificar que se recibieron datos
            if (empty($data)) {
                throw new Exception("No se recibieron datos para el pago en efectivo");
            }
            
            // Debug: Log de los datos recibidos
            error_log("Datos recibidos para pago efectivo: " . print_r($data, true));
            
            $response = new Response();
            $pago = new OrdenPagoEfectivoModel();

            $id = $pago->insert($data);
            $response->toJSON(["success" => true, "pago_id" => $id]);

        } catch (Exception $e) {
            error_log("Error creando pago efectivo: " . $e->getMessage());
            $this->handleException($e);
        }
    }

    // === OBTENER PAGO EFECTIVO POR ORDEN ===
    public function getPagoEfectivo($ordenId)
    {
        try {
            $response = new Response();
            $pago = new OrdenPagoEfectivoModel();

            $result = $pago->getByOrden($ordenId);
            $response->toJSON($result);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    private function handleException($e)
    {
        error_log("Exception: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error" => $e->getMessage(),
            "timestamp" => date('Y-m-d H:i:s')
        ]);
        exit;
    }
}

// === MANEJO DE RUTAS ===
try {
    $orden = new Orden();
    
    // Obtener la acción y parámetros desde URL o query params
    $request_uri = $_SERVER['REQUEST_URI'];
    $path = parse_url($request_uri, PHP_URL_PATH);
    $path_parts = explode('/', trim($path, '/'));
    
    // Buscar el índice de 'orden' en el path
    $orden_index = array_search('orden', $path_parts);
    
    if ($orden_index !== false && isset($path_parts[$orden_index + 1])) {
        $action = $path_parts[$orden_index + 1];
        $id = isset($path_parts[$orden_index + 2]) ? $path_parts[$orden_index + 2] : null;
    } else {
        $action = $_GET['action'] ?? '';
        $id = $_GET['id'] ?? null;
    }

    error_log("Action: $action, ID: $id, Method: " . $_SERVER['REQUEST_METHOD']);

    switch ($action) {
        case 'index':
            $orden->index();
            break;
        case 'get':
            if ($id) {
                $orden->get($id);
            } else {
                throw new Exception("ID requerido para obtener orden");
            }
            break;
        case 'create':
            $orden->create();
            break;
        case 'update':
            if ($id) {
                $orden->update($id);
            } else {
                throw new Exception("ID requerido para actualizar orden");
            }
            break;
        case 'delete':
            if ($id) {
                $orden->delete($id);
            } else {
                throw new Exception("ID requerido para eliminar orden");
            }
            break;
        case 'createPagoTarjeta':
            $orden->createPagoTarjeta();
            break;
        case 'getPagoTarjeta':
            if ($id) {
                $orden->getPagoTarjeta($id);
            } else {
                throw new Exception("orden_id requerido para obtener pago tarjeta");
            }
            break;
        case 'createPagoEfectivo':
            $orden->createPagoEfectivo();
            break;
        case 'getPagoEfectivo':
            if ($id) {
                $orden->getPagoEfectivo($id);
            } else {
                throw new Exception("orden_id requerido para obtener pago efectivo");
            }
            break;
        default:
            throw new Exception("Acción no válida: '$action'. Rutas disponibles: index, get, create, update, delete, createPagoTarjeta, getPagoTarjeta, createPagoEfectivo, getPagoEfectivo");
    }
    
} catch (Exception $e) {
    error_log("Error en el controlador: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "timestamp" => date('Y-m-d H:i:s')
    ]);
}
?>