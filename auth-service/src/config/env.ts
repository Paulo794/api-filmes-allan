export const env = {
  LOG_SERVICE_URL: process.env.LOG_SERVICE_URL || 'http://log-service:3002',
  INTERNAL_SERVICE_TOKEN: process.env.INTERNAL_SERVICE_TOKEN || '',
};

if (!process.env.INTERNAL_SERVICE_TOKEN) {
  console.warn('⚠️ INTERNAL_SERVICE_TOKEN não definido. Auditoria falhará.');
}
