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
     * Obtener las productos por tienda
     * @param $idShopRental identificador de la tienda
     * @return $vresultado - Lista de productos incluyendo el precio
     */
    //
    /*    public function moviesByShopRental($idShopRental)
    {
        try {
            $imagenM=new ImageModel();
            //Consulta SQL
            $vSQL = "SELECT m.*, i.price
                    FROM movie m, inventory i
                    where 
                    m.id=i.movie_id
                    and shop_id=$idShopRental
                    order by m.title desc";
            //Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSQL);

            //Incluir imagenes
            if(!empty($vResultado) && is_array($vResultado)){
                for ($i=0; $i < count($vResultado); $i++) { 
                    $vResultado[$i]->imagen=$imagenM->getImageMovie(($vResultado[$i]->id));
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
    //
   public function create($objeto)
{
    try {
        // 1. Insertaintooducto
        $sql = "Insert into productos (nombre, descripcion, precio, cantidad, categoria_id)
        VALUES ('$objeto->nombre', $objeto->descripcion, 
             $objeto->precio, $objeto->cantidad, $objeto->categoria_id)";
        $id = $this->enlace->executeSQL_DML_last($sql); // Obtener ID del producto Insertainto        // 2. Insertaintoágenes asociadas (si hay)

        // 3. Devolver el producto creado
        return $this->get($id);
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
