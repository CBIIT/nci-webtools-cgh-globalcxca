export const scenarios = [
	{ value: "ScreenDiagnosticTestTreat", label: "Screen, Diagnostic Test & Treat" },
	{ value: "ScreenTreat", label: "Screen & Treat" },
	{ value: "ScreenTriageDiagnosticTestTreat", label: "Screen, Triage, Diagnostic Test & Treat" },
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
	colposcopyOrBiopsy: {
		sensitivity: 0.65,
		specificity: 0.85,
	}
};

export const defaultParameters = {
	populationSize: 200000,
	screeningInterval: 5,
	cinPrevalence: 0.03,
	percentScreened: 0.7,
	percentTriaged: 0.9,
	percentTreated: 0.9,
	screeningTestSensitivity: 0.9,
	screeningTestSpecificity: 0.84,
	triageTestSensitivity: 0.9,
	triageTestSpecificity: 0.85,
}

export function runScreeningTriageAndTreatmentModel({
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

		percentPrecancersTreated: +percentPrecancersTreated.toFixed(2),
		percentHealthyOvertreated: +percentHealthyOvertreated.toFixed(2),

		percentMissedDueToNoScreening: +percentMissedDueToNoScreening.toFixed(2),
		percentMissedDueToSensitivityOfScreeningTest: +percentMissedDueToSensitivityOfScreeningTest.toFixed(2),
		percentMissedDueToLossAtTriage: +percentMissedDueToLossAtTriage.toFixed(2),
		percentMissedDueToSensitivityOfTriageTest: +percentMissedDueToSensitivityOfTriageTest.toFixed(2),
		percentMissedDueToLossAtTreatment: +percentMissedDueToLossAtTreatment.toFixed(2),
		percentPrecancersMissed: +percentPrecancersMissed.toFixed(2),

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

	return {
		results,
	};
}


export function runScreeningAndTreatmentModel({
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

		percentPrecancersTreated: +percentPrecancersTreated.toFixed(2),
		percentHealthyOvertreated: +percentHealthyOvertreated.toFixed(2),

		percentMissedDueToNoScreening: +percentMissedDueToNoScreening.toFixed(2),
		percentMissedDueToSensitivityOfScreeningTest: +percentMissedDueToSensitivityOfScreeningTest.toFixed(2),
		percentMissedDueToLossAtTreatment: +percentMissedDueToLossAtTreatment.toFixed(2),
		percentPrecancersMissed: +percentPrecancersMissed.toFixed(2),

		numberMissedDueToNoScreening: Math.round(numberMissedDueToNoScreening),
		numberMissedDueToSensitivityOfScreeningTest: Math.round(numberMissedDueToSensitivityOfScreeningTest),
		numberMissedDueToLossAtTreatment: Math.round(numberMissedDueToLossAtTreatment),
		numberPrecancersMissed: Math.round(numberPrecancersMissed),

		totalNeededToScreen: Math.round(totalNeededToScreen),
		totalNeededToTreat: Math.round(totalNeededToTreat),
	}

	return {
		results,
	};
}


export function runConfirmatoryScreeningTriageAndTreatmentModel({
	populationSize,
	screeningInterval,
	cinPrevalence,
	percentScreened,
	percentConfirmed,
	percentTriaged,
	percentTreated,
	screeningTestSensitivity,
	screeningTestSpecificity,
	confirmatoryTestSensitivity,
	confirmatoryTestSpecificity,
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

	// confirmed population
	const lostToFollowUpAtConfirmation = 1;
	const confirmedHealthy = 0;
	const confirmedWithPrecancer = 0;
	const confirmedFalseNegatives = 0;
	const confirmedTrueNegatives = 0;
	const confirmedTruePositives = 0;
	const confirmedFalsePostives = 0;

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

		percentPrecancersTreated: +percentPrecancersTreated.toFixed(2),
		percentHealthyOvertreated: +percentHealthyOvertreated.toFixed(2),

		percentMissedDueToNoScreening: +percentMissedDueToNoScreening.toFixed(2),
		percentMissedDueToSensitivityOfScreeningTest: +percentMissedDueToSensitivityOfScreeningTest.toFixed(2),
		percentMissedDueToLossAtTriage: +percentMissedDueToLossAtTriage.toFixed(2),
		percentMissedDueToSensitivityOfTriageTest: +percentMissedDueToSensitivityOfTriageTest.toFixed(2),
		percentMissedDueToLossAtTreatment: +percentMissedDueToLossAtTreatment.toFixed(2),
		percentPrecancersMissed: +percentPrecancersMissed.toFixed(2),

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

	return {
		results,
	};
}