const Templete = require("../../models/TempleteModel/templete");
const MetaData = require("../../models/TempleteModel/metadata");

const addTemplete = async (req, res, next) => {
  const { templateData, metaData } = req.body.data;
  const userRole = req.role;
  // console.log(metaData, "--------------");

  if (userRole !== "Admin") {
    return res.status(500).json({ message: "Only Admin can form this action" });
  }

  // Validate templateData
  if (!templateData.name || !templateData.pageCount) {
    return res
      .status(400)
      .json({ message: "Template name and page count are required" });
  }

  try {
    const templeteResult = await Templete.create({
      name: templateData.name,
      TempleteType: "Data Entry",
      pageCount: templateData.pageCount,
    });

    if (!templeteResult) {
      throw new Error("Failed to create template");
    }

    await Promise.all(
      metaData.map(async (current) => {
        MetaData.create({
          attribute: current.attribute,
          coordinateX: current.coordinateX,
          coordinateY: current.coordinateY,
          width: current.width,
          height: current.height,
          fieldType: current.fieldType,
          pageNo: current.pageNo,
          templeteId: templeteResult.id,
        });
      })
    );

    res.status(200).json({ message: "Created Successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = addTemplete;
