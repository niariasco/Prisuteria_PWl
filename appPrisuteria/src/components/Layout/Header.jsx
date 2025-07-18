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
const [anchorElSubmenu, setAnchorElSubmenu] = useState(null);
const handleSubmenuOpen = (event) => setAnchorElSubmenu(event.currentTarget);

  //Obtener usuario
  const {user, decodeToken/*,autorize*/}= useContext(UserContext)
  const [userData,setUserData]=useState(decodeToken())
  useEffect(()=>{setUserData(decodeToken())},[user])
  
  const {cart, getCountItems}=useCart()
  //Gestión menu usuario
  const [anchorElUser, setAnchorEl] = useState(null);
  //Gestión menu opciones
  const [mobileOpcionesAnchorEl, setMobileMoreAnchorEl] = useState(null);
  //Booleano Menu opciones responsivo
  const isMobileOpcionesMenuOpen = Boolean(mobileOpcionesAnchorEl);
  //Gestión menu principal
  const [anchorElPrincipal, setAnchorElPrincipal] = useState(null);

const [anchorElProductos, setAnchorElProductos] = useState(null);
const [anchorElResenas, setAnchorElResenas] = useState(null);
const [anchorElPromociones, setAnchorElPromociones] = useState(null);
const [anchorElOrdenes, setAnchorElOrdenes] = useState(null);
const [anchorElUsuarios, setAnchorElUsuarios] = useState(null);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  //Cerrado menu usuario
  const handleUserMenuClose = () => {
    setAnchorEl(null);
    handleOpcionesMenuClose();
  };
  //Abierto menu principal
  const handleOpenPrincipalMenu = (event) => {
    setAnchorElPrincipal(event.currentTarget);
  };
  //Cerrado menu principal
  const handleClosePrincipalMenu = () => {
    setAnchorElPrincipal(null);
  };
  //Abierto menu opciones
  const handleOpcionesMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };
  //Cerrado menu opciones
  const handleOpcionesMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

const handleOpen = (setter) => (event) => {
  setter(event.currentTarget);
};

const handleClose = (setter) => () => {
  setter(null);
};

