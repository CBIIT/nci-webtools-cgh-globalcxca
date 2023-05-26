export const scenarios = [
  { value: "ScreenTreat", label: "Screening Test", strategy: "Screening" },
  {
    value: "ScreenDiagnosticTestTreat",
    label: "Diagnostic Test",
    strategy: "Diagnosis",
  },
  {
    value: "ScreenTriageDiagnosticTestTreat",
    label: "Triage Test",
    strategy: "Triage",
  },
];

export const screeningTests = [
  { value: "pap", label: "Pap test" },
  { value: "ivaa", label: "VIA (IVAA)" },
  { value: "hpv", label: "HPV" },
  { value: "hpv16or18", label: "HPV16/18" },
];

export const triageTests = [
  { value: "pap", label: "Pap test" },
  { value: "ivaa", label: "VIA (IVAA)" },
  { value: "hpv16or18", label: "HPV16/18" },
  { value: "colposcopicImpression", label: "Impression of colposcopy" },
  { value: "colposcopyWithBiopsy", label: "Colposcopy with Biopsy" },
];

export const diagnosticTests = [
  { value: "colposcopicImpression", label: "Impression of colposcopy" },
  { value: "colposcopyWithBiopsy", label: "Colposcopy with Biopsy" },
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
  },
  hpv16or18: {
    sensitivity: 60,
    specificity: 75,
  },
  colposcopicImpression: {
    sensitivity: 70,
    specificity: 75,
  },
};

