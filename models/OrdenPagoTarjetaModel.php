<?php
class OrdenPagoTarjetaModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    
    /* Listar todos los pagos con tarjeta */
    public function all()
    {
        try {
            $vSql = "SELECT * FROM orden_pago_tarjeta;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
    /* Obtener un pago de tarjeta por ID */
    public function get($id)
    {
        try {
            $vSql = "
                SELECT 
                    opt.orden_pago_tarjeta_id,
                    opt.orden_id,
                    opt.numero_tarjeta,
                    opt.nombre_titular,
                    opt.fecha_expiracion,
                    opt.cvv,
                    opt.monto,
                    opt.fecha_pago,
                    o.ordenesId,
                    o.total AS total_orden,
                    u.usuarioId,
                    u.nombre_usuario
                FROM orden_pago_tarjeta opt
                JOIN ordenes o ON opt.orden_id = o.ordenesId
                JOIN usuarios u ON o.usuario_id = u.usuarioId
                WHERE opt.orden_pago_tarjeta_id = " . (int)$id;
                
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (empty($vResultado)) {
                return null;
            }
            return $vResultado[0];
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
    /* Obtener todos los pagos de tarjeta por orden_id */
    public function getByOrden($ordenId)
    {
        try {
            $vSql = "SELECT *
                     FROM orden_pago_tarjeta
                     WHERE orden_id = " . (int)$ordenId;
            return $this->enlace->ExecuteSQL($vSql);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
    /* Insertar nuevo pago */
    public function insert($data)
    {
        try {
            // Escapar datos
            $orden_id = (int)$data['orden_id'];
            $numero_tarjeta = $this->enlace->real_escape_string($data['numero_tarjeta']);
            $nombre_titular = $this->enlace->real_escape_string($data['nombre_titular']);
            $fecha_expiracion = $this->enlace->real_escape_string($data['fecha_expiracion']);
            $cvv = $this->enlace->real_escape_string($data['cvv']);
            $monto = (float)$data['monto'];
            
            $vSql = "INSERT INTO orden_pago_tarjeta
                        (orden_id, numero_tarjeta, nombre_titular, fecha_expiracion, cvv, monto, fecha_pago)
                     VALUES (
                        $orden_id, 
                        '$numero_tarjeta', 
                        '$nombre_titular', 
                        '$fecha_expiracion', 
                        '$cvv', 
                        $monto, 
                        NOW()
                     )";
                     
            $this->enlace->ExecuteSQL($vSql);
            
            // Obtener el ID insertado
            $vSqlLastId = "SELECT LAST_INSERT_ID() as id";
            $resultado = $this->enlace->ExecuteSQL($vSqlLastId);
            
            return $resultado[0]['id'];
            
        } catch (Exception $e) {
            error_log("Error en OrdenPagoTarjetaModel::insert: " . $e->getMessage());
            handleException($e);
        }
    }
    
    /* Eliminar un pago por ID */
    public function delete($id)
    {
        try {
            $vSql = "DELETE FROM orden_pago_tarjeta WHERE orden_pago_tarjeta_id = " . (int)$id;
            return $this->enlace->ExecuteSQL($vSql);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
?>