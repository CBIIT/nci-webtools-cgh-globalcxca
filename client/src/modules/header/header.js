import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Header() {
  const { t } = useTranslation();

  return (
    <header>
      <div className="container mt-md-2 mb-2 d-flex align-items-center justify-content-between">
        <a
          className="d-inline-block"
          href="https://www.cancer.gov/about-nci/organization/cgh"
          target="_blank"
        >
          <img
            src={`${process.env.PUBLIC_URL}/assets/images/nci-cgh-logo.svg`}
            height="55"
            alt="National Cancer Institute Logo"
            className="mw-100"
          />
        </a>
        <div className="col-auto d-flex align-items-center">
          <div id="navbarSearch">{/* Your NavbarSearch component here */}</div>
          <div id="languageSelectContainer" className="p-3"></div>
        </div>
      </div>

      <div className="bg-primary text-white py-1 d-none d-lg-block">
        <div className="container">
          <h1 className="h6 fw-semibold">{t("header.title")}</h1>
        </div>
      </div>
    </header>
  );
}

export default Header;
