const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");
const Files = require("../../models/TempleteModel/files");
const RowIndexData = require("../../models/TempleteModel/rowIndexData");
const Templete = require("../../models/TempleteModel/templete");
// const Assigndata = require("../../models/TempleteModel/assigndata");

const getCsvData = async (req, res, next) => {
  try {
    const fileId = req.body?.taskData?.fileId;
    if (!fileId) {
      return res.status(400).json({ error: "File ID not provided" });
    }

    const fileData = await Files.findOne({
      where: { id: fileId },
      include: [
        {
          model: Templete,
          attributes: {
            include: ["pageCount"], // Specify the fields to be excluded
          },
        },
      ],
    });

    // console.log(
    //   fileData.templete.pageCount,
    //   ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
    // );

    const extraImageColCount = fileData.templete.pageCount;

    const rowIndexdata = await RowIndexData.findOne({
      where: { assigndatumId: req.body.taskData.id },
    });

    let newRowIndexdata; // Declaring the variable outside the if block to ensure its scope

    if (!rowIndexdata) {
      // If rowIndexData is falsey, it means no entry was found, so we create a new one
      try {
        newRowIndexdata = await RowIndexData.create({
          assigndatumId: req.body.taskData.id,
          // Add other properties you need to create here
        });
        // Handle success
        // console.log("New RowIndexData created:", newRowIndexdata);
      } catch (error) {
        // Handle error
        // console.error("Error creating RowIndexData:", error);
        // You can also throw the error to pass it to the calling function for further handling
        throw error;
      }
    }

    // console.log(">>>>>>>>>>>>>>>>>>>>", rowIndexdata);
    if (!fileData) {
      return res.status(404).json({ error: "File not found" });
    }

    const filename = fileData.csvFile;
    const filePath = "csvFile/"+ filename;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    let workbook, worksheet;
    try {
      workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      worksheet = workbook.Sheets[sheetName];
    } catch (readError) {
      console.error("Error reading CSV file:", readError);
      return res.status(500).json({ error: "Error reading CSV file" });
    }

    const { min, max, conditions } = req.body?.taskData || {};
    const minIndex = parseInt(min);
    const maxIndex = parseInt(max);

    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
      // header: 1,
    });

    if (
      isNaN(minIndex) ||
      isNaN(maxIndex) ||
      minIndex < 0 ||
      minIndex >= jsonData.length ||
      maxIndex < 0 ||
      maxIndex >= jsonData.length ||
      maxIndex < minIndex
    ) {
      return res.status(400).json({ error: "Invalid min or max value" });
    }

    const imgageColNameFinder = Object.values(jsonData[0]);

    let imageColNameContainer = [];
    let count = 1;

    while (true) {
      const imageName = `Image${count}`;
      if (imgageColNameFinder.includes(imageName)) {
        imageColNameContainer.push(imageName);
        count++;
      } else {
        break;
      }
    }

    // Find keys for the values in imgageColNameContainer
    let imageColKeyContainer = [];

    imageColNameContainer.forEach((imageName) => {
      for (const [key, value] of Object.entries(jsonData[0])) {
        if (value === imageName) {
          imageColKeyContainer.push(key);
          break; // Found the key for the current imageName, move to the next imageName
        }
      }
    });

    function isBlankOrSpecial(obj, conditions, checkBeforeThisKey) {
      const blankCount = conditions.Blank || 0;
      const includeStar = conditions["*"] || false;
      const includeAllData = conditions.AllData || false;

      // Determine the index of checkBeforeThisKey in the object's keys
      const keys = Object.keys(obj);
      const checkBeforeIndex = keys.indexOf(checkBeforeThisKey);

      // Filter keys to exclude the checkBeforeThisKey and all keys after it
      const keysToCheck =
        checkBeforeIndex !== -1 ? keys.slice(0, checkBeforeIndex) : keys;

      // Count blank and space occurrences only for keys before checkBeforeThisKey
      const blankAndSpaceCount = keysToCheck.reduce(
        (count, key) => {
          const value = obj[key];
          if (typeof value === "string") {
            if (value.trim() === "" || value === "BLANK") {
              count.blank += 1;
            }
            if (value.includes(" ")) {
              count.space += 1;
            }
          }
          return count;
        },
        { blank: 0, space: 0 }
      );

      const totalOccurrences =
        blankAndSpaceCount.blank + blankAndSpaceCount.space;

      // Function to check if any value meets the criteria in the object before checkBeforeThisKey
      const hasDesiredValue = () => {
        return keysToCheck.some((key) => {
          const value = obj[key];
          if (typeof value === "string") {
            // Check if trimmed value is empty or equals "BLANK"
            if (value.trim() === "" || value === "BLANK") {
              return true;
            }
            // Check if value includes "*"
            if (value.includes("*")) {
              return true;
            }
            // Check if value has spaces
            if (value.includes(" ")) {
              return true;
            }
          }
          return false;
        });
      };

      // Check includeAllData condition
      if (includeAllData) {
        return hasDesiredValue();
      }

      // Check includeStar condition only before checkBeforeThisKey
      if (includeStar) {
        const hasStar = keysToCheck.some(
          (key) => typeof obj[key] === "string" && obj[key].includes("*")
        );

        // Check if blankCount condition is met only before checkBeforeThisKey
        if (blankCount > 0) {
          return hasStar || totalOccurrences >= blankCount;
        }
        return hasStar;
      }

      // Check blankCount condition only before checkBeforeThisKey
      if (blankCount > 0) {
        return totalOccurrences >= blankCount;
      }

      return false;
    }

    const filteredData = [];

    const minToMaxData = jsonData.slice(minIndex, maxIndex + 1);

    minToMaxData.forEach((obj, index) => {
      const conditionCheck = isBlankOrSpecial(
        obj,
        conditions,
        imageColKeyContainer[0]
      );
      if (conditionCheck) {
        // Attach rowIndex to the object and add it to filteredData
        filteredData.push({ ...obj, rowIndex: minIndex - 1 + index });
      }
    });

    if (filteredData.length === 0) {
      return res.status(404).json({ error: "No data matching the conditions" });
    }

    filteredData.unshift(jsonData[0]);

    // console.log(filteredData[3])

    res.status(200).json({
      filteredData,
      rowIndexdata: rowIndexdata === null ? newRowIndexdata : rowIndexdata,
    });

    // res.status(200).json(checkUntillThisKey );
  } catch (error) {
    console.error("Error handling data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = getCsvData;
