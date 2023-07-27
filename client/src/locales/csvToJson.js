const fs = require("fs");
const csv = require("csv-parser");

function csvToJson(csvFilePath) {
  const enData = {
    // en: {
    //   translation: {},
    // },
  };
  const esData = {
    // es: {
    //   translation: {},
    // },
  };

  fs.createReadStream(csvFilePath)
    .pipe(csv({ headers: ["Key", "English", "Spanish - Final"] }))
    .on("data", (row) => {
      const key = row["Key"];

      // English Data
      //enData.en.translation[key] = row["English"];
      enData[key] = row["English"];

      // Spanish Data
      //esData.es.translation[key] = row["Spanish - Final"];
      esData[key] = row["Spanish - Final"];
    })
    .on("end", () => {
      fs.writeFile("en/en.json", JSON.stringify(enData, null, 2), (err) => {
        if (err) throw err;
        console.log("English JSON file has been created successfully!");
      });

      fs.writeFile("es/es.json", JSON.stringify(esData, null, 2), (err) => {
        if (err) throw err;
        console.log("Spanish JSON file has been created successfully!");
      });
    });
}

// Usage example:
const inputCSVFilePath = "CCP-English-Spanish.csv"; // Replace with your CSV file path
csvToJson(inputCSVFilePath);
