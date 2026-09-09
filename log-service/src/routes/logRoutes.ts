import { Router } from 'express';
import { logEvent, getLogs } from '../controllers/logController';
import { internalAuth } from '../middlewares/internalAuth';

const router = Router();

// Endpoint sem proteção para o healthcheck do docker-compose
// Colocamos isso direto no server.ts

// Todas as rotas de log usam a proteção interna
router.use(internalAuth);

router.post('/', logEvent);
router.get('/', getLogs);

export default router;
