import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Cambiar la ruta para coincidir con tu estructura
import esTranslations from './translations/es/global.json';
import enTranslations from './translations/en/global.json';

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
    lng: 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;