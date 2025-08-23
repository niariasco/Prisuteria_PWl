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
   public function get($id){
        $vResultado=null;
        try {
         //   $rentalMovieM=new RentalMovieModel();
         //   $shopM=new ShopRentalModel();
            //Consulta sql
			$vSql =   "   SELECT 
                e.etiquetaId,
                e.nombrEtiquetas
            FROM etiquetas e  
            WHERE e.etiquetaId = $id ";           
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ( $vSql);
            if (!empty($vResultado)) {
            }
			// Retornar el objeto
			return $vResultado;
		} catch ( Exception $e ) {
			die ( $e->getMessage () );
		}
    }
public function create($objeto) {
    try {
        $sql = "INSERT INTO etiquetas (nombrEtiquetas) VALUES ('$objeto->nombrEtiquetas')";
        $etiquetaId = $this->enlace->executeSQL_DML_last($sql);
        return $this->get($etiquetaId);
    } catch (Exception $e) {
        handleException($e);
    }
}

    public function update($objeto) {
    try {
        $sql = "UPDATE etiquetas SET nombrEtiquetas = '$objeto->nombrEtiquetas' 
                WHERE etiquetaId = $objeto->etiquetaId";
        $this->enlace->executeSQL_DML($sql);
        return $this->get($objeto->etiquetaId);
    } catch (Exception $e) {
        handleException($e);
    }
}
}