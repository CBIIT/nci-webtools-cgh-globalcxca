import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";
import { ReactComponent as ScreeningImage } from "./images/CCP_transparent.svg";

export default function Home() {
  return (
    <>
      <Container>
        <Row>
          <Col md={6}>
            <div className="d-flex h-100 align-items-center">
              <div className="mb-4">
                <h1 className="text-light display-4 mb-3 d-none d-md-block">
                  Welcome
                </h1>
                <hr className="border-white" />
                <p className="lead text-light">
                  Explore epidemiological outcomes for target populations with
                  our screening impact assessment tool.
                </p>
                <Link
                  className="btn btn-lg btn-outline-light text-decoration-none"
                  to="/run-scenario"
                >
                  Run Scenario
                </Link>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <ScreeningImage className="d-none d-md-block my-0 w-80" />
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
              <p>
                Vestibulum nec facilisis ex. Fusce semper, nisl ut vulputate
                aliquet, felis arcu viverra dolor, vel efficitur erat purus id
                diam. Vestibulum libero nisi, ultrices ut lacus eu, blandit
                venenatis ex. Fusce posuere libero dignissim orci lobortis, quis
                malesuada erat iaculis. Sed euismod ultricies nulla id porta.
                Cras rhoncus massa eget libero lacinia commodo. Aenean
                vestibulum mi id neque viverra condimentum. Aenean venenatis nec
                ligula a pulvinar. Sed eget vestibulum augue. Aliquam a mauris
                sit amet enim imperdiet imperdiet a non nulla. Pellentesque et
                gravida dolor. Nulla rhoncus viverra mattis.
              </p>
              <p>
                Mauris sed diam consectetur, suscipit turpis ac, lacinia tortor.
                Suspendisse mollis vel neque sit amet sodales. Curabitur magna
                ligula, iaculis ac sagittis at, tincidunt imperdiet augue.
                Vivamus ut diam nunc. Vestibulum et nisi a felis tempor rutrum
                quis ut dui. Duis finibus non mi in ullamcorper. Ut vulputate
                enim ut enim sollicitudin, sed pharetra ex rutrum. In dapibus
                condimentum dolor bibendum interdum. Integer nibh mauris,
                dapibus sit amet tincidunt sed, semper at diam. Mauris ornare
                erat magna, non hendrerit erat pellentesque vitae.
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}
