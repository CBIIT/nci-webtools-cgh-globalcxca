import * as XLSX from "xlsx";
import { asLabel, asPercent } from "../services/formatters";
import { getTimestamp } from "../services/file-utils";

export function exportExcel(params, results) {
  const filename = `${params.scenario} ${getTimestamp()}.xlsx`;
  const workbook = XLSX.utils.book_new();
  const inputData = XLSX.utils.aoa_to_sheet([
    [params.scenario],
    [
      "Number of people in target population for cervical screening",
      params.populationSize ?? "N/A",
    ],
    [
      "Prevalence of CIN2/3 in population for cervical screening",
      asPercent(params.cinPrevalence, 0) ?? "N/A",
    ],
    ["Participation in Health Services", params.screeningInterval ?? "N/A"],
  ]);
  XLSX.utils.book_append_sheet(workbook, inputData, "Input Data");

  const resultWorksheet = XLSX.utils.aoa_to_sheet([
    ["Annual Targets"],
    [
      "Population without precancer targeted for screening",
      results.testedFalsePositives[0],
    ],
    [
      "Population with precancer targeted for screening",
      results.testedTruePositives[0],
    ],
    ["Third Metric", "N/A"],
  ]);

  XLSX.utils.book_append_sheet(workbook, resultWorksheet, "Results");
  XLSX.writeFile(workbook, filename);
}
