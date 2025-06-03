const Sequelize = require("sequelize");
const sequelize = require("../database/database.js");

const Profissionais = sequelize.define(
  "profissionais",
  {
    cod_prof: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER(5),
      validate: {
        len: [1, 5],
      },
    },
    nome_prof: {
      allowNull: false,
      type: Sequelize.STRING(100),
      validate: {
        len: [5, 100],
      },
    },
    tipo_prof: {
      allowNull: false,
      type: Sequelize.INTEGER(1),
      validate: {
        isIn: {
          args: [[1, 2, 3, 4]],
          msg: "O campo 'tipo_prof' deve ser 1, 2, 3 ou 4.",
        },
      },
    },
    sup_prof: {
      allowNull: true,
      type: Sequelize.INTEGER(5),
      references: {
        model: "profissionais",
        key: "cod_prof",
      },
    },
    status_prof: {
      allowNull: false,
      type: Sequelize.INTEGER(1),
      validate: {
        isIn: {
          args: [[1, 2, 3]],
          msg: "O campo 'status_prof' deve ser 1, 2 ou 3.",
        },
      },
    },
    cons_prof: {
      allowNull: false,
      type: Sequelize.STRING(10),
    },
    senha_prof: {
      allowNull: false,
      type: Sequelize.STRING(70),
      validate: {
        len: {
          args: [8, 70],
          msg: "A senha deve ter de 8 à 12 caracteres.",
        },
      },
      set(value) {
        const hashedPassword = hashPassword(value); // Função que criptografa a senha
        this.setDataValue("senha_prof", hashedPassword);
      },
    },
  },
  {
    timestamps: false, // não adicionar os campos createdAt e updatedAt automaticamente
  }
);

function hashPassword(password) {
  const bcrypt = require("bcryptjs");
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

module.exports = Profissionais;
