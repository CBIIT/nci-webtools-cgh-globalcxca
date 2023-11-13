import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Header() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="bg-primary-dark text-white py-1 d-none d-lg-block">
        <div className="container">
          <h1 className="h6 fw-semibold">{t("header.title")}</h1>
        </div>
      </div>
    </div>
  );
}

export default Header;
