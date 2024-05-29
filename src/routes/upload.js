const express = require("express");
const multer = require("multer");
const csvParser = require("csv-parser");
const { uploadKey } = require("../controllers/resultGeneration/uploadKey");
const { uploadData } = require("../controllers/resultGeneration/uploadData");
const { generateCsv } = require("../controllers/resultGeneration/generateCsv");
const authMiddleware = require("../middleware/authMiddleware");

const upload = multer();
const router = express.Router();

//csv and zip upload routers
router.post("/upload/key", upload.single("keyFile"), uploadKey);
router.post(
  "/upload/data",
  upload.single("dataFile"),

  uploadData
);
router.post("/generate/csv", generateCsv);

module.exports = router;
