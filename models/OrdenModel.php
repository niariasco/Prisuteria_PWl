<?php
class OrdenModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    
    /*Listar */
    public function all(){
        try {
            //Consulta sql
			$vSql = "SELECT * FROM ordenes;";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ($vSql);
				
			// Retornar el objeto
			return $vResultado;
		} catch (Exception $e) {
            handleException($e);
        }
    }
    
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
                    o.metodo_pago,
                    u.usuarioId,
                    u.nombre_usuario AS nombre_usuario
                FROM ordenes o
                JOIN usuarios u ON o.usuario_id = u.usuarioId
                WHERE o.ordenesId = $id";

            $pedido = $this->enlace->ExecuteSQL($vSql);

            if (empty($pedido)) {
                return null;
            }

            // Obtener detalle productos con cálculo correcto del precio unitario y subtotal con promociones activas
            $vSql = "SELECT 
                    p.nombre,
                    d.cantidad,
                    p.precio AS precio_original,

                    -- Obtener máximo descuento activo (producto o categoría)
                    (
                        SELECT MAX(pr.descuento)
                        FROM promociones pr
                        WHERE pr.activo = 1
                          AND NOW() BETWEEN pr.fecha_inicio AND pr.fecha_fin
                          AND (
                            (pr.tipo = 'Producto' AND pr.ProductoID = p.productosId)
                            OR
                            (pr.tipo = 'Categoria' AND pr.CategoriaID = p.categoria_id)
                          )
                    ) AS descuento_activo,

                    -- Calcular precio unitario con descuento aplicado
                    ROUND(
                        p.precio * 
                        (1 - COALESCE(
                            (
                                SELECT MAX(pr.descuento) / 100
                                FROM promociones pr
                                WHERE pr.activo = 1
                                  AND NOW() BETWEEN pr.fecha_inicio AND pr.fecha_fin
                                  AND (
                                    (pr.tipo = 'Producto' AND pr.ProductoID = p.productosId)
                                    OR
                                    (pr.tipo = 'Categoria' AND pr.CategoriaID = p.categoria_id)
                                  )
                            ), 0)
                        ), 2) AS precio_unitario,

                    -- Calcular subtotal acorde a cantidad y precio unitario
                    ROUND(
                        d.cantidad * p.precio * 
                        (1 - COALESCE(
                            (
                                SELECT MAX(pr.descuento) / 100
                                FROM promociones pr
                                WHERE pr.activo = 1
                                  AND NOW() BETWEEN pr.fecha_inicio AND pr.fecha_fin
                                  AND (
                                    (pr.tipo = 'Producto' AND pr.ProductoID = p.productosId)
                                    OR
                                    (pr.tipo = 'Categoria' AND pr.CategoriaID = p.categoria_id)
                                  )
                            ), 0)
                        ), 2) AS subtotal

                FROM detalle_orden d
                JOIN productos p ON d.producto_id = p.productosId
                WHERE d.orden_id = $id";

            $productos = $this->enlace->ExecuteSQL($vSql);

            $vResultado = [
                'pedido' => $pedido[0], 
                'productos' => $productos,
                'personalizados' => [] // vacío aun no hay
            ];

            return $vResultado;

        } catch (Exception $e) {
            die($e->getMessage());
        }
    }
    
public function create($data)
{
    try {
        // Campos obligatorios con valores por defecto
        $usuario_id = isset($data['usuario_id']) ? (int)$data['usuario_id'] : 0;
        $estado = isset($data['estado']) ? $data['estado'] : 'Pendiente';
        $subtotal = isset($data['subtotal']) ? (float)$data['subtotal'] : 0;
        $impuestos = isset($data['impuestos']) ? (float)$data['impuestos'] : 0;
        $total = isset($data['total']) ? (float)$data['total'] : 0;
        $metodo_pago = isset($data['metodo_pago']) ? $data['metodo_pago'] : 'Efectivo';

        // Escapar la dirección para evitar errores de SQL
        $direccion_envio_sql = isset($data['direccion_envio']) 
            ? str_replace("'", "''", $data['direccion_envio']) 
            : 'No especificada';

        // Insertar en tabla ordenes
        $sql = "INSERT INTO ordenes 
                (usuario_id, fecha, subtotal, impuestos, total, estado, metodo_pago, direccion_envio) 
                VALUES 
                ($usuario_id, NOW(), $subtotal, $impuestos, $total, '$estado', '$metodo_pago', '$direccion_envio_sql')";

        $resultado = $this->enlace->ExecuteSQL($sql);
        if ($resultado === false) {
            throw new Exception("Error al insertar la orden: $sql");
        }

        // Obtener el último ID insertado
        $sqlLastId = "SELECT LAST_INSERT_ID() as orden_id";
        $lastIdResult = $this->enlace->ExecuteSQL($sqlLastId);
        if (!$lastIdResult || !isset($lastIdResult[0]['orden_id'])) {
            throw new Exception("No se pudo obtener el ID de la orden");
        }
        $orden_id = $lastIdResult[0]['orden_id'];

// Insertar detalle de productos
if (!empty($data['productos']) && is_array($data['productos'])) {
    foreach ($data['productos'] as $producto) {
        $producto_id = (int)$producto['id'];
        $cantidad = (int)$producto['cantidad'];
        $precio = (float)$producto['precio'];
        $subtotal_producto = $cantidad * $precio; // calculamos subtotal

        $sqlDetalle = "INSERT INTO detalle_orden 
                       (orden_id, producto_id, cantidad, precio_unitario, subtotal) 
                       VALUES 
                       ($orden_id, $producto_id, $cantidad, $precio, $subtotal_producto)";
        $detalleResultado = $this->enlace->ExecuteSQL($sqlDetalle);
        if ($detalleResultado === false) {
            throw new Exception("Error al insertar detalle de producto: $sqlDetalle");
        }
    }
}

        // Insertar método de pago
        if ($metodo_pago === "Tarjeta" && isset($data['pago_tarjeta'])) {
            $tarjeta = $data['pago_tarjeta'];
            $numero = str_replace("'", "''", $tarjeta['numero_tarjeta']);
            $fecha_exp = str_replace("'", "''", $tarjeta['fecha_expiracion']);
            $cvv = str_replace("'", "''", $tarjeta['cvv']);
            $titular = str_replace("'", "''", $tarjeta['nombre_titular']);
            $sqlTarjeta = "INSERT INTO orden_pago_tarjeta 
                           (orden_id, numero_tarjeta, fecha_expiracion, cvv, nombre_titular)
                           VALUES 
                           ($orden_id, '$numero', '$fecha_exp', '$cvv', '$titular')";
            $this->enlace->ExecuteSQL($sqlTarjeta);
        } elseif ($metodo_pago === "Efectivo" && isset($data['pago_efectivo'])) {
            $efectivo = $data['pago_efectivo'];
            $monto = (float)$efectivo['monto_pagado'];
            $cambio = (float)$efectivo['cambio'];
            $sqlEfectivo = "INSERT INTO orden_pago_efectivo 
                            (orden_id, monto_pagado, cambio)
                            VALUES 
                            ($orden_id, $monto, $cambio)";
            $this->enlace->ExecuteSQL($sqlEfectivo);
        }

        return $orden_id;
    } catch (Exception $e) {
        error_log("Error en OrdenModel::create(): " . $e->getMessage());
        throw $e;
    }
}


}