<?php
//localhost:81/apiproducto/producto
//localhost:81/apiprisuteria/producto
class producto
{
    //GET listar
    public function index()
    {
        try {
            $response = new Response();
            //Instancia modelo
            $productoM = new ProductoModel;
            //Método del modelo
            $result = $productoM->all();
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //GET Obtener 
   /* public function get($id)
    {
        try {
            $response = new Response();
            //Instancia del modelo
            $producto = new ProductoModel();
            //Acción del modelo a ejecutar
            $result = $producto->get($id);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }*/
    public function get($id)
{
    $response = new Response();
    $model = new ProductoModel();
    $producto = $model->get($id);

    if ($producto) {
        $imagenModel = new ImageModel();
        $producto->imagen = $imagenModel->getImageProducto($producto->productosId);
    }

    $response->toJSON($producto);
}
    public function productosXCategoria($idProductoXCategoria)
    {
        try {
            $response = new Response();
            //Instancia del modelo
            $producto = new ProductoModel();
            //Acción del modelo a ejecutar
            $result = $producto->productosXCategoria($idProductoXCategoria);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Obtener cantidad de peliculas por genero
    public function productosXResena($idproductosXResena)
    {
        try {
            $response = new Response();
            //Instancia del modelo
            $producto = new ProductoModel();
            //Acción del modelo a ejecutar
            $result = $producto->productXresenas($idproductosXResena);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    public function productosXpromo($param)
    {
        try {
            $response = new Response();
            //Instancia del modelo
            $producto = new ProductoModel();
            //Acción del modelo a ejecutar
            $result = $producto->productoXPromocion($param);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function obtenerProductosPromocion() 
{
    try {
        $productoModel = new ProductoModel();
        $response = new Response();

        $productos = $productoModel->obtenerConPromocionesVigentes();

        $response->toJSON([
            'success' => true,
            'data' => $productos
        ]);
    } catch (Exception $e) {
        handleException($e);
    }
}



    //POST Crear
public function create()
{
    $response = new Response();
    $request = new Request();

    // Obtener el JSON enviado por el frontend
    $inputJSON = $request->getJSON();

    // Instanciar modelo y crear producto
    $producto = new ProductoModel();
    $result = $producto->create($inputJSON);

    // Devolver la respuesta como JSON
    $response->toJSON($result);
}

    //PUT actualizar
    public function update()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $producto = new ProductoModel();
            //Acción del modelo a ejecutar
            $result = $producto->update($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

   public function cambiarEstado()
{
    try {
        $request = new Request();
        $response = new Response();
        $inputJSON = $request->getJSON(); // <-- recibe JSON
        $producto = new ProductoModel();
        $result = $producto->cambiarEstado($inputJSON);
        $response->toJSON($result);
    } catch (Exception $e) {
        handleException($e);
    }
}
}
