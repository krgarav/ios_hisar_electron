const Assigndata = require("../../models/TempleteModel/assigndata");

const assignUser = async (req, res, next) => {
  
  const userTasks = req.body;
  // console.log(req.body, "assign");
  try {
    const creationPromises = userTasks.map(async (task) => {
      const { userId, templeteId, fileId, max, min, moduleType, correctedFilePath, errorFilePath, imageDirectoryPath } = task;
      await Assigndata.create({
        userId: userId,
        templeteId: templeteId,
        fileId: fileId,
        max: max,
        min: min,
        currentIndex: min,
        moduleType: "Data Entry",
        correctedCsvFilePath: correctedFilePath,
        errorFilePath: errorFilePath,
        imageDirectoryPath: imageDirectoryPath

      });
    });

    await Promise.all(creationPromises);
    return res.status(200).json({ message: "Users assigned successfully" });
  } catch (error) {
    console.error("Error assigning users:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = assignUser;
