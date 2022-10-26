import mapValues from 'lodash/mapValues';

export const asLabel = (value, options) => options.find(o => o.value === value)?.label;

export const asPercent = (value, places = 2) => isNaN(value) ? value : `${(value * 100).toFixed(places)}%`;

export const scenarios = [
  { value: "ScreenDiagnosticTestTreat", label: "Screen, Diagnostic Test & Treat" },
  { value: "ScreenTreat", label: "Screen & Treat" },
  { value: "ScreenTriageDiagnosticTestTreat", label: "Screen, Triage, Diagnostic Test & Treat" },
];

export const screeningTests = [
  { value: "pap", label: "Pap" },
  { value: "ivaa", label: "VIA" },
  { value: "hpv", label: "HPV" },
  { value: "hpv16or18", label: "HPV16/18" },
];

export const triageTests = [
  { value: "pap", label: "Pap" },
  { value: "ivaa", label: "VIA" },
  { value: "hpv16or18", label: "HPV16/18" },
  { value: "colposcopicImpression", label: "Coloscopic impression" },
  { value: "colposcopyWithBiopsy", label: "Colposcopy with biopsy" },
];

export const diagnosticTests = [
  { value: "colposcopicImpression", label: "Coloscopic impression" },
  { value: "colposcopyWithBiopsy", label: "Colposcopy with biopsy" },
];

export const tests = {
  ivaa: {
    sensitivity: 0.6,
    specificity: 0.84,
  },
  pap: {
    sensitivity: 0.6,
    specificity: 0.91,
  },
  hpv: {
    sensitivity: 0.9,
    specificity: 0.89,
  },
  colposcopyWithBiopsy: {
    sensitivity: 0.65,
    specificity: 0.85,
  }
};

export const defaultParameters = {
  scenario: "ScreenTriageDiagnosticTestTreat",
  populationSize: 20000,
  screeningInterval: 5,
  hpvCancerPrevalence: 0,
  hpvPrevalence: 0,
  cinPrevalence: 0.03,
  percentScreened: 0.7,
  percentTriaged: 0.5,
  percentDiagnosticTriaged: 0.4,
  percentTreated: 0.9,
  screeningTest: "hpv",
  screeningTestSensitivity: 0.9,
  screeningTestSpecificity: 0.89,
  triageTest: "pap",
  triageTestSensitivity: 0.80,
  triageTestSpecificity: 0.91,
  diagnosticTest: "colposcopyWithBiopsy",
  diagnosticTestSensitivity: 0.8,
  diagnosticTestSpecificity: 0.85,
}

export function runModel(params) {
  const modelParams = mapValues(params, v => isNaN(v) ? v : parseFloat(v));

  switch(params?.scenario) {
    case "ScreenDiagnosticTestTreat":
      return runScreenDiagnosticTestTreatModel(modelParams);
    case "ScreenTreat":
      return runScreenTreatModel(modelParams);
    case "ScreenTriageDiagnosticTestTreat":
      return runScreenTriageDiagnosticTestTreatModel(modelParams);
    default:
      return null;
  }
}

