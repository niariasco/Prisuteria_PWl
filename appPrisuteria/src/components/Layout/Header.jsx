import { useContext, useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Menu, MenuItem } from "@mui/material";
import { Link } from "react-router-dom";
import Badge from "@mui/material/Badge";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircle from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import Tooltip from "@mui/material/Tooltip";
import { useCart } from "../../hooks/useCart";
import { UserContext } from "../../context/UserContext";

export default function Header() {
  // Estados para manejo de menús
  const [anchorElSubmenu, setAnchorElSubmenu] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpcionesAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [anchorElPrincipal, setAnchorElPrincipal] = useState(null);
  
  // Estados para submenús de mantenimiento
  const [anchorElProductos, setAnchorElProductos] = useState(null);
  const [anchorElResenas, setAnchorElResenas] = useState(null);
  const [anchorElPromociones, setAnchorElPromociones] = useState(null);
  const [anchorElOrdenes, setAnchorElOrdenes] = useState(null);
  const [anchorElUsuarios, setAnchorElUsuarios] = useState(null);

  // Contexto de usuario y carrito
  const { user, decodeToken } = useContext(UserContext);
  const [userData, setUserData] = useState(decodeToken());
  const { cart, getCountItems } = useCart();

  useEffect(() => {
    setUserData(decodeToken());
  }, [user]);

  // Handlers para menú principal
  const handleOpenPrincipalMenu = (event) => {
    setAnchorElPrincipal(event.currentTarget);
  };

  const handleClosePrincipalMenu = () => {
    setAnchorElPrincipal(null);
  };

  // Handlers para menú de usuario
  const handleUserMenuOpen = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorElUser(null);
    handleOpcionesMenuClose();
  };

  // Handlers para menú de opciones móvil
  const handleOpcionesMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleOpcionesMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  // Handlers para submenú de mantenimientos
  const handleSubmenuOpen = (event) => {
    setAnchorElSubmenu(event.currentTarget);
  };

  const handleSubmenuClose = () => {
    setAnchorElSubmenu(null);
    setAnchorElProductos(null);
    setAnchorElResenas(null);
    setAnchorElPromociones(null);
    setAnchorElOrdenes(null);
    setAnchorElUsuarios(null);
  };

  // Handlers genéricos para submenús
  const handleOpen = (setter) => (event) => {
    setter(event.currentTarget);
  };

  const handleClose = (setter) => () => {
    setter(null);
  };

  // Configuración de elementos del menú
  const userItems = [
    { name: "Login", link: "/user/login", login: false },
    { name: "Registrarse", link: "/user/create", login: false },
    { name: "Logout", link: "/user/logout", login: true },
  ];

  const navItems = [
    { name: "Productos", link: "/producto", roles: null },
    { name: "Promociones", link: "/promocion", roles: null },
    { name: "Ordenes", link: "/orden", roles: null },
    { name: "Mantenimientos", link: "", roles: ['Administrador'] },
  ];

  // Booleanos para control de menús
  const isMobileOpcionesMenuOpen = Boolean(mobileOpcionesAnchorEl);
  const userMenuId = "user-menu";
  const menuOpcionesId = "badge-menu-mobile";

  // Componente del menú principal para desktop
  const menuPrincipal = (
    <Box sx={{ display: { xs: "none", sm: "block" } }}>
      {navItems &&
        navItems.map((item, index) => {
          if (item.name === "Mantenimientos") {
            return (
              <Box key={index} sx={{ display: "inline-block", mx: 1 }}>
                <Button
                  color="inherit"
                  aria-controls={`submenu-${index}`}
                  aria-haspopup="true"
                  onClick={handleSubmenuOpen}
                >
                  <Typography textAlign="center">{item.name}</Typography>
                </Button>

                <Menu
                  id={`submenu-${index}`}
                  anchorEl={anchorElSubmenu}
                  open={Boolean(anchorElSubmenu)}
                  onClose={handleSubmenuClose}
                >
                  {/* Productos */}
                  <MenuItem
                    onMouseEnter={handleOpen(setAnchorElProductos)}
                    onMouseLeave={handleClose(setAnchorElProductos)}
                  >
                    Productos
                    <Menu
                      anchorEl={anchorElProductos}
                      open={Boolean(anchorElProductos)}
                      onClose={handleClose(setAnchorElProductos)}
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      transformOrigin={{ vertical: "top", horizontal: "left" }}
                      MenuListProps={{ onMouseLeave: handleClose(setAnchorElProductos) }}
                    >
                      <MenuItem component={Link} to="/productos/crear" onClick={handleSubmenuClose}>
                        Crear
                      </MenuItem>
                      <MenuItem component={Link} to="/productos/actualizar" onClick={handleSubmenuClose}>
                        Actualizar
                      </MenuItem>
                      <MenuItem component={Link} to="/productos/eliminar" onClick={handleSubmenuClose}>
                        Eliminar
                      </MenuItem>
                    </Menu>
                  </MenuItem>

                  {/* Reseñas */}
                  <MenuItem
                    onMouseEnter={handleOpen(setAnchorElResenas)}
                    onMouseLeave={handleClose(setAnchorElResenas)}
                  >
                    Reseñas
                    <Menu
                      anchorEl={anchorElResenas}
                      open={Boolean(anchorElResenas)}
                      onClose={handleClose(setAnchorElResenas)}
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      transformOrigin={{ vertical: "top", horizontal: "left" }}
                      MenuListProps={{ onMouseLeave: handleClose(setAnchorElResenas) }}
                    >
                      <MenuItem component={Link} to="/resenas/crear" onClick={handleSubmenuClose}>
                        Crear
                      </MenuItem>
                      <MenuItem component={Link} to="/resenas/actualizar" onClick={handleSubmenuClose}>
                        Actualizar
                      </MenuItem>
                      <MenuItem component={Link} to="/resenas/eliminar" onClick={handleSubmenuClose}>
                        Eliminar
                      </MenuItem>
                    </Menu>
                  </MenuItem>

                  {/* Promociones */}
                  <MenuItem
                    onMouseEnter={handleOpen(setAnchorElPromociones)}
                    onMouseLeave={handleClose(setAnchorElPromociones)}
                  >
                    Promociones
                    <Menu
                      anchorEl={anchorElPromociones}
                      open={Boolean(anchorElPromociones)}
                      onClose={handleClose(setAnchorElPromociones)}
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      transformOrigin={{ vertical: "top", horizontal: "left" }}
                      MenuListProps={{ onMouseLeave: handleClose(setAnchorElPromociones) }}
                    >
                      <MenuItem component={Link} to="/promociones/crear" onClick={handleSubmenuClose}>
                        Crear
                      </MenuItem>
                      <MenuItem component={Link} to="/promociones/actualizar" onClick={handleSubmenuClose}>
                        Actualizar
                      </MenuItem>
                      <MenuItem component={Link} to="/promociones/eliminar" onClick={handleSubmenuClose}>
                        Eliminar
                      </MenuItem>
                    </Menu>
                  </MenuItem>

                  {/* Órdenes */}
                  <MenuItem
                    onMouseEnter={handleOpen(setAnchorElOrdenes)}
                    onMouseLeave={handleClose(setAnchorElOrdenes)}
                  >
                    Órdenes
                    <Menu
                      anchorEl={anchorElOrdenes}
                      open={Boolean(anchorElOrdenes)}
                      onClose={handleClose(setAnchorElOrdenes)}
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      transformOrigin={{ vertical: "top", horizontal: "left" }}
                      MenuListProps={{ onMouseLeave: handleClose(setAnchorElOrdenes) }}
                    >
                      <MenuItem component={Link} to="/ordenes/crear" onClick={handleSubmenuClose}>
                        Crear
                      </MenuItem>
                      <MenuItem component={Link} to="/ordenes/actualizar" onClick={handleSubmenuClose}>
                        Actualizar
                      </MenuItem>
                      <MenuItem component={Link} to="/ordenes/eliminar" onClick={handleSubmenuClose}>
                        Eliminar
                      </MenuItem>
                    </Menu>
                  </MenuItem>

                  {/* Usuarios */}
                  <MenuItem
                    onMouseEnter={handleOpen(setAnchorElUsuarios)}
                    onMouseLeave={handleClose(setAnchorElUsuarios)}
                  >
                    Usuarios
                    <Menu
                      anchorEl={anchorElUsuarios}
                      open={Boolean(anchorElUsuarios)}
                      onClose={handleClose(setAnchorElUsuarios)}
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      transformOrigin={{ vertical: "top", horizontal: "left" }}
                      MenuListProps={{ onMouseLeave: handleClose(setAnchorElUsuarios) }}
                    >
                      <MenuItem component={Link} to="/usuarios/crear" onClick={handleSubmenuClose}>
                        Crear
                      </MenuItem>
                      <MenuItem component={Link} to="/usuarios/actualizar" onClick={handleSubmenuClose}>
                        Actualizar
                      </MenuItem>
                      <MenuItem component={Link} to="/usuarios/eliminar" onClick={handleSubmenuClose}>
                        Eliminar
                      </MenuItem>
                    </Menu>
                  </MenuItem>
                </Menu>
              </Box>
            );
          }

          // Otros ítems fuera de "Mantenimientos"
          return (
            <Button key={index} component={Link} to={item.link} color="inherit">
              <Typography textAlign="center">{item.name}</Typography>
            </Button>
          );
        })}
    </Box>
  );

  // Menu Principal para móvil
  const menuPrincipalMobile = navItems.map((page, index) => (
    <MenuItem 
      key={index} 
      component={Link} 
      to={page.link}
      onClick={handleClosePrincipalMenu}
    >
      <Typography sx={{ textAlign: "center" }}>{page.name}</Typography>
    </MenuItem>
  ));

  // Menu Usuario
  const userMenu = (
    <Box sx={{ flexGrow: 0 }}>
      <IconButton
        size="large"
        edge="end"
        aria-label="account of current user"
        aria-controls={userMenuId}
        aria-haspopup="true"
        onClick={handleUserMenuOpen}
        color="inherit"
      >
        <AccountCircle />
      </IconButton>

      <Menu
        sx={{ mt: "45px" }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorElUser)}
        onClose={handleUserMenuClose}
      >
        {userData && Object.keys(userData).length > 0 && (
          <MenuItem>
            <Typography variant="subtitle1" gutterBottom>
              {userData?.email}
            </Typography>
          </MenuItem>
        )}

        {userItems.map((setting, index) => {
          // Verificar las opciones del usuario
          if (setting.login && userData && Object.keys(userData).length > 0) {
            return (
              <MenuItem key={index} component={Link} to={setting.link} onClick={handleUserMenuClose}>
                <Typography sx={{ textAlign: 'center' }}>
                  {setting.name}
                </Typography>
              </MenuItem>
            );
          } else if (!setting.login && (!userData || Object.keys(userData).length === 0)) {
            return (
              <MenuItem key={index} component={Link} to={setting.link} onClick={handleUserMenuClose}>
                <Typography sx={{ textAlign: 'center' }}>
                  {setting.name}
                </Typography>
              </MenuItem>
            );
          }
          return null;
        })}
      </Menu>
    </Box>
  );

  // Menu opciones para móvil
  const menuOpcionesMobile = (
    <Menu
      anchorEl={mobileOpcionesAnchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuOpcionesId}
      keepMounted
      open={isMobileOpcionesMenuOpen}
      onClose={handleOpcionesMenuClose}
    >
      <MenuItem onClick={handleOpcionesMenuClose}>
        <IconButton size="large" color="inherit" component={Link} to="/rental/crear/">
          <Badge badgeContent={getCountItems(cart)} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <p>Compras</p>
      </MenuItem>
      <MenuItem onClick={handleOpcionesMenuClose}>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notificaciones</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{ backgroundColor: "primary.main" }}
      >
        <Toolbar>
          {/* Menú hamburguesa para móvil */}
          <IconButton
            size="large"
            color="inherit"
            aria-haspopup="true"
            sx={{ mr: 2, display: { xs: "block", md: "none" } }}
            onClick={handleOpenPrincipalMenu}
          >
            <MenuIcon />
          </IconButton>

          {/* Menú principal móvil */}
          <Menu
            anchorEl={anchorElPrincipal}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorElPrincipal)}
            onClose={handleClosePrincipalMenu}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            {menuPrincipalMobile}
          </Menu>

          {/* Enlace página inicio */}
          <Tooltip title="Compra nuestros Productos">
            <IconButton
              size="medium"
              edge="start"
              component={Link}
              to="/"
              aria-label="Compra nuestros Productos"
              color="inherit"
            >
              <FontAwesomeIcon icon={faHouse} />
            </IconButton>
          </Tooltip>

          {/* Menú principal para desktop */}
          {menuPrincipal}

          <Box sx={{ flexGrow: 1 }} />

          {/* Opciones para desktop */}
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton 
              size="large" 
              color="inherit"
              component={Link}
              to="/rental/crear/"
            >
              <Badge badgeContent={getCountItems(cart)} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            <IconButton size="large" color="inherit">
              <Badge badgeContent={17} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Box>

          {/* Menú de usuario */}
          {userMenu}

          {/* Menú de opciones para móvil */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={menuOpcionesId}
              aria-haspopup="true"
              onClick={handleOpcionesMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {menuOpcionesMobile}
    </Box>
  );
}