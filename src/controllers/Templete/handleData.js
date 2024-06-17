const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const Files = require("../../models/TempleteModel/files");
const jsonToCsv = require("../../services/json_to_csv");
const csvToJson = require("../../services/csv_to_json");

const handleData = async (req, res, next) => {
  const userRole = req.role;
  if (userRole != "Admin") {
    return res
      .status(500)
      .json({ message: "You don't have access for performing this action" });
  }
  const { mappedData } = req.body;
  // console.log("mappedData", mappedData);

  try {
    if (!mappedData.fileId) {
      return res.status(400).json({ error: "File not provided" });
    }

    Files.findOne({ where: { id: mappedData.fileId } }).then((fileData) => {
      // console.log(fileData.csvFile)
      if (!fileData.csvFile) {
        return res.status(404).json({ error: "File not exists" });
      }
      const filename = fileData?.csvFile;
      // console.log(filename);
      const filePath = "csvFile/" + filename;

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, {
        raw: true,
        defval: "",
      });

      // const newDataKeys = Object.keys(data[0]);
      // const newHeaders = Object.values(mappedData);
      // newHeaders.pop();
      // console.log("data[0]",data[0])
      // console.log("newDataKeys",newDataKeys);
      // console.log("newHeaders",newHeaders);

      // if (newDataKeys.length !== newHeaders.length) {
      //   return res.status(400).json({ error: "Mapped data headers mismatch" });
      // }

      // const mergedObject = newDataKeys.reduce((acc, key, index) => {
      //   acc[key] = newHeaders[index];
      //   return acc;
      // }, {});

      // console.log(mergedObject)

      // if (JSON.stringify(data[0]) !== JSON.stringify(mergedObject))
      //    {
      // }

      // console.log(mergedObject)
      // console.log(data);
      // delete mappedData.fileId;

      // Remove fileId from mappedData and transform associationData back to key-value object
      const associationDataArray = mappedData.associationData;
      const associationData = associationDataArray.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});

      // console.log("associationData", associationData);

      data.unshift(associationData);
      const csvData = jsonToCsv(data);

      fs.unlinkSync(filePath);
      fs.writeFileSync(filePath, csvData, {
        encoding: "utf8",
      });

      res.status(200).json("Header added successfully");
    });
  } catch (error) {
    console.error("Error handling data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = handleData;
