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
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const saveUser = (token) => {
    // Guardar solo el token
    setUser(token);
    localStorage.setItem('user', JSON.stringify(token));
    setIsAuthenticated(true);
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };
/*
  const decodeToken = () => {
    if (!user) return {};
    const token = typeof user === 'string' ? user : user.token;

    try {
      
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return {};
    }
  };
*/
const decodeToken = () => {
  if (!user) return {};
  const token = typeof user === 'string' ? user : user.token;

  try {
    const decoded = jwtDecode(token);
    console.log('Decoded JWT:', decoded);  // <-- agrega esto
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return {};
  }
};

  const autorize = ({ requiredRoles }) => {
    const userData = decodeToken();
    return (
      userData &&
      userData.rol &&
      requiredRoles.includes(userData.rol.nombre) // "nombre" como está en la DB
    );
  };

  UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
