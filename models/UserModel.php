<?php

use Firebase\JWT\JWT;

class UserModel
{
	public $enlace;
	public function __construct()
	{

		$this->enlace = new MySqlConnect();
	}
	public function all()
	{
		try {
			//Consulta sql
			$vSql = "SELECT * FROM usuarios;";

			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);

			// Retornar el objeto
			return $vResultado;
		} catch (Exception $e) {
			die($e->getMessage());
		}
	}
public function get($id)
{
    try {
        $rolM = new RolModel();

        $vSql = "SELECT usuarioId, nombre_usuario, correo, rol_id FROM usuarios WHERE usuarioId = $id";
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if ($vResultado) {
            $vResultado = $vResultado[0];
            $rol = $rolM->getRolUser($id);
            $vResultado->rol = $rol;
            return $vResultado;
        }
        return null;

    } catch (Exception $e) {
        error_log("Error en UserModel::get(): " . $e->getMessage());
        return null;  // o lanzar excepción según diseño
    }
}



	public function allCustomer()
	{
		try {
			//Consulta sql
			$vSql = "SELECT * FROM usuarios
					where rol_id=2;";

			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);

			// Retornar el objeto
			return $vResultado;
		} catch (Exception $e) {
			die($e->getMessage());
		}
	}
public function login($objeto)
{
    try {
        // Buscar usuario por correo
        $vSql = "SELECT * FROM usuarios WHERE correo='$objeto->email'";
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (!empty($vResultado) && is_object($vResultado[0])) {
            $user = $vResultado[0];

            // Hash del password ingresado
            $inputPasswordHash = hash('sha256', $objeto->password);

            if ($inputPasswordHash === $user->contraseña) {
$usuario = $this->get($user->usuarioId);
error_log(print_r($usuario, true)); // debuggg 
error_log('Usuario antes de token: ' . print_r($usuario, true));

                if (!empty($usuario)) {
                    // Crear payload para JWT
$data = [
    'id' => $usuario->usuarioId,
    'nombre' => $usuario->nombre_usuario ?: 'SIN NOMBRE',
    'email' => $usuario->correo,
    'rol' => $usuario->rol, 
    'iat' => time(),
    'exp' => time() + 3600
];

error_log('Payload JWT: ' . print_r($data, true));

$jwt_token = JWT::encode($data, config::get('SECRET_KEY'), 'HS256');
return ['token' => $jwt_token];


                   
                }
            }
        }

        return false; // Usuario o contraseña incorrectos
    } catch (Exception $e) {
        error_log('Login error: ' . $e->getMessage());
        return false;
    }
}

	public function create($objeto)
	{
		try {
			if (isset($objeto->password) && $objeto->password != null) {
				$crypt = password_hash($objeto->password, PASSWORD_BCRYPT);
				$objeto->password = $crypt;
			}
			//Consulta sql            
			$vSql = "Insert into usuarios (nombre_usuario, correo, contraseña, rol_id)" .
				" Values ('$objeto->name','$objeto->email','$objeto->password',$objeto->rol_id)";

			//Ejecutar la consulta
			$vResultado = $this->enlace->executeSQL_DML_last($vSql);
			// Retornar el objeto creado
			return $this->get($vResultado);
		} catch (Exception $e) {
			handleException($e);
		}
	}
}
