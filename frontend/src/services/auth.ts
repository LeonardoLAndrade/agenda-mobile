import api from "./api";

export const login = (login: string, senha: string) => {
  return api.post("/auth/login", { login, senha });
};
