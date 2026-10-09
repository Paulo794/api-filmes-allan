import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

import authRoutes from './routes/auth';
import moviesRoutes from './routes/movies';

app.use(cors());

// A Rota do Webhook do Stripe DEVE vir ANTES do express.json()
import { handleStripeWebhook } from './controllers/stripeWebhook';
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Body parser normal para as outras rotas
app.use(express.json());

import stripeRoutes from './routes/stripe';
app.use('/api/stripe', stripeRoutes);

import { auditDenials } from './middleware/auditDenials';
app.use(auditDenials);

import path from 'path';

// Documentação Swagger
const swaggerPath = path.join(process.cwd(), 'src', 'docs', 'openapi.yaml');
const swaggerDocument = YAML.load(swaggerPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas da aplicação
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);

import profileRoutes from './routes/profile';
app.use('/api/profile', profileRoutes);

import adminLogsRoutes from './routes/adminLogs';
app.use('/api/admin', adminLogsRoutes);

// Servir o frontend (pasta dist construída pelo Vite)
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Qualquer outra rota não-API é redirecionada para o React
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

import { setupMinio } from './config/minio';

app.listen(port, async () => {
  console.log(`Servidor rodando na porta ${port}`);
  await setupMinio();
});
