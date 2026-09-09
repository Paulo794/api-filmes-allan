export interface AuditEvent {
  id?: string;
  usuario_id: number | null;
  acao: string;
  recurso?: string;
  servico: string;
  resultado: 'sucesso' | 'negado' | 'erro';
  ip?: string;
  detalhe?: Record<string, any>;
  timestamp?: string;
}
