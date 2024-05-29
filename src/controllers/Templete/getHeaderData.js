const Files = require("../../models/TempleteModel/files");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const getHeaderData = (req, res, next) => {
  const userRole = req.role;
  if (userRole != "Admin") {
    return res
      .status(500)
      .json({ message: "You don't have access for performing this action" });
  }

  try {
    Files.findOne({ where: { id: req.params.id } }).then((fileData) => {
      if (!fileData) {
        return res.status(404).json({ error: "File not found" });
      }
      const fileName = fileData.csvFile;
      const filePath = "csvFile/"+ fileName;

      if (fs.existsSync(filePath)) {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, {
          raw: true,
          defval: "",
        });

        if (data.length === 0) {
          return res
            .status(404)
            .json({ error: "No content found in excel sheet" });
        }

        const headers = Object.keys(data[0]);
        const rowCount = data.length;

        res.status(200).json({ headers, rowCount });
      } else {
        res.status(404).json({ error: "File not found on given filepath" });
      }
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getHeaderData;
