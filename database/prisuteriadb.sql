CREATE DATABASE  PrisuteriaDB;
USE PrisuteriaDB;


-- Tabla de roles
CREATE TABLE roles (
    rolesId INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE 
);

-- Tabla de usuarios actualizada
CREATE TABLE usuarios (
    usuarioId INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contraseña CHAR(64) NOT NULL, -- SHA2(256) devuelve 64 caracteres hexadecimales
    rol_id INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(rolesId)
);

CREATE TABLE categorias (
categoriaId INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE productos (
    productosId INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    inventario INT DEFAULT 0,
    categoria_id INT,
    promedio_valoracion DECIMAL(3,2) DEFAULT 0.00,
    activo BOOLEAN DEFAULT TRUE,  -- Baja/Alta lógica
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(categoriaId)
);

ALTER TABLE productos
ADD COLUMN es_personalizable BOOLEAN DEFAULT FALSE;

CREATE TABLE imagenes (
    imagenId INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES productos(productosId) ON DELETE CASCADE
);

CREATE TABLE estados (
    estadoId INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE etiquetas (
    etiquetaId INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
CREATE TABLE producto_etiquetas (
id INT AUTO_INCREMENT PRIMARY KEY,
producto_id INT NOT NULL,
etiqueta_id INT NOT NULL,
FOREIGN KEY (producto_id) REFERENCES productos(productosId) ON DELETE CASCADE,
FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(etiquetaId) ON DELETE CASCADE
);

CREATE TABLE producto_etiqueta (
	idPT INT AUTO_INCREMENT PRIMARY KEY,
    productoId INT,
    etiquetaId INT,
    FOREIGN KEY (productoId) REFERENCES productos(productosId) ON DELETE CASCADE,
    FOREIGN KEY (etiquetaId) REFERENCES etiquetas(etiquetaId) ON DELETE CASCADE
);

/*Consultar etiquetas de un producto
SELECT e.nombre
FROM producto_etiqueta pe
JOIN etiquetas e ON pe.etiquetaId = e.etiquetaId
WHERE pe.productoId = 5;
*/

CREATE TABLE ordenes (
    ordenesId INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    subtotal DECIMAL(10,2),
    total DECIMAL(10,2),
    estado_id INT, -- referencia a tabla estados
    metodo_pago ENUM('efectivo', 'tarjeta') NOT NULL,
    direccion_envio TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuarioId),
    FOREIGN KEY (estado_id) REFERENCES estados(estadoId)
);

CREATE TABLE orden_detalle (
orden_detalleId INT AUTO_INCREMENT PRIMARY KEY,
orden_id INT,
producto_id INT,
cantidad INT,
precio_unitario DECIMAL(10,2),
FOREIGN KEY (orden_id) REFERENCES ordenes(ordenesId),
FOREIGN KEY (producto_id) REFERENCES productos(productosId)
);

DELIMITER $$

CREATE TRIGGER trg_insert_pago_orden
AFTER INSERT ON ordenes
FOR EACH ROW
BEGIN
  IF NEW.metodo_pago = 'efectivo' THEN
    INSERT INTO orden_pago_efectivo (orden_id, monto_pagado, cambio)
    VALUES (NEW.ordenesId, 0.00, 0.00); -- Se actualiza después desde app
  ELSEIF NEW.metodo_pago = 'tarjeta' THEN
    INSERT INTO orden_pago_tarjeta (orden_id, numero_tarjeta, fecha_expiracion, cvv, nombre_titular)
    VALUES (NEW.ordenesId, '', '', '', ''); -- Datos se completan luego desde app
  END IF;
END$$

DELIMITER ;

/*traer precio(de la ordern) del precio producto*/
DELIMITER $$

CREATE TRIGGER antes_insertar_orden_detalle
BEFORE INSERT ON orden_detalle
FOR EACH ROW
BEGIN
  DECLARE precio_actual DECIMAL(10,2);

  -- Obtener el precio actual del producto desde la tabla de productos
  SELECT precio INTO precio_actual
  FROM productos
  WHERE productosId = NEW.producto_id;

  -- Asignar el precio al campo precio_unitario de la orden
  SET NEW.precio_unitario = precio_actual;
END$$

DELIMITER ;

CREATE TABLE orden_pago_efectivo (
orden_pago_efectivoId INT AUTO_INCREMENT PRIMARY KEY,
orden_id INT NOT NULL,
monto_pagado DECIMAL(10,2) NOT NULL,
cambio DECIMAL(10,2), -- Se calculará en la aplicación
FOREIGN KEY (orden_id) REFERENCES ordenes(ordenesId)
);
CREATE TABLE orden_pago_tarjeta (
orden_pago_tarjetaId INT AUTO_INCREMENT PRIMARY KEY,
orden_id INT NOT NULL,
numero_tarjeta VARCHAR(20),
fecha_expiracion VARCHAR(7),
cvv VARCHAR(4),
nombre_titular VARCHAR(100),
FOREIGN KEY (orden_id) REFERENCES ordenes(ordenesId)
);

--Trigger para reducir inventario automáticamente
DELIMITER $$

CREATE TRIGGER reducir_inventario
AFTER INSERT ON orden_detalle
FOR EACH ROW
BEGIN
  UPDATE productos
  SET inventario = inventario - NEW.cantidad
  WHERE productosId  = NEW.producto_id;
END$$

DELIMITER ;

/*
CREATE TABLE resenas (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
producto_id INT NOT NULL,
comentario TEXT,
calificacion INT CHECK (calificacion BETWEEN 1 AND 5),
fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
visible BOOLEAN DEFAULT TRUE,
FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
FOREIGN KEY (producto_id) REFERENCES productos(id),
UNIQUE (usuario_id, producto_id)
);
*/

CREATE TABLE resenas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    comentario TEXT,
    calificacion INT CHECK (calificacion BETWEEN 1 AND 5),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visible BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuarioId),
    FOREIGN KEY (producto_id) REFERENCES productos(productosId)
);
/*reducir inventario*/
DELIMITER $$

