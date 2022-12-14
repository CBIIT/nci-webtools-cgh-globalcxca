import { useState } from "react";
import { useRecoilValue } from "recoil";
import { Link, Navigate } from "react-router-dom";
import { saveAs } from "file-saver";
import Card from "react-bootstrap/Card";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { paramsState, resultsState } from "./state";
import { localeState } from "../../app.state";
import { scenarios, screeningTests, triageTests, diagnosticTests } from "../../services/models";
import { getTimestamp } from "../../services/file-utils";
import { exportPdf } from "../../services/pdf-utils";
import { asLabel, asPercent } from "../../services/formatters";

export default function ScenarioResults() {
  const params = useRecoilValue(paramsState);
  const results = useRecoilValue(resultsState);
  const [activeTab, setActiveTab] = useState("results");
  const locale = useRecoilValue(localeState);

  function saveScenario() {
    const filename = `${params.scenario} ${getTimestamp()}.scenario`;
    const type = "text/plain;charset=utf-8";
    const contents = JSON.stringify(params);
    saveAs(new Blob([contents]), filename, { type });
  }

  async function exportResults() {
    const filename = `${params.scenario} ${getTimestamp()}.pdf`;
    const nodes = Array.from(document.querySelectorAll("[data-export]"));
    exportPdf(filename, nodes);
  }

  if (!params || !results) {
    return <Navigate to="/run-scenario" />;
  }

  return (
    <div className="bg-light py-4">
      <Container>
        <Card className="mb-4">
          <Card.Header>
            <Card.Title data-export>{asLabel(params.scenario, scenarios)}</Card.Title>
            <Card.Text className="small text-muted">Scenario Assumptions</Card.Text>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col lg={6}>
                <Table hover responsive data-export>
                  <thead>
                    <tr className="bg-grey">
                      <th>Epidemiological Context</th>
                      {/* Placeholder th simplifies pdf export (consistent row lengths) */}
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Number of people in target population for cervical screening</th>
                      <td className="text-end text-nowrap">{params.populationSize?.toLocaleString(locale) ?? "N/A"}</td>
                    </tr>
                    <tr>
                      <th>Prevalence of CIN2/3 in population for cervical screening</th>
                      <td className="text-end text-nowrap">{asPercent(params.cinPrevalence, 0) ?? "N/A"}</td>
                    </tr>
                  </tbody>
                </Table>

                <Table hover responsive data-export>
                  <thead>
                    <tr className="bg-grey">
                      <th>Participation in Health Services</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Interval of cervical screening in years</th>
                      <td className="text-end text-nowrap">{params.screeningInterval?.toLocaleString(locale) ?? "N/A"}</td>
                    </tr>
                    <tr>
                      <th>Percent screening coverage</th>
                      <td className="text-end text-nowrap">{asPercent(params.percentScreened, 0) ?? "N/A"}</td>
                    </tr>
                    {["ScreenTriageDiagnosticTestTreat"].includes(params.scenario) && (
                      <tr>
                        <th>Percent of screen positives with triage test</th>
                        <td className="text-end text-nowrap">{asPercent(params.percentTriaged, 0) ?? "N/A"}</td>
                      </tr>
                    )}
                    {["ScreenDiagnosticTestTreat", "ScreenTriageDiagnosticTestTreat"].includes(params.scenario) && (
                      <tr>
                        <th>
                          {
                            {
                              ScreenDiagnosticTestTreat: "Percent of screen positives with triage/diagnostic test",
                              ScreenTriageDiagnosticTestTreat: "Percent of triage positives with diagnostic test",
                            }[params.scenario]
                          }
                        </th>
                        <td className="text-end text-nowrap">{asPercent(params.percentDiagnosticTriaged, 0) ?? "N/A"}</td>
                      </tr>
                    )}
                    <tr>
                      <th>
                        {
                          {
                            ScreenTreat: "Percent of screen positives treated",
                            ScreenDiagnosticTestTreat: "Percent of triage/diagnostic test positives treated",
                            ScreenTriageDiagnosticTestTreat: "Percent of diagnostic test positives treated",
                          }[params.scenario]
                        }
                      </th>
                      <td className="text-end text-nowrap">{asPercent(params.percentTreated, 0) ?? "N/A"}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col lg={6}>
                <Table hover responsive data-export>
                  <thead>
                    <tr className="bg-grey">
                      <th>Screening and Treatment Characteristics</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.screeningTest && (
                      <>
                        <tr className="table-light">
                          <th>Cervical screening test chosen</th>
                          <td className="text-end text-nowrap">{asLabel(params.screeningTest, screeningTests) ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th className="ps-3">Screening test sensitivity for CIN2/3 (NIC2/3)</th>
                          <td className="text-end text-nowrap">{asPercent(params.screeningTestSensitivity, 0) ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th className="ps-3">Screening test specificity for CIN2/3 (NIC2/3)</th>
                          <td className="text-end text-nowrap">{asPercent(params.screeningTestSpecificity, 0) ?? "N/A"}</td>
                        </tr>
                      </>
                    )}

                    {params.triageTest && (
                      <>
                        <tr className="table-light">
                          <th>Triage or diagnostic test chosen</th>
                          <td className="text-end text-nowrap">{asLabel(params.triageTest, triageTests) ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th className="ps-3">Triage or diagnostic test sensitivity for CIN2/3 (NIC2/3)</th>
                          <td className="text-end text-nowrap">{asPercent(params.triageTestSensitivity, 0) ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th className="ps-3">Triage or diagnostic test specificity for CIN2/3 (NIC2/3)</th>
                          <td className="text-end text-nowrap">{asPercent(params.triageTestSpecificity, 0) ?? "N/A"}</td>
                        </tr>
                      </>
                    )}

                    {params.diagnosticTest && (
                      <>
                        <tr className="table-light">
                          <th>Diagnostic test chosen</th>
                          <td className="text-end text-nowrap">{asLabel(params.diagnosticTest, diagnosticTests) ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th className="ps-3">Diagnostic test sensitivity for CIN2/3 (NIC2/3)</th>
                          <td className="text-end text-nowrap">{asPercent(params.diagnosticTestSensitivity, 0) ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th className="ps-3">Diagnostic test specificity for CIN2/3 (NIC2/3)</th>
                          <td className="text-end text-nowrap">{asPercent(params.diagnosticTestSpecificity, 0) ?? "N/A"}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* pdf page break */}
        <hr className="d-none" data-export />

        <Tab.Container id="results-tabs" activeKey={activeTab} onSelect={setActiveTab}>
          <Card className="mb-4">
            <Card.Header>
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link eventKey="results">Results</Nav.Link>
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
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-info">
                        <th>Population without precancer targeted for screening</th>
                        <td className="text-end text-nowrap">{results.healthyWomenTargetedForScreening?.toLocaleString(locale) ?? "N/A"}</td>
                      </tr>
                      <tr className="table-info">
                        <th>Population with precancer targeted for screening</th>
                        <td className="text-end text-nowrap">{results.precancersTargetedForScreening?.toLocaleString(locale) ?? "N/A"}</td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive data-export>
                    <thead>
                      <tr className="bg-warning text-light">
                        <th>Impact on Cervical Precancer and Impact on the Population Targeted for Screening</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-warning">
                        <th>Percent precancers treated</th>
                        <td className="text-end text-nowrap">{asPercent(results.percentPrecancersTreated) ?? "N/A"}</td>
                      </tr>
                      <tr className="table-warning">
                        <th>Percent of population targeted for screening without precancer and possibly over-treated</th>
                        <td className="text-end text-nowrap">{asPercent(results.percentHealthyOvertreated) ?? "N/A"}</td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive data-export>
                    <thead>
                      <tr className="bg-danger text-light">
                        <th>Missed Precancers</th>
                        <th></th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-danger">
                        <th>Total precancers missed (% of all precancers)</th>
                        <td className="text-end text-nowrap">{asPercent(results.percentPrecancersMissed) ?? "N/A"}</td>
                        <td className="text-end text-nowrap">{results.numberPrecancersMissed?.toLocaleString(locale) ?? "N/A"}</td>
                      </tr>
                      <tr className="table-danger">
                        <th>Sources of missed precancers (% missed precancers)</th>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr className="table-light">
                        <th className="ps-3">Did not have screening test</th>
                        <td className="text-end text-nowrap">{asPercent(results.percentMissedDueToNoScreening) ?? "N/A"}</td>
                        <td className="text-end text-nowrap">{results.numberMissedDueToNoScreening?.toLocaleString(locale) ?? "N/A"}</td>
                      </tr>
                      <tr className="table-light">
                        <th className="ps-3">Sensitivity of screening test</th>
                        <td className="text-end text-nowrap">{asPercent(results.percentMissedDueToSensitivityOfScreeningTest) ?? "N/A"}</td>
                        <td className="text-end text-nowrap">{results.numberMissedDueToSensitivityOfScreeningTest?.toLocaleString(locale) ?? "N/A"}</td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">Loss at triage/diagnostic test</th>
                        <td className="text-end text-nowrap">{asPercent(results.percentMissedDueToLossAtTriage) ?? "N/A"}</td>
                        <td className="text-end text-nowrap">{results.numberMissedDueToLossAtTriage?.toLocaleString(locale) ?? "N/A"}</td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">Sensitivity of triage/diagnostic test</th>
                        <td className="text-end text-nowrap">{asPercent(results.percentMissedDueToSensitivityOfTriageTest) ?? "N/A"}</td>
                        <td className="text-end text-nowrap">{results.numberMissedDueToSensitivityOfTriageTest?.toLocaleString(locale) ?? "N/A"}</td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">Loss at diagnosis</th>
                        <td className="text-end text-nowrap">{asPercent(results.percentMissedDueToLossAtDiagnosticTriage) ?? "N/A"}</td>
                        <td className="text-end text-nowrap">{results.numberMissedDueToLossAtDiagnosticTriage?.toLocaleString(locale) ?? "N/A"}</td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">Sensitivity of diagnostic test</th>
                        <td className="text-end text-nowrap">{asPercent(results.percentMissedDueToSensitivityOfDiagnosticTriageTest) ?? "N/A"}</td>
                        <td className="text-end text-nowrap">{results.numberMissedDueToSensitivityOfDiagnosticTriageTest?.toLocaleString(locale) ?? "N/A"}</td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">Loss at treatment</th>
                        <td className="text-end text-nowrap">{asPercent(results.percentMissedDueToLossAtTreatment) ?? "N/A"}</td>
                        <td className="text-end text-nowrap">{results.numberMissedDueToLossAtTreatment?.toLocaleString(locale) ?? "N/A"}</td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive data-export>
                    <thead>
                      <tr className="bg-success text-light">
                        <th>Annual Impact on Resources</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-light">
                        <th>Total requiring screening test</th>
                        <td className="text-end text-nowrap">{results.totalNeededToScreen?.toLocaleString(locale) ?? "N/A"}</td>
                      </tr>
                      <tr className="table-light">
                        <th>Total requiring triage/diagnostic test</th>
                        <td className="text-end text-nowrap">{results.totalNeededToTriage?.toLocaleString(locale) ?? "N/A"}</td>
                      </tr>
                      <tr className="table-light">
                        <th>Total requiring diagnostic test</th>
                        <td className="text-end text-nowrap">{results.totalNeededToDiagnosticTriage?.toLocaleString(locale) ?? "N/A"}</td>
                      </tr>
                      <tr className="table-light">
                        <th>Total requiring treatment</th>
                        <td className="text-end text-nowrap">{results.totalNeededToTreat?.toLocaleString(locale) ?? "N/A"}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>

        <div className="text-center">
          <Link className="btn btn-outline-primary text-decoration-none m-1" to="/run-scenario">
            Back to Scenario
          </Link>
          <Button onClick={saveScenario} className="m-1" variant="primary">
            Save Scenario
          </Button>
          <Button onClick={exportResults} className="m-1" variant="primary">
            Export Results to PDF
          </Button>
        </div>
      </Container>
    </div>
  );
}
