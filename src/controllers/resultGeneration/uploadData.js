const express = require("express");
const multer = require("multer");
const csvParser = require("csv-parser");
// const { uploadData } = require("../controllers/uploadData");
const upload = multer();
const router = express.Router();



exports.uploadData = (req, res, next) => {

    // console.log(req.body);

  // Initialize an empty array to store headers and data
  const data = [];

  // Create a read stream from the buffer of the uploaded file
  const readStream = require("stream").Readable.from(req.file.buffer);

  // Create a read stream from the buffer of the uploaded file
  readStream
    .pipe(csvParser())
    .on("headers", (csvHeaders) => {
      // Store headers
      data.push(csvHeaders);
    })
    .on("data", (row) => {
      // Store data rows
      data.push(row);
    })
    .on("end", () => {
      // console.log("Data extracted successfully:", data);
      res.status(200).json({ data });
    })
    .on("error", (err) => {
      console.error("Error extracting data:", err);
      res.status(500).send("Error extracting data.");
    });
};
