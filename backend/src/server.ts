import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

import authRoutes from './routes/auth';
import moviesRoutes from './routes/movies';

app.use(cors());
app.use(express.json());

import path from 'path';

// Rotas da aplicação
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);

// Servir o frontend (pasta dist construída pelo Vite)
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Qualquer outra rota não-API é redirecionada para o React
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
