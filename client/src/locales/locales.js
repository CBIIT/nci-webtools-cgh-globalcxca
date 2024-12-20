import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

//import locale file
import enLocale from "./en/en.json";
import esLocale from "./es/es.json";

// Initialize i18next
i18next
  .use(initReactI18next) // Initialize i18next with react-i18next
  .use(LanguageDetector)
  .init({
    lng: "en", // Set the default language
    fallbackLng: "en", // Fallback language if translation is not available
    debug: false, // Enable debug mode for development

    // Add your translation resources
    resources: {
      en: {
        translation: enLocale, // English locale file
      },
      // Add other language translations here if needed
      es: {
        translation: esLocale, // English locale file
      },
    },

    // Common configuration options
    interpolation: {
      escapeValue: false, // By default, react-i18next escapes special characters
    },
  });

export default i18next;
