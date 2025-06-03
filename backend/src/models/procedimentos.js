const Sequelize = require("sequelize");
const sequelize = require("../database/database.js");
const Especialidade = require("./especialidade.js");

const Procedimentos = sequelize.define(
  "procedimentos",
  {
    id_procedimento: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    procedimento: {
      allowNull: false,
      type: Sequelize.STRING(120),
      validate: {
        len: [3, 120],
      },
    },
    cod_especialidade: {
      allowNull: false,
      type: Sequelize.STRING(3),
      references: {
        model: "especialidades", // nome da tabela de referência
        key: "cod_especialidade", // chave primária da tabela de referência
      },
    },
  },
  {
    timestamps: false, // não adicionar os campos createdAt e updatedAt automaticamente
  }
);

Procedimentos.belongsTo(Especialidade, {
  foreignKey: "cod_especialidade",
});

module.exports = Procedimentos;
