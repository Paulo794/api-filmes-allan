import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { createCheckoutSession } from '../controllers/stripeController';

const router = Router();

// Endpoint 1: Criação da Sessão de Checkout (Requer Autenticação)
router.post('/checkout', authenticateToken, createCheckoutSession as any);

export default router;
