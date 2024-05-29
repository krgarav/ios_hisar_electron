const fs = require("fs").promises;
const path = require("path");
const Assigndata = require("../../models/TempleteModel/assigndata");
const RowIndexData = require("../../models/TempleteModel/rowIndexData");

const getImage = async (req, res, next) => {
  const userPermission = req.permissions;
  if (userPermission.dataEntry !== true) {
    return res.status(500).json({ message: "User not authorized" });
  }

  try {
    const { imageNameArray, id, rowIndex, colName } = req.body;

    const colNameAndRowIndex = {
      [colName]: rowIndex,
    };

    if (
      !imageNameArray ||
      !Array.isArray(imageNameArray) ||
      imageNameArray.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "ImageNameArray is missing or empty" });
    }

    // console.log(">>>>>>>>>>>>",imageNameArray)

    // if (!imageName) {
    //   return res.status(400).json({ error: "ImageName is Missing" });
    // }

    const assigndataInstance = await Assigndata.findOne({
      where: { id: id },
      include: {
        model: RowIndexData,
      },
    });

    if (!assigndataInstance) {
      return res.status(400).json({ error: "CurrentIndex mismatched with ID" });
    }

    // Find the existing row
    const rowdataInstance = await RowIndexData.findOne({
      where: { assigndatumId: id },
    });
    // console.log(">>>>>>>>>>>>>>>>>",rowdataInstance)

    if (rowdataInstance) {
      // If the row already exists, update the specific column value
      await rowdataInstance.update(colNameAndRowIndex);
    } else {
      // If the row doesn't exist, return an error
      return res.status(404).json({ error: "Rowdata instance not found" });
    }

    const arrayOfImages = [];

    for (const imageName of imageNameArray) {
      if (!imageName) {
        return res.status(400).json({ error: "ImageName is missing" });
      }

      const sourceFilePath = 
        "extractedFiles/"+
        imageName;
      

      try {
        await fs.access(sourceFilePath); // Check if the file exists

        const image = await fs.readFile(sourceFilePath); // Read the file
        const base64Image = image.toString("base64"); // Convert to Base64

        arrayOfImages.push({ base64Image });
      } catch (error) {
        // If the file doesn't exist or any other error occurs, handle it
        return res.status(404).json({ error: `File not found: ${imageName}` });
      }
    }

    // const sourceFilePath = path.join(
    //   __dirname,
    //   "..",
    //   "..",
    //   "extractedFiles",
    //   imageName
    // );

    // console.log(sourceFilePath, "<<<<<<<<<<<<<<<<<<");

    // const sourceFileExists = await fs
    //   .access(sourceFilePath)
    //   .then(() => true)
    //   .catch(() => false);

    // console.log(sourceFileExists, "----------------------");

    // if (!sourceFileExists) {
    //   return res.status(404).json({ error: "File not found" });
    // }

    // Check if source file exists
    // const sourceFileExists = await fs
    //   .access(sourceFilePath)
    //   .then(() => true)
    //   .catch(() => false);
    //

    // Read the TIFF file
    // const image = await Jimp.read(sourceFilePath);
    // const bufferImage = await image.getBufferAsync(Jimp.MIME_PNG);
    // const base64Image = bufferImage.toString("base64");

    // const base64Image = sourceFilePath.toString("base64");

    // const data = await MetaData.findAll({ where: { templeteId: id } });
    // if (data.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ error: "No data found for the provided Id" });
    // }

    // const allImages = await Promise.all(
    //   data.map(async (item) => {
    //     const { attribute, coordinateX, coordinateY, width, height } =
    //       item.dataValues;

    //     const coordinates = {
    //       x: Math.ceil(coordinateX),
    //       y: Math.ceil(coordinateY),
    //       width: Math.ceil(width),
    //       height: Math.ceil(height),
    //     };

    //     // const imageUrl = await cropImage(base64Image, coordinates);
    //     return { attribute, imageUrl };
    //   })
    // );

    // Send the buffer image and cropped images as a response

    // console.log(sourceFilePath);
    // return;

    // const image = await fs.readFile(sourceFilePath);
    // const base64Image = image.toString("base64");

    res.status(200).json({ arrayOfImages, id: rowdataInstance.id });
  } catch (err) {
    // Handle errors
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = getImage;
