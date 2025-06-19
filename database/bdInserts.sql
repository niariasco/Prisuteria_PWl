INSERT INTO ordenes (
  usuario_id,
  subtotal,
  total,
  estado_id,
  metodo_pago,
  direccion_envio
)
VALUES (
  1,              -- ID de usuario
  0.00,           -- Subtotal temporal, se actualizará después
  0.00,           -- Total temporal, se actualizará después
  1,              -- Estado inicial de la orden (ej: "pendiente")
  'tarjeta',      -- Método de pago
  'Calle Falsa 123, Ciudad Ejemplo'
);
INSERT INTO ordenes (usuario_id, subtotal, total, estado_id, metodo_pago, direccion_envio)
VALUES
(1, 0.00, 0.00, 1, 'tarjeta', 'Av. Central 101, San José'),
(4, 0.00, 0.00, 1, 'efectivo', 'Calle 10, Barrio Escalante, San José'),
(3, 0.00, 0.00, 2, 'tarjeta', 'Residencial Los Ángeles, Heredia'),
(1, 0.00, 0.00, 3, 'efectivo', 'Frente al parque central, Alajuela'),
(5, 0.00, 0.00, 2, 'tarjeta', 'Av. Segunda, Cartago'),
(3, 0.00, 0.00, 1, 'efectivo', 'San Pedro de Montes de Oca, San José');
-- orden_detalle (orden_id y producto_id deben existir)
INSERT INTO orden_detalle (orden_id, producto_id, cantidad)
VALUES (7, 3, 2); 
INSERT INTO orden_detalle (orden_id, producto_id, cantidad)
VALUES (8, 5, 1);


-- resenas (usuario_id y producto_id deben existir)
INSERT INTO resenas (usuario_id, producto_id, comentario, calificacion, visible) VALUES
(1, 7, 'Excelente producto', 5, TRUE),
(1, 8, 'Muy bueno, lo recomiendo', 4, TRUE);

/*no fue ejecutado*/
-- resena_reporte (resena_id y usuario_id deben existir)
INSERT INTO resena_reporte (resena_id, usuario_id, motivo) VALUES
(1, 2, 'Comentario ofensivo'),
(2, 3, 'Spam'),
(3, 1, 'No es relevante'),
(4, 5, 'Mal lenguaje'),
(5, 6, 'Inapropiado'),
(6, 4, 'Falso comentario');

-- componentes_personalizables
INSERT INTO componentes_personalizables (nombre, descripcion) VALUES
('Color', 'Elige el color del producto'),
('Tamaño', 'Selecciona el tamaño'),
('Material', 'Tipo de material'),
('Grabado', 'Texto personalizado'),
('Accesorios', 'Añade accesorios'),
('Empaque', 'Tipo de empaque');

-- producto_componentes (producto_id y componente_id deben existir)
INSERT INTO producto_componentes (producto_id, componente_id, obligatorio) VALUES
(1, 1, TRUE),
(2, 2, FALSE),
(3, 3, TRUE),
(4, 4, FALSE),
(5, 5, TRUE),
(6, 6, FALSE);

-- opciones_componentes (componente_id debe existir)
INSERT INTO opciones_componentes (componente_id, nombre, precio_adicional) VALUES
(1, 'Rojo', 0.00),
(1, 'Azul', 1.50),
(2, 'Pequeño', 0.00),
(2, 'Grande', 2.00),
(3, 'Cuero', 5.00),
(3, 'Tela', 0.00);

-- productos_personalizados (usuario_id y producto_base_id deben existir)
INSERT INTO productos_personalizados (usuario_id, producto_base_id, precio_total) VALUES
(1, 1, 100.00),
(2, 2, 150.00),
(3, 3, 200.00),
(4, 4, 120.00),
(5, 5, 80.00),
(6, 6, 90.00);

-- productos_personalizados_opciones (producto_personalizado_id, componente_id, opcion_id deben existir)
INSERT INTO productos_personalizados_opciones (producto_personalizado_id, componente_id, opcion_id) VALUES
(1, 1, 2),
(2, 2, 4),
(3, 3, 6),
(4, 4, 1),
(5, 5, 3),
(6, 6, 5);

-- promociones
INSERT INTO promociones (nombre, tipo, descuento, fecha_inicio, fecha_fin, activo) VALUES
('Promo Verano', 'categoria', 10.00, '2025-06-01', '2025-08-31', TRUE),
('Oferta Especial', 'producto', 15.00, '2025-06-10', '2025-06-30', TRUE),
('Descuento Invierno', 'categoria', 20.00, '2025-12-01', '2026-02-28', TRUE),
('Rebaja de Enero', 'producto', 25.00, '2026-01-01', '2026-01-31', TRUE),
('Promo Fin de Semana', 'categoria', 5.00, '2025-06-14', '2025-06-16', TRUE),
('Liquidación Final', 'producto', 30.00, '2025-06-01', '2025-06-30', FALSE);

-- promocion_productos (promocion_id y producto_id deben existir)
INSERT INTO promocion_productos (promocion_id, producto_id) VALUES
(2, 1),
(4, 2),
(6, 3),
(2, 4),
(4, 5),
(6, 6);

-- promocion_categorias (promocion_id y categoria_id deben existir)
INSERT INTO promocion_categorias (promocion_id, categoria_id) VALUES
(1, 1),
(3, 2),
(5, 3),
(1, 1),
(3, 2),
(5, 3);

-- historial_promociones


-- carritos (usuario_id debe existir)
INSERT INTO carritos (usuario_id) VALUES
(1), (2), (3), (4), (5), (6);

-- carrito_productos (carrito_id y producto_id deben existir)
INSERT INTO carrito_productos (carrito_id, producto_id, cantidad) VALUES
(1, 1, 2),
(2, 2, 1),
(3, 3, 5),
(4, 4, 3),
(5, 5, 4),
(6, 6, 1);

-- carrito_productos_personalizados (carrito_id y producto_personalizado_id deben existir)
INSERT INTO carrito_productos_personalizados (carrito_id, producto_personalizado_id, cantidad) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 2),
(4, 4, 1),
(5, 5, 3),
(6, 6, 1);

INSERT INTO usuarios (nombre_usuario, correo, contraseña, rol_id) VALUES
('niki', 'nikiarias40@gmail.com', SHA2('123456', 256), 2);

INSERT INTO imagenes (producto_id, url_imagen) VALUES
(1, 'movie-Arete1Perla.jpg');