<?php
class ImageModel
{
    private $upload_path = 'uploads/';
    private $valid_extensions = array('jpeg', 'jpg', 'png', 'gif');

    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    //Subir imagen de una pelicula registrada
      public function uploadFile($object)
    {
        try {
            $file = $object['file'];
            $product_id = $object['product_id'];

            $fileName = $file['name'];
            $tempPath = $file['tmp_name'];
            $fileSize = $file['size'];
            $fileError = $file['error'];

            if (!empty($fileName)) {
                $fileExt = explode('.', $fileName);
                $fileActExt = strtolower(end($fileExt));
                $newFileName = uniqid() . "." . $fileActExt;

                if (in_array($fileActExt, $this->valid_extensions)) {
                    if (!file_exists($this->upload_path . $newFileName)) {
                        if ($fileSize < 2000000 && $fileError == 0) {
                            if (move_uploaded_file($tempPath, $this->upload_path . $newFileName)) {
                                $sql = "INSERT INTO imagenes (producto_id, image) VALUES ($product_id, '$newFileName')";
                                $vResultado = $this->enlace->executeSQL_DML($sql);
                                if ($vResultado > 0) {
                                    // Retornamos el nombre del archivo para frontend
                                    return $newFileName;
                                }
                                return false;
                            }
                        }
                    }
                }
            }
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Obtener el nombre de la imagen de un producto
    public function getImageProducto($idProducto)
    {
        try {
            $vSql = "
                SELECT image 
                FROM imagenes 
                WHERE producto_id = $idProducto 
                ORDER BY imagenId ASC 
                LIMIT 1
            ";

            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (!empty($vResultado)) {
                return $vResultado[0]['image']; // Solo el nombre del archivo
            }
            return null;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}