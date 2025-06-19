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
        $sql = "SELECT * FROM productos_personalizados WHERE usuario_id = ?";
        return $this->enlace->executeSQL($sql, [$usuarioId]);
    }
}