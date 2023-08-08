import React from "react";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="flex-grow-0">
      <div className="bg-primary-dark text-light py-4">
        <div className="container">
          <div className="mb-4">
            <a
              href="https://www.cancer.gov/about-nci/organization/cgh"
              target="_blank"
              className="text-light h4 mb-1"
            >
              {t("footer.centerForGlabalHealth")}
            </a>
            <div className="h6">
              {t("footer.atThe")}{" "}
              <a
                className="text-light"
                target="_blank"
                href="https://www.cancer.gov/"
              >
                {t("footer.atTheNationalCancerInstitute")}
              </a>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="h5 mb-1 font-weight-light">
                {t("footer.contactInformation")}
              </div>
              <ul className="list-unstyled mb-0">
                <li>
                  <a
                    className="text-light"
                    target="_blank"
                    href="mailto:NCIGlobalCxCaWebAdmin@mail.nih.gov"
                  >
                    {t("footer.contactUs")}
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="h5 mb-1 font-weight-light">
                {t("footer.policies")}
              </div>
              <ul className="list-unstyled mb-0">
                <li>
                  <a
                    className="text-light"
                    target="_blank"
                    href="https://www.cancer.gov/policies/accessibility"
                  >
                    {t("footer.accessibility")}
                  </a>
                </li>
                <li>
                  <a
                    className="text-light"
                    target="_blank"
                    href="https://www.cancer.gov/policies/disclaimer"
                  >
                    {t("footer.disclaimer")}
                  </a>
                </li>
                <li>
                  <a
                    className="text-light"
                    target="_blank"
                    href="https://www.cancer.gov/policies/foia"
                  >
                    {t("footer.FOIA")}
                  </a>
                </li>
                <li>
                  <a
                    className="text-light"
                    target="_blank"
                    href="https://www.hhs.gov/vulnerability-disclosure-policy/index.html"
                  >
                    {t("footer.HHSVulnerabilityDisclosure")}
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="h5 mb-1 font-weight-light">
                {t("footer.moreInformation")}
              </div>
              <ul className="list-unstyled mb-0">
                <li>
                  <a
                    className="text-light"
                    target="_blank"
                    href="http://www.hhs.gov/"
                  >
                    {t("footer.usDepartmentOfHealthAndHumanServices")}
                  </a>
                </li>
                <li>
                  <a
                    className="text-light"
                    target="_blank"
                    href="http://www.nih.gov/"
                  >
                    {t("footer.nationalInstitutesOfHealth")}
                  </a>
                </li>
                <li>
                  <a
                    className="text-light"
                    target="_blank"
                    href="https://www.cancer.gov/"
                  >
                    {t("footer.nationalCancerInstitude")}
                  </a>
                </li>
                <li>
                  <a
                    className="text-light"
                    target="_blank"
                    href="http://usa.gov/"
                  >
                    {t("footer.usaGov")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-center">{t("footer.nihSlogan")}</div>
      </div>
    </footer>
  );
}

export default Footer;
