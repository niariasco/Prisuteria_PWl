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
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const saveUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  const decodeToken = () => {
    if (!user) return {};

    try {
      const token = user.token || user;
      if (!token) return {};

      const decoded = jwtDecode(token);

      const normalizedUser = {
        id: decoded.id,
        usuarioId: decoded.id,
        nombre: decoded.nombre,
        email: decoded.email,
        rol: decoded.rol,
        rolNombre: decoded.rol?.nombre,
        rolId: decoded.rol?.rolesId,
        iat: decoded.iat,
        exp: decoded.exp,
      };

      return normalizedUser;
    } catch (error) {
      return {};
    }
  };

  const autorize = ({ requiredRoles }) => {
    const userData = decodeToken();
    if (!userData || !userData.rol) return false;

    return requiredRoles.includes(userData.rol.nombre);
  };

  const isAdmin = () => {
    const userData = decodeToken();
    if (!userData.rol) return false;

    const adminRoles = ['administrador', 'Administrador', 'admin', 'Admin'];
    return adminRoles.includes(userData.rol.nombre);
  };

  // Nueva función para verificar si es cliente
  const isCliente = () => {
    const userData = decodeToken();
    if (!userData.rol) return false;

    const clienteRoles = ['cliente', 'Cliente', 'client', 'Client'];
    return clienteRoles.includes(userData.rol.nombre);
  };

  // Nueva función para verificar si puede usar el carrito
  const canUseCart = () => {
    // Solo los usuarios autenticados que son clientes pueden usar el carrito
    if (!isAuthenticated) return false;
    
    const userData = decodeToken();
    if (!userData.rol) return false;

    // Verificar si es cliente
    return isCliente();
  };

  // Nueva función para verificar si puede crear pedidos
  const canCreateOrders = () => {
    // Solo los usuarios autenticados que son clientes pueden crear pedidos
    if (!isAuthenticated) return false;
    
    const userData = decodeToken();
    if (!userData.rol) return false;

    // Verificar si es cliente
    return isCliente();
  };

  // Nueva función para verificar si puede ver sus propios pedidos
  const canViewOrders = () => {
    // Los clientes pueden ver sus pedidos, los admins pueden ver todos
    if (!isAuthenticated) return false;
    
    return isCliente() || isAdmin();
  };

  // Nueva función para verificar si puede ver pedidos de otros usuarios (solo admin)
  const canViewAllOrders = () => {
    return isAuthenticated && isAdmin();
  };

  // Nueva función para obtener mensaje de restricción del carrito
  const getCartRestrictionMessage = () => {
    if (!isAuthenticated) {
      return 'Debe iniciar sesión como cliente para usar el carrito de compras';
    }
    
    if (isAdmin()) {
      return 'Los administradores no pueden realizar compras. Inicie sesión con una cuenta de cliente';
    }
    
    return 'Solo los clientes pueden usar el carrito de compras';
  };

  // Nueva función para obtener mensaje de restricción de pedidos
  const getOrderRestrictionMessage = () => {
    if (!isAuthenticated) {
      return 'Debe iniciar sesión como cliente para crear pedidos';
    }
    
    if (isAdmin()) {
      return 'Los administradores no pueden crear pedidos. Inicie sesión con una cuenta de cliente';
    }
    
    return 'Solo los clientes pueden crear pedidos';
  };

  // Función para validar una acción de pedido
  const validateOrderAction = (action = 'create') => {
    const actions = {
      create: canCreateOrders(),
      view: canViewOrders(),
      viewAll: canViewAllOrders()
    };

    return actions[action] || false;
  };

  const getUserInfo = () => {
    const userData = decodeToken();
    return {
      ...userData,
      isAdmin: isAdmin(),
      isCliente: isCliente(),
      canUseCart: canUseCart(),
      canCreateOrders: canCreateOrders(),
      canViewOrders: canViewOrders(),
      canViewAllOrders: canViewAllOrders(),
      isAuthenticated,
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
        isCliente,
        canUseCart,
        canCreateOrders,
        canViewOrders,
        canViewAllOrders,
        getCartRestrictionMessage,
        getOrderRestrictionMessage,
        validateOrderAction,
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