import { useContext, useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Menu, MenuItem, FormControl, Select  } from "@mui/material";
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
import { useTranslation } from 'react-i18next';


const LanguageSelector = () => {
  const { i18n } = useTranslation();
  
  const languages = [
    { 
      code: 'es', 
      name: 'Español', 
      flag: '🇪🇸',
      shortName: 'ES',
    color: '#FF69B4', // rosado fuerte  
    bgColor: 'linear-gradient(135deg, #FF69B4 0%, #E6A8D7 100%)' // rosado a lila claro
    },
    { 
      code: 'en', 
      name: 'English', 
      flag: '🇺🇸',
      shortName: 'EN',
 color: '#DA70D6', // lila  
    bgColor: 'linear-gradient(135deg, #DA70D6 0%, #FFC0CB 100%)' // lila a rosado claro
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    localStorage.setItem('lang', selectedLanguage);//
    i18n.changeLanguage(selectedLanguage);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          displayEmpty
          renderValue={(selected) => {
            const selectedLang = languages.find(lang => lang.code === selected);
            return (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                background: selectedLang?.bgColor || currentLanguage.bgColor,
                borderRadius: '8px',
                px: 1.5,
                py: 0.5,
                minWidth: '80px'
              }}>
                <Box sx={{ 
                  fontSize: '1.2rem', 
                  mr: 1,
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                }}>
                  {selectedLang?.flag || currentLanguage.flag}
                </Box>
                <Typography sx={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {selectedLang?.shortName || currentLanguage.shortName}
                </Typography>
              </Box>
            );
          }}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none'
            },
            '& .MuiSvgIcon-root': {
              color: 'white',
              right: '8px'
            }
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: '#2C3E50', // Fondo oscuro como en la imagen
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                mt: 1,
                minWidth: '160px',
                '& .MuiMenuItem-root': {
                  padding: 0,
                  margin: '4px 8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'translateX(4px)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }
                  }
                },
              },
            },
          }}
        >
          {languages.map((language) => (
            <MenuItem key={language.code} value={language.code}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: '100%',
                background: language.bgColor,
                borderRadius: '8px',
                px: 1.5,
                py: 1,
                margin: '2px 0'
              }}>
                <Box sx={{ 
                  fontSize: '1.3rem', 
                  mr: 1.5,
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                }}>
                  {language.flag}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ 
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    mb: -0.2
                  }}>
                    {language.shortName}
                  </Typography>
                  <Typography sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '0.75rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}>
                    {language.name}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

