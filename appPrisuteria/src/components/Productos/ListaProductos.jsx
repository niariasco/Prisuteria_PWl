import { useEffect, useState } from 'react';
import ProductoService from '../../services/ProductoService';
import { ListaCartasProductos } from './ListaCartasProductos';
import CategoriaService from '../../services/CategoriaService';
import { useTranslation } from 'react-i18next';
import EtiquetasService from '../../services/EtiquetasService';

export function ListaProductos() {
  const [data, setData] = useState(null);
  //const [error, setError] = useState('');
  //const [loaded, setLoaded] = useState(false);
  const { t } = useTranslation();

  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [etiquetas, setEtiquetas] = useState([]);
  const [etiquetasSeleccionada, setEtiquetasSeleccionada] = useState('');

  useEffect(() => {
    // Cargar todas las categorías
    CategoriaService.getAllCategorias()
      .then((response) => {
        setCategorias(response.data);
      })
      .catch((err) => {
        console.error("Error cargando categorías", err);
      });
  }, []);

  
  useEffect(() => {
    // Cargar todas las categorías
    EtiquetasService.getAllEtiquetas()
      .then((response) => {
        setEtiquetas(response.data);
      })
      .catch((err) => {
        console.error("Error cargando categorías", err);
      });
  }, []);

  useEffect(() => {
    // Si no hay categoría seleccionada => mostrar todos los productos
    const fetchProductos = async () => {
    //  try {
        let response;
        if (categoriaSeleccionada ) {
          response = await ProductoService.getCategoria(categoriaSeleccionada);
           // response = await ProductoService.productosXEtiqueta(etiquetasSeleccionada);
        } else {
          response = await ProductoService.getAllActivo();
        }
        setData(Array.isArray(response) ? response : []);
       // setError('');
       // setLoaded(true);
     // } //catch (err) {
       // setError(err);
      //  setLoaded(false);
      }
//    };
    fetchProductos();
  }, [categoriaSeleccionada]);

//  if (!loaded) return <p>Cargando..</p>;
  
  //if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="categoria">{t('FiltrarC')} </label>
        <select
          id="categoria"
          value={categoriaSeleccionada}
          onChange={(e) => setCategoriaSeleccionada(e.target.value)}
        >
          <option value="">{t('Todas')}</option>
          {categorias.map((cat) => (
            <option key={cat.categoriaId} value={cat.categoriaId}>
              {cat.nombreSCategoria}
            </option>
          ))}
        </select>
      </div>

            <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="tag">{t('FiltrarE')} </label>
        <select
          id="categoria"
          value={etiquetasSeleccionada}
          onChange={(e) => setEtiquetasSeleccionada(e.target.value)}
        >
          <option value="">{t('Todas')}</option>
          {etiquetas.map((tag) => (
            <option key={tag.etiquetaId} value={tag.etiquetaId}>
              {tag.nombrEtiquetas}
            </option>
          ))}
        </select>
      </div>

      {data && <ListaCartasProductos data={data} isShopping={true} />}
    </>
  );
}
