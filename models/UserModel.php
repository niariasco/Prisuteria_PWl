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

			//Consulta sql
			$vSql = "SELECT * FROM usuarios where usuarioId=$id";
			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);
			if ($vResultado) {
				$vResultado = $vResultado[0];
				$rol = $rolM->getRolUser($id);
				$vResultado->rol = $rol;
				// Retornar el objeto
				return $vResultado;
			} else {
				return null;
			}
		} catch (Exception $e) {
			die($e->getMessage());
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

                if (!empty($usuario)) {
                    // Crear payload para JWT
                    $data = [
                        'id' => $usuario->usuarioId,
                        'email' => $usuario->correo,
                        'rol' => $usuario->rol, 
                        'iat' => time(),
                        'exp' => time() + 3600
                    ];

                    $jwt_token = JWT::encode($data, config::get('SECRET_KEY'), 'HS256');
                    return ['token' => $jwt_token]; // Devuelve solo token
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
