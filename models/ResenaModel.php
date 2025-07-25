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
     //$vSql = "SELECT * FROM resenas WHERE producto_id = $productoId ORDER BY fecha DESC";
$vSql = "SELECT r.resenasId, r.usuario_id, r.producto_id, r.comentario, 
                r.calificacion, r.fecha, u.nombre_usuario AS nombre_usuario
         FROM resenas r
         JOIN usuarios u ON r.usuario_id = u.usuarioId
         WHERE r.producto_id = $productoId
         ORDER BY r.fecha DESC";

       
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
        if (!isset($objeto->usuario_id) || empty($objeto->usuario_id)) {
            throw new Exception('El usuario_id es obligatorio para crear una reseña.');
        }

        // Escapar comentario con función PHP nativa
        $comentarioEscapado = addslashes($objeto->comentario);

        // Insertar reseña
        $vSql = "INSERT INTO resenas 
                (usuario_id, producto_id, comentario, calificacion, visible) 
                VALUES 
                ('{$objeto->usuario_id}', 
                 '{$objeto->producto_id}', 
                 '{$comentarioEscapado}', 
                 '{$objeto->calificacion}', 
                 1);";

        $idResena = $this->enlace->executeSQL_DML_last($vSql);

        if (!$idResena) {
            throw new Exception('Error al crear la reseña');
        }

        // Seleccionar la reseña recién creada con el nombre del usuario
        $sqlResena = "SELECT r.resenasId, r.usuario_id, r.producto_id, r.comentario, 
                             r.calificacion, r.fecha, r.visible, u.nombre_usuario AS nombre
                     FROM resenas r 
                     INNER JOIN usuarios u ON r.usuario_id = u.usuarioId 
                     WHERE r.resenasId = {$idResena}";

        $resenaResult = $this->enlace->ExecuteSQL($sqlResena);
        $nuevaResena = !empty($resenaResult) ? $resenaResult[0] : null;

         // Calcular promedio actualizado para ese producto
$sqlPromedio = "SELECT AVG(calificacion) AS promedio FROM resenas WHERE producto_id = '{$objeto->producto_id}' AND visible = 1";
$promedioResult = $this->enlace->ExecuteSQL($sqlPromedio);
$promedioValoracion = $promedioResult[0]->promedio ?? 0;

return (object)[
    'status' => 'success',
    'nuevaResena' => $nuevaResena,
    'promedioValoracion' => round($promedioValoracion, 2)
];

    } catch (Exception $e) {
        return (object)[
            'status' => 'error',
            'message' => $e->getMessage()
        ];
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