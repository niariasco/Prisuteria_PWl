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
ORDER BY p.nombre DESC;
";

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
             $vSql = "SELECT 
    p.*, 
    i.url_imagen AS imagen,
    c.nombreSCategoria AS nombreSCategoria,
    ROUND(AVG(r.calificacion), 2) AS promedio_valoracion,
    GROUP_CONCAT(DISTINCT e.nombrEtiquetas SEPARATOR ', ') AS etiquetas,
    GROUP_CONCAT(DISTINCT CONCAT('  ', r.comentario) SEPARATOR '\n') AS comentarios_resenas,

    -- Promoción (si aplica)
    MAX(pr.nombre) AS nombre_promocion,
    MAX(pr.descuento) AS descuento,
    MAX(ROUND(p.precio - (p.precio * pr.descuento / 100), 2)) AS precio_con_descuento

FROM productos p
LEFT JOIN imagenes i ON p.productosId = i.producto_id
LEFT JOIN categorias c ON p.categoria_id = c.categoriaId
LEFT JOIN resenas r ON p.productosId = r.producto_id
LEFT JOIN productoetiqueta pe ON p.productosId = pe.producto_id
LEFT JOIN etiquetas e ON pe.etiqueta_id = e.etiquetaId

-- JOIN promociones activas
LEFT JOIN promociones pr 
    ON (
        (pr.ProductoID = p.productosId OR pr.CategoriaID = p.categoria_id)
        AND pr.activo = 1
        AND NOW() BETWEEN pr.fecha_inicio AND pr.fecha_fin
    )

WHERE p.productosId = $id
GROUP BY p.productosId";          
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

            return $producto;
        }

        return null;
    } catch (Exception $e) {
        handleException($e);
        return null;
    }
}
    //  $vSql = "SELECT * FROM productos
    //          where productosId=$id;";

    //Ejecutar la consulta sql
    //   $vResultado = $this->enlace->executeSQL($vSql);
    //   if(!empty($vResultado)){
    //   $vResultado=$vResultado[0];
    //Imagenes
    //         $vResultado->imagen=$imagenM->getImageProducto(idProducto:($vResultado->productosId));
    //Director
    //  $director=$directorM->get($vResultado->director_id);
    //   $vResultado->director=$director;
    //Generos --genres
    //   $listaGeneros=$genreM->getGenreMovie($vResultado->id);
    //   $vResultado->genres=$listaGeneros;
    //Actores --actors
    //  $listaActores=$actorM->getActorMovie($id);
    //  $vResultado->actors=$listaActores;


    //Retornar la respuesta
    //    return $vResultado;
    //  } catch (Exception $e) {
    //       handleException($e);
    // }
    // }
    /**
     * Obtener las productos por categoria
     * @param $idShopRental identificador de la tienda
     * @return $vresultado - Lista de productos incluyendo el precio
     */

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

        $vSQL = "
        SELECT 
            p.*, 
            c.nombreSCategoria AS nombre_categoria
        FROM productos p
        INNER JOIN categorias c ON p.categoria_id = c.categoriaId
        WHERE p.categoria_id = $categoriaId
        ORDER BY c.nombreSCategoria, p.nombre
        ";

        $vResultado = $this->enlace->ExecuteSQL($vSQL);

        if (!empty($vResultado) && is_array($vResultado)) {
            for ($i = 0; $i < count($vResultado); $i++) {
                $vResultado[$i]->imagen = $imagenM->getImageProducto($vResultado[$i]->productosId);
            }
        }

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
    $sql = "
        SELECT
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

        $vSQL = "
        SELECT 
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


    /**
     * Obtener la cantidad de productos por genero
     * @param 
     * @return $vresultado - Cantidad de productos por genero
     */
    /*
    public function getCountByGenre()
    {
        try {

            $vResultado = null;
            //Consulta sql
            $vSql = "SELECT count(mg.genre_id) as 'Cantidad', g.title as 'Genero'
            FROM genre g, movie_genre mg, movie m
            where mg.movie_id=m.id and mg.genre_id=g.id
            group by mg.genre_id";

            //Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            // Retornar el objeto
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    */
    /**
     * Crear producto
     * @param $objeto producto a Insertinto   * @return $this->get($producto) - Objeto producto
     */

    public function create($objeto)
    {
        try {
            // 1. Insertar producto
            $sql = "INSERT INTO productos (nombre, descripcion, precio, cantidad, categoria_id)
                VALUES ($objeto->nombre, $objeto->descripcion, $objeto->precio, $objeto->cantidad, $objeto->categoria_id)";
            $idProducto = $this->enlace->executeSQL_DML_last($sql); // Obtener ID del producto insertado

            // 2. Insertar imágenes asociadas (si hay)
            foreach ($objeto->imagenes as $imagen) {
                $url = $imagen->url_imagen;
                $desc = $imagen->descripcion_imagen;
                $principal = $imagen->es_principal ? 'TRUE' : 'FALSE';

                $sql = "INSERT INTO imagenes (producto_id, url_imagen, descripcion_imagen, es_principal)
                    VALUES ($idProducto, '$url', '$desc', $principal)";
                $this->enlace->executeSQL_DML($sql);
            }

            // 3. Devolver el producto creado
            return $this->get($idProducto);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Actualizar producto
     * @param $objeto producto a actualizar
     * @return $this->get($producto) - Objeto producto
     */


    public function update($objeto)
    {
        try {
            //Consulta sql
            $sql = "Update productos SET nombre ='$objeto->nombre'," .
                "descripcion = '$objeto->descripcion', precio = $objeto->precio," .
                "cantidad = $objeto->cantidad, categoria_id = $objeto->categoria_id" .
                " Where id=$objeto->id";

            //Ejecutar la consulta
            $cResults = $this->enlace->executeSQL_DML($sql);


            //Retornar pelicula
            return $this->get($objeto->productosId);
        } catch (Exception $e) {
            handleException($e);
        }
    }


}
