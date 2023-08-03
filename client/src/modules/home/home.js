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
          <Col md={6}>
            <div className="d-flex h-100 align-items-center">
              <div className="mb-4">
                <h1 className="text-light display-4 mb-3 d-none d-md-block">
                  {t("welcome")}
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
          <Col md={6}>
            {/* Wrap the SVG with the container */}
            <div className="svg-center-container">
              <div className="svg-container">
                <ScreeningImage className="d-none d-md-block my-0 w-80" />
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <div className="bg-light py-4">
        <Container>
          <Row>
            <Col md={{ offset: 2, span: 8 }}>
              <h2 className="display-6 mb-3 text-primary text-center">
                What is GlobalCxCa?
              </h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                sodales odio ac neque gravida mattis. Nulla facilisi. Proin
                velit purus, lacinia eu lacinia a, ultricies vitae urna. Quisque
                congue semper libero, ac blandit ipsum iaculis vitae.
                Suspendisse potenti. Orci varius natoque penatibus et magnis dis
                parturient montes, nascetur ridiculus mus. Proin ac semper
                massa, a bibendum magna. Vestibulum dictum orci mauris, at
                rhoncus nisi vehicula at. Orci varius natoque penatibus et
                magnis dis parturient montes, nascetur ridiculus mus. Cras sem
                nisl, egestas at sagittis eu, imperdiet vel magna.
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}
