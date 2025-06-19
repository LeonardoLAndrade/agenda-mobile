const Sequelize = require("sequelize");

const environment = process.env.NODE_ENV || "development";
const config = require("../config/config.js")[environment].database;

const sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  timezone: "-04:00",
});

module.exports = sequelize;
