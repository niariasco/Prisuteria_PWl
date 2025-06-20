<?php
class EstadoModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    // Listar todos los estados
    public function all()
    {
        try {
            $sql = "SELECT * FROM estados";
            return $this->enlace->executeSQL($sql);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Obtener un estado por ID
    public function get($id)
    {
        try {
            $sql = "SELECT * FROM estados WHERE estadoId = ?";
            $params = [$id];
            $result = $this->enlace->executeSQL($sql, $params);
            return $result ? $result[0] : null;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}