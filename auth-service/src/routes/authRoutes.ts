import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, verify } from '../controllers/authController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Rota protegida usada pelo Catálogo para checar se o token é válido
router.get('/verify', verifyToken, verify);

export default router;
