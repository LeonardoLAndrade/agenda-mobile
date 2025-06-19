const { DataTypes } = require("sequelize");
const sequelize = require("../database/database");

const ProfiEspec = sequelize.define(
  "ProfiEspec",
  {
    ID_PROFIESPEC: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_PROFISSIO: DataTypes.INTEGER,
    ID_ESPEC: DataTypes.INTEGER,
  },
  {
    tableName: "PROFI_ESPEC",
    timestamps: false,
  }
);

module.exports = ProfiEspec;
