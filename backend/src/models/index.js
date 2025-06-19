const sequelize = require("../database/database");

const Agenda = require("./agenda");
const Especialidade = require("./especialidade");
const EspecProced = require("./especproced");
const PessoaFisica = require("./pessoafis");
const Procedimento = require("./procedimento");
const ProfiEspec = require("./profiespec");
const Profissional = require("./profissional");

// ──────────────── RELACIONAMENTOS ──────────────── //

// AGENDA → PROFISSIONAL
Agenda.belongsTo(Profissional, {
  foreignKey: "ID_PROFISSIO",
  as: "profissional",
});

// AGENDA → PROCEDIMENTO
Agenda.belongsTo(Procedimento, {
  foreignKey: "ID_PROCED",
  as: "procedimento",
});

// AGENDA → PESSOAFIS (via ID_PESSOAFIS)
Agenda.belongsTo(PessoaFisica, {
  foreignKey: "ID_PESSOAFIS",
  as: "pessoaFisAgenda",
});

// PROFISSIONAL → PESSOAFIS
Profissional.belongsTo(PessoaFisica, {
  foreignKey: "ID_PESSOAFIS",
  as: "pessoa",
});

// PROFISSIONAL → ESPECIALIDADE
Profissional.belongsTo(Especialidade, {
  foreignKey: "ID_CONSEPROFI",
  as: "especialidade", // OK — só existe aqui
});

// ⚠️ IMPORTANTE: Retirado o belongsTo direto entre Procedimento → Especialidade
// pois ele entraria em conflito com o relacionamento via tabela associativa.

// ESPECIALIDADE ⇄ PROCEDIMENTO via ESPECPROCED
Especialidade.belongsToMany(Procedimento, {
  through: EspecProced,
  foreignKey: "ID_ESPEC",
  otherKey: "ID_PROCED",
  as: "procedimentos", // OK
});

Procedimento.belongsToMany(Especialidade, {
  through: EspecProced,
  foreignKey: "ID_PROCED",
  otherKey: "ID_ESPEC",
  as: "especialidades", // OK
});

// ESPECPROCED → ESPECIALIDADE
EspecProced.belongsTo(Especialidade, {
  foreignKey: "ID_ESPEC",
  as: "especialidade",
});

// ESPECPROCED → PROCEDIMENTO
EspecProced.belongsTo(Procedimento, {
  foreignKey: "ID_PROCED",
  as: "procedimento",
});

Profissional.belongsToMany(Especialidade, {
  through: ProfiEspec,
  foreignKey: "ID_PROFISSIO",
  otherKey: "ID_ESPEC",
  as: "especialidadesProfissional",
});

Especialidade.belongsToMany(Profissional, {
  through: ProfiEspec,
  foreignKey: "ID_ESPEC",
  otherKey: "ID_PROFISSIO",
  as: "profissionais",
});
// ──────────────── EXPORT ──────────────── //

module.exports = {
  sequelize,
  Especialidade,
  Procedimento,
  EspecProced,
  PessoaFisica,
  Profissional,
  Agenda,
};
