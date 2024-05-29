const Files = require("../../models/TempleteModel/files");
const path = require("path");
const fs = require("fs").promises; // Use the promises API for async/await
const csvToJson = require("../../services/csv_to_json");
const jsonToCsv = require("../../services/json_to_csv");

const downloadCsv = async (req, res) => {
  try {
    const fileId = req.params.id;
    if (!fileId) {
      return res.status(400).json({ error: "File ID not provided" });
    }

    const fileData = await Files.findOne({
      where: { id: fileId },
    });

    if (!fileData) {
      return res.status(404).json({ error: "File not found" });
    }

    const filename = fileData.csvFile;
    const filePath = "csvFile/"+ filename;

    try {
      await fs.access(filePath); // Check if the file exists
    } catch (err) {
      return res.status(404).json({ error: "File not found" });
    }

    const jsonData = await csvToJson(filePath);

    // Remove the first row
    jsonData.shift();

    const csvData = jsonToCsv(jsonData);

    await fs.writeFile(filePath, csvData, { encoding: "utf8" });

    // Send the file to the client for download
    return res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return res.status(500).json({ error: "An error occurred while processing your request" });
      }
    });
  } catch (error) {
    console.error("Error downloading CSV file:", error);
    return res.status(500).json({ error: "An error occurred while processing your request" });
  }
};

module.exports = downloadCsv;
