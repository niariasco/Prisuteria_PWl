import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
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
import { Auth } from "./components/User/Auth";
import { ListaProductos } from "./components/Productos/ListaProductos";
import { DetalleProductos } from "./components/Productos/DetalleProductos";
/*import { ListMovies } from "./components/Movie/ListMovies";*/
const rutas = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <Home /> },
      { path: '*', element: <PageNotFound /> },

      // Rutas protegidas (puedes agregar otras aquí si es necesario)
      {
        path: '/',
        element: <Auth requiredRoles={['Administrador']} />,
        children: [
          // Aquí puedes agregar rutas protegidas en el futuro
        ]
      },

      // Rutas de usuario
      { path: '/unauthorized', element: <Unauthorized /> },
      { path: '/user/login', element: <Login /> },
      { path: '/user/logout', element: <Logout /> },
      { path: '/user/create', element: <Signup /> },

      // Rutas de productos
      { path: '/productos', element: <ListaProductos /> },
      { path: '/producto/:id', element: <DetalleProductos /> },
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