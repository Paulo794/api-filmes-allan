import { Request, Response } from 'express';
import { emitEvent, getRecentEvents } from '../repositories/auditStreamRepository';

export const logEvent = async (req: Request, res: Response) => {
  try {
    const { usuario_id, acao, recurso, servico, resultado, ip, detalhe } = req.body;

    if (usuario_id === undefined || !acao || !servico || !resultado) {
      return res.status(400).json({ error: 'usuario_id, acao, servico e resultado são obrigatórios' });
    }

    const id = await emitEvent({ usuario_id, acao, recurso, servico, resultado, ip, detalhe });
    res.status(202).json({ message: 'Log aceito para processamento', id });
  } catch (error) {
    console.error('[LogController] erro ao emitir evento', error);
    res.status(500).json({ error: 'Erro ao registrar evento no Redis Streams' });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const eventos = await getRecentEvents(limit);
    res.json({ total: eventos.length, eventos });
  } catch (error) {
    console.error('[LogController] erro ao ler eventos', error);
    res.status(500).json({ error: 'Erro ao consultar trilha' });
  }
};
