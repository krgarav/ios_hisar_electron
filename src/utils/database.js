const Sequelize = require("sequelize");

// const sequelize = new Sequelize("omrusermanagement", "root", "12345678", {
//   dialect: "mysql",
//   host: "localhost",
// });

// module.exports = sequelize;


// const Sequelize = require("sequelize");

// const sequelize = new Sequelize("omrscannerduplex", "root", "root", {
//   dialect: "mysql",
//   host: "localhost",
// });

// const Sequelize = require("sequelize");

const sequelize = new Sequelize("omrscannerduplex", "root", "root", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
