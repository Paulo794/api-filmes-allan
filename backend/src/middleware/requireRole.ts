import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Acesso negado: sem papel definido.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Acesso negado: requer papel ${roles.join(' ou ')}.` });
    }

    next();
  };
};
