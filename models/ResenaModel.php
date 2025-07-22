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
            //Consulta sql
			$vSql =   "   SELECT 
                r.resenasId,
                r.comentario,
                r.fecha,
                r.calificacion,
                u.usuarioId,
                u.nombre_usuario,
                p.nombre AS nombre_producto
            FROM resenas r
            JOIN usuarios u ON r.usuario_id = u.usuarioId
            JOIN productos p ON r.producto_id = p.productosId
            WHERE r.resenasId = $id ";           
			
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
            //   formato Y-m-d H:i:s 
            $fechaBD = !empty($objeto->fecha) ? date('Y-m-d H:i:s', strtotime($objeto->fecha)) : date('Y-m-d H:i:s');

            // Insertar reseña
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
                '".$this->enlace->addslashes($objeto->comentario)."',
                '$objeto->calificacion',
                '$fechaBD',
                '$objeto->visible');";
	

            $idResena = $this->enlace->executeSQL_DML_last($vSql);

            //  la reseña creada
            $nuevaResenaArr = $this->get($idResena);
            $nuevaResena = !empty($nuevaResenaArr) ? $nuevaResenaArr[0] : null;

            //  promedio actualizado
            $promedio = $this->getByProducto($objeto->producto_id);

            //  return objeto con reseña y promedio
            return (object)[
                'nuevaResena' => $nuevaResena,
                'promedioValoracion' => $promedio
            ];
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