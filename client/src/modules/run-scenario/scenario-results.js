import { useState } from "react";
import { useRecoilValue } from "recoil";
import { Link, Navigate } from "react-router-dom";
import { saveAs } from "file-saver";
import Card from "react-bootstrap/Card";
import Nav from "react-bootstrap/Nav";
import { Tab, Tabs } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Modal } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { paramsState, resultsState } from "./state";
import { localeState } from "../../app.state";
import {
  scenarios,
  screeningTests,
  triageTests,
  triageTests_t,
  diagnosticTests,
} from "../../services/models";
import { getTimestamp } from "../../services/file-utils";
import { exportPdf } from "../../services/pdf-utils";
import { asLabel, asPercent } from "../../services/formatters";
import PieChart from "./pie-chart";
import BarChart from "./bar-chart";
import {
  exportSvg,
  saveChartAsPNG,
  saveChartAsPNGForZip,
} from "../../services/plot-utils";
import * as d3 from "d3";
import { exportExcel } from "../../services/excel-utils";
import { useTranslation, Trans } from "react-i18next";
import JSZip from "jszip";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';



export default function ScenarioResults() {
  const { t, i18n } = useTranslation();
  const params = useRecoilValue(paramsState);
  const results = useRecoilValue(resultsState);
  const [activeTab, setActiveTab] = useState("results");
  const locale = useRecoilValue(localeState);
  const ScreentestBarChartId = "screenTestBarChart";
  const barChartId = "barChart";
  const pieChartId0 = "pieChart0";
  const pieChartId1 = "pieChart1";
  const barChartTitle1 = t("results.screeningBarChartTitle0");
  const barChartTitle2 = t("results.interventionsRequired");
  const pieChartTitle1 = t("results.populationWithPrecancer");
  const pieChartTitle2 = t("results.populationWithoutPrecancer");
  let screenTest = "";
  let triageTest = "";
  let diagnosisTest = "";
  let chartTiles;
  const [showModal, setShowModal] = useState(false);
  const [activeTabResult, setActiveTabResult] = useState("tab1");

  const handleModalShow = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);

  //console.log("params", params);
  //console.log("result ------ ", results);

  const isSpanish = i18n.language === 'es';
 //console.log("LANGUAGE ", i18n.language)
  if (
    results.checkedValues &&
    results.checkedValues.length === 3 &&
    results.checkedValues[2] === "ScreenDiagnosticTestTreat"
  ) {
    chartTiles = t("results.screenColposcopyTreatment");
    if (results.screentest[0] === "pap") {
      screenTest = "(" + t("runScenario.Pap") + ")";
    } else if (results.screentest[0] === "ivaa") {
      screenTest = "(" + t("runScenario.VIA") + ")";
    } else if (results.screentest[0] === "hpv") {
      screenTest = "(" + t("runScenario.HPV") + ")";
    } else if (results.screentest[0] === "hpv16or18") {
      screenTest = "(" + t("runScenario.HPV1618") + ")";
    } else {
      screenTest = "";
    }

    if (results.screentest[1] === "pap") {
      diagnosisTest = "(" + t("runScenario.Pap") + ")";
    } else if (results.screentest[1] === "ivaa") {
      diagnosisTest = "(" + t("runScenario.VIA") + ")";
    } else if (results.screentest[1] === "hpv") {
      diagnosisTest = "(" + t("runScenario.HPV") + ")";
    } else if (results.screentest[1] === "hpv16or18") {
      diagnosisTest = "(" + t("runScenario.HPV1618") + ")";
    } else if (results.screentest[1] === "colposcopicImpression") {
      diagnosisTest = "(" + t("runScenario.impressionOfColposcopy") + ")";
    } else if (results.screentest[1] === "colposcopyWithBiopsy") {
      diagnosisTest = "(" + t("runScenario.colposcopyWithBiopsy") + ")";
    } else {
      diagnosisTest = "";
    }
  } else if (
    results.checkedValues &&
    results.checkedValues.length === 3 &&
    results.checkedValues[2] === "ScreenTriageDiagnosticTestTreat"
  ) {
    chartTiles = t("results.screenTriageTreatment");

    if (results.screentest[0] === "pap") {
      screenTest = "(" + t("runScenario.Pap") + ")";
    } else if (results.screentest[0] === "ivaa") {
      screenTest = "(" + t("runScenario.VIA") + ")";
    } else if (results.screentest[0] === "hpv") {
      screenTest = "(" + t("runScenario.HPV") + ")";
    } else if (results.screentest[0] === "hpv16or18") {
      screenTest = "(" + t("runScenario.HPV1618") + ")";
    } else {
      screenTest = "";
    }

    if (results.screentest[1] === "pap") {
      triageTest = "(" + t("runScenario.Pap") + ")";
    } else if (results.screentest[1] === "ivaa") {
      triageTest = "(" + t("runScenario.VIA") + ")";
    } else if (results.screentest[1] === "hpv") {
      triageTest = "(" + t("runScenario.HPV") + ")";
    } else if (results.screentest[1] === "hpv16or18") {
      triageTest = "(" + t("runScenario.HPV1618") + ")";
    } else if (results.screentest[1] === "hpv16or18genotyping") {
      triageTest = "(" + t("runScenario.HPV1618Genotyping") + ")";
    } else if (results.screentest[1] === "colposcopicImpression") {
      triageTest = "(" + t("runScenario.impressionOfColposcopy") + ")";
    } else if (results.screentest[1] === "colposcopyWithBiopsy") {
      triageTest = "(" + t("runScenario.colposcopyWithBiopsy") + ")";
    } else {
      triageTest = "";
    }
  } else if (results.checkedValues && results.checkedValues.length === 4) {
    chartTiles = t("results.screenTriageColposcopyTreatment");

    if (results.screentest[0] === "pap") {
      screenTest = "(" + t("runScenario.Pap") + ")";
    } else if (results.screentest[0] === "ivaa") {
      screenTest = "(" + t("runScenario.VIA") + ")";
    } else if (results.screentest[0] === "hpv") {
      screenTest = "(" + t("runScenario.HPV") + ")";
    } else if (results.screentest[0] === "hpv16or18") {
      screenTest = "(" + t("runScenario.HPV1618") + ")";
    } else {
      screenTest = "";
    }

    if (results.screentest[1] === "pap") {
      triageTest = "(" + t("runScenario.Pap") + ")";
    } else if (results.screentest[1] === "ivaa") {
      triageTest = "(" + t("runScenario.VIA") + ")";
    } else if (results.screentest[1] === "hpv") {
      triageTest = "(" + t("runScenario.HPV") + ")";
    } else if (results.screentest[1] === "hpv16or18") {
      triageTest = "(" + t("runScenario.HPV1618") + ")";
    } else if (results.screentest[1] === "colposcopicImpression") {
      triageTest = "(" + t("runScenario.impressionOfColposcopy") + ")";
    } else if (results.screentest[1] === "colposcopyWithBiopsy") {
      triageTest = "(" + t("runScenario.colposcopyWithBiopsy") + ")";
    } else {
      triageTest = "";
    }

    if (results.screentest[2] === "pap") {
      diagnosisTest = "(" + t("runScenario.Pap") + ")";
    } else if (results.screentest[2] === "ivaa") {
      diagnosisTest = "(" + t("runScenario.VIA") + ")";
    } else if (results.screentest[2] === "hpv") {
      diagnosisTest = "(" + t("runScenario.HPV") + ")";
    } else if (results.screentest[2] === "hpv16or18") {
      diagnosisTest = "(" + t("runScenario.HPV1618") + ")";
    } else if (results.screentest[2] === "colposcopicImpression") {
      diagnosisTest = "(" + t("runScenario.impressionOfColposcopy") + ")";
    } else if (results.screentest[2] === "colposcopyWithBiopsy") {
      diagnosisTest = "(" + t("runScenario.colposcopyWithBiopsy") + ")";
    } else {
      diagnosisTest = "";
    }
  } else {
    chartTiles = t("results.screenTreatment");
    if (results.screentest[0] === "pap") {
      screenTest = "(" + t("runScenario.Pap") + ")";
    } else if (results.screentest[0] === "ivaa") {
      screenTest = "(" + t("runScenario.VIA") + ")";
    } else if (results.screentest[0] === "hpv") {
      screenTest = "(" + t("runScenario.HPV") + ")";
    } else if (results.screentest[0] === "hpv16or18") {
      screenTest = "(" + t("runScenario.HPV1618") + ")";
    } else {
      screenTest = "";
    }
  }

  // console.log("Chart title", chartTiles);
  // if (results.checkedValues) {
  //   console.log("results.checkedValues.length", results.checkedValues.length);
  // }

  const treatedIndex = results.totalNeeded.length - 1;
  //console.log("treatedIndex --- ", treatedIndex);
  let totalNeededToScreen,
    totalNeededToTriage,
    totalNeededToDiagnosticTriage,
    totalNeededToTreat;

  totalNeededToScreen =
    results.totalNeeded[0] !== undefined && !isNaN(results.totalNeeded[0])
      ? Math.round(results.totalNeeded[0]).toLocaleString(locale)
      : t("general.NA");

  //console.log("totalNeededToScreen", totalNeededToScreen);

  totalNeededToTriage =
    results.scenario === "ScreenTreat"
      ? t("general.NA")
      : results.checkedValues && results.checkedValues.length === 4
      ? results.totalNeeded[treatedIndex - 2] !== undefined &&
        !isNaN(results.totalNeeded[treatedIndex - 2])
        ? Math.round(results.totalNeeded[treatedIndex - 2]).toLocaleString(
            locale
          )
        : t("general.NA")
      : results.checkedValues &&
        results.checkedValues.length === 3 &&
        results.checkedValues[2] === "ScreenTriageDiagnosticTestTreat"
      ? results.totalNeeded[treatedIndex - 1] !== undefined &&
        !isNaN(results.totalNeeded[treatedIndex - 1])
        ? Math.round(results.totalNeeded[treatedIndex - 1]).toLocaleString(
            locale
          )
        : t("general.NA")
      : t("general.NA");
  //console.log("totalNeededToTriage", totalNeededToTriage);
  totalNeededToDiagnosticTriage =
    results.scenario === "ScreenTreat"
      ? results.totalNeeded[treatedIndex] !== undefined &&
        !isNaN(results.totalNeeded[treatedIndex])
        ? Math.ceil(results.totalNeeded[treatedIndex] * 0.1).toLocaleString(
            locale
          )
        : t("general.NA")
      : results.checkedValues && results.checkedValues.length === 4
      ? results.totalNeeded[treatedIndex - 1] !== undefined &&
        !isNaN(results.totalNeeded[treatedIndex - 1])
        ? Math.round(results.totalNeeded[treatedIndex - 1]).toLocaleString(
            locale
          )
        : t("general.NA")
      : results.checkedValues &&
        results.checkedValues.length === 3 &&
        results.checkedValues[2] === "ScreenTriageDiagnosticTestTreat"
      ? results.totalNeeded[treatedIndex - 2] !== undefined &&
        !isNaN(results.totalNeeded[treatedIndex - 2])
        ? Math.ceil(results.totalNeeded[treatedIndex] * 0.1).toLocaleString(
            locale
          )
        : t("general.NA")
      : results.checkedValues &&
        results.checkedValues.length === 3 &&
        results.checkedValues[2] === "ScreenDiagnosticTestTreat"
      ? results.totalNeeded[treatedIndex - 2] !== undefined &&
        !isNaN(results.totalNeeded[treatedIndex - 2])
        ? Math.round(results.totalNeeded[treatedIndex - 1]).toLocaleString(
            locale
          )
        : t("general.NA")
      : t("general.NA");
  
  // totalNeededToTreat =
  //   results.totalNeeded[treatedIndex] !== undefined &&
  //   !isNaN(results.totalNeeded[treatedIndex])
  //     ? Math.ceil(results.totalNeeded[treatedIndex]).toLocaleString(locale)
  //     : t("general.NA");

  totalNeededToTreat =
    Math.round(results.healthyOvertreated_rounded + results.testedPositives[treatedIndex + 1]).toLocaleString(locale);

  //console.log("totalNeededToTreat", totalNeededToTreat);
  function saveScenario() {
    let filename;

    if (params.checkedValues && params.checkedValues.length === 4) {
        filename = `${t("results.screenTriageColposcopyTreatmentFilename")}_${getTimestamp()}.scenario`;
    } else if (params.checkedValues && params.checkedValues.length === 3) {
        if (params.checkedValues[2] === "ScreenDiagnosticTestTreat") {
            filename = `${t("results.screenColposcopyTreatmentFilename")}_${getTimestamp()}.scenario`;
        } else if (params.checkedValues[2] === "ScreenTriageDiagnosticTestTreat") {
            filename = `${t("results.screenTriageTreatmentFilename")}_${getTimestamp()}.scenario`;
        } else {
            filename = `${t("results.screenTreatmentFilename")}_${getTimestamp()}.scenario`;
        }
    } else {
        filename = `${t("results.screenTreatmentFilename")}_${getTimestamp()}.scenario`;
    }
    const type = "text/plain;charset=utf-8";
    const contents = JSON.stringify(params);
    saveAs(new Blob([contents]), filename, { type });
  }

  // async function exportResults() {
  //   const filename = `${params.scenario} ${getTimestamp()}.pdf`;
  //   const nodes = Array.from(document.querySelectorAll("[data-export]"));
  //   exportPdf(filename, nodes);
  // }

  async function exportResults(tabContentId) {
    let filename;

    if (params.checkedValues && params.checkedValues.length === 4) {
        filename = `${t("results.screenTriageColposcopyTreatmentFilename")}_${getTimestamp()}.pdf`;
    } else if (params.checkedValues && params.checkedValues.length === 3) {
        if (params.checkedValues[2] === "ScreenDiagnosticTestTreat") {
            filename = `${t("results.screenColposcopyTreatmentFilename")}_${getTimestamp()}.pdf`;
        } else if (params.checkedValues[2] === "ScreenTriageDiagnosticTestTreat") {
            filename = `${t("results.screenTriageTreatmentFilename")}_${getTimestamp()}.pdf`;
        } else {
            filename = `${t("results.screenTreatmentFilename")}_${getTimestamp()}.pdf`;
        }
    } else {
        filename = `${t("results.screenTreatmentFilename")}_${getTimestamp()}.pdf`;
    }

    // Select all elements with the data-export attribute in the specified tab content and #tab4Content
    const activeTabContent = document.querySelectorAll(`#${tabContentId} [data-export]`);
    const tab4Content = document.querySelectorAll(`#tab4Content [data-export]`);

    // Combine the nodes from the active tab and tab4
    const nodes = [];
    activeTabContent.forEach(node => nodes.push(node));
    tab4Content.forEach(node => nodes.push(node));

    // Log the selected nodes for debugging
   //console.log("Nodes to be exported:", nodes);

    exportPdf(filename, nodes);
}


