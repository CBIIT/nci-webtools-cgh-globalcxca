import { useRecoilState } from "recoil";
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
import { readFile } from "./utils";
import { asLabel, asPercent, screeningTests, triageTests, diagnosticTests, runModel } from "../run-scenario/models";

export default function CompareScenarios() {
  const [scenarios, setScenarios] = useRecoilState(scenariosState);

  async function addScenario(event) {
    const files = event.target.files;

    if (files.length > 0) {
      try {
        for (const file of files) {
          let scenario = JSON.parse(await readFile(file));
          scenario.name = file.name.replace(/.scenario$/i, "");
          scenario.results = runModel(scenario);
          console.log(scenario);
          setScenarios((scenarios) => [...scenarios, scenario]);
        }
      }
      catch (error) {
        console.error(error);
      }
    }

    event.target.value = "";
  }

  function renameScenario(index, name) {
    console.log({index, name})
    setScenarios((scenarios) => {
      let newScenarios = scenarios.map(s => ({...s}));
      newScenarios[index].name = name;
      return newScenarios;
    });
  }

  function removeScenario(index) {
    setScenarios((scenarios) => scenarios.filter((_, i) => i !== index));
  }

  return (
    <div className="bg-light py-4">
      <Container>
        <Form>
          <Card className="mb-4">
            <Card.Header>
              <Card.Title>Compare Scenarios</Card.Title>
              <Card.Text className="small text-muted">Please upload scenarios for comparison.</Card.Text>
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
                          onChange={ev => renameScenario(index, ev.target.value)}
                        />
                      </Col>
                      <Col md={2} className="text-md-end">
                        <Button variant="danger" onClick={ev => removeScenario(index)}>Remove</Button>                  
                      </Col>
                    </Form.Group>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item >
                  <label htmlFor="fileInput" className="btn btn-outline-primary">
                    Add Scenario
                  </label>
                  <input id="fileInput" type="file" onChange={addScenario} hidden accept=".scenario" multiple />
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          
        {scenarios.length > 0 && <Tab.Container id="results-tabs" defaultActiveKey="results">
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
                        <th>Target</th>
                        {scenarios.map((scenario, index) => <th key={index} className="text-end">{scenario.name}</th>)}
                      </tr>
                    </thead>
                    <tbody className="table-info">
                      <tr>
                        <th>Healthy women targeted for screening</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{results.healthyWomenTargetedForScreening}</td>
                        ))}
                      </tr>
                      <tr>
                        <th>Precancers targeted for screening</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{results.precancersTargetedForScreening}</td>
                        ))}
                      </tr>
                    </tbody>
                  </Table>
                  <Table hover responsive>
                    <thead className="bg-warning text-light">
                      <tr>
                        <th>IMPACT on Disease</th>
                        {scenarios.map((scenario, index) => <th key={index} className="text-end">{scenario.name}</th>)}
                      </tr>
                    </thead>
                    <tbody className="table-warning">
                      <tr>
                        <th>Percent precancers treated</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{asPercent(results.percentPrecancersTreated)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th>Percent healthy over-treated</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{asPercent(results.percentHealthyOvertreated)}</td>
                        ))}
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive>
                    <thead className="bg-warning text-light">
                      <tr>
                        <th>Sources of missed PRECANCERS</th>
                        {scenarios.map((scenario, index) => <th key={index} className="text-end">{scenario.name}</th>)}
                      </tr>
                    </thead>
                    <tbody className="table-warning">
                      <tr>
                        <th>Missed due to no screening</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index} title={results.numberMissedDueToNoScreening}>{asPercent(results.percentMissedDueToNoScreening)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th>Missed due to sensitivity of screening test</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index} title={results.numberMissedDueToSensitivityOfScreeningTest}>{asPercent(results.percentMissedDueToSensitivityOfScreeningTest)} </td>
                        ))}
                      </tr>

                      <tr>
                        <th>Missed due to loss at triage</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index} title={results.numberMissedDueToLossAtTriage}>{asPercent(results.percentMissedDueToLossAtTriage)} </td>
                        ))}
                      </tr>

                      <tr>
                        <th>Missed due to sensitivity of triage test</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index} title={results.numberMissedDueToSensitivityOfTriageTest}>{asPercent(results.percentMissedDueToSensitivityOfTriageTest)} </td>
                        ))}
                      </tr>

                      <tr>
                        <th>Missed due to loss at diagnosis</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index} title={results.numberMissedDueToLossAtDiagnosticTriage}>{asPercent(results.percentMissedDueToLossAtDiagnosticTriage)} </td>
                        ))}
                      </tr>

                      <tr>
                        <th>Missed due to sensitivity of diagnostic test</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index} title={results.numberMissedDueToSensitivityOfDiagnosticTriageTest}>{asPercent(results.percentMissedDueToSensitivityOfDiagnosticTriageTest)} </td>
                        ))}
                      </tr>

                      <tr>
                        <th>Missed due to loss at treatment</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index} title={results.numberMissedDueToLossAtTreatment}>{asPercent(results.percentMissedDueToLossAtTreatment)} </td>
                        ))}
                      </tr>

                      <tr>
                        <th>Pre-cancers missed</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index} title={results.numberPrecancersMissed}>{asPercent(results.percentPrecancersMissed)} </td>
                        ))}
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive>
                    <thead className="bg-warning text-light">
                      <tr>
                        <th>IMPACT on Resources</th>
                        {scenarios.map((scenario, index) => <th key={index} className="text-end">{scenario.name}</th>)}
                      </tr>
                    </thead>
                    <tbody className="table-warning">
                      <tr>
                        <th>Total needed to screen</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{results.totalNeededToScreen}</td>
                        ))}
                      </tr>
                      <tr>
                        <th>Total needed to triage</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{results.totalNeededToTriage}</td>
                        ))}
                      </tr>
                      <tr>
                        <th>Total needed to diagnose</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{results.totalNeededToDiagnosticTriage}</td>
                        ))}
                      </tr>
                      <tr>
                        <th>Total needed to treat</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{results.totalNeededToTreat}</td>
                        ))}
                      </tr>
                    </tbody>
                  </Table>
                </Tab.Pane>
                <Tab.Pane eventKey="summary">
                  <Table hover responsive>
                    <thead>
                      <tr className="bg-info text-light">
                        <th>Assumptions</th>
                        {scenarios.map((scenario, index) => <th key={index} className="text-end">{scenario.name} <br />{asLabel(scenario.scenario, scenarios)}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th>Target population size of screen-eligible women</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{params.populationSize}</td>
                        ))}
                      </tr>
                      <tr>
                        <th>Prevalence of CIN2/3</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{params.cinPrevalence}</td>
                        ))}
                      </tr>

                      <tr className="table-info">
                        <th>Screening test chosen</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{asLabel(params.screeningTest, screeningTests)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th className="ps-3">Screening coverage</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{asPercent(params.percentScreened)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th className="ps-3">Screening test sensitivity for CIN2/3</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{asPercent(params.screeningTestSensitivity)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th className="ps-3">Screening test specificity for CIN2/3</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{asPercent(params.screeningTestSpecificity)}</td>
                        ))}
                      </tr>

                      <tr className="table-info">
                        <th>Triage or diagnostic test chosen</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{asLabel(params.triageTest, triageTests)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th className="ps-3">Triage or diagnostic test attendance</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{asPercent(params.percentTriaged)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th className="ps-3">Triage or diagnostic test sensitivity for CIN2/3</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{asPercent(params.triageTestSensitivity)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th className="ps-3">Triage or diagnostic test specificity for CIN2/3</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{asPercent(params.triageTestSpecificity)}</td>
                        ))}
                      </tr>

                      <tr className="table-info">
                        <th>Diagnostic test chosen</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{asLabel(params.diagnosticTest, diagnosticTests)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th className="ps-3">Diagnostic test attendance</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{asPercent(params.percentDiagnosticTriaged)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th className="ps-3">Diagnostic test sensitivity for CIN2/3</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{asPercent(params.diagnosticTestSensitivity)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th className="ps-3">Diagnostic test specificity for CIN2/3</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{asPercent(params.diagnosticTestSpecificity)}</td>
                        ))}
                      </tr>

                      <tr className="table-info">
                        <th>Treatment attendance</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{asPercent(params.percentTreated)}</td>
                        ))}
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive>
                    <thead>
                      <tr className="bg-danger text-light">
                        <th>Annual Impact</th>
                        {scenarios.map((scenario, index) => <th key={index} className="text-end">{scenario.name} <br />{asLabel(scenario.scenario, scenarios)}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-danger">
                        <th>Pre-cancers treated</th>
                        {scenarios.map((params, index) => (
                          <td className="text-end" key={index}>{asPercent(params.percentTreated)}</td>
                        ))}
                      </tr>
                      <tr className="table-danger">
                        <th>Pre-cancers missed</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{asPercent(results.percentPrecancersMissed)}</td>
                        ))}
                      </tr>

                      <tr>
                        <th className="ps-3">Missed due to no screening</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{asPercent(results.percentMissedDueToNoScreening)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th className="ps-3">Missed due to sensitivity of screening test</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{asPercent(results.percentMissedDueToSensitivityOfScreeningTest)}</td>
                        ))}
                      </tr>

                      <tr>
                        <th className="ps-3">Missed due to loss at triage</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{asPercent(results.percentMissedDueToLossAtTriage)}</td>
                        ))}
                      </tr>

                      <tr>
                        <th className="ps-3">Missed due to sensitivity of triage test</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{asPercent(results.percentMissedDueToSensitivityOfTriageTest)}</td>
                        ))}
                      </tr>

                      <tr>
                        <th className="ps-3">Missed due to loss at diagnosis</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{asPercent(results.percentMissedDueToLossAtDiagnosticTriage)}</td>
                        ))}
                      </tr>

                      <tr>
                        <th className="ps-3">Missed due to sensitivity of diagnostic test</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{asPercent(results.percentMissedDueToSensitivityOfDiagnosticTriageTest)}</td>
                        ))}
                      </tr>

                      <tr>
                        <th className="ps-3">Missed due to loss at treatment</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{asPercent(results.percentMissedDueToLossAtTreatment)}</td>
                        ))}
                      </tr>

                      <tr className="bg-light">
                        <th>Percent healthy over-treated</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{asPercent(results.percentHealthyOvertreated)}</td>
                        ))}
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive>
                    <thead>
                      <tr className="bg-success text-light">
                        <th>Annual Resource Requirements</th>
                        {scenarios.map((scenario, index) => <th key={index} className="text-end">{scenario.name}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th>Total needed to screen</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{results.totalNeededToScreen}</td>
                        ))}
                      </tr>
                      <tr>
                        <th>Total needed to triage</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{results.totalNeededToTriage}</td>
                        ))}
                      </tr>
                      <tr>
                        <th>Total needed to diagnose</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{results.totalNeededToDiagnosticTriage}</td>
                        ))}
                      </tr>
                      <tr>
                        <th>Total needed to treat</th>
                        {scenarios.map(({results}, index) => (
                          <td className="text-end" key={index}>{results.totalNeededToTreat}</td>
                        ))}
                      </tr>
                    </tbody>
                  </Table>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>}
        </Form>
      </Container>
    </div>
  );
}
