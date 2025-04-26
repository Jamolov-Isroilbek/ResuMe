import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// axiosClient.interceptors.request.use(config => config);

axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      if (config.headers && typeof config.headers.set === "function") {
        config.headers.set("Authorization", `Bearer ${accessToken}`);
      } else {
        (config.headers as any)["Authorization"] = `Bearer ${accessToken}`;
      }
    }
    return config;
    },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't attempt token refresh if the user was just deleted
    const wasAccountDeleted = originalRequest.url?.includes('/users/me/delete/');
    
    if (error.response?.status === 401 && !originalRequest._retry && !wasAccountDeleted) {
      originalRequest._retry = true;
      
      try {
        await axiosClient.post('/auth/token/refresh/');
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Clear all auth state
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        document.cookie = "access=; Max-Age=0; path=/;";
        document.cookie = "refresh=; Max-Age=0; path=/;";
        
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;