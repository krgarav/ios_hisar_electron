const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destinationFolder = "csvCompare/";
    // if (!fs.existsSync(destinationFolder)) {
    //     fs.mkdirSync(destinationFolder);
    // }
    cb(null, destinationFolder); // Destination folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use original filename
  },
});

// Set up multer storage
const upload = multer({ storage: storage }).single("file");
const uploadCsv = (req, res, next) => {
  const userPermissions = req.permissions;
  if (!userPermissions.csvCompare) {
    return res
      .status(500)
      .json({ message: "you dont have access for performing this action" });
  }
  upload(req, res, (err) => {
    if (err) {
      // Multer error occurred
      console.error("Multer error:", err);
      return res.status(400).json({ error: "Failed to upload file" });
    }
    // Call next middleware (csvUpload function) after upload is complete
    console.log(req.file);
    req.uploadedFile = req.file;
    next();
  });
};

module.exports = uploadCsv;
