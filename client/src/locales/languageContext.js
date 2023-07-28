// LanguageContext.js
import React, { createContext, useContext, useState } from "react";

// Create a new context for the language
const LanguageContext = createContext();

// Create a custom hook to use the LanguageContext
export function useLanguage() {
  return useContext(LanguageContext);
}

// Create a LanguageProvider component to wrap the entire application with the context
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en"); // Default language is "en" (English)

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
