
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
    sensitivity: 60,
    specificity: 84,
  },
  pap: {
    sensitivity: 60,
    specificity: 91,
  },
  hpv: {
    sensitivity: 90,
    specificity: 89,
  },
  colposcopyWithBiopsy: {
    sensitivity: 65,
    specificity: 85,
  }
};

export function runModel(params) {
  switch(params?.scenario) {
    case "ScreenDiagnosticTestTreat":
      return runScreenDiagnosticTestTreatModel(params);
    case "ScreenTreat":
      return runScreenTreatModel(params);
    case "ScreenTriageDiagnosticTestTreat":
      return runScreenTriageDiagnosticTestTreatModel(params);
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
  cinPrevalence /= 100;
  percentScreened /= 100;
  percentTriaged /= 100;
  percentTreated /= 100;
  screeningTestSensitivity /= 100;
  screeningTestSpecificity /= 100;
  triageTestSensitivity /= 100;
  triageTestSpecificity /= 100;

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
  const percentPrecancersTreated =  100 * treatedWithPrecancer / precancersTargetedForScreening;
  const percentHealthyOvertreated =  100 * treatedHealthy / healthyWomenTargetedForScreening;

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

    percentPrecancersTreated: percentPrecancersTreated,
    percentHealthyOvertreated: percentHealthyOvertreated,

    percentMissedDueToNoScreening: percentMissedDueToNoScreening,
    percentMissedDueToSensitivityOfScreeningTest: percentMissedDueToSensitivityOfScreeningTest,
    percentMissedDueToLossAtTriage: percentMissedDueToLossAtTriage,
    percentMissedDueToSensitivityOfTriageTest: percentMissedDueToSensitivityOfTriageTest,
    percentMissedDueToLossAtTreatment: percentMissedDueToLossAtTreatment,
    percentPrecancersMissed: percentPrecancersMissed,

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
  cinPrevalence /= 100;
  percentScreened /= 100;
  percentTreated /= 100;
  screeningTestSensitivity /= 100;
  screeningTestSpecificity /= 100;

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
  const percentMissedDueToNoScreening =  100 * unscreenedPrecancers / precancersTargetedForScreening;
  const percentMissedDueToSensitivityOfScreeningTest =  100 * screenedFalseNegatives / precancersTargetedForScreening;
  const percentMissedDueToLossAtTreatment =  100 * lostToFollowUpAtTreatment / precancersTargetedForScreening;
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

    percentPrecancersTreated: percentPrecancersTreated,
    percentHealthyOvertreated: percentHealthyOvertreated,

    percentMissedDueToNoScreening: percentMissedDueToNoScreening,
    percentMissedDueToSensitivityOfScreeningTest: percentMissedDueToSensitivityOfScreeningTest,
    percentMissedDueToLossAtTreatment: percentMissedDueToLossAtTreatment,
    percentPrecancersMissed: percentPrecancersMissed,

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
  cinPrevalence /= 100;
  percentScreened /= 100;
  percentTriaged /= 100;
  percentDiagnosticTriaged /= 100;
  percentTreated /= 100;
  screeningTestSensitivity /= 100;
  screeningTestSpecificity /= 100;
  triageTestSensitivity /= 100;
  triageTestSpecificity /= 100;
  diagnosticTestSensitivity /= 100;
  diagnosticTestSpecificity /= 100;

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
  const percentPrecancersTreated =  100 * treatedWithPrecancer / precancersTargetedForScreening;
  const percentHealthyOvertreated =  100 * treatedHealthy / healthyWomenTargetedForScreening;

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

    percentPrecancersTreated: percentPrecancersTreated,
    percentHealthyOvertreated: percentHealthyOvertreated,

    percentMissedDueToNoScreening: percentMissedDueToNoScreening,
    percentMissedDueToSensitivityOfScreeningTest: percentMissedDueToSensitivityOfScreeningTest,
    percentMissedDueToLossAtTriage: percentMissedDueToLossAtTriage,
    percentMissedDueToSensitivityOfTriageTest: percentMissedDueToSensitivityOfTriageTest,
    percentMissedDueToLossAtDiagnosticTriage: percentMissedDueToLossAtDiagnosticTriage,
    percentMissedDueToSensitivityOfDiagnosticTriageTest: percentMissedDueToSensitivityOfDiagnosticTriageTest,
    percentMissedDueToLossAtTreatment: percentMissedDueToLossAtTreatment,
    percentPrecancersMissed: percentPrecancersMissed,

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