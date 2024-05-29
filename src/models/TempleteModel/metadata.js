const Sequelize = require("sequelize");

const sequelize = require("../../utils/database");

const MetaData = sequelize.define("templetedata", {
  // id: {
  //   type: Sequelize.INTEGER,
  //   autoIncrement: true,
  //   allowNull: false,
  //   primaryKey: true,
  // },
  attribute: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  coordinateX: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  coordinateY: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  width: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  height: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  fieldType: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  pageNo: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  
});

module.exports = MetaData;
