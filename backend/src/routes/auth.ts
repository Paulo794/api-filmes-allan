import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';

// Proxy para Registro
router.post('/register', async (req, res) => {
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao se comunicar com o serviço de autenticação' });
  }
});

// Proxy para Login
router.post('/login', async (req, res) => {
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao se comunicar com o serviço de autenticação' });
  }
});

// Proxy para Esqueci a Senha
router.post('/forgot-password', async (req, res) => {
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro de comunicação com Auth Service' });
  }
});

// Proxy para Reset de Senha
router.post('/reset-password', async (req, res) => {
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro de comunicação com Auth Service' });
  }
});

// Logout (Apenas para auditoria)
router.post('/logout', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Logout registrado com sucesso' });
});

export default router;
