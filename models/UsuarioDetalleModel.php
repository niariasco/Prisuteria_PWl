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
            $vSql = "SELECT * FROM UsuarioDetalle;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    // Obtener un registro por ID
    public function get($id)
    {
        try {
            $vSql = "SELECT * FROM UsuarioDetalle WHERE usuarioDetalleId = $id;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);

            if ($vResultado) {
                return $vResultado[0]; // Retorna solo un objeto
            }
            return null;
        } catch (Exception $e) {
            error_log("Error en UsuarioDetalleModel::get(): " . $e->getMessage());
            return null;
        }
    }

    // Crear un nuevo registro
    public function create($objeto)
    {
        try {
            $vSql = "INSERT INTO UsuarioDetalle 
                        (usuarioId, nombre_completo, cedula, correo, telefono, direccion_envio)
                     VALUES 
                        ($objeto->usuarioId,
                        '$objeto->nombre_completo',
                        '$objeto->cedula',
                        '$objeto->correo',
                        '$objeto->telefono',
                        '$objeto->direccion_envio')";
            
            $vResultado = $this->enlace->executeSQL_DML_last($vSql);
            return $this->get($vResultado); // retorna el objeto recién creado
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Actualizar un registro existente
    public function update($objeto)
    {
        try {
            $vSql = "UPDATE UsuarioDetalle SET
                        nombre_completo = '$objeto->nombre_completo',
                        cedula = '$objeto->cedula',
                        correo = '$objeto->correo',
                        telefono = '$objeto->telefono',
                        direccion_envio = '$objeto->direccion_envio'
                     WHERE usuarioDetalleId = $objeto->usuarioDetalleId";

            $this->enlace->executeSQL_DML($vSql);
            return $this->get($objeto->usuarioDetalleId);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Eliminar un registro
    public function delete($id)
    {
        try {
            $vSql = "DELETE FROM UsuarioDetalle WHERE usuarioDetalleId = $id;";
            $this->enlace->executeSQL_DML($vSql);
            return ["success" => true];
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