CREATE TRIGGER reducir_inventario
AFTER INSERT ON orden_detalle
FOR EACH ROW
BEGIN
  UPDATE productos
  SET inventario = inventario - NEW.cantidad
  WHERE productosId = NEW.producto_id;
END$$

DELIMITER ;
/*--Insert Resenna--*/
DELIMITER $$

CREATE TRIGGER trg_resena_insert
AFTER INSERT ON resenas
FOR EACH ROW
BEGIN
  UPDATE productos
  SET promedio_valoracion = (
    SELECT ROUND(AVG(calificacion), 2)
    FROM resenas
    WHERE producto_id = NEW.producto_id
  )
  WHERE productosId = NEW.producto_id;
END;
$$

DELIMITER ;

/*update resenna*/
DELIMITER $$

CREATE TRIGGER trg_resena_update
AFTER UPDATE ON resenas
FOR EACH ROW
BEGIN
  UPDATE productos
  SET promedio_valoracion = (
    SELECT ROUND(AVG(calificacion), 2)
    FROM resenas
    WHERE producto_id = NEW.producto_id
  )
  WHERE productosId = NEW.producto_id;
END;
$$

DELIMITER ;


/*eliminar*/
DELIMITER $$

CREATE TRIGGER trg_resena_delete
AFTER DELETE ON resenas
FOR EACH ROW
BEGIN
  UPDATE productos
  SET promedio_valoracion = (
    SELECT ROUND(AVG(calificacion), 2)
    FROM resenas
    WHERE producto_id = OLD.producto_id
  )
  WHERE productosId = OLD.producto_id;
END;
$$

DELIMITER ; 


CREATE TABLE resena_reporte (
id INT AUTO_INCREMENT PRIMARY KEY,
resena_id INT NOT NULL,
usuario_id INT NOT NULL,
motivo TEXT,
fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (resena_id) REFERENCES resenas(id) ON DELETE CASCADE,
FOREIGN KEY (usuario_id) REFERENCES usuarios(usuarioId) ON DELETE CASCADE
);




CREATE TABLE componentes_personalizables (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
descripcion TEXT
);


