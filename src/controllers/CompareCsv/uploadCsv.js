const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");


const csvUpload = async (req, res) => {

    try {
        const file = req.uploadedFile; // Access req.uploadedFile here
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        let jsonData = [];
        let isFirstRow = true;
        fs.createReadStream(req.file.path)
            .pipe(csvParser())
            .on("data", (row) => {
                // Push each row as an object to the jsonData array
                if (isFirstRow) {
                    jsonData = Object.keys(row);
                    isFirstRow = false; // Update the flag to false after processing the first row
                }
            })
            .on("end", () => {
                // Remove the uploaded file
                // fs.unlinkSync(req.file.path);
                // Send the JSON data as response
                // console.log(jsonData)
                res.json(jsonData);
            });
    } catch (error) {
        console.error("Error uploading CSV:", error);
        res.status(500).json({ error: "Failed to upload CSV" });
    }

}



module.exports = csvUpload;