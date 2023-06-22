import * as XLSX from "xlsx";

export function exportExcelCard(filename) {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Get the HTML elements containing the data to export
  const cards = document.querySelectorAll(".card[data-export]");

  // Iterate over the cards and create a worksheet for each card
  cards.forEach((card, index) => {
    // Get the tables within the card
    const tables = card.querySelectorAll("table");

    // Create an array to store the table data
    const cardData = [];

    // Iterate over the tables and extract the table data
    tables.forEach((table) => {
      const tableData = [];
      const headers = [];
      const rows = table.querySelectorAll("tr");

      rows.forEach((row) => {
        const rowData = [];
        const cells = row.querySelectorAll("th, td");
        cells.forEach((cell) => {
          rowData.push(cell.innerText);
        });
        // Check if it's the header row
        if (row.closest("thead")) {
          headers.push(rowData); // Store the header row separately
        }
        tableData.push(rowData);
      });
      // headers.push(tableData[0][0]);

      // Store the table data
      cardData.push({
        //tableName: table.getAttribute("data-table-name"),
        tableName: headers[0][0],
        headers: headers[0],
        data: tableData, // Exclude the header row,
      });
    });

    // Extract the data from each table and concatenate into a single array
    const combinedData = cardData.reduce((acc, curr) => {
      return acc.concat(curr.data);
    }, []);

    // Create a worksheet from the card data
    const ws = XLSX.utils.aoa_to_sheet(combinedData);

    // Set the worksheet name
    // const sheetName = `Tab ${index + 1}`;
    const sheetName = index === 0 ? "Input" : "Result";
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  // Generate the Excel file
  const excelFile = XLSX.write(wb, { type: "binary", bookType: "xlsx" });

  // Save the file or do whatever you want with it
  // For example, you can create a download link
  const blob = new Blob([s2ab(excelFile)], {
    type: "application/octet-stream",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  //const filename = `${params.scenario} ${getTimestamp()}.xlsx`;
  link.href = url;
  link.download = filename;
  link.click();
}

export function exportExcel(filename) {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Get the HTML elements containing the data to export
  const tables = document.querySelectorAll("table[data-export]");

  // Create an array to store the table data
  const firstThreeTablesData = [];
  const remainingTablesData = [];

  // Iterate over the tables and extract the table data
  tables.forEach((table, index) => {
    const rows = table.querySelectorAll("tr");
    const tableRows = [];

    rows.forEach((row) => {
      const rowData = [];
      const cells = row.querySelectorAll("th, td");

      cells.forEach((cell) => {
        rowData.push(cell.innerText);
      });

      tableRows.push(rowData);
    });

    if (index < 3) {
      // Store the table data for the first three tables
      firstThreeTablesData.push(...tableRows);
    } else {
      // Store the table data for the remaining tables separately
      const headers = table.querySelectorAll("th");
      let sheetName =
        headers.length > 0 ? headers[0].innerText : `Table ${index + 1}`;
      sheetName = sheetName.substring(0, 31); // Truncate sheet name if it exceeds 31 characters
      remainingTablesData.push({ data: tableRows, sheetName });
    }
  });
  console.log("firstThreeTablesData", firstThreeTablesData);
  console.log("remainingTablesData", remainingTablesData);

  // Create a worksheet for the first three tables
  const firstThreeTablesSheet = XLSX.utils.aoa_to_sheet(firstThreeTablesData);

  // Set the worksheet name
  const firstThreeTablesSheetName = "Inputs";
  XLSX.utils.book_append_sheet(
    wb,
    firstThreeTablesSheet,
    firstThreeTablesSheetName
  );

  // Create worksheets for the remaining tables
  remainingTablesData.forEach(({ data, sheetName }) => {
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set the worksheet name as the table header
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  // Generate the Excel file
  const excelFile = XLSX.write(wb, { type: "binary", bookType: "xlsx" });

  // Save the file or do whatever you want with it
  // For example, you can create a download link
  const blob = new Blob([s2ab(excelFile)], {
    type: "application/octet-stream",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}

// Utility function to convert string to ArrayBuffer
function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}
