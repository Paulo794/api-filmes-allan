import pool from '../db/connection';

async function up() {
  try {
    console.log('[Migration 001] Iniciando...');

    // 1. Adicionar coluna role se não existir
    try {
      await pool.query('ALTER TABLE usuarios ADD COLUMN role VARCHAR(20) DEFAULT "usuario"');
      console.log('Coluna "role" adicionada na tabela "usuarios".');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('⚡ Coluna "role" já existia.');
      } else {
        throw e;
      }
    }

    // 2. Criar tabela reset_tokens
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reset_tokens (
        token VARCHAR(100) PRIMARY KEY,
        usuario_id INT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expira_em TIMESTAMP NOT NULL,
        usado BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);
    console.log('Tabela "reset_tokens" criada com sucesso.');

    console.log('[Migration 001] Concluída!');
  } catch (error) {
    console.error('Erro rodando a migration:', error);
  } finally {
    process.exit(0);
  }
}

up();
