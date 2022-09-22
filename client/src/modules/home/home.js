import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ReactComponent as ScreeningImage } from "./images/screening.svg";
import Button from "react-bootstrap/Button";
// import ScreeningImage from "./images/screening.svg"

export default function Home() {
  return (
    <>
      <div >
        <Container>
          <Row>
            <Col md={6}>
              <div className="d-flex h-100 align-items-center">
                <div>
                  <h1 className="font-title text-light mb-3">Welcome</h1>
                  <hr className="border-white" />
                  <p className="lead text-light">
                    Explore outcomes for target populations with our screening impact assessment tool
                  </p>
                  <Button size="lg" variant="outline-light">
                    Get Started
                  </Button>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <ScreeningImage className="my-5 w-100" />
            </Col>
          </Row>
        </Container>
      </div>

    </>
  );
}
