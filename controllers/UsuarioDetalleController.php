<?php
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
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // GET - obtener uno por ID
    public function get($id)
    {
        try {
            $response = new Response();
            $usuarioDetalleM = new UsuarioDetalleModel();
            $result = $usuarioDetalleM->get($id);
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

            $usuarioDetalleM = new UsuarioDetalleModel();
            $result = $usuarioDetalleM->create($inputJSON);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // PUT - actualizar
    public function update()
    {
        try {
            $response = new Response();
            $request = new Request();
            $inputJSON = $request->getJSON();

            $usuarioDetalleM = new UsuarioDetalleModel();
            $result = $usuarioDetalleM->update($inputJSON);

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // DELETE - eliminar
    public function delete($id)
    {
        try {
            $response = new Response();
            $usuarioDetalleM = new UsuarioDetalleModel();
            $result = $usuarioDetalleM->delete($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
