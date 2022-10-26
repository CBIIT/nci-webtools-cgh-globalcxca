import { useRecoilValue } from "recoil";
import { Link, Navigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { formState, resultsState } from "./state";
import Card from "react-bootstrap/Card";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { scenarios, asLabel, asPercent, screeningTests, triageTests, diagnosticTests } from "./models";

export default function ScenarioResults() {
  const form = useRecoilValue(formState);
  const results = useRecoilValue(resultsState);

  function saveScenario() {
    const scenario = new Blob([JSON.stringify(form)], {type: "text/plain;charset=utf-8"});
    saveAs(scenario, `${form.scenario}.scenario`);
  }

  if (!form || !results) {
    return <Navigate to="/run-scenario" />;
  }

  return (
    <div className="bg-light py-4">
      <Container>
        <Card className="mb-4">
          <Card.Header>
            <Card.Title>Scenario: {asLabel(form.scenario, scenarios)}</Card.Title>
            <Card.Text className="small text-muted">User Parameters</Card.Text>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col lg={6}>
                <Table hover responsive>
                  <thead className="bg-info text-light">
                    <tr>
                      <th colSpan={2}>Epidemiological Context</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Target population size of screen-eligible women</th>
                      <td className="text-end">{form.populationSize}</td>
                    </tr>
                    <tr>
                      <th>Prevalence of carcinogenic HPV infection</th>
                      <td className="text-end">{form.hpvCancerPrevalence}</td>
                    </tr>
                    <tr>
                      <th>Prevalence of HPV16/18</th>
                      <td className="text-end">{form.hpvPrevalence}</td>
                    </tr>
                    <tr>
                      <th>Prevalence of CIN2 or worse</th>
                      <td className="text-end">{form.cinPrevalence}</td>
                    </tr>
                  </tbody>
                </Table>

                <Table hover responsive>
                  <thead className="bg-info text-light">
                    <tr>
                      <th colSpan={2}>Participation in Health Services</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Screening interval</th>
                      <td className="text-end">{form.screeningInterval}</td>
                    </tr>
                    <tr>
                      <th>Percent screening coverage</th>
                      <td className="text-end">{asPercent(form.percentScreened)}</td>
                    </tr>
                    <tr>
                      <th>Percent of screen positives with triage test</th>
                      <td className="text-end">{asPercent(form.percentTriaged)}</td>
                    </tr>
                    <tr>
                      <th>Percent of triage test positives with diagnostic test</th>
                      <td className="text-end">{asPercent(form.percentDiagnosticTriaged)}</td>
                    </tr>
                    <tr>
                      <th>Percent of diagnostic test positives treated</th>
                      <td className="text-end">{asPercent(form.percentTreated)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col lg={6}>
                <Table hover responsive>
                  <thead className="bg-info text-light">
                    <tr>
                      <th colSpan={2}>Screening and Treatment Characteristics</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="table-info">
                      <th>Screening test chosen</th>
                      <td className="text-end">{asLabel(form.screeningTest, screeningTests)}</td>
                    </tr>
                    <tr>
                      <th className="ps-3">Screening test sensitivity for CIN2/3</th>
                      <td className="text-end">{form.screeningTestSensitivity}</td>
                    </tr>
                    <tr>
                      <th className="ps-3">Screening test specificity for CIN2/3</th>
                      <td className="text-end">{form.screeningTestSpecificity}</td>
                    </tr>

                    <tr className="table-info">
                      <th>Triage or diagnostic test chosen</th>
                      <td className="text-end">{asLabel(form.triageTest, triageTests)}</td>
                    </tr>
                    <tr>
                      <th className="ps-3">Triage or diagnostic test sensitivity for CIN2/3</th>
                      <td className="text-end">{form.triageTestSensitivity}</td>
                    </tr>
                    <tr>
                      <th className="ps-3">Triage or diagnostic test specificity for CIN2/3</th>
                      <td className="text-end">{form.triageTestSpecificity}</td>
                    </tr>

                    <tr className="table-info">
                      <th>Diagnostic test chosen</th>
                      <td className="text-end">{asLabel(form.diagnosticTest, diagnosticTests)}</td>
                    </tr>
                    <tr>
                      <th className="ps-3">Diagnostic test sensitivity for CIN2/3</th>
                      <td className="text-end">{form.diagnosticTestSensitivity}</td>
                    </tr>
                    <tr>
                      <th className="ps-3">Diagnostic test specificity for CIN2/3</th>
                      <td className="text-end">{form.diagnosticTestSpecificity}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Tab.Container id="results-tabs" defaultActiveKey="results">
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
                <Tab.Pane eventKey="results">
                  <Table hover responsive>
                    <thead className="bg-info text-light">
                      <tr>
                        <th colSpan={2}>Target</th>
                      </tr>
                    </thead>
                    <tbody className="table-info">
                      <tr>
                        <th>Healthy women targeted for screening</th>
                        <td className="text-end">{results.healthyWomenTargetedForScreening}</td>
                      </tr>
                      <tr>
                        <th>Precancers targeted for screening</th>
                        <td className="text-end">{results.precancersTargetedForScreening}</td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive>
                    <thead className="bg-warning text-light">
                      <tr>
                        <th colSpan={2}>IMPACT on Disease</th>
                      </tr>
                    </thead>
                    <tbody className="table-warning">
                      <tr>
                        <th>Percent precancers treated</th>
                        <td className="text-end">{results.percentPrecancersTreated}%</td>
                      </tr>
                      <tr>
                        <th>Percent healthy over-treated</th>
                        <td className="text-end">{results.percentHealthyOvertreated}%</td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive>
                    <thead className="bg-warning text-light">
                      <tr>
                        <th colSpan={3}>Sources of missed PRECANCERS</th>
                      </tr>
                    </thead>
                    <tbody className="table-warning">
                      <tr>
                        <th>Missed due to no screening</th>
                        <td className="text-end">{results.percentMissedDueToNoScreening}%</td>
                        <td className="text-end">{results.numberMissedDueToNoScreening}</td>
                      </tr>
                      <tr>
                        <th>Missed due to sensitivity of screening test</th>
                        <td className="text-end">{results.percentMissedDueToSensitivityOfScreeningTest}%</td>
                        <td className="text-end">{results.numberMissedDueToSensitivityOfScreeningTest}</td>
                      </tr>

                      <tr>
                        <th>Missed due to loss at triage</th>
                        <td className="text-end">{results.percentMissedDueToLossAtTriage}%</td>
                        <td className="text-end">{results.numberMissedDueToLossAtTriage}</td>
                      </tr>

                      <tr>
                        <th>Missed due to sensitivity of triage test</th>
                        <td className="text-end">{results.percentMissedDueToSensitivityOfTriageTest}%</td>
                        <td className="text-end">{results.numberMissedDueToSensitivityOfTriageTest}</td>
                      </tr>

                      <tr>
                        <th>Missed due to loss at diagnosis</th>
                        <td className="text-end">{results.percentMissedDueToLossAtDiagnosticTriage}%</td>
                        <td className="text-end">{results.numberMissedDueToLossAtDiagnosticTriage}</td>
                      </tr>

                      <tr>
                        <th>Missed due to sensitivity of diagnostic test</th>
                        <td className="text-end">{results.percentMissedDueToSensitivityOfDiagnosticTriageTest}%</td>
                        <td className="text-end">{results.numberMissedDueToSensitivityOfDiagnosticTriageTest}</td>
                      </tr>

                      <tr>
                        <th>Missed due to loss at treatment</th>
                        <td className="text-end">{results.percentMissedDueToLossAtTreatment}%</td>
                        <td className="text-end">{results.numberMissedDueToLossAtTreatment}</td>
                      </tr>

                      <tr>
                        <th>Pre-cancers missed</th>
                        <td className="text-end">{results.percentPrecancersMissed}%</td>
                        <td className="text-end">{results.numberPrecancersMissed}</td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive>
                    <thead className="bg-warning text-light">
                      <tr>
                        <th colSpan={2}>IMPACT on Resources</th>
                      </tr>
                    </thead>
                    <tbody className="table-warning">
                      <tr>
                        <th>Total needed to screen</th>
                        <td className="text-end">{results.totalNeededToScreen}</td>
                      </tr>
                      <tr>
                        <th>Total needed to triage</th>
                        <td className="text-end">{results.totalNeededToTriage}</td>
                      </tr>
                      <tr>
                        <th>Total needed to diagnose</th>
                        <td className="text-end">{results.totalNeededToDiagnosticTriage}</td>
                      </tr>
                      <tr>
                        <th>Total needed to treat</th>
                        <td className="text-end">{results.totalNeededToTreat}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Tab.Pane>
                <Tab.Pane eventKey="summary">
                  <Table hover responsive>
                    <thead>
                      <tr className="bg-info text-light">
                        <th>Assumptions</th>
                        <th className="text-end">{asLabel(form.scenario, scenarios)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th>Target population size of screen-eligible women</th>
                        <td className="text-end">{form.populationSize}</td>
                      </tr>
                      <tr>
                        <th>Prevalence of carcinogenic HPV infection</th>
                        <td className="text-end">{form.hpvCancerPrevalence}</td>
                      </tr>
                      <tr>
                        <th>Prevalence of HPV16/18</th>
                        <td className="text-end">{form.hpvPrevalence}</td>
                      </tr>
                      <tr>
                        <th>Prevalence of CIN2 or worse</th>
                        <td className="text-end">{form.cinPrevalence}</td>
                      </tr>

                      <tr className="table-info">
                        <th>Screening test chosen</th>
                        <td className="text-end">{asLabel(form.screeningTest, screeningTests)}</td>
                      </tr>
                      <tr>
                        <th className="ps-3">Screening coverage</th>
                        <td className="text-end">{asPercent(form.percentScreened)}</td>
                      </tr>
                      <tr>
                        <th className="ps-3">Screening test sensitivity for CIN2/3</th>
                        <td className="text-end">{asPercent(form.screeningTestSensitivity)}</td>
                      </tr>
                      <tr>
                        <th className="ps-3">Screening test specificity for CIN2/3</th>
                        <td className="text-end">{asPercent(form.screeningTestSpecificity)}</td>
                      </tr>

                      <tr className="table-info">
                        <th>Triage or diagnostic test chosen</th>
                        <td className="text-end">{asLabel(form.triageTest, triageTests)}</td>
                      </tr>
                      <tr>
                        <th className="ps-3">Triage or diagnostic test attendance</th>
                        <td className="text-end">{asPercent(form.percentTriaged)}</td>
                      </tr>
                      <tr>
                        <th className="ps-3">Triage or diagnostic test sensitivity for CIN2/3</th>
                        <td className="text-end">{asPercent(form.triageTestSensitivity)}</td>
                      </tr>
                      <tr>
                        <th className="ps-3">Triage or diagnostic test specificity for CIN2/3</th>
                        <td className="text-end">{asPercent(form.triageTestSpecificity)}</td>
                      </tr>

                      <tr className="table-info">
                        <th>Diagnostic test chosen</th>
                        <td className="text-end">{asLabel(form.diagnosticTest, diagnosticTests)}</td>
                      </tr>
                      <tr>
                        <th className="ps-3">Diagnostic test attendance</th>
                        <td className="text-end">{asPercent(form.percentDiagnosticTriaged)}</td>
                      </tr>
                      <tr>
                        <th className="ps-3">Diagnostic test sensitivity for CIN2/3</th>
                        <td className="text-end">{asPercent(form.diagnosticTestSensitivity)}</td>
                      </tr>
                      <tr>
                        <th className="ps-3">Diagnostic test specificity for CIN2/3</th>
                        <td className="text-end">{asPercent(form.diagnosticTestSpecificity)}</td>
                      </tr>

                      <tr className="table-info">
                        <th>Treatment attendance</th>
                        <td className="text-end">{asPercent(form.percentTreated)}</td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive>
                    <thead>
                      <tr className="bg-danger text-light">
                        <th>Annual Impact</th>
                        <th className="text-end">{asLabel(form.scenario, scenarios)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-danger">
                        <th>Pre-cancers treated</th>
                        <td className="text-end">{results.percentPrecancersTreated}%</td>
                      </tr>
                      <tr className="table-danger">
                        <th>Pre-cancers missed</th>
                        <td className="text-end">{results.percentPrecancersMissed}%</td>
                      </tr>

                      <tr>
                        <th className="ps-3">Missed due to no screening</th>
                        <td className="text-end">{results.percentMissedDueToNoScreening}%</td>
                      </tr>
                      <tr>
                        <th className="ps-3">Missed due to sensitivity of screening test</th>
                        <td className="text-end">{results.percentMissedDueToSensitivityOfScreeningTest}%</td>
                      </tr>

                      <tr>
                        <th className="ps-3">Missed due to loss at triage</th>
                        <td className="text-end">{results.percentMissedDueToLossAtTriage}%</td>
                      </tr>

                      <tr>
                        <th className="ps-3">Missed due to sensitivity of triage test</th>
                        <td className="text-end">{results.percentMissedDueToSensitivityOfTriageTest}%</td>
                      </tr>

                      <tr>
                        <th className="ps-3">Missed due to loss at diagnosis</th>
                        <td className="text-end">{results.percentMissedDueToLossAtDiagnosticTriage}%</td>
                      </tr>

                      <tr>
                        <th className="ps-3">Missed due to sensitivity of diagnostic test</th>
                        <td className="text-end">{results.percentMissedDueToSensitivityOfDiagnosticTriageTest}%</td>
                      </tr>

                      <tr>
                        <th className="ps-3">Missed due to loss at treatment</th>
                        <td className="text-end">{results.percentMissedDueToLossAtTreatment}%</td>
                      </tr>

                      <tr className="bg-light">
                        <th>Percent healthy over-treated</th>
                        <td className="text-end">{results.percentHealthyOvertreated}%</td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive>
                    <thead>
                      <tr className="bg-success text-light">
                        <th colSpan={2}>Annual Resource Requirements</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th>Total needed to screen</th>
                        <td className="text-end">{results.totalNeededToScreen}</td>
                      </tr>
                      <tr>
                        <th>Total needed to triage</th>
                        <td className="text-end">{results.totalNeededToTriage}</td>
                      </tr>
                      <tr>
                        <th>Total needed to diagnose</th>
                        <td className="text-end">{results.totalNeededToDiagnosticTriage}</td>
                      </tr>
                      <tr>
                        <th>Total needed to treat</th>
                        <td className="text-end">{results.totalNeededToTreat}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>

        <div className="text-center">
          <Link className="btn btn-outline-primary text-decoration-none" to="/run-scenario">
            Back to Scenario
          </Link>
          <Button onClick={saveScenario} className="ms-2" variant="primary">Save Scenario</Button>
        </div>
      </Container>
    </div>
  );
}
