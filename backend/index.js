const http = require("http");
const express = require("express");
const status = require("http-status");
const sequelize = require("./src/database/database.js");
const app = express();
const routes = require("./src/routes/routes.js");
const cors = require("cors");

// Importar todos os modelos
const Especialidade = require("./src/models/especialidade.js");
const Procedimentos = require("./src/models/procedimentos.js");
const Ag_Profissionais = require("./src/models/ag_profissionais.js");
const Profissionais = require("./src/models/profissionais.js");
const Agenda = require("./src/models/agenda.js");

app.use(express.json());

app.use(cors());

app.use("/sistema", routes);

app.use((req, res, next) => {
  res.status.apply(status.NOT_FOUND).send("Page not found");
});

app.use((req, res, next) => {
  res.status.apply(status.INTERNAL_SERVER_ERROR).json({ error });
});

const syncDatabase = async () => {
  try {
    // Sincronizar a tabela 'especialidade' primeiro
    await Especialidade.sync({ force: false });
    console.log("Tabela 'especialidade' sincronizada.");

    // Sincronizar a tabela 'procedimentos' depois
    await Procedimentos.sync({ force: false });
    console.log("Tabela 'procedimentos' sincronizada.");

    // Sincronizar a tabela 'ag_profissionais' depois
    await Ag_Profissionais.sync({ force: false });
    console.log("Tabela 'ag_profissionais' sincronizada.");

    await Profissionais.sync({ force: false });
    console.log("Tabela 'profissionais' sincronizada.");

    // Sincronizar a tabela 'agenda' por último
    await Agenda.sync({ force: false });
    console.log("Tabela 'agenda' sincronizada.");

    // Iniciar o servidor
    const port = 3003;
    app.set("port", port);
    const server = http.createServer(app);
    server.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  } catch (error) {
    console.error("Erro ao sincronizar as tabelas:", error);
  }
};

syncDatabase();
