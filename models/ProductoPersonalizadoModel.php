<?php
class ProductoPersonalizadoModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
public function getAll()
{
    try {
        $sql = "SELECT 
                    pp.id AS producto_personalizado_id,
                    u.nombre_usuario,
                    p.nombre AS producto_base,
                    pp.precio_total,
                    pp.fecha_creacion,
                    GROUP_CONCAT(CONCAT(c.nombre, ': ', o.nombre, ' (+', o.precio_adicional, ')') SEPARATOR ' | ') AS opciones
                FROM productos_personalizados pp
                INNER JOIN usuarios u 
                    ON pp.usuario_id = u.usuarioId
                INNER JOIN productos p 
                    ON pp.producto_base_id = p.productosId
                LEFT JOIN productos_personalizados_componentes ppc 
                    ON pp.id = ppc.producto_personalizado_id
                LEFT JOIN criterios c 
                    ON ppc.criterio_id = c.id
                LEFT JOIN opciones o 
                    ON ppc.opcion_id = o.id
                GROUP BY pp.id
                ORDER BY pp.fecha_creacion DESC";

        return $this->enlace->executeSQL($sql);

    } catch (Exception $e) {
        handleException($e);
    }
}
    public function getPorUsuario($usuarioId)
    {
        try {
        $sql = "SELECT * FROM productos_personalizados WHERE usuario_id = ?";
        return $this->enlace->executeSQL($sql, [$usuarioId]);
        } catch (Exception $e) {
            handleException($e);
        }

    }
        // Obtener un producto personalizado por ID
    public function get($id)
    {
        try {
            $sql = "SELECT * FROM productos_personalizados WHERE id = ?";
            $result = $this->enlace->executeSQL($sql, [$id]);
            return $result ? $result[0] : null;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Crear un nuevo producto personalizado
    public function create($data)
{
    try {
        // Insertar el producto personalizado
        $sqlInsert = "INSERT INTO productos_personalizados 
                      (usuario_id, producto_base_id, precio_total, nombre_personalizado, descripcion, fecha_creacion)
                      VALUES (?, ?, ?, ?, ?, NOW())";

        $params = [
            $data->usuario_id,
            $data->producto_base_id,
            $data->precio_total,
            $data->nombre_personalizado,
            $data->descripcion
        ];

        $this->enlace->executeSQL_DML($sqlInsert, $params);

        // Luego, buscar el último producto personalizado creado por el usuario, ordenando por fecha
        $sqlSelect = "SELECT * FROM productos_personalizados
                      WHERE usuario_id = ?
                      ORDER BY fecha_creacion DESC
                      LIMIT 1";

        $result = $this->enlace->executeSQL($sqlSelect, [$data->usuario_id]);

        return $result ? $result[0] : null;

    } catch (Exception $e) {
        handleException($e);
    }
}

}