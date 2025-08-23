import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import esTranslations from './translations/es/global.json';
import enTranslations from './translations/en/global.json';
const PersistenciaSeleccionIdioma = localStorage.getItem('lang') || 'es'; // idioma persistido

// Importar archivos de traducción específicos
import categoryTranslations from './translations/categoryTranslations.json';
import productTranslations from './translations/productTranslations.json';
import estadosTranslations from './translations/estadosTranslations.json';
import promocionTranslations from './translations/promocionTranslations.json';
import estadoOrdenesTranslations from './translations/estadoOrdenesTranslations.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: {
          ...esTranslations,
          categories: categoryTranslations.categories,
          products: productTranslations.products,
          promotions: promocionTranslations.promotions,
          promotion_status: promocionTranslations.promotion_status,
          order_states: estadoOrdenesTranslations.order_states, // Usar archivo específico
          status_mappings: estadosTranslations.status_mappings?.es || {},
          status_translations: estadosTranslations.default_translations?.es || {},
        },
      },
      en: {
        translation: {
          ...enTranslations,
          categories: categoryTranslations.categories,
          products: productTranslations.products,
          promotions: promocionTranslations.promotions,
          promotion_status: promocionTranslations.promotion_status,
          order_states: estadoOrdenesTranslations.order_states, // Usar archivo específico
          status_mappings: estadosTranslations.status_mappings?.en || {},
          status_translations: estadosTranslations.default_translations?.en || {},
        },
      },
    },
    lng: PersistenciaSeleccionIdioma,       
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;