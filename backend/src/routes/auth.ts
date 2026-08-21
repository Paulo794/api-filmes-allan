import { Router } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db';
import * as jwtModule from 'jsonwebtoken';

const router = Router();
const SECRET = process.env.JWT_SECRET || 'fallback_secret';

router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }

    const [existing] = await pool.query<any>('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hash = await bcrypt.hash(senha, 10);
    const [result] = await pool.query<any>(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
      [nome, email, hash]
    );

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const [rows] = await pool.query<any>('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(senha, user.senha_hash);

    if (!match) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = jwtModule.sign({ id: user.id, nome: user.nome }, SECRET, { expiresIn: '1d' });

    res.json({ message: 'Login realizado com sucesso', token, usuario: { id: user.id, nome: user.nome } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

export default router;
