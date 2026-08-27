import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db/connection';
import { sendResetEmail } from '../utils/mail';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, senha } = req.body;
    
    // Verifica se já existe
    const [existing]: any = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      res.status(400).json({ error: 'Email já cadastrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    // Insere com role padrão 'usuario' (será adicionado via migração no BD)
    await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, role) VALUES (?, ?, ?, ?)',
      [nome, email, hashedPassword, 'usuario']
    );

    res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;
    
    const [rows]: any = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const match = await bcrypt.compare(senha, user.senha_hash);
    if (!match) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'usuario' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no login' });
  }
};

export const verify = async (req: Request, res: Response): Promise<void> => {
  // A verificação do token é feita no middleware. Se chegou aqui, é válido.
  // req.user foi injetado pelo middleware verifyToken
  res.json({ valid: true, user: (req as any).user });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const [rows]: any = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      // Retorna sucesso mesmo se não existir para evitar vazamento de dados
      res.json({ message: 'Se o email existir, um link foi enviado.' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    // Expira em 30 minutos
    const expiraEm = new Date(Date.now() + 30 * 60000);

    await pool.query(
      'INSERT INTO reset_tokens (token, usuario_id, expira_em) VALUES (?, ?, ?)',
      [token, user.id, expiraEm]
    );

    // TODO: Ajustar com URL correta do frontend de produção (usando subdomínio se aplicável)
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    await sendResetEmail(email, resetLink);

    res.json({ message: 'Se o email existir, um link foi enviado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar esqueci a senha' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, novaSenha } = req.body;

    const [rows]: any = await pool.query(
      'SELECT * FROM reset_tokens WHERE token = ? AND usado = FALSE AND expira_em > NOW()',
      [token]
    );
    const resetRecord = rows[0];

    if (!resetRecord) {
      res.status(400).json({ error: 'Token inválido ou expirado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    // Atualiza a senha
    await pool.query('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [hashedPassword, resetRecord.usuario_id]);
    
    // Invalida o token
    await pool.query('UPDATE reset_tokens SET usado = TRUE WHERE token = ?', [token]);

    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao redefinir a senha' });
  }
};
