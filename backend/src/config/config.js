module.exports = {
  development: {
    database: {
      host: "srvdb-dev",
      port: "3306",
      user: "aluno14",
      password: "/ud8ZNsXXvY=",
      database: "fasiclin",
      dialect: "mysql",
    },
  },
  production: {
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "mysql",
    },
  },
};
