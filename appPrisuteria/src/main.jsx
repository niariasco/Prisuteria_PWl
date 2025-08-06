import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n"; // Importar configuración de i18n AQUÍ
import App from "./App.jsx";
import { createBrowserRouter } from "react-router-dom";
import { Home } from "./components/Home/Home";
import { RouterProvider } from "react-router";
import { PageNotFound } from "./components/Home/PageNotFound";
/*import { DetailMovie } from "./components/Movie/DetailMovie";*/
/*import ListRentals from "./components/Rental/ListRentals";*/
/*import DetailRental from "./components/Rental/DetailRental";
/*import TableMovies from "./components/Movie/TableMovies";*/
/*import { CreateMovie } from "./components/Movie/CreateMovie";*/
/*import { UpdateMovie } from "./components/Movie/UpdateMovie";*/
/*import { CatalogMovies } from "./components/Movie/CatalogMovies";*/
/*import { MovieUploadImage } from "./components/Movie/MovieUploadImage";*/
/*import { CreateMovieRental } from "./components/Rental/CreateMovieRental";*/
/*import { GraphRetal } from "./components/Rental/GraphRental";*/
import UserProvider from "./components/User/UserProvider";
import { Unauthorized } from "./components/User/Unauthorized";
import { Login } from "./components/User/Login";
import { Logout } from "./components/User/Logout";
import { Signup } from "./components/User/Signup";
/*import { Auth } from "./components/User/Auth"; */
import { ListaProductos } from "./components/Productos/ListaProductos";
import { DetalleProductos } from "./components/Productos/DetalleProductos";
import { ListaResenas } from "./components/Resenas/ListaResenas";
import { DetalleResenas } from "./components/Resenas/DetalleResenas";
import{ListaPromociones} from "./components/Promociones/ListaPromociones";
import{DetallePromociones} from "./components/Promociones/DetallePromociones";
import { ListOrders } from "./components/Orders/ListOrders";
import { DetalleOrder } from "./components/Orders/DetalleOrder";
import { CreateProducto } from "./components/Productos/CreateProducto";
import { UpdateProducto } from "./components/Productos/UpdateProducto";
import { CreatePromocion } from "./components/Promociones/CreatePromocion";
import { UpdatePromocion } from "./components/Promociones/UpdatePromocion";




const rutas = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <Home /> },
      { path: '*', element: <PageNotFound /> },

      // RUTAS ADMINISTRADOR (sin restricción temporalmente)
      /*
      {
        element: <Auth requiredRoles={['Administrador']} />,
        children: [
          { path: '/productos/crear', element: <CreateProducto /> },
          { path: '/admin/resenas', element: <ListaResenas /> },
          { path: '/admin/promociones', element: <ListaPromociones /> },
          { path: '/admin/ordenes', element: <ListOrders /> },
           
          { path: '/admin/usuarios', element: <div>Gestión de usuarios</div> }
           
        ]
      },
      */

      // Rutas de admin sin Auth (acceso libre )
      { path: '/productos/crear', element: <CreateProducto /> },
      { path: '/productos/actualizar', element: <UpdateProducto /> },
      { path: '/promociones/crear', element: <CreatePromocion /> },
     { path: '/promociones/actualizar', element: <UpdatePromocion /> },
      { path: '/admin/resenas', element: <ListaResenas /> },
      { path: '/admin/promociones', element: <ListaPromociones /> },
      { path: '/admin/ordenes', element: <ListOrders /> },
      { path: '/admin/usuarios', element: <div>Gestión de usuarios</div> },

      { path: '/unauthorized', element: <Unauthorized /> },
      { path: '/user/login', element: <Login /> },
      { path: '/user/logout', element: <Logout /> },
      { path: '/user/create', element: <Signup /> },

      { path: '/producto', element: <ListaProductos /> },
      { path: '/producto/:id', element: <DetalleProductos /> },
      { path: '/resena', element: <ListaResenas /> },
      { path: '/resena/:id', element: <DetalleResenas /> },
      { path: '/promocion', element: <ListaPromociones /> },
      { path: '/promocion/:id', element: <DetallePromociones /> },
      { path: '/orden', element: <ListOrders /> },
      { path: '/orden/:id', element: <DetalleOrder /> }
    ]
  }
]);



createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={rutas} />
    </UserProvider>
  </StrictMode>
);