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
            $product_id = $object['producto_id'];

            $fileName = $file['name'];
            $tempPath = $file['tmp_name'];
            $fileSize = $file['size'];
            $fileError = $file['error'];

            if (!empty($fileName)) {
                //Crear un nombre único para el archivo
                $fileExt = explode('.', $fileName);
                $fileActExt = strtolower(end($fileExt));
                $fileName = "" . uniqid() . "." . $fileActExt;
                //Validar el tipo de archivo
                if (in_array($fileActExt, $this->valid_extensions)) {
                    //Validar que no exista
                    if (!file_exists($this->upload_path . $fileName)) {
                        //Validar que no sobrepase el tamaño
                        if ($fileSize < 2000000 && $fileError == 0) {
                            //Moverlo a la carpeta del servidor del API
                            if (move_uploaded_file($tempPath, $this->upload_path . $fileName)) {
                                //Guardarlo en la BD
                                 $sql = "INSERT INTO imagenes (producto_id, url_imagen) VALUES ($product_id, '$fileName')";
                                $vResultado = $this->enlace->executeSQL_DML($sql);
                                if ($vResultado > 0) {
                                   // return 'Imagen creada';
                                
     // Continúa con las imágenes múltiples después de la principal
                            }
                        }
                    }
                }
            }
        }

        // === Subir imágenes adicionales (imagenes_nuevas[]) ===
        if (isset($object['imagenes_nuevas']) && is_array($object['imagenes_nuevas'])) {
            foreach ($object['imagenes_nuevas'] as $img) {
                if (!empty($img['name'])) {
                    $imgName = $img['name'];
                    $imgTmp = $img['tmp_name'];
                    $imgSize = $img['size'];
                    $imgError = $img['error'];

                    $extParts = explode('.', $imgName);
                    $imgExt = strtolower(end($extParts));
                    $newName = uniqid() . "." . $imgExt;

                    if (in_array($imgExt, $this->valid_extensions)) {
                        if (!file_exists($this->upload_path . $newName)) {
                            if ($imgSize < 2000000 && $imgError == 0) {
                                if (move_uploaded_file($imgTmp, $this->upload_path . $newName)) {
                                    $sql = "INSERT INTO imagenes (producto_id, url_imagen) VALUES ($product_id, '$newName')";
                                    $this->enlace->executeSQL_DML($sql);
                                }
                            }
                        }
                    }
                }
            }
        }

        return 'Imágenes subidas correctamente';
    } catch (Exception $e) {
        handleException($e);
    }
}


  /**
     * Obtener imagen de un producto específico
     * @param int $idProducto
     * @return string|null - Nombre del archivo de imagen
     */
    public function getImageProducto($idProducto)
    {
        try {
            // Consulta SQL con los nombres correctos de tabla y campos
            $vSql = "SELECT url_imagen FROM imagenes WHERE producto_id = $idProducto LIMIT 1";
            
            // Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            
            if (!empty($vResultado)) {
                // Retornar solo el nombre del archivo
                return $vResultado[0]->url_imagen;
            }
            
            // Si no hay imagen, retornar imagen por defecto
            return 'default.jpg';
        } catch (Exception $e) {
            handleException($e);
            return 'default.jpg';
        }
    }

    /**
     * Obtener todas las imágenes de un producto
     * @param int $idProducto
     * @return array
     */
    public function getImagenesProducto($idProducto)
    {
    try {
        $vSql = "SELECT url_imagen FROM imagenes WHERE producto_id = $idProducto";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado ?: [];
    } catch (Exception $e) {
        handleException($e);
        return [];
    }
}

    /**
     * Eliminar imagen de un producto
     * @param int $idProducto
     * @return bool
     */
    public function deleteImageProducto($idProducto)
    {
        try {
            // Primero obtener el nombre del archivo
            $imagen = $this->getImageProducto($idProducto);
            
            if ($imagen && $imagen !== 'default.jpg') {
                // Eliminar archivo físico si existe
                if (file_exists($this->upload_path . $imagen)) {
                    unlink($this->upload_path . $imagen);
                }
                
                // Eliminar registro de la base de datos
                $sql = "DELETE FROM imagenes WHERE producto_id = $idProducto";
                $resultado = $this->enlace->executeSQL_DML($sql);
                
                return $resultado > 0;
            }
            
            return false;
        } catch (Exception $e) {
            handleException($e);
            return false;
        }
    }

    /**
     * Eliminar una imagen específica por su ID
     * @param int $imagenId
     * @return bool
     */
    public function deleteImageById($imagenId)
    {
        try {
            // Primero obtener la información de la imagen
            $vSql = "SELECT url_imagen FROM imagenes WHERE imagenId = $imagenId";
            $resultado = $this->enlace->ExecuteSQL($vSql);
            
            if (!empty($resultado)) {
                $nombreArchivo = $resultado[0]->url_imagen;
                
                // Eliminar archivo físico si existe
                if (file_exists($this->upload_path . $nombreArchivo)) {
                    unlink($this->upload_path . $nombreArchivo);
                }
                
                // Eliminar registro de la base de datos
                $sql = "DELETE FROM imagenes WHERE imagenId = $imagenId";
                $resultado = $this->enlace->executeSQL_DML($sql);
                
                return $resultado > 0;
            }
            
            return false;
        } catch (Exception $e) {
            handleException($e);
            return false;
        }
    }
}

