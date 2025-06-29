<?php
class CategoriaModel {
    public $enlace;

    public function __construct() {
        $this->enlace = new MySqlConnect();
    }

    // Obtener todas las categorías
    public function all() {
        try {
            $vSql = "SELECT * FROM categorias;";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    // Obtener una categoría por su ID
    public function get($id) {
        try {
            $vSql = "SELECT * FROM categoria WHERE id = $id";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado[0];
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    // Obtener categorías asociadas a un producto
    public function getCategoriaProducto($idProducto) {
        try {
            $vSql = "SELECT c.id, c.nombre 
                     FROM categoria c, producto_categoria pc 
                     WHERE pc.categoria_id = c.id AND pc.producto_id = $idProducto";
            $vResultado = $this->enlace->ExecuteSQL($vSql);
            return $vResultado;
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    // Obtener productos por categoría
    public function getProductosPorCategoria($param) {
        try {
            $vResultado = null;
            if (!empty($param)) {
                $vSql = "SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen
                         FROM producto_categoria pc, producto p
                         WHERE pc.producto_id = p.id AND pc.categoria_id = $param";
                $vResultado = $this->enlace->ExecuteSQL($vSql);
            }
            return $vResultado;
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    // Crear nueva categoría
    public function create($objeto) {
        try {
            $vSql = "INSERT INTO categoria (nombre) VALUES ('$objeto->nombre')";
            $vResultado = $this->enlace->executeSQL_DML_last($vSql);
            return $this->get($vResultado);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    // Actualizar categoría
    public function update($objeto) {
        try {
            $vSql = "UPDATE categoria SET nombre = '$objeto->nombre' WHERE id = $objeto->id";
            $this->enlace->executeSQL_DML($vSql);
            return $this->get($objeto->id);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