CREATE TABLE producto_componentes (
id INT AUTO_INCREMENT PRIMARY KEY,
producto_id INT NOT NULL,
componente_id INT NOT NULL,
obligatorio BOOLEAN DEFAULT FALSE,
FOREIGN KEY (producto_id) REFERENCES productos(productosId),
FOREIGN KEY (componente_id) REFERENCES componentes_personalizables(id)
);


CREATE TABLE opciones_componentes (
id INT AUTO_INCREMENT PRIMARY KEY,
componente_id INT NOT NULL,
nombre VARCHAR(100) NOT NULL,
precio_adicional DECIMAL(10,2) DEFAULT 0.00,
FOREIGN KEY (componente_id) REFERENCES componentes_personalizables(id)
);


CREATE TABLE productos_personalizados (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
producto_base_id INT NOT NULL,
precio_total DECIMAL(10,2) NOT NULL,
fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (usuario_id) REFERENCES usuarios(usuarioId),
FOREIGN KEY (producto_base_id) REFERENCES productos(productosId)
);


CREATE TABLE productos_personalizados_opciones (
id INT AUTO_INCREMENT PRIMARY KEY,
producto_personalizado_id INT NOT NULL,
componente_id INT NOT NULL,
opcion_id INT NOT NULL,
FOREIGN KEY (producto_personalizado_id) REFERENCES productos_personalizados(id) ON DELETE CASCADE,
FOREIGN KEY (componente_id) REFERENCES componentes_personalizables(id),
FOREIGN KEY (opcion_id) REFERENCES opciones_componentes(id)
);


CREATE TABLE promociones (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
tipo ENUM('producto', 'categoria') NOT NULL,
descuento DECIMAL(5,2) NOT NULL,
fecha_inicio DATE NOT NULL,
fecha_fin DATE NOT NULL,
activo BOOLEAN DEFAULT TRUE
);


CREATE TABLE promocion_productos (
id INT AUTO_INCREMENT PRIMARY KEY,
promocion_id INT NOT NULL,
producto_id INT NOT NULL,
FOREIGN KEY (promocion_id) REFERENCES promociones(id) ON DELETE CASCADE,
FOREIGN KEY (producto_id) REFERENCES productos(productosId) ON DELETE CASCADE
);


CREATE TABLE promocion_categorias (
id INT AUTO_INCREMENT PRIMARY KEY,
promocion_id INT NOT NULL,
categoria_id INT NOT NULL,
FOREIGN KEY (promocion_id) REFERENCES promociones(id) ON DELETE CASCADE,
FOREIGN KEY (categoria_id) REFERENCES categorias(categoriaId) ON DELETE CASCADE
);




CREATE TABLE historial_promociones (
id INT AUTO_INCREMENT PRIMARY KEY,
promocion_id INT NOT NULL,
producto_id INT,
categoria_id INT,
fecha_aplicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (promocion_id) REFERENCES promociones(id),
FOREIGN KEY (producto_id) REFERENCES productos(productosId),
FOREIGN KEY (categoria_id) REFERENCES categorias(categoriaId)
);


CREATE TABLE carritos (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario_id INT NOT NULL,
fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
activo BOOLEAN DEFAULT TRUE,
FOREIGN KEY (usuario_id) REFERENCES usuarios(usuarioId)
);


CREATE TABLE carrito_productos (
id INT AUTO_INCREMENT PRIMARY KEY,
carrito_id INT NOT NULL,
producto_id INT NOT NULL,
cantidad INT NOT NULL CHECK (cantidad > 0),
FOREIGN KEY (carrito_id) REFERENCES carritos(id) ON DELETE CASCADE,
FOREIGN KEY (producto_id) REFERENCES productos(productosId)
);


CREATE TABLE carrito_productos_personalizados (
id INT AUTO_INCREMENT PRIMARY KEY,
carrito_id INT NOT NULL,
producto_personalizado_id INT NOT NULL,
cantidad INT NOT NULL CHECK (cantidad > 0),
FOREIGN KEY (carrito_id) REFERENCES carritos(id) ON DELETE CASCADE,
FOREIGN KEY (producto_personalizado_id) REFERENCES productos_personalizados(id)
);


