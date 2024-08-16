// calculateMissedPercent.js
export function lossAtTriageTestPercent(results, t, asPercent) {
    const totalIndex = results.totalNeeded.length - 1;
  
    if (results.scenario === "ScreenTreat") {
      return t("general.NA");
    }
  
    if (
      results.scenario === "ScreenDiagnosticTestTreat" &&
      results.checkedValues &&
      results.checkedValues.length === 3 &&
      results.checkedValues[2] === "ScreenDiagnosticTestTreat"
    ) {
      return t("general.NA");
    }
  
    if (
      results.scenario === "ScreenDiagnosticTestTreat" &&
      results.checkedValues &&
      results.checkedValues.length === 3 &&
      results.checkedValues[2] === "ScreenTriageDiagnosticTestTreat"
    ) {
      const value = results.percentMissed[totalIndex - 1];
      return value !== undefined && !isNaN(value)
        ? asPercent(value)
        : t("general.NA");
    }
  
    if (results.scenario === "ScreenTriageDiagnosticTestTreat") {
      const value = results.percentMissed[totalIndex - 1];
      return value !== undefined && !isNaN(value)
        ? asPercent(value)
        : t("general.NA");
    }
  
    const value = results.percentMissed[totalIndex - 2];
    return value !== undefined && !isNaN(value)
      ? asPercent(value)
      : t("general.NA");
  }
  

export function sensitivityOfTriageTestPercent(results, t, asPercent) {
    if (results.scenario === "ScreenTreat") {
      return t("general.NA");
    }
  
    if (
      results.scenario === "ScreenDiagnosticTestTreat" &&
      results.checkedValues &&
      results.checkedValues.length === 3 &&
      results.checkedValues[2] === "ScreenDiagnosticTestTreat"
    ) {
      return t("general.NA");
    }
  
    if (
      results.scenario === "ScreenDiagnosticTestTreat" &&
      results.checkedValues &&
      results.checkedValues.length === 3 &&
      results.checkedValues[2] === "ScreenTriageDiagnosticTestTreat"
    ) {
      const value =
        results.percentMissedDueToSensitivity[
          results.totalNeeded.length - 1 - 1
        ];
      return value !== undefined && !isNaN(value)
        ? asPercent(value)
        : t("general.NA");
    }
  
    if (results.scenario === "ScreenTriageDiagnosticTestTreat") {
      const value =
        results.percentMissedDueToSensitivity[
          results.totalNeeded.length - 1 - 2
        ];
      return value !== undefined && !isNaN(value)
        ? asPercent(value)
        : t("general.NA");
    }
  
    const value =
      results.percentMissedDueToSensitivity[
        results.totalNeeded.length - 1 - 2
      ];
    return value !== undefined && !isNaN(value)
      ? asPercent(value)
      : t("general.NA");
  }

export function lossAtColposcopyPercent(results, t, asPercent) {
    const totalIndex = results.totalNeeded.length - 1;
  
    if (results.scenario === "ScreenTreat") {
      return t("general.NA");
    }
  
    if (
      results.scenario === "ScreenDiagnosticTestTreat" &&
      results.checkedValues &&
      results.checkedValues.length === 3 &&
      results.checkedValues[2] === "ScreenDiagnosticTestTreat"
    ) {
      const value = results.percentMissed[totalIndex - 1];
      return value !== undefined && !isNaN(value)
        ? asPercent(value)
        : t("general.NA");
    }
  
    if (
      results.scenario === "ScreenTriageDiagnosticTestTreat" &&
      results.percentMissed[totalIndex - 2] !== undefined &&
      !isNaN(results.percentMissed[totalIndex - 2])
    ) {
      return asPercent(results.percentMissed[totalIndex - 2]);
    }
  
    return t("general.NA");
  }
  
export function sensitivityOfColposcopyPercent(results, t, asPercent) {
    const totalIndex = results.totalNeeded.length - 1;
  
    if (results.scenario === "ScreenTreat") {
      return t("general.NA");
    }
  
    if (
      results.scenario === "ScreenDiagnosticTestTreat" &&
      results.checkedValues &&
      results.checkedValues.length === 3 &&
      results.checkedValues[2] === "ScreenDiagnosticTestTreat"
    ) {
      const value = results.percentMissedDueToSensitivity[totalIndex - 1];
      return asPercent(value);
    }
  
    if (results.scenario === "ScreenTriageDiagnosticTestTreat") {
      const value = results.percentMissedDueToSensitivity[totalIndex - 1];
      return value !== undefined && !isNaN(value)
        ? asPercent(value)
        : t("general.NA");
    }
  
    return t("general.NA");
  }

export function lossAtTreatmentPercent(results, t, asPercent) {
    const totalIndex = results.totalNeeded.length - 1;
    const value = results.percentMissed[totalIndex];
  
    return value !== undefined && !isNaN(value)
      ? asPercent(value)
      : t("general.NA");
  }
  
  
  