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
              <div className="mb-4">
                <h1 className="text-light d-none d-md-block">
                  {t("general.welcome")}
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
              <h5 className="mb-1 text-primary">
                {t("home.beforeYouStartTitle")}
              </h5>
              <p>
                <b>{t("home.insight")}.</b> {t("home.insightDes")}
              </p>
              <p>
                <b>{t("home.judgmentFree")}.</b> {t("home.jusdgementFreeDes")}
              </p>
              <p>
                <b>{t("home.engage")}.</b> {t("home.engageDes")}
              </p>
              <p>
                {t("home.des0")}{" "}
                <Link to="/run-scenario">
                  {" "}
                  <b>{t("navbar.runScenario")}</b>
                </Link>{" "}
                {t("home.des0Continued")} <br></br>
                {t("home.des1")}{" "}
                <Link to={`mailto:NCIGlobalCxCaWebAdmin@mail.nih.gov`}>
                  <b>{t("general.contactUs")}</b>
                </Link>{" "}
                {t("home.des1Continued")}
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}
