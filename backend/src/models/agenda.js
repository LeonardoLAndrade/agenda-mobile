const { DataTypes } = require("sequelize");
const sequelize = require("../database/database");

const Agenda = sequelize.define(
  "AGENDA",
  {
    IDAGENDA: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_PESSOAFIS: DataTypes.INTEGER,
    ID_PROFISSIO: DataTypes.INTEGER,
    ID_PROCED: DataTypes.INTEGER,
    SOLICMASTER: DataTypes.TINYINT,
    DESCRCOMP: DataTypes.STRING,
    DATANOVA: DataTypes.DATE,
    DATAABERT: DataTypes.DATE,
    SITUAGEN: DataTypes.STRING,
    MOTIALT: DataTypes.STRING,
  },
  {
    tableName: "AGENDA",
    timestamps: false,
  }
);
module.exports = Agenda;
