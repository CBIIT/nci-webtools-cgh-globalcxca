const fs = require("fs");
const csvParse = require("csv-parse");

// Function to read CSV file and convert it to JSON
function csvToJson(csvFilePath) {
  const csvData = fs.readFileSync(csvFilePath, "utf-8");
  const jsonData = {};

  csvParse(
    csvData,
    { columns: true, skip_empty_lines: true },
    (err, records) => {
      if (err) throw err;

      records.forEach((record) => {
        jsonData[record.Key] = {
          translation: {
            en: record.English,
            es: record["Spanish - Final"],
          },
        };
      });

      // Create en.json and es.json files
      fs.writeFileSync(
        "en.json",
        JSON.stringify({ en: { translation: jsonData } }, null, 2)
      );
      fs.writeFileSync(
        "es.json",
        JSON.stringify({ es: { translation: jsonData } }, null, 2)
      );
    }
  );
}

// Usage example:
csvToJson("path/to/your/csvfile.csv");
