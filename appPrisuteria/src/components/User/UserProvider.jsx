import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { UserContext } from '../../context/UserContext';

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Debug: Mostrar datos del usuario almacenado
        console.log('👤 Usuario cargado desde localStorage:', parsedUser);
        
        // Decodificar token para debug
        if (parsedUser?.token) {
          try {
            const decoded = jwtDecode(parsedUser.token);
            console.log('🔓 Token decodificado:', decoded);
          } catch (e) {
            console.error('Error decodificando token almacenado:', e);
          }
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const saveUser = (userData) => {
    // Debug: Ver qué datos llegan del login
    console.log('💾 Guardando usuario:', userData);
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    
    // Debug: Decodificar token inmediatamente después de guardarlo
    if (userData?.token) {
      try {
        const decoded = jwtDecode(userData.token);
        console.log('🔓 Token decodificado al guardar:', decoded);
      } catch (e) {
        console.error('Error decodificando token al guardar:', e);
      }
    }
  };

  const clearUser = () => {
    console.log('🗑️ Limpiando usuario');
    setUser(null);
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  const decodeToken = () => {
    if (!user) {
      console.log('⚠️ No hay usuario para decodificar');
      return {};
    }
    
    try {
      // Extraer el token correctamente
      const token = user.token || user;
      
      if (!token) {
        console.log('⚠️ No se encontró token en el usuario');
        return {};
      }
      
      const decoded = jwtDecode(token);
      console.log('🔓 Token decodificado exitosamente:', decoded);
      
      // Normalizar los datos del usuario según la estructura del backend
      const normalizedUser = {
        id: decoded.id,
        usuarioId: decoded.id,
        nombre: decoded.nombre,
        email: decoded.email,
        rol: decoded.rol, // El objeto rol completo con rolesId y nombre
        rolNombre: decoded.rol?.nombre, // Nombre del rol para facilitar acceso
        rolId: decoded.rol?.rolesId, // ID del rol
        iat: decoded.iat,
        exp: decoded.exp
      };
      
      console.log('👤 Usuario normalizado:', normalizedUser);
      return normalizedUser;
      
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return {};
    }
  };

  const autorize = ({ requiredRoles }) => {
    const userData = decodeToken();
    
    console.log('🔐 Verificando autorización:', {
      userData,
      requiredRoles,
      userRol: userData.rol,
      userRolNombre: userData.rolNombre
    });
    
    if (!userData || !userData.rol) {
      console.log('❌ Sin datos de usuario o rol');
      return false;
    }
    
    // Verificar si el rol del usuario está en los roles requeridos
    const hasPermission = requiredRoles.includes(userData.rol.nombre);
    
    console.log('🔐 Resultado autorización:', {
      hasPermission,
      userRole: userData.rol.nombre,
      requiredRoles
    });
    
    return hasPermission;
  };

  // Función adicional para verificar si es administrador
  const isAdmin = () => {
    const userData = decodeToken();
    if (!userData.rol) return false;
    
    const adminRoles = ['administrador', 'Administrador', 'admin', 'Admin'];
    const isUserAdmin = adminRoles.includes(userData.rol.nombre);
    
    console.log('👨‍💼 Verificación admin:', {
      rolNombre: userData.rol.nombre,
      isUserAdmin
    });
    
    return isUserAdmin;
  };

  // Función para obtener información completa del usuario
  const getUserInfo = () => {
    const userData = decodeToken();
    return {
      ...userData,
      isAdmin: isAdmin(),
      isAuthenticated
    };
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        saveUser,
        clearUser,
        autorize,
        decodeToken,
        isAdmin,
        getUserInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};