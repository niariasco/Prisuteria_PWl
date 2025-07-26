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

    /*Obtener productos con promoción actualizado para manejar montos fijos */
    public function productosConPromocion()
    {
        try {
            $vSQL = "SELECT pr.id, pr.nombre, pr.precio, pr.tipo,
                        p.descuento,
                        p.tipo_descuento,
                        CASE
                            WHEN p.tipo = 'producto' THEN p.descuento
                            WHEN p.tipo = 'categoria' AND pr.categoriaId = p.CategoriaID THEN p.descuento
                            ELSE NULL
                        END AS descuento_aplicable,
                        CASE
                            WHEN p.tipo = 'producto' AND pr.id = p.ProductoID THEN 'producto'
                            WHEN p.tipo = 'categoria' AND pr.categoriaId = p.CategoriaID THEN 'categoria'
                            ELSE NULL
                        END AS tipo_promocion
                    FROM productos pr
                    LEFT JOIN promociones p ON (
                        (p.tipo = 'producto' AND pr.id = p.ProductoID) OR
                        (p.tipo = 'categoria' AND pr.categoriaId = p.CategoriaID)
                    ) AND p.activo = 1
                    WHERE p.fecha_inicio <= CURDATE()
                    AND p.fecha_fin >= CURDATE()";

            $vResultado = $this->enlace->executeSQL($vSQL);

            foreach ($vResultado as &$producto) {
                if ($producto['descuento_aplicable'] !== null) {
                    $producto['precio_original'] = $producto['precio'];
                    
                    // Calcular precio con descuento según el tipo
                    if ($producto['tipo_descuento'] === 'Porcentaje') {
                        $producto['precio_con_descuento'] = $producto['precio'] - ($producto['precio'] * $producto['descuento_aplicable'] / 100);
                        $producto['descuento_texto'] = $producto['descuento_aplicable'] . '% OFF';
                    } else {
                        // Descuento por monto fijo
                        $producto['precio_con_descuento'] = max(0, $producto['precio'] - $producto['descuento_aplicable']);
                        $producto['descuento_texto'] = '₡' . number_format($producto['descuento_aplicable'], 0) . ' OFF';
                    }
                    
                    $producto['color_precio'] = '#FF4D4D';
                }
            }

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
                    p.tipo_descuento,
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
 *  - string $nombre           Nombre de la promoción
 *  - string $tipo             Tipo de promoción ('producto' o 'categoria')
 *  - string $tipo_descuento   Tipo de descuento ('porcentaje' o 'monto')
 *  - float $descuento         Valor del descuento (porcentaje o monto)
 *  - string $fecha_inicio     Fecha de inicio (formato 'Y-m-d')
 *  - string $fecha_fin        Fecha de finalización (formato 'Y-m-d')
 *  - bool $activo             Indica si la promoción está activa (true/false)
 *  - int|null $ProductoID     ID del producto si aplica, o null
 *  - int|null $CategoriaID    ID de la categoría si aplica, o null
 *
 * @return object|null Retorna la promoción insertada o null en caso de error.
 */
public function create($objeto) {
    try {
        // Validaciones
        if (!isset($objeto->tipo_descuento) || !in_array($objeto->tipo_descuento, ['Porcentaje', 'Monto'])) {
            throw new Exception("Tipo de descuento inválido. Debe ser 'Porcentaje' o 'Monto'.");
        }

        // Validar descuento según el tipo
        if ($objeto->tipo_descuento === 'Porcentaje') {
            if ($objeto->descuento <= 0 || $objeto->descuento > 100) {
                throw new Exception("El porcentaje de descuento debe estar entre 1 y 100.");
            }
        } else {
            if ($objeto->descuento <= 0) {
                throw new Exception("El monto de descuento debe ser mayor a 0.");
            }
        }

        // Convertir fechas al formato datetime
        $fecha_inicio = $objeto->fecha_inicio . ' 00:00:00';
        $fecha_fin = $objeto->fecha_fin . ' 23:59:59';

        $sql = "INSERT INTO promociones (
                    nombre, tipo, tipo_descuento, descuento, fecha_inicio, fecha_fin, activo, ProductoID, CategoriaID
                ) VALUES (
                    '$objeto->nombre',
                    '$objeto->tipo',
                    '$objeto->tipo_descuento',
                    $objeto->descuento,
                    '$fecha_inicio',
                    '$fecha_fin',
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
 * @param object $objeto Objeto que contiene los datos actualizados de la promoción
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

        // Validaciones de tipo
        if ($objeto->tipo !== 'producto' && $objeto->tipo !== 'categoria') {
            throw new Exception("Tipo de promoción inválido.");
        }

        // Validar tipo de descuento
        if (!isset($objeto->tipo_descuento) || !in_array($objeto->tipo_descuento, ['Porcentaje', 'Monto'])) {
            throw new Exception("Tipo de descuento inválido. Debe ser 'Porcentaje' o 'Monto'.");
        }

        // Validar descuento según el tipo
        if ($objeto->tipo_descuento === 'Porcentaje') {
            if ($objeto->descuento <= 0 || $objeto->descuento > 100) {
                throw new Exception("El porcentaje de descuento debe estar entre 1 y 100.");
            }
        } else {
            if ($objeto->descuento <= 0) {
                throw new Exception("El monto de descuento debe ser mayor a 0.");
            }
        }

        // Validar que se indique Producto o Categoría según el tipo
        if ($objeto->tipo === 'producto' && empty($objeto->ProductoID)) {
            throw new Exception("Debe seleccionar un producto.");
        }

        if ($objeto->tipo === 'categoria' && empty($objeto->CategoriaID)) {
            throw new Exception("Debe seleccionar una categoría.");
        }

        // Validación de fechas
        $fechaActual = new DateTime();
        $fechaInicio = DateTime::createFromFormat('Y-m-d', $objeto->fecha_inicio);
        $fechaFin = DateTime::createFromFormat('Y-m-d', $objeto->fecha_fin);

        if (!$fechaInicio || !$fechaFin) {
            throw new Exception("Formato de fecha inválido.");
        }

        if ($fechaInicio < $fechaActual && $fechaInicio != DateTime::createFromFormat('Y-m-d H:i:s', $this->get($objeto->id)->fecha_inicio)) {
            throw new Exception("La fecha de inicio no puede ser anterior a hoy.");
        }

        if ($fechaFin < $fechaInicio) {
            throw new Exception("La fecha de fin no puede ser anterior a la de inicio.");
        }

        // Convertir fechas al formato datetime
        $fecha_inicio_formatted = $objeto->fecha_inicio . ' 00:00:00';
        $fecha_fin_formatted = $objeto->fecha_fin . ' 23:59:59';

        // Construcción de la consulta SQL
        $sql = "UPDATE promociones SET 
            nombre = '$objeto->nombre',
            tipo = '$objeto->tipo',
            tipo_descuento = '$objeto->tipo_descuento',
            descuento = $objeto->descuento,
            fecha_inicio = '$fecha_inicio_formatted',
            fecha_fin = '$fecha_fin_formatted',
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