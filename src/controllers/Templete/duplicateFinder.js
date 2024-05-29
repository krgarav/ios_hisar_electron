const Files = require("../../models/TempleteModel/files");
const fs = require("fs").promises;
const path = require("path");
const jsonToCsv = require("../../services/json_to_csv");
const csvToJson = require("../../services/csv_to_json");

const duplicateFinder = async (req, res, next) => {
  const { colName, fileID, imageColumnName } = req.body;

  try {
    if (!fileID) {
      return res.status(400).json({ error: "File ID not provided" });
    }

    const fileData = await Files.findByPk(fileID);
    if (!fileData || !fileData.csvFile) {
      return res.status(404).json({ error: "File not found" });
    }

    const filename = fileData.csvFile;
    const filePath = "csvFile/"+ filename;

    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({ error: "CSV file not found" });
    }

    const data = await csvToJson(filePath);

    const imageCols = imageColumnName.split(",");
    const duplicates = {};
    const base64Images = {};

    for (const [index, row] of data.entries()) {
      const value = row[colName];
      const rowBase64Images = [];

      for (const col of imageCols) {
        const imagePath = row[col];
        const sourceFilePath = "extractedFiles/"+ imagePath;

        try {
          await fs.access(sourceFilePath);
          const image = await fs.readFile(sourceFilePath);
          rowBase64Images.push(image.toString("base64"));
        } catch (err) {
          return res.status(404).json({ error: `Error reading image file at ${sourceFilePath}: ${err.message}` });
        }
      }

      if (value) {
        if (!base64Images[value]) {
          base64Images[value] = [];
        }
        base64Images[value].push(rowBase64Images);

        if (duplicates[value]) {
          duplicates[value].push({ index, row, base64Images: rowBase64Images });
        } else {
          duplicates[value] = [{ index, row, base64Images: rowBase64Images }];
        }
      }
    }

    const duplicateValues = Object.keys(duplicates).filter(
      (value) => duplicates[value].length > 1
    );

    if (duplicateValues.length === 0) {
      return res.status(404).json({ message: "No duplicates found" });
    }

    const duplicateRows = duplicateValues.flatMap((value) => duplicates[value]);
    return res.status(200).json({ duplicates: duplicateRows });
  } catch (error) {
    console.error("Error finding duplicates:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = duplicateFinder;
