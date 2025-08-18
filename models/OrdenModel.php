<?php
class OrdenModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /*Listar todas las órdenes */
    public function all(){
        try {
            $vSql = "SELECT 
                        o.ordenesId,
                        o.usuario_id,
                        u.nombre_usuario,
                        o.fecha,
                        o.subtotal,
                        o.impuestos,
                        o.total,
                        o.estado,
                        o.metodo_pago,
                        o.direccion_envio
                     FROM ordenes o
                     INNER JOIN usuarios u ON o.usuario_id = u.usuarioId
                     ORDER BY o.fecha DESC";
            
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /*Obtener orden por ID con detalles completos*/
    public function get($id) {
        $vResultado = null;
        try {
            // Obtener datos generales del pedido y usuario
            $vSql = "SELECT 
                        o.ordenesId,
                        o.fecha,
                        o.direccion_envio,
                        o.subtotal,
                        o.impuestos,
                        o.total,
                        o.estado,
                        o.metodo_pago,
                        u.usuarioId,
                        u.nombre_usuario
                    FROM ordenes o
                    JOIN usuarios u ON o.usuario_id = u.usuarioId
                    WHERE o.ordenesId = " . (int)$id;

            $pedido = $this->enlace->ExecuteSQL($vSql);

            if (empty($pedido)) {
                return null;
            }

            // Obtener detalle de productos
            $vSql = "SELECT 
                        p.nombre,
                        d.cantidad,
                        d.precio_unitario as precio,
                        (d.cantidad * d.precio_unitario) as subtotal
                    FROM detalle_orden d
                    JOIN productos p ON d.producto_id = p.productosId
                    WHERE d.orden_id = " . (int)$id;

            $productos = $this->enlace->ExecuteSQL($vSql);

            // Obtener información de pago según el método
            $infoPago = [];
            if ($pedido[0]['metodo_pago'] === 'Efectivo') {
                $vSql = "SELECT monto_pagado, cambio FROM orden_pago_efectivo WHERE orden_id = " . (int)$id;
                $infoPago = $this->enlace->ExecuteSQL($vSql);
            } elseif ($pedido[0]['metodo_pago'] === 'Tarjeta') {
                $vSql = "SELECT numero_tarjeta, fecha_expiracion, cvv, nombre_titular FROM orden_pago_tarjeta WHERE orden_id = " . (int)$id;
                $infoPago = $this->enlace->ExecuteSQL($vSql);
            }

            $vResultado = [
                'pedido' => $pedido[0], 
                'productos' => $productos,
                'pago' => !empty($infoPago) ? $infoPago[0] : [],
                'personalizados' => []
            ];

            return $vResultado;

        } catch (Exception $e) {
            handleException($e);
        }
    }

    /*Crear nueva orden*/
    public function create($data) {
        try {
            // Validar datos requeridos
            if (!isset($data['usuario_id'], $data['productos'], $data['direccion_envio'], $data['metodo_pago'])) {
                throw new Exception("Datos incompletos para crear la orden");
            }

            // Calcular totales
            $subtotal = 0;
            foreach ($data['productos'] as $producto) {
                $precio = isset($producto['precio']) ? $producto['precio'] : $producto['precio_unitario'];
                $subtotal += $precio * $producto['cantidad'];
            }
            
            $impuestos = $subtotal * 0.13; // 13% IVA Costa Rica
            $total = $subtotal + $impuestos;

            // Insertar orden principal
            $vSql = "INSERT INTO ordenes 
                        (usuario_id, fecha, subtotal, impuestos, total, estado, metodo_pago, direccion_envio)
                     VALUES (
                        " . (int)$data['usuario_id'] . ",
                        NOW(),
                        " . (float)$subtotal . ",
                        " . (float)$impuestos . ",
                        " . (float)$total . ",
                        'Procesando',
                        '" . $this->enlace->real_escape_string($data['metodo_pago']) . "',
                        '" . $this->enlace->real_escape_string($data['direccion_envio']) . "'
                     )";

            $this->enlace->ExecuteSQL($vSql);

            // Obtener ID de la orden creada
            $vSqlId = "SELECT LAST_INSERT_ID() as orden_id";
            $resultado = $this->enlace->ExecuteSQL($vSqlId);
            $ordenId = $resultado[0]['orden_id'];

            // Insertar detalle de productos
            foreach ($data['productos'] as $producto) {
                $productoId = isset($producto['producto_id']) ? $producto['producto_id'] : $producto['id'];
                $precio = isset($producto['precio']) ? $producto['precio'] : $producto['precio_unitario'];
                
                $vSql = "INSERT INTO detalle_orden (orden_id, producto_id, cantidad, precio_unitario)
                         VALUES (
                            " . (int)$ordenId . ",
                            " . (int)$productoId . ",
                            " . (int)$producto['cantidad'] . ",
                            " . (float)$precio . "
                         )";
                $this->enlace->ExecuteSQL($vSql);
            }

            // Insertar información de pago según el método
            if ($data['metodo_pago'] === 'Efectivo' && isset($data['pago_efectivo'])) {
                $vSql = "INSERT INTO orden_pago_efectivo (orden_id, monto_pagado, cambio)
                         VALUES (
                            " . (int)$ordenId . ",
                            " . (float)$data['pago_efectivo']['monto_pagado'] . ",
                            " . (float)$data['pago_efectivo']['cambio'] . "
                         )";
                $this->enlace->ExecuteSQL($vSql);
            } elseif ($data['metodo_pago'] === 'Tarjeta' && isset($data['pago_tarjeta'])) {
                $tarjeta = $data['pago_tarjeta'];
                $vSql = "INSERT INTO orden_pago_tarjeta 
                            (orden_id, numero_tarjeta, fecha_expiracion, cvv, nombre_titular)
                         VALUES (
                            " . (int)$ordenId . ",
                            '" . $this->enlace->real_escape_string($tarjeta['numero_tarjeta']) . "',
                            '" . $this->enlace->real_escape_string($tarjeta['fecha_expiracion']) . "',
                            '" . $this->enlace->real_escape_string($tarjeta['cvv']) . "',
                            '" . $this->enlace->real_escape_string($tarjeta['nombre_titular']) . "'
                         )";
                $this->enlace->ExecuteSQL($vSql);
            }

            return [
                'success' => true,
                'orden_id' => $ordenId,
                'total' => $total,
                'message' => 'Orden creada exitosamente'
            ];

        } catch (Exception $e) {
            error_log("Error en OrdenModel::create: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al crear la orden: ' . $e->getMessage()
            ];
        }
    }

    /*Actualizar estado de orden*/
    public function updateStatus($id, $estado) {
        try {
            $estadosValidos = ['Procesando', 'Enviado', 'Entregado', 'Cancelado', 'Pendiente'];
            
            if (!in_array($estado, $estadosValidos)) {
                throw new Exception("Estado no válido");
            }

            $vSql = "UPDATE ordenes 
                     SET estado = '" . $this->enlace->real_escape_string($estado) . "'
                     WHERE ordenesId = " . (int)$id;

            $this->enlace->ExecuteSQL($vSql);

            return [
                'success' => true,
                'message' => 'Estado actualizado correctamente'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al actualizar el estado: ' . $e->getMessage()
            ];
        }
    }

    /*Obtener órdenes por usuario*/
    public function getByUser($userId) {
        try {
            $vSql = "SELECT 
                        o.ordenesId,
                        o.fecha,
                        o.subtotal,
                        o.impuestos,
                        o.total,
                        o.estado,
                        o.metodo_pago,
                        o.direccion_envio
                     FROM ordenes o
                     WHERE o.usuario_id = " . (int)$userId . "
                     ORDER BY o.fecha DESC";

            return $this->enlace->ExecuteSQL($vSql);

        } catch (Exception $e) {
            handleException($e);
        }
    }

    /*Eliminar orden (soft delete cambiando estado)*/
    public function delete($id) {
        try {
            $vSql = "UPDATE ordenes 
                     SET estado = 'Cancelado'
                     WHERE ordenesId = " . (int)$id;

            $this->enlace->ExecuteSQL($vSql);

            return [
                'success' => true,
                'message' => 'Orden cancelada correctamente'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al cancelar la orden: ' . $e->getMessage()
            ];
        }
    }
}