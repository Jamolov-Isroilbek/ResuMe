import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const loginUser = async (username: string, password: string) => {
  return api.post("/auth/login/", { username, password });
};

export const registerUser = async (username: string, email: string, password: string) => {
  return api.post("/auth/register/", { username, email, password });
};

export const getProfile = async (token: string) => {
  return api.get("/auth/me/", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default api;
