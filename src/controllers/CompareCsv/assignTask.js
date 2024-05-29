const Assigndata = require("../../models/TempleteModel/assigndata");
const Template = require("../../models/TempleteModel/templete");
const assignTask = async (req, res, next) => {
  const { assignedUsers, templateName } = req.body;

  try {
    const {id} = await Template.create({
      name: templateName,
      TempleteType: "CSVCompare",
    });
    const creationPromises = assignedUsers.map(async (task) => {
      const {
        userId,
        fileId,
        max,
        min,
        moduleType,
        correctedFilePath,
        errorFilePath,
        imageDirectoryPath,
      } = task;

      await Assigndata.create({
        userId: userId,
        templeteId: id,
        fileId: fileId,
        max: max,
        min: min,
        currentIndex: min,
        moduleType: moduleType,
        correctedCsvFilePath: correctedFilePath,
        errorFilePath: errorFilePath,
        imageDirectoryPath: imageDirectoryPath,
      });
    });

    await Promise.all(creationPromises);
    return res.status(200).json({ message: "Users assigned successfully" });
  } catch (error) {
    console.error("Error assigning users:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = assignTask;
