<?php
class OrdenModel
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
			$vSql = "SELECT * FROM ordenes;";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ($vSql);
				
			// Retornar el objeto
			return $vResultado;
		} catch (Exception $e) {
            handleException($e);
        }
    }
    
    public function get($id) {
        $vResultado = null;
        try {
            // Log para debugging
            error_log("OrdenModel::get() - Buscando orden ID: " . $id);
            
            // Obtener datos generales del pedido y usuario
            $vSql = "SELECT 
                    o.ordenesId,
                    o.fecha,
                    o.direccion_envio,
                    o.subtotal,
                    o.impuestos,
                    o.total,
                    o.metodo_pago,
                    o.estado,
                    u.usuarioId,
                    u.nombre_usuario AS nombre_usuario,
                    COALESCE(u.correo, 'cliente@email.com') AS email_usuario
                FROM ordenes o
                JOIN usuarios u ON o.usuario_id = u.usuarioId
                WHERE o.ordenesId = $id";

            error_log("OrdenModel::get() - Ejecutando consulta: " . $vSql);
            $pedido = $this->enlace->ExecuteSQL($vSql);

            if (empty($pedido)) {
                error_log("OrdenModel::get() - No se encontró orden con ID: " . $id);
                return null;
            }

            // Convertir objeto a array si es necesario
            if (is_object($pedido[0])) {
                $pedido[0] = (array) $pedido[0];
            }
            
            error_log("OrdenModel::get() - Orden encontrada: " . json_encode($pedido[0]));

            // Obtener detalle productos con cálculo correcto del precio unitario y subtotal con promociones activas
            $vSql = "SELECT 
                    p.productosId,
                    p.nombre,
                    d.cantidad,
                    p.precio AS precio_original,

                    -- Obtener máximo descuento activo (producto o categoría)
                    (
                        SELECT MAX(pr.descuento)
                        FROM promociones pr
                        WHERE pr.activo = 1
                          AND NOW() BETWEEN pr.fecha_inicio AND pr.fecha_fin
                          AND (
                            (pr.tipo = 'Producto' AND pr.ProductoID = p.productosId)
                            OR
                            (pr.tipo = 'Categoria' AND pr.CategoriaID = p.categoria_id)
                          )
                    ) AS descuento_activo,

                    -- Calcular precio unitario con descuento aplicado
                    ROUND(
                        p.precio * 
                        (1 - COALESCE(
                            (
                                SELECT MAX(pr.descuento) / 100
                                FROM promociones pr
                                WHERE pr.activo = 1
                                  AND NOW() BETWEEN pr.fecha_inicio AND pr.fecha_fin
                                  AND (
                                    (pr.tipo = 'Producto' AND pr.ProductoID = p.productosId)
                                    OR
                                    (pr.tipo = 'Categoria' AND pr.CategoriaID = p.categoria_id)
                                  )
                            ), 0)
                        ), 2) AS precio_unitario,

                    -- Calcular subtotal acorde a cantidad y precio unitario
                    ROUND(
                        d.cantidad * p.precio * 
                        (1 - COALESCE(
                            (
                                SELECT MAX(pr.descuento) / 100
                                FROM promociones pr
                                WHERE pr.activo = 1
                                  AND NOW() BETWEEN pr.fecha_inicio AND pr.fecha_fin
                                  AND (
                                    (pr.tipo = 'Producto' AND pr.ProductoID = p.productosId)
                                    OR
                                    (pr.tipo = 'Categoria' AND pr.CategoriaID = p.categoria_id)
                                  )
                            ), 0)
                        ), 2) AS subtotal,
                        
                    -- Calcular total con IVA
                    ROUND(
                        d.cantidad * p.precio * 
                        (1 - COALESCE(
                            (
                                SELECT MAX(pr.descuento) / 100
                                FROM promociones pr
                                WHERE pr.activo = 1
                                  AND NOW() BETWEEN pr.fecha_inicio AND pr.fecha_fin
                                  AND (
                                    (pr.tipo = 'Producto' AND pr.ProductoID = p.productosId)
                                    OR
                                    (pr.tipo = 'Categoria' AND pr.CategoriaID = p.categoria_id)
                                  )
                            ), 0)
                        ) * 1.13, 2) AS totalConIva

                FROM detalle_orden d
                JOIN productos p ON d.producto_id = p.productosId
                WHERE d.orden_id = $id";

            $productos = $this->enlace->ExecuteSQL($vSql);

            // Convertir objetos a arrays si es necesario
            if (!empty($productos) && is_object($productos[0])) {
                $productos = array_map(function($item) {
                    return (array) $item;
                }, $productos);
            }

            error_log("OrdenModel::get() - Productos encontrados: " . count($productos));

            // Formatear la fecha correctamente para el frontend
            $fechaFormateada = date('Y-m-d H:i:s', strtotime($pedido[0]['fecha']));
            
            // Estructurar la respuesta en el formato que espera el frontend
            $vResultado = [
                // Información principal de la orden (nivel superior)
                'id' => (int)$pedido[0]['ordenesId'],
                'ordenesId' => (int)$pedido[0]['ordenesId'],
                'fecha' => $fechaFormateada,
                'fechaPago' => $fechaFormateada,
                'fechaCreacion' => $fechaFormateada,
                'direccionEnvio' => $pedido[0]['direccion_envio'],
                'direccion_envio' => $pedido[0]['direccion_envio'],
                'subtotal' => (float)$pedido[0]['subtotal'],
                'subtotalSinImpuestos' => (float)$pedido[0]['subtotal'],
                'impuestos' => (float)$pedido[0]['impuestos'],
                'ivaTotal' => (float)$pedido[0]['impuestos'],
                'total' => (float)$pedido[0]['total'],
                'metodoPago' => $pedido[0]['metodo_pago'],
                'metodo_pago' => $pedido[0]['metodo_pago'],
                'estado' => $pedido[0]['estado'], // Usar el estado real de la BD
                'moneda' => 'CRC', // Asumiendo colones costarricenses
                
                // Información del cliente
                'cliente' => [
                    'usuarioId' => (int)$pedido[0]['usuarioId'],
                    'nombre' => $pedido[0]['nombre_usuario'],
                    'email' => $pedido[0]['email_usuario'] ?? 'cliente@email.com'
                ],
                'usuarioDetalle' => [
                    'usuarioId' => (int)$pedido[0]['usuarioId'],
                    'nombre' => $pedido[0]['nombre_usuario'],
                    'email' => $pedido[0]['email_usuario'] ?? 'cliente@email.com'
                ],
                
                // Productos con formato consistente
                'productos' => array_map(function($producto) {
                    return [
                        'productosId' => (int)$producto['productosId'],
                        'id' => (int)$producto['productosId'],
                        'productoId' => (int)$producto['productosId'],
                        'nombre' => $producto['nombre'],
                        'cantidad' => (int)$producto['cantidad'],
                        'precio' => (float)$producto['precio_unitario'],
                        'precioUnitario' => (float)$producto['precio_unitario'],
                        'precio_original' => (float)$producto['precio_original'],
                        'descuento_activo' => (float)($producto['descuento_activo'] ?? 0),
                        'subtotal' => (float)$producto['subtotal'],
                        'totalConIva' => (float)$producto['totalConIva'],
                        'esPersonalizado' => false // Por defecto
                    ];
                }, $productos),
                
                // Datos adicionales para compatibilidad
                'cambio' => 0, // Se calculará en el frontend si es efectivo
                'personalizados' => [] // Vacío por ahora
            ];

            // Si hay información de pago en efectivo, agregarla
            if ($pedido[0]['metodo_pago'] === 'Efectivo') {
                // Podrías agregar una consulta adicional para obtener datos de pago en efectivo
                // Por ahora, se manejará en el frontend
            }

            return $vResultado;

        } catch (Exception $e) {
            error_log("Error en OrdenModel::get(): " . $e->getMessage());
            throw $e;
        }
    }
    
    public function create($data) {
        try {
            // Preparar valores
            $usuario_id = (int)($data['usuario_id'] ?? 0);
            $subtotal = (float)($data['subtotal'] ?? 0);
            $impuestos = (float)($data['impuestos'] ?? 0);
            $total = (float)($data['total'] ?? 0);
            $direccion = isset($data['direccion_envio']) ? str_replace("'", "''", $data['direccion_envio']) : 'No especificada';
            $metodo_pago = $data['metodo_pago'] ?? 'Efectivo';

            // Insertar orden principal con estado 'Pagado' y fecha actual
            $sql = "INSERT INTO ordenes (usuario_id, fecha, subtotal, impuestos, total, estado, metodo_pago, direccion_envio)
                    VALUES ($usuario_id, NOW(), $subtotal, $impuestos, $total, 'Pagado', '$metodo_pago', '$direccion')";

            // Ejecutar DML y obtener ID generado
            $orden_id = $this->enlace->executeSQL_DML_last($sql);

            // Insertar detalle de productos
            if (!empty($data['productos'])) {
                foreach ($data['productos'] as $p) {
                    $pid = (int)$p['id'];
                    $cant = (int)$p['cantidad'];
                    $precio = (float)$p['precio'];
                    $subtotal_producto = $cant * $precio;

                    $sqlDet = "INSERT INTO detalle_orden (orden_id, producto_id, cantidad, precio_unitario, subtotal)
                               VALUES ($orden_id, $pid, $cant, $precio, $subtotal_producto)";
                    $this->enlace->executeSQL_DML($sqlDet);
                }
            }

            // Insertar productos personalizados si existen
            if (!empty($data['personalizados'])) {
                foreach ($data['personalizados'] as $pp) {
                    $nombre = str_replace("'", "''", $pp['nombre']);
                    $costo_base = (float)$pp['costo_base'];
                    $total_personalizado = (float)$pp['total_personalizado'];

                    $sqlPers = "INSERT INTO detalle_personalizado (orden_id, nombre, costo_base, total_personalizado)
                                VALUES ($orden_id, '$nombre', $costo_base, $total_personalizado)";
                    $this->enlace->executeSQL_DML($sqlPers);
                }
            }

            // Retornar solo el ID de la orden
            return $orden_id;

        } catch (Exception $e) {
            error_log("Error en OrdenModel::create(): " . $e->getMessage());
            handleException($e);
        }
    }
}