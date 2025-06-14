const {
  Profissional,
  PessoaFisica,
  Especialidade,
  Procedimento,
  EspecProced,
} = require("../models");
const status = require("http-status");

exports.getEspecialidades = (req, res, next) => {
  Especialidade.findAll()
    .then((especialidades) => res.status(status.OK).send(especialidades))
    .catch((error) => next(error));
};

exports.getProcedimentos = async (req, res, next) => {
  try {
    const procedimentos = await Procedimento.findAll({
      include: [
        {
          model: Especialidade,
          as: "especialidades",
          through: { attributes: [] }, // oculta dados da tabela ESPECPROCED
          attributes: ["IDESPEC", "DESCESPEC"],
        },
      ],
    });

    res.status(200).send(procedimentos);
  } catch (error) {
    next(error);
  }
};

exports.getProcedimentosPorEspecialidade = (req, res, next) => {
  const idEspecialidade = req.params.id;

  EspecProced.findAll({
    where: { ID_ESPEC: idEspecialidade },
    include: [{ model: Procedimento, as: "procedimento" }],
  })
    .then((result) => {
      const procedimentos = result.map((r) => r.procedimento);
      res.status(status.OK).send(procedimentos);
    })
    .catch((error) => next(error));
};

exports.getProfissionais = (req, res, next) => {
  Profissional.findAll({
    include: [{ model: PessoaFisica, as: "pessoa" }],
  })
    .then((profissionais) => res.status(status.OK).send(profissionais))
    .catch((error) => next(error));
};

exports.getProfissionaisPorEspecialidade = (req, res, next) => {
  const idEspecialidade = req.params.id;

  Profissional.findAll({
    include: [{ model: PessoaFisica, as: "pessoa" }],
  })
    .then((profissionais) => res.status(status.OK).send(profissionais))
    .catch((error) => next(error));
};
