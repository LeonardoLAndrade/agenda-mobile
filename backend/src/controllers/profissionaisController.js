const Profissionais = require("../models/profissionais.js");
const status = require("http-status");

exports.Insert = (req, res, next) => {
  const { nome_prof, tipo_prof, sup_prof, status_prof, cons_prof, senha_prof } =
    req.body;

  Profissionais.create({
    nome_prof: nome_prof,
    tipo_prof: tipo_prof,
    sup_prof: sup_prof,
    status_prof: status_prof,
    cons_prof: cons_prof,
    senha_prof: senha_prof,
  })
    .then((profissional) => {
      if (profissional) {
        res.status(status.OK).send(profissional);
      } else {
        res.status(status.NOT_FOUND).send();
      }
    })
    .catch((error) => next(error));
};

exports.SearchAll = (req, res, next) => {
  Profissionais.findAll()
    .then((profissionais) => {
      if (profissionais) {
        res.status(status.OK).send(profissionais);
      } else {
        res.status(status.NOT_FOUND).send();
      }
    })
    .catch((error) => next(error));
};

exports.SearchOne = (req, res, next) => {
  const cod_prof = req.params.id;

  Profissionais.findByPk(cod_prof)
    .then((profissional) => {
      if (profissional) {
        res.status(status.OK).send(profissional);
      } else {
        res.status(status.NOT_FOUND).send();
      }
    })
    .catch((error) => next(error));
};

exports.GetNextProfId = (req, res, next) => {
  Profissionais.max("cod_prof")
    .then((maxId) => {
      const nextId = maxId ? maxId + 1 : 1; // Se maxId for nulo, começa do 1
      res.status(status.OK).json({ nextId });
    })
    .catch((error) => next(error));
};

exports.GetSupervisores = (req, res, next) => {
  Profissionais.findAll({
    where: {
      tipo_prof: 3,
    },
  })
    .then((supervisores) => {
      if (supervisores) {
        res.status(status.OK).send(supervisores);
      } else {
        res.status(status.NOT_FOUND).send();
      }
    })
    .catch((error) => next(error));
};
