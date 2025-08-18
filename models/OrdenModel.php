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
            // 1. Insertar en tabla ordenes usando MySqlConnect
            $sql = "INSERT INTO ordenes 
                    (usuario_id, fecha, subtotal, impuestos, total, estado, metodo_pago, direccion_envio) 
                    VALUES 
                    ({$data['usuario_id']}, NOW(), {$data['subtotal']}, {$data['impuestos']}, {$data['total']}, '{$data['estado']}', '{$data['metodo_pago']}', '{$data['direccion_envio']}')";

            // Ejecutar la consulta
            $resultado = $this->enlace->ExecuteSQL($sql);
            
            // Obtener el último ID insertado
            $sqlLastId = "SELECT LAST_INSERT_ID() as orden_id";
            $lastIdResult = $this->enlace->ExecuteSQL($sqlLastId);
            $orden_id = $lastIdResult[0]['orden_id'];

            // 2. Insertar detalle de productos
            if (!empty($data['productos'])) {
                foreach ($data['productos'] as $producto) {
                    $sqlDetalle = "INSERT INTO detalle_orden 
                                   (orden_id, producto_id, cantidad, precio_unitario) 
                                   VALUES 
                                   ($orden_id, {$producto['id']}, {$producto['cantidad']}, {$producto['precio']})";
                    $this->enlace->ExecuteSQL($sqlDetalle);
                }
            }

            // 3. Insertar según método de pago
            if ($data['metodo_pago'] === "Tarjeta") {
                $sqlTarjeta = "INSERT INTO orden_pago_tarjeta 
                               (orden_id, numero_tarjeta, fecha_expiracion, cvv, nombre_titular)
                               VALUES 
                               ($orden_id, '{$data['numero_tarjeta']}', '{$data['fecha_expiracion']}', '{$data['cvv']}', '{$data['nombre_titular']}')";
                $this->enlace->ExecuteSQL($sqlTarjeta);
            } elseif ($data['metodo_pago'] === "Efectivo") {
                $sqlEfectivo = "INSERT INTO orden_pago_efectivo 
                                (orden_id, monto_pagado, cambio)
                                VALUES 
                                ($orden_id, {$data['monto_pagado']}, {$data['cambio']})";
                $this->enlace->ExecuteSQL($sqlEfectivo);
            }

            return $orden_id; // Retorna el id de la orden creada
        } catch (Exception $e) {
            // Log del error para debugging
            error_log("Error en OrdenModel::create(): " . $e->getMessage());
            throw $e;
        }
    }
}