CREATE TABLE traducciones (
id INT AUTO_INCREMENT PRIMARY KEY,
clave VARCHAR(100) NOT NULL,
idioma ENUM('es', 'en') NOT NULL,
texto TEXT NOT NULL,
UNIQUE(clave, idioma)
);
/*inserts*/

SELECT p.nombre, i.url_imagen
FROM productos p
JOIN imagenes i ON p.productosId = i.producto_id
ORDER BY p.productosId;

INSERT INTO productos (nombre, descripcion, precio, inventario, categoria_id) VALUES
('Aretes Corazón Dorado Plateado', 'Elegancia y estilo en una pieza encantadora. Perfectos para toda ocasión.', 5000, 15, 3),
('Collar Girasol Giratorio', 'Con baño de oro y diseño giratorio, este collar es una joya única.', 10000, 20, 2),
('Pulsera Trébol Negro', 'Un diseño de buena suerte con acabado dorado delicado.', 8000, 12, 1),
('Aretes lazo chispita plateados', 'Elegancia y estilo en una pieza encantadora. Perfectos para toda ocasión.', 6000, 18, 3),
('Collar Corazon Chispa dorado acero', 'Un diseño único para que puedas realzar tu belleza con este collar.', 7000, 22, 2),
('Pulsera Trebol rojo con baño de oro', 'Un diseño de buena suerte con acabado dorado delicado.', 8000, 14, 1),
('Aretes Trebol negro', 'Un diseño de buena suerte con acabado dorado delicado.', 6000, 17, 3),
('Aretes Trebol rojo', 'Un diseño de buena suerte con acabado dorado delicado.', 6000, 19, 3);



INSERT INTO estados (nombre_estado) VALUES
('En preparación'),
('Enviado'),
('Cancelado');
INSERT INTO categorias (nombre) VALUES
('pulseras'),
('collares'),
('aretes');

-- Insertar roles primero
INSERT INTO roles (nombre) VALUES ('administrador'), ('cliente');

-- Insertar usuario con contraseña cifrada con SHA2
INSERT INTO usuarios (nombre_usuario, correo, contraseña, rol_id)
VALUES (
    'Priscilla',
    'Priscilla@pwi.com',
    SHA2('123456', 256),
    2
);

INSERT INTO usuarios (nombre_usuario, correo, contraseña, rol_id)
VALUES (
    'admin',
    'admin@pwi.com',
    SHA2('123456', 256),
    1
);
-- usuarios (contraseña ejemplo en SHA2-256 en hexadecimal)
INSERT INTO usuarios (nombre_usuario, correo, contraseña, rol_id) VALUES
('juanperez', 'juan@gmail.com', SHA2('123456', 256), 2),
('mariagonzalez', 'maria@gmail.com', SHA2('123456', 256), 2),
('martina', 'martina@gmail.com', SHA2('123456', 256), 2),
('rachel', 'rachel@gmail.com', SHA2('123456', 256), 2),
('kora', 'kora@gmail.com', SHA2('123456', 256), 2),
('mylene', 'mylene@gmail.com', SHA2('123456', 256), 2);
INSERT INTO etiquetas (nombre) VALUES
('Popular'),
('Recomendado'),
('Limitado'),
('Exclusivo');

-- producto_etiqueta (productoId y etiquetaId deben existir)
INSERT INTO producto_etiqueta (productoId, etiquetaId) VALUES
(1, 1),
(1, 2),
(2, 9),
(3, 10),
(4, 11),
(5, 12);

INSERT INTO orden_pago_tarjeta (orden_id, numero_tarjeta, fecha_expiracion, cvv, nombre_titular)
VALUES (LAST_INSERT_ID(), '1234123412341234', '12/25', '123', 'Juan Pérez');

INSERT INTO resenas (
    usuario_id,
    producto_id,
    comentario,
    calificacion,
    visible
) VALUES (
    1, 
    3, 
    'Está bien', 
    5, 
    TRUE
);