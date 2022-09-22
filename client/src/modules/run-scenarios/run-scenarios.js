import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

export default function RunScenarios() {
  return (
    <div className="bg-light py-5">
      <Container>
        <Row>
          <Col>
            <h1 className="h3 mb-3">Select a model</h1>
          </Col>
        </Row>

        <Row className="align-items-scretch mb-4">
          <Col>
            <Card className="border-0 shadow h-100 hover-select">
              <Card.Body className="centered">
                <Card.Title className="text-muted text-center">Screen, Diagnostic Test & Treat</Card.Title>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="border-0 shadow h-100 hover-select">
              <Card.Body className="centered">
                <Card.Title className="text-muted text-center">Screen, Treat</Card.Title>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="border-0 shadow h-100 hover-select">
              <Card.Body className="centered">
                <Card.Title className="text-muted text-center">Screen, Triage, Diagnostic Test & Treat</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="align-items-scretch mb-4">
          <Col>
            <Card className="mb-4 shadow h-100">
              <Card.Header>
                <Card.Title className="mb-0">Epidemiological Context</Card.Title>
              </Card.Header>
              <Card.Body>
                <Card.Text className="fw-semibold text-muted">Best estimate of fixed epidemiological parameters for your setting</Card.Text>
                <Form.Group className="mb-3">
                  <Form.Label>Target population size of screen-eligible women</Form.Label>
                  <Form.Control type="number" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Prevalence of carcinogenic HPV infection </Form.Label>
                  <Form.Control type="number" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Prevalence of HPV16/18</Form.Label>
                  <Form.Control type="number" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Prevalence of CIN2 or worse</Form.Label>
                  <Form.Control type="number" />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className="mb-4 shadow h-100">
              <Card.Header>
                <Card.Title className="mb-0">Participation in Health Services</Card.Title>
              </Card.Header>
              <Card.Body>
                <Card.Text className="fw-semibold text-muted">
                  Observed or targeted participation in cervical cancer screening program in your setting
                </Card.Text>
                <Form.Group className="mb-3">
                  <Form.Label>Screening interval</Form.Label>
                  <Form.Control type="number" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Percent screening coverage</Form.Label>
                  <Form.Control type="number" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Percent of screen positives with triage test</Form.Label>
                  <Form.Control type="number" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Percent of triage test positives with diagnostic test</Form.Label>
                  <Form.Control type="number" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Percent of diagnostic test positives treated</Form.Label>
                  <Form.Control type="number" />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="mb-4 shadow">
              <Card.Header>
                <Card.Title className="mb-0">Screening and Treatment Characteristics</Card.Title>
              </Card.Header>
              <Card.Body>
                <Card.Text className="fw-semibold text-muted">
                  Please select the screening, triage and diagnostic tests and treatment modality you will use and enter an estimate of their performance
                  characteristics.
                </Card.Text>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Screening test chosen</Form.Label>
                      <Form.Select />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Screening test sensitivity for CIN2/3</Form.Label>
                      <Form.Control type="number" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Screening test specificity for CIN2/3</Form.Label>
                      <Form.Control type="number" />
                    </Form.Group>
                  </Col>

                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Triage or diagnostic test chosen</Form.Label>
                      <Form.Select />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Triage test sensitivity for CIN2/3</Form.Label>
                      <Form.Control type="number" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Triage test specificity for CIN2/3</Form.Label>
                      <Form.Control type="number" />
                    </Form.Group>
                  </Col>

                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Diagnostic test chosen</Form.Label>
                      <Form.Select />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Diagnostic test sensitivity for CIN2/3</Form.Label>
                      <Form.Control type="number" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Diagnostic test specificity for CIN2/3</Form.Label>
                      <Form.Control type="number" />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </Container>
    </div>
  );
}
