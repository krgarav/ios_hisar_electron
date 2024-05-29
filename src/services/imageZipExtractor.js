const JSZip = require("jszip")
const path = require("path");
const fs = require("fs");
const extractImagesFromZip = async (zipFile, outputDirectory) => {
    const zip = await JSZip.loadAsync(zipFile);

    // Create output directory if it doesn't exist
    await fs.mkdir(outputDirectory, { recursive: true });

    // Iterate over each file in the zip
    await Promise.all(Object.keys(zip.files).map(async (fileName) => {
        const file = zip.files[fileName];
        if (!file.dir && /\.(jpg|jpeg|png|gif)$/i.test(fileName)) {
            // If the file is not a directory and has a supported image extension
            const buffer = await file.async('nodebuffer');
            const filePath = path.join(outputDirectory, fileName);
            await fs.writeFile(filePath, buffer);
        }
    }));

};

module.exports = extractImagesFromZip;