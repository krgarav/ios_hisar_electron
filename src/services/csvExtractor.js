const csvParser = require("csv-parser");
const fs = require('fs');

const csvToJson = (firstFilePath) => {
    let jsonData = [];
    console.log(firstFilePath)
    return new Promise((resolve, reject) => {
        fs.createReadStream(firstFilePath)
            .pipe(csvParser())
            .on("data", (row) => {
                // Push each row as an object to the jsonData array
                jsonData.push(row)
            })
            .on("end", () => {
                // Remove the uploaded file
                // fs.unlinkSync(req.file.path);
                // Send the JSON data as response
                // console.log(jsonData)
                resolve(jsonData)

            });
    })
}
module.exports = csvToJson;
