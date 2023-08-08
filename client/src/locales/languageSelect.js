// LanguageSelect.js
import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSelect = () => {
  const { i18n } = useTranslation();

  // Function to handle language change
  const handleLanguageChange = (newLanguage) => {
    i18n.changeLanguage(newLanguage);
  };
  const selectStyle = {
    height: "40px", // Adjust the height value as needed
  };

  return (
    <div className="d-flex align-items-center justify-content-end">
      <i className="bi bi-translate me-1 text-primary"></i>
      <div className="col-auto">
        {/* Add id attribute to the select element */}
        <select
          className="form-select form-select-sm"
          data-i18n="[html]header.languageSelect"
          id="languageSelect"
          // Handle language change when the dropdown value changes
          onChange={(e) => handleLanguageChange(e.target.value)}
          value={i18n.language} // Set the value to the current language
          style={selectStyle} // Apply the style object
        >
          <option value="en" data-i18n="header.english">
            English
          </option>
          <option value="es" data-i18n="header.spanish">
            Español
          </option>
        </select>
      </div>
    </div>
  );
};

export default LanguageSelect;
