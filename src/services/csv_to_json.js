const csv = require("csv-parser");
const fs = require("fs")
function readCSVAndConvertToJSON(filePath) {
    return new Promise((resolve, reject) => {
      const jsonArray = [];
  
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          jsonArray.push(row);
        })
        .on("end", () => {
          console.log("CSV file successfully processed");
          resolve(jsonArray);
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }

  module.exports=readCSVAndConvertToJSON;