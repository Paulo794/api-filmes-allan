import pool from '../db';

async function up() {
  try {
    console.log('[Migration 002] Iniciando...');

    // 1. Adicionar coluna bio
    try {
      await pool.query('ALTER TABLE usuarios ADD COLUMN bio TEXT');
      console.log('✅ Coluna "bio" adicionada na tabela "usuarios".');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('⚡ Coluna "bio" já existia.');
      } else {
        throw e;
      }
    }

    // 2. Adicionar coluna avatar_url
    try {
      await pool.query('ALTER TABLE usuarios ADD COLUMN avatar_url VARCHAR(500)');
      console.log('✅ Coluna "avatar_url" adicionada na tabela "usuarios".');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('⚡ Coluna "avatar_url" já existia.');
      } else {
        throw e;
      }
    }

    console.log('[Migration 002] Concluída!');
  } catch (error) {
    console.error('Erro rodando a migration:', error);
  } finally {
    process.exit(0);
  }
}

up();
