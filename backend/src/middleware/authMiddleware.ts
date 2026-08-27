import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'fallback_secret';

export interface AuthRequest extends Request {
  user?: string | jwt.JwtPayload;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Acesso negado, token não fornecido' });
    return;
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Token inválido ou expirado' });
      return;
    }
    req.user = user;
    next();
  });
};
