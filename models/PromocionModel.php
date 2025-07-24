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
    public function getTodasLasPromocionesConNombreAplicado()
{
    try {
        $vSQL = "
            SELECT 
                p.id,
                p.nombre,
                p.tipo,
                p.descuento,
                p.fecha_inicio,
                p.fecha_fin,
                p.ProductoID,
                prod.nombre AS nombre_producto,
                p.CategoriaID,
                cat.nombreSCategoria AS nombre_categoria
            FROM promociones p
            LEFT JOIN productos prod ON p.ProductoID = prod.productosId
            LEFT JOIN categorias cat ON p.CategoriaID = cat.categoriaId
            WHERE p.activo = 1
        ";

        $vResultado = $this->enlace->executeSQL($vSQL);
        return $vResultado;
    } catch (Exception $e) {
        handleException($e);
    }
}
/**
 * Inserta una nueva promoción en la base de datos.
 *
 * @param object $objeto Objeto que contiene los datos de la promoción:
 *  - string $nombre        Nombre de la promoción
 *  - string $tipo          Tipo de promoción ('Producto' o 'Categoria')
 *  - float $descuento      Porcentaje de descuento
 *  - string $fecha_inicio  Fecha de inicio (formato 'Y-m-d H:i:s')
 *  - string $fecha_fin     Fecha de finalización (formato 'Y-m-d H:i:s')
 *  - bool $activo          Indica si la promoción está activa (true/false)
 *  - int|null $ProductoID  ID del producto si aplica, o null
 *  - int|null $CategoriaID ID de la categoría si aplica, o null
 *
 * @return object|null Retorna la promoción insertada o null en caso de error.
 */
public function create($objeto) {
    try {
        $sql = "INSERT INTO promociones (
                    nombre, tipo, descuento, fecha_inicio, fecha_fin, activo, ProductoID, CategoriaID
                ) VALUES (
                    '$objeto->nombre',
                    '$objeto->tipo',
                    $objeto->descuento,
                    '$objeto->fecha_inicio',
                    '$objeto->fecha_fin',
                    " . ($objeto->activo ? 1 : 0) . ",
                    " . ($objeto->ProductoID ?? "NULL") . ",
                    " . ($objeto->CategoriaID ?? "NULL") . "
                )";

        $idPromocion = $this->enlace->executeSQL_DML_last($sql);
        return $this->get($idPromocion);
    } catch (Exception $e) {
        handleException($e);
    }
}
/**
 * Actualiza una promoción existente en la base de datos.
 *
 * @param object $objeto Objeto que contiene los datos actualizados de la promoción:
 *  - int $id                ID de la promoción a actualizar
 *  - string $nombre         Nombre de la promoción
 *  - string $tipo           'Producto' o 'Categoria'
 *  - float $descuento       Valor del descuento
 *  - string $fecha_inicio   Fecha de inicio (Y-m-d H:i:s)
 *  - string $fecha_fin      Fecha de fin (Y-m-d H:i:s)
 *  - bool $activo
 *  - int|null $ProductoID
 *  - int|null $CategoriaID
 *
 * @return object|null Promoción actualizada o null en caso de error.
 */
public function update($objeto)
{
    try {
   // Verificar si la promoción ya terminó
$promocionActual = $this->get($objeto->id);
$fechaActual = new DateTime();
$fechaInicio = DateTime::createFromFormat('Y-m-d H:i:s', $promocionActual->fecha_inicio);

if ($fechaInicio < $fechaActual) {
    throw new Exception("No se puede modificar una promoción ya aplicada.");
}

        if ($objeto->tipo !== 'Producto' && $objeto->tipo !== 'Categoria') {
            throw new Exception("Tipo de promoción inválido.");
        }

        // Validar que se indique Producto o Categoría según el tipo
        if ($objeto->tipo === 'Producto' && empty($objeto->ProductoID)) {
            throw new Exception("Debe seleccionar un producto.");
        }

        if ($objeto->tipo === 'Categoria' && empty($objeto->CategoriaID)) {
            throw new Exception("Debe seleccionar una categoría.");
        }

        // Validación de fechas
        $fechaActual = new DateTime();
        $fechaInicio = DateTime::createFromFormat('Y-m-d H:i:s', $objeto->fecha_inicio);
        $fechaFin = DateTime::createFromFormat('Y-m-d H:i:s', $objeto->fecha_fin);

        if (!$fechaInicio || !$fechaFin) {
            throw new Exception("Formato de fecha inválido.");
        }

       if ($fechaInicio < $fechaActual && $fechaInicio != DateTime::createFromFormat('Y-m-d H:i:s', $this->get($objeto->id)->fecha_inicio)) {
    throw new Exception("La fecha de inicio no puede ser anterior a hoy.");
}


        if ($fechaFin < $fechaInicio) {
            throw new Exception("La fecha de fin no puede ser anterior a la de inicio.");
        }
        if ($objeto->descuento <= 0 || $objeto->descuento > 100) {
    throw new Exception("El descuento debe estar entre 1 y 100.");
}


        // Construcción de la consulta SQL
        $sql = "UPDATE promociones SET 
            nombre = '$objeto->nombre',
            tipo = '$objeto->tipo',
            descuento = $objeto->descuento,
            fecha_inicio = '$objeto->fecha_inicio',
            fecha_fin = '$objeto->fecha_fin',
            activo = " . ($objeto->activo ? 1 : 0) . ",
            ProductoID = " . (isset($objeto->ProductoID) ? $objeto->ProductoID : "NULL") . ",
            CategoriaID = " . (isset($objeto->CategoriaID) ? $objeto->CategoriaID : "NULL") . "
        WHERE id = $objeto->id";


        // Ejecutar la consulta SQL
        $resultado = $this->enlace->executeSQL_DML($sql);

        // Retornar la promoción actualizada
        return $this->get($objeto->id);
    } catch (Exception $e) {
        handleException($e);
        return null;
    }
}



}