const handleSubmenuClose = () => {
  setAnchorElSubmenu(null);
  setAnchorElProductos(null); // Asegura que se cierre también el submenu de productos
};



  //Lista enlaces menu usuario
  const userItems = [
    { name: "Login", link: "/user/login", login: false },
    { name: "Registrarse", link: "/user/create", login: false },
    { name: "Logout", link: "/user/logout", login: true },
  ];
  const navItems = [
    { name: "Productos", link: "/producto",roles:null },
    { name: "Promociones", link: "/promocion", roles:null },
    { name: "Ordenes", link: "/orden", roles:null },
//    { name: "Mantenimientos", link: "", roles:['Administrador'] },
  {
    name: "Mantenimientos",
    link: "", 
  //  roles: ['Administrador'], // Solo para admin

  },
];

 /*
  //Lista enlaces menu principal
  const navItems = [
    { name: "Peliculas", link: "/productos",roles:null },
    { name: "Cátalogo de Peliculas", link: "/catalog-movies/", roles:null },
    { name: "Filtrar Peliculas", link: "/movie/filter", roles:null },
    { name: "Mantenimiento Peliculas", link: "/movie-table/", roles:['Administrador'] },
  ];
  */
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
                    <MenuItem component={Link} to="/productos/crear" onClick={handleSubmenuClose}>Crear</MenuItem>
                    <MenuItem component={Link} to="/productos/actualizar" onClick={handleSubmenuClose}>Actualizar</MenuItem>
                    <MenuItem component={Link} to="/productos/eliminar" onClick={handleSubmenuClose}>Eliminar</MenuItem>
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
                    <MenuItem component={Link} to="/resenas/crear" onClick={handleSubmenuClose}>Crear</MenuItem>
                    <MenuItem component={Link} to="/resenas/actualizar" onClick={handleSubmenuClose}>Actualizar</MenuItem>
                    <MenuItem component={Link} to="/resenas/eliminar" onClick={handleSubmenuClose}>Eliminar</MenuItem>
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
                    <MenuItem component={Link} to="/promociones/crear" onClick={handleSubmenuClose}>Crear</MenuItem>
                    <MenuItem component={Link} to="/promociones/actualizar" onClick={handleSubmenuClose}>Actualizar</MenuItem>
                    <MenuItem component={Link} to="/promociones/eliminar" onClick={handleSubmenuClose}>Eliminar</MenuItem>
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
                    <MenuItem component={Link} to="/ordenes/crear" onClick={handleSubmenuClose}>Crear</MenuItem>
                    <MenuItem component={Link} to="/ordenes/actualizar" onClick={handleSubmenuClose}>Actualizar</MenuItem>
                    <MenuItem component={Link} to="/ordenes/eliminar" onClick={handleSubmenuClose}>Eliminar</MenuItem>
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
                    <MenuItem component={Link} to="/usuarios/crear" onClick={handleSubmenuClose}>Crear</MenuItem>
                    <MenuItem component={Link} to="/usuarios/actualizar" onClick={handleSubmenuClose}>Actualizar</MenuItem>
                    <MenuItem component={Link} to="/usuarios/eliminar" onClick={handleSubmenuClose}>Eliminar</MenuItem>
                  </Menu>
                </MenuItem>
              </Menu>
            </Box>
          );
        }

        // Otros ítems fuera de "Mantenimientos"
        return (
          <Button key={index} component={Link} to={item.path} color="inherit">
            <Typography textAlign="center">{item.name}</Typography>
          </Button>
        );
      })}
  </Box>
);

        // Rutas protegidas
        /*
        if (userData && item.roles) {
          if (autorize({ requiredRoles: item.roles })) {
            return (
              <Button
                key={index}
                component={Link}
                to={item.link}
                color="#FFFFFF"
              >
                <Typography textAlign="center">{item.name}</Typography>
              </Button>
            );
          }
        }
        */
  //Menu Principal responsivo
  const menuPrincipalMobile = navItems.map((page, index) => (
    <MenuItem key={index} component={Link} to={page.link}>
      <Typography sx={{ textAlign: "center" }}>{page.name}</Typography>
    </MenuItem>
  ));
  //Identificador menu usuario
  const userMenuId = "user-menu";
  //Menu Usuario
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
        {userData &&(
          <MenuItem>
            <Typography variant="subtitle1" gutterBottom>
              {userData?.email}
            </Typography>
          </MenuItem>
       )}

        {userItems.map((setting, index) =>  {
          //Verificar las opciones del usuario 
          if(setting.login && userData && Object.keys(userData).length >0){
            return (<MenuItem key={index} component={Link} to={setting.link}>
              <Typography sx={{ textAlign: 'center' }}>
                {setting.name}
              </Typography>
            </MenuItem>)
          }else if(!setting.login && Object.keys(userData).length==0){
            return (<MenuItem key={index} component={Link} to={setting.link}>
              <Typography sx={{ textAlign: 'center' }}>
                {setting.name}
              </Typography>
            </MenuItem>)
          }          
        })}
      </Menu>
    </Box>
  );
  //Identificador menu opciones
  const menuOpcionesId = "badge-menu-mobile";
  //Menu opciones responsivo
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
      <MenuItem>
        <IconButton size="large" color="#FFFFFF">
          <Badge
            badgeContent={getCountItems(cart)}
            color="#FFFFFF"
            component={Link}
            to="/rental/crear/"
          >
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <p>Compras</p>
      </MenuItem>
      <MenuItem>
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
        color="primaryLight"
        sx={{ backgroundColor: "primaryLight.main" }}
      >
        <Toolbar>
          <IconButton
            size="large"
            color="inherit"
            aria-haspopup="true"
            sx={{ mr: 2 }}
            onClick={handleOpenPrincipalMenu}
          >
            <MenuIcon />
          </IconButton>
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
              edge="end"
              component="a"
              href="/"
              aria-label="Compra nuestros Productos"
              color="#FFFFFF"
            >
<FontAwesomeIcon icon={faHouse} />

            </IconButton>
          </Tooltip>
          {/* Enlace página inicio */}
          {menuPrincipal}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton size="large" color="#FFFFFF">
              <Badge
                badgeContent={getCountItems(cart)}
                color="primary"
                component={Link}
                to="/rental/crear/"
              >
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            <IconButton size="large" color="inherit">
              <Badge badgeContent={17} color="FFFFFF">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Box>
          <div>{userMenu}</div>
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={menuOpcionesId}
              aria-haspopup="true"
              onClick={handleOpcionesMenuOpen}
              color="#FFFFFF"
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
