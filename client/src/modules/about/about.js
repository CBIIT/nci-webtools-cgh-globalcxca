import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import { useTranslation, Trans } from "react-i18next";
import { useState, useEffect } from "react";

export default function About() {
  const { t, i18n } = useTranslation();
  const [showScrollButton, setShowScrollButton] = useState(false);

  console.log("window.location.hash: ", window.location.hash);

  useEffect(() => {
    if (window.location.hash.includes("#sensitivity")) {
      const element = document.getElementById("sensitivity");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    if (window.location.hash.includes("#specificity")) {
      const element = document.getElementById("specificity");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

  useEffect(() => {
    function handleScroll() {
      if (window.pageYOffset > 50) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-light py-4">
      <Container>
        <h1 className="text-center h2">{t("about.title")}</h1>
        <Card className="mb-2 mt-2">
          <Card.Body className="pt-2">
            <h2 className="text-center mb-1 h4">{t("about.aboutWhoTile")}</h2>
            <div>
              <p>{t("about.aboutDes0")}</p>
              <div>
                <p>{t("about.aboutDes1")}</p>
                <ul>
                  <li>{t("about.aboutDes2")}</li>
                  <li>{t("about.aboutDes3")}</li>
                  <li>{t("about.aboutDes4")}</li>
                </ul>
              </div>
              <p>{t("about.aboutDes5")}</p>
              <p>
                <a
                  href="https://www.who.int/initiatives/cervical-cancer-elimination-initiative"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("about.aboutDes7")}
                </a>
              </p>
            </div>

            <h2 className="text-center mb-1 h4">
              {t("runScenario.epidemiological")}
            </h2>
            <div className="d-none d-md-block">
              <Table responsive bordered hover id="epidemiologicalTable">
                <colgroup>
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "23%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>{t("general.parameter")}</th>
                    <th>{t("general.lowValue")}</th>
                    <th>{t("general.highValue")}</th>
                    <th>{t("general.defaultValue")}</th>
                    <th>{t("general.justification")}</th>
                    <th>{t("general.sources")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t("about.hpvPrevelence")}</td>
                    <td>5%</td>
                    <td>20%</td>
                    <td>12%</td>
                    <td>
                      <p>{t("about.prevalenceSourcesJustification")}</p>
                    </td>
                    <td>
                      <p>{t("about.prevalenceSources9")}</p>
                      <p>{t("about.prevalenceSources10")}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("runScenario.prevelance")}</td>
                    <td>0%</td>
                    <td>5%</td>
                    <td>2%</td>
                    <td>{t("about.prevalenceJustitication")}</td>
                    <td>
                      <p>{t("about.prevalenceSources0")}</p>
                      <p>{t("about.prevalenceSources1")}</p>
                      <p>{t("about.prevalenceSources2")}</p>
                      <p>{t("about.prevalenceSources3")}</p>
                      <p>{t("about.prevalenceSources4")}</p>
                      <p>{t("about.prevalenceSources5")}</p>
                      <p>{t("about.prevalenceSources6")}</p>
                      <p>{t("about.prevalenceSources7")}</p>
                      <p>{t("about.prevalenceSources8")}</p>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
            <div className="d-block d-md-none">
              <Table responsive bordered hover>
                <thead>
                  <tr>
                    <th>{t("general.parameter")}</th>
                    <th>{t("general.lowValue")}</th>
                    <th>{t("general.highValue")}</th>
                    <th>{t("general.defaultValue")}</th>
                    <th>{t("general.justification")}</th>
                    <th>{t("general.sources")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t("about.hpvPrevelence")}</td>
                    <td>5%</td>
                    <td>20%</td>
                    <td>12%</td>
                    <td>
                      <p>{t("about.prevalenceSourcesJustification")}</p>
                    </td>
                    <td>
                      <p>{t("about.prevalenceSources9")}</p>
                      <p>{t("about.prevalenceSources10")}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("runScenario.prevelance")}</td>
                    <td>0%</td>
                    <td>5%</td>
                    <td>2%</td>
                    <td>{t("about.prevalenceJustitication")}</td>
                    <td>
                      <p>{t("about.prevalenceSources0")}</p>
                      <p>{t("about.prevalenceSources1")}</p>
                      <p>{t("about.prevalenceSources2")}</p>
                      <p>{t("about.prevalenceSources3")}</p>
                      <p>{t("about.prevalenceSources4")}</p>
                      <p>{t("about.prevalenceSources5")}</p>
                      <p>{t("about.prevalenceSources6")}</p>
                      <p>{t("about.prevalenceSources7")}</p>
                      <p>{t("about.prevalenceSources8")}</p>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
        <Card className="mb-2 mt-2">
          <Card.Body className="pt-2">
            <h2 className="text-center mb-1 h4">
              {t("runScenario.participationTitle")}
            </h2>
            <div>
              <Table responsive bordered hover id="participationInHealthTable">
                <thead>
                  <tr>
                    <th>{t("general.parameter")}</th>
                    <th>{t("general.lowValue")}</th>
                    <th>{t("general.highValue")}</th>
                    <th>{t("general.defaultValue")}</th>
                    <th>{t("general.justification")}</th>
                    <th>{t("general.sourcesJustification")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t("runScenario.intervalofCervicalInYears")}</td>
                    <td>1</td>
                    <td>40</td>
                    <td>5</td>
                    <td>
                      <p>
                        {t("about.intervalofCervicalInYearsJustification0")}
                      </p>
                      <p>
                        {t("about.intervalofCervicalInYearsJustification1")}
                      </p>
                      <p>
                        {t("about.intervalofCervicalInYearsJustification2")}
                      </p>
                      <p>
                        {t("about.intervalofCervicalInYearsJustification3")}
                      </p>
                    </td>
                    <td>
                      <p>{t("about.prevalenceSources3")}</p>
                      <p>{t("about.percentScreeningCoverageSource")}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("runScenario.percentScreeningCoverage")}</td>
                    <td>0%</td>
                    <td>100%</td>
                    <td>None</td>
                    <td>{t("about.percentScreeningCoverageJustification")}</td>
                    <td></td>
                  </tr>

                  <tr>
                    <td>{t("runScenario.ScreenDiagnosticTestTreat")}</td>
                    <td>0%</td>
                    <td>100%</td>
                    <td>None</td>
                    <td>
                      {t(
                        "about.percentTriageDiagnosticTestPositivesJustification"
                      )}
                    </td>
                    <td>
                      <p>
                        {t("about.percentTriageDiagnosticTestPositivesSource0")}
                      </p>
                      <p>
                        {t("about.percentTriageDiagnosticTestPositivesSource1")}
                      </p>
                      <p>
                        {t("about.percentTriageDiagnosticTestPositivesSource2")}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
        <Card className="mb-2 mt-2">
          <Card.Body className="pt-2">
            <h2 className="text-center mb-1 h4">
              {t("runScenario.screeningAndTreatmentTitle")}
            </h2>
            <div className="d-none d-md-block">
              <Table responsive bordered hover id="screeningStrategyTable">
                <colgroup>
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "25%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>{t("general.testName")}</th>
                    <th>{t("general.defaultSensitivity")}</th>
                    <th>{t("general.defaultSpecificity")}</th>
                    <th>{t("general.justificationText")} </th>
                    <th>{t("general.sourcesJustification")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t("runScenario.PapTest")}</td>
                    <td>61</td>
                    <td>90</td>
                    <td>{t("about.papTestJustification")}</td>
                    <td>
                      <p>{t("about.papTestSource0")}</p>
                      <p>{t("about.papTestSource1")}</p>
                      <p>{t("about.papTestSource2")}</p>
                      <p>{t("about.papTestSource3")}</p>
                      <p>{t("about.papTestSource4")}</p>
                      <p>{t("about.papTestSource5")}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("runScenario.VIA")} </td>
                    <td>60</td>
                    <td>84</td>
                    <td>{t("about.viaJustification")}</td>
                    <td>
                      <p>{t("about.papTestSource5")}</p>
                      <p>{t("about.papTestSource3")}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("runScenario.HPV")}</td>
                    <td>90</td>
                    <td>89</td>
                    <td>{t("about.hpvJustification")}</td>
                    <td>
                      <p>{t("about.papTestSource5")}</p>
                      <p>{t("about.papTestSource1")}</p>
                      <p>{t("about.papTestSource3")}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("runScenario.HPV1618")} </td>
                    <td>60</td>
                    <td>75</td>
                    <td></td>
                    <td>
                      <p>{t("about.papTestSource5")}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("runScenario.impressionOfColposcopy")}</td>
                    <td>70</td>
                    <td>75</td>
                    <td>{t("about.impressionOfColposcopyJustification")}</td>
                    <td>
                      <p>{t("about.impressionOfColposcopySource")}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("runScenario.colposcopyWithBiopsy")}</td>
                    <td>65</td>
                    <td>85</td>
                    <td></td>
                    <td>
                      <p>{t("about.impressionOfColposcopySource")}</p>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>

            <div className="d-block d-md-none">
              <Table responsive bordered hover className="table">
                <thead>
                  <tr>
                    <th>{t("general.testName")}</th>
                    <th>{t("general.defaultSensitivity")}</th>
                    <th>{t("general.defaultSpecificity")}</th>
                    <th>{t("general.justificationText")} </th>
                    <th>{t("general.sourcesJustification")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t("runScenario.PapTest")}</td>
                    <td>61</td>
                    <td>90</td>
                    <td>{t("about.papTestJustification")}</td>
                    <td>
                      <p>{t("about.papTestSource0")}</p>
                      <p>{t("about.papTestSource1")}</p>
                      <p>{t("about.papTestSource2")}</p>
                      <p>{t("about.papTestSource3")}</p>
                      <p>{t("about.papTestSource4")}</p>
                      <p>{t("about.papTestSource5")}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("runScenario.VIA")} </td>
                    <td>60</td>
                    <td>84</td>
                    <td>{t("about.viaJustification")}</td>
                    <td>
                      <p>{t("about.papTestSource5")}</p>
                      <p>{t("about.papTestSource3")}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("runScenario.HPV")}</td>
                    <td>90</td>
                    <td>89</td>
                    <td>{t("about.hpvJustification")}</td>
                    <td>
                      <p>{t("about.papTestSource5")}</p>
                      <p>{t("about.papTestSource1")}</p>
                      <p>{t("about.papTestSource3")}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("runScenario.HPV1618")} </td>
                    <td>60</td>
                    <td>75</td>
                    <td></td>
                    <td>
                      <p>{t("about.papTestSource5")}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("runScenario.impressionOfColposcopy")}</td>
                    <td>70</td>
                    <td>75</td>
                    <td>{t("about.impressionOfColposcopyJustification")}</td>
                    <td>
                      <p>{t("about.impressionOfColposcopySource")}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>{t("runScenario.colposcopyWithBiopsy")}</td>
                    <td>65</td>
                    <td>85</td>
                    <td></td>
                    <td>
                      <p>{t("about.impressionOfColposcopySource")}</p>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
        <Card className="mb-2 mt-2">
          <Card.Body className="pt-2">
            <h2 className="text-center mb-1 h4">{t("general.definition")}</h2>
            <Table bordered hover id="defTable">
              <colgroup>
                <col style={{ width: "15%" }} />
                <col style={{ width: "55%" }} />
                <col style={{ width: "30%" }} />
              </colgroup>

              <thead>
                <tr>
                  <th>{t("general.term")}</th>
                  <th>{t("general.definition")}</th>
                  <th>{t("general.sources")}</th>
                </tr>
              </thead>
              <tbody>
                <tr id="sensitivity">
                  <td>{t("general.sensitivity")}</td>
                  <td>{t("about.sensitivity")}</td>
                  <td>
                    <a
                      href="https://www.cancer.gov/about-cancer/screening/hp-screening-overview-pdq#:~:text=Revised%20text%20to%20state%20that,value%20(PPV)%2C%20which%20is"
                      target="_blank"
                    >
                      https://www.cancer.gov/about-cancer/screening/hp-screening-overview-pdq#:~:text=Revised%20text%20to%20state%20that,value%20(PPV)%2C%20which%20is
                    </a>
                  </td>
                </tr>
                <tr id="specificity">
                  <td>{t("general.specificity")}</td>
                  <td>{t("about.specificity")}</td>
                  <td>
                    <a
                      href="https://www.cancer.gov/about-cancer/screening/hp-screening-overview-pdq#:~:text=Revised%20text%20to%20state%20that,value%20(PPV)%2C%20which%20is"
                      target="_blank"
                    >
                      https://www.cancer.gov/about-cancer/screening/hp-screening-overview-pdq#:~:text=Revised%20text%20to%20state%20that,value%20(PPV)%2C%20which%20is
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>{t("about.overTreatment")}</td>
                  <td>
                    <p>{t("about.overTreatedDef")} </p>
                    <p> {t("about.overTreatmentStar")}</p>
                  </td>
                  <td>
                    <a
                      href="https://iris.who.int/bitstream/handle/10665/342365/9789240030824-eng.pdf?sequence=1"
                      target="_blank"
                    >
                      https://iris.who.int/bitstream/handle/10665/342365/9789240030824-eng.pdf?sequence=1
                    </a>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
        {showScrollButton && (
          <div className="move-to-top" onClick={scrollToTop}>
            Move to Top
          </div>
        )}
      </Container>
    </div>
  );
}
