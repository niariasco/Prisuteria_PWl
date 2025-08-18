<?php
class UsuarioDetalleModel
{
    public $enlace;
    
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    
    // Listar todos los registros
    public function all()
    {
        try {
            $vSql = "SELECT * FROM UsuarioDetalle ORDER BY created_at DESC";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            error_log("Error en UsuarioDetalleModel::all(): " . $e->getMessage());
            throw new Exception("Error al obtener los detalles de usuario: " . $e->getMessage());
        }
    }
    
    // Obtener un registro por ID
    public function get($id)
    {
        try {
            if (!is_numeric($id)) {
                throw new Exception("ID inválido");
            }
            
            $vSql = "SELECT * FROM UsuarioDetalle WHERE usuarioDetalleId = ?";
            $vResultado = $this->enlace->ExecuteSQLWithParams($vSql, [$id]);
            
            if ($vResultado && count($vResultado) > 0) {
                return $vResultado[0];
            }
            return null;
        } catch (Exception $e) {
            error_log("Error en UsuarioDetalleModel::get(): " . $e->getMessage());
            throw new Exception("Error al obtener el detalle de usuario: " . $e->getMessage());
        }
    }
    
    // Obtener registros por usuarioId - NUEVO MÉTODO
    public function getByUsuarioId($usuarioId)
    {
        try {
            if (!is_numeric($usuarioId)) {
                throw new Exception("Usuario ID inválido");
            }
            
            $vSql = "SELECT * FROM UsuarioDetalle WHERE usuarioId = ?";
            $vResultado = $this->enlace->ExecuteSQLWithParams($vSql, [$usuarioId]);
            return $vResultado;
        } catch (Exception $e) {
            error_log("Error en UsuarioDetalleModel::getByUsuarioId(): " . $e->getMessage());
            throw new Exception("Error al obtener detalles por usuario: " . $e->getMessage());
        }
    }
    
    // Crear un nuevo registro
    public function create($objeto)
    {
        try {
            // Validar datos requeridos
            if (!isset($objeto->usuarioId) || !isset($objeto->nombre_completo) || !isset($objeto->correo)) {
                throw new Exception("Datos requeridos faltantes");
            }
            
            $vSql = "INSERT INTO UsuarioDetalle 
                        (usuarioId, nombre_completo, cedula, correo, telefono, direccion_envio, created_at)
                     VALUES 
                        (?, ?, ?, ?, ?, ?, NOW())";
            
            $params = [
                $objeto->usuarioId,
                $objeto->nombre_completo,
                $objeto->cedula ?? '',
                $objeto->correo,
                $objeto->telefono ?? '',
                $objeto->direccion_envio ?? ''
            ];
            
            $vResultado = $this->enlace->executeSQL_DML_last_with_params($vSql, $params);
            return $this->get($vResultado);
        } catch (Exception $e) {
            error_log("Error en UsuarioDetalleModel::create(): " . $e->getMessage());
            throw new Exception("Error al crear el detalle de usuario: " . $e->getMessage());
        }
    }
    
    // Actualizar un registro existente
    public function update($objeto)
    {
        try {
            if (!isset($objeto->usuarioDetalleId)) {
                throw new Exception("ID del detalle de usuario requerido");
            }
            
            $vSql = "UPDATE UsuarioDetalle SET
                        nombre_completo = ?,
                        cedula = ?,
                        correo = ?,
                        telefono = ?,
                        direccion_envio = ?,
                        updated_at = NOW()
                     WHERE usuarioDetalleId = ?";
            
            $params = [
                $objeto->nombre_completo,
                $objeto->cedula ?? '',
                $objeto->correo,
                $objeto->telefono ?? '',
                $objeto->direccion_envio ?? '',
                $objeto->usuarioDetalleId
            ];
            
            $this->enlace->executeSQL_DML_with_params($vSql, $params);
            return $this->get($objeto->usuarioDetalleId);
        } catch (Exception $e) {
            error_log("Error en UsuarioDetalleModel::update(): " . $e->getMessage());
            throw new Exception("Error al actualizar el detalle de usuario: " . $e->getMessage());
        }
    }
    
    // Eliminar un registro
    public function delete($id)
    {
        try {
            if (!is_numeric($id)) {
                throw new Exception("ID inválido");
            }
            
            $vSql = "DELETE FROM UsuarioDetalle WHERE usuarioDetalleId = ?";
            $this->enlace->executeSQL_DML_with_params($vSql, [$id]);
            return ["success" => true, "message" => "Detalle de usuario eliminado correctamente"];
        } catch (Exception $e) {
            error_log("Error en UsuarioDetalleModel::delete(): " . $e->getMessage());
            throw new Exception("Error al eliminar el detalle de usuario: " . $e->getMessage());
        }
    }
}