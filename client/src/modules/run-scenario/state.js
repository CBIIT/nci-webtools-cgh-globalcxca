import { atom } from "recoil";
import { defaultParameters } from "./models";

const debug = false;

export const defaultFormState = {
	scenario: "ScreenDiagnosticTestTreat",
	populationSize: "",
	hpvCancerPrevalence: "",
	hpvPrevalence: "",
	cinPrevalence: "",
	screeningInterval: "",
	percentScreened: "",
	percentTriaged: "",
	percentDiagnosticTriaged: "",
	percentTreated: "",
	screeningTest: "",
	screeningTestSensitivity: "",
	screeningTestSpecificity: "",
	triageTest: "",
	triageTestSensitivity: "",
	triageTestSpecificity: "",
	diagnosticTest: "",
	diagnosticTestSensitivity: "",
	diagnosticTestSpecificity: "",
	...(debug && defaultParameters)
}

export const formState = atom({
	key: "runScenarios.formState",
	default: defaultFormState
});

export const paramsState = atom({
	key: "runScenarios.paramsState",
	default: null,
})

export const resultsState = atom({
	key: "runScenarios.resultsState",
	default: null
});