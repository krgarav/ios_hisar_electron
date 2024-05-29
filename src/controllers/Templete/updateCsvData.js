const Files = require("../../models/TempleteModel/files");
const Assigndata = require("../../models/TempleteModel/assigndata");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const jsonToCsv = require("../../services/json_to_csv");

const updateCsvData = async (req, res, next) => {
  const { data, index, updatedColumn } = req.body;

  if (updatedColumn === null) {
    return res.status(300).json({ message: "Nothing to Update" });
  }

  const fileId = req.params.id;
  delete data.rowIndex; 

  const { userName, email } = req.user;
  try {
    // Retrieve the original file data from the database
    const fileData = await Files.findOne({ where: { id: fileId } });
    if (!fileData) {
      return res.status(404).json({ error: "File not found" });
    }

    const assignData = await Assigndata.findOne({
      where: { userId: req.userId },
    });

    const { min, max } = assignData;

    const minIndex = parseInt(min);

    const fileName = fileData.csvFile;
    const filePath = "csvFile/"+ fileName;

    // Load existing CSV file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert the worksheet to an array of rows
    const csvData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Find the index of the column with the heading "User Details" and "Updated Details"
    let userDetailsIndex = csvData[0].indexOf("User Details");
    let updatedDetailsIndex = csvData[0].indexOf("Updated Details");

    // If "User Details" column doesn't exist, add it to the header
    if (userDetailsIndex === -1) {
      csvData[0].push("User Details");
      userDetailsIndex = csvData[0].length - 1;
    }

    // If "Updated Details" column doesn't exist, add it to the header
    if (updatedDetailsIndex === -1) {
      csvData[0].push("Updated Details");
      updatedDetailsIndex = csvData[0].length - 1;
    }

    // Initialize "User Details" and "Updated Details" columns with "No change" if it's the first time the file is created

    for (let i = 1; i < csvData.length; i++) {
      if (csvData[i][userDetailsIndex] === undefined) {
        csvData[i][userDetailsIndex] = "No change";
      }
      if (csvData[i][updatedDetailsIndex] === undefined) {
        csvData[i][updatedDetailsIndex] = "No change";
      }
    }

    // Update the specific row in the array
    csvData[index + minIndex - 1] = Object.values(data);

    // Update the specific row in the array with userName and email
    csvData[index + minIndex - 1][userDetailsIndex] = `${userName}: ${email}`;
    csvData[index + minIndex - 1][updatedDetailsIndex] = `${Object.keys(
      updatedColumn
    )}`;

    // Convert the updated array of rows back to JSON format
    const jsonArray = [];
    const headers = csvData[0];
    for (let i = 1; i < csvData.length; i++) {
      const row = csvData[i];
      const rowObject = {};
      for (let j = 0; j < headers.length; j++) {
        rowObject[headers[j]] = row[j];
      }
      jsonArray.push(rowObject);
    }

    // Convert the updated JSON data back to CSV format using the jsonToCsv function
    const updatedCSVContent = jsonToCsv(jsonArray);

    if (updatedCSVContent === null) {
      throw new Error("Error converting updated JSON to CSV");
    }

    // Write the updated content back to the original file

    fs.writeFileSync(filePath, updatedCSVContent, {
      encoding: "utf8",
    });
    // Respond with success message
    res.status(200).json({ message: "File Updated Successfully" });
  } catch (error) {
    console.error("Error Updating CSV file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = updateCsvData;
