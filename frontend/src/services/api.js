import axios from 'axios';

// Determine the base URL based on the environment
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'; // Use env variable or default

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Or however you store the token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for global error handling (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      console.error("Unauthorized access - redirecting to login");
      localStorage.removeItem('token'); // Clear token
      // window.location.href = '/login'; // Or use React Router navigate
    }
    if (error.response) {
      // Erro do servidor
      return Promise.reject({
        message: error.response.data.message || 'Erro no servidor',
        status: error.response.status
      });
    } else if (error.request) {
      // Erro de conexão
      return Promise.reject({
        message: 'Não foi possível conectar ao servidor',
        status: 0
      });
    } else {
      // Erro na configuração da requisição
      return Promise.reject({
        message: 'Erro na configuração da requisição',
        status: -1
      });
    }
  }
);

export default api;