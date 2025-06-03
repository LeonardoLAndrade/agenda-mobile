const Agenda = require("../models/agenda.js");
const Ag_Profissional = require("../models/ag_profissionais.js");
const Procedimento = require("../models/procedimentos.js");
const Especialidade = require("../models/especialidade.js");
const status = require("http-status");

exports.Insert = (req, res, next) => {
  const {
    id_procedimento,
    id_profissional,
    titulo_agenda,
    data_inicio,
    data_fim,
    descricao_complementar,
    transporte,
    cor,
    situacao,
  } = req.body;

  Agenda.create({
    id_procedimento: id_procedimento,
    id_profissional: id_profissional,
    titulo_agenda: titulo_agenda,
    data_inicio: data_inicio,
    data_fim: data_fim,
    descricao_complementar: descricao_complementar,
    transporte: transporte,
    cor: cor,
    situacao: situacao,
  })
    .then((agenda) => {
      if (agenda) {
        res.status(status.OK).send(agenda);
      } else {
        res.status(status.NOT_FOUND).send();
      }
    })
    .catch((error) => next(error));
};

exports.SearchAll = (req, res, next) => {
  Agenda.findAll({
    include: [
      {
        model: Ag_Profissional,
        include: [Especialidade],
      },
      {
        model: Procedimento,
        include: [Especialidade],
      },
    ],
  })
    .then((agendas) => {
      if (agendas) {
        res.status(status.OK).send(agendas);
      } else {
        res.status(status.NOT_FOUND).send();
      }
    })
    .catch((error) => next(error));
};

exports.SearchOne = (req, res, next) => {
  const id_agenda = req.params.id;

  Agenda.findByPk(id_agenda, {
    include: [
      {
        model: Ag_Profissional,
        include: [Especialidade],
      },
      {
        model: Procedimento,
        include: [Especialidade],
      },
    ],
  })
    .then((agenda) => {
      if (agenda) {
        res.status(status.OK).send(agenda);
      } else {
        res.status(status.NOT_FOUND).send();
      }
    })
    .catch((error) => next(error));
};

exports.Update = (req, res, next) => {
  const id_agenda = req.params.id;
  const {
    id_procedimento,
    id_profissional,
    titulo_agenda,
    data_inicio,
    data_fim,
    descricao_complementar,
    transporte,
    cor,
    situacao,
  } = req.body;

  Agenda.findByPk(id_agenda)
    .then((agenda) => {
      if (agenda) {
        agenda
          .update(
            {
              id_procedimento: id_procedimento,
              id_profissional: id_profissional,
              titulo_agenda: titulo_agenda,
              data_inicio: data_inicio,
              data_fim: data_fim,
              descricao_complementar: descricao_complementar,
              transporte: transporte,
              cor: cor,
              situacao: situacao,
            },
            {
              where: { id_agenda: id_agenda },
            }
          )
          .then(() => {
            res.status(status.OK).send();
          })
          .catch((error) => next(error));
      } else {
        res.status(status.NOT_FOUND).send();
      }
    })
    .catch((error) => next(error));
};

exports.Delete = (req, res, next) => {
  const id_agenda = req.params.id;

  Agenda.findByPk(id_agenda)
    .then((agenda) => {
      if (agenda) {
        agenda
          .destroy({
            where: { id_agenda: id_agenda },
          })
          .then(() => {
            res.status(status.OK).send();
          })
          .catch((error) => next(error));
      } else {
        res.status(status.NOT_FOUND).send();
      }
    })
    .catch((error) => next(error));
};
