import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db/connection';
import { RowDataPacket } from 'mysql2';
import { sendResetEmail } from '../utils/mail';
import { AuthRequest } from '../middlewares/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, senha } = req.body;
    
    // Substituindo 'any' por 'RowDataPacket[]' para tipagem correta do MySQL
    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      res.status(400).json({ error: 'Email já cadastrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
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
    
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM usuarios WHERE email = ?', [email]);
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

export const verify = async (req: AuthRequest, res: Response): Promise<void> => {
  // Graças a nova interface AuthRequest, não precisamos mais do 'as any'
  res.json({ valid: true, user: req.user });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM usuarios WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      res.json({ message: 'Se o email existir, um link foi enviado.' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');

    await pool.query(
      'INSERT INTO reset_tokens (token, usuario_id, expira_em) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))',
      [token, user.id]
    );

    const resetLink = `http://localhost:3001/reset-password?token=${token}`;
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

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM reset_tokens WHERE token = ? AND usado = FALSE AND expira_em > NOW()',
      [token]
    );
    const resetRecord = rows[0];

    if (!resetRecord) {
      res.status(400).json({ error: 'Token inválido ou expirado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    await pool.query('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [hashedPassword, resetRecord.usuario_id]);
    await pool.query('UPDATE reset_tokens SET usado = TRUE WHERE token = ?', [token]);

    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao redefinir a senha' });
  }
};