export function runScreenDiagnosticTestTreatModel({
  populationSize,
  screeningInterval,
  cinPrevalence,
  percentScreened,
  percentTriaged,
  percentTreated,
  screeningTestSensitivity,
  screeningTestSpecificity,
  triageTestSensitivity,
  triageTestSpecificity,
}) {
  // target population
  const healthyWomenTargetedForScreening = (populationSize / screeningInterval) * (1 - cinPrevalence);
  const precancersTargetedForScreening = (populationSize / screeningInterval) * cinPrevalence;

  // screened population
  const unscreenedPrecancers = precancersTargetedForScreening * (1 - percentScreened);
  const screenedHealthy = healthyWomenTargetedForScreening * percentScreened;
  const screenedWithPrecancer = precancersTargetedForScreening * percentScreened;
  const screenedFalseNegatives = screenedWithPrecancer * (1 - screeningTestSensitivity);
  const screenedTrueNegatives = screenedHealthy * screeningTestSpecificity;
  const screenedTruePositives = screenedWithPrecancer * screeningTestSensitivity;
  const screenedFalsePositives = screenedHealthy * (1 - screeningTestSpecificity);

  // diagnostic triaged population
  const lostToFollowUpAtTriage = screenedTruePositives * (1 - percentTriaged);
  const triagedHealthy = screenedFalsePositives * percentTriaged;
  const triagedWithPrecancer = screenedTruePositives * percentTriaged;
  const triagedFalseNegatives = triagedWithPrecancer * (1 - triageTestSensitivity);
  const triagedTrueNegatives = triagedHealthy * triageTestSpecificity;
  const triagedTruePositives = triagedWithPrecancer * triageTestSensitivity;
  const triagedFalsePositives = triagedHealthy * (1 - triageTestSpecificity);

  // treated population
  const lostToFollowUpAtTreatment = triagedTruePositives * (1 - percentTreated);
  const treatedHealthy = triagedFalsePositives * percentTreated;
  const treatedWithPrecancer = triagedTruePositives * percentTreated;

  // impact on disease
  const percentPrecancersTreated = 100 * treatedWithPrecancer / precancersTargetedForScreening;
  const percentHealthyOvertreated = 100 * treatedHealthy / healthyWomenTargetedForScreening;

  // sources of missed precancers
  const percentMissedDueToNoScreening = 100 * unscreenedPrecancers / precancersTargetedForScreening;
  const percentMissedDueToSensitivityOfScreeningTest = 100 * screenedFalseNegatives / precancersTargetedForScreening;
  const percentMissedDueToLossAtTriage = 100 * lostToFollowUpAtTriage / precancersTargetedForScreening;
  const percentMissedDueToSensitivityOfTriageTest = 100 * triagedFalseNegatives / precancersTargetedForScreening;
  const percentMissedDueToLossAtTreatment = 100 * lostToFollowUpAtTreatment / precancersTargetedForScreening;
  const percentPrecancersMissed = percentMissedDueToNoScreening 
    + percentMissedDueToSensitivityOfScreeningTest 
    + percentMissedDueToLossAtTriage 
    + percentMissedDueToSensitivityOfTriageTest 
    + percentMissedDueToLossAtTreatment;

  const numberMissedDueToNoScreening = unscreenedPrecancers;
  const numberMissedDueToSensitivityOfScreeningTest = screenedFalseNegatives;
  const numberMissedDueToLossAtTriage = lostToFollowUpAtTriage;
  const numberMissedDueToSensitivityOfTriageTest = triagedFalseNegatives;
  const numberMissedDueToLossAtTreatment = lostToFollowUpAtTreatment;
  const numberPrecancersMissed =  numberMissedDueToNoScreening
    + numberMissedDueToSensitivityOfScreeningTest
    + numberMissedDueToLossAtTriage
    + numberMissedDueToSensitivityOfTriageTest
    + numberMissedDueToLossAtTreatment;

  // impact on resources
  const totalNeededToScreen = screenedHealthy + screenedWithPrecancer;
  const totalNeededToTriage = triagedHealthy + triagedWithPrecancer;
  const totalNeededToTreat = treatedHealthy + treatedWithPrecancer;

  const results = {
    healthyWomenTargetedForScreening: Math.round(healthyWomenTargetedForScreening),
    precancersTargetedForScreening: Math.round(precancersTargetedForScreening),

    unscreenedPrecancers: Math.round(unscreenedPrecancers),
    screenedHealthy: Math.round(screenedHealthy),
    screenedWithPrecancer: Math.round(screenedWithPrecancer),
    screenedFalseNegatives: Math.round(screenedFalseNegatives),
    screenedTrueNegatives: Math.round(screenedTrueNegatives),
    screenedTruePositives: Math.round(screenedTruePositives),
    screenedFalsePositives: Math.round(screenedFalsePositives),

    lostToFollowUpAtTriage: Math.round(lostToFollowUpAtTriage),
    triagedHealthy: Math.round(triagedHealthy),
    triagedWithPrecancer: Math.round(triagedWithPrecancer),
    triagedFalseNegatives: Math.round(triagedFalseNegatives),
    triagedTrueNegatives: Math.round(triagedTrueNegatives),
    triagedTruePositives: Math.round(triagedTruePositives),
    triagedFalsePositives: Math.round(triagedFalsePositives),

    lostToFollowUpAtTreatment: Math.round(lostToFollowUpAtTreatment),
    treatedHealthy: Math.round(treatedHealthy),
    treatedWithPrecancer: Math.round(treatedWithPrecancer),

    percentPrecancersTreated: percentPrecancersTreated.toFixed(2),
    percentHealthyOvertreated: percentHealthyOvertreated.toFixed(2),

    percentMissedDueToNoScreening: percentMissedDueToNoScreening.toFixed(2),
    percentMissedDueToSensitivityOfScreeningTest: percentMissedDueToSensitivityOfScreeningTest.toFixed(2),
    percentMissedDueToLossAtTriage: percentMissedDueToLossAtTriage.toFixed(2),
    percentMissedDueToSensitivityOfTriageTest: percentMissedDueToSensitivityOfTriageTest.toFixed(2),
    percentMissedDueToLossAtTreatment: percentMissedDueToLossAtTreatment.toFixed(2),
    percentPrecancersMissed: percentPrecancersMissed.toFixed(2),

    numberMissedDueToNoScreening: Math.round(numberMissedDueToNoScreening),
    numberMissedDueToSensitivityOfScreeningTest: Math.round(numberMissedDueToSensitivityOfScreeningTest),
    numberMissedDueToLossAtTriage: Math.round(numberMissedDueToLossAtTriage),
    numberMissedDueToSensitivityOfTriageTest: Math.round(numberMissedDueToSensitivityOfTriageTest),
    numberMissedDueToLossAtTreatment: Math.round(numberMissedDueToLossAtTreatment),
    numberPrecancersMissed: Math.round(numberPrecancersMissed),

    totalNeededToScreen: Math.round(totalNeededToScreen),
    totalNeededToTriage: Math.round(totalNeededToTriage),
    totalNeededToTreat: Math.round(totalNeededToTreat),
  }

  return results;
}


