const Sequelize = require("sequelize");
const sequelize = require("../database/database.js");

const Especialidade = sequelize.define(
  "especialidades",
  {
    cod_especialidade: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING(3),
    },
    nome_especialidade: {
      allowNull: false,
      type: Sequelize.STRING(40),
      validate: {
        len: [3, 40],
      },
    },
  },
  {
    timestamps: false, // não adicionar os campos createdAt e updatedAt automaticamente
  }
);

module.exports = Especialidade;