// Componente Header principal
function Header() {
  const { t } = useTranslation(); // Hook de traducción para el header
  
  // Estados para manejo de menús
  const [anchorElSubmenu, setAnchorElSubmenu] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpcionesAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [anchorElPrincipal, setAnchorElPrincipal] = useState(null);
  
  // Estados para submenús de mantenimiento
  const [anchorElProductos, setAnchorElProductos] = useState(null);
  const [anchorElPromociones, setAnchorElPromociones] = useState(null);
  const [anchorElUsuarios, setAnchorElUsuarios] = useState(null);

  // Contexto de usuario y carrito
  const { user, decodeToken, isAdmin } = useContext(UserContext);
  const [userData, setUserData] = useState(decodeToken());
  const { cart, getCountItems } = useCart();

  useEffect(() => {
    setUserData(decodeToken());
  }, [user]);

  // Verificar si el usuario es administrador
  const userIsAdmin = isAdmin();

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
    setAnchorElPromociones(null);
    setAnchorElUsuarios(null);
  };

  // Handlers genéricos para submenús
  const handleOpen = (setter) => (event) => {
    setter(event.currentTarget);
  };

  const handleClose = (setter) => () => {
    setter(null);
  };

  // Configuración de elementos del menú (con traducciones)
  const userItems = [
    { name: t('header.user.login', 'Login'), link: "/user/login", login: false },
    { name: t('header.user.register', 'Registrarse'), link: "/user/create", login: false },
    { name: t('header.user.logout', 'Logout'), link: "/user/logout", login: true },
  ];

  // Filtrar elementos de navegación basado en si el usuario es administrador
  const navItems = [
    { name: t('header.nav.products', 'Productos'), link: "/producto", roles: null },
    { name: t('header.nav.promotions', 'Promociones'), link: "/promocion", roles: null },
    { name: t('header.nav.orders', 'Ordenes'), link: "/orden", roles: null },
    // Solo mostrar Mantenimientos si el usuario es administrador
    ...(userIsAdmin ? [{ name: t('header.nav.maintenance', 'Mantenimientos'), link: "", roles: ['Administrador'] }] : []),
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
          if (item.name === t('header.nav.maintenance', 'Mantenimientos') && userIsAdmin) {
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
                    {t('header.nav.products', 'Productos')}
                    <Menu
                      anchorEl={anchorElProductos}
                      open={Boolean(anchorElProductos)}
                      onClose={handleClose(setAnchorElProductos)}
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      transformOrigin={{ vertical: "top", horizontal: "left" }}
                      MenuListProps={{ onMouseLeave: handleClose(setAnchorElProductos) }}
                    >
                      <MenuItem component={Link} to="/productos/crear" onClick={handleSubmenuClose}>
                        {t('header.actions.create', 'Crear')}
                      </MenuItem>
                      <MenuItem component={Link} to="/productos/actualizar" onClick={handleSubmenuClose}>
                        {t('header.actions.update', 'Actualizar')}
                      </MenuItem>
                      <MenuItem component={Link} to="/productos/criterios" onClick={handleSubmenuClose}>
                        {t('header.actions.delete', 'Actualizar Costo Producto Personalizado')}
                      </MenuItem>
                    </Menu>
                  </MenuItem>

                  {/* Dashboard */}
                  <MenuItem component={Link} to="/dashboard" onClick={handleSubmenuClose}>
                    {t('Dashboard')}
                  </MenuItem>   

                  {/* Promociones */}
                  <MenuItem
                    onMouseEnter={handleOpen(setAnchorElPromociones)}
                    onMouseLeave={handleClose(setAnchorElPromociones)}
                  >
                    {t('header.nav.promotions', 'Promociones')}
                    <Menu
                      anchorEl={anchorElPromociones}
                      open={Boolean(anchorElPromociones)}
                      onClose={handleClose(setAnchorElPromociones)}
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      transformOrigin={{ vertical: "top", horizontal: "left" }}
                      MenuListProps={{ onMouseLeave: handleClose(setAnchorElPromociones) }}
                    >
                      <MenuItem component={Link} to="/promociones/crear" onClick={handleSubmenuClose}>
                        {t('header.actions.create', 'Crear')}
                      </MenuItem>
                      <MenuItem component={Link} to="/promociones/actualizar" onClick={handleSubmenuClose}>
                        {t('header.actions.update', 'Actualizar')}
                      </MenuItem>
                    </Menu>
                  </MenuItem>

                  {/* Usuarios */}
                  <MenuItem
                    onMouseEnter={handleOpen(setAnchorElUsuarios)}
                    onMouseLeave={handleClose(setAnchorElUsuarios)}
                  >
                    {t('header.nav.users', 'Usuarios')}
                    <Menu
                      anchorEl={anchorElUsuarios}
                      open={Boolean(anchorElUsuarios)}
                      onClose={handleClose(setAnchorElUsuarios)}
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      transformOrigin={{ vertical: "top", horizontal: "left" }}
                      MenuListProps={{ onMouseLeave: handleClose(setAnchorElUsuarios) }}
                    >
                      <MenuItem component={Link} to="/usuarios/crear" onClick={handleSubmenuClose}>
                        {t('header.actions.create', 'Crear')}
                      </MenuItem>
                      <MenuItem component={Link} to="/usuarios/actualizar" onClick={handleSubmenuClose}>
                        {t('header.actions.update', 'Actualizar')}
                      </MenuItem>
                      <MenuItem component={Link} to="/usuarios/eliminar" onClick={handleSubmenuClose}>
                        {t('header.actions.delete', 'Eliminar')}
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

  // Menu Principal para móvil - también filtrado por permisos de administrador
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
              {userIsAdmin && (
                <Typography variant="caption" display="block" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  {t('header.user.admin', 'Administrador')}
                </Typography>
              )}
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
        <IconButton size="large" color="inherit" component={Link} to="/cart">
          <Badge badgeContent={getCountItems(cart)} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <p>{t('header.mobile.shopping', 'Compras')}</p>
      </MenuItem>
      <MenuItem onClick={handleOpcionesMenuClose}>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>{t('header.mobile.notifications', 'Notificaciones')}</p>
      </MenuItem>
      {/* Selector de idioma en móvil */}
      <MenuItem>
        <LanguageSelector />
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
          <Tooltip title={t('header.tooltip.home', 'Compra nuestros Productos')}>
            <IconButton
              size="medium"
              edge="start"
              component={Link}
              to="/"
              aria-label={t('header.tooltip.home', 'Compra nuestros Productos')}
              color="inherit"
            >
              <FontAwesomeIcon icon={faHouse} />
            </IconButton>
          </Tooltip>

          {/* Menú principal para desktop */}
          {menuPrincipal}

          <Box sx={{ flexGrow: 1 }} />

          {/* Selector de idioma para desktop */}
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <LanguageSelector />
          </Box>

          {/* Opciones para desktop */}
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Tooltip title={t('header.tooltip.cart', 'Ver carrito de compras')}>
              <IconButton 
                size="large" 
                color="inherit"
                component={Link}
                to="/cart"
                aria-label={t('header.tooltip.cart', 'Ver carrito de compras')}
              >
                <Badge badgeContent={getCountItems(cart)} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Tooltip>
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

export default Header;