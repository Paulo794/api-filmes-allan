import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const internalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-internal-token'];
  
  if (token !== env.INTERNAL_SERVICE_TOKEN) {
    return res.status(401).json({ error: 'Acesso negado: token interno inválido ou ausente.' });
  }

  next();
};
