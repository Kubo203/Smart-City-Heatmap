import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import english from "@/language/translations/en";
import slovak from "@/language/translations/sk";

// Import translations from separate files
const resources = {
  en: english,
  sk: slovak
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "sk", // default language
    fallbackLng: "en", // fallback language if translation is missing
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
