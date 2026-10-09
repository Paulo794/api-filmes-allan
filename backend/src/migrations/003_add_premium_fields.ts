import pool from '../db';

async function up() {
  try {
    console.log('[Migration 003] Iniciando...');

    // 1. Adicionar coluna is_premium
    try {
      await pool.query('ALTER TABLE usuarios ADD COLUMN is_premium BOOLEAN DEFAULT FALSE');
      console.log('✅ Coluna "is_premium" adicionada na tabela "usuarios".');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('⚡ Coluna "is_premium" já existia.');
      } else {
        throw e;
      }
    }

    // 2. Adicionar coluna stripe_customer_id (opcional para rastreio futuramente)
    try {
      await pool.query('ALTER TABLE usuarios ADD COLUMN stripe_customer_id VARCHAR(255)');
      console.log('✅ Coluna "stripe_customer_id" adicionada na tabela "usuarios".');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('⚡ Coluna "stripe_customer_id" já existia.');
      } else {
        throw e;
      }
    }

    console.log('[Migration 003] Concluída!');
  } catch (error) {
    console.error('Erro rodando a migration:', error);
  } finally {
    process.exit(0);
  }
}

up();
