const Especialidade = require("../models/especialidade.js");
const Procedimento = require("../models/procedimentos.js");
const Ag_Profissional = require("../models/ag_profissionais.js");
const status = require("http-status");

// Relacionamento: Profissional tem muitas Especialidades
Ag_Profissional.belongsToMany(Especialidade, {
  through: "ProfissionalEspecialidade",
});
Especialidade.belongsToMany(Ag_Profissional, {
  through: "ProfissionalEspecialidade",
});

// Especialidade tem muitos Procedimentos
Especialidade.belongsToMany(Procedimento, {
  through: "EspecialidadeProcedimento",
});
Procedimento.belongsToMany(Especialidade, {
  through: "EspecialidadeProcedimento",
});

exports.getProfissionaisPorEspecialidade = (req, res, next) => {
  const especialidadeId = req.params.especialidadeId;

  // Consultar os profissionais com base na especialidade
  Ag_Profissional.findAll({
    where: { cod_especialidade: especialidadeId },
    include: {
      model: Especialidade,
      attributes: ["nome_especialidade"], // Incluir o nome da especialidade, se necessário
    },
  })
    .then((profissionais) => {
      if (profissionais.length > 0) {
        res.status(200).send(profissionais); // Enviar os profissionais dessa especialidade
      } else {
        res.status(404).send({
          message: "Nenhum profissional encontrado para esta especialidade",
        });
      }
    })
    .catch((error) => next(error));
};

exports.getEspecialidadesPorProfissional = (req, res, next) => {
  const profissionalId = req.params.profissionalId;

  Ag_Profissional.findByPk(profissionalId)
    .then((profissional) => {
      if (profissional) {
        res.status(status.OK).send(profissional.cod_especialidade); // Enviar especialidades com procedimentos
      } else {
        res
          .status(status.NOT_FOUND)
          .send({ message: "Profissional não encontrado" });
      }
    })
    .catch((error) => next(error));
};

exports.getProcedimentosPorEspecialidade = (req, res, next) => {
  const especialidadeId = req.params.especialidadeId;

  // Consultar os profissionais com base na especialidade
  Procedimento.findAll({
    where: { cod_especialidade: especialidadeId },
    include: {
      model: Especialidade,
      attributes: ["nome_especialidade"], // Incluir o nome da especialidade, se necessário
    },
  })
    .then((procedimentos) => {
      if (procedimentos.length > 0) {
        res.status(200).send(procedimentos); // Enviar os procedimentos dessa especialidade
      } else {
        res.status(404).send({
          message: "Nenhum procedimento encontrado para esta especialidade",
        });
      }
    })
    .catch((error) => next(error));
};

// Método para buscar todas as especialidades
exports.getEspecialidades = (req, res, next) => {
  Especialidade.findAll()
    .then((especialidades) => {
      if (especialidades) {
        res.status(status.OK).send(especialidades);
      } else {
        res.status(status.NOT_FOUND).send();
      }
    })
    .catch((error) => next(error));
};

// Método para buscar todos os procedimentos
exports.getProcedimentos = (req, res, next) => {
  Procedimento.findAll()
    .then((procedimentos) => {
      if (procedimentos) {
        res.status(status.OK).send(procedimentos);
      } else {
        res.status(status.NOT_FOUND).send();
      }
    })
    .catch((error) => next(error));
};

// Método para buscar todos os profissionais
exports.getAgProfissionais = (req, res, next) => {
  Ag_Profissional.findAll()
    .then((ag_profissionais) => {
      if (ag_profissionais) {
        res.status(status.OK).send(ag_profissionais);
      } else {
        res.status(status.NOT_FOUND).send();
      }
    })
    .catch((error) => next(error));
};
