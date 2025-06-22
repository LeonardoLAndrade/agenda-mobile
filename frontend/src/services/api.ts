import axios from "axios";

const api = axios.create({
  baseURL:
    "https://8231-2804-14c-85a0-4972-3c7f-ec88-dd8e-b84a.ngrok-free.app/sistema",
});

export default api;
