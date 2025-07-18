<?php
class EstiquetasModel
{
    //Conectarse a la BD
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    /**
     * Listar productos
     * @param 
     * @return $vResultado - Lista de objetos
     */

    public function all()
    {
        try {
            //Consulta SQL
            // $vSQL = "SELECT * FROM productos order by nombre desc;";
            //Consulta SQL con JOIN para obtener las imágenes directamente
            $vSQL = "SELECT * FROM etiquetas";

            $vResultado = $this->enlace->ExecuteSQL($vSQL);
             //Retornar la respuesta

            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}