/*
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
        // Obtener la información del archivo
        $fileName = $file['name'];
        $tempPath = $file['tmp_name'];
        $fileSize = $file['size'];
        $fileError = $file['error'];

        if (!empty($fileName)) {
            // Extraer la extensión
            $fileExt = explode('.', $fileName);
            $fileActExt = strtolower(end($fileExt));

            // Crear un nombre único para evitar sobreescritura
            $uniqueFileName = uniqid() . "." . $fileActExt;

            // Validar tipo de archivo
            if (in_array($fileActExt, $this->valid_extensions)) {
                // Validar que no exista ya el archivo
                if (!file_exists($this->upload_path . $uniqueFileName)) {
                    // Validar tamaño y error
                    if ($fileSize < 2000000 && $fileError == 0) {
                        // Mover archivo a carpeta uploads
                        if (move_uploaded_file($tempPath, $this->upload_path . $uniqueFileName)) {
                            // Guardar en BD (corregido 'producto_id')
                            $sql = "INSERT INTO image (producto_id, image) VALUES ($product_id, '$uniqueFileName')";
                            $vResultado = $this->enlace->executeSQL_DML($sql);
                            if ($vResultado > 0) {
                                return 'Imagen creada';
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

    /*
    public function uploadFile($object)
    {
        try {
            $file = $object['file'];
            $product_id = $object['product_id'];
            //Obtener la información del archivo
            $fileName = $file['name'];
            $tempPath = $file['tmp_name'];
            $fileSize = $file['size'];
            $fileError = $file['error'];

            if (!empty($fileName)) {
                //Crear un nombre único para el archivo
                $fileExt = explode('.', $fileName);
                $fileActExt = strtolower(end($fileExt));
               $fileName = "movie-" . uniqid() . "." . $fileActExt;
                //Validar el tipo de archivo
                if (in_array($fileActExt, $this->valid_extensions)) {
                    //Validar que no exista
                    if (!file_exists($this->upload_path . $fileName)) {
                        //Validar que no sobrepase el tamaño
                        if ($fileSize < 2000000 && $fileError == 0) {
                            //Moverlo a la carpeta del servidor del API
                            if (move_uploaded_file($tempPath, $this->upload_path . $fileName)) {
                                //Guardarlo en la BD
                                $sql = "INSERT INTO image (produtc_id,image) VALUES ($product_id, '$fileName')";
                                $vResultado = $this->enlace->executeSQL_DML($sql);
                                if ($vResultado > 0) {
                                    return 'Imagen creada';
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
        */
    //Obtener una imagen de una pelicula**/
    /*
    public function getImageProducto($idProducto)
    {
        try {
            
            //Consulta sql
            $vSql = "SELECT * FROM imagenes where producto_id=$idProducto";

            //Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            if (!empty($vResultado)) {
                // Retornar el objeto
                return $vResultado[0];
                
            }
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
*/