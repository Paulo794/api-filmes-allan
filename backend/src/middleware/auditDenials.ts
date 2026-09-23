import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { audit } from '../audit/auditClient';
import { ACESSO_NEGADO } from '../audit/actions';

export const auditDenials = (req: AuthRequest, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    if (res.statusCode === 401 || res.statusCode === 403) {
      audit({
        usuario_id: req.user?.id ?? null,
        acao: ACESSO_NEGADO,
        recurso: `${req.method} ${req.originalUrl}`,
        resultado: 'negado',
        ip: req.ip || req.socket?.remoteAddress,
        detalhe: {
          status: res.statusCode,
          role: req.user?.role ?? 'anonimo'
        }
      });
    }
  });
  next();
};
