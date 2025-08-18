<?php
class OrdenModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    
    /* Listar todas las órdenes */
    public function all()
    {
        try {
            $vSql = "SELECT 
                        o.ordenesId,
                        o.usuario_id,
                        o.fecha,
                        o.subtotal,
                        o.total,
                        o.estado,
                        o.metodo_pago,
                        o.direccion_envio,
                        o.impuestos,
                        u.nombre_usuario
                     FROM ordenes o
                     LEFT JOIN usuarios u ON o.usuario_id = u.usuarioId
                     ORDER BY o.fecha DESC";
            return $this->enlace->ExecuteSQL($vSql);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
    /* Obtener orden por ID con detalles completos */
    public function get($id) 
    {
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
                        o.estado,
                        u.usuarioId,
                        u.nombre_usuario AS nombre_usuario
                     FROM ordenes o
                     JOIN usuarios u ON o.usuario_id = u.usuarioId
                     WHERE o.ordenesId = " . (int)$id;

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
                     WHERE d.orden_id = " . (int)$id;

            $productos = $this->enlace->ExecuteSQL($vSql);

            $vResultado = [
                'pedido' => $pedido[0], 
                'productos' => $productos,
                'personalizados' => [] // vacío por ahora, no hay productos personalizados
            ];

            return $vResultado;

        } catch (Exception $e) {
            error_log("Error en OrdenModel::get: " . $e->getMessage());
            handleException($e);
        }
    }

    /* Crear nueva orden */
    public function create($data)
    {
        try {
            // Validar y escapar datos
            $usuario_id = (int)$data['usuario_id'];
            $subtotal = (float)$data['subtotal'];
            $total = (float)$data['total'];
            $estado = $this->enlace->real_escape_string($data['estado']);
            $metodo_pago = $this->enlace->real_escape_string($data['metodo_pago']);
            $direccion_envio = $this->enlace->real_escape_string($data['direccion_envio']);
            $impuestos = isset($data['impuestos']) ? (float)$data['impuestos'] : 0;
            
            $vSql = "INSERT INTO ordenes 
                        (usuario_id, subtotal, total, estado, metodo_pago, direccion_envio, fecha, impuestos)
                     VALUES 
                        ($usuario_id, $subtotal, $total, '$estado', '$metodo_pago', '$direccion_envio', NOW(), $impuestos)";
            
            $this->enlace->ExecuteSQL($vSql);
            
            // Obtener el ID insertado
            $vSqlLastId = "SELECT LAST_INSERT_ID() as id";
            $resultado = $this->enlace->ExecuteSQL($vSqlLastId);
            
            return $resultado[0]['id'];
            
        } catch (Exception $e) {
            error_log("Error en OrdenModel::create: " . $e->getMessage());
            handleException($e);
        }
    }

    /* Actualizar orden */
    public function update($id, $data)
    {
        try {
            // Construir campos a actualizar dinámicamente
            $campos = [];
            
            if (isset($data['usuario_id'])) {
                $campos[] = "usuario_id = " . (int)$data['usuario_id'];
            }
            if (isset($data['subtotal'])) {
                $campos[] = "subtotal = " . (float)$data['subtotal'];
            }
            if (isset($data['total'])) {
                $campos[] = "total = " . (float)$data['total'];
            }
            if (isset($data['estado'])) {
                $campos[] = "estado = '" . $this->enlace->real_escape_string($data['estado']) . "'";
            }
            if (isset($data['metodo_pago'])) {
                $campos[] = "metodo_pago = '" . $this->enlace->real_escape_string($data['metodo_pago']) . "'";
            }
            if (isset($data['direccion_envio'])) {
                $campos[] = "direccion_envio = '" . $this->enlace->real_escape_string($data['direccion_envio']) . "'";
            }
            if (isset($data['impuestos'])) {
                $campos[] = "impuestos = " . (float)$data['impuestos'];
            }
            
            if (empty($campos)) {
                throw new Exception("No hay campos para actualizar");
            }
            
            $vSql = "UPDATE ordenes SET " . implode(', ', $campos) . " WHERE ordenesId = " . (int)$id;
            
            $this->enlace->ExecuteSQL($vSql);
            return true;
            
        } catch (Exception $e) {
            error_log("Error en OrdenModel::update: " . $e->getMessage());
            handleException($e);
        }
    }

    /* Eliminar orden */
    public function delete($id)
    {
        try {
            $vSql = "DELETE FROM ordenes WHERE ordenesId = " . (int)$id;
            $this->enlace->ExecuteSQL($vSql);
            return true;
        } catch (Exception $e) {
            error_log("Error en OrdenModel::delete: " . $e->getMessage());
            handleException($e);
        }
    }

    /* Obtener órdenes por usuario */
    public function getByUser($userId)
    {
        try {
            $vSql = "SELECT 
                        o.ordenesId,
                        o.fecha,
                        o.total,
                        o.estado,
                        o.metodo_pago,
                        COUNT(d.detalle_id) as total_productos
                     FROM ordenes o
                     LEFT JOIN detalle_orden d ON o.ordenesId = d.orden_id
                     WHERE o.usuario_id = " . (int)$userId . "
                     GROUP BY o.ordenesId
                     ORDER BY o.fecha DESC";
            return $this->enlace->ExecuteSQL($vSql);
        } catch (Exception $e) {
            error_log("Error en OrdenModel::getByUser: " . $e->getMessage());
            handleException($e);
        }
    }

    /* Obtener estadísticas de órdenes */
    public function getStats()
    {
        try {
            $vSql = "SELECT 
                        COUNT(*) as total_ordenes,
                        COUNT(CASE WHEN estado = 'Pagado' THEN 1 END) as ordenes_pagadas,
                        COUNT(CASE WHEN estado = 'Pendiente' THEN 1 END) as ordenes_pendientes,
                        SUM(CASE WHEN estado = 'Pagado' THEN total ELSE 0 END) as total_ingresos,
                        AVG(CASE WHEN estado = 'Pagado' THEN total ELSE NULL END) as promedio_venta
                     FROM ordenes";
            $resultado = $this->enlace->ExecuteSQL($vSql);
            return $resultado[0];
        } catch (Exception $e) {
            error_log("Error en OrdenModel::getStats: " . $e->getMessage());
            handleException($e);
        }
    }
}
?>