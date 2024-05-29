const fs = require("fs");
const path = require("path");

function getAllDirectories(directoryPath) {
  let directories = [];

  // Read the contents of the directory
  fs.readdirSync(directoryPath).forEach((file) => {
    // Get the full path of the file
    const fullPath = path.join(directoryPath, file);
    // Check if it's a directory
    if (fs.statSync(fullPath).isDirectory()) {
      directories.push(file);
      // Recursively list contents of directories
      directories = directories.concat(getAllDirectories(fullPath));
    }
  });

  return directories;
}

module.exports = getAllDirectories;
