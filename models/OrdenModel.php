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
    /*
    public function get($id)
    {
        try {
            $query = "SELECT 
                        o.ordenesId,
                        o.usuario_id,
                        u.nombre AS nombre_usuario, -- si quieres el nombre del usuario
                        o.subtotal,
                        o.total,
                        o.estado_id,
                        e.descripcion AS estado, -- si quieres el nombre del estado
                        o.metodo_pago,
                        o.direccion_envio,
                        o.fecha
                      FROM ordenes o
                      INNER JOIN usuarios u ON o.usuario_id = u.usuarioId
                      INNER JOIN estados e ON o.estado_id = e.estadoId
                      WHERE o.ordenesId = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $orden = $stmt->fetch(PDO::FETCH_ASSOC);
            return $orden ?: null;
        } catch (PDOException $e) {
            // Puedes manejar errores de forma personalizada
            throw new Exception("Error al obtener la orden por ID: " . $e->getMessage());
        }
    }
    */
    
public function get($id) {
    $vResultado = null;
    try {
        // Obtener datos generales del pedido y usuario
        $vSql = "            SELECT 
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
            WHERE o.ordenesId = $id
        ";

        $pedido = $this->enlace->ExecuteSQL($vSql);

        if (empty($pedido)) {
            return null;
        }

        // Obtener detalle productos con cálculo correcto del precio unitario y subtotal con promociones activas
        $vSql = "            SELECT 
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
            WHERE d.orden_id = $id
        ";

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
}