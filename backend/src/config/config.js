module.exports = {
  development: {
    database: {
      host: "127.0.0.1",
      port: "3360",
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