export function runModel(params) {
  switch (params?.scenario) {
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
  percentDiagnosticTriaged,
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
  percentDiagnosticTriaged /= 100;
  percentTreated /= 100;
  screeningTestSensitivity /= 100;
  screeningTestSpecificity /= 100;
  triageTestSensitivity /= 100;
  triageTestSpecificity /= 100;

  percentTriaged = percentDiagnosticTriaged;

  // target population
  const healthyWomenTargetedForScreening =
    (populationSize / screeningInterval) * (1 - cinPrevalence);
  const precancersTargetedForScreening =
    (populationSize / screeningInterval) * cinPrevalence;

  // screened population
  const unscreenedPrecancers =
    precancersTargetedForScreening * (1 - percentScreened);
  const screenedHealthy = healthyWomenTargetedForScreening * percentScreened;
  const screenedWithPrecancer =
    precancersTargetedForScreening * percentScreened;
  const screenedFalseNegatives =
    screenedWithPrecancer * (1 - screeningTestSensitivity);
  const screenedTrueNegatives = screenedHealthy * screeningTestSpecificity;
  const screenedTruePositives =
    screenedWithPrecancer * screeningTestSensitivity;
  const screenedFalsePositives =
    screenedHealthy * (1 - screeningTestSpecificity);

  // diagnostic triaged population
  const lostToFollowUpAtTriage = screenedTruePositives * (1 - percentTriaged);
  const triagedHealthy = screenedFalsePositives * percentTriaged;
  const triagedWithPrecancer = screenedTruePositives * percentTriaged;
  const triagedFalseNegatives =
    triagedWithPrecancer * (1 - triageTestSensitivity);
  const triagedTrueNegatives = triagedHealthy * triageTestSpecificity;
  const triagedTruePositives = triagedWithPrecancer * triageTestSensitivity;
  const triagedFalsePositives = triagedHealthy * (1 - triageTestSpecificity);

  // treated population
  const lostToFollowUpAtTreatment = triagedTruePositives * (1 - percentTreated);
  const treatedHealthy = triagedFalsePositives * percentTreated;
  const treatedWithPrecancer = triagedTruePositives * percentTreated;

  // impact on disease
  const percentPrecancersTreated =
    (100 * treatedWithPrecancer) / precancersTargetedForScreening;
  const percentHealthyOvertreated =
    (100 * treatedHealthy) / healthyWomenTargetedForScreening;

  // sources of missed precancers
  const numberMissedDueToNoScreening = unscreenedPrecancers;
  const numberMissedDueToSensitivityOfScreeningTest = screenedFalseNegatives;
  const numberMissedDueToLossAtTriage = lostToFollowUpAtTriage;
  const numberMissedDueToSensitivityOfTriageTest = triagedFalseNegatives;
  const numberMissedDueToLossAtTreatment = lostToFollowUpAtTreatment;
  const numberPrecancersMissed =
    numberMissedDueToNoScreening +
    numberMissedDueToSensitivityOfScreeningTest +
    numberMissedDueToLossAtTriage +
    numberMissedDueToSensitivityOfTriageTest +
    numberMissedDueToLossAtTreatment;

  const percentMissedDueToNoScreening =
    (100 * unscreenedPrecancers) / numberPrecancersMissed;
  const percentMissedDueToSensitivityOfScreeningTest =
    (100 * screenedFalseNegatives) / numberPrecancersMissed;
  const percentMissedDueToLossAtTriage =
    (100 * lostToFollowUpAtTriage) / numberPrecancersMissed;
  const percentMissedDueToSensitivityOfTriageTest =
    (100 * triagedFalseNegatives) / numberPrecancersMissed;
  const percentMissedDueToLossAtTreatment =
    (100 * lostToFollowUpAtTreatment) / numberPrecancersMissed;
  const percentPrecancersMissed =
    (100 * numberPrecancersMissed) / precancersTargetedForScreening;

  // impact on resources
  const totalNeededToScreen = screenedHealthy + screenedWithPrecancer;
  const totalNeededToTriage = triagedHealthy + triagedWithPrecancer;
  const totalNeededToTreat = treatedHealthy + treatedWithPrecancer;

  const results = {
    healthyWomenTargetedForScreening: Math.round(
      healthyWomenTargetedForScreening
    ),
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
    percentMissedDueToSensitivityOfScreeningTest:
      percentMissedDueToSensitivityOfScreeningTest,
    percentMissedDueToLossAtTriage: percentMissedDueToLossAtTriage,
    percentMissedDueToSensitivityOfTriageTest:
      percentMissedDueToSensitivityOfTriageTest,
    percentMissedDueToLossAtTreatment: percentMissedDueToLossAtTreatment,
    percentPrecancersMissed: percentPrecancersMissed,

    numberMissedDueToNoScreening: Math.round(numberMissedDueToNoScreening),
    numberMissedDueToSensitivityOfScreeningTest: Math.round(
      numberMissedDueToSensitivityOfScreeningTest
    ),
    numberMissedDueToLossAtTriage: Math.round(numberMissedDueToLossAtTriage),
    numberMissedDueToSensitivityOfTriageTest: Math.round(
      numberMissedDueToSensitivityOfTriageTest
    ),
    numberMissedDueToLossAtTreatment: Math.round(
      numberMissedDueToLossAtTreatment
    ),
    numberPrecancersMissed: Math.round(numberPrecancersMissed),

    totalNeededToScreen: Math.round(totalNeededToScreen),
    totalNeededToTriage: Math.round(totalNeededToTriage),
    totalNeededToTreat: Math.round(totalNeededToTreat),
  };

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
  const healthyWomenTargetedForScreening =
    (populationSize / screeningInterval) * (1 - cinPrevalence);
  const precancersTargetedForScreening =
    (populationSize / screeningInterval) * cinPrevalence;

  // screened population
  const unscreenedPrecancers =
    precancersTargetedForScreening * (1 - percentScreened);
  const screenedHealthy = healthyWomenTargetedForScreening * percentScreened;
  const screenedWithPrecancer =
    precancersTargetedForScreening * percentScreened;
  const screenedFalseNegatives =
    screenedWithPrecancer * (1 - screeningTestSensitivity);
  const screenedTrueNegatives = screenedHealthy * screeningTestSpecificity;
  const screenedTruePositives =
    screenedWithPrecancer * screeningTestSensitivity;
  const screenedFalsePositives =
    screenedHealthy * (1 - screeningTestSpecificity);

  // treated population
  const lostToFollowUpAtTreatment =
    screenedTruePositives * (1 - percentTreated);
  const treatedHealthy = screenedFalsePositives * percentTreated;
  const treatedWithPrecancer = screenedTruePositives * percentTreated;

  // impact on disease
  const percentPrecancersTreated =
    (100 * treatedWithPrecancer) / precancersTargetedForScreening;
  const percentHealthyOvertreated =
    (100 * treatedHealthy) / healthyWomenTargetedForScreening;

  // sources of missed precancers
  const numberMissedDueToNoScreening = unscreenedPrecancers;
  const numberMissedDueToSensitivityOfScreeningTest = screenedFalseNegatives;
  const numberMissedDueToLossAtTreatment = lostToFollowUpAtTreatment;
  const numberPrecancersMissed =
    numberMissedDueToNoScreening +
    numberMissedDueToSensitivityOfScreeningTest +
    numberMissedDueToLossAtTreatment;

  const percentMissedDueToNoScreening =
    (100 * unscreenedPrecancers) / numberPrecancersMissed;
  const percentMissedDueToSensitivityOfScreeningTest =
    (100 * screenedFalseNegatives) / numberPrecancersMissed;
  const percentMissedDueToLossAtTreatment =
    (100 * lostToFollowUpAtTreatment) / numberPrecancersMissed;
  const percentPrecancersMissed =
    (100 * numberPrecancersMissed) / precancersTargetedForScreening;

  // impact on resources
  const totalNeededToScreen = screenedHealthy + screenedWithPrecancer;
  const totalNeededToTreat = treatedHealthy + treatedWithPrecancer;

  const results = {
    healthyWomenTargetedForScreening: Math.round(
      healthyWomenTargetedForScreening
    ),
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
    percentMissedDueToSensitivityOfScreeningTest:
      percentMissedDueToSensitivityOfScreeningTest,
    percentMissedDueToLossAtTreatment: percentMissedDueToLossAtTreatment,
    percentPrecancersMissed: percentPrecancersMissed,

    numberMissedDueToNoScreening: Math.round(numberMissedDueToNoScreening),
    numberMissedDueToSensitivityOfScreeningTest: Math.round(
      numberMissedDueToSensitivityOfScreeningTest
    ),
    numberMissedDueToLossAtTreatment: Math.round(
      numberMissedDueToLossAtTreatment
    ),
    numberPrecancersMissed: Math.round(numberPrecancersMissed),

    totalNeededToScreen: Math.round(totalNeededToScreen),
    totalNeededToTreat: Math.round(totalNeededToTreat),
  };

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
  const healthyWomenTargetedForScreening =
    (populationSize / screeningInterval) * (1 - cinPrevalence);
  const precancersTargetedForScreening =
    (populationSize / screeningInterval) * cinPrevalence;

  // screened population
  const unscreenedPrecancers =
    precancersTargetedForScreening * (1 - percentScreened);
  const screenedHealthy = healthyWomenTargetedForScreening * percentScreened;
  const screenedWithPrecancer =
    precancersTargetedForScreening * percentScreened;
  const screenedFalseNegatives =
    screenedWithPrecancer * (1 - screeningTestSensitivity);
  const screenedTrueNegatives = screenedHealthy * screeningTestSpecificity;
  const screenedTruePositives =
    screenedWithPrecancer * screeningTestSensitivity;
  const screenedFalsePositives =
    screenedHealthy * (1 - screeningTestSpecificity);

  // triaged population
  const lostToFollowUpAtTriage = screenedTruePositives * (1 - percentTriaged);
  const triagedHealthy = screenedFalsePositives * percentTriaged;
  const triagedWithPrecancer = screenedTruePositives * percentTriaged;
  const triagedFalseNegatives =
    triagedWithPrecancer * (1 - triageTestSensitivity);
  const triagedTrueNegatives = triagedHealthy * triageTestSpecificity;
  const triagedTruePositives = triagedWithPrecancer * triageTestSensitivity;
  const triagedFalsePositives = triagedHealthy * (1 - triageTestSpecificity);

  // diagnostic triaged population
  const lostToFollowUpAtDiagnosticTriage =
    triagedTruePositives * (1 - percentDiagnosticTriaged);
  const diagnosticTriagedHealthy =
    triagedFalsePositives * percentDiagnosticTriaged;
  const diagnosticTriagedWithPrecancer =
    triagedTruePositives * percentDiagnosticTriaged;
  const diagnosticTriagedFalseNegatives =
    diagnosticTriagedWithPrecancer * (1 - diagnosticTestSensitivity);
  const diagnosticTriagedTrueNegatives =
    diagnosticTriagedHealthy * diagnosticTestSpecificity;
  const diagnosticTriagedTruePositives =
    diagnosticTriagedWithPrecancer * diagnosticTestSensitivity;
  const diagnosticTriagedFalsePositives =
    diagnosticTriagedHealthy * (1 - diagnosticTestSpecificity);

  // treated population
  const lostToFollowUpAtTreatment =
    diagnosticTriagedTruePositives * (1 - percentTreated);
  const treatedHealthy = diagnosticTriagedFalsePositives * percentTreated;
  const treatedWithPrecancer = diagnosticTriagedTruePositives * percentTreated;

  // impact on disease
  const percentPrecancersTreated =
    (100 * treatedWithPrecancer) / precancersTargetedForScreening;
  const percentHealthyOvertreated =
    (100 * treatedHealthy) / healthyWomenTargetedForScreening;

  // sources of missed precancers
  const numberMissedDueToNoScreening = unscreenedPrecancers;
  const numberMissedDueToSensitivityOfScreeningTest = screenedFalseNegatives;
  const numberMissedDueToLossAtTriage = lostToFollowUpAtTriage;
  const numberMissedDueToSensitivityOfTriageTest = triagedFalseNegatives;
  const numberMissedDueToLossAtDiagnosticTriage =
    lostToFollowUpAtDiagnosticTriage;
  const numberMissedDueToSensitivityOfDiagnosticTriageTest =
    diagnosticTriagedFalseNegatives;
  const numberMissedDueToLossAtTreatment = lostToFollowUpAtTreatment;
  const numberPrecancersMissed =
    numberMissedDueToNoScreening +
    numberMissedDueToSensitivityOfScreeningTest +
    numberMissedDueToLossAtTriage +
    numberMissedDueToSensitivityOfTriageTest +
    numberMissedDueToLossAtDiagnosticTriage +
    numberMissedDueToSensitivityOfDiagnosticTriageTest +
    numberMissedDueToLossAtTreatment;

  const percentMissedDueToNoScreening =
    (100 * unscreenedPrecancers) / numberPrecancersMissed;
  const percentMissedDueToSensitivityOfScreeningTest =
    (100 * screenedFalseNegatives) / numberPrecancersMissed;
  const percentMissedDueToLossAtTriage =
    (100 * lostToFollowUpAtTriage) / numberPrecancersMissed;
  const percentMissedDueToSensitivityOfTriageTest =
    (100 * triagedFalseNegatives) / numberPrecancersMissed;
  const percentMissedDueToLossAtDiagnosticTriage =
    (100 * lostToFollowUpAtDiagnosticTriage) / numberPrecancersMissed;
  const percentMissedDueToSensitivityOfDiagnosticTriageTest =
    (100 * diagnosticTriagedFalseNegatives) / numberPrecancersMissed;
  const percentMissedDueToLossAtTreatment =
    (100 * lostToFollowUpAtTreatment) / numberPrecancersMissed;
  const percentPrecancersMissed =
    (100 * numberPrecancersMissed) / precancersTargetedForScreening;

  // impact on resources
  const totalNeededToScreen = screenedHealthy + screenedWithPrecancer;
  const totalNeededToTriage = triagedHealthy + triagedWithPrecancer;
  const totalNeededToDiagnosticTriage =
    diagnosticTriagedHealthy + diagnosticTriagedWithPrecancer;
  const totalNeededToTreat = treatedHealthy + treatedWithPrecancer;

  const results = {
    healthyWomenTargetedForScreening: Math.round(
      healthyWomenTargetedForScreening
    ),
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

    lostToFollowUpAtDiagnosticTriage: Math.round(
      lostToFollowUpAtDiagnosticTriage
    ),
    diagnosticTriagedHealthy: Math.round(diagnosticTriagedHealthy),
    diagnosticTriagedWithPrecancer: Math.round(diagnosticTriagedWithPrecancer),
    diagnosticTriagedFalseNegatives: Math.round(
      diagnosticTriagedFalseNegatives
    ),
    diagnosticTriagedTrueNegatives: Math.round(diagnosticTriagedTrueNegatives),
    diagnosticTriagedTruePositives: Math.round(diagnosticTriagedTruePositives),
    diagnosticTriagedFalsePositives: Math.round(
      diagnosticTriagedFalsePositives
    ),

    lostToFollowUpAtTreatment: Math.round(lostToFollowUpAtTreatment),
    treatedHealthy: Math.round(treatedHealthy),
    treatedWithPrecancer: Math.round(treatedWithPrecancer),

    percentPrecancersTreated: percentPrecancersTreated,
    percentHealthyOvertreated: percentHealthyOvertreated,

    percentMissedDueToNoScreening: percentMissedDueToNoScreening,
    percentMissedDueToSensitivityOfScreeningTest:
      percentMissedDueToSensitivityOfScreeningTest,
    percentMissedDueToLossAtTriage: percentMissedDueToLossAtTriage,
    percentMissedDueToSensitivityOfTriageTest:
      percentMissedDueToSensitivityOfTriageTest,
    percentMissedDueToLossAtDiagnosticTriage:
      percentMissedDueToLossAtDiagnosticTriage,
    percentMissedDueToSensitivityOfDiagnosticTriageTest:
      percentMissedDueToSensitivityOfDiagnosticTriageTest,
    percentMissedDueToLossAtTreatment: percentMissedDueToLossAtTreatment,
    percentPrecancersMissed: percentPrecancersMissed,

    numberMissedDueToNoScreening: Math.round(numberMissedDueToNoScreening),
    numberMissedDueToSensitivityOfScreeningTest: Math.round(
      numberMissedDueToSensitivityOfScreeningTest
    ),
    numberMissedDueToLossAtTriage: Math.round(numberMissedDueToLossAtTriage),
    numberMissedDueToSensitivityOfTriageTest: Math.round(
      numberMissedDueToSensitivityOfTriageTest
    ),
    numberMissedDueToLossAtDiagnosticTriage: Math.round(
      numberMissedDueToLossAtDiagnosticTriage
    ),
    numberMissedDueToSensitivityOfDiagnosticTriageTest: Math.round(
      numberMissedDueToSensitivityOfDiagnosticTriageTest
    ),
    numberMissedDueToLossAtTreatment: Math.round(
      numberMissedDueToLossAtTreatment
    ),
    numberPrecancersMissed: Math.round(numberPrecancersMissed),

    totalNeededToScreen: Math.round(totalNeededToScreen),
    totalNeededToTriage: Math.round(totalNeededToTriage),
    totalNeededToDiagnosticTriage: Math.round(totalNeededToDiagnosticTriage),
    totalNeededToTreat: Math.round(totalNeededToTreat),
  };

  return results;
}

export function runTestModel({
  populationSize,
  screeningInterval,
  cinPrevalence,
  percentScreened,
  percentTreated,
  screeningTestSensitivity,
  screeningTestSpecificity,

  percentTriaged,
  percentDiagnosticTriaged,
  triageTestSensitivity,
  triageTestSpecificity,
  diagnosticTestSensitivity,
  diagnosticTestSpecificity,

  pipeline,
}) {
  cinPrevalence /= 100;
  percentScreened /= 100;
  percentTreated /= 100;
  screeningTestSensitivity /= 100;
  screeningTestSpecificity /= 100;

  percentTriaged /= 100;
  percentDiagnosticTriaged /= 100;
  triageTestSensitivity /= 100;
  triageTestSpecificity /= 100;
  diagnosticTestSensitivity /= 100;
  diagnosticTestSpecificity /= 100;

  // target population
  const healthyWomenTargetedForScreening =
    (populationSize / screeningInterval) * (1 - cinPrevalence);
  const precancersTargetedForScreening =
    (populationSize / screeningInterval) * cinPrevalence;

  // screened population
  const unscreenedPrecancers =
    precancersTargetedForScreening * (1 - percentScreened);
  const screenedHealthy = healthyWomenTargetedForScreening * percentScreened;
  const screenedWithPrecancer =
    precancersTargetedForScreening * percentScreened;
  const screenedFalseNegatives =
    screenedWithPrecancer * (1 - screeningTestSensitivity);
  const screenedTrueNegatives = screenedHealthy * screeningTestSpecificity;
  const screenedTruePositives =
    screenedWithPrecancer * screeningTestSensitivity;
  const screenedFalsePositives =
    screenedHealthy * (1 - screeningTestSpecificity);

  // treated population
  const lostToFollowUpAtTreatment =
    screenedTruePositives * (1 - percentTreated);
  const treatedHealthy = screenedFalsePositives * percentTreated;
  const treatedWithPrecancer = screenedTruePositives * percentTreated;

  // impact on disease
  const percentPrecancersTreated =
    (100 * treatedWithPrecancer) / precancersTargetedForScreening;
  const percentHealthyOvertreated =
    (100 * treatedHealthy) / healthyWomenTargetedForScreening;

  // triaged population
  const lostToFollowUpAtTriage = screenedTruePositives * (1 - percentTriaged);
  const triagedHealthy = screenedFalsePositives * percentTriaged;
  const triagedWithPrecancer = screenedTruePositives * percentTriaged;
  const triagedFalseNegatives =
    triagedWithPrecancer * (1 - triageTestSensitivity);
  const triagedTrueNegatives = triagedHealthy * triageTestSpecificity;
  const triagedTruePositives = triagedWithPrecancer * triageTestSensitivity;
  const triagedFalsePositives = triagedHealthy * (1 - triageTestSpecificity);

  // diagnostic triaged population
  const lostToFollowUpAtDiagnosticTriage =
    triagedTruePositives * (1 - percentDiagnosticTriaged);
  const diagnosticTriagedHealthy =
    triagedFalsePositives * percentDiagnosticTriaged;
  const diagnosticTriagedWithPrecancer =
    triagedTruePositives * percentDiagnosticTriaged;
  const diagnosticTriagedFalseNegatives =
    diagnosticTriagedWithPrecancer * (1 - diagnosticTestSensitivity);
  const diagnosticTriagedTrueNegatives =
    diagnosticTriagedHealthy * diagnosticTestSpecificity;
  const diagnosticTriagedTruePositives =
    diagnosticTriagedWithPrecancer * diagnosticTestSensitivity;
  const diagnosticTriagedFalsePositives =
    diagnosticTriagedHealthy * (1 - diagnosticTestSpecificity);

  // sources of missed precancers
  const numberMissedDueToNoScreening = unscreenedPrecancers;
  const numberMissedDueToSensitivityOfScreeningTest = screenedFalseNegatives;
  const numberMissedDueToLossAtTriage = lostToFollowUpAtTriage;
  const numberMissedDueToSensitivityOfTriageTest = triagedFalseNegatives;
  const numberMissedDueToLossAtDiagnosticTriage =
    lostToFollowUpAtDiagnosticTriage;
  const numberMissedDueToSensitivityOfDiagnosticTriageTest =
    diagnosticTriagedFalseNegatives;
  const numberMissedDueToLossAtTreatment = lostToFollowUpAtTreatment;
  const numberPrecancersMissed =
    numberMissedDueToNoScreening +
    numberMissedDueToSensitivityOfScreeningTest +
    numberMissedDueToLossAtTriage +
    numberMissedDueToSensitivityOfTriageTest +
    numberMissedDueToLossAtDiagnosticTriage +
    numberMissedDueToSensitivityOfDiagnosticTriageTest +
    numberMissedDueToLossAtTreatment;

  const percentMissedDueToNoScreening =
    (100 * unscreenedPrecancers) / numberPrecancersMissed;
  const percentMissedDueToSensitivityOfScreeningTest =
    (100 * screenedFalseNegatives) / numberPrecancersMissed;
  const percentMissedDueToLossAtTriage =
    (100 * lostToFollowUpAtTriage) / numberPrecancersMissed;
  const percentMissedDueToSensitivityOfTriageTest =
    (100 * triagedFalseNegatives) / numberPrecancersMissed;
  const percentMissedDueToLossAtDiagnosticTriage =
    (100 * lostToFollowUpAtDiagnosticTriage) / numberPrecancersMissed;
  const percentMissedDueToSensitivityOfDiagnosticTriageTest =
    (100 * diagnosticTriagedFalseNegatives) / numberPrecancersMissed;
  const percentMissedDueToLossAtTreatment =
    (100 * lostToFollowUpAtTreatment) / numberPrecancersMissed;
  const percentPrecancersMissed =
    (100 * numberPrecancersMissed) / precancersTargetedForScreening;

  // impact on resources
  const totalNeededToScreen = screenedHealthy + screenedWithPrecancer;
  const totalNeededToTriage = triagedHealthy + triagedWithPrecancer;
  const totalNeededToDiagnosticTriage =
    diagnosticTriagedHealthy + diagnosticTriagedWithPrecancer;
  const totalNeededToTreat = treatedHealthy + treatedWithPrecancer;

  const falseNegatives = []; // Define the falseNegatives array
  const results = {
    healthyWomenTargetedForScreening: Math.round(
      healthyWomenTargetedForScreening
    ),
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
    percentMissedDueToSensitivityOfScreeningTest:
      percentMissedDueToSensitivityOfScreeningTest,
    percentMissedDueToLossAtTriage: percentMissedDueToLossAtTriage,
    percentMissedDueToSensitivityOfTriageTest:
      percentMissedDueToSensitivityOfTriageTest,
    percentMissedDueToLossAtDiagnosticTriage:
      percentMissedDueToLossAtDiagnosticTriage,
    percentMissedDueToSensitivityOfDiagnosticTriageTest:
      percentMissedDueToSensitivityOfDiagnosticTriageTest,
    percentMissedDueToLossAtTreatment: percentMissedDueToLossAtTreatment,
    percentPrecancersMissed: percentPrecancersMissed,

    numberMissedDueToNoScreening: Math.round(numberMissedDueToNoScreening),
    numberMissedDueToSensitivityOfScreeningTest: Math.round(
      numberMissedDueToSensitivityOfScreeningTest
    ),
    numberMissedDueToLossAtTreatment: Math.round(
      numberMissedDueToLossAtTreatment
    ),
    numberPrecancersMissed: Math.round(numberPrecancersMissed),

    totalNeededToScreen: Math.round(totalNeededToScreen),
    totalNeededToTreat: Math.round(totalNeededToTreat),
    totalNeededToTriage: Math.round(totalNeededToTriage),
    totalNeededToDiagnosticTriage: Math.round(totalNeededToDiagnosticTriage),

    lostToFollowUpAtTriage: Math.round(lostToFollowUpAtTriage),
    triagedHealthy: Math.round(triagedHealthy),
    triagedWithPrecancer: Math.round(triagedWithPrecancer),
    triagedFalseNegatives: Math.round(triagedFalseNegatives),
    triagedTrueNegatives: Math.round(triagedTrueNegatives),
    triagedTruePositives: Math.round(triagedTruePositives),
    triagedFalsePositives: Math.round(triagedFalsePositives),

    lostToFollowUpAtDiagnosticTriage: Math.round(
      lostToFollowUpAtDiagnosticTriage
    ),
    diagnosticTriagedHealthy: Math.round(diagnosticTriagedHealthy),
    diagnosticTriagedWithPrecancer: Math.round(diagnosticTriagedWithPrecancer),
    diagnosticTriagedFalseNegatives: Math.round(
      diagnosticTriagedFalseNegatives
    ),
    diagnosticTriagedTrueNegatives: Math.round(diagnosticTriagedTrueNegatives),
    diagnosticTriagedTruePositives: Math.round(diagnosticTriagedTruePositives),
    diagnosticTriagedFalsePositives: Math.round(
      diagnosticTriagedFalsePositives
    ),
  };
  const stageOutputs = pipeline.reduce(processStage, []);

  return {
    results,
    stages: stageOutputs,
  };
}

function processStage(
  allStages,
  stage,
  stageIndex,
  falseNegatives,
  trueNegatives,
  falsePositives,
  truePositives,
  interventionsNeeded
) {
  const { name, percentCovered, testName, testSpecificity, testSensitivity } =
    stage;

  // Perform any necessary processing or calculations on the stage

  // Update the stage properties or append new properties if needed
  stage.falseNegatives = falseNegatives[stageIndex];
  stage.trueNegatives = trueNegatives[stageIndex];
  stage.falsePositives = falsePositives[stageIndex];
  stage.truePositives = truePositives[stageIndex];
  stage.interventionsRequired = interventionsNeeded[stageIndex];

  // Add the updated stage to the allStages array
  allStages.push(stage);

  // Return the updated allStages array
  return allStages;
}
