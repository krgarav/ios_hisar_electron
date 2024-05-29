const Sequelize = require("sequelize");

const sequelize = require("../../utils/database");

const RowIndexData = sequelize.define("rowindexdata", {

  allDataIndex: {
    type: Sequelize.STRING,
    defaultValue: 0
  },

  multDataIndex: {
    type: Sequelize.STRING,
    defaultValue: 0
  },

  blankDataIndex: {
    type: Sequelize.STRING,
    defaultValue: 0
  },

  multAndBlankDataIndex: {
    type: Sequelize.STRING,
    defaultValue: 0
  },
});

module.exports = RowIndexData;
