import { useEffect, useState } from 'react';
import ProductoService from '../../services/ProductoService';
import { ListaCartasProductos } from './ListaCartasProductos';
import CategoriaService from '../../services/CategoriaService';
import { SelectCategoria } from './Forms/SelectCategoria';

export function ListaProductos() {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  // Cargar categorías al inicio
  useEffect(() => {
    CategoriaService.getAllCategorias()
      .then((res) => setCategorias(res.data))
      .catch((err) => console.error('Error cargando categorías', err));
  }, []);

  // Cargar productos al inicio y al cambiar la categoría
useEffect(() => {
  const fetchProductos = async () => {
    try {
      let response;
      if (categoriaSeleccionada) {
        response = await ProductoService.getCategoria(categoriaSeleccionada);
      } else {
        response = await ProductoService.getAllProductos();
      }
setData(Array.isArray(response) ? response : []);
      setError('');
      setLoaded(true);
    } catch (err) {
      setError(err);
      setLoaded(false);
    }
  };
  fetchProductos();
}, [categoriaSeleccionada]);

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      {/* Dropdown de categorías */}
      <SelectCategoria
        field={{
          value: categoriaSeleccionada,
          onChange: (e) => setCategoriaSeleccionada(e.target.value),
        }}
        data={categorias}
      />
      

      {/* Lista de productos */}
      <ListaCartasProductos data={data} isShopping={true} />
    </>
  );
}

