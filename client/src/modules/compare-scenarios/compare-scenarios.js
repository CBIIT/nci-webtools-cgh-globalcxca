import { useRecoilState } from "recoil";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import { scenariosState } from "./state";
import { readFile } from "./utils";

export default function CompareScenarios() {
  const [scenarios, setScenarios] = useRecoilState(scenariosState);

  async function addScenario(event) {
    const files = event.target.files;

    if (files.length > 0) {
      try {
        const file = files[0];
        let scenario = JSON.parse(await readFile(file));
        scenario.name = file.name;
        setScenarios((scenarios) => [...scenarios, scenario]);
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
                  <input id="fileInput" type="file" onChange={addScenario} hidden />
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Form>
      </Container>
    </div>
  );
}
