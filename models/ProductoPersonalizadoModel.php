<?php
class ProductoPersonalizadoModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }
public function getAll()
{
    try {
        $sql = "SELECT 
                    pp.id AS producto_personalizado_id,
                    u.nombre_usuario,
                    p.nombre AS producto_base,
                    pp.precio_total,
                    pp.fecha_creacion,
                    GROUP_CONCAT(CONCAT(c.nombre, ': ', o.nombre, ' (+', o.precio_adicional, ')') SEPARATOR ' | ') AS opciones
                FROM productos_personalizados pp
                INNER JOIN usuarios u 
                    ON pp.usuario_id = u.usuarioId
                INNER JOIN productos p 
                    ON pp.producto_base_id = p.productosId
                LEFT JOIN productos_personalizados_componentes ppc 
                    ON pp.id = ppc.producto_personalizado_id
                LEFT JOIN criterios c 
                    ON ppc.criterio_id = c.id
                LEFT JOIN opciones o 
                    ON ppc.opcion_id = o.id
                GROUP BY pp.id
                ORDER BY pp.fecha_creacion DESC";

        return $this->enlace->executeSQL($sql);

    } catch (Exception $e) {
        handleException($e);
    }
}
    // Obtener un producto personalizado completo
    public function get($id)
    {
        try {
            $sql = "SELECT pp.*, u.nombre_usuario, p.nombre AS producto_base
                    FROM productos_personalizados pp
                    JOIN usuarios u ON pp.usuario_id = u.usuarioId
                    JOIN productos p ON pp.producto_base_id = p.productosId
                    WHERE pp.id = ?";
            $resultado = $this->enlace->ExecuteSQL($sql, [$id]);
            if (empty($resultado)) return null;

            $producto = $resultado[0];

            // Obtener opciones y criterios
            $sqlOpciones = "
                SELECT c.id AS criterio_id, c.nombre AS criterio_nombre,
                       o.id AS opcion_id, o.nombre AS opcion_nombre, o.precio_adicional
                FROM productos_personalizados_componentes ppc
                JOIN criterios c ON ppc.criterio_id = c.id
                JOIN opciones o ON ppc.opcion_id = o.id
                WHERE ppc.producto_personalizado_id = ?
                ORDER BY c.id, o.id
            ";
            $opcionesRaw = $this->enlace->ExecuteSQL($sqlOpciones, [$id]);

            $criterios = [];
            foreach ($opcionesRaw as $row) {
                $cId = $row->criterio_id;
                if (!isset($criterios[$cId])) {
                    $criterios[$cId] = [
                        'id' => $cId,
                        'nombre' => $row->criterio_nombre,
                        'opciones' => []
                    ];
                }
                $criterios[$cId]['opciones'][] = [
                    'id' => $row->opcion_id,
                    'nombre' => $row->opcion_nombre,
                    'precio_adicional' => $row->precio_adicional
                ];
            }

            $producto->criterios = array_values($criterios);
            return $producto;

        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Calcular precio total
   public function calcularPrecioTotal($productoBaseId, $opciones)
{
    $productoBaseId = (int)$productoBaseId;

    // Precio base
    $sql = "SELECT precio FROM productos WHERE productosId = $productoBaseId";
    $res = $this->enlace->ExecuteSQL($sql);
    $precioBase = 0;
    if (!empty($res)) {
        $row = is_object($res[0]) ? $res[0] : (object)$res[0];
        $precioBase = (float)($row->precio ?? 0);
    }
    $precioTotal = $precioBase;

    // Sumar opciones
    foreach ($opciones as $op) {
        $opcionId = (int)$op['opcionId'];
        $sqlO = "SELECT precio_adicional FROM opciones WHERE id = $opcionId";
        $rO = $this->enlace->ExecuteSQL($sqlO);
        if (!empty($rO)) {
            $ro = is_object($rO[0]) ? $rO[0] : (object)$rO[0];
            $precioTotal += (float)($ro->precio_adicional ?? 0);
        }
    }

    return $precioTotal;
}

    // Crear producto personalizado
    public function guardarProductoPersonalizado($usuarioId, $productoBaseId, $opciones)
    {
        try {
            $this->enlace->conn->beginTransaction();

            $precioTotal = $this->calcularPrecioTotal($productoBaseId, $opciones);

            $sql = "INSERT INTO productos_personalizados (usuario_id, producto_base_id, precio_total)
                    VALUES (?, ?, ?)";
            $this->enlace->ExecuteSQLNoFetch($sql, [$usuarioId, $productoBaseId, $precioTotal]);
            $productoPersonalizadoId = $this->enlace->conn->lastInsertId();

            foreach ($opciones as $opcion) {
                $sqlInsert = "INSERT INTO productos_personalizados_componentes
                              (producto_personalizado_id, criterio_id, opcion_id)
                              VALUES (?, ?, ?)";
                $this->enlace->ExecuteSQLNoFetch($sqlInsert, [
                    $productoPersonalizadoId,
                    $opcion['criterioId'],
                    $opcion['opcionId']
                ]);
            }

            $this->enlace->conn->commit();
            return $productoPersonalizadoId;

        } catch (Exception $e) {
            $this->enlace->conn->rollBack();
            throw $e;
        }
    }

    // Validar personalización
    public function validarPersonalizacion($productoBaseId, $opciones)
    {
        if (!$productoBaseId) throw new Exception("Debe seleccionar un producto base.");
        if (count($opciones) < 1) throw new Exception("Debe seleccionar al menos 1 criterio.");
        foreach ($opciones as $opcion) {
            if (!isset($opcion['criterioId']) || !isset($opcion['opcionId'])) {
                throw new Exception("Faltan datos en la personalización.");
            }
        }
        return true;
    }


public function updatePrecio($objeto) {
    try {
        $precio = (float) $objeto->precio_adicional;
        $id = (int) $objeto->id;

        $sql = "UPDATE opciones 
                SET precio_adicional = $precio 
                WHERE id = $id";

        $this->enlace->executeSQL_DML($sql);

        return $this->getlistado($id);
    } catch (Exception $e) {
        handleException($e);
    }
}



public function getlistado($id) {
    try {
        $sql = "SELECT id, criterio_id, nombre, precio_adicional 
                FROM opciones 
                WHERE id = $id";
        return $this->enlace->executeSQL($sql);
    } catch (Exception $e) {
        handleException($e);
    }
}
public function getlistados() {
    try {
        $sql = "SELECT id, criterio_id, nombre, precio_adicional 
                FROM opciones ";
        return $this->enlace->executeSQL($sql);
    } catch (Exception $e) {
        handleException($e);
    }
}
}
