const Templete = require("../../models/TempleteModel/templete");
const MetaData = require("../../models/TempleteModel/metadata");

const getTempleteData = async (req, res, next) => {
  try {
    const templeteId = req.params.id;
    const templete = await Templete.findByPk(templeteId, {
      include: [
        {
          model: MetaData,
          attributes: {
            exclude: ["id", "templeteId", "createdAt", "updatedAt"], // Specify the fields to be excluded
          },
        },
      ],
    });

    if (!templete) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json(templete);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = getTempleteData;
