import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import esTranslations from './translations/es/global.json';
import enTranslations from './translations/en/global.json';
const savedLanguage = localStorage.getItem('lang') || 'es'; //  idioma persistido
i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: esTranslations,
      },
      en: {
        translation: enTranslations,
      },
    },
    lng: savedLanguage,       
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;