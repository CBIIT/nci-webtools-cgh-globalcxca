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
import { useTranslation, Trans } from "react-i18next";

// NOTE: Do not conditionally render elements, as this will break after google translates the page.

export default function RunScenarios() {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useRecoilState(formState);
  const resetForm = useResetRecoilState(formState);
  const setParams = useSetRecoilState(paramsState);
  const setResults = useSetRecoilState(resultsState);
  const navigate = useNavigate();
  const [checkedValues, setCheckedValues] = useState([]);

  function handleChange(e) {
    const { name, value, checked } = e.target;
    console.log("checked", checked);
    console.log("value", value);

    if (name === "ScreenTreat" && !checked) {
      // Ignore the unchecked action for "Screening Test" checkbox
      return;
    }
    let updatedValues = [];

    if (checked) {
      // Add the checked value to the array
      updatedValues = [...checkedValues, value];
    } else {
      // Remove the unchecked value from the array
      updatedValues = checkedValues.filter((val) => val !== value);
    }
    console.log("updatedValues -----", updatedValues);
    setCheckedValues(updatedValues);

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
  }
  useEffect(() => {
    if (checkedValues.length === 1) {
      setForm((prevForm) => ({
        ...prevForm,
        scenario: "ScreenTreat",
        checkedValues: checkedValues,
      }));
    } else if (checkedValues.length === 2) {
      setForm((prevForm) => ({
        ...prevForm,
        scenario: "ScreenDiagnosticTestTreat",
        checkedValues: checkedValues,
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        scenario: "ScreenTriageDiagnosticTestTreat",
        checkedValues: checkedValues,
      }));
    }
  }, [checkedValues, setForm]);

  useEffect(() => {
    // Set the initial checked value to "Screening Test"
    setCheckedValues(["ScreenTreat"]);
  }, []);

  useEffect(() => {
    // Set the initial checked value to "Screening Test"
    setCheckedValues(["ScreenTreat"]);
  }, []);

  // Function to handle language change
  function handleLanguageChange(newLanguage) {
    i18n.changeLanguage(newLanguage);
  }

  const results = runModel(form);
  const params = mapValues(form, asNumber);
  console.log("paramsssss: , ", params);
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
  useEffect(() => {
    // Get the height of the header element (assuming you have it as "headerHeight")
    const headerHeight = 310;

    // Calculate the available height for the Col container
    const availableHeight = window.innerHeight - headerHeight;

    // Get the Col element by id
    const colElement = document.getElementById("col-with-scroll");

    // Set the calculated height as the maxHeight style property
    if (colElement) {
      colElement.style.maxHeight = `${availableHeight}px`;
    }
  }, []);

  return (
    <div className="bg-light py-4">
      {/* <Container> */}
      <div className="mx-3">
        <Row>
          <Col md={5} id="col-with-scroll" style={{ overflowY: "auto" }}>
            <div>
              <Form onReset={handleReset}>
                <div className="small text-end text-muted mb-2">
                  {t("runScenario.fieldRequired")}
                </div>
                <Row>
                  <Col md={6}>
                    <div>
                      <h5> {t("runScenario.epidemiological")}</h5>
                      <div className="small text-muted">
                        {t("runScenario.epidemiologicalTitle")}
                      </div>
                    </div>
                    <div className="p-0">
                      <ListGroup variant="flush hover borderless">
                        <ListGroup.Item>
                          <Form.Group as={Row} controlId="populationSize">
                            <Form.Label column sm={12}>
                              <span>{t("runScenario.numPeople")}</span>
                              <OverlayTrigger
                                overlay={
                                  <Tooltip id="populationSize-help">
                                    <span>
                                      {t("runScenario.numPeopleInfo")}
                                    </span>
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

                        <ListGroup.Item>
                          <Form.Group as={Row} controlId="cinPrevalence">
                            <Form.Label column sm={12}>
                              <span>{t("runScenario.prevelance")}</span>
                              <OverlayTrigger
                                overlay={
                                  <Tooltip id="cinPrevalence-help">
                                    {t("runScenario.prevelanceInfo")}
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
                                  max="5"
                                  step="1"
                                  placeholder="Enter 0 - 5"
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
                    </div>

                    <Card.Header>
                      <Card.Title>
                        {" "}
                        {t("runScenario.participationTitle")}
                      </Card.Title>
                      <Card.Text className="text-muted small">
                        {t("runScenario.participationWarning")}
                      </Card.Text>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <ListGroup variant="flush hover borderless">
                        <ListGroup.Item>
                          <Form.Group as={Row} controlId="screeningInterval">
                            <Form.Label column sm={12}>
                              <span>
                                {t("runScenario.intervalofCervicalInYears")}
                              </span>
                              <OverlayTrigger
                                overlay={
                                  <Tooltip id="screeningInterval-help">
                                    {t("runScenario.intervalInformation")}
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
                                  {form.screeningInterval} {t("general.years")}
                                </span>
                              </InputGroup>
                            </Col>
                          </Form.Group>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <Form.Group as={Row} controlId="percentScreened">
                            <Form.Label column sm={12}>
                              <span>
                                {" "}
                                {t("runScenario.percentScreeningCoverage")}
                              </span>
                              <OverlayTrigger
                                overlay={
                                  <Tooltip id="percentScreened-help">
                                    {t("general.enterValue0t100HelpText")}
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
                                  {t(
                                    "runScenario.percentScreeningPositiveWithTriage"
                                  )}
                                </span>
                                <OverlayTrigger
                                  overlay={
                                    <Tooltip id="percentTriaged-help">
                                      {t("general.enterValue0t100HelpText")}
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
                                      {t("general.enterValue0t100HelpText")}
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
                                    ScreenTreat: t("runScenario.ScreenTreat"),
                                    ScreenDiagnosticTestTreat: t(
                                      "runScenario.ScreenDiagnosticTestTreat"
                                    ),
                                    ScreenTriageDiagnosticTestTreat: t(
                                      "runScenario.percentDiagnosticPositiveTreated"
                                    ),
                                  }[form.scenario]
                                }
                              </span>
                              <OverlayTrigger
                                overlay={
                                  <Tooltip id="percentDiagnosticTriaged-help">
                                    {t("general.enterValue0t100HelpText")}
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
                  </Col>

                  <Col md={6}>
                    <Card.Header>
                      <Card.Title>
                        {" "}
                        {t("runScenario.strategySelectionTitle")}
                      </Card.Title>
                      <Card.Text className="small text-muted">
                        {t("runScenario.strategyChoosen")}
                      </Card.Text>
                    </Card.Header>
                    <Card.Body className="pt-2 pb-2">
                      <Row>
                        {scenarios.map((scenario) => (
                          <Col lg={12} key={scenario.value}>
                            <Form.Check key={scenario.value}>
                              <Form.Check.Input
                                type="checkbox"
                                //name="scenario"
                                checked={checkedValues.includes(scenario.value)}
                                name={scenario.value}
                                id={scenario.value}
                                value={scenario.value}
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
                    <Card.Header>
                      <Card.Title>
                        {" "}
                        {t("runScenario.screeningAndTreatmentTitle")}
                      </Card.Title>
                      <Card.Text className="small text-muted">
                        {t("runScenario.screeningAndTreatmentWarning")}
                      </Card.Text>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <ListGroup variant="flush hover borderless">
                        <ListGroup.Item>
                          <Form.Group as={Row} controlId="screeningTest">
                            <Form.Label column sm={12}>
                              <span>
                                {" "}
                                {t("runScenario.cervicalScreeningTestChosen")}
                              </span>
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
                          <Form.Group
                            as={Row}
                            controlId="screeningTestSensitivity"
                          >
                            <Form.Label column sm={12} className="">
                              <span>
                                {t("runScenario.screeningTestSenvitivity")}
                              </span>
                              <OverlayTrigger
                                overlay={
                                  <Tooltip id="screeningTestSensitivity-help">
                                    {t("general.enterValue0t100HelpText")}
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
                          <Form.Group
                            as={Row}
                            controlId="screeningTestSpecificity"
                          >
                            <Form.Label column sm={12} className="">
                              <span>
                                {t("runScenario.screeningTestSpecificity")}
                              </span>
                              <OverlayTrigger
                                overlay={
                                  <Tooltip id="screeningTestSpecificity-help">
                                    {t("enterValue0t100HelpText")}
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
                                <span>
                                  {" "}
                                  {t(
                                    "runScenario.triageOrDiagnosticTestChosen"
                                  )}
                                </span>
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
                                    {t("runScenario.selectTest")}
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
                            <Form.Group
                              as={Row}
                              controlId="triageTestSensitivity"
                            >
                              <Form.Label column sm={12} className="">
                                <span>
                                  {t(
                                    "runScenario.triageOrDiagnosticTestSensitivity"
                                  )}
                                </span>
                                <OverlayTrigger
                                  overlay={
                                    <Tooltip id="screeningTestSpecificity-help">
                                      {t("enterValue0t100HelpText")}
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
                            <Form.Group
                              as={Row}
                              controlId="triageTestSpecificity"
                            >
                              <Form.Label column sm={12} className="">
                                <span>
                                  {t(
                                    "runScenario.triageOrDiagnosticTestSpecificity"
                                  )}
                                </span>
                                <OverlayTrigger
                                  overlay={
                                    <Tooltip id="screeningTestSpecificity-help">
                                      {t("general.enterValue0t100HelpText")}{" "}
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
                                <span>
                                  {" "}
                                  {t("runScenario.diagnosticTestChosen")}
                                </span>
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
                                  {t("runScenario.diagnosticTestSensitivity")}
                                </span>
                                <OverlayTrigger
                                  overlay={
                                    <Tooltip id="diagnosticTestSensitivity-help">
                                      {t("general.enterValue0t100HelpText")}
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
                                  {t("runScenario.diagnosticTestSpecificity")}
                                </span>
                                <OverlayTrigger
                                  overlay={
                                    <Tooltip id="diagnosticTestSpecificity-help">
                                      {t("general.enterValue0t100HelpText")}
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
                  </Col>
                </Row>

                <Form.Group className="mb-4 text-center">
                  <Button
                    type="reset"
                    className="shadow"
                    variant="outline-primary"
                  >
                    {t("general.reset")}
                  </Button>
                </Form.Group>
              </Form>
            </div>
          </Col>
          <Col md={7}>
            <ScenarioResults />
          </Col>
        </Row>
      </div>
      {/* </Container> */}
    </div>
  );
}
