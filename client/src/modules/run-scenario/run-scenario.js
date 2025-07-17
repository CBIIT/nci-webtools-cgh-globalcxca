import { useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
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

import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

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
  triageTests_nogynotype,
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
  let hpvScreeningUsed;
  const results = runModel(form);
  const params = mapValues(form, asNumber);
  //console.log("run params", params);
  //console.log("params.checkedValues ,", params.checkedValues);
  //console.log("params.screeningTest  ", params.screeningTest);
  //console.log("params.triageTest ", params.triageTest);
  //console.log("tests ", tests);
  setParams(params);
  setResults(results);
  const [hpv16or18Used, setHpv16or18Used] = useState(false); // Initialize with false
  const [hpvUsed, setHpvUsed] = useState(false); // Initialize with false
  const [hpv16or18GenotypingTriageUsed, setHpv16or18GenotypingTriageUsed] = useState(false); // Initialize with false
  const [storedPercentTriaged, setStoredPercentTriaged] = useState(null);
  const [storedPercentDiagnosticTriaged, setStoredPercentDiagnosticTriaged] = useState(null);

  // Ranged Slider
  const [rangeValues, setRangeValues] = useState([30, 49]); // Initial range values
  const resetSlider = () => {
    setRangeValues([30, 49]); // Reset to the desired default value
  };

  useEffect(() => {
    if (
      params.checkedValues &&
      params.checkedValues.length === 3 &&
      params.screeningTest === "hpv" &&
      params.triageTest === "hpv16or18genotyping"
    ) {
      setHpv16or18Used(true);
    } else {
      setHpv16or18Used(false);
    }

    if (
      params.checkedValues &&
      (params.checkedValues.length === 3 ||  params.checkedValues.length === 4 )&&
      params.triageTest === "hpv16or18genotyping"
    ) {
      setHpv16or18GenotypingTriageUsed(true);
    } else {
      setHpv16or18GenotypingTriageUsed(false);
    }

    if (
      params.screeningTest === "hpv" ||
      params.screeningTest === "hpv16or18"
    ) {
      setHpvUsed(true);
    } else {
      setHpvUsed(false);
    }
  }, [params.screeningTest, params.triageTest]);

  // Update 'Interval of cervical screening, when ages initiating changes'
  /*
  useEffect(() => {
    if (form.agesInitEndScreening && form.agesInitEndScreening !== form.screeningInterval) {
      //alert(form.agesInitEndScreen) // CMS
      setForm((prevForm) => ({
        ...prevForm,
        screeningInterval: form.agesInitEndScreening,
      }));
    }
  }, [form.agesInitEndScreening, form.screeningInterval, form.agesInitEndScreen]);
  */

  useEffect(() => {
    let diffVal = (rangeValues[1] - rangeValues[0]) + 1;
    if (diffVal !== form.screeningInterval) {
      //alert(diffVal) // CMS
      setForm((prevForm) => ({
        ...prevForm,
        screeningInterval: diffVal,
      }));
    }
  }, [rangeValues]);


  //console.log("hpv16or18Used -- ", hpv16or18Used);
  //console.log("hpvUsed -- ", hpvUsed);
  if (hpv16or18Used) {
    setParams((prevParams) => ({
      ...prevParams,
      percentDiagnosticTriaged: 100,
    }));
  }
  //console.log("hpv16or18Used -- ", hpv16or18Used);
  //console.log("hpv16or18GenotypingTriageUsed ", hpv16or18GenotypingTriageUsed);
  function handleSubmit(event) {
    event?.preventDefault();
    const params = mapValues(form, asNumber);
    const results = runModel(params);
    setParams(params);
    setResults(results);
    // window.scrollTo(0, 0);
    // navigate("results");
  }

  function handleChange(e, index) {
    const { name, value, checked } = e.target;
    //console.log("checked", checked);
    //console.log("value +++++++", value);
    // console.log("name ++++++++", name);
    // console.log("PARAMS ++++ ", params);
    // console.log("params.checkedValues ", params.checkedValues)
    // console.log("hpvPrevalence ", params.hpvPrevalence);

    let updatedValues = [...checkedValues];
    let newDivVisibilities = [...divVisibilities];

    if (name === "ScreenTreat" || name === "Treatment") {
      // Toggle visibility of "ScreenTreat" and "Treatment"
      newDivVisibilities[index] = !newDivVisibilities[index];
      newDivVisibilities[scenarios.length - 1] = true; // Keep "Treatment" always open
    } else {
      if (checked) {
        //console.log("CHECKED VALUE ", value);
      
        
        // Add the checked value to the array
        updatedValues.push(value);
        
        //console.log("updatedValues--------- ", updatedValues)

        // if (updatedValues.length === 3 && value === "ScreenDiagnosticTestTreat") {
        //   setForm((prevForm) => ({
        //     ...prevForm,
        //     triageTest: "colposcopyWithBiopsy",
        //     triageTestSensitivity: 80,
        //     triageTestSpecificity: 85,
        //   }));
        // }

        // if (updatedValues.length === 4) {
        //   setForm((prevForm) => ({
        //     ...prevForm,
        //     diagnosticTest: "colposcopyWithBiopsy",
        //     diagnosticTestSensitivity: 80,
        //     diagnosticTestSpecificity: 85,
        //   }));
        // }


        if (updatedValues.length === 3 && updatedValues.includes("ScreenDiagnosticTestTreat")) {
          //console.log("RESTORE COLPOSCOPY VALUES");
          setForm((prevForm) => ({
              ...prevForm,
              diagnosticTest: prevForm.diagnosticTest || "colposcopyWithBiopsy",
              diagnosticTestSensitivity: prevForm.diagnosticTestSensitivity || 80,
              diagnosticTestSpecificity: prevForm.diagnosticTestSpecificity || 85,
              percentDiagnosticTriaged: prevForm.percentDiagnosticTriaged , // Keep the previous value or default
          }));
      }

      if (updatedValues.length === 3 && updatedValues.includes("ScreenTriageDiagnosticTestTreat")) {
          //console.log("RESTORE TRIAGE VALUES");
          setForm((prevForm) => ({
              ...prevForm,
              triageTest: prevForm.triageTest || "ivaa",
              triageTestSensitivity: prevForm.triageTestSensitivity || 60,
              triageTestSpecificity: prevForm.triageTestSpecificity || 84,
              percentTriaged: prevForm.percentTriaged , // Keep the previous value or default
          }));
      }

      if (updatedValues.length === 4 ) {
        //console.log("RESTORE ALL VALUES");
        setForm((prevForm) => ({
            ...prevForm,
            diagnosticTest: prevForm.diagnosticTest || "colposcopyWithBiopsy",
            diagnosticTestSensitivity: prevForm.diagnosticTestSensitivity || 80,
            diagnosticTestSpecificity: prevForm.diagnosticTestSpecificity || 85,
            percentTriaged: storedPercentTriaged || 0, // Keep the previous value or default
        }));
    }

        // Update visibility of the div corresponding to the checked checkbox
        newDivVisibilities = newDivVisibilities.map((_, i) =>
          i === index || i === scenarios.length - 1 ? true : false
        );
        //console.log("newDivVisibilities ", newDivVisibilities)
      } else {
        // Remove the unchecked value from the array
        updatedValues = updatedValues.filter((val) => val !== value);
        // Hide the div of the unchecked checkbox
        newDivVisibilities[index] = false;

        // if (value === "ScreenDiagnosticTestTreat") {
        //   setForm((prevForm) => ({
        //     ...prevForm,
        //     triageTest: "",
        //     triageTestSensitivity: 0,
        //     triageTestSpecificity: 0,
        //   }));
        // }

        // if (value === "ScreenTriageDiagnosticTestTreat" || updatedValues.length < 4) {
        //   setForm((prevForm) => ({
        //     ...prevForm,
        //     diagnosticTest: "",
        //     diagnosticTestSensitivity: 0,
        //     diagnosticTestSpecificity: 0,
        //   }));
        // }
        if (value === "ScreenTriageDiagnosticTestTreat") {
          //console.log("UNCHECKING TRIAGE");
          setStoredPercentTriaged(form.percentTriaged); // Store the current value
          setForm((prevForm) => ({
              ...prevForm,
              percentDiagnosticTriaged: prevForm.percentDiagnosticTriaged || 73, // Preserve the colposcopy percent value
              triageTestSensitivity: prevForm.triageTestSensitivity,
              triageTestSpecificity: prevForm.triageTestSpecificity,
              percentTriaged: prevForm.percentTriaged, // Preserve the triage percent value
          }));
      } else if (value === "ScreenDiagnosticTestTreat") {
          //console.log("UNCHECKING COLPOSCOPY");
          setStoredPercentTriaged(form.percentTriaged); // Store the current value
          setForm((prevForm) => ({
              ...prevForm,
              diagnosticTestSensitivity: prevForm.diagnosticTestSensitivity,
              diagnosticTestSpecificity: prevForm.diagnosticTestSpecificity,
              percentDiagnosticTriaged: prevForm.percentDiagnosticTriaged, // Preserve the colposcopy percent value
          }));
      }

      }
    }

    //console.log("FORM ---- ", form);
    //console.log("updatedValues ", updatedValues);

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
      if (value === "hpv" || value === "hpv16or18") {
        // console.log(
        //   "HPV IS SELECTED FOR SCREENING TEST !!!!!!!!!! -----------------"
        // );
        //const updatedSpecificity = 100 - params.hpvPrevalence;
        const updatedSpecificity = (
          (1 -
            (form.hpvPrevalence / 100) * (form.proportionOfPositives / 100)) *
          100
        ).toFixed(1);
        //console.log("updatedSpecificity ", updatedSpecificity);
        setForm((prevForm) => ({
          ...prevForm,
          screeningTestSensitivity: tests[value]?.sensitivity || "",
          screeningTestSpecificity: updatedSpecificity,
        }));
      } else {
        setForm((prevForm) => ({
          ...prevForm,
          screeningTestSensitivity: tests[value]?.sensitivity || "",
          screeningTestSpecificity: tests[value]?.specificity || "",
        }));
      }
    }

    if (name === "triageTest") {
      //console.log("TRIAGE SELECTED");
      if(value === "hpv16or18genotyping"){
        //console.log("tests[value] ", tests[value]);
        const updatedSpecificity = (
          (1 -
            (form.hpvPrevalence / 100) * (form.proportionOfPositives / 100)) *
          100
        ).toFixed(1);
        setForm((prevForm) => ({
          ...prevForm,
          triageTestSensitivity: tests[value]?.sensitivity || "",
          triageTestSpecificity: updatedSpecificity,
        }));
      } else {
        setForm((prevForm) => ({
          ...prevForm,
          triageTestSensitivity: tests[value]?.sensitivity || "",
          triageTestSpecificity: tests[value]?.specificity || "",
        }));
      }
      

     // If VIA or PAP is selected in triageTest and screeningTest is the same, reset screeningTest
     if (value === "ivaa" && form.screeningTest === "ivaa") {
        setForm((prevForm) => ({
          ...prevForm,
          screeningTest: '',
        }));
      } else if (value === "pap" && form.screeningTest === "pap") {
        setForm((prevForm) => ({
          ...prevForm,
          screeningTest: '',
        }));
      }
  

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
    // Calculate updated specificity when HPV is selected as screening test
    if (form.screeningTest === "hpv" || form.screeningTest === "hpv16or18") {
      const updatedSpecificityHPV1618 = (
        (1 - (form.hpvPrevalence / 100) * (form.proportionOfPositives / 100)) *
        100
      ).toFixed(1);
      const updatedSpecificityHPV = (
        (1 - (form.hpvPrevalence / 100) ) *
        100
      ).toFixed(1);
      if(form.screeningTest === "hpv16or18" ){
        setForm((prevForm) => ({
          ...prevForm,
          screeningTestSensitivity: tests.hpv16or18?.sensitivity || 0,
          screeningTestSpecificity: updatedSpecificityHPV1618,
        }));
      } else {
        setForm((prevForm) => ({
          ...prevForm,
          screeningTestSensitivity: tests.hpv?.sensitivity || 0,
          screeningTestSpecificity: updatedSpecificityHPV,
        }));
      }
      
    } else {
      // Set specificity based on the selected screening test
      setForm((prevForm) => ({
        ...prevForm,
        screeningTestSensitivity: tests[form.screeningTest]?.sensitivity || 0,
        screeningTestSpecificity: tests[form.screeningTest]?.specificity || 0,
      }));
    }
    if (hpv16or18GenotypingTriageUsed) {
      const updatedSpecificity = (
        (1 - (form.hpvPrevalence / 100) * (form.proportionOfPositives / 100)) *
        100
      ).toFixed(1);
      setForm((prevForm) => ({
        ...prevForm,
        triageTestSensitivity: tests.hpv16or18genotyping?.sensitivity || 10,
        triageTestSpecificity: updatedSpecificity,
      }));
    } else {
      // Set specificity based on the selected screening test
      setForm((prevForm) => ({
        ...prevForm,
        triageTestSensitivity: tests[form.triageTest]?.sensitivity || 0,
        triageTestSpecificity: tests[form.triageTest]?.specificity || 0,
      }));
    }
  }, [
    form.hpvPrevalence,
    form.proportionOfPositives,
    form.screeningTest,
    form.triageTest,
    hpv16or18GenotypingTriageUsed,
    setForm,
  ]);

  function initStates() {
    setCheckedValues(["ScreenTreat", "Treatment"]);
    const initialDivVisibilities = [true, false, false, true]; // Set index 1 and 3 to true
    setDivVisibilities(initialDivVisibilities);
  }

  // useEffect(() => {
  //   if (checkedValues.length <= 2) {
  //     setForm((prevForm) => ({
  //       ...prevForm,
  //       scenario: "ScreenTreat",
  //       checkedValues: checkedValues,
  //       percentTriaged: 10,
  //     }));
  //   } else if (checkedValues.length === 3) {
  //     setForm((prevForm) => ({
  //       ...prevForm,
  //       scenario: "ScreenDiagnosticTestTreat",
  //       checkedValues: checkedValues,
  //       percentTriaged: 0,
  //     }));
  //   } else {
  //     setForm((prevForm) => ({
  //       ...prevForm,
  //       scenario: "ScreenTriageDiagnosticTestTreat",
  //       checkedValues: checkedValues,
  //     }));
  //   }
  // }, [checkedValues, setForm]);

  ////////////////////////////////////////////////////////
  // Refs to store previous triage and diagnostic values
  const storedPercentTriagedRef = useRef(null); // Store percentTriaged from 4th state
  const storedPercentDiagnosticTriagedRef4State = useRef(null); // Store percentTriaged from 4th state
  const storedPecentaTriageRef4State = useRef(null); // Store percentTriaged from 4th state
  const storePercentTriageDiagnosticRef3State = useRef(null); // Store percentDiagnosticTriaged from 3rd state
  const previousStatesRef = useRef([]); // Queue to store the last three states
  const [hasSwapped, setHasSwapped] = useState(false); // Swap control flag

  useEffect(() => {
    //console.log("Current checkedValues.length:", checkedValues.length);
    //console.log("Previous States Queue:", previousStatesRef.current); // Debug the queue

    if (checkedValues.length === 4) {
      if (form.percentTriaged === 0 && !hasSwapped) {
        //console.log("Entering 4 states, swapping values...");
        handleStoreAndSwapValues();
      } else if (form.percentTriaged !== 0 && !hasSwapped) {
        //console.log("Restoring values for 4 states...");
        handleSwapBackValues();
      }
    } else {
      resetScenario(); // Handle scenarios with fewer than 4 states
    }
    //console.log("===StoredpercentTriaged:", storedPercentTriagedRef.current);


    // Update the previous states queue
    updatePreviousStatesQueue(checkedValues.length);
  }, [checkedValues]);

  // Function to update the previous states queue (max 3 states)
  const updatePreviousStatesQueue = (currentState) => {
    const queue = previousStatesRef.current;

    // Add the current state to the queue
    queue.push(currentState);

    // Keep only the last three states in the queue
    if (queue.length > 3) {
      queue.shift(); // Remove the oldest state
    }

    //console.log("Updated Previous States Queue:", queue);
  };

  // Store and swap values for the 4th state
  const handleStoreAndSwapValues = () => {
    //console.log("Storing percentDiagnosticTriaged");

    if (storedPercentTriagedRef.current === null) {
      storedPercentTriagedRef.current = form.percentDiagnosticTriaged || 0;
      //console.log("StoredpercentTriaged:", storedPercentTriagedRef.current);
    }

    setForm((prevForm) => ({
      ...prevForm,
      checkedValues: checkedValues,
      scenario: "ScreenTriageDiagnosticTestTreat",
      percentTriaged: form.percentDiagnosticTriaged, // Use diagnostic value as triaged
      percentDiagnosticTriaged: 0, // Reset diagnostic triaged
    }));
    setHasSwapped(true); // Prevent multiple swaps
  };

  // Swap values back when returning to 4 states
  const handleSwapBackValues = () => {
    //console.log("Swapping back values...");

    setForm((prevForm) => ({
      ...prevForm,
      checkedValues: checkedValues,
       scenario: "ScreenTriageDiagnosticTestTreat",
      percentTriaged: form.percentDiagnosticTriaged, // Restore triaged value
      percentDiagnosticTriaged: storedPercentDiagnosticTriagedRef4State.current || 0, // Restore stored diagnostic value
    }));
    setHasSwapped(true); // Prevent multiple swaps
  };

  // Reset scenarios and manage state transitions
  const resetScenario = () => {
    //console.log("Resetting scenario. Previous states:", previousStatesRef.current);
    //console.log("StoredpercentTriaged: ==== ", storedPercentTriagedRef.current);
    const [thirdLastState, secondLastState, lastState] = previousStatesRef.current;

    // Handle transition from 4 to 3 states
    if (lastState === 4 && checkedValues.length === 3) {
      //console.log("Transitioning from 4 to 3 states...");
      storedPercentDiagnosticTriagedRef4State.current = form.percentDiagnosticTriaged;
      storedPecentaTriageRef4State.current = form.percentTriaged;
      setForm((prevForm) => ({
        ...prevForm,
        percentDiagnosticTriaged: form.percentTriaged || 0, // Set diagnostic to triaged
        percentTriaged: 0, // Reset triaged value
      }));
    }

    // Handle transition from 3 to a previous 4 state
    if (secondLastState === 3 && lastState === 4) {
      //console.log("Restoring values from the previous 3-state...");
      storePercentTriageDiagnosticRef3State.current = form.percentDiagnosticTriaged;
      setForm((prevForm) => ({
        ...prevForm,
        percentTriaged: form.percentDiagnosticTriaged || 0, // Restore triaged from diagnostic
        percentDiagnosticTriaged: storedPecentaTriageRef4State.current || 0, // Restore stored value
      }));
    }

      // Handle 2 → 3 → 2 state transition
      if (secondLastState === 2 && lastState === 3) {
        //console.log("Handling 2 → 3 → 2 transition...");
        //storedPercentTriagedRef.current = form.percentDiagnosticTriaged; // Store before resetting
        //console.log("StoredpercentTriaged:", storedPercentTriagedRef.current);
        setForm((prevForm) => ({
          ...prevForm,
          percentTriaged: 0,
          percentDiagnosticTriaged: storedPercentTriagedRef.current || 0,
        }));
      }

    setHasSwapped(false); // Allow future swaps

    // Handle other scenarios
    if (checkedValues.length <= 2) {
      //console.log("Switching to ScreenTreat scenario...");
      storedPercentTriagedRef.current = form.percentDiagnosticTriaged;
      setForm((prevForm) => ({
        ...prevForm,
        scenario: "ScreenTreat",
        checkedValues: checkedValues,
        percentTriaged: 10, // Default for screening
        percentDiagnosticTriaged: 0, // Reset for diagnostic case
      }));
    } else if (checkedValues.length === 3) {
      //console.log("Switching to ScreenDiagnosticTestTreat scenario...");
      setForm((prevForm) => ({
        ...prevForm,
        scenario: "ScreenDiagnosticTestTreat",
        checkedValues: checkedValues,
        percentTriaged: 0, // Reset for diagnostic case
      }));
    } else {
      //console.log("Switching to ScreenTriageDiagnosticTestTreat scenario...");
      setForm((prevForm) => ({
        ...prevForm,
        checkedValues: checkedValues,
        scenario: "ScreenTriageDiagnosticTestTreat",
      }));
    }
  };

  ////////////////////////////////////////////////////////
  useEffect(() => {
    // Set the initial checked value to "Screening Test"
    initStates();
  }, []);

  // Function to handle language change
  function handleLanguageChange(newLanguage) {
    i18n.changeLanguage(newLanguage);
  }

  function handleReset(event) {
    event.preventDefault();
    initStates();
    window.scrollTo(0, 0);
    resetSlider(); // for ranged slider
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

  const filteredTriageTests = triageTests.filter(
    (test) => test.value !== form.screeningTest
  );

  const isTriageTestDisabled = (value) => {
    if (form.screeningTest === "pap" && value === "pap") return true;
    if (form.screeningTest === "ivaa" && value === "ivaa") return true;
    if (form.screeningTest === "hpv" && value === "hpv16or18genotyping")
      return true;
    if (form.screeningTest === "hpv16or18" && value === "hpv16or18genotyping")
      return true;
    return false;
  };

  const isScreeningTestDisabled = (value) => {
    if (form.triageTest === 'pap' && value === 'pap') return true;
    if (form.triageTest === 'ivaa' && value === 'ivaa') return true;
    if (form.triageTest === 'hpv16or18genotyping' && (value === 'hpv' || value === 'hpv16or18')) return true;
    return false;
  };

  return (
    <div className="bg-light py-2">
      {/* <Container> */}
      <div className="mx-3">
        <Row className="mb-2 mt-0">
          <Col md={12}>
            {" "}
            <span
              className="text-danger"
              dangerouslySetInnerHTML={{
                __html: t("runScenario.pleaseRefer"),
              }}
            />
          </Col>
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
                        <Form.Group as={Row} controlId="hpvPrevalence">
                          <Col lg={6} md={12} sm={12} xs={12}>
                            <Form.Label column sm={12}>
                              <span>{t("about.hpvPrevelence")}</span>
                              <OverlayTrigger
                                overlay={
                                  <Tooltip id="hpvPrevalence-help">
                                    {t("runScenario.HPVHelpText")}
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
                                min="5"
                                max="30"
                                step="1"
                                placeholder="Enter 5 - 30"
                                name="hpvPrevalence"
                                className="border-end-0 me-2"
                                value={form.hpvPrevalence}
                                onChange={handleChange}
                                onWheel={(e) => e.target.blur()}
                                required
                              />
                              <span className="text-nowrap">
                                {form.hpvPrevalence}%
                              </span>
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
                                min="1"
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
                      <Row className="ps-3">
                        <Form.Group as={Row} controlId="proportionOfPositives">
                          <Col lg={6} md={12} sm={12} xs={12}>
                            <Form.Label column sm={12}>
                              <span>
                                {t("runScenario.proportionOfPositives")}
                              </span>
                              <OverlayTrigger
                                overlay={
                                  <Tooltip id="proportionOfPositives-help">
                                    {t("runScenario.proportionOfPositivesInfo")}
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
                                min="10"
                                max="40"
                                step="1"
                                placeholder="Enter 10 - 40"
                                name="proportionOfPositives"
                                className="border-end-0 me-2"
                                value={form.proportionOfPositives}
                                onChange={handleChange}
                                onWheel={(e) => e.target.blur()}
                                required
                              />
                              <span className="text-nowrap">
                                {form.proportionOfPositives}%
                              </span>
                            </InputGroup>
                          </Col>
                        </Form.Group>
                      </Row>
                      <Row className="ps-3">
                        <Form.Group as={Row} controlId="agesInitEndScreening">
                          <Col lg={6} md={12} sm={12} xs={12}>
                            <Form.Label column sm={12}>
                              <span>
                                {t("runScenario.agesInitEndScreening")}
                              </span>
                              <OverlayTrigger
                                overlay={
                                  <Tooltip id="agesInitEndScreening-help">
                                    {t("runScenario.agesInitEndScreeningInfo")}
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
                            <Slider name="agesInitEndScreen" id="agesInitEndScreen"
                                min={25}
                                max={60}
                                step={1}
                                defaultValue={[30, 49]}
                                trackStyle={{ backgroundColor: '#537B90', height: 8 }} // Customize track height
                                railStyle={{ backgroundColor: '#EAECEF', height: 8 }} // Customize rail height
                                //handleStyle={{ backgroundColor: '#437D92', borderColor: '#437D92', height: 16, width: 16, marginTop: -3 }} // Adjust handle if needed
                                //trackStyle={{ backgroundColor: '#437D92'}}
                                handleStyle={{backgroundColor: '#537B90', 
                                  borderColor: '#537B90',
                                  width: '16px',  // Adjust the width
                                  height: '16px', // Adjust the  height
                                  borderRadius: '50%',
                                  opacity: 1.0}}
                                onChange={setRangeValues} // Update state on change
                                allowCross={false} // Prevent handles from crossing
                                range 
                              />
                              <br />
                              <span className="text-nowrap">
                                {rangeValues[0]}{"-"}{rangeValues[1]}{" "}
                                {t("general.years")}
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
                            {t("runScenario.pleaseChooseStrategies")}
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
                                                      disabled={isScreeningTestDisabled(m.value)}
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
                                                  <span
                                                    dangerouslySetInnerHTML={{
                                                      __html: t(
                                                        "runScenario.screeningTestSenvitivity"
                                                      ),
                                                    }}
                                                  />
                                                  {/* <span>
                                                    {t(
                                                      "runScenario.screeningTestSenvitivity0"
                                                    )}{" "}
                                                    <Link to="/about#sst">
                                                      {t(
                                                        "runScenario.sensitivity"
                                                      )}
                                                    </Link>{" "}
                                                    {t(
                                                      "runScenario.screeningTestSenvitivity1"
                                                    )}
                                                  </span> */}
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
                                                <InputGroup
                                                  className={`flex-nowrap`}
                                                >
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
                                                  {/* <span>
                                                    {t(
                                                      "runScenario.screeningTestSpecificity"
                                                    )}
                                                  </span> */}
                                                  <span
                                                    dangerouslySetInnerHTML={{
                                                      __html: t(
                                                        "runScenario.screeningTestSpecificity"
                                                      ),
                                                    }}
                                                  />
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="screeningTestSpecificity-help">
                                                        {t(
                                                          "general.specificityHelpText"
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
                                                <InputGroup
                                                  className={`flex-nowrap ${
                                                    hpv16or18Used || hpvUsed
                                                      ? "grayed-out"
                                                      : ""
                                                  }`}
                                                >
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
                                                    {/* <span>
                                                      {t(
                                                        "runScenario.triageTestSensitivity"
                                                      )}
                                                    </span> */}
                                                    <span
                                                      dangerouslySetInnerHTML={{
                                                        __html: t(
                                                          "runScenario.triageTestSensitivity"
                                                        ),
                                                      }}
                                                    />
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="triageTestSpecificity-help">
                                                          {t(
                                                            "general.specificityHelpText"
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
                                                    {/* <span>
                                                      {t(
                                                        "runScenario.triageTestSpecificity"
                                                      )}
                                                    </span> */}
                                                    <span
                                                      dangerouslySetInnerHTML={{
                                                        __html: t(
                                                          "runScenario.triageTestSpecificity"
                                                        ),
                                                      }}
                                                    />
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="triageTestSpecificity-help">
                                                          {t(
                                                            "general.specificityHelpText"
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
                                                  {/* <InputGroup className="flex-nowrap"> */}
                                                  <InputGroup
                                                  className={`flex-nowrap ${
                                                    hpv16or18GenotypingTriageUsed
                                                      ? "grayed-out"
                                                      : ""
                                                  }`}
                                                >
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
                                                    {/* <span>
                                                      {t(
                                                        "runScenario.triageTestSensitivity"
                                                      )}
                                                    </span> */}
                                                    <span
                                                      dangerouslySetInnerHTML={{
                                                        __html: t(
                                                          "runScenario.triageTestSensitivity"
                                                        ),
                                                      }}
                                                    />
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="triageTestSpecificity-help">
                                                          {t(
                                                            "general.specificityHelpText"
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
                                                    {/* <span>
                                                      {t(
                                                        "runScenario.triageTestSpecificity"
                                                      )}
                                                    </span> */}
                                                    <span
                                                      dangerouslySetInnerHTML={{
                                                        __html: t(
                                                          "runScenario.triageTestSpecificity"
                                                        ),
                                                      }}
                                                    />
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="triageTestSpecificity-help">
                                                          {t(
                                                            "general.specificityHelpText"
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
                                                  {/* <InputGroup className="flex-nowrap">
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
                                                  </InputGroup> */}
                                                  <InputGroup
                                                    className={`flex-nowrap ${
                                                      hpv16or18Used
                                                        ? "grayed-out"
                                                        : ""
                                                    }`}
                                                  >
                                                    <Form.Range
                                                      type="number"
                                                      min="0"
                                                      max="100"
                                                      step="1"
                                                      className="border-end-0 me-2"
                                                      placeholder="Enter 0 - 100"
                                                      name="percentDiagnosticTriaged"
                                                      value={
                                                        hpv16or18Used
                                                          ? 100
                                                          : form.percentDiagnosticTriaged
                                                      }
                                                      onChange={handleChange}
                                                      onWheel={(e) =>
                                                        e.target.blur()
                                                      }
                                                      required={[
                                                        "ScreenDiagnosticTestTreat",
                                                        "ScreenTriageDiagnosticTestTreat",
                                                      ].includes(form.scenario)}
                                                      disabled={hpv16or18Used}
                                                    />
                                                    <span className="text-nowrap">
                                                      {hpv16or18Used
                                                        ? 100
                                                        : form.percentDiagnosticTriaged}{" "}
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
                                                        // disabled={
                                                        //   m.value ===
                                                        //   form.screeningTest
                                                        // }
                                                        disabled={isTriageTestDisabled(
                                                          m.value
                                                        )}
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
                                                    {/* <span>
                                                      {t(
                                                        "runScenario.triageTestSensitivity"
                                                      )}
                                                    </span> */}
                                                    <span
                                                      dangerouslySetInnerHTML={{
                                                        __html: t(
                                                          "runScenario.triageTestSensitivity"
                                                        ),
                                                      }}
                                                    />
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="triageTestSensitivity-help">
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
                                                    {/* <span>
                                                      {t(
                                                        "runScenario.triageTestSpecificity"
                                                      )}
                                                    </span> */}
                                                    <span
                                                      dangerouslySetInnerHTML={{
                                                        __html: t(
                                                          "runScenario.triageTestSpecificity"
                                                        ),
                                                      }}
                                                    />
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="triageTestSpecificity-help">
                                                          {t(
                                                            "general.specificityHelpText"
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
                                                  {/* <InputGroup className="flex-nowrap"> */}
                                                  <InputGroup
                                                  className={`flex-nowrap ${
                                                    hpv16or18GenotypingTriageUsed
                                                      ? "grayed-out"
                                                      : ""
                                                  }`}
                                                >
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
                                                    {/* <InputGroup className="flex-nowrap">
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
                                                    </InputGroup> */}
                                                    {/* <InputGroup
                                                      className={`flex-nowrap ${
                                                        hpv16or18Used
                                                          ? "grayed-out"
                                                          : ""
                                                      }`}
                                                    >
                                                      <Form.Range
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="1"
                                                        className="border-end-0 me-2"
                                                        placeholder="Enter 0 - 100"
                                                        name="percentDiagnosticTriaged"
                                                        value={
                                                          hpv16or18Used
                                                            ? 100
                                                            : form.percentDiagnosticTriaged
                                                        }
                                                        onChange={handleChange}
                                                        onWheel={(e) =>
                                                          e.target.blur()
                                                        }
                                                        required={[
                                                          "ScreenDiagnosticTestTreat",
                                                          "ScreenTriageDiagnosticTestTreat",
                                                        ].includes(
                                                          form.scenario
                                                        )}
                                                        disabled={hpv16or18Used}
                                                      />
                                                      <span className="text-nowrap">
                                                        {hpv16or18Used
                                                          ? 100
                                                          : form.percentDiagnosticTriaged}{" "}
                                                        %
                                                      </span>
                                                    </InputGroup>  */}
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
                                                        // disabled={
                                                        //   m.value ===
                                                        //   form.screeningTest
                                                        // }
                                                        disabled={isTriageTestDisabled(
                                                          m.value
                                                        )}
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
                                                    {/* <span>
                                                      {t(
                                                        "runScenario.triageTestSensitivity"
                                                      )}
                                                    </span> */}
                                                    <span
                                                      dangerouslySetInnerHTML={{
                                                        __html: t(
                                                          "runScenario.triageTestSensitivity"
                                                        ),
                                                      }}
                                                    />
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="triageTestSensitivity-help">
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
                                                    {/* <span>
                                                      {t(
                                                        "runScenario.triageTestSpecificity"
                                                      )}
                                                    </span> */}
                                                    <span
                                                      dangerouslySetInnerHTML={{
                                                        __html: t(
                                                          "runScenario.triageTestSpecificity"
                                                        ),
                                                      }}
                                                    />
                                                    <OverlayTrigger
                                                      overlay={
                                                        <Tooltip id="triageTestSpecificity-help">
                                                          {t(
                                                            "general.specificityHelpText"
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
                                                  {/* <InputGroup className="flex-nowrap"> */}
                                                  <InputGroup
                                                  className={`flex-nowrap ${
                                                    hpv16or18GenotypingTriageUsed
                                                      ? "grayed-out"
                                                      : ""
                                                  }`}
                                                >
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
                                                      "runScenario.percentofScreenPositivesWithColposcopy"
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
                                                    //value={10}
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

                                          {/* <Row>
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
                                          </Row> */}
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
                                                  {/* <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSensitivity"
                                                    )}
                                                  </span> */}
                                                  <span
                                                    dangerouslySetInnerHTML={{
                                                      __html: t(
                                                        "runScenario.colposcopyTestSensitivity"
                                                      ),
                                                    }}
                                                  />
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="colposcopyTestSpecificity-help">
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
                                                  {/* <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSpecificity"
                                                    )}
                                                  </span> */}
                                                  <span
                                                    dangerouslySetInnerHTML={{
                                                      __html: t(
                                                        "runScenario.colposcopyTestSpecificity"
                                                      ),
                                                    }}
                                                  />
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="colposcopyTestSpecificity-help">
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
                                                      "runScenario.percentTriagePositiveWithColposcopy"
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

                                          {/* <Row>
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
                                          </Row> */}
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
                                                  {/* <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSensitivity"
                                                    )}
                                                  </span> */}
                                                  <span
                                                    dangerouslySetInnerHTML={{
                                                      __html: t(
                                                        "runScenario.colposcopyTestSensitivity"
                                                      ),
                                                    }}
                                                  />
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="colposcopyTestSpecificity-help">
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
                                                  {/* <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSpecificity"
                                                    )}
                                                  </span> */}
                                                  <span
                                                    dangerouslySetInnerHTML={{
                                                      __html: t(
                                                        "runScenario.colposcopyTestSpecificity"
                                                      ),
                                                    }}
                                                  />
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="colposcopyTestSpecificity-help">
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
                                                            "runScenario.percentofScreenPositivesWithColposcopy"
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

                                          {/* <Row>
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
                                          </Row> */}
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
                                                  {/* <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSensitivity"
                                                    )}
                                                  </span> */}
                                                  <span
                                                    dangerouslySetInnerHTML={{
                                                      __html: t(
                                                        "runScenario.colposcopyTestSensitivity"
                                                      ),
                                                    }}
                                                  />
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="colposcopyTestSpecificity-help">
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
                                                  {/* <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSpecificity"
                                                    )}
                                                  </span> */}
                                                  <span
                                                    dangerouslySetInnerHTML={{
                                                      __html: t(
                                                        "runScenario.colposcopyTestSpecificity"
                                                      ),
                                                    }}
                                                  />
                                                  <OverlayTrigger
                                                    overlay={
                                                      <Tooltip id="colposcopyTestSpecificity-help">
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
                                                {/* <InputGroup className="flex-nowrap"> */}
                                                <InputGroup
                                                  className={`flex-nowrap ${
                                                    hpv16or18GenotypingTriageUsed
                                                      ? "grayed-out"
                                                      : ""
                                                  }`}
                                                >
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
                                                            "runScenario.percentofScreenPositivesWithColposcopy"
                                                          ),
                                                        ScreenTriageDiagnosticTestTreat:
                                                          t(
                                                            "runScenario.percentTriagePositiveWithColposcopy"
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
                                                {/* <InputGroup className="flex-nowrap">
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
                                                </InputGroup> */}
                                                <InputGroup
                                                      className={`flex-nowrap ${
                                                        hpv16or18Used
                                                          ? "grayed-out"
                                                          : ""
                                                      }`}
                                                    >
                                                      <Form.Range
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="1"
                                                        className="border-end-0 me-2"
                                                        placeholder="Enter 0 - 100"
                                                        name="percentDiagnosticTriaged"
                                                        value={
                                                          hpv16or18Used
                                                            ? 100
                                                            : form.percentDiagnosticTriaged
                                                        }
                                                        onChange={handleChange}
                                                        onWheel={(e) =>
                                                          e.target.blur()
                                                        }
                                                        required={[
                                                          "ScreenDiagnosticTestTreat",
                                                          "ScreenTriageDiagnosticTestTreat",
                                                        ].includes(
                                                          form.scenario
                                                        )}
                                                        disabled={hpv16or18Used}
                                                      />
                                                      <span className="text-nowrap">
                                                        {hpv16or18Used
                                                          ? 100
                                                          : form.percentDiagnosticTriaged}{" "}
                                                        %
                                                      </span>
                                                </InputGroup>
                                              </Col>
                                            </Form.Group>
                                          </Row>
                                          {/* <Row>
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
                                          </Row> */}
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
                                                  {/* <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSensitivity"
                                                    )}
                                                  </span> */}
                                                  <span
                                                    dangerouslySetInnerHTML={{
                                                      __html: t(
                                                        "runScenario.colposcopyTestSensitivity"
                                                      ),
                                                    }}
                                                  />
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
                                                  {/* <span>
                                                    {t(
                                                      "runScenario.diagnosticTestSpecificity"
                                                    )}
                                                  </span> */}
                                                  <span
                                                    dangerouslySetInnerHTML={{
                                                      __html: t(
                                                        "runScenario.colposcopyTestSpecificity"
                                                      ),
                                                    }}
                                                  />
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
                                                        "runScenario.screenTreatHelpText"
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
