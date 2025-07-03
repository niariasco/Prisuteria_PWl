<?php
class PromocionModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
    /*Listar */
   public function all()
{
    try {
        $sql = "SELECT p.*, 
                    CASE 
                        WHEN CURDATE() BETWEEN p.fecha_inicio AND p.fecha_fin THEN 'Vigente'
                        WHEN CURDATE() < p.fecha_inicio THEN 'Pendiente'
                        ELSE 'Aplicado'
                    END AS Estado 
                FROM promociones p";

        $vResultado = $this->enlace->ExecuteSQL($sql);

        if (is_array($vResultado)) {
            foreach ($vResultado as &$promo) {
                switch ($promo->tipo) {
                    case 'Vigente':
                        $promo->color_estado = '#FF4D4D';
                        break;
                    case 'Pendiente':
                        $promo->color_estado = '#ADD8E6';
                        break;
                    case 'Aplicado':
                        $promo->color_estado = '#D3D3D3';
                        break;
                    default:
                        $promo->color_estado = '#FFFFFF';
                        break;
                }
            }
        } else {
            throw new Exception("No se pudo obtener el listado de promociones.");
        }

        return $vResultado;
    } catch (Exception $e) {
        handleException($e);
    }
}


    /*Obtener */
   public function get($id)
{
    try {
        $vSql = "
            SELECT p.*, 
                CASE 
                    WHEN CURDATE() BETWEEN p.fecha_inicio AND p.fecha_fin THEN 'Vigente'
                    WHEN CURDATE() < p.fecha_inicio THEN 'Pendiente'
                    ELSE 'Aplicado'
                END AS Estado,
                c.nombreSCategoria AS nombre_categoria,
                pr.nombre AS nombre_producto
            FROM promociones p 
            LEFT JOIN categorias c ON p.CategoriaID = c.categoriaId
            LEFT JOIN productos pr ON p.ProductoID = pr.productosId
            WHERE p.id = $id
        ";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (!is_array($vResultado) || count($vResultado) === 0) {
            throw new Exception("No se encontró la promoción con ID $id");
        }

        $promo = $vResultado[0];

        // Color para el estado
        switch ($promo->Estado) {
            case 'Vigente':
                $promo->color_estado = '#FF4D4D';
                break;
            case 'Pendiente':
                $promo->color_estado = '#ADD8E6';
                break;
            case 'Aplicado':
                $promo->color_estado = '#D3D3D3';
                break;
            default:
                $promo->color_estado = '#FFFFFF';
                break;
        }

        return $promo;

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
