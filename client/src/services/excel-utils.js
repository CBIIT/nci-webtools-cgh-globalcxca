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
        // cells.forEach((cell) => {
        //   rowData.push(cell.innerText);
        // });
        cells.forEach((cell) => {
          if (cell.innerText !== 'Placeholder') { // Exclude "Placeholder"
            rowData.push(cell.innerText);
          }
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

export function exportExcel(filename, tabContentId, t) {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Select the tables from the specified tab content and tab4Content
  const activeTabTables = document.querySelectorAll(`#${tabContentId} table[data-export]`);
  const tab4Tables = document.querySelectorAll(`#tab4Content table[data-export]`);

  // Helper function to convert tables to worksheet data
  function tablesToSheetData(tables) {
      const sheetData = [];
      tables.forEach((table) => {
          const rows = table.querySelectorAll("tr");
          rows.forEach((row) => {
              const rowData = [];
              const cells = row.querySelectorAll("th, td");
              cells.forEach((cell) => {
                  if (cell.innerText !== 'Placeholder') { // Exclude "Placeholder"
                      rowData.push(cell.innerText);
                  }
              });
              sheetData.push(rowData);
          });
      });
      return sheetData;
  }

  // Map tabContentId to localized sheet names using t function
  const sheetNames = {
      tab1Content: t("general.tables"),
      tab2Content: t("general.monthlyTables"),
      tab3Content: t("general.programTables"),
      tab4Content: t("general.scenarioParameters"),
      //tab4Content: "Inputs"
  };

  // Get the sheet names based on tabContentId and tab4Content
  const activeTabSheetName = sheetNames[tabContentId] || "Active Tab";
  const tab4SheetName = sheetNames.tab4Content;

  // Convert tables to sheet data
  const activeTabSheetData = tablesToSheetData(activeTabTables);
  const tab4SheetData = tablesToSheetData(tab4Tables);

  // Create worksheets for both the active tab and tab4 content
  const activeTabSheet = XLSX.utils.aoa_to_sheet(activeTabSheetData);
  const tab4Sheet = XLSX.utils.aoa_to_sheet(tab4SheetData);

  // Append the worksheets to the workbook with localized names
  XLSX.utils.book_append_sheet(wb, activeTabSheet, activeTabSheetName);
  XLSX.utils.book_append_sheet(wb, tab4Sheet, tab4SheetName);

  // Generate the Excel file
  const excelFile = XLSX.write(wb, { type: "binary", bookType: "xlsx" });

  // Save the file
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