export function runScreenTreatModel({
  populationSize,
  screeningInterval,
  cinPrevalence,
  percentScreened,
  percentTreated,
  screeningTestSensitivity,
  screeningTestSpecificity,
}) {
  // target population
  const healthyWomenTargetedForScreening = (populationSize / screeningInterval) * (1 - cinPrevalence);
  const precancersTargetedForScreening = (populationSize / screeningInterval) * cinPrevalence;

  // screened population
  const unscreenedPrecancers = precancersTargetedForScreening * (1 - percentScreened);
  const screenedHealthy = healthyWomenTargetedForScreening * percentScreened;
  const screenedWithPrecancer = precancersTargetedForScreening * percentScreened;
  const screenedFalseNegatives = screenedWithPrecancer * (1 - screeningTestSensitivity);
  const screenedTrueNegatives = screenedHealthy * screeningTestSpecificity;
  const screenedTruePositives = screenedWithPrecancer * screeningTestSensitivity;
  const screenedFalsePositives = screenedHealthy * (1 - screeningTestSpecificity);

  // treated population
  const lostToFollowUpAtTreatment = screenedTruePositives * (1 - percentTreated);
  const treatedHealthy = screenedFalsePositives * percentTreated;
  const treatedWithPrecancer = screenedTruePositives * percentTreated;

  // impact on disease
  const percentPrecancersTreated = 100 * treatedWithPrecancer / precancersTargetedForScreening;
  const percentHealthyOvertreated = 100 * treatedHealthy / healthyWomenTargetedForScreening;

  // sources of missed precancers
  const percentMissedDueToNoScreening = 100 * unscreenedPrecancers / precancersTargetedForScreening;
  const percentMissedDueToSensitivityOfScreeningTest = 100 * screenedFalseNegatives / precancersTargetedForScreening;
  const percentMissedDueToLossAtTreatment = 100 * lostToFollowUpAtTreatment / precancersTargetedForScreening;
  const percentPrecancersMissed = percentMissedDueToNoScreening 
    + percentMissedDueToSensitivityOfScreeningTest 
    + percentMissedDueToLossAtTreatment;

  const numberMissedDueToNoScreening = unscreenedPrecancers;
  const numberMissedDueToSensitivityOfScreeningTest = screenedFalseNegatives;
  const numberMissedDueToLossAtTreatment = lostToFollowUpAtTreatment;
  const numberPrecancersMissed =  numberMissedDueToNoScreening
    + numberMissedDueToSensitivityOfScreeningTest
    + numberMissedDueToLossAtTreatment;

  // impact on resources
  const totalNeededToScreen = screenedHealthy + screenedWithPrecancer;
  const totalNeededToTreat = treatedHealthy + treatedWithPrecancer;

  const results = {
    healthyWomenTargetedForScreening: Math.round(healthyWomenTargetedForScreening),
    precancersTargetedForScreening: Math.round(precancersTargetedForScreening),

    unscreenedPrecancers: Math.round(unscreenedPrecancers),
    screenedHealthy: Math.round(screenedHealthy),
    screenedWithPrecancer: Math.round(screenedWithPrecancer),
    screenedFalseNegatives: Math.round(screenedFalseNegatives),
    screenedTrueNegatives: Math.round(screenedTrueNegatives),
    screenedTruePositives: Math.round(screenedTruePositives),
    screenedFalsePositives: Math.round(screenedFalsePositives),

    lostToFollowUpAtTreatment: Math.round(lostToFollowUpAtTreatment),
    treatedHealthy: Math.round(treatedHealthy),
    treatedWithPrecancer: Math.round(treatedWithPrecancer),

    percentPrecancersTreated: percentPrecancersTreated.toFixed(2),
    percentHealthyOvertreated: percentHealthyOvertreated.toFixed(2),

    percentMissedDueToNoScreening: percentMissedDueToNoScreening.toFixed(2),
    percentMissedDueToSensitivityOfScreeningTest: percentMissedDueToSensitivityOfScreeningTest.toFixed(2),
    percentMissedDueToLossAtTreatment: percentMissedDueToLossAtTreatment.toFixed(2),
    percentPrecancersMissed: percentPrecancersMissed.toFixed(2),

    numberMissedDueToNoScreening: Math.round(numberMissedDueToNoScreening),
    numberMissedDueToSensitivityOfScreeningTest: Math.round(numberMissedDueToSensitivityOfScreeningTest),
    numberMissedDueToLossAtTreatment: Math.round(numberMissedDueToLossAtTreatment),
    numberPrecancersMissed: Math.round(numberPrecancersMissed),

    totalNeededToScreen: Math.round(totalNeededToScreen),
    totalNeededToTreat: Math.round(totalNeededToTreat),
  }

  return results;
}


