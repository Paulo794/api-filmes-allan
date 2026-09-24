import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Documentação Swagger
const swaggerPath = path.join(process.cwd(), 'src', 'docs', 'openapi.yaml');
const swaggerDocument = YAML.load(swaggerPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/auth', authRoutes);

const PORT = process.env.AUTH_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Auth Service rodando internamente na porta ${PORT}`);
});
