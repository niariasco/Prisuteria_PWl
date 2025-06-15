<?php
class PromocionModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    /*Listar */
    public function all(){
        try {
            //Consulta sql
			$sql = "SELECT p.*, 
                    CASE 
                        WHEN CURDATE() BETWEEN p.fecha_inicio AND p.fecha_fin THEN 
                        WHEN CURDATE() < p.fecha_inicio THEN 'Pendiente'
                        ELSE 'Aplicado'
                    END AS tipo 
                    FROM promociones p;";

			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ($sql);
			 // Agregar color representativo
            foreach ($vResultado as &$promo) {
                switch ($promo['tipo']) {
                    case 'Vigente':
                        $promo['color_estado'] = '#FF4D4D';
                        break;
                    case 'Pendiente':
                        $promo['color_estado'] = '#ADD8E6';
                        break;
                    case 'Aplicado':
                        $promo['color_estado'] = '#D3D3D3';
                        break;
                }
            }	
			// Retornar el objeto
			return $vResultado;
		} catch (Exception $e) {
            handleException($e);
        }
    }
    /*Obtener */
    public function get($id)
    {
        try {
            //Consulta sql
			$vSql = "SELECT * FROM promociones where id=$id";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ( $vSql);
			// Retornar el objeto
			return $vResultado[0];
		} catch (Exception $e) {
            handleException($e);
        }
    }
    /*Obtener los actores de una pelicula */
    public function productosConPromocion()
    {
        try {
            //Consulta SQL
            $vSQL =  "SELECT pr.id, pr.nombre, pr.precio, pr.tipo,
                        CASE
                            WHEN p.tipo = 'producto' THEN p.descuento
                            WHEN p.tipo = 'tipo' AND pr.tipo = p.tipo THEN p.descuento
                            ELSE NULL
                        END AS descuento,
                        CASE
                            WHEN p.tipo = 'producto' AND pr.id = p.producto_id THEN 'producto'
                            WHEN p.tipo = 'tipo' AND pr.tipo = p.tipo THEN 'tipo'
                            ELSE NULL
                        END AS tipo_promocion
                    FROM productos pr
                    LEFT JOIN promociones p ON (
                        (p.tipo = 'producto' AND pr.id = p.producto_id) OR
                        (p.tipo = 'tipo' AND pr.tipo = p.tipo)
                    )
                    WHERE p.fecha_inicio <= CURDATE()
                    AND p.fecha_fin >= CURDATE();";

            //Establecer conexión
            
            //Ejecutar la consulta
            $vResultado = $this->enlace->executeSQL($vSQL);

            foreach ($vResultado as &$producto) {
                if ($producto['descuento'] !== null) {
                    $producto['precio_original'] = $producto['precio'];
                    $producto['precio_con_descuento'] = $producto['precio'] - ($producto['precio'] * $producto['descuento'] / 100);
                    $producto['color_precio'] = '#FF4D4D'; // rojo para mostrar que hay descuento
                }
            }

            //Retornar el resultado
            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }
    
}
