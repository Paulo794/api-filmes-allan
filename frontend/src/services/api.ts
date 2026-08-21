import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Usa o domínio atual + /api
});

// Adiciona o token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
