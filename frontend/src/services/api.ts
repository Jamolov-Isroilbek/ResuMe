import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Refresh token logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401 && localStorage.getItem("refresh_token")) {
      try {
        console.log("🔄 Refreshing token...");
        const refreshResponse = await axios.post(
          "http://localhost:8000/api/token/refresh/",
          { refresh: localStorage.getItem("refresh_token") }
        );
        localStorage.setItem("token", refreshResponse.data.access);
        error.config.headers["Authorization"] = `Bearer ${refreshResponse.data.access}`;
        return api(error.config); // Retry the request
      } catch (refreshError) {
        console.error("❌ Refresh token expired. Logging out.");
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
