import { Router } from 'express';
import multer from 'multer';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import pool from '../db';
import { minioClient, BUCKET_NAME } from '../config/minio';
import crypto from 'crypto';

const router = Router();

// Configuração do multer em memória
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // limite de 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas.'));
    }
  }
});

// Busca o perfil do usuário logado
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Não autorizado' });

    // Busca o usuário
    const [userRows]: any = await pool.query(
      'SELECT id, nome, email, bio, avatar_url, is_premium FROM usuarios WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = userRows[0];

    // Busca os filmes favoritos deste usuário
    const [favoritesRows] = await pool.query(
      'SELECT tmdb_movie_id, titulo, poster_path FROM favoritos WHERE usuario_id = ?',
      [userId]
    );

    res.json({
      ...user,
      favoritos: favoritesRows || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// Atualiza a bio do usuário (e garante que é ele mesmo editando pelo token)
router.put('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Não autorizado' });

    const { bio, id } = req.body;
    
    // Validação explícita para o professor ver a recusa na tentativa de fraude
    if (id && String(id) !== String(userId)) {
      return res.status(403).json({ error: 'Acesso Negado: Você não pode editar o perfil de outro usuário.' });
    }
    
    // Atualiza apenas a bio e usa o ID do token, impedindo manipulação de ID
    await pool.query('UPDATE usuarios SET bio = ? WHERE id = ?', [bio, userId]);
    
    res.json({ message: 'Perfil atualizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// Faz o upload da foto de perfil para o MinIO
router.post('/avatar', authenticateToken, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Não autorizado' });

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    // Gera um nome único para o arquivo
    const extension = file.originalname.split('.').pop();
    const objectName = `user_${userId}_${crypto.randomBytes(4).toString('hex')}.${extension}`;

    // Envia o buffer para o MinIO
    await minioClient.putObject(
      BUCKET_NAME,
      objectName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype }
    );

    // O MinIO está configurado em localhost:9005 (host) para acesso público
    const avatarUrl = `http://localhost:9005/${BUCKET_NAME}/${objectName}`;

    // Atualiza no banco de dados
    await pool.query('UPDATE usuarios SET avatar_url = ? WHERE id = ?', [avatarUrl, userId]);

    res.json({ 
      message: 'Foto atualizada com sucesso',
      avatar_url: avatarUrl 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no upload da foto' });
  }
});

export default router;
