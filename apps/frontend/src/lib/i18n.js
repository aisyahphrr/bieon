import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationID from '../locales/id.json';
import translationEN from '../locales/en.json';

i18n
  .use(LanguageDetector) // Deteksi bahasa otomatis
  .use(initReactI18next)
  .init({
    resources: {
      id: { translation: translationID },
      en: { translation: translationEN }
    },
    fallbackLng: 'id',
    detection: {
      // Prioritas deteksi: localStorage -> cookie -> htmlTag -> path -> dsb
      order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
      // Key yang digunakan untuk menyimpan di localStorage
      lookupLocalStorage: 'bieon_language',
      // Cache hasil deteksi kembali ke localStorage
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
