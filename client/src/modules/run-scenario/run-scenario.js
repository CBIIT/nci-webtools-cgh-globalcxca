import { useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mapValues from "lodash/mapValues";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import {
  defaultFormState,
  formState,
  paramsState,
  resultsState,
} from "./state";
import {
  runModel,
  scenarios,
  tests,
  screeningTests,
  triageTests,
  diagnosticTests,
  calculateValues,
} from "../../services/models";
import { asNumber } from "../../services/formatters";
import ScenarioResults from "./scenario-results";

// NOTE: Do not conditionally render elements, as this will break after google translates the page.

export default function RunScenarios() {
  const [form, setForm] = useRecoilState(formState);
  const resetForm = useResetRecoilState(formState);
  const setParams = useSetRecoilState(paramsState);
  const setResults = useSetRecoilState(resultsState);
  const navigate = useNavigate();

  console.log("scenarios", scenarios);
  function handleChange(event) {
    let { name, value } = event.target;
    console.log("event.target ", event.target);

    if (name === "scenario") {
      setForm({
        ...defaultFormState,
        scenario: value,
      });
      return;
    }

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

    //setTimeout(() => handleSubmit(), 100);
  }
  const results = runModel(form);
  const params = mapValues(form, asNumber);
  setParams(params);
  setResults(results);

  function handleSubmit(event) {
    event?.preventDefault();
    const params = mapValues(form, asNumber);
    const results = runModel(params);
    setParams(params);
    setResults(results);
    // window.scrollTo(0, 0);
    // navigate("results");
  }

  function handleReset(event) {
    event.preventDefault();
    window.scrollTo(0, 0);
    resetForm();
  }

  return (
    <div className="bg-light py-4">
      <Container>
        <Row>
          <Col md={4} style={{ overflow: "auto", maxHeight: "100vh" }}>
            <Form onReset={handleReset}>
              <div className="small text-end text-muted mb-2">
                All fields are required
              </div>

              <Card className="mb-4">
                <Card.Header>
                  <Card.Title>Epidemiological Context</Card.Title>
                  <Card.Text className="small text-muted">
                    Please enter the best estimate of fixed epidemiological
                    parameters for your setting
                  </Card.Text>
                </Card.Header>
                <Card.Body className="p-0">
                  <ListGroup variant="flush hover borderless">
                    <ListGroup.Item>
                      <Form.Group as={Row} controlId="populationSize">
                        <Form.Label column sm={12}>
                          <span>
                            Number of people in target population for cervical
                            screening
                          </span>
                          <OverlayTrigger
                            overlay={
                              <Tooltip id="populationSize-help">
                                Enter targeted number of people in the
                                population eligible for cervical screening{" "}
                              </Tooltip>
                            }
                          >
                            <i className="ms-1 bi bi-question-circle"></i>
                          </OverlayTrigger>
                        </Form.Label>
                        <Col sm={12}>
                          <InputGroup>
                            <Form.Control
                              type="number"
                              min="1"
                              step="1"
                              placeholder="Enter value"
                              name="populationSize"
                              value={form.populationSize}
                              onChange={handleChange}
                              onWheel={(e) => e.target.blur()}
                              required
                            />
                          </InputGroup>
                        </Col>
                      </Form.Group>
                    </ListGroup.Item>

                    {/* <ListGroup.Item>
                  <Form.Group as={Row} controlId="hpvCancerPrevalence">
                    <Form.Label column sm={8}>
                      <span>Prevalence of carcinogenic HPV infection</span>
                      <OverlayTrigger
                        overlay={<Tooltip id="hpvCancerPrevalence-help">Enter number of people who test positive for HPV per 100 people</Tooltip>}
                      >
                        <i className="ms-1 bi bi-question-circle"></i>
                      </OverlayTrigger>
                    </Form.Label>
                    <Col sm={4}>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          placeholder="Enter 0 - 100"
                          name="hpvCancerPrevalence"
                          className="border-end-0"
                          value={form.hpvCancerPrevalence}
                          onChange={handleChange} onWheel={(e) => e.target.blur()}
                        />
                        <InputGroup.Text>%</InputGroup.Text>
                      </InputGroup>
                    </Col>
                  </Form.Group>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Form.Group as={Row} controlId="hpvPrevalence">
                    <Form.Label column sm={8}>
                      <span>Proportion HPV-positives with HPV16/18</span>
                      <OverlayTrigger overlay={<Tooltip id="hpvPrevalence-help">Enter number of people with HPV16/18 per 100 HPV-positive people</Tooltip>}>
                        <i className="ms-1 bi bi-question-circle"></i>
                      </OverlayTrigger>
                    </Form.Label>
                    <Col sm={4}>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          placeholder="Enter 0 - 100"
                          name="hpvPrevalence"
                          className="border-end-0"
                          value={form.hpvPrevalence}
                          onChange={handleChange} onWheel={(e) => e.target.blur()}
                        />
                        <InputGroup.Text>%</InputGroup.Text>
                      </InputGroup>
                    </Col>
                  </Form.Group>
                </ListGroup.Item> */}

                    <ListGroup.Item>
                      <Form.Group as={Row} controlId="cinPrevalence">
                        <Form.Label column sm={12}>
                          <span>
                            Prevalence of CIN2/3 in population for cervical
                            screening
                          </span>
                          <OverlayTrigger
                            overlay={
                              <Tooltip id="cinPrevalence-help">
                                Enter number of women with CIN2/3 per 100 people
                                in the population eligible for cervical
                                screening
                              </Tooltip>
                            }
                          >
                            <i className="ms-1 bi bi-question-circle"></i>
                          </OverlayTrigger>
                        </Form.Label>
                        <Col sm={12}>
                          <InputGroup className="flex-nowrap">
                            <Form.Range
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              placeholder="Enter 0 - 100"
                              name="cinPrevalence"
                              className="border-end-0 me-2"
                              value={form.cinPrevalence}
                              onChange={handleChange}
                              onWheel={(e) => e.target.blur()}
                              required
                            />
                            <span className="text-nowrap">
                              {form.cinPrevalence}%
                            </span>
                          </InputGroup>
                        </Col>
                      </Form.Group>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <Card.Title>Strategy Selection</Card.Title>
                  <Card.Text className="small text-muted">
                    Please choose strategies to include in your scenario.
                  </Card.Text>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {scenarios.map((scenario) => (
                      <Col lg={12} key={scenario.value}>
                        <Form.Check key={scenario.value}>
                          <Form.Check.Input
                            type="checkbox"
                            name="scenario"
                            id={scenario.value}
                            value={scenario.value}
                            //checked={form.scenario === scenario.value}
                            checked={
                              scenario.strategy === "Screening" ||
                              scenario.strategy === "Diagnosis" ||
                              scenario.strategy === "Triage"
                            }
                            onChange={handleChange}
                            onWheel={(e) => e.target.blur()}
                          />
                          <Form.Check.Label htmlFor={scenario.value}>
                            {scenario.strategy}
                          </Form.Check.Label>
                        </Form.Check>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <Card.Title>Participation in Health Services</Card.Title>
                  <Card.Text className="text-muted small">
                    Please enter the observed or anticipated participation in
                    the cervical cancer screening program in your setting
                  </Card.Text>
                </Card.Header>
                <Card.Body className="p-0">
                  <ListGroup variant="flush hover borderless">
                    <ListGroup.Item>
                      <Form.Group as={Row} controlId="screeningInterval">
                        <Form.Label column sm={12}>
                          <span>Interval of cervical screening in years</span>
                          <OverlayTrigger
                            overlay={
                              <Tooltip id="screeningInterval-help">
                                If people have one screening in a lifetime,
                                enter 20 years. For two cervical screenings in a
                                lifetime, enter 10 years.
                              </Tooltip>
                            }
                          >
                            <i className="ms-1 bi bi-question-circle"></i>
                          </OverlayTrigger>
                        </Form.Label>
                        <Col sm={12}>
                          <InputGroup className="flex-nowrap">
                            <Form.Range
                              type="number"
                              min="1"
                              max="40"
                              step="1"
                              className="border-end-0 me-2"
                              placeholder="Enter 1 - 40"
                              name="screeningInterval"
                              value={form.screeningInterval}
                              onChange={handleChange}
                              onWheel={(e) => e.target.blur()}
                              required
                            />
                            <span className="text-nowrap">
                              {form.screeningInterval} Year(s)
                            </span>
                          </InputGroup>
                        </Col>
                      </Form.Group>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <Form.Group as={Row} controlId="percentScreened">
                        <Form.Label column sm={12}>
                          <span>Percent screening coverage</span>
                          <OverlayTrigger
                            overlay={
                              <Tooltip id="percentScreened-help">
                                Enter a value between 0 and 100.
                              </Tooltip>
                            }
                          >
                            <i className="ms-1 bi bi-question-circle"></i>
                          </OverlayTrigger>
                        </Form.Label>
                        <Col sm={12}>
                          <InputGroup className="flex-nowrap">
                            <Form.Range
                              min="0"
                              max="100"
                              step="1"
                              className="border-end-0 me-2"
                              placeholder="Enter 0 - 100"
                              name="percentScreened"
                              value={form.percentScreened}
                              onChange={handleChange}
                              onWheel={(e) => e.target.blur()}
                              required
                            />
                            <span className="text-nowrap">
                              {form.percentScreened} %
                            </span>
                          </InputGroup>
                        </Col>
                      </Form.Group>
                    </ListGroup.Item>

                    <div
                      className={
                        ["ScreenTriageDiagnosticTestTreat"].includes(
                          form.scenario
                        )
                          ? "d-block"
                          : "d-none"
                      }
                    >
                      <ListGroup.Item>
                        <Form.Group as={Row} controlId="percentTriaged">
                          <Form.Label column sm={12}>
                            <span>
                              Percent of screen positives with triage test
                            </span>
                            <OverlayTrigger
                              overlay={
                                <Tooltip id="percentTriaged-help">
                                  Enter a value between 0 and 100.
                                </Tooltip>
                              }
                            >
                              <i className="ms-1 bi bi-question-circle"></i>
                            </OverlayTrigger>
                          </Form.Label>
                          <Col sm={12}>
                            <InputGroup className="flex-nowrap">
                              <Form.Range
                                min="0"
                                max="100"
                                step="1"
                                className="border-end-0 me-2"
                                placeholder="Enter 0 - 100"
                                name="percentTriaged"
                                value={form.percentTriaged}
                                onChange={handleChange}
                                onWheel={(e) => e.target.blur()}
                                required={[
                                  "ScreenTriageDiagnosticTestTreat",
                                ].includes(form.scenario)}
                              />
                              <span className="text-nowrap">
                                {form.percentTriaged} %
                              </span>
                            </InputGroup>
                          </Col>
                        </Form.Group>
                      </ListGroup.Item>
                    </div>

                    <div
                      className={
                        [
                          "ScreenDiagnosticTestTreat",
                          "ScreenTriageDiagnosticTestTreat",
                        ].includes(form.scenario)
                          ? "d-block"
                          : "d-none"
                      }
                    >
                      <ListGroup.Item>
                        <Form.Group
                          as={Row}
                          controlId="percentDiagnosticTriaged"
                        >
                          <Form.Label column sm={12}>
                            <span>
                              {
                                {
                                  ScreenDiagnosticTestTreat:
                                    "Percent of screen positives with triage/diagnostic test",
                                  ScreenTriageDiagnosticTestTreat:
                                    "Percent of triage positives with diagnostic test",
                                }[form.scenario]
                              }
                            </span>
                            <OverlayTrigger
                              overlay={
                                <Tooltip id="percentDiagnosticTriaged-help">
                                  Enter a value between 0 and 100.
                                </Tooltip>
                              }
                            >
                              <i className="ms-1 bi bi-question-circle"></i>
                            </OverlayTrigger>
                          </Form.Label>
                          <Col sm={12}>
                            <InputGroup className="flex-nowrap">
                              <Form.Range
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                className="border-end-0 me-2"
                                placeholder="Enter 0 - 100"
                                name="percentDiagnosticTriaged"
                                value={form.percentDiagnosticTriaged}
                                onChange={handleChange}
                                onWheel={(e) => e.target.blur()}
                                required={[
                                  "ScreenDiagnosticTestTreat",
                                  "ScreenTriageDiagnosticTestTreat",
                                ].includes(form.scenario)}
                              />
                              <span className="text-nowrap">
                                {form.percentDiagnosticTriaged} %
                              </span>
                            </InputGroup>
                          </Col>
                        </Form.Group>
                      </ListGroup.Item>
                    </div>

                    <ListGroup.Item>
                      <Form.Group as={Row} controlId="percentTreated">
                        <Form.Label column sm={12}>
                          <span>
                            {
                              {
                                ScreenTreat:
                                  "Percent of screen positives treated",
                                ScreenDiagnosticTestTreat:
                                  "Percent of triage/diagnostic test positives treated",
                                ScreenTriageDiagnosticTestTreat:
                                  "Percent of diagnostic test positives treated",
                              }[form.scenario]
                            }
                          </span>
                          <OverlayTrigger
                            overlay={
                              <Tooltip id="percentDiagnosticTriaged-help">
                                Enter a value between 0 and 100.
                              </Tooltip>
                            }
                          >
                            <i className="ms-1 bi bi-question-circle"></i>
                          </OverlayTrigger>
                        </Form.Label>
                        <Col sm={12}>
                          <InputGroup className="flex-nowrap">
                            <Form.Range
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              className="border-end-0 me-2"
                              placeholder="Enter 0 - 100"
                              name="percentTreated"
                              value={form.percentTreated}
                              onChange={handleChange}
                              onWheel={(e) => e.target.blur()}
                              required
                            />
                            <span className="text-nowrap">
                              {form.percentTreated} %
                            </span>
                          </InputGroup>
                        </Col>
                      </Form.Group>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <Card.Title>
                    Screening and Treatment Characteristics
                  </Card.Title>
                  <Card.Text className="small text-muted">
                    Please select the screening, triage and diagnostic tests and
                    treatment modality you will use and enter an estimate of
                    their performance characteristics.
                  </Card.Text>
                </Card.Header>
                <Card.Body className="p-0">
                  <ListGroup variant="flush hover borderless">
                    <ListGroup.Item>
                      <Form.Group as={Row} controlId="screeningTest">
                        <Form.Label column sm={12}>
                          <span>Cervical screening test chosen</span>
                        </Form.Label>
                        <Col sm={12}>
                          <Form.Select
                            name="screeningTest"
                            value={form.screeningTest}
                            onChange={handleChange}
                            onWheel={(e) => e.target.blur()}
                            required
                          >
                            <option value="" hidden>
                              Select a test
                            </option>
                            {screeningTests.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                      </Form.Group>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <Form.Group as={Row} controlId="screeningTestSensitivity">
                        <Form.Label column sm={12} className="">
                          <span>
                            Screening test sensitivity for CIN2/3 (NIC2/3)
                          </span>
                          <OverlayTrigger
                            overlay={
                              <Tooltip id="screeningTestSensitivity-help">
                                Enter a value between 0 and 100.
                              </Tooltip>
                            }
                          >
                            <i className="ms-1 bi bi-question-circle"></i>
                          </OverlayTrigger>
                        </Form.Label>
                        <Col sm={12}>
                          <InputGroup className="flex-nowrap">
                            <Form.Range
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              className="border-end-0 me-2"
                              placeholder="Enter 0 - 100"
                              name="screeningTestSensitivity"
                              value={form.screeningTestSensitivity}
                              onChange={handleChange}
                              onWheel={(e) => e.target.blur()}
                              required
                            />
                            <span className="text-nowrap">
                              {form.screeningTestSensitivity} %
                            </span>
                          </InputGroup>
                        </Col>
                      </Form.Group>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <Form.Group as={Row} controlId="screeningTestSpecificity">
                        <Form.Label column sm={12} className="">
                          <span>
                            Screening test specificity for CIN2/3 (NIC2/3)
                          </span>
                          <OverlayTrigger
                            overlay={
                              <Tooltip id="screeningTestSpecificity-help">
                                Enter a value between 0 and 100.
                              </Tooltip>
                            }
                          >
                            <i className="ms-1 bi bi-question-circle"></i>
                          </OverlayTrigger>
                        </Form.Label>
                        <Col sm={12}>
                          <InputGroup className="flex-nowrap">
                            <Form.Range
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              className="border-end-0 me-2"
                              placeholder="Enter 0 - 100"
                              name="screeningTestSpecificity"
                              value={form.screeningTestSpecificity}
                              onChange={handleChange}
                              onWheel={(e) => e.target.blur()}
                              required
                            />
                            <span className="text-nowrap">
                              {form.screeningTestSpecificity} %
                            </span>
                          </InputGroup>
                        </Col>
                      </Form.Group>
                    </ListGroup.Item>

                    <div
                      className={
                        [
                          "ScreenDiagnosticTestTreat",
                          "ScreenTriageDiagnosticTestTreat",
                        ].includes(form.scenario)
                          ? "d-block"
                          : "d-none"
                      }
                    >
                      <ListGroup.Item>
                        <Form.Group as={Row} controlId="triageTest">
                          <Form.Label column sm={12}>
                            <span>Triage or diagnostic test chosen</span>
                          </Form.Label>
                          <Col sm={12}>
                            <Form.Select
                              name="triageTest"
                              value={form.triageTest}
                              onChange={handleChange}
                              onWheel={(e) => e.target.blur()}
                              required={[
                                "ScreenDiagnosticTestTreat",
                                "ScreenTriageDiagnosticTestTreat",
                              ].includes(form.scenario)}
                            >
                              <option value="" hidden>
                                Select a test
                              </option>
                              {triageTests.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </Form.Select>
                          </Col>
                        </Form.Group>
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <Form.Group as={Row} controlId="triageTestSensitivity">
                          <Form.Label column sm={12} className="">
                            <span>
                              Triage or diagnostic test sensitivity for CIN2/3
                              (NIC2/3)
                            </span>
                            <OverlayTrigger
                              overlay={
                                <Tooltip id="screeningTestSpecificity-help">
                                  Enter a value between 0 and 100.
                                </Tooltip>
                              }
                            >
                              <i className="ms-1 bi bi-question-circle"></i>
                            </OverlayTrigger>
                          </Form.Label>
                          <Col sm={12}>
                            <InputGroup className="flex-nowrap">
                              <Form.Range
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                className="border-end-0 me-2"
                                placeholder="Enter 0 - 100"
                                name="triageTestSensitivity"
                                value={form.triageTestSensitivity}
                                onChange={handleChange}
                                onWheel={(e) => e.target.blur()}
                                required={[
                                  "ScreenDiagnosticTestTreat",
                                  "ScreenTriageDiagnosticTestTreat",
                                ].includes(form.scenario)}
                              />
                              <span className="text-nowrap">
                                {form.triageTestSensitivity} %
                              </span>
                            </InputGroup>
                          </Col>
                        </Form.Group>
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <Form.Group as={Row} controlId="triageTestSpecificity">
                          <Form.Label column sm={12} className="">
                            <span>
                              Triage or diagnostic test specificity for CIN2/3
                              (NIC2/3)
                            </span>
                            <OverlayTrigger
                              overlay={
                                <Tooltip id="screeningTestSpecificity-help">
                                  Enter a value between 0 and 100.
                                </Tooltip>
                              }
                            >
                              <i className="ms-1 bi bi-question-circle"></i>
                            </OverlayTrigger>
                          </Form.Label>
                          <Col sm={12}>
                            <InputGroup className="flex-nowrap">
                              <Form.Range
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                className="border-end-0 me-2"
                                placeholder="Enter 0 - 100"
                                name="triageTestSpecificity"
                                value={form.triageTestSpecificity}
                                onChange={handleChange}
                                onWheel={(e) => e.target.blur()}
                                required={[
                                  "ScreenDiagnosticTestTreat",
                                  "ScreenTriageDiagnosticTestTreat",
                                ].includes(form.scenario)}
                              />
                              <span className="text-nowrap">
                                {form.triageTestSpecificity} %
                              </span>
                            </InputGroup>
                          </Col>
                        </Form.Group>
                      </ListGroup.Item>
                    </div>

                    <div
                      className={
                        ["ScreenTriageDiagnosticTestTreat"].includes(
                          form.scenario
                        )
                          ? "d-block"
                          : "d-none"
                      }
                    >
                      <ListGroup.Item>
                        <Form.Group as={Row} controlId="diagnosticTest">
                          <Form.Label column sm={12}>
                            <span>Diagnostic test chosen</span>
                          </Form.Label>
                          <Col sm={12}>
                            <Form.Select
                              name="diagnosticTest"
                              value={form.diagnosticTest}
                              onChange={handleChange}
                              onWheel={(e) => e.target.blur()}
                              required={[
                                "ScreenTriageDiagnosticTestTreat",
                              ].includes(form.scenario)}
                            >
                              <option value="" hidden>
                                Select a test
                              </option>
                              {diagnosticTests.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </Form.Select>
                          </Col>
                        </Form.Group>
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <Form.Group
                          as={Row}
                          controlId="diagnosticTestSensitivity"
                        >
                          <Form.Label column sm={12} className="">
                            <span>
                              Diagnostic test sensitivity for CIN2/3 (NIC2/3)
                            </span>
                            <OverlayTrigger
                              overlay={
                                <Tooltip id="diagnosticTestSensitivity-help">
                                  Enter a value between 0 and 100.
                                </Tooltip>
                              }
                            >
                              <i className="ms-1 bi bi-question-circle"></i>
                            </OverlayTrigger>
                          </Form.Label>
                          <Col sm={12}>
                            <InputGroup className="flex-nowrap">
                              <Form.Range
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                className="border-end-0 me-2"
                                placeholder="Enter 0 - 100"
                                name="diagnosticTestSensitivity"
                                value={form.diagnosticTestSensitivity}
                                onChange={handleChange}
                                onWheel={(e) => e.target.blur()}
                                required={[
                                  "ScreenTriageDiagnosticTestTreat",
                                ].includes(form.scenario)}
                              />
                              <span className="text-nowrap">
                                {form.diagnosticTestSensitivity} %
                              </span>
                            </InputGroup>
                          </Col>
                        </Form.Group>
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <Form.Group
                          as={Row}
                          controlId="diagnosticTestSpecificity"
                        >
                          <Form.Label column sm={12} className="">
                            <span>
                              Diagnostic test specificity for CIN2/3 (NIC2/3)
                            </span>
                            <OverlayTrigger
                              overlay={
                                <Tooltip id="diagnosticTestSpecificity-help">
                                  Enter a value between 0 and 100.
                                </Tooltip>
                              }
                            >
                              <i className="ms-1 bi bi-question-circle"></i>
                            </OverlayTrigger>
                          </Form.Label>
                          <Col sm={12}>
                            <InputGroup className="flex-nowrap">
                              <Form.Range
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                className="border-end-0 me-2"
                                placeholder="Enter 0 - 100"
                                name="diagnosticTestSpecificity"
                                value={form.diagnosticTestSpecificity}
                                onChange={handleChange}
                                onWheel={(e) => e.target.blur()}
                                required={[
                                  "ScreenTriageDiagnosticTestTreat",
                                ].includes(form.scenario)}
                              />
                              <span className="text-nowrap">
                                {form.diagnosticTestSpecificity} %
                              </span>
                            </InputGroup>
                          </Col>
                        </Form.Group>
                      </ListGroup.Item>
                    </div>
                  </ListGroup>
                </Card.Body>
              </Card>
              <Form.Group className="mb-4 text-center">
                {/* <Button type="submit" className="me-1 shadow" variant="primary">
              Submit
            </Button> */}
                <Button
                  type="reset"
                  className="shadow"
                  variant="outline-primary"
                >
                  Reset
                </Button>
              </Form.Group>
            </Form>
          </Col>
          <Col md={8}>
            <ScenarioResults />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
