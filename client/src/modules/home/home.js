import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";
import { ReactComponent as ScreeningImage } from "./images/CCP_transparent.svg";

import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <Container>
        <Row>
          <Col md={9}>
            <div className="d-flex h-100 align-items-center">
              <div className="my-2">
                <h1 className="text-light d-none d-md-block">
                  {t("general.welcome")}! <br />({t("general.ccpLongDes")})
                </h1>
                <hr className="border-white" />
                <p className="lead text-light">{t("home.introdution")}</p>
                <Link
                  className="btn btn-lg btn-outline-light text-decoration-none"
                  to="/run-scenario"
                >
                  {t("runScenario.title")}
                </Link>
              </div>
            </div>
          </Col>
          <Col md={3}>
            {/* Wrap the SVG with the container */}
            <div className="svg-center-container">
              <div className="svg-container">
                <ScreeningImage className="d-none d-md-block my-0 w-80" />
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <div className="bg-light py-3">
        <Container>
          <Row>
            <Col md={{ span: 12 }}>
              <h2 className="display-6 mb-2 text-primary text-center">
                {t("home.whatIsCC3S")}
              </h2>
              <p>{t("home.whatIsCC3SDes")}</p>
              <h3 className="mb-1 text-primary h5">
                {t("home.beforeYouStartTitle")}
              </h3>
              <Row className="py-2">
                <Col md={1}>
                  <img
                    src="../assets/images/insight.png"
                    alt=""
                    width="60"
                    height="60"
                  />
                </Col>
                <Col md={11}>
                  <b>{t("home.insight")}.</b> {t("home.insightDes")}
                </Col>
              </Row>
              <Row className="py-2">
                <Col md={1}>
                  <img
                    src="../assets/images/judgementFree.png"
                    alt=""
                    width="60"
                    height="60"
                  />
                </Col>
                <Col md={11}>
                  <b>{t("home.judgmentFree")}.</b> {t("home.jusdgementFreeDes")}
                </Col>
              </Row>
              <Row className="py-2">
                <Col md={1}>
                  <img
                    src="../assets/images/engage.png"
                    alt=""
                    width="60"
                    height="60"
                  />
                </Col>
                <Col md={11}>
                  <b>{t("home.engage")}.</b> {t("home.engageDes")}
                </Col>
              </Row>
              <div className="py-2">
                {t("home.desLink0")}
                <Link to="/about" className="text-primary">
                  {" "}
                  <b>{t("navbar.about")}</b>
                </Link>{" "}
                {t("home.desLink1")}
                <br />
                {t("home.des0")}{" "}
                <Link to="/run-scenario" className="text-primary">
                  {" "}
                  <b>{t("navbar.runScenario")}</b>
                </Link>{" "}
                {t("home.des0Continued")} <br />
                {t("home.des1")}
                <a
                  href="mailto:NCIGlobalCxCaWebAdmin@mail.nih.gov"
                  className="fw-bold text-primary"
                >
                  {t("general.contactus")}{" "}
                </a>
                {t("home.des1Continued")}
              </div>
              <div>
                <b>
                  {t("home.emphasize")}
                  <a
                    href="mailto:NCIGlobalCxCaWebAdmin@mail.nih.gov"
                    className="fw-bold text-primary"
                  >
                    {" "}
                    <b>{t("general.contactus")}</b>{" "}
                  </a>
                  {t("home.withQuestions")}
                </b>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}
