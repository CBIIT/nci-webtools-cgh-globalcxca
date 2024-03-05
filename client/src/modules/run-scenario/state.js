import { atom } from "recoil";

const useExample = false;

export const exampleFormState = {
  scenario: "ScreenTriageDiagnosticTestTreat",
  populationSize: 20000,
  screeningInterval: 5,
  hpvCancerPrevalence: 0,
  hpvPrevalence: 0,
  cinPrevalence: 3,
  percentScreened: 70,
  percentTriaged: 50,
  percentDiagnosticTriaged: 40,
  percentTreated: 90,
  screeningTest: "hpv",
  screeningTestSensitivity: 90,
  screeningTestSpecificity: 89,
  triageTest: "pap",
  triageTestSensitivity: 80,
  triageTestSpecificity: 91,
  diagnosticTest: "colposcopyWithBiopsy",
  diagnosticTestSensitivity: 80,
  diagnosticTestSpecificity: 85,
  proportionOfPositives: 0,
};

export const defaultFormState = {
  scenario: "ScreenDiagnosticTestTreat",
  populationSize: "",
  hpvCancerPrevalence: "",
  hpvPrevalence: 12,
  cinPrevalence: 2,
  screeningInterval: 5,
  percentScreened: 0,
  percentTriaged: 0,
  percentDiagnosticTriaged: 0,
  percentTreated: 0,
  screeningTest: "",
  screeningTestSensitivity: 0,
  screeningTestSpecificity: 0,
  triageTest: "",
  triageTestSensitivity: 0,
  triageTestSpecificity: 0,
  diagnosticTest: "",
  diagnosticTestSensitivity: 0,
  diagnosticTestSpecificity: 0,
  proportionOfPositives: 0,
  ...(useExample && exampleFormState),
};

export const formState = atom({
  key: "runScenarios.formState",
  default: defaultFormState,
});

export const paramsState = atom({
  key: "runScenarios.paramsState",
  default: null,
});

export const resultsState = atom({
  key: "runScenarios.resultsState",
  default: null,
});
