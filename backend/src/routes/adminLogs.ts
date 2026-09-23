import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';
import { env } from '../config/env';
import { audit } from '../audit/auditClient';
import { LOG_CONSULTADO } from '../audit/actions';

const router = Router();

router.get('/logs', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const queryLimit = parseInt(req.query.limit as string, 10);
    const limit = isNaN(queryLimit) ? 50 : Math.min(Math.max(queryLimit, 1), 500);
    
    // Rota síncrona de consulta, podemos usar await
    const response = await fetch(`${env.LOG_SERVICE_URL}/events?limit=${limit}`, {
      headers: {
        'X-Internal-Token': env.INTERNAL_SERVICE_TOKEN
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Log service HTTP erro: ${response.status}`);
    }

    const data = await response.json();

    audit({
      usuario_id: req.user?.id ?? null,
      acao: LOG_CONSULTADO,
      resultado: 'sucesso',
      ip: req.ip || req.socket?.remoteAddress,
      recurso: `GET /api/admin/logs`
    });

    res.json(data);
  } catch (error) {
    console.error('Erro ao consultar logs:', error);
    res.status(503).json({ error: 'Serviço de auditoria indisponível' });
  }
});

export default router;
