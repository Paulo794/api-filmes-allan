import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import pool from '../db';

const router = Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Buscar filmes do Tom Hanks
router.get('/tom-hanks', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Busca a ID do Tom Hanks
    const searchRes = await fetch(`${TMDB_BASE_URL}/search/person?query=Tom+Hanks&api_key=${TMDB_API_KEY}&language=pt-BR`);
    const searchData = await searchRes.json();
    const tomHanksId = searchData?.results?.[0]?.id || 31;

    // Busca os filmes onde ele participou
    const moviesRes = await fetch(`${TMDB_BASE_URL}/person/${tomHanksId}/movie_credits?api_key=${TMDB_API_KEY}&language=pt-BR`);
    const moviesData = await moviesRes.json();
    
    // Se moviesData.cast for undefined, retorna array vazio para não quebrar
    res.json(moviesData?.cast || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar filmes no TMDB' });
  }
});

// Favoritar um filme
router.post('/favorites', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const usuario_id = req.user!.id;
    const { tmdb_movie_id, titulo, poster_path } = req.body;

    if (!tmdb_movie_id || !titulo) {
      return res.status(400).json({ error: 'ID do filme e título são obrigatórios' });
    }

    await pool.query(
      'INSERT INTO favoritos (usuario_id, tmdb_movie_id, titulo, poster_path) VALUES (?, ?, ?, ?)',
      [usuario_id, tmdb_movie_id, titulo, poster_path]
    );

    res.status(201).json({ message: 'Filme favoritado com sucesso!' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Você já favoritou este filme' });
    }
    console.error(error);
    res.status(500).json({ error: 'Erro ao favoritar o filme' });
  }
});

// Listar favoritos do usuário logado
router.get('/favorites', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const usuario_id = req.user!.id;
    const [rows] = await pool.query('SELECT * FROM favoritos WHERE usuario_id = ?', [usuario_id]);
    res.json(rows || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar favoritos' });
  }
});

// Remover dos favoritos
router.delete('/favorites/:movieId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const usuario_id = req.user!.id;
    const tmdb_movie_id = req.params.movieId;

    await pool.query(
      'DELETE FROM favoritos WHERE usuario_id = ? AND tmdb_movie_id = ?',
      [usuario_id, tmdb_movie_id]
    );

    res.json({ message: 'Removido dos favoritos com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao desfavoritar' });
  }
});

// Adicionar um comentário
router.post('/comments', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const usuario_id = req.user!.id;
    const { tmdb_movie_id, texto } = req.body;

    if (!tmdb_movie_id || !texto) {
      return res.status(400).json({ error: 'ID do filme e texto do comentário são obrigatórios' });
    }

    await pool.query(
      'INSERT INTO comentarios (usuario_id, tmdb_movie_id, texto) VALUES (?, ?, ?)',
      [usuario_id, tmdb_movie_id, texto]
    );

    res.status(201).json({ message: 'Comentário adicionado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar comentário' });
  }
});

// Listar comentários de um filme (filtrando pelo usuário logado, como pedido)
router.get('/comments/:movieId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const usuario_id = req.user!.id;
    const tmdb_movie_id = req.params.movieId;

    const [rows] = await pool.query(
      'SELECT * FROM comentarios WHERE usuario_id = ? AND tmdb_movie_id = ? ORDER BY criado_em DESC',
      [usuario_id, tmdb_movie_id]
    );
    res.json(rows || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
});

// Remover um comentário (Ação Exclusiva de Admin / Moderação ou dono)
router.delete('/comments/:commentId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    const usuario_id = user.id;
    const role = user.role;
    const commentId = req.params.commentId;

    const [rows] = await pool.query<import('mysql2').RowDataPacket[]>('SELECT * FROM comentarios WHERE id = ?', [commentId]);
    const comment = rows[0];

    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    // RBAC real no backend (Enforcement)
    if (role !== 'admin' && comment.usuario_id !== usuario_id) {
      return res.status(403).json({ error: 'Acesso negado: apenas o dono ou um admin podem apagar este comentário.' });
    }

    await pool.query('DELETE FROM comentarios WHERE id = ?', [commentId]);
    res.json({ message: 'Comentário removido com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao remover comentário' });
  }
});

export default router;
