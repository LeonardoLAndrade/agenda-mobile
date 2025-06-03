const Sequelize = require("sequelize");
const sequelize = require("../database/database.js");
const Ag_Profissionais = require("./ag_profissionais.js");
const Procedimentos = require("./procedimentos.js");

const Agenda = sequelize.define(
  "agenda",
  {
    id_agenda: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    id_procedimento: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: "procedimentos", // nome da tabela de referência
        key: "id_procedimento", // chave primária da tabela de referência
      },
    },
    id_profissional: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: "ag_profissionais", // nome da tabela de referência
        key: "id_profissional", // chave primária da tabela de referência
      },
    },
    titulo_agenda: {
      allowNull: false,
      type: Sequelize.STRING(200),
      validate: {
        len: [3, 200],
      },
    },
    data_inicio: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    data_fim: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    descricao_complementar: {
      type: Sequelize.STRING(255),
    },
    transporte: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    cor: {
      type: Sequelize.STRING(7), // ex: "#FFFFFF" para cores hexadecimais
    },
    situacao: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: false, // não adicionar os campos createdAt e updatedAt automaticamente
  }
);

Agenda.belongsTo(Ag_Profissionais, {
  foreignKey: "id_profissional",
});

Agenda.belongsTo(Procedimentos, {
  foreignKey: "id_procedimento",
});

module.exports = Agenda;
