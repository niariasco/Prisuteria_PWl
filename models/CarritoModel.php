<?php
class CarritoModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function obtenerCarritoPorUsuario($usuarioId)
    {
        $sql = "SELECT cp.*, p.nombre, p.precio
                FROM carritos c
                JOIN carrito_productos cp ON c.id = cp.carrito_id
                JOIN productos p ON cp.producto_id = p.productosId
                WHERE c.usuario_id = 2 AND c.activo = TRUE; ";
        return $this->enlace->executeSQL($sql, [$usuarioId]);
    }

    public function agregarProducto($data)
    {
        $usuarioId = $data->usuario_id;
        $productoId = $data->producto_id;
        $cantidad = $data->cantidad;

        $sql = "SELECT id FROM carritos WHERE usuario_id = ? AND activo = TRUE";
        $resultado = $this->enlace->executeSQL($sql, [$usuarioId]);
        if (empty($resultado)) {
            // Crear carrito nuevo
            $sqlInsert = "INSERT INTO carritos (usuario_id) VALUES (?)";
            $this->enlace->executeSQL_DML($sqlInsert, [$usuarioId]);
            $carritoId = $this->enlace->lastInsertId();
        } else {
            $carritoId = $resultado[0]->id;
        }

        // Insertar o actualizar cantidad
        $sqlCheck = "SELECT * FROM carrito_productos WHERE carrito_id = ? AND producto_id = ?";
        $existe = $this->enlace->executeSQL($sqlCheck, [$carritoId, $productoId]);
        if (!empty($existe)) {
            // Actualizar cantidad
            $sqlUpd = "UPDATE carrito_productos SET cantidad = cantidad + ? WHERE carrito_id = ? AND producto_id = ?";
            $this->enlace->executeSQL_DML($sqlUpd, [$cantidad, $carritoId, $productoId]);
        } else {
            // Insertar nuevo
            $sqlIns = "INSERT INTO carrito_productos (carrito_id, producto_id, cantidad) VALUES (?, ?, ?)";
            $this->enlace->executeSQL_DML($sqlIns, [$carritoId, $productoId, $cantidad]);
        }

        return ['mensaje' => 'Producto agregado al carrito'];
    }
}