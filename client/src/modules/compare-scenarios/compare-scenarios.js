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
import { runModel } from "../../services/models";
import { exportPdf } from "../../services/pdf-utils";
import { localeState } from "../../app.state";
import { useTranslation, Trans } from "react-i18next";

export default function CompareScenarios() {
  const { t } = useTranslation();
  const [scenarios, setScenarios] = useRecoilState(scenariosState);
  const [activeTab, setActiveTab] = useState("results");
  const locale = useRecoilValue(localeState);
  const limit = 10;
  //console.log("scenarios", scenarios);

  let screenTest = [];
  let triageTest = [];
  let diagnosisTest = [];

  for (let index = 0; index < scenarios.length; index++) {
    const params = scenarios[index];
    if (params.screeningTest === "pap") {
      screenTest[index] = t("runScenario.PapTest");
    } else if (params.screeningTest === "ivaa") {
      screenTest[index] = t("runScenario.VIA");
    } else if (params.screeningTest === "hpv") {
      screenTest[index] = t("runScenario.HPV");
    } else if (params.screeningTest === "hpv16or18") {
      screenTest[index] = t("runScenario.HPV1618");
    } else {
      screenTest[index] = t("general.NA");
    }

    if (params.triageTest === "pap") {
      triageTest[index] = t("runScenario.PapTest");
    } else if (params.triageTest === "ivaa") {
      triageTest[index] = t("runScenario.VIA");
    } else if (params.triageTest === "hpv") {
      triageTest[index] = t("runScenario.HPV");
    } else if (params.triageTest === "hpv16or18") {
      triageTest[index] = t("runScenario.HPV1618");
    } else if (params.triageTest === "colposcopicImpression") {
      triageTest[index] = t("runScenario.impressionOfColposcopy");
    } else if (params.triageTest === "colposcopyWithBiopsy") {
      triageTest[index] = t("runScenario.colposcopyWithBiopsy");
    } else {
      triageTest[index] = t("general.NA");
    }

    if (params.diagnosticTest === "pap") {
      diagnosisTest[index] = t("runScenario.PapTest");
    } else if (params.diagnosticTest === "ivaa") {
      diagnosisTest[index] = t("runScenario.VIA");
    } else if (params.diagnosticTest === "hpv") {
      diagnosisTest[index] = t("runScenario.HPV");
    } else if (params.diagnosticTest === "hpv16or18") {
      diagnosisTest[index] = t("runScenario.HPV1618");
    } else if (params.diagnosticTest === "colposcopicImpression") {
      diagnosisTest[index] = t("runScenario.impressionOfColposcopy");
    } else if (params.diagnosticTest === "colposcopyWithBiopsy") {
      diagnosisTest[index] = t("runScenario.colposcopyWithBiopsy");
    } else {
      diagnosisTest[index] = t("general.NA");
    }
  }

  async function addScenario(event) {
    const maxFiles = limit - scenarios.length;
    const files = [...event.target.files].slice(0, maxFiles);

    if (files.length > 0) {
      try {
        for (const file of files) {
          let scenario = JSON.parse(await readFile(file));
          scenario.name = file.name.replace(/.scenario$/i, "");
          scenario.results = runModel(scenario);
          // console.log(scenario);
          setScenarios((scenarios) => [...scenarios, scenario]);
        }
      } catch (error) {
        console.error(error);
      }
    }

    event.target.value = "";
  }

  function renameScenario(index, name) {
    //console.log({ index, name });
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
      setActiveTab("scenarioAssumptions");
    } else if (activeTab === "scenarioAssumptions") {
      setActiveTab("results");
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    setActiveTab(defaultTab);

    const filename = `ScenarioComparison ${getTimestamp()}.pdf`;
    const nodes = Array.from(document.querySelectorAll("[data-export]"));
    const maxWidth = Math.max(...nodes.map((n) => n.offsetWidth));

    exportPdf(filename, nodes, {
      pageSize: {
        width: 400 + maxWidth,
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
              <Card.Title>{t("navbar.compareScenarios")}</Card.Title>
              <Card.Text className="small text-muted">
                {t("compareScenarios.uploadScenariosInfo", { limit })}
              </Card.Text>
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
                          onChange={(ev) =>
                            renameScenario(index, ev.target.value)
                          }
                        />
                      </Col>
                      <Col md={2} className="text-md-end">
                        <Button
                          variant="danger"
                          onClick={(ev) => removeScenario(index)}
                        >
                          Remove
                        </Button>
                      </Col>
                    </Form.Group>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item>
                  <label
                    htmlFor="fileInput"
                    className={[
                      "btn btn-outline-primary",
                      scenarios.length >= limit && "disabled",
                    ].join(" ")}
                  >
                    {t("compareScenarios.addScenario")}
                  </label>
                  <input
                    id="fileInput"
                    type="file"
                    onChange={addScenario}
                    hidden
                    accept=".scenario"
                    multiple
                  />
                  {scenarios.length >= limit && (
                    <small className="ms-2">
                      A limit of {limit} scenarios can be compared at one time.
                    </small>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          {scenarios.length > 0 && (
            <>
              <Tab.Container
                id="results-tabs"
                activeKey={activeTab}
                onSelect={setActiveTab}
              >
                <Card className="mb-4">
                  <Card.Header>
                    <Nav variant="tabs">
                      <Nav.Item>
                        <Nav.Link eventKey="results">
                          {t("general.results")}
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="scenarioAssumptions">
                          {t("general.scenarioAssumption")}
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Card.Header>
                  <Card.Body>
                    <Tab.Content>
                      <Tab.Pane
                        eventKey="results"
                        mountOnEnter={false}
                        unmountOnExit={false}
                      >
                        <Table responsive data-export>
                          <thead>
                            <tr className="bg-info-dark text-light">
                              <th className="table-header bg-info-dark text-light">
                                {t("results.annualTargets")}
                              </th>
                              {scenarios.map((scenario, index) => (
                                <th
                                  key={index}
                                  className="text-end table-header bg-info-dark text-light"
                                  title={scenario.name}
                                >
                                  {scenario.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="table-info">
                              <th>
                                {t(
                                  "results.populationTargetedWithCoverageTitle"
                                )}
                              </th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end" key={index}>
                                  {/* {results.healthyWomenTargetedForScreening?.toLocaleString(
                                    locale
                                  ) ?? "N/A"} */}
                                  {results.populationTargeted !== undefined &&
                                  !isNaN(results.populationTargeted)
                                    ? Math.round(
                                        results.populationTargeted
                                      ).toLocaleString(locale)
                                    : t("general.NA")}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-info">
                              <th className="ps-3">
                                {t(
                                  "results.populationTargetedWithoutPrecancer"
                                )}
                              </th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end" key={index}>
                                  {/* {results.healthyWomenTargetedForScreening?.toLocaleString(
                                    locale
                                  ) ?? "N/A"} */}
                                  {results.testedFalsePositives[0] !==
                                    undefined &&
                                  !isNaN(results.testedFalsePositives[0])
                                    ? Math.round(
                                        results.testedFalsePositives[0]
                                      ).toLocaleString(locale)
                                    : t("general.NA")}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-info">
                              <th className="ps-3">
                                {t("results.populationTargetedWithPrecancer")}
                              </th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end" key={index}>
                                  {/* {results.precancersTargetedForScreening?.toLocaleString(
                                    locale
                                  ) ?? "N/A"} */}
                                  {results.testedTruePositives[0] !==
                                    undefined &&
                                  !isNaN(results.testedTruePositives[0])
                                    ? Math.round(
                                        results.testedTruePositives[0]
                                      ).toLocaleString(locale)
                                    : t("general.NA")}
                                </td>
                              ))}
                            </tr>

                            <tr className="bg-warning-dark text-light">
                              <th className="bg-warning-dark text-light" colSpan={1 + scenarios.length}>
                                {t(
                                  "results.annualImpactOnCervicalPrecancerTitle"
                                )}
                              </th>
                            </tr>
                            <tr className="table-warning">
                              <th >{t("results.percentPrecancersTreated")}</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end" key={index}>
                                  {asPercent(
                                    results.percentPrecancersTreated
                                  ) ?? t("general.NA")}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-warning">
                              <th>
                                {t(
                                  "results.percentPolulationTargetedOverTreated"
                                )}
                              </th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end" key={index}>
                                  {asPercent(
                                    results.percentHealthyOvertreated
                                  ) ?? t("general.NA")}
                                </td>
                              ))}
                            </tr>

                            <tr className="bg-danger-dark text-light">
                              <th className="bg-danger-dark text-light" colSpan={1 + scenarios.length}>
                                {t("results.AnnualMissedPrecancersTitle")}
                              </th>
                            </tr>

                            <tr className="table-danger">
                              <th>{t("results.totalPrecancersMissed")}</th>
                              {scenarios.map(({ results }, index) => (
                                <td
                                  className="text-end"
                                  key={index}
                                  title={results.numberPrecancersMissed?.toLocaleString(
                                    locale
                                  )}
                                >
                                  {asPercent(results.percentPrecancersMissed) ??
                                    t("general.NA")}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-danger">
                              <th>{t("results.sourcesMissedPrecancers")}</th>
                              {scenarios.map(({ results }, index) => (
                                <td key={index}></td>
                              ))}
                            </tr>

                            <tr className="table-light">
                              <th className="ps-3">
                                {t("results.didNotHaveScreeningTest")}
                              </th>
                              {scenarios.map(({ results }, index) => (
                                <td
                                  className="text-end"
                                  key={index}
                                  // title={results.numberMissedDueToNoScreening?.toLocaleString(
                                  //   locale
                                  // )}
                                  title={
                                    results.untestedPositives[1] !==
                                      undefined &&
                                    !isNaN(results.untestedPositives[1])
                                      ? Math.round(
                                          results.untestedPositives[1]
                                        ).toLocaleString(locale)
                                      : t("general.NA")
                                  }
                                >
                                  {/* {asPercent(
                                    results.percentMissedDueToNoScreening
                                  ) ?? "N/A"} */}
                                  {asPercent(results.percentMissed[0]) ??
                                    t("general.NA")}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-light">
                              <th className="ps-3">
                                {/* {t("results.sensitivityOfScreeningTest")} */}
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: t(
                                      "results.sensitivityOfScreeningTest"
                                    ),
                                  }}
                                />
                              </th>
                              {scenarios.map(({ results }, index) => (
                                <td
                                  className="text-end"
                                  key={index}
                                  // title={results.numberMissedDueToSensitivityOfScreeningTest?.toLocaleString(
                                  //   locale
                                  // )}
                                  title={
                                    results.testedFalseNegatives[1] !==
                                      undefined &&
                                    !isNaN(results.testedFalseNegatives[1])
                                      ? Math.round(
                                          results.testedFalseNegatives[1]
                                        ).toLocaleString(locale)
                                      : t("general.NA")
                                  }
                                >
                                  {/* {asPercent(
                                    results.percentMissedDueToSensitivityOfScreeningTest
                                  ) ?? "N/A"} */}
                                  {asPercent(
                                    results.percentMissedDueToSensitivity[0]
                                  ) ?? t("general.NA")}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-light">
                              <th className="ps-3">
                                {t("results.lossAtTriageTest")}
                              </th>
                              {scenarios.map(({ results }, index) => (
                                <td
                                  className="text-end"
                                  key={index}
                                  // title={results.numberMissedDueToLossAtTriage?.toLocaleString(
                                  //   locale
                                  // )}
                                  title={
                                    results.scenario === "ScreenTreat" ||
                                    (results.scenario ===
                                      "ScreenDiagnosticTestTreat" &&
                                      results.checkedValues[2] ===
                                        "ScreenDiagnosticTestTreat")
                                      ? t("general.NA")
                                      : results.scenario ===
                                          "ScreenTriageDiagnosticTestTreat" ||
                                        (results.scenario ===
                                          "ScreenDiagnosticTestTreat" &&
                                          results.checkedValues[2] ===
                                            "ScreenTriageDiagnosticTestTreat")
                                      ? results.untestedPositives[
                                          results.totalNeeded.length - 1 - 1
                                        ] !== undefined &&
                                        !isNaN(
                                          results.untestedPositives[
                                            results.totalNeeded.length - 1 - 1
                                          ]
                                        )
                                        ? Math.round(
                                            results.untestedPositives[
                                              results.totalNeeded.length - 1 - 1
                                            ]
                                          ).toLocaleString(locale)
                                        : t("general.NA")
                                      : results.untestedPositives[
                                          results.totalNeeded.length - 1
                                        ] !== undefined &&
                                        !isNaN(
                                          results.untestedPositives[
                                            results.totalNeeded.length - 1
                                          ]
                                        )
                                      ? Math.round(
                                          results.untestedPositives[
                                            results.totalNeeded.length - 1
                                          ]
                                        ).toLocaleString(locale)
                                      : t("general.NA")
                                  }
                                >
                                  {/* {asPercent(
                                    results.percentMissedDueToLossAtTriage
                                  ) ?? "N/A"} */}
                                  {results.scenario === "ScreenTreat" ||
                                  (results.scenario ===
                                    "ScreenDiagnosticTestTreat" &&
                                    results.checkedValues[2] ===
                                      "ScreenDiagnosticTestTreat")
                                    ? t("general.NA")
                                    : results.scenario ===
                                        "ScreenTriageDiagnosticTestTreat" ||
                                      (results.scenario ===
                                        "ScreenDiagnosticTestTreat" &&
                                        results.checkedValues[2] ===
                                          "ScreenTriageDiagnosticTestTreat")
                                    ? results.percentMissed[
                                        results.totalNeeded.length - 1 - 2
                                      ] !== undefined &&
                                      !isNaN(
                                        results.percentMissed[
                                          results.totalNeeded.length - 1 - 2
                                        ]
                                      )
                                      ? asPercent(
                                          results.percentMissed[
                                            results.totalNeeded.length - 1 - 2
                                          ]
                                        )
                                      : t("general.NA")
                                    : results.percentMissed[
                                        results.totalNeeded.length - 1 - 1
                                      ] !== undefined &&
                                      !isNaN(
                                        results.percentMissed[
                                          results.totalNeeded.length - 1 - 1
                                        ]
                                      )
                                    ? asPercent(
                                        results.percentMissed[
                                          results.totalNeeded.length - 1 - 1
                                        ]
                                      )
                                    : t("general.NA")}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-light">
                              <th className="ps-3">
                                {/* {t("results.sensitivityOfTriageTest")} */}
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: t(
                                      "results.sensitivityOfTriageTest"
                                    ),
                                  }}
                                />
                              </th>
                              {scenarios.map(({ results }, index) => (
                                <td
                                  className="text-end"
                                  key={index}
                                  // title={results.numberMissedDueToSensitivityOfTriageTest?.toLocaleString(
                                  //   locale
                                  // )}
                                  title={
                                    results.scenario === "ScreenTreat" ||
                                    (results.scenario ===
                                      "ScreenDiagnosticTestTreat" &&
                                      results.checkedValues[2] ===
                                        "ScreenDiagnosticTestTreat")
                                      ? t("general.NA")
                                      : results.scenario ===
                                          "ScreenTriageDiagnosticTestTreat" ||
                                        (results.scenario ===
                                          "ScreenDiagnosticTestTreat" &&
                                          results.checkedValues[2] ===
                                            "ScreenTriageDiagnosticTestTreat")
                                      ? results.testedFalseNegatives[
                                          results.totalNeeded.length - 1 - 1
                                        ] !== undefined &&
                                        !isNaN(
                                          results.testedFalseNegatives[
                                            results.totalNeeded.length - 1 - 1
                                          ]
                                        )
                                        ? Math.round(
                                            results.testedFalseNegatives[
                                              results.totalNeeded.length - 1 - 1
                                            ]
                                          ).toLocaleString(locale)
                                        : t("general.NA")
                                      : results.testedFalseNegatives[
                                          results.totalNeeded.length - 1
                                        ] !== undefined &&
                                        !isNaN(
                                          results.testedFalseNegatives[
                                            results.totalNeeded.length - 1
                                          ]
                                        )
                                      ? Math.round(
                                          results.testedFalseNegatives[
                                            results.totalNeeded.length - 1
                                          ]
                                        ).toLocaleString(locale)
                                      : t("general.NA")
                                  }
                                >
                                  {/* {asPercent(
                                    results.percentMissedDueToSensitivityOfTriageTest
                                  ) ?? "N/A"} */}
                                  {results.scenario === "ScreenTreat" ||
                                  (results.scenario ===
                                    "ScreenDiagnosticTestTreat" &&
                                    results.checkedValues[2] ===
                                      "ScreenDiagnosticTestTreat")
                                    ? t("general.NA")
                                    : results.scenario ===
                                        "ScreenTriageDiagnosticTestTreat" ||
                                      (results.scenario ===
                                        "ScreenDiagnosticTestTreat" &&
                                        results.checkedValues[2] ===
                                          "ScreenTriageDiagnosticTestTreat")
                                    ? results.percentMissedDueToSensitivity[
                                        results.totalNeeded.length - 1 - 2
                                      ] !== undefined &&
                                      !isNaN(
                                        results.percentMissedDueToSensitivity[
                                          results.totalNeeded.length - 1 - 2
                                        ]
                                      )
                                      ? asPercent(
                                          results.percentMissedDueToSensitivity[
                                            results.totalNeeded.length - 1 - 2
                                          ]
                                        )
                                      : "NA"
                                    : results.percentMissedDueToSensitivity[
                                        results.totalNeeded.length - 1 - 1
                                      ] !== undefined &&
                                      !isNaN(
                                        results.percentMissedDueToSensitivity[
                                          results.totalNeeded.length - 1 - 1
                                        ]
                                      )
                                    ? asPercent(
                                        results.percentMissedDueToSensitivity[
                                          results.totalNeeded.length - 1 - 1
                                        ]
                                      )
                                    : t("general.NA")}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-light">
                              <th className="ps-3">
                                {t("results.lossAtColposcopy")}
                              </th>
                              {scenarios.map(({ results }, index) => (
                                <td
                                  className="text-end"
                                  key={index}
                                  // title={results.numberMissedDueToLossAtDiagnosticTriage?.toLocaleString(
                                  //   locale
                                  // )}
                                  title={
                                    results.scenario === "ScreenTreat"
                                      ? t("general.NA")
                                      : results.scenario ===
                                          "ScreenTriageDiagnosticTestTreat" ||
                                        (results.scenario ===
                                          "ScreenDiagnosticTestTreat" &&
                                          results.checkedValues[2] ===
                                            "ScreenDiagnosticTestTreat")
                                      ? results.untestedPositives[
                                          results.totalNeeded.length - 1
                                        ] !== undefined &&
                                        !isNaN(
                                          results.untestedPositives[
                                            results.totalNeeded.length - 1
                                          ]
                                        )
                                        ? Math.round(
                                            results.untestedPositives[
                                              results.totalNeeded.length - 1
                                            ]
                                          ).toLocaleString(locale)
                                        : t("general.NA")
                                      : t("general.NA")
                                  }
                                >
                                  {/* {asPercent(
                                    results.percentMissedDueToLossAtDiagnosticTriage
                                  ) ?? "N/A"} */}
                                  {results.scenario === "ScreenTreat"
                                    ? t("general.NA")
                                    : results.scenario ===
                                        "ScreenTriageDiagnosticTestTreat" ||
                                      (results.scenario ===
                                        "ScreenDiagnosticTestTreat" &&
                                        results.checkedValues[2] ===
                                          "ScreenDiagnosticTestTreat")
                                    ? results.percentMissed[
                                        results.totalNeeded.length - 1 - 1
                                      ] !== undefined &&
                                      !isNaN(
                                        results.percentMissed[
                                          results.totalNeeded.length - 1 - 1
                                        ]
                                      )
                                      ? asPercent(
                                          results.percentMissed[
                                            results.totalNeeded.length - 1 - 1
                                          ]
                                        )
                                      : t("general.NA")
                                    : t("general.NA")}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-light">
                              <th className="ps-3">
                                {/* {t("results.sensitivityOfDiagnosticTest")} */}
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: t(
                                      "results.sensitivityOfColposcopy"
                                    ),
                                  }}
                                />
                              </th>
                              {scenarios.map(({ results }, index) => (
                                <td
                                  className="text-end"
                                  key={index}
                                  // title={results.numberMissedDueToSensitivityOfDiagnosticTriageTest?.toLocaleString(
                                  //   locale
                                  // )}
                                  title={
                                    results.scenario === "ScreenTreat"
                                      ? t("general.NA")
                                      : results.scenario ===
                                          "ScreenTriageDiagnosticTestTreat" ||
                                        (results.scenario ===
                                          "ScreenDiagnosticTestTreat" &&
                                          results.checkedValues[2] ===
                                            "ScreenDiagnosticTestTreat")
                                      ? results.testedFalseNegatives[
                                          results.totalNeeded.length - 1
                                        ] !== undefined &&
                                        !isNaN(
                                          results.testedFalseNegatives[
                                            results.totalNeeded.length - 1
                                          ]
                                        )
                                        ? Math.round(
                                            results.testedFalseNegatives[
                                              results.totalNeeded.length - 1
                                            ]
                                          ).toLocaleString(locale)
                                        : t("general.NA")
                                      : t("general.NA")
                                  }
                                >
                                  {/* {asPercent(
                                    results.percentMissedDueToSensitivityOfDiagnosticTriageTest
                                  ) ?? "N/A"} */}
                                  {results.scenario === "ScreenTreat"
                                    ? t("general.NA")
                                    : results.scenario ===
                                        "ScreenTriageDiagnosticTestTreat" ||
                                      (results.scenario ===
                                        "ScreenDiagnosticTestTreat" &&
                                        results.checkedValues[2] ===
                                          "ScreenDiagnosticTestTreat")
                                    ? results.percentMissedDueToSensitivity[
                                        results.totalNeeded.length - 1 - 1
                                      ] !== undefined &&
                                      !isNaN(
                                        results.percentMissedDueToSensitivity[
                                          results.totalNeeded.length - 1 - 1
                                        ]
                                      )
                                      ? asPercent(
                                          results.percentMissedDueToSensitivity[
                                            results.totalNeeded.length - 1 - 1
                                          ]
                                        )
                                      : t("general.NA")
                                    : t("general.NA")}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-light">
                              <th className="ps-3">
                                {t("results.lossAtTreatment")}
                              </th>
                              {scenarios.map(({ results }, index) => (
                                <td
                                  className="text-end"
                                  key={index}
                                  // title={results.numberMissedDueToLossAtTreatment?.toLocaleString(
                                  //   locale
                                  // )}
                                  title={
                                    results.untestedPositives[
                                      results.totalNeeded.length - 1 + 1
                                    ] !== undefined &&
                                    !isNaN(
                                      results.untestedPositives[
                                        results.totalNeeded.length - 1 + 1
                                      ]
                                    )
                                      ? Math.round(
                                          results.untestedPositives[
                                            results.totalNeeded.length - 1 + 1
                                          ]
                                        ).toLocaleString(locale)
                                      : t("general.NA")
                                  }
                                >
                                  {/* {asPercent(
                                    results.percentMissedDueToLossAtTreatment
                                  ) ?? "N/A"} */}
                                  {asPercent(
                                    results.percentMissed[
                                      results.totalNeeded.length - 1
                                    ]
                                  ) ?? t("general.NA")}
                                </td>
                              ))}
                            </tr>

                            <tr className="bg-success-dark text-light">
                              <th className="bg-success-dark text-light" colSpan={1 + scenarios.length}>
                                {t("results.AnnualImpactOnResourcesTitle")}
                              </th>
                            </tr>

                            <tr className="table-light">
                              <th>
                                {t("results.totalRequiringScreeningTest")}
                              </th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end" key={index}>
                                  {/* {results.totalNeededToScreen?.toLocaleString(
                                    locale
                                  ) ?? "N/A"} */}
                                  {results.totalNeeded[0] !== undefined &&
                                  !isNaN(results.totalNeeded[0])
                                    ? Math.round(
                                        results.totalNeeded[0]
                                      ).toLocaleString(locale)
                                    : t("general.NA")}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-light">
                              <th>
                                {t(
                                  "results.totalRequiringTriageDiagnosticTest"
                                )}
                              </th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end" key={index}>
                                  {/* {results.totalNeededToTriage?.toLocaleString(
                                    locale
                                  ) ?? "N/A"} */}
                                  {results.scenario === "ScreenTreat"
                                    ? t("general.NA")
                                    : results.scenario ===
                                      "ScreenTriageDiagnosticTestTreat"
                                    ? results.totalNeeded[
                                        results.totalNeeded.length - 1 - 2
                                      ] !== undefined &&
                                      !isNaN(
                                        results.totalNeeded[
                                          results.totalNeeded.length - 1 - 2
                                        ]
                                      )
                                      ? Math.round(
                                          results.totalNeeded[
                                            results.totalNeeded.length - 1 - 2
                                          ]
                                        ).toLocaleString(locale)
                                      : t("general.NA")
                                    : results.totalNeeded[
                                        results.totalNeeded.length - 1 - 1
                                      ] !== undefined &&
                                      !isNaN(
                                        results.totalNeeded[
                                          results.totalNeeded.length - 1 - 1
                                        ]
                                      )
                                    ? Math.round(
                                        results.totalNeeded[
                                          results.totalNeeded.length - 1 - 1
                                        ]
                                      ).toLocaleString(locale)
                                    : t("general.NA")}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-light">
                              <th>
                                {t("results.totalRequiringColposcopyTest")}
                              </th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end" key={index}>
                                  {/* {results.totalNeededToDiagnosticTriage?.toLocaleString(
                                    locale
                                  ) ?? "N/A"} */}
                                  {results.scenario === "ScreenTreat"
                                    ? t("general.NA")
                                    : results.scenario ===
                                      "ScreenTriageDiagnosticTestTreat"
                                    ? results.totalNeeded[
                                        results.totalNeeded.length - 1 - 1
                                      ] !== undefined &&
                                      !isNaN(
                                        results.totalNeeded[
                                          results.totalNeeded.length - 1 - 1
                                        ]
                                      )
                                      ? Math.round(
                                          results.totalNeeded[
                                            results.totalNeeded.length - 1 - 1
                                          ]
                                        ).toLocaleString(locale)
                                      : t("general.NA")
                                    : t("general.NA")}
                                </td>
                              ))}
                            </tr>
                            <tr className="table-light">
                              <th>{t("results.totalRequiringTreatment")}</th>
                              {scenarios.map(({ results }, index) => (
                                <td className="text-end" key={index}>
                                  {/* {results.totalNeededToTreat?.toLocaleString(
                                    locale
                                  ) ?? "N/A"} */}
                                  {results.totalNeeded[
                                    results.totalNeeded.length - 1
                                  ] !== undefined &&
                                  !isNaN(
                                    results.totalNeeded[
                                      results.totalNeeded.length - 1
                                    ]
                                  )
                                    ? Math.round(
                                        results.totalNeeded[
                                          results.totalNeeded.length - 1
                                        ]
                                      ).toLocaleString(locale)
                                    : t("general.NA")}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </Table>
                        <hr className="d-none" data-export />
                      </Tab.Pane>
                      <Tab.Pane
                        eventKey="scenarioAssumptions"
                        mountOnEnter={false}
                        unmountOnExit={false}
                      >
                        <Table hover responsive data-export>
                          <thead>
                            <tr className="bg-info-dark text-light">
                              <th className="bg-info-dark text-light">{t("compareScenarios.asssumptions")}</th>
                              {scenarios.map((scenario, index) => (
                                <th key={index} className="text-end bg-info-dark text-light">
                                  {scenario.name} <br />
                                  {asLabel(scenario.scenario, scenarios)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th>{t("runScenario.numPeople")}</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {params.populationSize?.toLocaleString(
                                    locale
                                  ) ?? t("general.NA")}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th>{t("runScenario.prevelance")}</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {asPercent(params.cinPrevalence) ??
                                    t("general.NA")}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-info">
                              <th>{t("runScenario.cervicalTestChosen")}</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {/* {asLabel(
                                    params.screeningTest,
                                    screeningTests
                                  ) ?? t("general.NA")} */}
                                  {screenTest[index]}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">
                                {" "}
                                {t("runScenario.screeningCoverage")}
                              </th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {asPercent(params.percentScreened) ??
                                    t("general.NA")}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">
                                {/* {t("runScenario.screeningTestSenvitivity")} */}
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: t(
                                      "runScenario.screeningTestSenvitivity"
                                    ),
                                  }}
                                />
                              </th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {asPercent(params.screeningTestSensitivity) ??
                                    t("general.NA")}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">
                                {/* {t("runScenario.screeningTestSpecificity")} */}
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: t(
                                      "runScenario.screeningTestSpecificity"
                                    ),
                                  }}
                                />
                              </th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {asPercent(params.screeningTestSpecificity) ??
                                    t("general.NA")}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-info">
                              <th>
                                {t("runScenario.triageTestChosen")}
                              </th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {/* {asLabel(params.triageTest, triageTests_t) ??
                                    t("general.NA")} */}
                                  {triageTest[index]}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">
                                {t(
                                  "compareScenarios.triageorDiagnosticTestAttendance"
                                )}
                              </th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {asPercent(params.percentTriaged) ??
                                    t("general.NA")}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">
                                {/* {t(
                                  "runScenario.triageOrDiagnosticTestSensitivity"
                                )} */}
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: t(
                                      "runScenario.triageOrDiagnosticTestSensitivity"
                                    ),
                                  }}
                                />
                              </th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {asPercent(params.triageTestSensitivity) ??
                                    t("general.NA")}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">
                                {/* {t(
                                  "runScenario.triageOrDiagnosticTestSpecificity"
                                )} */}
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: t(
                                      "runScenario.triageOrDiagnosticTestSpecificity"
                                    ),
                                  }}
                                />
                              </th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {asPercent(params.triageTestSpecificity) ??
                                    t("general.NA")}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-info">
                              <th>{t("general.colposcopy")}</th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {/* {asLabel(
                                    params.diagnosticTest,
                                    diagnosticTests_t
                                  ) ?? t("general.NA")} */}
                                  {/* {diagnosisTest[index]} */}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">
                                {t("runScenario.percentofScreenPositivesWithColposcopy")}
                              </th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {asPercent(params.percentDiagnosticTriaged) ??
                                    t("general.NA")}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">
                                {/* {t("runScenario.diagnosticTestSensitivity")} */}
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: t(
                                      "runScenario.colposcopyTestSensitivity"
                                    ),
                                  }}
                                />
                              </th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {asPercent(
                                    params.diagnosticTestSensitivity
                                  ) ?? t("general.NA")}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <th className="ps-3">
                                {/* {t("runScenario.diagnosticTestSpecificity")} */}
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: t(
                                      "runScenario.colposcopyTestSpecificity"
                                    ),
                                  }}
                                />
                              </th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {asPercent(
                                    params.diagnosticTestSpecificity
                                  ) ?? t("general.NA")}
                                </td>
                              ))}
                            </tr>

                            <tr className="table-info">
                              <th>
                              {t("compareScenarios.treatmentAttendance")}
                              </th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {asPercent(params.percentTreated) ??
                                    t("general.NA")}
                                </td>
                              ))}
                            </tr>                           
                 
                            {/* <tr>
                              <th>
                                {(() => {
                                  // Assuming you're dealing with the first scenario in the array to determine the header
                                  const params = scenarios[0]; // Use the first scenario to determine the label
                                  return {
                                    ScreenTreat: t("runScenario.ScreenTreat"),
                                    ScreenDiagnosticTestTreat: t("runScenario.ScreenDiagnosticTestTreat"),
                                    ScreenTriageDiagnosticTestTreat: t(
                                      "runScenario.percentDiagnosticPositiveTreated"
                                    ),
                                  }[params.scenario];
                                })()}
                              </th>
                              {scenarios.map((params, index) => (
                                <td className="text-end" key={index}>
                                  {asPercent(params.percentTreated) ?? t("general.NA")}
                                </td>
                              ))}
                            </tr> */}


                          </tbody>
                        </Table>
                      </Tab.Pane>
                    </Tab.Content>
                  </Card.Body>
                </Card>
              </Tab.Container>
              <div className="text-center">
                <Button
                  onClick={exportResults}
                  className="m-1"
                  variant="primary"
                >
                  {" "}
                  {t("results.exportResultsToPDF")}
                </Button>
              </div>
            </>
          )}
        </Form>
      </Container>
    </div>
  );
}
