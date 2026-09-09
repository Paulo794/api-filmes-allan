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

// Intercepta respostas com erro (ex: Token expirado ou inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Remove o token inválido
      localStorage.removeItem('token');
      // Redireciona o usuário para o login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
