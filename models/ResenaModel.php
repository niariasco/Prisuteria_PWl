<?php
class ResenaModel{
    public $enlace;
    public function __construct() {
        
        $this->enlace=new MySqlConnect();
       
    }
    public function all(){
        try {
			$vSql = "SELECT 
    r.resenasId,
    r.comentario,
    r.calificacion,
    r.fecha,
    u.nombre_usuario AS nombre_usuario,
    p.nombre AS nombre
FROM 
    resenas r
JOIN 
    usuarios u ON r.usuario_id = u.usuarioId
JOIN 
    productos p ON r.producto_id = p.productosId
ORDER BY 
    r.fecha ASC;";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ( $vSql);

			// Retornar el objeto
			return $vResultado;
		} catch ( Exception $e ) {
			die ( $e->getMessage () );
		}
    }

    public function get($id){
        $vResultado=null;
        try {
         //   $rentalMovieM=new RentalMovieModel();
         //   $shopM=new ShopRentalModel();
            $userM=new UserModel();
            //Consulta sql
			$vSql = "SELECT * FROM resenas where resenasId=$id";           
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ( $vSql);
            if (!empty($vResultado)) {
             //   $vResultado=$vResultado[0];
                //Tienda
               // $vResultado->shopRental=$shopM->get($vResultado->shop_id);
                //Cliente
              //  $vResultado->usuario=$userM->get($vResultado->usuario_id);
                //Lista de peliculas
               // $vResultado->movies=$rentalMovieM->getRental($id);
            }
			// Retornar el objeto
			return $vResultado;
		} catch ( Exception $e ) {
			die ( $e->getMessage () );
		}
    }
 
    public function getId($id){
        try {
         //   $rentalMovieM=new RentalMovieModel();
           $productoM=new ProductoModel();
           $userM=new UserModel();
            //Consulta sql
			$vSql = "SELECT * FROM resenas where resenasId=$id";           
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ( $vSql);
            if (!empty($vResultado)) {
             $vResultado=$vResultado[0];
             
                //Cliente
                $user=$userM->get($vResultado->usuario_id);
                $vResultado->usuario=$user;
                //Lista de peliculas
                $producto=$productoM->get($vResultado->producto_id);
                $vResultado->producto=$producto;
            }
			// Retornar el objeto
			return $vResultado;
		} catch ( Exception $e ) {
			die ( $e->getMessage () );
		}
    } 

    public function getByProducto($productoId){
    try {
      //  $userM = new UserModel();
        $vSql = "SELECT * FROM resenas WHERE producto_id = $productoId ORDER BY fecha DESC";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
      /*  
        if (!empty($vResultado)) {
            foreach ($vResultado as $resena) {
                $resena->usuario = $userM->get($resena->usuario_id);
            }
        }*/
            $vResultado = $this->enlace->ExecuteSQL($vSql);

            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
}
	public function create($objeto) {
        try {
            $fechaReact = $objeto->fecha;
            // Crear un objeto DateTime a partir de la cadena de fecha
            // Convertir la fecha al formato deseado para la base de datos
            $fechaBD = date('Y-m-d', strtotime($fechaReact));
            
            //Consulta sql
            
			$vSql = "INSERT INTO resenas
                (usuario_id,
                producto_id,
                comentario,
                calificacion,
                fecha,
                visible)
                VALUES
                ('$objeto->usuario_id',
                '$objeto->producto_id',
                '$objeto->comentario',
                '$objeto->calificacion',
                '$fechaBD',
                '$objeto->visible');";
			
            //Ejecutar la consulta
			$idResena = $this->enlace->executeSQL_DML_last( $vSql);
            //Insertar peliculas
            /*
            foreach ($objeto->movies as $item) {
                $sql="INSERT INTO movie_rental.rental_movie
                    (rental_id,
                    movie_id,
                    price,
                    days,
                    subtotal)
                    VALUES
                    ($idRental,
                    $item->id,
                    $item->price,
                    $item->days,
                    $item->subtotal);";
                $vResultadoM= $this->enlace->executeSQL_DML($sql);
            }
                */
			// Retornar el objeto creado
            return $this->get($idResena);
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //Ventas por mes x Tienda
    /*
    public function rentalMonthbyShop()
    {
        try {
            //Consulta sql
            $vSql = "SELECT 
                        r.shop_id, 
                        s.name AS shop_name,
                        DATE_FORMAT(r.rental_date, '%m-%Y') AS month,
                        SUM(r.total) AS monthly_total
                    FROM 
                        rental r
                    JOIN 
                        shop_rental s ON r.shop_id = s.id
                    GROUP BY 
                        r.shop_id, shop_name, month
                    ORDER BY 
                        r.shop_id, month;";

            //Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSql);

            // Retornar el objeto
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    //cantidad de alquileres por pelicula
    /*
    public function resenabyMovie()
    {
        try {
            //Consulta sql
            $vSql = "SELECT 
                        m.title AS pelicula,
                        COUNT(rm.movie_id) AS cantidad_alquileres
                    FROM 
                        rental_movie rm
                    JOIN 
                        movie m ON rm.movie_id = m.id
                    GROUP BY 
                        m.title
                    ORDER BY 
                        cantidad_alquileres DESC;";

            //Ejecutar la consulta
            $vResultado = $this->enlace->ExecuteSQL($vSql);

            // Retornar el objeto
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
        */
}