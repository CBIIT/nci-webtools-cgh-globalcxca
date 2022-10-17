import { atom } from "recoil";

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
	}
});
