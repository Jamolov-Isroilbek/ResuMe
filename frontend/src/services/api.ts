import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && localStorage.getItem("refresh_token")) {
      try {
        const refreshResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/token/refresh/`,
          { refresh: localStorage.getItem("refresh_token") }
        );
        localStorage.setItem("token", refreshResponse.data.access);
        error.config.headers["Authorization"] = `Bearer ${refreshResponse.data.access}`;
        return api(error.config);
      } catch (refreshError) {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
