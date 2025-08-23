import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import esTranslations from './translations/es/global.json';
import enTranslations from './translations/en/global.json';
const PersistenciaSeleccionIdioma = localStorage.getItem('lang') || 'es';

// Importar archivos de traducción específicos
import categoryTranslations from './translations/categoryTranslations.json';
import productTranslations from './translations/productTranslations.json';
import estadosTranslations from './translations/estadosTranslations.json';
import promocionTranslations from './translations/promocionTranslations.json';
import estadoOrdenesTranslations from './translations/estadoOrdenesTranslations.json';

// Procesar las traducciones para que sean simples strings
const processCategoryTranslations = (categories, lang) => {
  const processed = {};
  Object.keys(categories).forEach(key => {
    if (categories[key] && typeof categories[key] === 'object' && categories[key][lang]) {
      processed[key] = categories[key][lang];
    } else {
      processed[key] = key; // Fallback al key original
    }
  });
  return processed;
};

const processProductTranslations = (products, lang) => {
  const processed = {};
  Object.keys(products).forEach(key => {
    if (products[key] && typeof products[key] === 'object' && products[key][lang]) {
      processed[key] = products[key][lang];
    } else {
      processed[key] = key; // Fallback al key original
    }
  });
  return processed;
};

const processPromotionTranslations = (promotions, lang) => {
  const processed = {};
  Object.keys(promotions).forEach(key => {
    if (promotions[key] && typeof promotions[key] === 'object' && promotions[key][lang]) {
      processed[key] = promotions[key][lang];
    } else {
      processed[key] = key; // Fallback al key original
    }
  });
  return processed;
};

const processPromotionStatusTranslations = (promotionStatus, lang) => {
  const processed = {};
  Object.keys(promotionStatus).forEach(key => {
    if (promotionStatus[key] && typeof promotionStatus[key] === 'object' && promotionStatus[key][lang]) {
      processed[key] = promotionStatus[key][lang];
    } else {
      processed[key] = key; // Fallback al key original
    }
  });
  return processed;
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: {
          ...esTranslations,
          // Procesar categorías para español
          categories: processCategoryTranslations(categoryTranslations.categories, 'es'),
          // Procesar productos para español  
          products: processProductTranslations(productTranslations.products, 'es'),
          // Procesar promociones para español
          promotions: processPromotionTranslations(promocionTranslations.promotions, 'es'),
          // Procesar estados de promociones para español
          promotion_status: processPromotionStatusTranslations(promocionTranslations.promotion_status, 'es'),
          order_states: estadoOrdenesTranslations.order_states,
          status_mappings: estadosTranslations.status_mappings?.es || {},
          status_translations: estadosTranslations.default_translations?.es || {},
        },
      },
      en: {
        translation: {
          ...enTranslations,
          // Procesar categorías para inglés
          categories: processCategoryTranslations(categoryTranslations.categories, 'en'),
          // Procesar productos para inglés
          products: processProductTranslations(productTranslations.products, 'en'),
          // Procesar promociones para inglés
          promotions: processPromotionTranslations(promocionTranslations.promotions, 'en'),
          // Procesar estados de promociones para inglés
          promotion_status: processPromotionStatusTranslations(promocionTranslations.promotion_status, 'en'),
          order_states: estadoOrdenesTranslations.order_states,
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