const Sequelize = require("sequelize");
const sequelize = require("../database/database.js");
const Especialidade = require("./especialidade.js");

const Profissional = sequelize.define(
  "ag_profissionais",
  {
    id_profissional: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    nome_profissional: {
      allowNull: false,
      type: Sequelize.STRING(150),
      validate: {
        len: [3, 150],
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

Profissional.belongsTo(Especialidade, {
  foreignKey: "cod_especialidade",
});

module.exports = Profissional;
