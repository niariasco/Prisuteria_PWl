import { useEffect, useState } from 'react';
import ProductoService from '../../services/ProductoService';
import { ListaCartasProductos } from './ListaCartasProductos';
import CategoriaService from '../../services/CategoriaService';
import EtiquetasService from '../../services/EtiquetasService';
import { useTranslation } from 'react-i18next';

export function ListaProductos() {
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  const [etiquetas, setEtiquetas] = useState([]);
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState('');

  const [filtroPor, setFiltroPor] = useState('categoria'); // 'categoria' o 'etiqueta'

  // Cargar categorías al inicio
  useEffect(() => {
    CategoriaService.getAllCategorias()
      .then((res) => setCategorias(res.data))
      .catch((err) => console.error("Error cargando categorías", err));
  }, []);

  // Cargar etiquetas al inicio
  useEffect(() => {
    EtiquetasService.getAllEtiquetas()
      .then((res) => setEtiquetas(res.data))
      .catch((err) => console.error("Error cargando etiquetas", err));
  }, []);

  // Cargar productos según filtros
  useEffect(() => {
    const fetchProductos = async () => {
      setLoaded(false);
      try {
        let response;

        if (filtroPor === 'categoria' && categoriaSeleccionada) {
          response = await ProductoService.getCategoria(categoriaSeleccionada);
        } else if (filtroPor === 'etiqueta' && etiquetaSeleccionada.length > 0) {
        // Filtrar por múltiples etiquetas
          response = await ProductoService.productosXEtiqueta(etiquetaSeleccionada);
        } else {
          response = await ProductoService.getAllActivo();
        }

        setData(Array.isArray(response) ? response : []);
        setError('');
        setLoaded(true);
      } catch (err) {
        setError(err.message || 'Error cargando productos');
        setData([]);
        setLoaded(true);
      }
    };

    fetchProductos();
  }, [filtroPor, categoriaSeleccionada, etiquetaSeleccionada]);
loaded;
//  if (!loaded) return <p>{t('Cargando')}...</p>;
  if (error) return <p>{t('Error')}: {error}</p>;

  return (
    <>
      {/* Radio buttons para seleccionar filtro */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="radio"
            value="categoria"
            checked={filtroPor === 'categoria'}
            onChange={() => setFiltroPor('categoria')}
          />
          {t('FiltrarC')}
        </label>
        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            value="etiqueta"
            checked={filtroPor === 'etiqueta'}
            onChange={() => setFiltroPor('etiqueta')}
          />
          {t('FiltrarE')}
        </label>
      </div>

      {/* Combo de categorías */}
      {filtroPor === 'categoria' && (
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
      )}

{/* Combo de etiquetas */}
{filtroPor === 'etiqueta' && (
  <div style={{ marginBottom: "1rem" }}>
    <label htmlFor="etiquetas">{t('FiltrarE')} </label>
    <select
      id="etiquetas"
      value={etiquetaSeleccionada}
      onChange={(e) => setEtiquetaSeleccionada(e.target.value)}
    >
      <option value="">{t('Todas')}</option>
      {etiquetas.map((tag) => (
        <option key={tag.etiquetaId} value={tag.etiquetaId}>
          {tag.nombrEtiquetas}
        </option>
      ))}
    </select>
  </div>
)}


      {/* Mostrar productos */}
      <ListaCartasProductos data={data} isShopping={true} />
    </>
  );
}
