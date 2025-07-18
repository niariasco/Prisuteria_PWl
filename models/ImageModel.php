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

    /**
     * Subir imagen de un producto
     */

    // Subir múltiples imágenes para un producto
    // $files: arreglo $_FILES['imagenesNuevas']
    // $product_id: id del producto
    public function uploadFiles($files, $product_id)
    {
        $resultados = [];

        // Reorganizamos la estructura para iterar fácilmente
        $file_count = count($files['name']);
        for ($i = 0; $i < $file_count; $i++) {
            $fileName = $files['name'][$i];
            $tempPath = $files['tmp_name'][$i];
            $fileSize = $files['size'][$i];
            $fileError = $files['error'][$i];

            if (!empty($fileName)) {
                $fileExtArr = explode('.', $fileName);
                $fileActExt = strtolower(end($fileExtArr));
                $uniqueFileName = "product-" . uniqid() . "." . $fileActExt;

                if (in_array($fileActExt, $this->valid_extensions)) {
                    if (!file_exists($this->upload_path . $uniqueFileName)) {
                        if ($fileSize < 2000000 && $fileError == 0) {
                            if (move_uploaded_file($tempPath, $this->upload_path . $uniqueFileName)) {
                                $sql = "INSERT INTO imagenes (producto_id, url_imagen) VALUES ($product_id, '$uniqueFileName')";
                                $vResultado = $this->enlace->executeSQL_DML($sql);
                                if ($vResultado > 0) {
                                    $resultados[] = ['success' => true, 'message' => 'Imagen subida', 'filename' => $uniqueFileName];
                                } else {
                                    $resultados[] = ['success' => false, 'message' => 'Error BD al insertar imagen'];
                                }
                            } else {
                                $resultados[] = ['success' => false, 'message' => 'Error al mover archivo'];
                            }
                        } else {
                            $resultados[] = ['success' => false, 'message' => 'Archivo demasiado grande o con error'];
                        }
                    } else {
                        $resultados[] = ['success' => false, 'message' => 'Archivo ya existe'];
                    }
                } else {
                    $resultados[] = ['success' => false, 'message' => 'Extensión no válida'];
                }
            } else {
                $resultados[] = ['success' => false, 'message' => 'Archivo vacío'];
            }
        }
        return $resultados;
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