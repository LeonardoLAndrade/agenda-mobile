const Sequelize = require("sequelize");

const environment = process.env.NODE_ENV || "development";
const config = require("../config/config.js")[environment].database;

const sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: console.log,
});

module.exports = sequelize;
