import express from 'express';
import cors from 'cors';
import logRoutes from './routes/logRoutes';
import { env } from './config/env';
import { connectRedis, checkRedisHealth } from './repositories/auditStreamRepository';

const app = express();

app.use(cors());
app.use(express.json());

// Rota de Healthcheck (com verificação de banco in-memory)
app.get('/health', (req, res) => {
  if (checkRedisHealth()) {
    res.status(200).json({ status: 'ok', redis: 'connected' });
  } else {
    res.status(503).json({ status: 'error', redis: 'disconnected' });
  }
});

app.use('/events', logRoutes);

const startServer = async () => {
  try {
    await connectRedis();
    
    app.listen(env.PORT, () => {
      console.log(`Log Service rodando internamente na porta ${env.PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar Log Service:', error);
    process.exit(1);
  }
};

startServer();