function exportResultsExcel(tabContentId) {
  let filename;

    if (params.checkedValues && params.checkedValues.length === 4) {
        filename = `${t("results.screenTriageColposcopyTreatmentFilename")}_${getTimestamp()}.xlsx`;
    } else if (params.checkedValues && params.checkedValues.length === 3) {
        if (params.checkedValues[2] === "ScreenDiagnosticTestTreat") {
            filename = `${t("results.screenColposcopyTreatmentFilename")}_${getTimestamp()}.xlsx`;
        } else if (params.checkedValues[2] === "ScreenTriageDiagnosticTestTreat") {
            filename = `${t("results.screenTriageTreatmentFilename")}_${getTimestamp()}.xlsx`;
        } else {
            filename = `${t("results.screenTreatmentFilename")}_${getTimestamp()}.xlsx`;
        }
    } else {
        filename = `${t("results.screenTreatmentFilename")}_${getTimestamp()}.xlsx`;
    }
  exportExcel(filename, tabContentId, t); // Pass the t function here
}

  //export chart to SVG
  function handleExportSvg(id) {
    const plotSelector = `#${id}`;
    const fileName = `${results.scenario}_${id}.svg`;
    exportSvg(plotSelector, fileName);
  }
  //pie1
  d3.select("#savePNG0").on("click", function () {
    saveChartAsPNG(
      pieChartId0,
      `${results.scenario}_${pieChartId0}`,
      pieChartTitle1
    );
  });
  //bar2
  d3.select("#savePNG1").on("click", function () {
    saveChartAsPNG(
      barChartId,
      `${results.scenario}_${barChartId}`,
      barChartTitle2
    );
  });
  //bar1
  d3.select("#savePNG2").on("click", function () {
    saveChartAsPNG(
      ScreentestBarChartId,
      `${results.scenario}_${ScreentestBarChartId}`,
      barChartTitle1
    );
  });

  d3.select("#savePNG3").on("click", function () {
    saveChartAsPNG(
      pieChartId1,
      `${results.scenario}_${pieChartId1}`,
      pieChartTitle2
    );
  });

  async function generateZipFilePNG() {
    const zip = new JSZip();

    // Add each PNG chart to the zip
    const pngCharts = [
      { id: pieChartId0, title: pieChartTitle1 },
      { id: barChartId, title: barChartTitle2 },
      { id: ScreentestBarChartId, title: barChartTitle1 },
      { id: pieChartId1, title: pieChartTitle2 },
    ];

    const pngPromises = pngCharts.map(async (chart) => {
      const chartElement = document.querySelector(`#${chart.id}`);

      if (!chartElement) {
        // Handle the case where the chart element is not found
        console.error(`Chart element with ID ${chart.id} not found.`);
        return null; // or handle the error in an appropriate way
      }

      const pngData = await saveChartAsPNGForZip(chart.id, chart.title);

      // Return the PNG data with title as a resolved promise
      return { title: chart.title, data: pngData };
    });

    // Wait for all promises to be resolved
    const pngResults = await Promise.all(pngPromises);

    // Filter out any null results (charts not found)
    const validPngResults = pngResults.filter((result) => result !== null);

    // Add the PNG data to the zip for valid results
    for (const pngResult of validPngResults) {
      zip.file(`${results.scenario}_${pngResult.title}.png`, pngResult.data, {
        base64: true,
      });
    }

    // Generate the zip file
    const content = await zip.generateAsync({ type: "blob" });

    // Save the zip file
    saveAs(content, "chartsPNG.zip");
  }

  async function generateZipFileSVG() {
    const zip = new JSZip();

    // Add each chart SVG to the zip
    const svgCharts = [
      { id: ScreentestBarChartId, title: barChartTitle1 },
      { id: barChartId, title: barChartTitle2 },
      { id: pieChartId0, title: pieChartTitle1 },
      { id: pieChartId1, title: pieChartTitle2 },
    ];

    for (const chart of svgCharts) {
      const svgElement = document.querySelector(`#${chart.id}`);
      const svgString = new XMLSerializer().serializeToString(svgElement);

      zip.file(`${results.scenario}_${chart.title}.svg`, svgString);
    }

    // Generate the zip file
    const content = await zip.generateAsync({ type: "blob" });

    // Save the zip file
    saveAs(content, "chartsSVG.zip");
  }

  if (!params || !results) {
    return null;
    //return <Navigate to="/run-scenario" />;
  }

  const combinedTitleLength = (barChartTitle1 + " " + barChartTitle2).length;

  // Check if the combined title length is greater than a certain threshold
  const shouldWrap = combinedTitleLength > 20; // Adjust the threshold as needed

  const handleTabSelect = (selectedTab) => {
    setActiveTabResult(selectedTab);
  };

  return (
    <div>
      {/* <Container style={{ overflow: "auto", maxHeight: "100vh" }}> */}
      <Container>
        <Card className="mb-2">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <Card.Title>
              {t("results.resultsInterpretation")}
            </Card.Title>
            <Button onClick={saveScenario} variant="primary">
              {t("results.saveScenario")}
            </Button>
          </Card.Header>

          <Card.Body className="pt-2 pb-2">
            <div>
              {t("results.Approximately")}{" "}
              <b>
                {totalNeededToScreen} {screenTest}
              </b>{" "}
              {t("results.screeningTests")},{" "}
              <b>
                {totalNeededToTriage} {triageTest}
              </b>{" "}
              {t("results.triageTests")}, {t("general.and")}
              <b>
                {" "}
                {totalNeededToDiagnosticTriage}
              </b>{" "}
              {t("results.resultsDes0")} <b>{totalNeededToTreat}</b>{" "}
              {t("results.resultsDes1")} {t("general.El")}
              <b>
                {" "}
                {asPercent(results.percentHealthyOvertreated) ??
                  t("general.NA")}
              </b>{" "}
              {t("results.resultsDes2")}
            </div>
            <div className="mt-2">
              {t("results.resultGraphDefinition")}
              
            </div>
          </Card.Body>
        </Card>

        <div>
          <Tabs
            activeKey={activeTabResult}
            onSelect={handleTabSelect}
            style={{ position: "relative", zIndex: 2 }}
          >
            
            <Tab eventKey="tab1" title={t("general.tables")}>
            <div id="tab1Content">
             <Card className="mb-4">
                <Card.Body>
                  <Table hover responsive data-export>
                    <thead>
                      <tr className="bg-info-dark">
                        <th className="bg-info-dark text-light">{t("results.annualTargets")}</th>
                        <th className="th-placeholder">Placeholder</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-info">
                        <th>
                          {t("results.populationTargetedWithCoverageTitle")}
                        </th>
                        <td className="text-end text-nowrap">
                          {" "}
                          {results.populationTargeted !== undefined &&
                          !isNaN(results.populationTargeted)
                            ? Math.round(
                                results.populationTargeted
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-info">
                        <th className="ps-3">
                          {t("results.populationTargetedWithoutPrecancer")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {results.healthyWomenTargetedForScreening?.toLocaleString(
                      locale
                    ) ?? t("general.NA")} */}
                          {results.testedFalsePositives[0] !== undefined &&
                          !isNaN(results.testedFalsePositives[0])
                            ? Math.round(
                                results.testedFalsePositives[0]
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-info">
                        <th className="ps-3">
                          {t("results.populationTargetedWithPrecancer")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {results.precancersTargetedForScreening?.toLocaleString(
                      locale
                    ) ?? t("general.NA")} */}
                          {results.testedTruePositives[0] !== undefined &&
                          !isNaN(results.testedTruePositives[0])
                            ? Math.round(
                                results.testedTruePositives[0]
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive data-export>
                    <thead>
                      <tr className="bg-warning-dark text-light">
                        <th className="bg-warning-dark text-light">
                          {t("results.annualImpactOnCervicalPrecancerTitle")}
                        </th>
                        <th className="th-placeholder">Placeholder</th>
                        <th className="th-placeholder">Placeholder</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-warning">
                        <th>{t("results.percentPrecancersTreated")}</th>
                        <td className="text-end text-nowrap">
                          {asPercent(results.percentPrecancersTreated) ??
                            t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {!isNaN(
                            Math.round(
                              results.testedPositives[treatedIndex + 1]
                            )
                          )
                            ? Math.round(
                                results.testedPositives[treatedIndex + 1]
                              )
                            : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-warning">
                        <th>
                          {t("results.percentPolulationTargetedOverTreated")}
                        </th>
                        <td className="text-end text-nowrap">
                          {asPercent(results.percentHealthyOvertreated) ??
                            t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {!isNaN(Math.round(results.healthyOvertreated))
                            ? Math.round(results.healthyOvertreated)
                            : t("general.NA")}
                        </td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive data-export>
                    <thead>
                      <tr className="bg-danger-dark text-light">
                        <th className="bg-danger-dark text-light">{t("results.AnnualMissedPrecancersTitle")}</th>
                        <th className="th-placeholder">Placeholder</th>
                        <th className="th-placeholder">Placeholder</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-danger">
                        <th>{t("results.totalPrecancersMissed")}</th>
                        <td className="text-end text-nowrap">
                          {asPercent(results.percentPrecancersMissed) ??
                            t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {results.numberPrecancersMissed !== undefined &&
                          !isNaN(results.numberPrecancersMissed)
                            ? Math.round(
                                results.numberPrecancersMissed
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-danger">
                        <th>{t("results.sourcesMissedPrecancers")}</th>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr className="table-light">
                        <th className="ps-3">
                          {t("results.didNotHaveScreeningTest")} {screenTest}{" "}
                          {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(results.percentMissedDueToNoScreening) ?? "N/A"} */}
                          {asPercent(results.percentMissed[0]) ??
                            t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToNoScreening?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {results.untestedPositives[1] !== undefined &&
                          !isNaN(results.untestedPositives[1])
                            ? Math.round(
                                results.untestedPositives[1]
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-light">
                        <th className="ps-3">
                          {/* {t("results.sensitivityOfScreeningTest")}{" "} */}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: t("results.sensitivityOfScreeningTest"),
                            }}
                          />{" "}
                          {screenTest} {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(
                      results.percentMissedDueToSensitivityOfScreeningTest
                    ) ?? "N/A"} */}
                          {asPercent(
                            results.percentMissedDueToSensitivity[0]
                          ) ?? t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToSensitivityOfScreeningTest?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {results.testedFalseNegatives[1] !== undefined &&
                          !isNaN(results.testedFalseNegatives[1])
                            ? Math.round(
                                results.testedFalseNegatives[1]
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">
                          {t("results.lossAtTriageTest")} {triageTest}{" "}
                          {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(results.percentMissedDueToLossAtTriage) ?? "N/A"} */}
                          {/* {asPercent(results.percentMissed[1]) ?? "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenTriageDiagnosticTestTreat"
                            ? results.percentMissed[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(results.percentMissed[treatedIndex - 1])
                              ? asPercent(
                                  results.percentMissed[treatedIndex - 1]
                                )
                              : t("general.NA")
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.percentMissed[treatedIndex - 2] !==
                                undefined &&
                              !isNaN(results.percentMissed[treatedIndex - 2])
                              ? asPercent(
                                  results.percentMissed[treatedIndex - 2]
                                )
                              : t("general.NA")
                            : results.percentMissed[treatedIndex - 2] !==
                                undefined &&
                              !isNaN(results.percentMissed[treatedIndex - 2])
                            ? asPercent(results.percentMissed[treatedIndex - 2])
                            : t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToLossAtTriage?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {/* {results.untestedPositives[2]?.toLocaleString(locale) ??
                      "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenTriageDiagnosticTestTreat"
                            ? results.untestedPositives[treatedIndex] !==
                                undefined &&
                              !isNaN(results.untestedPositives[treatedIndex])
                              ? Math.round(
                                  results.untestedPositives[treatedIndex]
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.untestedPositives[treatedIndex-1] !==
                                undefined &&
                              !isNaN(results.untestedPositives[treatedIndex-1])
                              ? Math.round(
                                  results.untestedPositives[treatedIndex-1]
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.untestedPositives[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(
                                results.untestedPositives[treatedIndex - 1]
                              )
                            ? Math.round(
                                results.untestedPositives[treatedIndex - 1]
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">
                          {/* {t("results.sensitivityOfTriageTest")} */}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: t("results.sensitivityOfTriageTest"),
                            }}
                          />{" "}
                          {triageTest} {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(
                      results.percentMissedDueToSensitivityOfTriageTest
                    ) ?? "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenTriageDiagnosticTestTreat"
                            ? results.percentMissedDueToSensitivity[
                                treatedIndex - 1
                              ] !== undefined &&
                              !isNaN(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 1
                                ]
                              )
                              ? asPercent(
                                  results.percentMissedDueToSensitivity[
                                    treatedIndex - 1
                                  ]
                                )
                              : t("general.NA")
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.percentMissedDueToSensitivity[
                                treatedIndex - 2
                              ] !== undefined &&
                              !isNaN(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 2
                                ]
                              )
                              ? asPercent(
                                  results.percentMissedDueToSensitivity[
                                    treatedIndex - 2
                                  ]
                                )
                              : t("general.NA")
                            : results.percentMissedDueToSensitivity[
                                treatedIndex - 2
                              ] !== undefined &&
                              !isNaN(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 2
                                ]
                              )
                            ? asPercent(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 2
                                ]
                              )
                            : t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToSensitivityOfTriageTest?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenTriageDiagnosticTestTreat"
                            ? results.testedFalseNegatives[treatedIndex] !==
                                undefined &&
                              !isNaN(results.testedFalseNegatives[treatedIndex])
                              ? Math.round(
                                  results.testedFalseNegatives[treatedIndex]
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.testedFalseNegatives[treatedIndex-1] !==
                                undefined &&
                              !isNaN(results.testedFalseNegatives[treatedIndex-1])
                              ? Math.round(
                                  results.testedFalseNegatives[treatedIndex-1]
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.testedFalseNegatives[treatedIndex-1] !==
                                undefined &&
                              !isNaN(
                                results.testedFalseNegatives[treatedIndex -1]
                              )
                            ? Math.round(
                                results.testedFalseNegatives[treatedIndex -1]
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">
                          {t("results.lossAtColposcopy")} {" "}
                          {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(
                      results.percentMissedDueToLossAtDiagnosticTriage
                    ) ?? "N/A"} */}
                          {/* {asPercent(results.percentMissed[3]) ?? "N/A"} */}
                          {/* {results.scenario === "ScreenTreat"
                      ? "N/A"
                      : results.scenario === "ScreenTriageDiagnosticTestTreat"
                      ? results.percentMissed[treatedIndex - 1] !== undefined &&
                        !isNaN(results.percentMissed[treatedIndex - 1])
                        ? asPercent(results.percentMissed[treatedIndex - 1])
                        : "N/A"
                      : "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? results.percentMissed[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(results.percentMissed[treatedIndex - 1])
                              ? asPercent(
                                  results.percentMissed[treatedIndex - 1]
                                )
                              : t("general.NA")
                            : results.scenario ===
                                "ScreenTriageDiagnosticTestTreat" &&
                              results.percentMissed[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(results.percentMissed[treatedIndex - 1])
                            ? asPercent(results.percentMissed[treatedIndex - 1])
                            : t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToLossAtDiagnosticTriage?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {/* {results.untestedPositives[4]?.toLocaleString(locale) ??
                      "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? Math.round(
                                results.untestedPositives[treatedIndex]
                              ).toLocaleString(locale)
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.untestedPositives[treatedIndex] !==
                                undefined &&
                              !isNaN(
                                results.untestedPositives[treatedIndex]
                              )
                              ? Math.round(
                                  results.untestedPositives[treatedIndex]
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : t("general.NA")}
                        </td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">
                          {/* {t("results.sensitivityOfDiagnosticTest")} */}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: t("results.sensitivityOfColposcopy"),
                            }}
                          />{" "}
                           {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(
                      results.percentMissedDueToSensitivityOfDiagnosticTriageTest
                    ) ?? "N/A"} */}

                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? asPercent(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 1
                                ]
                              )
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.percentMissedDueToSensitivity[
                                treatedIndex - 1
                              ] !== undefined &&
                              !isNaN(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 1
                                ]
                              )
                              ? asPercent(
                                  results.percentMissedDueToSensitivity[
                                    treatedIndex - 1
                                  ]
                                )
                              : t("general.NA")
                            : t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToSensitivityOfDiagnosticTriageTest?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}

                    {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? results.testedFalseNegatives[treatedIndex] !==
                                undefined &&
                              !isNaN(results.testedFalseNegatives[treatedIndex])
                              ? Math.round(
                                  results.testedFalseNegatives[treatedIndex]
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenTriageDiagnosticTestTreat"
                            ? t("general.NA")
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.testedFalseNegatives[treatedIndex] !==
                                undefined &&
                              !isNaN(results.testedFalseNegatives[treatedIndex])
                              ? Math.round(
                                  results.testedFalseNegatives[treatedIndex]
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.testedFalseNegatives[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(
                                results.testedFalseNegatives[treatedIndex - 1]
                              )
                            ? Math.round(
                                results.testedFalseNegatives[treatedIndex - 1]
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">{t("results.lossAtTreatment")}</th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(results.percentMissedDueToLossAtTreatment) ??
                      "N/A"} */}
                          {asPercent(results.percentMissed[treatedIndex]) ??
                            t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToLossAtTreatment?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {results.untestedPositives[treatedIndex + 1] !==
                            undefined &&
                          !isNaN(results.untestedPositives[treatedIndex + 1])
                            ? Math.round(
                                results.untestedPositives[treatedIndex + 1]
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive data-export>
                    <thead>
                      <tr className="bg-success-dark text-light">
                        <th className="bg-success-dark text-light">{t("results.AnnualImpactOnResourcesTitle")}</th>
                        <th className="th-placeholder">Placeholder</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-light">
                        <th>{t("results.totalRequiringScreening")} {screenTest}{" "} {!isSpanish && t("general.test")}</th>
                        <td className="text-end text-nowrap">
                          {/* {results.totalNeededToScreen?.toLocaleString(locale) ??
                      "N/A"} */}

                          {totalNeededToScreen}
                        </td>
                      </tr>
                      <tr className="table-light">
                        <th>
                          {t("results.totalRequiringTriageDiagnostic")} {triageTest}{" "}
                          {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {results.totalNeededToTriage?.toLocaleString(locale) ??
                      "N/A"} */}
                          {/* {totalNeededToTriage} --- */}
                          {totalNeededToTriage}
                        </td>
                      </tr>
                      <tr className="table-light">
                        <th>{t("results.totalRequiringColposcopyTest")} 
                          <OverlayTrigger
                              overlay={
                                <Tooltip id="totalRequiringColposcopy-help">
                                  <span>{t("results.screeningColposcopyHelpText")}</span>
                                </Tooltip>
                              }
                            >
                              <span className="d-inline-block">
                                <i className="ms-1 bi bi-question-circle"></i>
                              </span>
                            </OverlayTrigger>                              
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {results.totalNeededToDiagnosticTriage?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}

                          {totalNeededToDiagnosticTriage}
                        </td>
                      </tr>
                      <tr className="table-light">
                        <th>{t("results.totalRequiringTreatment")}</th>
                        <td className="text-end text-nowrap">
                          {/* {results.totalNeededToTreat?.toLocaleString(locale) ??
                      "N/A"} */}

                          {totalNeededToTreat}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                  <div className="text-center">
                    <Button
                      onClick={() => exportResults('tab1Content')}
                      className="m-1"
                      variant="primary"
                    >
                      {t("results.exportResultsToPDF")}
                    </Button>
                    <Button
                      onClick={() => exportResultsExcel('tab1Content')}
                      className="m-1"
                      variant="primary"
                    >
                      {t("results.exportResultsToExcel")}
                    </Button>

                  </div>
                </Card.Body>
              </Card>
              </div>
            </Tab>

            <Tab eventKey="tab2" title={t("general.monthlyTables")}>
            <div id="tab2Content">
              <Card className="mb-4">
                <Card.Body>
                  <Table hover responsive data-export>
                    <thead>
                      <tr className="bg-info-dark text-light">
                        <th className="bg-info-dark text-light">{t("results.monthlyTargets")}</th>
                        <th className="th-placeholder">Placeholder</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-info">
                        <th>
                          {t("results.populationTargetedWithCoverageTitle")}
                        </th>
                        <td className="text-end text-nowrap">
                          {" "}
                          {results.populationTargeted !== undefined &&
                          !isNaN(results.populationTargeted)
                            ? Math.round(
                                results.populationTargeted / 12
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-info">
                        <th className="ps-3">
                          {t("results.populationTargetedWithoutPrecancer")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {results.healthyWomenTargetedForScreening?.toLocaleString(
                      locale
                    ) ?? t("general.NA")} */}
                          {results.testedFalsePositives[0] !== undefined &&
                          !isNaN(results.testedFalsePositives[0])
                            ? Math.round(
                                results.testedFalsePositives[0] / 12
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-info">
                        <th className="ps-3">
                          {t("results.populationTargetedWithPrecancer")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {results.precancersTargetedForScreening?.toLocaleString(
                      locale
                    ) ?? t("general.NA")} */}
                          {results.testedTruePositives[0] !== undefined &&
                          !isNaN(results.testedTruePositives[0])
                            ? Math.round(
                                results.testedTruePositives[0] / 12
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive data-export>
                    <thead>
                      <tr className="bg-warning-dark text-light">
                        <th className="bg-warning-dark text-light">
                          {t("results.monthlyImpactOnCervicalPrecancerTitle")}
                        </th>
                        <th className="th-placeholder">Placeholder</th>
                        <th className="th-placeholder">Placeholder</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-warning">
                        <th>{t("results.percentPrecancersTreated")}</th>
                        <td className="text-end text-nowrap">
                          {asPercent(results.percentPrecancersTreated) ??
                            t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {!isNaN(
                            Math.round(
                              results.testedPositives[treatedIndex + 1]
                            )
                          )
                            ? Math.round(
                                results.testedPositives[treatedIndex + 1] / 12
                              )
                            : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-warning">
                        <th>
                          {t("results.percentPolulationTargetedOverTreated")}
                        </th>
                        <td className="text-end text-nowrap">
                          {asPercent(results.percentHealthyOvertreated) ??
                            t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {!isNaN(Math.round(results.healthyOvertreated))
                            ? Math.round(results.healthyOvertreated / 12)
                            : t("general.NA")}
                        </td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive data-export>
                    <thead>
                      <tr className="bg-danger-dark text-light">
                        <th className="bg-danger-dark text-light">{t("results.monthlyMissedPrecancersTitle")}</th>
                        <th className="th-placeholder">Placeholder</th>
                        <th className="th-placeholder">Placeholder</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-danger">
                        <th>{t("results.totalPrecancersMissed")}</th>
                        <td className="text-end text-nowrap">
                          {asPercent(results.percentPrecancersMissed) ??
                            t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {results.numberPrecancersMissed !== undefined &&
                          !isNaN(results.numberPrecancersMissed)
                            ? Math.round(
                                results.numberPrecancersMissed / 12
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-danger">
                        <th>{t("results.sourcesMissedPrecancers")}</th>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr className="table-light">
                        <th className="ps-3">
                          {t("results.didNotHaveScreeningTest")} {screenTest}{" "}
                          {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(results.percentMissedDueToNoScreening) ?? "N/A"} */}
                          {asPercent(results.percentMissed[0]) ??
                            t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToNoScreening?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {results.untestedPositives[1] !== undefined &&
                          !isNaN(results.untestedPositives[1])
                            ? Math.round(
                                results.untestedPositives[1] / 12
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-light">
                        <th className="ps-3">
                          {/* {t("results.sensitivityOfScreeningTest")} */}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: t("results.sensitivityOfScreeningTest"),
                            }}
                          />{" "}
                          {screenTest} {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(
                      results.percentMissedDueToSensitivityOfScreeningTest
                    ) ?? "N/A"} */}
                          {asPercent(
                            results.percentMissedDueToSensitivity[0]
                          ) ?? t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToSensitivityOfScreeningTest?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {results.testedFalseNegatives[1] !== undefined &&
                          !isNaN(results.testedFalseNegatives[1])
                            ? Math.round(
                                results.testedFalseNegatives[1] / 12
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">
                          {t("results.lossAtTriageTest")} {triageTest}{" "}
                          {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(results.percentMissedDueToLossAtTriage) ?? "N/A"} */}
                          {/* {asPercent(results.percentMissed[1]) ?? "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenTriageDiagnosticTestTreat"
                            ? results.percentMissed[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(results.percentMissed[treatedIndex - 1])
                              ? asPercent(
                                  results.percentMissed[treatedIndex - 1]
                                )
                              : t("general.NA")
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.percentMissed[treatedIndex - 2] !==
                                undefined &&
                              !isNaN(results.percentMissed[treatedIndex - 2])
                              ? asPercent(
                                  results.percentMissed[treatedIndex - 2]
                                )
                              : t("general.NA")
                            : results.percentMissed[treatedIndex - 2] !==
                                undefined &&
                              !isNaN(results.percentMissed[treatedIndex - 2])
                            ? asPercent(results.percentMissed[treatedIndex - 2])
                            : t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToLossAtTriage?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {/* {results.untestedPositives[2]?.toLocaleString(locale) ??
                      "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenTriageDiagnosticTestTreat"
                            ? results.untestedPositives[treatedIndex] !==
                                undefined &&
                              !isNaN(results.untestedPositives[treatedIndex])
                              ? Math.round(
                                  results.untestedPositives[treatedIndex] / 12
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.untestedPositives[treatedIndex-1] !==
                                undefined &&
                              !isNaN(results.untestedPositives[treatedIndex-1])
                              ? Math.round(
                                  results.untestedPositives[treatedIndex-1] / 12
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.untestedPositives[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(
                                results.untestedPositives[treatedIndex - 1]
                              )
                            ? Math.round(
                                results.untestedPositives[treatedIndex - 1] / 12
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">
                          {/* {t("results.sensitivityOfTriageTest")} */}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: t("results.sensitivityOfTriageTest"),
                            }}
                          />{" "}
                          {triageTest} {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(
                      results.percentMissedDueToSensitivityOfTriageTest
                    ) ?? "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenTriageDiagnosticTestTreat"
                            ? results.percentMissedDueToSensitivity[
                                treatedIndex - 1
                              ] !== undefined &&
                              !isNaN(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 1
                                ]
                              )
                              ? asPercent(
                                  results.percentMissedDueToSensitivity[
                                    treatedIndex - 1
                                  ]
                                )
                              : t("general.NA")
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.percentMissedDueToSensitivity[
                                treatedIndex - 2
                              ] !== undefined &&
                              !isNaN(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 2
                                ]
                              )
                              ? asPercent(
                                  results.percentMissedDueToSensitivity[
                                    treatedIndex - 2
                                  ]
                                )
                              : t("general.NA")
                            : results.percentMissedDueToSensitivity[
                                treatedIndex - 2
                              ] !== undefined &&
                              !isNaN(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 2
                                ]
                              )
                            ? asPercent(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 2
                                ]
                              )
                            : t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToSensitivityOfTriageTest?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenTriageDiagnosticTestTreat"
                            ? results.testedFalseNegatives[treatedIndex] !==
                                undefined &&
                              !isNaN(results.testedFalseNegatives[treatedIndex])
                              ? Math.round(
                                  results.testedFalseNegatives[treatedIndex] /
                                    12
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.testedFalseNegatives[treatedIndex -1] !==
                                undefined &&
                              !isNaN(results.testedFalseNegatives[treatedIndex -1])
                              ? Math.round(
                                  results.testedFalseNegatives[treatedIndex-1] /
                                    12
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.testedFalseNegatives[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(
                                results.testedFalseNegatives[treatedIndex - 1]
                              )
                            ? Math.round(
                                results.testedFalseNegatives[treatedIndex - 1] /
                                  12
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">
                          {t("results.lossAtColposcopy")} {" "}
                          {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(
                      results.percentMissedDueToLossAtDiagnosticTriage
                    ) ?? "N/A"} */}
                          {/* {asPercent(results.percentMissed[3]) ?? "N/A"} */}
                          {/* {results.scenario === "ScreenTreat"
                      ? "N/A"
                      : results.scenario === "ScreenTriageDiagnosticTestTreat"
                      ? results.percentMissed[treatedIndex - 1] !== undefined &&
                        !isNaN(results.percentMissed[treatedIndex - 1])
                        ? asPercent(results.percentMissed[treatedIndex - 1])
                        : "N/A"
                      : "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? results.percentMissed[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(results.percentMissed[treatedIndex - 1])
                              ? asPercent(
                                  results.percentMissed[treatedIndex - 1]
                                )
                              : t("general.NA")
                            : results.scenario ===
                                "ScreenTriageDiagnosticTestTreat" &&
                              results.percentMissed[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(results.percentMissed[treatedIndex - 1])
                            ? asPercent(results.percentMissed[treatedIndex - 1])
                            : t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToLossAtDiagnosticTriage?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {/* {results.untestedPositives[4]?.toLocaleString(locale) ??
                      "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? Math.round(
                                results.untestedPositives[treatedIndex] / 12
                              ).toLocaleString(locale)
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.untestedPositives[treatedIndex] !==
                                undefined &&
                              !isNaN(
                                results.untestedPositives[treatedIndex]
                              )
                              ? Math.round(
                                  results.untestedPositives[treatedIndex] /
                                    12
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : t("general.NA")}
                        </td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">
                          {/* {t("results.sensitivityOfDiagnosticTest")}{" "} */}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: t("results.sensitivityOfColposcopy"),
                            }}
                          />{" "}
                           {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(
                      results.percentMissedDueToSensitivityOfDiagnosticTriageTest
                    ) ?? "N/A"} */}

                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? asPercent(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 1
                                ]
                              )
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.percentMissedDueToSensitivity[
                                treatedIndex - 1
                              ] !== undefined &&
                              !isNaN(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 1
                                ]
                              )
                              ? asPercent(
                                  results.percentMissedDueToSensitivity[
                                    treatedIndex - 1
                                  ]
                                )
                              : t("general.NA")
                            : t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToSensitivityOfDiagnosticTriageTest?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}

                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? Math.round(
                                results.testedFalseNegatives[treatedIndex] / 12
                              ).toLocaleString(locale)
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.testedFalseNegatives[treatedIndex] !==
                                undefined &&
                              !isNaN(results.testedFalseNegatives[treatedIndex ])
                              ? Math.round(
                                  results.testedFalseNegatives[treatedIndex] /
                                    12
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : t("general.NA")}
                        </td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">{t("results.lossAtTreatment")}</th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(results.percentMissedDueToLossAtTreatment) ??
                      "N/A"} */}
                          {asPercent(results.percentMissed[treatedIndex]) ??
                            t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToLossAtTreatment?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {results.untestedPositives[treatedIndex + 1] !==
                            undefined &&
                          !isNaN(results.untestedPositives[treatedIndex + 1])
                            ? Math.round(
                                results.untestedPositives[treatedIndex + 1] / 12
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive data-export>
                    <thead>
                      <tr className="bg-success-dark text-light">
                        <th className="bg-success-dark text-light">{t("results.monthlyImpactOnResourcesTitle")}</th>
                        <th className="th-placeholder">Placeholder</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-light">
                        <th>{t("results.totalRequiringScreening")} {screenTest}{" "} {!isSpanish && t("general.test")}</th>
                        <td className="text-end text-nowrap">
                          {/* {results.totalNeededToScreen?.toLocaleString(locale) ??
                      "N/A"} */}

                          {Math.round(
                            parseInt(totalNeededToScreen.replace(/\D/g, "")) /
                              12
                          ) ? Math.round(
                            parseInt(totalNeededToScreen.replace(/\D/g, "")) /
                              12
                          ) :  t("general.NA")}{" "}
                        </td>
                      </tr>
                      <tr className="table-light">
                        <th>
                        {t("results.totalRequiringTriageDiagnostic")} {triageTest}{" "}
                        {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {results.totalNeededToTriage?.toLocaleString(locale) ??
                      "N/A"} */}
                          {Math.round(
                            parseInt(totalNeededToTriage.replace(/\D/g, "")) /
                              12
                          ) ? (Math.round(
                            parseInt(totalNeededToTriage.replace(/\D/g, "")) /
                              12
                          )) : t("general.NA")}{" "}
                        </td>
                      </tr>
                      <tr className="table-light">
                        <th>{t("results.totalRequiringColposcopyTest")}
                          <OverlayTrigger
                              overlay={
                                <Tooltip id="totalRequiringColposcopy-help">
                                  <span>{t("results.screeningColposcopyHelpText")}</span>
                                </Tooltip>
                              }
                            >
                              <span className="d-inline-block">
                                <i className="ms-1 bi bi-question-circle"></i>
                              </span>
                            </OverlayTrigger>
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {results.totalNeededToDiagnosticTriage?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}

                          {Math.round(
                            parseInt(
                              totalNeededToDiagnosticTriage.replace(/\D/g, "")
                            ) / 12
                          ) ? Math.round(
                            parseInt(
                              totalNeededToDiagnosticTriage.replace(/\D/g, "")
                            ) / 12
                          ) : t("general.NA")}{" "}
                        </td>
                      </tr>
                      <tr className="table-light">
                        <th>{t("results.totalRequiringTreatment")}</th>
                        <td className="text-end text-nowrap">
                          {/* {results.totalNeededToTreat?.toLocaleString(locale) ??
                      "N/A"} */}

                          {Math.round(
                            parseInt(totalNeededToTreat.replace(/\D/g, "")) / 12
                          )?Math.round(
                            parseInt(totalNeededToTreat.replace(/\D/g, "")) / 12
                          ) : t("general.NA")}{" "}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                  <div className="text-center">
                    <Button
                      onClick={() => exportResults('tab2Content')}
                      className="m-1"
                      variant="primary"
                    >
                      {t("results.exportResultsToPDF")}
                    </Button>
                    <Button
                      onClick={() => exportResultsExcel('tab2Content')}
                      className="m-1"
                      variant="primary"
                    >
                      {t("results.exportResultsToExcel")}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
              </div>
            </Tab>
            <Tab eventKey="tab3" title={t("general.programTables")}>
            <div id="tab3Content">
              <Card className="mb-4">
                <Card.Body>
                  <Card.Text className="small text-muted">
                    {t("results.lengthProgramHelpText")}
                  </Card.Text>
                  <Table hover responsive data-export>
                    <thead>
                      <tr className="bg-info-dark text-light">
                        <th className="bg-info-dark text-light">{t("results.targets")}</th>
                        <th className="th-placeholder">Placeholder</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-info">
                        <th>
                          {t("results.populationTargetedWithCoverageTitle")}
                        </th>
                        <td className="text-end text-nowrap">
                          {" "}
                          {results.populationTargeted !== undefined &&
                          !isNaN(results.populationTargeted)
                            ? Math.round(
                                results.populationTargeted *
                                  parseInt(params.screeningInterval)
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-info">
                        <th className="ps-3">
                          {t("results.populationTargetedWithoutPrecancer")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {results.healthyWomenTargetedForScreening?.toLocaleString(
                      locale
                    ) ?? t("general.NA")} */}
                          {results.testedFalsePositives[0] !== undefined &&
                          !isNaN(results.testedFalsePositives[0])
                            ? Math.round(
                                results.testedFalsePositives[0] *
                                  parseInt(params.screeningInterval)
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-info">
                        <th className="ps-3">
                          {t("results.populationTargetedWithPrecancer")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {results.precancersTargetedForScreening?.toLocaleString(
                      locale
                    ) ?? t("general.NA")} */}
                          {results.testedTruePositives[0] !== undefined &&
                          !isNaN(results.testedTruePositives[0])
                            ? Math.round(
                                results.testedTruePositives[0] *
                                  parseInt(params.screeningInterval)
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive data-export>
                    <thead>
                      <tr className="bg-warning-dark text-light">
                        <th className="bg-warning-dark text-light">{t("results.impactOnCervicalPrecancerTitle")}</th>
                        <th className="th-placeholder">Placeholder</th>
                        <th className="th-placeholder">Placeholder</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-warning">
                        <th>{t("results.percentPrecancersTreated")}</th>
                        <td className="text-end text-nowrap">
                          {asPercent(results.percentPrecancersTreated) ??
                            t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {!isNaN(
                            Math.round(
                              results.testedPositives[treatedIndex + 1]
                            )
                          )
                            ? Math.round(
                                results.testedPositives[treatedIndex + 1] *
                                  parseInt(params.screeningInterval)
                              )
                            : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-warning">
                        <th>
                          {t("results.percentPolulationTargetedOverTreated")}
                        </th>
                        <td className="text-end text-nowrap">
                          {asPercent(results.percentHealthyOvertreated) ??
                            t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {!isNaN(Math.round(results.healthyOvertreated))
                            ? Math.round(
                                results.healthyOvertreated *
                                  parseInt(params.screeningInterval)
                              )
                            : t("general.NA")}
                        </td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive data-export>
                    <thead>
                      <tr className="bg-danger-dark text-light">
                        <th className="bg-danger-dark text-light">{t("results.programMissedPrecancersTitle")}</th>
                        <th className="th-placeholder">Placeholder</th>
                        <th className="th-placeholder">Placeholder</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-danger">
                        <th>{t("results.totalPrecancersMissed")}</th>
                        <td className="text-end text-nowrap">
                          {asPercent(results.percentPrecancersMissed) ??
                            t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {results.numberPrecancersMissed !== undefined &&
                          !isNaN(results.numberPrecancersMissed)
                            ? Math.round(
                                results.numberPrecancersMissed *
                                  parseInt(params.screeningInterval)
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-danger">
                        <th>{t("results.sourcesMissedPrecancers")}</th>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr className="table-light">
                        <th className="ps-3">
                          {t("results.didNotHaveScreeningTest")} {screenTest}{" "}
                          {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(results.percentMissedDueToNoScreening) ?? "N/A"} */}
                          {asPercent(results.percentMissed[0]) ??
                            t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToNoScreening?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {results.untestedPositives[1] !== undefined &&
                          !isNaN(results.untestedPositives[1])
                            ? Math.round(
                                results.untestedPositives[1] *
                                  parseInt(params.screeningInterval)
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-light">
                        <th className="ps-3">
                          {/* {t("results.sensitivityOfScreeningTest")} */}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: t("results.sensitivityOfScreeningTest"),
                            }}
                          />{" "}
                          {screenTest} {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(
                      results.percentMissedDueToSensitivityOfScreeningTest
                    ) ?? "N/A"} */}
                          {asPercent(
                            results.percentMissedDueToSensitivity[0]
                          ) ?? t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToSensitivityOfScreeningTest?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {results.testedFalseNegatives[1] !== undefined &&
                          !isNaN(results.testedFalseNegatives[1])
                            ? Math.round(
                                results.testedFalseNegatives[1] *
                                  parseInt(params.screeningInterval)
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">
                          {t("results.lossAtTriageTest")} {triageTest}{" "}
                          {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(results.percentMissedDueToLossAtTriage) ?? "N/A"} */}
                          {/* {asPercent(results.percentMissed[1]) ?? "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenTriageDiagnosticTestTreat"
                            ? results.percentMissed[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(results.percentMissed[treatedIndex - 1])
                              ? asPercent(
                                  results.percentMissed[treatedIndex - 1]
                                )
                              : t("general.NA")
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.percentMissed[treatedIndex - 2] !==
                                undefined &&
                              !isNaN(results.percentMissed[treatedIndex - 2])
                              ? asPercent(
                                  results.percentMissed[treatedIndex - 2]
                                )
                              : t("general.NA")
                            : results.percentMissed[treatedIndex - 2] !==
                                undefined &&
                              !isNaN(results.percentMissed[treatedIndex - 2])
                            ? asPercent(results.percentMissed[treatedIndex - 2])
                            : t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToLossAtTriage?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {/* {results.untestedPositives[2]?.toLocaleString(locale) ??
                      "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenTriageDiagnosticTestTreat"
                            ? results.untestedPositives[treatedIndex] !==
                                undefined &&
                              !isNaN(results.untestedPositives[treatedIndex])
                              ? Math.round(
                                  results.untestedPositives[treatedIndex] *
                                    parseInt(params.screeningInterval)
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.untestedPositives[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(
                                results.untestedPositives[treatedIndex - 1]
                              )
                              ? Math.round(
                                  results.untestedPositives[treatedIndex - 1] *
                                    parseInt(params.screeningInterval)
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.untestedPositives[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(results.untestedPositives[treatedIndex -1 ])
                            ? Math.round(
                                results.untestedPositives[treatedIndex -1 ] *
                                  parseInt(params.screeningInterval)
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">
                          {/* {t("results.sensitivityOfTriageTest")} */}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: t("results.sensitivityOfTriageTest"),
                            }}
                          />{" "}
                          {triageTest} {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(
                      results.percentMissedDueToSensitivityOfTriageTest
                    ) ?? "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenTriageDiagnosticTestTreat"
                            ? results.percentMissedDueToSensitivity[
                                treatedIndex - 1
                              ] !== undefined &&
                              !isNaN(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 1
                                ]
                              )
                              ? asPercent(
                                  results.percentMissedDueToSensitivity[
                                    treatedIndex - 1
                                  ]
                                )
                              : t("general.NA")
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.percentMissedDueToSensitivity[
                                treatedIndex - 2
                              ] !== undefined &&
                              !isNaN(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 2
                                ]
                              )
                              ? asPercent(
                                  results.percentMissedDueToSensitivity[
                                    treatedIndex - 2
                                  ]
                                )
                              : t("general.NA")
                            : results.percentMissedDueToSensitivity[
                                treatedIndex - 2
                              ] !== undefined &&
                              !isNaN(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 2
                                ]
                              )
                            ? asPercent(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 2
                                ]
                              )
                            : t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToSensitivityOfTriageTest?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenTriageDiagnosticTestTreat"
                            ? results.testedFalseNegatives[treatedIndex] !==
                                undefined &&
                              !isNaN(results.testedFalseNegatives[treatedIndex])
                              ? Math.round(
                                  results.testedFalseNegatives[treatedIndex] *
                                    parseInt(params.screeningInterval)
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.testedFalseNegatives[treatedIndex -1 ] !==
                                undefined &&
                              !isNaN(
                                results.testedFalseNegatives[treatedIndex -1]
                              )
                              ? Math.round(
                                  results.testedFalseNegatives[
                                    treatedIndex -1 
                                  ] * parseInt(params.screeningInterval)
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.testedFalseNegatives[treatedIndex -1] !==
                                undefined &&
                              !isNaN(results.testedFalseNegatives[treatedIndex -1])
                            ? Math.round(
                                results.testedFalseNegatives[treatedIndex -1] *
                                  parseInt(params.screeningInterval)
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">
                          {t("results.lossAtColposcopy")} {" "}
                          {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(
                      results.percentMissedDueToLossAtDiagnosticTriage
                    ) ?? "N/A"} */}
                          {/* {asPercent(results.percentMissed[3]) ?? "N/A"} */}
                          {/* {results.scenario === "ScreenTreat"
                      ? "N/A"
                      : results.scenario === "ScreenTriageDiagnosticTestTreat"
                      ? results.percentMissed[treatedIndex - 1] !== undefined &&
                        !isNaN(results.percentMissed[treatedIndex - 1])
                        ? asPercent(results.percentMissed[treatedIndex - 1])
                        : "N/A"
                      : "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? results.percentMissed[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(results.percentMissed[treatedIndex - 1])
                              ? asPercent(
                                  results.percentMissed[treatedIndex - 1]
                                )
                              : t("general.NA")
                            : results.scenario ===
                                "ScreenTriageDiagnosticTestTreat" &&
                              results.percentMissed[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(results.percentMissed[treatedIndex - 1])
                            ? asPercent(results.percentMissed[treatedIndex - 1])
                            : t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToLossAtDiagnosticTriage?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {/* {results.untestedPositives[4]?.toLocaleString(locale) ??
                      "N/A"} */}
                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? Math.round(
                                results.untestedPositives[treatedIndex] *
                                  parseInt(params.screeningInterval)
                              ).toLocaleString(locale)
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.untestedPositives[treatedIndex] !==
                                undefined &&
                              !isNaN(
                                results.untestedPositives[treatedIndex]
                              )
                              ? Math.round(
                                  results.untestedPositives[treatedIndex] 
                             * parseInt(params.screeningInterval)
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : t("general.NA")}
                        </td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">
                          {/* {t("results.sensitivityOfDiagnosticTest")}{" "} */}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: t("results.sensitivityOfColposcopy"),
                            }}
                          />
                           {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(
                      results.percentMissedDueToSensitivityOfDiagnosticTriageTest
                    ) ?? "N/A"} */}

                          {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? asPercent(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 1
                                ]
                              )
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.percentMissedDueToSensitivity[
                                treatedIndex - 1
                              ] !== undefined &&
                              !isNaN(
                                results.percentMissedDueToSensitivity[
                                  treatedIndex - 1
                                ]
                              )
                              ? asPercent(
                                  results.percentMissedDueToSensitivity[
                                    treatedIndex - 1
                                  ]
                                )
                              : t("general.NA")
                            : t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToSensitivityOfDiagnosticTriageTest?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}

                    {results.scenario === "ScreenTreat"
                            ? t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenDiagnosticTestTreat"
                            ? results.testedFalseNegatives[treatedIndex] !==
                                undefined &&
                              !isNaN(results.testedFalseNegatives[treatedIndex])
                              ? Math.round(
                                  results.testedFalseNegatives[treatedIndex] * parseInt(params.screeningInterval)
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.scenario ===
                                "ScreenDiagnosticTestTreat" &&
                              results.checkedValues &&
                              results.checkedValues.length === 3 &&
                              results.checkedValues[2] ===
                                "ScreenTriageDiagnosticTestTreat"
                            ?  t("general.NA")
                            : results.scenario ===
                              "ScreenTriageDiagnosticTestTreat"
                            ? results.testedFalseNegatives[treatedIndex] !==
                                undefined &&
                              !isNaN(results.testedFalseNegatives[treatedIndex])
                              ? Math.round(
                                  results.testedFalseNegatives[treatedIndex] * parseInt(params.screeningInterval)
                                ).toLocaleString(locale)
                              : t("general.NA")
                            : results.testedFalseNegatives[treatedIndex - 1] !==
                                undefined &&
                              !isNaN(
                                results.testedFalseNegatives[treatedIndex - 1]
                              )
                            ? Math.round(
                                results.testedFalseNegatives[treatedIndex - 1] * parseInt(params.screeningInterval)
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>

                      <tr className="table-light">
                        <th className="ps-3">{t("results.lossAtTreatment")}</th>
                        <td className="text-end text-nowrap">
                          {/* {asPercent(results.percentMissedDueToLossAtTreatment) ??
                      "N/A"} */}
                          {asPercent(results.percentMissed[treatedIndex]) ??
                            t("general.NA")}
                        </td>
                        <td className="text-end text-nowrap">
                          {/* {results.numberMissedDueToLossAtTreatment?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}
                          {results.untestedPositives[treatedIndex + 1] !==
                            undefined &&
                          !isNaN(results.untestedPositives[treatedIndex + 1])
                            ? Math.round(
                                results.untestedPositives[treatedIndex + 1] *
                                  parseInt(params.screeningInterval)
                              ).toLocaleString(locale)
                            : t("general.NA")}
                        </td>
                      </tr>
                    </tbody>
                  </Table>

                  <Table hover responsive data-export>
                    <thead>
                      <tr className="bg-success-dark text-light">
                        <th className="bg-success-dark text-light">{t("results.impactOnResourcesTitle")}</th>
                        <th className="th-placeholder">Placeholder</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="table-light">
                        <th>{t("results.totalRequiringScreening")} {screenTest}{" "} {!isSpanish && t("general.test")}</th>
                        <td className="text-end text-nowrap">
                          {/* {results.totalNeededToScreen?.toLocaleString(locale) ??
                      "N/A"} */}

                          {Math.round(
                            parseInt(totalNeededToScreen.replace(/\D/g, "")) *
                              parseInt(params.screeningInterval)
                          ) ? Math.round(
                            parseInt(totalNeededToScreen.replace(/\D/g, "")) *
                              parseInt(params.screeningInterval)
                          ) :  t("general.NA")}{" "}
                        </td>
                      </tr>
                      <tr className="table-light">
                        <th>
                        {t("results.totalRequiringTriageDiagnostic")} {triageTest}{" "}
                        {!isSpanish && t("general.test")}
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {results.totalNeededToTriage?.toLocaleString(locale) ??
                      "N/A"} */}
                          {Math.round(
                            parseInt(totalNeededToTriage.replace(/\D/g, "")) *
                              parseInt(params.screeningInterval)
                          ) ? Math.round(
                            parseInt(totalNeededToTriage.replace(/\D/g, "")) *
                              parseInt(params.screeningInterval)
                          ) : t("general.NA") }{" "}
                        </td>
                      </tr>
                      <tr className="table-light">
                        <th>{t("results.totalRequiringColposcopyTest")}
                          <OverlayTrigger
                              overlay={
                                <Tooltip id="totalRequiringColposcopy-help">
                                  <span>{t("results.screeningColposcopyHelpText")}</span>
                                </Tooltip>
                              }
                            >
                              <span className="d-inline-block">
                                <i className="ms-1 bi bi-question-circle"></i>
                              </span>
                            </OverlayTrigger>
                        </th>
                        <td className="text-end text-nowrap">
                          {/* {results.totalNeededToDiagnosticTriage?.toLocaleString(
                      locale
                    ) ?? "N/A"} */}

                          {Math.round(
                            parseInt(
                              totalNeededToDiagnosticTriage.replace(/\D/g, "")
                            ) * parseInt(params.screeningInterval)
                          ) ? Math.round(
                            parseInt(
                              totalNeededToDiagnosticTriage.replace(/\D/g, "")
                            ) * parseInt(params.screeningInterval)
                          ) : t("general.NA")}
                        </td>
                      </tr>
                      <tr className="table-light">
                        <th>{t("results.totalRequiringTreatment")}</th>
                        <td className="text-end text-nowrap">
                          {/* {results.totalNeededToTreat?.toLocaleString(locale) ??
                      "N/A"} */}

                          {Math.round(
                            parseInt(totalNeededToTreat.replace(/\D/g, "")) *
                              parseInt(params.screeningInterval)
                          )? Math.round(
                            parseInt(totalNeededToTreat.replace(/\D/g, "")) *
                              parseInt(params.screeningInterval)
                          ) : t("general.NA")}{" "}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                  <div className="text-center">
                    <Button
                      onClick={() => exportResults('tab3Content')}
                      className="m-1"
                      variant="primary"
                    >
                      {t("results.exportResultsToPDF")}
                    </Button>
                    <Button
                      onClick={() => exportResultsExcel('tab3Content')}
                      className="m-1"
                      variant="primary"
                    >
                      {t("results.exportResultsToExcel")}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
              </div>
            </Tab>
            <Tab eventKey="tab4" title={t("general.graphs")}>
            <div id="tab4Content"  data-tab="tab4Content">
              <Card className="mb-3 d-none">
                <Card.Header>
                  <Card.Title data-export>
                    {/* {asLabel(params.scenario, scenarios)} */}
                    {t("general.scenarioParameters")}
                  </Card.Title>
                  <Card.Text className="small text-muted">
                    {t("general.scenarioAssumption")}
                  </Card.Text>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col lg={12}>
                      <Table hover responsive data-export>
                        <thead>
                          <tr className="bg-grey">
                            <th>{t("runScenario.epidemiological")}</th>
                            {/* Placeholder th simplifies pdf export (consistent row lengths) */}
                            <th className="th-placeholder">Placeholder</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th>{t("runScenario.numPeople")}</th>
                            <td className="text-end text-nowrap">
                              {params.populationSize?.toLocaleString(locale) ??
                                t("general.NA")}
                            </td>
                          </tr>
                          <tr>
                            <th>{t("about.hpvPrevelence")}</th>
                            <td className="text-end text-nowrap">
                            {asPercent(params.hpvPrevalence, 0) ??
                              t("general.NA")}
                            </td>
                          </tr>
                          <tr>
                            <th>{t("runScenario.prevelance")}</th>
                            <td className="text-end text-nowrap">
                              {asPercent(params.cinPrevalence, 0) ??
                                t("general.NA")}
                            </td>
                          </tr>
                          <tr>
                            <th>{t("runScenario.proportionOfPositives")}</th>
                            <td className="text-end text-nowrap">
                              {asPercent(params.proportionOfPositives, 0) ??
                                t("general.NA")}
                            </td>
                          </tr>
                        </tbody>
                      </Table>                      
                    </Col>
                    </Row>
                    <Row>
                    <Col lg={12}>
                      <Table hover responsive data-export>
                          <thead>
                            <tr className="bg-grey">
                              <th> {t("general.screening")}</th>
                              <th className="th-placeholder">Placeholder</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th>
                                {" "}
                                {t("runScenario.intervalofCervicalInYears")}
                              </th>
                              <td className="text-end text-nowrap">
                                {params.screeningInterval?.toLocaleString(
                                  locale
                                ) ?? t("general.NA")}
                              </td>
                            </tr>
                            <tr>
                              <th>{t("runScenario.percentScreeningCoverage")}</th>
                              <td className="text-end text-nowrap">
                                {asPercent(params.percentScreened, 0) ??
                                  t("general.NA")}
                              </td>
                            </tr>
                            <tr>
                              <th>{t("runScenario.cervicalScreeningTestChosen")}</th>
                              <td className="text-end text-nowrap">                          
                                {params.screeningTest === "pap" && t("runScenario.PapTest")}
                                {params.screeningTest === "ivaa" && t("runScenario.VIA")}
                                {params.screeningTest === "hpv" && t("runScenario.HPV")}
                                {params.screeningTest === "hpv16or18" && t("runScenario.HPV1618")}
                                {!["pap", "ivaa", "hpv", "hpv16or18"].includes(params.screeningTest) && t("general.NA")}                            
                              </td>
                            </tr>
                            <tr>
                              <th>{t("runScenario.screeningTestSenvitivity_norm")}</th>
                              <td className="text-end text-nowrap">
                                {asPercent(params.screeningTestSensitivity, 0) ??
                                  t("general.NA")}
                              </td>
                            </tr>
                            <tr>
                              <th>{t("runScenario.screeningTestSpecificity_norm")}</th>
                              <td className="text-end text-nowrap">
                                {asPercent(params.screeningTestSpecificity, 0) ??
                                  t("general.NA")}
                              </td>
                            </tr>
                          </tbody>
                        </Table>                      
                    </Col>
                  </Row>
                  {params.checkedValues?.length === 3 && params.checkedValues[2] === "ScreenTriageDiagnosticTestTreat" && (
                    <Row>
                      <Col lg={12}>
                        <Table hover responsive data-export>
                            <thead>
                              <tr className="bg-grey">
                                <th> {t("general.triage")}</th>
                                <th className="th-placeholder">Placeholder</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <th>
                                    {" "}
                                    {t("runScenario.percentScreeningPositiveWithTriage")}
                                </th>
                                <td className="text-end text-nowrap">
                                {asPercent(params.percentDiagnosticTriaged, 0) ??
                                  t("general.NA")}
                                </td>
                              </tr>
                              <tr>
                                <th>{t("runScenario.triageTestChosen")}</th>
                                <td className="text-end text-nowrap">                          
                                  {params.triageTest === "pap" && t("runScenario.PapTest")}
                                  {params.triageTest === "ivaa" && t("runScenario.VIA")}
                                  {params.triageTest === "hpv" && t("runScenario.HPV")}
                                  {params.triageTest === "hpv16or18" && t("runScenario.HPV1618")}
                                  {params.triageTest === "colposcopicImpression" && t("runScenario.impressionOfColposcopy")}
                                  {params.triageTest === "colposcopyWithBiopsy" && t("runScenario.colposcopyWithBiopsy")}
                                  {!["pap", "ivaa", "hpv", "hpv16or18", "colposcopicImpression", "colposcopyWithBiopsy"].includes(params.triageTest) && t("general.NA")}                            
                                </td>
                              </tr>
                              <tr>
                                <th>{t("runScenario.triageTestSensitivity_norm")}</th>
                                <td className="text-end text-nowrap">
                                  {asPercent(params.triageTestSensitivity, 0) ??
                                    t("general.NA")}
                                </td>
                              </tr>
                              <tr>
                                <th>{t("runScenario.screeningTestSpecificity_norm")}</th>
                                <td className="text-end text-nowrap">
                                  {asPercent(params.triageTestSpecificity, 0) ??
                                    t("general.NA")}
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                      </Col>
                    </Row>
                  )}
                  {params.checkedValues?.length === 3 && params.checkedValues[2] === "ScreenDiagnosticTestTreat" &&(<Row>
                    <Col lg={12}>
                      <Table hover responsive data-export>
                      <thead>
                            <tr className="bg-grey">
                              <th> {t("general.colposcopy")}</th>
                              <th className="th-placeholder">Placeholder</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th>
                                  {" "}
                                  {t("runScenario.percentofScreenPositivesWithColposcopy")}
                              </th>
                              <td className="text-end text-nowrap">
                              {asPercent(params.percentDiagnosticTriaged, 0) ??
                                t("general.NA")}
                              </td>
                            </tr>                            
                            <tr>
                              <th>{t("runScenario.colposcopyTestSensitivity_norm")}</th>
                              <td className="text-end text-nowrap">
                                {asPercent(params.triageTestSensitivity, 0) ??
                                  t("general.NA")}
                              </td>
                            </tr>
                            <tr>
                              <th>{t("runScenario.colposcopyTestSpecificity_norm")}</th>
                              <td className="text-end text-nowrap">
                                {asPercent(params.triageTestSpecificity, 0) ??
                                  t("general.NA")}
                              </td>
                            </tr>
                          </tbody>
                      </Table>
                    </Col>
                  </Row>)}
                  {params.checkedValues?.length === 4 &&(
                    <Row>
                    <Col lg={12}>
                        <Table hover responsive data-export>
                            <thead>
                              <tr className="bg-grey">
                                <th> {t("general.triage")}</th>
                                <th className="th-placeholder">Placeholder</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <th>
                                    {" "}
                                    {t("runScenario.percentScreeningPositiveWithTriage")}
                                </th>
                                <td className="text-end text-nowrap">
                                {asPercent(params.percentDiagnosticTriaged, 0) ??
                                  t("general.NA")}
                                </td>
                              </tr>
                              <tr>
                                <th>{t("runScenario.triageTestChosen")}</th>
                                <td className="text-end text-nowrap">                          
                                  {params.triageTest === "pap" && t("runScenario.PapTest")}
                                  {params.triageTest === "ivaa" && t("runScenario.VIA")}
                                  {params.triageTest === "hpv" && t("runScenario.HPV")}
                                  {params.triageTest === "hpv16or18" && t("runScenario.HPV1618")}
                                  {params.triageTest === "colposcopicImpression" && t("runScenario.impressionOfColposcopy")}
                                  {params.triageTest === "colposcopyWithBiopsy" && t("runScenario.colposcopyWithBiopsy")}
                                  {!["pap", "ivaa", "hpv", "hpv16or18", "colposcopicImpression", "colposcopyWithBiopsy"].includes(params.triageTest) && t("general.NA")}                            
                                </td>
                              </tr>
                              <tr>
                                <th>{t("runScenario.triageTestSensitivity_norm")}</th>
                                <td className="text-end text-nowrap">
                                  {asPercent(params.triageTestSensitivity, 0) ??
                                    t("general.NA")}
                                </td>
                              </tr>
                              <tr>
                                <th>{t("runScenario.screeningTestSpecificity_norm")}</th>
                                <td className="text-end text-nowrap">
                                  {asPercent(params.triageTestSpecificity, 0) ??
                                    t("general.NA")}
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                      </Col>
                      <Col lg={12}>
                        <Table hover responsive data-export>
                        <thead>
                              <tr className="bg-grey">
                                <th> {t("general.colposcopy")}</th>
                                <th className="th-placeholder">Placeholder</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <th>
                                    {" "}
                                    {t("runScenario.percentofScreenPositivesWithColposcopy")}
                                </th>
                                <td className="text-end text-nowrap">
                                {asPercent(params.percentTriaged, 0) ??
                                  t("general.NA")}
                                </td>
                              </tr>                            
                              <tr>
                                <th>{t("runScenario.colposcopyTestSensitivity_norm")}</th>
                                <td className="text-end text-nowrap">
                                  {asPercent(params.diagnosticTestSensitivity, 0) ??
                                    t("general.NA")}
                                </td>
                              </tr>
                              <tr>
                                <th>{t("runScenario.colposcopyTestSpecificity_norm")}</th>
                                <td className="text-end text-nowrap">
                                  {asPercent(params.diagnosticTestSpecificity, 0) ??
                                    t("general.NA")}
                                </td>
                              </tr>
                            </tbody>
                        </Table>
                      </Col>
                    </Row>
                    )}
                  
                  <Row>
                    <Col lg={12}>
                      <Table hover responsive data-export>
                        <thead>
                          <tr className="bg-grey">
                            <th> {t("general.treatment")}</th>
                            <th className="th-placeholder">Placeholder</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th>
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
                              }[params.scenario]
                            }  
                            </th>
                            <td className="text-end text-nowrap">
                            {asPercent(params.percentTreated, 0) ??
                              t("general.NA")}
                            </td>
                          </tr>                       
                          
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="mb-2">
                <Card.Header>
                  <Row>
                    <Col xl={6} lg={12} md={12} sm={12} xs={12}>
                      <Card.Title>{chartTiles}</Card.Title>
                    </Col>
                    <Col
                      xl={6}
                      lg={12}
                      md={12}
                      sm={12}
                      xs={12}
                      className="d-flex justify-content-end"
                    >
                      {/* <span className="howTo" onClick={handleModalShow}>
                      How to / Help
                    </span> */}
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body className="pt-1">
                  <Container fluid>
                    <Row className="my-2">
                      <Col xl={6} lg={12} md={12} sm={12} xs={12}>
                        <h2 className="text-center h5 py-2">
                          {barChartTitle1}
                        </h2>
                        <BarChart
                          id={ScreentestBarChartId}
                          data={[
                            {
                              label: t("general.screeningTestLabel"),
                              value:
                                parseInt(
                                  totalNeededToScreen.replace(/,/g, "")
                                ) || 0,
                            },
                          ]}
                          color="#95f4a2" // Set the color to blue
                          //layout={{ width: 450, height: 350 * 1.5 }} // Adjust the width and height as needed
                        />
                      </Col>

                      <Col xl={6} lg={12} md={12} sm={12} xs={12}>
                        <h2 className="text-center h5 py-2">
                          {barChartTitle2}
                        </h2>
                        <BarChart
                          id={barChartId}
                          data={[
                            {
                              label: t("general.triageTestLabel"),
                              value:
                                parseInt(
                                  totalNeededToTriage.replace(/,/g, "")
                                ) || 0,
                            },
                            {
                              label: t("general.colposcopy"),
                              value:
                                parseInt(
                                  totalNeededToDiagnosticTriage.replace(
                                    /,/g,
                                    ""
                                  )
                                ) || 0,
                            },
                            {
                              label: t("general.treatment"),
                              value:
                                parseInt(
                                  totalNeededToTreat.replace(/,/g, "")
                                ) || 0,
                            },
                          ]}
                          color="#0DAB61"
                          //layout={{ width: 450, height: 350 - 50 }} // Adjust the width and height as needed
                        />
                      </Col>
                    </Row>

                    <Row className="my-2">
                      <Col xl={6} lg={12} md={12} sm={12} xs={12}>
                        <h2 className="text-center h5 py-2">
                          {pieChartTitle1}
                        </h2>

                        <PieChart
                          id={pieChartId0}
                          data={[
                            {
                              label: t("results.pPrecencersMissed"),
                              value: +results.numberPrecancersMissed,
                            },
                            {
                              label: t("results.pPrecencersTreated"),
                              value: +results.testedPositives[treatedIndex + 1],
                            },
                          ]}
                          colors={["#D13C4B", "#FD7E14"]} // Pass the custom color palette to the PieChart component
                        />

                        {/* <Col md={12} className="d-flex justify-content-center">
                  <Button
                    variant="link"
                    onClick={() => handleExportSvg(pieChartId0)}
                  >
                    {t("general.exportSVG")}
                  </Button>
                  <Button variant="link" id="savePNG0" className="savePNG">
                    {t("general.exportPNG")}
                  </Button>
                </Col> */}
                      </Col>
                      <Col xl={6} lg={12} md={12} sm={12} xs={12}>
                        <h2 className="text-center h5 py-2">
                          {pieChartTitle2}
                        </h2>

                        <PieChart
                          id={pieChartId1}
                          data={[
                            {
                              label: t("results.populationNotOverTreated"),
                              //value: +results.testedFalsePositives[0],
                              value: +results.healthyNotOvertreated,
                            },
                            {
                              label: t("results.pPrecencersOverTreated"),
                              value: +results.healthyOvertreated_rounded,
                            },
                          ]}
                          colors={["#f7b885", "#FD7E14"]} // Pass the custom color palette to the PieChart component
                        />
                      </Col>
                    </Row>

                    {/* <Row className="justify-content-center">
                      <Col md={12} className="d-flex justify-content-center">
                        <Button variant="link" onClick={generateZipFileSVG}>
                          {t("general.exportSVG")}
                        </Button>
                        <Button variant="link" onClick={generateZipFilePNG}>
                          {t("general.exportPNG")}
                        </Button>
                      </Col>{" "}
                    </Row> */}
                    <Row className="justify-content-center">
                      <Col md={12} className="d-flex justify-content-center">
                        <Button
                          variant="primary"
                          onClick={generateZipFileSVG}
                          className="mx-2"
                        >
                          {t("general.exportSVG")}
                        </Button>
                        <Button
                          variant="primary"
                          onClick={generateZipFilePNG}
                          className="mx-2"
                        >
                          {t("general.exportPNG")}
                        </Button>
                      </Col>
                    </Row>
                  </Container>
                </Card.Body>
              </Card>

              {/* pdf page break */}
              <hr className="d-none" data-export />
              </div>
            </Tab>
          </Tabs>
        </div>

        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>How to / Help</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Add your help content here */}
            {/* You can also include a button to close the modal */}
            <Button variant="primary" onClick={handleModalClose}>
              Close
            </Button>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}
