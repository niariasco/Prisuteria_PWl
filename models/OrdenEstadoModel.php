<?php
/*orden estado*/
class EstadoModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function all()
    {
        $sql = "SELECT * FROM estados";
        return $this->enlace->executeSQL($sql);
    }
}