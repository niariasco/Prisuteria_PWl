<?php
// Función para manejar excepciones
function handleException($e) {
    error_log("Exception: " . $e->getMessage());
    http_response_code(500);
    $response = new Response();
    $response->toJSON([
        'error' => true,
        'message' => $e->getMessage(),
        'details' => 'Error interno del servidor'
    ]);
    exit;
}

//localhost:81/apiusuario/usuarioDetalle
class usuarioDetalle
{
    // GET - listar todos
    public function index()
    {
        try {
            $response = new Response();
            $usuarioDetalleM = new UsuarioDetalleModel();
            $result = $usuarioDetalleM->all();
            
            // Asegurar que siempre retornamos un array
            if (!$result) {
                $result = [];
            }
            
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
    // GET - obtener uno por ID
    public function get($id)
    {
        try {
            if (!$id || !is_numeric($id)) {
                throw new Exception("ID inválido proporcionado");
            }
            
            $response = new Response();
            $usuarioDetalleM = new UsuarioDetalleModel();
            $result = $usuarioDetalleM->get($id);
            
            if (!$result) {
                http_response_code(404);
                $response->toJSON([
                    'error' => true,
                    'message' => 'Detalle de usuario no encontrado'
                ]);
                return;
            }
            
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
    // GET - obtener por usuarioId - NUEVO MÉTODO
    public function getByUsuario($usuarioId)
    {
        try {
            if (!$usuarioId || !is_numeric($usuarioId)) {
                throw new Exception("Usuario ID inválido");
            }
            
            $response = new Response();
            $usuarioDetalleM = new UsuarioDetalleModel();
            $result = $usuarioDetalleM->getByUsuarioId($usuarioId);
            
            // Asegurar que siempre retornamos un array
            if (!$result) {
                $result = [];
            }
            
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
    // POST - crear
    public function create()
    {
        try {
            $response = new Response();
            $request = new Request();
            $inputJSON = $request->getJSON();
            
            if (!$inputJSON) {
                throw new Exception("No se recibieron datos válidos");
            }
            
            $usuarioDetalleM = new UsuarioDetalleModel();
            $result = $usuarioDetalleM->create($inputJSON);
            
            http_response_code(201); // Created
            $response->toJSON([
                'success' => true,
                'message' => 'Detalle de usuario creado correctamente',
                'data' => $result
            ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
    // PUT - actualizar
    public function update($id = null)
    {
        try {
            $response = new Response();
            $request = new Request();
            $inputJSON = $request->getJSON();
            
            if (!$inputJSON) {
                throw new Exception("No se recibieron datos válidos");
            }
            
            // Si no se pasa ID como parámetro, intentar obtenerlo del JSON
            if (!$id && isset($inputJSON->usuarioDetalleId)) {
                $id = $inputJSON->usuarioDetalleId;
            }
            
            if (!$id) {
                throw new Exception("ID requerido para actualizar");
            }
            
            // Asegurar que el ID esté en el objeto
            $inputJSON->usuarioDetalleId = $id;
            
            $usuarioDetalleM = new UsuarioDetalleModel();
            $result = $usuarioDetalleM->update($inputJSON);
            
            $response->toJSON([
                'success' => true,
                'message' => 'Detalle de usuario actualizado correctamente',
                'data' => $result
            ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
    // DELETE - eliminar
    public function delete($id)
    {
        try {
            if (!$id || !is_numeric($id)) {
                throw new Exception("ID inválido para eliminar");
            }
            
            $response = new Response();
            $usuarioDetalleM = new UsuarioDetalleModel();
            $result = $usuarioDetalleM->delete($id);
            
            $response->toJSON([
                'success' => true,
                'message' => 'Detalle de usuario eliminado correctamente'
            ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}