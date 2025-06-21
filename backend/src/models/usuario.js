const { DataTypes } = require("sequelize");
const sequelize = require("../database/database");

const Usuario = sequelize.define(
  "USUARIO",
  {
    IDUSUARIO: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_PROFISSIO: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    LOGUSUARIO: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    SENHAUSUA: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
  },
  {
    tableName: "USUARIO",
    timestamps: false,
  }
);

module.exports = Usuario;
