const express = require("express");
const router = express.Router();
const AgendaController = require("../controllers/agendaController.js");
const dataController = require("../controllers/dataController.js");
const ProfissionaisController = require("../controllers/profissionaisController.js");


// Rota para buscar profissionais por especialidade
router.get("/especialidade/:especialidadeId/profissionais", dataController.getProfissionaisPorEspecialidade);

// Rota para buscar especialidades e procedimentos por profissional
router.get("/profissional/:profissionalId/especialidades", dataController.getEspecialidadesPorProfissional);

// Rota para buscar procedimentos por especialidade
router.get("/especialidade/:especialidadeId/procedimentos", dataController.getProcedimentosPorEspecialidade);




router.post("/agenda", AgendaController.Insert);
router.get("/agenda", AgendaController.SearchAll);
router.get("/agenda/:id", AgendaController.SearchOne);
router.put("/agenda/:id", AgendaController.Update);
router.delete("/agenda/:id", AgendaController.Delete);

// Endpoints para obter dados
router.get("/especialidades", dataController.getEspecialidades);
router.get("/procedimentos", dataController.getProcedimentos);
router.get("/ag_profissionais", dataController.getAgProfissionais);

// Endpoints específicos de profissionais
router.get("/profissionais/", ProfissionaisController.SearchAll);
router.get("/profissionais/nextId", ProfissionaisController.GetNextProfId);
router.get(
  "/profissionais/supervisores",
  ProfissionaisController.GetSupervisores
);
router.get("/profissionais/:id", ProfissionaisController.SearchOne);
router.post("/cadastro_profissional", ProfissionaisController.Insert);

module.exports = router;
