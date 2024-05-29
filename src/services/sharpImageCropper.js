const sharp = require("sharp");

async function cropImage(base64Image, coordinates) {
  const inputBuffer = Buffer.from(base64Image, "base64");

  // Log the dimensions of the input image
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();
  // console.log("Input image dimensions:", metadata.width, "x", metadata.height);

  // Crop the image
  try {
    const croppedBuffer = await image
      .extract({
        left: coordinates.x,
        top: coordinates.y,
        width: coordinates.width,
        height: coordinates.height,
      })
      .toBuffer();
      
    // Check if the cropped buffer is empty
    if (!croppedBuffer || croppedBuffer.length === 0) {
      console.log("Cropped image buffer is empty.");
      return;
    }

    // Convert the cropped buffer to a Base64 string
    const croppedBase64Image = croppedBuffer.toString("base64");

    return croppedBase64Image;
  } catch (error) {
    console.error("Error cropping image:", error);
    return error;
  }
}

module.exports = cropImage;
