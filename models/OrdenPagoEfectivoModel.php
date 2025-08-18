<?php
class OrdenPagoEfectivoModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    
    /* Listar todos los pagos en efectivo */
    public function all()
    {
        try {
            $vSql = "SELECT * FROM orden_pago_efectivo;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
    /* Obtener un pago en efectivo por ID */
    public function get($id)
    {
        try {
            $vSql = "SELECT 
                        ope.efectivoId,
                        ope.orden_id,
                        o.fecha,
                        o.total,
                        ope.monto_recibido,
                        ope.monto_cambio
                     FROM orden_pago_efectivo ope
                     INNER JOIN ordenes o ON ope.orden_id = o.ordenesId
                     WHERE ope.efectivoId = " . (int)$id;
                     
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (empty($vResultado)) {
                return null;
            }
            return $vResultado[0];
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
    /* Insertar nuevo pago en efectivo */
    public function insert($data)
    {
        try {
            // Escapar datos
            $orden_id = (int)$data['orden_id'];
            $monto_recibido = (float)$data['monto_recibido'];
            $monto_cambio = (float)$data['monto_cambio'];
            
            $vSql = "INSERT INTO orden_pago_efectivo
                        (orden_id, monto_recibido, monto_cambio, fecha_pago)
                     VALUES (
                        $orden_id,
                        $monto_recibido,
                        $monto_cambio,
                        NOW()
                     )";
                     
            $this->enlace->ExecuteSQL($vSql);
            
            // Obtener el ID insertado
            $vSqlLastId = "SELECT LAST_INSERT_ID() as id";
            $resultado = $this->enlace->ExecuteSQL($vSqlLastId);
            
            return $resultado[0]['id'];
            
        } catch (Exception $e) {
            error_log("Error en OrdenPagoEfectivoModel::insert: " . $e->getMessage());
            handleException($e);
        }
    }
    
    /* Obtener todos los pagos en efectivo por orden_id */
    public function getByOrden($ordenId)
    {
        try {
            $vSql = "SELECT *
                     FROM orden_pago_efectivo
                     WHERE orden_id = " . (int)$ordenId;
            return $this->enlace->ExecuteSQL($vSql);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
    /* Eliminar un pago por ID */
    public function delete($id)
    {
        try {
            $vSql = "DELETE FROM orden_pago_efectivo WHERE efectivoId = " . (int)$id;
            return $this->enlace->ExecuteSQL($vSql);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
?>