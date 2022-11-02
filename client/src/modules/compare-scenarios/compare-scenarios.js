import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import Table from "react-bootstrap/Table";
import Tab from "react-bootstrap/Tab";
import { scenariosState } from "./state";
import { getTimestamp, readFile } from "../../services/file-utils";
import { asLabel, asPercent } from "../../services/formatters";
import { screeningTests, triageTests, diagnosticTests, runModel } from "../../services/models";
import { exportPdf } from "../../services/pdf-utils";
import { localeState } from "../../app.state";

export default function CompareScenarios() {
  const [scenarios, setScenarios] = useRecoilState(scenariosState);
  const [activeTab, setActiveTab] = useState("results");
  const locale = useRecoilValue(localeState);
  const limit = 10;

  async function addScenario(event) {
    const maxFiles = limit - scenarios.length;
    const files = [...event.target.files].slice(0, maxFiles);

    if (files.length > 0) {
      try {
        for (const file of files) {
          let scenario = JSON.parse(await readFile(file));
          scenario.name = file.name.replace(/.scenario$/i, "");
          scenario.results = runModel(scenario);
          console.log(scenario);
          setScenarios((scenarios) => [...scenarios, scenario]);
        }
      } catch (error) {
        console.error(error);
      }
    }

    event.target.value = "";
  }

  function renameScenario(index, name) {
    console.log({ index, name });
    setScenarios((scenarios) => {
      let newScenarios = scenarios.map((s) => ({ ...s }));
      newScenarios[index].name = name;
      return newScenarios;
    });
  }

  function removeScenario(index) {
    setScenarios((scenarios) => scenarios.filter((_, i) => i !== index));
  }

  async function exportResults() {
    // allow google translate time to translate each tab
    const defaultTab = activeTab;
    if (activeTab === "results") {
      setActiveTab("summary");
    } else if (activeTab === "summary") {
      setActiveTab("results");
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    setActiveTab(defaultTab);

    const filename = `ScenarioComparison_${getTimestamp()}.pdf`;
    const nodes = Array.from(document.querySelectorAll("[data-export]"));
    exportPdf(filename, nodes, {
      pageSize: {
        width: 400 + 200 * scenarios.length,
        height: 800,
      },
    });
  }

  return (
    <div className="bg-light py-4">
      <Container>
        <Form>
          <Card className="mb-4">
            <Card.Header>
              <Card.Title>Compare Scenarios</Card.Title>
              <Card.Text className="small text-muted">Upload up to {limit} scenarios for comparison.</Card.Text>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush hover striped">
                {scenarios.map((scenario, index) => (
                  <ListGroup.Item key={index}>
                    <Form.Group as={Row} controlId="populationSize">
                      <Form.Label column md={2}>
                        Scenario {index + 1}
                      </Form.Label>
                      <Col md={8}>
                        <Form.Control
                          placeholder="Enter name"
                          className="transparent mb-md-0 mb-2 px-0"
                          value={scenario.name}
                          onChange={(ev) => renameScenario(index, ev.target.value)}
                        />
                      </Col>
                      <Col md={2} className="text-md-end">
                        <Button variant="danger" onClick={(ev) => removeScenario(index)}>
                          Remove
                        </Button>
                      </Col>
                    </Form.Group>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item>
                  <label htmlFor="fileInput" className={["btn btn-outline-primary", scenarios.length >= limit && "disabled"].join(" ")}>
                    Add Scenario
                  </label>
                  <input id="fileInput" type="file" onChange={addScenario} hidden accept=".scenario" multiple />
                  {scenarios.length >= limit && <small className="ms-2">A limit of {limit} scenarios can be compared at one time.</small>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          {scenarios.length > 0 && (
            <>
              <Tab.Container id="results-tabs" activeKey={activeTab} onSelect={setActiveTab}>
                <Card className="mb-4">
                  <Card.Header>
                    <Nav variant="tabs">
                      <Nav.Item>
                        <Nav.Link eventKey="results">Results</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="summary">Summary</Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Card.Header>
                  <Card.Body>
                    <Tab.Content>
                      <Tab.Pane eventKey="results" mountOnEnter={false} unmountOnExit={false}>
                        <Table hover responsive data-export>
                          <thead>
                            <tr className="bg-info text-light">
                              <th>Annual Targets</th>
                              {scenarios.map((scenario, index) => (
                                <th key={index} className="text-end text-nowrap">
                                  {scenario.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="table-info">
                              <th>Population without precancer targeted for screening</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {results.healthyWomenTargetedForScreening?.toLocaleString(locale) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-info">
                              <th>Population with precancer targeted for screening</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {results.precancersTargetedForScreening?.toLocaleString(locale) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </Table>
                        <Table hover responsive data-export>
                          <thead>
                            <tr className="bg-warning text-light">
                              <th>Impact on Disease and Screening Population</th>
                              {scenarios.map((scenario, index) => (
                                <th key={index} className="text-end text-nowrap">
                                  {scenario.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="table-warning">
                              <th>Percent precancers treated</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(results.percentPrecancersTreated) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-warning">
                              <th>Percent of population targeted for screening without precancer and possibly over-treated</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(results.percentHealthyOvertreated) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </Table>

                        <Table hover responsive data-export>
                          <thead>
                            <tr className="bg-warning text-light">
                              <th>MISSED PRECANCERS</th>
                              {scenarios.map((scenario, index) => (
                                <th key={index} className="text-end text-nowrap">
                                  {scenario.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="table-warning">
                              <th>Total precancers missed (% of all precancers)</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index} title={results.numberPrecancersMissed?.toLocaleString(locale)}>
                                  {asPercent(results.percentPrecancersMissed) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-warning">
                              <th>Sources of missed precancers (% missed precancers)</th>
                              {scenarios.map(({ results }, index) => (
                                <td key={index}></td>
                              ))}
                            </tr>

                            <tr className="table-warning">
                              <th className="ps-3">No screening</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index} title={results.numberMissedDueToNoScreening?.toLocaleString(locale)}>
                                  {asPercent(results.percentMissedDueToNoScreening) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-warning">
                              <th className="ps-3">Sensitivity of screening test</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index} title={results.numberMissedDueToSensitivityOfScreeningTest?.toLocaleString(locale)}>
                                  {asPercent(results.percentMissedDueToSensitivityOfScreeningTest) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-warning">
                              <th className="ps-3">Loss at triage/diagnostic test</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index} title={results.numberMissedDueToLossAtTriage?.toLocaleString(locale)}>
                                  {asPercent(results.percentMissedDueToLossAtTriage) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-warning">
                              <th className="ps-3">Sensitivity of triage/diagnostic test</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index} title={results.numberMissedDueToSensitivityOfTriageTest?.toLocaleString(locale)}>
                                  {asPercent(results.percentMissedDueToSensitivityOfTriageTest) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-warning">
                              <th className="ps-3">Loss at diagnosis</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index} title={results.numberMissedDueToLossAtDiagnosticTriage?.toLocaleString(locale)}>
                                  {asPercent(results.percentMissedDueToLossAtDiagnosticTriage) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-warning">
                              <th className="ps-3">Sensitivity of diagnostic test</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index} title={results.numberMissedDueToSensitivityOfDiagnosticTriageTest?.toLocaleString(locale)}>
                                  {asPercent(results.percentMissedDueToSensitivityOfDiagnosticTriageTest) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-warning">
                              <th className="ps-3">Loss at treatment</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index} title={results.numberMissedDueToLossAtTreatment?.toLocaleString(locale)}>
                                  {asPercent(results.percentMissedDueToLossAtTreatment) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </Table>

                        <Table hover responsive data-export>
                          <thead>
                            <tr className="bg-warning text-light">
                              <th>Impact on Resources</th>
                              {scenarios.map((scenario, index) => (
                                <th key={index} className="text-end text-nowrap">
                                  {scenario.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="table-warning">
                              <th>Total needed to screen</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {results.totalNeededToScreen?.toLocaleString(locale) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-warning">
                              <th>Total needed to triage</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {results.totalNeededToTriage?.toLocaleString(locale) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-warning">
                              <th>Total needed to diagnose</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {results.totalNeededToDiagnosticTriage?.toLocaleString(locale) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-warning">
                              <th>Total needed to treat</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {results.totalNeededToTreat?.toLocaleString(locale) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </Table>
                        <hr className="d-none" data-export />
                      </Tab.Pane>
                      <Tab.Pane eventKey="summary" mountOnEnter={false} unmountOnExit={false}>
                        <Table hover responsive data-export>
                          <thead>
                            <tr className="bg-info text-light">
                              <th>Assumptions</th>
                              {scenarios.map((scenario, index) => (
                                <th key={index} className="text-end text-nowrap">
                                  {scenario.name} <br />
                                  {asLabel(scenario.scenario, scenarios)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th>Number of people in target population for cervical screening</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {params.populationSize?.toLocaleString(locale) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th>Prevalence of CIN2/3 in population for cervical screening</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(params.cinPrevalence) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-info">
                              <th>Cervical screening test chosen</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asLabel(params.screeningTest, screeningTests) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">Screening coverage</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(params.percentScreened) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">Screening test sensitivity for CIN2/3</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(params.screeningTestSensitivity) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">Screening test specificity for CIN2/3</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(params.screeningTestSpecificity) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-info">
                              <th>Triage or diagnostic test chosen</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asLabel(params.triageTest, triageTests) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">Triage or diagnostic test attendance</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(params.percentTriaged) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">Triage or diagnostic test sensitivity for CIN2/3</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(params.triageTestSensitivity) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">Triage or diagnostic test specificity for CIN2/3</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(params.triageTestSpecificity) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-info">
                              <th>Diagnostic test chosen</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asLabel(params.diagnosticTest, diagnosticTests) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">Diagnostic test attendance</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(params.percentDiagnosticTriaged) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">Diagnostic test sensitivity for CIN2/3</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(params.diagnosticTestSensitivity) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">Diagnostic test specificity for CIN2/3</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(params.diagnosticTestSpecificity) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-info">
                              <th>Treatment attendance</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(params.percentTreated) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </Table>

                        <Table hover responsive data-export>
                          <thead>
                            <tr className="bg-danger text-light">
                              <th>Annual Impact</th>
                              {scenarios.map((scenario, index) => (
                                <th key={index} className="text-end text-nowrap">
                                  {scenario.name} <br />
                                  {asLabel(scenario.scenario, scenarios)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="table-danger">
                              <th>Pre-cancers treated</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(params.percentTreated) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-danger">
                              <th>Pre-cancers missed</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(results.percentPrecancersMissed) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr>
                              <th className="ps-3">Missed due to no screening</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(results.percentMissedDueToNoScreening) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">Missed due to sensitivity of screening test</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(results.percentMissedDueToSensitivityOfScreeningTest) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr>
                              <th className="ps-3">Missed due to Loss at triage/diagnostic test</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(results.percentMissedDueToLossAtTriage) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr>
                              <th className="ps-3">Missed due to Sensitivity of triage/diagnostic test</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(results.percentMissedDueToSensitivityOfTriageTest) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr>
                              <th className="ps-3">Missed due to loss at diagnosis</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(results.percentMissedDueToLossAtDiagnosticTriage) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr>
                              <th className="ps-3">Missed due to sensitivity of diagnostic test</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(results.percentMissedDueToSensitivityOfDiagnosticTriageTest) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr>
                              <th className="ps-3">Missed due to loss at treatment</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(results.percentMissedDueToLossAtTreatment) ?? "N/A"}
                                </td>
                              ))}
                            </tr>

                            <tr className="bg-light">
                              <th>Percent healthy over-treated</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {asPercent(results.percentHealthyOvertreated) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </Table>

                        <Table hover responsive data-export>
                          <thead>
                            <tr className="bg-success text-light">
                              <th>Annual Resource Requirements</th>
                              {scenarios.map((scenario, index) => (
                                <th key={index} className="text-end text-nowrap">
                                  {scenario.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th>Total needed to screen</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {results.totalNeededToScreen?.toLocaleString(locale) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th>Total needed to triage</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {results.totalNeededToTriage?.toLocaleString(locale) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th>Total needed to diagnose</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {results.totalNeededToDiagnosticTriage?.toLocaleString(locale) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th>Total needed to treat</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end text-nowrap" key={index}>
                                  {results.totalNeededToTreat?.toLocaleString(locale) ?? "N/A"}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </Table>
                      </Tab.Pane>
                    </Tab.Content>
                  </Card.Body>
                </Card>
              </Tab.Container>
              <div className="text-center">
                <Button onClick={exportResults} className="ms-2" variant="primary">
                  Export Results
                </Button>
              </div>
            </>
          )}
        </Form>
      </Container>
    </div>
  );
}
