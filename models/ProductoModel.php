<?php
class ProductoModel
{
    //Conectarse a la BD
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    /**
     * Listar productos
     * @param 
     * @return $vResultado - Lista de objetos
     */

    public function all()
    {
        try {
            $imagenM = new ImageModel();
            //Consulta SQL
            // $vSQL = "SELECT * FROM productos order by nombre desc;";
            //Consulta SQL con JOIN para obtener las imágenes directamente
            $vSQL = "SELECT p.*, i.url_imagen AS imagen
                 FROM productos p
                 LEFT JOIN (
                     SELECT i1.*
                     FROM imagenes i1
                     INNER JOIN (
                         SELECT producto_id, MIN(imagenId) AS min_imagenId
                         FROM imagenes
                         GROUP BY producto_id
                     ) i2 ON i1.imagenId = i2.min_imagenId
                 ) i ON p.productosId = i.producto_id
                 WHERE p.activo = 1
                 ORDER BY p.nombre DESC;";

            $vResultado = $this->enlace->ExecuteSQL($vSQL);
            //Incluir imagenes
            if (!empty($vResultado) && is_array($vResultado)) {
                for ($i = 0; $i < count($vResultado); $i++) {
                    $vResultado[$i] = $this->get($vResultado[$i]->productosId);

                    $vResultado[$i]->imagen = $imagenM->getImageProducto(($vResultado[$i]->productosId));
                }
            }

            //Retornar la respuesta

            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    /**
     * Obtener una producto
     * @param $id de la producto
     * @return $vresultado - Objeto producto
     */
    //
    public function get($id)
    {
        try {
            // $directorM=new DirectorModel();
            //   $genreM=new GenreModel();
            // $actorM=new ActorModel();
            $imagenM = new ImageModel();
            //Consulta SQL con JOIN para obtener la imagen
            // $vSql = "SELECT p.*, i.url_imagen as imagen 
            //       FROM productos p 
            //      LEFT JOIN imagenes i ON p.productosId = i.producto_id 
            //    WHERE p.productosId = $id";
            $vSql = "   SELECT 
    p.*, 
    i.url_imagen AS imagen,
    c.nombreSCategoria AS nombreSCategoria,
    ROUND(AVG(r.calificacion), 2) AS promedio_valoracion,
    GROUP_CONCAT(DISTINCT e.nombrEtiquetas SEPARATOR ', ') AS etiquetas,
    GROUP_CONCAT(DISTINCT CONCAT('  ', r.comentario) SEPARATOR '\n') AS comentarios_resenas,

    -- Promociones separadas
    promop.nombre AS nombre_promocion_producto,
    promop.descuento AS descuento_producto,
    promoc.nombre AS nombre_promocion_categoria,
    promoc.descuento AS descuento_categoria,

    -- Descuento combinado acumulativo
    ROUND(
      p.precio 
      * IF(promop.descuento IS NOT NULL, 1 - promop.descuento / 100, 1)
      * IF(promoc.descuento IS NOT NULL, 1 - promoc.descuento / 100, 1)
    , 2) AS precio_con_descuento

FROM productos p
LEFT JOIN imagenes i ON p.productosId = i.producto_id
LEFT JOIN categorias c ON p.categoria_id = c.categoriaId
LEFT JOIN resenas r ON p.productosId = r.producto_id
LEFT JOIN productoetiqueta pe ON p.productosId = pe.producto_id
LEFT JOIN etiquetas e ON pe.etiqueta_id = e.etiquetaId

-- PROMOCIÓN por producto
LEFT JOIN promociones promop
  ON promop.ProductoID = p.productosId
  AND promop.tipo = 'Producto'
  AND promop.activo = 1
  AND NOW() BETWEEN promop.fecha_inicio AND promop.fecha_fin

-- PROMOCIÓN por categoría
LEFT JOIN promociones promoc
  ON promoc.CategoriaID = p.categoria_id
  AND promoc.tipo = 'Categoria'
  AND promoc.activo = 1
  AND NOW() BETWEEN promoc.fecha_inicio AND promoc.fecha_fin

WHERE p.productosId = $id
GROUP BY p.productosId;

  
";
          
        // Ejecutar la consulta del producto
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (!empty($vResultado)) {
            $producto = $vResultado[0];
            $producto->id = $producto->productosId;

            // Imágenes
            $imagenes = $imagenM->getImagenesProducto($id);
            if (isset($imagenes->url_imagen)) {
                $producto->imagenes = [$imagenes->url_imagen];
            } else if (is_array($imagenes)) {
                $producto->imagenes = array_map(function ($img) {
                    return $img->url_imagen;
                }, $imagenes);
            } else {
                $producto->imagenes = ['default.jpg'];
            }

            // Reseñas completas con usuario
            $sqlResenas = "
                SELECT 
                    r.resenasId,
                    u.nombre_usuario AS nombre,
                    r.comentario,
                    r.calificacion,
                    r.fecha
                FROM resenas r
                JOIN usuarios u ON r.usuario_id = u.usuarioId
                WHERE r.producto_id = $id
                ORDER BY r.fecha DESC
            ";
            $resenas = $this->enlace->ExecuteSQL($sqlResenas);
            $producto->resenas = $resenas;


$sqlCriterios = "
    SELECT 
        c.id AS criterio_id, 
        c.nombre AS criterio_nombre, 
        o.id AS opcion_id, 
        o.nombre AS opcion_nombre, 
        o.precio_adicional
    FROM criterios c
    JOIN opciones o ON o.criterio_id = c.id
    ORDER BY c.id, o.id
";

$criteriosOpcionesRaw = $this->enlace->ExecuteSQL($sqlCriterios);

$criterios = [];
foreach ($criteriosOpcionesRaw as $row) {
    $cId = $row->criterio_id;
    if (!isset($criterios[$cId])) {
        $criterios[$cId] = [
            'id' => $cId,
            'nombre' => $row->criterio_nombre,
            'opciones' => []
        ];
    }
    $criterios[$cId]['opciones'][] = [
        'id' => $row->opcion_id,
        'nombre' => $row->opcion_nombre,
        'precio_adicional' => $row->precio_adicional
    ];
}

$producto->criterios = array_values($criterios);

        
        
        
            return $producto;
        }

        return null;
    } catch (Exception $e) {
        handleException($e);
        return null;
    }
}


    public function productXresenas($id)
    {
        try {

            $vSQL = "SELECT 
    r.resenasId, 
    u.nombre_usuario AS nombre_usuario, 
    r.comentario, 
    r.fecha, 
    r.calificacion
FROM resenas r
JOIN usuarios u ON r.usuario_id = u.usuarioId
JOIN productos p ON r.producto_id = p.productosId
WHERE r.producto_id = $id";

            $vResultado = $this->enlace->ExecuteSQL($vSQL);


            //Retornar la respuesta

            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }


    public function productosXCategoria($categoriaId)
    {
        try {
            $imagenM = new ImageModel();
            //Consulta SQL
            $vSQL = "    SELECT p.*, c.nombre AS nombre_categoria
                FROM productos p
             JOIN categorias c ON p.categoria_id =$categoriaId
                ORDER BY c.nombre, p.nombre";
            //Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSQL);

            //Incluir imagenes
            if (!empty($vResultado) && is_array($vResultado)) {
                for ($i = 0; $i < count($vResultado); $i++) {
                    $vResultado[$i]->imagen = $imagenM->getImageProducto(idProducto: ($vResultado[$i]->id));
                }
            }
            //Retornar la respuesta

            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtener las productos por categoria
     * @param $idShopRental identificador de la tienda
     * @return $vresultado - Lista de productos incluyendo el precio
     */


public function obtenerConPromocionesVigentes()
{
    $sql = "        SELECT
            pr.productosId AS id,
            pr.nombre,
            pr.precio AS precio_original,
            c.nombreSCategoria AS categoria,
            pr.descripcion,
            pr.inventario AS stock,
            p.id AS promocion_id,
            p.nombre AS nombre_promocion,
            p.descuento,
            p.tipo AS tipo_promocion,
            p.fecha_inicio,
            p.fecha_fin,
            ROUND(pr.precio - (pr.precio * p.descuento / 100), 2) AS precio_final
        FROM productos pr
        INNER JOIN categorias c ON pr.categoria_id = c.categoriaId
        INNER JOIN promociones p ON (
            p.activo = 1
            AND CURDATE() BETWEEN p.fecha_inicio AND p.fecha_fin
            AND (
                (p.tipo = 'Producto' AND p.ProductoID = pr.productosId)
                OR
                (p.tipo = 'Categoria' AND p.CategoriaID = pr.categoria_id)
            )
        )
        ORDER BY pr.nombre
    ";

    return $this->enlace->ExecuteSQL($sql);
}







    public function productoXPromocion($idPromocion)
{
    try {
        $imagenM = new ImageModel();

        $vSQL = "        SELECT 
            p.productosId,
            p.nombre,
            p.descripcion,
            p.precio AS precio_original,
            ROUND(p.precio * (1 - pr.descuento / 100), 2) AS precio_con_descuento,
            pr.descuento,
            pr.nombre AS nombre_promocion,
            pr.tipo,
            c.nombreSCategoria AS nombre_categoria,
            i.url_imagen AS imagen
        FROM productos p
        INNER JOIN categorias c ON p.categoria_id = c.categoriaId
        LEFT JOIN promocion_productos pp ON p.productosId = pp.producto_id AND pp.promocion_id = $idPromocion
        LEFT JOIN promocion_categorias pc ON p.categoria_id = pc.categoria_id AND pc.promocion_id = $idPromocion
        LEFT JOIN promociones pr ON pr.id = $idPromocion
        LEFT JOIN (
            SELECT i1.*
            FROM imagenes i1
            INNER JOIN (
                SELECT producto_id, MIN(imagenId) AS min_imagenId
                FROM imagenes
                GROUP BY producto_id
            ) i2 ON i1.imagenId = i2.min_imagenId
        ) i ON p.productosId = i.producto_id
        WHERE pr.activo = TRUE
          AND CURDATE() BETWEEN pr.fecha_inicio AND pr.fecha_fin
          AND (pp.producto_id IS NOT NULL OR pc.categoria_id IS NOT NULL)
        GROUP BY p.productosId
        ";

        $vResultado = $this->enlace->ExecuteSQL($vSQL);

        if (!empty($vResultado) && is_array($vResultado)) {
            for ($i = 0; $i < count($vResultado); $i++) {
                if (empty($vResultado[$i]->imagen)) {
                    $vResultado[$i]->imagen = $imagenM->getImageProducto($vResultado[$i]->productosId);
                }
            }
        }

        return $vResultado;
    } catch (Exception $e) {
        handleException($e);
    }
}



public function create($objeto) {
              try {
            //Consulta sql
            //Identificador autoincrementable
            $sql = "Insert into productos (nombre, descripcion, precio, categoria_id)".
                    " Values ('$objeto->nombre',
                    '$objeto->descripcion','$objeto->precio',$objeto->categoria_id)";

            //Ejecutar la consulta
            //Obtener ultimo insert
            $idproducto=$this->enlace->executeSQL_DML_last($sql);
            //Crear elementos a insertar en etiquetas
            foreach ($objeto->etiquetas as $value) {
                $sql="Insert into productoetiqueta(producto_id,etiqueta_id)".
                    " Values($idproducto,$value)";
                $vResultadoGen=$this->enlace->executeSQL_DML($sql);
            }
            //Retornar pelicula
            return $this->get($idproducto);
        } catch (Exception $e) {
            handleException($e);
        }
    }

       
    /**
     * Actualizar producto
     * @param $objeto producto a actualizar
     * @return $this->get($producto) - Objeto producto
     */


public function update($objeto) {
    try {

        $sql = "UPDATE productos SET 
                    nombre = '$objeto->nombre',
                    descripcion = '$objeto->descripcion',
                    precio = $objeto->precio,
                    categoria_id = $objeto->categoria_id
                    WHERE productosId = $objeto->productosId";
        $this->enlace->executeSQL_DML($sql);

        //(muchas a muchas)
        $sql = "DELETE FROM productoetiqueta WHERE producto_id = $objeto->productosId";
        $this->enlace->executeSQL_DML($sql);

        foreach ($objeto->etiquetas as $etiquetaId) {
            $sql = "INSERT INTO productoetiqueta (producto_id, etiqueta_id)
                    VALUES ($objeto->productosId, $etiquetaId)";
            $this->enlace->executeSQL_DML($sql);
        }

        // eliminar imágenes (si corresponde)
if (!empty($objeto->imagenes_eliminar)) {
    foreach ($objeto->imagenes_eliminar as $nombreImagen) {
        //$nombreImagenEsc = $this->enlace->real_escape_string($nombreImagen);
        $nombreImagenEsc = addslashes($nombreImagen);
        $sql = "DELETE FROM imagenes WHERE url_imagen = '$nombreImagenEsc' AND producto_id = $objeto->productosId";
        $this->enlace->executeSQL_DML($sql);
    }
}
/*
        // insertar nuevas imágenes
if (!empty($objeto->imagenes_nuevas)) {
    foreach ($objeto->imagenes_nuevas as $img) {

        if (is_object($img) && isset($img->name)) {
            // nombre único
            $nombreArchivo = uniqid() . "_" . basename($img->name);
            $rutaDestino = __DIR__ . "uploads/" . $nombreArchivo;

            if (move_uploaded_file($img->tmp_name, $rutaDestino)) {
                $sql = "INSERT INTO imagenes (producto_id, url_imagen) 
                        VALUES ($objeto->productosId, '$nombreArchivo')";
                $this->enlace->executeSQL_DML($sql);
            }
        } else {
            //if URL existente
            $urlImagen = addslashes((string) $img);
            $sql = "INSERT INTO imagenes (producto_id, url_imagen) 
                    VALUES ($objeto->productosId, '$urlImagen')";
            $this->enlace->executeSQL_DML($sql);
        }
    }
}
*/

        return $this->get($objeto->productosId);

    } catch (Exception $e) {
        handleException($e);
    }
}

// ProductoController.php

public function cambiarEstado($data)
{
    try {
        if (!isset($data->productosId) || !isset($data->activo)) {
            throw new Exception('Faltan datos para cambiar estado');
        }

        $id = (int)$data->productosId;
        $activo = (int)$data->activo;

        $sql = "UPDATE productos SET activo = $activo WHERE productosId = $id";
        $this->enlace->executeSQL_DML($sql);

        return ['success' => true, 'message' => 'Estado actualizado'];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Error_Cambiar_Estado', 'error' => $e->getMessage()];
    }
}


}