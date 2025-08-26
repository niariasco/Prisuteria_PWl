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
    
public function create($data) {
    try {
        // Preparar valores
        $usuario_id = (int)($data['usuario_id'] ?? 0);
        $subtotal = (float)($data['subtotal'] ?? 0);
        $impuestos = (float)($data['impuestos'] ?? 0);
        $total = (float)($data['total'] ?? 0);
        $direccion = isset($data['direccion_envio']) ? str_replace("'", "''", $data['direccion_envio']) : 'No especificada';
        $estado = $data['estado'] ?? 'Pendiente';
        $metodo_pago = $data['metodo_pago'] ?? 'Efectivo';

        // Insertar orden principal
        $sql = "INSERT INTO ordenes (usuario_id, fecha, subtotal, impuestos, total, estado, metodo_pago, direccion_envio)
                VALUES ($usuario_id, NOW(), $subtotal, $impuestos, $total, '$estado', '$metodo_pago', '$direccion')";

        // Ejecutar DML y obtener ID generado
        $orden_id = $this->enlace->executeSQL_DML_last($sql);

        // Insertar detalle de productos
        if (!empty($data['productos'])) {
            foreach ($data['productos'] as $p) {
                $pid = (int)$p['id'];
                $cant = (int)$p['cantidad'];
                $precio = (float)$p['precio'];
                $subtotal_producto = $cant * $precio;

                $sqlDet = "INSERT INTO detalle_orden (orden_id, producto_id, cantidad, precio_unitario, subtotal)
                           VALUES ($orden_id, $pid, $cant, $precio, $subtotal_producto)";
                $this->enlace->executeSQL_DML($sqlDet);
            }
        }

        // Insertar productos personalizados si existen
        if (!empty($data['personalizados'])) {
            foreach ($data['personalizados'] as $pp) {
                $nombre = str_replace("'", "''", $pp['nombre']);
                $costo_base = (float)$pp['costo_base'];
                $total_personalizado = (float)$pp['total_personalizado'];

                $sqlPers = "INSERT INTO detalle_personalizado (orden_id, nombre, costo_base, total_personalizado)
                            VALUES ($orden_id, '$nombre', $costo_base, $total_personalizado)";
                $this->enlace->executeSQL_DML($sqlPers);
            }
        }

        // Retornar solo el ID de la orden (no el objeto completo)
        return $orden_id;

    } catch (Exception $e) {
        handleException($e);
    }
}



}