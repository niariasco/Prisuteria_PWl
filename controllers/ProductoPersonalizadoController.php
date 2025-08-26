<?php
class ProductoP
{
    //GET listar todos los productos personalizados
    public function index()
    {
        try {
            $response = new Response();
            $model = new ProductoPersonalizadoModel();
            $result = $model->getAll();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //GET obtener producto personalizado por ID
    public function get($id)
    {
        try {
            $response = new Response();
            $model = new ProductoPersonalizadoModel();
            $producto = $model->get($id);

            if (!$producto) {
                throw new Exception("Producto personalizado no encontrado");
            }

            $response->toJSON($producto);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //POST calcular precio total
    public function calcularPrecioTotal()
    {
        try {
            $response = new Response();
            $request = new Request();
            $data = $request->getJSON();

            // Soporte GET para pruebas en navegador
            if (!$data) {
                $data = [
                    "productoBaseId" => $_GET['productoBaseId'] ?? null,
                    "opciones" => isset($_GET['opciones']) ? json_decode($_GET['opciones'], true) : []
                ];
            }

            if (!$data['productoBaseId'] || !isset($data['opciones'])) {
                throw new Exception("Datos incompletos para calcular precio.");
            }

            $model = new ProductoPersonalizadoModel();
            $precioTotal = $model->calcularPrecioTotal($data['productoBaseId'], $data['opciones']);

            $response->toJSON([
                "success" => true,
                "precioTotal" => $precioTotal
            ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    //POST crear producto personalizado
    public function create()
    {
        try {
            $response = new Response();
            $request = new Request();
            $data = $request->getJSON();

            if (!$data['usuarioId'] || !$data['productoBaseId'] || !isset($data['opciones'])) {
                throw new Exception("Datos incompletos para crear producto personalizado.");
            }

            $model = new ProductoPersonalizadoModel();
            $idProducto = $model->guardarProductoPersonalizado(
                $data['usuarioId'],
                $data['productoBaseId'],
                $data['opciones']
            );

            $response->toJSON([
                "success" => true,
                "productoPersonalizadoId" => $idProducto
            ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    
}
