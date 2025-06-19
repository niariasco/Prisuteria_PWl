<?php
class DirectorModel
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
    
       public function listarPorUsuario($usuarioId)
    {
        try {
            $sql = "SELECT o.ordenesId, o.fecha, o.total, e.nombre_estado
                    FROM ordenes o
                    JOIN estados e ON o.estado_id = e.estadoId
                    WHERE o.usuario_id = ?
                    ORDER BY o.fecha DESC";
            $params = [$usuarioId];
            $resultado = $this->enlace->executeSQL($sql, $params);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

   // Obtener detalle completo de pedido (factura)
   /*REVISAR--------------- */
    public function detallePedido($ordenId)
    {
        try {
            // Encabezado y cliente
            $sqlEncabezado = "SELECT o.ordenesId, o.fecha, o.subtotal, o.total, o.metodo_pago, o.direccion_envio,
                                     u.nombre_usuario
                              FROM ordenes o
                              JOIN usuarios u ON o.usuario_id = u.usuarioId
                              WHERE o.ordenesId = ?";
            $encabezado = $this->enlace->executeSQL($sqlEncabezado, [$ordenId]);
            if (empty($encabezado)) return null;
            $encabezado = $encabezado[0];

            // Detalle productos normales
            $sqlProductos = "SELECT p.nombre, od.cantidad, od.precio_unitario, (od.cantidad * od.precio_unitario) AS subtotal
                             FROM orden_detalle od
                             JOIN productos p ON od.producto_id = p.productosId
                             WHERE od.orden_id = ?";
            $productos = $this->enlace->executeSQL($sqlProductos, [$ordenId]);

            // Productos personalizados
            $sqlPersonalizados = "SELECT pp.id, pb.nombre AS producto_base, pb.precio AS precio_base, pp.precio_total,
                                        GROUP_CONCAT(CONCAT(cp.nombre, ': ', oc.nombre, ' (+', oc.precio_adicional, ')') SEPARATOR ', ') AS criterios
                                 FROM productos_personalizados pp
                                 JOIN productos pb ON pp.producto_base_id = pb.productosId
                                 JOIN productos_personalizados_opciones ppo ON pp.id = ppo.producto_personalizado_id
                                 JOIN componentes_personalizables cp ON cp.id = ppo.componente_id
                                 JOIN opciones_componentes oc ON oc.id = ppo.opcion_id
                                 WHERE pp.id IN (
                                     SELECT producto_personalizado_id FROM carrito_productos_personalizados cpp
                                     JOIN carritos c ON cpp.carrito_id = c.id
                                     JOIN ordenes o ON o.usuario_id = c.usuario_id
                                     WHERE o.ordenesId = ?
                                 )
                                 GROUP BY pp.id";
            $personalizados = $this->enlace->executeSQL($sqlPersonalizados, [$ordenId]);

            return [
                'encabezado' => $encabezado,
                'productos' => $productos,
                'personalizados' => $personalizados
            ];
        } catch (Exception $e) {
            handleException($e);
        }
    }
  // Crear nueva orden con detalle
    public function crearOrden($usuarioId, $direccion, $metodoPago, $carritoProductos, $carritoPersonalizados)
    {
        try {
            $this->enlace->beginTransaction();

            // Calcular subtotal y total
            $subtotal = 0.0;
            foreach ($carritoProductos as $item) {
                $subtotal += $item->precio_unitario * $item->cantidad;
            }
            foreach ($carritoPersonalizados as $item) {
                $subtotal += $item->precio_total * $item->cantidad;
            }
            $impuestos = $subtotal * 0.13; // ejemplo 13% impuesto
            $total = $subtotal + $impuestos;

            // Insertar orden
            $sqlOrden = "INSERT INTO ordenes (usuario_id, subtotal, total, estado_id, metodo_pago, direccion_envio) VALUES (?, ?, ?, 1, ?, ?)";
            $this->enlace->executeSQL_DML($sqlOrden, [$usuarioId, $subtotal, $total, $metodoPago, $direccion]);
            $ordenId = $this->enlace->lastInsertId();

            // Insertar detalle productos normales
            $sqlDetalle = "INSERT INTO orden_detalle (orden_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)";
            foreach ($carritoProductos as $item) {
                $this->enlace->executeSQL_DML($sqlDetalle, [$ordenId, $item->producto_id, $item->cantidad, $item->precio_unitario]);
            }

            // Insertar productos personalizados al detalle (aquí deberías crear tabla detalle para personalizados o guardar como comentarios)
            // Por simplicidad, no agregamos en detalle normal

            $this->enlace->commit();
            return $ordenId;
        } catch (Exception $e) {
            $this->enlace->rollback();
            handleException($e);
        }
    }

}
