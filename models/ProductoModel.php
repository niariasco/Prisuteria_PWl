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
            $imagenM=new ImageModel();
            //Consulta SQL
            $vSQL = "SELECT * FROM productos order by nombre desc;";
            //Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSQL);
            //Incluir imagenes
            if(!empty($vResultado) && is_array($vResultado)){
                for ($i=0; $i < count($vResultado); $i++) { 
                    $vResultado[$i]=$this->get($vResultado[$i]->id);

                    //$vResultado[$i]->imagen=$imagenM->getImageMovie(($vResultado[$i]->id));
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
            $imagenM=new ImageModel();
            $vSql = "SELECT * FROM productos
                    where id=$id;";

            //Ejecutar la consulta sql
            $vResultado = $this->enlace->executeSQL($vSql);
            if(!empty($vResultado)){
                $vResultado=$vResultado[0];
                //Imagenes
                $vResultado->imagen=$imagenM->getImageProducto(idProducto:($vResultado->id));
                //Director
              //  $director=$directorM->get($vResultado->director_id);
             //   $vResultado->director=$director;
                //Generos --genres
             //   $listaGeneros=$genreM->getGenreMovie($vResultado->id);
             //   $vResultado->genres=$listaGeneros;
                //Actores --actors
              //  $listaActores=$actorM->getActorMovie($id);
              //  $vResultado->actors=$listaActores;
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
    
       public function productosXCategoria($categoriaId)
    {
        try {
            $imagenM=new ImageModel();
            //Consulta SQL
            $vSQL = "    SELECT p.*, c.nombre AS nombre_categoria
                FROM productos p
             JOIN categorias c ON p.categoria_id =$categoriaId
                ORDER BY c.nombre, p.nombre";
            //Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSQL);

            //Incluir imagenes
            if(!empty($vResultado) && is_array($vResultado)){
                for ($i=0; $i < count($vResultado); $i++) { 
                    $vResultado[$i]->imagen=$imagenM->getImageProducto(idProducto: ($vResultado[$i]->id));
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
    
       public function productoXPromocion($idProducto)
    {
        try {
            $imagenM=new ImageModel();
            //Consulta SQL
            $vSQL = "    SELECT 
      p.nombre AS nombre_producto, 
      c.nombre AS nombre_categoria, 
      pr.nombre AS nombre_promocion, 
      pr.descuento
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.categoriaId
    LEFT JOIN promocion_productos pp ON p.productosId = pp.producto_id
    LEFT JOIN promocion_categorias pc ON c.categoriaId = pc.categoria_id
    LEFT JOIN promociones pr ON (pr.id = pp.promocion_id OR pr.id = pc.promocion_id)
    WHERE pr.activo = TRUE
      AND CURDATE() BETWEEN pr.fecha_inicio AND pr.fecha_fin
    ORDER BY pr.nombre, c.nombre, p.nombre;";
            //Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSQL);

            //Incluir imagenes
            if(!empty($vResultado) && is_array($vResultado)){
                for ($i=0; $i < count($vResultado); $i++) { 
                    $vResultado[$i]->imagen=$imagenM->getImageProducto(idProducto: ($vResultado[$i]->id));
                }
            }
            //Retornar la respuesta

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
              "descripcion = '$objeto->descripcion', precio = $objeto->precio,".
                    "cantidad = $objeto->cantidad, categoria_id = $objeto->categoria_id".
                " Where id=$objeto->id";

            //Ejecutar la consulta
            $cResults = $this->enlace->executeSQL_DML($sql);
    

            //Retornar pelicula
            return $this->get($objeto->id);
        } catch (Exception $e) {
            handleException($e);
        }
    }


}
