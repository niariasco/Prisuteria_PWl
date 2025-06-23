<?php
//class Genre
class image{
    //POST Crear
    public function create()
    {
        try {
            /* $file=null;
            if (isset($_FILES['file'])){
                $file = $_FILES['file'];
            } */
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputFILE = $request->getBody();
            //Instancia del modelo
            $movie = new ImageModel();
            //Acción del modelo a ejecutar
            $result = $movie->uploadFile($inputFILE);
           
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    // Ejemplo en el controlador ImageController.php
public function subirImagen()
{
    if ($_FILES && isset($_POST['product_id'])) {
        $imageModel = new ImageModel();

        $result = $imageModel->uploadFile([
            'file' => $_FILES['file'],
            'product_id' => $_POST['product_id']
        ]);

        if ($result) {
            // Devuelve el nombre del archivo en JSON
            echo json_encode(['filename' => $result]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Error al subir la imagen']);
        }
    }
}

}