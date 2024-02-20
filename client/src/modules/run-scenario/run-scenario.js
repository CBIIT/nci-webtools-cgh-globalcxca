import { useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mapValues from "lodash/mapValues";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { Dropdown } from "react-bootstrap";
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
  const [divVisibilities, setDivVisibilities] = useState(
    Array(scenarios.length).fill(false)
  );

  function handleChange(e, index) {
    const { name, value, checked } = e.target;
    //console.log("checked", checked);
    //console.log("value", value);

    let updatedValues = [...checkedValues];
    let newDivVisibilities = [...divVisibilities];

    if (name === "ScreenTreat" || name === "Treatment") {
      // Toggle visibility of "ScreenTreat" and "Treatment"
      newDivVisibilities[index] = !newDivVisibilities[index];
      newDivVisibilities[scenarios.length - 1] = true; // Keep "Treatment" always open
    } else {
      if (checked) {
        // Add the checked value to the array
        updatedValues.push(value);
        // Update visibility of the div corresponding to the checked checkbox
        newDivVisibilities = newDivVisibilities.map((_, i) =>
          i === index || i === scenarios.length - 1 ? true : false
        );
      } else {
        // Remove the unchecked value from the array
        updatedValues = updatedValues.filter((val) => val !== value);
        // Hide the div of the unchecked checkbox
        newDivVisibilities[index] = false;
      }
    }

    // Update the state
    setDivVisibilities(newDivVisibilities);
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
  function initStates() {
    setCheckedValues(["ScreenTreat", "Treatment"]);
    const initialDivVisibilities = [true, false, false, true]; // Set index 1 and 3 to true
    setDivVisibilities(initialDivVisibilities);
  }

  useEffect(() => {
    if (checkedValues.length <= 2) {
      setForm((prevForm) => ({
        ...prevForm,
        scenario: "ScreenTreat",
        checkedValues: checkedValues,
      }));
    } else if (checkedValues.length === 3) {
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
    initStates();
  }, []);

  // Function to handle language change
  function handleLanguageChange(newLanguage) {
    i18n.changeLanguage(newLanguage);
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
    initStates();
    window.scrollTo(0, 0);
    resetForm();
  }
  // useEffect(() => {
  //   // Get the height of the header element (assuming you have it as "headerHeight")
  //   const headerHeight = 310;

  //   // Calculate the available height for the Col container
  //   const availableHeight = window.innerHeight - headerHeight;

  //   // Get the Col element by id
  //   const colElement = document.getElementById("col-with-scroll");

  //   // Set the calculated height as the maxHeight style property
  //   if (colElement) {
  //     colElement.style.maxHeight = `${availableHeight}px`;
  //   }
  // }, []);

  function handleDropdownItemClick(scenarioValue, selectedItem) {
    // Handle dropdown item click here
    console.log(
      `Dropdown item "${selectedItem}" clicked for scenario ${scenarioValue}`
    );
  }

  const handleArrowClick = (index) => {
    const newDivVisibilities = [...divVisibilities];
    newDivVisibilities[index] = !newDivVisibilities[index];
    setDivVisibilities(newDivVisibilities);
  };

  const handleKeyDown = (event, idx) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); // Prevent the default action for the spacebar
      handleArrowClick(idx);
    }
  };

  return (
    <div className="bg-light py-3">
      {/* <Container> */}
      <div className="mx-3">
        <Row className="mb-1">
          <Col md={12}> {t("runScenario.pleaseRefer")}</Col>
        </Row>
        <Row>
          {/* <Col md={5} id="col-with-scroll" style={{ overflowY: "auto" }}> */}
          <Col md={5}>
            <div className="">
              <Form onReset={handleReset}>
                <div style={{}}>
                  <div className="mb-2">
                    <Row>
                      <Col lg={12} md={12} sm={12} xs={12}>
                        <div>
                          <h2 className="h5">
                            {" "}
                            {t("runScenario.epidemiological")}
                          </h2>
                          <div className="small text-muted">
                            {t("runScenario.epidemiologicalTitle")}
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <div className="py-1 border-gray">
                      <Row className="ps-3 align-items-center">
                        <Form.Group as={Row} controlId="populationSize">
                          <Col lg={6} md={12} sm={12} xs={12}>
                            <Form.Label column sm={12}>
                              <span>{t("runScenario.numPeople")}</span>{" "}
                              <span className="required"></span>
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
                          </Col>
                          <Col
                            lg={6}
                            md={12}
                            sm={12}
                            xs={12}
                            className="m-auto"
                          >
                            <InputGroup>
                              <Form.Control
                                type="number"
                                min="1"
                                step="1"
                                placeholder={t("general.enterValue")}
                                name="populationSize"
                                value={form.populationSize}
                                onChange={handleChange}
                                onWheel={(e) => e.target.blur()}
                                inputmode="numeric"
                                required
                              />
                            </InputGroup>
                          </Col>
                        </Form.Group>
                      </Row>
                      <Row className="ps-3">
                        <Form.Group as={Row} controlId="cinPrevalence">
                          <Col lg={6} md={12} sm={12} xs={12}>
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
                          </Col>
                          <Col
                            lg={6}
                            md={12}
                            sm={12}
                            xs={12}
                            className="m-auto"
                          >
                            <InputGroup className="flex-nowrap">
                              <Form.Range
                                type="range"
                                min="0"
                                max="5"
                                step="0.1"
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
                      </Row>
                    </div>
                  </div>
                  <div>
                    <Row>
                      <Col lg={12} md={12} sm={12} xs={12}>
                        <Card.Header>
                          <Card.Title>
                            {" "}
                            {t("runScenario.strategySelectionTitle")}
                          </Card.Title>
                          <Card.Text className="small text-muted">
                            {t("runScenario.strategyChoosen")}
                          </Card.Text>
                        </Card.Header>
                      </Col>
                    </Row>
                    <Row className="ml-auto">
                      {scenarios.map((scenario, idx) => (
                        <div className="mt-2">
                          <Col
                            lg={12}
                            md={12}
                            sm={12}
                            xs={12}
                            key={scenario.value}
                            className="border-gray"
                          >
                            <div className="bg-gray ">
                              <Row className="p-1">
                                <Col
                                  lg={10}
                                  md={10}
                                  sm={10}
                                  xs={10}
                                  className="col-auto me-auto"
                                >
                                  <div>
                                    <Form.Check
                                      key={scenario.value}
                                      className="mb-0"
                                    >
                                      <Form.Check.Input
                                        type="checkbox"
                                        checked={checkedValues.includes(
                                          scenario.value
                                        )}
                                        name={scenario.value}
                                        id={scenario.value}
                                        value={scenario.value}
                                        onChange={(e) => handleChange(e, idx)}
                                        onWheel={(e) => e.target.blur()}
                                        className="mr-2"
                                      />
                                      <Form.Check.Label
                                        htmlFor={scenario.value}
                                        className="mb-0"
                                      >
                                        {t(scenario.strategy)}
                                      </Form.Check.Label>
                                    </Form.Check>
                                  </div>
                                </Col>
                                <Col
                                  lg={2}
                                  md={2}
                                  sm={2}
                                  xs={2}
                                  className="col-auto"
                                >
                                  <div
                                    onClick={() => handleArrowClick(idx)}
                                    onKeyDown={(e) => handleKeyDown(e, idx)}
                                    tabIndex={0} // Make the element focusable
                                    role="button" // Define the role for screen readers
                                    aria-expanded={divVisibilities[idx]} // Indicate the expanded state
                                    style={{
                                      cursor: "pointer",
                                      textAlign: "right",
                                    }}
                                    className="mr-auto"
                                    aria-label="Expand"
                                  >
                                    {divVisibilities[idx] ? (
                                      <i className="fas fa-chevron-up"></i>
                                    ) : (
                                      <i className="fas fa-chevron-down"></i>
                                    )}
                                  </div>
                                </Col>
                              </Row>
                            </div>

                            {divVisibilities[idx] && (
                              <div>
                                {/* Your content for div {index + 1} goes here */}
                                <Row>
                                  <Col>
                                    {/* Customize the content for each div */}
                                    {idx === 0 && (
                                      <div className="px-1">
                                        <Row>
                                          <Col
                                            lg={12}
                                            md={12}
                                            sm={12}
                                            xs={12}
                                            className="d-flex flex-column"
                                          >
                                            {" "}
                                            <Card.Text className="text-muted small">
                                              {t(
                                                "runScenario.participationWarning"
                                              )}
                                            </Card.Text>
                                          </Col>
                                        </Row>
                                        <div className="ps-3">
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="screeningInterval"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label column sm={12}>
                                                  <span>
                                                    {t(
                                                      "runScenario.intervalofCervicalInYears"
                                                    )}
                                                  </span>
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="screeningInterval-help">
                                                        {t(
                                                          "runScenario.intervalInformation"
                                                        )}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                <InputGroup className="flex-nowrap">
                                                  <Form.Range
                                                    type="number"
                                                    min="1"
                                                    max="40"
                                                    step="1"
                                                    className="border-end-0 me-2"
                                                    placeholder="Enter 1 - 40"
                                                    name="screeningInterval"
                                                    value={
                                                      form.screeningInterval
                                                    }
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required
                                                  />
                                                  <span className="text-nowrap">
                                                    {form.screeningInterval}{" "}
                                                    {t("general.years")}
                                                  </span>
                                                </InputGroup>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="percentScreened"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label column sm={12}>
                                                  <span>
                                                    {" "}
                                                    {t(
                                                      "runScenario.percentScreeningCoverage"
                                                    )}
                                                  </span>
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="percentScreened-help">
                                                        {t(
                                                          "general.enterValue0t100HelpText"
                                                        )}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
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
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required
                                                  />
                                                  <span className="text-nowrap">
                                                    {form.percentScreened} %
                                                  </span>
                                                </InputGroup>
                                              </Col>
                                            </Form.Group>
                                          </Row>

                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="screeningTest"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label column sm={12}>
                                                  <span>
                                                    {" "}
                                                    {t(
                                                      "runScenario.cervicalScreeningTestChosen"
                                                    )}
                                                  </span>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                {" "}
                                                <Form.Select
                                                  name="screeningTest"
                                                  value={form.screeningTest}
                                                  onChange={handleChange}
                                                  onWheel={(e) =>
                                                    e.target.blur()
                                                  }
                                                  required
                                                >
                                                  <option value="" hidden>
                                                    {t(
                                                      "runScenario.selectTest"
                                                    )}
                                                  </option>
                                                  {screeningTests.map((m) => (
                                                    <option
                                                      key={m.value}
                                                      value={m.value}
                                                    >
                                                      {t(m.label)}
                                                    </option>
                                                  ))}
                                                </Form.Select>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="screeningTestSensitivity"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label
                                                  column
                                                  sm={12}
                                                  className=""
                                                >
                                                  <span>
                                                    {t(
                                                      "runScenario.screeningTestSenvitivity"
                                                    )}
                                                  </span>
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="screeningTestSensitivity-help">
                                                        {t(
                                                          "general.enterValue0t100HelpText"
                                                        )}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                {" "}
                                                <InputGroup className="flex-nowrap">
                                                  <Form.Range
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    className="border-end-0 me-2"
                                                    placeholder="Enter 0 - 100"
                                                    name="screeningTestSensitivity"
                                                    value={
                                                      form.screeningTestSensitivity
                                                    }
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required
                                                  />
                                                  <span className="text-nowrap">
                                                    {
                                                      form.screeningTestSensitivity
                                                    }{" "}
                                                    %
                                                  </span>
                                                </InputGroup>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="screeningTestSpecificity"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label
                                                  column
                                                  sm={12}
                                                  className=""
                                                >
                                                  <span>
                                                    {t(
                                                      "runScenario.screeningTestSpecificity"
                                                    )}
                                                  </span>
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="screeningTestSpecificity-help">
                                                        {t(
                                                          "general.enterValue0t100HelpText"
                                                        )}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                {" "}
                                                <InputGroup className="flex-nowrap">
                                                  <Form.Range
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    className="border-end-0 me-2"
                                                    placeholder="Enter 0 - 100"
                                                    name="screeningTestSpecificity"
                                                    value={
                                                      form.screeningTestSpecificity
                                                    }
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required
                                                  />
                                                  <span className="text-nowrap">
                                                    {
                                                      form.screeningTestSpecificity
                                                    }{" "}
                                                    %
                                                  </span>
                                                </InputGroup>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                        </div>
                                      </div>
                                    )}
                                    {idx === 1 && (
                                      <div>
                                        <div
                                          className={
                                            checkedValues.length === 2
                                              ? "grayed-out"
                                              : "d-none"
                                          }
                                        >
                                          <div className="ps-3">
                                            <div>
                                              <Row>
                                                <Form.Group
                                                  as={Row}
                                                  controlId="percentTriaged"
                                                >
                                                  <Col
                                                    lg={6}
                                                    md={12}
                                                    sm={12}
                                                    xs={12}
                                                    className="d-flex flex-column"
                                                  >
                                                    <Form.Label column sm={12}>
                                                      <span>
                                                        {t(
                                                          "runScenario.percentScreeningPositiveWithTriage"
                                                        )}
                                                      </span>
                                                      <OverlayTrigger
                                                        overlay={
                                                          <Tooltip id="percentTriaged-help">
                                                            {t(
                                                              "general.enterValue0t100HelpText"
                                                            )}
                                                          </Tooltip>
                                                        }
                                                      >
                                                        <i className="ms-1 bi bi-question-circle"></i>
                                                      </OverlayTrigger>
                                                    </Form.Label>
                                                  </Col>
                                                  <Col
                                                    lg={6}
                                                    md={12}
                                                    sm={12}
                                                    xs={12}
                                                    className="d-flex flex-column m-auto"
                                                  >
                                                    <InputGroup className="flex-nowrap">
                                                      <Form.Range
                                                        min="0"
                                                        max="100"
                                                        step="1"
                                                        className="border-end-0 me-2"
                                                        placeholder="Enter 0 - 100"
                                                        name="percentDiagnosticTriaged"
                                                        value={
                                                          form.percentDiagnosticTriaged
                                                        }
                                                        onChange={handleChange}
                                                        onWheel={(e) =>
                                                          e.target.blur()
                                                        }
                                                        required={[
                                                          "ScreenTriageDiagnosticTestTreat",
                                                        ].includes(
                                                          form.scenario
                                                        )}
                                                      />
                                                      <span className="text-nowrap">
                                                        {
                                                          form.percentDiagnosticTriaged
                                                        }{" "}
                                                        %
                                                      </span>
                                                    </InputGroup>
                                                  </Col>
                                                </Form.Group>
                                              </Row>
                                            </div>

                                            <Row>
                                              <Form.Group
                                                as={Row}
                                                controlId="triageTest"
                                              >
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column"
                                                >
                                                  <Form.Label column sm={12}>
                                                    <span>
                                                      {" "}
                                                      {t(
                                                        "runScenario.triageTestChosen"
                                                      )}
                                                    </span>
                                                  </Form.Label>
                                                </Col>
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column m-auto"
                                                >
                                                  <Form.Select
                                                    name="triageTest"
                                                    value={form.triageTest}
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required={[
                                                      "ScreenDiagnosticTestTreat",
                                                      "ScreenTriageDiagnosticTestTreat",
                                                    ].includes(form.scenario)}
                                                  >
                                                    <option value="" hidden>
                                                      {t(
                                                        "runScenario.selectTest"
                                                      )}
                                                    </option>
                                                    {triageTests.map((m) => (
                                                      <option
                                                        key={m.value}
                                                        value={m.value}
                                                      >
                                                        {t(m.label)}
                                                      </option>
                                                    ))}
                                                  </Form.Select>
                                                </Col>
                                              </Form.Group>
                                            </Row>
                                            <Row>
                                              <Form.Group
                                                as={Row}
                                                controlId="triageTestSensitivity"
                                              >
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column"
                                                >
                                                  <Form.Label
                                                    column
                                                    sm={12}
                                                    className=""
                                                  >
                                                    <span>
                                                      {t(
                                                        "runScenario.triageTestSensitivity"
                                                      )}
                                                    </span>
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="screeningTestSpecificity-help">
                                                          {t(
                                                            "general.enterValue0t100HelpText"
                                                          )}
                                                        </Tooltip>
                                                      }
                                                    >
                                                      <i className="ms-1 bi bi-question-circle"></i>
                                                    </OverlayTrigger>
                                                  </Form.Label>
                                                </Col>
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column m-auto"
                                                >
                                                  <InputGroup className="flex-nowrap">
                                                    <Form.Range
                                                      type="number"
                                                      min="0"
                                                      max="100"
                                                      step="1"
                                                      className="border-end-0 me-2"
                                                      placeholder="Enter 0 - 100"
                                                      name="triageTestSensitivity"
                                                      value={
                                                        form.triageTestSensitivity
                                                      }
                                                      onChange={handleChange}
                                                      onWheel={(e) =>
                                                        e.target.blur()
                                                      }
                                                      required={[
                                                        "ScreenDiagnosticTestTreat",
                                                        "ScreenTriageDiagnosticTestTreat",
                                                      ].includes(form.scenario)}
                                                    />
                                                    <span className="text-nowrap">
                                                      {
                                                        form.triageTestSensitivity
                                                      }{" "}
                                                      %
                                                    </span>
                                                  </InputGroup>
                                                </Col>
                                              </Form.Group>
                                            </Row>
                                            <Row>
                                              <Form.Group
                                                as={Row}
                                                controlId="triageTestSpecificity"
                                              >
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column"
                                                >
                                                  <Form.Label
                                                    column
                                                    sm={12}
                                                    className=""
                                                  >
                                                    <span>
                                                      {t(
                                                        "runScenario.triageTestSpecificity"
                                                      )}
                                                    </span>
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="screeningTestSpecificity-help">
                                                          {t(
                                                            "general.enterValue0t100HelpText"
                                                          )}{" "}
                                                        </Tooltip>
                                                      }
                                                    >
                                                      <i className="ms-1 bi bi-question-circle"></i>
                                                    </OverlayTrigger>
                                                  </Form.Label>
                                                </Col>
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column m-auto"
                                                >
                                                  <InputGroup className="flex-nowrap">
                                                    <Form.Range
                                                      type="number"
                                                      min="0"
                                                      max="100"
                                                      step="1"
                                                      className="border-end-0 me-2"
                                                      placeholder="Enter 0 - 100"
                                                      name="triageTestSpecificity"
                                                      value={
                                                        form.triageTestSpecificity
                                                      }
                                                      onChange={handleChange}
                                                      onWheel={(e) =>
                                                        e.target.blur()
                                                      }
                                                      required={[
                                                        "ScreenDiagnosticTestTreat",
                                                        "ScreenTriageDiagnosticTestTreat",
                                                      ].includes(form.scenario)}
                                                    />
                                                    <span className="text-nowrap">
                                                      {
                                                        form.triageTestSpecificity
                                                      }{" "}
                                                      %
                                                    </span>
                                                  </InputGroup>
                                                </Col>
                                              </Form.Group>
                                            </Row>
                                          </div>
                                        </div>
                                        <div
                                          className={
                                            checkedValues.length === 3 &&
                                            checkedValues.includes(
                                              "ScreenDiagnosticTestTreat"
                                            )
                                              ? "grayed-out"
                                              : "d-none"
                                          }
                                        >
                                          <div className="ps-3">
                                            {" "}
                                            <Row>
                                              <Form.Group
                                                as={Row}
                                                controlId="percentTriaged"
                                              >
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column"
                                                >
                                                  <Form.Label column sm={12}>
                                                    <span>
                                                      {t(
                                                        "runScenario.percentScreeningPositiveWithTriage"
                                                      )}
                                                    </span>

                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="percentDiagnosticTriaged-help">
                                                          {t(
                                                            "general.enterValue0t100HelpText"
                                                          )}
                                                        </Tooltip>
                                                      }
                                                    >
                                                      <i className="ms-1 bi bi-question-circle"></i>
                                                    </OverlayTrigger>
                                                  </Form.Label>
                                                </Col>
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column m-auto"
                                                >
                                                  <InputGroup className="flex-nowrap">
                                                    <Form.Range
                                                      type="number"
                                                      min="0"
                                                      max="100"
                                                      step="1"
                                                      className="border-end-0 me-2"
                                                      placeholder="Enter 0 - 100"
                                                      name="percentTriaged"
                                                      value={
                                                        form.percentTriaged
                                                      }
                                                      onChange={handleChange}
                                                      onWheel={(e) =>
                                                        e.target.blur()
                                                      }
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
                                            </Row>
                                            <Row>
                                              <Form.Group
                                                as={Row}
                                                controlId="diagnosticTest"
                                              >
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column"
                                                >
                                                  <Form.Label column sm={12}>
                                                    <span>
                                                      {" "}
                                                      {t(
                                                        "runScenario.triageTestChosen"
                                                      )}
                                                    </span>
                                                  </Form.Label>
                                                </Col>
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column m-auto"
                                                >
                                                  <Form.Select
                                                    name="diagnosticTest"
                                                    value={form.diagnosticTest}
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required={[
                                                      "ScreenDiagnosticTestTreat",
                                                    ].includes(form.scenario)}
                                                  >
                                                    <option value="" hidden>
                                                      {t(
                                                        "runScenario.selectTest"
                                                      )}
                                                    </option>
                                                    {diagnosticTests.map(
                                                      (m) => (
                                                        <option
                                                          key={m.value}
                                                          value={m.value}
                                                        >
                                                          {t(m.label)}
                                                        </option>
                                                      )
                                                    )}
                                                  </Form.Select>
                                                </Col>
                                              </Form.Group>
                                            </Row>
                                            <Row>
                                              <Form.Group
                                                as={Row}
                                                controlId="diagnosticTestSensitivity"
                                              >
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column"
                                                >
                                                  <Form.Label
                                                    column
                                                    sm={12}
                                                    className=""
                                                  >
                                                    <span>
                                                      {t(
                                                        "runScenario.triageTestSensitivity"
                                                      )}
                                                    </span>
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="screeningTestSpecificity-help">
                                                          {t(
                                                            "general.enterValue0t100HelpText"
                                                          )}
                                                        </Tooltip>
                                                      }
                                                    >
                                                      <i className="ms-1 bi bi-question-circle"></i>
                                                    </OverlayTrigger>
                                                  </Form.Label>
                                                </Col>
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column m-auto"
                                                >
                                                  <InputGroup className="flex-nowrap">
                                                    <Form.Range
                                                      type="number"
                                                      min="0"
                                                      max="100"
                                                      step="1"
                                                      className="border-end-0 me-2"
                                                      placeholder="Enter 0 - 100"
                                                      name="diagnosticTestSensitivity"
                                                      value={
                                                        form.diagnosticTestSensitivity
                                                      }
                                                      onChange={handleChange}
                                                      onWheel={(e) =>
                                                        e.target.blur()
                                                      }
                                                      required={[
                                                        "ScreenDiagnosticTestTreat",
                                                      ].includes(form.scenario)}
                                                    />
                                                    <span className="text-nowrap">
                                                      {
                                                        form.diagnosticTestSensitivity
                                                      }{" "}
                                                      %
                                                    </span>
                                                  </InputGroup>
                                                </Col>
                                              </Form.Group>
                                            </Row>
                                            <Row>
                                              <Form.Group
                                                as={Row}
                                                controlId="diagnosticTestSpecificity"
                                              >
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column"
                                                >
                                                  <Form.Label
                                                    column
                                                    sm={12}
                                                    className=""
                                                  >
                                                    <span>
                                                      {t(
                                                        "runScenario.triageTestSpecificity"
                                                      )}
                                                    </span>
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="screeningTestSpecificity-help">
                                                          {t(
                                                            "general.enterValue0t100HelpText"
                                                          )}{" "}
                                                        </Tooltip>
                                                      }
                                                    >
                                                      <i className="ms-1 bi bi-question-circle"></i>
                                                    </OverlayTrigger>
                                                  </Form.Label>
                                                </Col>
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column m-auto"
                                                >
                                                  <InputGroup className="flex-nowrap">
                                                    <Form.Range
                                                      type="number"
                                                      min="0"
                                                      max="100"
                                                      step="1"
                                                      className="border-end-0 me-2"
                                                      placeholder="Enter 0 - 100"
                                                      name="diagnosticTestSpecificity"
                                                      value={
                                                        form.diagnosticTestSpecificity
                                                      }
                                                      onChange={handleChange}
                                                      onWheel={(e) =>
                                                        e.target.blur()
                                                      }
                                                      required={[
                                                        "ScreenDiagnosticTestTreat",
                                                      ].includes(form.scenario)}
                                                    />
                                                    <span className="text-nowrap">
                                                      {
                                                        form.diagnosticTestSpecificity
                                                      }{" "}
                                                      %
                                                    </span>
                                                  </InputGroup>
                                                </Col>
                                              </Form.Group>
                                            </Row>
                                          </div>
                                        </div>

                                        <div
                                          className={
                                            checkedValues.length === 3 &&
                                            checkedValues.includes(
                                              "ScreenTriageDiagnosticTestTreat"
                                            )
                                              ? "d-block"
                                              : "d-none"
                                          }
                                        >
                                          <div className="ps-3">
                                            <Row>
                                              <Form.Group
                                                as={Row}
                                                controlId="percentDiagnosticTriaged"
                                              >
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column"
                                                >
                                                  <Form.Label column sm={12}>
                                                    <span>
                                                      {t(
                                                        "runScenario.percentScreeningPositiveWithTriage"
                                                      )}
                                                    </span>

                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="percentDiagnosticTriaged-help">
                                                          {t(
                                                            "general.enterValue0t100HelpText"
                                                          )}
                                                        </Tooltip>
                                                      }
                                                    >
                                                      <i className="ms-1 bi bi-question-circle"></i>
                                                    </OverlayTrigger>
                                                  </Form.Label>
                                                </Col>
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column m-auto"
                                                >
                                                  <InputGroup className="flex-nowrap">
                                                    <Form.Range
                                                      type="number"
                                                      min="0"
                                                      max="100"
                                                      step="1"
                                                      className="border-end-0 me-2"
                                                      placeholder="Enter 0 - 100"
                                                      name="percentDiagnosticTriaged"
                                                      value={
                                                        form.percentDiagnosticTriaged
                                                      }
                                                      onChange={handleChange}
                                                      onWheel={(e) =>
                                                        e.target.blur()
                                                      }
                                                      required={[
                                                        "ScreenDiagnosticTestTreat",
                                                        "ScreenTriageDiagnosticTestTreat",
                                                      ].includes(form.scenario)}
                                                    />
                                                    <span className="text-nowrap">
                                                      {
                                                        form.percentDiagnosticTriaged
                                                      }{" "}
                                                      %
                                                    </span>
                                                  </InputGroup>
                                                </Col>
                                              </Form.Group>
                                            </Row>
                                            <Row>
                                              <Form.Group
                                                as={Row}
                                                controlId="triageTest"
                                              >
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column"
                                                >
                                                  <Form.Label column sm={12}>
                                                    <span>
                                                      {" "}
                                                      {t(
                                                        "runScenario.triageTestChosen"
                                                      )}
                                                    </span>
                                                  </Form.Label>
                                                </Col>
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column m-auto"
                                                >
                                                  <Form.Select
                                                    name="triageTest"
                                                    value={form.triageTest}
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required={[
                                                      "ScreenDiagnosticTestTreat",
                                                      "ScreenTriageDiagnosticTestTreat",
                                                    ].includes(form.scenario)}
                                                  >
                                                    <option value="" hidden>
                                                      {t(
                                                        "runScenario.selectTest"
                                                      )}
                                                    </option>
                                                    {triageTests.map((m) => (
                                                      <option
                                                        key={m.value}
                                                        value={m.value}
                                                      >
                                                        {t(m.label)}
                                                      </option>
                                                    ))}
                                                  </Form.Select>
                                                </Col>
                                              </Form.Group>
                                            </Row>
                                            <Row>
                                              <Form.Group
                                                as={Row}
                                                controlId="triageTestSensitivity"
                                              >
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column"
                                                >
                                                  <Form.Label
                                                    column
                                                    sm={12}
                                                    className=""
                                                  >
                                                    <span>
                                                      {t(
                                                        "runScenario.triageTestSensitivity"
                                                      )}
                                                    </span>
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="screeningTestSpecificity-help">
                                                          {t(
                                                            "general.enterValue0t100HelpText"
                                                          )}
                                                        </Tooltip>
                                                      }
                                                    >
                                                      <i className="ms-1 bi bi-question-circle"></i>
                                                    </OverlayTrigger>
                                                  </Form.Label>
                                                </Col>
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column m-auto"
                                                >
                                                  <InputGroup className="flex-nowrap">
                                                    <Form.Range
                                                      type="number"
                                                      min="0"
                                                      max="100"
                                                      step="1"
                                                      className="border-end-0 me-2"
                                                      placeholder="Enter 0 - 100"
                                                      name="triageTestSensitivity"
                                                      value={
                                                        form.triageTestSensitivity
                                                      }
                                                      onChange={handleChange}
                                                      onWheel={(e) =>
                                                        e.target.blur()
                                                      }
                                                      required={[
                                                        "ScreenDiagnosticTestTreat",
                                                        "ScreenTriageDiagnosticTestTreat",
                                                      ].includes(form.scenario)}
                                                    />
                                                    <span className="text-nowrap">
                                                      {
                                                        form.triageTestSensitivity
                                                      }{" "}
                                                      %
                                                    </span>
                                                  </InputGroup>
                                                </Col>
                                              </Form.Group>
                                            </Row>
                                            <Row>
                                              <Form.Group
                                                as={Row}
                                                controlId="triageTestSpecificity"
                                              >
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column"
                                                >
                                                  <Form.Label
                                                    column
                                                    sm={12}
                                                    className=""
                                                  >
                                                    <span>
                                                      {t(
                                                        "runScenario.triageTestSpecificity"
                                                      )}
                                                    </span>
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="screeningTestSpecificity-help">
                                                          {t(
                                                            "general.enterValue0t100HelpText"
                                                          )}{" "}
                                                        </Tooltip>
                                                      }
                                                    >
                                                      <i className="ms-1 bi bi-question-circle"></i>
                                                    </OverlayTrigger>
                                                  </Form.Label>
                                                </Col>
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column m-auto"
                                                >
                                                  <InputGroup className="flex-nowrap">
                                                    <Form.Range
                                                      type="number"
                                                      min="0"
                                                      max="100"
                                                      step="1"
                                                      className="border-end-0 me-2"
                                                      placeholder="Enter 0 - 100"
                                                      name="triageTestSpecificity"
                                                      value={
                                                        form.triageTestSpecificity
                                                      }
                                                      onChange={handleChange}
                                                      onWheel={(e) =>
                                                        e.target.blur()
                                                      }
                                                      required={[
                                                        "ScreenDiagnosticTestTreat",
                                                        "ScreenTriageDiagnosticTestTreat",
                                                      ].includes(form.scenario)}
                                                    />
                                                    <span className="text-nowrap">
                                                      {
                                                        form.triageTestSpecificity
                                                      }{" "}
                                                      %
                                                    </span>
                                                  </InputGroup>
                                                </Col>
                                              </Form.Group>
                                            </Row>
                                          </div>
                                        </div>

                                        <div
                                          className={
                                            checkedValues.length === 4
                                              ? "d-block"
                                              : "d-none"
                                          }
                                        >
                                          <div className="ps-3">
                                            <div>
                                              <Row>
                                                <Form.Group
                                                  as={Row}
                                                  controlId="percentDiagnosticTriaged"
                                                >
                                                  <Col
                                                    lg={6}
                                                    md={12}
                                                    sm={12}
                                                    xs={12}
                                                    className="d-flex flex-column"
                                                  >
                                                    <Form.Label column sm={12}>
                                                      <span>
                                                        {t(
                                                          "runScenario.percentScreeningPositiveWithTriage"
                                                        )}
                                                      </span>
                                                      <OverlayTrigger
                                                        overlay={
                                                          <Tooltip id="percentTriaged-help">
                                                            {t(
                                                              "general.enterValue0t100HelpText"
                                                            )}
                                                          </Tooltip>
                                                        }
                                                      >
                                                        <i className="ms-1 bi bi-question-circle"></i>
                                                      </OverlayTrigger>
                                                    </Form.Label>
                                                  </Col>
                                                  <Col
                                                    lg={6}
                                                    md={12}
                                                    sm={12}
                                                    xs={12}
                                                    className="d-flex flex-column m-auto"
                                                  >
                                                    <InputGroup className="flex-nowrap">
                                                      <Form.Range
                                                        min="0"
                                                        max="100"
                                                        step="1"
                                                        className="border-end-0 me-2"
                                                        placeholder="Enter 0 - 100"
                                                        name="percentDiagnosticTriaged"
                                                        value={
                                                          form.percentDiagnosticTriaged
                                                        }
                                                        onChange={handleChange}
                                                        onWheel={(e) =>
                                                          e.target.blur()
                                                        }
                                                        required={[
                                                          "ScreenTriageDiagnosticTestTreat",
                                                        ].includes(
                                                          form.scenario
                                                        )}
                                                      />
                                                      <span className="text-nowrap">
                                                        {
                                                          form.percentDiagnosticTriaged
                                                        }{" "}
                                                        %
                                                      </span>
                                                    </InputGroup>
                                                  </Col>
                                                </Form.Group>
                                              </Row>
                                            </div>

                                            <Row>
                                              <Form.Group
                                                as={Row}
                                                controlId="triageTest"
                                              >
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column"
                                                >
                                                  <Form.Label column sm={12}>
                                                    <span>
                                                      {" "}
                                                      {t(
                                                        "runScenario.triageTestChosen"
                                                      )}
                                                    </span>
                                                  </Form.Label>
                                                </Col>
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column m-auto"
                                                >
                                                  <Form.Select
                                                    name="triageTest"
                                                    value={form.triageTest}
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required={[
                                                      "ScreenDiagnosticTestTreat",
                                                      "ScreenTriageDiagnosticTestTreat",
                                                    ].includes(form.scenario)}
                                                  >
                                                    <option value="" hidden>
                                                      {t(
                                                        "runScenario.selectTest"
                                                      )}
                                                    </option>
                                                    {triageTests.map((m) => (
                                                      <option
                                                        key={m.value}
                                                        value={m.value}
                                                      >
                                                        {t(m.label)}
                                                      </option>
                                                    ))}
                                                  </Form.Select>
                                                </Col>
                                              </Form.Group>
                                            </Row>
                                            <Row>
                                              <Form.Group
                                                as={Row}
                                                controlId="triageTestSensitivity"
                                              >
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column"
                                                >
                                                  <Form.Label
                                                    column
                                                    sm={12}
                                                    className=""
                                                  >
                                                    <span>
                                                      {t(
                                                        "runScenario.triageTestSensitivity"
                                                      )}
                                                    </span>
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="screeningTestSpecificity-help">
                                                          {t(
                                                            "general.enterValue0t100HelpText"
                                                          )}
                                                        </Tooltip>
                                                      }
                                                    >
                                                      <i className="ms-1 bi bi-question-circle"></i>
                                                    </OverlayTrigger>
                                                  </Form.Label>
                                                </Col>
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column m-auto"
                                                >
                                                  <InputGroup className="flex-nowrap">
                                                    <Form.Range
                                                      type="number"
                                                      min="0"
                                                      max="100"
                                                      step="1"
                                                      className="border-end-0 me-2"
                                                      placeholder="Enter 0 - 100"
                                                      name="triageTestSensitivity"
                                                      value={
                                                        form.triageTestSensitivity
                                                      }
                                                      onChange={handleChange}
                                                      onWheel={(e) =>
                                                        e.target.blur()
                                                      }
                                                      required={[
                                                        "ScreenDiagnosticTestTreat",
                                                        "ScreenTriageDiagnosticTestTreat",
                                                      ].includes(form.scenario)}
                                                    />
                                                    <span className="text-nowrap">
                                                      {
                                                        form.triageTestSensitivity
                                                      }{" "}
                                                      %
                                                    </span>
                                                  </InputGroup>
                                                </Col>
                                              </Form.Group>
                                            </Row>
                                            <Row>
                                              <Form.Group
                                                as={Row}
                                                controlId="triageTestSpecificity"
                                              >
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column"
                                                >
                                                  <Form.Label
                                                    column
                                                    sm={12}
                                                    className=""
                                                  >
                                                    <span>
                                                      {t(
                                                        "runScenario.triageTestSpecificity"
                                                      )}
                                                    </span>
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="screeningTestSpecificity-help">
                                                          {t(
                                                            "general.enterValue0t100HelpText"
                                                          )}{" "}
                                                        </Tooltip>
                                                      }
                                                    >
                                                      <i className="ms-1 bi bi-question-circle"></i>
                                                    </OverlayTrigger>
                                                  </Form.Label>
                                                </Col>
                                                <Col
                                                  lg={6}
                                                  md={12}
                                                  sm={12}
                                                  xs={12}
                                                  className="d-flex flex-column m-auto"
                                                >
                                                  <InputGroup className="flex-nowrap">
                                                    <Form.Range
                                                      type="number"
                                                      min="0"
                                                      max="100"
                                                      step="1"
                                                      className="border-end-0 me-2"
                                                      placeholder="Enter 0 - 100"
                                                      name="triageTestSpecificity"
                                                      value={
                                                        form.triageTestSpecificity
                                                      }
                                                      onChange={handleChange}
                                                      onWheel={(e) =>
                                                        e.target.blur()
                                                      }
                                                      required={[
                                                        "ScreenDiagnosticTestTreat",
                                                        "ScreenTriageDiagnosticTestTreat",
                                                      ].includes(form.scenario)}
                                                    />
                                                    <span className="text-nowrap">
                                                      {
                                                        form.triageTestSpecificity
                                                      }{" "}
                                                      %
                                                    </span>
                                                  </InputGroup>
                                                </Col>
                                              </Form.Group>
                                            </Row>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {idx === 2 && (
                                      <div className="ps-3">
                                        <div
                                          className={
                                            checkedValues.length === 2
                                              ? "grayed-out"
                                              : "d-none"
                                          }
                                        >
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="percentTriaged"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label column sm={12}>
                                                  <span>
                                                    {t(
                                                      "runScenario.percentofScreenPositivesWithDiagnostic"
                                                    )}
                                                  </span>
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="percentTriaged-help">
                                                        {t(
                                                          "general.enterValue0t100HelpText"
                                                        )}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
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
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
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
                                          </Row>

                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="diagnosticTest"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label column sm={12}>
                                                  <span>
                                                    {" "}
                                                    {t(
                                                      "runScenario.diagnosticTestChosen"
                                                    )}
                                                  </span>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                <Form.Select
                                                  name="diagnosticTest"
                                                  value={form.diagnosticTest}
                                                  onChange={handleChange}
                                                  onWheel={(e) =>
                                                    e.target.blur()
                                                  }
                                                  required={[
                                                    "ScreenDiagnosticTestTreat",
                                                    "ScreenTriageDiagnosticTestTreat",
                                                  ].includes(form.scenario)}
                                                >
                                                  <option value="" hidden>
                                                    {t(
                                                      "runScenario.selectTest"
                                                    )}
                                                  </option>
                                                  {triageTests.map((m) => (
                                                    <option
                                                      key={m.value}
                                                      value={m.value}
                                                    >
                                                      {t(m.label)}
                                                    </option>
                                                  ))}
                                                </Form.Select>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="diagnosticTestSensitivity"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label
                                                  column
                                                  sm={12}
                                                  className=""
                                                >
                                                  <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSensitivity"
                                                    )}
                                                  </span>
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="screeningTestSpecificity-help">
                                                        {t(
                                                          "general.enterValue0t100HelpText"
                                                        )}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                <InputGroup className="flex-nowrap">
                                                  <Form.Range
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    className="border-end-0 me-2"
                                                    placeholder="Enter 0 - 100"
                                                    name="diagnosticTestSensitivity"
                                                    value={
                                                      form.diagnosticTestSensitivity
                                                    }
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required={[
                                                      "ScreenDiagnosticTestTreat",
                                                      "ScreenTriageDiagnosticTestTreat",
                                                    ].includes(form.scenario)}
                                                  />
                                                  <span className="text-nowrap">
                                                    {
                                                      form.diagnosticTestSensitivity
                                                    }{" "}
                                                    %
                                                  </span>
                                                </InputGroup>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="diagnosticTestSpecificity"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label
                                                  column
                                                  sm={12}
                                                  className=""
                                                >
                                                  <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSpecificity"
                                                    )}
                                                  </span>
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="screeningTestSpecificity-help">
                                                        {t(
                                                          "general.enterValue0t100HelpText"
                                                        )}{" "}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                <InputGroup className="flex-nowrap">
                                                  <Form.Range
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    className="border-end-0 me-2"
                                                    placeholder="Enter 0 - 100"
                                                    name="diagnosticTestSpecificity"
                                                    value={
                                                      form.diagnosticTestSpecificity
                                                    }
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required={[
                                                      "ScreenDiagnosticTestTreat",
                                                      "ScreenTriageDiagnosticTestTreat",
                                                    ].includes(form.scenario)}
                                                  />
                                                  <span className="text-nowrap">
                                                    {
                                                      form.diagnosticTestSpecificity
                                                    }{" "}
                                                    %
                                                  </span>
                                                </InputGroup>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                        </div>
                                        <div
                                          className={
                                            checkedValues.length === 3 &&
                                            checkedValues.includes(
                                              "ScreenTriageDiagnosticTestTreat"
                                            )
                                              ? "grayed-out"
                                              : "d-none"
                                          }
                                        >
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="percentTriaged"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label column sm={12}>
                                                  <span>
                                                    {t(
                                                      "runScenario.percentTriagePositiveWithDiagnostic"
                                                    )}
                                                  </span>

                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="percentDiagnosticTriaged-help">
                                                        {t(
                                                          "general.enterValue0t100HelpText"
                                                        )}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                <InputGroup className="flex-nowrap">
                                                  <Form.Range
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    className="border-end-0 me-2"
                                                    placeholder="Enter 0 - 100"
                                                    name="percentTriaged"
                                                    value={form.percentTriaged}
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
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
                                          </Row>

                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="diagnosticTest"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label column sm={12}>
                                                  <span>
                                                    {" "}
                                                    {t(
                                                      "runScenario.percentTriagePositiveWithDiagnostic"
                                                    )}
                                                  </span>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                <Form.Select
                                                  name="diagnosticTest"
                                                  value={form.diagnosticTest}
                                                  onChange={handleChange}
                                                  onWheel={(e) =>
                                                    e.target.blur()
                                                  }
                                                  required={[
                                                    "ScreenDiagnosticTestTreat",
                                                  ].includes(form.scenario)}
                                                >
                                                  <option value="" hidden>
                                                    {t(
                                                      "runScenario.selectTest"
                                                    )}
                                                  </option>
                                                  {diagnosticTests.map((m) => (
                                                    <option
                                                      key={m.value}
                                                      value={m.value}
                                                    >
                                                      {t(m.label)}
                                                    </option>
                                                  ))}
                                                </Form.Select>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="diagnosticTestSensitivity"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label
                                                  column
                                                  sm={12}
                                                  className=""
                                                >
                                                  <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSensitivity"
                                                    )}
                                                  </span>
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="screeningTestSpecificity-help">
                                                        {t(
                                                          "general.enterValue0t100HelpText"
                                                        )}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                <InputGroup className="flex-nowrap">
                                                  <Form.Range
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    className="border-end-0 me-2"
                                                    placeholder="Enter 0 - 100"
                                                    name="diagnosticTestSensitivity"
                                                    value={
                                                      form.diagnosticTestSensitivity
                                                    }
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required={[
                                                      "ScreenDiagnosticTestTreat",
                                                    ].includes(form.scenario)}
                                                  />
                                                  <span className="text-nowrap">
                                                    {
                                                      form.diagnosticTestSensitivity
                                                    }{" "}
                                                    %
                                                  </span>
                                                </InputGroup>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="diagnosticTestSpecificity"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label
                                                  column
                                                  sm={12}
                                                  className=""
                                                >
                                                  <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSpecificity"
                                                    )}
                                                  </span>
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="screeningTestSpecificity-help">
                                                        {t(
                                                          "general.enterValue0t100HelpText"
                                                        )}{" "}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                <InputGroup className="flex-nowrap">
                                                  <Form.Range
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    className="border-end-0 me-2"
                                                    placeholder="Enter 0 - 100"
                                                    name="diagnosticTestSpecificity"
                                                    value={
                                                      form.diagnosticTestSpecificity
                                                    }
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required={[
                                                      "ScreenDiagnosticTestTreat",
                                                    ].includes(form.scenario)}
                                                  />
                                                  <span className="text-nowrap">
                                                    {
                                                      form.diagnosticTestSpecificity
                                                    }{" "}
                                                    %
                                                  </span>
                                                </InputGroup>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                        </div>
                                        <div
                                          className={
                                            checkedValues.length === 3 &&
                                            checkedValues.includes(
                                              "ScreenDiagnosticTestTreat"
                                            )
                                              ? "d-block"
                                              : "d-none"
                                          }
                                        >
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="percentDiagnosticTriaged"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label column sm={12}>
                                                  <span>
                                                    {
                                                      {
                                                        ScreenDiagnosticTestTreat:
                                                          t(
                                                            "runScenario.percentofScreenPositivesWithDiagnostic"
                                                          ),
                                                        ScreenTriageDiagnosticTestTreat:
                                                          t(
                                                            "runScenario.percentTriagePositiveWithDiagnostic"
                                                          ),
                                                      }[form.scenario]
                                                    }
                                                  </span>

                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="percentDiagnosticTriaged-help">
                                                        {t(
                                                          "general.enterValue0t100HelpText"
                                                        )}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                <InputGroup className="flex-nowrap">
                                                  <Form.Range
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    className="border-end-0 me-2"
                                                    placeholder="Enter 0 - 100"
                                                    name="percentDiagnosticTriaged"
                                                    value={
                                                      form.percentDiagnosticTriaged
                                                    }
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required={[
                                                      "ScreenDiagnosticTestTreat",
                                                      "ScreenTriageDiagnosticTestTreat",
                                                    ].includes(form.scenario)}
                                                  />
                                                  <span className="text-nowrap">
                                                    {
                                                      form.percentDiagnosticTriaged
                                                    }{" "}
                                                    %
                                                  </span>
                                                </InputGroup>
                                              </Col>
                                            </Form.Group>
                                          </Row>

                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="triageTest"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label column sm={12}>
                                                  <span>
                                                    {" "}
                                                    {t(
                                                      "runScenario.diagnosticTestChosen"
                                                    )}
                                                  </span>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                <Form.Select
                                                  name="triageTest"
                                                  value={form.triageTest}
                                                  onChange={handleChange}
                                                  onWheel={(e) =>
                                                    e.target.blur()
                                                  }
                                                  required={[
                                                    "ScreenDiagnosticTestTreat",
                                                    "ScreenTriageDiagnosticTestTreat",
                                                  ].includes(form.scenario)}
                                                >
                                                  <option value="" hidden>
                                                    {t(
                                                      "runScenario.selectTest"
                                                    )}
                                                  </option>
                                                  {triageTests.map((m) => (
                                                    <option
                                                      key={m.value}
                                                      value={m.value}
                                                    >
                                                      {t(m.label)}
                                                    </option>
                                                  ))}
                                                </Form.Select>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="triageTestSensitivity"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label
                                                  column
                                                  sm={12}
                                                  className=""
                                                >
                                                  <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSensitivity"
                                                    )}
                                                  </span>
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="screeningTestSpecificity-help">
                                                        {t(
                                                          "general.enterValue0t100HelpText"
                                                        )}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                <InputGroup className="flex-nowrap">
                                                  <Form.Range
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    className="border-end-0 me-2"
                                                    placeholder="Enter 0 - 100"
                                                    name="triageTestSensitivity"
                                                    value={
                                                      form.triageTestSensitivity
                                                    }
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required={[
                                                      "ScreenDiagnosticTestTreat",
                                                      "ScreenTriageDiagnosticTestTreat",
                                                    ].includes(form.scenario)}
                                                  />
                                                  <span className="text-nowrap">
                                                    {form.triageTestSensitivity}{" "}
                                                    %
                                                  </span>
                                                </InputGroup>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="triageTestSpecificity"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label
                                                  column
                                                  sm={12}
                                                  className=""
                                                >
                                                  <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSpecificity"
                                                    )}
                                                  </span>
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="screeningTestSpecificity-help">
                                                        {t(
                                                          "general.enterValue0t100HelpText"
                                                        )}{" "}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                <InputGroup className="flex-nowrap">
                                                  <Form.Range
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    className="border-end-0 me-2"
                                                    placeholder="Enter 0 - 100"
                                                    name="triageTestSpecificity"
                                                    value={
                                                      form.triageTestSpecificity
                                                    }
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required={[
                                                      "ScreenDiagnosticTestTreat",
                                                      "ScreenTriageDiagnosticTestTreat",
                                                    ].includes(form.scenario)}
                                                  />
                                                  <span className="text-nowrap">
                                                    {form.triageTestSpecificity}{" "}
                                                    %
                                                  </span>
                                                </InputGroup>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                        </div>
                                        <div
                                          className={
                                            checkedValues.length === 4
                                              ? "d-block"
                                              : "d-none"
                                          }
                                        >
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="percentTriaged"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label column sm={12}>
                                                  <span>
                                                    {
                                                      {
                                                        ScreenDiagnosticTestTreat:
                                                          t(
                                                            "runScenario.percentofScreenPositivesWithDiagnostic"
                                                          ),
                                                        ScreenTriageDiagnosticTestTreat:
                                                          t(
                                                            "runScenario.percentTriagePositiveWithDiagnostic"
                                                          ),
                                                      }[form.scenario]
                                                    }
                                                  </span>

                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="percentDiagnosticTriaged-help">
                                                        {t(
                                                          "general.enterValue0t100HelpText"
                                                        )}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                <InputGroup className="flex-nowrap">
                                                  <Form.Range
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    className="border-end-0 me-2"
                                                    placeholder="Enter 0 - 100"
                                                    name="percentTriaged"
                                                    value={form.percentTriaged}
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
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
                                          </Row>
                                          <Row>
                                            {" "}
                                            <Form.Group
                                              as={Row}
                                              controlId="diagnosticTest"
                                            >
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                {" "}
                                                <Form.Label column sm={12}>
                                                  <span>
                                                    {" "}
                                                    {t(
                                                      "runScenario.diagnosticTestChosen"
                                                    )}
                                                  </span>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                {" "}
                                                <Form.Select
                                                  name="diagnosticTest"
                                                  value={form.diagnosticTest}
                                                  onChange={handleChange}
                                                  onWheel={(e) =>
                                                    e.target.blur()
                                                  }
                                                  required={[
                                                    "ScreenTriageDiagnosticTestTreat",
                                                  ].includes(form.scenario)}
                                                >
                                                  <option value="" hidden>
                                                    {t(
                                                      "runScenario.selectTest"
                                                    )}
                                                  </option>
                                                  {diagnosticTests.map((m) => (
                                                    <option
                                                      key={m.value}
                                                      value={m.value}
                                                    >
                                                      {t(m.label)}
                                                    </option>
                                                  ))}
                                                </Form.Select>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="diagnosticTestSensitivity"
                                            >
                                              {" "}
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label
                                                  column
                                                  sm={12}
                                                  className=""
                                                >
                                                  <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSensitivity"
                                                    )}
                                                  </span>
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="diagnosticTestSensitivity-help">
                                                        {t(
                                                          "general.enterValue0t100HelpText"
                                                        )}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                <InputGroup className="flex-nowrap">
                                                  <Form.Range
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    className="border-end-0 me-2"
                                                    placeholder="Enter 0 - 100"
                                                    name="diagnosticTestSensitivity"
                                                    value={
                                                      form.diagnosticTestSensitivity
                                                    }
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required={[
                                                      "ScreenTriageDiagnosticTestTreat",
                                                    ].includes(form.scenario)}
                                                  />
                                                  <span className="text-nowrap">
                                                    {
                                                      form.diagnosticTestSensitivity
                                                    }{" "}
                                                    %
                                                  </span>
                                                </InputGroup>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                          <Row>
                                            <Form.Group
                                              as={Row}
                                              controlId="diagnosticTestSpecificity"
                                            >
                                              {" "}
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column"
                                              >
                                                <Form.Label
                                                  column
                                                  sm={12}
                                                  className=""
                                                >
                                                  <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSpecificity"
                                                    )}
                                                  </span>
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="diagnosticTestSpecificity-help">
                                                        {t(
                                                          "general.enterValue0t100HelpText"
                                                        )}
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="ms-1 bi bi-question-circle"></i>
                                                  </OverlayTrigger>
                                                </Form.Label>
                                              </Col>
                                              <Col
                                                lg={6}
                                                md={12}
                                                sm={12}
                                                xs={12}
                                                className="d-flex flex-column m-auto"
                                              >
                                                <InputGroup className="flex-nowrap">
                                                  <Form.Range
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    className="border-end-0 me-2"
                                                    placeholder="Enter 0 - 100"
                                                    name="diagnosticTestSpecificity"
                                                    value={
                                                      form.diagnosticTestSpecificity
                                                    }
                                                    onChange={handleChange}
                                                    onWheel={(e) =>
                                                      e.target.blur()
                                                    }
                                                    required={[
                                                      "ScreenTriageDiagnosticTestTreat",
                                                    ].includes(form.scenario)}
                                                  />
                                                  <span className="text-nowrap">
                                                    {
                                                      form.diagnosticTestSpecificity
                                                    }{" "}
                                                    %
                                                  </span>
                                                </InputGroup>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                        </div>
                                      </div>
                                    )}
                                    {idx === 3 && (
                                      <div className="ps-3">
                                        <Row>
                                          <Form.Group
                                            as={Row}
                                            controlId="percentTreated"
                                          >
                                            <Col
                                              lg={6}
                                              md={12}
                                              sm={12}
                                              xs={12}
                                              className="d-flex flex-column"
                                            >
                                              <Form.Label column sm={12}>
                                                <span>
                                                  {
                                                    {
                                                      ScreenTreat: t(
                                                        "runScenario.ScreenTreat"
                                                      ),
                                                      ScreenDiagnosticTestTreat:
                                                        t(
                                                          "runScenario.ScreenDiagnosticTestTreat"
                                                        ),
                                                      ScreenTriageDiagnosticTestTreat:
                                                        t(
                                                          "runScenario.percentDiagnosticPositiveTreated"
                                                        ),
                                                    }[form.scenario]
                                                  }
                                                </span>
                                                <OverlayTrigger
                                                  overlay={
                                                    <Tooltip id="percentDiagnosticTriaged-help">
                                                      {t(
                                                        "general.enterValue0t100HelpText"
                                                      )}
                                                    </Tooltip>
                                                  }
                                                >
                                                  <i className="ms-1 bi bi-question-circle"></i>
                                                </OverlayTrigger>
                                              </Form.Label>
                                            </Col>
                                            <Col
                                              lg={6}
                                              md={12}
                                              sm={12}
                                              xs={12}
                                              className="d-flex flex-column m-auto"
                                            >
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
                                                  onWheel={(e) =>
                                                    e.target.blur()
                                                  }
                                                  required
                                                />
                                                <span className="text-nowrap">
                                                  {form.percentTreated} %
                                                </span>
                                              </InputGroup>
                                            </Col>
                                          </Form.Group>
                                        </Row>
                                      </div>
                                    )}
                                  </Col>
                                </Row>
                              </div>
                            )}
                          </Col>
                        </div>
                      ))}
                    </Row>
                  </div>
                </div>

                <Form.Group className="mb-4 mt-2 text-end">
                  <Button
                    type="reset"
                    className="shadow reset-button"
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
