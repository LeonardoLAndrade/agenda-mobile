import axios from "axios";

const api = axios.create({
  baseURL: "http://srvap-dev:7777/sistema",
});

export default api;
