import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.0.134:3003/sistema",
});

export default api;