export function runScreenTriageDiagnosticTestTreatModel({
  populationSize,
  screeningInterval,
  cinPrevalence,
  percentScreened,
  percentTriaged,
  percentDiagnosticTriaged,
  percentTreated,
  screeningTestSensitivity,
  screeningTestSpecificity,
  triageTestSensitivity,
  triageTestSpecificity,
  diagnosticTestSensitivity,
  diagnosticTestSpecificity,
}) {
  // target population
  const healthyWomenTargetedForScreening = (populationSize / screeningInterval) * (1 - cinPrevalence);
  const precancersTargetedForScreening = (populationSize / screeningInterval) * cinPrevalence;

  // screened population
  const unscreenedPrecancers = precancersTargetedForScreening * (1 - percentScreened);
  const screenedHealthy = healthyWomenTargetedForScreening * percentScreened;
  const screenedWithPrecancer = precancersTargetedForScreening * percentScreened;
  const screenedFalseNegatives = screenedWithPrecancer * (1 - screeningTestSensitivity);
  const screenedTrueNegatives = screenedHealthy * screeningTestSpecificity;
  const screenedTruePositives = screenedWithPrecancer * screeningTestSensitivity;
  const screenedFalsePositives = screenedHealthy * (1 - screeningTestSpecificity);

  // triaged population
  const lostToFollowUpAtTriage = screenedTruePositives * (1 - percentTriaged);
  const triagedHealthy = screenedFalsePositives * percentTriaged;
  const triagedWithPrecancer = screenedTruePositives * percentTriaged;
  const triagedFalseNegatives = triagedWithPrecancer * (1 - triageTestSensitivity);
  const triagedTrueNegatives = triagedHealthy * triageTestSpecificity;
  const triagedTruePositives = triagedWithPrecancer * triageTestSensitivity;
  const triagedFalsePositives = triagedHealthy * (1 - triageTestSpecificity);

  // diagnostic triaged population
  const lostToFollowUpAtDiagnosticTriage = triagedTruePositives * (1 - percentDiagnosticTriaged); 
  const diagnosticTriagedHealthy = triagedFalsePositives * percentDiagnosticTriaged;
  const diagnosticTriagedWithPrecancer = triagedTruePositives * percentDiagnosticTriaged;
  const diagnosticTriagedFalseNegatives = diagnosticTriagedWithPrecancer * (1 - diagnosticTestSensitivity);
  const diagnosticTriagedTrueNegatives = diagnosticTriagedHealthy * diagnosticTestSpecificity;
  const diagnosticTriagedTruePositives = diagnosticTriagedWithPrecancer * diagnosticTestSensitivity;
  const diagnosticTriagedFalsePositives = diagnosticTriagedHealthy * (1 - diagnosticTestSpecificity);

  // treated population
  const lostToFollowUpAtTreatment = diagnosticTriagedTruePositives * (1 - percentTreated);
  const treatedHealthy = diagnosticTriagedFalsePositives * percentTreated;
  const treatedWithPrecancer = diagnosticTriagedTruePositives * percentTreated;

  // impact on disease
  const percentPrecancersTreated = 100 * treatedWithPrecancer / precancersTargetedForScreening;
  const percentHealthyOvertreated = 100 * treatedHealthy / healthyWomenTargetedForScreening;

  // sources of missed precancers
  const percentMissedDueToNoScreening = 100 * unscreenedPrecancers / precancersTargetedForScreening;
  const percentMissedDueToSensitivityOfScreeningTest = 100 * screenedFalseNegatives / precancersTargetedForScreening;
  const percentMissedDueToLossAtTriage = 100 * lostToFollowUpAtTriage / precancersTargetedForScreening;
  const percentMissedDueToSensitivityOfTriageTest = 100 * triagedFalseNegatives / precancersTargetedForScreening;
  const percentMissedDueToLossAtDiagnosticTriage = 100 * lostToFollowUpAtDiagnosticTriage / precancersTargetedForScreening;
  const percentMissedDueToSensitivityOfDiagnosticTriageTest = 100 * diagnosticTriagedFalseNegatives / precancersTargetedForScreening;
  const percentMissedDueToLossAtTreatment = 100 * lostToFollowUpAtTreatment / precancersTargetedForScreening;
  const percentPrecancersMissed = percentMissedDueToNoScreening 
    + percentMissedDueToSensitivityOfScreeningTest 
    + percentMissedDueToLossAtTriage 
    + percentMissedDueToSensitivityOfTriageTest 
    + percentMissedDueToLossAtDiagnosticTriage
    + percentMissedDueToSensitivityOfDiagnosticTriageTest
    + percentMissedDueToLossAtTreatment;

  const numberMissedDueToNoScreening = unscreenedPrecancers;
  const numberMissedDueToSensitivityOfScreeningTest = screenedFalseNegatives;
  const numberMissedDueToLossAtTriage = lostToFollowUpAtTriage;
  const numberMissedDueToSensitivityOfTriageTest = triagedFalseNegatives;
  const numberMissedDueToLossAtDiagnosticTriage = lostToFollowUpAtDiagnosticTriage;
  const numberMissedDueToSensitivityOfDiagnosticTriageTest = diagnosticTriagedFalseNegatives;
  const numberMissedDueToLossAtTreatment = lostToFollowUpAtTreatment;
  const numberPrecancersMissed =  numberMissedDueToNoScreening
    + numberMissedDueToSensitivityOfScreeningTest
    + numberMissedDueToLossAtTriage
    + numberMissedDueToSensitivityOfTriageTest
    + numberMissedDueToLossAtDiagnosticTriage
    + numberMissedDueToSensitivityOfDiagnosticTriageTest
    + numberMissedDueToLossAtTreatment;

  // impact on resources
  const totalNeededToScreen = screenedHealthy + screenedWithPrecancer;
  const totalNeededToTriage = triagedHealthy + triagedWithPrecancer;
  const totalNeededToDiagnosticTriage = diagnosticTriagedHealthy + diagnosticTriagedWithPrecancer;
  const totalNeededToTreat = treatedHealthy + treatedWithPrecancer;

  const results = {
    healthyWomenTargetedForScreening: Math.round(healthyWomenTargetedForScreening),
    precancersTargetedForScreening: Math.round(precancersTargetedForScreening),

    unscreenedPrecancers: Math.round(unscreenedPrecancers),
    screenedHealthy: Math.round(screenedHealthy),
    screenedWithPrecancer: Math.round(screenedWithPrecancer),
    screenedFalseNegatives: Math.round(screenedFalseNegatives),
    screenedTrueNegatives: Math.round(screenedTrueNegatives),
    screenedTruePositives: Math.round(screenedTruePositives),
    screenedFalsePositives: Math.round(screenedFalsePositives),

    lostToFollowUpAtTriage: Math.round(lostToFollowUpAtTriage),
    triagedHealthy: Math.round(triagedHealthy),
    triagedWithPrecancer: Math.round(triagedWithPrecancer),
    triagedFalseNegatives: Math.round(triagedFalseNegatives),
    triagedTrueNegatives: Math.round(triagedTrueNegatives),
    triagedTruePositives: Math.round(triagedTruePositives),
    triagedFalsePositives: Math.round(triagedFalsePositives),

    lostToFollowUpAtDiagnosticTriage: Math.round(lostToFollowUpAtDiagnosticTriage),
    diagnosticTriagedHealthy: Math.round(diagnosticTriagedHealthy),
    diagnosticTriagedWithPrecancer: Math.round(diagnosticTriagedWithPrecancer),
    diagnosticTriagedFalseNegatives: Math.round(diagnosticTriagedFalseNegatives),
    diagnosticTriagedTrueNegatives: Math.round(diagnosticTriagedTrueNegatives),
    diagnosticTriagedTruePositives: Math.round(diagnosticTriagedTruePositives),
    diagnosticTriagedFalsePositives: Math.round(diagnosticTriagedFalsePositives),

    lostToFollowUpAtTreatment: Math.round(lostToFollowUpAtTreatment),
    treatedHealthy: Math.round(treatedHealthy),
    treatedWithPrecancer: Math.round(treatedWithPrecancer),

    percentPrecancersTreated: percentPrecancersTreated.toFixed(2),
    percentHealthyOvertreated: percentHealthyOvertreated.toFixed(2),

    percentMissedDueToNoScreening: percentMissedDueToNoScreening.toFixed(2),
    percentMissedDueToSensitivityOfScreeningTest: percentMissedDueToSensitivityOfScreeningTest.toFixed(2),
    percentMissedDueToLossAtTriage: percentMissedDueToLossAtTriage.toFixed(2),
    percentMissedDueToSensitivityOfTriageTest: percentMissedDueToSensitivityOfTriageTest.toFixed(2),
    percentMissedDueToLossAtDiagnosticTriage: percentMissedDueToLossAtDiagnosticTriage.toFixed(2),
    percentMissedDueToSensitivityOfDiagnosticTriageTest: percentMissedDueToSensitivityOfDiagnosticTriageTest.toFixed(2),
    percentMissedDueToLossAtTreatment: percentMissedDueToLossAtTreatment.toFixed(2),
    percentPrecancersMissed: percentPrecancersMissed.toFixed(2),

    numberMissedDueToNoScreening: Math.round(numberMissedDueToNoScreening),
    numberMissedDueToSensitivityOfScreeningTest: Math.round(numberMissedDueToSensitivityOfScreeningTest),
    numberMissedDueToLossAtTriage: Math.round(numberMissedDueToLossAtTriage),
    numberMissedDueToSensitivityOfTriageTest: Math.round(numberMissedDueToSensitivityOfTriageTest),
    numberMissedDueToLossAtDiagnosticTriage: Math.round(numberMissedDueToLossAtDiagnosticTriage),
    numberMissedDueToSensitivityOfDiagnosticTriageTest: Math.round(numberMissedDueToSensitivityOfDiagnosticTriageTest),
    numberMissedDueToLossAtTreatment: Math.round(numberMissedDueToLossAtTreatment),
    numberPrecancersMissed: Math.round(numberPrecancersMissed),

    totalNeededToScreen: Math.round(totalNeededToScreen),
    totalNeededToTriage: Math.round(totalNeededToTriage),
    totalNeededToDiagnosticTriage: Math.round(totalNeededToDiagnosticTriage),
    totalNeededToTreat: Math.round(totalNeededToTreat),
  }

  return results;
}