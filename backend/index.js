const http = require("http");
const express = require("express");
const status = require("http-status");
const app = express();
const cors = require("cors");
const sequelize = require("./src/database/database.js");
const routes = require("./src/routes/routes.js");
const models = require("./src/models");

app.use(express.json());
app.use(cors());
app.use("/sistema", routes);

app.use((req, res, next) => {
  res.status(status.NOT_FOUND).send("Page not found");
});

app.use((error, req, res, next) => {
  res.status(status.INTERNAL_SERVER_ERROR).json({ error });
});

const syncDatabase = async () => {
  try {
    await models.sequelize.sync({ force: false });
    console.log("Todas as tabelas foram sincronizadas com sucesso.");

    const port = 3003;
    app.set("port", port);
    const server = http.createServer(app);
    server.listen(port, "0.0.0.0", () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  } catch (error) {
    console.error("Erro ao sincronizar as tabelas:", error);
  }
};

syncDatabase();
