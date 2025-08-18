<?php
class orden
{
    /*Listar todas las órdenes*/
    public function index()
    {
        try {
            $response = new Response();
            $ordenModel = new OrdenModel();
            $result = $ordenModel->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /*Obtener orden específica por ID*/
    public function get($param)
    {
        try {
            $response = new Response();
            $ordenModel = new OrdenModel();
            $result = $ordenModel->get($param);
            
            if ($result === null) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Orden no encontrada'
                ], 404);
                return;
            }
            
            $response->toJSON([
                'success' => true,
                'data' => $result
            ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /*Crear nueva orden*/
    public function create()
    {
        try {
            $response = new Response();
            
            // Obtener datos del request
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Datos JSON inválidos'
                ], 400);
                return;
            }

            // Validar datos requeridos
            $requiredFields = ['usuario_id', 'productos', 'direccion_envio', 'metodo_pago'];
            foreach ($requiredFields as $field) {
                if (!isset($input[$field])) {
                    $response->toJSON([
                        'success' => false,
                        'message' => "Campo requerido faltante: $field"
                    ], 400);
                    return;
                }
            }

            // Validar que hay productos
            if (empty($input['productos']) || !is_array($input['productos'])) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Debe incluir al menos un producto'
                ], 400);
                return;
            }

            // Validar método de pago
            $metodosValidos = ['Efectivo', 'Tarjeta'];
            if (!in_array($input['metodo_pago'], $metodosValidos)) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Método de pago no válido'
                ], 400);
                return;
            }

            // Validar información de pago según el método
            if ($input['metodo_pago'] === 'Efectivo') {
                if (!isset($input['pago_efectivo']['monto_pagado'])) {
                    $response->toJSON([
                        'success' => false,
                        'message' => 'Monto pagado requerido para pago en efectivo'
                    ], 400);
                    return;
                }
            } elseif ($input['metodo_pago'] === 'Tarjeta') {
                $camposTarjeta = ['numero_tarjeta', 'fecha_expiracion', 'cvv', 'nombre_titular'];
                foreach ($camposTarjeta as $campo) {
                    if (!isset($input['pago_tarjeta'][$campo])) {
                        $response->toJSON([
                            'success' => false,
                            'message' => "Campo de tarjeta requerido: $campo"
                        ], 400);
                        return;
                    }
                }
            }

            $ordenModel = new OrdenModel();
            $result = $ordenModel->create($input);

            if ($result['success']) {
                $response->toJSON($result, 201);
            } else {
                $response->toJSON($result, 400);
            }

        } catch (Exception $e) {
            $response = new Response();
            $response->toJSON([
                'success' => false,
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    /*Actualizar estado de orden*/
    public function updateStatus($ordenId)
    {
        try {
            $response = new Response();
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['estado'])) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Estado requerido'
                ], 400);
                return;
            }

            $ordenModel = new OrdenModel();
            $result = $ordenModel->updateStatus($ordenId, $input['estado']);

            if ($result['success']) {
                $response->toJSON($result);
            } else {
                $response->toJSON($result, 400);
            }

        } catch (Exception $e) {
            $response = new Response();
            $response->toJSON([
                'success' => false,
                'message' => 'Error interno del servidor'
            ], 500);
        }
    }

    /*Obtener órdenes por usuario*/
    public function getByUser($userId)
    {
        try {
            $response = new Response();
            $ordenModel = new OrdenModel();
            $result = $ordenModel->getByUser($userId);
            
            $response->toJSON([
                'success' => true,
                'data' => $result
            ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /*Cancelar orden*/
    public function cancel($ordenId)
    {
        try {
            $response = new Response();
            $ordenModel = new OrdenModel();
            $result = $ordenModel->delete($ordenId);

            if ($result['success']) {
                $response->toJSON($result);
            } else {
                $response->toJSON($result, 400);
            }

        } catch (Exception $e) {
            $response = new Response();
            $response->toJSON([
                'success' => false,
                'message' => 'Error interno del servidor'
            ], 500);
        }
    }

    /*Finalizar pago - Método principal para procesar pagos*/
    public function finalizarPago()
    {
        try {
            $response = new Response();
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Datos JSON inválidos'
                ], 400);
                return;
            }

            // Validar estructura del carrito
            if (!isset($input['carrito']) || !isset($input['usuario_id']) || 
                !isset($input['direccion_envio']) || !isset($input['metodo_pago'])) {
                $response->toJSON([
                    'success' => false,
                    'message' => 'Datos incompletos para procesar el pago'
                ], 400);
                return;
            }

            // Transformar datos del carrito al formato esperado
            $ordenData = [
                'usuario_id' => $input['usuario_id'],
                'productos' => [],
                'direccion_envio' => $input['direccion_envio'],
                'metodo_pago' => $input['metodo_pago']
            ];

            // Convertir items del carrito a productos de orden
            foreach ($input['carrito'] as $item) {
                $ordenData['productos'][] = [
                    'producto_id' => $item['id'],
                    'cantidad' => $item['cantidad'],
                    'precio' => $item['precio']
                ];
            }

            // Agregar información de pago
            if ($input['metodo_pago'] === 'Efectivo' && isset($input['pago_efectivo'])) {
                $ordenData['pago_efectivo'] = $input['pago_efectivo'];
            } elseif ($input['metodo_pago'] === 'Tarjeta' && isset($input['pago_tarjeta'])) {
                $ordenData['pago_tarjeta'] = $input['pago_tarjeta'];
            }

            $ordenModel = new OrdenModel();
            $result = $ordenModel->create($ordenData);

            if ($result['success']) {
                $response->toJSON([
                    'success' => true,
                    'message' => 'Pago procesado exitosamente',
                    'orden_id' => $result['orden_id'],
                    'total' => $result['total']
                ], 201);
            } else {
                $response->toJSON($result, 400);
            }

        } catch (Exception $e) {
            $response = new Response();
            $response->toJSON([
                'success' => false,
                'message' => 'Error al procesar el pago: ' . $e->getMessage()
            ], 500);
        }
    }
}