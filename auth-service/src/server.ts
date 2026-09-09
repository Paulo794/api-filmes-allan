import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/auth', authRoutes);

const PORT = process.env.AUTH_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Auth Service rodando internamente na porta ${PORT}`);
});
