<?php
class ProductoPersonalizadoModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
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