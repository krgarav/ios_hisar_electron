const multer = require("multer");
const XLSX = require("xlsx");
const Files = require("../../models/TempleteModel/files");
const path = require("path");
const fs = require("fs");
const unzipper = require("unzipper");
const getAllDirectories = require("../../services/directoryFinder");
const jsonToCsv = require("../../services/json_to_csv");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ext = ["zip", "zipx", "jar", "apk", "ipa", "cbz", "7z"];
    // Determine the destination folder based on file type
    const destinationFolder = ext.includes(file.originalname.split(".").pop())
      ? "zipFile/"
      : "csvFile/"
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder);
    }
    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now() / 1000;
    cb(null, `${timestamp}_${file.originalname}`);
  },
});

// Accept both "csvFile" and "zipFile" fields
const upload = multer({ storage: storage }).fields([
  { name: "csvFile" },
  { name: "zipFile" },
]);


const uploadPromise = async (req, res, next, id, imageColNames) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, async function (err) {
        if (err) {
          console.error("Error uploading files:", err);
          return reject("Error uploading files");
        }

        try {
          const { csvFile, zipFile } = req.files;

          // Update database with file names
          const createdFile = await Files.create({
            csvFile: csvFile[0].filename,
            zipFile: zipFile[0].filename,
            templeteId: id,
          });

          const filePath = "csvFile/" +
            csvFile[0].filename
            ;
          const zipFilePath =
            "zipFile/" +
            zipFile[0].filename

          const destinationFolderPath = "extractedFiles/" +
            zipFile[0].filename.replace(".zip", "")


          // Ensure destination folder exists
          if (!fs.existsSync(destinationFolderPath)) {
            try {
              fs.mkdirSync(destinationFolderPath, { recursive: true });
            } catch (error) {
              console.error("Error creating destination folder:", error);
              throw error;
            }
          }

          const extractStream = unzipper.Parse();
          extractStream.on("entry", (entry) => {
            const fileName = entry.path;
            const destinationPath = path.join(destinationFolderPath, fileName);

            // Ensure parent directories exist before writing files
            const parentDir = path.dirname(destinationPath);
            if (!fs.existsSync(parentDir)) {
              fs.mkdirSync(parentDir, { recursive: true });
            }

            if (fileName.endsWith("/")) {
              // Create directories
              fs.mkdirSync(destinationPath, { recursive: true });
            } else {
              // Extract files
              entry.pipe(fs.createWriteStream(destinationPath));
            }
          });

          extractStream.on("error", (err) => {
            console.error("Error unzipping file:", err);
            reject(err);
          });

          extractStream.on("finish", async () => {
            console.log("File unzipped successfully");

            const allDirectories = getAllDirectories(destinationFolderPath);
            const pathDir = `${zipFile[0].filename.replace(
              ".zip",
              ""
            )}/${allDirectories.join("/")}`;

            if (fs.existsSync(filePath)) {
              const workbook = XLSX.readFile(filePath);
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const data = XLSX.utils.sheet_to_json(worksheet, {
                raw: true,
                defval: "",
                // header: 1,
              });

              const colNames = imageColNames.split(",");
              const updatedJson = data.map((obj) => obj);

              // Check if all column names exist in the JSON data
              const missingCols = colNames.filter(
                (colName) => !updatedJson[0].hasOwnProperty(colName)
              );

              if (missingCols.length > 0) {
                return res.status(400).json({
                  error: `Image column name(s) not found: ${missingCols.join(
                    ", "
                  )}`,
                });
              }

              // Process each column name and update the corresponding values in the JSON data
              colNames.forEach((colName) => {
                const column = colName.replaceAll('"', ""); // Remove any extra quotes from the column name
                updatedJson.forEach((obj) => {
                  const imagePath = obj[column];
                  const filename = path.basename(imagePath);
                  obj[column] = `${pathDir}/${filename}`;
                });
              });

              fs.unlinkSync(filePath);

              const updatedCSVContent = jsonToCsv(updatedJson);

              // Write the updated content back to the original file
              fs.writeFileSync(filePath, updatedCSVContent, {
                encoding: "utf8",
              });
              res.status(200).json({ fileId: createdFile.id });
              resolve("File Uploaded Successfully");
            } else {
              res.status(404).json({ error: "CSV File not found" });
            }
          });

          fs.createReadStream(zipFilePath).pipe(extractStream);
        } catch (error) {
          console.error("Error updating database:", error);
          return res.status(500).send(error);
        }
      });
    });
  } catch (error) {
    console.error("Error handling upload:", error);
    return res.status(500).send(error);
  }
};

const handleUpload = async (req, res, next) => {
  const userRole = req.role;
  // console.log(userRole, "-----------");
  if (userRole != "Admin") {
    return res
      .status(500)
      .json({ message: "You don't have access for performing this action" });
  }
  try {
    await uploadPromise(req, res, next, req.params.id, req.query.imageNames);
    console.log("Files Uploaded successfully");
  } catch (error) {
    console.error("Error handling upload:", error);
    return res.status(500).send(error);
  }
};

module.exports = handleUpload;
