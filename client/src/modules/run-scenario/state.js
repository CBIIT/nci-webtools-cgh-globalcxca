import { atom } from "recoil";
import { defaultParameters } from "./models";

const debug = false;

export const formState = atom({
	key: "runScenarios.formState",
	default: {
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
});
