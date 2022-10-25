import { useRecoilState, useResetRecoilState } from "recoil";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import { formState } from "./state";
import { runModel, scenarios, tests } from "./models";

export default function RunScenarios() {
  const [form, setForm] = useRecoilState(formState);
  const resetForm = useResetRecoilState(formState);

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "screeningTest") {
      setForm((prevForm) => ({
        ...prevForm,
        screeningTestSensitivity: tests[value]?.sensitivity || "",
        screeningTestSpecificity: tests[value]?.specificity || "",
      }));
    }

    if (name === "triageTest") {
      setForm((prevForm) => ({
        ...prevForm,
        triageTestSensitivity: tests[value]?.sensitivity || "",
        triageTestSpecificity: tests[value]?.specificity || "",
      }));
    }

    if (name === "diagnosticTest") {
      setForm((prevForm) => ({
        ...prevForm,
        diagnosticTestSensitivity: tests[value]?.sensitivity || "",
        diagnosticTestSpecificity: tests[value]?.specificity || "",
      }));
    }

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    console.log(form);
    const results = runModel(form);
    console.log(results);
  }

  function handleReset(event) {
    event.preventDefault();
    window.scrollTo(0, 0);
    resetForm();
  }

  return (
    <div className="bg-light py-4">
      <Container>
        <Form onSubmit={handleSubmit} onReset={handleReset}>
          <Card className="mb-4">
            <Card.Header>
              <Card.Title>
                Run Scenario: <span className="text-primary">{scenarios.find((s) => s.value === form.scenario)?.label}</span>
              </Card.Title>
              <Card.Text className="small text-muted">Please choose a scenario to evaluate epidemiological outcomes for.</Card.Text>
            </Card.Header>
            <Card.Body className="pt-3 pb-2 py-lg-0">
              <Row>
                {scenarios.map((scenario) => (
                  <Col lg={4} key={scenario.value}>
                    <Form.Check key={scenario.value} className="p-0 shadow-sm">
                      <Form.Check.Input
                        type="radio"
                        name="scenario"
                        id={scenario.value}
                        value={scenario.value}
                        checked={form.scenario === scenario.value}
                        className="ms-1"
                        onChange={handleChange}
                        required
                      />
                      <Form.Check.Label
                        className={
                          [
                            "form-label d-block text-center mb-2 my-lg-3 p-3 cursor-pointer",
                            (form.scenario === scenario.value ? "bg-primary text-white" : "bg-light text-dark")
                          ].join(" ")
                        }
                        htmlFor={scenario.value}
                      >
                        {scenario.label}
                      </Form.Check.Label>
                    </Form.Check>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <Card.Title>Epidemiological Context</Card.Title>
              <Card.Text className="small text-muted">Best estimate of fixed epidemiological parameters for your setting</Card.Text>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush hover borderless">
                <ListGroup.Item>
                  <Form.Group as={Row} controlId="populationSize">
                    <Form.Label column sm={8}>
                      Target population size of screen-eligible women
                    </Form.Label>
                    <Col sm={4}>
                      <Form.Control
                        type="number"
                        placeholder="Enter value"
                        name="populationSize"
                        value={form.populationSize}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Form.Group>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Form.Group as={Row} controlId="hpvCancerPrevalence">
                    <Form.Label column sm={8}>
                      Prevalence of carcinogenic HPV infection
                    </Form.Label>
                    <Col sm={4}>
                      <Form.Control
                        type="number"
                        placeholder="Enter value"
                        name="hpvCancerPrevalence"
                        value={form.hpvCancerPrevalence}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Form.Group>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Form.Group as={Row} controlId="hpvPrevalence">
                    <Form.Label column sm={8}>
                      Prevalence of HPV16/18
                    </Form.Label>
                    <Col sm={4}>
                      <Form.Control type="number" placeholder="Enter value" name="hpvPrevalence" value={form.hpvPrevalence} onChange={handleChange} required />
                    </Col>
                  </Form.Group>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Form.Group as={Row} controlId="cinPrevalence">
                    <Form.Label column sm={8}>
                      Prevalence of CIN2 or worse
                    </Form.Label>
                    <Col sm={4}>
                      <Form.Control type="number" placeholder="Enter value" name="cinPrevalence" value={form.cinPrevalence} onChange={handleChange} required />
                    </Col>
                  </Form.Group>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <Card.Title>Participation in Health Services</Card.Title>
              <Card.Text className="text-muted small">Observed or targeted participation in cervical cancer screening program in your setting</Card.Text>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush hover borderless">
                <ListGroup.Item>
                  <Form.Group as={Row} controlId="screeningInterval">
                    <Form.Label column sm={8}>
                      Screening interval
                    </Form.Label>
                    <Col sm={4}>
                      <Form.Control
                        type="number"
                        placeholder="Enter value"
                        name="screeningInterval"
                        value={form.screeningInterval}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Form.Group>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Form.Group as={Row} controlId="percentScreened">
                    <Form.Label column sm={8}>
                      Percent screening coverage
                    </Form.Label>
                    <Col sm={4}>
                      <Form.Control
                        type="number"
                        placeholder="Enter value"
                        name="percentScreened"
                        value={form.percentScreened}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Form.Group>
                </ListGroup.Item>

                {["ScreenDiagnosticTestTreat", "ScreenTriageDiagnosticTestTreat"].includes(form.scenario) && (
                  <ListGroup.Item>
                    <Form.Group as={Row} controlId="percentTriaged">
                      <Form.Label column sm={8}>
                        {form.scenario === "ScreenDiagnosticTestTreat" && <>Percent of screen positives with diagnostic test</>}
                        {form.scenario === "ScreenTriageDiagnosticTestTreat" && <>Percent of screen positives with triage test</>}
                      </Form.Label>
                      <Col sm={4}>
                        <Form.Control
                          type="number"
                          placeholder="Enter value"
                          name="percentTriaged"
                          value={form.percentTriaged}
                          onChange={handleChange}
                          required
                        />
                      </Col>
                    </Form.Group>
                  </ListGroup.Item>
                )}

                {["ScreenTriageDiagnosticTestTreat"].includes(form.scenario) && (
                  <ListGroup.Item>
                    <Form.Group as={Row} controlId="percentDiagnosticTriaged">
                      <Form.Label column sm={8}>
                        Percent of triage test positives with diagnostic test
                      </Form.Label>
                      <Col sm={4}>
                        <Form.Control
                          type="number"
                          placeholder="Enter value"
                          name="percentDiagnosticTriaged"
                          value={form.percentDiagnosticTriaged}
                          onChange={handleChange}
                          required
                        />
                      </Col>
                    </Form.Group>
                  </ListGroup.Item>
                )}

                <ListGroup.Item>
                  <Form.Group as={Row} controlId="percentTreated">
                    <Form.Label column sm={8}>
                      {["ScreenDiagnosticTestTreat", "ScreenTriageDiagnosticTestTreat"].includes(form.scenario) && (
                        <>Percent of diagnostic test positives treated</>
                      )}
                      {["ScreenTreat"].includes(form.scenario) && <>Percent of screen test positives treated</>}
                    </Form.Label>
                    <Col sm={4}>
                      <Form.Control
                        type="number"
                        placeholder="Enter value"
                        name="percentTreated"
                        value={form.percentTreated}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Form.Group>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <Card.Title>Screening and Treatment Characteristics</Card.Title>
              <Card.Text className="small text-muted">
                Please select the screening, triage and diagnostic tests and treatment modality you will use and enter an estimate of their performance
                characteristics.
              </Card.Text>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush hover borderless">
                <ListGroup.Item>
                  <Form.Group as={Row} controlId="screeningTest">
                    <Form.Label column sm={8}>
                      Screening test chosen
                    </Form.Label>
                    <Col sm={4}>
                      <Form.Select name="screeningTest" value={form.screeningTest} onChange={handleChange} required>
                        <option value="" hidden>
                          No test chosen
                        </option>
                        <option value="pap">Pap</option>
                        <option value="ivaa">VIA</option>
                        <option value="hpv">HPV</option>
                        <option value="hpv16or18">HPV16/18</option>
                      </Form.Select>
                    </Col>
                  </Form.Group>
                </ListGroup.Item>

                <ListGroup.Item className="ps-4">
                  <Form.Group as={Row} controlId="screeningTestSensitivity">
                    <Form.Label column sm={8}>
                      Screening test sensitivity for CIN2/3
                    </Form.Label>
                    <Col sm={4}>
                      <Form.Control
                        type="number"
                        placeholder="Enter value"
                        name="screeningTestSensitivity"
                        value={form.screeningTestSensitivity}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Form.Group>
                </ListGroup.Item>

                <ListGroup.Item className="ps-4">
                  <Form.Group as={Row} controlId="screeningTestSpecificity">
                    <Form.Label column sm={8}>
                      Screening test specificity for CIN2/3
                    </Form.Label>
                    <Col sm={4}>
                      <Form.Control
                        type="number"
                        placeholder="Enter value"
                        name="screeningTestSpecificity"
                        value={form.screeningTestSpecificity}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Form.Group>
                </ListGroup.Item>

                {["ScreenDiagnosticTestTreat", "ScreenTriageDiagnosticTestTreat"].includes(form.scenario) && (
                  <>
                    <ListGroup.Item>
                      <Form.Group as={Row} controlId="triageTest">
                        <Form.Label column sm={8}>
                          Triage or diagnostic test chosen
                        </Form.Label>
                        <Col sm={4}>
                          <Form.Select name="triageTest" value={form.triageTest} onChange={handleChange} required>
                            <option value="" hidden>
                              No test chosen
                            </option>
                            <option value="pap">Pap</option>
                            <option value="ivaa">VIA</option>
                            <option value="hpv16or18">HPV16/18</option>
                            <option value="colposcopicImpression">Coloscopic impression</option>
                            <option value="colposcopyWithBiopsy">Colposcopy with biopsy</option>
                          </Form.Select>
                        </Col>
                      </Form.Group>
                    </ListGroup.Item>

                    <ListGroup.Item className="ps-4">
                      <Form.Group as={Row} controlId="triageTestSensitivity">
                        <Form.Label column sm={8}>
                          Triage or diagnostic test sensitivity for CIN2/3
                        </Form.Label>
                        <Col sm={4}>
                          <Form.Control
                            type="number"
                            placeholder="Enter value"
                            name="triageTestSensitivity"
                            value={form.triageTestSensitivity}
                            onChange={handleChange}
                            required
                          />
                        </Col>
                      </Form.Group>
                    </ListGroup.Item>

                    <ListGroup.Item className="ps-4">
                      <Form.Group as={Row} controlId="triageTestSpecificity">
                        <Form.Label column sm={8}>
                          Triage or diagnostic test specificity for CIN2/3
                        </Form.Label>
                        <Col sm={4}>
                          <Form.Control
                            type="number"
                            placeholder="Enter value"
                            name="triageTestSpecificity"
                            value={form.triageTestSpecificity}
                            onChange={handleChange}
                            required
                          />
                        </Col>
                      </Form.Group>
                    </ListGroup.Item>
                  </>
                )}

                {["ScreenTriageDiagnosticTestTreat"].includes(form.scenario) && (
                  <>
                    <ListGroup.Item>
                      <Form.Group as={Row} controlId="diagnosticTest">
                        <Form.Label column sm={8}>
                          Diagnostic test chosen
                        </Form.Label>
                        <Col sm={4}>
                          <Form.Select name="diagnosticTest" value={form.diagnosticTest} onChange={handleChange} required>
                            <option value="" hidden>
                              No test chosen
                            </option>
                            <option value="colposcopicImpression">Coloscopic impression</option>
                            <option value="colposcopyOrBiopsy">Colposcopy with biopsy</option>
                          </Form.Select>
                        </Col>
                      </Form.Group>
                    </ListGroup.Item>

                    <ListGroup.Item className="ps-4">
                      <Form.Group as={Row} controlId="diagnosticTestSensitivity">
                        <Form.Label column sm={8}>
                          Diagnostic test sensitivity for CIN2/3
                        </Form.Label>
                        <Col sm={4}>
                          <Form.Control
                            type="number"
                            placeholder="Enter value"
                            name="diagnosticTestSensitivity"
                            value={form.diagnosticTestSensitivity}
                            onChange={handleChange}
                            required
                          />
                        </Col>
                      </Form.Group>
                    </ListGroup.Item>

                    <ListGroup.Item className="ps-4">
                      <Form.Group as={Row} controlId="diagnosticTestSpecificity">
                        <Form.Label column sm={8}>
                          Diagnostic test specificity for CIN2/3
                        </Form.Label>
                        <Col sm={4}>
                          <Form.Control
                            type="number"
                            placeholder="Enter value"
                            name="diagnosticTestSpecificity"
                            value={form.diagnosticTestSpecificity}
                            onChange={handleChange}
                            required
                          />
                        </Col>
                      </Form.Group>
                    </ListGroup.Item>
                  </>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
          <Form.Group className="mb-4 text-center">
            <Button type="submit" className="me-1 shadow" variant="primary">
              Submit
            </Button>
            <Button type="reset" className="shadow" variant="danger">
              Reset
            </Button>
          </Form.Group>
        </Form>
      </Container>
    </div>
  );
}
